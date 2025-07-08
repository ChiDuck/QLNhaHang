document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const staff = JSON.parse(localStorage.getItem('staff'));
    const nav = document.querySelector('.navbar-collapse');

    if (!token || !staff) {
        window.location.href = '/Login';
        return;
    }

    const userMenu = document.createElement('div');
    userMenu.className = 'dropdown';
    userMenu.innerHTML = `
            <button class="btn btn-light dropdown-toggle" type="button" data-bs-toggle="dropdown">
                <i class="fa fa-user-circle"></i> <span>${staff.name}</span>
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
                <li><a class="dropdown-item" href="#" onclick="showProfileModal()">Thông tin cá nhân</a></li>
                <li><a class="dropdown-item text-danger" href="#" onclick="logout()">Đăng xuất</a></li>
            </ul>
        `;
    nav.appendChild(userMenu);
});

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('staff');
    location.href = '/Login';
}

function showProfileModal() {
    const staff = JSON.parse(localStorage.getItem('staff'));
    if (!staff) return;
    document.getElementById('profileName').textContent = staff.name;
    document.getElementById('profileEmail').textContent = staff.email;
    document.getElementById('profilePhone').textContent = staff.phone;
    document.getElementById('profileType').textContent = staff.type;
    new bootstrap.Modal(document.getElementById('profileModal')).show();
}