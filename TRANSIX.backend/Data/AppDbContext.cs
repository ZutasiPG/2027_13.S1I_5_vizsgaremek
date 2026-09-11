using Microsoft.EntityFrameworkCore;
using Transix.Api.Models;

namespace Transix.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // Ez a DbSet jelenti a 'Jaratok' táblát a MySQL-ben
        public DbSet<Jarat> Jaratok { get; set; }
    }
}