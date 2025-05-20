using System;
using System.Collections.Generic;

namespace QLNhaHang.Models
{
    public partial class Workshift
    {
        public Workshift()
        {
            Weeklyshifts = new HashSet<Weeklyshift>();
        }

        public byte IdWorkshift { get; set; }
        public byte Shift { get; set; }
        public double Shifthour { get; set; }

        public virtual ICollection<Weeklyshift> Weeklyshifts { get; set; }
    }
}
