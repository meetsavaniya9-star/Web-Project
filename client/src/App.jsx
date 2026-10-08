import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import StatsCards from './components/StatsCards';
import ProductForm from './components/ProductForm';
import ProductList from './components/ProductList';
import ProductEditModal from './components/ProductEditModal';
import ProductDetailModal from './components/ProductDetailModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import Toast from './components/Toast';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  seedSampleProducts,
  getDbStatus
} from './services/api';

export default function App() {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalInventoryValue: 0,
    lowStockCount: 0,
    outOfStockCount: 0
  });
  const [dbInfo, setDbInfo] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: 'All',
    status: 'All',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [viewMode, setViewMode] = useState('table');

  // Modals state
  const [viewingProduct, setViewingProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Notifications
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch products from backend
  const loadProducts = useCallback(async (currentFilters = filters) => {
    try {
      setIsLoading(true);
      const res = await getProducts(currentFilters);
      setProducts(res.data || []);
      if (res.stats) setStats(res.stats);
      if (res.dbInfo) setDbInfo(res.dbInfo);
    } catch (err) {
      console.error('Error fetching products:', err);
      addToast(err.message || 'Could not load products from server.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [filters, addToast]);

  // Initial load
  useEffect(() => {
    loadProducts(filters);
    getDbStatus()
      .then(setDbInfo)
      .catch(() => {});
  }, [filters, loadProducts]);

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // CREATE Product
  const handleCreateProduct = async (productData) => {
    try {
      setIsSubmitting(true);
      const res = await createProduct(productData);
      addToast(`Product "${productData.name}" created successfully!`, 'success');
      await loadProducts(filters);
      return true;
    } catch (err) {
      addToast(err.message || 'Failed to create product.', 'error');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // UPDATE Product
  const handleUpdateProduct = async (id, productData) => {
    try {
      setIsSubmitting(true);
      await updateProduct(id, productData);
      addToast(`Product "${productData.name}" updated successfully!`, 'success');
      await loadProducts(filters);
      return true;
    } catch (err) {
      addToast(err.message || 'Failed to update product.', 'error');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // DELETE Product
  const handleConfirmDelete = async (id) => {
    try {
      setIsDeleting(true);
      await deleteProduct(id);
      addToast('Product successfully deleted.', 'success');
      setDeletingProduct(null);
      await loadProducts(filters);
    } catch (err) {
      addToast(err.message || 'Failed to delete product.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // RESET / SEED Sample Data
  const handleResetSampleData = async () => {
    try {
      setIsSeeding(true);
      await seedSampleProducts();
      addToast('Sample database records reloaded!', 'info');
      await loadProducts(filters);
    } catch (err) {
      addToast(err.message || 'Failed to reload demo data.', 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="app-container">
      {/* Navigation & Header */}
      <Navbar
        dbInfo={dbInfo}
        onResetSampleData={handleResetSampleData}
        isSeeding={isSeeding}
      />

      {/* Metric Stats Cards */}
      <StatsCards stats={stats} />

      {/* Main Two-Column Layout */}
      <main className="main-grid">
        {/* Left Column: Create Product HTML Form */}
        <ProductForm
          onProductCreated={handleCreateProduct}
          isSubmitting={isSubmitting}
        />

        {/* Right Column: Search, Filters, Table/Card Views, Actions */}
        <ProductList
          products={products}
          filters={filters}
          onFilterChange={handleFilterChange}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onViewProduct={(product) => setViewingProduct(product)}
          onEditProduct={(product) => setEditingProduct(product)}
          onDeleteProduct={(product) => setDeletingProduct(product)}
          isLoading={isLoading}
        />
      </main>

      {/* Edit HTML Form Modal */}
      <ProductEditModal
        product={editingProduct}
        isOpen={Boolean(editingProduct)}
        onClose={() => setEditingProduct(null)}
        onUpdateProduct={handleUpdateProduct}
        isSubmitting={isSubmitting}
      />

      {/* Detail Inspection Modal */}
      <ProductDetailModal
        product={viewingProduct}
        isOpen={Boolean(viewingProduct)}
        onClose={() => setViewingProduct(null)}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        product={deletingProduct}
        isOpen={Boolean(deletingProduct)}
        onClose={() => setDeletingProduct(null)}
        onConfirmDelete={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      {/* Feedback Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
