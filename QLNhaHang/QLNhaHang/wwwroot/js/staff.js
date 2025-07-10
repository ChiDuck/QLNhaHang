const apiUrl = "/api/staffapi"

// Biến lưu trạng thái
let currentDetailModal = null;
let currentStaffId = null;
var stafflist = [];

async function loadStaffList() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        staffList = await response.json();
        renderStaffList();
    } catch (error) {
        console.error('Error loading staff list:', error);
        alert('Có lỗi xảy ra khi tải danh sách nhân viên');
    }
}

function renderStaffList() {
    const tableBody = document.querySelector('#staffTable tbody');
    tableBody.innerHTML = '';

    staffList.forEach(staff => {
        const row = document.createElement('tr');
        row.style.cursor = 'pointer';
        row.dataset.staffId = staff.idStaff;

        row.innerHTML = `
            <td>${staff.idStaff}</td>
            <td>${staff.name}</td>
            <td>${staff.phone}</td>
            <td>${staff.email}</td>
            <td>${staff.photo ? `<img src="${staff.photo}" alt="Ảnh nhân viên" class="staff-photo">` : 'Không có ảnh'}</td>
            <td>${staff.staffType}</td>
        `;

        row.addEventListener('click', () => showStaffDetails(staff.idStaff));
        tableBody.appendChild(row);
    });
}

async function searchStaff() {
    const keyword = document.getElementById("staffSearchInput").value.trim();
    const tbody = document.getElementById("staffTableBody");
    tbody.innerHTML = "";

    if (!keyword) return;

    try {
        const res = await fetch(`/api/staffapi/search?keyword=${encodeURIComponent(keyword)}`);
        const data = await res.json();

        if (!res.ok) {
            alert(data.message || "Lỗi khi tìm kiếm nhân viên.");
            return;
        }

        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6">Không tìm thấy nhân viên phù hợp.</td></tr>`;
            return;
        }

        staffList = data; // Cập nhật danh sách nhân viên
        renderStaffList(); // Hàm render danh sách nhân viên
    } catch (err) {
        console.error("Lỗi:", err);
        alert("Không thể kết nối đến máy chủ.");
    }
}

// Load danh sách loại nhân viên
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

// Hiển thị modal chi tiết nhân viên
async function showStaffDetails(staffId) {
    currentStaffId = staffId;
    try {
        const response = await fetch(`${apiUrl}/${staffId}`);
        if (!response.ok) throw new Error('Failed to load staff details');
        const staff = await response.json();
        // Điền dữ liệu vào modal chi tiết
        document.getElementById('staffId').textContent = staff.idStaff;
        document.getElementById('staffName').textContent = staff.name;
        document.getElementById('staffCitizenId').textContent = staff.citizenid;
        document.getElementById('staffPhone').textContent = staff.phone;
        document.getElementById('staffEmail').textContent = staff.email;
        document.getElementById('staffGender').textContent = staff.gender ? 'Nam' : 'Nữ';
        document.getElementById('staffBirthday').textContent = staff.birthday ? new Date(staff.birthday).toLocaleDateString('vi-VN') : 'Không có';
        document.getElementById('staffPhoto').innerHTML = staff.photo ? `<img src="${staff.photo}" alt="Ảnh nhân viên" class="img-fluid">` : 'Không có ảnh';
        document.getElementById('staffAddress').textContent = staff.address.toLocaleString();
        document.getElementById('staffStartDate').textContent = staff.startdate ? new Date(staff.startdate).toLocaleDateString('vi-VN') : 'Không có';
        document.getElementById('staffHourlySalary').textContent = staff.hourlysalary ? staff.hourlysalary.toLocaleString('vi-VN') + ' VNĐ' : 'Không có';
        document.getElementById('staffStatus').textContent = staff.isactive ? 'Đang làm việc' : 'Đã nghỉ việc';
        document.getElementById('staffType').textContent = staff.staffType || 'Không có';

        // Hiển thị modal chi tiết
        currentDetailModal = new bootstrap.Modal(document.getElementById('staffModal'));
        currentDetailModal.show();

    } catch (error) {
        console.error('Error loading staff details:', error);
        alert('Có lỗi khi tải thông tin nhân viên');
    }
}

// Hiển thị form chỉnh sửa/thêm mới
async function showStaffForm(staffId = null) {
    try {
        // Load danh sách loại nhân viên
        const staffTypes = await loadStaffTypes();
        const staffTypeSelect = document.getElementById('editStaffType');
        staffTypeSelect.innerHTML = staffTypes.map(type =>
            `<option value="${type.idStafftype}">${type.name}</option>`
        ).join('');
        if (staffId) {
            // Chế độ sửa
            document.getElementById('staffEditModalLabel').textContent = 'Chỉnh Sửa Nhân Viên';

            // Load dữ liệu nhân viên
            const response = await fetch(`${apiUrl}/${staffId}`);
            if (!response.ok) throw new Error('Failed to load staff details');
            const staff = await response.json();

            // Điền dữ liệu vào form
            document.getElementById('editIdStaff').value = staff.idStaff;
            document.getElementById('editName').value = staff.name;
            document.getElementById('editCitizenId').value = staff.citizenid;
            document.getElementById('editPhone').value = staff.phone;
            document.getElementById('editEmail').value = staff.email;
            document.getElementById('editPasswordHash').value = '';
            document.getElementById('staffPhotoInput').value = staff.photo;
            document.getElementById('editGender').value = staff.gender ? 'true' : 'false';
            document.getElementById('editBirthday').value = staff.birthday ? staff.birthday.split('T')[0] : '';
            document.getElementById('editAddress').value = staff.address;
            document.getElementById('editStartDate').value = staff.startdate ? staff.startdate.split('T')[0] : '';
            document.getElementById('editHourlySalary').value = staff.hourlysalary || '';
            document.getElementById('editStaffType').value = staff.idStafftype || '';
        } else {
            // Chế độ thêm mới
            document.getElementById('staffEditModalLabel').textContent = 'Thêm Nhân Viên Mới';
            document.getElementById('staffForm').reset();
            document.getElementById('editIdStaff').value = '0';
        }

        // Hiển thị modal chỉnh sửa
        const editModal = new bootstrap.Modal(document.getElementById('staffEditModal'));
        editModal.show();

    } catch (error) {
        console.error('Error:', error);
        alert('Có lỗi khi tải form: ' + error.message);
    }
}

// Xử lý sự kiện khi DOM ready
document.addEventListener('DOMContentLoaded', function () {
    loadStaffList();

    // Nút thêm nhân viên
    document.getElementById('addStaffBtn').addEventListener('click', () => showStaffForm());

    // Nút sửa trong modal chi tiết
    document.getElementById('editStaffBtn').addEventListener('click', () => {
        if (!currentStaffId) return;

        // Ẩn modal chi tiết
        currentDetailModal.hide();

        // Hiển thị modal chỉnh sửa
        showStaffForm(currentStaffId);
    });

    // Nút quay lại từ modal chỉnh sửa
    document.getElementById('backToDetailBtn').addEventListener('click', () => {
        // Ẩn modal chỉnh sửa
        bootstrap.Modal.getInstance(document.getElementById('staffEditModal')).hide();

        // Hiển thị lại modal chi tiết
        if (currentDetailModal) {
            currentDetailModal.show();
        }
    });
});

// Xử lý submit form
async function submitStaff() {
    await uploadStaffPhotoAndGetPath();
    const form = document.getElementById("staffForm");
    const formData = new FormData(form);
    const staffData = Object.fromEntries(formData.entries());

    // Chuẩn hóa dữ liệu
    staffData.IdStaff = parseInt(staffData.IdStaff);
    staffData.Gender = staffData.Gender === 'true';
    staffData.Isactive = true;

    try {
        const url = staffData.IdStaff === 0 ? apiUrl : `${apiUrl}/${staffData.IdStaff}`;
        const method = staffData.IdStaff === 0 ? 'POST' : 'PUT';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(staffData)
        });

        if (!response.ok) throw new Error(await response.text());

        alert('Lưu thông tin thành công!');

        // Đóng modal chỉnh sửa
        bootstrap.Modal.getInstance(document.getElementById('staffEditModal')).hide();

        // Nếu là sửa, hiển thị lại modal chi tiết với dữ liệu mới
        if (staffData.IdStaff !== 0 && currentDetailModal) {
            await showStaffDetails(staffData.IdStaff);
        }

        // Refresh danh sách nhân viên
        loadStaffList();

    } catch (error) {
        console.error('Error saving staff:', error);
        alert('Lỗi khi lưu thông tin: ' + error.message);
    }
}

// Biến lưu trạng thái
let currentStaffName = null;

// Sự kiện click nút Xóa
document.getElementById('deleteStaffBtn').addEventListener('click', () => {
    if (!currentStaffId) return;

    // Điền thông tin vào modal xác nhận
    document.getElementById('staffIdToDelete').textContent = currentStaffId;
    document.getElementById('staffNameToDelete').textContent = currentStaffName;

    // Hiển thị modal xác nhận
    new bootstrap.Modal(document.getElementById('confirmDeleteModal')).show();
});

// Sự kiện click nút Xác nhận xóa
document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
    try {
        const response = await fetch(`${apiUrl}/${currentStaffId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || 'Failed to delete staff');
        }

        // Đóng cả 2 modal
        bootstrap.Modal.getInstance(document.getElementById('confirmDeleteModal')).hide();
        bootstrap.Modal.getInstance(document.getElementById('staffModal')).hide();

        // Thông báo thành công
        alert('Đã xóa nhân viên thành công!');

        // Refresh danh sách nhân viên
        loadStaffList();

    } catch (error) {
        console.error('Error deleting staff:', error);
        alert('Lỗi khi xóa nhân viên: ' + error.message);
    }
});