using System;
using System.Collections.Generic;

namespace QLNhaHang.Models
{
    public partial class Dish
    {
        public Dish()
        {
            Cartdetails = new HashSet<Cartdetail>();
            Reservationorders = new HashSet<Reservationorder>();
        }

        public int IdDish { get; set; }
        public string Name { get; set; } = null!;
        public int Price { get; set; }
        public string? Photo { get; set; }
        public string? Description { get; set; }

        public virtual ICollection<Cartdetail> Cartdetails { get; set; }
        public virtual ICollection<Reservationorder> Reservationorders { get; set; }
    }
}
