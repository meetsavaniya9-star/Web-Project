import React from 'react';
import {
  Search,
  X,
  Eye,
  Edit2,
  Trash2,
  LayoutGrid,
  List,
  PackageOpen,
  ArrowUpDown
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Electronics',
  'Furniture',
  'Fitness',
  'Accessories',
  'Clothing',
  'Books',
  'Groceries',
  'Other'
];

const STATUSES = ['All', 'In Stock', 'Low Stock', 'Out of Stock', 'Discontinued'];

const SORTS = [
  { label: 'Newest First', sortBy: 'createdAt', sortOrder: 'desc' },
  { label: 'Oldest First', sortBy: 'createdAt', sortOrder: 'asc' },
  { label: 'Price: Low to High', sortBy: 'price', sortOrder: 'asc' },
  { label: 'Price: High to Low', sortBy: 'price', sortOrder: 'desc' },
  { label: 'Name: A to Z', sortBy: 'name', sortOrder: 'asc' },
  { label: 'Stock Level: High to Low', sortBy: 'stock', sortOrder: 'desc' }
];

export default function ProductList({
  products,
  filters,
  onFilterChange,
  viewMode,
  setViewMode,
  onViewProduct,
  onEditProduct,
  onDeleteProduct,
  isLoading
}) {
  const getStatusClass = (status) => {
    switch (status) {
      case 'In Stock':
        return 'status-in-stock';
      case 'Low Stock':
        return 'status-low-stock';
      case 'Out of Stock':
        return 'status-out-of-stock';
      default:
        return 'status-discontinued';
    }
  };

  const handleSortChange = (e) => {
    const selected = SORTS[e.target.selectedIndex];
    onFilterChange({
      sortBy: selected.sortBy,
      sortOrder: selected.sortOrder
    });
  };

  return (
    <div className="list-container">
      {/* Toolbar */}
      <div className="list-toolbar">
        {/* Search */}
        <div className="search-box-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by product name, SKU, or keyword..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ search: e.target.value })}
          />
          {filters.search && (
            <button
              className="search-clear"
              onClick={() => onFilterChange({ search: '' })}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filters and View Switcher */}
        <div className="filters-wrapper">
          {/* Category Filter */}
          <select
            className="filter-select"
            value={filters.category || 'All'}
            onChange={(e) => onFilterChange({ category: e.target.value })}
            aria-label="Filter by Category"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                Category: {cat}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            className="filter-select"
            value={filters.status || 'All'}
            onChange={(e) => onFilterChange({ status: e.target.value })}
            aria-label="Filter by Status"
          >
            {STATUSES.map((st) => (
              <option key={st} value={st}>
                Status: {st}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            className="filter-select"
            onChange={handleSortChange}
            aria-label="Sort Products"
          >
            {SORTS.map((s, idx) => (
              <option key={idx} value={idx}>
                Sort: {s.label}
              </option>
            ))}
          </select>

          {/* View Mode Toggle */}
          <div className="view-toggle" role="group" aria-label="View format toggle">
            <button
              type="button"
              className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <List size={16} />
            </button>
            <button
              type="button"
              className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Card Grid View"
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Loading or Empty State or Product Content */}
      {isLoading ? (
        <div className="empty-state">
          <p>Loading database entities...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <PackageOpen className="empty-icon" />
          <h3 className="empty-title">No products found</h3>
          <p>Try adjusting your search query, clearing filters, or adding a new product via the form.</p>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product & SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const id = product._id || product.id;
                return (
                  <tr key={id}>
                    <td>
                      <div className="cell-product-name">{product.name}</div>
                      <span className="cell-sku">{product.sku}</span>
                    </td>
                    <td>
                      <span className="category-tag">{product.category}</span>
                    </td>
                    <td>
                      <span className="cell-price">
                        ${Number(product.price).toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <strong>{product.stock}</strong> units
                    </td>
                    <td>
                      <span className={`status-pill ${getStatusClass(product.status)}`}>
                        {product.status}
                      </span>
                    </td>
                    <td>
                      <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                        <button
                          className="action-btn view"
                          onClick={() => onViewProduct(product)}
                          title="View Details"
                          aria-label={`View details for ${product.name}`}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          className="action-btn edit"
                          onClick={() => onEditProduct(product)}
                          title="Edit Product"
                          aria-label={`Edit ${product.name}`}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => onDeleteProduct(product)}
                          title="Delete Product"
                          aria-label={`Delete ${product.name}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* CARD GRID VIEW */
        <div className="cards-grid">
          {products.map((product) => {
            const id = product._id || product.id;
            return (
              <div key={id} className="product-card">
                <div>
                  <div className="card-top">
                    <div>
                      <h4 className="card-title">{product.name}</h4>
                      <span className="card-sku">{product.sku}</span>
                    </div>
                    <span className={`status-pill ${getStatusClass(product.status)}`}>
                      {product.status}
                    </span>
                  </div>

                  <p className="card-desc">
                    {product.description || 'No description provided.'}
                  </p>
                </div>

                <div>
                  <div className="card-meta">
                    <span className="category-tag">{product.category}</span>
                    <span className="card-price">
                      ${Number(product.price).toFixed(2)}
                    </span>
                    <span className="card-stock">{product.stock} in stock</span>
                  </div>

                  <div className="card-actions">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => onViewProduct(product)}
                      title="Inspect Entity"
                    >
                      <Eye size={14} /> View
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => onEditProduct(product)}
                      title="Update Entity"
                    >
                      <Edit2 size={14} /> Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => onDeleteProduct(product)}
                      title="Delete Entity"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
