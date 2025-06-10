namespace QLNhaHang.Models
{
    public partial class Cartdetail
    {
        public int IdCart { get; set; }
        public int IdDish { get; set; }
        public int Quantity { get; set; }
        public double Subtotal { get; set; }

        public virtual Cart IdCartNavigation { get; set; } = null!;
        public virtual Dish IdDishNavigation { get; set; } = null!;
    }
}
