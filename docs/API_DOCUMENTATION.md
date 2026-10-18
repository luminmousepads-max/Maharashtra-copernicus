# 📡 API Documentation — Maharashtra Copernicus Sentinel-2 Platform

Base URL: `http://localhost:3000/api`

---

## 1. System Health & Metadata

### `GET /health`
Returns the operational health and version of the API service.

#### Request Example
```bash
curl -X GET http://localhost:3000/api/health
```

#### Response (200 OK)
```json
{
  "status": "online",
  "timestamp": "2026-10-18T07:45:00.000Z",
  "service": "Maharashtra Copernicus Sentinel-2 Agro-Telemetry API",
  "version": "2.0.0"
}
```

---

## 2. Farmland Sectors

### `GET /sectors`
Fetch sectors with optional spatial and agricultural filters.

#### Query Parameters
| Parameter | Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `division` | string | No | Division hub key | `PUNE_CORE`, `PASCHIM`, `NASHIK`, `MARATHWADA`, `VIDARBHA`, `KONKAN`, `ALL` |
| `crop` | string | No | Filter by crop name | `sugarcane`, `paddy`, `onion` |
| `search` | string | No | Search across ID, name, district | `Wagholi`, `Lasalgaon` |
| `minNdvi` | float | No | Minimum peak NDVI threshold | `0.70` |
| `maxNdvi` | float | No | Maximum peak NDVI threshold | `0.90` |
| `stageIdx`| integer| No | Phenology stage index (0 to 5) | `3` (Default: Peak Tasseling) |
| `page` | integer| No | Page number for pagination | `1` |
| `limit` | integer| No | Results per page | `20` |

#### Request Example
```bash
curl -X GET "http://localhost:3000/api/sectors?division=PUNE_CORE&crop=sugarcane"
```

---

### `GET /sectors/:id`
Retrieves a single sector along with its complete 6-stage phenological trajectory.

#### Path Parameters
- `id`: Sector identifier (e.g. `WAG-01`, `PUN-04`, `NAS-12`)

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "WAG-01",
    "hub": "PUNE_CORE",
    "district": "Pune",
    "tehsil": "Haveli",
    "name": "Wagholi North Sugarcane Belt",
    "crop": "Sugarcane",
    "variety": "Co 86032",
    "area": 16.4,
    "soil": "Deep Black Alluvial",
    "currentStage": "Tasseling (Peak Vigour)",
    "currentMetrics": {
      "ndvi": 0.82,
      "nir": 0.56,
      "red": 0.06,
      "rh": 76,
      "soilMoisture0to5cm": 41,
      "diseaseRisk": "Moderate (Monitor leaf wetness)",
      "ghg": {
        "totalCo2e": 38.4,
        "co2Pure": 26.9,
        "ch4": 1.65,
        "n2o": 0.21,
        "unit": "kg CO₂e/ha/day"
      }
    },
    "phenologySeries": [
      { "stageIndex": 0, "date": "2026-04-12", "doy": 102, "ndvi": 0.23, "rh": 60, "co2e": 18.4 },
      { "stageIndex": 1, "date": "2026-05-24", "doy": 144, "ndvi": 0.41, "rh": 69, "co2e": 26.1 },
      { "stageIndex": 2, "date": "2026-06-18", "doy": 169, "ndvi": 0.67, "rh": 78, "co2e": 34.6 },
      { "stageIndex": 3, "date": "2026-07-24", "doy": 205, "ndvi": 0.82, "rh": 76, "co2e": 38.4 },
      { "stageIndex": 4, "date": "2026-09-08", "doy": 251, "ndvi": 0.62, "rh": 78, "co2e": 30.7 },
      { "stageIndex": 5, "date": "2026-10-14", "doy": 287, "ndvi": 0.28, "rh": 70, "co2e": 20.0 }
    ]
  }
}
```

---

### `POST /sectors`
Registers a new agricultural parcel into the spatial database.

#### Request Body
```json
{
  "name": "Baramati Drip Pomegranate Orchard",
  "hub": "PUNE_CORE",
  "district": "Pune",
  "crop": "Pomegranate (Bhagawa)",
  "area": 14.5,
  "soil": "Medium Black Vertisol",
  "lat": 18.1520,
  "lng": 74.5780,
  "peakNdvi": 0.76,
  "baseRh": 68
}
```

---

## 3. Data Export Endpoints

### `GET /export/geojson`
Returns an RFC 7946 compliant GeoJSON `FeatureCollection` for QGIS, ArcGIS, Mapbox, or Leaflet.

### `GET /export/csv`
Returns a comma-separated values file of all monitored sectors.

---

## 4. Computer Vision Analysis

### `POST /analysis/scan-photo`
Submits spectral fractions (or preset key) extracted from field/drone photos.

#### Request Body
```json
{
  "presetKey": "WAGHOLI_CANE",
  "stageIdx": 3
}
```
*Or custom fractions:*
```json
{
  "greenPct": 80.5,
  "soilPct": 12.0,
  "waterPct": 7.5
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "classification": {
      "greenCanopyPct": 80.5,
      "bareSoilPct": 12.0,
      "surfaceWaterPct": 7.5,
      "estimatedNdvi": 0.81
    },
    "match": {
      "sectorId": "WAG-01",
      "sectorName": "Wagholi North Sugarcane Belt",
      "district": "Pune",
      "confidencePct": 97.4
    }
  }
}
```

---

## 5. Telemetry & Indices

### `POST /telemetry/indices`
Calculates multispectral indices given raw band reflectance values.

#### Request Body
```json
{
  "nir": 0.72,
  "red": 0.08,
  "green": 0.14,
  "swir": 0.18
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "indices": {
      "ndvi": 0.80,
      "ndmi": 0.60,
      "ndwi": -0.674,
      "savi": 0.738
    },
    "canopyClassification": "High-Vigour Closed Canopy",
    "agronomicStatus": "Excellent chlorophyll density & optimal photosynthetic activity"
  }
}
```

---

## 6. Live Agro-Meteorology

### `GET /weather/:district`
Fetches real-time weather and soil telemetry for Maharashtra hubs.

#### Path Parameters
- `district`: Target district (`Pune`, `Satara`, `Kolhapur`, `Nashik`, `Jalgaon`, `Sambhajinagar`, `Latur`, `Nagpur`, `Amravati`, `Ratnagiri`).
