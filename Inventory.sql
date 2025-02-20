-- Create the Inventory database
CREATE DATABASE Inventory;

-- Use the Inventory database
USE Inventory;

-- Create the categories table
CREATE TABLE categories (
    CategoryID INT NOT NULL AUTO_INCREMENT,
    CategoryName VARCHAR(100) NOT NULL,
    PRIMARY KEY (CategoryID)
);

-- Create the customers table
CREATE TABLE customers (
    CustomerID INT NOT NULL AUTO_INCREMENT,
    FirstName VARCHAR(100) NOT NULL,
    LastName VARCHAR(100) NOT NULL,
    ContactNumber VARCHAR(15),
    Email VARCHAR(100),
    Address VARCHAR(255),
    PRIMARY KEY (CustomerID)
);

-- Create the inventory table
CREATE TABLE inventory (
    ProductID INT NOT NULL,
    QuantityInStock INT NOT NULL,
    LastUpdates DATETIME DEFAULT CURRENT_TIMESTAMP,
    ReorderLevel INT DEFAULT 0,
    PRIMARY KEY (ProductID)
);

-- Create the products table
CREATE TABLE products (
    ProductID INT NOT NULL AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Description TEXT,
    Price DECIMAL(10, 2) NOT NULL,
    CategoryID INT,
    SupplierID INT,
    ExpiryDate DATE,
    PRIMARY KEY (ProductID),
    FOREIGN KEY (CategoryID) REFERENCES categories(CategoryID),
    FOREIGN KEY (SupplierID) REFERENCES suppliers(SupplierID)
);

-- Create the purchases table
CREATE TABLE purchases (
    PurchaseID INT NOT NULL AUTO_INCREMENT,
    ProductID INT,
    SupplierID INT,
    Quantity INT NOT NULL,
    PurchaseDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    CostPrice DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (PurchaseID),
    FOREIGN KEY (ProductID) REFERENCES products(ProductID),
    FOREIGN KEY (SupplierID) REFERENCES suppliers(SupplierID)
);

-- Create the sales table
CREATE TABLE sales (
    SaleID INT NOT NULL AUTO_INCREMENT,
    ProductID INT,
    QuantitySold INT NOT NULL,
    SaleDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    CustomerID INT,
    SellingPrice DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    PRIMARY KEY (SaleID),
    FOREIGN KEY (ProductID) REFERENCES products(ProductID),
    FOREIGN KEY (CustomerID) REFERENCES customers(CustomerID)
);

-- Create the suppliers table
CREATE TABLE suppliers (
    SupplierID INT NOT NULL AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    ContactName VARCHAR(100),
    ContactNumber VARCHAR(15),
    Email VARCHAR(100),
    Address VARCHAR(255),
    PRIMARY KEY (SupplierID)
);

-- Create the users table
CREATE TABLE users (
    UserID INT NOT NULL AUTO_INCREMENT,
    Username VARCHAR(50) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    Role ENUM('Admin', 'Manager', 'Employee') NOT NULL,
    PRIMARY KEY (UserID)
);
