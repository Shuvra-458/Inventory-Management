document.addEventListener('DOMContentLoaded', () => {
    const suppliersTable = document.getElementById('suppliersTable').getElementsByTagName('tbody')[0];

    fetch('http://127.0.0.1:8000/api/suppliers')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            suppliersTable.innerHTML = ""; // ✅ Clear old data before inserting new ones

            if (data.length === 0) {
                suppliersTable.innerHTML = `<tr><td colspan="6" style="text-align:center; color:red;">No suppliers found.</td></tr>`;
                return;
            }

            data.forEach(supplier => {
                const row = suppliersTable.insertRow();
                row.insertCell(0).innerText = supplier.SupplierID;
                row.insertCell(1).innerText = supplier.Name;
                row.insertCell(2).innerText = supplier.ContactName || "N/A";  // ✅ Prevents undefined errors
                row.insertCell(3).innerText = supplier.ContactNumber || "N/A";
                row.insertCell(4).innerText = supplier.Email || "N/A";
                row.insertCell(5).innerText = supplier.Address || "N/A";
            });
        })
        .catch(error => {
            console.error('Error:', error);
            suppliersTable.innerHTML = `<tr><td colspan="6" style="text-align:center; color:red;">Error loading suppliers.</td></tr>`;
        });

    // 🌙 Dark Mode Toggle
    const toggleDarkMode = document.createElement("button");
    toggleDarkMode.innerText = "🌙 Toggle Dark Mode";
    toggleDarkMode.style.cssText = "position: fixed; top: 20px; right: 20px; padding: 10px 15px; font-size: 14px; cursor: pointer; background: #444; color: white; border: none; border-radius: 5px;";
    
    document.body.appendChild(toggleDarkMode);

    // 🌙 Load Dark Mode Preference from Local Storage
    if (localStorage.getItem("dark-mode") === "enabled") {
        document.body.classList.add("dark-mode");
    }

    toggleDarkMode.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        // 🌙 Save User Preference
        if (document.body.classList.contains("dark-mode")) {
            localStorage.setItem("dark-mode", "enabled");
        } else {
            localStorage.setItem("dark-mode", "disabled");
        }
    });
});
