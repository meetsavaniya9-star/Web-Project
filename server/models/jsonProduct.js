const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_FILE = path.join(__dirname, '..', 'data', 'products.json');

// Ensure data folder and file exist
const ensureDataFile = () => {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
};

const readProducts = () => {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    console.error('Error reading JSON product file:', err);
    return [];
  }
};

const writeProducts = (products) => {
  ensureDataFile();
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing JSON product file:', err);
    throw err;
  }
};

// Auto calculate status based on stock count
const determineStatus = (stock, requestedStatus) => {
  if (requestedStatus === 'Discontinued') return 'Discontinued';
  const numStock = Number(stock);
  if (numStock <= 0) return 'Out of Stock';
  if (numStock <= 5) return 'Low Stock';
  return 'In Stock';
};

const JsonProduct = {
  find: async (query = {}, options = {}) => {
    let products = readProducts();

    // Text search on name or description or SKU
    if (query.search) {
      const q = query.search.toLowerCase().trim();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (query.category && query.category !== 'All') {
      products = products.filter(
        (p) => p.category.toLowerCase() === query.category.toLowerCase()
      );
    }

    // Status filter
    if (query.status && query.status !== 'All') {
      products = products.filter(
        (p) => p.status.toLowerCase() === query.status.toLowerCase()
      );
    }

    // Sorting
    if (options.sortBy) {
      const field = options.sortBy;
      const order = options.sortOrder === 'desc' ? -1 : 1;
      products.sort((a, b) => {
        let valA = a[field];
        let valB = b[field];

        if (typeof valA === 'string') {
          return valA.localeCompare(valB) * order;
        }
        return (valA - valB) * order;
      });
    } else {
      // Default newest first
      products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return products;
  },

  findById: async (id) => {
    const products = readProducts();
    return products.find((p) => p._id === id || p.id === id) || null;
  },

  findOne: async (criteria) => {
    const products = readProducts();
    return (
      products.find((p) => {
        return Object.entries(criteria).every(([key, val]) => {
          if (typeof val === 'string' && typeof p[key] === 'string') {
            return p[key].toLowerCase() === val.toLowerCase();
          }
          return p[key] === val;
        });
      }) || null
    );
  },

  create: async (data) => {
    const products = readProducts();

    // Check SKU uniqueness
    const normalizedSku = (data.sku || '').trim().toUpperCase();
    const existing = products.find(
      (p) => p.sku && p.sku.toUpperCase() === normalizedSku
    );
    if (existing) {
      const err = new Error(`Product with SKU "${normalizedSku}" already exists.`);
      err.code = 11000;
      throw err;
    }

    const newProduct = {
      _id: crypto.randomBytes(12).toString('hex'),
      name: data.name.trim(),
      category: data.category,
      price: parseFloat(data.price),
      stock: parseInt(data.stock, 10),
      sku: normalizedSku,
      status: determineStatus(data.stock, data.status),
      description: (data.description || '').trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    products.unshift(newProduct);
    writeProducts(products);
    return newProduct;
  },

  findByIdAndUpdate: async (id, data, options = {}) => {
    const products = readProducts();
    const index = products.findIndex((p) => p._id === id || p.id === id);

    if (index === -1) {
      return null;
    }

    const existing = products[index];

    // If updating SKU, check uniqueness against other products
    if (data.sku) {
      const normalizedSku = data.sku.trim().toUpperCase();
      const skuConflict = products.find(
        (p) =>
          (p._id !== id && p.id !== id) &&
          p.sku &&
          p.sku.toUpperCase() === normalizedSku
      );
      if (skuConflict) {
        const err = new Error(`Product with SKU "${normalizedSku}" is already taken by another product.`);
        err.code = 11000;
        throw err;
      }
    }

    const updatedProduct = {
      ...existing,
      name: data.name !== undefined ? data.name.trim() : existing.name,
      category: data.category !== undefined ? data.category : existing.category,
      price: data.price !== undefined ? parseFloat(data.price) : existing.price,
      stock: data.stock !== undefined ? parseInt(data.stock, 10) : existing.stock,
      sku: data.sku !== undefined ? data.sku.trim().toUpperCase() : existing.sku,
      status:
        data.status !== undefined
          ? determineStatus(
              data.stock !== undefined ? data.stock : existing.stock,
              data.status
            )
          : existing.status,
      description:
        data.description !== undefined ? data.description.trim() : existing.description,
      updatedAt: new Date().toISOString()
    };

    products[index] = updatedProduct;
    writeProducts(products);
    return updatedProduct;
  },

  findByIdAndDelete: async (id) => {
    const products = readProducts();
    const index = products.findIndex((p) => p._id === id || p.id === id);
    if (index === -1) return null;

    const [deleted] = products.splice(index, 1);
    writeProducts(products);
    return deleted;
  },

  seed: async (seedItems) => {
    writeProducts(seedItems);
    return seedItems;
  }
};

module.exports = JsonProduct;
