using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using QLNhaHang.Models;

public class OrderConfirmationModel : PageModel
{
    private readonly QLNhaHangContext _db;

    public OrderConfirmationModel(QLNhaHangContext db)
    {
        _db = db;
    }

    public Shiporder? ShipOrder { get; set; }
    public List<Orderitem> OrderItems { get; set; } = new();

    public async Task<IActionResult> OnGetAsync(int id)
    {
        ShipOrder = await _db.Shiporders
			.Include(o => o.IdOrderstatusNavigation)
			.FirstOrDefaultAsync(o => o.IdShiporder == id);

        if (ShipOrder == null)
            return NotFound();

        // Lấy OrderItems và join đến Dish
        OrderItems = await _db.Orderitems
            .Where(oi => oi.IdShiporder == id)
            .Include(oi => oi.IdDishNavigation)
            .ToListAsync();

        return Page();
    }
}