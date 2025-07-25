﻿using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLNhaHang.Models;

namespace QLNhaHang.Controllers.API
{
	[Route("api/[controller]")]
	[ApiController]
	public class DishAPIController : ControllerBase
	{
		private readonly QLNhaHangContext db = new QLNhaHangContext();

		public DishAPIController(QLNhaHangContext db)
		{
			this.db = db;
		}

		[HttpGet]
		public async Task<ActionResult<IEnumerable<object>>> GetAll()
		{
			var dishes = await db.Dishes
				.Include(d => d.IdDishcategoryNavigation)
				.Select(d => new
				{
					d.IdDish,
					d.Name,
					d.Price,
					d.Discount,
					d.Issoldout,
					d.Photo,
					d.Description,
					d.IdDishcategory,
					DishcategoryName = d.IdDishcategoryNavigation.Name
				})
				.ToListAsync();

			return Ok(dishes);
		}

		[HttpGet("search")]
		public async Task<IActionResult> SearchDishes([FromQuery] string keyword)
		{
			if (string.IsNullOrWhiteSpace(keyword))
				return BadRequest("Từ khóa không hợp lệ.");

			var result = await db.Dishes
				.Where(d => d.Name.Contains(keyword))
				.Select(d => new
				{
					d.IdDish,
					d.Name,
					d.Price,
					d.Discount,
					d.Issoldout,
					d.Photo,
					d.Description,
					d.IdDishcategory,
					DishcategoryName = d.IdDishcategoryNavigation.Name
				})
				.ToListAsync();

			return Ok(result);
		}

		// Thêm endpoint để lấy danh sách món ăn có sẵn
		[HttpGet("available")]
		public async Task<IActionResult> GetAvailableDishes()
		{
			var dishes = await db.Dishes
				.Where(d => !d.Issoldout) // Chỉ lấy món còn bán
				.OrderBy(d => d.IdDishcategory) // Sắp xếp theo danh mục
				.ToListAsync();

			return Ok(dishes);
		}

		[HttpGet("{id}")]
		public async Task<IActionResult> GetDish(int id)
		{
			var item = await db.Dishes
				.Where(i => i.IdDish == id)
				.Select(i => new
				{
					i.IdDish,
					i.IdDishcategory
				})
				.FirstOrDefaultAsync();

			if (item == null)
				return NotFound();

			return Ok(item);
		}

		[HttpPost]
		public async Task<IActionResult> CreateDish([FromBody] Dish dish)
		{
			// Gán lại IdDish = 0 để EF hiểu là tạo mới
			dish.IdDish = 0;
			if (db.Dishes.Any(d => d.Name == dish.Name))
			{
				return BadRequest("Món ăn đã tồn tại.");
			}
			// Đảm bảo không gán cả Inventoryitem navigation
			foreach (var ingredient in dish.Dishingredients)
			{
				ingredient.IdDish = 0; // sẽ được gán sau khi dish được tạo
				ingredient.IdInventoryitemNavigation = null;
			}

			db.Dishes.Add(dish);
			await db.SaveChangesAsync();

			return Ok(new { success = true, id = dish.IdDish });
		}

		[HttpDelete("{id}")]
		public async Task<IActionResult> Delete(int id)
		{
			var dish = await db.Dishes.FindAsync(id);
			if (dish == null)
				return NotFound();

			// Kiểm tra liên kết với Orderitems hoặc Reservationorders
			bool hasOrderItems = await db.Orderitems.AnyAsync(oi => oi.IdDish == id);
			bool hasReservationOrders = await db.Reservationorders.AnyAsync(ro => ro.IdDish == id);

			if (hasOrderItems || hasReservationOrders)
			{
				return Conflict("Không thể xóa món ăn này vì đã có trong đơn hàng hoặc đặt bàn.");
			}

			// Xóa các Dishingredients liên quan
			var ingredients = db.Dishingredients.Where(di => di.IdDish == id);
			db.Dishingredients.RemoveRange(ingredients);

			// Xóa các Cartdetails liên quan
			var cartDetails = db.Cartdetails.Where(cd => cd.IdDish == id);
			db.Cartdetails.RemoveRange(cartDetails);

			db.Dishes.Remove(dish);
			await db.SaveChangesAsync();

			return NoContent();
		}

		[HttpPut("{id}")]
		public async Task<IActionResult> UpdateDish(int id, [FromBody] Dish updatedDish)
		{
			if (id != updatedDish.IdDish)
				return BadRequest("ID không khớp");

			var existingDish = await db.Dishes
				.Include(d => d.Dishingredients)
				.FirstOrDefaultAsync(d => d.IdDish == id);

			if (existingDish == null)
				return NotFound();

			// Cập nhật thông tin món
			existingDish.Name = updatedDish.Name;
			existingDish.Issoldout = updatedDish.Issoldout;
			existingDish.Discount = updatedDish.Discount;
			existingDish.Price = updatedDish.Price;
			existingDish.Description = updatedDish.Description;
			existingDish.Photo = updatedDish.Photo;
			existingDish.IdDishcategory = updatedDish.IdDishcategory;

			// Xoá toàn bộ nguyên liệu cũ
			db.Dishingredients.RemoveRange(existingDish.Dishingredients);

			// Thêm nguyên liệu mới
			if (updatedDish.Dishingredients != null)
			{
				foreach (var ing in updatedDish.Dishingredients)
				{
					existingDish.Dishingredients.Add(new Dishingredient
					{
						IdDish = id,
						IdInventoryitem = ing.IdInventoryitem,
						Amount = ing.Amount
					});
				}
			}

			try
			{
				await db.SaveChangesAsync();
				return NoContent();
			}
			catch (Exception ex)
			{
				return StatusCode(500, "Lỗi khi cập nhật món ăn: " + ex.Message);
			}
		}
	}
}
