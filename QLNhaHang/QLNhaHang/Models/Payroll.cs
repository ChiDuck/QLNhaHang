namespace QLNhaHang.Models
{
    public partial class Payroll
    {
        public Payroll()
        {
            Payrolldetails = new HashSet<Payrolldetail>();
        }

        public int IdPayroll { get; set; }
        public short Month { get; set; }
        public short Year { get; set; }

        public virtual ICollection<Payrolldetail> Payrolldetails { get; set; }
    }
}
