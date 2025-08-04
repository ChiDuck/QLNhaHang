using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLNhaHang.Models;

namespace QLNhaHang.Controllers.API
{
    [Route("api/[controller]")]
    [ApiController]
    public class TabletypeAPIController : ControllerBase
    {
        private readonly QLNhaHangContext db;

        public TabletypeAPIController(QLNhaHangContext context)
        {
            db = context;
        }
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Tabletype>>> GetAllTabletypes()
        {
            try
            {
                return await db.Tabletypes.ToListAsync();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi server: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Tabletype>> Get(int id)
        {
            var type = await db.Tabletypes.FindAsync(id);
            return type == null ? NotFound() : type;
        }

        // POST api/Tabletype  (thêm mới)
        [HttpPost]
        public async Task<ActionResult<Tabletype>> Create(Tabletype dto)
        {
            if (db.Tabletypes.Any(t => t.Name == dto.Name))
            {
                return Conflict("Loại bàn với tên này đã tồn tại.");
			}

			db.Tabletypes.Add(dto);
            await db.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = dto.IdTabletype }, dto);
        }

        // PUT  api/Tabletype/5 (cập nhật)
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Tabletype dto)
        {
            if (id != dto.IdTabletype) return BadRequest();

			if (db.Tabletypes.Any(t => t.Name == dto.Name))
			{
				return Conflict("Loại bàn với tên này đã tồn tại.");
			}

			db.Entry(dto).State = EntityState.Modified;

            try { await db.SaveChangesAsync(); }
            catch (DbUpdateConcurrencyException)
            {
                if (!db.Tabletypes.Any(e => e.IdTabletype == id)) return NotFound();
                throw;
            }
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTabletype(int id)
        {
            var tabletype = await db.Tabletypes
                .Include(t => t.Dinetables)
                .FirstOrDefaultAsync(t => t.IdTabletype == id);

            if (tabletype == null)
                return NotFound();

            if (tabletype.Dinetables.Any())
            {
                return BadRequest("Không thể xóa vì còn bàn đang sử dụng loại bàn này.");
            }

            db.Tabletypes.Remove(tabletype);
            await db.SaveChangesAsync();

            return Ok();
        }

    }
}
