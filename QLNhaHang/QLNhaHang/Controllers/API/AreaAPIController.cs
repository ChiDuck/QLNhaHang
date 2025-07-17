using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLNhaHang.Models;

namespace QLNhaHang.Controllers.API
{
    [Route("api/[controller]")]
    [ApiController]
    public class AreaAPIController : ControllerBase
    {
        private readonly QLNhaHangContext db;

        public AreaAPIController(QLNhaHangContext context)
        {
            db = context;
        }

        [HttpGet]
		public async Task<IActionResult> GetAllAreas()
		{
			try
			{
				var areas = await db.Areas
					.Select(a => new
					{
						a.IdArea,
						a.Name,
						TableCount = a.Dinetables.Count
					})
					.ToListAsync();

				return Ok(areas);
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"Lỗi server: {ex.Message}");
			}
		}

        // GET: api/areaapi/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Area>> GetArea(int id)
        {
            var area = await db.Areas.FindAsync(id);

            if (area == null)
                return NotFound();

            return area;
        }

        // POST: api/areaapi
        [HttpPost]
        public async Task<ActionResult<Area>> PostArea(Area area)
        {
            db.Areas.Add(area);
            await db.SaveChangesAsync();
            return Ok(area);
        }

        // PUT: api/areaapi/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutArea(int id, Area area)
        {
            if (id != area.IdArea)
                return BadRequest();

            db.Entry(area).State = EntityState.Modified;

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!db.Areas.Any(e => e.IdArea == id))
                    return NotFound();
                else
                    throw;
            }

            return Ok(area);
        }

        // DELETE: api/areaapi/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteArea(int id)
        {
            var area = await db.Areas
                .Include(a => a.Dinetables)
                .FirstOrDefaultAsync(a => a.IdArea == id);

            if (area == null)
                return NotFound();

            if (area.Dinetables.Any())
                return BadRequest("Không thể xóa vì còn bàn thuộc khu vực này.");

            db.Areas.Remove(area);
            await db.SaveChangesAsync();

            return NoContent();
        }
    }
}
