const apiUrl = "/api/inventoryitemapi";

var valName = document.getElementById("validateName");
var valUnit = document.getElementById("validateUnit");

// Gọi API lấy danh sách nguyên liệu
async function getAllInventoryitems() {
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
        alert("Không thể tải danh sách nguyên liệu");
        return [];
    }
    return await response.json();
}

async function loadInventoryitems() {
    const items = await getAllInventoryitems();
    const tableBody = document.getElementById("inventoryTableBody");
    tableBody.innerHTML = "";

    items.forEach(item => {
        const row = document.createElement("tr");
        row.innerHTML = `
                    <td>${item.idInventoryitem}</td>
                    <td>${item.name}</td>
                    <td>${item.unit}</td>
                    <td>${item.amount}</td>
                    <td>${item.inventoryitemtypeName ?? ""}</td>
                    <td>
                            <button class="btn btn-sm btn-warning" onclick="showEditForm(${item.idInventoryitem})">Sửa</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteInventoryitem(${item.idInventoryitem})">Xóa</button>
                    </td>
                `;
        tableBody.appendChild(row);
    });
}

window.onload = loadInventoryitems;

async function addInventoryitem(item) {
    await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item)
    });
}

async function deleteInventoryitem(id) {
    if (confirm("Bạn có chắc muốn xóa nguyên liệu này không?")) {
        try {
            const response = await fetch(`${apiUrl}/${id}`, {
                method: "DELETE"
            });

            if (response.ok) {
                alert("Xoá thành công!");
                await loadInventoryitems(); // Cập nhật lại danh sách
            } else {
                const errorText = await response.text();
                alert(`${errorText}`);
            }
        } catch (err) {
            alert("Đã xảy ra lỗi khi kết nối tới server.");
            console.error(err);
        }
    }
}

function showAddForm() {
    document.getElementById("modalLabel").innerText = "Thêm mới nguyên liệu";
    document.getElementById("itemId").value = ""; // Xoá id để biết là đang thêm
    document.getElementById("itemName").value = "";
    document.getElementById("itemUnit").value = "";
    document.getElementById("itemAmount").value = 0;
    valName.hidden = true;
    valUnit.hidden = true;
    loadInventoryTypes(); // Load dropdown loại nguyên liệu
    new bootstrap.Modal(document.getElementById("editModal")).show();
}


async function showEditForm(id) {
    const res = await fetch(`${apiUrl}/${id}`);
    const item = await res.json();
    console.log(item);

    document.getElementById("modalLabel").innerText = "Sửa nguyên liệu";
    document.getElementById("itemId").value = item.idInventoryitem;
    document.getElementById("itemName").value = item.name;
    document.getElementById("itemUnit").value = item.unit;
    document.getElementById("itemAmount").value = item.amount;
    valName.hidden = true;
    valUnit.hidden = true;

    await loadInventoryTypes(item.idInventoryitemtype); // Load các loại

    new bootstrap.Modal(document.getElementById("editModal")).show();
}

async function loadInventoryTypes(selectedId = null) {
    const res = await fetch("/api/inventoryitemtypeapi");
    const types = await res.json();
    const select = document.getElementById("itemType");
    select.innerHTML = "";

    types.forEach(type => {
        const option = document.createElement("option");
        option.value = type.idInventoryitemtype;
        option.text = type.name;
        if (type.idInventoryitemtype === selectedId) option.selected = true;
        select.appendChild(option);
    });
}

async function updateInventoryitem() {
    const id = document.getElementById("itemId").value;
    const name = document.getElementById("itemName").value;
    const unit = document.getElementById("itemUnit").value;
    const amount = parseFloat(document.getElementById("itemAmount").value);
    const typeId = parseInt(document.getElementById("itemType").value);

    const item = { name, unit, amount, idInventoryitemtype: typeId };


    if (name === "") {
        valName.hidden = false;
        return;
    } else valName.hidden = true;
    if (unit === "") {
        valUnit.hidden = false;
        return;
    } else valUnit.hidden = true;

    const res = await fetch(`${apiUrl}` + (id ? `/${id}` : ""), {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(id ? { idInventoryitem: parseInt(id), ...item } : item)
    });
    if (res.ok) {
        alert("Lưu thành công!");
        bootstrap.Modal.getInstance(document.getElementById("editModal")).hide();
        loadInventoryitems();
    } else {
        const error = await res.text();
        alert("Lỗi: " + error);
    }
}
