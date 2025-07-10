using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLNhaHang.Models;
using System.Security.Claims;

namespace QLNhaHang.Controllers.API
{
	[Route("api/[controller]")]
	[ApiController]
	public class CustomerAPIController : ControllerBase
	{
		private readonly QLNhaHangContext _context;

		public CustomerAPIController(QLNhaHangContext context)
		{
			this._context = context;
		}

		[HttpGet]
		public async Task<IActionResult> GetAllCustomers()
		{
			var cus = await _context.Customers.ToListAsync();
			return Ok(cus);
		}

		[HttpGet("search")]
		public async Task<IActionResult> SearchCustomers([FromQuery] string keyword)
		{
			if (string.IsNullOrWhiteSpace(keyword))
				return BadRequest("Từ khóa tìm kiếm không hợp lệ.");

			var result = await _context.Customers
				.Where(c =>
					c.Name.Contains(keyword) ||
					c.Phone.Contains(keyword) ||
					c.Email.Contains(keyword))
				.ToListAsync();

			return Ok(result);
		}

		[HttpDelete("{id}")]
		public async Task<IActionResult> DeleteCustomer(int id)
		{
			var customer = await _context.Customers
				.Include(c => c.Cart)
				.ThenInclude(cart => cart.Cartdetails)
				.FirstOrDefaultAsync(c => c.IdCustomer == id);

			if (customer == null)
			{
				return NotFound(new { message = "Customer not found." });
			}

			// 1. Gán null cho các Reservation của người dùng
			var reservations = await _context.Reservations
				.Where(r => r.IdCustomer == id)
				.ToListAsync();

			foreach (var r in reservations)
			{
				r.IdCustomer = null;
			}

			// 2. Gán null cho các Shiporder liên kết với cart của customer (nếu có cart)
			if (customer.Cart != null)
			{
				var orders = await _context.Shiporders
					.Where(o => o.IdCart == customer.Cart.IdCart)
					.ToListAsync();

				foreach (var o in orders)
				{
					o.IdCart = null;
				}

				// 3. Xóa Cartdetail của Cart
				_context.Cartdetails.RemoveRange(customer.Cart.Cartdetails);

				// 4. Xóa Cart
				_context.Carts.Remove(customer.Cart);
			}

			// 5. Xóa Customer
			_context.Customers.Remove(customer);

			await _context.SaveChangesAsync();

			return Ok(new { message = "Customer deleted successfully." });
		}

		[Authorize]
		[HttpGet("profile")]
		public async Task<IActionResult> GetProfile()
		{
			int id = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
			var customer = await _context.Customers
				.Where(c => c.IdCustomer == id)
				.Select(c => new
				{
					c.Name,
					c.Email,
					c.Phone,
					c.Birthday,
					c.Address
				}).FirstOrDefaultAsync();

			if (customer == null) return NotFound();

			return Ok(customer);
		}

		[Authorize]
		[HttpPut("profile")]
		public async Task<IActionResult> UpdateProfile([FromBody] CustomerUpdateDto dto)
		{
			int id = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
			var customer = await _context.Customers.FindAsync(id);
			if (customer == null) return NotFound();

			customer.Name = dto.Name;
			customer.Email = dto.Email;
			customer.Phone = dto.Phone;
			customer.Birthday = dto.Birthday;
			customer.Address = dto.Address;

			await _context.SaveChangesAsync();
			return Ok();
		}

		public class CustomerUpdateDto
		{
			public string Name { get; set; } = null!;
			public string? Phone { get; set; }
			public string? Email { get; set; }
			public DateTime? Birthday { get; set; }
			public string? Address { get; set; }
		}

		[HttpGet("reservations")]
		[Authorize]
		public async Task<IActionResult> GetReservations()
		{
			int id = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
			var reservations = await _context.Reservations
				.Where(r => r.IdCustomer == id)
				.Select(r => new
				{
					tableName = r.IdDinetableNavigation.Name,
					date = r.Reservationdate.ToString("dd/MM/yyyy"),
					time = r.Reservationtime.ToString(@"hh\:mm"),
					partySize = r.Partysize
				}).ToListAsync();
			return Ok(reservations);
		}

		[Authorize]
		[HttpGet("orders")]
		public async Task<IActionResult> GetOrders()
		{
			int idCustomer = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

			var orders = await _context.Shiporders
				.Where(o => o.IdCart != null && o.IdCartNavigation.IdCustomer == idCustomer)
				.Select(o => new
				{
					id = o.IdShiporder,
					date = o.Orderdate.ToString("dd/MM/yyyy"),
					total = o.Orderprice,
					isShipping = o.Isshipping
				}).ToListAsync();

			return Ok(orders);
		}

		[Authorize]
		[HttpPost("changepassword")]
		public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
		{
			if (string.IsNullOrWhiteSpace(dto.CurrentPassword) || string.IsNullOrWhiteSpace(dto.NewPassword))
				return BadRequest("Thiếu thông tin.");

			var id = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
			var customer = await _context.Customers.FindAsync(id);
			if (customer == null)
				return Unauthorized("Không tìm thấy người dùng.");

			if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, customer.PasswordHash))
				return Unauthorized("Mật khẩu hiện tại không đúng.");

			customer.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
			await _context.SaveChangesAsync();

			return Ok("Mật khẩu đã được thay đổi.");
		}
	}

	public class ChangePasswordDto
	{
		public string CurrentPassword { get; set; } = null!;
		public string NewPassword { get; set; } = null!;
	}
}
