using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLNhaHang.Models;

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
				.Where(w => w.Isassigned)
				.Select(w => new
				{
					idWorkday = w.IdWorkday,
					idWorkshift = w.IdWorkshift,
					name = w.IdStaffNavigation.Name,
				}).ToListAsync();

			return Ok(data);
		}

		[HttpGet("{day}/{shift}")]
		public async Task<IActionResult> GetShiftDetail(byte day, byte shift)
		{
			var staff = await _context.Weeklyshifts
				.Where(w => w.IdWorkday == day-1 && w.IdWorkshift == shift && w.Isassigned)
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
			// Tìm workday và workshift
			//var workday = await _context.Workdays.FindAsync(day);
			//var workshift = await _context.Workshifts.FindAsync(shift);

			//// Tính ngày tương ứng trong tuần gần nhất (tính từ thứ hiện tại)
			//int currentWeekday = (int)now.DayOfWeek; // Chủ nhật = 0
			//int targetWeekday = workday.Weekday == 8 ? 0 : workday.Weekday; // Chủ nhật = 8 => 0

			//var daysToTarget = (targetWeekday - currentWeekday + 7) % 7;
			//var shiftDate = now.Date.AddDays(daysToTarget);

			//var shiftStartDateTime = shiftDate + workshift.Shiftstart; // DateTime
			//var shiftEndDateTime = shiftDate + workshift.Shiftend;

			string shiftStatus;
			//if (now < shiftStartDateTime)
			//	shiftStatus = "future";
			//else if (now >= shiftStartDateTime && now < shiftEndDateTime)
			//	shiftStatus = "ongoing";
			//else
			//	shiftStatus = "past";

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
						Isassigned = true
					});
				}
				else
				{
					exist.Isassigned = true;
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
