using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using QLNhaHang.Models;

public class ReservationConfirmationModel : PageModel
{
	private readonly QLNhaHangContext _db;

	public ReservationConfirmationModel(QLNhaHangContext db)
	{
		_db = db;
	}

	public Reservation? Reservation { get; set; }
	public List<Reservationorder> ReservationOrders { get; set; } = new();

	public async Task<IActionResult> OnGetAsync(int id)
	{
		Reservation = await _db.Reservations
			.Include(r => r.IdDinetableNavigation)
			.Include(r => r.IdReservationstatusNavigation)
			.FirstOrDefaultAsync(r => r.IdReservation == id);

		if (Reservation == null)
			return NotFound();

		ReservationOrders = await _db.Reservationorders
			.Where(ro => ro.IdReservation == id)
			.Include(ro => ro.IdDishNavigation)
			.ToListAsync();

		return Page();
	}
}
