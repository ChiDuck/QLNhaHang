document.addEventListener('DOMContentLoaded', function () {
    // Khởi tạo modal
    const step1Modal = new bootstrap.Modal('#bookingStep1Modal');
    const step2Modal = new bootstrap.Modal('#bookingStep2Modal');
    const step3Modal = new bootstrap.Modal('#bookingStep3Modal');
    const successModal = new bootstrap.Modal('#bookingSuccessModal');

    // Dữ liệu tạm
    let bookingData = {
        date: null,
        time: null,
        partySize: 2,
        tableTypeId: null,
        tableTypeName: null,
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        note: ''
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
        bookingData.date = today.toISOString().split('T')[0];

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
        bookingData.time = timeSelect.value;

        // Cập nhật số người
        document.getElementById('partySize').value = bookingData.partySize;
    }

    // Sự kiện thay đổi giá trị bước 1
    document.getElementById('bookingDate').addEventListener('change', function () {
        bookingData.date = this.value;
    });

    document.getElementById('bookingTime').addEventListener('change', function () {
        bookingData.time = this.value;
    });

    document.getElementById('partySize').addEventListener('change', function () {
        bookingData.partySize = parseInt(this.value);
    });

    // Chuyển sang bước 2
    document.getElementById('nextToStep2').addEventListener('click', async function () {
        if (!bookingData.date || !bookingData.time) {
            alert('Vui lòng chọn ngày và giờ đặt bàn');
            return;
        }

        // Hiển thị thông tin đã chọn
        document.getElementById('displayPartySize').textContent = bookingData.partySize;
        document.getElementById('displayBookingTime').textContent = `${formatDate(bookingData.date)} - ${bookingData.time}`;

        // Load các bàn có sẵn
        await loadAvailableTableTypes();

        // Chuyển modal
        step1Modal.hide();
        step2Modal.show();
    });

    // Quay lại bước 1
    document.getElementById('backToStep1').addEventListener('click', function () {
        step2Modal.hide();
        step1Modal.show();
    });

    // Load các loại bàn có sẵn
    async function loadAvailableTableTypes() {
        try {
            const response = await fetch(`/api/dinetableapi/available-types?date=${bookingData.date}&time=${bookingData.time}&partySize=${bookingData.partySize}`);
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
        document.getElementById('displaySelectedDate').textContent = formatDate(bookingData.date);
        document.getElementById('displaySelectedTime').textContent = bookingData.time;
        document.getElementById('displaySelectedPartySize').textContent = bookingData.partySize;

        // Chuyển modal
        step2Modal.hide();
        step3Modal.show();
    });

    // Quay lại bước 2
    document.getElementById('backToStep2').addEventListener('click', function () {
        step3Modal.hide();
        step2Modal.show();
    });

    // Xác nhận đặt bàn
    document.getElementById('confirmBooking').addEventListener('click', async function () {
        // Validate
        //if (!bookingData.customerPhone) {
        //    alert('Vui lòng nhập số điện thoại');
        //    return;
        //}

        // Cập nhật thông tin khách hàng
        bookingData.customerName = document.getElementById('customerName').value;
        bookingData.customerPhone = document.getElementById('customerPhone').value;
        bookingData.customerEmail = document.getElementById('customerEmail').value;
        bookingData.note = document.getElementById('bookingNote').value;

        try {
            // Gửi dữ liệu đặt bàn lên server
            const response = await fetch('/api/reservationapi', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    phone: bookingData.customerPhone,
                    email: bookingData.customerEmail,
                    reservationDate: bookingData.date,
                    reservationTime: bookingData.time,
                    partySize: bookingData.partySize,
                    note: bookingData.note,
                    tableTypeId: bookingData.tableTypeId,
                    customerName: bookingData.customerName
                })
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            const result = await response.json();

            // Hiển thị modal thành công
            document.getElementById('bookingCode').textContent = result.reservationCode;
            step3Modal.hide();
            successModal.show();

            // Reset form
            resetBookingData();

        } catch (error) {
            console.error('Error creating reservation:', error);
            alert('Có lỗi khi đặt bàn: ' + error.message);
        }
    });

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
            date: null,
            time: null,
            partySize: 2,
            tableTypeId: null,
            tableTypeName: null,
            customerName: '',
            customerPhone: '',
            customerEmail: '',
            note: ''
        };
    }
});