const Product = require('../models/Product');
const { getDbStatus, getActiveDbType } = require('../config/db');
const initialData = require('../data/products.json');

// Validation helper
const validateProductInput = (data, isUpdate = false) => {
  const errors = [];

  if (!isUpdate || data.name !== undefined) {
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
      errors.push('Product name is required and must be at least 2 characters.');
    }
  }

  const validCategories = [
    'Electronics',
    'Furniture',
    'Fitness',
    'Accessories',
    'Clothing',
    'Books',
    'Groceries',
    'Other'
  ];

  if (!isUpdate || data.category !== undefined) {
    if (!data.category || !validCategories.includes(data.category)) {
      errors.push(`Category must be one of: ${validCategories.join(', ')}.`);
    }
  }

  if (!isUpdate || data.price !== undefined) {
    const numPrice = Number(data.price);
    if (isNaN(numPrice) || numPrice <= 0) {
      errors.push('Price must be a positive number greater than 0.');
    }
  }

  if (!isUpdate || data.stock !== undefined) {
    const numStock = Number(data.stock);
    if (isNaN(numStock) || numStock < 0 || !Number.isInteger(numStock)) {
      errors.push('Stock must be an integer greater than or equal to 0.');
    }
  }

  if (!isUpdate || data.sku !== undefined) {
    if (!data.sku || typeof data.sku !== 'string' || data.sku.trim().length < 3) {
      errors.push('SKU is required and must be at least 3 characters long (e.g., TECH-101).');
    }
  }

  return errors;
};

/**
 * Controller: Get all products with optional filters, search, and sort
 * GET /api/products
 */
exports.getAllProducts = async (req, res, next) => {
  try {
    const { search, category, status, sortBy, sortOrder } = req.query;

    const query = {
      search: search || '',
      category: category || 'All',
      status: status || 'All'
    };

    const options = {
      sortBy: sortBy || 'createdAt',
      sortOrder: sortOrder || 'desc'
    };

    const products = await Product.find(query, options);

    // Compute stats
    const allProducts = await Product.find({});
    const totalInventoryValue = allProducts.reduce(
      (sum, p) => sum + (Number(p.price) || 0) * (Number(p.stock) || 0),
      0
    );
    const lowStockCount = allProducts.filter((p) => p.status === 'Low Stock').length;
    const outOfStockCount = allProducts.filter((p) => p.status === 'Out of Stock').length;

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
      stats: {
        totalProducts: allProducts.length,
        totalInventoryValue: parseFloat(totalInventoryValue.toFixed(2)),
        lowStockCount,
        outOfStockCount
      },
      dbInfo: getDbStatus()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Get single product by ID
 * GET /api/products/:id
 */
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with ID ${req.params.id} not found.`
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Create new product
 * POST /api/products
 */
exports.createProduct = async (req, res, next) => {
  try {
    const errors = validateProductInput(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    const { name, category, price, stock, sku, status, description } = req.body;

    const newProduct = await Product.create({
      name,
      category,
      price: parseFloat(price),
      stock: parseInt(stock, 10),
      sku: sku.trim().toUpperCase(),
      status: status || 'In Stock',
      description: description || ''
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully!',
      data: newProduct
    });
  } catch (error) {
    if (error.code === 11000 || error.message.includes('already exists')) {
      return res.status(409).json({
        success: false,
        message: `A product with SKU "${req.body.sku}" already exists. Please choose a unique SKU.`
      });
    }
    next(error);
  }
};

/**
 * Controller: Update existing product
 * PUT /api/products/:id
 */
exports.updateProduct = async (req, res, next) => {
  try {
    const errors = validateProductInput(req.body, true);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    });

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: `Product with ID ${req.params.id} not found.`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully!',
      data: updatedProduct
    });
  } catch (error) {
    if (error.code === 11000 || error.message.includes('already exists') || error.message.includes('already taken')) {
      return res.status(409).json({
        success: false,
        message: `The SKU "${req.body.sku}" is already assigned to another product.`
      });
    }
    next(error);
  }
};

/**
 * Controller: Delete product
 * DELETE /api/products/:id
 */
exports.deleteProduct = async (req, res, next) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: `Product with ID ${req.params.id} not found.`
      });
    }

    res.status(200).json({
      success: true,
      message: `Product "${deletedProduct.name}" deleted successfully!`,
      data: deletedProduct
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Reset/Seed sample data
 * POST /api/products/seed
 */
exports.seedProducts = async (req, res, next) => {
  try {
    const dbType = getActiveDbType();
    if (dbType === 'local') {
      const JsonProduct = require('../models/jsonProduct');
      await JsonProduct.seed(initialData);
    } else if (dbType === 'mongodb') {
      const MongooseProduct = require('../models/mongooseProduct');
      await MongooseProduct.deleteMany({});
      await MongooseProduct.insertMany(initialData);
    } else if (dbType === 'mysql') {
      const MysqlProduct = require('../models/mysqlProduct');
      for (const item of initialData) {
        await MysqlProduct.create(item).catch(() => {});
      }
    }

    res.status(200).json({
      success: true,
      message: 'Sample products reloaded successfully!',
      count: initialData.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Get Database & Environment status
 * GET /api/db-status
 */
exports.getDatabaseStatus = (req, res) => {
  res.status(200).json({
    success: true,
    db: getDbStatus()
  });
};
