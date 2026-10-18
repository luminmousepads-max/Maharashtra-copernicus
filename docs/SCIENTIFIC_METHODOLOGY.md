# 🔬 Scientific & Remote Sensing Methodology

## 1. Copernicus Sentinel-2 MSI Instrument Overview
The European Space Agency's (ESA) **Sentinel-2** mission comprises a constellation of two polar-orbiting satellites (Sentinel-2A and Sentinel-2B) phased at 180° to each other in a sun-synchronous orbit at an altitude of 786 km.

The **Multi-Spectral Instrument (MSI)** samples 13 spectral bands spanning the visible and near-infrared (VNIR) to short-wave infrared (SWIR):

| Band | Central Wavelength | Bandwidth | Spatial Resolution | Agronomic Primary Use |
| :--- | :--- | :--- | :--- | :--- |
| **B1** | 443 nm | 20 nm | 60 m | Coastal aerosol, atmospheric correction |
| **B2** | 490 nm | 65 nm | 10 m | Blue: Soil vs. vegetation differentiation |
| **B3** | 560 nm | 35 nm | 10 m | Green: Peak reflectance of green vegetation |
| **B4** | 665 nm | 30 nm | 10 m | Red: Maximum chlorophyll absorption |
| **B5** | 705 nm | 15 nm | 20 m | Red Edge 1: Plant stress detection |
| **B6** | 740 nm | 15 nm | 20 m | Red Edge 2: Chlorophyll content estimation |
| **B7** | 783 nm | 20 nm | 20 m | Red Edge 3: Leaf Area Index (LAI) |
| **B8** | 842 nm | 115 nm | 10 m | NIR: Spongey mesophyll scattering (NDVI) |
| **B8A**| 865 nm | 20 nm | 20 m | Narrow NIR: Water vapor correction |
| **B9** | 945 nm | 20 nm | 60 m | Water vapor absorption |
| **B11**| 1610 nm | 90 nm | 20 m | SWIR-1: Canopy water content & moisture |
| **B12**| 2190 nm | 180 nm | 20 m | SWIR-2: Soil geology & burn scar detection |

---

## 2. Vegetation Indices Formulation

### Normalized Difference Vegetation Index (NDVI)
The fundamental vegetation indicator relying on contrast between red absorption by chlorophyll-a and near-infrared internal leaf scattering:

$$\text{NDVI} = \frac{\rho_{\text{NIR}} - \rho_{\text{Red}}}{\rho_{\text{NIR}} + \rho_{\text{Red}}} = \frac{\text{B8} - \text{B4}}{\text{B8} + \text{B4}}$$

### Soil Adjusted Vegetation Index (SAVI)
Introduced by Huete (1988) to mitigate the distorting effect of soil brightness in early canopy emergence where vegetation cover is $<40\%$:

$$\text{SAVI} = \frac{\rho_{\text{NIR}} - \rho_{\text{Red}}}{\rho_{\text{NIR}} + \rho_{\text{Red}} + L} \times (1 + L)$$

Where $L = 0.5$ for intermediate vegetation densities common in Maharashtra's black cotton vertisols.

### Normalized Difference Moisture Index (NDMI)
Sensitive to leaf liquid water content and canopy hydration:

$$\text{NDMI} = \frac{\text{B8} - \text{B11}}{\text{B8} + \text{B11}}$$

---

## 3. Agricultural Greenhouse Gas Modeling (IPCC Tier-1 & Tier-2)

Field emissions are derived from agricultural management practices:

1. **Nitrous Oxide ($N_2O$)**:
   $$\text{Daily } N_2O = N_{\text{applied}} \times EF_1 \times \frac{44}{28}$$
   Where $EF_1$ is the emission factor for synthetic nitrogen fertilizers (~1.0% to 1.6% in sub-humid irrigated soils).

2. **Methane ($CH_4$)**:
   $$\text{Daily } CH_4 = \text{Area} \times EF_{\text{rice}} \times SF_{\text{water}} \times SF_{\text{organic}}$$
   Flooded paddy fields experience anaerobic conditions favoring methanogenic archaebacteria, releasing significant $CH_4$ during vegetative tillering.

3. **Carbon Dioxide Equivalent ($CO_2e$)**:
   $$\text{Total } CO_2e = (CO_2 \times 1) + (CH_4 \times 27.9) + (N_2O \times 273)$$

---

## 4. Multi-Date Phenological Calendar for Maharashtra

| Stage Index | Calendar Date | Day of Year (DOY) | Crop Stage Description | NDVI Ratio |
| :---: | :---: | :---: | :--- | :---: |
| **0** | April 12 | DOY 102 | Pre-Sowing / Tilled Fallow Soil | 0.28 |
| **1** | May 24 | DOY 144 | Early Emergence / Germination | 0.50 |
| **2** | June 18 | DOY 169 | Jointing / Active Vegetative Growth | 0.82 |
| **3** | July 24 | DOY 205 | Tasseling / Peak Flowering Vigour | 1.00 |
| **4** | September 08 | DOY 251 | Maturity / Grain Filling | 0.76 |
| **5** | October 14 | DOY 287 | Post-Harvest Stubble / Fallow | 0.34 |
