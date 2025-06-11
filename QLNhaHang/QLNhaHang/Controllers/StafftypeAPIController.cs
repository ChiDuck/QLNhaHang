using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLNhaHang.Models;

namespace QLNhaHang.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StafftypeAPIController : ControllerBase
    {
        private readonly QLNhaHangContext db;

        public StafftypeAPIController(QLNhaHangContext context)
        {
            db = context;
        }

        // GET: api/StaffType
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Stafftype>>> GetStaffTypes()
        {
            return await db.Stafftypes.ToListAsync();
        }
    }
}
