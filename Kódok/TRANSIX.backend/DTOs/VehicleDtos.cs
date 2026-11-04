namespace Transix.Api.DTOs
{
    public class CreateVehicleDto
    {
        public string LicensePlate { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public uint Capacity { get; set; }
    }
}