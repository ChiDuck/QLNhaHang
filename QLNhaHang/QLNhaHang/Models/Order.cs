using System;
using System.Collections.Generic;

namespace QLNhaHang.Models
{
    public partial class Order
    {
        public Order()
        {
            Payments = new HashSet<Payment>();
        }

        public int IdOrder { get; set; }
        public DateTime Orderdate { get; set; }
        public string Customername { get; set; } = null!;
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public bool Isshipping { get; set; }
        public string? Shipaddress { get; set; }
        public int? Shipfee { get; set; }
        public int Orderprice { get; set; }
        public int? IdOrderstatus { get; set; }
        public int IdCart { get; set; }

        public virtual Cart IdCartNavigation { get; set; } = null!;
        public virtual Orderstatus? IdOrderstatusNavigation { get; set; }
        public virtual ICollection<Payment> Payments { get; set; }
    }
}
