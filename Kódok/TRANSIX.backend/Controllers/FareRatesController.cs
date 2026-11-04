using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Transix.Api.Data;
using Transix.Api.DTOs;
using Transix.Api.Models;

namespace Transix.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FareRatesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FareRatesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/farerates
        [HttpGet]
        public async Task<IActionResult> GetFareRates()
        {
            var fareRates = await _context.FareRates.OrderBy(f => f.MinKm).ToListAsync();
            return Ok(fareRates);
        }

        // POST: api/farerates
        [HttpPost]
        public async Task<IActionResult> CreateFareRate(CreateFareRateDto dto)
        {
            if (dto.MinKm >= dto.MaxKm)
                return BadRequest("A minimális kilométernek kisebbnek kell lennie a maximálisnál!");

            var fareRate = new FareRate
            {
                MinKm = dto.MinKm,
                MaxKm = dto.MaxKm,
                BasePrice = dto.BasePrice,
                CreatedAt = DateTime.Now
            };

            _context.FareRates.Add(fareRate);
            await _context.SaveChangesAsync();

            return Ok(fareRate);
        }
    }
}