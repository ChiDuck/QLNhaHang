const apiUrl = "/api/dishapi"
var dishlist = []
var originalDishlist = []
//const bootstrap = window.bootstrap // Declare the bootstrap variable

document.addEventListener("DOMContentLoaded", () => {
    getAllDishes()
    loadDishCategories()
    document.getElementById("refreshData").addEventListener("click", () => {
        showLoading(true)
        getAllDishes()
    })
})

async function getAllDishes() {
    showLoading(true)
    try {
        const res = await fetch(apiUrl)
        if (!res.ok) throw new Error("Lỗi khi tải danh sách món ăn")
        dishlist = await res.json()
        originalDishlist = [...dishlist]
        loadDishes()
       // updateStats()
    } catch (error) {
        console.error("Lỗi khi lấy danh sách món ăn:", error)
        showNotification("Lỗi khi tải dữ liệu món ăn", "error")
    } finally {
        showLoading(false)
    }
}

function loadDishes() {
    const container = document.getElementById("dishTableBody")
    const emptyState = document.getElementById("emptyState")

    if (!container) {
        console.error("Container dishTableBody not found")
        return
    }

    if (dishlist.length === 0) {
        container.style.display = "none"
        if (emptyState) emptyState.style.display = "block"
        return
    }

    container.style.display = "grid"
    if (emptyState) emptyState.style.display = "none"
    container.innerHTML = ""

    dishlist.forEach((dish, index) => {
        const card = createDishCard(dish)
        card.style.animationDelay = `${index * 0.1}s`
        container.appendChild(card)
    })
}

function createDishCard(dish) {
    const card = document.createElement("div")
    card.className = "dish-card"

    const discountBadge = dish.discount && dish.discount > 0 ? `<div class="discount-badge">-${dish.discount}%</div>` : ""

    const statusBadge = dish.issoldout
        ? `<div class="status-badge soldout">Hết hàng</div>`
        : `<div class="status-badge available">Còn hàng</div>`

    const originalPrice = dish.price
    const finalPrice = dish.discount ? originalPrice * (1 - dish.discount / 100) : originalPrice

    const priceDisplay =
        dish.discount && dish.discount > 0
            ? `<div class="price-section">
            <span class="original-price">${originalPrice.toLocaleString()} đ</span>
            <span class="final-price">${finalPrice.toLocaleString()} đ</span>
        </div>`
            : `<div class="price-section">
            <span class="final-price">${originalPrice.toLocaleString()} đ</span>
        </div>`

    card.innerHTML = `
        <div class="dish-image">
            ${dish.photo
            ? `<img src="${dish.photo}" alt="${dish.name}" onerror="this.parentElement.innerHTML='<div class=\\"no-image\\"><i class=\\"fas fa-utensils\\"></i></div>`
            : `<div class="no-image"><i class="fas fa-utensils"></i></div>`
        }
            ${discountBadge}
            ${statusBadge}
        </div>
        <div class="dish-content">
            <div class="dish-header">
                <h3 class="dish-name">${dish.name}</h3>
                <span class="dish-id">ID: ${dish.idDish}</span>
            </div>
            <div class="dish-category">
                <i class="fas fa-tag"></i>
                <span>${dish.dishcategoryName || "Chưa phân loại"}</span>
            </div>
            ${dish.description ? `<div class="dish-description">${dish.description}</div>` : ""}
            ${priceDisplay}
            <div class="dish-actions">
                <button class="btn-view" onclick="showDishDetail(${dish.idDish})">
                    <i class="fas fa-eye"></i>
                    Chi tiết
                </button>
            </div>
        </div>
    `

    return card
}

function updateStats() {
    const totalElement = document.getElementById("totalDishes")
    const availableElement = document.getElementById("availableDishes")
    const discountElement = document.getElementById("discountDishes")
    const soldOutElement = document.getElementById("soldOutDishes")

    if (totalElement) totalElement.textContent = dishlist.length

    const availableDishes = dishlist.filter((d) => !d.issoldout).length
    if (availableElement) availableElement.textContent = availableDishes

    const discountDishes = dishlist.filter((d) => d.discount && d.discount > 0).length
    if (discountElement) discountElement.textContent = discountDishes

    const soldOutDishes = dishlist.filter((d) => d.issoldout).length
    if (soldOutElement) soldOutElement.textContent = soldOutDishes
}

function showLoading(show) {
    const loadingState = document.getElementById("loadingState")
    const container = document.getElementById("dishTableBody")

    if (loadingState) {
        loadingState.style.display = show ? "block" : "none"
    }
    if (container) {
        container.style.display = show ? "none" : "grid"
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

    document.body.appendChild(notification)

    // Show notification
    setTimeout(() => notification.classList.add("show"), 100)

    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove("show")
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification)
            }
        }, 300)
    }, 3000)
}

async function searchDishes() {
    const keyword = document.getElementById("dishSearchInput").value.trim()

    if (!keyword) {
        dishlist = [...originalDishlist]
        loadDishes()
       // updateStats()
        return
    }

    showLoading(true)
    try {
        const res = await fetch(`/api/dishapi/search?keyword=${encodeURIComponent(keyword)}`)
        const data = await res.json()

        if (!res.ok) {
            showNotification(data.message || "Lỗi tìm kiếm.", "error")
            return
        }

        dishlist = data
        loadDishes()
      //  updateStats()

        if (data.length === 0) {
            showNotification("Không tìm thấy món ăn nào phù hợp", "error")
        }
    } catch (err) {
        console.error("Lỗi:", err)
        showNotification("Không thể kết nối đến máy chủ.", "error")
    } finally {
        showLoading(false)
    }
}

function filterDishes() {
    const categoryFilter = document.getElementById("categoryFilter").value
    const statusFilter = document.getElementById("statusFilter").value

    let filteredDishes = [...originalDishlist]

    if (categoryFilter) {
        filteredDishes = filteredDishes.filter(
            (dish) => dish.dishcategoryName && dish.dishcategoryName.toLowerCase().includes(categoryFilter.toLowerCase()),
        )
    }

    if (statusFilter === "available") {
        filteredDishes = filteredDishes.filter((dish) => !dish.issoldout)
    } else if (statusFilter === "unavailable") {
        filteredDishes = filteredDishes.filter((dish) => dish.issoldout)
    }

    dishlist = filteredDishes
    loadDishes()
   // updateStats()
}

async function deleteDish(id) {
    if (!confirm("Bạn có chắc muốn xóa món ăn này không?")) return

    try {
        const res = await fetch(`${apiUrl}/${id}`, { method: "DELETE" })
        if (res.ok) {
            showNotification("Đã xóa món ăn thành công!")
            const modal = bootstrap.Modal.getInstance(document.getElementById("dishDetailModal"))
            if (modal) modal.hide()
            getAllDishes()
        } else {
            const err = await res.text()
            showNotification("Không thể xóa: " + err, "error")
        }
    } catch (error) {
        console.error("Error deleting dish:", error)
        showNotification("Lỗi khi xóa món ăn", "error")
    }
}

async function showDishDetail(idDish) {
    try {
        const res = await fetch(`/Dish/DetailsPartial/${idDish}`)
        const html = await res.text()

        document.getElementById("dishDetailContent").innerHTML = html

        const modal = new bootstrap.Modal(document.getElementById("dishDetailModal"))
        modal.show()
    } catch (error) {
        console.error("Error showing dish detail:", error)
        showNotification("Lỗi khi tải chi tiết món ăn", "error")
    }
}

async function openAddDishModal() {
    try {
        const html = await fetch("/Dish/EditPartial/0").then((r) => r.text())
        document.getElementById("editDishModalContent").innerHTML = html
        new bootstrap.Modal("#editDishModal").show()
        await loadDishCategories()
    } catch (error) {
        console.error("Error opening add dish modal:", error)
        showNotification("Lỗi khi mở form thêm món", "error")
    }
}

async function openEditDishModal(id) {
    try {
        const html = await fetch(`/Dish/EditPartial/${id}`).then((r) => r.text())
        const res = await fetch(`${apiUrl}/${id}`)
        const item = await res.json()

        // Hide detail modal if open
        const detailModal = bootstrap.Modal.getInstance(document.getElementById("dishDetailModal"))
        if (detailModal) detailModal.hide()

        // Show edit modal
        document.getElementById("editDishModalContent").innerHTML = html
        new bootstrap.Modal("#editDishModal").show()
        await loadDishCategories(item.idDishcategory)
    } catch (error) {
        console.error("Error opening edit dish modal:", error)
        showNotification("Lỗi khi mở form sửa món", "error")
    }
}

async function loadDishCategories(selectedId = null) {
    try {
        const res = await fetch("/api/dishcategoryapi")
        const categories = await res.json()

        // Load for filter dropdown
        const filterSelect = document.getElementById("categoryFilter")
        if (filterSelect) {
            const currentValue = filterSelect.value
            filterSelect.innerHTML = '<option value="">Tất cả danh mục</option>'
            categories.forEach((cat) => {
                const option = document.createElement("option")
                option.value = cat.name
                option.textContent = cat.name
                if (currentValue === cat.name) option.selected = true
                filterSelect.appendChild(option)
            })
        }

        // Load for edit modal dropdown
        const editSelect = document.getElementById("editDishCategory")
        if (editSelect) {
            editSelect.innerHTML = ""
            categories.forEach((cat) => {
                const option = document.createElement("option")
                option.value = cat.idDishcategory
                option.textContent = cat.name
                if (selectedId && selectedId === cat.idDishcategory) {
                    option.selected = true
                }
                editSelect.appendChild(option)
            })
        }
    } catch (error) {
        console.error("Error loading dish categories:", error)
    }
}

async function submitDish() {
    try {
        //const uploadDishPhotoAndGetPath = async () => {
        //    // Placeholder for uploadDishPhotoAndGetPath function
        //    // Implement the actual function here
        //}
        await uploadDishPhotoAndGetPath()

        const valName = document.getElementById("validateName")
        const valPrice = document.getElementById("validatePrice")
        const valDiscount = document.getElementById("validateDiscount")
        const valIngr = document.getElementById("validateIngredients")

        const form = document.getElementById("editDishForm")
        const formData = new FormData(form)

        // Validation
        if (formData.get("Name") === "") {
            if (valName) valName.hidden = false
            return
        } else if (valName) valName.hidden = true

        if (formData.get("Price") === "") {
            if (valPrice) {
                valPrice.innerHTML = "Giá không được để trống!"
                valPrice.hidden = false
            }
            return
        } else if (valPrice) valPrice.hidden = true

        if (Number.parseFloat(formData.get("Price")) <= 0) {
            if (valPrice) {
                valPrice.innerHTML = "Giá phải có giá trị dương!"
                valPrice.hidden = false
            }
            return
        } else if (valPrice) valPrice.hidden = true

        if (formData.get("Discount") !== "") {
            if (Number.parseFloat(formData.get("Discount")) < 0 || Number.parseFloat(formData.get("Discount")) > 100) {
                if (valDiscount) valDiscount.hidden = false
                return
            } else if (valDiscount) valDiscount.hidden = true
        }

        const dishData = {
            IdDish: Number.parseInt(formData.get("IdDish")),
            Name: formData.get("Name"),
            Issoldout: formData.get("Issoldout") ? true : false,
            Discount: Number.parseFloat(formData.get("Discount")) || 0,
            Price: Number.parseFloat(formData.get("Price")),
            Description: formData.get("Description"),
            Photo: formData.get("Photo"),
            IdDishcategory: Number.parseInt(formData.get("IdDishcategory")),
            Dishingredients: [],
        }

        // Get ingredients from table
        const ingredients = []
        let hasInvalidAmount = false

        document.querySelectorAll("#editIngredientBody tr").forEach((row) => {
            const id = Number.parseInt(row.dataset.id)
            const amountInput = row.querySelector("input")
            const amount = Number.parseFloat(amountInput.value)

            if (isNaN(id) || isNaN(amount) || amount <= 0) {
                hasInvalidAmount = true
                amountInput.classList.add("is-invalid")
            } else {
                amountInput.classList.remove("is-invalid")
                ingredients.push({ idInventoryitem: id, amount: amount })
            }
        })

        if (hasInvalidAmount) {
            if (valIngr) {
                valIngr.innerHTML = "Vui lòng nhập số lượng hợp lệ cho tất cả nguyên liệu (lớn hơn 0)"
                valIngr.hidden = false
            }
            return
        } else if (valIngr) valIngr.hidden = true

        dishData.Dishingredients = ingredients

        const id = dishData.IdDish
        const method = id > 0 ? "PUT" : "POST"
        const url = id > 0 ? `/api/dishapi/${id}` : "/api/dishapi"

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dishData),
        })

        if (res.ok) {
            showNotification(id > 0 ? "Đã cập nhật món ăn!" : "Đã tạo món mới!")
            bootstrap.Modal.getInstance("#editDishModal").hide()
            getAllDishes()
        } else {
            const errorText = await res.text()
            showNotification("Lỗi: " + errorText, "error")
        }
    } catch (error) {
        console.error("Error submitting dish:", error)
        showNotification("Lỗi khi lưu món ăn", "error")
    }
}

function returnToDetail(id) {
    bootstrap.Modal.getInstance(document.getElementById("editDishModal")).hide()
    showDishDetail(id)
}

async function addIngredientRow() {
    try {
        const res = await fetch("/api/inventoryitemapi")
        const allItems = await res.json()
        let items = allItems.filter((item) => item.inventoryitemtypeName === "Nguyên liệu")
        const usedIds = Array.from(document.querySelectorAll("#editIngredientBody tr")).map((tr) =>
            Number.parseInt(tr.dataset.id),
        )

        items = items.filter((item) => !usedIds.includes(item.idInventoryitem))

        if (items.length === 0) {
            showNotification("Không còn nguyên liệu nào khả dụng.", "error")
            return
        }

        const tbody = document.getElementById("editIngredientBody")
        const firstItem = items[0]
        const tr = document.createElement("tr")
        tr.dataset.id = firstItem.idInventoryitem

        tr.innerHTML = `
            <td>
                <select class="form-select form-select-sm" onchange="updateRowId(this)">
                    ${items.map((item) => `<option value="${item.idInventoryitem}" data-unit="${item.unit}">${item.name}</option>`).join("")}
                </select>
            </td>
            <td class="unit-cell">${firstItem.unit}</td>
            <td>
                <input type="number" class="form-control form-control-sm" value="1" />
            </td>
            <td class="text-center">
                <button type="button" class="btn btn-sm btn-danger" onclick="removeIngredientRow(this)">X</button>
            </td>
        `

        tbody.appendChild(tr)
    } catch (error) {
        console.error("Error adding ingredient row:", error)
        showNotification("Lỗi khi thêm nguyên liệu", "error")
    }
}

function updateRowId(selectElement) {
    const row = selectElement.closest("tr")
    const selectedOption = selectElement.options[selectElement.selectedIndex]
    row.dataset.id = selectedOption.value

    const unit = selectedOption.dataset.unit
    row.querySelector(".unit-cell").textContent = unit
}

function removeIngredientRow(button) {
    const row = button.closest("tr")
    row.remove()
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

if (!document.querySelector("#notification-styles")) {
    const styleSheet = document.createElement("style")
    styleSheet.id = "notification-styles"
    styleSheet.textContent = notificationStyles
    document.head.appendChild(styleSheet)
}
