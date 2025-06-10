using System;
using System.Collections.Generic;

namespace QLNhaHang.Models
{
    public partial class Cart
    {
        public Cart()
        {
            Cartdetails = new HashSet<Cartdetail>();
            Shiporders = new HashSet<Shiporder>();
        }

        public int IdCart { get; set; }
        public double Totalprice { get; set; }
        public int IdCustomer { get; set; }

        public virtual Customer IdCustomerNavigation { get; set; } = null!;
        public virtual ICollection<Cartdetail> Cartdetails { get; set; }
        public virtual ICollection<Shiporder> Shiporders { get; set; }
    }
}
