using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLNhaHang.Models;

namespace QLNhaHang.Controllers.API
{
	[Route("api/[controller]")]
	[ApiController]
	public class PaymentAPIController : ControllerBase
	{
		private readonly QLNhaHangContext db = new QLNhaHangContext();
		private readonly IConfiguration _config;

		public PaymentAPIController(QLNhaHangContext db, IConfiguration config)
		{
			this.db = db;
			_config = config; 
		}

		[HttpGet("vnpay-return")]
		public async Task<IActionResult> VNPayReturn()
		{
			var query = HttpContext.Request.Query; 
			var vnp_TxnRef = query["vnp_TxnRef"].ToString();
			var id = 0;
			if (query["vnp_ResponseCode"] == "00")
			{
				var shipOrder = await db.Shiporders.FirstOrDefaultAsync(o => o.Transactionid == vnp_TxnRef);
				if (shipOrder != null)
				{
					shipOrder.IdOrderstatus = 1; // Chờ xác nhận
					shipOrder.Transactionid = query["vnp_TransactionNo"];
					await db.SaveChangesAsync();
					id = shipOrder.IdShiporder;
					return Redirect($"{_config["ClientUrl"]}/orderconfirmation?id={id}");
				}
				else
				{
					var reservation = await db.Reservations.FirstOrDefaultAsync(r => r.Transactionid == vnp_TxnRef);
					if (reservation != null)
					{
						reservation.IdReservationstatus = 1; // Chờ xác nhận
						reservation.Transactionid = query["vnp_TransactionNo"];
						await db.SaveChangesAsync();
						id = reservation.IdReservation;
						return Redirect($"{_config["ClientUrl"]}/reservationconfirmation?id={id}");
					}
				}
			}
			return BadRequest("Invalid transaction reference or response code.");
		}
	}
}
