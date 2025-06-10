const apiUrl = "/api/areaapi";

async function getAllAreas() {
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error("Lỗi khi tải danh sách khu vực");
    return await res.json();
}

async function loadAreas() {
    const areas = await getAllAreas();
    const tbody = document.getElementById("areaTableBody");
    tbody.innerHTML = "";

    areas.forEach(a => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${a.idArea}</td>
            <td>${a.name}</td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="showEditForm(${a.idArea})">Sửa</button>
                <button class="btn btn-sm btn-danger" onclick="deleteArea(${a.idArea})">Xóa</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

window.onload = loadAreas;

function showAddForm() {
    document.getElementById("areaModalTitle").innerText = "Thêm khu vực";
    document.getElementById("areaId").value = "";
    document.getElementById("areaName").value = "";
    new bootstrap.Modal(document.getElementById("areaModal")).show();
}

async function showEditForm(id) {
    const res = await fetch(`${apiUrl}/${id}`);
    const data = await res.json();

    document.getElementById("areaModalTitle").innerText = "Sửa khu vực";
    document.getElementById("areaId").value = data.idArea;
    document.getElementById("areaName").value = data.name;

    bootstrap.Modal.getOrCreateInstance(document.getElementById("areaModal")).show();
}

async function submitArea() {
    const area = {
        IdArea: document.getElementById("areaId").value || 0,
        Name: document.getElementById("areaName").value
    };

    const method = area.IdArea == 0 ? "POST" : "PUT";
    const url = area.IdArea == 0 ? apiUrl : `${apiUrl}/${area.IdArea}`;

    const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(area)
    });

    if (res.ok) {
        alert("Lưu thành công!");
        bootstrap.Modal.getInstance(document.getElementById("areaModal")).hide();
        await loadAreas();
    } else {
        const error = await res.text();
        alert("Lỗi: " + error);
    }
}

document.getElementById("areaForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    await submitArea();
});

async function deleteArea(id) {
    if (!confirm("Bạn có chắc muốn xóa khu vực này?")) return;

    const res = await fetch(`${apiUrl}/${id}`, { method: "DELETE" });

    if (res.ok) {
        await loadAreas();
    } else {
        const error = await res.text();
        alert("Không thể xóa: " + error);
    }
}
