class ModernBookingManager {
    constructor() {
        this.currentStep = 1
        this.totalSteps = 4
        this.bookingData = {
            reservationDate: null,
            reservationTime: null,
            partySize: 2,
            selectedDishes: [],
            tableTypeId: null,
            name: null,
            customerName: "",
            phone: "",
            email: "",
            note: "",
            reservationPrice: 0,
            idCustomer: null,
        }
        this.availableDishes = []
        this.availableTableTypes = []
        this.bootstrap = window.bootstrap

        this.init()
    }

    init() {
        this.bindEvents()
        this.initializeStep1()
    }

    bindEvents() {
        // Book now buttons
        document.querySelectorAll(".book-now-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                this.openBookingModal()
            })
        })

        // Navigation buttons
        document.getElementById("bookingNextBtn").addEventListener("click", () => {
            this.nextStep()
        })

        document.getElementById("bookingPrevBtn").addEventListener("click", () => {
            this.prevStep()
        })

        document.getElementById("bookingConfirmBtn").addEventListener("click", () => {
            this.confirmBooking()
        })

        // Form inputs
        document.getElementById("bookingDate").addEventListener("change", (e) => {
            this.bookingData.reservationDate = e.target.value
            this.populateTimeSlots();
        })

        document.getElementById("bookingTime").addEventListener("change", (e) => {
            this.bookingData.reservationTime = e.target.value
        })

        document.getElementById("partySize").addEventListener("change", (e) => {
            this.bookingData.partySize = Number.parseInt(e.target.value)
        })

        // Dish search
        //document.getElementById("dishSearchInput").addEventListener("input", (e) => {
        //    this.filterDishes(e.target.value)
        //})

        // Category buttons
        document.querySelectorAll(".category-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                this.filterByCategory(e.target.dataset.category)
            })
        })

        // Customer info inputs
        document.getElementById("customerBookName").addEventListener("input", (e) => {
            this.bookingData.customerName = e.target.value
        })

        document.getElementById("customerPhone").addEventListener("input", (e) => {
            this.bookingData.phone = e.target.value
        })

        document.getElementById("customerEmail").addEventListener("input", (e) => {
            this.bookingData.email = e.target.value
        })

        document.getElementById("bookingNote").addEventListener("input", (e) => {
            this.bookingData.note = e.target.value
        })
    }

    openBookingModal() {
        const modal = new this.bootstrap.Modal(document.getElementById("bookingModal"))
        modal.show()
        document.getElementById("bookingDate").value = '';
        document.getElementById("partySize").value = 2;
        this.resetBooking()
    }

    resetBooking() {
        this.currentStep = 1
        this.bookingData = {
            reservationDate: null,
            reservationTime: null,
            partySize: 2,
            selectedDishes: [],
            id: null,
            name: null,
            customerName: "",
            phone: "",
            email: "",
            note: "",
            reservationPrice: 0,
        }
        this.updateStepDisplay()
        this.updateProgressSteps()
    }

    initializeStep1() {
        // Set minimum date to today
        const today = new Date().toISOString().split("T")[0]
        document.getElementById("bookingDate").min = today

        // Populate time slots
        this.populateTimeSlots()
    }

    populateTimeSlots() {
        const timeSelect = document.getElementById("bookingTime");
        timeSelect.innerHTML = '<option value="">Chọn giờ</option>';

        const timeSlots = [
            "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
            "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
            "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
            "19:00", "19:30", "20:00", "20:30", "21:00",
        ];

        const selectedDate = document.getElementById("bookingDate").value;
        const today = new Date();
        const todayStr = today.toISOString().split("T")[0];

        let filteredSlots = timeSlots;

        if (selectedDate === todayStr) {
            const nowMinutes = today.getHours() * 60 + today.getMinutes();

            filteredSlots = timeSlots.filter(slot => {
                const [hour, minute] = slot.split(":").map(Number);
                const slotMinutes = hour * 60 + minute;
                return slotMinutes > nowMinutes;
            });
        }

        filteredSlots.forEach(time => {
            const option = document.createElement("option");
            option.value = time;
            option.textContent = time;
            timeSelect.appendChild(option);
        });
    }

    async loadDishes() {
        try {
            this.showLoading("dishesGrid")
            const response = await fetch("/api/dishapi/available")
            if (response.ok) {
                this.availableDishes = await response.json()
                this.renderDishes(this.availableDishes)
            } else {
                this.showError("Không thể tải danh sách món ăn")
            }
        } catch (error) {
            console.error("Error loading dishes:", error)
            this.showError("Lỗi khi tải danh sách món ăn")
        } finally {
            this.hideLoading("dishesGrid")
        }
    }

    renderDishes(dishes) {
        const container = document.getElementById("dishesGrid")
        container.innerHTML = ""

        if (dishes.length === 0) {
            container.innerHTML = `
        <div class="col-12 text-center py-4">
          <i class="fas fa-search fa-3x text-muted mb-3"></i>
          <p class="text-muted">Không tìm thấy món ăn nào</p>
        </div>
      `
            return
        }

        dishes.forEach((dish) => {
            const dishCard = this.createDishCard(dish)
            container.appendChild(dishCard)
        })
    }

    createDishCard(dish) {
        const card = document.createElement("div")
        card.className = "dish-card"
        card.dataset.idDish = dish.idDish

        const selectedDish = this.bookingData.selectedDishes.find((d) => d.idDish === dish.idDish)
        const quantity = selectedDish ? selectedDish.quantity : 0

        if (quantity > 0) {
            card.classList.add("selected")
        }

        const imageUrl = dish.photo || "/images/placeholder.png"
        const formattedPrice = this.formatCurrency(dish.price - dish.price * dish.discount / 100)

        card.innerHTML = `
      <img src="${imageUrl}" alt="${dish.name}" class="dish-image">
      <div class="dish-name">${dish.name}</div>
      <div class="dish-description">${dish.description || "Món ăn ngon tuyệt vời"}</div>
      <div class="dish-price-section">
        <div class="dish-price">${formattedPrice}</div>
        <div class="quantity-controls" style="display: ${quantity > 0 ? "flex" : "none"}">
          <button class="quantity-btn" onclick="bookingManager.updateDishQuantity(${dish.idDish}, -1)">
            <i class="fas fa-minus"></i>
          </button>
          <span class="quantity-display">${quantity}</span>
          <button class="quantity-btn" onclick="bookingManager.updateDishQuantity(${dish.idDish}, 1)">
            <i class="fas fa-plus"></i>
          </button>
        </div>
      </div>
    `

        card.addEventListener("click", (e) => {
            if (!e.target.closest(".quantity-controls")) {
                this.toggleDishSelection(dish)
            }
        })

        return card
    }

    toggleDishSelection(dish) {
        const existingIndex = this.bookingData.selectedDishes.findIndex((d) => d.idDish === dish.idDish)

        if (existingIndex >= 0) {
            this.bookingData.selectedDishes.splice(existingIndex, 1)
        } else {
            this.bookingData.selectedDishes.push({
                idDish: dish.idDish,
                name: dish.name,
                price: dish.price - dish.price * dish.discount / 100,
                quantity: 1,
                discount: dish.discount || 0,
            })
        }

        this.renderDishes(this.availableDishes)
        this.updateSelectedDishesDisplay()
    }

    updateDishQuantity(idDish, change) {
        const dishIndex = this.bookingData.selectedDishes.findIndex((d) => d.idDish === idDish)

        if (dishIndex >= 0) {
            this.bookingData.selectedDishes[dishIndex].quantity += change

            if (this.bookingData.selectedDishes[dishIndex].quantity <= 0) {
                this.bookingData.selectedDishes.splice(dishIndex, 1)
            }
        } else if (change > 0) {
            const dish = this.availableDishes.find((d) => d.idDish === idDish)
            if (dish) {
                this.bookingData.selectedDishes.push({
                    idDish: dish.idDish,
                    name: dish.name,
                    price: dish.price - dish.price * dish.discount / 100,
                    quantity: 1,
                    discount: dish.discount || 0,
                })
            }
        }
        console.log("Updated selected dishes:", this.availableDishes)
        console.log("Updated selected dishes:", this.selectedDishes)
        this.renderDishes(this.availableDishes)
        this.updateSelectedDishesDisplay()
    }

    updateSelectedDishesDisplay() {
        const summary = document.getElementById("selectedDishesSummary")
        const list = document.getElementById("selectedDishesList")
        const total = document.getElementById("dishesTotal")

        if (this.bookingData.selectedDishes.length === 0) {
            summary.style.display = "none"
            return
        }

        summary.style.display = "block"
        list.innerHTML = ""

        let totalAmount = 0
        console.log("Selected Dishes:", this.bookingData.selectedDishes)
        this.bookingData.selectedDishes.forEach((dish) => {
            const itemTotal = (dish.price - dish.price * dish.discount / 100) * dish.quantity
            totalAmount += itemTotal
            console.log(`Dish: ${dish.name}, Quantity: ${dish.quantity}, Item Total: ${itemTotal}`)
            const item = document.createElement("div")
            item.className = "selected-dish-item"
            item.innerHTML = `
        <div class="dish-item-info">
          <div class="dish-item-name">${dish.name}</div>
          <div class="dish-item-details">${dish.quantity} x ${this.formatCurrency(dish.price - dish.price * dish.discount / 100)}</div>
        </div>
        <div class="dish-item-total">${this.formatCurrency(itemTotal)}</div>
      `
            list.appendChild(item)
        })

        total.textContent = this.formatCurrency(totalAmount)
    }

    filterDishes(searchTerm) {
        const filtered = this.availableDishes.filter(
            (dish) =>
                dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (dish.description && dish.description.toLowerCase().includes(searchTerm.toLowerCase())),
        )
        this.renderDishes(filtered)
    }

    filterByCategory(category) {
        // Update active category button
        document.querySelectorAll(".category-btn").forEach((btn) => {
            btn.classList.remove("active")
        })
        document.querySelector(`[data-category="${category}"]`).classList.add("active")

        // Filter dishes
        let filtered = this.availableDishes
        if (category !== "all") {
            filtered = this.availableDishes.filter(
                (dish) => dish.categoryName && dish.categoryName.toLowerCase().includes(category.toLowerCase()),
            )
        }
        this.renderDishes(filtered)
    }

    async loadTableTypes() {
        try {
            this.showLoading("tableTypesContainer")
            const response = await fetch(`/api/dinetableapi/available-types?date=${this.bookingData.reservationDate}&time=${this.bookingData.reservationTime}&partySize=${this.bookingData.partySize}`)
            if (response.ok) {
                this.availableTableTypes = await response.json()
                this.renderTableTypes()
            } else {
                this.showError("Không thể tải danh sách loại bàn")
            }
        } catch (error) {
            console.error("Error loading table types:", error)
            this.showError("Lỗi khi tải danh sách loại bàn")
        } finally {
            this.hideLoading("tableTypesContainer")
        }
    }

    renderTableTypes() {
        const container = document.getElementById("tableTypesContainer")
        container.innerHTML = ""

        this.availableTableTypes.forEach((tableType) => {
            const card = this.createTableTypeCard(tableType)
            container.appendChild(card)
        })
    }

    createTableTypeCard(tableType) {
        const card = document.createElement("div")
        card.className = "table-type-card"
        card.dataset.id = tableType.id

        if (this.bookingData.tableTypeId === tableType.id) {
            card.classList.add("selected")
        }

        // Simulate availability (in real app, this would come from API)
        const availabilityStatus = tableType.availableCount > 2 ? "available" : tableType.availableCount > 0 ? "limited" : "unavailable"
        const statusText =
            availabilityStatus === "available" ? "Còn trống" : availabilityStatus === "limited" ? "Sắp hết" : "Hết chỗ"
        const statusIcon =
            availabilityStatus === "available"
                ? "check-circle"
                : availabilityStatus === "limited"
                    ? "exclamation-triangle"
                    : "times-circle"

        card.innerHTML = `
      <div class="table-type-header">
        <h6 class="table-type-name">${tableType.name}</h6>
        <span class="table-type-capacity">${tableType.capacity} chỗ</span>
      </div>
      <div class="table-availability">
        <div class="availability-status ${availabilityStatus}">
          <i class="fas fa-${statusIcon}"></i>
          ${statusText}
        </div>
        <div class="availability-count">Còn ${tableType.availableCount} bàn</div>
      </div>
    `

        if (availabilityStatus !== "unavailable") {
            card.addEventListener("click", () => {
                this.selectTableType(tableType)
            })
        } else {
            card.style.opacity = "0.5"
            card.style.cursor = "not-allowed"
        }

        return card
    }

    selectTableType(tableType) {
        this.bookingData.tableTypeId = tableType.id
        this.bookingData.name = tableType.name

        // Update visual selection
        document.querySelectorAll(".table-type-card").forEach((card) => {
            card.classList.remove("selected")
        })
        document.querySelector(`[data-id="${tableType.id}"]`).classList.add("selected")
    }

    async nextStep() {
        if (!this.validateCurrentStep()) {
            return false
        }

        if (this.currentStep < this.totalSteps) {
            this.currentStep++
            this.updateStepDisplay()
            this.updateProgressSteps()

            // Load data for specific steps
            if (this.currentStep === 2) {
                this.loadDishes()
            } else if (this.currentStep === 3) {
                this.loadTableTypes()
                this.updateBookingSummary()
            } else if (this.currentStep === 4) {
                this.updateFinalSummary()
            }
        }
        return true
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--
            this.updateStepDisplay()
            this.updateProgressSteps()
        }
    }

    validateCurrentStep() {
        console.log(this.currentStep)
        switch (this.currentStep) {
            case 1:
                if (!this.bookingData.reservationDate) {
                    this.showError("Vui lòng chọn ngày đặt bàn")
                    return false
                }
                if (!this.bookingData.reservationTime) {
                    this.showError("Vui lòng chọn giờ đặt bàn")
                    return false
                }
                break
            case 3:
                if (!this.bookingData.tableTypeId) {
                    this.showError("Vui lòng chọn loại bàn")
                    return false
                }
                break
            case 4:
                console.log(this.bookingData.customerName.trim())
                if (!this.bookingData.customerName.trim()) {
                    this.showError("Vui lòng nhập họ tên")
                    return false
                }
                console.log(this.bookingData.phone.trim())
                if (!this.bookingData.phone.trim()) {
                    this.showError("Vui lòng nhập số điện thoại")
                    return false
                }
                console.log(this.bookingData.email.trim())
                if (!this.bookingData.email.trim()) {
                    this.showError("Vui lòng nhập email")
                    return false
                }
                break
        }
        return true
    }

    updateStepDisplay() {
        // Hide all steps
        for (let i = 1; i <= this.totalSteps; i++) {
            document.getElementById(`bookingStep${i}`).style.display = "none"
        }

        // Show current step
        document.getElementById(`bookingStep${this.currentStep}`).style.display = "block"

        // Update navigation buttons
        const prevBtn = document.getElementById("bookingPrevBtn")
        const nextBtn = document.getElementById("bookingNextBtn")
        const confirmBtn = document.getElementById("bookingConfirmBtn")

        prevBtn.style.display = this.currentStep > 1 ? "block" : "none"
        nextBtn.style.display = this.currentStep < this.totalSteps ? "block" : "none"
        confirmBtn.style.display = this.currentStep === this.totalSteps ? "block" : "none"
    }

    updateProgressSteps() {
        document.querySelectorAll(".progress-step").forEach((step, index) => {
            const stepNumber = index + 1
            step.classList.remove("active", "completed")

            if (stepNumber < this.currentStep) {
                step.classList.add("completed")
            } else if (stepNumber === this.currentStep) {
                step.classList.add("active")
            }
        })

        document.querySelectorAll(".progress-line").forEach((line, index) => {
            line.classList.remove("completed")
            if (index + 1 < this.currentStep) {
                line.classList.add("completed")
            }
        })
    }

    updateBookingSummary() {
        const dateTime = `${this.formatDate(this.bookingData.reservationDate)} - ${this.bookingData.reservationTime}`
        const partySize = `${this.bookingData.partySize} người`
        const dishCount =
            this.bookingData.selectedDishes.length > 0 ? `${this.bookingData.selectedDishes.length} món ăn` : "Chưa chọn món"

        document.getElementById("summaryDateTime").textContent = dateTime
        document.getElementById("summaryPartySize").textContent = partySize
        document.getElementById("summaryDishCount").textContent = dishCount
    }

    updateFinalSummary() {
        const dateTime = `${this.formatDate(this.bookingData.reservationDate)} - ${this.bookingData.reservationTime}`
        const partySize = `${this.bookingData.partySize} người`
        const tableType = this.bookingData.name || "Chưa chọn"
        const dishCount =
            this.bookingData.selectedDishes.length > 0 ? `${this.bookingData.selectedDishes.length} món ăn` : "Không có"

        // Calculate total amount
        const dishTotal = this.bookingData.selectedDishes.reduce((total, dish) => {
            return total + (dish.price - dish.price * dish.discount / 100) * dish.quantity
        }, 0)

        document.getElementById("finalDateTime").textContent = dateTime
        document.getElementById("finalPartySize").textContent = partySize
        document.getElementById("finalTableType").textContent = tableType
        document.getElementById("finalDishCount").textContent = dishCount
        document.getElementById("finalTotalAmount").textContent = this.formatCurrency(dishTotal)

        this.bookingData.reservationPrice = dishTotal
    }

    async confirmBooking() {
        const check = await this.nextStep()
        if (!check) return
        this.showLoading("bookingConfirmBtn")

        const bookingPayload = {
            reservationDate: this.bookingData.reservationDate,
            reservationTime: this.bookingData.reservationTime,
            partySize: this.bookingData.partySize,
            tableTypeId: this.bookingData.tableTypeId,
            customerName: this.bookingData.customerName,
            phone: this.bookingData.phone,
            email: this.bookingData.email,
            note: this.bookingData.note,
            reservationPrice: this.bookingData.reservationPrice,
            selectedDishes: this.bookingData.selectedDishes,
        }

        if (bookingPayload.selectedDishes.length === 0) {
            await this.createReservationWithoutOrder(bookingPayload);
        } else {
            await this.createVNPayReservation(bookingPayload);
        }
    }

    async createReservationWithoutOrder(bookingPayload) {
        try {
            const response = await fetch("/api/reservationapi/noorder", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${customertoken}` },
                body: JSON.stringify(bookingPayload)
            });

            if (response.ok) {
                const result = await response.json()
                this.showBookingSuccess(result.reservationResultDto.reservationId || "RES" + Date.now())
            } else {
                const error = await response.text()
                this.showError("Không thể đặt bàn: " + error)
            }
        } catch (error) {
            console.error("Error confirming booking:", error)
            this.showError("Lỗi khi đặt bàn. Vui lòng thử lại.")
        } finally {
            this.hideLoading("bookingConfirmBtn")
        }
    }


    async createVNPayReservation(bookingPayload) {
        try {
            const response = await fetch("/api/reservationapi/vnpay", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${customertoken}` },
                body: JSON.stringify(bookingPayload)
            });

            if (response.ok) {
                const data = await response.json();
                if (data && data.paymentUrl) {
                    localStorage.setItem("reservationid", data.reservationid);
                    window.location.href = data.paymentUrl;
                } else {
                    this.showError("Không thể đặt bàn: " + error)
                }
            } else {
                this.showError("Xảy ra lỗi khi đặt bàn.");
            }
        } catch (error) {
            console.error("Error confirming booking:", error)
            this.showError("Lỗi khi đặt bàn. Vui lòng thử lại.")
        } finally {
            this.hideLoading("bookingConfirmBtn")
        }
    }

    showBookingSuccess(bookingCode) {
        // Close booking modal
        const bookingModal = this.bootstrap.Modal.getInstance(document.getElementById("bookingModal"))
        bookingModal.hide()

        // Show success modal
        document.getElementById("bookingCode").textContent = "#" + bookingCode
        const successModal = new this.bootstrap.Modal(document.getElementById("bookingSuccessModal"))
        successModal.show()
    }

    showLoading(elementId) {
        const element = document.getElementById(elementId)
        if (element) {
            element.style.position = "relative"
            const overlay = document.createElement("div")
            overlay.className = "loading-overlay"
            overlay.innerHTML = '<div class="loading-spinner"></div>'
            element.appendChild(overlay)
        }
    }

    hideLoading(elementId) {
        const element = document.getElementById(elementId)
        if (element) {
            const overlay = element.querySelector(".loading-overlay")
            if (overlay) {
                overlay.remove()
            }
        }
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

        // Show toast
        setTimeout(() => {
            toast.classList.add("show")
        }, 100)

        // Hide toast after 5 seconds
        setTimeout(() => {
            toast.classList.remove("show")
            setTimeout(() => {
                document.body.removeChild(toast)
            }, 300)
        }, 5000)
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount)
    }

    formatDate(dateString) {
        const date = new Date(dateString)
        return date.toLocaleDateString("vi-VN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }
}

// Initialize booking manager when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    window.bookingManager = new ModernBookingManager()
})

// Add toast notification styles
const toastStyles = `
<style>
.toast-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #dc3545;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 9999;
  transform: translateX(100%);
  transition: transform 0.3s ease;
  box-shadow: 0 8px 25px rgba(220, 53, 69, 0.3);
}

.toast-notification.show {
  transform: translateX(0);
}

.toast-notification.success {
  background: #28a745;
  box-shadow: 0 8px 25px rgba(40, 167, 69, 0.3);
}

.toast-notification i {
  font-size: 1.2rem;
}
</style>
`

document.head.insertAdjacentHTML("beforeend", toastStyles)
