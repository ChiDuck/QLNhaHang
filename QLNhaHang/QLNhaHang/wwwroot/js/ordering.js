// Khai báo biến toàn cục
let checkoutModal = null;
const DEFAULT_SHIPPING_FEE = 15000;

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

// Khai báo biến toàn cục

// Khởi tạo khi trang tải xong
document.addEventListener('DOMContentLoaded', function () {
    checkoutModal = new bootstrap.Modal(document.getElementById('checkoutModal'));

    // Xử lý nút thanh toán trong modal giỏ hàng
    document.getElementById('checkoutButton').addEventListener('click', openCheckoutModal);

    // Xử lý checkbox giao hàng
    document.getElementById('isShipping').addEventListener('change', toggleShippingAddress);

    // Xử lý nút đặt hàng
    document.getElementById('submitOrderBtn').addEventListener('click', submitOrder);
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
    const orderSummary = document.getElementById('orderSummary');
    orderSummary.innerHTML = '';

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
        orderSummary.appendChild(itemElement);
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
async function submitOrder() {
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

    // Tạo thông tin đơn hàng
    const orderData = {
        customerName: customerName,
        phone: phone || null,
        email: email || null,
        isShipping: isShipping,
        shipAddress: isShipping ? shipAddress : null,
        note: note || null,
        paymentMethod: paymentMethod,
       // cartId: currentCartId, // Giả sử có biến lưu ID giỏ hàng hiện tại
        items: cart.map(item => ({
            dishId: item.id,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.price * item.quantity
        }))
    };

    // Tính toán tổng tiền
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingFee = isShipping ? DEFAULT_SHIPPING_FEE : 0;
    const totalPrice = subtotal + shippingFee;
    orderData.shipFee = isShipping ? shippingFee : null;
    orderData.orderPrice = totalPrice;

    // Xử lý theo phương thức thanh toán
    if (paymentMethod === 'cash') {
        await createCashOrder(orderData);
    } else if (paymentMethod === 'vnpay') {
        await processVNPayPayment(orderData);
    }
}

// Tạo đơn hàng tiền mặt
async function createCashOrder(orderData) {
    try {
        const response = await fetch('/api/shiporderapi/cash', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const result = await response.json();
        alert('Đặt hàng thành công! Mã đơn hàng: ' + result.shipOrderId);

        // Reset form và giỏ hàng
        checkoutModal.hide();
       // clearCart();
        window.location.href = `/orderconfirmation?id=${result.shipOrderId}`;
    } catch (error) {
        console.error('Error:', error);
        alert('Có lỗi xảy ra khi đặt hàng: ' + error.message);
    }
}

// Xử lý thanh toán VNPay
async function processVNPayPayment(orderData) {
    const submitBtn = document.getElementById('submitOrderBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Đang kết nối VNPay...';

    try {
        // Gọi API để tạo yêu cầu thanh toán VNPay
        const response = await fetch('/api/shiporderapi/vnpay', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        if (!response.ok) throw new Error('Không thể kết nối VNPay');

        const paymentData = await response.json();
        console.log('Payment data:', paymentData);

        if (paymentData.paymentUrl) {
            // Lưu thông tin đơn hàng tạm thời
            sessionStorage.setItem('pendingShipOrder', JSON.stringify(orderData));
            // Chuyển hướng đến VNPay
            window.location.href = paymentData.paymentUrl;
        } else {
            throw new Error('Không nhận được link thanh toán từ VNPay');
        }
    } catch (error) {
        console.error('Payment error:', error);
        alert('Có lỗi xảy ra: ' + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Đặt hàng';
    }
}



// Hàm định dạng giá
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}