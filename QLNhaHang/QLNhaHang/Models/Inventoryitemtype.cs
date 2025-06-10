namespace QLNhaHang.Models
{
    public partial class Inventoryitemtype
    {
        public Inventoryitemtype()
        {
            Inventoryitems = new HashSet<Inventoryitem>();
        }

        public int IdInventoryitemtype { get; set; }
        public string Name { get; set; } = null!;

        public virtual ICollection<Inventoryitem> Inventoryitems { get; set; }
    }
}
