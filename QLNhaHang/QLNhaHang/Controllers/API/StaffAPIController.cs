using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using QLNhaHang.Models;

namespace QLNhaHang.Controllers.API
{
	[Route("api/[controller]")]
	[ApiController]
	public class StaffAPIController : ControllerBase
	{
		private readonly QLNhaHangContext db;

		public StaffAPIController(QLNhaHangContext context)
		{
			db = context;
		}

		// GET: api/Staff
		[HttpGet]
		public async Task<ActionResult<IEnumerable<object>>> GetStaffList()
		{
			return await db.Staff
				.Where(s => s.Isactive)
				.Select(s => new
				{
					s.IdStaff,
					s.Name,
					s.Phone,
					s.Email,
					s.Photo,
					StaffType = s.IdStafftypeNavigation != null ? s.IdStafftypeNavigation.Name : null
				})
				.ToListAsync();
		}

		[HttpGet("{id}")]
		public async Task<ActionResult<object>> GetStaff(int id)
		{
			var staff = await db.Staff
				.Include(s => s.IdStafftypeNavigation)
				.Where(s => s.IdStaff == id)
				.Select(s => new
				{
					s.IdStaff,
					s.Name,
					s.Citizenid,
					s.Phone,
					s.Email,
					s.Gender,
					s.Birthday,
					s.Photo,
					s.Address,
					s.Startdate,
					s.Hourlysalary,
					s.Isactive,
					s.IdStafftype,
					StaffType = s.IdStafftypeNavigation != null ? s.IdStafftypeNavigation.Name : null
				})
				.FirstOrDefaultAsync();

			if (staff == null)
			{
				return NotFound();
			}

			return staff;
		}

		[HttpGet("search")]
		public async Task<IActionResult> SearchStaff([FromQuery] string keyword)
		{
			if (string.IsNullOrWhiteSpace(keyword))
				return BadRequest("Từ khóa không hợp lệ.");

			var result = await db.Staff
				.Where(s =>
					s.Name.Contains(keyword) ||
					s.Phone.Contains(keyword) ||
					s.Email.Contains(keyword) ||
					s.Citizenid.Contains(keyword))
				.Select(s => new
				{
					s.IdStaff,
					s.Name,
					s.Citizenid,
					s.Phone,
					s.Email,
					s.Gender,
					s.Birthday,
					s.Photo,
					s.Address,
					s.Startdate,
					s.Hourlysalary,
					s.Isactive,
					s.IdStafftype,
					StaffType = s.IdStafftypeNavigation != null ? s.IdStafftypeNavigation.Name : null
				})
				.ToListAsync();

			return Ok(result);
		}

		// POST: api/Staff
		[HttpPost]
		public async Task<ActionResult<Staff>> CreateStaff([FromBody] Staff staff)
		{
			if (!ModelState.IsValid)
			{
				return BadRequest(ModelState);
			}

			staff.PasswordHash = BCrypt.Net.BCrypt.HashPassword(staff.PasswordHash);

			db.Staff.Add(staff);
			await db.SaveChangesAsync();

			return CreatedAtAction(nameof(GetStaff), new { id = staff.IdStaff }, staff);
		}

		[HttpPut("{id}")]
		public async Task<IActionResult> UpdateStaff(int id, [FromBody] Staff staff)
		{
			if (id != staff.IdStaff)
			{
				return BadRequest();
			}

			if (!staff.PasswordHash.IsNullOrEmpty())
				staff.PasswordHash = BCrypt.Net.BCrypt.HashPassword(staff.PasswordHash);
			else
			{
				// Giữ nguyên PasswordHash nếu không có thay đổi
				var existingStaff = await db.Staff.FindAsync(id);
				if (existingStaff == null)
				{
					return NotFound();
				}
				staff.PasswordHash = existingStaff.PasswordHash;
			}

			await db.SaveChangesAsync();

			return NoContent();
		}

		[HttpDelete("{id}")]
		public async Task<IActionResult> DeleteStaff(int id)
		{
			using var transaction = await db.Database.BeginTransactionAsync();
			try
			{
				var staff = await db.Staff.FindAsync(id);
				if (staff == null)
				{
					return NotFound();
				}

				// Kiểm tra các ràng buộc quan trọng (Importtickets và Payrolldetails)
				var hasCriticalRelatedData = await db.Payrolldetails.AnyAsync(p => p.IdStaff == id);

				if (hasCriticalRelatedData)
				{
					return BadRequest("Không thể xóa nhân viên vì có dữ liệu quan trọng liên quan (hóa đơn nhập hoặc bảng lương)");
				}

				if (staff.IdStafftype == 1)
				{
					return BadRequest("Không thể xóa quản lý.");
				}

				// Xóa tất cả Weeklyshifts liên quan
				var weeklyShifts = await db.Weeklyshifts
					.Where(w => w.IdStaff == id)
					.ToListAsync();

				db.Weeklyshifts.RemoveRange(weeklyShifts);

				// Xóa nhân viên
				db.Staff.Remove(staff);

				await db.SaveChangesAsync();
				await transaction.CommitAsync();

				return NoContent();
			}
			catch (Exception ex)
			{
				await transaction.RollbackAsync();
				return StatusCode(500, $"Đã xảy ra lỗi khi xóa nhân viên: {ex.Message}");
			}
		}

		[HttpGet("shift")]
		public async Task<IActionResult> GetStaff([FromQuery] string? exclude = "")
		{
			var excludedIds = exclude?.Split(',').Select(int.Parse).ToList() ?? new();
			var staff = await db.Staff
				.Where(s => !excludedIds.Contains(s.IdStaff))
				.Select(s => new { id = s.IdStaff, name = s.Name, type = s.IdStafftypeNavigation != null ? s.IdStafftypeNavigation.Name : null })
				.ToListAsync();

			return Ok(staff);
		}

	}

}
