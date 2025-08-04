namespace QLNhaHang.DTO
{
    public class ReservationDTO
    {
		public int IdReservation { get; set; }
		public DateTime Bookdate { get; set; }
		public string? Phone { get; set; }
		public string? Email { get; set; }
		public DateTime Reservationdate { get; set; }
		public TimeSpan Reservationtime { get; set; }
		public byte Partysize { get; set; }
		public double? Reservationprice { get; set; }
		public string? Note { get; set; }
		public string? Transactionid { get; set; }
		public int? IdReservationstatus { get; set; }
		public string? Status { get; set; }
        public string? CustomerName { get; set; }
        public string? TableName { get; set; }
        public string? StaffName { get; set; }
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
