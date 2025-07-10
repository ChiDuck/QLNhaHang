using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLNhaHang.DTO;
using QLNhaHang.Libraries;
using QLNhaHang.Models;
using System.Security.Claims;

namespace QLNhaHang.Controllers.API
{
	[Route("api/[controller]")]
	[ApiController]
	public class ReservationAPIController : ControllerBase
	{
		private readonly QLNhaHangContext db;
		private readonly IConfiguration _config;

		public ReservationAPIController(QLNhaHangContext context, IConfiguration config)
		{
			db = context;
			_config = config;
		}

		 //GET: api/Reservations
		[HttpGet]
		public async Task<ActionResult<IEnumerable<object>>> GetAllReservations()
		{
		    return await db.Reservations
		        .Include(r => r.IdReservationstatusNavigation)
		        .Include(r => r.IdDinetableNavigation)
		        .Include(r => r.IdCustomerNavigation)
		        .OrderByDescending(r => r.IdReservationstatus == 1)
		        .ThenByDescending(r => r.Reservationdate)
		        .ThenByDescending(r => r.Reservationtime)
		        .Select(r => new
		        {
		            r.IdReservation,
					r.Bookdate,
					r.Phone,
		            r.Email,
		            r.Reservationdate,
		            r.Reservationtime,
		            r.Partysize,
					r.Reservationprice,
					r.Note,
					r.Transactionid,
					r.IdReservationstatus,
		            Status = r.IdReservationstatusNavigation.Name,
		            CustomerName = r.IdCustomerNavigation != null ? r.IdCustomerNavigation.Name : "Khách vãng lai",
		            TableName = r.IdDinetableNavigation != null ? r.IdDinetableNavigation.Name : "Chưa chọn bàn",
		        })
		        .ToListAsync();
		}

		//[HttpGet]
		//public async Task<ActionResult<IEnumerable<object>>> GetAllActiveReservations()
		//{
		//	return await _context.Reservations
		//		.Where(r => r.IdReservationstatus == 2 || r.IdReservationstatus == 1)
		//		.Include(r => r.IdReservationstatusNavigation)
		//		.Include(r => r.IdDinetableNavigation)
		//		.Include(r => r.IdCustomerNavigation)
		//		.OrderBy(r => r.Reservationdate)
		//		.ThenBy(r => r.Reservationtime)
		//		.Select(r => new
		//		{
		//			r.IdReservation,
		//			r.Phone,
		//			r.Email,
		//			r.Reservationdate,
		//			r.Reservationtime,
		//			r.Partysize,
		//			r.Note,
		//			r.IdReservationstatus,
		//			Status = r.IdReservationstatusNavigation.Name,
		//			CustomerName = r.IdCustomerNavigation != null ? r.IdCustomerNavigation.Name : "Khách vãng lai",
		//			TableName = r.IdDinetableNavigation != null ? r.IdDinetableNavigation.Name : "Chưa chọn bàn",
		//		})
		//		.ToListAsync();
		//}

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
				Bookdate = res.Bookdate,
				Phone = res.Phone,
				Email = res.Email,
				Reservationdate = res.Reservationdate,
				Reservationtime = res.Reservationtime,
				Partysize = res.Partysize,
				Reservationprice = res.Reservationprice,
				Note = res.Note,
				Transactionid = res.Transactionid,
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

		[HttpGet("search")]
		public async Task<IActionResult> SearchReservations([FromQuery] string keyword)
		{
			if (string.IsNullOrWhiteSpace(keyword))
				return BadRequest("Từ khóa không hợp lệ.");

			var result = await db.Reservations
				.Where(r => r.Phone.Contains(keyword) || r.Email.Contains(keyword))
				.Select(r => new
				{
					r.IdReservation,
					r.Bookdate,
					r.Phone,
					r.Email,
					r.Reservationdate,
					r.Reservationtime,
					r.Partysize,
					r.Reservationprice,
					r.Note,
					r.Transactionid,
					r.IdReservationstatus,
					Status = r.IdReservationstatusNavigation.Name,
					CustomerName = r.IdCustomerNavigation != null ? r.IdCustomerNavigation.Name : "Khách vãng lai",
					TableName = r.IdDinetableNavigation != null ? r.IdDinetableNavigation.Name : "Chưa chọn bàn",
				})
				.OrderByDescending(r => r.Reservationdate)
				.ThenByDescending(r => r.Reservationtime)
				.ToListAsync();

			return Ok(result);
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

		[HttpPost("noorder")]
		public async Task<ActionResult<ReservationResultDto>> CreateReservation([FromBody] CreateReservationDto dto)
		{
			try
			{
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

				var idClaim = User.FindFirst(ClaimTypes.NameIdentifier);
				int? idCustomer = null;

				if (idClaim != null)
				{
					idCustomer = int.Parse(idClaim.Value);
				}

				// Tạo reservation mới
				var reservation = new Reservation
				{
					Bookdate = DateTime.Now,
					Phone = dto.Phone,
					Email = dto.Email,
					Reservationdate = reservationDate,
					Reservationtime = reservationTime,
					Partysize = (byte)dto.PartySize,
					Reservationprice = 0,
					Note = dto.Note,
					IdDinetable = availableTable.IdDinetable,
					IdReservationstatus = 1,
					IdCustomer = idCustomer
				};
				//Console.WriteLine(reservation);
				db.Reservations.Add(reservation);
				await db.SaveChangesAsync();

				// Thêm các món đi kèm nếu có
				if (dto.SelectedDishes != null && dto.SelectedDishes.Any())
				{
					foreach (var dish in dto.SelectedDishes)
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

				// Tạo mã đặt bàn
				//var reservationCode = $"R{reservation.IdReservation.ToString().PadLeft(6, '0')}";

				return Ok(new ReservationResultDto
				{
					ReservationId = reservation.IdReservation,
					//ReservationCode = reservationCode,
					//  TableName = availableTable.Name
				});
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"Internal server error: {ex.Message}");
			}
		}


		[HttpPost("vnpay")]
		public async Task<IActionResult> CreateVNPayReservation([FromBody] CreateReservationDto dto)
		{
			if (dto.SelectedDishes.Count == 0)
				return BadRequest("Invalid payment method");

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

			var transactionId = "PENDING_" + Guid.NewGuid().ToString();

			var idClaim = User.FindFirst(ClaimTypes.NameIdentifier);
			int? idCustomer = null;

			if (idClaim != null)
			{
				idCustomer = int.Parse(idClaim.Value);
			}

			// Tạo reservation mới
			var reservation = new Reservation
			{
				Bookdate = DateTime.Now,
				Phone = dto.Phone,
				Email = dto.Email,
				Reservationdate = reservationDate,
				Reservationtime = reservationTime,
				Partysize = (byte)dto.PartySize,
				Reservationprice = dto.ReservationPrice,
				Note = dto.Note,
				Transactionid = transactionId,
				IdDinetable = availableTable.IdDinetable,
				IdCustomer = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value)
			};
			//Console.WriteLine(reservation);
			db.Reservations.Add(reservation);
			await db.SaveChangesAsync();

			// Thêm các món đi kèm nếu có
			if (dto.SelectedDishes != null && dto.SelectedDishes.Any())
			{
				foreach (var dish in dto.SelectedDishes)
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

			// Tạo URL thanh toán VNPay (query string)
			var pay = new VnPayLibrary();
			pay.AddRequestData("vnp_Version", "2.1.0");
			pay.AddRequestData("vnp_Command", "pay");
			pay.AddRequestData("vnp_TmnCode", _config["VNPay:TmnCode"]);
			pay.AddRequestData("vnp_Amount", ((int)(dto.ReservationPrice * 100)).ToString());
			pay.AddRequestData("vnp_CreateDate", DateTime.Now.ToString("yyyyMMddHHmmss"));
			pay.AddRequestData("vnp_CurrCode", "VND");
			pay.AddRequestData("vnp_IpAddr", "127.0.0.1");
			pay.AddRequestData("vnp_Locale", "vn");
			pay.AddRequestData("vnp_OrderInfo", "Thanh toán đơn đặt bàn");
			pay.AddRequestData("vnp_OrderType", "booking");
			pay.AddRequestData("vnp_ReturnUrl", _config["VNPay:ReturnUrl"]);
			pay.AddRequestData("vnp_TxnRef", transactionId);

			var paymentUrl = pay.CreateRequestUrl(_config["Vnpay:BaseUrl"], _config["Vnpay:HashSecret"]);

			// Trả về transactionId để lưu tạm ở client, khi callback sẽ gửi lại
			return Ok(new
			{
				paymentUrl,
				transactionId,
				bookData = dto // client cần gửi lại khi callback
			});
		}
	}

	public class CreateReservationDto
	{
		public string Phone { get; set; }
		public string Email { get; set; }
		public string ReservationDate { get; set; }
		public string ReservationTime { get; set; }
		public int PartySize { get; set; }
		public double? ReservationPrice { get; set; }
		public string Note { get; set; }
		public int TableId { get; set; }
		public int TableTypeId { get; set; }
		public string CustomerName { get; set; }
		public List<SelectedDishDto> SelectedDishes { get; set; }
	}

	public class ReservationResultDto
	{
		public int ReservationId { get; set; }
		public string ReservationCode { get; set; }
	}

	public class SelectedDishDto
	{
		public int IdDish { get; set; }
		public int Quantity { get; set; }
		public double Price { get; set; }
	}
}

