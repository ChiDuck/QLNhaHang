namespace QLNhaHang.Models
{
    public partial class Order
    {
        public int IdOrder { get; set; }
        public DateTime Orderdate { get; set; }
        public string Customername { get; set; } = null!;
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public bool Isshipping { get; set; }
        public string? Shipaddress { get; set; }
        public double? Shipfee { get; set; }
        public double Orderprice { get; set; }
        public string? Note { get; set; }
        public int IdOrderstatus { get; set; }
        public int IdCart { get; set; }
        public int IdPayment { get; set; }

        public virtual Cart IdCartNavigation { get; set; } = null!;
        public virtual Orderstatus IdOrderstatusNavigation { get; set; } = null!;
        public virtual Payment IdPaymentNavigation { get; set; } = null!;
    }
}
