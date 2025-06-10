using Microsoft.AspNetCore.Mvc;

namespace QLNhaHang.Controllers
{
    public class AreaController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
