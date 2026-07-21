/**
 * utils/distance.js  —  BACKEND
 *
 * ⚠️  HARUS SINKRON dengan frontend: src/utils/distance.js
 *     Setiap perubahan tarif/konstanta di sini WAJIB dicerminkan
 *     ke file frontend secara manual, dan sebaliknya.
 *     Cek manual dengan edge-case kalkulasi setiap kali tarif berubah.
 *
 * Rumus: Haversine × ROAD_FACTOR → Math.ceil → tarif flat/per-KM
 */

// ── Konstanta ────────────────────────────────────────────────
const EARTH_RADIUS_KM = 6371;
const ROAD_FACTOR     = 1.3;   // Koreksi jalan nyata vs garis lurus
const BASE_FARE       = 5000;  // Rp 5.000 flat s/d FREE_KM
const FREE_KM         = 3;     // Km pertama yang dicakup flat
const FARE_PER_KM     = 1500;  // Rp 1.500 per KM berikutnya

// Koordinat gudang/depot (sumber: migrate_schema.js seed petugas)
const DEPOT_LAT = 0.5333;
const DEPOT_LON = 101.4500;

// ── Helpers ──────────────────────────────────────────────────
const toRad = (deg) => (deg * Math.PI) / 180;

/**
 * Hitung jarak jalan (KM, dibulatkan ke atas) antara dua koordinat.
 * @param {number} lat  - Latitude titik user
 * @param {number} lon  - Longitude titik user
 * @param {number} [refLat=DEPOT_LAT] - Latitude referensi (opsional)
 * @param {number} [refLon=DEPOT_LON] - Longitude referensi (opsional)
 * @returns {number} Jarak KM (integer, sudah ceil)
 */
function calculateDistance(lat, lon, refLat = DEPOT_LAT, refLon = DEPOT_LON) {
    const dLat = toRad(lat - refLat);
    const dLon = toRad(lon - refLon);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(refLat)) *
            Math.cos(toRad(lat)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const straightLineKm = EARTH_RADIUS_KM * c;

    return Math.ceil(straightLineKm * ROAD_FACTOR);
}

/**
 * Hitung biaya ongkir berdasarkan jarak KM.
 * @param {number} km - Jarak KM (integer dari calculateDistance)
 * @returns {number} Biaya ongkir dalam Rupiah
 */
function calculateFare(km) {
    if (km <= FREE_KM) return BASE_FARE;
    const extraKm = km - FREE_KM;
    return BASE_FARE + extraKm * FARE_PER_KM;
}

module.exports = { calculateDistance, calculateFare, DEPOT_LAT, DEPOT_LON };
