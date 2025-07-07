using Microsoft.AspNetCore.Mvc;

namespace QLNhaHang.Controllers.View
{
    public class InventoryitemController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
