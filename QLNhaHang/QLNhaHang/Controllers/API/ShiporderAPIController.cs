using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLNhaHang.Libraries;
using QLNhaHang.Models;
using System.Net;
using System.Security.Cryptography;
using System.Text.Json;
using System.Web;

namespace QLNhaHang.Controllers.API
{
	[Route("api/[controller]")]
	[ApiController]
	public class ShiporderAPIController : ControllerBase
	{
		private readonly QLNhaHangContext db = new();
		private readonly IConfiguration _config;

		public ShiporderAPIController(QLNhaHangContext db, IConfiguration config)
		{
			this.db = db;
			_config = config;
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

		[HttpGet("{id}")]
		public async Task<IActionResult> GetShipOrderDetail(int id)
		{
			var order = await db.Shiporders
				.Include(o => o.Orderitems)
					.ThenInclude(i => i.IdDishNavigation)
				.Include(o => o.IdOrderstatusNavigation)
				.FirstOrDefaultAsync(o => o.IdShiporder == id);

			if (order == null) return NotFound();

			var ingredientMap = new Dictionary<int, (string Name, string Unit, double Required, double Available, bool Sufficient)>();

			foreach (var item in order.Orderitems)
			{
				var dishIngredients = await db.Dishingredients
					.Include(di => di.IdInventoryitemNavigation)
					.Where(di => di.IdDish == item.IdDish)
					.ToListAsync();

				foreach (var ing in dishIngredients)
				{
					double totalNeeded = ing.Amount * item.Quantity;
					if (ingredientMap.ContainsKey(ing.IdInventoryitem))
					{
						ingredientMap[ing.IdInventoryitem] = (
							ing.IdInventoryitemNavigation.Name,
							ing.IdInventoryitemNavigation.Unit,
							ingredientMap[ing.IdInventoryitem].Required + totalNeeded,
							ing.IdInventoryitemNavigation.Amount,
							true
						);
					}
					else
					{
						ingredientMap[ing.IdInventoryitem] = (
							ing.IdInventoryitemNavigation.Name,
							ing.IdInventoryitemNavigation.Unit,
							totalNeeded,
							ing.IdInventoryitemNavigation.Amount,
							true
						);
					}
				}
			}

			// Kiểm tra đủ không
			var ingredients = ingredientMap.Select(kvp => new
			{
				IdInventoryitem = kvp.Key,
				Name = kvp.Value.Name,
				Unit = kvp.Value.Unit,
				Required = kvp.Value.Required,
				Available = kvp.Value.Available,
				Sufficient = kvp.Value.Available >= kvp.Value.Required
			}).ToList();

			return Ok(new
			{
				order.IdShiporder,
				order.Customername,
				order.Phone,
				order.Email,
				order.Orderdate,
				order.Isshipping,
				order.Shipaddress,
				order.Orderprice,
				order.Shipfee,
				order.Note,
				order.Transactionid,
				order.IdOrderstatus,
				Status = order.IdOrderstatusNavigation?.Name,
				Items = order.Orderitems.Select(i => new
				{
					DishName = i.IdDishNavigation.Name,
					Quantity = i.Quantity,
					Price = i.Subtotal
				}),
				Ingredients = ingredients
			});
		}

		[HttpPut("{id}/status")]
		public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] int statusId)
		{
			var order = await db.Shiporders
				.Include(o => o.Orderitems)
				.FirstOrDefaultAsync(o => o.IdShiporder == id);

			if (order == null) return NotFound();

			order.IdOrderstatus = statusId;

			// Nếu chấp nhận đơn hàng => kiểm tra và trừ kho
			if (statusId == 3)
			{
				var ingredientMap = new Dictionary<int, double>(); // IdInventoryitem -> total needed

				foreach (var item in order.Orderitems)
				{
					var ingredients = await db.Dishingredients
						.Where(di => di.IdDish == item.IdDish)
						.ToListAsync();

					foreach (var ing in ingredients)
					{
						double totalNeeded = ing.Amount * item.Quantity;

						if (ingredientMap.ContainsKey(ing.IdInventoryitem))
							ingredientMap[ing.IdInventoryitem] += totalNeeded;
						else
							ingredientMap[ing.IdInventoryitem] = totalNeeded;
					}
				}

				// Trừ nguyên liệu trong kho
				var ingredientIds = ingredientMap.Keys.ToList();
				var inventoryItems = await db.Inventoryitems
					.Where(i => ingredientIds.Contains(i.IdInventoryitem))
					.ToListAsync();

				foreach (var item in inventoryItems)
				{
					var used = ingredientMap[item.IdInventoryitem];
					item.Amount -= used;
					if (item.Amount < 0) item.Amount = 0;
				}
			}
			await db.SaveChangesAsync();
			return Ok();
		}

		[HttpPost("cash")]
		public async Task<IActionResult> CreateCashOrder([FromBody] ShipOrderCreateDto orderDto)
		{
			// Validate
			if (orderDto.PaymentMethod != "cash")
			{
				return BadRequest("Invalid payment method");
			}

			// Tạo Shiporder
			var shipOrder = new Shiporder
			{
				Orderdate = DateTime.Now,
				Customername = orderDto.CustomerName,
				Phone = orderDto.Phone,
				Email = orderDto.Email,
				Isshipping = orderDto.IsShipping,
				Shipaddress = orderDto.ShipAddress,
				Shipfee = orderDto.IsShipping ? orderDto.ShipFee : null,
				Orderprice = orderDto.OrderPrice,
				Note = orderDto.Note,
				IdOrderstatus = 1, // Chờ thanh toán
			};

			db.Shiporders.Add(shipOrder);
			await db.SaveChangesAsync();

			// Thêm các Orderitem
			foreach (var item in orderDto.Items)
			{
				var orderItem = new Orderitem
				{
					IdShiporder = shipOrder.IdShiporder,
					IdDish = item.DishId,
					Quantity = item.Quantity,
					Subtotal = item.Subtotal
				};
				db.Orderitems.Add(orderItem);
			}

			await db.SaveChangesAsync();

			return Ok(new { shipOrderId = shipOrder.IdShiporder });
		}

		[HttpPost("vnpay")]
		public async Task<IActionResult> CreateVNPayOrder([FromBody] ShipOrderCreateDto orderDto)
		{
			if (orderDto.PaymentMethod != "vnpay")
				return BadRequest("Invalid payment method");

			var transactionId = "PENDING_" + Guid.NewGuid().ToString();

			// Tạo đơn hàng với trạng thái "Chờ thanh toán"
			var shipOrder = new Shiporder
			{
				Orderdate = DateTime.Now,
				Customername = orderDto.CustomerName,
				Phone = orderDto.Phone,
				Email = orderDto.Email,
				Isshipping = orderDto.IsShipping,
				Shipaddress = orderDto.ShipAddress,
				Shipfee = orderDto.IsShipping ? orderDto.ShipFee : null,
				Orderprice = orderDto.OrderPrice,
				Note = orderDto.Note,
				Transactionid = transactionId
			};
			db.Shiporders.Add(shipOrder);
			await db.SaveChangesAsync();

			foreach (var item in orderDto.Items)
			{
				db.Orderitems.Add(new Orderitem
				{
					IdShiporder = shipOrder.IdShiporder,
					IdDish = item.DishId,
					Quantity = item.Quantity,
					Subtotal = item.Subtotal
				});
			}
			await db.SaveChangesAsync();

			// Tạo URL thanh toán VNPay (query string)
			var pay = new VnPayLibrary();
			pay.AddRequestData("vnp_Version", "2.1.0");
			pay.AddRequestData("vnp_Command", "pay");
			pay.AddRequestData("vnp_TmnCode", _config["VNPay:TmnCode"]);
			pay.AddRequestData("vnp_Amount", ((int)(orderDto.OrderPrice * 100)).ToString());
			pay.AddRequestData("vnp_CreateDate", DateTime.Now.ToString("yyyyMMddHHmmss"));
			pay.AddRequestData("vnp_CurrCode", "VND");
			pay.AddRequestData("vnp_IpAddr", "127.0.0.1");
			pay.AddRequestData("vnp_Locale", "vn");
			pay.AddRequestData("vnp_OrderInfo", "Thanh toán đơn hàng");
			pay.AddRequestData("vnp_OrderType", "food");
			pay.AddRequestData("vnp_ReturnUrl", _config["VNPay:ReturnUrl"]);
			pay.AddRequestData("vnp_TxnRef", transactionId);

			var paymentUrl = pay.CreateRequestUrl(_config["Vnpay:BaseUrl"], _config["Vnpay:HashSecret"]);

			// Trả về transactionId để lưu tạm ở client, khi callback sẽ gửi lại
			return Ok(new
			{
				paymentUrl,
				transactionId,
				orderData = orderDto // client cần gửi lại khi callback
			});
		}
	}

	// Các DTO cần thiết
	public class ShipOrderCreateDto
	{
		public string CustomerName { get; set; }
		public string? Phone { get; set; }
		public string? Email { get; set; }
		public bool IsShipping { get; set; }
		public string? ShipAddress { get; set; }
		public double? ShipFee { get; set; }
		public double OrderPrice { get; set; }
		public string? Note { get; set; }
		public string PaymentMethod { get; set; }
		public int? CartId { get; set; }
		public List<OrderItemDto> Items { get; set; }
	}

	public class OrderItemDto
	{
		public int DishId { get; set; }
		public int Quantity { get; set; }
		public double Price { get; set; }
		public double Subtotal { get; set; }
	}
}
