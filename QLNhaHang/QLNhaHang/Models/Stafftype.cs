using System;
using System.Collections.Generic;

namespace QLNhaHang.Models
{
    public partial class Stafftype
    {
        public Stafftype()
        {
            Staff = new HashSet<Staff>();
        }

        public int IdStafftype { get; set; }
        public string Name { get; set; } = null!;
        public string? Phone { get; set; }

        public virtual ICollection<Staff> Staff { get; set; }
    }
}
