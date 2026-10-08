require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database connection (supports MongoDB, MySQL, and Local JSON storage)
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging in development
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api', productRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Serve static React production build if available
const clientBuildPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientBuildPath));

// For any other route, send back index.html (SPA routing support)
app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(clientBuildPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      // If frontend dist is not built yet, return informative JSON
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>CRUD API Server</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; background: #0f172a; color: #f8fafc; }
            .card { background: #1e293b; padding: 24px; border-radius: 12px; max-width: 600px; margin: 0 auto; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
            h1 { color: #38bdf8; margin-top: 0; }
            code { background: #334155; padding: 2px 6px; border-radius: 4px; color: #e2e8f0; }
            a { color: #38bdf8; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Backend Server Active (Port ${PORT})</h1>
            <p>The Express.js MVC backend is online and healthy.</p>
            <p>API Endpoint: <a href="/api/products" target="_blank"><code>/api/products</code></a></p>
            <p>DB Status: <a href="/api/db-status" target="_blank"><code>/api/db-status</code></a></p>
            <p>To run the React frontend during development, start Vite on port 5173 or run <code>npm run build</code> in the client folder.</p>
          </div>
        </body>
        </html>
      `);
    }
  });
});

// Centralized Error Handler
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📦 REST API Base: http://localhost:${PORT}/api/products`);
  console.log(`📊 DB Health Check: http://localhost:${PORT}/api/db-status`);
  console.log(`=======================================================`);
});
