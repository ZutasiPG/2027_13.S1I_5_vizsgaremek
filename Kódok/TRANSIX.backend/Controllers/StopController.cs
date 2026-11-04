using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Transix.Api.Data;
using Transix.Api.Models;

namespace Transix.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StopsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public StopsController(AppDbContext context)
        {
            _context = context;
        }

        // 1. GET: api/Stops (Összes megálló lekérése)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Stop>>> GetStops()
        {
            return await _context.Stops.ToListAsync();
        }

        // 2. POST: api/Stops (Új megálló hozzáadása)
        [HttpPost]
        public async Task<ActionResult<Stop>> PostStop(Stop stop)
        {
            _context.Stops.Add(stop);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetStops), new { id = stop.Id }, stop);
        }
    }
}