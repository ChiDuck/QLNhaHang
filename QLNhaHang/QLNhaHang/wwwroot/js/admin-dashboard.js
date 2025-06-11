// Dashboard JavaScript
import { lucide } from "lucide" // Declare the lucide variable
import { Chart } from "@/components/ui/chart" // Import Chart component

document.addEventListener("DOMContentLoaded", () => {
    // Initialize Lucide icons
    lucide.createIcons()

    // Initialize dashboard components
    initializeSidebar()
    initializeSearch()
    initializeNavGroups()
    initializeRevenueChart() // Initialize revenue chart
})

// Sidebar functionality
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
}

// Search functionality
function initializeSearch() {
    const searchToggle = document.getElementById("searchToggle")
    const searchInputContainer = document.getElementById("searchInputContainer")
    const searchClose = document.getElementById("searchClose")
    const searchInput = document.getElementById("searchInput")

    if (searchToggle) {
        searchToggle.addEventListener("click", () => {
            searchToggle.style.display = "none"
            searchInputContainer.classList.add("active")
            searchInput.focus()
        })
    }

    if (searchClose) {
        searchClose.addEventListener("click", () => {
            searchInputContainer.classList.remove("active")
            searchToggle.style.display = "block"
            searchInput.value = ""
        })
    }

    // Close search on escape key
    if (searchInput) {
        searchInput.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                searchClose.click()
            }
        })
    }
}

// Navigation groups (collapsible menus)
function initializeNavGroups() {
    const navGroupHeaders = document.querySelectorAll(".nav-group-header")

    navGroupHeaders.forEach((header) => {
        header.addEventListener("click", () => {
            const target = header.getAttribute("data-target")
            const content = document.querySelector(target)
            const isExpanded = header.getAttribute("aria-expanded") === "true"

            if (content) {
                if (isExpanded) {
                    content.classList.remove("show")
                    header.setAttribute("aria-expanded", "false")
                } else {
                    content.classList.add("show")
                    header.setAttribute("aria-expanded", "true")
                }
            }
        })
    })
}

// Revenue Chart
function initializeRevenueChart() {
    const ctx = document.getElementById("revenueChart")
    if (!ctx) return

    const data = [
        { date: "01/06", revenue: 1200000 },
        { date: "02/06", revenue: 1900000 },
        { date: "03/06", revenue: 1500000 },
        { date: "04/06", revenue: 1700000 },
        { date: "05/06", revenue: 2200000 },
        { date: "06/06", revenue: 2800000 },
        { date: "07/06", revenue: 2100000 },
        { date: "08/06", revenue: 1800000 },
        { date: "09/06", revenue: 2500000 },
        { date: "10/06", revenue: 2700000 },
        { date: "11/06", revenue: 2300000 },
        { date: "12/06", revenue: 2000000 },
    ]

    new Chart(ctx, {
        type: "bar",
        data: {
            labels: data.map((item) => item.date),
            datasets: [
                {
                    label: "Doanh thu",
                    data: data.map((item) => item.revenue),
                    backgroundColor: "#22c55e",
                    borderColor: "#16a34a",
                    borderWidth: 1,
                    borderRadius: 4,
                    borderSkipped: false,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: {
                    callbacks: {
                        label: (context) => "Doanh thu: " + formatCurrency(context.parsed.y),
                    },
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: (value) => value / 1000000 + "M",
                    },
                    grid: {
                        color: "#e2e8f0",
                    },
                },
                x: {
                    grid: {
                        display: false,
                    },
                },
            },
        },
    })
}

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        minimumFractionDigits: 0,
    }).format(amount)
}

// Notification system
function showNotification(message, type = "info") {
    const notification = document.createElement("div")
    notification.className = `notification notification-${type}`
    notification.textContent = message

    document.body.appendChild(notification)

    setTimeout(() => {
        notification.classList.add("show")
    }, 100)

    setTimeout(() => {
        notification.classList.remove("show")
        setTimeout(() => {
            document.body.removeChild(notification)
        }, 300)
    }, 3000)
}

// Add notification styles
const notificationStyles = `
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: 9999;
    transform: translateX(100%);
    transition: transform 0.3s ease-in-out;
}

.notification.show {
    transform: translateX(0);
}

.notification-info {
    background-color: #3b82f6;
}

.notification-success {
    background-color: #22c55e;
}

.notification-warning {
    background-color: #f59e0b;
}

.notification-error {
    background-color: #ef4444;
}
`

// Inject notification styles
const styleSheet = document.createElement("style")
styleSheet.textContent = notificationStyles
document.head.appendChild(styleSheet)
