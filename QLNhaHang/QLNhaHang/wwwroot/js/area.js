const apiUrl = "/api/areaapi"
let areasData = []

async function getAllAreas() {
    showLoading(true)
    try {
        const res = await fetch(apiUrl)
        if (!res.ok) throw new Error("Lỗi khi tải danh sách khu vực")
        areasData = await res.json()
        await loadAreas()
        // updateStats()
    } catch (error) {
        console.error("Error:", error)
        showNotification("Lỗi khi tải dữ liệu", "error")
    } finally {
        showLoading(false)
    }
}

async function loadAreas() {
    const container = document.getElementById("areaTableBody")
    const emptyState = document.getElementById("emptyState")

    if (areasData.length === 0) {
        container.style.display = "none"
        emptyState.style.display = "block"
        return
    }

    container.style.display = "grid"
    emptyState.style.display = "none"
    container.innerHTML = ""

    areasData.forEach((area) => {
        const card = createAreaCard(area)
        container.appendChild(card)
    })

    // Add animation
    setTimeout(() => {
        container.querySelectorAll(".area-card").forEach((card, index) => {
            card.style.opacity = "0"
            card.style.transform = "translateY(20px)"
            setTimeout(() => {
                card.style.transition = "all 0.5s ease"
                card.style.opacity = "1"
                card.style.transform = "translateY(0)"
            }, index * 100)
        })
    }, 50)
}

function createAreaCard(area) {
    const card = document.createElement("div")
    card.className = "area-card"
    card.innerHTML = `
        <div class="area-header">
            <div class="area-icon">
                <i class="fas fa-map-marker-alt"></i>
            </div>
            <div class="area-info">
                <h3>${area.name}</h3>
                <p>ID: ${area.idArea} • ${area.tableCount} bàn</p>
            </div>
        </div>
        <div class="area-actions">
            <button class="btn-edit" onclick="showEditForm(${area.idArea})">
                <i class="fas fa-edit"></i>
                Sửa
            </button>
            <button class="btn-delete" onclick="deleteArea(${area.idArea})">
                <i class="fas fa-trash"></i>
                Xóa
            </button>
        </div>
    `
    return card
}

async function updateStats() {
    document.getElementById("totalAreas").textContent = areasData.length

    try {
        const res = await fetch("/api/dinetableapi")
        const tables = await res.json()
        document.getElementById("totalTables").textContent = tables.length
    } catch {
        document.getElementById("totalTables").textContent = "0"
    }
}

function showLoading(show) {
    const loadingState = document.getElementById("loadingState")
    const container = document.getElementById("areaTableBody")

    if (show) {
        loadingState.style.display = "block"
        container.style.display = "none"
    } else {
        loadingState.style.display = "none"
    }
}

function showNotification(message, type = "success") {
    // Create notification element
    const notification = document.createElement("div")
    notification.className = `notification ${type}`
    notification.innerHTML = `
        <i class="fas fa-${type === "success" ? "check-circle" : "exclamation-circle"}"></i>
        <span>${message}</span>
    `

    // Add to page
    document.body.appendChild(notification)

    // Show notification
    setTimeout(() => notification.classList.add("show"), 100)

    // Hide and remove notification
    setTimeout(() => {
        notification.classList.remove("show")
        setTimeout(() => document.body.removeChild(notification), 300)
    }, 3000)
}

window.onload = getAllAreas

// Search functionality
document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("areaSearchInput")
    if (searchInput) {
        searchInput.addEventListener("input", function () {
            const keyword = this.value.toLowerCase()
            const cards = document.querySelectorAll(".area-card")

            cards.forEach((card) => {
                const name = card.querySelector("h3").textContent.toLowerCase()
                if (name.includes(keyword)) {
                    card.style.display = "block"
                } else {
                    card.style.display = "none"
                }
            })
        })
    }
})

function showAddForm() {
    document.getElementById("areaModalTitle").innerText = "Thêm khu vực"
    document.getElementById("areaId").value = ""
    document.getElementById("areaName").value = ""
    clearValidation()
    new bootstrap.Modal(document.getElementById("areaModal")).show()
}

async function showEditForm(id) {
    try {
        const res = await fetch(`${apiUrl}/${id}`)
        const data = await res.json()

        document.getElementById("areaModalTitle").innerText = "Sửa khu vực"
        document.getElementById("areaId").value = data.idArea
        document.getElementById("areaName").value = data.name
        clearValidation()
        bootstrap.Modal.getOrCreateInstance(document.getElementById("areaModal")).show()
    } catch (error) {
        showNotification("Lỗi khi tải thông tin khu vực", "error")
    }
}

async function submitArea() {
    const area = {
        IdArea: document.getElementById("areaId").value || 0,
        Name: document.getElementById("areaName").value.trim(),
    }

    let isValid = true

    if (!area.Name) {
        showFieldError("areaName", "validateName")
        isValid = false
    } else {
        clearFieldError("areaName", "validateName")
    }

    if (!isValid) return
    try {
        const method = area.IdArea == 0 ? "POST" : "PUT"
        const url = area.IdArea == 0 ? apiUrl : `${apiUrl}/${area.IdArea}`

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(area),
        })

        if (res.ok) {
            showNotification(area.IdArea == 0 ? "Thêm khu vực thành công!" : "Cập nhật khu vực thành công!")
            bootstrap.Modal.getInstance(document.getElementById("areaModal")).hide()
            await getAllAreas()
        } else {
            const error = await res.text()
            showNotification("Lỗi: " + error, "error")
        }
    } catch (error) {
        showNotification("Lỗi kết nối", "error")
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
    clearFieldError("areaName", "validateName")
}
document.getElementById("areaForm").addEventListener("submit", async (e) => {
    e.preventDefault()
    await submitArea()
})

async function deleteArea(id) {
    if (!confirm("Bạn có chắc muốn xóa khu vực này?")) return

    try {
        const res = await fetch(`${apiUrl}/${id}`, { method: "DELETE" })

        if (res.ok) {
            showNotification("Xóa khu vực thành công!")
            await getAllAreas()
        } else {
            const error = await res.text()
            showNotification("Không thể xóa: " + error, "error")
        }
    } catch (error) {
        console.error("Lỗi kết nối", "error")
    }
}

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

// Add styles to head
const styleSheet = document.createElement("style")
styleSheet.textContent = notificationStyles
document.head.appendChild(styleSheet)
