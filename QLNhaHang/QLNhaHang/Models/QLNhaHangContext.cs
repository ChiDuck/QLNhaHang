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

        public virtual DbSet<AggregatedCounter> AggregatedCounters { get; set; } = null!;
        public virtual DbSet<Area> Areas { get; set; } = null!;
        public virtual DbSet<Cart> Carts { get; set; } = null!;
        public virtual DbSet<Cartdetail> Cartdetails { get; set; } = null!;
        public virtual DbSet<Counter> Counters { get; set; } = null!;
        public virtual DbSet<Customer> Customers { get; set; } = null!;
        public virtual DbSet<Dinetable> Dinetables { get; set; } = null!;
        public virtual DbSet<Dish> Dishes { get; set; } = null!;
        public virtual DbSet<Dishcategory> Dishcategories { get; set; } = null!;
        public virtual DbSet<Dishingredient> Dishingredients { get; set; } = null!;
        public virtual DbSet<Hash> Hashes { get; set; } = null!;
        public virtual DbSet<Importticket> Importtickets { get; set; } = null!;
        public virtual DbSet<Importticketdetail> Importticketdetails { get; set; } = null!;
        public virtual DbSet<Inventoryitem> Inventoryitems { get; set; } = null!;
        public virtual DbSet<Inventoryitemtype> Inventoryitemtypes { get; set; } = null!;
        public virtual DbSet<Job> Jobs { get; set; } = null!;
        public virtual DbSet<JobParameter> JobParameters { get; set; } = null!;
        public virtual DbSet<JobQueue> JobQueues { get; set; } = null!;
        public virtual DbSet<List> Lists { get; set; } = null!;
        public virtual DbSet<Orderitem> Orderitems { get; set; } = null!;
        public virtual DbSet<Orderstatus> Orderstatuses { get; set; } = null!;
        public virtual DbSet<Payment> Payments { get; set; } = null!;
        public virtual DbSet<Payroll> Payrolls { get; set; } = null!;
        public virtual DbSet<Payrolldetail> Payrolldetails { get; set; } = null!;
        public virtual DbSet<Reservation> Reservations { get; set; } = null!;
        public virtual DbSet<Reservationorder> Reservationorders { get; set; } = null!;
        public virtual DbSet<Reservationstatus> Reservationstatuses { get; set; } = null!;
        public virtual DbSet<Schema> Schemas { get; set; } = null!;
        public virtual DbSet<Server> Servers { get; set; } = null!;
        public virtual DbSet<Set> Sets { get; set; } = null!;
        public virtual DbSet<Shiporder> Shiporders { get; set; } = null!;
        public virtual DbSet<Staff> Staff { get; set; } = null!;
        public virtual DbSet<Stafftype> Stafftypes { get; set; } = null!;
        public virtual DbSet<State> States { get; set; } = null!;
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
            modelBuilder.Entity<AggregatedCounter>(entity =>
            {
                entity.HasKey(e => e.Key)
                    .HasName("PK_HangFire_CounterAggregated");

                entity.ToTable("AggregatedCounter", "HangFire");

                entity.HasIndex(e => e.ExpireAt, "IX_HangFire_AggregatedCounter_ExpireAt")
                    .HasFilter("([ExpireAt] IS NOT NULL)");

                entity.Property(e => e.Key).HasMaxLength(100);

                entity.Property(e => e.ExpireAt).HasColumnType("datetime");
            });

            modelBuilder.Entity<Area>(entity =>
            {
                entity.HasKey(e => e.IdArea)
                    .HasName("PK__AREA__6E15A1AADDEE0A3E");

                entity.ToTable("AREA");

                entity.Property(e => e.IdArea).HasColumnName("ID_AREA");

                entity.Property(e => e.Name)
                    .HasMaxLength(35)
                    .HasColumnName("NAME");
            });

            modelBuilder.Entity<Cart>(entity =>
            {
                entity.HasKey(e => e.IdCart)
                    .HasName("PK__CART__7A1680A5997A6AE5");

                entity.ToTable("CART");

                entity.HasIndex(e => e.IdCustomer, "UQ__CART__7F6B0B8B0B0903DD")
                    .IsUnique();

                entity.Property(e => e.IdCart).HasColumnName("ID_CART");

                entity.Property(e => e.IdCustomer).HasColumnName("ID_CUSTOMER");

                entity.Property(e => e.Totalprice).HasColumnName("TOTALPRICE");

                entity.HasOne(d => d.IdCustomerNavigation)
                    .WithOne(p => p.Cart)
                    .HasForeignKey<Cart>(d => d.IdCustomer)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__CART__ID_CUSTOME__6383C8BA");
            });

            modelBuilder.Entity<Cartdetail>(entity =>
            {
                entity.HasKey(e => new { e.IdCart, e.IdDish })
                    .HasName("PK__CARTDETA__0FD2583526CE770F");

                entity.ToTable("CARTDETAIL");

                entity.Property(e => e.IdCart).HasColumnName("ID_CART");

                entity.Property(e => e.IdDish).HasColumnName("ID_DISH");

                entity.Property(e => e.Quantity).HasColumnName("QUANTITY");

                entity.Property(e => e.Subtotal).HasColumnName("SUBTOTAL");

                entity.HasOne(d => d.IdCartNavigation)
                    .WithMany(p => p.Cartdetails)
                    .HasForeignKey(d => d.IdCart)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__CARTDETAI__ID_CA__66603565");

                entity.HasOne(d => d.IdDishNavigation)
                    .WithMany(p => p.Cartdetails)
                    .HasForeignKey(d => d.IdDish)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__CARTDETAI__ID_DI__6754599E");
            });

            modelBuilder.Entity<Counter>(entity =>
            {
                entity.HasKey(e => new { e.Key, e.Id })
                    .HasName("PK_HangFire_Counter");

                entity.ToTable("Counter", "HangFire");

                entity.Property(e => e.Key).HasMaxLength(100);

                entity.Property(e => e.Id).ValueGeneratedOnAdd();

                entity.Property(e => e.ExpireAt).HasColumnType("datetime");
            });

            modelBuilder.Entity<Customer>(entity =>
            {
                entity.HasKey(e => e.IdCustomer)
                    .HasName("PK__CUSTOMER__7F6B0B8AD85B5674");

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

                entity.Property(e => e.IdPayment).HasColumnName("ID_PAYMENT");

                entity.Property(e => e.Name)
                    .HasMaxLength(30)
                    .HasColumnName("NAME");

                entity.Property(e => e.PasswordHash)
                    .HasMaxLength(150)
                    .IsUnicode(false)
                    .HasColumnName("PASSWORD_HASH");

                entity.Property(e => e.Phone)
                    .HasMaxLength(13)
                    .IsUnicode(false)
                    .HasColumnName("PHONE");

                entity.Property(e => e.Photo)
                    .IsUnicode(false)
                    .HasColumnName("PHOTO");

                entity.HasOne(d => d.IdPaymentNavigation)
                    .WithMany(p => p.Customers)
                    .HasForeignKey(d => d.IdPayment)
                    .HasConstraintName("FK__CUSTOMER__ID_PAY__398D8EEE");
            });

            modelBuilder.Entity<Dinetable>(entity =>
            {
                entity.HasKey(e => e.IdDinetable)
                    .HasName("PK__DINETABL__9C6E10991D657DC7");

                entity.ToTable("DINETABLE");

                entity.HasIndex(e => e.Name, "UQ__DINETABL__D9C1FA00E9DC64E9")
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
                    .HasConstraintName("FK__DINETABLE__ID_AR__4316F928");

                entity.HasOne(d => d.IdTabletypeNavigation)
                    .WithMany(p => p.Dinetables)
                    .HasForeignKey(d => d.IdTabletype)
                    .HasConstraintName("FK__DINETABLE__ID_TA__4222D4EF");
            });

            modelBuilder.Entity<Dish>(entity =>
            {
                entity.HasKey(e => e.IdDish)
                    .HasName("PK__DISH__5C4D89060197FD85");

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
                    .HasConstraintName("FK__DISH__ID_DISHCAT__5070F446");
            });

            modelBuilder.Entity<Dishcategory>(entity =>
            {
                entity.HasKey(e => e.IdDishcategory)
                    .HasName("PK__DISHCATE__F7727DD883BC2EBD");

                entity.ToTable("DISHCATEGORY");

                entity.Property(e => e.IdDishcategory).HasColumnName("ID_DISHCATEGORY");

                entity.Property(e => e.Name)
                    .HasMaxLength(50)
                    .HasColumnName("NAME");
            });

            modelBuilder.Entity<Dishingredient>(entity =>
            {
                entity.HasKey(e => new { e.IdInventoryitem, e.IdDish })
                    .HasName("PK__DISHINGR__CF955B20272C11F1");

                entity.ToTable("DISHINGREDIENT");

                entity.Property(e => e.IdInventoryitem).HasColumnName("ID_INVENTORYITEM");

                entity.Property(e => e.IdDish).HasColumnName("ID_DISH");

                entity.Property(e => e.Amount).HasColumnName("AMOUNT");

                entity.HasOne(d => d.IdDishNavigation)
                    .WithMany(p => p.Dishingredients)
                    .HasForeignKey(d => d.IdDish)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__DISHINGRE__ID_DI__5812160E");

                entity.HasOne(d => d.IdInventoryitemNavigation)
                    .WithMany(p => p.Dishingredients)
                    .HasForeignKey(d => d.IdInventoryitem)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__DISHINGRE__ID_IN__59063A47");
            });

            modelBuilder.Entity<Hash>(entity =>
            {
                entity.HasKey(e => new { e.Key, e.Field })
                    .HasName("PK_HangFire_Hash");

                entity.ToTable("Hash", "HangFire");

                entity.HasIndex(e => e.ExpireAt, "IX_HangFire_Hash_ExpireAt")
                    .HasFilter("([ExpireAt] IS NOT NULL)");

                entity.Property(e => e.Key).HasMaxLength(100);

                entity.Property(e => e.Field).HasMaxLength(100);
            });

            modelBuilder.Entity<Importticket>(entity =>
            {
                entity.HasKey(e => e.IdImportticket)
                    .HasName("PK__IMPORTTI__6DDBAD97E5FF08D5");

                entity.ToTable("IMPORTTICKET");

                entity.Property(e => e.IdImportticket).HasColumnName("ID_IMPORTTICKET");

                entity.Property(e => e.Createdate)
                    .HasColumnType("datetime")
                    .HasColumnName("CREATEDATE");

                entity.Property(e => e.IdStaff).HasColumnName("ID_STAFF");

                entity.Property(e => e.Totalfee).HasColumnName("TOTALFEE");

                entity.Property(e => e.Vat).HasColumnName("VAT");

                entity.HasOne(d => d.IdStaffNavigation)
                    .WithMany(p => p.Importtickets)
                    .HasForeignKey(d => d.IdStaff)
                    .HasConstraintName("FK__IMPORTTIC__ID_ST__0A9D95DB");
            });

            modelBuilder.Entity<Importticketdetail>(entity =>
            {
                entity.HasKey(e => new { e.IdInventoryitem, e.IdImportticket })
                    .HasName("PK__IMPORTTI__DC8C396939F31227");

                entity.ToTable("IMPORTTICKETDETAIL");

                entity.Property(e => e.IdInventoryitem).HasColumnName("ID_INVENTORYITEM");

                entity.Property(e => e.IdImportticket).HasColumnName("ID_IMPORTTICKET");

                entity.Property(e => e.Amount).HasColumnName("AMOUNT");

                entity.Property(e => e.Subtotal).HasColumnName("SUBTOTAL");

                entity.HasOne(d => d.IdImportticketNavigation)
                    .WithMany(p => p.Importticketdetails)
                    .HasForeignKey(d => d.IdImportticket)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__IMPORTTIC__ID_IM__0E6E26BF");

                entity.HasOne(d => d.IdInventoryitemNavigation)
                    .WithMany(p => p.Importticketdetails)
                    .HasForeignKey(d => d.IdInventoryitem)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__IMPORTTIC__ID_IN__0D7A0286");
            });

            modelBuilder.Entity<Inventoryitem>(entity =>
            {
                entity.HasKey(e => e.IdInventoryitem)
                    .HasName("PK__INVENTOR__BA5183B0F6F42AAA");

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
                    .HasConstraintName("FK__INVENTORY__ID_IN__5535A963");
            });

            modelBuilder.Entity<Inventoryitemtype>(entity =>
            {
                entity.HasKey(e => e.IdInventoryitemtype)
                    .HasName("PK__INVENTOR__06C9E7EB66FDB51D");

                entity.ToTable("INVENTORYITEMTYPE");

                entity.Property(e => e.IdInventoryitemtype).HasColumnName("ID_INVENTORYITEMTYPE");

                entity.Property(e => e.Name)
                    .HasMaxLength(35)
                    .HasColumnName("NAME");
            });

            modelBuilder.Entity<Job>(entity =>
            {
                entity.ToTable("Job", "HangFire");

                entity.HasIndex(e => e.ExpireAt, "IX_HangFire_Job_ExpireAt")
                    .HasFilter("([ExpireAt] IS NOT NULL)");

                entity.HasIndex(e => e.StateName, "IX_HangFire_Job_StateName")
                    .HasFilter("([StateName] IS NOT NULL)");

                entity.Property(e => e.CreatedAt).HasColumnType("datetime");

                entity.Property(e => e.ExpireAt).HasColumnType("datetime");

                entity.Property(e => e.StateName).HasMaxLength(20);
            });

            modelBuilder.Entity<JobParameter>(entity =>
            {
                entity.HasKey(e => new { e.JobId, e.Name })
                    .HasName("PK_HangFire_JobParameter");

                entity.ToTable("JobParameter", "HangFire");

                entity.Property(e => e.Name).HasMaxLength(40);

                entity.HasOne(d => d.Job)
                    .WithMany(p => p.JobParameters)
                    .HasForeignKey(d => d.JobId)
                    .HasConstraintName("FK_HangFire_JobParameter_Job");
            });

            modelBuilder.Entity<JobQueue>(entity =>
            {
                entity.HasKey(e => new { e.Queue, e.Id })
                    .HasName("PK_HangFire_JobQueue");

                entity.ToTable("JobQueue", "HangFire");

                entity.Property(e => e.Queue).HasMaxLength(50);

                entity.Property(e => e.Id).ValueGeneratedOnAdd();

                entity.Property(e => e.FetchedAt).HasColumnType("datetime");
            });

            modelBuilder.Entity<List>(entity =>
            {
                entity.HasKey(e => new { e.Key, e.Id })
                    .HasName("PK_HangFire_List");

                entity.ToTable("List", "HangFire");

                entity.HasIndex(e => e.ExpireAt, "IX_HangFire_List_ExpireAt")
                    .HasFilter("([ExpireAt] IS NOT NULL)");

                entity.Property(e => e.Key).HasMaxLength(100);

                entity.Property(e => e.Id).ValueGeneratedOnAdd();

                entity.Property(e => e.ExpireAt).HasColumnType("datetime");
            });

            modelBuilder.Entity<Orderitem>(entity =>
            {
                entity.HasKey(e => new { e.IdShiporder, e.IdDish })
                    .HasName("PK__ORDERITE__FC77A3C61EC87CF9");

                entity.ToTable("ORDERITEM");

                entity.Property(e => e.IdShiporder).HasColumnName("ID_SHIPORDER");

                entity.Property(e => e.IdDish).HasColumnName("ID_DISH");

                entity.Property(e => e.Quantity).HasColumnName("QUANTITY");

                entity.Property(e => e.Subtotal).HasColumnName("SUBTOTAL");

                entity.HasOne(d => d.IdDishNavigation)
                    .WithMany(p => p.Orderitems)
                    .HasForeignKey(d => d.IdDish)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__ORDERITEM__ID_DI__70DDC3D8");

                entity.HasOne(d => d.IdShiporderNavigation)
                    .WithMany(p => p.Orderitems)
                    .HasForeignKey(d => d.IdShiporder)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__ORDERITEM__ID_SH__6FE99F9F");
            });

            modelBuilder.Entity<Orderstatus>(entity =>
            {
                entity.HasKey(e => e.IdOrderstatus)
                    .HasName("PK__ORDERSTA__9CAE67D9E09F255F");

                entity.ToTable("ORDERSTATUS");

                entity.Property(e => e.IdOrderstatus).HasColumnName("ID_ORDERSTATUS");

                entity.Property(e => e.Name)
                    .HasMaxLength(35)
                    .HasColumnName("NAME");
            });

            modelBuilder.Entity<Payment>(entity =>
            {
                entity.HasKey(e => e.IdPayment)
                    .HasName("PK__PAYMENT__1EFCED2BAE6105F5");

                entity.ToTable("PAYMENT");

                entity.Property(e => e.IdPayment).HasColumnName("ID_PAYMENT");

                entity.Property(e => e.Cardnumber)
                    .HasMaxLength(15)
                    .IsUnicode(false)
                    .HasColumnName("CARDNUMBER")
                    .IsFixedLength();

                entity.Property(e => e.Cvc).HasColumnName("CVC");

                entity.Property(e => e.Expirydate)
                    .HasColumnType("date")
                    .HasColumnName("EXPIRYDATE");
            });

            modelBuilder.Entity<Payroll>(entity =>
            {
                entity.HasKey(e => e.IdPayroll)
                    .HasName("PK__PAYROLL__73C8C769E1ADBF0D");

                entity.ToTable("PAYROLL");

                entity.Property(e => e.IdPayroll).HasColumnName("ID_PAYROLL");

                entity.Property(e => e.Month).HasColumnName("MONTH");

                entity.Property(e => e.Year).HasColumnName("YEAR");
            });

            modelBuilder.Entity<Payrolldetail>(entity =>
            {
                entity.HasKey(e => new { e.IdStaff, e.IdPayroll })
                    .HasName("PK__PAYROLLD__60652F07125A4A58");

                entity.ToTable("PAYROLLDETAIL");

                entity.Property(e => e.IdStaff).HasColumnName("ID_STAFF");

                entity.Property(e => e.IdPayroll).HasColumnName("ID_PAYROLL");

                entity.Property(e => e.Absencetimes).HasColumnName("ABSENCETIMES");

                entity.Property(e => e.Bonus).HasColumnName("BONUS");

                entity.Property(e => e.Days).HasColumnName("DAYS");

                entity.Property(e => e.Hours).HasColumnName("HOURS");

                entity.Property(e => e.Latetimes).HasColumnName("LATETIMES");

                entity.Property(e => e.Note)
                    .HasMaxLength(100)
                    .HasColumnName("NOTE");

                entity.Property(e => e.Subtract).HasColumnName("SUBTRACT");

                entity.Property(e => e.Totalsalary).HasColumnName("TOTALSALARY");

                entity.HasOne(d => d.IdPayrollNavigation)
                    .WithMany(p => p.Payrolldetails)
                    .HasForeignKey(d => d.IdPayroll)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__PAYROLLDE__ID_PA__07C12930");

                entity.HasOne(d => d.IdStaffNavigation)
                    .WithMany(p => p.Payrolldetails)
                    .HasForeignKey(d => d.IdStaff)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__PAYROLLDE__ID_ST__06CD04F7");
            });

            modelBuilder.Entity<Reservation>(entity =>
            {
                entity.HasKey(e => e.IdReservation)
                    .HasName("PK__RESERVAT__3CB7398B05AD8E83");

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
                    .HasConstraintName("FK__RESERVATI__ID_CU__48CFD27E");

                entity.HasOne(d => d.IdDinetableNavigation)
                    .WithMany(p => p.Reservations)
                    .HasForeignKey(d => d.IdDinetable)
                    .HasConstraintName("FK__RESERVATI__ID_DI__49C3F6B7");

                entity.HasOne(d => d.IdReservationstatusNavigation)
                    .WithMany(p => p.Reservations)
                    .HasForeignKey(d => d.IdReservationstatus)
                    .HasConstraintName("FK__RESERVATI__ID_RE__47DBAE45");
            });

            modelBuilder.Entity<Reservationorder>(entity =>
            {
                entity.HasKey(e => new { e.IdReservation, e.IdDish })
                    .HasName("PK__RESERVAT__4973E11B0B99DFC4");

                entity.ToTable("RESERVATIONORDER");

                entity.Property(e => e.IdReservation).HasColumnName("ID_RESERVATION");

                entity.Property(e => e.IdDish).HasColumnName("ID_DISH");

                entity.Property(e => e.Quantity).HasColumnName("QUANTITY");

                entity.Property(e => e.Total).HasColumnName("TOTAL");

                entity.HasOne(d => d.IdDishNavigation)
                    .WithMany(p => p.Reservationorders)
                    .HasForeignKey(d => d.IdDish)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__RESERVATI__ID_DI__5CD6CB2B");

                entity.HasOne(d => d.IdReservationNavigation)
                    .WithMany(p => p.Reservationorders)
                    .HasForeignKey(d => d.IdReservation)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__RESERVATI__ID_RE__5BE2A6F2");
            });

            modelBuilder.Entity<Reservationstatus>(entity =>
            {
                entity.HasKey(e => e.IdReservationstatus)
                    .HasName("PK__RESERVAT__4B5D56B1A5B5C360");

                entity.ToTable("RESERVATIONSTATUS");

                entity.Property(e => e.IdReservationstatus).HasColumnName("ID_RESERVATIONSTATUS");

                entity.Property(e => e.Name)
                    .HasMaxLength(35)
                    .HasColumnName("NAME");
            });

            modelBuilder.Entity<Schema>(entity =>
            {
                entity.HasKey(e => e.Version)
                    .HasName("PK_HangFire_Schema");

                entity.ToTable("Schema", "HangFire");

                entity.Property(e => e.Version).ValueGeneratedNever();
            });

            modelBuilder.Entity<Server>(entity =>
            {
                entity.ToTable("Server", "HangFire");

                entity.HasIndex(e => e.LastHeartbeat, "IX_HangFire_Server_LastHeartbeat");

                entity.Property(e => e.Id).HasMaxLength(200);

                entity.Property(e => e.LastHeartbeat).HasColumnType("datetime");
            });

            modelBuilder.Entity<Set>(entity =>
            {
                entity.HasKey(e => new { e.Key, e.Value })
                    .HasName("PK_HangFire_Set");

                entity.ToTable("Set", "HangFire");

                entity.HasIndex(e => e.ExpireAt, "IX_HangFire_Set_ExpireAt")
                    .HasFilter("([ExpireAt] IS NOT NULL)");

                entity.HasIndex(e => new { e.Key, e.Score }, "IX_HangFire_Set_Score");

                entity.Property(e => e.Key).HasMaxLength(100);

                entity.Property(e => e.Value).HasMaxLength(256);

                entity.Property(e => e.ExpireAt).HasColumnType("datetime");
            });

            modelBuilder.Entity<Shiporder>(entity =>
            {
                entity.HasKey(e => e.IdShiporder)
                    .HasName("PK__SHIPORDE__89B37B5679D9C5EB");

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

                entity.Property(e => e.IdPayment).HasColumnName("ID_PAYMENT");

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
                    .IsUnicode(false)
                    .HasColumnName("SHIPADDRESS");

                entity.Property(e => e.Shipfee).HasColumnName("SHIPFEE");

                entity.Property(e => e.Transactionid)
                    .HasMaxLength(100)
                    .IsUnicode(false)
                    .HasColumnName("TRANSACTIONID");

                entity.HasOne(d => d.IdCartNavigation)
                    .WithMany(p => p.Shiporders)
                    .HasForeignKey(d => d.IdCart)
                    .HasConstraintName("FK__SHIPORDER__ID_CA__6B24EA82");

                entity.HasOne(d => d.IdOrderstatusNavigation)
                    .WithMany(p => p.Shiporders)
                    .HasForeignKey(d => d.IdOrderstatus)
                    .HasConstraintName("FK__SHIPORDER__ID_OR__6A30C649");

                entity.HasOne(d => d.IdPaymentNavigation)
                    .WithMany(p => p.Shiporders)
                    .HasForeignKey(d => d.IdPayment)
                    .HasConstraintName("FK__SHIPORDER__ID_PA__6C190EBB");
            });

            modelBuilder.Entity<Staff>(entity =>
            {
                entity.HasKey(e => e.IdStaff)
                    .HasName("PK__STAFF__E759A37160691124");

                entity.ToTable("STAFF");

                entity.HasIndex(e => e.Citizenid, "UQ__STAFF__1FD9B732042ECD66")
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
                    .HasConstraintName("FK__STAFF__ID_STAFFT__76969D2E");
            });

            modelBuilder.Entity<Stafftype>(entity =>
            {
                entity.HasKey(e => e.IdStafftype)
                    .HasName("PK__STAFFTYP__702D805BF67EC973");

                entity.ToTable("STAFFTYPE");

                entity.Property(e => e.IdStafftype).HasColumnName("ID_STAFFTYPE");

                entity.Property(e => e.Name)
                    .HasMaxLength(35)
                    .HasColumnName("NAME");
            });

            modelBuilder.Entity<State>(entity =>
            {
                entity.HasKey(e => new { e.JobId, e.Id })
                    .HasName("PK_HangFire_State");

                entity.ToTable("State", "HangFire");

                entity.HasIndex(e => e.CreatedAt, "IX_HangFire_State_CreatedAt");

                entity.Property(e => e.Id).ValueGeneratedOnAdd();

                entity.Property(e => e.CreatedAt).HasColumnType("datetime");

                entity.Property(e => e.Name).HasMaxLength(20);

                entity.Property(e => e.Reason).HasMaxLength(100);

                entity.HasOne(d => d.Job)
                    .WithMany(p => p.States)
                    .HasForeignKey(d => d.JobId)
                    .HasConstraintName("FK_HangFire_State_Job");
            });

            modelBuilder.Entity<Tabletype>(entity =>
            {
                entity.HasKey(e => e.IdTabletype)
                    .HasName("PK__TABLETYP__A1F1FC574DAF2F6A");

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
                    .HasName("PK__WEEKLYSH__97A56D267CD06EAB");

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
                    .HasConstraintName("FK__WEEKLYSHI__ID_ST__7D439ABD");

                entity.HasOne(d => d.IdWorkdayNavigation)
                    .WithMany(p => p.Weeklyshifts)
                    .HasForeignKey(d => d.IdWorkday)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__WEEKLYSHI__ID_WO__7E37BEF6");

                entity.HasOne(d => d.IdWorkshiftNavigation)
                    .WithMany(p => p.Weeklyshifts)
                    .HasForeignKey(d => d.IdWorkshift)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__WEEKLYSHI__ID_WO__7F2BE32F");
            });

            modelBuilder.Entity<Workday>(entity =>
            {
                entity.HasKey(e => e.IdWorkday)
                    .HasName("PK__WORKDAY__D06DB5ADB7E6CB4F");

                entity.ToTable("WORKDAY");

                entity.Property(e => e.IdWorkday)
                    .ValueGeneratedOnAdd()
                    .HasColumnName("ID_WORKDAY");

                entity.Property(e => e.Weekday).HasColumnName("WEEKDAY");
            });

            modelBuilder.Entity<Workshift>(entity =>
            {
                entity.HasKey(e => e.IdWorkshift)
                    .HasName("PK__WORKSHIF__2A44EFDF8CF659FC");

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
