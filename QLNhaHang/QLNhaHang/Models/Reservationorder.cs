using System;
using System.Collections.Generic;

namespace QLNhaHang.Models
{
    public partial class Reservationorder
    {
        public int Id { get; set; }
        public int? IdReservation { get; set; }
        public int? IdDish { get; set; }
        public int Quantity { get; set; }
        public double Total { get; set; }

        public virtual Dish? IdDishNavigation { get; set; }
        public virtual Reservation? IdReservationNavigation { get; set; }
    }
}
