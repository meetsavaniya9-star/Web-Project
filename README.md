# Full-Stack MVC CRUD Web Application

A full-stack web application designed around the **MVC (Model-View-Controller)** architectural pattern that provides a complete, modern web interface for performing **CRUD (Create, Read, Update, Delete)** operations on a single database entity (**Product**).

---

## 📌 Architecture Overview (MVC Pattern)

This project strictly adheres to the **Model-View-Controller** separation of concerns:

```
                          ┌─────────────────────────────┐
                          │         VIEW (Client)       │
                          │   React.js SPA + HTML Forms │
                          └──────────────┬──────────────┘
                                         │  HTTP Requests
                                         │  (GET, POST, PUT, DELETE)
                                         ▼
┌─────────────────────────┐  Invokes    ┌─────────────────────────────┐
│       MODEL Layer       │◄────────────│      CONTROLLER Layer       │
│  - Product.js           │             │  - productController.js     │
│  - Mongoose Schema      │  Returns    │  - Validation & Errors      │
│  - MySQL / Local Store  │────────────►│  - JSON Response Envelope   │
└─────────────────────────┘   Data      └─────────────────────────────┘
```

1. **Model (`server/models/`)**:
   - Encapsulates database logic, schema definitions, constraints, and business rules.
   - Master Model: [Product.js](file:///C:/Users/Meet%20Savaniya/.gemini/antigravity/scratch/mern-crud-mvc-app/server/models/Product.js)
   - MongoDB Mongoose schema: [mongooseProduct.js](file:///C:/Users/Meet%20Savaniya/.gemini/antigravity/scratch/mern-crud-mvc-app/server/models/mongooseProduct.js)
   - MySQL adapter: [mysqlProduct.js](file:///C:/Users/Meet%20Savaniya/.gemini/antigravity/scratch/mern-crud-mvc-app/server/models/mysqlProduct.js)
   - Persistent Local JSON engine: [jsonProduct.js](file:///C:/Users/Meet%20Savaniya/.gemini/antigravity/scratch/mern-crud-mvc-app/server/models/jsonProduct.js) (ensures instant zero-dependency execution out-of-the-box!)

2. **View (`client/src/`)**:
   - Presents the user interface and captures user interaction through structured HTML forms.
   - Interactive Create HTML Form: [ProductForm.jsx](file:///C:/Users/Meet%20Savaniya/.gemini/antigravity/scratch/mern-crud-mvc-app/client/src/components/ProductForm.jsx)
   - Product Directory, Search, Filters, Table & Card Views: [ProductList.jsx](file:///C:/Users/Meet%20Savaniya/.gemini/antigravity/scratch/mern-crud-mvc-app/client/src/components/ProductList.jsx)
   - Update HTML Form Modal: [ProductEditModal.jsx](file:///C:/Users/Meet%20Savaniya/.gemini/antigravity/scratch/mern-crud-mvc-app/client/src/components/ProductEditModal.jsx)
   - Entity Detail Inspector: [ProductDetailModal.jsx](file:///C:/Users/Meet%20Savaniya/.gemini/antigravity/scratch/mern-crud-mvc-app/client/src/components/ProductDetailModal.jsx)
   - Delete Confirmation Dialog: [DeleteConfirmModal.jsx](file:///C:/Users/Meet%20Savaniya/.gemini/antigravity/scratch/mern-crud-mvc-app/client/src/components/DeleteConfirmModal.jsx)

3. **Controller (`server/controllers/` & `server/routes/`)**:
   - Manages incoming HTTP requests, coordinates with the Model, performs server-side validations, and returns standardized HTTP responses.
   - Controller implementation: [productController.js](file:///C:/Users/Meet%20Savaniya/.gemini/antigravity/scratch/mern-crud-mvc-app/server/controllers/productController.js)
   - REST Routes: [productRoutes.js](file:///C:/Users/Meet%20Savaniya/.gemini/antigravity/scratch/mern-crud-mvc-app/server/routes/productRoutes.js)

---

## 🗄️ Database Entity: `Product`

| Field | Type | Validation & Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` / `id` | String | Auto-generated unique identifier | Primary key |
| `name` | String | Required, min 2 chars, max 100 chars | Name of the product |
| `category` | String | Enum (`Electronics`, `Furniture`, `Fitness`, `Accessories`, `Clothing`, `Books`, `Groceries`, `Other`) | Category classification |
| `price` | Number | Required, decimal > 0.00 | Unit retail price in USD |
| `stock` | Number | Required, integer ≥ 0 | Units available in inventory |
| `sku` | String | Required, unique, uppercase | Stock Keeping Unit (e.g., `TECH-WH-101`) |
| `status` | String | Enum (`In Stock`, `Low Stock`, `Out of Stock`, `Discontinued`) | Current availability state |
| `description`| String | Optional, max 1000 characters | Technical details / specifications |
| `createdAt` | DateTime | Timestamp | Date of initial record creation |
| `updatedAt` | DateTime | Timestamp | Date of last update |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** v18+ installed (tested on v24.21.0)
- **npm** installed (tested on 11.19.0)

### 2. Running the Application (One Command)
Navigate to the project root:
```bash
cd "C:\Users\Meet Savaniya\.gemini\antigravity\scratch\mern-crud-mvc-app"
npm start
```
Open your browser and navigate to:
👉 **`http://localhost:5000`**

The Express backend will automatically serve both the REST API and the React production build on port `5000`!

### 3. Development Mode (Hot-Reloading)
If you want to run the client and backend simultaneously in hot-reloading development mode:
- Terminal 1 (Backend):
  ```bash
  npm run server
  ```
- Terminal 2 (React Vite Client):
  ```bash
  npm run client
  ```
  Visit: `http://localhost:5173` (Vite dev server proxies `/api` calls directly to port 5000).

---

## ⚙️ Configuring Databases (MongoDB / MySQL / Local)

The application includes an **intelligent database engine switcher** in `server/config/db.js`:

1. **Embedded Persistent JSON Storage (Default)**:
   - Active out-of-the-box with **zero database installation required**.
   - Data persists across server restarts in `server/data/products.json`.
2. **MongoDB (Mongoose)**:
   - To connect to MongoDB (local or free cloud MongoDB Atlas cluster), edit `server/.env`:
     ```env
     DB_TYPE=mongodb
     MONGODB_URI=mongodb://127.0.0.1:27017/product_crud_db
     # Or Atlas URI:
     # MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abc.mongodb.net/product_crud_db
     ```
3. **MySQL**:
   - To connect to a MySQL server, edit `server/.env`:
     ```env
     DB_TYPE=mysql
     MYSQL_HOST=localhost
     MYSQL_PORT=3306
     MYSQL_USER=root
     MYSQL_PASSWORD=your_password
     MYSQL_DATABASE=product_crud_db
     ```
   - The application automatically executes `CREATE TABLE IF NOT EXISTS products (...)` upon connection.

---

## ☕ Complementary Java Backend Implementation

As specified in academic requirements mentioning a *"web-based Java application using React.js..."*, we also provide a full **Java (Spring Boot / MVC)** backend in `java-backend-reference/`:
- **Model**: `com.example.crud.model.Product` with JPA annotations.
- **Repository**: `com.example.crud.repository.ProductRepository` with Spring Data.
- **Controller**: `com.example.crud.controller.ProductController` exposing the exact same REST endpoints.
- See [java-backend-reference/README.md](file:///C:/Users/Meet%20Savaniya/.gemini/antigravity/scratch/mern-crud-mvc-app/java-backend-reference/README.md) for run instructions (`mvn spring-boot:run`).

---

## 📡 REST API Documentation

| Method | Endpoint | Description | Request Body Example |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Retrieve all products (supports search, category, status, sort) | None |
| `GET` | `/api/products/:id` | Retrieve single product by ID | None |
| `POST` | `/api/products` | Create a new product (validates SKU uniqueness) | `{"name":"Product X","category":"Electronics","price":49.99,"stock":10,"sku":"ELEC-101"}` |
| `PUT` | `/api/products/:id`| Update an existing product | `{"price":44.99,"stock":8}` |
| `DELETE`| `/api/products/:id`| Permanently delete a product | None |
| `POST` | `/api/products/seed`| Reset/reload initial sample products | None |
| `GET` | `/api/db-status` | Check active database engine status | None |
