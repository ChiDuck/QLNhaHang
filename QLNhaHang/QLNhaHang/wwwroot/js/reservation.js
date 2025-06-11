const apiUrl = "/api/reservationapi";

document.addEventListener('DOMContentLoaded', function () {
    loadReservations();
});

async function loadReservations() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const reservations = await response.json();
        renderReservations(reservations);
    } catch (error) {
        console.error('Error loading reservations:', error);
        alert('Có lỗi xảy ra khi tải danh sách đặt bàn');
    }
}

function renderReservations(reservations) {
    const tableBody = document.querySelector('#reservationsTable tbody');
    tableBody.innerHTML = '';

    reservations.forEach(reservation => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${reservation.idReservation}</td>
            <td>${formatDate(reservation.reservationdate)} ${formatTime(reservation.reservationtime)}</td>
            <td>${reservation.customerName}</td>
            <td>${reservation.phone}</td>
            <td>${reservation.email}</td>
            <td>${reservation.partysize}</td>
            <td>${reservation.tableName}</td>
            <td><span class="badge ${getStatusBadgeClass(reservation.idReservationstatus)}">${reservation.status}</span></td>
            <td>
                <button class="btn btn-sm btn-info view-btn" data-id="${reservation.idReservation}">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Thêm sự kiện cho nút xem chi tiết
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => showReservationDetails(btn.dataset.id));
    });

    // Thêm sự kiện cho nút xóa
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => confirmDeleteReservation(btn.dataset.id));
    });
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

async function showReservationDetails(reservationId) {
    try {
        const response = await fetch(`${apiUrl}/${reservationId}`);
        if (!response.ok) throw new Error('Failed to load reservation details');

        const reservation = await response.json();
        // Hiển thị modal chi tiết (có thể triển khai thêm)
        console.log('Reservation details:', reservation);
        alert(`Chi tiết đặt bàn #${reservation.idReservation}\n${reservation.tableName}\nKhách: ${reservation.customerName || 'Khách vãng lai'}`);
    } catch (error) {
        console.error('Error loading reservation details:', error);
        alert('Có lỗi khi tải chi tiết đặt bàn');
    }
}