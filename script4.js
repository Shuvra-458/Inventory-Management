document.addEventListener('DOMContentLoaded', () => {
    const sellProductForm = document.getElementById('sellProductForm');
    if (sellProductForm) {
    sellProductForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const productID = document.getElementById('productID').value;
        const quantity = document.getElementById('quantitySold').value;
        const sellingPrice = document.getElementById('sellingPrice').value;

        fetch('https://inventory-management-7wqt.onrender.com/api/sell_product', {
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
            } 
            else {
                document.getElementById('message').innerText = 'Success: ' + data.message;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('message').innerText = 'An error occurred. Please try again.';
        });
    });
    }
    const toggleDarkMode = document.createElement("button");
    toggleDarkMode.innerText = "🌙 Toggle Dark Mode";
    toggleDarkMode.style.cssText = "position: fixed; top: 20px; right: 20px; padding: 10px 15px; font-size: 14px; cursor: pointer; background: #444; color: white; border: none; border-radius: 5px;";
    
    document.body.appendChild(toggleDarkMode);

    toggleDarkMode.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
    });
});
