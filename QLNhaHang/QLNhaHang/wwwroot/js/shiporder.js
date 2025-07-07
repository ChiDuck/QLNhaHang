let currentOrderId = null;

function formatCurrency(n) {
    return n.toLocaleString('vi-VN') + ' đ';
}

async function loadOrders() {
    try {
        const res = await fetch('/api/shiporderapi');
        const data = await res.json();

        const tbody = document.querySelector('#ordersTable tbody');
        tbody.innerHTML = '';

        data.forEach(o => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${o.idShiporder}</td>
                <td>${o.customername}</td>
                <td>${new Date(o.orderdate).toLocaleString('vi-VN')}</td>
                <td>${formatCurrency(o.orderprice)}</td>
                <td>${o.orderstatusName}</td>
                <td><button class="btn btn-sm btn-primary" onclick="showDetail(${o.idShiporder})">Xem</button></td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error("Error loading orders:", err);
    }
}

async function showDetail(id) {
    try {
        const res = await fetch(`/api/shiporderapi/${id}`);
        const data = await res.json();

        document.getElementById('detailId').textContent = data.idShiporder;
        document.getElementById('detailCustomer').textContent = data.customername;
        document.getElementById('detailPhone').textContent = data.phone ?? "(Không có)";
        document.getElementById('detailEmail').textContent = data.email ?? "(Không có)";
        document.getElementById('detailDate').textContent = new Date(data.orderdate).toLocaleString('vi-VN');
        document.getElementById('detailNote').textContent = data.note ?? "(Không có)";
        document.getElementById('detailTotal').textContent = formatCurrency(data.orderprice);
        document.getElementById('detailShipFee').textContent = formatCurrency(data.shipfee ?? 0);
        document.getElementById('detailTransid').textContent = data.transactionid;

        const shippingType = data.isshipping ? "Giao đến địa chỉ" : "Nhận tại nhà hàng";
        document.getElementById('detailShippingType').textContent = shippingType;

        const addressRow = document.getElementById('detailAddressRow');
        if (data.isshipping) {
            addressRow.style.display = "block";
            document.getElementById('detailAddress').textContent = data.shipaddress;
        } else {
            addressRow.style.display = "none";
        }

        const transidRow = document.getElementById('detailTransidRow');
        if (data.transactionid !== null) {
            document.getElementById('detailPaymentMethod').textContent = 'Thanh toán VNPay';
            transidRow.style.display = "block";
        } else {
            document.getElementById('detailPaymentMethod').textContent = 'Bằng tiền mặt';
            transidRow.style.display = "none";
        }

        const list = document.getElementById('detailItems');
        list.innerHTML = '';
        data.items.forEach(i => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between';
            li.innerHTML = `<span>${i.dishName} x${i.quantity}</span><span>${formatCurrency(i.price)}</span>`;
            list.appendChild(li);
        });

        document.getElementById("ingredientList").innerHTML = '';
        let hasInsufficient = false;

        data.ingredients.forEach(i => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between';
            const isEnough = i.sufficient;
            if (!isEnough) hasInsufficient = true;

            li.innerHTML = `
        <span>${i.name}</span>
        <span>${i.required} ${i.unit} / Có: ${i.available} ${i.unit}
        ${isEnough ? '' : '<span class="text-danger ms-2">❌ Thiếu</span>'}</span>
    `;
            document.getElementById("ingredientList").appendChild(li);
        });

        document.getElementById("ingredientWarning").style.display = hasInsufficient ? 'block' : 'none';

        const btnAccept = document.getElementById('btnAccept');
        const btnReject = document.getElementById('btnReject');

        if (data.idOrderstatus === 1) {
            btnAccept.style.display = 'inline-block';
            btnReject.style.display = 'inline-block';
            btnAccept.onclick = () => updateStatus(id, 3);
            btnReject.onclick = () => updateStatus(id, 2);
        } else {
            btnAccept.style.display = 'none';
            btnReject.style.display = 'none';
        }

        new bootstrap.Modal(document.getElementById('orderDetailModal')).show();
    } catch (err) {
        console.error("Error loading order detail:", err);
    }
}


async function updateStatus(id, status) {
    if (status === 3 && document.getElementById("ingredientWarning").style.display === 'block') {
        if (!confirm("⚠️ Nguyên liệu không đủ. Bạn có chắc chắn muốn tiếp tục?")) {
            return;
        }
    }

    try {
        await fetch(`/api/shiporderapi/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(status)
        });

        alert("Cập nhật thành công!");
        bootstrap.Modal.getInstance(document.getElementById('orderDetailModal')).hide();
        await loadOrders();
    } catch (err) {
        console.error("Error updating status:", err);
        alert("Không thể cập nhật đơn hàng.");
    }
}

document.addEventListener("DOMContentLoaded", loadOrders);