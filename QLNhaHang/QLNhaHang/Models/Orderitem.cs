using System;
using System.Collections.Generic;

namespace QLNhaHang.Models
{
    public partial class Orderitem
    {
        public int Id { get; set; }
        public int? IdShiporder { get; set; }
        public int? IdDish { get; set; }
        public int Quantity { get; set; }
        public double Subtotal { get; set; }

        public virtual Dish? IdDishNavigation { get; set; }
        public virtual Shiporder? IdShiporderNavigation { get; set; }
    }
}
