using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLNhaHang.Models;

namespace QLNhaHang.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InventoryitemtypeAPIController : ControllerBase
    {
        private readonly QLNhaHangContext db;

        public InventoryitemtypeAPIController(QLNhaHangContext context)
        {
            db = context;
        }
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Inventoryitemtype>>> GetAll()
        {
            try
            {
                return await db.Inventoryitemtypes.ToListAsync();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi server: {ex.Message}");
            }
        }

        // POST: api/Inventoryitemtype
        [HttpPost]
        public async Task<ActionResult<Inventoryitemtype>> Create(Inventoryitemtype itemtype)
        {
            db.Inventoryitemtypes.Add(itemtype);
            await db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetAll), new { id = itemtype.IdInventoryitemtype }, itemtype);
        }

        // PUT: api/Inventoryitemtype/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Inventoryitemtype itemtype)
        {
            if (id != itemtype.IdInventoryitemtype)
                return BadRequest("ID mismatch.");

            db.Entry(itemtype).State = EntityState.Modified;

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!db.Inventoryitemtypes.Any(e => e.IdInventoryitemtype == id))
                    return NotFound();
                else
                    throw;
            }

            return NoContent();
        }

        // DELETE: api/Inventoryitemtype/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var itemtype = await db.Inventoryitemtypes.FindAsync(id);
            if (itemtype == null)
                return NotFound();

            db.Inventoryitemtypes.Remove(itemtype);
            await db.SaveChangesAsync();

            return NoContent();
        }
    }
}
