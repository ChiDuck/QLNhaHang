using System;
using System.Collections.Generic;

namespace QLNhaHang.Models
{
    public partial class Dinetable
    {
        public Dinetable()
        {
            Reservations = new HashSet<Reservation>();
        }

        public int IdDinetable { get; set; }
        public string Name { get; set; } = null!;
        public int? IdTabletype { get; set; }
        public int? IdArea { get; set; }

        public virtual Area? IdAreaNavigation { get; set; }
        public virtual Tabletype? IdTabletypeNavigation { get; set; }
        public virtual ICollection<Reservation> Reservations { get; set; }
    }
}
