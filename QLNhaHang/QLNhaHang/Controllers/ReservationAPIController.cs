using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLNhaHang.DTO;
using QLNhaHang.Models;

namespace QLNhaHang.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReservationAPIController : ControllerBase
    {
        private readonly QLNhaHangContext db;

        public ReservationAPIController(QLNhaHangContext context)
        {
            db = context;
        }

        // GET: api/Reservations
        //[HttpGet]
        //public async Task<ActionResult<IEnumerable<object>>> GetAllReservations()
        //{
        //    return await db.Reservations
        //        .Include(r => r.IdReservationstatusNavigation)
        //        .Include(r => r.IdDinetableNavigation)
        //        .Include(r => r.IdCustomerNavigation)
        //        .OrderByDescending(r => r.IdReservationstatus == 1)
        //        .ThenByDescending(r => r.Reservationdate)
        //        .ThenByDescending(r => r.Reservationtime)
        //        .Select(r => new
        //        {
        //            r.IdReservation,
        //            r.Phone,
        //            r.Email,
        //            r.Reservationdate,
        //            r.Reservationtime,
        //            r.Partysize,
        //            r.Note,
        //            r.IdReservationstatus,
        //            Status = r.IdReservationstatusNavigation.Name,
        //            CustomerName = r.IdCustomerNavigation != null ? r.IdCustomerNavigation.Name : "Khách vãng lai",
        //            TableName = r.IdDinetableNavigation != null ? r.IdDinetableNavigation.Name : "Chưa chọn bàn",
        //        })
        //        .ToListAsync();
        //}

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetAllActiveReservations()
        {
            return await db.Reservations
                .Where(r => r.IdReservationstatus == 2 || r.IdReservationstatus == 1)
                .Include(r => r.IdReservationstatusNavigation)
                .Include(r => r.IdDinetableNavigation)
                .Include(r => r.IdCustomerNavigation)
                .OrderBy(r => r.Reservationdate)
                .ThenBy(r => r.Reservationtime)
                .Select(r => new
                {
                    r.IdReservation,
                    r.Phone,
                    r.Email,
                    r.Reservationdate,
                    r.Reservationtime,
                    r.Partysize,
                    r.Note,
                    r.IdReservationstatus,
                    Status = r.IdReservationstatusNavigation.Name,
                    CustomerName = r.IdCustomerNavigation != null ? r.IdCustomerNavigation.Name : "Khách vãng lai",
                    TableName = r.IdDinetableNavigation != null ? r.IdDinetableNavigation.Name : "Chưa chọn bàn",
                })
                .ToListAsync();
        }

        // GET: api/Reservations/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ReservationDTO>> GetReservationDetail(int id)
        {
            var res = await db.Reservations
                .Include(r => r.IdCustomerNavigation)
                .Include(r => r.IdDinetableNavigation)
                .Include(r => r.IdReservationstatusNavigation)
                .Include(r => r.Reservationorders)
                    .ThenInclude(ro => ro.IdDishNavigation)
                .FirstOrDefaultAsync(r => r.IdReservation == id);

            if (res == null) return NotFound();

            var dto = new ReservationDTO
            {
                IdReservation = res.IdReservation,
                Phone = res.Phone,
                Email = res.Email,
                ReservationDate = res.Reservationdate,
                ReservationTime = res.Reservationtime,
                PartySize = res.Partysize,
                Note = res.Note,
                Status = res.IdReservationstatusNavigation?.Name,
                CustomerName = res.IdCustomerNavigation?.Name,
                TableName = res.IdDinetableNavigation?.Name,
                Orders = res.Reservationorders.Select(ro => new ReservationOrderDTO
                {
                    IdDish = ro.IdDish,
                    DishName = ro.IdDishNavigation?.Name ?? "",
                    DishPhoto = ro.IdDishNavigation?.Photo,
                    Quantity = ro.Quantity,
                    Total = ro.Total
                }).ToList()
            };

            return dto;
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] int newStatus)
        {
            var reservation = await db.Reservations.FindAsync(id);
            if (reservation == null) return NotFound();

            var status = await db.Reservationstatuses.FirstOrDefaultAsync(s => s.IdReservationstatus == newStatus);
            if (status == null) return BadRequest("Invalid status");

            reservation.IdReservationstatus = status.IdReservationstatus;
            await db.SaveChangesAsync();

            return Ok();
        }

        [HttpPost]
        public async Task<ActionResult<ReservationResultDto>> CreateReservation([FromBody] CreateReservationDto dto)
        {
            try
            {
                // Validate
                if (string.IsNullOrEmpty(dto.Phone))
                {
                    return BadRequest("Số điện thoại là bắt buộc");
                }

                // Tìm bàn trống thuộc loại đã chọn
                var reservationDate = DateTime.Parse(dto.ReservationDate);
                var reservationTime = TimeSpan.Parse(dto.ReservationTime);

                var startTime = reservationTime.Add(TimeSpan.FromHours(-1));
                var endTime = reservationTime.Add(TimeSpan.FromHours(1));

                // Lấy danh sách bàn đã đặt trong khung giờ này
                var bookedTableIds = await db.Reservations
                    .Where(r => r.Reservationdate == reservationDate &&
                               r.Reservationtime >= startTime &&
                               r.Reservationtime <= endTime &&
                               r.IdReservationstatus != 3 &&
                               r.IdReservationstatus != 5)
                    .Select(r => r.IdDinetable)
                    .ToListAsync();

                // Tìm 1 bàn trống thuộc loại đã chọn
                var availableTable = await db.Dinetables
                    .Where(t => t.IdTabletype == dto.TableTypeId &&
                               !bookedTableIds.Contains(t.IdDinetable))
                    .FirstOrDefaultAsync();

                if (availableTable == null)
                {
                    return BadRequest("Đã hết bàn loại này. Vui lòng chọn loại bàn khác.");
                }

                // Tạo reservation mới
                var reservation = new Reservation
                {
                    Phone = dto.Phone,
                    Email = dto.Email,
                    Reservationdate = reservationDate,
                    Reservationtime = reservationTime,
                    Partysize = (byte)dto.PartySize,
                    Note = dto.Note,
                    IdDinetable = availableTable.IdDinetable,
                    IdReservationstatus = 1, // 1 = Confirmed
                    IdCustomer = await GetOrCreateCustomer(dto)
                };

                db.Reservations.Add(reservation);
                await db.SaveChangesAsync();

                // Tạo mã đặt bàn
                var reservationCode = $"R{reservation.IdReservation.ToString().PadLeft(6, '0')}";

                return Ok(new ReservationResultDto
                {
                    ReservationId = reservation.IdReservation,
                    ReservationCode = reservationCode,
                    //  TableName = availableTable.Name
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        private async Task<int?> GetOrCreateCustomer(CreateReservationDto dto)
        {
            if (string.IsNullOrEmpty(dto.CustomerName)) return null;

            // Tìm khách hàng theo số điện thoại
            var customer = await db.Customers
                .FirstOrDefaultAsync(c => c.Phone == dto.Phone);

            if (customer == null)
            {
                // Tạo khách hàng mới
                customer = new Customer
                {
                    Name = dto.CustomerName,
                    Phone = dto.Phone,
                    Email = dto.Email,
                    PasswordHash = "temp" // Có thể tạo password ngẫu nhiên
                };

                db.Customers.Add(customer);
                await db.SaveChangesAsync();
            }

            return customer.IdCustomer;
        }

        // Cập nhật endpoint tạo reservation để xử lý món đi kèm
        [HttpPost]
        public async Task<IActionResult> CreateReservation([FromBody] ReservationWithDishesDto reservationDto)
        {
            // Tạo reservation như bình thường
            var reservation = new Reservation
            {
                // ... các thông tin reservation
            };

            db.Reservations.Add(reservation);
            await db.SaveChangesAsync();

            // Thêm các món đi kèm nếu có
            if (reservationDto.SelectedDishes != null && reservationDto.SelectedDishes.Any())
            {
                foreach (var dish in reservationDto.SelectedDishes)
                {
                    var reservationOrder = new Reservationorder
                    {
                        IdReservation = reservation.IdReservation,
                        IdDish = dish.IdDish,
                        Quantity = dish.Quantity,
                        Total = dish.Price * dish.Quantity
                    };

                    db.Reservationorders.Add(reservationOrder);
                }

                await db.SaveChangesAsync();
            }

            return Ok(new { reservationId = reservation.IdReservation });
        }
    }

    public class CreateReservationDto
    {
        public string Phone { get; set; }
        public string Email { get; set; }
        public string ReservationDate { get; set; }
        public string ReservationTime { get; set; }
        public int PartySize { get; set; }
        public string Note { get; set; }
        public int TableId { get; set; }
        public int TableTypeId { get; set; }
        public string CustomerName { get; set; }
    }

    public class ReservationResultDto
    {
        public int ReservationId { get; set; }
        public string ReservationCode { get; set; }
    }

    // DTO cho reservation kèm món
    public class ReservationWithDishesDto
    {
        // Các thông tin reservation
        // ...

        public List<SelectedDishDto> SelectedDishes { get; set; }
    }

    public class SelectedDishDto
    {
        public int IdDish { get; set; }
        public int Quantity { get; set; }
        public double Price { get; set; }
    }
}

