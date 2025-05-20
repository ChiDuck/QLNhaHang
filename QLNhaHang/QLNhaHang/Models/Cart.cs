using System;
using System.Collections.Generic;

namespace QLNhaHang.Models
{
    public partial class Cart
    {
        public Cart()
        {
            Cartdetails = new HashSet<Cartdetail>();
            Orders = new HashSet<Order>();
        }

        public int IdCart { get; set; }
        public double Totalprice { get; set; }
        public int IdCustomer { get; set; }

        public virtual Customer IdCustomerNavigation { get; set; } = null!;
        public virtual ICollection<Cartdetail> Cartdetails { get; set; }
        public virtual ICollection<Order> Orders { get; set; }
    }
}
