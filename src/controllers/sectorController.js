/**
 * Sector Controller
 * Handles CRUD, GeoJSON, CSV Export, Spatial Queries, and Agricultural Aggregations
 */

const { SECTORS, HUBS, SEASON_STAGES } = require('../data/sectorsData');
const CopernicusService = require('../services/copernicusService');

// In-memory sector store with initial data
let sectorStore = [...SECTORS];

exports.getAllSectors = (req, res) => {
  try {
    const { division, crop, search, minNdvi, maxNdvi, page, limit = 50, stageIdx = 3 } = req.query;
    const stage = parseInt(stageIdx, 10);

    let filtered = sectorStore.filter(s => {
      if (division && division !== 'ALL' && s.hub !== division) return false;
      if (crop && !s.crop.toLowerCase().includes(crop.toLowerCase())) return false;
      if (minNdvi && s.peakNdvi < parseFloat(minNdvi)) return false;
      if (maxNdvi && s.peakNdvi > parseFloat(maxNdvi)) return false;
      if (search) {
        const q = search.toLowerCase();
        const matchName = s.name.toLowerCase().includes(q);
        const matchCrop = s.crop.toLowerCase().includes(q);
        const matchDist = s.district.toLowerCase().includes(q);
        const matchId = s.id.toLowerCase().includes(q);
        if (!matchName && !matchCrop && !matchDist && !matchId) return false;
      }
      return true;
    });

    // Compute stage metrics for each
    const enriched = filtered.map(sec => {
      const stageData = CopernicusService.getSectorStageMetrics(sec, stage);
      return {
        ...sec,
        currentStage: stageData.stageName,
        currentMetrics: stageData.telemetry
      };
    });

    // Pagination if requested
    if (page) {
      const p = parseInt(page, 10) || 1;
      const l = parseInt(limit, 10) || 50;
      const start = (p - 1) * l;
      const paginated = enriched.slice(start, start + l);

      return res.json({
        success: true,
        total: enriched.length,
        page: p,
        totalPages: Math.ceil(enriched.length / l),
        data: paginated
      });
    }

    return res.json({
      success: true,
      total: enriched.length,
      data: enriched
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.getSectorById = (req, res) => {
  try {
    const { id } = req.params;
    const stageIdx = parseInt(req.query.stageIdx || 3, 10);
    const sector = sectorStore.find(s => s.id.toLowerCase() === id.toLowerCase());

    if (!sector) {
      return res.status(404).json({ success: false, error: `Sector ${id} not found` });
    }

    const currentMetrics = CopernicusService.getSectorStageMetrics(sector, stageIdx);
    const phenology = CopernicusService.getPhenologySeries(sector);

    return res.json({
      success: true,
      data: {
        ...sector,
        currentStage: currentMetrics.stageName,
        currentMetrics: currentMetrics.telemetry,
        phenologySeries: phenology
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.createSector = (req, res) => {
  try {
    const { name, hub = 'PUNE_CORE', district = 'Pune', crop = 'Mixed Agriculture', area = 15.0, soil = 'Alluvial Black Soil', lat, lng, peakNdvi = 0.75, baseRh = 70 } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({ success: false, error: 'Latitude and Longitude are required' });
    }

    const id = `CUST-${sectorStore.length + 1}`;
    const baseSz = hub === 'PUNE_CORE' ? 0.0052 : 0.022;

    const newSector = {
      id,
      hub,
      district,
      tehsil: 'Custom Parcel',
      name: name || `Custom Plot (${parseFloat(lat).toFixed(3)}°N, ${parseFloat(lng).toFixed(3)}°E)`,
      crop,
      variety: 'Farmer Selected',
      area: parseFloat(area),
      soil,
      irrigationType: 'Precision Drip',
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      peakNdvi: parseFloat(peakNdvi),
      baseRh: parseInt(baseRh, 10),
      baseCo2: +(28.0 + (parseFloat(peakNdvi) * 12)).toFixed(1),
      baseCh4: crop.toLowerCase().includes('paddy') ? 2.8 : 0.8,
      baseN2o: 0.18,
      organicMatterPct: 1.2,
      coordinates: [
        [lat + baseSz, lng - baseSz * 1.2],
        [lat + baseSz * 1.1, lng + baseSz * 1.2],
        [lat - baseSz, lng + baseSz * 1.2],
        [lat - baseSz * 1.1, lng - baseSz * 1.2]
      ]
    };

    sectorStore.unshift(newSector);

    return res.status(201).json({
      success: true,
      message: 'Agricultural parcel created successfully',
      data: newSector
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.getSectorStats = (req, res) => {
  try {
    const totalSectors = sectorStore.length;
    const totalAreaHa = +(sectorStore.reduce((acc, s) => acc + s.area, 0)).toFixed(1);
    const avgNdvi = +(sectorStore.reduce((acc, s) => acc + s.peakNdvi, 0) / totalSectors).toFixed(2);
    const totalDailyCo2eTonnes = +(sectorStore.reduce((acc, s) => acc + (s.baseCo2 * s.area), 0) / 1000).toFixed(2);

    const divisionCounts = {};
    sectorStore.forEach(s => {
      divisionCounts[s.hub] = (divisionCounts[s.hub] || 0) + 1;
    });

    const cropCounts = {};
    sectorStore.forEach(s => {
      cropCounts[s.crop] = (cropCounts[s.crop] || 0) + 1;
    });

    return res.json({
      success: true,
      data: {
        totalSectors,
        totalAreaHa,
        avgPeakNdvi: avgNdvi,
        totalDailyCo2eTonnes,
        divisionCounts,
        cropCounts,
        hubs: HUBS,
        seasons: SEASON_STAGES
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.exportGeoJSON = (req, res) => {
  try {
    const features = sectorStore.map(s => ({
      type: 'Feature',
      id: s.id,
      properties: {
        id: s.id,
        name: s.name,
        district: s.district,
        division: s.hub,
        crop: s.crop,
        areaHa: s.area,
        soil: s.soil,
        peakNdvi: s.peakNdvi,
        baseRh: s.baseRh,
        baseCo2Kg: s.baseCo2
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          s.coordinates.map(([lat, lng]) => [lng, lat]) // GeoJSON standard is [longitude, latitude]
        ]
      }
    }));

    const geojson = {
      type: 'FeatureCollection',
      name: 'Maharashtra_Sentinel2_Agricultural_Sectors',
      crs: {
        type: 'name',
        properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' }
      },
      features
    };

    res.setHeader('Content-Type', 'application/geo+json');
    res.setHeader('Content-Disposition', 'attachment; filename="maharashtra_sectors.geojson"');
    return res.json(geojson);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.exportCSV = (req, res) => {
  try {
    const headers = 'ID,Name,Division,District,Crop,Area_Ha,Soil_Type,Latitude,Longitude,Peak_NDVI,Base_RH_Pct,Base_CO2e_kg\n';
    const rows = sectorStore.map(s => 
      `"${s.id}","${s.name}","${s.hub}","${s.district}","${s.crop}",${s.area},"${s.soil}",${s.lat},${s.lng},${s.peakNdvi},${s.baseRh},${s.baseCo2}`
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="maharashtra_agricultural_sectors.csv"');
    return res.send(headers + rows);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
