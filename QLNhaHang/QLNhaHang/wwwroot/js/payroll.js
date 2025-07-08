async function loadPayrolls() {
    const res = await fetch('/api/payrollapi');
    const data = await res.json();
    const tbody = document.getElementById('payrollList');
    tbody.innerHTML = data.map(p => `
    <tr>
        <td>${p.month}</td>
        <td>${p.year}</td>
        <td><a class="btn btn-primary" href="/Payroll/Detail?id=${p.id}">Chi tiết</a></td>
    </tr>
    `).join('');
}

document.addEventListener('DOMContentLoaded', loadPayrolls);
