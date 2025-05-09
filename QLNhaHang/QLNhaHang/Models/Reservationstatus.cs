using System;
using System.Collections.Generic;

namespace QLNhaHang.Models
{
    public partial class Reservationstatus
    {
        public Reservationstatus()
        {
            Reservations = new HashSet<Reservation>();
        }

        public int IdReservationstatus { get; set; }
        public string Name { get; set; } = null!;

        public virtual ICollection<Reservation> Reservations { get; set; }
    }
}
