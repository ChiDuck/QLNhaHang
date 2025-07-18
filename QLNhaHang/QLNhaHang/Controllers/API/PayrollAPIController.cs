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
		.Select(p => new { id = p.IdPayroll, p.Month, p.Year, EmployeeCount = p.Payrolldetails.Count })
		.OrderByDescending(p => p.Year).ThenByDescending(p => p.Month)
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

		[HttpGet("{idPayroll}/{idStaff}")]
		public async Task<IActionResult> GetDetail(int idPayroll, int idStaff)
		{
			var pd = await _context.Payrolldetails
				.FirstOrDefaultAsync(p => p.IdPayroll == idPayroll && p.IdStaff == idStaff);

			if (pd == null) return NotFound();

			return Ok(new
			{
				pd.IdStaff,
				pd.IdPayroll,
				pd.Days,
				pd.Hours,
				pd.Absencetimes,
				pd.Latetimes,
				pd.Subtract,
				pd.Bonus,
				pd.Totalsalary,
				pd.Note
			});
		}

		[HttpPut("update")]
		public async Task<IActionResult> UpdateDetail([FromBody] Payrolldetail dto)
		{
			var pd = await _context.Payrolldetails
				.FirstOrDefaultAsync(p => p.IdPayroll == dto.IdPayroll && p.IdStaff == dto.IdStaff);
			if (pd == null) return NotFound();

			pd.Days = dto.Days;
			pd.Hours = dto.Hours;
			pd.Absencetimes = dto.Absencetimes;
			pd.Latetimes = dto.Latetimes;
			pd.Subtract = dto.Subtract;
			pd.Bonus = dto.Bonus;
			pd.Totalsalary = dto.Totalsalary;
			pd.Note = dto.Note;

			await _context.SaveChangesAsync();
			return Ok();
		}

	}

}
