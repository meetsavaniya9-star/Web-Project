const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [2, 'Product name must be at least 2 characters long'],
      maxlength: [100, 'Product name cannot exceed 100 characters']
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      enum: {
        values: ['Electronics', 'Furniture', 'Fitness', 'Accessories', 'Clothing', 'Books', 'Groceries', 'Other'],
        message: '{VALUE} is not a valid category'
      }
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0.01, 'Price must be greater than 0']
    },
    stock: {
      type: Number,
      required: [true, 'Stock count is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0
    },
    sku: {
      type: String,
      required: [true, 'SKU (Stock Keeping Unit) is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    status: {
      type: String,
      required: true,
      enum: ['In Stock', 'Low Stock', 'Out of Stock', 'Discontinued'],
      default: 'In Stock'
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Virtual property or auto-status calculation if desired
productSchema.pre('save', function (next) {
  if (this.stock === 0 && this.status !== 'Discontinued') {
    this.status = 'Out of Stock';
  } else if (this.stock > 0 && this.stock <= 5 && this.status !== 'Discontinued') {
    this.status = 'Low Stock';
  } else if (this.stock > 5 && this.status !== 'Discontinued') {
    this.status = 'In Stock';
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
