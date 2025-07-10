var customerlist = [];
// GET ALL customers
async function getAllCustomers() {
    try {
        const response = await fetch('/api/customerapi');
        if (!response.ok) throw new Error("Lấy danh sách khách hàng thất bại.");
        customerlist = await response.json();
        loadCustomers(); 
        console.log(customerlist);
    } catch (error) {
        console.error("Error:", error);
    }
}

async function loadCustomers() {
    const tableBody = document.getElementById("customerTableBody");
    tableBody.innerHTML = ""; // clear table

    customerlist.forEach(c => {
        const row = document.createElement("tr");

        row.innerHTML = `
			<td>${c.idCustomer}</td>
			<td>${c.name}</td>
			<td>${c.phone ?? ""}</td>
			<td>${c.email ?? ""}</td>
			<td>${c.birthday ? new Date(c.birthday).toLocaleDateString() : ""}</td>
			<td>${c.address ?? ""}</td>
			<td>${c.photo ? `<img src="${c.photo}" width="50">` : ""}</td>
			<td class="text-center">
					<button class="btn btn-sm btn-danger" onclick="deleteCustomer(${c.idCustomer})">Xóa</button>
			</td>
		`;
        tableBody.appendChild(row);
    });
}

// Gọi hàm load khi trang load
document.addEventListener('DOMContentLoaded', function () {
    getAllCustomers();
});

// GET customer by ID
async function getCustomerById(id) {
    try {
        const response = await fetch(`/api/customerapi/${id}`);
        if (!response.ok) throw new Error(`Không tìm thấy khách hàng với ID là ${id}.`);
        const customer = await response.json();
        console.log(customer);
        return customer;
    } catch (error) {
        console.error("Error:", error);
    }
}

async function searchCustomers() {
    const keyword = document.getElementById('searchInput').value.trim();
    const tbody = document.getElementById('customerTableBody');
    tbody.innerHTML = '';

    if (!keyword) return;

    try {
        const res = await fetch(`/api/customerapi/search?keyword=${encodeURIComponent(keyword)}`);
        const data = await res.json();

        if (!res.ok) {
            alert("Lỗi tìm kiếm: " + (data.message || "Không thể tìm."));
            return;
        }

        if (data.length === 0) {
            tbody.innerHTML = "<tr><td colspan='3'>Không tìm thấy khách hàng nào.</td></tr>";
            return;
        }
        customerlist = data; // Cập nhật danh sách khách hàng
        loadCustomers(); 
    } catch (err) {
        alert("Lỗi kết nối máy chủ.");
    }
}

// UPDATE customer
async function updateCustomer(id, customer) {
    try {
        const response = await fetch(`/api/customerapi/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(customer)
        });
        if (!response.ok) throw new Error("Failed to update customer");
        console.log("Customer updated");
    } catch (error) {
        console.error("Error:", error);
    }
}

// DELETE customer
async function deleteCustomer(id) {
    if (confirm("Bạn có chắc chắn muốn xóa khách hàng này không?")) {
        try {
            const response = await fetch(`/api/customerapi/${id}`, { method: "DELETE" });
            if (!response.ok) throw new Error("Failed to delete customer")
            else {
                alert("Xóa khách hàng thành công.");
                getAllCustomers(); 
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }

}

