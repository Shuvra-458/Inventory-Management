#include <iostream>
#include <windows.h> // Required for Windows linking
#include <mysql/jdbc.h> // MySQL Connector for C++
#include<iomanip>

using namespace std;
struct User {
    int userID;
    string username;
    string role;
};

sql::Connection* connectDatabase() {
    try {
        string username, password, role;
        int attempts = 3;  // Limit login attempts

        sql::Driver* driver = sql::mysql::get_mysql_driver_instance();
        sql::Connection* con = driver->connect("tcp://127.0.0.1:3306", "root", "shuvra");
        con->setSchema("Inventory");

        // User login loop with limited attempts
        while (attempts > 0) {
            cout << "Enter MySQL Username: ";
            cin >> username;
            cout << "Enter Password: ";
            cin >> password;
            cout << "Enter Role (admin/manager/employee): ";
            cin >> role;

            // Check if the user exists in the Users table
            sql::PreparedStatement* pstmt = con->prepareStatement(
                "SELECT role FROM Users WHERE username = ? AND password = ?"
            );
            pstmt->setString(1, username);
            pstmt->setString(2, password);
            sql::ResultSet* res = pstmt->executeQuery();

            if (res->next()) {
                string dbRole = res->getString("role");
                if (dbRole == role) {
                    cout << "Connected successfully as " << username << " with role: " << role << "!\n";
                    delete pstmt;
                    delete res;
                    return con;
                }
                else {
                    cout << "Error: Role mismatch! " << --attempts << " attempts remaining.\n";
                }
            }
            else {
                cout << "Error: Invalid credentials! " << --attempts << " attempts remaining.\n";
            }

            delete pstmt;
            delete res;
        }

        cout << "Too many failed attempts! Exiting...\n";
        exit(1);
    }
    catch (sql::SQLException& e) {
        cout << "Error: Could not connect to database! " << e.what() << endl;
        exit(1);
    }
}





// Function to Get or Create a CategoryID
int getOrCreateCategoryID(sql::Connection* con) {
    string categoryName;
    cout << "Enter Category Name: "; cin >> ws; getline(cin, categoryName);

    sql::PreparedStatement* stmt = con->prepareStatement("SELECT CategoryID FROM Categories WHERE CategoryName = ?");
    stmt->setString(1, categoryName);
    sql::ResultSet* res = stmt->executeQuery();

    if (res->next()) {
        int categoryID = res->getInt("CategoryID");
        delete res;
        delete stmt;
        return categoryID;
    }

    stmt = con->prepareStatement("INSERT INTO Categories (CategoryName) VALUES (?)");
    stmt->setString(1, categoryName);
    stmt->executeUpdate();
    delete stmt;

    stmt = con->prepareStatement("SELECT LAST_INSERT_ID()");
    res = stmt->executeQuery();
    res->next();
    int newCategoryID = res->getInt(1);

    delete res;
    delete stmt;
    return newCategoryID;
}

// Function to Get or Create a SupplierID
int getOrCreateSupplierID(sql::Connection* con) {
    string supplierName, contactName, contactNumber, email, address;
    cout << "Enter Supplier Name: "; cin >> ws; getline(cin, supplierName);

    sql::PreparedStatement* stmt = con->prepareStatement("SELECT SupplierID FROM Suppliers WHERE Name = ?");
    stmt->setString(1, supplierName);
    sql::ResultSet* res = stmt->executeQuery();

    if (res->next()) {
        int supplierID = res->getInt("SupplierID");
        delete res;
        delete stmt;
        return supplierID;
    }

    cout << "Enter Contact Name: "; getline(cin, contactName);
    cout << "Enter Contact Number: "; getline(cin, contactNumber);
    cout << "Enter Email: "; getline(cin, email);
    cout << "Enter Address: "; getline(cin, address);

    stmt = con->prepareStatement("INSERT INTO Suppliers (Name, ContactName, ContactNumber, Email, Address) VALUES (?, ?, ?, ?, ?)");
    stmt->setString(1, supplierName);
    stmt->setString(2, contactName);
    stmt->setString(3, contactNumber);
    stmt->setString(4, email);
    stmt->setString(5, address);
    stmt->executeUpdate();
    delete stmt;

    stmt = con->prepareStatement("SELECT LAST_INSERT_ID()");
    res = stmt->executeQuery();
    res->next();
    int newSupplierID = res->getInt(1);

    delete res;
    delete stmt;
    return newSupplierID;
}
// Function to Add a Product and Update Inventory
void addProduct(sql::Connection* con) {
    try {
        int categoryID = getOrCreateCategoryID(con);
        int supplierID = getOrCreateSupplierID(con);

        string name, desc, expiryDate;
        double price, costPrice;
        int initialStock;

        cout << "Enter Product Name: "; getline(cin, name);
        cout << "Enter Description: "; getline(cin, desc);
        cout << "Enter Selling Price: "; cin >> price;
        cout << "Enter Cost Price (Buying Price): "; cin >> costPrice;
        cout << "Enter Initial Stock Quantity: "; cin >> initialStock;
        cout << "Enter Expiry Date (YYYY-MM-DD): "; cin >> expiryDate;

        // Check if the product already exists
        sql::PreparedStatement* pstmt = con->prepareStatement(
            "SELECT ProductID FROM Products WHERE Name = ? AND Description = ? AND CategoryID = ? AND SupplierID = ?");
        pstmt->setString(1, name);
        pstmt->setString(2, desc);
        pstmt->setInt(3, categoryID);
        pstmt->setInt(4, supplierID);
        sql::ResultSet* res = pstmt->executeQuery();

        if (res->next()) {
            // Product exists, update the stock
            int productID = res->getInt("ProductID");
            delete res;
            delete pstmt;

            pstmt = con->prepareStatement(
                "UPDATE Inventory SET QuantityInStock = QuantityInStock + ? WHERE ProductID = ?");
            pstmt->setInt(1, initialStock);
            pstmt->setInt(2, productID);
            pstmt->executeUpdate();
            delete pstmt;

            cout << "Stock updated successfully for existing product!\n";
        }
        else {
            // Product does not exist, insert new product
            delete res;
            delete pstmt;

            pstmt = con->prepareStatement(
                "INSERT INTO Products (Name, Description, Price, CategoryID, SupplierID, ExpiryDate) VALUES (?, ?, ?, ?, ?, ?)");
            pstmt->setString(1, name);
            pstmt->setString(2, desc);
            pstmt->setDouble(3, price);
            pstmt->setInt(4, categoryID);
            pstmt->setInt(5, supplierID);
            pstmt->setString(6, expiryDate);
            pstmt->executeUpdate();
            delete pstmt;
            cout << "Product Added Successfully!\n";

            // Get Last Inserted ProductID
            pstmt = con->prepareStatement("SELECT LAST_INSERT_ID()");
            res = pstmt->executeQuery();
            res->next();
            int productID = res->getInt(1);
            delete res;
            delete pstmt;

            // Insert into Purchases table
            pstmt = con->prepareStatement(
                "INSERT INTO Purchases (ProductID, SupplierID, Quantity, CostPrice) VALUES (?, ?, ?, ?)");
            pstmt->setInt(1, productID);
            pstmt->setInt(2, supplierID);
            pstmt->setInt(3, initialStock);
            pstmt->setDouble(4, costPrice);
            pstmt->executeUpdate();
            delete pstmt;

            // Insert into Inventory
            pstmt = con->prepareStatement("INSERT INTO Inventory (ProductID, QuantityInStock) VALUES (?, ?)");
            pstmt->setInt(1, productID);
            pstmt->setInt(2, initialStock);
            pstmt->executeUpdate();
            delete pstmt;

            cout << "Product Added Successfully!\n";
        }
    }
    catch (sql::SQLException& e) {
        cout << "Error: " << e.what() << endl;
    }
}





// Function to Display Inventory
void displayInventory(sql::Connection* con) {
    try {
        sql::Statement* stmt = con->createStatement();
        sql::ResultSet* res = stmt->executeQuery(
            "SELECT Products.ProductID, Products.Name, Products.Description, Categories.CategoryName, Suppliers.Name AS SupplierName, Inventory.QuantityInStock, Products.Price, Inventory.LastUpdates "
            "FROM Inventory "
            "JOIN Products ON Inventory.ProductID = Products.ProductID "
            "JOIN Categories ON Products.CategoryID = Categories.CategoryID "
            "JOIN Suppliers ON Products.SupplierID = Suppliers.SupplierID"
        );

        cout << "\nInventory Details:\n";
        cout << "---------------------------------------------------------------------------------------------------------------------------------\n";
        cout << std::left << std::setw(10) << "ProductID" << " | "
            << std::setw(15) << "Name" << " | "
            << std::setw(30) << "Description" << " | "
            << std::setw(15) << "Category" << " | "
            << std::setw(20) << "Supplier" << " | "
            << std::setw(10) << "Stock" << " | "
            << std::setw(15) << "Cost Price" << " | "
            << std::setw(15) << "Last Updated" << "\n";
        cout << "---------------------------------------------------------------------------------------------------------------------------------\n";
        while (res->next()) {
            cout << std::left << std::setw(10) << res->getInt("ProductID") << " | "
                << std::setw(15) << res->getString("Name") << " | "
                << std::setw(30) << res->getString("Description") << " | "
                << std::setw(15) << res->getString("CategoryName") << " | "
                << std::setw(20) << res->getString("SupplierName") << " | "
                << std::setw(10) << res->getInt("QuantityInStock") << " | "
                << std::setw(15) << res->getDouble("Price") << " | "
                << std::setw(15) << res->getString("LastUpdates") << "\n";
            if (res->getInt("QuantityInStock") <= 0) {
                cout << " Low stock! Consider reordering." << endl;
            }
        }

        delete res;
        delete stmt;
    }
    catch (sql::SQLException& e) {
        cout << "Error: " << e.what() << endl;
    }
}

// Function to Display Supplier Details
void displaySupplierDetails(sql::Connection* con) {
    try {
        sql::Statement* stmt = con->createStatement();
        sql::ResultSet* res = stmt->executeQuery(
            "SELECT Suppliers.SupplierID, Suppliers.Name, Suppliers.ContactName, Suppliers.ContactNumber, Suppliers.Email, Suppliers.Address "
            "FROM Suppliers"
        );

        cout << "\nSupplier Details:\n";
        cout << "------------------------------------------------------------------------------------------------------\n";
        cout << std::left << std::setw(10) << "SupplierID" << " | "
            << std::setw(20) << "Name" << " | "
            << std::setw(30) << "Contact Name" << " | "
            << std::setw(15) << "Contact Number" << " | "
            << std::setw(25) << "Email" << " | "
            << std::setw(30) << "Address" << "\n";
        cout << "------------------------------------------------------------------------------------------------------\n";
        while (res->next()) {
            cout << std::left << std::setw(10) << res->getInt("SupplierID") << " | "
                << std::setw(20) << res->getString("Name") << " | "
                << std::setw(30) << res->getString("ContactName") << " | "
                << std::setw(15) << res->getString("ContactNumber") << " | "
                << std::setw(25) << res->getString("Email") << " | "
                << std::setw(30) << res->getString("Address") << "\n";
        }

        delete res;
        delete stmt;
    }
    catch (sql::SQLException& e) {
        cout << "Error: " << e.what() << endl;
    }
}

// Function to Search for a Product by Name
void searchProduct(sql::Connection* con) {
    try {
        string productName;
        cout << "Enter Product Name to search: ";
        cin >> ws; // To consume any leading whitespace
        getline(cin, productName);

        sql::PreparedStatement* pstmt = con->prepareStatement(
            "SELECT Products.ProductID, Products.Name, Products.Description, Categories.CategoryName, Suppliers.Name AS SupplierName, Inventory.QuantityInStock, Products.Price, Inventory.LastUpdates "
            "FROM Inventory "
            "JOIN Products ON Inventory.ProductID = Products.ProductID "
            "JOIN Categories ON Products.CategoryID = Categories.CategoryID "
            "JOIN Suppliers ON Products.SupplierID = Suppliers.SupplierID "
            "WHERE Products.Name LIKE ?");
        pstmt->setString(1, "%" + productName + "%");
        sql::ResultSet* res = pstmt->executeQuery();

        cout << "\nSearch Results:\n";
        cout << "---------------------------------------------------------------------------------------------------------------------------------\n";
        cout << std::left << std::setw(10) << "ProductID" << " | "
            << std::setw(15) << "Name" << " | "
            << std::setw(30) << "Description" << " | "
            << std::setw(15) << "Category" << " | "
            << std::setw(20) << "Supplier" << " | "
            << std::setw(10) << "Stock" << " | "
            << std::setw(15) << "Cost Price" << " | "
            << std::setw(15) << "Last Updated" << "\n";
        cout << "---------------------------------------------------------------------------------------------------------------------------------\n";
        while (res->next()) {
            cout << std::left << std::setw(10) << res->getInt("ProductID") << " | "
                << std::setw(15) << res->getString("Name") << " | "
                << std::setw(30) << res->getString("Description") << " | "
                << std::setw(15) << res->getString("CategoryName") << " | "
                << std::setw(20) << res->getString("SupplierName") << " | "
                << std::setw(10) << res->getInt("QuantityInStock") << " | "
                << std::setw(15) << res->getDouble("Price") << " | "
                << std::setw(15) << res->getString("LastUpdates") << "\n";
        }

        delete res;
        delete pstmt;
    }
    catch (sql::SQLException& e) {
        cout << "Error: " << e.what() << endl;
    }
}






void sellProduct(sql::Connection* con) {
    try {
        int productID, quantity = 0;
        double sellingPrice;

        cout << "Enter Product ID to Sell: ";
        cin >> productID;
        cout << "Enter Quantity Sold: ";
        cin >> quantity;
        cout << "Enter Selling Price: ";
        cin >> sellingPrice;

        // Check if enough stock is available
        sql::PreparedStatement* pstmt = con->prepareStatement(
            "SELECT QuantityInStock FROM Inventory WHERE ProductID = ?");
        pstmt->setInt(1, productID);
        sql::ResultSet* res = pstmt->executeQuery();

        if (res->next()) {
            int currentStock = res->getInt("QuantityInStock");
            delete res;
            delete pstmt;

            if (currentStock < quantity) {
                cout << "Error: Not enough stock available!\n";
                return;
            }
        }
        else {
            cout << "Error: Product not found in inventory!\n";
            delete res;
            delete pstmt;
            return;
        }

        // Insert into Sales table
        pstmt = con->prepareStatement(
            "INSERT INTO Sales (ProductID, QuantitySold, SellingPrice) VALUES (?, ?, ?)");
        pstmt->setInt(1, productID);
        pstmt->setInt(2, quantity);
        pstmt->setDouble(3, sellingPrice);
        pstmt->executeUpdate();
        delete pstmt;

        // Update Inventory
        pstmt = con->prepareStatement(
            "UPDATE Inventory SET QuantityInStock = QuantityInStock - ? WHERE ProductID = ?");
        pstmt->setInt(1, quantity);
        pstmt->setInt(2, productID);
        pstmt->executeUpdate();
        delete pstmt;

        cout << "Sale Recorded Successfully!\n";
    }
    catch (sql::SQLException& e) {
        cout << "Error: " << e.what() << endl;
    }
}



// Function to Generate Sales Report
void generateReport(sql::Connection* con) {
    try {
        sql::Statement* stmt = con->createStatement();
        sql::ResultSet* res = stmt->executeQuery(
            "SELECT Sales.ProductID, Products.Name, Categories.CategoryName, Products.Price, Sales.QuantitySold, Inventory.QuantityInStock, Sales.SellingPrice, "
            "Sales.QuantitySold * Sales.SellingPrice AS Revenue, "
            "(Sales.SellingPrice - Products.Price) * Sales.QuantitySold AS Profit "
            "FROM Sales "
            "JOIN Products ON Sales.ProductID = Products.ProductID "
            "JOIN Categories ON Products.CategoryID = Categories.CategoryID "
            "JOIN Inventory ON Sales.ProductID = Inventory.ProductID"
        );

        cout << "\nSales Report:\n";
        cout << "-----------------------------------------------------------------------------------------------------------------------------\n";
        cout << std::left << std::setw(10) << "ProductID" << " | "
            << std::setw(15) << "Name" << " | "
            << std::setw(15) << "Category" << " | "
            << std::setw(10) << "Cost Price" << " | "
            << std::setw(15) << "Quantity Sold" << " | "
            << std::setw(15) << "Quantity Left" << " | "
            << std::setw(15) << "Selling Price" << " | "
            << std::setw(10) << "Revenue" << " | "
            << std::setw(10) << "Profit" << "\n";
        cout << "-----------------------------------------------------------------------------------------------------------------------------\n";
        while (res->next()) {
            cout << std::left << std::setw(10) << res->getInt("ProductID") << " | "
                << std::setw(15) << res->getString("Name") << " | "
                << std::setw(15) << res->getString("CategoryName") << " | "
                << std::setw(10) << res->getDouble("Price") << " | "
                << std::setw(15) << res->getInt("QuantitySold") << " | "
                << std::setw(15) << res->getInt("QuantityInStock") << " | "
                << std::setw(15) << res->getDouble("SellingPrice") << " | "
                << std::setw(10) << res->getDouble("Revenue") << " | "
                << std::setw(10) << res->getDouble("Profit") << "\n";
        }

        delete res;
        delete stmt;
    }
    catch (sql::SQLException& e) {
        cout << "Error: " << e.what() << endl;
    }
}

// Function to Clear the Contents of the Inventory Table by Product Name and Product ID
void clearInventory(sql::Connection* con, const string& productName, int productID) {
    try {
        sql::PreparedStatement* pstmt = con->prepareStatement(
            "DELETE FROM Inventory WHERE ProductID = ? AND ProductID IN (SELECT ProductID FROM Products WHERE Name = ?)");
        pstmt->setInt(1, productID);
        pstmt->setString(2, productName);
        int rowsAffected = pstmt->executeUpdate();
        if (rowsAffected > 0) {
            cout << "Product with ID " << productID << " and Name '" << productName << "' cleared from inventory successfully!\n";
        }
        else {
            cout << "No matching product found in inventory.\n";
        }
        delete pstmt;
    }
    catch (sql::SQLException& e) {
        cout << "Error: " << e.what() << endl;
    }
}




int main() {
    sql::Connection* con = connectDatabase();  // Connect to MySQL

    int choice;
    string role;

    // Get the role from the database (assuming the role was entered at login)
    cout << "\nEnter your role again for verification (admin/manager/employee): ";
    cin >> role;

    do {
        cout << "\nInventory Management System - Logged in as: " << role << "\n";
        cout << "1. Add Product\n2. Display Inventory\n3. Generate Sales Report\n4. Sell Product\n5. Clear Inventory by Product Name and Product ID\n6. Display Supplier Details\n7. Search Product\n8. Exit\n";
        cout << "Enter your choice: ";
        cin >> choice;

        // Role-based access control
        if (choice == 1) {
            if (role == "Admin" || role == "admin") {
                addProduct(con);
            }
            else {
                cout << "Access Denied! Only Admins can add products.\n";
            }
        }
        else if (choice == 2) {
            displayInventory(con);
        }
        else if (choice == 3) {
            if (role == "Admin" || role == "admin" || role == "Manager" || role == "manager") {
                generateReport(con);
            }
            else {
                cout << "Access Denied! Only Admins and Managers can generate reports.\n";
            }
        }
        else if (choice == 4) {
            if (role == "Admin" || role == "admin" || role == "Manager" || role == "manager" || role == "Employee" || role == "employee") {
                sellProduct(con);
            }
            else {
                cout << "Access Denied! Only Admins, Managers, and Employees can sell products.\n";
            }
        }
        else if (choice == 5) {
            if (role == "Admin" || role == "admin" || role == "Manager" || role == "manager") {
                string productName;
                int productID;
                cout << "Enter Product Name to clear: ";
                cin >> ws; // To consume any leading whitespace
                getline(cin, productName);
                cout << "Enter Product ID to clear: ";
                cin >> productID;
                clearInventory(con, productName, productID);
            }
            else {
                cout << "Access Denied! Only Admins and Managers can clear the inventory.\n";
            }
        }
        else if (choice == 6) {
            if (role == "Admin" || role == "admin" || role == "Manager" || role == "manager") {
                displaySupplierDetails(con);
            }
            else {
                cout << "Access Denied! Only Admins and Managers can view supplier details.\n";
            }
        }
        else if (choice == 7) {
            searchProduct(con);
        }
        else if (choice == 8) {
            cout << "Exiting... Goodbye!\n";
            break;
        }
        else {
            cout << "Invalid choice! Please enter a valid option.\n";
        }
    } while (choice != 8);

    delete con;  // Close database connection
    return 0;
}
