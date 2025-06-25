document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            fetch('https://inventory-management-7wqt.onrender.com/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    password
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Store the user role in local storage
                    localStorage.setItem('userRole', data.role);
                    // Redirect to the homepage
                    window.location.href = 'homepage.html';
                } else {
                    document.getElementById('message').innerText = data.message;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                document.getElementById('message').innerText = 'An error occurred. Please try again.';
            });
        });
    }

    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        addProductForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const productName = document.getElementById('productName').value;
            const productDescription = document.getElementById('productDescription').value;
            const sellingPrice = document.getElementById('sellingPrice').value;
            const costPrice = document.getElementById('costPrice').value;
            const initialStock = document.getElementById('initialStock').value;
            const expiryDate = document.getElementById('expiryDate').value;
            const categoryName = document.getElementById('categoryName').value;
            const supplierName = document.getElementById('supplierName').value;

            fetch('https://inventory-management-7wqt.onrender.com/api/addProduct', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    productName,
                    productDescription,
                    sellingPrice,
                    costPrice,
                    initialStock,
                    expiryDate,
                    categoryName,
                    supplierName
                })
            })
            .then(response => response.json())
            .then(data => {
                document.getElementById('message').innerText = data.message;
            });
        });
    }

    const displayInventory = document.getElementById('inventoryTable').getElementsByTagName('tbody')[0];
    if (inventoryTable) {
        fetch('https://inventory-management-7wqt.onrender.com/api/inventory')
            .then(response => response.json())
            .then(data => {
                data.forEach(item => {
                    const row = inventoryTable.insertRow();
                    row.insertCell(0).innerText = item.ProductID;
                    row.insertCell(1).innerText = item.Name;
                    row.insertCell(2).innerText = item.Description;
                    row.insertCell(3).innerText = item.CategoryName;
                    row.insertCell(4).innerText = item.SupplierName;
                    row.insertCell(5).innerText = item.QuantityInStock;
                    row.insertCell(6).innerText = item.Price;
                    row.insertCell(7).innerText = item.LastUpdates;
                });
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    
   
});
