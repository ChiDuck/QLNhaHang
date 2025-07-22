document.addEventListener("DOMContentLoaded", () => {
  // Initialize animations
  initializeAnimations()

  // Load popular dishes
  loadPopularDishes()

  // Initialize smooth scrolling
  initializeSmoothScrolling()

  // Initialize hero scroll indicator
  initializeScrollIndicator()
})

// Initialize animations
function initializeAnimations() {
  // Add animate.css classes when elements come into view
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate__animated", "animate__fadeInUp")
      }
    })
  }, observerOptions)

  // Observe feature cards
  document.querySelectorAll(".feature-card").forEach((card) => {
    observer.observe(card)
  })

  // Observe section titles
  document.querySelectorAll(".section-title").forEach((title) => {
    observer.observe(title)
  })
}

// Load popular dishes
async function loadPopularDishes() {
  const container = document.getElementById("popularDishes")

  try {
    // Show loading state
    container.innerHTML = `
            <div class="col-12 text-center">
                <div class="loading-spinner"></div>
                <p class="mt-3">Đang tải món ăn nổi bật...</p>
            </div>
        `

    const response = await fetch("/api/dishapi/popular")
    if (!response.ok) throw new Error("Failed to load dishes")

    const dishes = await response.json()

    if (dishes.length === 0) {
      container.innerHTML = `
                <div class="col-12 text-center">
                    <p class="text-muted">Chưa có món ăn nổi bật</p>
                </div>
            `
      return
    }

    // Render dishes
    container.innerHTML = ""
    dishes.slice(0, 6).forEach((dish) => {
      const dishCard = createDishCard(dish)
      container.appendChild(dishCard)
    })

    // Add animation to dish cards
    setTimeout(() => {
      document.querySelectorAll(".dish-card-home").forEach((card, index) => {
        setTimeout(() => {
          card.classList.add("animate__animated", "animate__fadeInUp")
        }, index * 50)
      })
    }, 100)
  } catch (error) {
    console.error("Error loading popular dishes:", error)
    container.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Không thể tải món ăn nổi bật. Vui lòng thử lại sau.
                </div>
            </div>
        `
  }
}

// Create dish card element
function createDishCard(dish) {
  const col = document.createElement("div")
  col.className = "col-lg-4 col-md-6"

  const finalPrice = dish.price - (dish.price * (dish.discount || 0)) / 100
  const hasDiscount = dish.discount && dish.discount > 0

  col.innerHTML = `
        <div class="dish-card-home">
            <div class="dish-image-home" style="background-image: url('${dish.photo || "/placeholder.svg?height=250&width=400"}')">
                ${hasDiscount ? `<div class="dish-badge">-${dish.discount}%</div>` : ""}
            </div>
            <div class="dish-info">
                <h5 class="dish-name">${dish.name}</h5>
                <p class="dish-description">${dish.description || "Món ăn đặc biệt của nhà hàng"}</p>
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <span class="dish-price-home">${formatPrice(finalPrice)}</span>
                        ${hasDiscount ? `<span class="dish-price-original">${formatPrice(dish.price)}</span>` : ""}
                    </div>
                    <button class="btn btn-outline-primary btn-sm add-to-cart-home" data-dish-id="${dish.idDish}">
                        <i class="fas fa-plus me-1"></i>Thêm
                    </button>
                </div>
            </div>
        </div>
    `

  // Add click event for add to cart
  const addBtn = col.querySelector(".add-to-cart-home")
  addBtn.addEventListener("click", () => addToCartFromHome(dish))

  return col
}

// Add to cart from home page
async function addToCartFromHome(dish) {
  try {
    await addToCart(dish)
    showNotification("success", `${dish.name} đã được thêm vào giỏ hàng!`)
  } catch (error) {
    console.error("Error adding to cart:", error)
    showNotification("error", "Có lỗi xảy ra khi thêm vào giỏ hàng")
  }
}

// Initialize smooth scrolling
function initializeSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault()
      const target = document.querySelector(this.getAttribute("href"))
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    })
  })
}

// Initialize scroll indicator
function initializeScrollIndicator() {
  const scrollIndicator = document.querySelector(".hero-scroll-indicator")
  if (scrollIndicator) {
    scrollIndicator.addEventListener("click", () => {
      const featuresSection = document.querySelector(".features-section")
      if (featuresSection) {
        featuresSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    })
  }

  // Hide scroll indicator when scrolling
  window.addEventListener("scroll", () => {
    if (scrollIndicator) {
      const scrolled = window.pageYOffset
      const opacity = Math.max(0, 1 - scrolled / 300)
      scrollIndicator.style.opacity = opacity
    }
  })
}

// Show notification
function showNotification(type, message) {
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll(".notification-toast")
  existingNotifications.forEach((notification) => notification.remove())

  // Create notification
  const notification = document.createElement("div")
  notification.className = `notification-toast alert alert-${type === "success" ? "success" : "danger"} position-fixed`
  notification.style.cssText = `
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        animation: slideInRight 0.3s ease;
    `

  notification.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="fas fa-${type === "success" ? "check-circle" : "exclamation-circle"} me-2"></i>
            <span>${message}</span>
            <button type="button" class="btn-close ms-auto" onclick="this.parentElement.parentElement.remove()"></button>
        </div>
    `

  document.body.appendChild(notification)

  // Auto remove after 3 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.style.animation = "slideOutRight 0.3s ease"
      setTimeout(() => notification.remove(), 300)
    }
  }, 3000)
}

// Format price
function formatPrice(price) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price)
}

// Add CSS animations
const style = document.createElement("style")
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`
document.head.appendChild(style)


