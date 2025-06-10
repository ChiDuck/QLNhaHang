using Microsoft.AspNetCore.Mvc;

namespace QLNhaHang.Controllers
{
    public class InventoryitemController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
