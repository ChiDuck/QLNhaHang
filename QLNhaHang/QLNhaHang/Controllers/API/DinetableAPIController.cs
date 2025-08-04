using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLNhaHang.Models;

namespace QLNhaHang.Controllers.API
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
                .Select(t => new
                {
                    t.IdDinetable,
                    t.Name,
                    t.IdTabletypeNavigation.Seats,
                    t.IdArea,
                    t.IdTabletype,
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
            if (db.Dinetables.Any(t => t.Name == dinetable.Name))
            {
                return Conflict("Bàn với tên này đã tồn tại.");
			}

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

			if (db.Dinetables.Any(t => t.Name == dinetable.Name && t.IdDinetable != id))
			{
				return Conflict("Bàn với tên này đã tồn tại.");
			}

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

            return Ok();
        }

        // DELETE: api/Dinetable/5 (Xóa bàn)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDinetable(int id)
        {
            var dinetable = await db.Dinetables.FindAsync(id);
            if (dinetable == null)
                return NotFound();

            // Kiểm tra xem có reservation nào sử dụng bàn này không
            bool hasReservation = await db.Reservations.AnyAsync(r => r.IdDinetable == id);
            if (hasReservation)
            {
                return Conflict("Không thể xóa bàn này vì đã có đặt bàn sử dụng.");
            }

            db.Dinetables.Remove(dinetable);
            await db.SaveChangesAsync();

            return Ok();
        }

        private bool DinetableExists(int id)
        {
            return db.Dinetables.Any(e => e.IdDinetable == id);
        }

        // TablesController.cs
        [HttpGet("available-types")]
        public async Task<ActionResult<IEnumerable<AvailableTableTypeDto>>> GetAvailableTableTypes(
            [FromQuery] string date,
            [FromQuery] string time,
            [FromQuery] int partySize)
        {
            try
            {
                var reservationDate = DateTime.Parse(date);
                var reservationTime = TimeSpan.Parse(time);

                // Lấy tất cả loại bàn có sức chứa >= số người
                var suitableTableTypes = await db.Tabletypes
                    .Where(t => t.Seats <= 4 && partySize < 4 || partySize >= 4 && t.Seats < partySize*2 && t.Seats >= partySize)
                    .ToListAsync();

                // Lấy các đặt bàn trùng khung giờ (+- 1 tiếng)
                var startTime = reservationTime.Add(TimeSpan.FromHours(-1.5f));
                var endTime = reservationTime.Add(TimeSpan.FromHours(1.5f));

                var conflictingReservations = await db.Reservations
                    .Include(r => r.IdDinetableNavigation)
                    .Where(r => r.Reservationdate == reservationDate &&
                               r.Reservationtime >= startTime &&
                               r.Reservationtime <= endTime &&
                               r.IdReservationstatus != 3 &&
                               r.IdReservationstatus != 5)
                    .ToListAsync();

                // Tính số bàn trống cho từng loại
                var availableTableTypes = new List<AvailableTableTypeDto>();

                foreach (var tableType in suitableTableTypes)
                {
                    // Tổng số bàn thuộc loại này
                    var totalTables = await db.Dinetables
                        .CountAsync(t => t.IdTabletype == tableType.IdTabletype);

                    // Số bàn đã đặt thuộc loại này
                    var bookedTables = conflictingReservations
                        .Count(r => r.IdDinetableNavigation?.IdTabletype == tableType.IdTabletype);

                    // Số bàn còn trống
                    var availableCount = totalTables - bookedTables;

                    if (availableCount > 0)
                    {
                        availableTableTypes.Add(new AvailableTableTypeDto
                        {
                            Id = tableType.IdTabletype,
                            Name = tableType.Name,
                            Capacity = tableType.Seats,
                            AvailableCount = availableCount,
                        });
                    }
                }

                return Ok(availableTableTypes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        public class AvailableTableTypeDto
        {
            public int Id { get; set; }
            public string Name { get; set; }
            public int Capacity { get; set; }
            public int AvailableCount { get; set; }
        }
    }
}