using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;

namespace QLNhaHang.Models
{
    public partial class QLNhaHangContext : DbContext
    {
        public QLNhaHangContext()
        {
        }

        public QLNhaHangContext(DbContextOptions<QLNhaHangContext> options)
            : base(options)
        {
        }

        public virtual DbSet<Area> Areas { get; set; } = null!;
        public virtual DbSet<Cart> Carts { get; set; } = null!;
        public virtual DbSet<Cartdetail> Cartdetails { get; set; } = null!;
        public virtual DbSet<Customer> Customers { get; set; } = null!;
        public virtual DbSet<Dinetable> Dinetables { get; set; } = null!;
        public virtual DbSet<Dish> Dishes { get; set; } = null!;
        public virtual DbSet<Dishcategory> Dishcategories { get; set; } = null!;
        public virtual DbSet<Dishingredient> Dishingredients { get; set; } = null!;
        public virtual DbSet<Inventoryitem> Inventoryitems { get; set; } = null!;
        public virtual DbSet<Inventoryitemtype> Inventoryitemtypes { get; set; } = null!;
        public virtual DbSet<Orderitem> Orderitems { get; set; } = null!;
        public virtual DbSet<Orderstatus> Orderstatuses { get; set; } = null!;
        public virtual DbSet<Payroll> Payrolls { get; set; } = null!;
        public virtual DbSet<Payrolldetail> Payrolldetails { get; set; } = null!;
        public virtual DbSet<Reservation> Reservations { get; set; } = null!;
        public virtual DbSet<Reservationorder> Reservationorders { get; set; } = null!;
        public virtual DbSet<Reservationstatus> Reservationstatuses { get; set; } = null!;
        public virtual DbSet<Shiporder> Shiporders { get; set; } = null!;
        public virtual DbSet<Staff> Staff { get; set; } = null!;
        public virtual DbSet<Stafftype> Stafftypes { get; set; } = null!;
        public virtual DbSet<Tabletype> Tabletypes { get; set; } = null!;
        public virtual DbSet<Weeklyshift> Weeklyshifts { get; set; } = null!;
        public virtual DbSet<Workday> Workdays { get; set; } = null!;
        public virtual DbSet<Workshift> Workshifts { get; set; } = null!;

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see http://go.microsoft.com/fwlink/?LinkId=723263.
                optionsBuilder.UseSqlServer("Data Source=chiduck;Initial Catalog=QLNhaHang;Integrated Security=True;Trust Server Certificate=True");
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Area>(entity =>
            {
                entity.HasKey(e => e.IdArea)
                    .HasName("PK__AREA__6E15A1AACBDCBD2C");

                entity.ToTable("AREA");

                entity.Property(e => e.IdArea).HasColumnName("ID_AREA");

                entity.Property(e => e.Name)
                    .HasMaxLength(35)
                    .HasColumnName("NAME");
            });

            modelBuilder.Entity<Cart>(entity =>
            {
                entity.HasKey(e => e.IdCart)
                    .HasName("PK__CART__7A1680A5FEC0E652");

                entity.ToTable("CART");

                entity.HasIndex(e => e.IdCustomer, "UQ__CART__7F6B0B8B04240B84")
                    .IsUnique();

                entity.Property(e => e.IdCart).HasColumnName("ID_CART");

                entity.Property(e => e.IdCustomer).HasColumnName("ID_CUSTOMER");

                entity.Property(e => e.Totalprice).HasColumnName("TOTALPRICE");

                entity.HasOne(d => d.IdCustomerNavigation)
                    .WithOne(p => p.Cart)
                    .HasForeignKey<Cart>(d => d.IdCustomer)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__CART__ID_CUSTOME__6754599E");
            });

            modelBuilder.Entity<Cartdetail>(entity =>
            {
                entity.HasKey(e => new { e.IdCart, e.IdDish })
                    .HasName("PK__CARTDETA__0FD25835E6776FF5");

                entity.ToTable("CARTDETAIL");

                entity.Property(e => e.IdCart).HasColumnName("ID_CART");

                entity.Property(e => e.IdDish).HasColumnName("ID_DISH");

                entity.Property(e => e.Quantity).HasColumnName("QUANTITY");

                entity.Property(e => e.Subtotal).HasColumnName("SUBTOTAL");

                entity.HasOne(d => d.IdCartNavigation)
                    .WithMany(p => p.Cartdetails)
                    .HasForeignKey(d => d.IdCart)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__CARTDETAI__ID_CA__6A30C649");

                entity.HasOne(d => d.IdDishNavigation)
                    .WithMany(p => p.Cartdetails)
                    .HasForeignKey(d => d.IdDish)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__CARTDETAI__ID_DI__6B24EA82");
            });

            modelBuilder.Entity<Customer>(entity =>
            {
                entity.HasKey(e => e.IdCustomer)
                    .HasName("PK__CUSTOMER__7F6B0B8AC6EB2875");

                entity.ToTable("CUSTOMER");

                entity.Property(e => e.IdCustomer).HasColumnName("ID_CUSTOMER");

                entity.Property(e => e.Address)
                    .HasMaxLength(100)
                    .HasColumnName("ADDRESS");

                entity.Property(e => e.Birthday)
                    .HasColumnType("date")
                    .HasColumnName("BIRTHDAY");

                entity.Property(e => e.Email)
                    .HasMaxLength(35)
                    .IsUnicode(false)
                    .HasColumnName("EMAIL");

                entity.Property(e => e.Name)
                    .HasMaxLength(30)
                    .HasColumnName("NAME");

                entity.Property(e => e.PasswordHash)
                    .HasMaxLength(150)
                    .IsUnicode(false)
                    .HasColumnName("PASSWORD_HASH");

                entity.Property(e => e.Phone)
                    .HasMaxLength(15)
                    .IsUnicode(false)
                    .HasColumnName("PHONE");

                entity.Property(e => e.Photo)
                    .IsUnicode(false)
                    .HasColumnName("PHOTO");
            });

            modelBuilder.Entity<Dinetable>(entity =>
            {
                entity.HasKey(e => e.IdDinetable)
                    .HasName("PK__DINETABL__9C6E1099BDC29984");

                entity.ToTable("DINETABLE");

                entity.HasIndex(e => e.Name, "UQ__DINETABL__D9C1FA00BFFFEEB4")
                    .IsUnique();

                entity.Property(e => e.IdDinetable).HasColumnName("ID_DINETABLE");

                entity.Property(e => e.IdArea).HasColumnName("ID_AREA");

                entity.Property(e => e.IdTabletype).HasColumnName("ID_TABLETYPE");

                entity.Property(e => e.Name)
                    .HasMaxLength(50)
                    .HasColumnName("NAME");

                entity.HasOne(d => d.IdAreaNavigation)
                    .WithMany(p => p.Dinetables)
                    .HasForeignKey(d => d.IdArea)
                    .HasConstraintName("FK__DINETABLE__ID_AR__403A8C7D");

                entity.HasOne(d => d.IdTabletypeNavigation)
                    .WithMany(p => p.Dinetables)
                    .HasForeignKey(d => d.IdTabletype)
                    .HasConstraintName("FK__DINETABLE__ID_TA__3F466844");
            });

            modelBuilder.Entity<Dish>(entity =>
            {
                entity.HasKey(e => e.IdDish)
                    .HasName("PK__DISH__5C4D8906E88461B4");

                entity.ToTable("DISH");

                entity.Property(e => e.IdDish).HasColumnName("ID_DISH");

                entity.Property(e => e.Description)
                    .HasMaxLength(200)
                    .HasColumnName("DESCRIPTION");

                entity.Property(e => e.Discount).HasColumnName("DISCOUNT");

                entity.Property(e => e.IdDishcategory).HasColumnName("ID_DISHCATEGORY");

                entity.Property(e => e.Issoldout).HasColumnName("ISSOLDOUT");

                entity.Property(e => e.Name)
                    .HasMaxLength(50)
                    .HasColumnName("NAME");

                entity.Property(e => e.Photo)
                    .IsUnicode(false)
                    .HasColumnName("PHOTO");

                entity.Property(e => e.Price).HasColumnName("PRICE");

                entity.HasOne(d => d.IdDishcategoryNavigation)
                    .WithMany(p => p.Dishes)
                    .HasForeignKey(d => d.IdDishcategory)
                    .HasConstraintName("FK__DISH__ID_DISHCAT__5441852A");
            });

            modelBuilder.Entity<Dishcategory>(entity =>
            {
                entity.HasKey(e => e.IdDishcategory)
                    .HasName("PK__DISHCATE__F7727DD8310DEAF0");

                entity.ToTable("DISHCATEGORY");

                entity.Property(e => e.IdDishcategory).HasColumnName("ID_DISHCATEGORY");

                entity.Property(e => e.Name)
                    .HasMaxLength(50)
                    .HasColumnName("NAME");
            });

            modelBuilder.Entity<Dishingredient>(entity =>
            {
                entity.ToTable("DISHINGREDIENT");

                entity.Property(e => e.Id).HasColumnName("ID");

                entity.Property(e => e.Amount).HasColumnName("AMOUNT");

                entity.Property(e => e.IdDish).HasColumnName("ID_DISH");

                entity.Property(e => e.IdInventoryitem).HasColumnName("ID_INVENTORYITEM");

                entity.HasOne(d => d.IdDishNavigation)
                    .WithMany(p => p.Dishingredients)
                    .HasForeignKey(d => d.IdDish)
                    .HasConstraintName("FK__DISHINGRE__ID_DI__5BE2A6F2");

                entity.HasOne(d => d.IdInventoryitemNavigation)
                    .WithMany(p => p.Dishingredients)
                    .HasForeignKey(d => d.IdInventoryitem)
                    .HasConstraintName("FK__DISHINGRE__ID_IN__5CD6CB2B");
            });

            modelBuilder.Entity<Inventoryitem>(entity =>
            {
                entity.HasKey(e => e.IdInventoryitem)
                    .HasName("PK__INVENTOR__BA5183B0E7166A2A");

                entity.ToTable("INVENTORYITEM");

                entity.Property(e => e.IdInventoryitem).HasColumnName("ID_INVENTORYITEM");

                entity.Property(e => e.Amount).HasColumnName("AMOUNT");

                entity.Property(e => e.IdInventoryitemtype).HasColumnName("ID_INVENTORYITEMTYPE");

                entity.Property(e => e.Name)
                    .HasMaxLength(35)
                    .HasColumnName("NAME");

                entity.Property(e => e.Unit)
                    .HasMaxLength(20)
                    .HasColumnName("UNIT");

                entity.HasOne(d => d.IdInventoryitemtypeNavigation)
                    .WithMany(p => p.Inventoryitems)
                    .HasForeignKey(d => d.IdInventoryitemtype)
                    .HasConstraintName("FK__INVENTORY__ID_IN__59063A47");
            });

            modelBuilder.Entity<Inventoryitemtype>(entity =>
            {
                entity.HasKey(e => e.IdInventoryitemtype)
                    .HasName("PK__INVENTOR__06C9E7EB2C567443");

                entity.ToTable("INVENTORYITEMTYPE");

                entity.Property(e => e.IdInventoryitemtype).HasColumnName("ID_INVENTORYITEMTYPE");

                entity.Property(e => e.Name)
                    .HasMaxLength(35)
                    .HasColumnName("NAME");
            });

            modelBuilder.Entity<Orderitem>(entity =>
            {
                entity.ToTable("ORDERITEM");

                entity.Property(e => e.Id).HasColumnName("ID");

                entity.Property(e => e.IdDish).HasColumnName("ID_DISH");

                entity.Property(e => e.IdShiporder).HasColumnName("ID_SHIPORDER");

                entity.Property(e => e.Quantity).HasColumnName("QUANTITY");

                entity.Property(e => e.Subtotal).HasColumnName("SUBTOTAL");

                entity.HasOne(d => d.IdDishNavigation)
                    .WithMany(p => p.Orderitems)
                    .HasForeignKey(d => d.IdDish)
                    .HasConstraintName("FK__ORDERITEM__ID_DI__74AE54BC");

                entity.HasOne(d => d.IdShiporderNavigation)
                    .WithMany(p => p.Orderitems)
                    .HasForeignKey(d => d.IdShiporder)
                    .HasConstraintName("FK__ORDERITEM__ID_SH__73BA3083");
            });

            modelBuilder.Entity<Orderstatus>(entity =>
            {
                entity.HasKey(e => e.IdOrderstatus)
                    .HasName("PK__ORDERSTA__9CAE67D97119C1A3");

                entity.ToTable("ORDERSTATUS");

                entity.Property(e => e.IdOrderstatus).HasColumnName("ID_ORDERSTATUS");

                entity.Property(e => e.Name)
                    .HasMaxLength(35)
                    .HasColumnName("NAME");
            });

            modelBuilder.Entity<Payroll>(entity =>
            {
                entity.HasKey(e => e.IdPayroll)
                    .HasName("PK__PAYROLL__73C8C769A2C06000");

                entity.ToTable("PAYROLL");

                entity.Property(e => e.IdPayroll).HasColumnName("ID_PAYROLL");

                entity.Property(e => e.Month).HasColumnName("MONTH");

                entity.Property(e => e.Year).HasColumnName("YEAR");
            });

            modelBuilder.Entity<Payrolldetail>(entity =>
            {
                entity.ToTable("PAYROLLDETAIL");

                entity.Property(e => e.Id).HasColumnName("ID");

                entity.Property(e => e.Absencetimes).HasColumnName("ABSENCETIMES");

                entity.Property(e => e.Bonus).HasColumnName("BONUS");

                entity.Property(e => e.Days).HasColumnName("DAYS");

                entity.Property(e => e.Hours).HasColumnName("HOURS");

                entity.Property(e => e.IdPayroll).HasColumnName("ID_PAYROLL");

                entity.Property(e => e.IdStaff).HasColumnName("ID_STAFF");

                entity.Property(e => e.Latetimes).HasColumnName("LATETIMES");

                entity.Property(e => e.Note)
                    .HasMaxLength(100)
                    .HasColumnName("NOTE");

                entity.Property(e => e.Subtract).HasColumnName("SUBTRACT");

                entity.Property(e => e.Totalsalary).HasColumnName("TOTALSALARY");

                entity.HasOne(d => d.IdPayrollNavigation)
                    .WithMany(p => p.Payrolldetails)
                    .HasForeignKey(d => d.IdPayroll)
                    .HasConstraintName("FK__PAYROLLDE__ID_PA__0C85DE4D");

                entity.HasOne(d => d.IdStaffNavigation)
                    .WithMany(p => p.Payrolldetails)
                    .HasForeignKey(d => d.IdStaff)
                    .HasConstraintName("FK__PAYROLLDE__ID_ST__0B91BA14");
            });

            modelBuilder.Entity<Reservation>(entity =>
            {
                entity.HasKey(e => e.IdReservation)
                    .HasName("PK__RESERVAT__3CB7398B9E8EF4E4");

                entity.ToTable("RESERVATION");

                entity.Property(e => e.IdReservation).HasColumnName("ID_RESERVATION");

                entity.Property(e => e.Bookdate)
                    .HasColumnType("datetime")
                    .HasColumnName("BOOKDATE");

                entity.Property(e => e.Email)
                    .HasMaxLength(35)
                    .IsUnicode(false)
                    .HasColumnName("EMAIL");

                entity.Property(e => e.IdCustomer).HasColumnName("ID_CUSTOMER");

                entity.Property(e => e.IdDinetable).HasColumnName("ID_DINETABLE");

                entity.Property(e => e.IdReservationstatus).HasColumnName("ID_RESERVATIONSTATUS");

                entity.Property(e => e.IdStaff).HasColumnName("ID_STAFF");

                entity.Property(e => e.Note)
                    .HasMaxLength(150)
                    .HasColumnName("NOTE");

                entity.Property(e => e.Partysize).HasColumnName("PARTYSIZE");

                entity.Property(e => e.Phone)
                    .HasMaxLength(13)
                    .IsUnicode(false)
                    .HasColumnName("PHONE")
                    .IsFixedLength();

                entity.Property(e => e.Reservationdate)
                    .HasColumnType("date")
                    .HasColumnName("RESERVATIONDATE");

                entity.Property(e => e.Reservationprice).HasColumnName("RESERVATIONPRICE");

                entity.Property(e => e.Reservationtime).HasColumnName("RESERVATIONTIME");

                entity.Property(e => e.Transactionid)
                    .HasMaxLength(100)
                    .IsUnicode(false)
                    .HasColumnName("TRANSACTIONID");

                entity.HasOne(d => d.IdCustomerNavigation)
                    .WithMany(p => p.Reservations)
                    .HasForeignKey(d => d.IdCustomer)
                    .HasConstraintName("FK__RESERVATI__ID_CU__4BAC3F29");

                entity.HasOne(d => d.IdDinetableNavigation)
                    .WithMany(p => p.Reservations)
                    .HasForeignKey(d => d.IdDinetable)
                    .HasConstraintName("FK__RESERVATI__ID_DI__4CA06362");

                entity.HasOne(d => d.IdReservationstatusNavigation)
                    .WithMany(p => p.Reservations)
                    .HasForeignKey(d => d.IdReservationstatus)
                    .HasConstraintName("FK__RESERVATI__ID_RE__4AB81AF0");

                entity.HasOne(d => d.IdStaffNavigation)
                    .WithMany(p => p.Reservations)
                    .HasForeignKey(d => d.IdStaff)
                    .HasConstraintName("FK__RESERVATI__ID_ST__4D94879B");
            });

            modelBuilder.Entity<Reservationorder>(entity =>
            {
                entity.ToTable("RESERVATIONORDER");

                entity.Property(e => e.Id).HasColumnName("ID");

                entity.Property(e => e.IdDish).HasColumnName("ID_DISH");

                entity.Property(e => e.IdReservation).HasColumnName("ID_RESERVATION");

                entity.Property(e => e.Quantity).HasColumnName("QUANTITY");

                entity.Property(e => e.Total).HasColumnName("TOTAL");

                entity.HasOne(d => d.IdDishNavigation)
                    .WithMany(p => p.Reservationorders)
                    .HasForeignKey(d => d.IdDish)
                    .HasConstraintName("FK__RESERVATI__ID_DI__60A75C0F");

                entity.HasOne(d => d.IdReservationNavigation)
                    .WithMany(p => p.Reservationorders)
                    .HasForeignKey(d => d.IdReservation)
                    .HasConstraintName("FK__RESERVATI__ID_RE__5FB337D6");
            });

            modelBuilder.Entity<Reservationstatus>(entity =>
            {
                entity.HasKey(e => e.IdReservationstatus)
                    .HasName("PK__RESERVAT__4B5D56B1177B9C85");

                entity.ToTable("RESERVATIONSTATUS");

                entity.Property(e => e.IdReservationstatus).HasColumnName("ID_RESERVATIONSTATUS");

                entity.Property(e => e.Name)
                    .HasMaxLength(35)
                    .HasColumnName("NAME");
            });

            modelBuilder.Entity<Shiporder>(entity =>
            {
                entity.HasKey(e => e.IdShiporder)
                    .HasName("PK__SHIPORDE__89B37B56A8738BDC");

                entity.ToTable("SHIPORDER");

                entity.Property(e => e.IdShiporder).HasColumnName("ID_SHIPORDER");

                entity.Property(e => e.Customername)
                    .HasMaxLength(30)
                    .HasColumnName("CUSTOMERNAME");

                entity.Property(e => e.Email)
                    .HasMaxLength(35)
                    .IsUnicode(false)
                    .HasColumnName("EMAIL");

                entity.Property(e => e.IdCart).HasColumnName("ID_CART");

                entity.Property(e => e.IdOrderstatus).HasColumnName("ID_ORDERSTATUS");

                entity.Property(e => e.IdStaff).HasColumnName("ID_STAFF");

                entity.Property(e => e.Isshipping).HasColumnName("ISSHIPPING");

                entity.Property(e => e.Note)
                    .HasMaxLength(150)
                    .HasColumnName("NOTE");

                entity.Property(e => e.Orderdate)
                    .HasColumnType("datetime")
                    .HasColumnName("ORDERDATE");

                entity.Property(e => e.Orderprice).HasColumnName("ORDERPRICE");

                entity.Property(e => e.Phone)
                    .HasMaxLength(13)
                    .IsUnicode(false)
                    .HasColumnName("PHONE")
                    .IsFixedLength();

                entity.Property(e => e.Shipaddress)
                    .HasMaxLength(100)
                    .HasColumnName("SHIPADDRESS");

                entity.Property(e => e.Shipfee).HasColumnName("SHIPFEE");

                entity.Property(e => e.Transactionid)
                    .HasMaxLength(100)
                    .IsUnicode(false)
                    .HasColumnName("TRANSACTIONID");

                entity.HasOne(d => d.IdCartNavigation)
                    .WithMany(p => p.Shiporders)
                    .HasForeignKey(d => d.IdCart)
                    .HasConstraintName("FK__SHIPORDER__ID_CA__6EF57B66");

                entity.HasOne(d => d.IdOrderstatusNavigation)
                    .WithMany(p => p.Shiporders)
                    .HasForeignKey(d => d.IdOrderstatus)
                    .HasConstraintName("FK__SHIPORDER__ID_OR__6E01572D");

                entity.HasOne(d => d.IdStaffNavigation)
                    .WithMany(p => p.Shiporders)
                    .HasForeignKey(d => d.IdStaff)
                    .HasConstraintName("FK__SHIPORDER__ID_ST__6FE99F9F");
            });

            modelBuilder.Entity<Staff>(entity =>
            {
                entity.HasKey(e => e.IdStaff)
                    .HasName("PK__STAFF__E759A3718A577038");

                entity.ToTable("STAFF");

                entity.HasIndex(e => e.Citizenid, "UQ__STAFF__1FD9B7329B94B990")
                    .IsUnique();

                entity.Property(e => e.IdStaff).HasColumnName("ID_STAFF");

                entity.Property(e => e.Address)
                    .HasMaxLength(100)
                    .HasColumnName("ADDRESS");

                entity.Property(e => e.Birthday)
                    .HasColumnType("date")
                    .HasColumnName("BIRTHDAY");

                entity.Property(e => e.Citizenid)
                    .HasMaxLength(12)
                    .IsUnicode(false)
                    .HasColumnName("CITIZENID")
                    .IsFixedLength();

                entity.Property(e => e.Email)
                    .HasMaxLength(35)
                    .IsUnicode(false)
                    .HasColumnName("EMAIL");

                entity.Property(e => e.Gender).HasColumnName("GENDER");

                entity.Property(e => e.Hourlysalary).HasColumnName("HOURLYSALARY");

                entity.Property(e => e.IdStafftype).HasColumnName("ID_STAFFTYPE");

                entity.Property(e => e.Isactive).HasColumnName("ISACTIVE");

                entity.Property(e => e.Name)
                    .HasMaxLength(35)
                    .HasColumnName("NAME");

                entity.Property(e => e.PasswordHash)
                    .HasMaxLength(150)
                    .IsUnicode(false)
                    .HasColumnName("PASSWORD_HASH");

                entity.Property(e => e.Phone)
                    .HasMaxLength(13)
                    .IsUnicode(false)
                    .HasColumnName("PHONE")
                    .IsFixedLength();

                entity.Property(e => e.Photo)
                    .IsUnicode(false)
                    .HasColumnName("PHOTO");

                entity.Property(e => e.Startdate)
                    .HasColumnType("date")
                    .HasColumnName("STARTDATE");

                entity.HasOne(d => d.IdStafftypeNavigation)
                    .WithMany(p => p.Staff)
                    .HasForeignKey(d => d.IdStafftype)
                    .HasConstraintName("FK__STAFF__ID_STAFFT__45F365D3");
            });

            modelBuilder.Entity<Stafftype>(entity =>
            {
                entity.HasKey(e => e.IdStafftype)
                    .HasName("PK__STAFFTYP__702D805BB54AE4CB");

                entity.ToTable("STAFFTYPE");

                entity.Property(e => e.IdStafftype).HasColumnName("ID_STAFFTYPE");

                entity.Property(e => e.Name)
                    .HasMaxLength(35)
                    .HasColumnName("NAME");
            });

            modelBuilder.Entity<Tabletype>(entity =>
            {
                entity.HasKey(e => e.IdTabletype)
                    .HasName("PK__TABLETYP__A1F1FC57D83400BA");

                entity.ToTable("TABLETYPE");

                entity.Property(e => e.IdTabletype).HasColumnName("ID_TABLETYPE");

                entity.Property(e => e.Name)
                    .HasMaxLength(35)
                    .HasColumnName("NAME");

                entity.Property(e => e.Seats).HasColumnName("SEATS");
            });

            modelBuilder.Entity<Weeklyshift>(entity =>
            {
                entity.HasKey(e => new { e.IdWorkshift, e.IdWorkday, e.IdStaff })
                    .HasName("PK__WEEKLYSH__97A56D2677F1210C");

                entity.ToTable("WEEKLYSHIFT");

                entity.Property(e => e.IdWorkshift).HasColumnName("ID_WORKSHIFT");

                entity.Property(e => e.IdWorkday).HasColumnName("ID_WORKDAY");

                entity.Property(e => e.IdStaff).HasColumnName("ID_STAFF");

                entity.Property(e => e.Attended).HasColumnName("ATTENDED");

                entity.Property(e => e.Islate).HasColumnName("ISLATE");

                entity.Property(e => e.Processed).HasColumnName("PROCESSED");

                entity.HasOne(d => d.IdStaffNavigation)
                    .WithMany(p => p.Weeklyshifts)
                    .HasForeignKey(d => d.IdStaff)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__WEEKLYSHI__ID_ST__7B5B524B");

                entity.HasOne(d => d.IdWorkdayNavigation)
                    .WithMany(p => p.Weeklyshifts)
                    .HasForeignKey(d => d.IdWorkday)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__WEEKLYSHI__ID_WO__7C4F7684");

                entity.HasOne(d => d.IdWorkshiftNavigation)
                    .WithMany(p => p.Weeklyshifts)
                    .HasForeignKey(d => d.IdWorkshift)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__WEEKLYSHI__ID_WO__7D439ABD");
            });

            modelBuilder.Entity<Workday>(entity =>
            {
                entity.HasKey(e => e.IdWorkday)
                    .HasName("PK__WORKDAY__D06DB5AD994528D6");

                entity.ToTable("WORKDAY");

                entity.Property(e => e.IdWorkday)
                    .ValueGeneratedOnAdd()
                    .HasColumnName("ID_WORKDAY");

                entity.Property(e => e.Weekday).HasColumnName("WEEKDAY");
            });

            modelBuilder.Entity<Workshift>(entity =>
            {
                entity.HasKey(e => e.IdWorkshift)
                    .HasName("PK__WORKSHIF__2A44EFDF064BFD50");

                entity.ToTable("WORKSHIFT");

                entity.Property(e => e.IdWorkshift)
                    .ValueGeneratedOnAdd()
                    .HasColumnName("ID_WORKSHIFT");

                entity.Property(e => e.Shift).HasColumnName("SHIFT");

                entity.Property(e => e.Shiftend).HasColumnName("SHIFTEND");

                entity.Property(e => e.Shifthour).HasColumnName("SHIFTHOUR");

                entity.Property(e => e.Shiftstart).HasColumnName("SHIFTSTART");
            });

            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }
}
