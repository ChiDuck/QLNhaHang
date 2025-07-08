using Microsoft.AspNetCore.Mvc;

namespace QLNhaHang.Controllers.View
{
	public class ScheduleController : Controller
	{
		public IActionResult Index()
		{
			return View();
		}
	}
}
