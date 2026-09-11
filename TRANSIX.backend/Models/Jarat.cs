namespace Transix.Api.Models
{
    public class Jarat
    {
        public int Id { get; set; }
        public string JaratSzam { get; set; } = string.Empty; // pl. "1011"
        public string Honnan { get; set; } = string.Empty;    // pl. "Budapest"
        public string Hova { get; set; } = string.Empty;      // pl. "Kecskemét"
        public DateTime IndulasIdo { get; set; }
        public decimal Alapar { get; set; }                   // pl. 2500
    }
}