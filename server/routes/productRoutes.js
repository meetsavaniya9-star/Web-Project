const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// System & DB status
router.get('/db-status', productController.getDatabaseStatus);

// Seed sample data
router.post('/products/seed', productController.seedProducts);

// Standard CRUD endpoints
router.route('/products')
  .get(productController.getAllProducts)
  .post(productController.createProduct);

router.route('/products/:id')
  .get(productController.getProductById)
  .put(productController.updateProduct)
  .delete(productController.deleteProduct);

module.exports = router;
