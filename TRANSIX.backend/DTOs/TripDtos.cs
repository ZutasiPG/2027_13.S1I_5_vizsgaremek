namespace Transix.Api.DTOs
{
    public class CreateStopDto
    {
        public string Name { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public decimal Latitude { get; set; }
        public decimal Longitude { get; set; }
    }

    public class CreateRouteDto
    {
        public string RouteNumber { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
    }

    public class AddRouteStopDto
    {
        public ulong RouteId { get; set; }
        public ulong StopId { get; set; }
        public uint StopOrder { get; set; }
        public decimal DistanceFromStartKm { get; set; }
        public uint TravelTimeMinutes { get; set; }
    }

    public class CreateTripDto
    {
        public ulong RouteId { get; set; }
        public ulong VehicleId { get; set; }
        public ulong DriverId { get; set; }
        public DateTime ScheduledDeparture { get; set; }
        public DateTime ScheduledArrival { get; set; }
    }
}