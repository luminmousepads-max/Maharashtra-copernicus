/**
 * Analysis Controller
 * Handles Computer Vision Spectral Reflectance Scanning & Sector Matching
 */

const ImageProcessingService = require('../services/imageProcessingService');

exports.scanPhoto = (req, res) => {
  try {
    const { greenPct, soilPct, waterPct, presetKey, stageIdx = 3 } = req.body;

    const result = ImageProcessingService.analyzeSpectralFractions({
      greenPct: greenPct !== undefined ? parseFloat(greenPct) : undefined,
      soilPct: soilPct !== undefined ? parseFloat(soilPct) : undefined,
      waterPct: waterPct !== undefined ? parseFloat(waterPct) : undefined,
      presetKey,
      stageIdx: parseInt(stageIdx, 10)
    });

    return res.json({
      success: true,
      data: result
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.getPresets = (req, res) => {
  return res.json({
    success: true,
    data: ImageProcessingService.PRESETS
  });
};
