using System;
using System.Collections.Generic;

namespace QLNhaHang.Models
{
    public partial class Dish
    {
        public Dish()
        {
            Cartdetails = new HashSet<Cartdetail>();
            Dishingredients = new HashSet<Dishingredient>();
            Reservationorders = new HashSet<Reservationorder>();
        }

        public int IdDish { get; set; }
        public string Name { get; set; } = null!;
        public double Price { get; set; }
        public double? Discount { get; set; }
        public bool Issoldout { get; set; }
        public string? Photo { get; set; }
        public string? Description { get; set; }
        public int IdDishcategory { get; set; }

        public virtual Dishcategory IdDishcategoryNavigation { get; set; } = null!;
        public virtual ICollection<Cartdetail> Cartdetails { get; set; }
        public virtual ICollection<Dishingredient> Dishingredients { get; set; }
        public virtual ICollection<Reservationorder> Reservationorders { get; set; }
    }
}
