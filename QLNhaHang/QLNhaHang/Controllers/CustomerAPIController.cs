using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLNhaHang.Models;

namespace QLNhaHang.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class CustomerAPIController : ControllerBase
	{
		private readonly QLNhaHangContext db;

		public CustomerAPIController(QLNhaHangContext db)
		{
			this.db = db;
		}

		[HttpGet]
		public async Task<IActionResult> GetAllCustomer()
		{
			var cus = await db.Customers.ToListAsync();
			return Ok(cus);
		}
	}
}
