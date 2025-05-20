const apiUrl = "/api/customerapi";

// GET ALL customers
async function getAllCustomers() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Lấy danh sách khách hàng thất bại.");
        const customers = await response.json();
        console.log(customers);
        return customers;
    } catch (error) {
        console.error("Error:", error);
    }
}

// GET customer by ID
async function getCustomerById(id) {
    try {
        const response = await fetch(`${apiUrl}/${id}`);
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
        const response = await fetch(apiUrl, {
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
        const response = await fetch(`${apiUrl}/${id}`, {
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
    try {
        const response = await fetch(`${apiUrl}/${id}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Failed to delete customer");
        console.log(`Customer ${id} deleted`);
    } catch (error) {
        console.error("Error:", error);
    }
}