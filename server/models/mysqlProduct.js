const mysql = require('mysql2/promise');
const crypto = require('crypto');

let pool = null;

const getPool = () => {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST || 'localhost',
      port: Number(process.env.MYSQL_PORT) || 3306,
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'product_crud_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }
  return pool;
};

const determineStatus = (stock, requestedStatus) => {
  if (requestedStatus === 'Discontinued') return 'Discontinued';
  const numStock = Number(stock);
  if (numStock <= 0) return 'Out of Stock';
  if (numStock <= 5) return 'Low Stock';
  return 'In Stock';
};

const mapRow = (row) => {
  if (!row) return null;
  return {
    _id: row.id,
    name: row.name,
    category: row.category,
    price: Number(row.price),
    stock: Number(row.stock),
    sku: row.sku,
    status: row.status,
    description: row.description || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
};

const MysqlProduct = {
  find: async (query = {}, options = {}) => {
    const p = getPool();
    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (query.search) {
      sql += ' AND (LOWER(name) LIKE ? OR LOWER(sku) LIKE ? OR LOWER(description) LIKE ?)';
      const s = `%${query.search.toLowerCase()}%`;
      params.push(s, s, s);
    }

    if (query.category && query.category !== 'All') {
      sql += ' AND category = ?';
      params.push(query.category);
    }

    if (query.status && query.status !== 'All') {
      sql += ' AND status = ?';
      params.push(query.status);
    }

    let sortCol = 'created_at';
    if (options.sortBy === 'name') sortCol = 'name';
    if (options.sortBy === 'price') sortCol = 'price';
    if (options.sortBy === 'stock') sortCol = 'stock';

    const order = options.sortOrder === 'asc' ? 'ASC' : 'DESC';
    sql += ` ORDER BY ${sortCol} ${order}`;

    const [rows] = await p.execute(sql, params);
    return rows.map(mapRow);
  },

  findById: async (id) => {
    const p = getPool();
    const [rows] = await p.execute('SELECT * FROM products WHERE id = ?', [id]);
    return rows.length ? mapRow(rows[0]) : null;
  },

  findOne: async (criteria) => {
    const p = getPool();
    const keys = Object.keys(criteria);
    if (!keys.length) return null;
    const where = keys.map((k) => `${k} = ?`).join(' AND ');
    const values = keys.map((k) => criteria[k]);
    const [rows] = await p.execute(`SELECT * FROM products WHERE ${where} LIMIT 1`, values);
    return rows.length ? mapRow(rows[0]) : null;
  },

  create: async (data) => {
    const p = getPool();
    const id = crypto.randomBytes(12).toString('hex');
    const status = determineStatus(data.stock, data.status);
    const sku = (data.sku || '').trim().toUpperCase();

    try {
      await p.execute(
        `INSERT INTO products (id, name, category, price, stock, sku, status, description)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          data.name.trim(),
          data.category,
          parseFloat(data.price),
          parseInt(data.stock, 10),
          sku,
          status,
          (data.description || '').trim()
        ]
      );
      return MysqlProduct.findById(id);
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        const error = new Error(`Product with SKU "${sku}" already exists.`);
        error.code = 11000;
        throw error;
      }
      throw err;
    }
  },

  findByIdAndUpdate: async (id, data, options = {}) => {
    const p = getPool();
    const existing = await MysqlProduct.findById(id);
    if (!existing) return null;

    const name = data.name !== undefined ? data.name.trim() : existing.name;
    const category = data.category !== undefined ? data.category : existing.category;
    const price = data.price !== undefined ? parseFloat(data.price) : existing.price;
    const stock = data.stock !== undefined ? parseInt(data.stock, 10) : existing.stock;
    const sku = data.sku !== undefined ? data.sku.trim().toUpperCase() : existing.sku;
    const status =
      data.status !== undefined
        ? determineStatus(data.stock !== undefined ? data.stock : existing.stock, data.status)
        : existing.status;
    const description =
      data.description !== undefined ? data.description.trim() : existing.description;

    try {
      await p.execute(
        `UPDATE products 
         SET name = ?, category = ?, price = ?, stock = ?, sku = ?, status = ?, description = ?
         WHERE id = ?`,
        [name, category, price, stock, sku, status, description, id]
      );
      return MysqlProduct.findById(id);
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        const error = new Error(`Product with SKU "${sku}" is already taken by another product.`);
        error.code = 11000;
        throw error;
      }
      throw err;
    }
  },

  findByIdAndDelete: async (id) => {
    const p = getPool();
    const existing = await MysqlProduct.findById(id);
    if (!existing) return null;
    await p.execute('DELETE FROM products WHERE id = ?', [id]);
    return existing;
  }
};

module.exports = MysqlProduct;
