using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLNhaHang.Models;

namespace QLNhaHang.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CustomerAPIController : ControllerBase
    {
        private readonly QLNhaHangContext db;

        public CustomerAPIController(QLNhaHangContext db)
        {
            this.db = db;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllCustomers()
        {
            var cus = await db.Customers.ToListAsync();
            return Ok(cus);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCustomer(int id)
        {
            var customer = await db.Customers.FindAsync(id);
            if (customer == null)
            {
                return NotFound(new { message = "Customer not found." });
            }

            db.Customers.Remove(customer);
            await db.SaveChangesAsync();

            return Ok(new { message = "Customer deleted successfully." });
        }

    }
}
