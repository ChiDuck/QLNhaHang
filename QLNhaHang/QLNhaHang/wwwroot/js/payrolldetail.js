const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');

document.addEventListener('DOMContentLoaded', loadDetails);

async function loadDetails() {
    console.log("Loading payroll details for ID:", id);
	const res = await fetch(`/api/payrollapi/${id}`);
	const data = await res.json();
    console.log("Payroll data:", data);
	document.getElementById('payrollMonth').textContent = data.month;
	document.getElementById('payrollYear').textContent = data.year;
	const tbody = document.getElementById('payrollDetails');
	tbody.innerHTML = data.details.map(d => `
            <tr>
                <td>${d.name}</td>
                <td>${d.type}</td>
                <td><button class="btn btn-sm btn-info" onclick="showPayrollDetail(${d.id},${id},'${d.name}')">Xem</button></td>
            </tr>
        `).join('');
}

async function showPayrollDetail(staffId, payrollId, staffName) {
	try {
		const res = await fetch(`/api/payrollapi/${payrollId}/${staffId}`);
		const data = await res.json();

		document.getElementById("payrollModalStaffName").textContent = staffName;
		document.getElementById("pd_IdStaff").value = data.idStaff;
		document.getElementById("pd_IdPayroll").value = data.idPayroll;
		document.getElementById("pd_Days").value = data.days;
		document.getElementById("pd_Hours").value = data.hours;
		document.getElementById("pd_Absencetimes").value = data.absencetimes;
		document.getElementById("pd_Latetimes").value = data.latetimes;
		document.getElementById("pd_Subtract").value = data.subtract;
		document.getElementById("pd_Bonus").value = data.bonus;
		document.getElementById("pd_Totalsalary").value = data.totalsalary;
		document.getElementById("pd_Note").value = data.note ?? "";

		new bootstrap.Modal(document.getElementById("payrollDetailModal")).show();
	} catch (err) {
		alert("Lỗi tải chi tiết bảng lương.");
		console.error(err);
	}
}

async function savePayrollDetail() {
	const data = {
		idStaff: parseInt(document.getElementById("pd_IdStaff").value),
		idPayroll: parseInt(document.getElementById("pd_IdPayroll").value),
		days: parseInt(document.getElementById("pd_Days").value),
		hours: parseFloat(document.getElementById("pd_Hours").value),
		absencetimes: parseInt(document.getElementById("pd_Absencetimes").value),
		latetimes: parseInt(document.getElementById("pd_Latetimes").value),
		subtract: parseFloat(document.getElementById("pd_Subtract").value),
		bonus: parseFloat(document.getElementById("pd_Bonus").value),
		totalsalary: parseFloat(document.getElementById("pd_Totalsalary").value),
		note: document.getElementById("pd_Note").value
	};

	try {
		const res = await fetch(`/api/payrollapi/update`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data)
		});

		if (res.ok) {
			alert("Đã lưu thay đổi.");
			bootstrap.Modal.getInstance(document.getElementById("payrollDetailModal")).hide();
			// gọi lại hàm load danh sách nếu cần
		} else {
			const msg = await res.text();
			alert("Lỗi khi lưu: " + msg);
		}
	} catch (err) {
		console.error("Lỗi khi gọi API:", err);
	}
}
