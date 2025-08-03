// Enhanced Menu JavaScript
class MenuManager {
    constructor() {
        this.categories = []
        this.dishes = []
        this.filteredDishes = []
        this.currentCategory = null
        this.currentPage = 1
        this.itemsPerPage = 12
        this.currentView = "grid"
        this.searchTimeout = null
        this.favorites = JSON.parse(localStorage.getItem("dishFavorites") || "[]")

        this.init()
    }

    async init() {
        try {
            await this.loadData()
            this.setupEventListeners()
            this.renderCategories()
            this.renderDishes()
            //this.showNotification("success", "Thành công", "Đã tải thực đơn thành công!")
        } catch (error) {
            console.error("Error initializing menu:", error)
            this.showNotification("danger", "Lỗi", "Không thể tải thực đơn. Vui lòng thử lại!")
        }
    }

    async loadData() {
        const [categoriesResponse, dishesResponse] = await Promise.all([
            fetch("/api/dishcategoryapi"),
            fetch("/api/dishapi"),
        ])

        if (!categoriesResponse.ok || !dishesResponse.ok) {
            throw new Error("Failed to load data")
        }

        this.categories = await categoriesResponse.json()
        this.dishes = await dishesResponse.json()
        this.filteredDishes = [...this.dishes]
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById("dishSearch")
        const clearSearch = document.getElementById("clearSearch")

        searchInput.addEventListener("input", (e) => {
            clearTimeout(this.searchTimeout)
            this.searchTimeout = setTimeout(() => {
                this.handleSearch(e.target.value)
            }, 300)

            clearSearch.style.display = e.target.value ? "block" : "none"
        })

        clearSearch.addEventListener("click", () => {
            searchInput.value = ""
            clearSearch.style.display = "none"
            this.handleSearch("")
        })

        // Filter functionality
        document.getElementById("priceFilter").addEventListener("change", (e) => {
            this.handlePriceFilter(e.target.value)
        })

        document.getElementById("sortFilter").addEventListener("change", (e) => {
            this.handleSort(e.target.value)
        })

        // View toggle
        document.querySelectorAll(".view-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                this.handleViewChange(e.target.closest(".view-btn").dataset.view)
            })
        })

        // Keyboard shortcuts
        document.addEventListener("keydown", (e) => {
            if (e.ctrlKey && e.key === "f") {
                e.preventDefault()
                searchInput.focus()
            }
        })
    }

    renderCategories() {
        const container = document.getElementById("categoriesList")

        if (!this.categories.length) {
            container.innerHTML = '<div class="text-center text-muted">Không có danh mục nào</div>'
            return
        }

        const allCategoryItem = this.createCategoryItem(
            {
                idDishcategory: null,
                name: "Tất cả món",
                icon: "fas fa-th-large",
            },
            this.dishes.length,
            !this.currentCategory,
        )

        const categoryItems = this.categories.map((category) => {
            // const dishCount = this.dishes.filter((dish) => dish.idDishcategory === category.idDishcategory).length
            return this.createCategoryItem(category, this.currentCategory === category.idDishcategory)
        })

        container.innerHTML = [allCategoryItem, ...categoryItems].join("")

        // Add click listeners
        container.querySelectorAll(".category-item").forEach((item) => {
            item.addEventListener("click", () => {
                const categoryId = item.dataset.categoryId
                this.handleCategoryChange(categoryId === "null" ? null : Number.parseInt(categoryId))
            })
        })
    }

    createCategoryItem(category, isActive) {
        return `
      <div class="category-item ${isActive ? "active" : ""}" data-category-id="${category.idDishcategory}">
        <div class="category-name">
          ${category.name}
        </div>
      </div>
    `
    }

    renderDishes() {
        const container = document.getElementById("dishesGrid")
        //const countElement = document.getElementById("dishesCount")
        const noResults = document.getElementById("noResults")

        // Update count
        //countElement.textContent = `Hiển thị ${this.filteredDishes.length} món ăn`

        if (!this.filteredDishes.length) {
            container.style.display = "none"
            noResults.style.display = "block"
            return
        }

        container.style.display = "grid"
        noResults.style.display = "none"

        // Pagination
        const startIndex = (this.currentPage - 1) * this.itemsPerPage
        const endIndex = startIndex + this.itemsPerPage
        const dishesToShow = this.filteredDishes.slice(startIndex, endIndex)

        // Update grid class based on view
        container.className = `dishes-grid ${this.currentView === "list" ? "list-view" : ""}`

        // Render dishes
        container.innerHTML = dishesToShow.map((dish) => this.createDishCard(dish)).join("")

        // Add event listeners
        this.addDishEventListeners()

        // Render pagination
        this.renderPagination()

        // Animate cards
        this.animateCards()
    }

    createDishCard(dish) {
        // const isFavorite = this.favorites.includes(dish.idDish)
        const discountedPrice = dish.price - (dish.price * dish.discount) / 100
        const isListView = this.currentView === "list"

        return `
      <div class="dish-card ${isListView ? "list-view" : ""} ${dish.issoldout ? "soldout" : ""}" 
           data-dish-id="${dish.idDish}">
        <div class="dish-image" style="background-image: url('${dish.photo || "/placeholder.svg?height=250&width=300"}')">
          <div class="dish-badges">
            ${dish.discount > 0 ? `<span class="dish-badge badge-discount">-${dish.discount}%</span>` : ""}
            ${dish.issoldout ? '<span class="dish-badge badge-soldout">Hết món</span>' : ""}
            ${dish.isNew ? '<span class="dish-badge badge-new">Mới</span>' : ""}
            ${dish.isPopular ? '<span class="dish-badge badge-popular">Phổ biến</span>' : ""}
          </div>  
        </div>
        
        <div class="dish-content">
          <h5 class="dish-name">${dish.name}</h5>
          <p class="dish-description">${dish.description || "Món ăn ngon được chế biến từ nguyên liệu tươi ngon"}</p>
          
          <div class="dish-price-section">
            <div class="dish-price">
              ${this.formatPrice(discountedPrice)}
              ${dish.discount > 0 ? `<span class="dish-price-original">${this.formatPrice(dish.price)}</span>` : ""}
            </div>
          </div>
          
          <div class="dish-actions">
            <button class="btn btn-add-cart" data-dish-id="${dish.idDish}" ${dish.issoldout ? "disabled" : ""}>
              <i class="fas fa-cart-plus me-1"></i>
              ${dish.issoldout ? "Hết món" : "Thêm vào giỏ"}
            </button>
          </div>
        </div>
      </div>
    `
    }

    addDishEventListeners() {
        // Add to cart buttons
        document.querySelectorAll(".btn-add-cart").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation()
                const dishId = Number.parseInt(btn.dataset.dishId)
                this.addToCart(dishId)
            })
        })

        // View detail buttons
        document.querySelectorAll(".btn-view-detail").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation()
                const dishId = Number.parseInt(btn.dataset.dishId)
                this.showDishDetail(dishId)
            })
        })

        // Favorite buttons
        document.querySelectorAll(".dish-favorite").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation()
                const dishId = Number.parseInt(btn.dataset.dishId)
                this.toggleFavorite(dishId, btn)
            })
        })

        // Card click to show detail
        document.querySelectorAll(".dish-card").forEach((card) => {
            card.addEventListener("click", () => {
                const dishId = Number.parseInt(card.dataset.dishId)
                this.showDishDetail(dishId)
            })
        })
    }

    renderPagination() {
        const container = document.getElementById("dishPagination")
        const totalPages = Math.ceil(this.filteredDishes.length / this.itemsPerPage)

        if (totalPages <= 1) {
            container.innerHTML = ""
            return
        }

        let paginationHTML = ""

        // Previous button
        if (this.currentPage > 1) {
            paginationHTML += `
        <li class="page-item">
          <a class="page-link" href="#" data-page="${this.currentPage - 1}">
            <i class="fas fa-chevron-left"></i>
          </a>
        </li>
      `
        }

        // Page numbers
        const startPage = Math.max(1, this.currentPage - 2)
        const endPage = Math.min(totalPages, this.currentPage + 2)

        if (startPage > 1) {
            paginationHTML += `<li class="page-item"><a class="page-link" href="#" data-page="1">1</a></li>`
            if (startPage > 2) {
                paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
        <li class="page-item ${i === this.currentPage ? "active" : ""}">
          <a class="page-link" href="#" data-page="${i}">${i}</a>
        </li>
      `
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`
            }
            paginationHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${totalPages}">${totalPages}</a></li>`
        }

        // Next button
        if (this.currentPage < totalPages) {
            paginationHTML += `
        <li class="page-item">
          <a class="page-link" href="#" data-page="${this.currentPage + 1}">
            <i class="fas fa-chevron-right"></i>
          </a>
        </li>
      `
        }

        container.innerHTML = paginationHTML

        // Add click listeners
        container.querySelectorAll(".page-link").forEach((link) => {
            link.addEventListener("click", (e) => {
                e.preventDefault()
                const page = Number.parseInt(link.dataset.page)
                if (page && page !== this.currentPage) {
                    this.currentPage = page
                    this.renderDishes()
                    this.scrollToTop()
                }
            })
        })
    }

    handleSearch(query) {
        this.currentPage = 1
        this.applyFilters()
    }

    handleCategoryChange(categoryId) {
        this.currentCategory = categoryId
        this.currentPage = 1
        this.applyFilters()
        this.renderCategories()
    }

    handlePriceFilter(priceRange) {
        this.currentPage = 1
        this.applyFilters()
    }

    handleSort(sortBy) {
        this.applyFilters()
    }

    handleViewChange(view) {
        this.currentView = view

        // Update button states
        document.querySelectorAll(".view-btn").forEach((btn) => {
            btn.classList.toggle("active", btn.dataset.view === view)
        })

        this.renderDishes()
    }

    applyFilters() {
        let filtered = [...this.dishes]

        // Category filter
        if (this.currentCategory) {
            filtered = filtered.filter((dish) => dish.idDishcategory === this.currentCategory)
        }

        // Search filter
        const searchQuery = document.getElementById("dishSearch").value.toLowerCase().trim()
        if (searchQuery) {
            filtered = filtered.filter(
                (dish) =>
                    dish.name.toLowerCase().includes(searchQuery) ||
                    (dish.description && dish.description.toLowerCase().includes(searchQuery)),
            )
        }

        // Price filter
        const priceRange = document.getElementById("priceFilter").value
        if (priceRange) {
            const [min, max] = priceRange.split("-").map(Number)
            filtered = filtered.filter((dish) => {
                const price = dish.price - (dish.price * dish.discount) / 100
                return price >= min && price <= max
            })
        }

        // Sort
        const sortBy = document.getElementById("sortFilter").value
        filtered.sort((a, b) => {
            switch (sortBy) {
                case "name":
                    return a.name.localeCompare(b.name)
                case "price-asc":
                    return a.price - (a.price * a.discount) / 100 - (b.price - (b.price * b.discount) / 100)
                case "price-desc":
                    return b.price - (b.price * b.discount) / 100 - (a.price - (a.price * a.discount) / 100)
                case "popular":
                    return (b.rating || 0) - (a.rating || 0)
                default:
                    return 0
            }
        })

        this.filteredDishes = filtered
        this.renderDishes()
    }

    async addToCart(dishId) {
        const dish = this.dishes.find((d) => d.idDish === dishId)
        if (!dish || dish.issoldout) return

        // Use global addToCart function if available
        if (window.addToCartGlobal) {
            await window.addToCartGlobal(dish)
            this.showNotification("success", "Thành công", `Đã thêm "${dish.name}" vào giỏ hàng!`, 2000)
        } else {
            console.error("addToCartGlobal function not found")
        }
    }

    showDishDetail(dishId) {
        const dish = this.dishes.find((d) => d.idDish === dishId)
        if (!dish) return

        const modal = document.getElementById("dishDetailModal")
        const content = document.getElementById("dishDetailContent")

        const discountedPrice = dish.price - (dish.price * dish.discount) / 100

        content.innerHTML = `
      <div class="dish-detail-content">
        <div class="dish-detail-image" style="background-image: url('${dish.photo || "/placeholder.svg?height=300&width=600"}')"></div>
        <div class="dish-detail-info">
          <div class="dish-detail-header">
            <div>
              <h3 class="dish-detail-title">${dish.name}</h3>
              <div class="dish-detail-category">
                <i class="fas fa-tag me-1"></i>
                ${this.getCategoryName(dish.idDishcategory)}
              </div>
            </div>
            <div class="dish-detail-price">
              <div class="current-price">${this.formatPrice(discountedPrice)}</div>
              ${dish.discount > 0 ? `<div class="original-price">${this.formatPrice(dish.price)}</div>` : ""}
            </div>
          </div>
          
          <p class="dish-detail-description">
            ${dish.description || "Món ăn ngon được chế biến từ nguyên liệu tươi ngon, đảm bảo chất lượng và hương vị tuyệt vời."}
          </p>
          
          <div class="dish-detail-actions">
            <div class="quantity-selector">
              <button class="quantity-btn" onclick="changeQuantity(-1)">
                <i class="fas fa-minus"></i>
              </button>
              <span class="quantity-display" id="modalQuantity">1</span>
              <button class="quantity-btn" onclick="changeQuantity(1)">
                <i class="fas fa-plus"></i>
              </button>
            </div>
            <button class="btn modern-btn-primary flex-grow-1" onclick="addToCartFromModal(${dishId})" ${dish.issoldout ? "disabled" : ""}>
              <i class="fas fa-cart-plus me-2"></i>
              ${dish.issoldout ? "Hết món" : "Thêm vào giỏ hàng"}
            </button>
          </div>
        </div>
      </div>
    `

        // Show modal
        const bsModal = new window.bootstrap.Modal(modal)
        bsModal.show()
    }

    toggleFavorite(dishId, button) {
        const index = this.favorites.indexOf(dishId)

        if (index > -1) {
            this.favorites.splice(index, 1)
            button.classList.remove("active")
            this.showNotification("info", "Đã xóa", "Đã xóa khỏi danh sách yêu thích")
        } else {
            this.favorites.push(dishId)
            button.classList.add("active")
            this.showNotification("success", "Đã thêm", "Đã thêm vào danh sách yêu thích")
        }

        localStorage.setItem("dishFavorites", JSON.stringify(this.favorites))
    }

    getCategoryName(categoryId) {
        const category = this.categories.find((c) => c.idDishcategory === categoryId)
        return category ? category.name : "Khác"
    }

    formatPrice(price) {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price)
    }

    animateCards() {
        const cards = document.querySelectorAll(".dish-card")
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

    scrollToTop() {
        document.querySelector(".dishes-container").scrollIntoView({
            behavior: "smooth",
            block: "start",
        })
    }

    showNotification(type, title, message, duration = 4000) {
        if (window.showModernNotification) {
            window.showModernNotification(type, title, message, duration)
        }
    }
}

// Global functions for modal
let modalQuantity = 1

function changeQuantity(change) {
    modalQuantity = Math.max(1, modalQuantity + change)
    document.getElementById("modalQuantity").textContent = modalQuantity
}

function addToCartFromModal(dishId) {
    const dish = window.menuManager.dishes.find((d) => d.idDish === dishId)
    if (!dish || dish.issoldout) return

    for (let i = 0; i < modalQuantity; i++) {
        if (window.addToCart) {
            window.addToCart(dish)
        }
    }

    window.menuManager.showNotification("success", "Thành công", `Đã thêm ${modalQuantity} "${dish.name}" vào giỏ hàng!`)

    // Close modal
    const modal = window.bootstrap.Modal.getInstance(document.getElementById("dishDetailModal"))
    modal.hide()

    // Reset quantity
    modalQuantity = 1
}

function clearAllFilters() {
    document.getElementById("dishSearch").value = ""
    document.getElementById("priceFilter").value = ""
    document.getElementById("sortFilter").value = "name"
    document.getElementById("clearSearch").style.display = "none"

    window.menuManager.currentCategory = null
    window.menuManager.currentPage = 1
    window.menuManager.applyFilters()
    window.menuManager.renderCategories()
}

// Initialize when DOM is loaded
let menuManager
document.addEventListener("DOMContentLoaded", () => {
    menuManager = new MenuManager()
})
