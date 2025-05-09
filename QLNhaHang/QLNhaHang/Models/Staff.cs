using System;
using System.Collections.Generic;

namespace QLNhaHang.Models
{
    public partial class Staff
    {
        public Staff()
        {
            Weeklyshifts = new HashSet<Weeklyshift>();
        }

        public int IdStaff { get; set; }
        public string Name { get; set; } = null!;
        public string PasswordHash { get; set; } = null!;
        public string Phone { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? Photo { get; set; }
        public string Address { get; set; } = null!;
        public int? Hourlysalary { get; set; }
        public short? Monthworkhour { get; set; }
        public int IdStafftype { get; set; }

        public virtual Stafftype IdStafftypeNavigation { get; set; } = null!;
        public virtual ICollection<Weeklyshift> Weeklyshifts { get; set; }
    }
}
