// lib/normalisasiTeks.js
// Normalisasi teks untuk pencocokan: huruf kecil, tanpa aksen, tanpa tanda
// baca, spasi dirapikan. Dipakai filter wilayah di tab Vendor.

export function normalisasiTeks(nilai) {
  return String(nilai ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
