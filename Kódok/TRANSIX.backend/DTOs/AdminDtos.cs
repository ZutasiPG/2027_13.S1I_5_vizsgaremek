using Transix.Api.Models;

namespace Transix.Api.DTOs
{
    public class CreatePassTypeDto
    {
        public string Name { get; set; } = string.Empty;
        public uint DurationDays { get; set; }
        public decimal Price { get; set; }
        public DiscountCategory TargetDiscount { get; set; } = DiscountCategory.fullPrice;
    }

    public class CreateFareRateDto
    {
        public decimal MinKm { get; set; }
        public decimal MaxKm { get; set; }
        public decimal BasePrice { get; set; }
    }
}