using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Transix.Api.Data;
using Transix.Api.DTOs;
using Transix.Api.Models;

namespace Transix.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReservationsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReservationsController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/reservations/generate-seats
        // Ülések automatikus legyártása egy járműhöz sorszám és oszlopszám alapján
        [HttpPost("generate-seats")]
        public async Task<IActionResult> GenerateSeats(GenerateSeatsDto dto)
        {
            var vehicle = await _context.Vehicles.FindAsync(dto.VehicleId);
            if (vehicle == null) return NotFound("A jármű nem található!");

            // Meglévő ülések törlése a járműről az újrageneráláshoz
            var existingSeats = _context.Seats.Where(s => s.VehicleId == dto.VehicleId);
            _context.Seats.RemoveRange(existingSeats);

            var seats = new List<Seat>();
            int seatCounter = 1;

            for (uint row = 1; row <= dto.Rows; row++)
            {
                for (uint col = 1; col <= dto.SeatsPerRow; col++)
                {
                    bool isWindow = (col == 1 || col == dto.SeatsPerRow);

                    seats.Add(new Seat
                    {
                        VehicleId = dto.VehicleId,
                        SeatNumber = $"{seatCounter}",
                        RowNum = row,
                        ColNum = col,
                        IsWindow = isWindow,
                        IsAccessible = (row == 1) // Az első sor akadálymentesített
                    });

                    seatCounter++;
                }
            }

            _context.Seats.AddRange(seats);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"{seats.Count} ülés sikeresen legyártva a járműhöz!", count = seats.Count });
        }

        // GET: api/reservations/seats/{tripId}
        // Egy adott járat összes ülésének lekérdezése foglaltsági állapottal
        [HttpGet("seats/{tripId}")]
        public async Task<IActionResult> GetSeatsForTrip(ulong tripId)
        {
            var trip = await _context.Trips.FindAsync(tripId);
            if (trip == null) return NotFound("A járat nem található!");

            var vehicleSeats = await _context.Seats
                .Where(s => s.VehicleId == trip.VehicleId)
                .ToListAsync();

            var reservedSeatIds = await _context.Reservations
                .Where(r => r.TripId == tripId && r.Status == ReservationStatus.reserved)
                .Select(r => r.SeatId)
                .ToListAsync();

            var result = vehicleSeats.Select(s => new SeatAvailabilityDto
            {
                SeatId = s.Id,
                SeatNumber = s.SeatNumber,
                RowNum = s.RowNum,
                ColNum = s.ColNum,
                IsWindow = s.IsWindow,
                IsOccupied = reservedSeatIds.Contains(s.Id)
            }).OrderBy(s => s.RowNum).ThenBy(s => s.ColNum);

            return Ok(result);
        }

        // POST: api/reservations/reserve
        // Ülés lefoglalása érvényes jegy birtokában
        [HttpPost("reserve")]
        public async Task<IActionResult> ReserveSeat(ReserveSeatDto dto)
        {
            var ticket = await _context.Tickets.FindAsync(dto.TicketId);
            if (ticket == null) return NotFound("A jegy nem található!");

            var trip = await _context.Trips.FindAsync(dto.TripId);
            if (trip == null) return NotFound("A járat nem található!");

            var seat = await _context.Seats.FindAsync(dto.SeatId);
            if (seat == null || seat.VehicleId != trip.VehicleId)
                return BadRequest("Érvénytelen ülés a kiválasztott járat járművéhez!");

            // Ellenőrzés: Foglalt-e már az ülés ezen a járaton?
            bool isAlreadyReserved = await _context.Reservations.AnyAsync(r =>
                r.TripId == dto.TripId &&
                r.SeatId == dto.SeatId &&
                r.Status == ReservationStatus.reserved);

            if (isAlreadyReserved)
                return BadRequest("Ez az ülés már foglalt ezen a járaton!");

            // Ellenőrzés: Van-e már ehhez a jegyhez foglalás?
            bool ticketHasReservation = await _context.Reservations.AnyAsync(r =>
                r.TicketId == dto.TicketId &&
                r.Status == ReservationStatus.reserved);

            if (ticketHasReservation)
                return BadRequest("Ehhez a jegyhez már tartozik helyfoglalás!");

            var reservation = new Reservation
            {
                TicketId = dto.TicketId,
                TripId = dto.TripId,
                SeatId = dto.SeatId,
                Status = ReservationStatus.reserved,
                CreatedAt = DateTime.Now
            };

            _context.Reservations.Add(reservation);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Sikeres ülésfoglalás!", reservationId = reservation.Id, seatNumber = seat.SeatNumber });
        }
    }
}