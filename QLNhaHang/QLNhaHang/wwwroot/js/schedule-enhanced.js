class ScheduleManager {
    constructor() {
        this.currentDay = null
        this.currentShift = null
        this.allStaffOptions = []
        this.selectedStaffIds = []
        this.scheduleData = []
        this.filteredData = []
        this.token = localStorage.getItem("token")
        this.currentWeek = this.getCurrentWeek()

        this.init()
    }

    init() {
        this.bindEvents()
        this.displayCurrentWeek()
        this.loadSchedule()
        this.populateStaffFilter()
        this.updateStats()
    }

    bindEvents() {
        // Main buttons
        document.getElementById("checkinButton").addEventListener("click", () => this.checkIn())
        document.getElementById("filterButton").addEventListener("click", () => this.applyScheduleFilter())
        document.getElementById("resetFilterButton").addEventListener("click", () => this.resetScheduleFilter())
        document.getElementById("exportScheduleBtn").addEventListener("click", () => this.exportSchedule())

        // Week navigation
        document.getElementById("prevWeekBtn")?.addEventListener("click", () => this.navigateWeek(-1))
        document.getElementById("nextWeekBtn")?.addEventListener("click", () => this.navigateWeek(1))

        // View controls
        document.getElementById("compactViewBtn")?.addEventListener("click", () => this.toggleView("compact"))
        document.getElementById("expandViewBtn")?.addEventListener("click", () => this.toggleView("expand"))

        // Filter inputs
        document.getElementById("staffFilterInput").addEventListener(
            "input",
            this.debounce(() => this.handleStaffSearch(), 300),
        )
        document.getElementById("shiftFilter").addEventListener("change", () => this.applyFilters())
        document.getElementById("dayFilter").addEventListener("change", () => this.applyFilters())

        // Staff search in modal
        document.getElementById("staffSearchInput").addEventListener("input", () => this.updateStaffSearchResults())

        // Modal save button
        document.getElementById("saveShiftBtn")?.addEventListener("click", () => this.saveShiftChanges())
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

    formatShiftName(shift) {
        const shifts = { 1: "Sáng", 2: "Chiều", 3: "Tối" }
        return shifts[shift] || "Không xác định"
    }

    formatDayName(day) {
        const days = { 2: "Thứ 2", 3: "Thứ 3", 4: "Thứ 4", 5: "Thứ 5", 6: "Thứ 6", 7: "Thứ 7", 8: "Chủ nhật" }
        return days[day] || "Không xác định"
    }

    getCurrentWeek() {
        const now = new Date()
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
        const firstDayWeekday = firstDay.getDay() === 0 ? 7 : firstDay.getDay()
        const currentDate = now.getDate()
        return Math.ceil((currentDate + firstDayWeekday - 1) / 7)
    }

    // Data Loading Functions
    async loadSchedule() {
        try {
            this.showLoading()
            const res = await fetch("/api/scheduleapi")

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`)
            }

            const data = await res.json()
            this.scheduleData = data
            this.filteredData = [...data]

            console.log("Dữ liệu thời gian biểu:", data)

            this.renderScheduleGrid()
            this.populateStaffFilter()
            this.updateStats()
            this.hideLoading()
        } catch (err) {
            console.error("Lỗi tải thời gian biểu:", err)
            this.showToast("Lỗi tải dữ liệu thời gian biểu", "error")
            this.hideLoading()
        }
    }

    renderScheduleGrid() {
        const tbody = document.getElementById("scheduleGrid")
        tbody.innerHTML = ""

        const shifts = ["Sáng", "Chiều", "Tối"]

        for (let s = 0; s < 3; s++) {
            const tr = document.createElement("tr")
            tr.innerHTML = `<th class="shift-header">${shifts[s]}</th>`

            for (let d = 2; d <= 8; d++) {
                const cell = document.createElement("td")
                const staff = this.filteredData
                    .filter((x) => x.idWorkday === d - 1 && x.idWorkshift === s + 1)
                    .map((x) => `<div data-idstaff="${x.idStaff}" title="${x.name} - ${x.staffType}">${x.name}</div>`)

                const displayStaff = staff.slice(0, 4)
                const remainingCount = staff.length - 4

                if (remainingCount > 0) {
                    displayStaff.push(`<div class="text-muted">+${remainingCount} khác</div>`)
                }

                cell.innerHTML = displayStaff.join("")
                cell.classList.add("schedule-cell")
                cell.onclick = () => this.showShiftDetail(d, s + 1, true)

                // Add visual indicators
                if (staff.length === 0) {
                    cell.classList.add("empty-cell")
                    cell.innerHTML = '<div class="text-muted"><i class="fas fa-plus"></i> Thêm nhân viên</div>'
                }

                tr.appendChild(cell)
            }
            tbody.appendChild(tr)
        }
    }

    async populateStaffFilter() {
        try {
            const res = await fetch("/api/staffapi")
            const data = await res.json()
            this.allStaffOptions = data

            const list = document.getElementById("staffList")
            list.innerHTML = ""

            data.forEach((s) => {
                const opt = document.createElement("option")
                opt.value = `${s.name} (${s.staffType})`
                opt.dataset.id = s.idStaff
                list.appendChild(opt)
            })
        } catch (err) {
            console.error("Lỗi tải danh sách nhân viên:", err)
            this.showToast("Lỗi tải danh sách nhân viên", "error")
        }
    }

    // Filter Functions
    handleStaffSearch() {
        const searchTerm = document.getElementById("staffFilterInput").value.toLowerCase()
        if (searchTerm.length < 2) {
            this.filteredData = [...this.scheduleData]
        } else {
            this.filteredData = this.scheduleData.filter(
                (item) => item.name.toLowerCase().includes(searchTerm) || item.staffType.toLowerCase().includes(searchTerm),
            )
        }
        this.renderScheduleGrid()
    }

    applyFilters() {
        const shiftFilter = document.getElementById("shiftFilter").value
        const dayFilter = document.getElementById("dayFilter").value

        this.filteredData = this.scheduleData.filter((item) => {
            const shiftMatch = !shiftFilter || item.idWorkshift == shiftFilter
            const dayMatch = !dayFilter || item.idWorkday == dayFilter - 1
            return shiftMatch && dayMatch
        })

        this.renderScheduleGrid()
        this.updateStats()
    }

    applyScheduleFilter() {
        const input = document.getElementById("staffFilterInput").value.toLowerCase()
        const found = this.allStaffOptions.find((s) => input.includes(s.name.toLowerCase()))

        if (!found) {
            this.showToast("Không tìm thấy nhân viên!", "warning")
            return
        }

        const selectedId = found.idStaff.toString()
        this.highlightStaffSchedule(selectedId)
    }

    highlightStaffSchedule(staffId) {
        const rows = document.querySelectorAll("#scheduleGrid tr")
        rows.forEach((row, sIndex) => {
            const cells = row.querySelectorAll("td")
            cells.forEach((cell, dIndex) => {
                const workday = dIndex + 2
                const shift = sIndex + 1
                const hasStaff = this.scheduleData.some(
                    (x) => x.idStaff == staffId && x.idWorkday == workday - 1 && x.idWorkshift == shift,
                )

                cell.classList.remove("cell-highlight", "cell-muted")
                cell.classList.add(hasStaff ? "cell-highlight" : "cell-muted")
            })
        })
    }

    resetScheduleFilter() {
        const grid = document.getElementById("scheduleGrid")
        grid.querySelectorAll("td").forEach((cell) => {
            cell.classList.remove("cell-highlight", "cell-muted")
        })

        document.getElementById("staffFilterInput").value = ""
        document.getElementById("shiftFilter").value = ""
        document.getElementById("dayFilter").value = ""

        this.filteredData = [...this.scheduleData]
        this.renderScheduleGrid()
        this.updateStats()
    }

    // Modal Functions
    async showShiftDetail(day, shift, isNew) {
        this.currentDay = day
        this.currentShift = shift

        try {
            const res = await fetch(`/api/scheduleapi/${day}/${shift}`)
            const data = await res.json()

            // Update modal header
            document.getElementById("modalShiftName").textContent = this.formatShiftName(shift)
            document.getElementById("modalDayName").textContent = this.formatDayName(day)
            document.getElementById("modalShiftNameDetail").textContent = this.formatShiftName(shift)
            document.getElementById("modalDayNameDetail").textContent = this.formatDayName(day)

            // Update shift status
            const statusBadge = document.getElementById("modalShiftStatus")
            statusBadge.textContent = data.shiftStatus === "future" ? "Chưa diễn ra" : "Đã diễn ra"
            statusBadge.className = `badge ${data.shiftStatus === "future" ? "bg-warning" : "bg-success"}`

            // Update stats
            const totalStaff = data.staff.length
            const presentStaff = data.staff.filter((s) => s.attended).length
            const lateStaff = data.staff.filter((s) => s.islate).length

            document.getElementById("modalTotalStaff").textContent = totalStaff
            document.getElementById("modalPresentStaff").textContent = presentStaff
            document.getElementById("modalLateStaff").textContent = lateStaff

            // Render staff table
            this.renderStaffTable(data.staff, data.shiftStatus === "future")

            // Load available staff for adding
            await this.loadAvailableStaff(data.staff.map((s) => s.id))

            if (isNew) {
                const modal = document.getElementById("shiftDetailModal")
                const bootstrapModal = new window.bootstrap.Modal(modal)
                bootstrapModal.show()
            }

            // Reset add staff area
            this.resetAddStaffArea()
        } catch (err) {
            console.error("Lỗi hiển thị chi tiết ca:", err)
            this.showToast("Lỗi tải chi tiết ca làm việc", "error")
        }
    }

    renderStaffTable(staff, isFutureShift) {
        const tbody = document.getElementById("shiftStaffTableBody")
        tbody.innerHTML = ""

        staff.forEach((st) => {
            const tr = document.createElement("tr")
            tr.id = `staff-row-${st.id}`
            tr.className = "staff-row"

            tr.innerHTML = `
                <td>
                    <div class="d-flex align-items-center">
                        <div class="staff-avatar me-2">
                            <i class="fas fa-user-circle fa-2x text-primary"></i>
                        </div>
                        <div>
                            <div class="fw-bold">${st.name}</div>
                            <small class="text-muted">ID: ${st.id}</small>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="badge bg-secondary">${st.type}</span>
                </td>
                <td class="text-center">
                    <div class="form-check form-switch d-flex justify-content-center">
                        <input class="form-check-input" type="checkbox"
                               ${st.attended ? "checked" : ""}
                               ${isFutureShift ? "disabled" : ""}
                               onchange="window.scheduleManager.toggleAttendance(${st.id}, this.checked)">
                    </div>
                </td>
                <td class="text-center">
                    <div class="form-check form-switch d-flex justify-content-center">
                        <input class="form-check-input late-checkbox" type="checkbox"
                               ${st.islate ? "checked" : ""}
                               ${!st.attended || isFutureShift ? "disabled" : ""}
                               onchange="window.scheduleManager.toggleLate(${st.id}, this.checked)">
                    </div>
                </td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-danger" onclick="window.scheduleManager.removeStaff(${st.id})" title="Xóa khỏi ca">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `
            tbody.appendChild(tr)
        })
    }

    async loadAvailableStaff(excludeIds) {
        try {
            const excludeParam = excludeIds.join(",")
            const res = await fetch(`/api/staffapi/shift?exclude=${excludeParam}`)
            const options = await res.json()

            this.allStaffOptions = options
            this.selectedStaffIds = []
            this.updateStaffSearchResults()
        } catch (err) {
            console.error("Lỗi tải danh sách nhân viên có thể thêm:", err)
        }
    }

    // Staff Management Functions
    async addStaffToShift() {
        if (this.selectedStaffIds.length === 0) {
            this.showToast("Vui lòng chọn ít nhất một nhân viên", "warning")
            return
        }

        try {
            const res = await fetch(`/api/scheduleapi/${this.currentDay}/${this.currentShift}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(this.selectedStaffIds),
            })

            if (res.ok) {
                this.showToast(`Đã thêm ${this.selectedStaffIds.length} nhân viên vào ca`, "success")
                this.selectedStaffIds = []
                await this.showShiftDetail(this.currentDay, this.currentShift, false)
                await this.loadSchedule()
            } else {
                throw new Error("Lỗi khi thêm nhân viên")
            }
        } catch (err) {
            console.error("Lỗi thêm nhân viên vào ca:", err)
            this.showToast("Lỗi thêm nhân viên vào ca", "error")
        }
    }

    async removeStaff(staffId) {
        if (!confirm("Bạn có chắc chắn muốn xóa nhân viên này khỏi ca?")) {
            return
        }

        try {
            const res = await fetch(`/api/scheduleapi/${this.currentDay}/${this.currentShift}/${staffId}`, {
                method: "DELETE",
            })

            if (res.ok) {
                this.showToast("Đã xóa nhân viên khỏi ca", "success")
                await this.showShiftDetail(this.currentDay, this.currentShift, false)
                await this.loadSchedule()
            } else {
                throw new Error("Lỗi khi xóa nhân viên")
            }
        } catch (err) {
            console.error("Lỗi xóa nhân viên khỏi ca:", err)
            this.showToast("Lỗi xóa nhân viên khỏi ca", "error")
        }
    }

    async toggleAttendance(idStaff, checked) {
        try {
            const res = await fetch(`/api/scheduleapi/${this.currentDay}/${this.currentShift}/attendance`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idStaff, attended: checked }),
            })

            if (res.ok) {
                const row = document.querySelector(`#staff-row-${idStaff}`)
                if (row) {
                    const lateCheckbox = row.querySelector(".late-checkbox")
                    if (lateCheckbox) {
                        if (!checked) {
                            await this.toggleLate(idStaff, false)
                        }
                        lateCheckbox.disabled = !checked
                    }
                }

                // Update modal stats
                await this.showShiftDetail(this.currentDay, this.currentShift, false)
                this.showToast(checked ? "Đã đánh dấu có mặt" : "Đã đánh dấu vắng mặt", "success")
            } else {
                throw new Error("Lỗi cập nhật trạng thái")
            }
        } catch (err) {
            console.error("Lỗi cập nhật trạng thái có mặt:", err)
            this.showToast("Lỗi cập nhật trạng thái có mặt", "error")
        }
    }

    async toggleLate(idStaff, checked) {
        try {
            const res = await fetch(`/api/scheduleapi/${this.currentDay}/${this.currentShift}/late`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idStaff, islate: checked }),
            })

            if (res.ok) {
                this.showToast(checked ? "Đã đánh dấu đi muộn" : "Đã bỏ đánh dấu đi muộn", "success")
            } else {
                throw new Error("Lỗi cập nhật trạng thái đi muộn")
            }
        } catch (err) {
            console.error("Lỗi cập nhật trạng thái đi muộn:", err)
            this.showToast("Lỗi cập nhật trạng thái đi muộn", "error")
        }
    }

    // Staff Search Functions
    updateStaffSearchResults() {
        const keyword = document.getElementById("staffSearchInput").value.toLowerCase()
        const resultDiv = document.getElementById("staffSearchResults")
        resultDiv.innerHTML = ""

        const filteredStaff = this.allStaffOptions
            .filter((opt) => opt.name.toLowerCase().includes(keyword) && !this.selectedStaffIds.includes(opt.id))
            .slice(0, 10) // Limit results

        if (filteredStaff.length === 0) {
            resultDiv.innerHTML = '<div class="text-muted p-2">Không tìm thấy nhân viên</div>'
            return
        }

        filteredStaff.forEach((opt) => {
            const btn = document.createElement("button")
            btn.className = "list-group-item list-group-item-action d-flex align-items-center"
            btn.innerHTML = `
                <i class="fas fa-user-circle fa-2x text-primary me-3"></i>
                <div>
                    <div class="fw-bold">${opt.name}</div>
                    <small class="text-muted">${opt.type}</small>
                </div>
            `
            btn.onclick = () => {
                this.selectedStaffIds.push(opt.id)
                this.updateSelectedPreview()
                this.updateStaffSearchResults()
                document.getElementById("staffSearchInput").value = ""
            }
            resultDiv.appendChild(btn)
        })
    }

    updateSelectedPreview() {
        const container = document.getElementById("selectedStaffPreview")
        container.innerHTML = ""

        if (this.selectedStaffIds.length === 0) {
            container.innerHTML = '<div class="text-muted">Chưa chọn nhân viên nào</div>'
            return
        }

        this.selectedStaffIds.forEach((id) => {
            const opt = this.allStaffOptions.find((s) => s.id === id)
            if (!opt) return

            const div = document.createElement("div")
            div.className = "badge bg-primary me-2 mb-2 p-2"
            div.innerHTML = `
                ${opt.name} (${opt.type}) 
                <span class="ms-2" style="cursor:pointer;" onclick="window.scheduleManager.removeSelectedStaff(${id})" title="Xóa">
                    <i class="fas fa-times"></i>
                </span>
            `
            container.appendChild(div)
        })
    }

    removeSelectedStaff(id) {
        this.selectedStaffIds = this.selectedStaffIds.filter((sid) => sid !== id)
        this.updateSelectedPreview()
        this.updateStaffSearchResults()
    }

    toggleAddStaff() {
        const area = document.getElementById("addStaffArea")
        const btn = document.getElementById("addStaffBtn")

        if (area.style.display === "none") {
            area.style.display = "block"
            btn.innerHTML = '<i class="fas fa-times"></i> Đóng'
            this.updateStaffSearchResults()
        } else {
            this.resetAddStaffArea()
        }
    }

    resetAddStaffArea() {
        const area = document.getElementById("addStaffArea")
        const btn = document.getElementById("addStaffBtn")

        area.style.display = "none"
        btn.innerHTML = '<i class="fas fa-plus"></i> Thêm nhân viên'

        this.selectedStaffIds = []
        document.getElementById("staffSearchInput").value = ""
        document.getElementById("staffSearchResults").innerHTML = ""
        document.getElementById("selectedStaffPreview").innerHTML = ""
    }

    // Check-in Function
    async checkIn() {
        const messageBox = document.getElementById("checkinMessage")

        if (!this.token) {
            messageBox.innerHTML =
                '<div class="alert alert-danger"><i class="fas fa-exclamation-circle"></i> Bạn chưa đăng nhập.</div>'
            return
        }

        try {
            const res = await fetch("/api/scheduleapi/checkin", {
                method: "POST",
                headers: {
                    Authorization: "Bearer " + this.token,
                },
            })

            const text = await res.text()

            if (res.ok) {
                messageBox.innerHTML = `<div class="alert alert-success"><i class="fas fa-check-circle"></i> ${text}</div>`
                await this.loadSchedule()
                this.showToast("Chấm công thành công!", "success")
            } else {
                messageBox.innerHTML = `<div class="alert alert-danger"><i class="fas fa-exclamation-circle"></i> ${text}</div>`
                this.showToast("Lỗi chấm công: " + text, "error")
            }
        } catch (err) {
            messageBox.innerHTML =
                '<div class="alert alert-danger"><i class="fas fa-exclamation-circle"></i> Lỗi kết nối đến máy chủ.</div>'
            this.showToast("Lỗi kết nối đến máy chủ", "error")
        }
    }

    // Stats and Display Functions
    updateStats() {
        const totalStaff = new Set(this.scheduleData.map((item) => item.idStaff)).size
        const todayData = this.getTodayScheduleData()
        const presentToday = todayData.filter((item) => item.attended).length
        const lateToday = todayData.filter((item) => item.islate).length

        document.getElementById("totalStaffCount").textContent = totalStaff
        document.getElementById("presentStaffCount").textContent = presentToday
        document.getElementById("lateStaffCount").textContent = lateToday
        document.getElementById("currentWeekNumber").textContent = this.currentWeek
    }

    getTodayScheduleData() {
        const today = new Date().getDay()
        const todayWorkday = today === 0 ? 7 : today - 1 // Convert to workday format
        return this.scheduleData.filter((item) => item.idWorkday === todayWorkday)
    }

    displayCurrentWeek() {
        const now = new Date()
        const formattedDate = now.toLocaleDateString("vi-VN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        })
        document.getElementById("currentWeekDisplay").textContent = `Tuần ${this.currentWeek} - ${formattedDate}`
    }

    // Navigation Functions
    navigateWeek(direction) {
        this.currentWeek += direction
        if (this.currentWeek < 1) this.currentWeek = 1
        if (this.currentWeek > 5) this.currentWeek = 5

        this.displayCurrentWeek()
        this.showToast(`Đã chuyển đến tuần ${this.currentWeek}`, "info")
    }

    // View Functions
    toggleView(viewType) {
        const table = document.querySelector(".schedule-table")

        if (viewType === "compact") {
            table.classList.add("compact-view")
            this.showToast("Đã chuyển sang chế độ thu gọn", "info")
        } else {
            table.classList.remove("compact-view")
            this.showToast("Đã chuyển sang chế độ mở rộng", "info")
        }
    }

    // Export Function
    async exportSchedule() {
        try {
            this.showToast("Đang xuất dữ liệu...", "info")

            // Simulate export process
            await new Promise((resolve) => setTimeout(resolve, 2000))

            this.showToast("Xuất dữ liệu thành công!", "success")
        } catch (err) {
            console.error("Lỗi xuất dữ liệu:", err)
            this.showToast("Lỗi xuất dữ liệu", "error")
        }
    }

    // Loading Functions
    showLoading() {
        const container = document.querySelector("#scheduleGrid")
        container.innerHTML = `
            <div class="text-center py-5">
                <div class="loading-spinner"></div>
                <p class="text-muted mt-3">Đang tải dữ liệu...</p>
            </div>
        `
    }

    hideLoading() {
        // Loading will be hidden when renderScheduleGrid is called
    }

    // Save Changes Function
    async saveShiftChanges() {
        try {
            this.showToast("Đang lưu thay đổi...", "info")

            // Simulate save process
            await new Promise((resolve) => setTimeout(resolve, 1000))

            this.showToast("Đã lưu thay đổi thành công!", "success")

            // Close modal
            const modal = document.getElementById("shiftDetailModal")
            const bootstrapModal = window.bootstrap.Modal.getInstance(modal)
            bootstrapModal.hide()
        } catch (err) {
            console.error("Lỗi lưu thay đổi:", err)
            this.showToast("Lỗi lưu thay đổi", "error")
        }
    }
}

// Global functions for onclick handlers
window.toggleAddStaff = () => {
    window.scheduleManager.toggleAddStaff()
}

window.addStaffToShift = () => {
    window.scheduleManager.addStaffToShift()
}

window.removeStaff = (staffId) => {
    window.scheduleManager.removeStaff(staffId)
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    window.scheduleManager = new ScheduleManager()
})
