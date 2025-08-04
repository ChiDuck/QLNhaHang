class DinetableManager {
    constructor() {
        this.apiUrl = "/api/dinetableapi"
        this.currentView = "grid"
        this.tables = []
        this.areas = []
        this.types = []
        this.filteredTables = []

        this.init()
    }

    async init() {
        await this.loadInitialData()
        this.setupEventListeners()
        // this.updateStats()
        this.renderTables()
    }

    async loadInitialData() {
        try {
            const [tablesRes, areasRes, typesRes] = await Promise.all([
                fetch(this.apiUrl),
                fetch("/api/areaapi"),
                fetch("/api/tabletypeapi"),
            ])

            this.tables = await tablesRes.json()
            this.areas = await areasRes.json()
            this.types = await typesRes.json()
            this.filteredTables = [...this.tables]

            this.populateFilters()
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu: " + error.message)
        }
    }

    populateFilters() {
        const areaFilter = document.getElementById("areaFilter")
        const typeFilter = document.getElementById("typeFilter")
        const areaSelect = document.getElementById("dinetableArea")
        const typeSelect = document.getElementById("dinetableType")

            // Clear existing options
            ;[areaFilter, typeFilter, areaSelect, typeSelect].forEach((select) => {
                const firstOption = select.querySelector("option")
                select.innerHTML = ""
                if (firstOption) select.appendChild(firstOption)
            })

        // Populate area filters and selects
        this.areas.forEach((area) => {
            areaFilter.innerHTML += `<option value="${area.idArea}">${area.name}</option>`
            areaSelect.innerHTML += `<option value="${area.idArea}">${area.name}</option>`
        })

        // Populate type filters and selects
        this.types.forEach((type) => {
            typeFilter.innerHTML += `<option value="${type.idTabletype}">${type.name}</option>`
            typeSelect.innerHTML += `<option value="${type.idTabletype}">${type.name} (${type.seats} ghế)</option>`
        })
    }

    setupEventListeners() {
        // Search functionality
        document
            .getElementById("searchInput")
            .addEventListener("input", (e) => {
                this.filterTables()
            })

            // Filter functionality
            ;["areaFilter", "typeFilter"].forEach((id) => {
                document.getElementById(id).addEventListener("change", () => {
                    this.filterTables()
                })
            })

        // View toggle
        document.querySelectorAll(".view-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                this.switchView(e.target.dataset.view)
            })
        })

        // Form submission
        document.getElementById("dinetableForm").addEventListener("submit", (e) => {
            e.preventDefault()
            this.submitForm()
        })

        // Delete confirmation
        document.getElementById("confirmDelete").addEventListener("click", () => {
            this.confirmDelete()
        })

        // Modal events
        document.getElementById("dinetableModal").addEventListener("hidden.bs.modal", () => {
            this.resetForm()
        })
    }

    filterTables() {
        const searchTerm = document.getElementById("searchInput").value.toLowerCase()
        const areaFilter = document.getElementById("areaFilter").value
        const typeFilter = document.getElementById("typeFilter").value
        this.filteredTables = this.tables.filter((table) => {
            const matchesSearch =
                table.name.toLowerCase().includes(searchTerm) ||
                table.area.toLowerCase().includes(searchTerm) ||
                table.type.toLowerCase().includes(searchTerm)

            const matchesArea = !areaFilter || table.idArea == areaFilter
            const matchesType = !typeFilter || table.idTabletype == typeFilter
            return matchesSearch && matchesArea && matchesType
        })

        this.renderTables()
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

        this.renderTables()
    }

    renderTables() {
        if (this.currentView === "grid") {
            this.renderGridView()
        } else {
            this.renderListView()
        }
    }

    renderGridView() {
        const container = document.getElementById("tablesGrid")
        container.innerHTML = ""

        if (this.filteredTables.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-chair fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">Không tìm thấy bàn nào</h5>
                </div>
            `
            return
        }

        this.filteredTables.forEach((table) => {
            const card = document.createElement("div")
            card.className = `table-card`
            card.innerHTML = `
                <div class="table-header">
                    <div class="table-name">${table.name}</div>
                </div>
                <div class="table-info">
                    <div class="info-row">
                        <span><i class="fas fa-chair"></i> Số ghế:</span>
                        <strong>${table.seats}</strong>
                    </div>
                    <div class="info-row">
                        <span><i class="fas fa-map-marker-alt"></i> Khu vực:</span>
                        <strong>${table.area}</strong>
                    </div>
                    <div class="info-row">
                        <span><i class="fas fa-tag"></i> Loại bàn:</span>
                        <strong>${table.type}</strong>
                    </div>
                </div>
                <div class="table-actions">
                    <button class="btn-edit" onclick="dinetableManager.showEditForm(${table.idDinetable})">
                        <i class="fas fa-edit"></i>
                        Sửa
                    </button>
                    <button class="btn-delete" onclick="dinetableManager.showDeleteModal(${table.idDinetable}, '${table.name}')">
                        <i class="fas fa-trash"></i>
                        Xóa
                    </button>
                </div>
            `
            container.appendChild(card)
        })
    }

    renderListView() {
        const tbody = document.getElementById("tablesTableBody")
        tbody.innerHTML = ""

        if (this.filteredTables.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4">
                        <i class="fas fa-chair fa-2x text-muted mb-2"></i>
                        <div class="text-muted">Không tìm thấy bàn nào</div>
                    </td>
                </tr>
            `
            return
        }

        this.filteredTables.forEach((table) => {

            const row = document.createElement("tr")
            row.innerHTML = `
                <td>${table.idDinetable}</td>
                <td>
                    <strong>${table.name}</strong>
                </td>
                <td>${table.seats}</td>
                <td>${table.area}</td>
                <td>${table.type}</td>

                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-outline-primary" onclick="dinetableManager.showEditForm(${table.idDinetable})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="dinetableManager.showDeleteModal(${table.idDinetable}, '${table.name}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `
            tbody.appendChild(row)
        })
    }

    updateStats() {
        const total = this.tables.length
        const available = this.tables.filter((t) => (t.status || "available") === "available").length
        const occupied = this.tables.filter((t) => (t.status || "available") === "occupied").length
        const totalAreas = this.areas.length

        document.getElementById("totalTables").textContent = total
        document.getElementById("availableTables").textContent = available
        document.getElementById("occupiedTables").textContent = occupied
        document.getElementById("totalAreas").textContent = totalAreas
    }

    showAddForm() {
        document.getElementById("dinetableModalTitle").innerHTML = '<i class="fas fa-chair"></i> Thêm bàn mới'
        this.resetForm()
        new bootstrap.Modal(document.getElementById("dinetableModal")).show()
        clearValidation()
    }

    async showEditForm(id) {
        try {
            const response = await fetch(`${this.apiUrl}/${id}`)
            const table = await response.json()

            document.getElementById("dinetableModalTitle").innerHTML = '<i class="fas fa-edit"></i> Cập nhật bàn'
            document.getElementById("dinetableId").value = table.idDinetable
            document.getElementById("dinetableName").value = table.name
            document.getElementById("dinetableArea").value = table.idArea
            document.getElementById("dinetableType").value = table.idTabletype
            clearValidation()

            new bootstrap.Modal(document.getElementById("dinetableModal")).show()
        } catch (error) {
            console.error("Lỗi khi tải thông tin bàn: " + error.message)
        }
    }

    showDeleteModal(id, name) {
        document.getElementById("deleteTableName").textContent = name
        document.getElementById("confirmDelete").dataset.tableId = id
        new bootstrap.Modal(document.getElementById("deleteModal")).show()
    }

    async submitForm() {
        try {
            const formData = {
                IdDinetable: Number.parseInt(document.getElementById("dinetableId").value) || 0,
                Name: document.getElementById("dinetableName").value.trim(),
                IdArea: Number.parseInt(document.getElementById("dinetableArea").value),
                IdTabletype: Number.parseInt(document.getElementById("dinetableType").value),
            }

            // Validation
            let isValid = true

            if (!formData.Name) {
                showFieldError("dinetableName", "validateName")
                isValid = false
            } else {
                clearFieldError("dinetableName", "validateName")
            }

            if (!formData.IdArea) {
                showFieldError("dinetableArea", "validateArea")
                isValid = false
            } else {
                clearFieldError("dinetableArea", "validateArea")
            }

            if (!formData.IdTabletype) {
                showFieldError("dinetableType", "validateType")
                isValid = false
            } else {
                clearFieldError("dinetableType", "validateType")
            }

            if (!isValid) return

            const isEdit = formData.IdDinetable > 0
            const url = isEdit ? `${this.apiUrl}/${formData.IdDinetable}` : this.apiUrl
            const method = isEdit ? "PUT" : "POST"

            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            })

            if (response.ok) {
                showNotification(isEdit ? "Cập nhật bàn thành công!" : "Thêm bàn mới thành công!", "success")
                window.bootstrap.Modal.getInstance(document.getElementById("dinetableModal")).hide()
                await this.loadInitialData()
                //this.updateStats()
                this.renderTables()
            } else {
                const error = await response.text()
                showNotification("Lỗi: " + error, "error")
            }
        } catch (error) {
            console.error("Lỗi khi lưu thông tin: " + error.message)
        }
    }

    async confirmDelete() {
        try {
            const tableId = document.getElementById("confirmDelete").dataset.tableId
            const response = await fetch(`${this.apiUrl}/${tableId}`, {
                method: "DELETE",
            })

            if (response.ok) {
                showNotification("Xóa bàn thành công!", "success")
                window.bootstrap.Modal.getInstance(document.getElementById("deleteModal")).hide()
                await this.loadInitialData()
                // this.updateStats()
                this.renderTables()
            } else {
                const error = await response.text()
                showNotification("Lỗi: " + error, "error")
            }
        } catch (error) {
            console.error("Lỗi khi xóa bàn: " + error.message)
        }
    }

    resetForm() {
        document.getElementById("dinetableForm").reset()
        document.getElementById("dinetableId").value = ""
    }

    async exportData() {
        try {
            // Create CSV content
            const headers = ["ID", "Tên bàn", "Số ghế", "Khu vực", "Loại bàn", "Trạng thái"]
            const csvContent = [
                headers.join(","),
                ...this.filteredTables.map((table) =>
                    [
                        table.idDinetable,
                        `"${table.name}"`,
                        table.seats,
                        `"${table.area}"`,
                        `"${table.type}"`,
                        `"${table.status || "available"}"`,
                    ].join(","),
                ),
            ].join("\n")

            // Download file
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
            const link = document.createElement("a")
            link.href = URL.createObjectURL(blob)
            link.download = `danh-sach-ban-${new Date().toISOString().split("T")[0]}.csv`
            link.click()

            showNotification("Xuất dữ liệu thành công!", "success")
        } catch (error) {
            showNotification("Lỗi khi xuất dữ liệu", "error")
        }
    }
}

// Global functions for onclick events
let dinetableManager

function showAddForm() {
    dinetableManager.showAddForm()
}

function exportData() {
    dinetableManager.exportData()
}

function showFieldError(fieldId, errorId) {
    const field = document.getElementById(fieldId)
    const error = document.getElementById(errorId)
    field.classList.add("is-invalid")
    error.style.display = "block"
}

function clearFieldError(fieldId, errorId) {
    const field = document.getElementById(fieldId)
    const error = document.getElementById(errorId)
    field.classList.remove("is-invalid")
    error.style.display = "none"
}

function clearValidation() {
    clearFieldError("dinetableName", "validateName")
    clearFieldError("dinetableArea", "validateArea")
    clearFieldError("dinetableType", "validateType")
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    dinetableManager = new DinetableManager()

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
