using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLNhaHang.Models;

namespace QLNhaHang.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DinetableAPIController : ControllerBase
    {
        private readonly QLNhaHangContext db;

        public DinetableAPIController(QLNhaHangContext context)
        {
            db = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllDinetables()
        {
            var tables = await db.Dinetables
                .Include(t => t.IdAreaNavigation)
                .Include(t => t.IdTabletypeNavigation)
                .Select(t => new {
                    t.IdDinetable,
                    t.Name,
                    t.IdTabletypeNavigation.Seats,
                    Area = t.IdAreaNavigation.Name,
                    Type = t.IdTabletypeNavigation.Name
                })
                .ToListAsync();

            return Ok(tables);
        }

        // GET: api/Dinetable/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Dinetable>> GetDinetable(int id)
        {
            var dinetable = await db.Dinetables.FindAsync(id);

            if (dinetable == null)
                return NotFound();

            return dinetable;
        }

        // POST: api/Dinetable (Thêm bàn mới)
        [HttpPost]
        public async Task<ActionResult<Dinetable>> CreateDinetable(Dinetable dinetable)
        {
            db.Dinetables.Add(dinetable);
            await db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetDinetable), new { id = dinetable.IdDinetable }, dinetable);
        }

        // PUT: api/Dinetable/5 (Cập nhật bàn)
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDinetable(int id, Dinetable dinetable)
        {
            if (id != dinetable.IdDinetable)
                return BadRequest();

            db.Entry(dinetable).State = EntityState.Modified;

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!DinetableExists(id))
                    return NotFound();
                else
                    throw;
            }

            return NoContent();
        }

        // DELETE: api/Dinetable/5 (Xóa bàn)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDinetable(int id)
        {
            var dinetable = await db.Dinetables.FindAsync(id);
            if (dinetable == null)
                return NotFound();

            db.Dinetables.Remove(dinetable);
            await db.SaveChangesAsync();

            return NoContent();
        }

        private bool DinetableExists(int id)
        {
            return db.Dinetables.Any(e => e.IdDinetable == id);
        }
    }
}
