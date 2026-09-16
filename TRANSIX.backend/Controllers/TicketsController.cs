using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Transix.Api.Data;
using Transix.Api.DTOs;
using Transix.Api.Models;

namespace Transix.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TicketsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TicketsController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/tickets/buy
        [HttpPost("buy")]
        public async Task<IActionResult> BuyTicket(BuyTicketDto dto)
        {
            var user = await _context.Users.FindAsync(dto.UserId);
            if (user == null) return NotFound("A felhasználó nem található!");

            var trip = await _context.Trips.FindAsync(dto.TripId);
            if (trip == null) return NotFound("A járat nem található!");

            // Megállók távolságának lekérdezése
            var startRouteStop = await _context.RouteStops
                .FirstOrDefaultAsync(rs => rs.RouteId == trip.RouteId && rs.StopId == dto.StartStopId);
            var endRouteStop = await _context.RouteStops
                .FirstOrDefaultAsync(rs => rs.RouteId == trip.RouteId && rs.StopId == dto.EndStopId);

            if (startRouteStop == null || endRouteStop == null)
                return BadRequest("Érvénytelen megállók a kiválasztott útvonalon!");

            decimal distanceKm = Math.Abs(endRouteStop.DistanceFromStartKm - startRouteStop.DistanceFromStartKm);

            // Alapár meghatározása távolság alapján
            var fareRate = await _context.FareRates
                .FirstOrDefaultAsync(f => distanceKm >= f.MinKm && distanceKm <= f.MaxKm);

            decimal basePrice = fareRate?.BasePrice ?? (distanceKm * 50);

            // Kedvezmény százalékos beállítása
            decimal discountMultiplier = user.DiscountCategory switch
            {
                DiscountCategory.student => 0.5m,
                DiscountCategory.pensioner => 0.5m,
                DiscountCategory.disabled => 0.1m,
                _ => 1.0m
            };

            var ticket = new Ticket
            {
                TicketCode = "TICK-" + Guid.NewGuid().ToString()[..8].ToUpper(),
                UserId = dto.UserId,
                TripId = dto.TripId,
                StartStopId = dto.StartStopId,
                EndStopId = dto.EndStopId,
                Price = Math.Round(basePrice * discountMultiplier, 0),
                Status = TicketStatus.purchased,
                CreatedAt = DateTime.Now
            };

            _context.Tickets.Add(ticket);
            await _context.SaveChangesAsync();

            return Ok(ticket);
        }

        // POST: api/tickets/validate
        [HttpPost("validate")]
        public async Task<IActionResult> ValidateTicket(ValidateTicketDto dto)
        {
            var ticket = await _context.Tickets.FirstOrDefaultAsync(t => t.TicketCode == dto.TicketCode);
            if (ticket == null) return NotFound("Érvénytelen jegykód!");

            if (ticket.Status == TicketStatus.validated)
                return BadRequest("A jegyet már korábban érvényesítették!");

            if (ticket.Status == TicketStatus.expired || ticket.Status == TicketStatus.cancelled)
                return BadRequest("A jegy már nem használható fel!");

            ticket.Status = TicketStatus.validated;
            ticket.ValidatedAt = DateTime.Now;
            ticket.ValidatedByDriverId = dto.DriverId;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Sikeres jegyérvényesítés!", ticketCode = ticket.TicketCode });
        }
    }
}