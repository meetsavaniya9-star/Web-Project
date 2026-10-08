# Java Spring Boot Backend Implementation (Complementary)

This directory contains the equivalent **Java (Spring Boot / MVC)** backend implementation for the Product CRUD application.

It exposes the exact same REST API endpoints and data model as the Node.js/Express backend, so the React.js frontend can communicate with either backend seamlessly.

---

## Architecture (MVC Pattern)

- **Model**: `com.example.crud.model.Product`
  - Defines the database entity mapped with JPA / Hibernate.
  - Contains field constraints (`@NotNull`, `@Size`, `@DecimalMin`, `@Column(unique=true)`).
  - Automatically manages audit timestamps and inventory status calculations.
- **Data Access Layer**: `com.example.crud.repository.ProductRepository`
  - Spring Data JPA repository providing built-in CRUD operations and custom query methods.
- **Controller**: `com.example.crud.controller.ProductController`
  - RESTful controller handling HTTP requests (`GET`, `POST`, `PUT`, `DELETE`).
  - Applies input validation (`@Valid`), error handling, and JSON responses.

---

## How to Run the Java Backend

### Prerequisites
- JDK 8 or 17+ installed.
- Apache Maven installed (`mvn -v`).

### 1. Build and Run
```bash
cd java-backend-reference
mvn spring-boot:run
```

The Java application will start on `http://localhost:5000`. By default, it uses the embedded in-memory H2 database with zero external setup needed.

### 2. Switch to MySQL (Optional)
Open `src/main/resources/application.properties` and uncomment the MySQL configuration lines:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/product_crud_db?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=your_password
```
