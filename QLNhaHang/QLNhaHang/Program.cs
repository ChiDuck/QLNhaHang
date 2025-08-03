using Hangfire;
using Hangfire.SqlServer;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using QLNhaHang.Models;
using QLNhaHang.Service;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<QLNhaHangContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("QLNhaHangContext")));

// Add services to the container.
builder.Services.AddControllersWithViews();
builder.Services.AddScoped<EmailService>();
builder.Services.AddHostedService<PendingOrderCleanupService>();
builder.Services.AddRazorPages();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
	.AddJwtBearer(opt => {
		opt.TokenValidationParameters = new TokenValidationParameters
		{
			ValidateIssuer = true,
			ValidateAudience = true,
			ValidateIssuerSigningKey = true,
			ValidIssuer = builder.Configuration["Jwt:Issuer"],
			ValidAudience = builder.Configuration["Jwt:Audience"],
			IssuerSigningKey = new SymmetricSecurityKey(
				Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)
			)
		};
	});

builder.Services.AddHangfire(config =>
	config.SetDataCompatibilityLevel(CompatibilityLevel.Version_170)
		  .UseSimpleAssemblyNameTypeSerializer()
		  .UseRecommendedSerializerSettings()
		  .UseSqlServerStorage(builder.Configuration.GetConnectionString("QLNhaHangContext"))); // 👉 dùng chuỗi kết nối thật
builder.Services.AddHangfireServer();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage(); // thêm dòng này nếu chưa có
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
	name: "default",
	pattern: "{controller=Home}/{action=Index}/{id?}");

app.MapRazorPages();
app.MapGet("/AdminIndex", context => {
	context.Response.Redirect("/Login");
	return Task.CompletedTask;
});

app.UseHangfireDashboard(); // Dashboard tại /hangfire
RecurringJobOptions options = new()
{
	TimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time")
};
RecurringJob.AddOrUpdate<AttendanceService>(
	"mark-absence",
	service => service.MarkAbsences(),
	"05 22 * * *", // Mỗi ngày lúc 22:05 (giờ máy chủ)
	options
);

app.Run();

