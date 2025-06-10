namespace QLNhaHang.Models
{
    public partial class Tabletype
    {
        public Tabletype()
        {
            Tables = new HashSet<Table>();
        }

        public int IdTabletype { get; set; }
        public string Name { get; set; } = null!;

        public virtual ICollection<Table> Tables { get; set; }
    }
}
