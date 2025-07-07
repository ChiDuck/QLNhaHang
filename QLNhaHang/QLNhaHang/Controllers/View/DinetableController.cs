using Microsoft.AspNetCore.Mvc;

namespace QLNhaHang.Controllers.View
{
    public class DinetableController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
