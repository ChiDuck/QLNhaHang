using System;
using System.Collections.Generic;

namespace QLNhaHang.Models
{
    public partial class Importticketdetail
    {
        public int IdInventoryitem { get; set; }
        public int IdImportticket { get; set; }
        public double Amount { get; set; }
        public double Subtotal { get; set; }

        public virtual Importticket IdImportticketNavigation { get; set; } = null!;
        public virtual Inventoryitem IdInventoryitemNavigation { get; set; } = null!;
    }
}
