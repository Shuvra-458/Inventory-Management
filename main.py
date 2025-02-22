from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import mysql.connector
from mysql.connector import Error
from typing import List

app = FastAPI()
# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Database connection
def connect_database():
    try:
        connection = mysql.connector.connect(
            host='127.0.0.1',
            database='Inventory',
            user='root',
            password='shuvra'
        )
        if connection.is_connected():
            return connection
    except Error as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Database connection failed")

# Pydantic models
class Login(BaseModel):
    username: str
    password: str

class AddProduct(BaseModel):
    productName: str
    productDescription: str
    sellingPrice: float
    costPrice: float
    initialStock: int
    expiryDate: str
    categoryName: str
    supplierName: str
    contactName: str
    contactNumber: str
    email: str
    address: str

class InventoryItem(BaseModel):
    ProductID: int
    Name: str
    Description: str
    CategoryName: str
    SupplierName: str
    QuantityInStock: int
    Price: float
    LastUpdates: str

class SellProduct(BaseModel):
    productID: int
    quantity: int
    sellingPrice: float

class ClearInventory(BaseModel):
    productID: int
    productName: str

class Supplier(BaseModel):
    SupplierID: int
    Name: str
    ContactName: str
    ContactNumber: str
    Email: str
    Address: str

class SearchProduct(BaseModel):
    productName: str

@app.post("/api/login")
def login(login: Login):
    connection = connect_database()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute("SELECT role FROM Users WHERE username = %s AND password = %s", (login.username, login.password))
        user = cursor.fetchone()
        if user:
            return {"success": True, "role": user["role"]}
        else:
            return {"success": False, "message": "Invalid credentials"}
    except Error as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Login failed")
    finally:
        cursor.close()
        connection.close()

@app.post("/api/add_product")
def add_product(product: AddProduct):
    connection = connect_database()
    cursor = connection.cursor()

    try:
        # Get or create category ID
        cursor.execute("SELECT CategoryID FROM Categories WHERE CategoryName = %s", (product.categoryName,))
        result = cursor.fetchone()
        if result:
            categoryID = result[0]
        else:
            cursor.execute("INSERT INTO Categories (CategoryName) VALUES (%s)", (product.categoryName,))
            connection.commit()
            cursor.execute("SELECT LAST_INSERT_ID()")
            categoryID = cursor.fetchone()[0]

        # Get or create supplier ID
        cursor.execute("SELECT SupplierID FROM Suppliers WHERE Name = %s", (product.supplierName,))
        result = cursor.fetchone()
        if result:
            supplierID = result[0]
        else:
            cursor.execute(
                "INSERT INTO Suppliers (Name, ContactName, ContactNumber, Email, Address) VALUES (%s, %s, %s, %s, %s)",
                (product.supplierName, product.contactName, product.contactNumber, product.email, product.address)
            )
            connection.commit()
            cursor.execute("SELECT LAST_INSERT_ID()")
            supplierID = cursor.fetchone()[0]

        # Check if the product already exists
        cursor.execute(
            "SELECT ProductID FROM Products WHERE Name = %s AND Description = %s AND CategoryID = %s AND SupplierID = %s",
            (product.productName, product.productDescription, categoryID, supplierID)
        )
        result = cursor.fetchone()

        if result:
            # Product exists, update the stock
            productID = result[0]
            cursor.execute(
                "UPDATE Inventory SET QuantityInStock = QuantityInStock + %s WHERE ProductID = %s",
                (product.initialStock, productID)
            )
            connection.commit()
            return {"message": "Stock updated successfully for existing product!"}
        else:
            # Product does not exist, insert new product
            cursor.execute(
                "INSERT INTO Products (Name, Description, Price, CategoryID, SupplierID, ExpiryDate) VALUES (%s, %s, %s, %s, %s, %s)",
                (product.productName, product.productDescription, product.sellingPrice, categoryID, supplierID, product.expiryDate)
            )
            connection.commit()
            cursor.execute("SELECT LAST_INSERT_ID()")
            productID = cursor.fetchone()[0]

            # Insert into Purchases table
            cursor.execute(
                "INSERT INTO Purchases (ProductID, SupplierID, Quantity, CostPrice) VALUES (%s, %s, %s, %s)",
                (productID, supplierID, product.initialStock, product.costPrice)
            )
            connection.commit()

            # Insert into Inventory
            cursor.execute("INSERT INTO Inventory (ProductID, QuantityInStock) VALUES (%s, %s)", (productID, product.initialStock))
            connection.commit()

            return {"message": "Product added successfully!"}
    except Error as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to add product")
    finally:
        cursor.close()
        connection.close()

@app.get("/api/inventory", response_model=List[InventoryItem])
def display_inventory():
    connection = connect_database()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(
            "SELECT Products.ProductID, Products.Name, Products.Description, Categories.CategoryName, Suppliers.Name AS SupplierName, Inventory.QuantityInStock, Products.Price, Inventory.LastUpdates "
            "FROM Inventory "
            "JOIN Products ON Inventory.ProductID = Products.ProductID "
            "JOIN Categories ON Products.CategoryID = Categories.CategoryID "
            "JOIN Suppliers ON Products.SupplierID = Suppliers.SupplierID"
        )
        inventory = cursor.fetchall()
        # Convert LastUpdates to string
        for item in inventory:
            if item['LastUpdates'] is not None:
               item['LastUpdates'] = item['LastUpdates'].strftime('%Y-%m-%d %H:%M:%S')
            else:
               item['LastUpdates'] = 'N/A'
        return inventory
    except Error as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch inventory")
    finally:
        cursor.close()
        connection.close()

@app.post("/api/sell_product")
def sell_product(sell: SellProduct):
    connection = connect_database()
    cursor = connection.cursor()

    try:
        # Check if enough stock is available
        cursor.execute("SELECT QuantityInStock FROM Inventory WHERE ProductID = %s", (sell.productID,))
        result = cursor.fetchone()

        if result:
            currentStock = result[0]
            if currentStock < sell.quantity:
                raise HTTPException(status_code=400, detail="Not enough stock available")
        else:
            raise HTTPException(status_code=404, detail="Product not found in inventory")

        # Insert into Sales table
        cursor.execute(
            "INSERT INTO Sales (ProductID, QuantitySold, SellingPrice) VALUES (%s, %s, %s)",
            (sell.productID, sell.quantity, sell.sellingPrice)
        )
        connection.commit()

        # Update Inventory
        cursor.execute(
            "UPDATE Inventory SET QuantityInStock = QuantityInStock - %s WHERE ProductID = %s",
            (sell.quantity, sell.productID)
        )
        connection.commit()

        return {"message": "Sale recorded successfully!"}
    except Error as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to record sale")
    finally:
        cursor.close()
        connection.close()

@app.get("/api/sales_report")
def generate_sales_report():
    connection = connect_database()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(
            "SELECT Sales.ProductID, Products.Name, Categories.CategoryName, Products.Price, Sales.QuantitySold, Inventory.QuantityInStock, Sales.SellingPrice, "
            "Sales.QuantitySold * Sales.SellingPrice AS Revenue, "
            "(Sales.SellingPrice - Products.Price) * Sales.QuantitySold AS Profit "
            "FROM Sales "
            "JOIN Products ON Sales.ProductID = Products.ProductID "
            "JOIN Categories ON Products.CategoryID = Categories.CategoryID "
            "JOIN Inventory ON Sales.ProductID = Inventory.ProductID"
        )
        sales_report = cursor.fetchall()
        return sales_report
    except Error as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate sales report")
    finally:
        cursor.close()
        connection.close()

@app.post("/api/clear_inventory")
def clear_inventory(clear: ClearInventory):
    connection = connect_database()
    cursor = connection.cursor()

    try:
        cursor.execute(
            "DELETE FROM Inventory WHERE ProductID = %s AND ProductID IN (SELECT ProductID FROM Products WHERE Name = %s)",
            (clear.productID, clear.productName)
        )
        connection.commit()
        rows_affected = cursor.rowcount

        if rows_affected > 0:
            return {"success": True, "message": f"Product with ID {clear.productID} and Name '{clear.productName}' cleared from inventory successfully!"}
        else:
            raise HTTPException(status_code=404, detail="No matching product found in inventory")
    except Error as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to clear inventory")
    finally:
        cursor.close()
        connection.close()

@app.get("/api/suppliers", response_model=list[Supplier])
def get_suppliers():
    connection = connect_database()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(
            "SELECT SupplierID, Name, ContactName, ContactNumber, Email, Address FROM Suppliers"
        )
        suppliers = cursor.fetchall()
        return suppliers
    except Error as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve suppliers")
    finally:
        cursor.close()
        connection.close()
        
@app.post("/api/search_product")
def search_product(search: SearchProduct):
    connection = connect_database()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(
            "SELECT Products.ProductID, Products.Name, Products.Description, Categories.CategoryName, Suppliers.Name AS SupplierName, Inventory.QuantityInStock, Purchases.CostPrice, Inventory.LastUpdates "
            "FROM Inventory "
            "JOIN Products ON Inventory.ProductID = Products.ProductID "
            "JOIN Categories ON Products.CategoryID = Categories.CategoryID "
            "JOIN Suppliers ON Products.SupplierID = Suppliers.SupplierID "
            "JOIN Purchases ON Inventory.ProductID = Purchases.ProductID "
            "WHERE Products.Name LIKE %s", ("%" + search.productName + "%",)
        )
        results = cursor.fetchall()
        return results
    except Error as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to search product")
    finally:
        cursor.close()
        connection.close()