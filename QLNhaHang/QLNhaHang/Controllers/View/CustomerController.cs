using Microsoft.AspNetCore.Mvc;

namespace QLNhaHang.Controllers.View
{
    public class CustomerController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
	}
}
