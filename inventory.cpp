#include <mysql_driver.h>
#include <mysql_connection.h>
#include <cppconn/statement.h>
#include <cppconn/resultset.h>
#include <cppconn/exception.h>
#include <iostream>
#include <iomanip>
#include <limits>

using namespace std;

// Function to add a product
void addProduct(sql::Connection *con) {
    string name, description, categoryName, supplierName;
    double price;
    int categoryID, supplierID, quantity;
    cout << "Enter product name: ";
    cin.ignore();
    getline(cin, name);
    cout << "Enter product description: ";
    getline(cin, description);
    cout << "Enter product price: ";
    cin >> price;
    cout << "Enter product category ID: ";
    cin >> categoryID;
    cout << "Enter supplier ID: ";
    cin >> supplierID;

    sql::Statement *stmt = con->createStatement();
    string query = "INSERT INTO Products (Name, Description, Price, CategoryID, SupplierID) VALUES ('" + name + "', '" + description + "', " + to_string(price) + ", " + to_string(categoryID) + ", " + to_string(supplierID) + ")";
    stmt->execute(query);
    delete stmt;

    cout << "Product added successfully!\n";
}

// Function to view all products
void viewProducts(sql::Connection *con) {
    sql::Statement *stmt = con->createStatement();
    sql::ResultSet *res = stmt->executeQuery("SELECT * FROM Products");

    cout << "ProductID | Name           | Price  | CategoryID | SupplierID\n";
    cout << "------------------------------------------------------------\n";
    while (res->next()) {
        cout << setw(9) << res->getInt("ProductID") << " | "
             << setw(14) << res->getString("Name") << " | "
             << setw(6) << res->getDouble("Price") << " | "
             << setw(10) << res->getInt("CategoryID") << " | "
             << res->getInt("SupplierID") << "\n";
    }

    delete res;
    delete stmt;
}

// Function to update inventory
void updateInventory(sql::Connection *con) {
    int productID, quantity;
    cout << "Enter product ID to update: ";
    cin >> productID;
    cout << "Enter new quantity: ";
    cin >> quantity;

    sql::Statement *stmt = con->createStatement();
    string query = "UPDATE Inventory SET QuantityInStock = " + to_string(quantity) + " WHERE ProductID = " + to_string(productID);
    stmt->execute(query);
    delete stmt;

    cout << "Inventory updated successfully!\n";
}

// Main function
int main() {
    try {
        sql::mysql::MySQL_Driver *driver;
        sql::Connection *con;

        driver = sql::mysql::get_mysql_driver_instance();
        con = driver->connect("tcp://127.0.0.1:3306", "root", "password"); // Replace with your MySQL username and password
        con->setSchema("InventoryDB");

        int choice;
        do {
            cout << "\nInventory Management System\n";
            cout << "1. Add Product\n";
            cout << "2. View Products\n";
            cout << "3. Update Inventory\n";
            cout << "4. Exit\n";
            cout << "Enter your choice: ";
            cin >> choice;

            switch (choice) {
                case 1:
                    addProduct(con);
                    break;
                case 2:
                    viewProducts(con);
                    break;
                case 3:
                    updateInventory(con);
                    break;
                case 4:
                    cout << "Exiting...\n";
                    break;
                default:
                    cout << "Invalid choice! Please try again.\n";
            }
        } while (choice != 4);

        delete con;
    } catch (sql::SQLException &e) {
        cerr << "SQL Error: " << e.what() << endl;
    }

    return 0;
}