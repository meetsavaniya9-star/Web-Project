import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Edit } from 'lucide-react';

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

export default function ProductEditModal({
  product,
  isOpen,
  onClose,
  onUpdateProduct,
  isSubmitting
}) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Electronics',
    price: '',
    stock: '',
    sku: '',
    status: 'In Stock',
    description: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        category: product.category || 'Electronics',
        price: product.price !== undefined ? product.price : '',
        stock: product.stock !== undefined ? product.stock : '',
        sku: product.sku || '',
        status: product.status || 'In Stock',
        description: product.description || ''
      });
      setErrors({});
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const validate = () => {
    const errs = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errs.name = 'Product name must be at least 2 characters.';
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

    const productId = product._id || product.id;
    const success = await onUpdateProduct(productId, payload);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            <Edit size={18} color="#38bdf8" />
            Edit Product Entity
          </h3>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            {/* Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="edit-product-name">
                Product Name <span className="required-star">*</span>
              </label>
              <input
                id="edit-product-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`form-input ${errors.name ? 'has-error' : ''}`}
                required
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            {/* Category & Status */}
            <div className="form-group two-cols">
              <div>
                <label className="form-label" htmlFor="edit-product-category">
                  Category <span className="required-star">*</span>
                </label>
                <select
                  id="edit-product-category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="form-select"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label" htmlFor="edit-product-status">
                  Status
                </label>
                <select
                  id="edit-product-status"
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
                <label className="form-label" htmlFor="edit-product-price">
                  Price (USD) <span className="required-star">*</span>
                </label>
                <div className="input-prefix-wrapper">
                  <span className="input-prefix">$</span>
                  <input
                    id="edit-product-price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className={`form-input with-prefix ${errors.price ? 'has-error' : ''}`}
                    required
                  />
                </div>
                {errors.price && <span className="error-text">{errors.price}</span>}
              </div>

              <div>
                <label className="form-label" htmlFor="edit-product-stock">
                  Stock Count <span className="required-star">*</span>
                </label>
                <input
                  id="edit-product-stock"
                  type="number"
                  step="1"
                  min="0"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  className={`form-input ${errors.stock ? 'has-error' : ''}`}
                  required
                />
                {errors.stock && <span className="error-text">{errors.stock}</span>}
              </div>
            </div>

            {/* SKU */}
            <div className="form-group">
              <label className="form-label" htmlFor="edit-product-sku">
                SKU Identifier <span className="required-star">*</span>
              </label>
              <input
                id="edit-product-sku"
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className={`form-input ${errors.sku ? 'has-error' : ''}`}
                required
              />
              {errors.sku && <span className="error-text">{errors.sku}</span>}
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label" htmlFor="edit-product-desc">
                Description
              </label>
              <textarea
                id="edit-product-desc"
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                className="form-textarea"
              ></textarea>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              <CheckCircle2 size={16} />
              <span>{isSubmitting ? 'Saving Changes...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
