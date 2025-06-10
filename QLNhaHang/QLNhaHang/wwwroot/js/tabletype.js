// Helpers --------------------------------------------------
const apiUrl = "/api/tabletypeapi"
const modalElement = document.getElementById('tabletypeModal');
const modal = new bootstrap.Modal(modalElement);

function clearForm() {
    tabletypeId.value = '';
    tabletypeName.value = '';
    tabletypeSeats.value = '';
}

// 1. Tải danh sách ----------------------------------------
async function loadTabletypes() {
    const res = await fetch(apiUrl);
    const data = await res.json();

    const tbody = document.getElementById('tabletypeTableBody');
    tbody.innerHTML = '';

    data.forEach(t => {
        tbody.insertAdjacentHTML('beforeend', `
            <tr>
                <td>${t.idTabletype}</td>
                <td>${t.name}</td>
                <td>${t.seats}</td>
                <td>
                    <button class="btn btn-sm btn-warning me-1" onclick="editTabletype(${t.idTabletype})">Sửa</button>
                    <button class="btn btn-sm btn-danger"  onclick="deleteTabletype(${t.idTabletype})">Xóa</button>
                </td>
            </tr>
        `);
    });
}

// 2. Hiển thị form thêm ------------------------------------
function showAddForm() {
    clearForm();
    tabletypeModalTitle.textContent = 'Thêm loại bàn';
    modal.show();
}

// 3. Edit --------------------------------------------------
async function editTabletype(id) {
    const res = await fetch(`${apiUrl}/${id}`);
    const t = await res.json();

    tabletypeId.value = t.idTabletype;
    tabletypeName.value = t.name;
    tabletypeSeats.value = t.seats;

    tabletypeModalTitle.textContent = 'Cập nhật loại bàn';
    modal.show();
}

// 4. Delete ------------------------------------------------
async function deleteTabletype(id) {
    if (!confirm("Bạn có chắc chắn muốn xóa loại bàn này?")) return;

    const res = await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });

    if (res.ok) {
        alert("Xóa thành công!");
        await loadTabletypes(); // hoặc load lại danh sách
    } else {
        const error = await res.text();
        alert(error);
    }
}


// 5. Submit form ------------------------------------------
document.getElementById('tabletypeForm').addEventListener('submit', async e => {
    e.preventDefault();

    const id = tabletypeId.value;
    const body = {
        idTabletype: id || 0,
        name: tabletypeName.value.trim(),
        seats: Number(tabletypeSeats.value)
    };

    const url = id ? `${apiUrl}/${id}` : apiUrl;
    const method = id ? 'PUT' : 'POST';

    await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    modal.hide();
    loadTabletypes();
});

// Init -----------------------------------------------------
document.addEventListener('DOMContentLoaded', loadTabletypes);
