// Admin Layout JavaScript
document.addEventListener("DOMContentLoaded", () => {
  initializeSidebar()
  initializeNavigation()
  setActiveNavItem()
})

function initializeSidebar() {
  const sidebar = document.getElementById("sidebar")
  const sidebarToggle = document.getElementById("sidebarToggle")
  const mobileMenuToggle = document.getElementById("mobileMenuToggle")
  const sidebarOverlay = document.getElementById("sidebarOverlay")

  // Mobile menu toggle
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener("click", () => {
      sidebar.classList.add("open")
      sidebarOverlay.classList.add("active")
    })
  }

  // Sidebar close
  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", () => {
      sidebar.classList.remove("open")
      sidebarOverlay.classList.remove("active")
    })
  }

  // Overlay click to close
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener("click", () => {
      sidebar.classList.remove("open")
      sidebarOverlay.classList.remove("active")
    })
  }

  // Close sidebar on escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sidebar.classList.contains("open")) {
      sidebar.classList.remove("open")
      sidebarOverlay.classList.remove("active")
    }
  })
}

function initializeNavigation() {
  // Handle navigation group toggles
  const navGroupHeaders = document.querySelectorAll(".nav-group-header")

  navGroupHeaders.forEach((header) => {
    header.addEventListener("click", function () {
      const target = this.getAttribute("data-bs-target")
      const content = document.querySelector(target)
      const arrow = this.querySelector(".nav-arrow")

      if (content) {
        const isExpanded = content.classList.contains("show")

        if (isExpanded) {
          content.classList.remove("show")
          this.setAttribute("aria-expanded", "false")
        } else {
          content.classList.add("show")
          this.setAttribute("aria-expanded", "true")
        }
      }
    })
  })

  // Add smooth hover effects
  const navItems = document.querySelectorAll(".nav-item, .nav-subitem")
  navItems.forEach((item) => {
    item.addEventListener("mouseenter", function () {
      this.style.transform = "translateX(4px)"
    })

    item.addEventListener("mouseleave", function () {
      this.style.transform = "translateX(0)"
    })
  })
}

function setActiveNavItem() {
  const currentPath = window.location.pathname
  const navItems = document.querySelectorAll(".nav-item, .nav-subitem")

  navItems.forEach((item) => {
    const href = item.getAttribute("href")
    if (href && currentPath.includes(href)) {
      item.classList.add("active")

      // If it's a subitem, also expand its parent group
      const parentGroup = item.closest(".nav-group-content")
      if (parentGroup) {
        parentGroup.classList.add("show")
        const header = parentGroup.previousElementSibling
        if (header) {
          header.setAttribute("aria-expanded", "true")
        }
      }
    }
  })
}

// Notification system
function showNotification(message, type = "info", duration = 3000) {
  const notification = document.createElement("div")
  notification.className = `notification notification-${type}`
  notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `

  document.body.appendChild(notification)

  // Show notification
  setTimeout(() => {
    notification.classList.add("show")
  }, 100)

  // Auto hide
  setTimeout(() => {
    hideNotification(notification)
  }, duration)

  // Manual close
  const closeBtn = notification.querySelector(".notification-close")
  closeBtn.addEventListener("click", () => {
    hideNotification(notification)
  })
}

function hideNotification(notification) {
  notification.classList.remove("show")
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification)
    }
  }, 300)
}

function getNotificationIcon(type) {
  const icons = {
    success: "check-circle",
    error: "exclamation-circle",
    warning: "exclamation-triangle",
    info: "info-circle",
  }
  return icons[type] || "info-circle"
}

// Add notification styles
const notificationStyles = `
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    min-width: 300px;
    max-width: 400px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    border-left: 4px solid var(--primary-color);
    padding: 1rem;
    z-index: 9999;
    transform: translateX(100%);
    transition: transform 0.3s ease-in-out;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.notification.show {
    transform: translateX(0);
}

.notification-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
}

.notification-content i {
    font-size: 1.25rem;
}

.notification-close {
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
    transition: var(--transition);
}

.notification-close:hover {
    background-color: var(--bg-tertiary);
    color: var(--text-primary);
}

.notification-success {
    border-left-color: var(--success-color);
}

.notification-success .notification-content i {
    color: var(--success-color);
}

.notification-error {
    border-left-color: var(--danger-color);
}

.notification-error .notification-content i {
    color: var(--danger-color);
}

.notification-warning {
    border-left-color: var(--warning-color);
}

.notification-warning .notification-content i {
    color: var(--warning-color);
}

.notification-info {
    border-left-color: var(--info-color);
}

.notification-info .notification-content i {
    color: var(--info-color);
}
`

// Inject notification styles
const styleSheet = document.createElement("style")
styleSheet.textContent = notificationStyles
document.head.appendChild(styleSheet)

// Export for global use
window.showNotification = showNotification
