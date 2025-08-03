using System;
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
        public DateTime Bookdate { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public DateTime Reservationdate { get; set; }
        public TimeSpan Reservationtime { get; set; }
        public byte Partysize { get; set; }
        public double? Reservationprice { get; set; }
        public string? Note { get; set; }
        public string? Transactionid { get; set; }
        public int? IdReservationstatus { get; set; }
        public int? IdCustomer { get; set; }
        public int? IdDinetable { get; set; }
        public int? IdStaff { get; set; }

        public virtual Customer? IdCustomerNavigation { get; set; }
        public virtual Dinetable? IdDinetableNavigation { get; set; }
        public virtual Reservationstatus? IdReservationstatusNavigation { get; set; }
        public virtual Staff? IdStaffNavigation { get; set; }
        public virtual ICollection<Reservationorder> Reservationorders { get; set; }
    }
}
