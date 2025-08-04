using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLNhaHang.Models;
using System.Globalization;
using System.Net;
using System.Net.Mail;

namespace QLNhaHang.Service
{
	public class EmailService
	{
		private readonly IConfiguration _config;
		public EmailService(IConfiguration config)
		{
			_config = config;
		}

		public async Task SendReservationConfirmationEmail(Reservation reservation)
		{
			var customerName = reservation.IdCustomerNavigation?.Name ?? "Quý khách";
			var emailTo = reservation.Email;
			var status = reservation.IdReservationstatusNavigation?.Name ?? "Chưa xác định";
			var culture = new CultureInfo("vi-VN");

			var subject = $"[Nhà hàng Đức Phát] Xác nhận đặt bàn #{reservation.IdReservation}";

			var dishesHtml = "";

			if (reservation.Reservationorders != null && reservation.Reservationorders.Any())
			{
				var dishRows = string.Join("", reservation.Reservationorders.Select(ro =>
					$@"<tr>
						<td>{ro.IdDishNavigation?.Name}</td>
						<td style='text-align:center'>{ro.Quantity}</td>
						<td style='text-align:right'>{ro.Total.ToString("C0", culture)}</td>
					</tr>"));

				dishesHtml = $@"
					<p><strong>Món đã đặt:</strong></p>
					<table border='1' cellspacing='0' cellpadding='5' style='border-collapse:collapse; width:60%'>
						<tr>
							<th style='text-align:left'>Tên món</th>
							<th style='text-align:center'>Số lượng</th>
							<th style='text-align:right'>Tổng</th>
						</tr>
						{dishRows}
					</table><br/>
					<p style='margin-top:15px'><strong>Tổng cộng:</strong> {reservation.Reservationprice?.ToString("C0", culture)}</p>";
			}

			var body = $@"
		<div style='font-family:Arial, sans-serif; color:#333'>
			<h2 style='color:#d6336c'>Đơn đặt bàn đã được gửi thành công đến nhà hàng!</h2>
			<p>Xin chào <strong>{customerName}</strong>,</p>
			<p>Đơn đặt bàn tại <strong>Nhà hàng Đức Phát</strong> đang được xử lý. Thông tin chi tiết như sau:</p>

			<table style='width:100%; border-collapse:collapse; margin-bottom:20px'>
				<tr><td><strong>Mã đặt bàn:</strong></td><td>#{reservation.IdReservation}</td></tr>
				<tr><td><strong>Ngày đặt:</strong></td><td>{reservation.Bookdate:dd/MM/yyyy HH:mm}</td></tr>
				<tr><td><strong>Ngày dùng bữa:</strong></td><td>{reservation.Reservationdate:dd/MM/yyyy} lúc {reservation.Reservationtime.ToString(@"hh\:mm")}</td></tr>
				<tr><td><strong>Số người:</strong></td><td>{reservation.Partysize}</td></tr>
				<tr><td><strong>Trạng thái:</strong></td><td>{status}</td></tr>
				<tr><td><strong>Ghi chú:</strong></td><td>{reservation.Note}</td></tr>
				<tr><td><strong>Mã giao dịch:</strong></td><td>{reservation.Transactionid ?? "Không có"}</td></tr>
			</table>
			{dishesHtml}

			<p style='margin-top:20px'>Cảm ơn quý khách đã sử dụng dịch vụ của chúng tôi. Vui lòng chờ xác nhận từ phía nhà hàng!</p>
			<p>Trân trọng,<br/>Nhà hàng Đức Phát</p>
		</div>";

			using var smtp = new SmtpClient("smtp.gmail.com", 587)
			{
				EnableSsl = true,
				Credentials = new NetworkCredential(
					_config["EmailSettings:FromEmail"],
					_config["EmailSettings:AppPassword"])
			};

			var mail = new MailMessage
			{
				From = new MailAddress(_config["EmailSettings:FromEmail"], "Nhà hàng Đức Phát"),
				Subject = subject,
				Body = body,
				IsBodyHtml = true
			};
			mail.To.Add(emailTo);

			await smtp.SendMailAsync(mail);
		}

		public async Task SendReservationStatusEmail(Reservation reservation, bool isAccepted)
		{
			var customerName = reservation.IdCustomerNavigation?.Name ?? "Quý khách";
			var emailTo = reservation.Email;
			var culture = new CultureInfo("vi-VN");

			var haveOrder = "";
			if (reservation.Reservationorders != null && reservation.Reservationorders.Any())
			{
				haveOrder = $@"<p>Số tiền đặt món sẽ được hoàn trả trong vài ngày tới. Chúng tôi chân thành xin lỗi vì sự bất tiện này.</p>";
			}

			string subject, message;

			if (isAccepted)
			{
				subject = $"[Nhà hàng Đức Phát] Đơn đặt bàn #{reservation.IdReservation} đã được chấp nhận";
				message = $@"
			<h2 style='color:#d6336c'>Đơn đặt bàn của quý khách đã được chấp nhận!</h2>
			<p>Xin chào <strong>{customerName}</strong>,</p>
			<p>Quý khách đã đặt bàn thành công. Vui lòng có mặt tại nhà hàng không quá 15 phút so với thời gian đã hẹn.</p>
			<p><strong>Thông tin đặt bàn:</strong></p>
			<ul>
				<li><strong>Ngày dùng bữa:</strong> {reservation.Reservationdate:dd/MM/yyyy} lúc {reservation.Reservationtime.ToString(@"hh\:mm")}</li>
				<li><strong>Bàn:</strong> {reservation.IdDinetableNavigation?.Name}</li>
				<li><strong>Số người:</strong> {reservation.Partysize}</li>
				<li><strong>Mã giao dịch:</strong> {reservation.Transactionid ?? "Không có"}</li>
			</ul>
			<p>Hân hạnh được phục vụ quý khách!</p>
			<p>Trân trọng,<br/>Nhà hàng Đức Phát</p>";
			}
			else
			{
				subject = $"[Nhà hàng Đức Phát] Đơn đặt bàn #{reservation.IdReservation} đã bị từ chối";
				message = $@"
				<h2 style='color:#d6336c'>Đơn đặt bàn của quý khách không được chấp nhận.</h2>
			<p>Xin chào <strong>{customerName}</strong>,</p>
			<p>Rất tiếc! Đơn đặt bàn của quý khách đã <strong>không được chấp nhận</strong> tại thời điểm này.</p>
			<p><strong>Thông tin đặt bàn:</strong></p>
			<ul>
				<li><strong>Ngày dùng bữa:</strong> {reservation.Reservationdate:dd/MM/yyyy} lúc {reservation.Reservationtime.ToString(@"hh\:mm")}</li>
				<li><strong>Số người:</strong> {reservation.Partysize}</li>
			</ul>
			{haveOrder}
			<p>Quý khách có thể thử đặt lại vào khung giờ khác hoặc liên hệ với chúng tôi để biết thêm chi tiết.</p>
			<p>Trân trọng,<br/>Nhà hàng Đức Phát</p>";
			}

			using var smtp = new SmtpClient("smtp.gmail.com", 587)
			{
				EnableSsl = true,
				Credentials = new NetworkCredential(
					_config["EmailSettings:FromEmail"],
					_config["EmailSettings:AppPassword"])
			};

			var mail = new MailMessage
			{
				From = new MailAddress(_config["EmailSettings:FromEmail"], "Nhà hàng Đức Phát"),
				Subject = subject,
				Body = message,
				IsBodyHtml = true
			};
			mail.To.Add(emailTo);

			await smtp.SendMailAsync(mail);
		}

	}
}
