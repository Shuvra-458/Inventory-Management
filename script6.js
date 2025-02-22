document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('searchProductForm');
    const resultsTableBody = document.querySelector('#resultsTable tbody');  // ✅ Select tbody

    if (!resultsTableBody) {
        console.error("❌ Error: Table body not found in the DOM.");
        return;
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const productName = document.getElementById('productName').value;

        try {
            const response = await fetch('http://127.0.0.1:8000/api/search_product', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ productName })
            });

            const data = await response.json();
            resultsTableBody.innerHTML = ''; // ✅ Clear previous results

            if (response.ok) {
                console.log("✅ Search Results:", data);
                if (data.length === 0) {
                    resultsTableBody.innerHTML = `<tr><td colspan="8" style="color: red; text-align: center;">No products found.</td></tr>`;
                    return;
                }

                data.forEach(product => {
                    const row = resultsTableBody.insertRow();
                    row.insertCell(0).innerText = product.ProductID;
                    row.insertCell(1).innerText = product.Name;
                    row.insertCell(2).innerText = product.Description;
                    row.insertCell(3).innerText = product.CategoryName;
                    row.insertCell(4).innerText = product.SupplierName;
                    row.insertCell(5).innerText = product.QuantityInStock;
                    row.insertCell(6).innerText = product.CostPrice;
                    row.insertCell(7).innerText = product.LastUpdates;
                });
            } else {
                resultsTableBody.innerHTML = `<tr><td colspan="8" style="color: red; text-align: center;">${data.detail || "Search failed."}</td></tr>`;
            }
        } catch (error) {
            console.error('❌ Fetch Error:', error);
            resultsTableBody.innerHTML = '<tr><td colspan="8" style="color: red; text-align: center;">An error occurred while searching for the product.</td></tr>';
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
