import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

export default function DeleteConfirmModal({
  product,
  isOpen,
  onClose,
  onConfirmDelete,
  isDeleting
}) {
  if (!isOpen || !product) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title" style={{ color: '#ef4444' }}>
            <AlertTriangle size={18} />
            Confirm Deletion
          </h3>
        </div>

        <div className="modal-body">
          <p style={{ color: '#f8fafc', marginBottom: 12 }}>
            Are you sure you want to permanently delete the following product?
          </p>

          <div
            style={{
              background: 'var(--bg-surface-elevated)',
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '1rem' }}>
              {product.name}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 4 }}>
              SKU: <strong>{product.sku}</strong> &bull; Category: {product.category} &bull; Price: ${Number(product.price).toFixed(2)}
            </div>
          </div>

          <p style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: 14 }}>
            Warning: This action cannot be undone. The record will be permanently removed from the database.
          </p>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => onConfirmDelete(product._id || product.id)}
            disabled={isDeleting}
          >
            <Trash2 size={16} />
            <span>{isDeleting ? 'Deleting...' : 'Delete Permanently'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
