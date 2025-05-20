﻿using System;
using System.Collections.Generic;

namespace QLNhaHang.Models
{
    public partial class Reservation
    {
        public Reservation()
        {
            Reservationorders = new HashSet<Reservationorder>();
        }

        public int IdReservation { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public DateTime Reservationdate { get; set; }
        public TimeSpan Reservationtime { get; set; }
        public byte Partysize { get; set; }
        public int IdReservationstatus { get; set; }
        public int? IdCustomer { get; set; }
        public int IdTable { get; set; }

        public virtual Customer? IdCustomerNavigation { get; set; }
        public virtual Reservationstatus IdReservationstatusNavigation { get; set; } = null!;
        public virtual Table IdTableNavigation { get; set; } = null!;
        public virtual ICollection<Reservationorder> Reservationorders { get; set; }
    }
}
