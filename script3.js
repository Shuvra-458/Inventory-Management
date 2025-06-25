document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('clearInventoryForm');
    const responseMessage = document.getElementById('responseMessage');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const productID = document.getElementById('productID').value;
        const productName = document.getElementById('productName').value;

        try {
            const response = await fetch('https://inventory-management-7wqt.onrender.com/api/clear_inventory', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    productID: parseInt(productID),
                    productName: productName
                })
            });

            const data = await response.json();
            if (response.ok) {
                responseMessage.innerText = data.message;
                responseMessage.style.color = 'green';
            } else {
                responseMessage.innerText = data.detail;
                responseMessage.style.color = 'red';
            }
        } catch (error) {
            console.error('Error:', error);
            responseMessage.innerText = 'An error occurred while clearing the inventory.';
            responseMessage.style.color = 'red';
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

