// Utility: Check if user is logged in
function isLoggedIn() {
    return !!localStorage.getItem('customertoken');
}

// Load cart from localStorage or server
async function loadCart() {
    if (isLoggedIn()) {
        // Fetch cart from server
        const res = await fetch('/api/cartapi', {
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('customertoken') }
        });
        if (res.ok) {
            cart = await res.json();
        } else {
            cart = [];
        }
    } else {
        cart = JSON.parse(localStorage.getItem('cart') || '[]');
    }
    updateCartBadge();
}

// Remove from cart
async function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    await saveCart();
    updateCartModal();
    updateCartBadge();
    showToast('Đã xóa món khỏi giỏ hàng');
}

// Update quantity
async function updateCartItemQuantity(id, change) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += change;
        if (item.quantity < 1) item.quantity = 1;
        await saveCart();
        updateCartModal();
        updateCartBadge();
    }
}

// Set quantity
async function setCartItemQuantity(id, quantity) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity = Math.max(1, quantity);
        await saveCart();
        updateCartModal();
        updateCartBadge();
    }
}

// Cart badge
function updateCartBadge() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartBadge').textContent = totalItems;
}

// Cart modal
function openCartModal() {
    updateCartModal();
   // new bootstrap.Modal(document.getElementById('cartModal')).show();
}

// Cart modal content
function updateCartModal() {
    const cartItems = document.getElementById('cartItems');
    const emptyCartMessage = document.getElementById('emptyCartMessage');
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartTotal = document.getElementById('cartTotal');

    cartItems.innerHTML = '';

    if (cart.length === 0) {
        emptyCartMessage.style.display = 'block';
        cartItemsContainer.style.display = 'none';
        document.getElementById('checkoutButton').disabled = true;
    } else {
        emptyCartMessage.style.display = 'none';
        cartItemsContainer.style.display = 'block';
        document.getElementById('checkoutButton').disabled = false;

        let total = 0;

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            const tr = document.createElement('tr');
            tr.innerHTML = `
        <td>
          <div class="d-flex align-items-center me-5">
            <img src="${item.photo}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
            <span class="ms-3">${item.name}</span>
          </div>
        </td>
        <td>${formatPrice(item.price)}</td>
        <td>
          <div class="input-group quantity-control">
            <button class="btn btn-outline-secondary decrease-quantity" type="button" data-id="${item.id}">-</button>
            <input type="number" class="form-control text-center" value="${item.quantity}" min="1" data-id="${item.id}">
            <button class="btn btn-outline-secondary increase-quantity" type="button" data-id="${item.id}">+</button>
          </div>
        </td>
        <td>${formatPrice(itemTotal)}</td>
        <td><button class="btn btn-outline-danger remove-item" data-id="${item.id}"><i class="fas fa-trash"></i></button></td>
      `;
            cartItems.appendChild(tr);
        });

        cartTotal.textContent = formatPrice(total);

        // Thêm sự kiện cho các nút trong giỏ hàng
        document.querySelectorAll('.decrease-quantity').forEach(btn => {
            btn.addEventListener('click', function () {
                const id = parseInt(this.getAttribute('data-id'));
                updateCartItemQuantity(id, -1);
            });
        });

        document.querySelectorAll('.increase-quantity').forEach(btn => {
            btn.addEventListener('click', function () {
                const id = parseInt(this.getAttribute('data-id'));
                updateCartItemQuantity(id, 1);
            });
        });

        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', function () {
                const id = parseInt(this.getAttribute('data-id'));
                removeFromCart(id);
            });
        });

        document.querySelectorAll('.quantity-control input').forEach(input => {
            input.addEventListener('change', function () {
                const id = parseInt(this.getAttribute('data-id'));
                const newQuantity = parseInt(this.value) || 1;
                setCartItemQuantity(id, newQuantity);
            });
        });
    }
}

function showToast(message) {
    // Tạo toast element nếu chưa có
    if (!document.getElementById('toast')) {
        const toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast align-items-center text-white bg-success position-fixed bottom-0 end-0 m-3';
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    `;
        document.body.appendChild(toast);
    } else {
        document.querySelector('#toast .toast-body').textContent = message;
    }

    // Hiển thị toast
    const toast = new bootstrap.Toast(document.getElementById('toast'));
    toast.show();
}

// On page load
let cart = [];
document.addEventListener('DOMContentLoaded', async function () {
    await loadCart();
    document.getElementById('cartButton').addEventListener('click', openCartModal);
});