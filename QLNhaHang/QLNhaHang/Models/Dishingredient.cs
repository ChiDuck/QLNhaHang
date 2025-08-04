using System;
using System.Collections.Generic;

namespace QLNhaHang.Models
{
    public partial class Dishingredient
    {
        public int Id { get; set; }
        public int? IdDish { get; set; }
        public int? IdInventoryitem { get; set; }
        public double Amount { get; set; }

        public virtual Dish? IdDishNavigation { get; set; }
        public virtual Inventoryitem? IdInventoryitemNavigation { get; set; }
    }
}
