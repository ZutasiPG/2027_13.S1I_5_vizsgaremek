using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Transix.Api.Data;
using Transix.Api.Models;

namespace Transix.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class JaratsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public JaratsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Jarats (Járatok lekérése)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Jarat>>> GetJaratok()
        {
            return await _context.Jaratok.ToListAsync();
        }

        // POST: api/Jarats (Új járat felvétele)
        [HttpPost]
        public async Task<ActionResult<Jarat>> PostJarat(Jarat jarat)
        {
            _context.Jaratok.Add(jarat);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetJaratok), new { id = jarat.Id }, jarat);
        }
    }
}