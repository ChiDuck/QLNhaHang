using Microsoft.AspNetCore.Mvc;

namespace QLNhaHang.Controllers.View
{
	public class PayrollController : Controller
	{
		public IActionResult Index()
		{
			return View();
		}

		public IActionResult Detail(int id)
		{
			ViewBag.Id = id;
			return View();
		}
	}
}
