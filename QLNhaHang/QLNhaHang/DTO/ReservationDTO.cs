namespace QLNhaHang.DTO
{
    public class ReservationDTO
    {
        public int IdReservation { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public DateTime ReservationDate { get; set; }
        public TimeSpan ReservationTime { get; set; }
        public byte PartySize { get; set; }
        public string? Note { get; set; }
        public string? Status { get; set; }
        public string? CustomerName { get; set; }
        public string? TableName { get; set; }
        public List<ReservationOrderDTO> Orders { get; set; } = new();
    }

    public class ReservationOrderDTO
    {
        public int IdDish { get; set; }
        public string DishName { get; set; } = null!;
        public string? DishPhoto { get; set; }
        public int Quantity { get; set; }
        public double Total { get; set; }
    }

}
