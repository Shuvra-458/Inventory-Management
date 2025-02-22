document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            fetch('http://127.0.0.1:8000/api/login', {
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

            fetch('http://127.0.0.1:8000/api/addProduct', {
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
        fetch('http://127.0.0.1:8000/api/inventory')
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

    
    const sellProductForm = document.getElementById('sellProductForm');
    if (sellProductForm) {
    sellProductForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const productID = document.getElementById('productID').value;
        const quantity = document.getElementById('quantity').value;
        const sellingPrice = document.getElementById('sellingPrice').value;

        fetch('http://127.0.0.1:8000/api/sell_product', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                productID: parseInt(productID),
                quantity: parseInt(quantity),
                sellingPrice: parseFloat(sellingPrice)
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('message').innerText = 'Sale recorded successfully!';
                sellProductForm.reset();
            } else {
                document.getElementById('message').innerText = 'Failed to record sale: ' + data.message;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('message').innerText = 'An error occurred. Please try again.';
        });
    });
    }

    const clearInventoryForm = document.getElementById('clearInventoryForm');
    if (clearInventoryForm) {
        clearInventoryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const productName = document.getElementById('productName').value;
            const productID = document.getElementById('productID').value;

            fetch('http://127.0.0.1:8000/api/clearInventory', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    productName,
                    productID
                })
            })
            .then(response => response.json())
            .then(data => {
                document.getElementById('message').innerText = data.message;
            });
        });
    }

    const salesReportTable = document.getElementById('salesReportTable').getElementsByTagName('tbody')[0];
    if (salesReportTable) {
       fetch('http://127.0.0.1:8000/api/sales_report')
            .then(response => response.json())
            .then(data => {
                 data.forEach(item => {
                    const row = salesReportTable.insertRow();
                row.insertCell(0).innerText = item.ProductID;
                row.insertCell(1).innerText = item.Name;
                row.insertCell(2).innerText = item.CategoryName;
                row.insertCell(3).innerText = item.Price;
                row.insertCell(4).innerText = item.QuantitySold;
                row.insertCell(5).innerText = item.QuantityInStock;
                row.insertCell(6).innerText = item.SellingPrice;
                row.insertCell(7).innerText = item.Revenue;
                row.insertCell(8).innerText = item.Profit;
                 });
                
            })
            .catch(error => {
            console.error('Error:', error);
            });
        }

    const displaySuppliers = document.getElementById('supplierContent');
    if (displaySuppliers) {
        fetch('http://127.0.0.1:8000/api/suppliers')
            .then(response => response.json())
            .then(data => {
                let table = '<table><tr><th>Supplier ID</th><th>Name</th><th>Contact Name</th><th>Contact Number</th><th>Email</th><th>Address</th></tr>';
                data.forEach(item => {
                    table += `
                        <tr>
                            <td>${item.SupplierID}</td>
                            <td>${item.Name}</td>
                            <td>${item.ContactName}</td>
                            <td>${item.ContactNumber}</td>
                            <td>${item.Email}</td>
                            <td>${item.Address}</td>
                        </tr>
                    `;
                });
                table += '</table>';
                displaySuppliers.innerHTML = table;
            });
    }
    

    const searchProductForm = document.getElementById('searchProductForm');
    if (searchProductForm) {
        searchProductForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const productName = document.getElementById('productName').value;

            fetch('http://127.0.0.1:8000/api/searchProduct', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    productName
                })
            })
            .then(response => response.json())
            .then(data => {
                let table = '<table><tr><th>Product ID</th><th>Name</th><th>Description</th><th>Category</th><th>Supplier</th><th>Stock</th><th>Cost Price</th><th>Last Updated</th></tr>';
                data.forEach(item => {
                    table += `
                        <tr>
                            <td>${item.ProductID}</td>
                            <td>${item.Name}</td>
                            <td>${item.Description}</td>
                            <td>${item.CategoryName}</td>
                            <td>${item.SupplierName}</td>
                            <td>${item.QuantityInStock}</td>
                            <td>${item.Price}</td>
                            <td>${item.LastUpdates}</td>
                        </tr>
                    `;
                });
                document.getElementById('searchResults').innerHTML = table;
            });
        });
    }
});
