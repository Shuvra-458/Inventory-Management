document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('addProductForm');
    const message = document.getElementById('message');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const productName = document.getElementById('productName').value;
        const productDescription = document.getElementById('productDescription').value;
        const sellingPrice = document.getElementById('sellingPrice').value;
        const costPrice = document.getElementById('costPrice').value;
        const initialStock = document.getElementById('initialStock').value;
        const expiryDate = document.getElementById('expiryDate').value;
        const categoryName = document.getElementById('categoryName').value;
        const supplierName = document.getElementById('supplierName').value;
        const contactName = document.getElementById('contactName').value;
        const contactNumber = document.getElementById('contactNumber').value;
        const email = document.getElementById('email').value;
        const address = document.getElementById('address').value;

        try {
            const response = await fetch('http://127.0.0.1:8000/api/add_product', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    productName,
                    productDescription,
                    sellingPrice: parseFloat(sellingPrice),
                    costPrice: parseFloat(costPrice),
                    initialStock: parseInt(initialStock),
                    expiryDate,
                    categoryName,
                    supplierName,
                    contactName,
                    contactNumber,
                    email,
                    address
                })
            });

            const data = await response.json();
            if (response.ok) {
                message.innerText = data.message;
                message.style.color = 'green';
            } else {
                message.innerText = data.detail;
                message.style.color = 'red';
            }
        } catch (error) {
            console.error('Error:', error);
            message.innerText = 'An error occurred while adding the product.';
            message.style.color = 'red';
        }
    });
    const toggleDarkMode = document.createElement("button");
    toggleDarkMode.innerText = "🌙 Toggle Dark Mode";
    toggleDarkMode.style.cssText = "position: fixed; top: 20px; right: 20px; padding: 10px 15px; font-size: 14px; cursor: pointer; background: #444; color: white; border: none; border-radius: 5px;";
    
    document.body.appendChild(toggleDarkMode);

    toggleDarkMode.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
    });
});

