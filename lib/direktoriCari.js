// lib/direktoriCari.js
// Mesin pencari Direktori: mencari usaha NYATA di peta publik (OpenStreetMap),
// bukan cuma menyaring daftar milik user seperti fitur Vendor.
//
// Kenapa OpenStreetMap:
// - gratis, tanpa API key, tanpa kartu kredit (prinsip: jangan ada pembayaran)
// - nama, alamat, kategori, jam buka, dan kadang telepon/website ikut terbawa
// - koordinatnya bisa dipakai untuk membuka titik itu langsung di Google Maps
//
// Dua layanan dipakai supaya hasilnya tidak tipis:
// - Nominatim  : hasil paling rapi + extratags (telepon, website, fax, jam buka)
// - Photon     : hasil lebih banyak karena mendukung pencarian awalan kata
//
// Aturan main Nominatim: maksimal ~1 permintaan/detik, wajib User-Agent yang
// jelas, dan hasilnya harus di-cache. Semua itu diurus di file ini.

import { deteksiWilayah, normalisasiTeks, prioritasWilayah } from "@/lib/direktoriData";

const UA = "SelfManagementApp/1.0 (direktori vendor/agency/jasa; aplikasi pribadi)";
const BATAS_WAKTU_MS = 12_000;
const TTL_CACHE_MS = 10 * 60 * 1000;

// Kotak pencarian per wilayah: [minLon, minLat, maxLon, maxLat].
// Dipakai supaya "Bandung" benar-benar mencari di Bandung, bukan di seluruh dunia.
export const KOTAK_WILAYAH = {
  bandung: [107.4, -7.1, 107.85, -6.78],
  jakarta: [106.6, -6.45, 107.05, -6.05],
  jabodetabek: [106.3, -6.8, 107.4, -6.05],
  jawa_tengah: [108.4, -8.05, 111.75, -5.85],
  jawa_timur: [110.7, -8.85, 114.65, -6.65],
  indonesia_lain: [94.9, -11.1, 141.1, 6.2],
  china: [73.5, 18.0, 135.1, 53.6],
  jepang: [122.9, 24.0, 146.0, 45.6],
  korea: [124.5, 33.0, 131.0, 38.7],
  asia_lain: [60.0, -11.0, 150.0, 55.0],
  amerika: [-170.0, -56.0, -30.0, 72.0],
  eropa: [-25.0, 34.0, 45.0, 72.0],
};

// Urutan pengecekan kotak wilayah. Kotak Indonesia dicek dulu supaya titik di
// Depok (Sleman) tidak salah dianggap Depok (Jawa Barat), lalu negara, lalu
// benua. Kotak paling luas ditaruh paling akhir.
const URUTAN_KOTAK = [
  "bandung",
  "jakarta",
  "jabodetabek",
  "jawa_tengah",
  "jawa_timur",
  "china",
  "jepang",
  "korea",
  "indonesia_lain",
  "asia_lain",
  "amerika",
  "eropa",
];

// Tentukan wilayah dari titik koordinat. Ini jauh lebih akurat daripada
// menebak dari nama kota, karena banyak nama tempat kembar antarprovinsi.
export function wilayahDariKoordinat(lat, lon) {
  const x = Number(lat);
  const y = Number(lon);
  if (!Number.isFinite(x) || !Number.isFinite(y) || x === 0 || y === 0) return "";

  for (const id of URUTAN_KOTAK) {
    const kotak = KOTAK_WILAYAH[id];
    if (!kotak) continue;
    const [minLon, minLat, maxLon, maxLat] = kotak;
    if (y >= minLon && y <= maxLon && x >= minLat && x <= maxLat) return id;
  }
  return "";
}

// Terjemahan kategori OpenStreetMap supaya hasilnya terbaca, bukan "car_repair".
const KATEGORI = {
  car_repair: "Bengkel mobil",
  motorcycle_repair: "Bengkel motor",
  bicycle_repair: "Bengkel sepeda",
  copyshop: "Fotokopi & digital printing",
  print_shop: "Percetakan",
  printer: "Percetakan",
  tailor: "Konveksi / jahit",
  clothes: "Pakaian",
  fabric: "Kain / tekstil",
  photo: "Foto studio",
  photographer: "Fotografi",
  advertising_agency: "Agency iklan",
  marketing: "Marketing",
  it: "Layanan IT",
  company: "Perusahaan",
  consultant: "Konsultan",
  employment_agency: "Penyalur tenaga kerja",
  lawyer: "Jasa hukum",
  accountant: "Akuntansi & pajak",
  insurance: "Asuransi",
  estate_agent: "Properti",
  financial: "Jasa keuangan",
  travel_agency: "Agen perjalanan",
  post_office: "Pengiriman paket",
  moving_company: "Jasa pindahan",
  logistics: "Logistik",
  metal_construction: "Konstruksi logam / las",
  carpenter: "Mebel & kayu",
  electrician: "Instalasi listrik",
  plumber: "Instalasi air",
  painter: "Pengecatan",
  hvac: "AC & ventilasi",
  car_wash: "Cuci mobil",
  laundry: "Laundry",
  dry_cleaning: "Cuci kering",
  hairdresser: "Salon",
  beauty: "Perawatan kecantikan",
  bakery: "Bakery",
  butcher: "Daging",
  greengrocer: "Sayur & buah",
  supermarket: "Supermarket",
  convenience: "Minimarket",
  hardware: "Perkakas / bangunan",
  doityourself: "Perkakas / bangunan",
  electronics: "Elektronik",
  mobile_phone: "Ponsel",
  computer: "Komputer",
  furniture: "Mebel",
  florist: "Bunga",
  stationery: "Alat tulis",
  car_parts: "Suku cadang mobil",
  tyres: "Ban",
  chemical: "Bahan kimia",
  packaging: "Kemasan",
  workshop: "Workshop",
  factory: "Pabrik",
};

const KUNCI_BUKAN_USAHA = /^(disused|abandoned|was|razed):/;
const KUNCI_DIBUANG = /^(place|highway|natural|waterway|boundary|admin|landuse|route|railway|barrier|power)$/;

const JENIS_KE_JASA = new Set([
  "car_repair",
  "motorcycle_repair",
  "bicycle_repair",
  "copyshop",
  "tailor",
  "travel_agency",
  "dry_cleaning",
  "laundry",
  "hairdresser",
  "beauty",
  "car_wash",
  "funeral_directors",
]);

const JENIS_KE_AGENCY = new Set([
  "advertising_agency",
  "marketing",
  "it",
  "company",
  "consultant",
  "research",
  "graphic_design",
  "web_design",
  "studio",
  "photographer",
  "event_management",
]);

const cache = new Map();

function labelKategori(kunci = "", nilai = "") {
  if (KATEGORI[nilai]) return KATEGORI[nilai];
  const teks = String(nilai || "").replace(/_/g, " ").trim();
  if (teks && teks !== "yes" && teks !== "no") {
    return teks.charAt(0).toUpperCase() + teks.slice(1);
  }
  const teksKunci = String(kunci || "").replace(/_/g, " ").trim();
  return teksKunci ? teksKunci.charAt(0).toUpperCase() + teksKunci.slice(1) : "";
}

function klasifikasiJenis(kunci = "", nilai = "") {
  if (JENIS_KE_AGENCY.has(nilai)) return "agency";
  if (JENIS_KE_JASA.has(nilai)) return "jasa";
  if (kunci === "office") return "jasa";
  if (kunci === "amenity" || kunci === "tourism" || kunci === "leisure") return "jasa";
  if (kunci === "shop" || kunci === "craft" || kunci === "man_made" || kunci === "industrial") {
    return "vendor";
  }
  return "vendor";
}

function rapikanAlamat(bagian = []) {
  const unik = [];
  for (const teks of bagian) {
    const bersih = String(teks || "").trim();
    if (!bersih) continue;
    if (unik.some((u) => normalisasiTeks(u) === normalisasiTeks(bersih))) continue;
    unik.push(bersih);
  }
  return unik.join(", ");
}

function wilayahHasil(alamat, filter, lat, lon) {
  const dariPeta = wilayahDariKoordinat(lat, lon);
  const terdeteksi = dariPeta || deteksiWilayah(alamat);
  if (filter && filter !== "semua") {
    // Pencarian sudah dibatasi kotak wilayah, jadi kalau kotaknya sendiri tidak
    // dikenali (mis. titik di pinggir batas), ikuti wilayah yang dipilih user.
    if (terdeteksi === "lainnya" || terdeteksi === "indonesia_lain") return filter;
    return terdeteksi;
  }
  return terdeteksi;
}

function skorHasil(nama, layanan, token) {
  const namaBersih = normalisasiTeks(nama);
  const layananBersih = normalisasiTeks(layanan);
  let skor = 0;
  for (const kata of token) {
    if (namaBersih.includes(kata)) skor += 3;
    else if (layananBersih.includes(kata)) skor += 2;
    else skor += 0;
  }
  return skor;
}

function buatTautanMaps(lat, lon, nama, alamat) {
  if (Number.isFinite(lat) && Number.isFinite(lon) && lat !== 0 && lon !== 0) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
  }
  const teks = [nama, alamat].filter(Boolean).join(" ");
  if (!teks) return "";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(teks)}`;
}

function dariNominatim(item, filterWilayah, token) {
  const kategori = item.category || "";
  const tipe = item.type || "";
  if (KUNCI_DIBUANG.test(kategori)) return null;

  const alamatBagian = item.address || {};
  const nama =
    item.name ||
    (item.display_name ? String(item.display_name).split(",")[0].trim() : "") ||
    "";
  if (!nama) return null;

  const kota =
    alamatBagian.city || alamatBagian.town || alamatBagian.village || alamatBagian.county || "";
  const provinsi = alamatBagian.state || alamatBagian.region || "";
  const negara = alamatBagian.country || "";
  const alamatLengkap = rapikanAlamat([
    alamatBagian.road || alamatBagian.pedestrian || alamatBagian.place,
    alamatBagian.suburb || alamatBagian.neighbourhood,
    alamatBagian.district || alamatBagian.city_district,
    kota,
    provinsi,
    alamatBagian.postcode,
  ]);

  const extra = item.extratags || {};
  const mati = KUNCI_BUKAN_USAHA.test(kategori) || KUNCI_BUKAN_USAHA.test(tipe);
  const lat = Number(item.lat);
  const lon = Number(item.lon);
  const layanan = labelKategori(kategori, tipe);

  return {
    id: `osm-${item.osm_type || "node"}-${item.osm_id || item.place_id}`,
    nama,
    jenis: klasifikasiJenis(kategori, tipe),
    layanan,
    kategori: [kategori, tipe].filter(Boolean).join("/"),
    alamat: alamatLengkap,
    kota,
    provinsi,
    negara,
    wilayah: wilayahHasil({ kota, provinsi, negara }, filterWilayah, lat, lon),
    koordinat: { lat, lon },
    kontak: {
      telepon: extra.phone || extra["contact:phone"] || extra["contact:mobile"] || "",
      wa: extra["contact:whatsapp"] || extra.whatsapp || "",
      email: extra.email || extra["contact:email"] || "",
      fax: extra.fax || extra["contact:fax"] || "",
      narahubung: extra.operator || "",
    },
    website: extra.website || extra["contact:website"] || extra.url || "",
    jamBuka: extra.opening_hours || "",
    status: mati ? "tutup" : "aktif",
    statusCatatan: mati ? "Data peta menandai tempat ini sudah tidak dipakai." : "",
    mapsUrl: buatTautanMaps(lat, lon, nama, alamatLengkap),
    tautanOsm:
      item.osm_type && item.osm_id
        ? `https://www.openstreetmap.org/${item.osm_type}/${item.osm_id}`
        : "",
    sumber: "nominatim",
    skor: skorHasil(nama, layanan, token),
  };
}

function dariPhoton(fitur, filterWilayah, token) {
  const p = fitur.properties || {};
  const kunci = p.osm_key || "";
  const nilai = p.osm_value || "";
  if (!p.name || KUNCI_DIBUANG.test(kunci)) return null;

  const [lon, lat] = fitur.geometry?.coordinates || [];
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

  const kota = p.city || p.town || p.village || p.district || "";
  const provinsi = p.state || "";
  const negara = p.country || "";
  const alamatLengkap = rapikanAlamat([
    p.housenumber ? `${p.street || ""} ${p.housenumber}`.trim() : p.street,
    p.district,
    kota,
    provinsi,
    p.postcode,
  ]);

  const mati = KUNCI_BUKAN_USAHA.test(kunci) || ["vacant", "disused", "abandoned"].includes(nilai);
  const layanan = labelKategori(kunci, nilai);

  return {
    id: `osm-${p.osm_type || "node"}-${p.osm_id || `${lat}-${lon}`}`,
    nama: p.name,
    jenis: klasifikasiJenis(kunci, nilai),
    layanan,
    kategori: [kunci, nilai].filter(Boolean).join("/"),
    alamat: alamatLengkap,
    kota,
    provinsi,
    negara,
    wilayah: wilayahHasil({ kota, provinsi, negara }, filterWilayah, lat, lon),
    koordinat: { lat, lon },
    kontak: {
      telepon: p.phone || "",
      wa: p.whatsapp || "",
      email: p.email || "",
      fax: p.fax || "",
      narahubung: p.operator || "",
    },
    website: p.website || "",
    jamBuka: p.opening_hours || "",
    status: mati ? "tutup" : "aktif",
    statusCatatan: mati ? "Data peta menandai tempat ini sudah tidak dipakai." : "",
    mapsUrl: buatTautanMaps(lat, lon, p.name, alamatLengkap),
    tautanOsm: p.osm_id ? `https://www.openstreetmap.org/${p.osm_type || "node"}/${p.osm_id}` : "",
    sumber: "photon",
    skor: skorHasil(p.name, layanan, token),
  };
}

function gabungkan(daftar) {
  const peta = new Map();
  for (const item of daftar) {
    if (!item) continue;
    const kunci = `${normalisasiTeks(item.nama)}|${item.koordinat.lat.toFixed(2)}|${item.koordinat.lon.toFixed(2)}`;
    const ada = peta.get(kunci);
    if (!ada) {
      peta.set(kunci, item);
      continue;
    }
    const utama = ada.sumber === "nominatim" ? ada : item.sumber === "nominatim" ? item : ada;
    const lain = utama === ada ? item : ada;
    peta.set(kunci, {
      ...utama,
      alamat: utama.alamat || lain.alamat,
      layanan: utama.layanan || lain.layanan,
      website: utama.website || lain.website,
      jamBuka: utama.jamBuka || lain.jamBuka,
      tautanOsm: utama.tautanOsm || lain.tautanOsm,
      kontak: {
        telepon: utama.kontak.telepon || lain.kontak.telepon,
        wa: utama.kontak.wa || lain.kontak.wa,
        email: utama.kontak.email || lain.kontak.email,
        fax: utama.kontak.fax || lain.kontak.fax,
        narahubung: utama.kontak.narahubung || lain.kontak.narahubung,
      },
      skor: Math.max(utama.skor, lain.skor),
    });
  }
  return [...peta.values()];
}

async function ambilNominatim(q, kotak) {
  const param = new URLSearchParams({
    format: "jsonv2",
    addressdetails: "1",
    extratags: "1",
    limit: "50",
    dedupe: "1",
    layer: "poi",
    "accept-language": "id",
    q,
  });
  if (kotak) {
    param.set("viewbox", kotak.join(","));
    param.set("bounded", "1");
  }
  const res = await fetch(`https://nominatim.openstreetmap.org/search?${param}`, {
    headers: { "User-Agent": UA, "Accept-Language": "id" },
    signal: AbortSignal.timeout(BATAS_WAKTU_MS),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Nominatim membalas ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

async function ambilPhoton(q, kotak) {
  const param = new URLSearchParams({ q, limit: "50" });
  if (kotak) param.set("bbox", kotak.join(","));
  const res = await fetch(`https://photon.komoot.io/api/?${param}`, {
    headers: { "User-Agent": UA },
    signal: AbortSignal.timeout(BATAS_WAKTU_MS),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Photon membalas ${res.status}`);
  const data = await res.json();
  return Array.isArray(data.features) ? data.features : [];
}

function ambilToken(q) {
  return String(q)
    .split(/\s+/)
    .map((kata) => normalisasiTeks(kata))
    .filter((kata) => kata.length >= 2);
}

// Kata yang terlalu umum untuk dipakai sebagai pencarian cadangan.
const KATA_UMUM = new Set([
  "jasa",
  "agency",
  "agensi",
  "vendor",
  "supplier",
  "service",
  "layanan",
  "di",
  "dan",
  "yang",
  "the",
  "and",
  "of",
  "in",
]);

function jeda(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Kalau "agency branding" tidak ketemu, coba kata yang paling khas ("branding").
function kataCadangan(q) {
  const kata = String(q)
    .split(/\s+/)
    .map(normalisasiTeks)
    .filter((k) => k.length >= 2 && !KATA_UMUM.has(k));
  if (kata.length === 0) return "";
  return [...kata].sort((a, b) => b.length - a.length)[0];
}

async function kumpulkan(kata, kotak, wilayah) {
  const token = ambilToken(kata);
  const [nominatim, photon] = await Promise.allSettled([
    ambilNominatim(kata, kotak),
    ambilPhoton(kata, kotak),
  ]);

  const galat = [];
  if (nominatim.status === "rejected") {
    galat.push(nominatim.reason?.message || "Nominatim gagal");
  }
  if (photon.status === "rejected") {
    galat.push(photon.reason?.message || "Photon gagal");
  }

  const daftar = [];
  if (nominatim.status === "fulfilled") {
    for (const item of nominatim.value) {
      const bersih = dariNominatim(item, wilayah, token);
      if (bersih) daftar.push(bersih);
    }
  }
  if (photon.status === "fulfilled") {
    for (const fitur of photon.value) {
      const bersih = dariPhoton(fitur, wilayah, token);
      if (bersih) daftar.push(bersih);
    }
  }

  return { daftar, galat };
}

function olah(daftar, jenis) {
  return gabungkan(daftar)
    .filter((item) => (jenis === "semua" ? true : item.jenis === jenis))
    .sort((a, b) => {
      const prioritasA = prioritasWilayah(a);
      const prioritasB = prioritasWilayah(b);
      if (prioritasA !== prioritasB) return prioritasA - prioritasB;
      if (b.skor !== a.skor) return b.skor - a.skor;
      return String(a.nama).localeCompare(String(b.nama), "id");
    })
    .slice(0, 40);
}

// Cari usaha di peta publik. Hasil sudah diurutkan sesuai prioritas wilayah
// yang diminta: Bandung → Jakarta → JABODETABEK → Jawa Tengah → Jawa Timur →
// provinsi lain → China, Jepang, Korea, Asia lain → Amerika, Eropa.
export async function cariUsaha({ q, wilayah = "semua", jenis = "semua" } = {}) {
  const kata = String(q || "").trim().slice(0, 120);
  if (kata.length < 2) {
    return { hasil: [], catatan: "Kata kunci terlalu pendek." };
  }

  const kunciCache = `${normalisasiTeks(kata)}|${wilayah}|${jenis}`;
  const tersimpan = cache.get(kunciCache);
  if (tersimpan && tersimpan.kedaluwarsa > Date.now()) {
    return tersimpan.nilai;
  }

  const kotak = KOTAK_WILAYAH[wilayah] || null;

  let { daftar, galat } = await kumpulkan(kata, kotak, wilayah);
  let hasil = olah(daftar, jenis);
  let catatanTambahan = "";

  if (hasil.length === 0 && galat.length === 0) {
    const cadangan = kataCadangan(kata);
    if (cadangan && normalisasiTeks(kata) !== cadangan) {
      // Beri jarak supaya aturan ~1 permintaan/detik Nominatim tidak dilanggar.
      await jeda(1100);
      const kedua = await kumpulkan(cadangan, kotak, wilayah);
      const hasilCadangan = olah(kedua.daftar, jenis);
      galat = galat.concat(kedua.galat);
      if (hasilCadangan.length > 0) {
        hasil = hasilCadangan;
        catatanTambahan = `Tidak ada usaha yang cocok untuk "${kata}". Ini hasil untuk "${cadangan}".`;
      }
    }
  }

  // Kedua sumber gagal total: lebih baik jujur daripada menampilkan "kosong".
  if (galat.length >= 2 && daftar.length === 0) {
    throw new Error(
      "Layanan peta publik (OpenStreetMap) sedang tidak bisa dihubungi. Coba lagi sekitar satu menit."
    );
  }

  const catatan = [
    catatanTambahan,
    galat.length > 0
      ? "Sebagian sumber peta sedang sibuk, jadi hasil mungkin lebih sedikit dari biasanya."
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  const nilai = { hasil, catatan };

  cache.set(kunciCache, { nilai, kedaluwarsa: Date.now() + TTL_CACHE_MS });
  if (cache.size > 200) {
    const tertua = cache.keys().next().value;
    cache.delete(tertua);
  }

  return nilai;
}
