using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Transix.Api.Data;
using Transix.Api.DTOs;
using Transix.Api.Models;

namespace Transix.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TripEventsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TripEventsController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/tripevents
        // Esemény rögzítése, járat késésének frissítése és automatikus értesítés az utasoknak
        [HttpPost]
        public async Task<IActionResult> CreateEvent(CreateTripEventDto dto)
        {
            var trip = await _context.Trips.FindAsync(dto.TripId);
            if (trip == null) return NotFound("A járat nem található!");

            var tripEvent = new TripEvent
            {
                TripId = dto.TripId,
                DriverId = dto.DriverId,
                EventType = dto.EventType,
                DelayMinutesAdded = dto.DelayMinutesAdded,
                Description = dto.Description,
                CreatedAt = DateTime.Now
            };

            _context.TripEvents.Add(tripEvent);

            // Késés és járatstátusz frissítése
            trip.DelayMinutes += dto.DelayMinutesAdded;
            if (trip.DelayMinutes > 0 && trip.Status != TripStatus.cancelled)
            {
                trip.Status = TripStatus.delayed;
            }

            // Értesítés generálása a járatra jegyet váltott összes utasnak
            var passengerUserIds = await _context.Tickets
                .Where(t => t.TripId == dto.TripId && (t.Status == TicketStatus.purchased || t.Status == TicketStatus.validated))
                .Select(t => t.UserId)
                .Distinct()
                .ToListAsync();

            var notifications = passengerUserIds.Select(userId => new Notification
            {
                UserId = userId,
                Title = $"Késés / Esemény a járaton ({trip.Id})",
                Message = $"A járatodon esemény történt ({dto.EventType}). Várható késés: +{dto.DelayMinutesAdded} perc. Összes késés: {trip.DelayMinutes} perc. Megjegyzés: {dto.Description ?? "Nincs extra információ."}",
                Type = NotificationType.tripDelay,
                IsRead = false,
                CreatedAt = DateTime.Now
            }).ToList();

            _context.Notifications.AddRange(notifications);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Rendkívüli esemény rögzítve, értesítések elküldve!", tripEventId = tripEvent.Id, currentDelay = trip.DelayMinutes });
        }

        // PUT: api/tripevents/trips/{tripId}/status
        // Élő állapot, GPS pozíció és késés frissítése a sofőr/diszpécser által
        [HttpPut("trips/{tripId}/status")]
        public async Task<IActionResult> UpdateTripStatus(ulong tripId, UpdateTripStatusDto dto)
        {
            var trip = await _context.Trips.FindAsync(tripId);
            if (trip == null) return NotFound("A járat nem található!");

            trip.Status = dto.Status;
            trip.DelayMinutes = dto.DelayMinutes;
            if (dto.CurrentLatitude.HasValue) trip.CurrentLatitude = dto.CurrentLatitude;
            if (dto.CurrentLongitude.HasValue) trip.CurrentLongitude = dto.CurrentLongitude;

            if (dto.Status == TripStatus.inTransit && !trip.ActualDeparture.HasValue)
            {
                trip.ActualDeparture = DateTime.Now;
            }
            else if (dto.Status == TripStatus.completed && !trip.ActualArrival.HasValue)
            {
                trip.ActualArrival = DateTime.Now;
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Járat állapota sikeresen frissítve!", status = trip.Status.ToString(), delay = trip.DelayMinutes });
        }

        // GET: api/tripevents/trip/{tripId}
        [HttpGet("trip/{tripId}")]
        public async Task<IActionResult> GetEventsForTrip(ulong tripId)
        {
            var events = await _context.TripEvents
                .Where(e => e.TripId == tripId)
                .OrderByDescending(e => e.CreatedAt)
                .ToListAsync();

            return Ok(events);
        }
    }
}