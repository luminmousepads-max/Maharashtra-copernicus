/**
 * Copernicus Sentinel-2 Multispectral Index & Telemetry Engine
 * Computes:
 * - NDVI: Normalized Difference Vegetation Index = (NIR - Red) / (NIR + Red)
 * - NDMI: Normalized Difference Moisture Index = (NIR - SWIR) / (NIR + SWIR)
 * - NDWI: Normalized Difference Water Index = (Green - NIR) / (Green + NIR)
 * - SAVI: Soil Adjusted Vegetation Index = ((NIR - Red) / (NIR + Red + L)) * (1 + L)
 */

const { SEASON_STAGES } = require('../data/sectorsData');

class CopernicusService {
  /**
   * Sentinel-2 Level-2A Spectral Bands Reference
   */
  static BANDS = {
    B2: { name: 'Blue', centerWl: '490 nm', res: '10m', role: 'Atmospheric scattering, chlorophyll absorption' },
    B3: { name: 'Green', centerWl: '560 nm', res: '10m', role: 'Green vegetation peak reflectance' },
    B4: { name: 'Red', centerWl: '665 nm', res: '10m', role: 'Chlorophyll-a maximum absorption' },
    B8: { name: 'NIR (Near Infrared)', centerWl: '842 nm', res: '10m', role: 'Leaf mesophyll cell wall scattering' },
    B11: { name: 'SWIR-1', centerWl: '1610 nm', res: '20m', role: 'Canopy liquid water & leaf turgor' }
  };

  /**
   * Calculate multispectral indices from band reflectance values (0.0 to 1.0)
   */
  static calculateIndices({ nir, red, green = 0.15, swir = 0.20, lFactor = 0.5 }) {
    nir = Math.max(0.001, Math.min(1.0, parseFloat(nir)));
    red = Math.max(0.001, Math.min(1.0, parseFloat(red)));
    green = Math.max(0.001, Math.min(1.0, parseFloat(green)));
    swir = Math.max(0.001, Math.min(1.0, parseFloat(swir)));

    // 1. NDVI = (NIR - RED) / (NIR + RED)
    const ndvi = (nir - red) / (nir + red);

    // 2. NDMI (Normalized Difference Moisture Index) = (NIR - SWIR) / (NIR + SWIR)
    const ndmi = (nir - swir) / (nir + swir);

    // 3. NDWI (Water Index) = (Green - NIR) / (Green + NIR)
    const ndwi = (green - nir) / (green + nir);

    // 4. SAVI = ((NIR - RED) / (NIR + RED + L)) * (1 + L)
    const savi = ((nir - red) / (nir + red + lFactor)) * (1 + lFactor);

    // Health categorization
    let canopyClassification = 'Bare Soil / Water';
    let agronomicStatus = 'Unvegetated or deeply waterlogged';

    if (ndvi >= 0.70) {
      canopyClassification = 'High-Vigour Closed Canopy';
      agronomicStatus = 'Excellent chlorophyll density & optimal photosynthetic activity';
    } else if (ndvi >= 0.50) {
      canopyClassification = 'Moderate-to-Dense Canopy';
      agronomicStatus = 'Healthy growth, active vegetative or reproduction stage';
    } else if (ndvi >= 0.25) {
      canopyClassification = 'Early Emergence / Sparse Crop';
      agronomicStatus = 'Developing seedlings or moderate crop moisture stress';
    } else if (ndvi >= 0.10) {
      canopyClassification = 'Fallow / Pre-sowing';
      agronomicStatus = 'Dry crop stubble, tilled black soil, or weeds';
    }

    return {
      indices: {
        ndvi: +ndvi.toFixed(3),
        ndmi: +ndmi.toFixed(3),
        ndwi: +ndwi.toFixed(3),
        savi: +savi.toFixed(3)
      },
      canopyClassification,
      agronomicStatus,
      inputBands: { nir, red, green, swir }
    };
  }

  /**
   * Derive season stage metrics for a given sector
   */
  static getSectorStageMetrics(sector, stageIdx = 3) {
    const stage = SEASON_STAGES[stageIdx] || SEASON_STAGES[3];
    
    // Scale NDVI by stage phenology factor
    const ndvi = Math.max(0.05, Math.min(0.94, +(sector.peakNdvi * stage.ndviFactor).toFixed(2)));
    
    // Estimate NIR and RED based on NDVI and sum conservation
    const sum = 0.62;
    const nir = +(((ndvi + 1) * sum) / 2).toFixed(2);
    const red = +(sum - nir).toFixed(2);

    // Relative humidity and soil moisture
    const rh = Math.max(22, Math.min(98, Math.round(sector.baseRh + stage.rhDelta)));
    const soilMoisture0to5cm = Math.round(rh * 0.54);

    // GHG Flux calculations
    const co2Total = +(sector.baseCo2 * stage.emissionFactor).toFixed(1);
    const ch4 = +(sector.baseCh4 * stage.emissionFactor).toFixed(2);
    const n2o = +(co2Total * 0.0055).toFixed(2);
    const co2Pure = +(co2Total * 0.70).toFixed(1);

    // Fungal and transpiration risk
    let diseaseRisk = 'Low';
    if (rh > 80) diseaseRisk = 'High (Powdery mildew / Blight alert)';
    else if (rh > 70) diseaseRisk = 'Moderate (Monitor leaf wetness)';

    return {
      sectorId: sector.id,
      stageIndex: stage.index,
      stageDate: stage.date,
      stageDoy: stage.doy,
      stageName: stage.name,
      telemetry: {
        ndvi,
        nir,
        red,
        rh,
        soilMoisture0to5cm,
        diseaseRisk,
        ghg: {
          totalCo2e: co2Total,
          co2Pure,
          ch4,
          n2o,
          unit: 'kg CO₂e/ha/day'
        }
      }
    };
  }

  /**
   * Multi-stage phenology time series for a sector
   */
  static getPhenologySeries(sector) {
    return SEASON_STAGES.map((s, idx) => {
      const metrics = this.getSectorStageMetrics(sector, idx);
      return {
        stageIndex: idx,
        date: s.date,
        doy: s.doy,
        stageName: s.name,
        ndvi: metrics.telemetry.ndvi,
        rh: metrics.telemetry.rh,
        co2e: metrics.telemetry.ghg.totalCo2e
      };
    });
  }
}

module.exports = CopernicusService;
