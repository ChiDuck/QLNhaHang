// Enhanced Profile JavaScript
class ProfileManager {
  constructor() {
    this.customerToken = localStorage.getItem("customertoken")
    this.originalProfile = {}
    this.isEditing = false
    this.favorites = JSON.parse(localStorage.getItem("dishFavorites") || "[]")

    this.init()
  }

  async init() {
    if (!this.customerToken) {
      window.location.href = "/Home/Index"
      return
    }

    try {
      this.setupEventListeners()
      await this.loadUserProfile()
      await this.loadUserStats()
      this.showSection("info")
      this.showNotification("success", "Chào mừng!", "Trang cá nhân đã được tải thành công")
    } catch (error) {
      console.error("Error initializing profile:", error)
      this.showNotification("danger", "Lỗi", "Không thể tải thông tin cá nhân")
    }
  }

  setupEventListeners() {
    // Navigation
    document.querySelectorAll(".profile-nav-item").forEach((item) => {
      item.addEventListener("click", () => {
        const section = item.dataset.section
        this.showSection(section)
        this.updateNavigation(item)
      })
    })

    // Profile editing
    document.getElementById("editProfileBtn").addEventListener("click", () => {
      this.toggleEditMode(true)
    })

    document.getElementById("cancelEditBtn").addEventListener("click", () => {
      this.toggleEditMode(false)
      this.resetProfileForm()
    })

    document.getElementById("saveProfileBtn").addEventListener("click", () => {
      this.saveProfile()
    })

    // Password change
    document.getElementById("changePasswordForm").addEventListener("submit", (e) => {
      e.preventDefault()
      this.changePassword()
    })

    // Password validation
    document.getElementById("newPassword").addEventListener("input", (e) => {
      this.validatePassword(e.target.value)
    })

    // Notification settings
    document.querySelectorAll('.notification-settings input[type="checkbox"]').forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        this.saveNotificationSettings()
      })
    })

    // Favorites
    document.getElementById("clearFavoritesBtn").addEventListener("click", () => {
      this.clearAllFavorites()
    })

    // Filters
    document.getElementById("reservationFilter")?.addEventListener("change", (e) => {
      this.filterReservations(e.target.value)
    })

    document.getElementById("orderFilter")?.addEventListener("change", (e) => {
      this.filterOrders(e.target.value)
    })
  }

  async loadUserProfile() {
    try {
      const response = await fetch("/api/customerapi/profile", {
        headers: { Authorization: `Bearer ${this.customerToken}` },
      })

      if (!response.ok) throw new Error("Failed to load profile")

      const profile = await response.json()
      this.originalProfile = { ...profile }
      this.populateProfileForm(profile)
      this.updateProfileHeader(profile)
    } catch (error) {
      console.error("Error loading profile:", error)
      this.showNotification("danger", "Lỗi", "Không thể tải thông tin cá nhân")
    }
  }

  async loadUserStats() {
    try {
      const [reservationsResponse, ordersResponse] = await Promise.all([
        fetch("/api/customerapi/reservations", {
          headers: { Authorization: `Bearer ${this.customerToken}` },
        }),
        fetch("/api/customerapi/orders", {
          headers: { Authorization: `Bearer ${this.customerToken}` },
        }),
      ])

      const reservations = reservationsResponse.ok ? await reservationsResponse.json() : []
      const orders = ordersResponse.ok ? await ordersResponse.json() : []

      this.updateStats(reservations, orders)
      this.updateBadges(reservations, orders)
    } catch (error) {
      console.error("Error loading stats:", error)
    }
  }

  populateProfileForm(profile) {
    document.getElementById("cusName").value = profile.name || ""
    document.getElementById("cusEmail").value = profile.email || ""
    document.getElementById("cusPhone").value = profile.phone || ""
    document.getElementById("cusAddress").value = profile.address || ""
    document.getElementById("cusBirthday").value = profile.birthday?.split("T")[0] || ""
  }

  updateProfileHeader(profile) {
    document.getElementById("profileHeaderName").textContent = profile.name || "Người dùng"
    document.getElementById("profileHeaderEmail").textContent = profile.email || "Chưa cập nhật email"
  }

  updateStats(reservations, orders) {
    document.getElementById("totalOrders").textContent = orders.length || 0
    document.getElementById("totalReservations").textContent = reservations.length || 0

    // Calculate member since year (you might want to get this from user registration date)
    const currentYear = new Date().getFullYear()
    document.getElementById("memberSince").textContent = currentYear
  }

  updateBadges(reservations, orders) {
    document.getElementById("reservationsBadge").textContent = reservations.length || 0
    document.getElementById("ordersBadge").textContent = orders.length || 0
    document.getElementById("favoritesBadge").textContent = this.favorites.length || 0
  }

  showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll(".profile-section").forEach((section) => {
      section.classList.remove("active")
    })

    // Show selected section
    const targetSection = document.getElementById(`${sectionName}Section`)
    if (targetSection) {
      targetSection.classList.add("active")

      // Load section data if needed
      switch (sectionName) {
        case "reservations":
          this.loadReservations()
          break
        case "orders":
          this.loadOrders()
          break
        case "favorites":
          this.loadFavorites()
          break
      }
    }
  }

  updateNavigation(activeItem) {
    document.querySelectorAll(".profile-nav-item").forEach((item) => {
      item.classList.remove("active")
    })
    activeItem.classList.add("active")
  }

  toggleEditMode(editing) {
    this.isEditing = editing
    const inputs = document.querySelectorAll("#profileForm .modern-input")
    const editBtn = document.getElementById("editProfileBtn")
    const formActions = document.querySelector(".form-actions")

    inputs.forEach((input) => {
      input.readOnly = !editing
      if (editing) {
        input.classList.remove("readonly")
      } else {
        input.classList.add("readonly")
      }
    })

    editBtn.style.display = editing ? "none" : "block"
    formActions.style.display = editing ? "flex" : "none"
  }

  resetProfileForm() {
    this.populateProfileForm(this.originalProfile)
  }

  async saveProfile() {
    const profileData = {
      name: document.getElementById("cusName").value.trim(),
      email: document.getElementById("cusEmail").value.trim(),
      phone: document.getElementById("cusPhone").value.trim(),
      address: document.getElementById("cusAddress").value.trim(),
      birthday: document.getElementById("cusBirthday").value || null,
    }

    // Validation
    if (!profileData.name) {
      this.showProfileMessage("danger", "Vui lòng nhập họ tên")
      return
    }

    if (profileData.email && !this.isValidEmail(profileData.email)) {
      this.showProfileMessage("danger", "Email không hợp lệ")
      return
    }

    if (profileData.phone && !this.isValidPhone(profileData.phone)) {
      this.showProfileMessage("danger", "Số điện thoại không hợp lệ")
      return
    }

    try {
      const response = await fetch("/api/customerapi/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.customerToken}`,
        },
        body: JSON.stringify(profileData),
      })

      if (response.ok) {
        this.originalProfile = { ...profileData }
        this.updateProfileHeader(profileData)
        this.toggleEditMode(false)
        this.showProfileMessage("success", "Cập nhật thông tin thành công!")
        this.showNotification("success", "Thành công", "Thông tin cá nhân đã được cập nhật")
      } else {
        throw new Error("Update failed")
      }
    } catch (error) {
      console.error("Error saving profile:", error)
      this.showProfileMessage("danger", "Cập nhật thất bại. Vui lòng thử lại!")
    }
  }

  async changePassword() {
    const currentPassword = document.getElementById("currentPassword").value
    const newPassword = document.getElementById("newPassword").value
    const confirmPassword = document.getElementById("confirmPassword").value

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      this.showPasswordMessage("danger", "Vui lòng nhập đầy đủ thông tin")
      return
    }

    if (newPassword !== confirmPassword) {
      this.showPasswordMessage("danger", "Mật khẩu mới không khớp")
      return
    }

    if (!this.isValidPassword(newPassword)) {
      this.showPasswordMessage("danger", "Mật khẩu không đáp ứng yêu cầu")
      return
    }

    try {
      const response = await fetch("/api/customerapi/changepassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.customerToken}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      if (response.ok) {
        document.getElementById("changePasswordForm").reset()
        this.showPasswordMessage("success", "Đổi mật khẩu thành công!")
        this.showNotification("success", "Thành công", "Mật khẩu đã được thay đổi")
      } else {
        const errorText = await response.text()
        this.showPasswordMessage("danger", errorText || "Đổi mật khẩu thất bại")
      }
    } catch (error) {
      console.error("Error changing password:", error)
      this.showPasswordMessage("danger", "Lỗi kết nối. Vui lòng thử lại!")
    }
  }

  validatePassword(password) {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
    }

    Object.keys(requirements).forEach((req) => {
      const element = document.querySelector(`[data-requirement="${req}"]`)
      const icon = element.querySelector("i")

      if (requirements[req]) {
        element.classList.add("valid")
        icon.className = "fas fa-check text-success"
      } else {
        element.classList.remove("valid")
        icon.className = "fas fa-times text-danger"
      }
    })

    return Object.values(requirements).every(Boolean)
  }

  async loadReservations() {
    const container = document.getElementById("reservationsList")

    try {
      const response = await fetch("/api/customerapi/reservations", {
        headers: { Authorization: `Bearer ${this.customerToken}` },
      })

      if (!response.ok) throw new Error("Failed to load reservations")

      const reservations = await response.json()
      this.renderReservations(reservations)
    } catch (error) {
      console.error("Error loading reservations:", error)
      container.innerHTML = this.createEmptyState(
        "calendar-times",
        "Không có lịch đặt bàn",
        "Bạn chưa có lịch đặt bàn nào",
      )
    }
  }

  renderReservations(reservations) {
    const container = document.getElementById("reservationsList")

    if (!reservations.length) {
      container.innerHTML = this.createEmptyState(
        "calendar-times",
        "Không có lịch đặt bàn",
        "Bạn chưa có lịch đặt bàn nào",
      )
      return
    }

    container.innerHTML = reservations
      .map(
        (reservation) => `
      <div class="item-card" onclick="profileManager.showReservationDetail(${reservation.id})">
        <div class="item-header">
          <div>
            <div class="item-title">Bàn ${reservation.tableName || reservation.tableId}</div>
            <div class="item-subtitle">${this.formatDate(reservation.date)} - ${reservation.time}</div>
          </div>
          <span class="item-status status-${this.getReservationStatus(reservation)}">
            ${this.getReservationStatusText(reservation)}
          </span>
        </div>
        <div class="item-details">
          <div class="detail-item">
            <i class="fas fa-users"></i>
            <span>${reservation.partySize} người</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-map-marker-alt"></i>
            <span>${reservation.areaName || "Khu vực chính"}</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-clock"></i>
            <span>${reservation.duration || 2} giờ</span>
          </div>
        </div>
        <div class="item-actions">
          <button class="btn modern-btn-outline btn-sm" onclick="event.stopPropagation(); profileManager.showReservationDetail(${reservation.id})">
            <i class="fas fa-eye me-1"></i>Chi tiết
          </button>
          ${
            this.canCancelReservation(reservation)
              ? `
            <button class="btn btn-outline-danger btn-sm" onclick="event.stopPropagation(); profileManager.cancelReservation(${reservation.id})">
              <i class="fas fa-times me-1"></i>Hủy
            </button>
          `
              : ""
          }
        </div>
      </div>
    `,
      )
      .join("")
  }

  async loadOrders() {
    const container = document.getElementById("ordersList")

    try {
      const response = await fetch("/api/customerapi/orders", {
        headers: { Authorization: `Bearer ${this.customerToken}` },
      })

      if (!response.ok) throw new Error("Failed to load orders")

      const orders = await response.json()
      this.renderOrders(orders)
    } catch (error) {
      console.error("Error loading orders:", error)
      container.innerHTML = this.createEmptyState("shopping-bag", "Không có đơn hàng", "Bạn chưa có đơn hàng nào")
    }
  }

  renderOrders(orders) {
    const container = document.getElementById("ordersList")

    if (!orders.length) {
      container.innerHTML = this.createEmptyState("shopping-bag", "Không có đơn hàng", "Bạn chưa có đơn hàng nào")
      return
    }

    container.innerHTML = orders
      .map(
        (order) => `
      <div class="item-card" onclick="profileManager.showOrderDetail(${order.id})">
        <div class="item-header">
          <div>
            <div class="item-title">Đơn hàng #${order.id}</div>
            <div class="item-subtitle">${this.formatDate(order.date)}</div>
          </div>
          <span class="item-status status-${this.getOrderStatus(order)}">
            ${this.getOrderStatusText(order)}
          </span>
        </div>
        <div class="item-details">
          <div class="detail-item">
            <i class="fas fa-money-bill-wave"></i>
            <span>${this.formatPrice(order.total)}</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-truck"></i>
            <span>${order.isShipping ? "Giao hàng" : "Tại quán"}</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-credit-card"></i>
            <span>${order.paymentMethod === "cash" ? "Tiền mặt" : "VNPay"}</span>
          </div>
        </div>
        <div class="item-actions">
          <button class="btn modern-btn-outline btn-sm" onclick="event.stopPropagation(); profileManager.showOrderDetail(${order.id})">
            <i class="fas fa-eye me-1"></i>Chi tiết
          </button>
          <button class="btn modern-btn-primary btn-sm" onclick="event.stopPropagation(); profileManager.reorder(${order.id})">
            <i class="fas fa-redo me-1"></i>Đặt lại
          </button>
        </div>
      </div>
    `,
      )
      .join("")
  }

  async loadFavorites() {
    const container = document.getElementById("favoritesList")

    if (!this.favorites.length) {
      container.innerHTML = this.createEmptyState(
        "heart",
        "Chưa có món yêu thích",
        "Hãy thêm những món ăn bạn yêu thích",
      )
      return
    }

    try {
      // Load dish details for favorites
      const dishPromises = this.favorites.map((dishId) =>
        fetch(`/api/dishapi/${dishId}`).then((res) => (res.ok ? res.json() : null)),
      )

      const dishes = (await Promise.all(dishPromises)).filter(Boolean)
      this.renderFavorites(dishes)
    } catch (error) {
      console.error("Error loading favorites:", error)
      container.innerHTML = this.createEmptyState(
        "exclamation-triangle",
        "Lỗi tải dữ liệu",
        "Không thể tải danh sách yêu thích",
      )
    }
  }

  renderFavorites(dishes) {
    const container = document.getElementById("favoritesList")

    container.innerHTML = dishes
      .map(
        (dish) => `
      <div class="favorite-item">
        <div class="favorite-image" style="background-image: url('${dish.photo || "/placeholder.svg?height=180&width=280"}')">
          <button class="favorite-remove" onclick="profileManager.removeFavorite(${dish.idDish})">
            <i class="fas fa-heart-broken"></i>
          </button>
        </div>
        <div class="favorite-content">
          <div class="favorite-name">${dish.name}</div>
          <div class="favorite-price">${this.formatPrice(dish.price)}</div>
        </div>
      </div>
    `,
      )
      .join("")
  }

  removeFavorite(dishId) {
    this.favorites = this.favorites.filter((id) => id !== dishId)
    localStorage.setItem("dishFavorites", JSON.stringify(this.favorites))
    this.loadFavorites()
    this.updateBadges([], []) // Update badges
    this.showNotification("info", "Đã xóa", "Đã xóa khỏi danh sách yêu thích")
  }

  clearAllFavorites() {
    if (confirm("Bạn có chắc muốn xóa tất cả món ăn yêu thích?")) {
      this.favorites = []
      localStorage.setItem("dishFavorites", JSON.stringify(this.favorites))
      this.loadFavorites()
      this.updateBadges([], [])
      this.showNotification("info", "Đã xóa", "Đã xóa tất cả món ăn yêu thích")
    }
  }

  showOrderDetail(orderId) {
    // Implementation for showing order detail modal
    console.log("Show order detail:", orderId)
  }

  showReservationDetail(reservationId) {
    // Implementation for showing reservation detail modal
    console.log("Show reservation detail:", reservationId)
  }

  async saveNotificationSettings() {
    const settings = {
      orderNotifications: document.getElementById("orderNotifications").checked,
      reservationNotifications: document.getElementById("reservationNotifications").checked,
      promotionNotifications: document.getElementById("promotionNotifications").checked,
      emailMarketing: document.getElementById("emailMarketing").checked,
    }

    // Save to localStorage for now (you can implement API call)
    localStorage.setItem("notificationSettings", JSON.stringify(settings))
    this.showNotification("success", "Đã lưu", "Cài đặt thông báo đã được cập nhật")
  }

  // Utility methods
  createEmptyState(icon, title, message) {
    return `
      <div class="empty-state">
        <div class="empty-icon">
          <i class="fas fa-${icon}"></i>
        </div>
        <h6>${title}</h6>
        <p>${message}</p>
      </div>
    `
  }

  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("vi-VN")
  }

  formatPrice(price) {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  isValidPhone(phone) {
    return /^[0-9]{10,11}$/.test(phone.replace(/\D/g, ""))
  }

  isValidPassword(password) {
    return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password)
  }

  getReservationStatus(reservation) {
    // Implement based on your reservation status logic
    return reservation.status || "confirmed"
  }

  getReservationStatusText(reservation) {
    const statusMap = {
      confirmed: "Đã xác nhận",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
      pending: "Chờ xác nhận",
    }
    return statusMap[reservation.status] || "Đã xác nhận"
  }

  getOrderStatus(order) {
    return order.status || "confirmed"
  }

  getOrderStatusText(order) {
    const statusMap = {
      pending: "Chờ xử lý",
      confirmed: "Đã xác nhận",
      delivered: "Đã giao",
      cancelled: "Đã hủy",
    }
    return statusMap[order.status] || "Đã xác nhận"
  }

  canCancelReservation(reservation) {
    // Implement cancellation logic
    return reservation.status === "confirmed" || reservation.status === "pending"
  }

  showProfileMessage(type, message) {
    const messageEl = document.getElementById("profileMessage")
    messageEl.className = `modern-alert alert-${type}`
    messageEl.textContent = message
    messageEl.style.display = "block"

    setTimeout(() => {
      messageEl.style.display = "none"
    }, 5000)
  }

  showPasswordMessage(type, message) {
    const messageEl = document.getElementById("passwordMessage")
    messageEl.className = `modern-alert alert-${type}`
    messageEl.textContent = message
    messageEl.style.display = "block"

    setTimeout(() => {
      messageEl.style.display = "none"
    }, 5000)
  }

  showNotification(type, title, message) {
    const showModernNotification =
      window.showModernNotification ||
      ((type, title, message) => {
        console.log(`Notification (${type}): ${title} - ${message}`)
      })
    showModernNotification(type, title, message)
  }
}

// Initialize when DOM is loaded
let profileManager
document.addEventListener("DOMContentLoaded", () => {
  profileManager = new ProfileManager()
})
