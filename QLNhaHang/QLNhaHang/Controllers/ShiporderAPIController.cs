using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLNhaHang.Models;

namespace QLNhaHang.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class ShiporderAPIController : ControllerBase
	{
		private readonly QLNhaHangContext db = new QLNhaHangContext();

		public ShiporderAPIController(QLNhaHangContext db)
		{
			this.db = db;
		}

		[HttpGet]
		public async Task<ActionResult<IEnumerable<object>>> GetAll()
		{
			var shiporders = await db.Shiporders
				.Include(s => s.IdCartNavigation)
				.Include(s => s.IdOrderstatusNavigation)
				.Include(s => s.IdPaymentNavigation)
				.Select(s => new
				{
					s.IdShiporder,
					s.Orderdate,
					s.Customername,
					s.Phone,
					s.Email,
					s.Isshipping,
					s.Shipaddress,
					s.Shipfee,
					s.Orderprice,
					s.Note,
					s.IdOrderstatus,
					OrderstatusName = s.IdOrderstatusNavigation.Name,
					s.IdCart,
					s.IdPayment
				})
				.ToListAsync();
			return Ok(shiporders);
		}

		[HttpPost]
		public async Task<IActionResult> CreateOrder([FromBody] ShiporderDto shiporderDto)
		{
			// Validate model
			if (!ModelState.IsValid)
			{
				return BadRequest(ModelState);
			}

			// Tạo đơn hàng mới
			var shiporder = new Shiporder
			{
				Orderdate = DateTime.Now,
				Customername = shiporderDto.CustomerName,
				Phone = shiporderDto.Phone,
				Email = shiporderDto.Email,
				Isshipping = shiporderDto.IsShipping,
				Shipaddress = shiporderDto.ShipAddress,
				Shipfee = shiporderDto.ShipFee,
				Orderprice = shiporderDto.OrderPrice,
				Note = shiporderDto.Note,
				IdOrderstatus = 1, // Trạng thái mặc định (ví dụ: 1 = Chờ xác nhận)
				IdPayment = shiporderDto.PaymentMethod == "momo" ? 2 : 1 // 1 = Tiền mặt, 2 = MoMo
			};

			// Thêm vào database
			db.Shiporders.Add(shiporder);
			await db.SaveChangesAsync();

			// Tạo các món trong đơn hàng
			//foreach (var item in shiporderDto.Items)
			//{
			//	var orderItem = new Orderitem
			//	{
			//		IdOrder = shiporder.IdShiporder,
			//		IdDish = item.DishId,
			//		Quantity = item.Quantity,
			//		Subtotal = item.Subtotal
			//	};
			//	db.Orderitems.Add(orderItem);
			//}

			await db.SaveChangesAsync();

			// Trả về kết quả
			return Ok(new { idShiporder = shiporder.IdShiporder });
		}
	}

	public class ShiporderDto
	{
		public string CustomerName { get; set; }
		public string Phone { get; set; }
		public string Email { get; set; }
		public bool IsShipping { get; set; }
		public string ShipAddress { get; set; }
		public double? ShipFee { get; set; }
		public double OrderPrice { get; set; }
		public string Note { get; set; }
		public string PaymentMethod { get; set; }
		public List<ShiporderItemDto> Items { get; set; }
	}

	public class ShiporderItemDto
	{
		public int DishId { get; set; }
		public int Quantity { get; set; }
		public double Price { get; set; }
	}
}
