/**
 * Automated Integration Test Suite for Maharashtra Copernicus API
 * Uses Node.js native test runner (node:test)
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../server');

let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test('GET /api/health should return online status', async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, 'online');
  assert.equal(data.version, '2.0.0');
});

test('GET /api/sectors should return all 152+ sectors with telemetry', async () => {
  const res = await fetch(`${baseUrl}/api/sectors`);
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.ok(json.total >= 150, `Expected at least 150 sectors, got ${json.total}`);
  assert.ok(Array.isArray(json.data));
  
  const first = json.data[0];
  assert.ok(first.id);
  assert.ok(first.name);
  assert.ok(first.currentMetrics);
  assert.ok(first.currentMetrics.ndvi !== undefined);
  assert.ok(first.currentMetrics.rh !== undefined);
});

test('GET /api/sectors with division filter works', async () => {
  const res = await fetch(`${baseUrl}/api/sectors?division=PUNE_CORE`);
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.ok(json.total >= 30);
  json.data.forEach(s => assert.equal(s.hub, 'PUNE_CORE'));
});

test('GET /api/sectors/:id returns full detail with phenology series', async () => {
  const res = await fetch(`${baseUrl}/api/sectors/WAG-01`);
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.equal(json.data.id, 'WAG-01');
  assert.ok(Array.isArray(json.data.phenologySeries));
  assert.equal(json.data.phenologySeries.length, 6);
});

test('POST /api/telemetry/indices calculates accurate NDVI & SAVI', async () => {
  const res = await fetch(`${baseUrl}/api/telemetry/indices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nir: 0.70, red: 0.10, green: 0.15, swir: 0.20 })
  });
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.equal(json.data.indices.ndvi, 0.75); // (0.70 - 0.10) / (0.70 + 0.10) = 0.60 / 0.80 = 0.75
  assert.equal(json.data.canopyClassification, 'High-Vigour Closed Canopy');
});

test('POST /api/analysis/scan-photo matches sector based on spectral fractions', async () => {
  const res = await fetch(`${baseUrl}/api/analysis/scan-photo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ presetKey: 'WAGHOLI_CANE' })
  });
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.ok(json.data.match.sectorId);
  assert.ok(json.data.classification.estimatedNdvi >= 0.70);
});

test('GET /api/export/geojson returns standard FeatureCollection', async () => {
  const res = await fetch(`${baseUrl}/api/export/geojson`);
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.type, 'FeatureCollection');
  assert.ok(json.features.length >= 150);
  assert.equal(json.features[0].geometry.type, 'Polygon');
});
