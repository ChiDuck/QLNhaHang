using Microsoft.AspNetCore.Mvc;

namespace QLNhaHang.Controllers.View
{
    public class AreaController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
