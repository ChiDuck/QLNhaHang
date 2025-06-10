namespace QLNhaHang.Models
{
    public partial class Inventoryitem
    {
        public Inventoryitem()
        {
            Dishingredients = new HashSet<Dishingredient>();
            Importticketdetails = new HashSet<Importticketdetail>();
        }

        public int IdInventoryitem { get; set; }
        public string Name { get; set; } = null!;
        public string Unit { get; set; } = null!;
        public double Amount { get; set; }
        public int IdInventoryitemtype { get; set; }

        public virtual Inventoryitemtype? IdInventoryitemtypeNavigation { get; set; } = null!;
        public virtual ICollection<Dishingredient> Dishingredients { get; set; }
        public virtual ICollection<Importticketdetail> Importticketdetails { get; set; }
    }
}
