using Microsoft.EntityFrameworkCore;
using QLNhaHang.Models;

namespace QLNhaHang.Service
{
	public class AttendanceService
	{
		private readonly QLNhaHangContext _context;

		public AttendanceService(QLNhaHangContext context)
		{
			_context = context;
		}

		public async Task MarkAbsences()
		{
			var now = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow,
				TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time"));

			byte today = (byte)((int)now.DayOfWeek == 0 ? 8 : (int)now.DayOfWeek + 1);

			var endedShifts = await _context.Workshifts
				.Where(w => now.TimeOfDay > w.Shiftend)
				.Select(w => w.IdWorkshift)
				.ToListAsync();

			var missed = await _context.Weeklyshifts
				.Where(ws => ws.IdWorkday == today-1 &&
							 endedShifts.Contains(ws.IdWorkshift) &&
							 !ws.Attended &&
							 ws.Processed == false) // chỉ lấy ca chưa xử lý
				.ToListAsync();
			Console.WriteLine($"Missed shifts: {missed.Count}");
			var payroll = await _context.Payrolls
				.FirstOrDefaultAsync(p => p.Month == now.Month && p.Year == now.Year);
			Console.WriteLine("Payroll for this month: " + (payroll));
			foreach (var ws in missed)
			{
				ws.Processed = true; // đánh dấu đã xử lý

				if (payroll != null)
				{
					var detail = await _context.Payrolldetails
						.FirstOrDefaultAsync(p => p.IdPayroll == payroll.IdPayroll && p.IdStaff == ws.IdStaff);
					Console.WriteLine($"Processing staff {detail}");
					if (detail != null)
						Console.WriteLine("Detail found: " + detail.IdStaff);
					detail.Absencetimes += 1;
				}
			}

			await _context.SaveChangesAsync();
		}
	}

}
