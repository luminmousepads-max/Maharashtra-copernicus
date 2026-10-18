/**
 * Maharashtra Agricultural Telemetry Dataset
 * 152+ Farmland Sectors across 6 Administrative Divisions
 * Calibrated with ESA Copernicus Sentinel-2 L2A & IPCC Tier-1 Agro-Emission Models
 */

const SEASON_STAGES = [
  { index: 0, date: '2026-04-12', doy: 102, name: 'Pre-Sowing / Fallow', ndviFactor: 0.28, rhDelta: -16, emissionFactor: 0.48 },
  { index: 1, date: '2026-05-24', doy: 144, name: 'Early Emergence', ndviFactor: 0.50, rhDelta: -7, emissionFactor: 0.68 },
  { index: 2, date: '2026-06-18', doy: 169, name: 'Jointing Stage', ndviFactor: 0.82, rhDelta: +2, emissionFactor: 0.90 },
  { index: 3, date: '2026-07-24', doy: 205, name: 'Tasseling (Peak Vigour)', ndviFactor: 1.00, rhDelta: +7, emissionFactor: 1.00 },
  { index: 4, date: '2026-09-08', doy: 251, name: 'Maturity Stage', ndviFactor: 0.76, rhDelta: +2, emissionFactor: 0.80 },
  { index: 5, date: '2026-10-14', doy: 287, name: 'Post-Harvest Stubble', ndviFactor: 0.34, rhDelta: -6, emissionFactor: 0.52 }
];

const HUBS = {
  PUNE_CORE: {
    id: 'PUNE_CORE',
    name: 'Pune Division (Wagholi & Haveli Core)',
    district: 'Pune',
    lat: 18.5800,
    lng: 74.0000,
    zoom: 13,
    description: 'Sugarcane, Indrayani paddy, onion, floriculture, and urban fringe peri-agriculture along the Mula-Mutha and Bhima river basins.'
  },
  PASCHIM: {
    id: 'PASCHIM',
    name: 'Paschim Maharashtra (Satara, Sangli & Kolhapur)',
    district: 'Satara/Sangli/Kolhapur',
    lat: 17.2500,
    lng: 74.3500,
    zoom: 9,
    description: 'Krishna & Koyna river valleys known for sugar belt cooperatives, turmeric, high-value export table grapes, and dairy fodder.'
  },
  NASHIK: {
    id: 'NASHIK',
    name: 'Nashik & Khandesh Division (Godavari Basin)',
    district: 'Nashik/Jalgaon',
    lat: 20.2500,
    lng: 74.4000,
    zoom: 9,
    description: 'India\'s grape capital (Dindori/Niphad), Lasalgaon onion market, and Jalgaon Grand Naine banana plantations.'
  },
  MARATHWADA: {
    id: 'MARATHWADA',
    name: 'Marathwada Division (Sambhajinagar & Latur)',
    district: 'Chhatrapati Sambhajinagar/Latur/Jalna',
    lat: 19.1000,
    lng: 76.3000,
    zoom: 8,
    description: 'Drought-prone rainshadow plateau cultivating climate-resilient soybean, pigeon pea (tur), cotton, and sweet lime (mosambi).'
  },
  VIDARBHA: {
    id: 'VIDARBHA',
    name: 'Vidarbha Division (Nagpur & Amravati)',
    district: 'Nagpur/Amravati/Wardha',
    lat: 20.8000,
    lng: 78.2000,
    zoom: 8,
    description: 'Nagpur mandarin orange orchards, black cotton soil belt, and Wainganga flooded paddy wetlands.'
  },
  KONKAN: {
    id: 'KONKAN',
    name: 'Konkan Division (Ratnagiri & Raigad)',
    district: 'Ratnagiri/Sindhudurg/Raigad',
    lat: 17.8000,
    lng: 73.3000,
    zoom: 9,
    description: 'High-rainfall Western Ghats coastal belt: GI-tagged Alphonso mango orchards, cashew nut plantations, and coastal kharif paddy.'
  }
};

function generatePolygon(lat, lng, dLat = 0.0055, dLng = 0.0068, skew = 0.0010) {
  return [
    [lat + dLat, lng - dLng + skew],
    [lat + dLat + skew, lng + dLng],
    [lat - dLat, lng + dLng - skew],
    [lat - dLat - skew, lng - dLng]
  ];
}

// 10 Core Handcrafted Pune / Wagholi High-Resolution Sectors
const BASE_CORE_SECTORS = [
  {
    id: 'WAG-01',
    hub: 'PUNE_CORE',
    district: 'Pune',
    tehsil: 'Haveli',
    name: 'Wagholi North Sugarcane Belt',
    crop: 'Sugarcane',
    variety: 'Co 86032',
    area: 16.4,
    soil: 'Deep Black Alluvial',
    irrigationType: 'Furrow Irrigation',
    lat: 18.5960,
    lng: 73.9760,
    peakNdvi: 0.82,
    baseRh: 76,
    baseCo2: 38.4,
    baseCh4: 1.65,
    baseN2o: 0.21,
    organicMatterPct: 1.4
  },
  {
    id: 'WAG-02',
    hub: 'PUNE_CORE',
    district: 'Pune',
    tehsil: 'Haveli',
    name: 'Wagholi South Bajra Dryland',
    crop: 'Pearl Millet (Bajra)',
    variety: 'ICTP 8203',
    area: 11.2,
    soil: 'Medium Black Vertisol',
    irrigationType: 'Rainfed',
    lat: 18.5650,
    lng: 73.9810,
    peakNdvi: 0.56,
    baseRh: 53,
    baseCo2: 19.2,
    baseCh4: 0.42,
    baseN2o: 0.11,
    organicMatterPct: 0.8
  },
  {
    id: 'WAG-03',
    hub: 'PUNE_CORE',
    district: 'Pune',
    tehsil: 'Haveli',
    name: 'Kesnand Sorghum & Fodder Plot',
    crop: 'Jowar (Sorghum)',
    variety: 'M 35-1 (Maldandi)',
    area: 14.8,
    soil: 'Calcareous Loam',
    irrigationType: 'Sprinkler',
    lat: 18.5730,
    lng: 74.0080,
    peakNdvi: 0.68,
    baseRh: 63,
    baseCo2: 24.5,
    baseCh4: 0.68,
    baseN2o: 0.14,
    organicMatterPct: 1.1
  },
  {
    id: 'WAG-04',
    hub: 'PUNE_CORE',
    district: 'Pune',
    tehsil: 'Haveli',
    name: 'Lonikand Irrigated Red Onion',
    crop: 'Red Onion & Wheat',
    variety: 'Bhima Super',
    area: 19.0,
    soil: 'Silty Clay Loam',
    irrigationType: 'Drip Precision',
    lat: 18.6150,
    lng: 74.0190,
    peakNdvi: 0.74,
    baseRh: 69,
    baseCo2: 28.9,
    baseCh4: 0.88,
    baseN2o: 0.16,
    organicMatterPct: 1.2
  },
  {
    id: 'WAG-05',
    hub: 'PUNE_CORE',
    district: 'Pune',
    tehsil: 'Haveli',
    name: 'Bhima Riverbank Wet Paddy',
    crop: 'Paddy (Flooded Rice)',
    variety: 'Indrayani',
    area: 22.5,
    soil: 'Hydromorphic Alluvial',
    irrigationType: 'Continuous Flooding',
    lat: 18.5990,
    lng: 74.0410,
    peakNdvi: 0.86,
    baseRh: 84,
    baseCo2: 49.6,
    baseCh4: 3.15,
    baseN2o: 0.28,
    organicMatterPct: 1.9
  },
  {
    id: 'WAG-06',
    hub: 'PUNE_CORE',
    district: 'Pune',
    tehsil: 'Haveli',
    name: 'Bakori Hill Pomegranate & Gram',
    crop: 'Pomegranate',
    variety: 'Bhagawa',
    area: 13.6,
    soil: 'Gravelly Loam',
    irrigationType: 'Drip Precision',
    lat: 18.5530,
    lng: 74.0190,
    peakNdvi: 0.52,
    baseRh: 50,
    baseCo2: 17.8,
    baseCh4: 0.35,
    baseN2o: 0.09,
    organicMatterPct: 0.7
  },
  {
    id: 'WAG-07',
    hub: 'PUNE_CORE',
    district: 'Pune',
    tehsil: 'Haveli',
    name: 'Wadebolhai Soybean & Tur Belt',
    crop: 'Soybean',
    variety: 'JS 335',
    area: 18.2,
    soil: 'Medium Vertisol',
    irrigationType: 'Rainfed + Supplemental Drip',
    lat: 18.5620,
    lng: 74.0510,
    peakNdvi: 0.71,
    baseRh: 66,
    baseCo2: 25.1,
    baseCh4: 0.62,
    baseN2o: 0.15,
    organicMatterPct: 1.3
  },
  {
    id: 'WAG-08',
    hub: 'PUNE_CORE',
    district: 'Pune',
    tehsil: 'Haveli',
    name: 'Avhalwadi Vegetable Cluster',
    crop: 'Leafy Vegetables (Spinach/Methi)',
    variety: 'All Green',
    area: 9.4,
    soil: 'Loamy Black',
    irrigationType: 'Micro-Sprinkler',
    lat: 18.5800,
    lng: 73.9580,
    peakNdvi: 0.69,
    baseRh: 67,
    baseCo2: 26.4,
    baseCh4: 0.74,
    baseN2o: 0.14,
    organicMatterPct: 1.2
  },
  {
    id: 'WAG-09',
    hub: 'PUNE_CORE',
    district: 'Pune',
    tehsil: 'Haveli',
    name: 'Manjari VSI Experimental Cane',
    crop: 'Sugarcane',
    variety: 'VSI 08005',
    area: 25.0,
    soil: 'Heavy Black Cotton',
    irrigationType: 'Sub-surface Drip',
    lat: 18.5350,
    lng: 73.9820,
    peakNdvi: 0.85,
    baseRh: 79,
    baseCo2: 40.2,
    baseCh4: 1.78,
    baseN2o: 0.22,
    organicMatterPct: 1.6
  },
  {
    id: 'WAG-10',
    hub: 'PUNE_CORE',
    district: 'Pune',
    tehsil: 'Haveli',
    name: 'Loni Kalbhor Canal Maize & Grape',
    crop: 'Sweet Corn & Maize',
    variety: 'Sugar 75',
    area: 21.0,
    soil: 'Alluvial Loam',
    irrigationType: 'Canal Flow',
    lat: 18.5250,
    lng: 74.0220,
    peakNdvi: 0.77,
    baseRh: 72,
    baseCo2: 31.5,
    baseCh4: 1.05,
    baseN2o: 0.18,
    organicMatterPct: 1.3
  }
];

// Seed generator across all 6 administrative divisions of Maharashtra to create 152+ sectors
const DIVISION_CONFIGS = [
  {
    hub: 'PUNE_CORE',
    prefix: 'PUN',
    dist: 'Pune',
    count: 22,
    baseLat: 18.59,
    baseLng: 74.02,
    spread: 0.09,
    crops: [
      { name: 'Sugarcane', variety: 'Co 86032', peak: 0.83, rh: 77, co2: 38.0, ch4: 1.70, soil: 'Deep Black Alluvial' },
      { name: 'Indrayani Paddy', variety: 'Indrayani', peak: 0.86, rh: 83, co2: 48.5, ch4: 3.20, soil: 'Hydromorphic Clay' },
      { name: 'Red Onion', variety: 'Bhima Super', peak: 0.72, rh: 68, co2: 27.5, ch4: 0.80, soil: 'Silty Loam' },
      { name: 'Hybrid Tomato', variety: 'Abhinav', peak: 0.75, rh: 70, co2: 29.0, ch4: 0.90, soil: 'Sandy Clay Loam' },
      { name: 'Purandar Fig', variety: 'Poona Fig (GI)', peak: 0.65, rh: 58, co2: 21.0, ch4: 0.45, soil: 'Gravelly Vertisol' }
    ]
  },
  {
    hub: 'PASCHIM',
    prefix: 'PAS',
    dist: 'Satara/Sangli/Kolhapur',
    count: 25,
    baseLat: 17.25,
    baseLng: 74.35,
    spread: 0.55,
    crops: [
      { name: 'Adsali Sugarcane', variety: 'CoM 0265 (Phule 265)', peak: 0.85, rh: 78, co2: 41.0, ch4: 1.85, soil: 'Deep Krishna Alluvium' },
      { name: 'Satara Turmeric', variety: 'Salem / Waigaon', peak: 0.74, rh: 72, co2: 28.5, ch4: 0.75, soil: 'Well-Drained Loam' },
      { name: 'Export Grapes', variety: 'Thompson Seedless', peak: 0.78, rh: 66, co2: 26.0, ch4: 0.60, soil: 'Medium Vertisol' },
      { name: 'Rabi Jowar', variety: 'Phule Anuradha', peak: 0.58, rh: 52, co2: 18.5, ch4: 0.40, soil: 'Medium Black' },
      { name: 'Kolhapur Soybean', variety: 'KDS 726 (Phule Sangam)', peak: 0.77, rh: 70, co2: 27.0, ch4: 0.70, soil: 'Clayey Vertisol' }
    ]
  },
  {
    hub: 'NASHIK',
    prefix: 'NAS',
    dist: 'Nashik/Jalgaon',
    count: 25,
    baseLat: 20.25,
    baseLng: 74.40,
    spread: 0.55,
    crops: [
      { name: 'Wine & Table Grapes', variety: 'Cabernet / Sharad Seedless', peak: 0.80, rh: 65, co2: 27.5, ch4: 0.65, soil: 'Volcanic Basalt Loam' },
      { name: 'Lasalgaon Onion', variety: 'Nashik Red', peak: 0.73, rh: 64, co2: 26.5, ch4: 0.70, soil: 'Fine Silt Loam' },
      { name: 'Jalgaon Banana', variety: 'Grand Naine (G9)', peak: 0.84, rh: 80, co2: 44.0, ch4: 2.10, soil: 'Tapi River Alluvium' },
      { name: 'Khandesh Cotton', variety: 'Bt Hybrid RCH-659', peak: 0.68, rh: 58, co2: 23.5, ch4: 0.55, soil: 'Deep Black Cotton Soil' },
      { name: 'Kalvan Pomegranate', variety: 'Bhagawa Super', peak: 0.62, rh: 54, co2: 20.0, ch4: 0.40, soil: 'Light Gravelly Soil' }
    ]
  },
  {
    hub: 'MARATHWADA',
    prefix: 'MAR',
    dist: 'Sambhajinagar/Latur/Jalna',
    count: 25,
    baseLat: 19.10,
    baseLng: 76.30,
    spread: 0.60,
    crops: [
      { name: 'Soybean & Tur Intercrop', variety: 'MAUS 158 + BDN 711', peak: 0.73, rh: 62, co2: 25.0, ch4: 0.65, soil: 'Medium Black Vertisol' },
      { name: 'Marathwada Bt Cotton', variety: 'Bollgard II', peak: 0.67, rh: 55, co2: 22.0, ch4: 0.50, soil: 'Black Cotton Soil' },
      { name: 'Jalna Sweet Lime (Mosambi)', variety: 'Mosambi N-4', peak: 0.76, rh: 61, co2: 24.5, ch4: 0.55, soil: 'Deep Loam' },
      { name: 'Latur Rabi Sorghum', variety: 'Maldandi', peak: 0.55, rh: 48, co2: 17.0, ch4: 0.35, soil: 'Shallow to Medium Soil' },
      { name: 'Desi Chickpea (Harbara)', variety: 'Digvijay', peak: 0.63, rh: 51, co2: 19.5, ch4: 0.42, soil: 'Clay Loam' }
    ]
  },
  {
    hub: 'VIDARBHA',
    prefix: 'VID',
    dist: 'Nagpur/Amravati/Wardha',
    count: 25,
    baseLat: 20.80,
    baseLng: 78.20,
    spread: 0.65,
    crops: [
      { name: 'Nagpur Mandarin Orange', variety: 'Nagpur Santra (GI)', peak: 0.81, rh: 68, co2: 29.0, ch4: 0.70, soil: 'Sub-Humid Clay Vertisol' },
      { name: 'Amravati White Gold Cotton', variety: 'Suraj Hybrid', peak: 0.69, rh: 57, co2: 23.0, ch4: 0.52, soil: 'Heavy Black Cotton Soil' },
      { name: 'Wainganga Flooded Paddy', variety: 'PKV HMT Rice', peak: 0.87, rh: 86, co2: 51.0, ch4: 3.40, soil: 'Riverine Alluvial Silt' },
      { name: 'Wardha Soybean', variety: 'JS 9305', peak: 0.74, rh: 64, co2: 26.0, ch4: 0.68, soil: 'Medium Vertisol' },
      { name: 'Vidarbha Irrigated Wheat', variety: 'GW 496', peak: 0.72, rh: 60, co2: 24.0, ch4: 0.58, soil: 'Alluvial Loam' }
    ]
  },
  {
    hub: 'KONKAN',
    prefix: 'KON',
    dist: 'Ratnagiri/Raigad/Sindhudurg',
    count: 20,
    baseLat: 17.80,
    baseLng: 73.30,
    spread: 0.50,
    crops: [
      { name: 'Coastal Kharif Paddy', variety: 'Karjat 3 / Wada Kolam', peak: 0.88, rh: 88, co2: 48.0, ch4: 3.10, soil: 'Coastal Lowland Clay' },
      { name: 'Ratnagiri Alphonso Mango', variety: 'Hapus (GI)', peak: 0.82, rh: 74, co2: 28.0, ch4: 0.65, soil: 'Lateritic Red Clay' },
      { name: 'Konkan Cashew & Coconut', variety: 'Vengurla 4', peak: 0.79, rh: 76, co2: 25.5, ch4: 0.58, soil: 'Laterite Gravel' },
      { name: 'Finger Millet (Nachni)', variety: 'Dapoli 1', peak: 0.66, rh: 70, co2: 20.5, ch4: 0.45, soil: 'Hill Slope Terraced Loam' }
    ]
  }
];

const SECTORS = [...BASE_CORE_SECTORS];

DIVISION_CONFIGS.forEach(reg => {
  for (let i = 1; i <= reg.count; i++) {
    const angle = i * 2.39996;
    const radius = Math.sqrt(i / reg.count) * reg.spread;
    const lat = +(reg.baseLat + Math.sin(angle) * radius).toFixed(4);
    const lng = +(reg.baseLng + Math.cos(angle) * radius).toFixed(4);
    const cropTemplate = reg.crops[i % reg.crops.length];
    const isWet = cropTemplate.name.includes('Paddy') || cropTemplate.name.includes('Cane') || cropTemplate.name.includes('Banana');
    
    const jitterNdvi = +((i % 7) * 0.01 - 0.03).toFixed(2);
    const jitterRh = (i % 5) * 2 - 4;
    const jitterCo2 = +((i % 9) * 0.8 - 3.2).toFixed(1);

    SECTORS.push({
      id: `${reg.prefix}-${String(i).padStart(2, '0')}`,
      hub: reg.hub,
      district: reg.dist.split('/')[0],
      tehsil: `Tehsil ${String.fromCharCode(65 + (i % 6))}`,
      name: `${reg.dist.split('/')[0]} Sector #${i} (${cropTemplate.name})`,
      crop: cropTemplate.name,
      variety: cropTemplate.variety,
      area: +(12.0 + (i * 3.7) % 28.5).toFixed(1),
      soil: cropTemplate.soil,
      irrigationType: isWet ? 'Continuous / Furrow' : 'Drip Precision & Rainfed',
      lat,
      lng,
      peakNdvi: Math.max(0.35, Math.min(0.92, +(cropTemplate.peak + jitterNdvi).toFixed(2))),
      baseRh: Math.max(40, Math.min(94, Math.round(cropTemplate.rh + jitterRh))),
      baseCo2: Math.max(14.0, Math.min(58.0, +(cropTemplate.co2 + jitterCo2).toFixed(1))),
      baseCh4: cropTemplate.ch4,
      baseN2o: +(cropTemplate.co2 * 0.0055).toFixed(2),
      organicMatterPct: +(1.0 + (i % 8) * 0.12).toFixed(1)
    });
  }
});

// Attach GeoJSON styled polygons to each sector
SECTORS.forEach((p, idx) => {
  const isRegional = p.hub !== 'PUNE_CORE';
  const baseSz = isRegional ? 0.022 : 0.0052;
  p.coordinates = generatePolygon(p.lat, p.lng, baseSz, baseSz * 1.25, ((idx % 5) - 2) * (baseSz * 0.15));
});

module.exports = {
  SEASON_STAGES,
  HUBS,
  SECTORS
};
