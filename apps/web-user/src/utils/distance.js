/**
 * distance.js — Kalkulator Ongkir Otomatis PilahPilih
 *
 * Koordinat titik pusat gudang (Pekanbaru, Riau)
 * Bisa disesuaikan ke koordinat gudang asli kalau sudah punya alamat resmi.
 */
export const DEPOT_LAT = 0.5333;
export const DEPOT_LON = 101.4500;

/**
 * Faktor koreksi jarak jalan vs jarak udara (Haversine).
 * Nilai 1.3 = estimasi +30% karena jalan memutar, jembatan, dll.
 *
 * WAJIB DIKALIBRASI sebelum deploy ke production:
 * - Buka Google Maps, ukur jarak aspal dari DEPOT ke 3 titik user berbeda
 * - Bandingkan dengan hasil calculateDistance() polos (tanpa ROAD_FACTOR)
 * - Jika selisih > 20%, sesuaikan nilai ROAD_FACTOR di sini
 */
export const ROAD_FACTOR = 1.3;

/** Tarif dasar (KM 1–3) */
const BASE_FARE = 5000;
/** Tarif tambahan per KM setelah KM ke-3 */
const PER_KM_FARE = 1500;
/** KM gratis di awal */
const FREE_KM = 3;

/**
 * Menghitung jarak antara dua titik koordinat (Haversine Formula).
 * @param {number} lat1 - Latitude titik A
 * @param {number} lon1 - Longitude titik A
 * @param {number} lat2 - Latitude titik B
 * @param {number} lon2 - Longitude titik B
 * @returns {number} Jarak dalam KM (floating point, sebelum pembulatan)
 */
function haversineRaw(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius bumi dalam KM
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Menghitung jarak dari DEPOT ke titik user, dengan koreksi jalan.
 * Hasilnya dibulatkan ke atas per KM (Math.ceil) — standar industri kurir.
 *
 * @param {number} userLat - Latitude user
 * @param {number} userLon - Longitude user
 * @returns {number} Jarak dalam KM (integer, sudah dibulatkan ke atas)
 */
export function calculateDistance(userLat, userLon) {
  // Guard: koordinat tidak boleh null, undefined, atau bukan angka
  if (userLat == null || userLon == null || isNaN(userLat) || isNaN(userLon)) {
    return null;
  }
  const rawKm = haversineRaw(DEPOT_LAT, DEPOT_LON, userLat, userLon);
  const correctedKm = rawKm * ROAD_FACTOR;
  return Math.ceil(correctedKm); // Math.ceil diterapkan SETELAH ×ROAD_FACTOR
}

/**
 * Menghitung biaya ongkir berdasarkan jarak.
 * Tarif: FREE_KM (3) KM pertama = BASE_FARE (Rp 5.000 flat)
 *        Tiap KM berikutnya = +PER_KM_FARE (Rp 1.500)
 *
 * Contoh:
 *   2 KM  → Rp 5.000 (masih dalam FREE_KM, tidak ada tambahan)
 *   3 KM  → Rp 5.000
 *   4 KM  → Rp 5.000 + (1 x 1.500) = Rp 6.500
 *   10 KM → Rp 5.000 + (7 x 1.500) = Rp 15.500
 *
 * @param {number} distanceKm - Jarak dalam KM (integer dari calculateDistance)
 * @returns {number} Biaya ongkir dalam Rupiah
 */
export function calculateFare(distanceKm) {
  // Guard: jarak tidak boleh null, undefined, negatif, atau NaN
  if (distanceKm == null || isNaN(distanceKm) || distanceKm < 0) {
    return null;
  }
  if (distanceKm <= FREE_KM) {
    return BASE_FARE;
  }
  const extraKm = distanceKm - FREE_KM;
  return BASE_FARE + extraKm * PER_KM_FARE;
}
