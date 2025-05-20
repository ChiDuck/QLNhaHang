using System;
using System.Collections.Generic;

namespace QLNhaHang.Models
{
    public partial class Weeklyshift
    {
        public int IdStaff { get; set; }
        public byte IdWorkday { get; set; }
        public byte IdWorkshift { get; set; }
        public bool Isassigned { get; set; }
        public bool? Attended { get; set; }
        public bool? Islate { get; set; }

        public virtual Staff IdStaffNavigation { get; set; } = null!;
        public virtual Workday IdWorkdayNavigation { get; set; } = null!;
        public virtual Workshift IdWorkshiftNavigation { get; set; } = null!;
    }
}
