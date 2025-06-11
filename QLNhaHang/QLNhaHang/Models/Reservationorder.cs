using System;
using System.Collections.Generic;

namespace QLNhaHang.Models
{
    public partial class Reservationorder
    {
        public int IdReservation { get; set; }
        public int IdDish { get; set; }
        public int Quantity { get; set; }
        public double Total { get; set; }

        public virtual Dish? IdDishNavigation { get; set; } = null!;
        public virtual Reservation? IdReservationNavigation { get; set; } = null!;
    }
}
