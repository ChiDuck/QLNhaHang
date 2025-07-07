using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLNhaHang.Models;

namespace QLNhaHang.Controllers.API
{
    [Route("api/[controller]")]
    [ApiController]
    public class DishCategoryAPIController : ControllerBase
    {
        private readonly QLNhaHangContext db = new QLNhaHangContext();

        public DishCategoryAPIController(QLNhaHangContext db)
        {
            this.db = db;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Dishcategory>>> GetAll()
        {
            try
            {
                return await db.Dishcategories.ToListAsync();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi server: {ex.Message}");
            }
        }
    }
}
