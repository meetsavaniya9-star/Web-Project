const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

let activeDbType = 'local';
let connectionStatus = {
  type: 'local',
  status: 'Ready',
  message: 'Using embedded persistent JSON storage',
  host: 'local-filesystem'
};

const connectDB = async () => {
  const preferredType = (process.env.DB_TYPE || 'auto').toLowerCase();

  // 1. If explicit or auto MongoDB attempt
  if (preferredType === 'mongodb' || preferredType === 'auto') {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/product_crud_db';
    try {
      console.log(`[Database] Attempting connection to MongoDB at: ${mongoUri}...`);
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 2500 // Quick timeout so fallback happens instantly if offline
      });
      activeDbType = 'mongodb';
      connectionStatus = {
        type: 'mongodb',
        status: 'Connected',
        message: 'Successfully connected to MongoDB',
        host: mongoose.connection.host
      };
      console.log(`[Database] Connected to MongoDB (${mongoose.connection.host}) successfully!`);
      return activeDbType;
    } catch (err) {
      if (preferredType === 'mongodb') {
        console.error(`[Database Error] MongoDB connection failed: ${err.message}`);
        console.warn(`[Database] Falling back to Local Storage to ensure application remains functional.`);
      } else {
        console.log(`[Database] Local MongoDB server not detected (${err.message}).`);
        console.log(`[Database] Auto-switching to Embedded Persistent JSON Storage.`);
      }
    }
  }

  // 2. If MySQL configured
  if (preferredType === 'mysql') {
    try {
      const mysql = require('mysql2/promise');
      const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST || 'localhost',
        port: Number(process.env.MYSQL_PORT) || 3306,
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || '',
        database: process.env.MYSQL_DATABASE || 'product_crud_db',
        connectTimeout: 2500
      });

      // Ensure products table exists
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS products (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          category VARCHAR(100) NOT NULL,
          price DECIMAL(10, 2) NOT NULL,
          stock INT NOT NULL,
          sku VARCHAR(100) UNIQUE NOT NULL,
          status VARCHAR(50) NOT NULL,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      await connection.end();

      activeDbType = 'mysql';
      connectionStatus = {
        type: 'mysql',
        status: 'Connected',
        message: 'Successfully connected to MySQL database',
        host: process.env.MYSQL_HOST || 'localhost'
      };
      console.log(`[Database] Connected to MySQL database successfully!`);
      return activeDbType;
    } catch (err) {
      console.warn(`[Database Error] MySQL connection failed: ${err.message}. Falling back to Local Storage.`);
    }
  }

  // 3. Embedded Local File Storage Fallback
  activeDbType = 'local';
  connectionStatus = {
    type: 'local',
    status: 'Active',
    message: 'Embedded Persistent File Store (zero setup required)',
    host: 'server/data/products.json'
  };
  console.log(`[Database] Active database mode: Embedded Persistent JSON Storage.`);
  return activeDbType;
};

const getActiveDbType = () => activeDbType;
const getDbStatus = () => connectionStatus;

module.exports = {
  connectDB,
  getActiveDbType,
  getDbStatus
};
