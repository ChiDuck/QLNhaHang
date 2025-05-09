using System;
using System.Collections.Generic;

namespace QLNhaHang.Models
{
    public partial class Inventoryitem
    {
        public int IdInventoryitem { get; set; }
        public string Name { get; set; } = null!;
        public string Unit { get; set; } = null!;
        public double Amount { get; set; }
    }
}
