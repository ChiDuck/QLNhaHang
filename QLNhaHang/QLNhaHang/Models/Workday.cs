using System;
using System.Collections.Generic;

namespace QLNhaHang.Models
{
    public partial class Workday
    {
        public Workday()
        {
            Weeklyshifts = new HashSet<Weeklyshift>();
        }

        public byte IdWorkday { get; set; }
        public byte Weekday { get; set; }

        public virtual ICollection<Weeklyshift> Weeklyshifts { get; set; }
    }
}
