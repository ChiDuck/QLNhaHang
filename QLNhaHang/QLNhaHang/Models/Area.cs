using System;
using System.Collections.Generic;

namespace QLNhaHang.Models
{
    public partial class Area
    {
        public Area()
        {
            Dinetables = new HashSet<Dinetable>();
        }

        public int IdArea { get; set; }
        public string Name { get; set; } = null!;

        public virtual ICollection<Dinetable> Dinetables { get; set; }
    }
}
