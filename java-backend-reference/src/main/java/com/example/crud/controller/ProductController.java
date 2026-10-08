package com.example.crud.controller;

import com.example.crud.model.Product;
import com.example.crud.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.math.BigDecimal;
import java.util.*;

/**
 * Controller Layer: ProductController
 * Exposes RESTful CRUD endpoints following MVC architecture.
 */
@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    /**
     * READ ALL: Get products with optional search and filters
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status) {

        List<Product> products = productRepository.findAll();

        if (search != null && !search.trim().isEmpty()) {
            String q = search.toLowerCase().trim();
            products.removeIf(p -> !p.getName().toLowerCase().contains(q) &&
                                   !p.getSku().toLowerCase().contains(q));
        }

        if (category != null && !category.equalsIgnoreCase("All")) {
            products.removeIf(p -> !p.getCategory().equalsIgnoreCase(category));
        }

        if (status != null && !status.equalsIgnoreCase("All")) {
            products.removeIf(p -> !p.getStatus().equalsIgnoreCase(status));
        }

        // Calculate statistics
        List<Product> all = productRepository.findAll();
        BigDecimal totalValue = all.stream()
                .map(p -> p.getPrice().multiply(BigDecimal.valueOf(p.getStock())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        long lowStock = all.stream().filter(p -> "Low Stock".equalsIgnoreCase(p.getStatus())).count();
        long outStock = all.stream().filter(p -> "Out of Stock".equalsIgnoreCase(p.getStatus())).count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalProducts", all.size());
        stats.put("totalInventoryValue", totalValue);
        stats.put("lowStockCount", lowStock);
        stats.put("outOfStockCount", outStock);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("count", products.size());
        response.put("data", products);
        response.put("stats", stats);

        return ResponseEntity.ok(response);
    }

    /**
     * READ ONE: Get product by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(product -> {
                    Map<String, Object> res = new HashMap<>();
                    res.put("success", true);
                    res.put("data", product);
                    return ResponseEntity.ok(res);
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Collections.singletonMap("message", "Product with ID " + id + " not found.")));
    }

    /**
     * CREATE: Add a new product
     */
    @PostMapping
    public ResponseEntity<?> createProduct(@Valid @RequestBody Product product) {
        if (productRepository.findBySkuIgnoreCase(product.getSku()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Collections.singletonMap("message", "Product with SKU " + product.getSku() + " already exists."));
        }

        Product saved = productRepository.save(product);
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("message", "Product created successfully!");
        res.put("data", saved);
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    /**
     * UPDATE: Edit an existing product
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @Valid @RequestBody Product productDetails) {
        return productRepository.findById(id)
                .map(product -> {
                    // Check SKU conflict
                    Optional<Product> existingSku = productRepository.findBySkuIgnoreCase(productDetails.getSku());
                    if (existingSku.isPresent() && !existingSku.get().getId().equals(id)) {
                        return ResponseEntity.status(HttpStatus.CONFLICT)
                                .body(Collections.singletonMap("message", "SKU is already taken by another product."));
                    }

                    product.setName(productDetails.getName());
                    product.setCategory(productDetails.getCategory());
                    product.setPrice(productDetails.getPrice());
                    product.setStock(productDetails.getStock());
                    product.setSku(productDetails.getSku());
                    product.setStatus(productDetails.getStatus());
                    product.setDescription(productDetails.getDescription());

                    Product updated = productRepository.save(product);
                    Map<String, Object> res = new HashMap<>();
                    res.put("success", true);
                    res.put("message", "Product updated successfully!");
                    res.put("data", updated);
                    return ResponseEntity.ok(res);
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Collections.singletonMap("message", "Product with ID " + id + " not found.")));
    }

    /**
     * DELETE: Remove product by ID
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(product -> {
                    productRepository.delete(product);
                    Map<String, Object> res = new HashMap<>();
                    res.put("success", true);
                    res.put("message", "Product deleted successfully!");
                    return ResponseEntity.ok(res);
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Collections.singletonMap("message", "Product with ID " + id + " not found.")));
    }
}
