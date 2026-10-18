/**
 * Telemetry Controller
 * Multispectral Index Calculations (NDVI, NDMI, NDWI, SAVI) and Greenhouse Gas Footprint Modeling
 */

const CopernicusService = require('../services/copernicusService');
const EmissionModelService = require('../services/emissionModelService');

exports.computeIndices = (req, res) => {
  try {
    const { nir, red, green, swir, lFactor } = req.body;

    if (nir === undefined || red === undefined) {
      return res.status(400).json({
        success: false,
        error: 'NIR (Band 8) and Red (Band 4) reflectance values are required.'
      });
    }

    const results = CopernicusService.calculateIndices({ nir, red, green, swir, lFactor });
    return res.json({
      success: true,
      data: results
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.calculateEmissions = (req, res) => {
  try {
    const { crop, areaHa, soilType, irrigationType, stageFactor } = req.body;
    const footprint = EmissionModelService.calculateFootprint({
      crop,
      areaHa: parseFloat(areaHa || 1),
      soilType,
      irrigationType,
      stageFactor: stageFactor ? parseFloat(stageFactor) : 1.0
    });

    return res.json({
      success: true,
      data: footprint
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.getBandsReference = (req, res) => {
  return res.json({
    success: true,
    data: CopernicusService.BANDS
  });
};
