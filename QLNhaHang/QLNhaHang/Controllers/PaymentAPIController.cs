using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLNhaHang.Models;
using System.Security.Cryptography;
using System.Web;

namespace QLNhaHang.Controllers
{
	[ApiController]
	[Route("api/[controller]")]
	public class PaymentAPIController : ControllerBase
	{
		private readonly QLNhaHangContext db;
		private readonly IConfiguration _config;

		public PaymentAPIController(QLNhaHangContext context, IConfiguration config)
		{
			db = context;
			_config = config;
		}

		[HttpPost("create")]
		public async Task<IActionResult> CreatePayment([FromBody] PaymentRequestDto request)
		{
			// 1. Tạo đơn hàng trong database trước
			var shiporder = new Shiporder
			{
				Orderdate = DateTime.Now,
				Customername = request.CustomerName,
				Email = request.CustomerEmail,
				Orderprice = request.Amount,
				IdOrderstatus = 1, // Chờ thanh toán
				IdPayment = request.PaymentMethod == "momo" ? 2 : 3 // 2 = MoMo, 3 = VNPay
			};

			db.Shiporders.Add(shiporder);
			await db.SaveChangesAsync();

			// 2. Tạo yêu cầu thanh toán tùy phương thức
			if (request.PaymentMethod == "momo")
			{
				var momoResult = await ProcessMoMoPayment(shiporder.IdShiporder, request.Amount);
				return Ok(momoResult);
			}
			else if (request.PaymentMethod == "vnpay")
			{
				var vnpayResult = ProcessVNPayPayment(shiporder.IdShiporder, request.Amount, request.BankCode);
				return Ok(vnpayResult);
			}

			return BadRequest("Phương thức thanh toán không hợp lệ");
		}

		private async Task<object> ProcessMoMoPayment(int shiporderId, double amount)
		{
			// Demo - Thực tế cần tích hợp với API MoMo
			var endpoint = "https://test-payment.momo.vn/v2/gateway/api/create";
			var partnerCode = _config["MoMo:PartnerCode"];
			var accessKey = _config["MoMo:AccessKey"];
			var secretKey = _config["MoMo:SecretKey"];

			// Tạo requestId và orderId cho MoMo
			var requestId = Guid.NewGuid().ToString();
			var orderInfo = "Thanh toán đơn hàng #" + shiporderId;
			var redirectUrl = _config["MoMo:ReturnUrl"];
			var ipnUrl = _config["MoMo:NotifyUrl"];
			var amountInVND = (long)(amount * 1000); // Chuyển sang VND

			// Tạo raw signature
			var rawHash = $"accessKey={accessKey}&amount={amountInVND}&extraData=&ipnUrl={ipnUrl}&shiporderId={shiporderId}&orderInfo={orderInfo}&partnerCode={partnerCode}&redirectUrl={redirectUrl}&requestId={requestId}&requestType=captureWallet";

			// Tạo signature
			var signature = ComputeHmacSha256(rawHash, secretKey);

			// Tạo body request
			var requestBody = new
			{
				partnerCode = partnerCode,
				partnerName = "Nhà hàng ABC",
				storeId = "Store1",
				requestId = requestId,
				amount = amountInVND,
				shiporderId = shiporderId.ToString(),
				orderInfo = orderInfo,
				redirectUrl = redirectUrl,
				ipnUrl = ipnUrl,
				lang = "vi",
				extraData = "",
				requestType = "captureWallet",
				signature = signature
			};

			// Gửi request đến MoMo (demo - thực tế cần xử lý async)
			try
			{
				using var httpClient = new HttpClient();
				var response = await httpClient.PostAsJsonAsync(endpoint, requestBody);
				var result = await response.Content.ReadFromJsonAsync<Dictionary<string, object>>();

				return new
				{
					paymentUrl = result?["payUrl"]?.ToString(),
					shiporderId = shiporderId
				};
			}
			catch (Exception ex)
			{
				// Xử lý lỗi
				return new
				{
					error = ex.Message
				};
			}
		}

		private object ProcessVNPayPayment(int shiporderId, double amount, string bankCode)
		{
			// Demo - Thực tế cần tích hợp với API VNPay
			var vnp_Url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
			var vnp_Returnurl = _config["VNPay:ReturnUrl"];
			var vnp_TmnCode = _config["VNPay:TmnCode"];
			var vnp_HashSecret = _config["VNPay:HashSecret"];

			var amountInVND = (long)(amount * 100); // VNPay tính theo đơn vị VND (100 = 1,000đ)
			var vnp_TxnRef = shiporderId.ToString(); // Mã đơn hàng
			var vnp_OrderInfo = "Thanh toán đơn hàng #" + shiporderId;
			var vnp_OrderType = "food";
			var vnp_Locale = "vn";

			// Tạo query string
			var queryString = HttpUtility.ParseQueryString(string.Empty);
			queryString.Add("vnp_Version", "2.1.0");
			queryString.Add("vnp_Command", "pay");
			queryString.Add("vnp_TmnCode", vnp_TmnCode);
			queryString.Add("vnp_Amount", amountInVND.ToString());
			queryString.Add("vnp_BankCode", bankCode ?? "");
			queryString.Add("vnp_CreateDate", DateTime.Now.ToString("yyyyMMddHHmmss"));
			queryString.Add("vnp_CurrCode", "VND");
			queryString.Add("vnp_IpAddr", HttpContext.Connection.RemoteIpAddress?.ToString());
			queryString.Add("vnp_Locale", vnp_Locale);
			queryString.Add("vnp_OrderInfo", vnp_OrderInfo);
			queryString.Add("vnp_OrderType", vnp_OrderType);
			queryString.Add("vnp_ReturnUrl", vnp_Returnurl);
			queryString.Add("vnp_TxnRef", vnp_TxnRef);

			// Sắp xếp tham số theo thứ tự alphabet
			var sortedParams = queryString.AllKeys.OrderBy(k => k)
				.ToDictionary(k => k, k => queryString[k]);

			// Tạo chuỗi hash
			var hashData = string.Join("&", sortedParams.Select(kv => $"{kv.Key}={kv.Value}"));
			var secureHash = ComputeHmacSha512(hashData, vnp_HashSecret);

			// Thêm signature vào URL
			var paymentUrl = $"{vnp_Url}?{hashData}&vnp_SecureHash={secureHash}";

			return new
			{
				paymentUrl = paymentUrl,
				shiporderId = shiporderId
			};
		}

		private string ComputeHmacSha256(string message, string secretKey)
		{
			var encoding = new System.Text.UTF8Encoding();
			byte[] keyByte = encoding.GetBytes(secretKey);
			byte[] messageBytes = encoding.GetBytes(message);

			using (var hmacsha256 = new HMACSHA256(keyByte))
			{
				byte[] hashmessage = hmacsha256.ComputeHash(messageBytes);
				return BitConverter.ToString(hashmessage).Replace("-", "").ToLower();
			}
		}

		private string ComputeHmacSha512(string message, string secretKey)
		{
			var encoding = new System.Text.UTF8Encoding();
			byte[] keyByte = encoding.GetBytes(secretKey);
			byte[] messageBytes = encoding.GetBytes(message);

			using (var hmacsha512 = new HMACSHA512(keyByte))
			{
				byte[] hashmessage = hmacsha512.ComputeHash(messageBytes);
				return BitConverter.ToString(hashmessage).Replace("-", "").ToLower();
			}
		}


		[HttpPost("momo-callback")]
		public IActionResult MoMoCallback([FromBody] MoMoCallbackDto callbackData)
		{
			// Verify signature
			var rawHash = $"accessKey={callbackData.AccessKey}&amount={callbackData.Amount}&extraData={callbackData.ExtraData}&message={callbackData.Message}&shiporderId={callbackData.ShiporderId}&orderInfo={callbackData.OrderInfo}&orderType={callbackData.OrderType}&partnerCode={callbackData.PartnerCode}&payType={callbackData.PayType}&requestId={callbackData.RequestId}&responseTime={callbackData.ResponseTime}&resultCode={callbackData.ResultCode}&transId={callbackData.TransId}";
			var signature = ComputeHmacSha256(rawHash, _config["MoMo:SecretKey"]);

			if (signature != callbackData.Signature)
			{
				return BadRequest("Invalid signature");
			}

			// Cập nhật đơn hàng
			if (callbackData.ResultCode == 0) // Thanh toán thành công
			{
				var shiporderId = int.Parse(callbackData.ShiporderId);
				var shiporder = db.Shiporders.Find(shiporderId);
				if (shiporder != null)
				{
					shiporder.IdOrderstatus = 2; // Đã thanh toán
					db.SaveChanges();
				}
				return Ok();
			}

			return BadRequest("Payment failed");
		}

		[HttpGet("vnpay-return")]
		public IActionResult VNPayReturn([FromQuery] VNPayReturnDto returnData)
		{
			// Verify checksum
			var vnp_HashSecret = _config["VNPay:HashSecret"];
			var vnp_SecureHash = returnData.vnp_SecureHash;

			// Loại bỏ tham số checksum và sắp xếp lại
			var exceptFields = new List<string> { "vnp_SecureHash", "vnp_SecureHashType" };
			var signedFields = returnData.GetType().GetProperties()
				.Where(p => !exceptFields.Contains(p.Name) && p.GetValue(returnData) != null)
				.OrderBy(p => p.Name)
				.ToDictionary(p => p.Name, p => p.GetValue(returnData)?.ToString());

			var hashData = string.Join("&", signedFields.Select(kv => $"{kv.Key}={kv.Value}"));
			var checkSignature = ComputeHmacSha512(hashData, vnp_HashSecret);

			if (checkSignature != vnp_SecureHash)
			{
				return BadRequest("Invalid signature");
			}

			// Xử lý kết quả thanh toán
			if (returnData.vnp_ResponseCode == "00") // Thành công
			{
				var orderId = int.Parse(returnData.vnp_TxnRef);
				var order = db.Shiporders.Find(orderId);
				if (order != null)
				{
					order.IdOrderstatus = 2; // Đã thanh toán
					db.SaveChanges();
				}

				// Chuyển hướng đến trang cảm ơn
				return Redirect("https://yourdomain.com/thank-you");
			}

			// Thanh toán thất bại
			return Redirect("https://yourdomain.com/payment-failed");
		}
	}

	public class PaymentRequestDto
	{
		public double Amount { get; set; }
		public string PaymentMethod { get; set; }
		public string BankCode { get; set; }
		public string CustomerName { get; set; }
		public string CustomerEmail { get; set; }
	}

	public class MoMoCallbackDto
	{
		public string PartnerCode { get; set; }
		public string ShiporderId { get; set; }
		public string RequestId { get; set; }
		public long Amount { get; set; }
		public long TransId { get; set; }
		public int ResultCode { get; set; }
		public string Message { get; set; }
		public string PayType { get; set; }
		public long ResponseTime { get; set; }
		public string ExtraData { get; set; }
		public string Signature { get; set; }

		// Các trường bổ sung
		public string OrderInfo { get; set; }
		public string OrderType { get; set; }
		public string AccessKey { get; set; }
	}
	public class VNPayReturnDto
	{
		public string vnp_TmnCode { get; set; }
		public long vnp_Amount { get; set; }
		public string vnp_BankCode { get; set; }
		public string vnp_BankTranNo { get; set; }
		public string vnp_CardType { get; set; }
		public string vnp_PayDate { get; set; }
		public string vnp_OrderInfo { get; set; }
		public string vnp_TransactionNo { get; set; }
		public string vnp_ResponseCode { get; set; }
		public string vnp_TransactionStatus { get; set; }
		public string vnp_TxnRef { get; set; }
		public string vnp_SecureHashType { get; set; }
		public string vnp_SecureHash { get; set; }

		// Các trường khác có thể có
		public string vnp_Command { get; set; }
		public string vnp_CreateDate { get; set; }

	}
}