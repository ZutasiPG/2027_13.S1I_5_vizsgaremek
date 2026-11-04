namespace Transix.Api.DTOs
{
    public class GenerateSeatsDto
    {
        public ulong VehicleId { get; set; }
        public uint Rows { get; set; }
        public uint SeatsPerRow { get; set; }
    }

    public class ReserveSeatDto
    {
        public ulong TicketId { get; set; }
        public ulong TripId { get; set; }
        public ulong SeatId { get; set; }
    }

    public class SeatAvailabilityDto
    {
        public ulong SeatId { get; set; }
        public string SeatNumber { get; set; } = string.Empty;
        public uint RowNum { get; set; }
        public uint ColNum { get; set; }
        public bool IsWindow { get; set; }
        public bool IsOccupied { get; set; }
    }
}