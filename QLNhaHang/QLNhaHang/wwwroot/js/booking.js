document.addEventListener('DOMContentLoaded', function () {
    // Khởi tạo modal
    const step1Modal = new bootstrap.Modal('#bookingStep1Modal');
    const step2Modal = new bootstrap.Modal('#bookingStep2Modal');
    const step3Modal = new bootstrap.Modal('#bookingStep3Modal');
    const successModal = new bootstrap.Modal('#bookingSuccessModal');
    // Lấy tham chiếu đến modal
    const dishModal = new bootstrap.Modal('#dishModal');

    // Gắn sự kiện cho các nút
    document.getElementById('skipDishesBtn').addEventListener('click', skipDishSelection);
    document.getElementById('confirmDishesBtn').addEventListener('click', confirmDishSelection);

    // Nếu có nút nào đó mở modal chọn món
    // document.getElementById('openDishModalBtn').addEventListener('click', openDishSelectionModal);

    // Dữ liệu tạm
    let bookingData = {
        reservationDate: null,
        reservationTime: null,
        partySize: 2,
        tableTypeId: null,
        tableTypeName: null,
        customerName: '',
        phone: '',
        email: '',
        note: '',
        reservationPrice: 0,
        selectedDishes: []
    };

    // Bước 1: Mở modal đầu tiên khi click "Đặt bàn ngay"
    document.querySelectorAll('.book-now-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            initBookingStep1();
            step1Modal.show();
        });
    });

    // Khởi tạo bước 1
    function initBookingStep1() {
        // Đặt ngày mặc định là hôm nay
        const today = new Date();
        document.getElementById('bookingDate').valueAsDate = today;
        bookingData.reservationDate = today.toISOString().split('T')[0];

        // Điền options giờ (cách nhau 30 phút)
        const timeSelect = document.getElementById('bookingTime');
        timeSelect.innerHTML = '';

        const openingHour = 10; // 10:00 AM
        const closingHour = 22; // 10:00 PM

        for (let hour = openingHour; hour < closingHour; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                const option = document.createElement('option');
                option.value = timeString;
                option.textContent = timeString;
                timeSelect.appendChild(option);
            }
        }

        // Đặt giờ mặc định là giờ tiếp theo tròn 30 phút
        const nextHalfHour = new Date();
        nextHalfHour.setMinutes(nextHalfHour.getMinutes() < 30 ? 30 : 60, 0, 0);
        timeSelect.value = `${nextHalfHour.getHours().toString().padStart(2, '0')}:${nextHalfHour.getMinutes().toString().padStart(2, '0')}`;
        bookingData.reservationTime = timeSelect.value;

        // Cập nhật số người
        document.getElementById('partySize').value = bookingData.partySize;
    }

    // Sự kiện thay đổi giá trị bước 1
    document.getElementById('bookingDate').addEventListener('change', function () {
        bookingData.reservationDate = this.value;
    });

    document.getElementById('bookingTime').addEventListener('change', function () {
        bookingData.reservationTime = this.value;
    });

    document.getElementById('partySize').addEventListener('change', function () {
        bookingData.partySize = parseInt(this.value);
    });

    // Chuyển sang bước 2
    document.getElementById('nextToStep2').addEventListener('click', async function () {
        if (!bookingData.reservationDate || !bookingData.reservationTime) {
            alert('Vui lòng chọn ngày và giờ đặt bàn');
            return;
        }

        // Hiển thị thông tin đã chọn
        document.getElementById('displayPartySize').textContent = bookingData.partySize;
        document.getElementById('displayBookingTime').textContent = `${formatDate(bookingData.reservationDate)} - ${bookingData.reservationTime}`;

        // Load các bàn có sẵn
        await loadAvailableTableTypes();

        // Chuyển modal
        step1Modal.hide();
        //b.show();

        openDishSelectionModal();
    });

    // Quay lại bước 1
    document.getElementById('backToStep1').addEventListener('click', function () {
        dishModal.hide();
        step1Modal.show();
    });

    // Load các loại bàn có sẵn
    async function loadAvailableTableTypes() {
        try {
            const response = await fetch(`/api/dinetableapi/available-types?date=${bookingData.reservationDate}&time=${bookingData.reservationTime}&partySize=${bookingData.partySize}`);
            const availableTableTypes = await response.json();

            const container = document.getElementById('availableTableTypesContainer');
            container.innerHTML = '';

            if (availableTableTypes.length === 0) {
                container.innerHTML = `
                <div class="alert alert-warning">
                    Không có loại bàn trống phù hợp. Vui lòng thử ngày/giờ khác hoặc giảm số lượng người.
                </div>
            `;
                document.getElementById('nextToStep3').disabled = true;
                return;
            }

            // Tạo các card loại bàn có sẵn
            availableTableTypes.forEach(tableType => {
                const cardElement = document.createElement('div');
                cardElement.className = 'card mb-3 table-type-card';
                cardElement.innerHTML = `
                <div class="card-body">
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="availableTableType" 
                               id="table-type-${tableType.id}" value="${tableType.id}"
                               data-table-type-name="${tableType.name}">
                        <label class="form-check-label" for="table-type-${tableType.id}">
                            <h5 class="mb-1">${tableType.name}</h5>
                            <p class="mb-1">${tableType.capacity} người</p>
                            <p class="mb-1 text-success">Còn ${tableType.availableCount} bàn trống</p>
                        </label>
                    </div>
                </div>
            `;
                container.appendChild(cardElement);
            });

            // Thêm sự kiện chọn loại bàn
            document.querySelectorAll('input[name="availableTableType"]').forEach(radio => {
                radio.addEventListener('change', function () {
                    if (this.checked) {
                        bookingData.tableTypeId = this.value;
                        bookingData.tableTypeName = this.dataset.tableTypeName;
                        document.getElementById('nextToStep3').disabled = false;
                    }
                });
            });

        } catch (error) {
            console.error('Error loading available table types:', error);
            alert('Có lỗi khi tải danh sách loại bàn trống');
        }
    }

    // Chuyển sang bước 3
    document.getElementById('nextToStep3').addEventListener('click', function () {
        if (!bookingData.tableTypeId) {
            alert('Vui lòng chọn bàn');
            return;
        }

        // Hiển thị thông tin đã chọn
        document.getElementById('displaySelectedTable').textContent = bookingData.tableTypeName;
        document.getElementById('displaySelectedDate').textContent = formatDate(bookingData.reservationDate);
        document.getElementById('displaySelectedTime').textContent = bookingData.reservationTime;
        document.getElementById('displaySelectedPartySize').textContent = bookingData.partySize;

        // Chuyển modal
        step2Modal.hide();
        renderSelectedDishesSummary();
        step3Modal.show();
    });

    // Quay lại bước 2
    document.getElementById('backToStep2').addEventListener('click', function () {
        step3Modal.hide();
        step2Modal.show();
    });

    // Quay lại bước 2
    document.getElementById('backToStepDish').addEventListener('click', function () {
        step2Modal.hide();
        dishModal.show();
    });

    // Xác nhận đặt bàn
    document.getElementById("confirmBooking").addEventListener("click", async function () {
        const customerName = document.getElementById("customerName").value;
        const customerPhone = document.getElementById("customerPhone").value;
        const customerEmail = document.getElementById("customerEmail").value;
        const bookingNote = document.getElementById("bookingNote").value;
        const paymentMethod = window.selectedDishesData === [] ? '' : 'vnpay';
        console.log("Payment method:", paymentMethod);
        bookingData.customerName = customerName;
        bookingData.phone = customerPhone;
        bookingData.email = customerEmail;
        bookingData.note = bookingNote;
        bookingData.selectedDishes = window.selectedDishesData || [];
        console.log("Booking data:", bookingData);

        if (paymentMethod === '') {
            await createReservation(bookingData);
        } else if (paymentMethod === 'vnpay') {
            await createVNPayReservation(bookingData);
        }
    });

    async function createReservation(data) {
        try {
            const response = await fetch("/api/reservationapi/noorder", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                alert("Đặt bàn thành công!");
                const result = await response.json();

                // Hiển thị modal thành công
                document.getElementById('bookingCode').textContent = result.reservationId;
                step3Modal.hide();
                successModal.show();

                // Reset form
                resetBookingData();
            } else {
                alert("Có lỗi khi đặt bàn.");
            }
        } catch (err) {
            console.error("Booking error:", err);
            alert("Lỗi khi gửi yêu cầu.");
        }
    }

    async function createVNPayReservation(data) {
        try {
            const response = await fetch("/api/reservationapi/vnpay", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });
            if (response.ok) {
                const paymentData = await response.json();
                window.location.href = paymentData.paymentUrl; // Chuyển hướng đến VNPay
            } else {
                alert("Có lỗi khi tạo đơn hàng VNPay.");
            }
        } catch (err) {
            console.error("VNPay booking error:", err);
            alert("Lỗi khi gửi yêu cầu VNPay.");
        }
    }

    // Hàm hỗ trợ
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    function resetBookingData() {
        bookingData = {
            reservationDate: null,
            reservationTime: null,
            partySize: 2,
            tableTypeId: null,
            tableTypeName: null,
            customerName: '',
            phone: '',
            email: '',
            note: '',
            selectedDishes: []
        };
    }

    // Biến toàn cục
    let availableDishes = [];
    let selectedDishes = {};

    // Hàm mở modal chọn món
    function openDishSelectionModal() {
        fetchAvailableDishes()
            .then(() => {
                renderDishList();
                dishModal.show();
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Có lỗi khi tải danh sách món ăn');
            });
    }

    // Lấy danh sách món ăn từ server
    function fetchAvailableDishes() {
        return fetch('/api/dishapi/available')
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(dishes => {
                availableDishes = dishes;
                // Khởi tạo selectedDishes với quantity = 0
                selectedDishes = {};
                dishes.forEach(dish => {
                    selectedDishes[dish.idDish] = 0;
                });
            });
    }

    // Hiển thị danh sách món ăn
    function renderDishList() {
        const dishListElement = document.getElementById('dishList');
        dishListElement.innerHTML = '';

        availableDishes.forEach(dish => {
            const dishElement = document.createElement('div');
            dishElement.className = 'card mb-3 dish-item';
            dishElement.innerHTML = `
      <div class="row g-0">
        <div class="col-md-4">
          <img src="${dish.photo || 'default-dish.jpg'}" class="img-fluid rounded-start" alt="${dish.name}">
        </div>
        <div class="col-md-8">
          <div class="card-body">
            <h5 class="card-title">${dish.name}</h5>
            <p class="card-text">${dish.description || ''}</p>
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <span class="text-danger fw-bold">${formatPrice(dish.price - dish.price * dish.discount / 100)}</span>
                ${dish.discount ? `<span class="text-decoration-line-through ms-2 text-muted">${formatPrice(dish.price)}</span>` : ''}
              </div>
              <div class="input-group" style="width: 120px;">
                <button class="btn btn-outline-secondary decrease-btn" type="button" data-dish-id="${dish.idDish}">-</button>
                <input type="number" class="form-control text-center dish-quantity" 
                       data-dish-id="${dish.idDish}" value="${selectedDishes[dish.idDish]}" min="0">
                <button class="btn btn-outline-secondary increase-btn" type="button" data-dish-id="${dish.idDish}">+</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

            dishListElement.appendChild(dishElement);
        });

        // Gắn sự kiện cho các nút +/-
        document.querySelectorAll('.increase-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const dishId = parseInt(this.getAttribute('data-dish-id'));
                increaseQuantity(dishId);
            });
        });

        document.querySelectorAll('.decrease-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const dishId = parseInt(this.getAttribute('data-dish-id'));
                decreaseQuantity(dishId);
            });
        });

        // Gắn sự kiện thay đổi số lượng trực tiếp
        document.querySelectorAll('.dish-quantity').forEach(input => {
            input.addEventListener('change', function () {
                const dishId = parseInt(this.getAttribute('data-dish-id'));
                const quantity = parseInt(this.value) || 0;
                updateQuantity(dishId, quantity);
            });
        });

        // Cập nhật danh sách món đã chọn
        updateSelectedDishesList();
    }

    // Các hàm xử lý số lượng
    function increaseQuantity(dishId) {
        selectedDishes[dishId]++;
        updateQuantityInput(dishId);
        updateSelectedDishesList();
    }

    function decreaseQuantity(dishId) {
        if (selectedDishes[dishId] > 0) {
            selectedDishes[dishId]--;
            updateQuantityInput(dishId);
            updateSelectedDishesList();
        }
    }

    function updateQuantity(dishId, quantity) {
        selectedDishes[dishId] = Math.max(0, quantity);
        updateSelectedDishesList();
    }

    function updateQuantityInput(dishId) {
        const input = document.querySelector(`.dish-quantity[data-dish-id="${dishId}"]`);
        if (input) {
            input.value = selectedDishes[dishId];
        }
    }

    function removeDish(dishId) {
        selectedDishes[dishId] = 0;
        updateQuantityInput(dishId);
        updateSelectedDishesList();
    }

    function calculateTotalPrice() {
        return getSelectedDishes().reduce((sum, item) => {
            return sum + (item.price - item.price * item.discount / 100) * selectedDishes[item.idDish];
        }, 0);
    }

    // Cập nhật danh sách món đã chọn
    function updateSelectedDishesList() {
        const selectedDishesList = document.getElementById('selectedDishesList');
        const noDishesSelected = document.getElementById('noDishesSelected');
        const selectedItems = getSelectedDishes();
        const totalDisplay = document.getElementById('selectedDishesTotal');

        // Ẩn/hiện nút xác nhận và bỏ qua
        updateDishSelectionButtons(selectedItems.length > 0);

        if (selectedItems.length > 0) {
            noDishesSelected.style.display = 'none';
            selectedDishesList.style.display = 'block';

            // Cập nhật danh sách
            selectedDishesList.innerHTML = '';
            selectedItems.forEach(item => {
                const li = document.createElement('li');
                li.className = 'list-group-item d-flex justify-content-between align-items-center';
                li.innerHTML = `
                <div class="flex-grow-1">
                    ${item.name} 
                    <span class="badge bg-primary rounded-pill ms-2">${selectedDishes[item.idDish]}</span>
                </div>
                    <span class="ms-2 text-success">${formatPrice((item.price - item.price * item.discount / 100) * selectedDishes[item.idDish])}</span>
            `;
                const button = document.createElement('button');
                button.className = 'btn btn-sm btn-outline-danger ms-2';
                button.innerHTML = '<i class="fas fa-trash"></i>';
                button.addEventListener('click', () => removeDish(item.idDish));
                li.appendChild(button);

                selectedDishesList.appendChild(li);
            });
            totalDisplay.textContent = `Tổng: ${formatPrice(calculateTotalPrice())}`;
            totalDisplay.style.display = 'block';
        } else {
            noDishesSelected.style.display = 'block';
            selectedDishesList.style.display = 'none';
            totalDisplay.style.display = 'none';
        }
    }

    // Hàm ẩn/hiện nút xác nhận và bỏ qua
    function updateDishSelectionButtons(hasSelected) {
        const confirmBtn = document.getElementById('confirmDishesBtn');
        const skipBtn = document.getElementById('skipDishesBtn');
        if (hasSelected) {
            confirmBtn.style.display = '';
            skipBtn.style.display = 'none';
        } else {
            confirmBtn.style.display = 'none';
            skipBtn.style.display = '';
        }
    }

    // Lấy danh sách món đã chọn (quantity > 0)
    function getSelectedDishes() {
        return availableDishes.filter(dish => selectedDishes[dish.idDish] > 0);
    }

    // Bỏ qua bước chọn món
    function skipDishSelection() {
        dishModal.hide();
        step2Modal.show(); // Tiếp bước 2 mà không chọn món
    }

    // Xác nhận chọn món
    function confirmDishSelection() {
        saveSelectedDishes();
        dishModal.hide();
        step2Modal.show(); // Tiếp bước 2 sau khi chọn món
    }

    // Lưu món đã chọn (có thể lưu vào biến global hoặc form)
    function saveSelectedDishes() {
        const selectedItems = getSelectedDishes().map(dish => ({
            idDish: dish.idDish,
            name: dish.name,
            quantity: selectedDishes[dish.idDish],
            price: dish.price - dish.price * dish.discount / 100,
            total: (dish.price - dish.price * dish.discount / 100) * selectedDishes[dish.idDish]
        }));

        // Lưu vào biến global hoặc form ẩn
        window.selectedDishesData = selectedItems;

        //// Hoặc thêm vào form đặt bàn
        //const form = document.getElementById('reservationForm');
        //const dishesInput = document.createElement('input');
        //dishesInput.type = 'hidden';
        //dishesInput.name = 'selectedDishes';
        //dishesInput.value = JSON.stringify(selectedItems);
        //form.appendChild(dishesInput);
    }

    // Hàm định dạng giá
    function formatPrice(price) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    }

    function renderSelectedDishesSummary() {
        const summaryList = document.getElementById("selectedDishesSummary");
        const totalElement = document.getElementById("selectedDishesSummaryTotal");

        const selectedItems = getSelectedDishes();
        summaryList.innerHTML = "";

        if (selectedItems.length === 0) {
            summaryList.innerHTML = "<li class='list-group-item'>Không có món nào được chọn</li>";
            totalElement.textContent = "";
            return;
        }

        let total = 0;

        selectedItems.forEach(item => {
            const quantity = selectedDishes[item.idDish];
            const subtotal = quantity * (item.price - item.price * item.discount / 100);
            total += subtotal;

            const li = document.createElement("li");
            li.className = "list-group-item d-flex justify-content-between align-items-center";
            li.innerHTML = `
			<span>${item.name} x${quantity}</span>
			<span>${formatPrice(subtotal)}</span>
		`;
            summaryList.appendChild(li);
        });

        bookingData.reservationPrice = total; // Cập nhật giá đặt bàn

        totalElement.textContent = `Tổng cộng: ${formatPrice(total)}`;
    }

});
