namespace QLNhaHang.Models
{
    public partial class Payment
    {
        public Payment()
        {
            Customers = new HashSet<Customer>();
            Orders = new HashSet<Order>();
        }

        public int IdPayment { get; set; }
        public string Cardnumber { get; set; } = null!;
        public DateTime Expirydate { get; set; }
        public short Cvc { get; set; }

        public virtual ICollection<Customer> Customers { get; set; }
        public virtual ICollection<Order> Orders { get; set; }
    }
}
