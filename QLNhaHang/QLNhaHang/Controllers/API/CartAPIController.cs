using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QLNhaHang.Models;
using System.Linq;
using System.Security.Claims;

namespace QLNhaHang.Controllers.API
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Require authentication
    public class CartAPIController : ControllerBase
    {
        private readonly QLNhaHangContext _context;

        public CartAPIController(QLNhaHangContext context)
        {
            _context = context;
        }

        // Helper: Get current user ID from JWT
        private int GetCurrentUserId()
        {
            // Assuming you store user id in JWT as "id"
            var claim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            return claim != null ? int.Parse(claim.Value) : 0;
        }

        // GET: api/cartapi
        [HttpGet]
        public IActionResult GetCart()
        {
            int userId = GetCurrentUserId();
            var cart = _context.Carts
                .Where(c => c.IdCustomer == userId)
                .Select(c => new
                {
                    c.IdCart,
                    c.Totalprice,
                    Items = c.Cartdetails.Select(cd => new
                    {
                        id = cd.IdDish,
                        name = cd.IdDishNavigation.Name,
                        price = cd.IdDishNavigation.Price,
                        quantity = cd.Quantity,
                        photo = cd.IdDishNavigation.Photo
                    })
                })
                .FirstOrDefault();

            if (cart == null)
                return Ok(new { Items = new object[0], Totalprice = 0 });

            return Ok(cart.Items);
        }

        // POST: api/cartapi
        [HttpPost]
        public IActionResult SaveCart([FromBody] List<CartItemDto> items)
        {
            int userId = GetCurrentUserId();
            var cart = _context.Carts.FirstOrDefault(c => c.IdCustomer == userId);

            if (cart == null)
            {
                cart = new Cart
                {
                    IdCustomer = userId,
                    Totalprice = 0
                };
                _context.Carts.Add(cart);
                _context.SaveChanges();
            }

            // Kiểm tra nếu cart đã có item thì không cho ghi đè
            var oldDetails = _context.Cartdetails.Where(cd => cd.IdCart == cart.IdCart).ToList();
            if (oldDetails.Count > 0)
            {
                // Đã có item, không ghi đè, trả về thông báo
                return Conflict(new { message = "Cart already has items. Merge not allowed." });
            }

            // Nếu cart rỗng, thêm mới
            double total = 0;
            foreach (var item in items)
            {
                var dish = _context.Dishes.Find(item.id);
                if (dish == null) continue;

                var detail = new Cartdetail
                {
                    IdCart = cart.IdCart,
                    IdDish = item.id,
                    Quantity = item.quantity,
                    Subtotal = dish.Price * item.quantity
                };
                total += detail.Subtotal;
                _context.Cartdetails.Add(detail);
            }

            cart.Totalprice = total;
            _context.SaveChanges();

            return Ok(new { success = true });
        }
    }

    // DTO for cart items
    public class CartItemDto
    {
        public int id { get; set; }
        public int quantity { get; set; }
    }
}