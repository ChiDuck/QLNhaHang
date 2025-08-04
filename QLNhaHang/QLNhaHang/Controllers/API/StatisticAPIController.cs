using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLNhaHang.Models;

namespace QLNhaHang.Controllers.API
{
	[Route("api/[controller]")]
	[ApiController]
	public class StatisticAPIController : ControllerBase
	{
		private readonly QLNhaHangContext _context;

		public StatisticAPIController(QLNhaHangContext context)
		{
			_context = context;
		}

		[HttpGet("best-today")]
		public async Task<IActionResult> BestSellerToday()
		{
			string name = "";
			var count = 0;
			foreach (var item in await _context.Dishes.ToListAsync())
			{
				int r = 0;
				var todayre = _context.Reservations.Where(r => r.Reservationdate.Day == DateTime.Now.Day && r.Reservationdate.Month == DateTime.Now.Month).ToList();
				var todayor = _context.Shiporders.Where(r => r.Orderdate.Day == DateTime.Now.Day && r.Orderdate.Month == DateTime.Now.Month).ToList();

				foreach (var q in todayre)
				{
					var re = _context.Reservationorders.Where(r => r.IdDish == item.IdDish && q.IdReservation == r.IdReservation).ToList();
					foreach (var q2 in re)
					{
						r += q2.Quantity;
					}
				}
				foreach (var q in todayor)
				{
					var re = _context.Orderitems.Where(r => r.IdDish == item.IdDish && q.IdShiporder == r.IdShiporder).ToList();
					foreach (var q2 in re)
					{
						r += q2.Quantity;
					}
				}
				if (count < r)
				{
					count = r;
					name = item.Name;
				}
			}
			return Ok(new { name, count });
		}

		[HttpGet("reservation-today")]
		public async Task<IActionResult> ReservationToday()
		{
			var todayReservations = await _context.Reservations
				.Where(r => r.Bookdate.Date == DateTime.Now.Date)
				.ToListAsync();
			return Ok(new { todayReservations.Count });
		}

		[HttpGet("shiporder-today")]
		public async Task<IActionResult> ShipOrderToday()
		{
			var todayShipOrders = await _context.Shiporders
				.Where(r => r.Orderdate.Date == DateTime.Now.Date)
				.ToListAsync();
			return Ok(new { todayShipOrders.Count });
		}

		[HttpGet("revenue-today")]
		public IActionResult RevenueToday()
		{
			var today = DateTime.Now.Date;

			var shipRevenue = _context.Shiporders
				.Where(o => o.Orderdate.Date == today && ((o.IdOrderstatus >= 3 && o.Transactionid != null) || (o.Transactionid == null && o.IdOrderstatus == 5)) )
				.Sum(o => (double?)o.Orderprice) ?? 0;

			var reservationRevenue = _context.Reservations
				.Where(r => r.Bookdate.Date == today && (r.IdReservationstatus == 2 || r.IdReservationstatus == 4))
				.Sum(r => (double?)r.Reservationprice) ?? 0;

			var total = shipRevenue + reservationRevenue;

			return Ok(new
			{
				shipRevenue,
				reservationRevenue,
				total
			});
		}

		[HttpGet("revenue/week")]
		public IActionResult RevenueWeek()
		{
			var startOfWeek = DateTime.Now.Date.AddDays(-(int)DateTime.Now.DayOfWeek + 1); // Thứ 2
			var result = Enumerable.Range(0, 7).Select(i =>
			{
				var day = startOfWeek.AddDays(i);
				var shipTotal = _context.Shiporders
					.Where(o => o.Orderdate.Date == day && ((o.IdOrderstatus >= 3 && o.Transactionid != null) || (o.Transactionid == null && o.IdOrderstatus == 5)))
					.Sum(o => (double?)o.Orderprice) ?? 0;

				var reservationTotal = _context.Reservations
					.Where(r => r.Bookdate.Date == day && (r.IdReservationstatus == 2 || r.IdReservationstatus == 4))
					.Sum(r => (double?)r.Reservationprice) ?? 0;

				return new
				{
					Label = day.ToString("ddd dd/MM"),
					Value = shipTotal + reservationTotal
				};
			}).ToList();

			return Ok(new
			{
				labels = result.Select(r => r.Label),
				values = result.Select(r => r.Value)
			});
		}

		[HttpGet("revenue/month")]
		public IActionResult RevenueMonth()
		{
			var now = DateTime.Now;
			var daysInMonth = DateTime.DaysInMonth(now.Year, now.Month);

			var result = Enumerable.Range(1, daysInMonth).Select(d =>
			{
				var date = new DateTime(now.Year, now.Month, d);

				var shipTotal = _context.Shiporders
					.Where(o => o.Orderdate.Date == date && ((o.IdOrderstatus >= 3 && o.Transactionid != null) || (o.Transactionid == null && o.IdOrderstatus == 5)))
					.Sum(o => (double?)o.Orderprice) ?? 0;

				var reservationTotal = _context.Reservations
					.Where(r => r.Bookdate.Date == date && (r.IdReservationstatus == 2 || r.IdReservationstatus == 4))
					.Sum(r => (double?)r.Reservationprice) ?? 0;

				return new
				{
					Label = $"Ngày {d}",
					Value = shipTotal + reservationTotal
				};
			}).ToList();

			return Ok(new
			{
				labels = result.Select(r => r.Label),
				values = result.Select(r => r.Value)
			});
		}

		[HttpGet("revenue/year")]
		public IActionResult RevenueYear()
		{
			var year = DateTime.Now.Year;

			var result = Enumerable.Range(1, 12).Select(m =>
			{
				var shipTotal = _context.Shiporders
					.Where(o => o.Orderdate.Year == year && o.Orderdate.Month == m && ((o.IdOrderstatus >= 3 && o.Transactionid != null) || (o.Transactionid == null && o.IdOrderstatus == 5)))
					.Sum(o => (double?)o.Orderprice) ?? 0;

				var reservationTotal = _context.Reservations
					.Where(r => r.Bookdate.Year == year && r.Bookdate.Month == m && (r.IdReservationstatus == 2 || r.IdReservationstatus == 4))
					.Sum(r => (double?)r.Reservationprice) ?? 0;

				return new
				{
					Label = $"Tháng {m}",
					Value = shipTotal + reservationTotal
				};
			}).ToList();

			return Ok(new
			{
				labels = result.Select(r => r.Label),
				values = result.Select(r => r.Value)
			});
		}

		[HttpGet("top-dishes")]
		public IActionResult GetTopDishes([FromQuery] string period)
		{
			var now = DateTime.Now;
			DateTime startDate;

			switch (period.ToLower())
			{
				case "day":
					startDate = now.Date;
					break;
				case "week":
					int diff = (7 + (now.DayOfWeek - DayOfWeek.Monday)) % 7;
					startDate = now.AddDays(-1 * diff).Date;
					break;
				case "month":
					startDate = new DateTime(now.Year, now.Month, 1);
					break;
				default:
					return BadRequest("Invalid period");
			}

			// Query món ăn trong đơn giao hàng
			var shipItems = _context.Orderitems
				.Where(oi => oi.IdShiporderNavigation.Orderdate >= startDate && oi.IdShiporderNavigation.IdOrderstatus >= 3)
				.GroupBy(oi => oi.IdDishNavigation.Name)
				.Select(g => new {
					Dish = g.Key,
					Quantity = g.Sum(oi => oi.Quantity)
				});

			// Query món ăn trong đơn đặt bàn
			var resItems = _context.Reservationorders
				.Where(ro => ro.IdReservationNavigation.Reservationdate >= startDate 
				&& (ro.IdReservationNavigation.IdReservationstatus == 2 || ro.IdReservationNavigation.IdReservationstatus == 4))
				.GroupBy(ro => ro.IdDishNavigation.Name)
				.Select(g => new {
					Dish = g.Key,
					Quantity = g.Sum(ro => ro.Quantity)
				});

			// Gộp 2 kết quả
			var combined = shipItems.Concat(resItems)
				.GroupBy(x => x.Dish)
				.Select(g => new {
					Dish = g.Key,
					Quantity = g.Sum(x => x.Quantity)
				})
				.OrderByDescending(x => x.Quantity)
				.Take(5)
				.ToList();

			return Ok(combined);
		}
	}
}
