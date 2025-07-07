using Microsoft.AspNetCore.Mvc;

namespace QLNhaHang.Controllers.View
{
    public class StaffController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
