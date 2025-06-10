using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLNhaHang.Models;

namespace QLNhaHang.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DishAPIController : ControllerBase
    {
        private readonly QLNhaHangContext db = new QLNhaHangContext();

        public DishAPIController(QLNhaHangContext db)
        {
            this.db = db;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetAll()
        {
            var dishes = await db.Dishes
                .Include(d => d.IdDishcategoryNavigation)
                .Select(d => new
                {
                    d.IdDish,
                    d.Name,
                    d.Price,
                    d.Discount,
                    d.Issoldout,
                    d.Photo,
                    d.Description,
                    DishcategoryName = d.IdDishcategoryNavigation.Name
                })
                .ToListAsync();

            return Ok(dishes);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetDish(int id)
        {
            var item = await db.Dishes
                .Where(i => i.IdDish == id)
                .Select(i => new
                {
                    i.IdDish,
                    i.IdDishcategory
                })
                .FirstOrDefaultAsync();

            if (item == null)
                return NotFound();

            return Ok(item);
        }

        [HttpPost]
        public async Task<IActionResult> CreateDish([FromBody] Dish dish)
        {
            // Gán lại IdDish = 0 để EF hiểu là tạo mới
            dish.IdDish = 0;

            // Đảm bảo không gán cả Inventoryitem navigation
            foreach (var ingredient in dish.Dishingredients)
            {
                ingredient.IdDish = 0; // sẽ được gán sau khi dish được tạo
                ingredient.IdInventoryitemNavigation = null;
            }

            db.Dishes.Add(dish);
            await db.SaveChangesAsync();

            return Ok(new { success = true, id = dish.IdDish });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var dish = await db.Dishes.FindAsync(id);
            if (dish == null)
                return NotFound();

            var usedIngredients = await db.Dishingredients
                .AnyAsync(di => di.IdDish == id);
            if (usedIngredients)
                db.Dishingredients.RemoveRange(
                    db.Dishingredients.Where(di => di.IdDish == id)
                );

            db.Dishes.Remove(dish);
            await db.SaveChangesAsync();

            return NoContent();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDish(int id, [FromBody] Dish updatedDish)
        {
            if (id != updatedDish.IdDish)
                return BadRequest("ID không khớp");

            var existingDish = await db.Dishes
                .Include(d => d.Dishingredients)
                .FirstOrDefaultAsync(d => d.IdDish == id);

            if (existingDish == null)
                return NotFound();

            // Cập nhật thông tin món
            existingDish.Name = updatedDish.Name;
            existingDish.Issoldout = updatedDish.Issoldout;
            existingDish.Discount = updatedDish.Discount;
            existingDish.Price = updatedDish.Price;
            existingDish.Description = updatedDish.Description;
            existingDish.Photo = updatedDish.Photo;
            existingDish.IdDishcategory = updatedDish.IdDishcategory;

            // Xoá toàn bộ nguyên liệu cũ
            db.Dishingredients.RemoveRange(existingDish.Dishingredients);

            // Thêm nguyên liệu mới
            if (updatedDish.Dishingredients != null)
            {
                foreach (var ing in updatedDish.Dishingredients)
                {
                    existingDish.Dishingredients.Add(new Dishingredient
                    {
                        IdDish = id,
                        IdInventoryitem = ing.IdInventoryitem,
                        Amount = ing.Amount
                    });
                }
            }

            try
            {
                await db.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Lỗi khi cập nhật món ăn: " + ex.Message);
            }
        }

    }
}
