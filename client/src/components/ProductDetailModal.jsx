import React from 'react';
import { X, Eye, Calendar, Tag, BarChart3, Hash } from 'lucide-react';

export default function ProductDetailModal({ product, isOpen, onClose }) {
  if (!isOpen || !product) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            <Eye size={18} color="#3b82f6" />
            Product Details
          </h3>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ marginBottom: 18 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', marginBottom: 4 }}>
              {product.name}
            </h2>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <span className="category-tag">{product.category}</span>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Hash size={13} /> SKU: <strong>{product.sku}</strong>
              </span>
            </div>
          </div>

          <div className="detail-grid">
            <div>
              <div className="detail-item-label">Unit Price</div>
              <div className="detail-item-val" style={{ color: '#38bdf8', fontSize: '1.2rem' }}>
                ${Number(product.price).toFixed(2)}
              </div>
            </div>

            <div>
              <div className="detail-item-label">Current Stock</div>
              <div className="detail-item-val">
                {product.stock} units ({product.status})
              </div>
            </div>

            <div>
              <div className="detail-item-label">Database ID</div>
              <div className="detail-item-val" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#64748b' }}>
                {product._id || product.id}
              </div>
            </div>

            <div>
              <div className="detail-item-label">Inventory Status</div>
              <div className="detail-item-val">
                <span className="status-pill status-in-stock" style={{ padding: '2px 8px' }}>
                  {product.status}
                </span>
              </div>
            </div>

            <div>
              <div className="detail-item-label">Created At</div>
              <div className="detail-item-val" style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                {formatDate(product.createdAt)}
              </div>
            </div>

            <div>
              <div className="detail-item-label">Last Updated</div>
              <div className="detail-item-val" style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                {formatDate(product.updatedAt)}
              </div>
            </div>
          </div>

          <div>
            <div className="detail-item-label">Description</div>
            <div className="detail-desc-box">
              {product.description || 'No description provided for this item.'}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
