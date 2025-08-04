using System;
using System.Collections.Generic;

namespace QLNhaHang.Models
{
    public partial class Payrolldetail
    {
        public int IdStaff { get; set; }
        public int IdPayroll { get; set; }
        public byte Days { get; set; }
        public double Hours { get; set; }
        public byte Absencetimes { get; set; }
        public byte Latetimes { get; set; }
        public double Subtract { get; set; }
        public double Bonus { get; set; }
        public double Totalsalary { get; set; }
        public string? Note { get; set; }

        public virtual Payroll? IdPayrollNavigation { get; set; } = null!;
        public virtual Staff? IdStaffNavigation { get; set; } = null!;
    }
}
