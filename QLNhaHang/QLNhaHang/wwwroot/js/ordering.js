// Khai báo biến toàn cục
let checkoutModal = null;
const DEFAULT_SHIPPING_FEE = 15000;

// Khởi tạo khi trang tải xong
document.addEventListener('DOMContentLoaded', function () {
    checkoutModal = new bootstrap.Modal(document.getElementById('checkoutModal'));

    // Xử lý nút thanh toán trong modal giỏ hàng
    document.getElementById('checkoutButton').addEventListener('click', openCheckoutModal);

    // Xử lý checkbox giao hàng
    document.getElementById('isShipping').addEventListener('change', toggleShippingAddress);

    // Xử lý nút đặt hàng
    document.getElementById('submitShiporderBtn').addEventListener('click', submitShiporder);
});

// Mở modal thanh toán
function openCheckoutModal() {
    if (cart.length === 0) {
        alert('Giỏ hàng của bạn đang trống');
        return;
    }

    updateOrderSummary();
    checkoutModal.show();
}

// Cập nhật thông tin đơn hàng
function updateOrderSummary() {
    const shiporderSummary = document.getElementById('shiporderSummary');
    shiporderSummary.innerHTML = '';

    let subtotal = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        const itemElement = document.createElement('div');
        itemElement.className = 'd-flex justify-content-between mb-2';
        itemElement.innerHTML = `
      <span>${item.name} x ${item.quantity}</span>
      <span>${formatPrice(itemTotal)}</span>
    `;
        shiporderSummary.appendChild(itemElement);
    });

    document.getElementById('subtotal').textContent = formatPrice(subtotal);

    // Tính tổng tiền (tạm tính + phí ship nếu có)
    const isShipping = document.getElementById('isShipping').checked;
    const shippingFee = isShipping ? DEFAULT_SHIPPING_FEE : 0;
    const totalPrice = subtotal + shippingFee;

    document.getElementById('shippingFee').textContent = formatPrice(shippingFee);
    document.getElementById('totalPrice').textContent = formatPrice(totalPrice);
}

// Hiển/ẩn ô địa chỉ giao hàng
function toggleShippingAddress() {
    const isShipping = this.checked;
    const shippingAddressGroup = document.getElementById('shippingAddressGroup');
    const shipAddressInput = document.getElementById('shipAddress');

    if (isShipping) {
        shippingAddressGroup.style.display = 'block';
        shipAddressInput.required = true;
    } else {
        shippingAddressGroup.style.display = 'none';
        shipAddressInput.required = false;
    }

    // Cập nhật lại phí ship và tổng tiền
    updateOrderSummary();
}

// Gửi đơn hàng
function submitShiporder() {
    // Validate form
    const customerName = document.getElementById('customerName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const isShipping = document.getElementById('isShipping').checked;
    const shipAddress = document.getElementById('shipAddress').value.trim();
    const note = document.getElementById('note').value.trim();
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

    if (!customerName) {
        alert('Vui lòng nhập họ tên');
        return;
    }

    if (!phone && !email) {
        alert('Vui lòng nhập số điện thoại hoặc email');
        return;
    }

    if (isShipping && !shipAddress) {
        alert('Vui lòng nhập địa chỉ giao hàng');
        return;
    }

    // Tính toán tổng tiền
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingFee = isShipping ? DEFAULT_SHIPPING_FEE : 0;
    const totalPrice = subtotal + shippingFee;

    // Tạo đối tượng shiporder
    const shiporder = {
        orderdate: new Date().toISOString(),
        customername: customerName,
        phone: phone || null,
        email: email || null,
        isshipping: isShipping,
        shipaddress: isShipping ? shipAddress : null,
        shipfee: isShipping ? DEFAULT_SHIPPING_FEE : null,
        orderprice: totalPrice,
        note: note || null,
        paymentMethod: paymentMethod,
        items: cart.map(item => ({
            dishId: item.id,
            quantity: item.quantity,
            price: item.price
        }))
    };

    // Gửi đơn hàng lên server
    placeShiporder(shiporder);
}

// Gửi đơn hàng lên server
function placeShiporder(shiporder) {
    // Hiển thị loading
    const submitBtn = document.getElementById('submitShiporderBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Đang xử lý...';

    // Gửi request đến API
    fetch('/api/shiporderapi', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(shiporder)
    })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            // Xử lý khi đặt hàng thành công
            alert('Đặt hàng thành công! Mã đơn hàng: ' + data.idShipoder);

            // Reset form và giỏ hàng
            document.getElementById('checkoutForm').reset();
            cart = [];
            updateCartBadge();
            checkoutModal.hide();

            // Có thể chuyển hướng đến trang xác nhận đơn hàng
            // window.location.href = `/shiporder-confirmation?id=${data.idShipoder}`;
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Có lỗi xảy ra khi đặt hàng: ' + error.message);
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Đặt hàng';
        });
}