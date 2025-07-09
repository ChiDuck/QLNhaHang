using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLNhaHang.Models;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.IdentityModel.Tokens.Jwt;

[Route("api/[controller]")]
[ApiController]
public class AuthCustomerAPIController : ControllerBase
{
	private readonly QLNhaHangContext _context;
	private readonly IConfiguration _config;

	public AuthCustomerAPIController(QLNhaHangContext context, IConfiguration config)
	{
		_context = context;
		_config = config;
	}

	[HttpPost("register")]
	public async Task<IActionResult> Register([FromBody] CustomerRegisterDto dto)
	{
		if (string.IsNullOrWhiteSpace(dto.Password) ||
			string.IsNullOrWhiteSpace(dto.Name) ||
			(string.IsNullOrWhiteSpace(dto.Phone) && string.IsNullOrWhiteSpace(dto.Email)))
		{
			return BadRequest("Thiếu thông tin bắt buộc");
		}

		var exists = await _context.Customers.AnyAsync(c => c.Phone == dto.Phone || c.Email == dto.Email);
		if (exists)
			return Conflict("Số điện thoại hoặc email đã được sử dụng.");

		var hash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

		var customer = new Customer
		{
			Name = dto.Name,
			Phone = dto.Phone,
			Email = dto.Email,
			PasswordHash = hash
		};

		_context.Customers.Add(customer);
		await _context.SaveChangesAsync();

		return Ok(new { customer.IdCustomer, customer.Name, customer.Phone, customer.Email });
	}

	[HttpPost("login")]
	public async Task<IActionResult> Login([FromBody] CustomerLoginDto dto)
	{
		if (string.IsNullOrWhiteSpace(dto.Identity) || string.IsNullOrWhiteSpace(dto.Password))
			return BadRequest("Thiếu thông tin đăng nhập.");

		var customer = await _context.Customers
			.FirstOrDefaultAsync(c => c.Phone == dto.Identity || c.Email == dto.Identity);

		if (customer == null || !BCrypt.Net.BCrypt.Verify(dto.Password, customer.PasswordHash))
			return Unauthorized("Thông tin đăng nhập không đúng.");

		var claims = new[]
		{
			new Claim(ClaimTypes.NameIdentifier, customer.IdCustomer.ToString()),
			new Claim(ClaimTypes.Name, customer.Name),
			new Claim("Type", "Customer")
		};

		var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
		var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

		var token = new JwtSecurityToken(
			issuer: _config["Jwt:Issuer"],
			audience: _config["Jwt:Audience"],
			claims: claims,
			expires: DateTime.Now.AddDays(7),
			signingCredentials: creds
		);

		return Ok(new
		{
			token = new JwtSecurityTokenHandler().WriteToken(token),
			name = customer.Name,
			phone = customer.Phone,
			email = customer.Email
		});
	}
}

public class CustomerRegisterDto
{
	public string Name { get; set; } = null!;
	public string? Phone { get; set; }
	public string? Email { get; set; }
	public string Password { get; set; } = null!;
}

public class CustomerLoginDto
{
	public string Identity { get; set; } = null!; // email hoặc sđt
	public string Password { get; set; } = null!;
}
