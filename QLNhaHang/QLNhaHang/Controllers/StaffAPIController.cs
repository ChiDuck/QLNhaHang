using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLNhaHang.Models;

namespace QLNhaHang.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StaffAPIController : ControllerBase
    {
        private readonly QLNhaHangContext db;

        public StaffAPIController(QLNhaHangContext context)
        {
            db = context;
        }

        // GET: api/Staff
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetStaffList()
        {
            return await db.Staff
                .Where(s => s.Isactive)
                .Select(s => new
                {
                    s.IdStaff,
                    s.Name,
                    s.Phone,
                    s.Email,
                    s.Photo,
                    StaffType = s.IdStafftypeNavigation.Name
                })
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetStaff(int id)
        {
            var staff = await db.Staff
                .Include(s => s.IdStafftypeNavigation)
                .Where(s => s.IdStaff == id)
                .Select(s => new
                {
                    s.IdStaff,
                    s.Name,
                    s.PasswordHash,
                    s.Citizenid,
                    s.Phone,
                    s.Email,
                    s.Gender,
                    s.Birthday,
                    s.Photo,
                    s.Address,
                    s.Startdate,
                    s.Hourlysalary,
                    s.Isactive,
                    StaffType = s.IdStafftypeNavigation.Name
                })
                .FirstOrDefaultAsync();

            if (staff == null)
            {
                return NotFound();
            }

            return staff;
        }
    }
}
