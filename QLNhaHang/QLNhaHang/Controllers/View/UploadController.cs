using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace QLNhaHang.Controllers.View
{
    [Route("api/[controller]")]
    [ApiController]
    public class UploadController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;

        public UploadController(IWebHostEnvironment env)
        {
            _env = env;
        }

        [HttpPost("dish-photo")]
        public async Task<IActionResult> UploadDishPhoto(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { error = "File không hợp lệ" });

            // Lấy tên file gốc và tạo đường dẫn lưu
            var uploadsFolder = Path.Combine(_env.WebRootPath, "photo", "dish");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var fileName = Path.GetFileNameWithoutExtension(file.FileName);
            var extension = Path.GetExtension(file.FileName);
            var safeFileName = $"{fileName}_{Guid.NewGuid():N}{extension}";

            var filePath = Path.Combine(uploadsFolder, safeFileName);

            // Lưu file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Trả về đường dẫn tương đối (dùng để hiển thị)
            var relativePath = $"/photo/dish/{safeFileName}";
            return Ok(new { fileName = safeFileName, path = relativePath });
        }

        [HttpPost("staff-photo")]
        public async Task<IActionResult> UploadStaffPhoto(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { error = "File không hợp lệ" });

            // Lấy tên file gốc và tạo đường dẫn lưu
            var uploadsFolder = Path.Combine(_env.WebRootPath, "photo", "staff");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var fileName = Path.GetFileNameWithoutExtension(file.FileName);
            var extension = Path.GetExtension(file.FileName);
            var safeFileName = $"{fileName}_{Guid.NewGuid():N}{extension}";

            var filePath = Path.Combine(uploadsFolder, safeFileName);

            // Lưu file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Trả về đường dẫn tương đối (dùng để hiển thị)
            var relativePath = $"/photo/staff/{safeFileName}";
            return Ok(new { fileName = safeFileName, path = relativePath });
        }
    }
}
