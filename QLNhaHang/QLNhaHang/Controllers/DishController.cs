using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLNhaHang.Models;

namespace QLNhaHang.Controllers
{
    public class DishController : Controller
    {
        private readonly QLNhaHangContext db;

        public DishController(QLNhaHangContext context)
        {
            db = context;
        }
        public IActionResult Index()
        {
            return View();
        }

        public async Task<IActionResult> DetailsPartial(int id)
        {
            var dish = await db.Dishes
                .Include(c => c.IdDishcategoryNavigation)
                .Include(d => d.Dishingredients)
                    .ThenInclude(di => di.IdInventoryitemNavigation)
                .FirstOrDefaultAsync(d => d.IdDish == id);

            if (dish == null)
                return NotFound();

            return PartialView("DetailPartial", dish);
        }

        public IActionResult EditPartial(int id)
        {
            if (id == 0)
                return PartialView("EditDishPartial", new Dish { IdDish = 0, Dishingredients = new List<Dishingredient>() });

            var dish = db.Dishes
                .Include(d => d.Dishingredients)
                .ThenInclude(di => di.IdInventoryitemNavigation)
                .FirstOrDefault(d => d.IdDish == id);

            return PartialView("EditDishPartial", dish);
        }

    }
}
