let currentDay = null, currentShift = null;

let allStaffOptions = [];
let selectedStaffIds = [];
let scheduleData = [];

const token = localStorage.getItem("token");

document.addEventListener('DOMContentLoaded', () => {
    displayCurrentWeek();
    loadSchedule();
    populateStaffFilter();
    document.getElementById("checkinButton").addEventListener("click", checkIn);
    document.getElementById("filterButton").addEventListener("click", applyScheduleFilter);
    document.getElementById("resetFilterButton").addEventListener("click", resetScheduleFilter);
});

function formatShiftName(shift) {
    return shift === 1 ? "Sáng" : shift === 2 ? "Trưa" : "Tối";
}

function formatDayName(day) {
    return day === 8 ? "Chủ nhật" : `Thứ ${day}`;
}

async function loadSchedule() {
    try {
        const res = await fetch('/api/scheduleapi');
        const data = await res.json();
        scheduleData = data; // lưu lại toàn bộ dữ liệu
        console.log("Dữ liệu thời gian biểu:", data);
        const tbody = document.getElementById('scheduleGrid');
        tbody.innerHTML = '';
        const shifts = ['Sáng', 'Chiều', 'Tối'];

        for (let s = 0; s < 3; s++) {
            const tr = document.createElement('tr');
            tr.innerHTML = `<th>${shifts[s]}</th>`;
            for (let d = 2; d <= 8; d++) {
                const cell = document.createElement('td');
                const staff = data
                    .filter(x => x.idWorkday === d - 1 && x.idWorkshift === s + 1)
                    .map(x => `<div data-idstaff="${x.idStaff}">${x.name}</div>`);
                console.log(staff);
                cell.innerHTML = staff.slice(0, 5).join('') + (staff.length > 5 ? "<div>...</div>" : "");

                cell.classList.add("cursor-pointer");
                cell.onclick = () => showShiftDetail(d, s + 1, true);
                tr.appendChild(cell);
            }
            tbody.appendChild(tr);
        }
        populateStaffFilter(); // Đảm bảo danh sách nhân viên được cập nhật
    } catch (err) {
        console.error("Lỗi tải thời gian biểu:", err);
    }
}

async function populateStaffFilter() {
    try {
        const res = await fetch('/api/staffapi');
        const data = await res.json();
        allStaffOptions = data;

        const list = document.getElementById("staffList");
        list.innerHTML = "";

        data.forEach(s => {
            const opt = document.createElement("option");
            opt.value = `${s.name} (${s.staffType})`; // hiển thị
            opt.dataset.id = s.idStaff; // lưu id
            list.appendChild(opt);
        });
    } catch (err) {
        console.error("Lỗi tải danh sách nhân viên:", err);
    }
}

function applyScheduleFilter() {
    const input = document.getElementById("staffFilterInput").value.toLowerCase();
    const found = allStaffOptions.find(s => input.includes(s.name.toLowerCase()));
    if (!found) return alert("Không tìm thấy nhân viên!");

    const selectedId = found.idStaff.toString();

    const rows = document.querySelectorAll("#scheduleGrid tr");
    rows.forEach((row, sIndex) => {
        const cells = row.querySelectorAll("td");
        cells.forEach((cell, dIndex) => {
            const workday = dIndex + 2;
            const shift = sIndex + 1;
            const hasStaff = scheduleData.some(x =>
                x.idStaff == selectedId &&
                x.idWorkday == workday - 1 &&
                x.idWorkshift == shift
            );
            cell.classList.remove("cell-highlight", "cell-muted");
            cell.classList.add(hasStaff ? "cell-highlight" : "cell-muted");
        });
    });
}

function resetScheduleFilter() {
    const grid = document.getElementById("scheduleGrid");
    grid.querySelectorAll("td").forEach(cell => {
        cell.classList.remove("cell-highlight", "cell-muted");
    });

    // Reset ô input tìm kiếm nhân viên
    document.getElementById("staffFilterInput").value = "";
}

async function showShiftDetail(day, shift, isNew) {
    currentDay = day;
    currentShift = shift;
    try {
        const res = await fetch(`/api/scheduleapi/${day}/${shift}`);
        const data = await res.json();

        document.getElementById('modalShiftName').textContent = data.shiftName;
        document.getElementById('modalDayName').textContent = data.dayName;

        const tbody = document.getElementById('shiftStaffTableBody');
        tbody.innerHTML = '';
        const isFutureShift = data.shiftStatus === 'future';

        data.staff.forEach(st => {
            const tr = document.createElement('tr');
            tr.id = `staff-row-${st.id}`;

            tr.innerHTML = `
        <td>${st.name}</td>
        <td>${st.type}</td>
        <td class="text-center">
            <input type="checkbox"
                   ${st.attended ? 'checked' : ''}
                   ${isFutureShift ? 'disabled' : ''}
                   onchange="toggleAttendance(${st.id}, this.checked)">
        </td>
        <td class="text-center">
            <input type="checkbox"
                   class="late-checkbox"
                   ${st.islate ? 'checked' : ''}
                   ${(!st.attended || isFutureShift) ? 'disabled' : ''}
                   onchange="toggleLate(${st.id}, this.checked)">
        </td>
        <td class="text-center">
            <button class="btn btn-sm btn-danger" onclick="removeStaff(${st.id})">X</button>
        </td>
    `;
            tbody.appendChild(tr);
        });

        const excludeIds = data.staff.map(s => s.id).join(',');
        const staffRes = await fetch(`/api/staffapi/shift?exclude=${excludeIds}`);
        const options = await staffRes.json();

        allStaffOptions = options; // options từ API
        selectedStaffIds = [];     // reset
        updateStaffSearchResults(); // hiển thị tất cả ban đầu

        if (isNew) {
            new bootstrap.Modal(document.getElementById('shiftDetailModal')).show();
        }
        else {
            bootstrap.Modal.getInstance(document.getElementById('shiftDetailModal')).show();
        }
        // Reset khu vực thêm nhân viên
        document.getElementById('addStaffArea').style.display = 'none';
        document.getElementById('addStaffBtn').textContent = '+ Thêm nhân viên';
        selectedStaffIds = [];
        document.getElementById('staffSearchInput').value = '';
        document.getElementById('staffSearchResults').innerHTML = '';
        document.getElementById('selectedStaffPreview').innerHTML = '';
    } catch (err) {
        console.error("Lỗi hiển thị chi tiết ca:", err);
    }
}

async function addStaffToShift() {
    try {
        await fetch(`/api/scheduleapi/${currentDay}/${currentShift}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(selectedStaffIds)
        });

        selectedStaffIds = [];
        document.getElementById('staffSearchInput').value = '';
        document.getElementById('selectedStaffPreview').innerHTML = '';
        await showShiftDetail(currentDay, currentShift, false);
        await loadSchedule();
    } catch (err) {
        console.error("Lỗi thêm nhân viên vào ca:", err);
    }
}

async function removeStaff(staffId) {
    try {
        await fetch(`/api/scheduleapi/${currentDay}/${currentShift}/${staffId}`, {
            method: 'DELETE'
        });
        await showShiftDetail(currentDay, currentShift, false);
        await loadSchedule();
    } catch (err) {
        console.error("Lỗi xoá nhân viên khỏi ca:", err);
    }
}

document.getElementById('staffSearchInput').addEventListener('input', updateStaffSearchResults);

function updateStaffSearchResults() {
    const keyword = document.getElementById('staffSearchInput').value.toLowerCase();
    const resultDiv = document.getElementById('staffSearchResults');
    resultDiv.innerHTML = '';

    allStaffOptions
        .filter(opt => opt.name.toLowerCase().includes(keyword) && !selectedStaffIds.includes(opt.id))
        .forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'list-group-item list-group-item-action';
            btn.textContent = `${opt.name} (${opt.type})`;
            btn.onclick = () => {
                selectedStaffIds.push(opt.id);
                updateSelectedPreview();
                updateStaffSearchResults();
                document.getElementById('staffSearchInput').value = '';
            };
            resultDiv.appendChild(btn);
        });
}

function updateSelectedPreview() {
    const container = document.getElementById('selectedStaffPreview');
    container.innerHTML = '';
    selectedStaffIds.forEach(id => {
        const opt = allStaffOptions.find(s => s.id === id);
        if (!opt) return;
        const div = document.createElement('div');
        div.className = 'badge bg-primary me-1 mb-1';
        div.innerHTML = `${opt.name} (${opt.type}) <span class="ms-1" style="cursor:pointer;" onclick="removeSelectedStaff(${id})">&times;</span>`;
        container.appendChild(div);
    });
}

function removeSelectedStaff(id) {
    selectedStaffIds = selectedStaffIds.filter(sid => sid !== id);
    updateSelectedPreview();
    updateStaffSearchResults();
}

function toggleAddStaff() {
    const area = document.getElementById('addStaffArea');
    const btn = document.getElementById('addStaffBtn');

    if (area.style.display === 'none') {
        area.style.display = 'block';
        btn.textContent = 'Đóng';
        updateStaffSearchResults();
    } else {
        area.style.display = 'none';
        btn.textContent = '+ Thêm nhân viên';
        selectedStaffIds = [];
        document.getElementById('staffSearchInput').value = '';
        document.getElementById('staffSearchResults').innerHTML = '';
        document.getElementById('selectedStaffPreview').innerHTML = '';
    }
}

async function toggleAttendance(idStaff, checked) {
    try {
        await fetch(`/api/scheduleapi/${currentDay}/${currentShift}/attendance`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idStaff, attended: checked })
        });

        const row = document.querySelector(`#staff-row-${idStaff}`);
        if (row) {
            const lateCheckbox = row.querySelector('.late-checkbox');
            if (lateCheckbox) {
                if (!checked) await toggleLate(idStaff, checked); // Reset trạng thái đi muộn nếu không có mặt
                lateCheckbox.disabled = !checked; // Nếu chưa có mặt, thì không cho đi muộn
            }
        }
        await showShiftDetail(currentDay, currentShift, false);
    } catch (err) {
        alert("Lỗi cập nhật trạng thái có mặt");
        console.error(err);
    }
}

async function toggleLate(idStaff, checked) {
    try {
        await fetch(`/api/scheduleapi/${currentDay}/${currentShift}/late`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idStaff, islate: checked })
        });
    } catch (err) {
        alert("Lỗi cập nhật trạng thái đi muộn");
        console.error(err);
    }
}

async function checkIn() {
    const messageBox = document.getElementById("checkinMessage");
    if (!token) {
        messageBox.textContent = "Bạn chưa đăng nhập.";
        messageBox.className = "text-danger";
        return;
    }

    try {
        const res = await fetch("/api/scheduleapi/checkin", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const text = await res.text();

        if (res.ok) {
            messageBox.textContent = "✅ " + text;
            messageBox.className = "text-success";
            // Tải lại thời gian biểu để cập nhật trạng thái nếu cần
            if (typeof loadSchedule === "function") loadSchedule();
        } else {
            messageBox.textContent = "❌ " + text;
            messageBox.className = "text-danger";
        }
    } catch (err) {
        messageBox.textContent = "Lỗi kết nối đến máy chủ.";
        messageBox.className = "text-danger";
    }
}

function getWeekOfMonth(date) {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const firstDayWeekday = firstDay.getDay() === 0 ? 7 : firstDay.getDay(); // chuyển Chủ nhật từ 0 → 7
    const currentDate = date.getDate();
    return Math.ceil((currentDate + firstDayWeekday - 1) / 7);
}

function displayCurrentWeek() {
    const now = new Date();
    const week = getWeekOfMonth(now);
    const formattedDate = now.toLocaleDateString('vi-VN');
    document.getElementById('currentWeekDisplay').textContent = `Tuần ${week} - ${formattedDate}`;
}
