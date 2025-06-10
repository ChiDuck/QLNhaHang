using System;
using System.Collections.Generic;

namespace QLNhaHang.Models
{
    public partial class Tabletype
    {
        public Tabletype()
        {
            Dinetables = new HashSet<Dinetable>();
        }

        public int IdTabletype { get; set; }
        public string Name { get; set; } = null!;
        public int Seats { get; set; }

        public virtual ICollection<Dinetable> Dinetables { get; set; }
    }
}
