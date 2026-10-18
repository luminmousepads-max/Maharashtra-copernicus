/**
 * Maharashtra Copernicus Sentinel REST API Routes
 */

const express = require('express');
const router = express.Router();

const sectorController = require('../controllers/sectorController');
const analysisController = require('../controllers/analysisController');
const telemetryController = require('../controllers/telemetryController');
const weatherController = require('../controllers/weatherController');

// Sector Endpoints
router.get('/sectors', sectorController.getAllSectors);
router.get('/sectors/stats/summary', sectorController.getSectorStats);
router.get('/sectors/:id', sectorController.getSectorById);
router.post('/sectors', sectorController.createSector);

// Export Endpoints
router.get('/export/geojson', sectorController.exportGeoJSON);
router.get('/export/csv', sectorController.exportCSV);

// Computer Vision Spectral Analysis Endpoints
router.post('/analysis/scan-photo', analysisController.scanPhoto);
router.get('/analysis/presets', analysisController.getPresets);

// Telemetry & Indices Endpoints
router.post('/telemetry/indices', telemetryController.computeIndices);
router.post('/telemetry/emissions', telemetryController.calculateEmissions);
router.get('/telemetry/bands', telemetryController.getBandsReference);

// Agro-Meteorology Endpoints
router.get('/weather/:district', weatherController.getAgroWeather);

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Maharashtra Copernicus Sentinel-2 Agro-Telemetry API',
    version: '2.0.0'
  });
});

module.exports = router;
