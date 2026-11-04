namespace Transix.Api.Models
{
    // ENUMOK
    public enum UserRole { passenger, driver, dispatcher, admin }
    public enum DiscountCategory { fullPrice, student, pensioner, disabled }
    public enum TripStatus { scheduled, inTransit, completed, cancelled, delayed }
    public enum TicketStatus { purchased, validated, expired, cancelled }
    public enum PassStatus { active, expired, revoked }
    public enum ReservationStatus { reserved, checkedIn, cancelled }
    public enum EventType { delay, breakdown, accident, detour, other }
    public enum NotificationType { tripDelay, passExpiry, routeChange, general }

    // TÁBLÁK C# OSZTÁLYAI
    public class User
    {
        public ulong Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public UserRole Role { get; set; } = UserRole.passenger;
        public DiscountCategory DiscountCategory { get; set; } = DiscountCategory.fullPrice;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime UpdatedAt { get; set; } = DateTime.Now;
    }

    public class Vehicle
    {
        public ulong Id { get; set; }
        public string LicensePlate { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public uint Capacity { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }

    public class Seat
    {
        public ulong Id { get; set; }
        public ulong VehicleId { get; set; }
        public string SeatNumber { get; set; } = string.Empty;
        public uint RowNum { get; set; }
        public uint ColNum { get; set; }
        public bool IsWindow { get; set; }
        public bool IsAccessible { get; set; }
    }

    public class Stop
    {
        public ulong Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public decimal Latitude { get; set; }
        public decimal Longitude { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }

    public class Route
    {
        public ulong Id { get; set; }
        public string RouteNumber { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
    }

    public class RouteStop
    {
        public ulong Id { get; set; }
        public ulong RouteId { get; set; }
        public ulong StopId { get; set; }
        public uint StopOrder { get; set; }
        public decimal DistanceFromStartKm { get; set; }
        public uint TravelTimeMinutes { get; set; }
    }

    public class Trip
    {
        public ulong Id { get; set; }
        public ulong RouteId { get; set; }
        public ulong VehicleId { get; set; }
        public ulong DriverId { get; set; }
        public DateTime ScheduledDeparture { get; set; }
        public DateTime ScheduledArrival { get; set; }
        public DateTime? ActualDeparture { get; set; }
        public DateTime? ActualArrival { get; set; }
        public decimal? CurrentLatitude { get; set; }
        public decimal? CurrentLongitude { get; set; }
        public int DelayMinutes { get; set; }
        public TripStatus Status { get; set; } = TripStatus.scheduled;
    }

    public class FareRate
    {
        public ulong Id { get; set; }
        public decimal MinKm { get; set; }
        public decimal MaxKm { get; set; }
        public decimal BasePrice { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }

    public class PassType
    {
        public ulong Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public uint DurationDays { get; set; }
        public decimal Price { get; set; }
        public DiscountCategory TargetDiscount { get; set; } = DiscountCategory.fullPrice;
        public bool IsActive { get; set; } = true;
    }

    public class Ticket
    {
        public ulong Id { get; set; }
        public string TicketCode { get; set; } = string.Empty;
        public ulong UserId { get; set; }
        public ulong TripId { get; set; }
        public ulong StartStopId { get; set; }
        public ulong EndStopId { get; set; }
        public decimal Price { get; set; }
        public TicketStatus Status { get; set; } = TicketStatus.purchased;
        public DateTime? ValidatedAt { get; set; }
        public ulong? ValidatedByDriverId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }

    public class UserPass
    {
        public ulong Id { get; set; }
        public string PassCode { get; set; } = string.Empty;
        public ulong UserId { get; set; }
        public ulong PassTypeId { get; set; }
        public DateTime ValidFrom { get; set; }
        public DateTime ValidUntil { get; set; }
        public PassStatus Status { get; set; } = PassStatus.active;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }

    public class Reservation
    {
        public ulong Id { get; set; }
        public ulong TicketId { get; set; }
        public ulong TripId { get; set; }
        public ulong SeatId { get; set; }
        public ReservationStatus Status { get; set; } = ReservationStatus.reserved;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }

    public class TripEvent
    {
        public ulong Id { get; set; }
        public ulong TripId { get; set; }
        public ulong DriverId { get; set; }
        public EventType EventType { get; set; }
        public int DelayMinutesAdded { get; set; }
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }

    public class Notification
    {
        public ulong Id { get; set; }
        public ulong UserId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public NotificationType Type { get; set; }
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}