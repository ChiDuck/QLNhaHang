const apiUrl = "/api/reservationapi";
var reservationlist = [];
document.addEventListener('DOMContentLoaded',  loadReservations);

async function loadReservations() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        reservationlist = await response.json();
        renderReservations();
    } catch (error) {
        console.error('Error loading reservations:', error);
        alert('Có lỗi xảy ra khi tải danh sách đặt bàn');
    }
}

function renderReservations() {
    const tableBody = document.querySelector('#reservationsTable tbody');
    tableBody.innerHTML = '';

    reservationlist.forEach(re => {
        const row = document.createElement('tr');
        const bookDate = new Date(re.bookdate);
        const formattedDate = bookDate.toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
        row.innerHTML = `
            <td>${re.idReservation}</td>
            <td>${formattedDate}</td>
            <td>${re.customerName}</td>
            <td>${re.phone ?? ''}</td>
            <td>${re.email ?? ''}</td>
            <td>${re.partysize}</td>
            <td>${re.tableName}</td>
            <td>${formatDate(re.reservationdate)} ${formatTime(re.reservationtime)}</td>
            <td><span class="badge ${getStatusBadgeClass(re.idReservationstatus)}">${re.status}</span></td>
            <td class="text-center">
                <button class="btn btn-sm btn-info view-btn" data-id="${re.idReservation}">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Thêm sự kiện cho nút xem chi tiết
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => showReservationDetail(btn.dataset.id));
    });
}

async function searchReservations() {
    const keyword = document.getElementById("reservationSearchInput").value.trim();
    const tbody = document.getElementById("reservationTableBody");
    tbody.innerHTML = "";

    if (!keyword) return;

    try {
        const res = await fetch(`/api/reservationapi/search?keyword=${encodeURIComponent(keyword)}`);
        const data = await res.json();

        if (!res.ok) {
            alert(data.message || "Lỗi tìm kiếm.");
            return;
        }

        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6">Không tìm thấy đặt bàn nào.</td></tr>`;
            return;
        }
        reservationlist = data; // Cập nhật danh sách đặt bàn
        renderReservations(); 

    } catch (err) {
        console.error("Lỗi khi gọi API:", err);
        alert("Không thể kết nối đến máy chủ.");
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

function formatTime(time) {
    // Kiểm tra nếu time không tồn tại hoặc null/undefined
    if (!time) return '--:--';

    // Nếu time là đối tượng TimeSpan (trường hợp từ C#)
    if (typeof time === 'object' && time.hours !== undefined && time.minutes !== undefined) {
        return `${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}`;
    }

    // Nếu time là chuỗi
    if (typeof time === 'string') {
        // Xử lý chuỗi thời gian (HH:MM:SS hoặc HH:MM)
        const parts = time.split(':');
        return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
    }

    // Trường hợp khác
    return '--:--';
}

function getStatusBadgeClass(status) {
    switch (status) {
        case 1: return 'bg-primary';
        case 2: return 'bg-success';
        case 3: return 'bg-danger';
        case 4: return 'bg-secondary';
        case 5: return 'bg-warning text-dark';
        default: return 'bg-info text-dark';
    }
}

async function showReservationDetail(id) {
    const res = await fetch(`${apiUrl}/${id}`);
    const data = await res.json();

    document.getElementById("res-id").innerText = data.idReservation;
    const bookDate = new Date(data.bookdate);
    const formattedDate = bookDate.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
    document.getElementById("res-bookdate").innerText = formattedDate;
    document.getElementById("res-datetime").innerText = formatDate(data.reservationdate) + ' - ' + formatTime(data.reservationtime);
    document.getElementById("res-party").innerText = data.partysize;
    document.getElementById("res-note").innerText = data.note || "-";
    document.getElementById("res-customer").innerText = data.customerName || "Khách vãng lai";
    document.getElementById("res-phone").innerText = data.phone || "-";
    document.getElementById("res-email").innerText = data.email || "-";
    document.getElementById("res-status").innerText = data.status || "-";
    const formattedprice = data.reservationprice.toLocaleString('vi-VN', {
        style: 'currency',
        currency: 'VND'
    });
    document.getElementById("res-price").innerText = formattedprice;
    document.getElementById("res-transid").innerText = data.transactionid || "-";
    document.getElementById("res-table").innerText = data.tableName || "-";

    const tbody = document.getElementById("res-orders");
    tbody.innerHTML = "";
    console.log(data.orders);
    if (data.orders !== []) {
        document.getElementById("res-order-section").hidden = false;
        data.orders.forEach(order => {
            tbody.innerHTML += `
            <tr>
                <td><img src="${order.dishPhoto}" width="50"/></td>
                <td>${order.dishName}</td>
                <td>${order.quantity}</td>
                <td>${order.total}</td>
            </tr>
        `;
        });
    }

    // Ẩn/Hiện nút theo trạng thái
    const btnAccept = document.getElementById('btnAcceptReservation');
    const btnReject = document.getElementById('btnRejectReservation');

    if (data.status === "Chờ xác nhận") {
        btnAccept.style.display = 'inline-block';
        btnReject.style.display = 'inline-block';
        btnAccept.onclick = () => updateReservationStatus(id, true);
        btnReject.onclick = () => updateReservationStatus(id, false);
    } else {
        btnAccept.style.display = 'none';
        btnReject.style.display = 'none';
    }

    new bootstrap.Modal(document.getElementById("reservationDetailModal")).show();
}

async function updateReservationStatus(id, isAccepted) {
    const status = isAccepted ? 2 : 3;

    const res = await fetch(`/api/reservationapi/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(status)
    });
    const updated = status == 2 ? "Đã chấp nhận" : "Đã từ chối";
    if (res.ok) {
        alert(`Đã cập nhật đơn đặt bàn thành: ${updated}`);
        bootstrap.Modal.getInstance('#reservationDetailModal').hide();
        await loadReservations(); // reload danh sách
    } else {
        alert("Cập nhật trạng thái thất bại.");
    }
}
