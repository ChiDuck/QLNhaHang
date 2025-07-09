let menuData = {
    categories: [],
    dishes: []
}

// Giỏ hàng
let cart = [];

// Khởi tạo khi trang tải xong
document.addEventListener('DOMContentLoaded', async function () {
    await loadCategoriesFromAPI();
    await loadDishesFromAPI();

    loadCategories();
    loadDishes(1); // Load món ăn của danh mục đầu tiên

    // Xử lý sự kiện nút giỏ hàng
    document.getElementById('cartButton').addEventListener('click', openCartModal);

    // Xử lý sự kiện nút thanh toán
    document.getElementById('checkoutButton').addEventListener('click', checkout);
});

// Load danh mục
function loadCategories() {

    const categoryTabs = document.getElementById('categoryTabs');

    menuData.categories.forEach(category => {
        const li = document.createElement('li');
        li.className = 'nav-item';
        li.innerHTML = `
      <button class="nav-link" data-category-id="${category.idDishcategory}">${category.name}</button>
    `;
        categoryTabs.appendChild(li);

        // Thêm sự kiện click
        li.querySelector('button').addEventListener('click', function () {
            // Xóa active class từ tất cả các tab
            document.querySelectorAll('#categoryTabs .nav-link').forEach(tab => {
                tab.classList.remove('active');
            });

            // Thêm active class cho tab được chọn
            this.classList.add('active');

            // Load món ăn của danh mục này
            loadDishes(category.idDishcategory);
        });
    });

    // Kích hoạt tab đầu tiên
    if (categoryTabs.firstChild) {
        categoryTabs.firstElementChild.querySelector('button').classList.add('active');
    }
}

// Load món ăn theo danh mục
function loadDishes(idDishcategory) {

    const dishList = document.getElementById('dishList');
    dishList.innerHTML = '';

    const filteredDishes = menuData.dishes.filter(dish => dish.idDishcategory === idDishcategory);

    if (filteredDishes.length === 0) {
        dishList.innerHTML = '<div class="col-12 text-center py-5"><p>Không có món nào trong danh mục này</p></div>';
        return;
    }

    filteredDishes.forEach(dish => {
        const dishCard = document.createElement('div');
        dishCard.className = 'col';
        dishCard.innerHTML = `
      <div class="card h-100 dish-card ${dish.issoldout ? 'opacity-75' : ''}">
        ${dish.issoldout ? '<span class="badge badge-out-of-stock text-white">HẾT MÓN</span>' : ''}
        <img src="${dish.photo}" class="card-img-top dish-img" alt="${dish.name}">
        <div class="card-body">
          <h5 class="card-title">${dish.name}</h5>
          <p class="card-text text-muted">${dish.description}</p>
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <span class="dish-price">${formatPrice((dish.price - dish.price * dish.discount / 100) || dish.price)}</span>
              ${dish.discount ? `<span class="dish-discount ms-2">${formatPrice(dish.price)}</span>` : ''}
            </div>
            ${dish.issoldout ?
                '<button class="btn btn-outline-secondary" disabled>Hết món</button>' :
                '<button class="btn btn-outline-primary add-to-cart-btn">Thêm vào giỏ</button>'
            }
          </div>
        </div>
      </div>
    `;

        dishList.appendChild(dishCard);

        // Thêm sự kiện click nếu món còn hàng
        if (!dish.issoldout) {
            dishCard.querySelector('.add-to-cart-btn').addEventListener('click', () => {
                addToCart(dish);
            });
        }
    });
}

// Thêm vào giỏ hàng
function addToCart(dish) {
    // Kiểm tra xem món đã có trong giỏ chưa
    const existingItem = cart.find(item => item.id === dish.idDish);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: dish.idDish,
            name: dish.name,
            price: (dish.price - dish.price * dish.discount / 100) || dish.price,
            quantity: 1,
            photo: dish.photo
        });
    }

    updateCartBadge();
    showToast(`${dish.name} đã được thêm vào giỏ hàng`);
}

// Mở modal giỏ hàng
function openCartModal() {
    const cartModal = new bootstrap.Modal(document.getElementById('cartModal'));
    updateCartModal();
    cartModal.show();
}

// Cập nhật nội dung modal giỏ hàng
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
          <div class="d-flex align-items-center">
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

// Cập nhật số lượng món trong giỏ
function updateCartItemQuantity(id, change) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += change;
        if (item.quantity < 1) item.quantity = 1;
        updateCartModal();
        updateCartBadge();
    }
}

// Đặt số lượng cụ thể cho món trong giỏ
function setCartItemQuantity(id, quantity) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity = Math.max(1, quantity);
        updateCartModal();
        updateCartBadge();
    }
}

// Xóa món khỏi giỏ
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartModal();
    updateCartBadge();
    showToast('Đã xóa món khỏi giỏ hàng');
}

// Cập nhật badge số lượng trên nút giỏ hàng
function updateCartBadge() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartBadge').textContent = totalItems;
}

// Thanh toán
function checkout() {
    if (cart.length === 0) return;

    // Lưu giỏ hàng vào localStorage hoặc gửi lên server
    localStorage.setItem('cart', JSON.stringify(cart));

    // Chuyển đến trang thanh toán
    //alert('Chuyển đến trang thanh toán');
    // window.location.href = '/checkout';
}

// Hiển thị thông báo
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

// Định dạng giá tiền
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

async function loadCategoriesFromAPI() {
    try {
        const response = await fetch('/api/dishcategoryapi');
        if (!response.ok) throw new Error('Network response was not ok');
        menuData.categories = await response.json();
        return;
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

async function loadDishesFromAPI() {
    try {
        const response = await fetch(`/api/dishapi`);
        if (!response.ok) throw new Error('Network response was not ok');
        menuData.dishes = await response.json();
    } catch (error) {
        console.error('Error loading dishes:', error);
    }
}

async function checkoutToAPI() {
    try {
        const response = await fetch('/api/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ items: cart })
        });

        if (!response.ok) throw new Error('Checkout failed');

        const result = await response.json();
        alert('Đặt hàng thành công! Mã đơn hàng: ' + result.orderId);
        cart = [];
        updateCartBadge();
    } catch (error) {
        console.error('Checkout error:', error);
        alert('Có lỗi xảy ra khi đặt hàng');
    }
}