let payrollList = []

document.addEventListener("DOMContentLoaded", () => {
    initializePayrollPage()
})

async function initializePayrollPage() {
    showLoadingState()
    await loadPayrolls()
    hideLoadingState()
   // updateStats()
    loadYearFilter()
}

function showLoadingState() {
    document.getElementById("loadingState").style.display = "block"
    document.getElementById("payrollGrid").style.display = "none"
    document.getElementById("emptyState").style.display = "none"
}

function hideLoadingState() {
    document.getElementById("loadingState").style.display = "none"
    document.getElementById("payrollGrid").style.display = "grid"
}

async function loadPayrolls() {
    try {
        const res = await fetch("/api/payrollapi")
        if (!res.ok) {
            throw new Error("Không thể tải danh sách bảng lương")
        }
        payrollList = await res.json()
        renderPayrollGrid()
    } catch (error) {
        console.error("Lỗi khi tải bảng lương:", error)
        showNotification("Có lỗi xảy ra khi tải dữ liệu", "error")
    }
}

function renderPayrollGrid() {
    const grid = document.getElementById("payrollGrid")
    const emptyState = document.getElementById("emptyState")

    if (payrollList.length === 0) {
        grid.style.display = "none"
        emptyState.style.display = "block"
        return
    }

    grid.style.display = "grid"
    emptyState.style.display = "none"
    grid.innerHTML = ""

    payrollList.forEach((payroll, index) => {
        const payrollCard = createPayrollCard(payroll)
        payrollCard.style.animationDelay = `${index * 0.1}s`
        grid.appendChild(payrollCard)
    })
}

function createPayrollCard(payroll) {
    const card = document.createElement("div")
    card.className = "payroll-item"

    const monthNames = [
        "",
        "Tháng 1",
        "Tháng 2",
        "Tháng 3",
        "Tháng 4",
        "Tháng 5",
        "Tháng 6",
        "Tháng 7",
        "Tháng 8",
        "Tháng 9",
        "Tháng 10",
        "Tháng 11",
        "Tháng 12",
    ]

    card.innerHTML = `
        <div class="payroll-header">
            <div class="payroll-period">
                <span class="month-badge">${monthNames[payroll.month]}</span>
                <span class="year-badge">${payroll.year}</span>
            </div>
        </div>
        
        <div class="payroll-info">
            <div class="info-row">
                <span class="info-label">
                    <i class="fas fa-calendar"></i>
                    Thời gian
                </span>
                <span class="info-value">${monthNames[payroll.month]} ${payroll.year}</span>
            </div>
            
            <div class="info-row">
                <span class="info-label">
                    <i class="fas fa-users"></i>
                    Số nhân viên
                </span>
                <span class="info-value">${payroll.employeeCount || 0} người</span>
            </div>       
           
        </div>
        
        <div class="payroll-actions">
            <a href="/Payroll/Detail?id=${payroll.id}" class="btn btn-detail" title="Xem chi tiết">
                <i class="fas fa-eye"></i>
                Chi tiết
            </a>
        </div>
    `

    return card
}

function updateStats() {
    const totalPayrolls = payrollList.length
    const currentDate = new Date()
    const currentMonth = `Tháng ${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`

    // Calculate total employees from latest payroll
    const totalEmployees = payrollList.length > 0 ? Math.max(...payrollList.map((p) => p.employeeCount || 0)) : 0

    document.getElementById("totalPayrolls").textContent = totalPayrolls
    document.getElementById("currentMonth").textContent = currentMonth
    document.getElementById("totalEmployees").textContent = totalEmployees
}

function loadYearFilter() {
    const yearFilter = document.getElementById("yearFilter")
    const years = [...new Set(payrollList.map((p) => p.year))].sort((a, b) => b - a)

    yearFilter.innerHTML = '<option value="">Tất cả năm</option>'
    years.forEach((year) => {
        const option = document.createElement("option")
        option.value = year
        option.text = `Năm ${year}`
        yearFilter.appendChild(option)
    })
}

function createNewPayroll() {
    // This would typically open a modal or redirect to a creation page
    const currentDate = new Date()
    const month = currentDate.getMonth() + 1
    const year = currentDate.getFullYear()

    if (confirm(`Tạo bảng lương cho tháng ${month}/${year}?`)) {
        // Call API to create new payroll
        showNotification("Chức năng đang được phát triển", "info")
    }
}

function editPayroll(id) {
    showNotification("Chức năng đang được phát triển", "info")
}

function deletePayroll(id) {
    if (confirm("Bạn có chắc chắn muốn xóa bảng lương này?")) {
        showNotification("Chức năng đang được phát triển", "info")
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(amount)
}

function formatDate(dateString) {
    if (!dateString) return "--"
    const date = new Date(dateString)
    return date.toLocaleDateString("vi-VN")
}

function showNotification(message, type = "info") {
    const notification = document.createElement("div")
    notification.className = `alert alert-${type === "error" ? "danger" : type} alert-dismissible fade show notification-toast`
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `

    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `

    document.body.appendChild(notification)

    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove()
        }
    }, 5000)
}

// Add filter functionality
document.getElementById("yearFilter").addEventListener("change", filterPayrolls)
document.getElementById("monthFilter").addEventListener("change", filterPayrolls)

function filterPayrolls() {
    const yearFilter = document.getElementById("yearFilter").value
    const monthFilter = document.getElementById("monthFilter").value

    let filteredPayrolls = [...payrollList]

    if (yearFilter) {
        filteredPayrolls = filteredPayrolls.filter((payroll) => payroll.year == yearFilter)
    }

    if (monthFilter) {
        filteredPayrolls = filteredPayrolls.filter((payroll) => payroll.month == monthFilter)
    }

    const originalList = payrollList
    payrollList = filteredPayrolls
    renderPayrollGrid()
    payrollList = originalList // Restore original list
}
