using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLNhaHang.Models;
using QLNhaHang.Service;

namespace QLNhaHang.Controllers.API
{
	[Route("api/[controller]")]
	[ApiController]
	public class PaymentAPIController : ControllerBase
	{
		private readonly QLNhaHangContext db = new QLNhaHangContext();
		private readonly IConfiguration _config;
		private readonly EmailService _emailService;

		public PaymentAPIController(QLNhaHangContext db, IConfiguration config, EmailService emailService)
		{
			this.db = db;
			_config = config; 
			_emailService = emailService;
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
					var reservation = await db.Reservations
						.Include(r => r.Reservationorders)
						  .ThenInclude(ro => ro.IdDishNavigation)
						.Include(r => r.IdCustomerNavigation)
						.Include(r => r.IdDinetableNavigation)
						.Include(r => r.IdReservationstatusNavigation)
						.FirstOrDefaultAsync(r => r.Transactionid == vnp_TxnRef);
					if (reservation != null)
					{
						reservation.IdReservationstatus = 1; // Chờ xác nhận
						reservation.Transactionid = query["vnp_TransactionNo"];
						await db.SaveChangesAsync();

						// Send confirmation email
						await _emailService.SendReservationConfirmationEmail(reservation);

						id = reservation.IdReservation;
						return Redirect($"{_config["ClientUrl"]}/reservationconfirmation?id={id}");
					}
				}
			}
			return BadRequest("Invalid transaction reference or response code.");
		}
	}
}
