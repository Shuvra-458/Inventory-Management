document.addEventListener("DOMContentLoaded", function () {
    const table = document.getElementById('salesReportTable');
    if (!table) {
        console.error("Table element not found!");
        return;
    }
    
    const salesReportTable = table.getElementsByTagName('tbody')[0];

    fetch('inventory-management-production-a492.up.railway.app/api/sales_report')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Fetched Data:", data); // Debugging
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
            console.error("Error fetching sales report:", error);
        });
    const toggleDarkMode = document.createElement("button");
    toggleDarkMode.innerText = "🌙 Toggle Dark Mode";
    toggleDarkMode.style.cssText = "position: fixed; top: 20px; right: 20px; padding: 10px 15px; font-size: 14px; cursor: pointer; background: #444; color: white; border: none; border-radius: 5px;";
    
    document.body.appendChild(toggleDarkMode);

    toggleDarkMode.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
    });
});
