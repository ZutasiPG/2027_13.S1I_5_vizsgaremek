using Transix.Api.Models;

namespace Transix.Api.DTOs
{
    public class BuyTicketDto
    {
        public ulong UserId { get; set; }
        public ulong TripId { get; set; }
        public ulong StartStopId { get; set; }
        public ulong EndStopId { get; set; }
    }

    public class ValidateTicketDto
    {
        public string TicketCode { get; set; } = string.Empty;
        public ulong DriverId { get; set; }
    }

    public class BuyPassDto
    {
        public ulong UserId { get; set; }
        public ulong PassTypeId { get; set; }
        public DateTime ValidFrom { get; set; } = DateTime.Now;
    }
}