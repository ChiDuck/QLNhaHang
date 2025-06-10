const apiUrl = "/api/staffapi";

document.addEventListener('DOMContentLoaded', function () {
    loadStaffList();
});

async function loadStaffList() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const staffList = await response.json();
        renderStaffList(staffList);
    } catch (error) {
        console.error('Error loading staff list:', error);
        alert('Có lỗi xảy ra khi tải danh sách nhân viên');
    }
}

// Thêm sự kiện click cho các hàng trong bảng
function renderStaffList(staffList) {
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

// Hiển thị modal với chi tiết nhân viên
async function showStaffDetails(id) {
    try {
        const response = await fetch(`${apiUrl}/${id}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const staff = await response.json();

        // Điền dữ liệu vào modal
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

        // Hiển thị modal
        const staffModal = new bootstrap.Modal(document.getElementById('staffModal'));
        staffModal.show();
    } catch (error) {
        console.error('Error loading staff details:', error);
        alert('Có lỗi xảy ra khi tải thông tin nhân viên');
    }
}