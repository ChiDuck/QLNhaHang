class ReservationManager {
  constructor() {
    this.reservationlist = []
    this.filteredList = []
    this.currentPage = 1
    this.itemsPerPage = 12
    this.currentReservationId = null
    this.searchTimeout = null
    this.bootstrap = window.bootstrap // Declare the bootstrap variable

    this.init()
  }

  init() {
    this.bindEvents()
    this.loadReservations()
  }

  bindEvents() {
    // Search functionality
    const searchInput = document.getElementById("reservationSearchInput")
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
      this.loadReservations()
    })

    // Modal events
    document.getElementById("btnAcceptReservation").addEventListener("click", () => {
      if (this.currentReservationId) {
        this.updateReservationStatus(this.currentReservationId, true)
      }
    })

    document.getElementById("btnRejectReservation").addEventListener("click", () => {
      if (this.currentReservationId) {
        this.updateReservationStatus(this.currentReservationId, false)
      }
    })
  }

  async loadReservations() {
    try {
      this.showLoading()
      const response = await fetch("/api/reservationapi")

      if (!response.ok) {
        throw new Error("Network response was not ok")
      }

      this.reservationlist = await response.json()
      this.filteredList = [...this.reservationlist]
      this.updateStats()
      this.applyFilters()
      this.hideLoading()
    } catch (error) {
      console.error("Error loading reservations:", error)
      this.showError("Không thể tải danh sách đặt bàn. Vui lòng thử lại.")
      this.hideLoading()
    }
  }

  handleSearch(keyword) {
    const searchInput = document.getElementById("reservationSearchInput")
    const clearSearch = document.getElementById("clearSearch")

    clearSearch.style.display = keyword ? "block" : "none"

    if (!keyword.trim()) {
      this.filteredList = [...this.reservationlist]
    } else {
      this.filteredList = this.reservationlist.filter(
        (reservation) =>
          reservation.phone?.toLowerCase().includes(keyword.toLowerCase()) ||
          reservation.email?.toLowerCase().includes(keyword.toLowerCase()) ||
          reservation.customerName?.toLowerCase().includes(keyword.toLowerCase()),
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
      filtered = filtered.filter((reservation) => reservation.idReservationstatus == statusFilter)
    }

    // Date filter
    const dateFilter = document.getElementById("dateFilter").value
    if (dateFilter) {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)

      filtered = filtered.filter((reservation) => {
        const reservationDate = new Date(reservation.reservationdate)
        const resDay = new Date(reservationDate.getFullYear(), reservationDate.getMonth(), reservationDate.getDate())

        switch (dateFilter) {
          case "today":
            return resDay.getTime() === today.getTime()
          case "tomorrow":
            return resDay.getTime() === tomorrow.getTime()
          case "week":
            const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
            return resDay >= today && resDay <= weekFromNow
          case "month":
            const monthFromNow = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())
            return resDay >= today && resDay <= monthFromNow
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
          return new Date(b.bookdate) - new Date(a.bookdate)
        case "oldest":
          return new Date(a.bookdate) - new Date(b.bookdate)
        case "reservation-time":
          const dateA = new Date(a.reservationdate)
          const dateB = new Date(b.reservationdate)
          if (dateA.getTime() === dateB.getTime()) {
            return this.timeToMinutes(a.reservationtime) - this.timeToMinutes(b.reservationtime)
          }
          return dateA - dateB
        case "party-size":
          return b.partysize - a.partysize
        default:
          return new Date(b.bookdate) - new Date(a.bookdate)
      }
    })

    this.filteredList = filtered
    this.renderReservations()
    this.renderPagination()
  }

  timeToMinutes(timeString) {
    if (!timeString) return 0

    if (typeof timeString === "object" && timeString.hours !== undefined) {
      return timeString.hours * 60 + timeString.minutes
    }

    if (typeof timeString === "string") {
      const parts = timeString.split(":")
      return Number.parseInt(parts[0]) * 60 + Number.parseInt(parts[1])
    }

    return 0
  }

  renderReservations() {
    const reservationsGrid = document.getElementById("reservationsGrid")
    const emptyState = document.getElementById("emptyState")

    if (this.filteredList.length === 0) {
      reservationsGrid.style.display = "none"
      emptyState.style.display = "block"
      document.getElementById("paginationContainer").style.display = "none"
      return
    }

    reservationsGrid.style.display = "grid"
    emptyState.style.display = "none"
    document.getElementById("paginationContainer").style.display = "flex"

    const startIndex = (this.currentPage - 1) * this.itemsPerPage
    const endIndex = startIndex + this.itemsPerPage
    const pageItems = this.filteredList.slice(startIndex, endIndex)

    reservationsGrid.innerHTML = ""

    pageItems.forEach((reservation) => {
      const reservationCard = this.createReservationCard(reservation)
      reservationsGrid.appendChild(reservationCard)
    })

    // Add animation
    const cards = reservationsGrid.querySelectorAll(".reservation-card")
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

  createReservationCard(reservation) {
    const card = document.createElement("div")
    card.className = "reservation-card"

    const statusClass = this.getStatusClass(reservation.idReservationstatus)
    const statusText = this.getStatusText(reservation.idReservationstatus)
    const bookDate = new Date(reservation.bookdate).toLocaleString("vi-VN")
    const reservationDate = this.formatDate(reservation.reservationdate)
    const reservationTime = this.formatTime(reservation.reservationtime)

    card.innerHTML = `
            <div class="reservation-header">
                <div class="reservation-id">
                    <i class="fas fa-calendar-check"></i>
                    #${reservation.idReservation}
                </div>
                <span class="reservation-status ${statusClass}">${statusText}</span>
            </div>
            
            <div class="reservation-info">
                <div class="info-row">
                    <span class="info-label">
                        <i class="fas fa-user"></i>
                        Khách hàng:
                    </span>
                    <span class="info-value">${reservation.customerName || "Khách vãng lai"}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">
                        <i class="fas fa-phone"></i>
                        Điện thoại:
                    </span>
                    <span class="info-value">${reservation.phone || "Không có"}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">
                        <i class="fas fa-users"></i>
                        Số người:
                    </span>
                    <span class="info-value">${reservation.partysize} người</span>
                </div>
                <div class="info-row">
                    <span class="info-label">
                        <i class="fas fa-table"></i>
                        Bàn:
                    </span>
                    <span class="info-value">${reservation.tableName || "Chưa chọn"}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">
                        <i class="fas fa-clock"></i>
                        Tạo lúc:
                    </span>
                    <span class="info-value">${bookDate}</span>
                </div>
            </div>
            
            <div class="reservation-datetime">
                <i class="fas fa-calendar-alt"></i>
                ${reservationDate} - ${reservationTime}
            </div>
            
            <div class="info-row">
                <span class="info-label">
                    <i class="fas fa-money-bill-wave"></i>
                    Tổng tiền:
                </span>
                <span class="info-value reservation-price">${this.formatCurrency(reservation.reservationprice || 0)}</span>
            </div>
            
            <div class="reservation-actions">
                <button class="btn-view" onclick="reservationManager.showReservationDetail(${reservation.idReservation})">
                    <i class="fas fa-eye"></i>
                    Xem chi tiết
                </button>
            </div>
        `

    return card
  }

  async showReservationDetail(id) {
    try {
      this.currentReservationId = id
      const response = await fetch(`/api/reservationapi/${id}`)

      if (!response.ok) {
        throw new Error("Failed to fetch reservation details")
      }

      const data = await response.json()
      this.populateReservationModal(data)

      const modal = new this.bootstrap.Modal(document.getElementById("reservationDetailModal"))
      modal.show()
    } catch (error) {
      console.error("Error loading reservation detail:", error)
      this.showError("Không thể tải chi tiết đặt bàn.")
    }
  }

  populateReservationModal(data) {
    // Basic info
    document.getElementById("res-id").textContent = data.idReservation
    document.getElementById("res-customer").textContent = data.customerName || "Khách vãng lai"
    document.getElementById("res-phone").textContent = data.phone || "Không có"
    document.getElementById("res-email").textContent = data.email || "Không có"

    const bookDate = new Date(data.bookdate)
    const formattedBookDate = bookDate.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    document.getElementById("res-bookdate").textContent = formattedBookDate

    // Reservation info
    document.getElementById("res-date").textContent = this.formatDate(data.reservationdate)
    document.getElementById("res-time").textContent = this.formatTime(data.reservationtime)
    document.getElementById("res-party").textContent = data.partysize + " người"
    document.getElementById("res-table").textContent = data.tableName || "Chưa chọn bàn"

    // Payment info
    document.getElementById("res-price").textContent = this.formatCurrency(data.reservationprice || 0)
    document.getElementById("res-note").textContent = data.note || "Không có"
    document.getElementById("res-status").textContent = data.status || "Không xác định"

    // Transaction ID
    const transidRow = document.getElementById("res-transid-row")
    if (data.transactionid) {
      document.getElementById("res-transid").textContent = data.transactionid
      transidRow.style.display = "flex"
    } else {
      transidRow.style.display = "none"
    }

    // Status badge
    const statusBadge = document.getElementById("resStatusBadge")
    statusBadge.textContent = this.getStatusText(data.idReservationstatus)
    statusBadge.className = `reservation-status-badge ${this.getStatusClass(data.idReservationstatus)}`

    // Orders
    this.renderReservationOrders(data.orders)

    // Action buttons
    this.setupReservationActionButtons(data.status)
  }

  renderReservationOrders(orders) {
    const orderSection = document.getElementById("res-order-section")
    const ordersList = document.getElementById("res-orders")

    if (!orders || orders.length === 0) {
      orderSection.style.display = "none"
      return
    }

    orderSection.style.display = "block"
    ordersList.innerHTML = ""

    orders.forEach((order) => {
      const orderItem = document.createElement("div")
      orderItem.className = "order-item"
      orderItem.innerHTML = `
                <img src="${order.dishPhoto || "/placeholder.svg?height=60&width=60"}" 
                     alt="${order.dishName}" class="order-image" />
                <div class="order-info">
                    <div class="order-name">${order.dishName}</div>
                    <div class="order-quantity">Số lượng: ${order.quantity}</div>
                </div>
                <div class="order-total">${this.formatCurrency(order.total)}</div>
            `
      ordersList.appendChild(orderItem)
    })
  }

  setupReservationActionButtons(status) {
    const btnAccept = document.getElementById("btnAcceptReservation")
    const btnReject = document.getElementById("btnRejectReservation")

    if (status === "Chờ xác nhận") {
      btnAccept.style.display = "inline-flex"
      btnReject.style.display = "inline-flex"
    } else {
      btnAccept.style.display = "none"
      btnReject.style.display = "none"
    }
  }

  async updateReservationStatus(id, isAccepted) {
    const status = isAccepted ? 2 : 3
    const statusText = isAccepted ? "Đã chấp nhận" : "Đã từ chối"

    try {
      const response = await fetch(`/api/reservationapi/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(status),
      })

      if (!response.ok) {
        throw new Error("Failed to update status")
      }

      this.showSuccess(`Đã cập nhật đơn đặt bàn thành: ${statusText}`)

      // Close modal
      const modal = this.bootstrap.Modal.getInstance(document.getElementById("reservationDetailModal"))
      modal.hide()

      // Reload data
      await this.loadReservations()
    } catch (error) {
      console.error("Error updating reservation status:", error)
      this.showError("Cập nhật trạng thái thất bại.")
    }
  }

  renderPagination() {
    const totalItems = this.filteredList.length
    const totalPages = Math.ceil(totalItems / this.itemsPerPage)
    const startIndex = (this.currentPage - 1) * this.itemsPerPage
    const endIndex = Math.min(startIndex + this.itemsPerPage, totalItems)

    // Update pagination info
    document.getElementById("paginationInfo").textContent =
      `Hiển thị ${startIndex + 1} - ${endIndex} của ${totalItems} đặt bàn`

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
        this.renderReservations()
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
        this.renderReservations()
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
      this.renderReservations()
      this.renderPagination()
    })
    return btn
  }

  updateStats() {
    const pending = this.reservationlist.filter((r) => r.idReservationstatus === 1).length
    const confirmed = this.reservationlist.filter((r) => r.idReservationstatus === 2).length

    // Count today's reservations
    const today = new Date()
    const todayStr = today.toISOString().split("T")[0]
    const todayCount = this.reservationlist.filter((r) => {
      const resDate = new Date(r.reservationdate).toISOString().split("T")[0]
      return resDate === todayStr
    }).length

    document.getElementById("pendingCount").textContent = pending
    document.getElementById("confirmedCount").textContent = confirmed
    document.getElementById("todayCount").textContent = todayCount
  }

  getStatusClass(status) {
    switch (status) {
      case 1:
        return "status-pending"
      case 2:
        return "status-confirmed"
      case 3:
        return "status-rejected"
      case 4:
        return "status-completed"
      case 5:
        return "status-cancelled"
      default:
        return "status-pending"
    }
  }

  getStatusText(status) {
    switch (status) {
      case 1:
        return "Chờ xác nhận"
      case 2:
        return "Đã xác nhận"
      case 3:
        return "Đã từ chối"
      case 4:
        return "Đã hoàn thành"
      case 5:
        return "Đã hủy"
      default:
        return "Không xác định"
    }
  }

  formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString("vi-VN")
  }

  formatTime(time) {
    if (!time) return "--:--"

    if (typeof time === "object" && time.hours !== undefined && time.minutes !== undefined) {
      return `${time.hours.toString().padStart(2, "0")}:${time.minutes.toString().padStart(2, "0")}`
    }

    if (typeof time === "string") {
      const parts = time.split(":")
      return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`
    }

    return "--:--"
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  showLoading() {
    document.getElementById("loadingContainer").style.display = "block"
    document.getElementById("reservationsGrid").style.display = "none"
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
}

// Initialize the manager when DOM is loaded
let reservationManager
document.addEventListener("DOMContentLoaded", () => {
  reservationManager = new ReservationManager()
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
