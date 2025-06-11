const apiUrl = "/api/dishapi";

async function getAllDishes() {
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error("Lỗi khi tải danh sách món ăn");
    return await res.json();
}

async function loadDishes() {
    const dishes = await getAllDishes();
    const tableBody = document.getElementById("dishTableBody");
    tableBody.innerHTML = ""; // clear

    dishes.forEach(d => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${d.idDish}</td>
            <td>${d.name}</td>
            <td>${d.price.toLocaleString()} đ</td>
            <td>${d.discount ? d.discount + "%" : ""}</td>
            <td>${d.issoldout ? "✔️" : ""}</td>
            <td>${d.dishcategoryName ?? ""}</td>
            <td>${d.photo ? `<img src="${d.photo}" width="120">` : ""}</td>
            <td class="text-center">
                <button class="btn btn-sm btn-info view-btn" onclick="showDishDetail(${d.idDish})">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

window.onload = loadDishes;

async function deleteDish(id) {
    if (!confirm("Bạn có chắc muốn xóa món ăn này không?")) return;

    const res = await fetch(`${apiUrl}/${id}`, { method: "DELETE" });
    if (res.ok) {
        alert("Đã xóa món ăn.");
        const modal = bootstrap.Modal.getInstance(document.getElementById('dishDetailModal'));
        modal.hide();
        loadDishes(); // Hàm reload danh sách
    } else {
        const err = await res.text();
        alert("Không thể xóa: " + err);
    }
}

async function showDishDetail(idDish) {
    const res = await fetch(`/Dish/DetailsPartial/${idDish}`);
    const html = await res.text();

    document.getElementById("dishDetailContent").innerHTML = html;

    const modal = new bootstrap.Modal(document.getElementById("dishDetailModal"));
    modal.show();
}

async function openAddDishModal() {
    // Lấy partial với IdDish = 0 (hoặc route riêng)
    const html = await fetch("/Dish/EditPartial/0").then(r => r.text());
    document.getElementById("editDishModalContent").innerHTML = html;
    new bootstrap.Modal('#editDishModal').show();
    loadDishCategories();
}

async function openEditDishModal(id) {
    const html = await fetch(`/Dish/EditPartial/${id}`).then(r => r.text());

    const res = await fetch(`${apiUrl}/${id}`);
    const item = await res.json();
    // Ẩn modal chi tiết
    const detailModal = bootstrap.Modal.getInstance(document.getElementById("dishDetailModal"));
    detailModal.hide();

    // Hiển thị modal sửa
    document.getElementById("editDishModalContent").innerHTML = html;
    new bootstrap.Modal("#editDishModal").show();
    await loadDishCategories(item.idDishcategory);
}

async function loadDishCategories(selectedId = null) {
    const res = await fetch("/api/dishcategoryapi");
    const categories = await res.json();
    const select = document.getElementById("editDishCategory");

    select.innerHTML = ""; // clear cũ
    categories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat.idDishcategory;
        option.textContent = cat.name;
        if (selectedId && selectedId === cat.idDishcategory) {
            option.selected = true;
        }
        select.appendChild(option);
    });
}

async function submitDish() {
    await uploadDishPhotoAndGetPath();
    var valName = document.getElementById("validateName");
    var valPrice = document.getElementById("validatePrice");
    var valDiscount = document.getElementById("validateDiscount");
    var valIngr = document.getElementById("validateIngredients");

    const form = document.getElementById("editDishForm");
    const formData = new FormData(form);

    if (formData.get("Name") === "") {
        valName.hidden = false;
        return;
    } else valName.hidden = true;

    if (formData.get("Price") === "") {
        valPrice.innerHTML = "Giá không được để trống!";
        valPrice.hidden = false;
        return;
    } else valPrice.hidden = true;

    if (parseFloat(formData.get("Price")) <= 0) {
        valPrice.innerHTML = "Giá phải có giá trị dương!";
        valPrice.hidden = false;
        return;
    } else valPrice.hidden = true;

    if (formData.get("Discount") !== "") {
        if (parseFloat(formData.get("Discount")) < 0 || parseFloat(formData.get("Discount")) > 100) {
            valDiscount.hidden = false;
            return;
        } else valDiscount.hidden = true;
    }

    const dishData = {
        IdDish: parseInt(formData.get("IdDish")),
        Name: formData.get("Name"),
        Issoldout: formData.get("Issoldout") ? true : false,
        Discount: parseFloat(formData.get("Discount")),
        Price: parseFloat(formData.get("Price")),
        Description: formData.get("Description"),
        Photo: formData.get("Photo"),
        IdDishcategory: parseInt(formData.get("IdDishcategory")), // ← thêm dòng này nếu dùng <select>
        Dishingredients: [] // ← dùng đúng tên property viết hoa
    };

    // Lấy nguyên liệu từ bảng
    const ingredients = [];
    let hasInvalidAmount = false;

    document.querySelectorAll("#editIngredientBody tr").forEach(row => {
        const id = parseInt(row.dataset.id);
        const amountInput = row.querySelector("input");
        const amount = parseFloat(amountInput.value);

        if (isNaN(id) || isNaN(amount) || amount <= 0) {
            hasInvalidAmount = true;
            amountInput.classList.add("is-invalid");
        } else {
            amountInput.classList.remove("is-invalid");
            ingredients.push({ idInventoryitem: id, amount: amount });
        }
    });

    if (hasInvalidAmount) {
        valIngr.innerHTML = "Vui lòng nhập số lượng hợp lệ cho tất cả nguyên liệu (lớn hơn 0)";
        valIngr.hidden = false;
        return;
    } else valIngr.hidden = true;
    dishData.Dishingredients = ingredients;
    console.log(dishData); // Debug trước khi gửi

    const id = dishData.IdDish;
    const method = id > 0 ? "PUT" : "POST";
    const url = id > 0 ? `/api/dishapi/${id}` : "/api/dishapi";

    // … (thu thập, validate, dựng dishData như đã làm)

    const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dishData)
    });

    if (res.ok) {
        alert(id > 0 ? "Đã cập nhật!" : "Đã tạo món mới!");
        bootstrap.Modal.getInstance('#editDishModal').hide();
        loadDishes();     // refresh danh sách
    } else {
        alert("Lỗi: " + await res.text());
    }
}

function returnToDetail(id) {
    bootstrap.Modal.getInstance(document.getElementById("editDishModal")).hide();
    showDishDetail(id);
}

async function addIngredientRow() {
    const res = await fetch("/api/inventoryitemapi");
    const allItems = await res.json();
    let items = allItems.filter(item => item.inventoryitemtypeName === "Nguyên liệu");
    const usedIds = Array.from(document.querySelectorAll("#editIngredientBody tr"))
        .map(tr => parseInt(tr.dataset.id));

    // Lọc ra những nguyên liệu chưa được dùng
    items = items.filter(item => !usedIds.includes(item.idInventoryitem));

    if (items.length === 0) {
        alert("Không còn nguyên liệu nào khả dụng.");
        return;
    }

    const tbody = document.getElementById("editIngredientBody");

    const firstItem = items[0];

    const tr = document.createElement("tr");
    tr.dataset.id = firstItem.idInventoryitem; // lưu ID ban đầu

    tr.innerHTML = `
        <td>
            <select class="form-select form-select-sm" onchange="updateRowId(this)">
                ${items.map(item => `<option value="${item.idInventoryitem}" data-unit="${item.unit}">${item.name}</option>`).join("")}
            </select>
        </td>
        <td class="unit-cell">${firstItem.unit}</td>
        <td>
            <input type="number" class="form-control form-control-sm" value="1" />
        </td>
        <td class="text-center">
            <button type="button" class="btn btn-sm btn-danger" onclick="removeIngredientRow(this)">X</button>
        </td>
    `;

    tbody.appendChild(tr);
}

function updateRowId(selectElement) {
    const row = selectElement.closest("tr");
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    row.dataset.id = selectedOption.value;

    // Cập nhật đơn vị tương ứng
    const unit = selectedOption.dataset.unit;
    row.querySelector(".unit-cell").textContent = unit;
}

function removeIngredientRow(button) {
    const row = button.closest("tr");
    row.remove();
}

