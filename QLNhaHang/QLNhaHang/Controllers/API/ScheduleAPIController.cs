using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using QLNhaHang.Models;
using System.Security.Claims;

namespace QLNhaHang.Controllers.API
{
	[Route("api/[controller]")]
	[ApiController]
	public class ScheduleAPIController : ControllerBase
	{
		private readonly QLNhaHangContext _context;

		public ScheduleAPIController(QLNhaHangContext context)
		{
			_context = context;
		}

		[HttpGet]
		public async Task<IActionResult> GetWeeklySchedule()
		{
			var data = await _context.Weeklyshifts
				.Include(w => w.IdStaffNavigation)
				.Select(w => new
				{
					idWorkday = w.IdWorkday,
					idWorkshift = w.IdWorkshift,
					idStaff = w.IdStaff,
					name = w.IdStaffNavigation.Name,
				}).ToListAsync();

			return Ok(data);
		}

		[HttpGet("{day}/{shift}")]
		public async Task<IActionResult> GetShiftDetail(byte day, byte shift)
		{
			var staff = await _context.Weeklyshifts
				.Where(w => w.IdWorkday == day-1 && w.IdWorkshift == shift)
				.Include(w => w.IdStaffNavigation)
				.Select(w => new
				{
					id = w.IdStaff,
					name = w.IdStaffNavigation.Name,
					type = w.IdStaffNavigation.IdStafftypeNavigation.Name,
					attended = w.Attended,
					islate = w.Islate
				}).ToListAsync();

			var now = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow,
						 TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time"));

			string shiftStatus;
			var workshift = await _context.Workshifts.FindAsync(shift);

			if ((day < (int)now.DayOfWeek+1) || (day == (int)now.DayOfWeek+1 && workshift.Shiftend < now.TimeOfDay))
			{
				shiftStatus = "past";
			}	
			else if (day == (int)now.DayOfWeek + 1 && now.TimeOfDay >= workshift.Shiftstart && now.TimeOfDay < workshift.Shiftend)
			{
				shiftStatus = "ongoing";
			}
			else
			{
				shiftStatus = "future";
			}

			return Ok(new
			{
				shiftName = shift switch { 1 => "Sáng", 2 => "Trưa", 3 => "Tối", _ => "??" },
				dayName = day switch
				{
					2 => "Thứ 2",
					3 => "Thứ 3",
					4 => "Thứ 4",
					5 => "Thứ 5",
					6 => "Thứ 6",
					7 => "Thứ 7",
					8 => "Chủ nhật",
					_ => "?"
				},
				staff,
				shiftStatus,
				now,
				workshift.Shiftstart,
				workshift.Shiftend,
				now.DayOfWeek,
				now.TimeOfDay
			});
		}

		[HttpPost("{day}/{shift}")]
		public async Task<IActionResult> AddStaffToShift(byte day, byte shift, [FromBody] List<int> staffIds)
		{
			foreach (var id in staffIds)
			{
				var exist = await _context.Weeklyshifts
					.FirstOrDefaultAsync(w =>
						w.IdStaff == id &&
						w.IdWorkday == day-1 &&
						w.IdWorkshift == shift);

				if (exist == null)
				{
					_context.Weeklyshifts.Add(new Weeklyshift
					{
						IdStaff = id,
						IdWorkday = (byte)(day - 1),
						IdWorkshift = shift,
					});
				}
			}

			await _context.SaveChangesAsync();
			return Ok();
		}

		[HttpDelete("{day}/{shift}/{staffId}")]
		public async Task<IActionResult> RemoveStaffFromShift(byte day, byte shift, int staffId)
		{
			var ws = await _context.Weeklyshifts.FirstOrDefaultAsync(w => w.IdStaff == staffId && w.IdWorkday == (day-1) && w.IdWorkshift == shift);
			if (ws != null)
			{
				_context.Weeklyshifts.Remove(ws);
				await _context.SaveChangesAsync();
			}

			return Ok();
		}

		[HttpPatch("{day}/{shift}/attendance")]
		public async Task<IActionResult> UpdateAttendance(byte day, byte shift, [FromBody] AttendanceDto dto)
		{
			var ws = await _context.Weeklyshifts.FirstOrDefaultAsync(w =>
				w.IdWorkday == day-1 && w.IdWorkshift == shift && w.IdStaff == dto.IdStaff);

			if (ws == null) return NotFound();

			ws.Attended = dto.Attended;
			await _context.SaveChangesAsync();
			return Ok();
		}

		[HttpPatch("{day}/{shift}/late")]
		public async Task<IActionResult> UpdateLate(byte day, byte shift, [FromBody] LateDto dto)
		{
			var ws = await _context.Weeklyshifts.FirstOrDefaultAsync(w =>
				w.IdWorkday == day-1 && w.IdWorkshift == shift && w.IdStaff == dto.IdStaff);

			if (ws == null) return NotFound();

			ws.Islate = dto.Islate;
			await _context.SaveChangesAsync();
			return Ok();
		}

		[Authorize]
		[HttpPost("checkin")]
		public async Task<IActionResult> Checkin()
		{
			var staffId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
			var now = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow,
				TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time"));

			var day = (byte)(((int)now.DayOfWeek + 6) % 7 + 1); // Thứ 2 = 2 ... CN = 8
			var currentShift = await _context.Workshifts
				.FirstOrDefaultAsync(s => now.TimeOfDay >= s.Shiftstart && now.TimeOfDay <= s.Shiftend);

			if (currentShift == null)
				return BadRequest("Không có ca làm hiện tại.");

			var shift = await _context.Weeklyshifts
				.FirstOrDefaultAsync(w => w.IdStaff == staffId && w.IdWorkday == day && w.IdWorkshift == currentShift.IdWorkshift);

			if (shift == null)
				return NotFound("Bạn không có ca làm hôm nay.");

			if (shift.Attended == true)
				return BadRequest("Bạn đã chấm công rồi.");

			shift.Attended = true;
			if (now.TimeOfDay > currentShift.Shiftstart.Add(TimeSpan.FromMinutes(10)))
				shift.Islate = true;

			// Cập nhật bảng lương
			var month = (short)now.Month;
			var year = (short)now.Year;
			var payroll = await _context.Payrolls.FirstOrDefaultAsync(p => p.Month == month && p.Year == year);
			if (payroll == null)
			{
				payroll = new Payroll { Month = month, Year = year };
				_context.Payrolls.Add(payroll);
				await _context.SaveChangesAsync();
			}

			var detail = await _context.Payrolldetails.FirstOrDefaultAsync(p => p.IdPayroll == payroll.IdPayroll && p.IdStaff == staffId);
			if (detail == null)
			{
				detail = new Payrolldetail { IdPayroll = payroll.IdPayroll, IdStaff = staffId };
				_context.Payrolldetails.Add(detail);
			}

			detail.Days++;
			detail.Hours += currentShift.Shifthour;
			if (shift.Islate == true)
			{
				detail.Latetimes++;
			}

			detail.Totalsalary = detail.Hours * (_context.Staff.First(s => s.IdStaff == staffId).Hourlysalary ?? 0) - detail.Subtract + detail.Bonus;

			await _context.SaveChangesAsync();
			return Ok("Chấm công thành công.");
		}

	}

	public class AttendanceDto
	{
		public int IdStaff { get; set; }
		public bool Attended { get; set; }
	}

	public class LateDto
	{
		public int IdStaff { get; set; }
		public bool Islate { get; set; }
	}

}
