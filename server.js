/**
 * Maharashtra Copernicus Sentinel-2 Agricultural Telemetry Platform
 * Enterprise Express Application Server
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');

const apiRoutes = require('./src/routes/api');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Static Frontend files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api', apiRoutes);

// Fallback route for SPA
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Centralized Error Handling
app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`================================================================`);
    console.log(`🛰️  Maharashtra Copernicus Sentinel-2 R&D Server Online`);
    console.log(`📍  Port: http://localhost:${PORT}`);
    console.log(`🌐  API Health: http://localhost:${PORT}/api/health`);
    console.log(`🗺️  GIS Sectors: http://localhost:${PORT}/api/sectors`);
    console.log(`================================================================`);
  });
}

module.exports = app;
