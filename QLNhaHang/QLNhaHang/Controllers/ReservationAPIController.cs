using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLNhaHang.Models;

namespace QLNhaHang.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReservationAPIController : ControllerBase
    {
        private readonly QLNhaHangContext db;

        public ReservationAPIController(QLNhaHangContext context)
        {
            db = context;
        }

        // GET: api/Reservations
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetAllReservations()
        {
            return await db.Reservations
                .Include(r => r.IdReservationstatusNavigation)
                .Include(r => r.IdDinetableNavigation)
                .Include(r => r.IdCustomerNavigation)
                .OrderByDescending(r => r.Reservationdate)
                .ThenByDescending(r => r.Reservationtime)
                .Select(r => new
                {
                    r.IdReservation,
                    r.Phone,
                    r.Email,
                    r.Reservationdate,
                    r.Reservationtime,
                    r.Partysize,
                    r.Note,
                    r.IdReservationstatus,
                    Status = r.IdReservationstatusNavigation.Name,
                    CustomerName = r.IdCustomerNavigation != null ? r.IdCustomerNavigation.Name : "Khách vãng lai",
                    TableName = r.IdDinetableNavigation != null ? r.IdDinetableNavigation.Name : "Chưa chọn bàn",
                })
                .ToListAsync();
        }

        // GET: api/Reservations/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Reservation>> GetReservation(int id)
        {
            var reservation = await db.Reservations
                .Include(r => r.IdReservationstatusNavigation)
                .Include(r => r.IdDinetableNavigation)
                .Include(r => r.IdCustomerNavigation)
                .Include(r => r.Reservationorders)
                .FirstOrDefaultAsync(r => r.IdReservation == id);

            if (reservation == null)
            {
                return NotFound();
            }

            return reservation;
        }
    }
}
