using System;
using System.Collections.Generic;

namespace QLNhaHang.Models
{
    public partial class Table
    {
        public Table()
        {
            Reservations = new HashSet<Reservation>();
        }

        public int IdTable { get; set; }
        public int Seats { get; set; }
        public int? IdArea { get; set; }
        public int? IdTabletype { get; set; }

        public virtual Area? IdAreaNavigation { get; set; }
        public virtual Tabletype? IdTabletypeNavigation { get; set; }
        public virtual ICollection<Reservation> Reservations { get; set; }
    }
}
