class TabletypeManager {
    constructor() {
        this.apiUrl = "/api/tabletypeapi"
        this.currentView = "grid"
        this.types = []
        this.tables = []
        this.filteredTypes = []

        this.init()
    }

    async init() {
        await this.loadInitialData()
        this.setupEventListeners()
        // this.updateStats()
        this.renderTypes()
    }

    async loadInitialData() {
        try {
            const [typesRes, tablesRes] = await Promise.all([fetch(this.apiUrl), fetch("/api/dinetableapi")])

            this.types = await typesRes.json()
            this.tables = await tablesRes.json()
            this.filteredTypes = [...this.types]

            // Add usage statistics to types
            this.types.forEach((type) => {
                const tablesUsingType = this.tables.filter((table) => table.idTabletype === type.idTabletype)
                type.usageCount = tablesUsingType.length
                type.usagePercentage = this.tables.length > 0 ? (tablesUsingType.length / this.tables.length) * 100 : 0
            })
        } catch (error) {
            showNotification("Lỗi khi tải dữ liệu: " + error.message)
        }
    }

    setupEventListeners() {
        // Search functionality
        document
            .getElementById("searchInput")
            .addEventListener("input", () => {
                this.filterTypes()
            })

            // Filter functionality
            ;["seatsFilter"].forEach((id) => {
                document.getElementById(id).addEventListener("change", () => {
                    this.filterTypes()
                })
            })

        // View toggle
        document.querySelectorAll(".view-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                this.switchView(e.target.dataset.view)
            })
        })

        // Form submission
        document.getElementById("tabletypeForm").addEventListener("submit", (e) => {
            e.preventDefault()
            this.submitForm()
        })

        // Delete confirmation
        document.getElementById("confirmDelete").addEventListener("click", () => {
            this.confirmDelete()
        })

        // Modal events
        document.getElementById("tabletypeModal").addEventListener("hidden.bs.modal", () => {
            this.resetForm()
        })
    }

    filterTypes() {
        const searchTerm = document.getElementById("searchInput").value.toLowerCase()
        const seatsFilter = document.getElementById("seatsFilter").value
        //  const sortBy = document.getElementById("sortBy").value

        this.filteredTypes = this.types.filter((type) => {
            const matchesSearch = type.name.toLowerCase().includes(searchTerm)

            let matchesSeats = true
            if (seatsFilter) {
                switch (seatsFilter) {
                    case "1-2":
                        matchesSeats = type.seats >= 1 && type.seats <= 2
                        break
                    case "3-4":
                        matchesSeats = type.seats >= 3 && type.seats <= 4
                        break
                    case "5-8":
                        matchesSeats = type.seats >= 5 && type.seats <= 8
                        break
                    case "9+":
                        matchesSeats = type.seats >= 9
                        break
                }
            }

            return matchesSearch && matchesSeats
        })

        // Sort results
        //this.filteredTypes.sort((a, b) => {
        //  switch (sortBy) {
        //    case "name":
        //      return a.name.localeCompare(b.name)
        //    case "seats":
        //      return b.seats - a.seats
        //    case "usage":
        //      return b.usageCount - a.usageCount
        //    default:
        //      return 0
        //  }
        //})

        this.renderTypes()
    }

    switchView(view) {
        this.currentView = view

        // Update button states
        document.querySelectorAll(".view-btn").forEach((btn) => {
            btn.classList.toggle("active", btn.dataset.view === view)
        })

        // Update view visibility
        document.getElementById("gridView").classList.toggle("active", view === "grid")
        document.getElementById("listView").classList.toggle("active", view === "list")

        this.renderTypes()
    }

    renderTypes() {
        if (this.currentView === "grid") {
            this.renderGridView()
        } else {
            this.renderListView()
        }
    }

    renderGridView() {
        const container = document.getElementById("typesGrid")
        container.innerHTML = ""

        if (this.filteredTypes.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-layer-group fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">Không tìm thấy loại bàn nào</h5>
                </div>
            `
            return
        }

        this.filteredTypes.forEach((type) => {
            const usageLevel = type.usagePercentage > 70 ? "high" : type.usagePercentage > 30 ? "medium" : "low"

            const card = document.createElement("div")
            card.className = "type-card"
            card.innerHTML = `
                <div class="type-header">
                    <div class="type-name">
                        <div class="type-color" style="background-color: ${type.color || "#667eea"}"></div>
                        ${type.name}
                    </div>
                    <div class="type-seats">${type.seats} ghế</div>
                </div>
                </div>
                <div class="type-actions">
                    <button class="btn-edit" onclick="tabletypeManager.showEditForm(${type.idTabletype})">
                        <i class="fas fa-edit"></i>
                        Sửa
                    </button>
                    <button class="btn-delete" onclick="tabletypeManager.showDeleteModal(${type.idTabletype}, '${type.name}', ${type.usageCount})">
                        <i class="fas fa-trash"></i>
                        Xóa
                    </button>
                </div>
            `
            container.appendChild(card)
        })
    }

    renderListView() {
        const tbody = document.getElementById("typesTableBody")
        tbody.innerHTML = ""

        if (this.filteredTypes.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4">
                        <i class="fas fa-layer-group fa-2x text-muted mb-2"></i>
                        <div class="text-muted">Không tìm thấy loại bàn nào</div>
                    </td>
                </tr>
            `
            return
        }

        this.filteredTypes.forEach((type) => {
            const usageLevel = type.usagePercentage > 70 ? "high" : type.usagePercentage > 30 ? "medium" : "low"

            const row = document.createElement("tr")
            row.innerHTML = `
                <td>${type.idTabletype}</td>
                <td>
                    <div class="d-flex align-items-center gap-2">
                        <div class="type-color" style="background-color: ${type.color || "#667eea"}"></div>
                        <strong>${type.name}</strong>
                    </div>
                </td>
                <td>${type.seats}</td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-outline-primary" onclick="tabletypeManager.showEditForm(${type.idTabletype})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="tabletypeManager.showDeleteModal(${type.idTabletype}, '${type.name}', ${type.usageCount})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `
            tbody.appendChild(row)
        })
    }

    updateStats() {
        const totalTypes = this.types.length
        const totalCapacity = this.types.reduce((sum, type) => sum + type.seats * type.usageCount, 0)
        const averageSeats =
            totalTypes > 0 ? (this.types.reduce((sum, type) => sum + type.seats, 0) / totalTypes).toFixed(1) : 0

        // Find most popular type
        const popularType = this.types.reduce((max, type) => (type.usageCount > max.usageCount ? type : max), {
            usageCount: 0,
            name: "-",
        })

        document.getElementById("totalTypes").textContent = totalTypes
        document.getElementById("totalCapacity").textContent = totalCapacity
        document.getElementById("averageSeats").textContent = averageSeats
        document.getElementById("popularType").textContent = popularType.name
    }

    showAddForm() {
        document.getElementById("tabletypeModalTitle").innerHTML = '<i class="fas fa-layer-group"></i> Thêm loại bàn'
        this.resetForm()
        this.clearValidation()
        new bootstrap.Modal(document.getElementById("tabletypeModal")).show()
    }

    async showEditForm(id) {
        try {
            const response = await fetch(`${this.apiUrl}/${id}`)
            const type = await response.json()

            document.getElementById("tabletypeModalTitle").innerHTML = '<i class="fas fa-edit"></i> Cập nhật loại bàn'
            document.getElementById("tabletypeId").value = type.idTabletype
            document.getElementById("tabletypeName").value = type.name
            document.getElementById("tabletypeSeats").value = type.seats
            this.clearValidation()

            new bootstrap.Modal(document.getElementById("tabletypeModal")).show()
        } catch (error) {
            showNotification("Lỗi khi tải thông tin loại bàn: " + error.message)
        }
    }

    showDeleteModal(id, name, usageCount) {
        document.getElementById("deleteTypeName").textContent = name
        document.getElementById("confirmDelete").dataset.typeId = id

        const warningDiv = document.getElementById("deleteWarning")
        const affectedCount = document.getElementById("affectedTablesCount")

        if (usageCount > 0) {
            affectedCount.textContent = usageCount
            warningDiv.style.display = "block"
        } else {
            warningDiv.style.display = "none"
        }

        new bootstrap.Modal(document.getElementById("deleteModal")).show()
    }

    async submitForm() {
        try {
            const formData = {
                IdTabletype: Number.parseInt(document.getElementById("tabletypeId").value) || 0,
                Name: document.getElementById("tabletypeName").value.trim(),
                Seats: Number.parseInt(document.getElementById("tabletypeSeats").value),
            }

            // Validation
            let isValid = true

            if (!formData.Name) {
                this.showFieldError("tabletypeName", "validateName")
                isValid = false
            } else {
                this.clearFieldError("tabletypeName", "validateName")
            }

            if (isNaN(formData.Seats) || formData.Seats < 1 || !Number.isInteger(formData.Seats)) {
                this.showFieldError("tabletypeSeats", "validateSeats")
                isValid = false

            } else {
                this.clearFieldError("tabletypeSeats", "validateSeats")
            }

            if (!isValid) return
            const isEdit = formData.IdTabletype > 0
            const url = isEdit ? `${this.apiUrl}/${formData.IdTabletype}` : this.apiUrl
            const method = isEdit ? "PUT" : "POST"

            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            })

            if (response.ok) {
                showNotification(isEdit ? "Cập nhật loại bàn thành công!" : "Thêm loại bàn mới thành công!")
                window.bootstrap.Modal.getInstance(document.getElementById("tabletypeModal")).hide()
                await this.loadInitialData()
                // this.updateStats()
                this.renderTypes()
            } else {
                const error = await response.text()
                showNotification("Lỗi: " + error, "error")
            }
        } catch (error) {
            console.error("Lỗi khi lưu thông tin: " + error.message)
        }
    }

    showFieldError(fieldId, errorId) {
        const field = document.getElementById(fieldId)
        const error = document.getElementById(errorId)
        field.classList.add("is-invalid")
        error.style.display = "block"
    }

    clearFieldError(fieldId, errorId) {
        const field = document.getElementById(fieldId)
        const error = document.getElementById(errorId)
        field.classList.remove("is-invalid")
        error.style.display = "none"
    }

    clearValidation() {
        this.clearFieldError("tabletypeName", "validateName")
        this.clearFieldError("tabletypeSeats", "validateSeats")
    }

    async confirmDelete() {
        try {
            const typeId = document.getElementById("confirmDelete").dataset.typeId
            const response = await fetch(`${this.apiUrl}/${typeId}`, {
                method: "DELETE",
            })

            if (response.ok) {
                showNotification("Xóa loại bàn thành công!")
                window.bootstrap.Modal.getInstance(document.getElementById("deleteModal")).hide()
                await this.loadInitialData()
                //  this.updateStats()
                this.renderTypes()
            } else {
                const error = await response.text()
                showNotification("Lỗi: " + error, "error")
            }
        } catch (error) {
            console.error("Lỗi khi xóa loại bàn: " + error.message)
        }
    }

    resetForm() {
        document.getElementById("tabletypeForm").reset()
        document.getElementById("tabletypeId").value = ""
    }

    async exportData() {
        try {
            // Create CSV content
            const headers = ["ID", "Tên loại bàn", "Số ghế", "Số bàn sử dụng", "Tỷ lệ sử dụng", "Mô tả"]
            const csvContent = [
                headers.join(","),
                ...this.filteredTypes.map((type) =>
                    [
                        type.idTabletype,
                        `"${type.name}"`,
                        type.seats,
                        type.usageCount,
                        `"${type.usagePercentage.toFixed(1)}%"`,
                        `"${type.description || ""}"`,
                    ].join(","),
                ),
            ].join("\n")

            // Download file
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
            const link = document.createElement("a")
            link.href = URL.createObjectURL(blob)
            link.download = `danh-sach-loai-ban-${new Date().toISOString().split("T")[0]}.csv`
            link.click()

            showNotification("Xuất dữ liệu thành công!")
        } catch (error) {
            showNotification("Lỗi khi xuất dữ liệu: " + error.message)
        }
    }
}

// Global functions for onclick events
let tabletypeManager

function showAddForm() {
    tabletypeManager.showAddForm()
}

function exportData() {
    tabletypeManager.exportData()
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    tabletypeManager = new TabletypeManager()

    // Add notification styles
    const notificationStyles = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        color: white;
        font-weight: 500;
        z-index: 9999;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        max-width: 400px;
    }

    .notification.success {
        background: linear-gradient(135deg, #48bb78, #38a169);
    }

    .notification.error {
        background: linear-gradient(135deg, #f56565, #e53e3e);
    }

    .notification.show {
        transform: translateX(0);
    }
`

    if (!document.querySelector("#notification-styles")) {
        const styleSheet = document.createElement("style")
        styleSheet.id = "notification-styles"
        styleSheet.textContent = notificationStyles
        document.head.appendChild(styleSheet)
    }
})
