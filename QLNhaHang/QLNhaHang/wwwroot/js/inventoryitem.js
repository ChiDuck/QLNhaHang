const apiUrl = "/api/inventoryitemapi"
var inventoryitemlist = []
var inventoryTypes = []
var valName = document.getElementById("validateName")
var valUnit = document.getElementById("validateUnit")
var bootstrap = window.bootstrap // Declare the bootstrap variable

document.addEventListener("DOMContentLoaded", () => {
    initializeInventoryPage()
    document.getElementById("refreshData").addEventListener("click", () => {
        showLoadingState()
        getAllInventoryitems()
    })
})

async function initializeInventoryPage() {
    showLoadingState()
    await Promise.all([getAllInventoryitems(), loadInventoryTypes()])
    hideLoadingState()
  //  updateStats()
}

function showLoadingState() {
    document.getElementById("loadingState").style.display = "block"
    document.getElementById("inventoryGrid").style.display = "none"
    document.getElementById("emptyState").style.display = "none"
}

function hideLoadingState() {
    document.getElementById("loadingState").style.display = "none"
    document.getElementById("inventoryGrid").style.display = "grid"
}

// Gọi API lấy danh sách nguyên liệu
async function getAllInventoryitems() {
    try {
        const response = await fetch(apiUrl)
        if (!response.ok) {
            throw new Error("Không thể tải danh sách nguyên liệu")
        }
        inventoryitemlist = await response.json()
        renderInventoryGrid()
    } catch (error) {
        console.error("Lỗi khi gọi API:", error)
        showNotification("Có lỗi xảy ra khi tải dữ liệu", "error")
    }
}

function renderInventoryGrid() {
    const grid = document.getElementById("inventoryGrid")
    const emptyState = document.getElementById("emptyState")

    if (inventoryitemlist.length === 0) {
        grid.style.display = "none"
        emptyState.style.display = "block"
        return
    }

    grid.style.display = "grid"
    emptyState.style.display = "none"
    grid.innerHTML = ""

    inventoryitemlist.forEach((item, index) => {
        const itemCard = createInventoryItemCard(item)
        itemCard.style.animationDelay = `${index * 0.1}s`
        grid.appendChild(itemCard)
    })
}

function createInventoryItemCard(item) {
    const card = document.createElement("div")
    card.className = "inventory-item"

    const stockStatus = getStockStatus(item.amount)
    const stockClass = stockStatus.level === "low" ? "low" : "normal"

    card.innerHTML = `
        <div class="item-header">
            <h3 class="item-name">${item.name}</h3>
            <span class="item-id">#${item.idInventoryitem}</span>
        </div>
        
        <div class="item-details">
            <div class="detail-row">
                <span class="detail-label">
                    <i class="fas fa-balance-scale"></i>
                    Đơn vị
                </span>
                <span class="detail-value">${item.unit}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">
                    <i class="fas fa-sort-numeric-up"></i>
                    Số lượng
                </span>
                <span class="detail-value amount-value">
                    ${item.amount}
                    <span class="stock-status ${stockClass}">${stockStatus.text}</span>
                </span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">
                    <i class="fas fa-layer-group"></i>
                    Loại
                </span>
                <span class="detail-value">${item.inventoryitemtypeName || "Chưa phân loại"}</span>
            </div>
        </div>
        
        <div class="item-actions">
            <button class="btn btn-edit" onclick="showEditForm(${item.idInventoryitem})" title="Chỉnh sửa">
                <i class="fas fa-edit"></i>
                Sửa
            </button>
            <button class="btn btn-delete" onclick="deleteInventoryitem(${item.idInventoryitem})" title="Xóa">
                <i class="fas fa-trash"></i>
                Xóa
            </button>
        </div>
    `

    return card
}

function getStockStatus(amount) {
    if (amount < 10) {
        return { level: "low", text: "Sắp hết" }
    }
    return { level: "normal", text: "Còn đủ" }
}

function updateStats() {
    const totalItems = inventoryitemlist.length
    const lowStockItems = inventoryitemlist.filter((item) => item.amount < 10).length
    const normalStockItems = totalItems - lowStockItems

    document.getElementById("totalItems").textContent = totalItems
    document.getElementById("lowStockItems").textContent = lowStockItems
    document.getElementById("normalStockItems").textContent = normalStockItems
}

async function searchInventoryItems() {
    const keyword = document.getElementById("inventorySearchInput").value.trim()

    if (!keyword) {
        await getAllInventoryitems()
        return
    }

    showLoadingState()

    try {
        const res = await fetch(`/api/inventoryitemapi/search?keyword=${encodeURIComponent(keyword)}`)
        const data = await res.json()

        if (!res.ok) {
            throw new Error(data.message || "Lỗi tìm kiếm.")
        }

        inventoryitemlist = data
        renderInventoryGrid()
       // updateStats()

        if (data.length === 0) {
            showNotification("Không tìm thấy nguyên liệu nào", "info")
        }
    } catch (err) {
        console.error("Lỗi:", err)
        showNotification("Không thể kết nối đến máy chủ", "error")
    } finally {
        hideLoadingState()
    }
}

async function deleteInventoryitem(id) {
    if (!confirm("Bạn có chắc muốn xóa nguyên liệu này không?")) {
        return
    }

    try {
        const response = await fetch(`${apiUrl}/${id}`, {
            method: "DELETE",
        })

        if (response.ok) {
            showNotification("Xóa thành công!", "success")
            await getAllInventoryitems()
        //    updateStats()
        } else {
            const errorText = await response.text()
            throw new Error(errorText)
        }
    } catch (err) {
        console.error("Lỗi khi xóa:", err)
        showNotification("Đã xảy ra lỗi khi xóa nguyên liệu", "error")
    }
}

function showAddForm() {
    document.getElementById("modalLabel").innerHTML = '<i class="fas fa-plus"></i> Thêm mới nguyên liệu'
    document.getElementById("itemId").value = ""
    document.getElementById("itemName").value = ""
    document.getElementById("itemUnit").value = ""
    document.getElementById("itemAmount").value = 0

    clearValidation()
    loadInventoryTypesForModal()
    new bootstrap.Modal(document.getElementById("editModal")).show()
}

async function showEditForm(id) {
    try {
        const res = await fetch(`${apiUrl}/${id}`)
        const item = await res.json()

        document.getElementById("modalLabel").innerHTML = '<i class="fas fa-edit"></i> Sửa nguyên liệu'
        document.getElementById("itemId").value = item.idInventoryitem
        document.getElementById("itemName").value = item.name
        document.getElementById("itemUnit").value = item.unit
        document.getElementById("itemAmount").value = item.amount

        clearValidation()
        await loadInventoryTypesForModal(item.idInventoryitemtype)
        new bootstrap.Modal(document.getElementById("editModal")).show()
    } catch (error) {
        console.error("Lỗi khi tải thông tin nguyên liệu:", error)
        showNotification("Không thể tải thông tin nguyên liệu", "error")
    }
}

async function loadInventoryTypes() {
    try {
        const res = await fetch("/api/inventoryitemtypeapi")
        inventoryTypes = await res.json()

        // Load for filter
        const filterSelect = document.getElementById("typeFilter")
        filterSelect.innerHTML = '<option value="">Tất cả loại</option>'
        inventoryTypes.forEach((type) => {
            const option = document.createElement("option")
            option.value = type.idInventoryitemtype
            option.text = type.name
            filterSelect.appendChild(option)
        })
    } catch (error) {
        console.error("Lỗi khi tải loại nguyên liệu:", error)
    }
}

async function loadInventoryTypesForModal(selectedId = null) {
    const select = document.getElementById("itemType")
    select.innerHTML = ""

    inventoryTypes.forEach((type) => {
        const option = document.createElement("option")
        option.value = type.idInventoryitemtype
        option.text = type.name
        if (type.idInventoryitemtype === selectedId) option.selected = true
        select.appendChild(option)
    })
}

async function updateInventoryitem() {
    const id = document.getElementById("itemId").value
    const name = document.getElementById("itemName").value.trim()
    const unit = document.getElementById("itemUnit").value.trim()
    const amount = Number.parseFloat(document.getElementById("itemAmount").value)
    const typeId = Number.parseInt(document.getElementById("itemType").value)

    // Validation
    let isValid = true

    if (!name) {
        showFieldError("itemName", "validateName")
        isValid = false
    } else {
        clearFieldError("itemName", "validateName")
    }

    if (!unit) {
        showFieldError("itemUnit", "validateUnit")
        isValid = false
    } else {
        clearFieldError("itemUnit", "validateUnit")
    }

    if (!isValid) return

    const item = { name, unit, amount, idInventoryitemtype: typeId }

    try {
        const res = await fetch(`${apiUrl}` + (id ? `/${id}` : ""), {
            method: id ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(id ? { idInventoryitem: Number.parseInt(id), ...item } : item),
        })

        if (res.ok) {
            showNotification(id ? "Cập nhật thành công!" : "Thêm mới thành công!", "success")
            bootstrap.Modal.getInstance(document.getElementById("editModal")).hide()
            await getAllInventoryitems()
        //    updateStats()
        } else {
            const error = await res.text()
            throw new Error(error)
        }
    } catch (error) {
        console.error("Lỗi khi lưu:", error)
        showNotification("Có lỗi xảy ra khi lưu dữ liệu", "error")
    }
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
    clearFieldError("itemName", "validateName")
    clearFieldError("itemUnit", "validateUnit")
}

function showNotification(message, type = "info") {
    // Create notification element
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

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove()
        }
    }, 5000)
}

// Add search on Enter key
document.getElementById("inventorySearchInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        searchInventoryItems()
    }
})

// Add filter functionality
document.getElementById("typeFilter").addEventListener("change", filterInventoryItems)
document.getElementById("statusFilter").addEventListener("change", filterInventoryItems)

function filterInventoryItems() {
    const typeFilter = document.getElementById("typeFilter").value
    const statusFilter = document.getElementById("statusFilter").value

    let filteredItems = [...inventoryitemlist]

    if (typeFilter) {
        filteredItems = filteredItems.filter((item) => item.idInventoryitemtype == typeFilter)
    }

    if (statusFilter) {
        if (statusFilter === "low") {
            filteredItems = filteredItems.filter((item) => item.amount < 10)
        } else if (statusFilter === "normal") {
            filteredItems = filteredItems.filter((item) => item.amount >= 10)
        }
    }

    const originalList = inventoryitemlist
    inventoryitemlist = filteredItems
    renderInventoryGrid()
    inventoryitemlist = originalList // Restore original list
}
