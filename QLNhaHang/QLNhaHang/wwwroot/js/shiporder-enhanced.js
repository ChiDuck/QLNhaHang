class ShiporderManager {
    constructor() {
        this.shiporderlist = []
        this.filteredList = []
        this.currentPage = 1
        this.itemsPerPage = 12
        this.currentOrderId = null
        this.searchTimeout = null

        this.init()
    }

    init() {
        this.bindEvents()
        this.loadOrders()
    }

    bindEvents() {
        // Search functionality
        const searchInput = document.getElementById("shiporderSearchInput")
        const clearSearch = document.getElementById("clearSearch")

        searchInput.addEventListener("input", (e) => {
            clearTimeout(this.searchTimeout)
            this.searchTimeout = setTimeout(() => {
                this.handleSearch(e.target.value)
            }, 300)
        })

        clearSearch.addEventListener("click", () => {
            searchInput.value = ""
            this.handleSearch("")
        })

        // Filter events
        document.getElementById("statusFilter").addEventListener("change", () => this.applyFilters())
        document.getElementById("dateFilter").addEventListener("change", () => this.applyFilters())
        document.getElementById("sortOrder").addEventListener("change", () => this.applyFilters())

        // Refresh button
        document.getElementById("refreshData").addEventListener("click", () => {
            this.showLoading()
            this.loadOrders()
        })

        // Modal events
        document.getElementById("btnAccept").addEventListener("click", () => {
            if (this.currentOrderId) {
                this.updateStatus(this.currentOrderId, 3)
            }
        })

        document.getElementById("btnReject").addEventListener("click", () => {
            if (this.currentOrderId) {
                this.updateStatus(this.currentOrderId, 2)
            }
        })
    }

    async loadOrders() {
        try {
            this.showLoading()
            const response = await fetch("/api/shiporderapi")

            if (!response.ok) {
                throw new Error("Network response was not ok")
            }

            this.shiporderlist = await response.json()
            this.filteredList = [...this.shiporderlist]
            // this.updateStats()
            this.applyFilters()
            this.hideLoading()
        } catch (error) {
            console.error("Error loading orders:", error)
            this.showError("Không thể tải danh sách đơn hàng. Vui lòng thử lại.")
            this.hideLoading()
        }
    }

    handleSearch(keyword) {
        const searchInput = document.getElementById("shiporderSearchInput")
        const clearSearch = document.getElementById("clearSearch")

        clearSearch.style.display = keyword ? "block" : "none"

        if (!keyword.trim()) {
            this.filteredList = [...this.shiporderlist]
        } else {
            this.filteredList = this.shiporderlist.filter(
                (order) =>
                    order.phone?.toLowerCase().includes(keyword.toLowerCase()) ||
                    order.email?.toLowerCase().includes(keyword.toLowerCase()) ||
                    order.customername?.toLowerCase().includes(keyword.toLowerCase()),
            )
        }

        this.currentPage = 1
        this.applyFilters()
    }

    applyFilters() {
        let filtered = [...this.filteredList]

        // Status filter
        const statusFilter = document.getElementById("statusFilter").value
        if (statusFilter) {
            filtered = filtered.filter((order) => order.idOrderstatus == statusFilter)
        }

        // Date filter
        const dateFilter = document.getElementById("dateFilter").value
        if (dateFilter) {
            const now = new Date()
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

            filtered = filtered.filter((order) => {
                const orderDate = new Date(order.orderdate)
                const orderDay = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate())

                switch (dateFilter) {
                    case "today":
                        return orderDay.getTime() === today.getTime()
                    case "week":
                        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
                        return orderDay >= weekAgo
                    case "month":
                        const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
                        return orderDay >= monthAgo
                    default:
                        return true
                }
            })
        }

        // Sort
        const sortOrder = document.getElementById("sortOrder").value
        filtered.sort((a, b) => {
            switch (sortOrder) {
                case "newest":
                    return new Date(b.orderdate) - new Date(a.orderdate)
                case "oldest":
                    return new Date(a.orderdate) - new Date(b.orderdate)
                case "price-high":
                    return b.orderprice - a.orderprice
                case "price-low":
                    return a.orderprice - b.orderprice
                default:
                    return new Date(b.orderdate) - new Date(a.orderdate)
            }
        })

        this.filteredList = filtered
        this.renderOrders()
        this.renderPagination()
    }

    renderOrders() {
        const ordersGrid = document.getElementById("ordersGrid")
        const emptyState = document.getElementById("emptyState")

        if (this.filteredList.length === 0) {
            ordersGrid.style.display = "none"
            emptyState.style.display = "block"
            document.getElementById("paginationContainer").style.display = "none"
            return
        }

        ordersGrid.style.display = "grid"
        emptyState.style.display = "none"
        document.getElementById("paginationContainer").style.display = "flex"

        const startIndex = (this.currentPage - 1) * this.itemsPerPage
        const endIndex = startIndex + this.itemsPerPage
        const pageItems = this.filteredList.slice(startIndex, endIndex)

        ordersGrid.innerHTML = ""

        pageItems.forEach((order) => {
            const orderCard = this.createOrderCard(order)
            ordersGrid.appendChild(orderCard)
        })

        // Add animation
        const cards = ordersGrid.querySelectorAll(".order-card")
        cards.forEach((card, index) => {
            card.style.opacity = "0"
            card.style.transform = "translateY(20px)"
            setTimeout(() => {
                card.style.transition = "all 0.3s ease"
                card.style.opacity = "1"
                card.style.transform = "translateY(0)"
            }, index * 100)
        })
    }

    createOrderCard(order) {
        const card = document.createElement("div")
        card.className = "order-card"

        const statusClass = this.getStatusClass(order.idOrderstatus)
        const statusText = order.orderstatusName
        const orderDate = new Date(order.orderdate).toLocaleString("vi-VN")

        card.innerHTML = `
            <div class="order-header">
                <div class="order-id">
                    <i class="fas fa-receipt"></i>
                    #${order.idShiporder}
                </div>
                <span class="order-status ${statusClass}">${statusText}</span>
            </div>
            
            <div class="order-info">
                <div class="info-row">
                    <span class="info-label">
                        <i class="fas fa-user"></i>
                        Khách hàng:
                    </span>
                    <span class="info-value">${order.customername}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">
                        <i class="fas fa-phone"></i>
                        Điện thoại:
                    </span>
                    <span class="info-value">${order.phone || "Không có"}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">
                        <i class="fas fa-envelope"></i>
                        Email:
                    </span>
                    <span class="info-value">${order.email || "Không có"}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">
                        <i class="fas fa-clock"></i>
                        Thời gian:
                    </span>
                    <span class="info-value">${orderDate}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">
                        <i class="fas fa-money-bill-wave"></i>
                        Tổng tiền:
                    </span>
                    <span class="info-value order-price">${this.formatCurrency(order.orderprice)}</span>
                </div>
            </div>
            
            <div class="order-actions">
                <button class="btn-view" onclick="shiporderManager.showDetail(${order.idShiporder})">
                    <i class="fas fa-eye"></i>
                    Xem chi tiết
                </button>
            </div>
        `

        return card
    }

    async showDetail(id) {
        try {
            this.currentOrderId = id
            const response = await fetch(`/api/shiporderapi/${id}`)

            if (!response.ok) {
                throw new Error("Failed to fetch order details")
            }

            const data = await response.json()
            this.populateModal(data)

            const modal = window.bootstrap.Modal.getOrCreateInstance(document.getElementById("orderDetailModal"))
            modal.show()
        } catch (error) {
            console.error("Error loading order detail:", error)
            this.showError("Không thể tải chi tiết đơn hàng.")
        }
    }

    populateModal(data) {
        // Basic info
        document.getElementById("detailId").textContent = data.idShiporder
        document.getElementById("detailCustomer").textContent = data.customername
        document.getElementById("detailPhone").textContent = data.phone || "Không có"
        document.getElementById("detailEmail").textContent = data.email || "Không có"
        document.getElementById("detailDate").textContent = new Date(data.orderdate).toLocaleString("vi-VN")
        document.getElementById("detailNote").textContent = data.note || "Không có"
        document.getElementById("detailTotal").textContent = this.formatCurrency(data.orderprice)
        document.getElementById("detailShipFee").textContent = this.formatCurrency(data.shipfee || 0)

        // Status badge
        const statusBadge = document.getElementById("detailStatusBadge")
        statusBadge.textContent = this.getStatusText(data.idOrderstatus)
        statusBadge.className = `order-status-badge ${this.getStatusClass(data.idOrderstatus)}`

        // Shipping info
        const shippingType = data.isshipping ? "Giao đến địa chỉ" : "Nhận tại nhà hàng"
        document.getElementById("detailShippingType").textContent = shippingType

        const addressRow = document.getElementById("detailAddressRow")
        if (data.isshipping) {
            addressRow.style.display = "flex"
            document.getElementById("detailAddress").textContent = data.shipaddress
        } else {
            addressRow.style.display = "none"
        }

        // Payment info
        const transidRow = document.getElementById("detailTransidRow")
        if (data.transactionid) {
            document.getElementById("detailPaymentMethod").textContent = "Thanh toán VNPay"
            document.getElementById("detailTransid").textContent = data.transactionid
            transidRow.style.display = "flex"
        } else {
            document.getElementById("detailPaymentMethod").textContent = "Thanh toán tiền mặt"
            transidRow.style.display = "none"
        }

        // Order items
        this.renderOrderItems(data.items)

        // Ingredients
        this.renderIngredients(data.ingredients)

        // Action buttons
        this.setupActionButtons(data.idOrderstatus)
    }

    renderOrderItems(items) {
        const itemsList = document.getElementById("detailItems")
        itemsList.innerHTML = ""

        items.forEach((item) => {
            const itemCard = document.createElement("div")
            itemCard.className = "item-card"
            itemCard.innerHTML = `
                <div class="item-info">
                    <div class="item-name">${item.dishName}</div>
                    <div class="item-quantity">Số lượng: ${item.quantity}</div>
                </div>
                <div class="item-price">${this.formatCurrency(item.price)}</div>
            `
            itemsList.appendChild(itemCard)
        })
    }

    renderIngredients(ingredients) {
        const ingredientsList = document.getElementById("ingredientList")
        const ingredientWarning = document.getElementById("ingredientWarning")

        ingredientsList.innerHTML = ""
        let hasInsufficient = false

        ingredients.forEach((ingredient) => {
            const isEnough = ingredient.sufficient
            if (!isEnough) hasInsufficient = true

            const ingredientItem = document.createElement("div")
            ingredientItem.className = "ingredient-item"
            ingredientItem.innerHTML = `
                <div class="ingredient-name">${ingredient.name}</div>
                <div class="ingredient-amounts">
                    <span class="ingredient-required">Cần: ${ingredient.required} ${ingredient.unit}</span>
                    <span class="ingredient-available">Có: ${ingredient.available} ${ingredient.unit}</span>
                    ${!isEnough ? '<span class="ingredient-insufficient"><i class="fas fa-exclamation-triangle"></i> Thiếu</span>' : ""}
                </div>
            `
            ingredientsList.appendChild(ingredientItem)
        })

        ingredientWarning.style.display = hasInsufficient ? "block" : "none"
    }

    setupActionButtons(orderStatus) {
        const btnAccept = document.getElementById("btnAccept")
        const btnReject = document.getElementById("btnReject")

        if (orderStatus === 1) {
            // Chờ thanh toán
            btnAccept.style.display = "inline-flex"
            btnReject.style.display = "inline-flex"
        } else {
            btnAccept.style.display = "none"
            btnReject.style.display = "none"
        }
    }

    async updateStatus(id, status) {
        if (status === 3 && document.getElementById("ingredientWarning").style.display === "block") {
            const confirmed = await this.showConfirmDialog(
                "Cảnh báo nguyên liệu",
                "⚠️ Nguyên liệu không đủ để thực hiện đơn hàng. Bạn có chắc chắn muốn tiếp tục?",
                "Tiếp tục",
                "Hủy",
            )

            if (!confirmed) return
        }

        try {
            const response = await fetch(`/api/shiporderapi/${id}/status`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(status),
            })

            if (!response.ok) {
                throw new Error("Failed to update status")
            }

            this.showSuccess("Cập nhật trạng thái thành công!")

            // Close modal
            const modal = window.bootstrap.Modal.getOrCreateInstance(document.getElementById("orderDetailModal"))
            modal.hide()

            // Reload data
            await this.loadOrders()
        } catch (error) {
            console.error("Error updating status:", error)
            this.showError("Không thể cập nhật trạng thái đơn hàng.")
        }
    }

    renderPagination() {
        const totalItems = this.filteredList.length
        const totalPages = Math.ceil(totalItems / this.itemsPerPage)
        const startIndex = (this.currentPage - 1) * this.itemsPerPage
        const endIndex = Math.min(startIndex + this.itemsPerPage, totalItems)

        // Update pagination info
        document.getElementById("paginationInfo").textContent =
            `Hiển thị ${startIndex + 1} - ${endIndex} của ${totalItems} đơn hàng`

        // Generate pagination controls
        const paginationControls = document.getElementById("paginationControls")
        paginationControls.innerHTML = ""

        if (totalPages <= 1) return

        // Previous button
        const prevBtn = document.createElement("button")
        prevBtn.className = "page-btn"
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>'
        prevBtn.disabled = this.currentPage === 1
        prevBtn.addEventListener("click", () => {
            if (this.currentPage > 1) {
                this.currentPage--
                this.renderOrders()
                this.renderPagination()
            }
        })
        paginationControls.appendChild(prevBtn)

        // Page numbers
        const startPage = Math.max(1, this.currentPage - 2)
        const endPage = Math.min(totalPages, this.currentPage + 2)

        if (startPage > 1) {
            const firstBtn = this.createPageButton(1)
            paginationControls.appendChild(firstBtn)

            if (startPage > 2) {
                const ellipsis = document.createElement("span")
                ellipsis.textContent = "..."
                ellipsis.className = "page-ellipsis"
                paginationControls.appendChild(ellipsis)
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = this.createPageButton(i)
            paginationControls.appendChild(pageBtn)
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const ellipsis = document.createElement("span")
                ellipsis.textContent = "..."
                ellipsis.className = "page-ellipsis"
                paginationControls.appendChild(ellipsis)
            }

            const lastBtn = this.createPageButton(totalPages)
            paginationControls.appendChild(lastBtn)
        }

        // Next button
        const nextBtn = document.createElement("button")
        nextBtn.className = "page-btn"
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>'
        nextBtn.disabled = this.currentPage === totalPages
        nextBtn.addEventListener("click", () => {
            if (this.currentPage < totalPages) {
                this.currentPage++
                this.renderOrders()
                this.renderPagination()
            }
        })
        paginationControls.appendChild(nextBtn)
    }

    createPageButton(pageNumber) {
        const btn = document.createElement("button")
        btn.className = `page-btn ${pageNumber === this.currentPage ? "active" : ""}`
        btn.textContent = pageNumber
        btn.addEventListener("click", () => {
            this.currentPage = pageNumber
            this.renderOrders()
            this.renderPagination()
        })
        return btn
    }

    //updateStats() {
    //  const pending = this.shiporderlist.filter((o) => o.idOrderstatus === 1).length
    //  const processing = this.shiporderlist.filter((o) => o.idOrderstatus === 3 || o.idOrderstatus === 4).length
    //  const completed = this.shiporderlist.filter((o) => o.idOrderstatus === 5).length

    //  document.getElementById("pendingCount").textContent = pending
    //  document.getElementById("processingCount").textContent = processing
    //  document.getElementById("completedCount").textContent = completed
    //}

    getStatusClass(status) {
        switch (status) {
            case 1:
                return "status-pending"
            case 2:
                return "status-rejected"
            case 3:
            case 4:
                return "status-processing"
            case 5:
                return "status-completed"
            default:
                return "status-pending"
        }
    }

    getStatusText(status) {
        switch (status) {
            case 1:
                return "Chờ xác nhận"
            case 2:
                return "Đã từ chối"
            case 3:
                return "Đang thực hiện"
            case 4:
                return "Đang giao"
            case 5:
                return "Đã hoàn thành"
            case 6:
                return "Đã hủy"
            default:
                return "Không xác định"
        }
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount)
    }

    showLoading() {
        document.getElementById("loadingContainer").style.display = "block"
        document.getElementById("ordersGrid").style.display = "none"
        document.getElementById("emptyState").style.display = "none"
        document.getElementById("paginationContainer").style.display = "none"
    }

    hideLoading() {
        document.getElementById("loadingContainer").style.display = "none"
    }

    showError(message) {
        // Create toast notification
        const toast = document.createElement("div")
        toast.className = "toast-notification error"
        toast.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        `

        document.body.appendChild(toast)

        setTimeout(() => {
            toast.classList.add("show")
        }, 100)

        setTimeout(() => {
            toast.classList.remove("show")
            setTimeout(() => {
                document.body.removeChild(toast)
            }, 300)
        }, 3000)
    }

    showSuccess(message) {
        // Create toast notification
        const toast = document.createElement("div")
        toast.className = "toast-notification success"
        toast.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `

        document.body.appendChild(toast)

        setTimeout(() => {
            toast.classList.add("show")
        }, 100)

        setTimeout(() => {
            toast.classList.remove("show")
            setTimeout(() => {
                document.body.removeChild(toast)
            }, 300)
        }, 3000)
    }

    showConfirmDialog(title, message, confirmText, cancelText) {
        return new Promise((resolve) => {
            const modal = document.createElement("div")
            modal.className = "modal fade"
            modal.innerHTML = `
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${title}</h5>
                        </div>
                        <div class="modal-body">
                            <p>${message}</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${cancelText}</button>
                            <button type="button" class="btn btn-primary confirm-btn">${confirmText}</button>
                        </div>
                    </div>
                </div>
            `

            document.body.appendChild(modal)

            const bootstrapModal = window.bootstrap.Modal.getOrCreateInstance(modal)
            bootstrapModal.show()

            modal.querySelector(".confirm-btn").addEventListener("click", () => {
                resolve(true)
                bootstrapModal.hide()
            })

            modal.addEventListener("hidden.bs.modal", () => {
                resolve(false)
                document.body.removeChild(modal)
            })
        })
    }
}

// Initialize the manager when DOM is loaded
let shiporderManager
document.addEventListener("DOMContentLoaded", () => {
    shiporderManager = new ShiporderManager()
})

// Add toast notification styles
const toastStyles = `
<style>
.toast-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    z-index: 9999;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    max-width: 400px;
}

.toast-notification.show {
    transform: translateX(0);
}

.toast-notification.error {
    border-left: 4px solid #dc3545;
    color: #dc3545;
}

.toast-notification.success {
    border-left: 4px solid #28a745;
    color: #28a745;
}

.page-ellipsis {
    padding: 0.5rem;
    color: #6c757d;
}
</style>
`

document.head.insertAdjacentHTML("beforeend", toastStyles)
