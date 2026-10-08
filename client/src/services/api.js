/**
 * API Service for Product CRUD operations
 */
const BASE_URL = '/api';

export const getProducts = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.category && filters.category !== 'All') params.append('category', filters.category);
  if (filters.status && filters.status !== 'All') params.append('status', filters.status);
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

  const queryString = params.toString() ? `?${params.toString()}` : '';
  const response = await fetch(`${BASE_URL}/products${queryString}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch products');
  }
  return data;
};

export const getProductById = async (id) => {
  const response = await fetch(`${BASE_URL}/products/${id}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to retrieve product details');
  }
  return data.data;
};

export const createProduct = async (productData) => {
  const response = await fetch(`${BASE_URL}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(productData)
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data.errors ? data.errors.join('. ') : (data.message || 'Failed to create product');
    throw new Error(errorMsg);
  }
  return data;
};

export const updateProduct = async (id, productData) => {
  const response = await fetch(`${BASE_URL}/products/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(productData)
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data.errors ? data.errors.join('. ') : (data.message || 'Failed to update product');
    throw new Error(errorMsg);
  }
  return data;
};

export const deleteProduct = async (id) => {
  const response = await fetch(`${BASE_URL}/products/${id}`, {
    method: 'DELETE'
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete product');
  }
  return data;
};

export const seedSampleProducts = async () => {
  const response = await fetch(`${BASE_URL}/products/seed`, {
    method: 'POST'
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to reload sample products');
  }
  return data;
};

export const getDbStatus = async () => {
  const response = await fetch(`${BASE_URL}/db-status`);
  const data = await response.json();
  return data.db;
};
