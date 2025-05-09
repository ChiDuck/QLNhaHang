using Microsoft.AspNetCore.Mvc;

namespace QLNhaHang.Controllers
{
	public class CustomerController : Controller
	{
		public IActionResult Index()
		{
			return View();
		}
	}
}
