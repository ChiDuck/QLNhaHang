const token = localStorage.getItem("token");
if (!token) {
    window.location.href = "/Home/Index"; // hoặc modal đăng nhập
}

document.addEventListener("DOMContentLoaded", () => {
    loadUserInfo();
    loadReservationHistory();
    loadOrderHistory();
});

function showSection(id) {
    document.querySelectorAll(".profile-section").forEach(sec => sec.classList.add("d-none"));
    document.getElementById(`${id}Section`).classList.remove("d-none");

    document.querySelectorAll("#profileMenu .list-group-item").forEach(btn => btn.classList.remove("active"));
    const index = { info: 0, reservations: 1, orders: 2, changepassword: 3 }[id];
    document.querySelectorAll("#profileMenu .list-group-item")[index].classList.add("active");
}

let originalProfile = {};

async function loadUserInfo() {
    if (!token) return;
    const res = await fetch("/api/customerapi/profile", {
        headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    originalProfile = { ...data };

    document.getElementById("cusName").value = data.name || "";
    document.getElementById("cusEmail").value = data.email || "";
    document.getElementById("cusPhone").value = data.phone || "";
    document.getElementById("cusAddress").value = data.address || "";
    document.getElementById("cusBirthday").value = data.birthday?.split('T')[0] || "";

    document.querySelectorAll("#profileForm input, #profileForm textarea").forEach(input => {
        input.addEventListener("input", detectProfileChange);
    });
}

function detectProfileChange() {
    const changed =
        document.getElementById("cusName").value !== originalProfile.name ||
        document.getElementById("cusEmail").value !== (originalProfile.email || "") ||
        document.getElementById("cusPhone").value !== (originalProfile.phone || "") ||
        document.getElementById("cusAddress").value !== (originalProfile.address || "") ||
        document.getElementById("cusBirthday").value !== (originalProfile.birthday?.split('T')[0] || "");

    document.getElementById("saveProfileBtn").disabled = !changed;
}

document.getElementById("saveProfileBtn").addEventListener("click", async () => {
    const body = {
        name: document.getElementById("cusName").value.trim(),
        email: document.getElementById("cusEmail").value.trim(),
        phone: document.getElementById("cusPhone").value.trim(),
        address: document.getElementById("cusAddress").value.trim(),
        birthday: document.getElementById("cusBirthday").value || null
    };

    const res = await fetch("/api/customerapi/profile", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(body)
    });

    const msg = document.getElementById("profileMsg");

    if (res.ok) {
        msg.className = "text-success";
        msg.textContent = "Cập nhật thông tin thành công.";
        originalProfile = { ...body }; // cập nhật bản gốc
        document.getElementById("saveProfileBtn").disabled = true;
    } else {
        msg.className = "text-danger";
        msg.textContent = "Cập nhật thất bại.";
    }
});

async function loadReservationHistory() {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/customerapi/reservations", {
        headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    console.log(data);
    const div = document.getElementById("reservationList");

    if (!Array.isArray(data) || data.length === 0) {
        div.innerHTML = `<p>Bạn chưa có lịch sử đặt bàn nào.</p>`;
        return;
    }

    div.innerHTML = `<ul class="list-group">` + data.map(r => `
        <li class="list-group-item">
            Bàn: ${r.tableName} | Ngày: ${r.date} | Giờ: ${r.time} | Số người: ${r.partySize}
        </li>
    `).join("") + `</ul>`;
}

async function loadOrderHistory() {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/customerapi/orders", {
        headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    const div = document.getElementById("orderList");

    if (!Array.isArray(data) || data.length === 0) {
        div.innerHTML = `<p>Bạn chưa có lịch sử đơn hàng nào.</p>`;
        return;
    }

    div.innerHTML = `<ul class="list-group">` + data.map(o => `
        <li class="list-group-item">
            Mã đơn: ${o.id} | Ngày: ${o.date} | Giá trị: ${o.total.toLocaleString()} đ | Giao hàng: ${o.isShipping ? 'Có' : 'Tại quán'}
        </li>
    `).join("") + `</ul>`;
}

async function changePassword() {
    const current = document.getElementById('currentPassword').value.trim();
    const newPass = document.getElementById('newPassword').value.trim();
    const confirm = document.getElementById('confirmPassword').value.trim();
    const msg = document.getElementById('passwordMessage');

    msg.textContent = '';
    msg.className = '';

    if (!current || !newPass || !confirm) {
        msg.textContent = "Vui lòng nhập đầy đủ thông tin.";
        msg.className = "text-danger";
        return;
    }

    if (newPass !== confirm) {
        msg.textContent = "Mật khẩu mới không khớp.";
        msg.className = "text-danger";
        return;
    }

    try {
        const res = await fetch('/api/customerapi/changepassword', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ currentPassword: current, newPassword: newPass })
        });

        const result = await res.text();
        if (!res.ok) {
            msg.textContent = result || "Đổi mật khẩu thất bại.";
            msg.className = "text-danger";
        } else {
            msg.textContent = "Đổi mật khẩu thành công!";
            msg.className = "text-success";
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
        }
    } catch {
        msg.textContent = "Lỗi kết nối đến máy chủ.";
        msg.className = "text-danger";
    }
}
