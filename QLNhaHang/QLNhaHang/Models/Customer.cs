﻿using System;
using System.Collections.Generic;

namespace QLNhaHang.Models
{
    public partial class Customer
    {
        public Customer()
        {
            Reservations = new HashSet<Reservation>();
        }

        public int IdCustomer { get; set; }
        public string Name { get; set; } = null!;
        public string PasswordHash { get; set; } = null!;
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public DateTime? Birthday { get; set; }
        public string? Photo { get; set; }
        public string? Address { get; set; }

        public virtual Cart? Cart { get; set; }
        public virtual ICollection<Reservation> Reservations { get; set; }
    }
}
