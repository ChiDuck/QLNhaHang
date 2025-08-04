using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLNhaHang.Models;

namespace QLNhaHang.Controllers.API
{
    [Route("api/[controller]")]
    [ApiController]
    public class InventoryitemAPIController : ControllerBase
    {
        private readonly QLNhaHangContext db = new QLNhaHangContext();

        public InventoryitemAPIController(QLNhaHangContext db)
        {
            this.db = db;
        }

        // 1️⃣ GET: api/Inventoryitem (tùy chọn nếu muốn lấy toàn bộ)
        [HttpGet]
        public async Task<IActionResult> GetAllInventoryitems()
        {
            var items = await db.Inventoryitems
                .Include(i => i.IdInventoryitemtypeNavigation)
                .Select(i => new
                {
                    i.IdInventoryitem,
                    i.Name,
                    i.Unit,
                    i.Amount,
                    i.IdInventoryitemtype,
                    InventoryitemtypeName = i.IdInventoryitemtypeNavigation.Name
                })
				.OrderBy(i => i.Name)
				.ToListAsync();
            return Ok(items);
        }

		[HttpGet("search")]
		public async Task<IActionResult> SearchInventoryItems([FromQuery] string keyword)
		{
			if (string.IsNullOrWhiteSpace(keyword))
				return BadRequest("Từ khóa không hợp lệ.");

			var result = await db.Inventoryitems
				.Where(i => i.Name.Contains(keyword))
				.Select(i => new
				{
					i.IdInventoryitem,
					i.Name,
					i.Unit,
					i.Amount,
					i.IdInventoryitemtype,
					InventoryitemtypeName = i.IdInventoryitemtypeNavigation.Name
				})
				.OrderBy(i => i.Name)
				.ToListAsync();

			return Ok(result);
		}

		[HttpGet("{id}")]
        public async Task<IActionResult> GetInventoryItem(int id)
        {
            var item = await db.Inventoryitems
                .Where(i => i.IdInventoryitem == id)
                .Select(i => new
                {
                    i.IdInventoryitem,
                    i.Name,
                    i.Unit,
                    i.Amount,
                    i.IdInventoryitemtype
                })
                .FirstOrDefaultAsync();

            if (item == null)
                return NotFound();

            return Ok(item);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateInventoryItem(int id, [FromBody] Inventoryitem updatedItem)
        {
            if (id != updatedItem.IdInventoryitem)
                return BadRequest("ID không khớp");

			if (db.Inventoryitems.Any(i => i.Name == updatedItem.Name && i.IdInventoryitem != id))
			{
				return Conflict("Nguyên liệu đã tồn tại.");
			}

			var existingItem = await db.Inventoryitems.FindAsync(id);
            if (existingItem == null)
                return NotFound();

            // Cập nhật thông tin
            existingItem.Name = updatedItem.Name;
            existingItem.Unit = updatedItem.Unit;
            existingItem.Amount = updatedItem.Amount;
            existingItem.IdInventoryitemtype = updatedItem.IdInventoryitemtype;
            existingItem.IdInventoryitemtypeNavigation = await db.Inventoryitemtypes.FindAsync(updatedItem.IdInventoryitemtype);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                return BadRequest($"Lỗi khi cập nhật dữ liệu: {ex.Message}");
            }

            return NoContent(); // hoặc return Ok(updatedItem) nếu bạn muốn trả lại dữ liệu sau cập nhật
        }

        [HttpPost]
        public async Task<IActionResult> CreateInventoryitem(Inventoryitem item)
        {
            if (db.Inventoryitems.Any(i => i.Name == item.Name))
            {
                return Conflict("Nguyên liệu đã tồn tại.");
			}

			db.Inventoryitems.Add(item);
            await db.SaveChangesAsync();
            return Ok(item);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteInventoryitem(int id)
        {
            bool isUsed = await db.Dishingredients.AnyAsync(d => d.IdInventoryitem == id);

            if (isUsed)
            {
                return BadRequest("Không thể xoá vì nguyên liệu này đang được sử dụng trong món ăn.");
            }

            var item = await db.Inventoryitems.FindAsync(id);
            if (item == null) return NotFound();

            db.Inventoryitems.Remove(item);
            await db.SaveChangesAsync();
            return Ok();
        }
    }
}
