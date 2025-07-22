// Admin Dashboard JavaScript
const token = localStorage.getItem("token");

document.addEventListener("DOMContentLoaded", () => {
    besttoday()
    initializeDashboard()
    loadDashboardData()
    //initializeChart()
    drawChart("revenueWeekChart", "/api/statisticapi/revenue/week", "Doanh thu tuần", "rgba(255, 99, 132, 0.6)");
    drawChart("revenueMonthChart", "/api/statisticapi/revenue/month", "Doanh thu tháng", "rgba(54, 162, 235, 0.6)");
    drawChart("revenueYearChart", "/api/statisticapi/revenue/year", "Doanh thu năm", "rgba(75, 192, 192, 0.6)");
})

async function besttoday() {
    try {
        const res = await fetch(`/api/statisticapi/best-today`, { headers: { Authorization: `Bearer ${token}` } });
        var data = await res.json();
        console.log(data);
        document.getElementById("bestselltoday").innerHTML = data.name + ' - Số lần: ' + data.count;
    } catch (error) {
        console.log(error);
    }
}

async function reservationToday() {
    try {
        const res = await fetch(`/api/statisticapi/reservation-today`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        var data = await res.json();
        console.log(data);
        return data.count;
    } catch (error) {
        console.log(error);
        return null; // Return 0 if there's an error
    }
}

async function shiporderToday() {
    try {
        const res = await fetch(`/api/statisticapi/shiporder-today`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        var data = await res.json();
        console.log(data);
        return data.count;
    } catch (error) {
        console.log(error);
        return null; // Return 0 if there's an error
    }
}

async function getTodayRevenue() {
    try {
        const res = await fetch(`/api/statisticapi/revenue-today`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        var data = await res.json();
        console.log("Doanh thu hôm nay:", data.total);
        return data.total;
    } catch (error) {
        console.log(error);
        return null; // Return 0 if there's an error
    }
}

async function drawChart(canvasId, endpoint, label, color) {
    const res = await fetch(endpoint);
    const data = await res.json();

    new Chart(document.getElementById(canvasId).getContext("2d"), {
        type: "bar",
        data: {
            labels: data.labels,
            datasets: [{
                label: label,
                data: data.values,
                backgroundColor: color
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: val => val.toLocaleString('vi-VN') + ' đ'
                    }
                }
            }
        }
    });
}

function initializeDashboard() {
    // Add loading animation to stat cards
    const statValues = document.querySelectorAll(".stat-value")
    statValues.forEach((stat) => {
        stat.classList.add("loading")
    })

    // Animate stat cards on load
    const statCards = document.querySelectorAll(".stat-card")
    statCards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = "0"
            card.style.transform = "translateY(20px)"
            card.style.transition = "all 0.5s ease-out"

            setTimeout(() => {
                card.style.opacity = "1"
                card.style.transform = "translateY(0)"
            }, 100)
        }, index * 100)
    })
}

async function loadDashboardData() {
    var reservationTodayCount = await reservationToday();
    var shipOrderTodayCount = await shiporderToday();
    var todayRevenue = await getTodayRevenue();
    console.log("Reservation Today Count: ", reservationTodayCount.toString());
    // Simulate loading dashboard data
    setTimeout(() => {
        updateStatCard("totalReservations", reservationTodayCount.toString())
        updateStatCard("totalOrders", shipOrderTodayCount.toString())
        updateStatCard("totalRevenue", todayRevenue.toString())

        // Remove loading animation
        const statValues = document.querySelectorAll(".stat-value")
        statValues.forEach((stat) => {
            stat.classList.remove("loading")
        })
    }, 1000)

    // Load recent activities
    loadRecentActivities()
}

function updateStatCard(id, value) {
    const element = document.getElementById(id)
    if (element) {
        // Animate number change
        animateValue(element, 0, Number.parseFloat(value.replace(/,/g, "")), 1000, id === "totalRevenue")
    }
}

function animateValue(element, start, end, duration, isCurrency = false) {
    const startTime = performance.now()

    function update(currentTime) {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)

        const current = Math.floor(start + (end - start) * progress)

        if (isCurrency) {
            element.textContent = formatCurrency(current)
        } else {
            element.textContent = formatNumber(current)
        }

        if (progress < 1) {
            requestAnimationFrame(update)
        }
    }

    requestAnimationFrame(update)
}

function formatNumber(num) {
    return new Intl.NumberFormat("vi-VN").format(num)
}

function formatCurrency(num) {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        minimumFractionDigits: 0,
    }).format(num)
}

function loadRecentActivities() {
    const activities = [
        {
            icon: "fas fa-user-plus",
            type: "success",
            text: "Khách hàng mới <strong>Nguyễn Văn A</strong> đã đăng ký",
            time: "5 phút trước",
        },
        {
            icon: "fas fa-calendar",
            type: "warning",
            text: "Đặt bàn mới cho <strong>4 người</strong> lúc 19:00",
            time: "10 phút trước",
        },
        {
            icon: "fas fa-shopping-cart",
            type: "info",
            text: "Đơn hàng mới <strong>#ORD001</strong> cần xử lý",
            time: "15 phút trước",
        },
        {
            icon: "fas fa-money-bill-wave",
            type: "success",
            text: "Thanh toán <strong>500,000đ</strong> đã được xác nhận",
            time: "20 phút trước",
        },
        {
            icon: "fas fa-exclamation-triangle",
            type: "warning",
            text: "Nguyên liệu <strong>Thịt bò</strong> sắp hết",
            time: "25 phút trước",
        },
    ]

    const container = document.getElementById("recentActivities")
    if (container) {
        container.innerHTML = ""

        activities.forEach((activity, index) => {
            const activityElement = createActivityElement(activity)
            activityElement.style.opacity = "0"
            activityElement.style.transform = "translateX(-20px)"
            container.appendChild(activityElement)

            setTimeout(() => {
                activityElement.style.transition = "all 0.3s ease-out"
                activityElement.style.opacity = "1"
                activityElement.style.transform = "translateX(0)"
            }, index * 100)
        })
    }
}

function createActivityElement(activity) {
    const div = document.createElement("div")
    div.className = "activity-item"
    div.innerHTML = `
        <div class="activity-icon ${activity.type}">
            <i class="${activity.icon}"></i>
        </div>
        <div class="activity-content">
            <p class="activity-text">${activity.text}</p>
            <span class="activity-time">${activity.time}</span>
        </div>
    `
    return div
}

function initializeChart() {
    const ctx = document.getElementById("revenueChart")
    if (!ctx) return

    const data = {
        labels: ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"],
        datasets: [
            {
                label: "Doanh thu",
                data: [1200000, 1900000, 1500000, 1700000, 2200000, 2800000, 2100000],
                backgroundColor: "rgba(99, 102, 241, 0.1)",
                borderColor: "rgb(99, 102, 241)",
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: "rgb(99, 102, 241)",
                pointBorderColor: "#fff",
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8,
            },
        ],
    }

    const config = {
        type: "line",
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: {
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    titleColor: "#fff",
                    bodyColor: "#fff",
                    borderColor: "rgb(99, 102, 241)",
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: false,
                    callbacks: {
                        label: (context) => "Doanh thu: " + formatCurrency(context.parsed.y),
                    },
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: "rgba(0, 0, 0, 0.05)",
                        drawBorder: false,
                    },
                    ticks: {
                        callback: (value) => (value / 1000000).toFixed(1) + "M",
                        color: "#64748b",
                        font: {
                            size: 12,
                        },
                    },
                },
                x: {
                    grid: {
                        display: false,
                        drawBorder: false,
                    },
                    ticks: {
                        color: "#64748b",
                        font: {
                            size: 12,
                        },
                    },
                },
            },
            interaction: {
                intersect: false,
                mode: "index",
            },
            animation: {
                duration: 2000,
                easing: "easeInOutQuart",
            },
        },
    }

    new Chart(ctx, config)
}

// Auto-refresh dashboard data every 30 seconds
setInterval(() => {
    loadRecentActivities()
}, 30000)

// Add click handlers for quick actions
document.addEventListener("click", (e) => {
    if (e.target.closest(".quick-action-btn")) {
        const btn = e.target.closest(".quick-action-btn")
        btn.style.transform = "scale(0.95)"
        setTimeout(() => {
            btn.style.transform = ""
        }, 150)
    }
})
