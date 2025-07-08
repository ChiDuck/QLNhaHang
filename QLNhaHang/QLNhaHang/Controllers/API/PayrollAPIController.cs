using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLNhaHang.Models;

namespace QLNhaHang.Controllers.API
{
	[Route("api/[controller]")]
	[ApiController]
	public class PayrollAPIController : ControllerBase
	{
		private readonly QLNhaHangContext _context;

		public PayrollAPIController(QLNhaHangContext context)
		{
			_context = context;
		}

		[HttpGet]
		public async Task<IActionResult> GetPayrolls() => Ok(await _context.Payrolls
		.Select(p => new { id = p.IdPayroll, p.Month, p.Year })
		.ToListAsync());

		[HttpGet("{id}")]
		public async Task<IActionResult> GetPayrollDetail(int id)
		{
			var payroll = await _context.Payrolls
				.Include(p => p.Payrolldetails)
				.ThenInclude(d => d.IdStaffNavigation)
				.ThenInclude(s => s.IdStafftypeNavigation)
				.FirstOrDefaultAsync(p => p.IdPayroll == id);

			if (payroll == null) return NotFound();

			return Ok(new
			{
				payroll.Month,
				payroll.Year,
				details = payroll.Payrolldetails.Select(d => new {
					id = d.IdStaff,
					name = d.IdStaffNavigation.Name,
					type = d.IdStaffNavigation.IdStafftypeNavigation?.Name ?? ""
				})
			});
		}

		[HttpGet("{id}/staff/{staffId}")]
		public async Task<IActionResult> GetStaffPayrollDetail(int id, int staffId)
		{
			var detail = await _context.Payrolldetails
				.Include(p => p.IdStaffNavigation)
				.FirstOrDefaultAsync(p => p.IdPayroll == id && p.IdStaff == staffId);

			if (detail == null) return NotFound();

			return Ok(new
			{
				name = detail.IdStaffNavigation.Name,
				hours = detail.Hours,
				absences = detail.Absencetimes,
				lates = detail.Latetimes,
				totalsalary = detail.Totalsalary
			});
		}

	}

}
