using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Transix.Api.Data;
using Transix.Api.DTOs;
using Transix.Api.Models;

namespace Transix.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VehiclesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public VehiclesController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/vehicles
        [HttpPost]
        public async Task<IActionResult> CreateVehicle(CreateVehicleDto dto)
        {
            var vehicle = new Vehicle
            {
                LicensePlate = dto.LicensePlate,
                Model = dto.Model,
                Capacity = dto.Capacity,
                IsActive = true,
                CreatedAt = DateTime.Now
            };

            _context.Vehicles.Add(vehicle);
            await _context.SaveChangesAsync();

            return Ok(vehicle);
        }

        // GET: api/vehicles
        [HttpGet]
        public async Task<IActionResult> GetVehicles()
        {
            var vehicles = await _context.Vehicles.ToListAsync();
            return Ok(vehicles);
        }
    }
}