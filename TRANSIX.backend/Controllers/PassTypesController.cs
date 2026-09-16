using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Transix.Api.Data;
using Transix.Api.DTOs;
using Transix.Api.Models;

namespace Transix.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PassTypesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PassTypesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/passtypes
        [HttpGet]
        public async Task<IActionResult> GetPassTypes()
        {
            var passTypes = await _context.PassTypes.Where(p => p.IsActive).ToListAsync();
            return Ok(passTypes);
        }

        // POST: api/passtypes
        [HttpPost]
        public async Task<IActionResult> CreatePassType(CreatePassTypeDto dto)
        {
            var passType = new PassType
            {
                Name = dto.Name,
                DurationDays = dto.DurationDays,
                Price = dto.Price,
                TargetDiscount = dto.TargetDiscount,
                IsActive = true
            };

            _context.PassTypes.Add(passType);
            await _context.SaveChangesAsync();

            return Ok(passType);
        }

        // PUT: api/passtypes/5/deactivate
        [HttpPut("{id}/deactivate")]
        public async Task<IActionResult> DeactivatePassType(ulong id)
        {
            var passType = await _context.PassTypes.FindAsync(id);
            if (passType == null) return NotFound("A bérlettípus nem található!");

            passType.IsActive = false;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Bérlettípus sikeresen deaktiválva!" });
        }
    }
}