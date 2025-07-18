var customerlist = []

// GET ALL customers
async function getAllCustomers() {
    showLoading(true)
    try {
        const response = await fetch("/api/customerapi")
        if (!response.ok) throw new Error("Lấy danh sách khách hàng thất bại.")
        customerlist = await response.json()
        loadCustomers()
       // updateStats()
        console.log(customerlist)
    } catch (error) {
        console.error("Error:", error)
        showNotification("Lỗi khi tải dữ liệu khách hàng", "error")
    } finally {
        showLoading(false)
    }
}

async function loadCustomers() {
    const container = document.getElementById("customerTableBody")
    const emptyState = document.getElementById("emptyState")

    if (customerlist.length === 0) {
        container.style.display = "none"
        emptyState.style.display = "block"
        return
    }

    container.style.display = "grid"
    emptyState.style.display = "none"
    container.innerHTML = ""

    customerlist.forEach((customer) => {
        const card = createCustomerCard(customer)
        container.appendChild(card)
    })

    // Add animation
    setTimeout(() => {
        container.querySelectorAll(".customer-card").forEach((card, index) => {
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

function createCustomerCard(customer) {
    const card = document.createElement("div")
    card.className = "customer-card"

    const initials = customer.name
        ? customer.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
        : "KH"
    const avatar = customer.photo ? `<img src="${customer.photo}" alt="Avatar">` : initials

    const birthday = customer.birthday ? new Date(customer.birthday).toLocaleDateString("vi-VN") : "Chưa cập nhật"

    card.innerHTML = `
        <div class="customer-header">
            <div class="customer-avatar">
                ${avatar}
            </div>
            <div class="customer-info">
                <h3>${customer.name || "Khách hàng"}</h3>
                <p>ID: ${customer.idCustomer}</p>
            </div>
        </div>
        <div class="customer-details">
            <div class="detail-row">
                <i class="fas fa-phone"></i>
                <span>${customer.phone || "Chưa cập nhật"}</span>
            </div>
            <div class="detail-row">
                <i class="fas fa-envelope"></i>
                <span>${customer.email || "Chưa cập nhật"}</span>
            </div>
            <div class="detail-row">
                <i class="fas fa-birthday-cake"></i>
                <span>${birthday}</span>
            </div>
            <div class="detail-row">
                <i class="fas fa-map-marker-alt"></i>
                <span>${customer.address || "Chưa cập nhật"}</span>
            </div>
        </div>
        <div class="customer-actions">
            <button class="btn btn-danger" onclick="deleteCustomer(${customer.idCustomer})">
                <i class="fas fa-trash"></i>
                Xóa
            </button>
        </div>
    `
    return card
}

function updateStats() {
    document.getElementById("totalCustomers").textContent = customerlist.length

    // Calculate new customers (registered in last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const newCustomers = customerlist.filter((c) => {
        if (!c.registeredDate) return false
        return new Date(c.registeredDate) > thirtyDaysAgo
    }).length

    document.getElementById("newCustomers").textContent = newCustomers

    // VIP customers (customers with orders > 10 or total spent > 5M)
    // This would need additional API call to get order data
    document.getElementById("vipCustomers").textContent = "0"
}

function showLoading(show) {
    const loadingState = document.getElementById("loadingState")
    const container = document.getElementById("customerTableBody")

    if (show) {
        loadingState.style.display = "block"
        container.style.display = "none"
    } else {
        loadingState.style.display = "none"
    }
}

function showNotification(message, type = "success") {
    const notification = document.createElement("div")
    notification.className = `notification ${type}`
    notification.innerHTML = `
        <i class="fas fa-${type === "success" ? "check-circle" : "exclamation-circle"}"></i>
        <span>${message}</span>
    `

    document.body.appendChild(notification)
    setTimeout(() => notification.classList.add("show"), 100)
    setTimeout(() => {
        notification.classList.remove("show")
        setTimeout(() => document.body.removeChild(notification), 300)
    }, 3000)
}

// Gọi hàm load khi trang load
document.addEventListener("DOMContentLoaded", () => {
    getAllCustomers()
})

// GET customer by ID
async function getCustomerById(id) {
    try {
        const response = await fetch(`/api/customerapi/${id}`)
        if (!response.ok) throw new Error(`Không tìm thấy khách hàng với ID là ${id}.`)
        const customer = await response.json()
        console.log(customer)
        return customer
    } catch (error) {
        console.error("Error:", error)
    }
}

async function searchCustomers() {
    const keyword = document.getElementById("searchInput").value.trim()

    if (!keyword) {
        loadCustomers()
        return
    }

    showLoading(true)
    try {
        const res = await fetch(`/api/customerapi/search?keyword=${encodeURIComponent(keyword)}`)
        const data = await res.json()

        if (!res.ok) {
            showNotification("Lỗi tìm kiếm: " + (data.message || "Không thể tìm."), "error")
            return
        }

        customerlist = data
        loadCustomers()

        if (data.length === 0) {
            showNotification("Không tìm thấy khách hàng nào phù hợp", "error")
        }
    } catch (err) {
        showNotification("Lỗi kết nối máy chủ.", "error")
    } finally {
        showLoading(false)
    }
}

// UPDATE customer
async function updateCustomer(id, customer) {
    try {
        const response = await fetch(`/api/customerapi/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(customer),
        })
        if (!response.ok) throw new Error("Failed to update customer")
        console.log("Customer updated")
    } catch (error) {
        console.error("Error:", error)
    }
}

// DELETE customer
async function deleteCustomer(id) {
    if (confirm("Bạn có chắc chắn muốn xóa khách hàng này không?")) {
        try {
            const response = await fetch(`/api/customerapi/${id}`, { method: "DELETE" })
            if (!response.ok) throw new Error("Failed to delete customer")
            else {
                showNotification("Xóa khách hàng thành công.")
                getAllCustomers()
            }
        } catch (error) {
            console.error("Error:", error)
            showNotification("Lỗi khi xóa khách hàng", "error")
        }
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

const styleSheet = document.createElement("style")
styleSheet.textContent = notificationStyles
document.head.appendChild(styleSheet)
