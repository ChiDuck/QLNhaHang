using System;
using System.Collections.Generic;

namespace QLNhaHang.Models
{
    public partial class Payment
    {
        public int IdPayment { get; set; }
        public string Cardnumber { get; set; } = null!;
        public DateTime Expirydate { get; set; }
        public short Cvc { get; set; }
        public int? IdCustomer { get; set; }
        public int IdOrder { get; set; }

        public virtual Customer? IdCustomerNavigation { get; set; }
        public virtual Order IdOrderNavigation { get; set; } = null!;
    }
}
