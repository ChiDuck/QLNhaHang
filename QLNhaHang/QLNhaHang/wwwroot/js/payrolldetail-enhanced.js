class PayrollDetailManager {
    constructor() {
        this.payrollId = this.getPayrollIdFromUrl()
        this.payrollData = []
        this.filteredData = []
        this.currentView = "grid"
        this.currentPage = 1
        this.itemsPerPage = 12
        this.totalItems = 0
        this.hourlysalary = 0
        this.init()
    }

    init() {
        this.bindEvents()
        this.loadPayrollDetails()
    }

    bindEvents() {
        console.log(this.payrollId);
        // Search and filter
        document.getElementById("employeeSearch").addEventListener(
            "input",
            this.debounce(() => this.handleSearch(), 300),
        )
        document.getElementById("resetFilters").addEventListener("click", () => this.resetFilters())

        // View controls
        document.getElementById("gridViewBtn").addEventListener("click", () => this.switchView("grid"))
        document.getElementById("listViewBtn").addEventListener("click", () => this.switchView("list"))

        // Modal actions
        document
            .getElementById("calculateSalaryBtn")
            .addEventListener("click", () => this.calculateSalary())

            // Form inputs for auto-calculation
            ;["pd_Days", "pd_Hours", "pd_Absencetimes", "pd_Latetimes", "pd_Subtract", "pd_Bonus"].forEach((id) => {
                document.getElementById(id).addEventListener("input", () => this.autoCalculateSalary())
            })
    }

    // Utility Functions
    debounce(func, wait) {
        let timeout
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout)
                func(...args)
            }
            clearTimeout(timeout)
            timeout = setTimeout(later, wait)
        }
    }

    getPayrollIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search)
        return urlParams.get("id")
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount)
    }

    showToast(message, type = "success") {
        const toastContainer = document.querySelector(".toast-container") || this.createToastContainer()
        const toast = document.createElement("div")
        toast.className = `toast ${type}`
        toast.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas fa-${type === "success" ? "check-circle" : type === "error" ? "exclamation-circle" : "info-circle"} me-2"></i>
                <span>${message}</span>
            </div>
        `

        toastContainer.appendChild(toast)

        setTimeout(() => {
            toast.remove()
        }, 5000)
    }

    createToastContainer() {
        const container = document.createElement("div")
        container.className = "toast-container"
        document.body.appendChild(container)
        return container
    }

    showLoading() {
        document.getElementById("loadingOverlay").style.display = "flex"
    }

    hideLoading() {
        document.getElementById("loadingOverlay").style.display = "none"
    }

    // Data Loading Functions
    async loadPayrollDetails() {
        if (!this.payrollId) {
            this.showToast("Không tìm thấy ID bảng lương", "error")
            return
        }

        try {
            this.showLoading()
            console.log("Loading payroll details for ID:", this.payrollId)

            const res = await fetch(`/api/payrollapi/${this.payrollId}`)
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`)
            }

            const data = await res.json()
            console.log("Payroll data:", data)

            this.payrollData = data.details || []
            this.filteredData = [...this.payrollData]

            this.updateHeader(data.month, data.year)
            // this.updateSummaryStats()
            this.renderPayrollData()
            this.updatePagination()

            this.hideLoading()
        } catch (err) {
            console.error("Lỗi tải chi tiết bảng lương:", err)
            this.showToast("Lỗi tải dữ liệu bảng lương", "error")
            this.hideLoading()
        }
    }

    updateHeader(month, year) {
        document.getElementById("payrollMonth").textContent = month
        document.getElementById("payrollYear").textContent = year
    }

    updateSummaryStats() {
        const totalEmployees = this.filteredData.length
        const totalSalary = this.filteredData.reduce((sum, item) => sum + (item.totalsalary || 0), 0)
        const totalBonus = this.filteredData.reduce((sum, item) => sum + (item.bonus || 0), 0)
        const totalDeduction = this.filteredData.reduce((sum, item) => sum + (item.subtract || 0), 0)

        document.getElementById("totalEmployees").textContent = totalEmployees
        document.getElementById("totalSalary").textContent = this.formatCurrency(totalSalary).replace("₫", "")
        document.getElementById("totalBonus").textContent = this.formatCurrency(totalBonus).replace("₫", "")
        document.getElementById("totalDeduction").textContent = this.formatCurrency(totalDeduction).replace("₫", "")
    }

    // Rendering Functions
    renderPayrollData() {
        if (this.currentView === "grid") {
            this.renderGridView()
        } else {
            this.renderListView()
        }
    }

    renderGridView() {
        const container = document.getElementById("payrollGrid")
        container.innerHTML = ""

        const startIndex = (this.currentPage - 1) * this.itemsPerPage
        const endIndex = startIndex + this.itemsPerPage
        const pageData = this.filteredData.slice(startIndex, endIndex)
        console.log("Rendering grid view with data:", pageData)
        if (pageData.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-inbox fa-4x text-muted mb-3"></i>
                    <h4>Không có dữ liệu</h4>
                    <p class="text-muted">Không tìm thấy nhân viên nào phù hợp với bộ lọc</p>
                </div>
            `
            return
        }

        pageData.forEach((employee) => {
            const card = this.createEmployeeCard(employee)
            container.appendChild(card)
        })
    }

    createEmployeeCard(employee) {
        const card = document.createElement("div")
        card.className = "payroll-item"

        const initials = employee.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .substring(0, 2)

        card.innerHTML = `
            <div class="employee-header">
                <div class="employee-avatar">${initials}</div>
                <div class="employee-info">
                    <h5>${employee.name}</h5>
                    <span class="employee-position">${employee.type}</span>
                </div>
            </div>
            
            <div class="payroll-details">
                <div class="detail-item">
                    <span class="detail-label">Ngày làm việc</span>
                    <span class="detail-value">${employee.days || 0} ngày</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Tổng giờ</span>
                    <span class="detail-value">${employee.hours || 0} giờ</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Nghỉ / Muộn</span>
                    <span class="detail-value">${employee.absencetimes || 0} / ${employee.latetimes || 0}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Thưởng</span>
                    <span class="detail-value currency">+${this.formatCurrency(employee.bonus || 0).replace("₫", "")}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Trừ</span>
                    <span class="detail-value negative">-${this.formatCurrency(employee.subtract || 0).replace("₫", "")}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label"><strong>Tổng lương</strong></span>
                    <span class="detail-value currency"><strong>${this.formatCurrency(employee.totalsalary || 0).replace("₫", "")}</strong></span>
                </div>
            </div>
            
            <div class="payroll-actions">
                <button class="btn btn-outline-primary btn-sm" onclick="payrollDetailManager.showPayrollDetail(${employee.id}, '${employee.name}')">
                    <i class="fas fa-eye"></i>
                    Xem chi tiết
                </button>
                <button class="btn btn-outline-success btn-sm" onclick="payrollDetailManager.editPayrollDetail(${employee.id}, '${employee.name}')">
                    <i class="fas fa-edit"></i>
                    Chỉnh sửa
                </button>
            </div>
        `

        return card
    }

    renderListView() {
        const tbody = document.getElementById("payrollTableBody")
        tbody.innerHTML = ""

        const startIndex = (this.currentPage - 1) * this.itemsPerPage
        const endIndex = startIndex + this.itemsPerPage
        const pageData = this.filteredData.slice(startIndex, endIndex)

        if (pageData.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="11" class="text-center py-5">
                        <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                        <h5>Không có dữ liệu</h5>
                        <p class="text-muted">Không tìm thấy nhân viên nào phù hợp với bộ lọc</p>
                    </td>
                </tr>
            `
            return
        }

        pageData.forEach((employee) => {
            const row = document.createElement("tr")
            row.innerHTML = `
                <td>
                    <div class="d-flex align-items-center">
                        <div class="employee-avatar me-2" style="width: 40px; height: 40px; font-size: 0.9rem;">
                            ${employee.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)}
                        </div>
                        <div>
                            <div class="fw-bold">${employee.name}</div>
                            <small class="text-muted">ID: ${employee.id}</small>
                        </div>
                    </div>
                </td>
                <td><span class="badge bg-secondary">${employee.type}</span></td>
                <td class="text-center">${employee.days || 0}</td>
                <td class="text-center">${employee.hours || 0}</td>
                <td class="text-center">${employee.absencetimes || 0}</td>
                <td class="text-center">${employee.latetimes || 0}</td>
                <td class="text-end">${this.formatCurrency((employee.totalsalary || 0) - (employee.bonus || 0) + (employee.subtract || 0)).replace("₫", "")}</td>
                <td class="text-end text-success">+${this.formatCurrency(employee.bonus || 0).replace("₫", "")}</td>
                <td class="text-end text-danger">-${this.formatCurrency(employee.subtract || 0).replace("₫", "")}</td>
                <td class="text-end fw-bold">${this.formatCurrency(employee.totalsalary || 0).replace("₫", "")}</td>
                <td class="text-center">
                    <div class="btn-group" role="group">
                        <button class="btn btn-outline-primary btn-sm" onclick="payrollDetailManager.showPayrollDetail(${employee.id}, '${employee.name}')" title="Xem chi tiết">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline-success btn-sm" onclick="payrollDetailManager.editPayrollDetail(${employee.id}, '${employee.name}')" title="Chỉnh sửa">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </td>
            `
            tbody.appendChild(row)
        })
    }

    // Filter and Search Functions
    handleSearch() {
        const searchTerm = document.getElementById("employeeSearch").value.toLowerCase()
        this.applyFilters()
    }

    applyFilters() {
        const searchTerm = document.getElementById("employeeSearch").value.toLowerCase()

        this.filteredData = this.payrollData.filter((employee) => {
            const matchesSearch =
                !searchTerm ||
                employee.name.toLowerCase().includes(searchTerm) ||
                employee.type.toLowerCase().includes(searchTerm)

            return matchesSearch
        })

        //this.applySorting()
        this.currentPage = 1
        //this.updateSummaryStats()
        this.renderPayrollData()
        this.updatePagination()
    }

    applySorting() {
        const sortBy = document.getElementById("sortBy").value

        this.filteredData.sort((a, b) => {
            switch (sortBy) {
                case "name":
                    return a.name.localeCompare(b.name)
                default:
                    return 0
            }
        })
    }

    resetFilters() {
        document.getElementById("employeeSearch").value = ""

        this.filteredData = [...this.payrollData]
        this.currentPage = 1
        // this.updateSummaryStats()
        this.renderPayrollData()
        this.updatePagination()

        this.showToast("Đã xóa tất cả bộ lọc", "info")
    }

    // View Management
    switchView(viewType) {
        this.currentView = viewType

        const gridView = document.getElementById("payrollGrid")
        const listView = document.getElementById("payrollList")
        const gridBtn = document.getElementById("gridViewBtn")
        const listBtn = document.getElementById("listViewBtn")

        if (viewType === "grid") {
            gridView.style.display = "grid"
            listView.style.display = "none"
            gridBtn.classList.add("active")
            listBtn.classList.remove("active")
        } else {
            gridView.style.display = "none"
            listView.style.display = "block"
            gridBtn.classList.remove("active")
            listBtn.classList.add("active")
        }

        this.renderPayrollData()
        this.showToast(`Đã chuyển sang chế độ ${viewType === "grid" ? "lưới" : "danh sách"}`, "info")
    }

    // Pagination
    updatePagination() {
        this.totalItems = this.filteredData.length
        const totalPages = Math.ceil(this.totalItems / this.itemsPerPage)

        const pagination = document.getElementById("payrollPagination")
        pagination.innerHTML = ""

        // Previous button
        const prevLi = document.createElement("li")
        prevLi.className = `page-item ${this.currentPage === 1 ? "disabled" : ""}`
        prevLi.innerHTML = `<a class="page-link" href="#" onclick="payrollDetailManager.goToPage(${this.currentPage - 1})">Trước</a>`
        pagination.appendChild(prevLi)

        // Page numbers
        const startPage = Math.max(1, this.currentPage - 2)
        const endPage = Math.min(totalPages, this.currentPage + 2)

        if (startPage > 1) {
            const firstLi = document.createElement("li")
            firstLi.className = "page-item"
            firstLi.innerHTML = `<a class="page-link" href="#" onclick="payrollDetailManager.goToPage(1)">1</a>`
            pagination.appendChild(firstLi)

            if (startPage > 2) {
                const ellipsisLi = document.createElement("li")
                ellipsisLi.className = "page-item disabled"
                ellipsisLi.innerHTML = `<span class="page-link">...</span>`
                pagination.appendChild(ellipsisLi)
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            const li = document.createElement("li")
            li.className = `page-item ${i === this.currentPage ? "active" : ""}`
            li.innerHTML = `<a class="page-link" href="#" onclick="payrollDetailManager.goToPage(${i})">${i}</a>`
            pagination.appendChild(li)
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const ellipsisLi = document.createElement("li")
                ellipsisLi.className = "page-item disabled"
                ellipsisLi.innerHTML = `<span class="page-link">...</span>`
                pagination.appendChild(ellipsisLi)
            }

            const lastLi = document.createElement("li")
            lastLi.className = "page-item"
            lastLi.innerHTML = `<a class="page-link" href="#" onclick="payrollDetailManager.goToPage(${totalPages})">${totalPages}</a>`
            pagination.appendChild(lastLi)
        }

        // Next button
        const nextLi = document.createElement("li")
        nextLi.className = `page-item ${this.currentPage === totalPages ? "disabled" : ""}`
        nextLi.innerHTML = `<a class="page-link" href="#" onclick="payrollDetailManager.goToPage(${this.currentPage + 1})">Sau</a>`
        pagination.appendChild(nextLi)

        // Update pagination info
        const startItem = (this.currentPage - 1) * this.itemsPerPage + 1
        const endItem = Math.min(this.currentPage * this.itemsPerPage, this.totalItems)
        document.getElementById("paginationInfo").textContent =
            `Hiển thị ${startItem} - ${endItem} của ${this.totalItems} nhân viên`
    }

    goToPage(page) {
        const totalPages = Math.ceil(this.totalItems / this.itemsPerPage)
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page
            this.renderPayrollData()
            this.updatePagination()
        }
    }

    // Modal Functions
    async showPayrollDetail(staffId, staffName) {
        try {
            const res = await fetch(`/api/payrollapi/${this.payrollId}/${staffId}`)
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`)
            }

            const data = await res.json()
            this.hourlysalary = data.hourlysalary || 0
            this.populateModal(data, staffName, false)
            new bootstrap.Modal(document.getElementById("payrollDetailModal")).show()
        } catch (err) {
            console.error("Lỗi tải chi tiết bảng lương:", err)
            this.showToast("Lỗi tải chi tiết bảng lương", "error")
        }
    }

    async editPayrollDetail(staffId, staffName) {
        try {
            const res = await fetch(`/api/payrollapi/${this.payrollId}/${staffId}`)
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`)
            }

            const data = await res.json()
            this.hourlysalary = data.hourlysalary || 0
            this.populateModal(data, staffName, true)
            new bootstrap.Modal(document.getElementById("payrollDetailModal")).show()
        } catch (err) {
            console.error("Lỗi tải chi tiết bảng lương:", err)
            this.showToast("Lỗi tải chi tiết bảng lương", "error")
        }
    }

    populateModal(data, staffName, isEditable) {
        // Get employee info
        const employee = this.payrollData.find((emp) => emp.id === data.idStaff)

        document.getElementById("payrollModalStaffName").textContent = staffName
        document.getElementById("employeeName").textContent = staffName
        document.getElementById("employeePosition").textContent = employee?.type || "N/A"

        document.getElementById("pd_IdStaff").value = data.idStaff
        document.getElementById("pd_IdPayroll").value = data.idPayroll
        document.getElementById("pd_Days").value = data.days || 0
        document.getElementById("pd_Hours").value = data.hours || 0
        document.getElementById("pd_Absencetimes").value = data.absencetimes || 0
        document.getElementById("pd_Latetimes").value = data.latetimes || 0
        document.getElementById("pd_Subtract").value = data.subtract || 0
        document.getElementById("pd_Bonus").value = data.bonus || 0
        document.getElementById("pd_Totalsalary").value = data.totalsalary || 0
        document.getElementById("pd_Note").value = data.note || ""

        // Set readonly state
        const inputs = document.querySelectorAll("#payrollDetailForm input, #payrollDetailForm textarea")
        inputs.forEach((input) => {
            if (input.id !== "pd_IdStaff" && input.id !== "pd_IdPayroll") {
                input.readOnly = !isEditable
            }
        })

        // Show/hide action buttons
        const saveBtn = document.querySelector("#payrollDetailModal .btn-success")
        const calcBtn = document.getElementById("calculateSalaryBtn")
        saveBtn.style.display = isEditable ? "inline-block" : "none"
        calcBtn.style.display = isEditable ? "inline-block" : "none"
    }

    // Salary Calculation
    calculateSalary() {
        const hours = Number.parseFloat(document.getElementById("pd_Hours").value) || 0
        const absences = Number.parseInt(document.getElementById("pd_Absencetimes").value) || 0
        const lates = Number.parseInt(document.getElementById("pd_Latetimes").value) || 0
        const subtract = Number.parseFloat(document.getElementById("pd_Subtract").value) || 0
        const bonus = Number.parseFloat(document.getElementById("pd_Bonus").value) || 0

        let totalSalary = hours * this.hourlysalary
        console.log("Calculated base salary from hours:", this.hourlysalary)

        totalSalary -= subtract
        totalSalary += bonus

        // Ensure minimum salary
        totalSalary = Math.max(0, totalSalary)

        document.getElementById("pd_Totalsalary").value = totalSalary

        this.showToast("Đã tính toán lại lương thành công", "success")
    }

    autoCalculateSalary() {
        // Auto-calculate when user changes values
        this.calculateSalary()
    }

    async savePayrollDetail() {
        const data = {
            idStaff: Number.parseInt(document.getElementById("pd_IdStaff").value),
            idPayroll: Number.parseInt(document.getElementById("pd_IdPayroll").value),
            days: Number.parseInt(document.getElementById("pd_Days").value) || 0,
            hours: Number.parseFloat(document.getElementById("pd_Hours").value) || 0,
            absencetimes: Number.parseInt(document.getElementById("pd_Absencetimes").value) || 0,
            latetimes: Number.parseInt(document.getElementById("pd_Latetimes").value) || 0,
            subtract: Number.parseFloat(document.getElementById("pd_Subtract").value) || 0,
            bonus: Number.parseFloat(document.getElementById("pd_Bonus").value) || 0,
            totalsalary: Number.parseFloat(document.getElementById("pd_Totalsalary").value) || 0,
            note: document.getElementById("pd_Note").value,
        }

        try {
            const res = await fetch(`/api/payrollapi/update`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })

            if (res.ok) {
                this.showToast("Đã lưu thay đổi thành công", "success")
                bootstrap.Modal.getInstance(document.getElementById("payrollDetailModal")).hide()

                // Reload data
                await this.loadPayrollDetails()
            } else {
                const msg = await res.text()
                this.showToast("Lỗi khi lưu: " + msg, "error")
            }
        } catch (err) {
            console.error("Lỗi khi gọi API:", err)
            this.showToast("Lỗi kết nối đến máy chủ", "error")
        }
    }

    // Export and Print Functions
    async exportPayroll() {
        try {
            this.showToast("Đang xuất dữ liệu Excel...", "info")

            // Simulate export process
            await new Promise((resolve) => setTimeout(resolve, 2000))

            this.showToast("Xuất Excel thành công!", "success")
        } catch (err) {
            console.error("Lỗi xuất Excel:", err)
            this.showToast("Lỗi xuất Excel", "error")
        }
    }

    printPayroll() {
        window.print()
        this.showToast("Đã gửi lệnh in", "info")
    }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    window.payrollDetailManager = new PayrollDetailManager()
})
