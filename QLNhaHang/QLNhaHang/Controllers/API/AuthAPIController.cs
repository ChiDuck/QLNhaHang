using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis.Scripting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using QLNhaHang.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

[Route("api/[controller]")]
[ApiController]
public class AuthAPIController : ControllerBase
{
	private readonly QLNhaHangContext _context;
	private readonly IConfiguration _config;

	public AuthAPIController(QLNhaHangContext context, IConfiguration config)
	{
		_context = context;
		_config = config;
	}

	[HttpPost("login")]
	public async Task<IActionResult> Login([FromBody] StaffLoginDto dto)
	{
		var staff = await _context.Staff
			.Include(s => s.IdStafftypeNavigation)
			.FirstOrDefaultAsync(s =>
				s.Isactive &&
				(s.Email == dto.Identity || s.Phone == dto.Identity));

		if (staff == null || !BCrypt.Net.BCrypt.Verify(dto.Password, staff.PasswordHash))
			return Unauthorized("Thông tin đăng nhập không đúng.");

		var claims = new[] {
			new Claim(ClaimTypes.NameIdentifier, staff.IdStaff.ToString()),
			new Claim(ClaimTypes.Name, staff.Name),
			new Claim("Type", staff.IdStafftypeNavigation?.Name ?? "Nhân viên")
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
			name = staff.Name,
			email = staff.Email,
			phone = staff.Phone,
			type = staff.IdStafftypeNavigation?.Name ?? ""
		});
	}
}

public class StaffLoginDto
{
	public string Identity { get; set; } = null!; // email hoặc sđt
	public string Password { get; set; } = null!;
}
