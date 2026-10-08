import React, { useState } from 'react';
import { PlusCircle, RotateCcw } from 'lucide-react';

const CATEGORIES = [
  'Electronics',
  'Furniture',
  'Fitness',
  'Accessories',
  'Clothing',
  'Books',
  'Groceries',
  'Other'
];

const STATUSES = ['In Stock', 'Low Stock', 'Out of Stock', 'Discontinued'];

const INITIAL_FORM_STATE = {
  name: '',
  category: 'Electronics',
  price: '',
  stock: '',
  sku: '',
  status: 'In Stock',
  description: ''
};

export default function ProductForm({ onProductCreated, isSubmitting }) {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errs.name = 'Product name must be at least 2 characters.';
    }
    if (!formData.category) {
      errs.category = 'Please select a category.';
    }
    const numPrice = Number(formData.price);
    if (!formData.price || isNaN(numPrice) || numPrice <= 0) {
      errs.price = 'Price must be greater than $0.00.';
    }
    const numStock = Number(formData.stock);
    if (formData.stock === '' || isNaN(numStock) || numStock < 0 || !Number.isInteger(numStock)) {
      errs.stock = 'Stock must be an integer ≥ 0.';
    }
    if (!formData.sku.trim() || formData.sku.trim().length < 3) {
      errs.sku = 'SKU is required (minimum 3 characters).';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Automatically update status based on stock if user changes stock
    let updatedFormData = {
      ...formData,
      [name]: name === 'sku' ? value.toUpperCase() : value
    };

    if (name === 'stock') {
      const stockVal = Number(value);
      if (!isNaN(stockVal) && formData.status !== 'Discontinued') {
        if (stockVal <= 0) updatedFormData.status = 'Out of Stock';
        else if (stockVal <= 5) updatedFormData.status = 'Low Stock';
        else updatedFormData.status = 'In Stock';
      }
    }

    setFormData(updatedFormData);

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock, 10),
      sku: formData.sku.trim().toUpperCase()
    };

    const success = await onProductCreated(payload);
    if (success) {
      setFormData(INITIAL_FORM_STATE);
      setErrors({});
    }
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM_STATE);
    setErrors({});
  };

  return (
    <div className="form-card">
      <div className="form-header">
        <h2 className="form-title">
          <PlusCircle size={20} color="#3b82f6" />
          Add New Product
        </h2>
        <p className="form-desc">
          Fill out the HTML form below to persist a new item to the database.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* Product Name */}
        <div className="form-group">
          <label className="form-label" htmlFor="create-product-name">
            Product Name <span className="required-star">*</span>
          </label>
          <input
            id="create-product-name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Ergonomic Office Mouse"
            className={`form-input ${errors.name ? 'has-error' : ''}`}
            required
          />
          {errors.name && <span className="error-text">{errors.name}</span>}
        </div>

        {/* Category & Status */}
        <div className="form-group two-cols">
          <div>
            <label className="form-label" htmlFor="create-product-category">
              Category <span className="required-star">*</span>
            </label>
            <select
              id="create-product-category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`form-select ${errors.category ? 'has-error' : ''}`}
              required
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && <span className="error-text">{errors.category}</span>}
          </div>

          <div>
            <label className="form-label" htmlFor="create-product-status">
              Stock Status
            </label>
            <select
              id="create-product-status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="form-select"
            >
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Price & Stock */}
        <div className="form-group two-cols">
          <div>
            <label className="form-label" htmlFor="create-product-price">
              Price (USD) <span className="required-star">*</span>
            </label>
            <div className="input-prefix-wrapper">
              <span className="input-prefix">$</span>
              <input
                id="create-product-price"
                type="number"
                step="0.01"
                min="0.01"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="49.99"
                className={`form-input with-prefix ${errors.price ? 'has-error' : ''}`}
                required
              />
            </div>
            {errors.price && <span className="error-text">{errors.price}</span>}
          </div>

          <div>
            <label className="form-label" htmlFor="create-product-stock">
              Quantity <span className="required-star">*</span>
            </label>
            <input
              id="create-product-stock"
              type="number"
              step="1"
              min="0"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              placeholder="25"
              className={`form-input ${errors.stock ? 'has-error' : ''}`}
              required
            />
            {errors.stock && <span className="error-text">{errors.stock}</span>}
          </div>
        </div>

        {/* SKU */}
        <div className="form-group">
          <label className="form-label" htmlFor="create-product-sku">
            SKU Code <span className="required-star">*</span>
          </label>
          <input
            id="create-product-sku"
            type="text"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            placeholder="e.g. TECH-MS-707"
            className={`form-input ${errors.sku ? 'has-error' : ''}`}
            required
          />
          {errors.sku && <span className="error-text">{errors.sku}</span>}
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="form-label" htmlFor="create-product-desc">
            Product Description
          </label>
          <textarea
            id="create-product-desc"
            name="description"
            rows="3"
            value={formData.description}
            onChange={handleChange}
            placeholder="Brief technical specifications, warranty, or features..."
            className="form-textarea"
          ></textarea>
        </div>

        {/* Buttons */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            style={{ flex: 1 }}
            disabled={isSubmitting}
          >
            <PlusCircle size={16} />
            <span>{isSubmitting ? 'Saving...' : 'Create Product'}</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleReset}
            disabled={isSubmitting}
            title="Clear all fields"
          >
            <RotateCcw size={16} />
            <span>Reset</span>
          </button>
        </div>
      </form>
    </div>
  );
}
