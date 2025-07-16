// Hàm đăng nhập người dùng
let customertoken = localStorage.getItem("customertoken");
console.log("Customer token: ", customertoken);

async function loginCustomer() {
    const identity = document.getElementById('loginIdentity').value.trim();
    const password = document.getElementById('loginPassword').value;
    const msg = document.getElementById('authMessage');

    if (!identity || !password) {
        msg.textContent = "Vui lòng nhập đầy đủ thông tin.";
        msg.className = "text-danger";
        return;
    }

    try {
        const res = await fetch('/api/authcustomerapi/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identity, password })
        });

        const data = await res.json();
        if (!res.ok) {
            msg.textContent = data.message || "Đăng nhập thất bại.";
            msg.className = "text-danger";
            return;
        }

        localStorage.setItem("customertoken", data.customertoken);
        customertoken = data.customertoken; // Cập nhật biến toàn cục
        localStorage.setItem("customer", JSON.stringify(data));
        msg.textContent = "Đăng nhập thành công!";
        msg.className = "text-success";

        // Nếu có cart trong localStorage, đồng bộ lên server sau khi đăng nhập
        // Đồng bộ cart local lên server nếu có và cart server đang rỗng
        const localCart = localStorage.getItem('cart');
        if (localCart) {
            const cartItems = JSON.parse(localCart);
            if (Array.isArray(cartItems) && cartItems.length > 0) {
                // Gửi cart lên server
                fetch('/api/cartapi', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + data.customertoken
                    },
                    body: JSON.stringify(cartItems)
                }).then(() => {
                    // Xóa cart local sau khi đồng bộ thành công
                    localStorage.removeItem('cart');
                }).catch(() => {
                    // Nếu lỗi, có thể giữ lại cart local để thử lại sau
                });
            }
            localStorage.removeItem('cart'); // Xóa cart local sau khi đăng nhập thành công
        }

        var modalEl = document.getElementById('loginModal');
        if (modalEl) bootstrap.Modal.getInstance(modalEl)?.hide();
        modalEl = document.getElementById('registerModal');
        if (modalEl) bootstrap.Modal.getInstance(modalEl)?.hide();

        renderAccountDropdown();

    } catch (err) {
        msg.textContent = "Lỗi kết nối đến máy chủ.";
        msg.className = "text-danger";
    }
    window.location.reload();
}

// Hàm đăng ký người dùng
async function registerCustomer() {
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const password = document.getElementById('regPassword').value;
    const msg = document.getElementById('authMessage');

    if (!name || !password || (!email && !phone)) {
        msg.textContent = "Vui lòng nhập đầy đủ thông tin.";
        msg.className = "text-danger";
        return;
    }

    try {
        const res = await fetch('/api/authcustomerapi/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, phone, password })
        });

        const data = await res.json();
        if (!res.ok) {
            msg.textContent = data.message || "Đăng ký thất bại.";
            msg.className = "text-danger";
            return;
        }

        msg.textContent = "Đăng ký thành công! Vui lòng đăng nhập.";
        msg.className = "text-success";

        document.getElementById("registerForm").reset();

        // ✅ Ẩn modal nếu muốn
        const modal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
        if (modal) modal.hide();

    } catch (err) {
        msg.textContent = "Không thể kết nối đến máy chủ.";
        msg.className = "text-danger";
    }
}


// Hiển thị dropdown tài khoản
function renderAccountDropdown() {
    const customer = JSON.parse(localStorage.getItem('customer'));
    const nameSpan = document.getElementById('accountName');
    const menu = document.getElementById('accountMenu');

    if (!customer) {
        nameSpan.textContent = "Tài khoản";
        menu.innerHTML = `
            <li><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#loginModal">Đăng nhập</a></li>
            <li><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#registerModal">Đăng ký</a></li>
            <li><a class="dropdown-item" href="/cart">Đơn hàng hiện tại</a></li>
        `;
    } else {
        nameSpan.textContent = customer.name || "Khách hàng";
        menu.innerHTML = `
            <li><a class="dropdown-item" href="/Home/Profile">Thông tin cá nhân</a></li>
            <li><a class="dropdown-item" href="/reservations">Hẹn đặt bàn của bạn</a></li>
            <li><a class="dropdown-item" href="/orders">Đơn hàng của bạn</a></li>
            <li><a class="dropdown-item" href="/change-password">Đổi mật khẩu</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item text-danger" href="#" onclick="logoutCustomer()">Đăng xuất</a></li>
        `;
    }
}

// Đăng xuất người dùng
function logoutCustomer() {
    localStorage.removeItem('customertoken');
    localStorage.removeItem('customer');
    localStorage.removeItem('cart');
    renderAccountDropdown();
    location.reload();
}

function switchToRegister() {
    bootstrap.Modal.getInstance(document.getElementById('loginModal')).hide();
    new bootstrap.Modal(document.getElementById('registerModal')).show();
}

function switchToLogin() {
    bootstrap.Modal.getInstance(document.getElementById('registerModal')).hide();
    new bootstrap.Modal(document.getElementById('loginModal')).show();
}

document.addEventListener("DOMContentLoaded", renderAccountDropdown);
