let menuData = {
    categories: [],
    dishes: []
};

// Khởi tạo khi trang tải xong
document.addEventListener('DOMContentLoaded', async function () {
    await loadCategoriesFromAPI();
    await loadDishesFromAPI();

    loadCategories();
    loadDishes(1); // Load món ăn của danh mục đầu tiên
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
                // Gọi hàm addToCart từ cart.js (đã là global)
                addToCart(dish);
            });
        }
    });
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