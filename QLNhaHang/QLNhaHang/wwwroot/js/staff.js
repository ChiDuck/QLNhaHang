const apiUrl = "/api/staffapi"

const currentDetailModal = null
const currentStaffId = null
var staffList = []

// Lấy token từ localStorage
function getToken() {
    return localStorage.getItem("token") || "";
}

async function loadStaffList() {
    showLoading(true);
    try {
        const response = await fetch(apiUrl)
        if (!response.ok) {
            throw new Error("Network response was not ok")
        }
        staffList = await response.json();
        renderStaffList()
        // updateStats()
    } catch (error) {
        console.error("Error loading staff list:", error)
        showNotification("Có lỗi xảy ra khi tải danh sách nhân viên", "error")
    } finally {
        showLoading(false)
    }
}

function renderStaffList() {
    const container = document.getElementById("staffGrid")

    if (staffList.length === 0) {
        container.style.display = "none"
        return
    }

    container.style.display = "grid"
    container.innerHTML = ""

    staffList.forEach((staff) => {
        const card = createStaffCard(staff)
        container.appendChild(card)
    })

    // Add animation
    setTimeout(() => {
        container.querySelectorAll(".staff-card").forEach((card, index) => {
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

function createStaffCard(staff) {
    const card = document.createElement("div")
    card.className = "staff-card"

    const initials = staff.name
        ? staff.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
        : "NV"
    const avatar = staff.photo ? `<img src="${staff.photo}" alt="Avatar">` : initials

    card.innerHTML = `
        <div class="staff-header">
            <div class="staff-avatar">
                ${avatar}
            </div>
            <div class="staff-info">
                <h3>${staff.name || "Nhân viên"}</h3>
                <p>${staff.staffType || "Chưa phân loại"}</p>
            </div>
        </div>
        <div class="staff-details">
            <div class="detail-row">
                <i class="fas fa-id-card"></i>
                <span>ID: ${staff.idStaff}</span>
            </div>
            <div class="detail-row">
                <i class="fas fa-phone"></i>
                <span>${staff.phone || "Chưa cập nhật"}</span>
            </div>
            <div class="detail-row">
                <i class="fas fa-envelope"></i>
                <span>${staff.email || "Chưa cập nhật"}</span>
            </div>
        </div>
        <div class="staff-actions">
            <button class="btn-view" onclick="showStaffDetail(${staff.idStaff})">
                <i class="fas fa-eye"></i>Chi tiết
            </button>
        </div>
    `
    return card
}

function updateStats() {
    document.getElementById("totalStaff").textContent = staffList.length

    const activeStaff = staffList.filter((s) => s.isActive !== false).length
    document.getElementById("activeStaff").textContent = activeStaff

    // Count by staff types
    const managers = staffList.filter((s) => s.staffType && s.staffType.toLowerCase().includes("Quản")).length
    document.getElementById("managers").textContent = managers

    const chefs = staffList.filter((s) => s.staffType && s.staffType.toLowerCase().includes("Bếp")).length
    document.getElementById("chefs").textContent = chefs
}

function showLoading(show) {
    const loadingState = document.getElementById("loadingState")
    const container = document.getElementById("staffGrid")

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

// Search functionality
async function searchStaff() {
    const keyword = document.getElementById("staffSearchInput").value.trim()

    if (!keyword) {
        renderStaffList()
        return
    }

    showLoading(true)
    try {
        const res = await fetch(`/api/staffapi/search?keyword=${encodeURIComponent(keyword)}`)
        const data = await res.json()

        if (!res.ok) {
            showNotification("Lỗi tìm kiếm: " + (data.message || "Không thể tìm."), "error")
            return
        }

        staffList = data
        renderStaffList()
       // updateStats()

        if (data.length === 0) {
            showNotification("Không tìm thấy nhân viên nào phù hợp", "error")
        }
    } catch (err) {
        showNotification("Lỗi kết nối máy chủ.", "error")
    } finally {
        showLoading(false)
    }
}

async function showStaffDetail(id) {
    try {
        const response = await fetch(`${apiUrl}/${id}`)
        if (!response.ok) {
            throw new Error("Failed to fetch staff details")
        }
        const staff = await response.json()

        // Create detail modal content
        const modalContent = `
            <div class="modal fade" id="staffModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Chi tiết nhân viên</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="staff-detail-content">
                                <div class="staff-detail-header">
                                    <div class="staff-detail-avatar">
                                        ${staff.photo
                ? `<img src="${staff.photo}" alt="Avatar">`
                : staff.name
                    ? staff.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        : "NV"
            }
                                    </div>
                                    <div class="staff-detail-info">
                                        <h3 id="staffName">${staff.name || "Nhân viên"}</h3>
                                        <p>${staff.staffType || "Chưa phân loại"}</p>
                                    </div>
                                </div>
                                <div class="staff-detail-body">
                                    <div class="detail-group">
                                        <label>ID:</label>
									<span id="staffId">${staff.idStaff}</span>

                                    </div>
                                    <div class="detail-group">
                                        <label>Số điện thoại:</label>
                                        <span>${staff.phone || "Chưa cập nhật"}</span>
                                    </div>
                                    <div class="detail-group">
                                        <label>Email:</label>
                                        <span>${staff.email || "Chưa cập nhật"}</span>
                                    </div>
                                    <div class="detail-group">
                                        <label>Ngày sinh:</label>
                                        <span>${staff.birthday ? new Date(staff.birthday).toLocaleDateString("vi-VN") : "Chưa cập nhật"}</span>
                                    </div>
                                    <div class="detail-group">
                                        <label>Địa chỉ:</label>
                                        <span>${staff.address || "Chưa cập nhật"}</span>
                                    </div>
                                    <div class="detail-group">
                                        <label>Lương:</label>
                                        <span>${staff.hourlysalary ? staff.hourlysalary.toLocaleString() + " đ" : "Chưa cập nhật"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-warning" onclick="editStaff(${staff.idStaff})">
                                <i class="fas fa-edit"></i>
                                Sửa
                            </button>
                            <button type="button" class="btn btn-danger" id="deleteStaffBtn">
                                <i class="fas fa-trash"></i>
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `

        // Remove existing modal if any
        const existingModal = document.getElementById("staffModal")
        if (existingModal) {
            existingModal.remove()
        }

        // Add modal to body
        document.body.insertAdjacentHTML("beforeend", modalContent)

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById("staffModal"))
        modal.show()

        // Gắn sự kiện cho nút xóa trong modal chi tiết
        document.getElementById("deleteStaffBtn").addEventListener("click", function () {
            const staffId = document.getElementById("staffId").textContent;
            const staffName = document.getElementById("staffName").textContent;
            document.getElementById("staffIdToDelete").textContent = staffId;
            document.getElementById("staffNameToDelete").textContent = staffName;
            new bootstrap.Modal(document.getElementById("confirmDeleteModal")).show();
            bootstrap.Modal.getInstance(document.getElementById("staffModal")).hide();
        });

        // Gắn sự kiện xác nhận xóa
        document.getElementById("confirmDeleteBtn").addEventListener("click", async function () {
            const staffId = parseInt(document.getElementById("staffIdToDelete").textContent);
            console.log(staffId === 2);
            try {
                const res = await fetch(`/api/staffapi/${staffId}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + getToken()
                    },
                });
                if (res.ok) {
                    showNotification("Xóa nhân viên thành công!");
                    bootstrap.Modal.getInstance(document.getElementById("confirmDeleteModal")).hide();
                    //bootstrap.Modal.getInstance(document.getElementById("staffModal")).hide();
                    loadStaffList();
                } else {
                    const err = await res.text();
                    showNotification("Không thể xóa nhân viên: " + err, "error");
                }
            } catch (error) {
                showNotification("Lỗi khi xóa nhân viên", "error");
            }
        });
    } catch (error) {
        console.error("Error showing staff detail:", error)
        showNotification("Có lỗi xảy ra khi tải thông tin nhân viên", "error")
    }
}

async function editStaff(id) {
    try {
        // Lấy thông tin nhân viên từ API
        const res = await fetch(`/api/staffapi/${id}`);
        if (!res.ok) throw new Error("Không tìm thấy nhân viên");
        const staff = await res.json();

        await populateStaffTypeDropdown(staff.idStafftype);

        // Điền dữ liệu vào form
        document.getElementById("editIdStaff").value = staff.idStaff;
        document.getElementById("editName").value = staff.name || "";
        document.getElementById("editCitizenId").value = staff.citizenid || "";
        document.getElementById("editPhone").value = staff.phone || "";
        document.getElementById("editEmail").value = staff.email || "";
        document.getElementById("editPasswordHash").value = ""; // Để trống, chỉ nhập nếu muốn đổi mật khẩu
        document.getElementById("editGender").value = staff.gender === true ? "true" : "false";
        document.getElementById("editBirthday").value = staff.birthday ? staff.birthday.split("T")[0] : "";
        document.getElementById("staffPhotoPath").value = staff.photo || "";
        document.getElementById("editAddress").value = staff.address || "";
        document.getElementById("editStartDate").value = staff.startdate ? staff.startdate.split("T")[0] : "";
        document.getElementById("editHourlySalary").value = staff.hourlysalary || "";
        document.getElementById("editStaffType").value = staff.idStafftype || "";

        // Đặt tiêu đề modal
        document.getElementById("staffEditModalLabel").textContent = "Chỉnh Sửa Nhân Viên";

        // Hiển thị modal
        new bootstrap.Modal(document.getElementById("staffEditModal")).show();
        bootstrap.Modal.getInstance(document.getElementById("staffModal")).hide();
    } catch (error) {
        showNotification("Không thể tải thông tin nhân viên", "error");
    }
}

function resetStaffForm() {
    document.getElementById("staffForm").reset();
    document.getElementById("editIdStaff").value = "";
    document.getElementById("staffPhotoPath").value = "";
    // Nếu có preview ảnh, xóa preview ở đây
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    loadStaffList();

    // Add search functionality
    const searchInput = document.getElementById("staffSearchInput")
    if (searchInput) {
        searchInput.addEventListener("input", function () {
            const keyword = this.value.toLowerCase()
            const cards = document.querySelectorAll(".staff-card")

            cards.forEach((card) => {
                const name = card.querySelector("h3").textContent.toLowerCase()
                const type = card.querySelector(".staff-info p").textContent.toLowerCase()
                if (name.includes(keyword) || type.includes(keyword)) {
                    card.style.display = "block"
                } else {
                    card.style.display = "none"
                }
            })
        })
    }

    document.getElementById("addStaffBtn").addEventListener("click", async function () {
        resetStaffForm();
        document.getElementById("staffEditModalLabel").textContent = "Thêm Nhân Viên";
        await populateStaffTypeDropdown();
        new bootstrap.Modal(document.getElementById("staffEditModal")).show();
    });

    document.getElementById("editStaffBtn").addEventListener("click", function () {
        const staffId = document.getElementById("editIdStaff").value || document.getElementById("staffId").textContent;
        editStaff(staffId);
   });
})

async function loadStaffTypes() {
    try {
        const response = await fetch('/api/stafftypeapi');
        if (!response.ok) throw new Error('Failed to load staff types');
        return await response.json();
    } catch (error) {
        console.error('Error loading staff types:', error);
        return [];
    }
}

async function populateStaffTypeDropdown(selectedId = null) {
    const types = await loadStaffTypes();
    const select = document.getElementById("editStaffType");
    if (!select) return;
    select.innerHTML = '<option value="">-- Chọn vị trí --</option>';
    types.forEach(type => {
        const option = document.createElement("option");
        option.value = type.idStafftype;
        option.textContent = type.name;
        if (selectedId && selectedId == type.idStafftype) option.selected = true;
        select.appendChild(option);
    });
}

// Add notification styles if not already added
//if (!document.querySelector("#staff-notification-styles")) {
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
        max-width: 400px;
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
    
    .staff-detail-content {
        padding: 1rem;
    }
    
    .staff-detail-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 2px solid #e2e8f0;
    }
    
    .staff-detail-avatar {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 2rem;
        font-weight: 600;
        overflow: hidden;
    }
    
    .staff-detail-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .staff-detail-info h3 {
        font-size: 1.5rem;
        font-weight: 600;
        color: #2d3748;
        margin: 0;
    }
    
    .staff-detail-info p {
        color: #718096;
        margin: 0.5rem 0 0 0;
        font-size: 1rem;
    }
    
    .staff-detail-body {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
    }
    
    .detail-group {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }
    
    .detail-group label {
        font-weight: 600;
        color: #4a5568;
        font-size: 0.9rem;
    }
    
    .detail-group span {
        color: #2d3748;
        font-size: 1rem;
    }
    `

const styleSheet = document.createElement("style")
styleSheet.id = "staff-notification-styles"
styleSheet.textContent = notificationStyles
document.head.appendChild(styleSheet)
//}

async function submitStaff() {
    const form = document.getElementById("staffForm");
    const formData = new FormData(form);

    // Validate cơ bản
    if (!formData.get("Name") || !formData.get("Citizenid") || !formData.get("Phone") || !formData.get("Email") || !formData.get("Address") || !formData.get("IdStafftype")) {
        showNotification("Vui lòng nhập đầy đủ thông tin bắt buộc", "error");
        return;
    }

    // Chuẩn bị dữ liệu gửi lên API
    const staffData = {
        IdStaff: formData.get("IdStaff") ? parseInt(formData.get("IdStaff")) : undefined,
        Name: formData.get("Name"),
        Citizenid: formData.get("Citizenid"),
        Phone: formData.get("Phone"),
        Email: formData.get("Email"),
        PasswordHash: formData.get("PasswordHash") || "",
        Gender: formData.get("Gender") === "true",
        Birthday: formData.get("Birthday") || null,
        Photo: formData.get("Photo") || document.getElementById("staffPhotoPath").value || null,
        Address: formData.get("Address"),
        Startdate: formData.get("Startdate") || null,
        Hourlysalary: formData.get("Hourlysalary") ? parseFloat(formData.get("Hourlysalary")) : null,
        IdStafftype: parseInt(formData.get("IdStafftype"))
    };


    console.log(staffData.IdStaff);
    // Thêm mới nhân viên (POST)
    if (!formData.get("IdStaff")) {
        try {
            const res = await fetch("/api/staffapi", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + getToken()
                },
                body: JSON.stringify(staffData)
            });
            if (res.ok) {
                showNotification("Thêm nhân viên thành công!");
                bootstrap.Modal.getInstance(document.getElementById("staffEditModal")).hide();
                loadStaffList();
            } else {
                const err = await res.text();
                showNotification("Không thể thêm nhân viên: " + err, "error");
            }
        } catch (error) {
            showNotification("Lỗi khi thêm nhân viên", "error");
        }
    } else {
        // Sửa nhân viên (PUT)
        try {
            const res = await fetch(`/api/staffapi/${staffData.IdStaff}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + getToken()
                },
                body: JSON.stringify(staffData)
            });
            if (res.ok) {
                showNotification("Cập nhật nhân viên thành công!");
                bootstrap.Modal.getInstance(document.getElementById("staffEditModal")).hide();
                loadStaffList();
            } else {
                const err = await res.text();
                showNotification("Không thể cập nhật nhân viên: " + err, "error");
            }
        } catch (error) {
            showNotification("Lỗi khi cập nhật nhân viên", "error");
        }
    }
}
