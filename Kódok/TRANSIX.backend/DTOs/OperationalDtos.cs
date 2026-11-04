using Transix.Api.Models;

namespace Transix.Api.DTOs
{
    public class CreateTripEventDto
    {
        public ulong TripId { get; set; }
        public ulong DriverId { get; set; }
        public EventType EventType { get; set; }
        public int DelayMinutesAdded { get; set; }
        public string? Description { get; set; }
    }

    public class UpdateTripStatusDto
    {
        public TripStatus Status { get; set; }
        public int DelayMinutes { get; set; }
        public decimal? CurrentLatitude { get; set; }
        public decimal? CurrentLongitude { get; set; }
    }
}