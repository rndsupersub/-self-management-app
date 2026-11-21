// lib/mapsTautan.js
// Pembaca tautan Google Maps yang ditempel user.
//
// Kenapa perlu: data OpenStreetMap tidak selengkap Google Maps. Jadi user bisa
// mencari tempatnya di Google Maps (gratis, tanpa API key), menyalin tautannya,
// lalu aplikasi mengambil nama + titik koordinatnya dari tautan itu. Tidak ada
// layanan berbayar yang dipanggil di sini.

const POLA_KOORDINAT = [
  /@(-?\d{1,3}(?:\.\d+)?),\s*(-?\d{1,3}(?:\.\d+)?)/, // .../@-6.917,107.619,16z
  /!3d(-?\d{1,3}(?:\.\d+)?)!4d(-?\d{1,3}(?:\.\d+)?)/, // !3dlat!4dlon
  /[?&](?:q|query|ll|sll|center|destination|daddr)=(-?\d{1,3}(?:\.\d+)?),\s*(-?\d{1,3}(?:\.\d+)?)/i,
  /^\s*(-?\d{1,3}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)\s*$/, // koordinat mentah
];

function valid(lat, lon) {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lon) <= 180 &&
    !(lat === 0 && lon === 0)
  );
}

function rapikanNama(teks = "") {
  let hasil = String(teks || "").replace(/\+/g, " ");
  try {
    hasil = decodeURIComponent(hasil);
  } catch {
    // biarkan apa adanya kalau encode-nya tidak lengkap
  }
  const bersih = hasil
    .replace(/\s*-\s*Google\s*Maps.*$/i, "")
    .replace(/[|]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);

  // Jangan jadikan deretan koordinat sebagai nama usaha.
  if (/^-?\d{1,3}(\.\d+)?\s*,\s*-?\d{1,3}(\.\d+)?$/.test(bersih)) return "";
  return bersih;
}

/**
 * Urai tempelan user (tautan Google Maps, tautan pendek, atau koordinat).
 *
 * @param {string} teks
 * @returns {{nama:string, lat:number|null, lon:number|null, mapsUrl:string, kataKunci:string}}
 */
export function uraiTautanMaps(teks = "") {
  const masukan = String(teks || "").trim();
  const hasil = { nama: "", lat: null, lon: null, mapsUrl: "", kataKunci: "", pendek: false };
  if (!masukan) return hasil;

  const miripTautan =
    /^(https?:\/\/)/i.test(masukan) ||
    /(^|\/)(google\.[a-z.]+|goo\.gl|maps\.app|g\.co)(\/|$)/i.test(masukan) ||
    /google\.[a-z.]+\/maps/i.test(masukan);

  const tautan = miripTautan
    ? /^https?:\/\//i.test(masukan)
      ? masukan
      : `https://${masukan.replace(/^\/+/, "")}`
    : "";

  if (tautan) {
    try {
      hasil.mapsUrl = new URL(tautan).toString();
    } catch {
      hasil.mapsUrl = tautan;
    }
  }

  // Koordinat biasanya muncul di URL mentah (belum di-decode).
  const mentah = tautan || masukan;
  for (const pola of POLA_KOORDINAT) {
    const cocok = mentah.match(pola);
    if (!cocok) continue;
    const lat = Number(cocok[1]);
    const lon = Number(cocok[2]);
    if (valid(lat, lon)) {
      hasil.lat = Number(lat.toFixed(6));
      hasil.lon = Number(lon.toFixed(6));
      break;
    }
  }

  // Nama tempat: /place/Nama+Tempat/... lebih akurat daripada parameter q.
  const dariPlace = mentah.match(/\/place\/([^/@?]+)/);
  if (dariPlace) {
    hasil.nama = rapikanNama(dariPlace[1]);
  }

  const dariQuery = mentah.match(/[?&](?:q|query|destination)=([^&@]+)/i);
  if (dariQuery) {
    const kandidat = rapikanNama(dariQuery[1]);
    // Kalau isinya cuma koordinat, jangan dipakai sebagai nama.
    if (kandidat && !/^-?\d{1,3}(\.\d+)?\s*,\s*-?\d{1,3}(\.\d+)?$/.test(kandidat)) {
      if (!hasil.nama) hasil.nama = kandidat;
      hasil.kataKunci = kandidat;
    }
  }

  // Halaman hasil pencarian (/maps/search/...) bukan satu tempat: simpan
  // sebagai kata kunci saja, jangan dipakai sebagai nama usaha.
  if (!hasil.kataKunci) {
    const dariPencarian = mentah.match(/\/maps\/search\/([^/?]+)/i);
    if (dariPencarian) hasil.kataKunci = rapikanNama(dariPencarian[1]);
  }

  // Tautan pendek tidak memuat nama/koordinat; tandai supaya UI bisa
  // menjelaskan cara menyalin tautan yang benar.
  hasil.pendek = /maps\.app\.goo\.gl|goo\.gl\/maps|g\.co\/kgin/i.test(tautan || masukan);

  if (!hasil.nama && !tautan) {
    hasil.nama = rapikanNama(masukan);
  }

  hasil.nama = hasil.nama.replace(/^["']|["']$/g, "").trim().slice(0, 120);
  return hasil;
}
