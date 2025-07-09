// GET ALL customers
async function getAllCustomers() {
    try {
        const response = await fetch('/api/customerapi');
        if (!response.ok) throw new Error("Lấy danh sách khách hàng thất bại.");
        const customers = await response.json();
        return customers;
    } catch (error) {
        console.error("Error:", error);
    }
}

async function loadCustomers() {
    const customers = await getAllCustomers();
    const tableBody = document.getElementById("customerTableBody");
    tableBody.innerHTML = ""; // clear table

    customers.forEach(c => {
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
window.onload = loadCustomers;

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

// ADD new customer
async function addCustomer(customer) {
    try {
        const response = await fetch('/api/customerapi', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(customer)
        });
        if (!response.ok) throw new Error("Failed to add customer");
        const newCustomer = await response.json();
        console.log("Added:", newCustomer);
        return newCustomer;
    } catch (error) {
        console.error("Error:", error);
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

function confirmDeleteCustomer(id) {
    if (confirm("Bạn có chắc chắn muốn xóa khách hàng này không?")) {
        deleteCustomer(id).then(window.reload);
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
                loadCustomers(); // Tải lại danh sách khách hàng
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }

}

