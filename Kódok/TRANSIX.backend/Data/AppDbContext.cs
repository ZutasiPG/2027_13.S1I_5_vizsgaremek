using Microsoft.EntityFrameworkCore;
using Transix.Api.Models;
using Route = Transix.Api.Models.Route;

namespace Transix.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Vehicle> Vehicles { get; set; }
        public DbSet<Seat> Seats { get; set; }
        public DbSet<Stop> Stops { get; set; }
        public DbSet<Route> Routes { get; set; }
        public DbSet<RouteStop> RouteStops { get; set; }
        public DbSet<Trip> Trips { get; set; }
        public DbSet<FareRate> FareRates { get; set; }
        public DbSet<PassType> PassTypes { get; set; }
        public DbSet<Ticket> Tickets { get; set; }
        public DbSet<UserPass> UserPasses { get; set; }
        public DbSet<Reservation> Reservations { get; set; }
        public DbSet<TripEvent> TripEvents { get; set; }
        public DbSet<Notification> Notifications { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>().Property(u => u.Role).HasConversion<string>();
            modelBuilder.Entity<User>().Property(u => u.DiscountCategory).HasConversion<string>();
            modelBuilder.Entity<PassType>().Property(p => p.TargetDiscount).HasConversion<string>();
            modelBuilder.Entity<Trip>().Property(t => t.Status).HasConversion<string>();
            modelBuilder.Entity<Ticket>().Property(t => t.Status).HasConversion<string>();
            modelBuilder.Entity<UserPass>().Property(p => p.Status).HasConversion<string>();
            modelBuilder.Entity<Reservation>().Property(r => r.Status).HasConversion<string>();
            modelBuilder.Entity<TripEvent>().Property(e => e.EventType).HasConversion<string>();
            modelBuilder.Entity<Notification>().Property(n => n.Type).HasConversion<string>();
        }
    }
}