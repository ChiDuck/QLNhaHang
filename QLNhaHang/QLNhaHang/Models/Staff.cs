using System;
using System.Collections.Generic;

namespace QLNhaHang.Models
{
    public partial class Staff
    {
        public Staff()
        {
            Payrolldetails = new HashSet<Payrolldetail>();
            Reservations = new HashSet<Reservation>();
            Shiporders = new HashSet<Shiporder>();
            Weeklyshifts = new HashSet<Weeklyshift>();
        }

        public int IdStaff { get; set; }
        public string Name { get; set; } = null!;
        public string PasswordHash { get; set; } = null!;
        public string Citizenid { get; set; } = null!;
        public string Phone { get; set; } = null!;
        public string Email { get; set; } = null!;
        public bool? Gender { get; set; }
        public DateTime Birthday { get; set; }
        public string? Photo { get; set; }
        public string Address { get; set; } = null!;
        public DateTime? Startdate { get; set; }
        public double? Hourlysalary { get; set; }
        public bool Isactive { get; set; }
        public int? IdStafftype { get; set; }

        public virtual Stafftype? IdStafftypeNavigation { get; set; }
        public virtual ICollection<Payrolldetail> Payrolldetails { get; set; }
        public virtual ICollection<Reservation> Reservations { get; set; }
        public virtual ICollection<Shiporder> Shiporders { get; set; }
        public virtual ICollection<Weeklyshift> Weeklyshifts { get; set; }
    }
}
