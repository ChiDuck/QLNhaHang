using System;
using System.Collections.Generic;

namespace QLNhaHang.Models
{
    public partial class Orderstatus
    {
        public Orderstatus()
        {
            Shiporders = new HashSet<Shiporder>();
        }

        public int IdOrderstatus { get; set; }
        public string Name { get; set; } = null!;

        public virtual ICollection<Shiporder> Shiporders { get; set; }
    }
}
