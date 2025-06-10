namespace QLNhaHang.Models
{
    public partial class Staff
    {
        public Staff()
        {
            Importtickets = new HashSet<Importticket>();
            Payrolldetails = new HashSet<Payrolldetail>();
            Weeklyshifts = new HashSet<Weeklyshift>();
        }

        public int IdStaff { get; set; }
        public string Name { get; set; } = null!;
        public string PasswordHash { get; set; } = null!;
        public string Citizenid { get; set; } = null!;
        public string Phone { get; set; } = null!;
        public string Email { get; set; } = null!;
        public bool? Gender { get; set; }
        public DateTime? Birthday { get; set; }
        public string? Photo { get; set; }
        public string Address { get; set; } = null!;
        public DateTime? Startdate { get; set; }
        public double? Hourlysalary { get; set; }
        public bool Isactive { get; set; }
        public int IdStafftype { get; set; }

        public virtual Stafftype IdStafftypeNavigation { get; set; } = null!;
        public virtual ICollection<Importticket> Importtickets { get; set; }
        public virtual ICollection<Payrolldetail> Payrolldetails { get; set; }
        public virtual ICollection<Weeklyshift> Weeklyshifts { get; set; }
    }
}
