using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Transix.Api.Data;
using Transix.Api.DTOs;
using Transix.Api.Models;
using Route = Transix.Api.Models.Route;

namespace Transix.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RoutesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RoutesController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/routes/stops
        [HttpPost("stops")]
        public async Task<IActionResult> CreateStop(CreateStopDto dto)
        {
            var stop = new Stop
            {
                Name = dto.Name,
                City = dto.City,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                CreatedAt = DateTime.Now
            };

            _context.Stops.Add(stop);
            await _context.SaveChangesAsync();

            return Ok(stop);
        }

        // GET: api/routes/stops
        [HttpGet("stops")]
        public async Task<IActionResult> GetStops()
        {
            var stops = await _context.Stops.ToListAsync();
            return Ok(stops);
        }

        // POST: api/routes
        [HttpPost]
        public async Task<IActionResult> CreateRoute(CreateRouteDto dto)
        {
            var route = new Route
            {
                RouteNumber = dto.RouteNumber,
                Name = dto.Name,
                IsActive = true
            };

            _context.Routes.Add(route);
            await _context.SaveChangesAsync();

            return Ok(route);
        }

        // POST: api/routes/add-stop
        [HttpPost("add-stop")]
        public async Task<IActionResult> AddStopToRoute(AddRouteStopDto dto)
        {
            var routeStop = new RouteStop
            {
                RouteId = dto.RouteId,
                StopId = dto.StopId,
                StopOrder = dto.StopOrder,
                DistanceFromStartKm = dto.DistanceFromStartKm,
                TravelTimeMinutes = dto.TravelTimeMinutes
            };

            _context.RouteStops.Add(routeStop);
            await _context.SaveChangesAsync();

            return Ok(routeStop);
        }
    }
}