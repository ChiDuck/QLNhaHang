namespace QLNhaHang.Models
{
    public partial class Importticket
    {
        public Importticket()
        {
            Importticketdetails = new HashSet<Importticketdetail>();
        }

        public int IdImportticket { get; set; }
        public DateTime Createdate { get; set; }
        public double Vat { get; set; }
        public double Totalfee { get; set; }
        public int IdStaff { get; set; }

        public virtual Staff IdStaffNavigation { get; set; } = null!;
        public virtual ICollection<Importticketdetail> Importticketdetails { get; set; }
    }
}
