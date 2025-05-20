using System;
using System.Collections.Generic;

namespace QLNhaHang.Models
{
    public partial class Dishcategory
    {
        public Dishcategory()
        {
            Dishes = new HashSet<Dish>();
        }

        public int IdDishcategory { get; set; }
        public string Name { get; set; } = null!;

        public virtual ICollection<Dish> Dishes { get; set; }
    }
}
