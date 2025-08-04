let cart = []
    console.log("Initializing modern layout...");

document.addEventListener("DOMContentLoaded", async function() {
    // Initialize modern layout features
    initializeNavbar()
    initializeModals()
    initializeAnimations()
    initializeNotifications()
    await loadCart();
})

async function loadCart() {
    if (isLoggedIn()) {

        // Fetch cart from server
        const res = await fetch('/api/cartapi', {
            headers: { 'Authorization': 'Bearer ' + customertoken }
        });
        if (res.ok) {
            cart = await res.json();
        } else {
            cart = [];
        }
    } else {
        cart = JSON.parse(localStorage.getItem('cart') || '[]');
    }
    updateCartBadge();
}

// Utility: Check if user is logged in
function isLoggedIn() {
    return !!localStorage.getItem('customertoken');
}

// Initialize navbar functionality
function initializeNavbar() {
    const navbar = document.querySelector(".modern-navbar")

    // Add scroll effect
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            navbar.classList.add("scrolled")
        } else {
            navbar.classList.remove("scrolled")
        }
    })

    // Mobile menu toggle
    const toggler = document.querySelector(".modern-toggler")
    const navbarCollapse = document.querySelector("#navbarNav")

    if (toggler && navbarCollapse) {
        toggler.addEventListener("click", function () {
            this.classList.toggle("collapsed")
        })

        // Close mobile menu when clicking outside
        document.addEventListener("click", (e) => {
            if (!navbar.contains(e.target) && navbarCollapse.classList.contains("show")) {
                bootstrap.Collapse.getInstance(navbarCollapse)?.hide()
                toggler.classList.add("collapsed")
            }
        })
    }
}

// Initialize modal enhancements
function initializeModals() {
    // Enhanced cart modal
    const cartModal = document.getElementById("cartModal")
    if (cartModal) {
        cartModal.addEventListener("shown.bs.modal", () => {
            updateModernCartModal()
        })
    }

    // Enhanced checkout modal
    const checkoutModal = document.getElementById("checkoutModal")
    if (checkoutModal) {
        // Shipping address toggle
        const shippingCheckbox = document.getElementById("isShipping")
        const shippingAddressGroup = document.getElementById("shippingAddressGroup")

        if (shippingCheckbox && shippingAddressGroup) {
            shippingCheckbox.addEventListener("change", function () {
                if (this.checked) {
                    shippingAddressGroup.style.display = "block"
                    shippingAddressGroup.classList.add("slide-up")
                } else {
                    shippingAddressGroup.style.display = "none"
                    shippingAddressGroup.classList.remove("slide-up")
                }
                updateShippingFee()
            })
        }

        // Payment method selection
        const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]')
        paymentMethods.forEach((method) => {
            method.addEventListener("change", function () {
                updatePaymentMethod(this.value)
            })
        })

        checkoutModal.addEventListener("shown.bs.modal", () => {
            updateModernCheckoutModal()
        })
    }

    // Enhanced auth modals
    enhanceAuthModals()
}

// Update modern cart modal
function updateModernCartModal() {
    const cartItems = document.getElementById("cartItems")
    const emptyCartMessage = document.getElementById("emptyCartMessage")
    const cartItemsContainer = document.getElementById("cartItemsContainer")
    const cartTotal = document.getElementById("cartTotal")

    if (!cart || cart.length === 0) {
        emptyCartMessage.style.display = "block"
        cartItemsContainer.style.display = "none"
        document.getElementById("checkoutButton").disabled = true
        return
    }

    emptyCartMessage.style.display = "none"
    cartItemsContainer.style.display = "block"
    document.getElementById("checkoutButton").disabled = false

    // Clear existing items
    cartItems.innerHTML = ""

    let total = 0

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity
        total += itemTotal

        const cartItem = document.createElement("div")
        cartItem.className = "cart-item fade-in"
        cartItem.style.animationDelay = `${index * 0.1}s`

        cartItem.innerHTML = `
            <img src="${item.photo || "/images/placeholder.png"}" 
                 alt="${item.name}" class="cart-item-image">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">${formatPrice(item.price)}</div>
            </div>
            <div class="cart-item-controls">
                <button class="quantity-btn decrease-quantity" data-id="${item.id}">
                    <i class="fas fa-minus"></i>
                </button>
                <input type="number" class="quantity-input" value="${item.quantity}" 
                       min="1" data-id="${item.id}">
                <button class="quantity-btn increase-quantity" data-id="${item.id}">
                    <i class="fas fa-plus"></i>
                </button>
                <button class="remove-btn" data-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `

        cartItems.appendChild(cartItem)
    })

    cartTotal.textContent = formatPrice(total)

    // Add event listeners
    addCartEventListeners()
}

// Add cart event listeners
function addCartEventListeners() {
    // Decrease quantity
    document.querySelectorAll(".decrease-quantity").forEach((btn) => {
        btn.addEventListener("click", function () {
            const id = Number.parseInt(this.getAttribute("data-id"))
            updateCartItemQuantity(id, -1)
            setTimeout(updateModernCartModal, 100)
        })
    })

    // Increase quantity
    document.querySelectorAll(".increase-quantity").forEach((btn) => {
        btn.addEventListener("click", function () {
            const id = Number.parseInt(this.getAttribute("data-id"))
            updateCartItemQuantity(id, 1)
            setTimeout(updateModernCartModal, 100)
        })
    })

    // Remove item
    document.querySelectorAll(".remove-btn").forEach((btn) => {
        btn.addEventListener("click", function () {
            const id = Number.parseInt(this.getAttribute("data-id"))
            removeFromCart(id)
            setTimeout(updateModernCartModal, 100)
        })
    })

    // Quantity input change
    document.querySelectorAll(".quantity-input").forEach((input) => {
        input.addEventListener("change", function () {
            const id = Number.parseInt(this.getAttribute("data-id"))
            const newQuantity = Number.parseInt(this.value) || 1
            setCartItemQuantity(id, newQuantity)
            setTimeout(updateModernCartModal, 100)
        })
    })
}

// Update modern checkout modal
function updateModernCheckoutModal() {
    const orderSummary = document.getElementById("orderSummary")
    const subtotal = document.getElementById("subtotal")
    const totalPrice = document.getElementById("totalPrice")

    if (!cart || cart.length === 0) return

    // Clear existing items
    orderSummary.innerHTML = ""

    let subtotalAmount = 0

    cart.forEach((item) => {
        const itemTotal = item.price * item.quantity
        subtotalAmount += itemTotal

        const orderItem = document.createElement("div")
        orderItem.className = "order-item"
        orderItem.innerHTML = `
            <div class="order-item-info">
                <div class="order-item-name">${item.name}</div>
                <div class="order-item-details">Số lượng: ${item.quantity}</div>
            </div>
            <div class="order-item-price">${formatPrice(itemTotal)}</div>
        `
        orderSummary.appendChild(orderItem)
    })

    subtotal.textContent = formatPrice(subtotalAmount)
    updateTotalPrice()
}

// Update shipping fee
function updateShippingFee() {
    const isShipping = document.getElementById("isShipping").checked
    const shippingFee = document.getElementById("shippingFee")
    const fee = isShipping ? 15000 : 0

    shippingFee.textContent = formatPrice(fee)
    updateTotalPrice()
}

// Update total price
function updateTotalPrice() {
    const subtotalText = document.getElementById("subtotal").textContent
    const shippingFeeText = document.getElementById("shippingFee").textContent
    const totalPrice = document.getElementById("totalPrice")

    // Extract numbers from formatted text
    const subtotal = Number.parseFloat(subtotalText.replace(/[^\d]/g, ""))
    const shipping = Number.parseFloat(shippingFeeText.replace(/[^\d]/g, ""))

    const total = subtotal + shipping
    totalPrice.textContent = formatPrice(total)
}

// Update payment method
function updatePaymentMethod(method) {
    // Add visual feedback or additional logic based on payment method
    console.log("Payment method selected:", method)
}

// Enhance auth modals
function enhanceAuthModals() {
    // Add form validation and better UX
    const loginForm = document.querySelector("#loginModal .modern-form")
    const registerForm = document.querySelector("#registerModal .modern-form")

    if (loginForm) {
        const inputs = loginForm.querySelectorAll(".modern-input")
        inputs.forEach((input) => {
            input.addEventListener("blur", validateInput)
            input.addEventListener("input", clearValidation)
        })
    }

    if (registerForm) {
        const inputs = registerForm.querySelectorAll(".modern-input")
        inputs.forEach((input) => {
            input.addEventListener("blur", validateInput)
            input.addEventListener("input", clearValidation)
        })
    }
}

// Validate input
function validateInput(e) {
    const input = e.target
    const value = input.value.trim()

    // Remove existing validation classes
    input.classList.remove("is-valid", "is-invalid")

    // Basic validation
    if (input.hasAttribute("required") && !value) {
        input.classList.add("is-invalid")
        return false
    }

    if (input.type === "email" && value && !isValidEmail(value)) {
        input.classList.add("is-invalid")
        return false
    }

    if (input.type === "tel" && value && !isValidPhone(value)) {
        input.classList.add("is-invalid")
        return false
    }

    if (input.type === "password" && value && !isValidPassword(value)) {
        input.classList.add("is-invalid")
        return false
    }

    if (value) {
        input.classList.add("is-valid")
    }

    return true
}

// Clear validation
function clearValidation(e) {
    const input = e.target
    input.classList.remove("is-valid", "is-invalid")
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

// Phone validation
function isValidPhone(phone) {
    const phoneRegex = /^[0-9]{10,11}$/
    return phoneRegex.test(phone.replace(/\D/g, ""))
}

function isValidPassword(password) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
}
// Initialize animations
function initializeAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("fade-in")
            }
        })
    }, observerOptions)

    // Observe elements that should animate on scroll
    document.querySelectorAll(".feature-card, .dish-card-home, .section-title").forEach((el) => {
        observer.observe(el)
    })
}

// Initialize notifications
function initializeNotifications() {
    // Create notification container if it doesn't exist
    if (!document.getElementById("notification-container")) {
        const container = document.createElement("div")
        container.id = "notification-container"
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 400px;
        `
        document.body.appendChild(container)
    }
}

// Show modern notification
function showModernNotification(type, title, message, duration = 4000) {
    const container = document.getElementById("notification-container")
    if (!container) return

    const notification = document.createElement("div")
    notification.className = `alert alert-${type} alert-dismissible fade show modern-notification`
    notification.style.cssText = `
        margin-bottom: 1rem;
        border: none;
        border-radius: 12px;
        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        animation: slideInRight 0.3s ease;
    `

    const icon = getNotificationIcon(type)

    notification.innerHTML = `
        <div class="d-flex align-items-start">
            <div class="me-3">
                <i class="${icon}" style="font-size: 1.2rem;"></i>
            </div>
            <div class="flex-grow-1">
                <strong>${title}</strong>
                <div>${message}</div>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `

    container.appendChild(notification)

    // Auto remove
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = "slideOutRight 0.3s ease"
            setTimeout(() => notification.remove(), 300)
        }
    }, duration)
}

// Get notification icon
function getNotificationIcon(type) {
    const icons = {
        success: "fas fa-check-circle",
        danger: "fas fa-exclamation-circle",
        warning: "fas fa-exclamation-triangle",
        info: "fas fa-info-circle",
    }
    return icons[type] || icons.info
}

// Format price utility
function formatPrice(price) {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(price)
}

// Declare functions
async function updateCartItemQuantity(id, change) {
    const item = cart.find((item) => item.id === id)
    if (item) {
        item.quantity += change
        if (item.quantity <= 0) {
            removeFromCart(id)
        }
        await saveCart();
        updateModernCartModal();
        updateCartBadge();
    }
}

async function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    await saveCart();
    updateModernCartModal();
    updateCartBadge();
}

// Set quantity
async function setCartItemQuantity(id, quantity) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity = Math.max(1, quantity);
        await saveCart();
        updateModernCartModal();
        updateCartBadge();
    }
}

async function saveCart() {
    if (isLoggedIn()) {
        console.log(customertoken)
        // Save cart to server
        await fetch('/api/cartapi', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + customertoken
            },
            body: JSON.stringify(cart)
        });
    } else {
        localStorage.setItem('cart', JSON.stringify(cart));
    }
}
console.log("Cart initialized:", cart);
// Declare addToCart function
window.addToCartGlobal = async function addToCartGlobal(dish) {
    const existingItem = cart.find(item => item.id === dish.idDish);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: dish.idDish,
            name: dish.name,
            price: (dish.price - dish.price * dish.discount / 100) || dish.price,
            quantity: 1,
            photo: dish.photo
        });
    }
    await saveCart()
    updateCartBadge();
}

function updateCartBadge() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartBadge').textContent = totalItems;
}