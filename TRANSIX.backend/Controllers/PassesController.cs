using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Transix.Api.Data;
using Transix.Api.DTOs;
using Transix.Api.Models;

namespace Transix.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PassesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PassesController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/passes/buy
        [HttpPost("buy")]
        public async Task<IActionResult> BuyPass(BuyPassDto dto)
        {
            var user = await _context.Users.FindAsync(dto.UserId);
            if (user == null) return NotFound("A felhasználó nem található!");

            var passType = await _context.PassTypes.FindAsync(dto.PassTypeId);
            if (passType == null || !passType.IsActive) return NotFound("Érvénytelen bérlettípus!");

            var pass = new UserPass
            {
                PassCode = "PASS-" + Guid.NewGuid().ToString()[..8].ToUpper(),
                UserId = dto.UserId,
                PassTypeId = dto.PassTypeId,
                ValidFrom = dto.ValidFrom,
                ValidUntil = dto.ValidFrom.AddDays(passType.DurationDays),
                Status = PassStatus.active,
                CreatedAt = DateTime.Now
            };

            _context.UserPasses.Add(pass);
            await _context.SaveChangesAsync();

            return Ok(pass);
        }
    }
}