document.getElementById('addProduct').addEventListener('click', () => {
    const contentDiv = document.getElementById('content');
    contentDiv.innerHTML = `
        <h2>Add Product</h2>
        <form id="addProductForm">
            <input type="text" id="productName" placeholder="Product Name" required>
            <input type="text" id="productDescription" placeholder="Description" required>
            <input type="number" id="sellingPrice" placeholder="Selling Price" required>
            <input type="number" id="costPrice" placeholder="Cost Price" required>
            <input type="number" id="initialStock" placeholder="Initial Stock Quantity" required>
            <input type="date" id="expiryDate" placeholder="Expiry Date" required>
            <button type="submit">Add Product</button>
        </form>
    `;

    document.getElementById('addProductForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const productName = document.getElementById('productName').value;
        const productDescription = document.getElementById('productDescription').value;
        const sellingPrice = document.getElementById('sellingPrice').value;
        const costPrice = document.getElementById('costPrice').value;
        const initialStock = document.getElementById('initialStock').value;
        const expiryDate = document.getElementById('expiryDate').value;

        fetch('/api/addProduct', {
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
                expiryDate
            })
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
        });
    });
});

document.getElementById('displayInventory').addEventListener('click', () => {
    fetch('/api/inventory')
        .then(response => response.json())
        .then(data => {
            const contentDiv = document.getElementById('content');
            contentDiv.innerHTML = '<h2>Inventory Details</h2>';
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
            table += '</table>';
            contentDiv.innerHTML += table;
        });
});

document.getElementById('generateReport').addEventListener('click', () => {
    fetch('/api/generateReport')
        .then(response => response.json())
        .then(data => {
            const contentDiv = document.getElementById('content');
            contentDiv.innerHTML = '<h2>Sales Report</h2>';
            let table = '<table><tr><th>Product ID</th><th>Name</th><th>Category</th><th>Cost Price</th><th>Quantity Sold</th><th>Quantity Left</th><th>Selling Price</th><th>Revenue</th><th>Profit</th></tr>';
            data.forEach(item => {
                table += `
                    <tr>
                        <td>${item.ProductID}</td>
                        <td>${item.Name}</td>
                        <td>${item.CategoryName}</td>
                        <td>${item.Price}</td>
                        <td>${item.QuantitySold}</td>
                        <td>${item.QuantityInStock}</td>
                        <td>${item.SellingPrice}</td>
                        <td>${item.Revenue}</td>
                        <td>${item.Profit}</td>
                    </tr>
                `;
            });
            table += '</table>';
            contentDiv.innerHTML += table;
        });
});

document.getElementById('sellProduct').addEventListener('click', () => {
    const contentDiv = document.getElementById('content');
    contentDiv.innerHTML = `
        <h2>Sell Product</h2>
        <form id="sellProductForm">
            <input type="number" id="productID" placeholder="Product ID" required>
            <input type="number" id="quantitySold" placeholder="Quantity Sold" required>
            <input type="number" id="sellingPrice" placeholder="Selling Price" required>
            <button type="submit">Sell Product</button>
        </form>
    `;

    document.getElementById('sellProductForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const productID = document.getElementById('productID').value;
        const quantitySold = document.getElementById('quantitySold').value;
        const sellingPrice = document.getElementById('sellingPrice').value;

        fetch('/api/sellProduct', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                productID,
                quantitySold,
                sellingPrice
            })
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
        });
    });
});

document.getElementById('clearInventory').addEventListener('click', () => {
    const contentDiv = document.getElementById('content');
    contentDiv.innerHTML = `
        <h2>Clear Inventory</h2>
        <form id="clearInventoryForm">
            <input type="text" id="productName" placeholder="Product Name" required>
            <input type="number" id="productID" placeholder="Product ID" required>
            <button type="submit">Clear Inventory</button>
        </form>
    `;

    document.getElementById('clearInventoryForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const productName = document.getElementById('productName').value;
        const productID = document.getElementById('productID').value;

        fetch('/api/clearInventory', {
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
            alert(data.message);
        });
    });
});

document.getElementById('displaySupplierDetails').addEventListener('click', () => {
    fetch('/api/supplierDetails')
        .then(response => response.json())
        .then(data => {
            const contentDiv = document.getElementById('content');
            contentDiv.innerHTML = '<h2>Supplier Details</h2>';
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
            contentDiv.innerHTML += table;
        });
});

document.getElementById('searchProduct').addEventListener('click', () => {
    const contentDiv = document.getElementById('content');
    contentDiv.innerHTML = `
        <h2>Search Product</h2>
        <form id="searchProductForm">
            <input type="text" id="searchProductName" placeholder="Product Name" required>
            <button type="submit">Search</button>
        </form>
    `;

    document.getElementById('searchProductForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const productName = document.getElementById('searchProductName').value;

        fetch(`/api/searchProduct?name=${productName}`)
        .then(response => response.json())
        .then(data => {
            const contentDiv = document.getElementById('content');
            contentDiv.innerHTML = '<h2>Search Results</h2>';
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
            table += '</table>';
            contentDiv.innerHTML += table;
        });
    });
});
