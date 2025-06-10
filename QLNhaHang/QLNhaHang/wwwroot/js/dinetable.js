const apiUrl = "/api/dinetableapi";

async function getAllDineTables() {
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error("Lỗi khi tải danh sách bàn");
    return await res.json();
}

async function loadDinetables() {
    const dinetables = await getAllDineTables();
    const tbody = document.getElementById('dinetableTableBody');
    tbody.innerHTML = "";

    dinetables.forEach(t => {
        const row = document.createElement('tr');
        row.innerHTML = `
                    <td>${t.idDinetable}</td>
                    <td>${t.name}</td>
                    <td>${t.seats}</td>
                    <td>${t.area}</td>
                    <td>${t.type}</td>
                    <td>
                        <button class="btn btn-sm btn-warning" onclick="showEditForm(${t.idDinetable})">Sửa</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteDinetable(${t.idDinetable})">Xóa</button>
                    </td>
                `;
        tbody.appendChild(row);
    });
}

window.onload = loadDinetables;

async function loadSelectOptions() {
    const [areas, types] = await Promise.all([
        fetch('/api/areaapi').then(res => res.json()),
        fetch('/api/tabletypeapi').then(res => res.json())
    ]);

    const areaSelect = document.getElementById('dinetableArea');
    const typeSelect = document.getElementById('dinetableType');
    areaSelect.innerHTML = typeSelect.innerHTML = "";

    areas.forEach(a => {
        areaSelect.innerHTML += `<option value="${a.idArea}">${a.name}</option>`;
    });

    types.forEach(t => {
        typeSelect.innerHTML += `<option value="${t.idTabletype}">${t.name}</option>`;
    });
}

function showAddForm() {
    document.getElementById('dinetableModalTitle').innerText = "Thêm bàn";
    document.getElementById('dinetableId').value = "";
    document.getElementById('dinetableName').value = "";
    new bootstrap.Modal('#dinetableModal').show();
    loadSelectOptions();
}

async function showEditForm(id) {
    const res = await fetch(`/api/dinetableapi/${id}`);
    const data = await res.json();

    document.getElementById('dinetableModalTitle').innerText = "Sửa bàn";
    document.getElementById('dinetableId').value = data.idDinetable;
    document.getElementById('dinetableName').value = data.name;

    await loadSelectOptions();

    document.getElementById('dinetableArea').value = data.idArea;
    document.getElementById('dinetableType').value = data.idTabletype;
    new bootstrap.Modal('#dinetableModal').show();
}

async function submitDinetable() {
    const dinetable = {
        IdDinetable: document.getElementById('dinetableId').value || 0,
        Name: document.getElementById('dinetableName').value,
        IdArea: parseInt(document.getElementById('dinetableArea').value),
        IdTabletype: parseInt(document.getElementById('dinetableType').value)
    };

    const method = dinetable.IdDinetable == 0 ? 'POST' : 'PUT';
    const url = dinetable.IdDinetable == 0 ? '/api/dinetableapi' : `/api/dinetableapi/${dinetable.IdDinetable}`;

    const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dinetable)
    });


    if (res.ok) {
        alert("Lưu thành công!");
        bootstrap.Modal.getInstance('#dinetableModal').hide();
        await loadDinetables();
    }
}

async function deleteDinetable(id) {
    const res = await fetch(`/api/dinetableapi/${id}`, { method: 'DELETE' });
    if (res.ok) {
        await loadDinetables();
    } else {
        alert("Xóa thất bại!");
    }
}

document.getElementById('dinetableForm').addEventListener('submit', async function (event) {
    event.preventDefault(); // ⛔️ Prevent full-page reload
    await submitDinetable(); // ✅ Call your custom logic
});
