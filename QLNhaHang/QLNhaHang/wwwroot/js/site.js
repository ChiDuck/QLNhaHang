document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const staff = JSON.parse(localStorage.getItem('staff'));

    if (!token || !staff) {
        window.location.href = '/Login';
        return;
    }
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