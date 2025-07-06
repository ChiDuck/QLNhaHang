using Microsoft.EntityFrameworkCore;
using QLNhaHang.Models;

public class PendingOrderCleanupService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly TimeSpan _checkInterval = TimeSpan.FromMinutes(5);

    public PendingOrderCleanupService(IServiceScopeFactory scopeFactory)
    {
        _scopeFactory = scopeFactory;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<QLNhaHangContext>();
                var expireTime = DateTime.Now.AddMinutes(-15); // Đơn hàng quá 15 phút

                var expiredOrders = db.Shiporders
                    .Where(o => o.IdOrderstatus == null && o.Orderdate < expireTime)
                    .Include(o => o.Orderitems);

                db.Orderitems.RemoveRange(expiredOrders.SelectMany(o => o.Orderitems));
                db.Shiporders.RemoveRange(expiredOrders);

                await db.SaveChangesAsync();
            }
            await Task.Delay(_checkInterval, stoppingToken);
        }
    }
}