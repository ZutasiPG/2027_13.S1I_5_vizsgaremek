using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Transix.Api.Data;
using Transix.Api.DTOs;
using Transix.Api.Models;

namespace Transix.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TripsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TripsController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/trips
        [HttpPost]
        public async Task<IActionResult> CreateTrip(CreateTripDto dto)
        {
            var trip = new Trip
            {
                RouteId = dto.RouteId,
                VehicleId = dto.VehicleId,
                DriverId = dto.DriverId,
                ScheduledDeparture = dto.ScheduledDeparture,
                ScheduledArrival = dto.ScheduledArrival,
                Status = TripStatus.scheduled
            };

            _context.Trips.Add(trip);
            await _context.SaveChangesAsync();

            return Ok(trip);
        }

        // GET: api/trips
        [HttpGet]
        public async Task<IActionResult> GetTrips()
        {
            var trips = await _context.Trips.ToListAsync();
            return Ok(trips);
        }
    }
}