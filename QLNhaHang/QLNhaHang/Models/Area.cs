using System;
using System.Collections.Generic;

namespace QLNhaHang.Models
{
    public partial class Area
    {
        public Area()
        {
            Tables = new HashSet<Table>();
        }

        public int IdArea { get; set; }
        public string Name { get; set; } = null!;

        public virtual ICollection<Table> Tables { get; set; }
    }
}
