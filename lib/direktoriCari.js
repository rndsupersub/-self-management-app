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
// Lalu hasilnya diperkaya lewat API OpenStreetMap (satu permintaan untuk
// banyak titik) supaya nomor telepon/website yang tidak ikut di extratags
// tetap kebaca.
//
// Aturan main Nominatim: maksimal ~1 permintaan/detik, wajib User-Agent yang
// jelas, dan hasilnya harus di-cache. Semua itu diurus di file ini.

import {
  deteksiWilayah,
  normalisasiTeks,
  perluasToken,
  prioritasWilayah,
} from "@/lib/direktoriData";

const UA = "SelfManagementApp/1.0 (direktori vendor/agency/jasa; aplikasi pribadi)";
const BATAS_WAKTU_MS = 12_000;
const BATAS_WAKTU_OSM_MS = 8_000;
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
// Ini juga dipakai untuk menilai relevansi: kalau user mencari "sekolah",
// kategori amenity=school harus dianggap cocok walau namanya "SDN 1 ...".
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
  industrial: "Kawasan industri",
  school: "Sekolah",
  college: "Kampus",
  university: "Universitas",
  kindergarten: "TK / PAUD",
  language_school: "Kursus bahasa",
  music_school: "Kursus musik",
  driving_school: "Kursus mengemudi",
  library: "Perpustakaan",
  hospital: "Rumah sakit",
  clinic: "Klinik",
  dentist: "Dokter gigi",
  doctors: "Praktik dokter",
  pharmacy: "Apotek",
  veterinary: "Klinik hewan",
  bank: "Bank",
  atm: "ATM",
  bureau_de_change: "Penukaran uang",
  restaurant: "Restoran",
  cafe: "Kafe",
  fast_food: "Makanan cepat saji",
  food_court: "Food court",
  bar: "Bar",
  pub: "Pub",
  hotel: "Hotel",
  guest_house: "Penginapan",
  hostel: "Hostel",
  motel: "Motel",
  parking: "Parkir",
  fuel: "SPBU",
  car_rental: "Rental mobil",
  bus_station: "Terminal bus",
  train_station: "Stasiun",
  airport: "Bandara",
  taxi: "Taksi",
  police: "Kantor polisi",
  fire_station: "Pemadam kebakaran",
  townhall: "Kantor pemerintah",
  courthouse: "Pengadilan",
  community_centre: "Balai warga",
  place_of_worship: "Tempat ibadah",
  mosque: "Masjid",
  church: "Gereja",
  temple: "Vihara / kelenteng",
  marketplace: "Pasar",
  mall: "Mal",
  department_store: "Toko serba ada",
  sports_centre: "Sarana olahraga",
  gym: "Gym",
  swimming_pool: "Kolam renang",
  cinema: "Bioskop",
  theatre: "Teater",
  museum: "Museum",
  attraction: "Tempat wisata",
  viewpoint: "Titik pandang",
  park: "Taman",
  playground: "Taman bermain",
  pet: "Toko hewan",
  books: "Toko buku",
  gift: "Toko hadiah",
  jewellery: "Perhiasan",
  shoes: "Toko sepatu",
  sports: "Toko olahraga",
  toys: "Toko mainan",
  garden_centre: "Toko tanaman",
  paint: "Toko cat",
  car: "Showroom mobil",
  motorcycle: "Showroom motor",
  bicycle: "Toko sepeda",
  bag: "Toko tas",
  watches: "Toko jam",
  optician: "Optik",
  alcohol: "Minuman keras",
  beverages: "Minuman",
  confectionery: "Toko kue",
  seafood: "Seafood",
  tobacco: "Tembakau",
  variety_store: "Toko kelontong",
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

// Kalau data terstruktur tidak lengkap, display_name Nominatim masih memuat
// alamat lengkap. Ini yang membuat kartu hasil tetap punya lokasi, bukan cuma
// titik koordinat.
function alamatDariDisplay(display, nama, sudahAda) {
  if (sudahAda) return sudahAda;
  if (!display) return "";
  let teks = String(display).trim();
  const awal = String(nama || "").trim();
  if (awal && teks.toLowerCase().startsWith(awal.toLowerCase())) {
    teks = teks.slice(awal.length).replace(/^[,\s]+/, "");
  }
  return teks.length > 180 ? `${teks.slice(0, 177)}...` : teks;
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

// Token untuk menilai relevansi. Sinonim dipakai supaya "moulding" dan
// "molding" dianggap sama, begitu juga "busa" dan "spons".
function tokenUntuk(q) {
  const kata = String(q || "")
    .split(/\s+/)
    .map(normalisasiTeks)
    .filter((k) => k.length >= 2);
  const kumpulan = new Set();
  for (const k of kata) {
    for (const sinonim of perluasToken(k)) kumpulan.add(sinonim);
  }
  return [...kumpulan];
}

function skorHasil(nama, layanan, token) {
  const namaBersih = normalisasiTeks(nama);
  const layananBersih = normalisasiTeks(layanan);
  let skor = 0;
  for (const kata of token) {
    if (!kata) continue;
    if (namaBersih.includes(kata)) skor += 3;
    else if (layananBersih.includes(kata)) skor += 2;
  }
  return skor;
}

function koordinatValid(lat, lon) {
  return Number.isFinite(lat) && Number.isFinite(lon) && lat !== 0 && lon !== 0;
}

// Tautan tempat: pakai nama + alamat supaya Google Maps membuka kartu tempat
// (yang memuat telepon, jam buka, website), bukan cuma pin koordinat.
function buatTautanMaps(lat, lon, nama, alamat) {
  const teks = [nama, alamat].filter(Boolean).join(", ").trim();
  if (teks) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(teks)}`;
  }
  if (koordinatValid(lat, lon)) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
  }
  return "";
}

// Tautan titik presisi. Ini yang dipakai kalau nama usaha tidak ditemukan
// Google Maps, jadi posisinya tetap akurat.
function buatTautanKoordinat(lat, lon) {
  if (!koordinatValid(lat, lon)) return "";
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
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
    alamatBagian.city ||
    alamatBagian.town ||
    alamatBagian.village ||
    alamatBagian.municipality ||
    alamatBagian.county ||
    "";
  const provinsi = alamatBagian.state || alamatBagian.region || "";
  const negara = alamatBagian.country || "";

  const alamatTersusun = rapikanAlamat([
    alamatBagian.road || alamatBagian.pedestrian || alamatBagian.place,
    alamatBagian.house_number,
    alamatBagian.suburb || alamatBagian.neighbourhood,
    alamatBagian.district || alamatBagian.city_district,
    kota,
    provinsi,
    alamatBagian.postcode,
  ]);
  const alamatLengkap = alamatDariDisplay(item.display_name, nama, alamatTersusun);

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
    status: mati ? "tutup" : "belum_dicek",
    statusCatatan: mati ? "Data peta menandai tempat ini sudah tidak dipakai." : "",
    mapsUrl: buatTautanMaps(lat, lon, nama, alamatLengkap),
    mapsKoordinat: buatTautanKoordinat(lat, lon),
    tautanOsm:
      item.osm_type && item.osm_id
        ? `https://www.openstreetmap.org/${item.osm_type}/${item.osm_id}`
        : "",
    osmTipe: item.osm_type || "",
    osmId: item.osm_id || null,
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

  const kota = p.city || p.town || p.village || p.locality || p.district || "";
  const provinsi = p.state || "";
  const negara = p.country || "";
  const alamatLengkap = rapikanAlamat([
    p.housenumber ? `${p.street || ""} ${p.housenumber}`.trim() : p.street,
    p.locality,
    p.district,
    p.county,
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
    status: mati ? "tutup" : "belum_dicek",
    statusCatatan: mati ? "Data peta menandai tempat ini sudah tidak dipakai." : "",
    mapsUrl: buatTautanMaps(lat, lon, p.name, alamatLengkap),
    mapsKoordinat: buatTautanKoordinat(lat, lon),
    tautanOsm: p.osm_id ? `https://www.openstreetmap.org/${p.osm_type || "node"}/${p.osm_id}` : "",
    osmTipe: p.osm_type || "",
    osmId: p.osm_id || null,
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
      mapsUrl: utama.mapsUrl || lain.mapsUrl,
      mapsKoordinat: utama.mapsKoordinat || lain.mapsKoordinat,
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

// Variasi kata kunci. Ini yang membuat "injection molding" juga mencari
// "injection moulding", "injeksi plastik", dan "cetak plastik" — ejaan tidak
// lagi menentukan hasil. Daftar ini sengaja kecil dan relevan, bukan menebak
// sembarang kata.
const ATURAN_VARIAN = [
  { pola: /injection|injeksi|suntik/, tambah: ["injeksi plastik", "cetak plastik"] },
  { pola: /moulding|molding|mould|mold|cetakan/, tambah: ["moulding", "cetak plastik"] },
  { pola: /blow|tiup/, tambah: ["blow moulding", "botol plastik"] },
  { pola: /plastic|plastik/, tambah: ["plastik"] },
  { pola: /jok|seat|sadelt|jokset/, tambah: ["jok", "busa", "spons"] },
  { pola: /busa|spons|foam|sponge/, tambah: ["busa", "spons"] },
  { pola: /las|welding|weld/, tambah: ["las", "bengkel las"] },
  { pola: /bubut|machining|cnc|frais/, tambah: ["bubut", "bengkel bubut"] },
  { pola: /percetakan|printing|cetak|print/, tambah: ["percetakan", "digital printing"] },
  { pola: /konveksi|garment|garmen|jahit|tailor/, tambah: ["konveksi", "jahit"] },
  { pola: /kemasan|packing|packaging/, tambah: ["kemasan", "packing"] },
  { pola: /mebel|furniture|kayu/, tambah: ["mebel"] },
  { pola: /tekstil|kain|fabric/, tambah: ["tekstil", "kain"] },
  { pola: /elektronik|electronic/, tambah: ["elektronik"] },
  { pola: /kimia|chemical/, tambah: ["kimia"] },
  { pola: /ekspedisi|logistik|logistics|pengiriman/, tambah: ["ekspedisi", "logistik"] },
  { pola: /sekolah|school/, tambah: ["sekolah"] },
  { pola: /bengkel|repair|servis|service/, tambah: ["bengkel"] },
  { pola: /branding|agency|agensi/, tambah: ["agency", "branding"] },
  { pola: /marketing|pemasaran/, tambah: ["marketing"] },
];

// Kata kunci luas untuk fallback terakhir. Hasilnya diberi catatan jelas
// bahwa ini bukan hasil persis, supaya user tidak salah kira.
const KATA_TERKAIT = [
  { pola: /injection|injeksi|moulding|molding|mold|plastik|plastic/, kata: ["plastik", "pabrik"] },
  { pola: /jok|busa|spons|foam|seat/, kata: ["busa", "mebel"] },
  { pola: /las|bubut|machining|cnc|logam|metal/, kata: ["bengkel", "las"] },
  { pola: /percetakan|printing|kemasan|packing/, kata: ["percetakan", "kemasan"] },
  { pola: /konveksi|kain|tekstil|jahit|garment/, kata: ["konveksi", "tekstil"] },
  { pola: /mebel|furniture|kayu/, kata: ["mebel"] },
  { pola: /sekolah|kursus|belajar/, kata: ["sekolah"] },
];

export function variasiKata(q) {
  const teks = normalisasiTeks(q);
  if (!teks) return [];
  const hasil = [];
  for (const aturan of ATURAN_VARIAN) {
    if (!aturan.pola.test(teks)) continue;
    for (const kata of aturan.tambah) {
      const bersih = normalisasiTeks(kata);
      if (!bersih || bersih === teks) continue;
      if (!hasil.includes(bersih)) hasil.push(bersih);
    }
  }
  return hasil;
}

function kataTerkait(q) {
  const teks = normalisasiTeks(q);
  for (const aturan of KATA_TERKAIT) {
    if (aturan.pola.test(teks)) return aturan.kata;
  }
  return [];
}

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

async function kumpulkan(kata, kotak, wilayah, token) {
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

function normalisasiNomor(nilai) {
  return String(nilai || "").trim();
}

function decodeXml(nilai = "") {
  return String(nilai)
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'");
}

// API OpenStreetMap mengembalikan XML (bukan JSON), jadi tag-nya dibaca
// langsung dari elemen <node>/<way>/<relation>. Ini yang membuat nomor
// telepon dan website yang tersimpan di peta tetap terbawa.
function bacaTagOsm(xml) {
  const hasil = new Map();
  const elemen = /<(node|way|relation)\s+id="(\d+)"[^>]*>([\s\S]*?)<\/\1>/g;
  let cocok;
  while ((cocok = elemen.exec(xml))) {
    const [, tipe, id, isi] = cocok;
    const tags = {};
    const tag = /<tag\s+k="([^"]+)"\s+v="([^"]*)"\s*\/>/g;
    let satu;
    while ((satu = tag.exec(isi))) {
      tags[decodeXml(satu[1])] = decodeXml(satu[2]);
    }
    if (Object.keys(tags).length > 0) hasil.set(`${tipe}-${id}`, tags);
  }
  return hasil;
}

// Ambil seluruh tag dari OpenStreetMap untuk titik-titik hasil. extratags
// Nominatim tidak selalu lengkap, dan Photon hampir tidak pernah membawa
// telepon/website. Satu permintaan bisa memuat puluhan id sekaligus, jadi
// ini tetap ringan dan gratis.
async function perkayaKontak(daftar) {
  const perTipe = new Map();
  for (const item of daftar) {
    if (!item?.osmId || !item?.osmTipe) continue;
    const kumpulan = perTipe.get(item.osmTipe) || new Set();
    kumpulan.add(item.osmId);
    perTipe.set(item.osmTipe, kumpulan);
  }
  if (perTipe.size === 0) return daftar;

  const tagPerTitik = new Map();

  await Promise.all(
    [...perTipe.entries()].map(async ([tipe, kumpulan]) => {
      const ids = [...kumpulan].slice(0, 50);
      if (ids.length === 0) return;
      const jalur = tipe === "node" ? "nodes" : tipe === "way" ? "ways" : "relations";
      try {
        const res = await fetch(
          `https://api.openstreetmap.org/api/0.6/${jalur}?${jalur}=${ids.join(",")}`,
          {
            headers: { "User-Agent": UA, Accept: "application/json" },
            signal: AbortSignal.timeout(BATAS_WAKTU_OSM_MS),
            cache: "no-store",
          }
        );
        if (!res.ok) return;
        const xml = await res.text();
        for (const [kunci, tags] of bacaTagOsm(xml)) {
          tagPerTitik.set(kunci, tags);
        }
      } catch {
        // Pengayaan bersifat tambahan; kalau gagal, hasil utama tetap tampil.
      }
    })
  );

  if (tagPerTitik.size === 0) return daftar;

  return daftar.map((item) => {
    const tags = tagPerTitik.get(`${item.osmTipe}-${item.osmId}`);
    if (!tags) return item;

    const telepon = normalisasiNomor(
      tags.phone || tags["contact:phone"] || tags["contact:mobile"] || item.kontak.telepon
    );
    const wa = normalisasiNomor(
      tags["contact:whatsapp"] || tags.whatsapp || item.kontak.wa
    );
    const email = normalisasiNomor(tags.email || tags["contact:email"] || item.kontak.email);
    const fax = normalisasiNomor(tags.fax || tags["contact:fax"] || item.kontak.fax);
    const narahubung = normalisasiNomor(tags.operator || item.kontak.narahubung);
    const website = tags.website || tags["contact:website"] || tags.url || item.website;
    const jamBuka = tags.opening_hours || item.jamBuka;

    const alamatTag = rapikanAlamat([
      [tags["addr:street"], tags["addr:housenumber"]].filter(Boolean).join(" "),
      tags["addr:suburb"] || tags["addr:neighbourhood"],
      tags["addr:city"] || tags["addr:town"] || tags["addr:village"],
      tags["addr:state"],
    ]);

    return {
      ...item,
      alamat: item.alamat || alamatTag,
      kota: item.kota || tags["addr:city"] || tags["addr:town"] || tags["addr:village"] || "",
      website,
      jamBuka,
      kontak: { telepon, wa, email, fax, narahubung },
    };
  });
}

function olah(daftar, jenis, token) {
  const gabung = gabungkan(daftar).map((item) => ({
    ...item,
    skor: skorHasil(item.nama, `${item.layanan} ${item.kategori}`, token),
  }));

  const sesuaiJenis = gabung.filter((item) =>
    jenis === "semua" ? true : item.jenis === jenis
  );

  // Buang hasil yang sama sekali tidak nyambung dengan kata kunci (biasanya
  // datang dari pencocokan awalan Photon). Kalau yang tersisa terlalu sedikit,
  // pakai semua supaya user tetap dapat hasil, bukan halaman kosong.
  const relevan = sesuaiJenis.filter((item) => item.skor > 0);
  const dipakai = relevan.length >= 3 ? relevan : sesuaiJenis;

  return dipakai
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
    return { hasil: [], catatan: "Kata kunci terlalu pendek.", variasi: [] };
  }

  const kunciCache = `${normalisasiTeks(kata)}|${wilayah}|${jenis}`;
  const tersimpan = cache.get(kunciCache);
  if (tersimpan && tersimpan.kedaluwarsa > Date.now()) {
    return tersimpan.nilai;
  }

  const kotak = KOTAK_WILAYAH[wilayah] || null;
  const token = tokenUntuk(kata);
  const variasi = variasiKata(kata);

  const daftar = [];
  const galat = [];
  const dicoba = [];

  const jalankan = async (teks, pakaiToken) => {
    dicoba.push(teks);
    const hasilSatu = await kumpulkan(teks, kotak, wilayah, pakaiToken);
    daftar.push(...hasilSatu.daftar);
    galat.push(...hasilSatu.galat);
    return hasilSatu;
  };

  await jalankan(kata, token);

  // Kalau hasil utama sudah cukup banyak, variasi tidak perlu dijalankan.
  let hasil = olah(daftar, jenis, token);
  if (hasil.length < 8) {
    for (const teks of variasi.slice(0, 3)) {
      // Beri jarak supaya aturan ~1 permintaan/detik Nominatim tidak dilanggar.
      await jeda(1100);
      await jalankan(teks, tokenUntuk(teks));
      hasil = olah(daftar, jenis, token);
      if (hasil.length >= 24) break;
    }
  }

  let catatanTambahan = "";

  if (hasil.length === 0) {
    const cadangan = kataCadangan(kata);
    const terkait = kataTerkait(kata).filter((k) => !dicoba.includes(k));
    const pilihan = [cadangan, ...terkait].filter(Boolean);

    for (const teks of pilihan.slice(0, 2)) {
      await jeda(1100);
      await jalankan(teks, tokenUntuk(teks));
      const hasilCadangan = olah(daftar, jenis, tokenUntuk(teks));
      if (hasilCadangan.length > 0) {
        // Tandai supaya UI bisa menulis "hasil terkait", bukan pura-pura persis.
        hasil = hasilCadangan.map((item) => ({ ...item, terkait: true }));
        catatanTambahan = `Tidak ada usaha yang persis cocok untuk "${kata}". Ini hasil untuk kata kunci terkait "${teks}" di wilayah yang sama — cek dulu apakah usahanya benar-benar sesuai.`;
        break;
      }
    }
  }

  // Kedua sumber gagal total: lebih baik jujur daripada menampilkan "kosong".
  if (galat.length >= 2 && daftar.length === 0) {
    throw new Error(
      "Layanan peta publik (OpenStreetMap) sedang tidak bisa dihubungi. Coba lagi sekitar satu menit."
    );
  }

  const perkaya = await perkayaKontak(hasil);
  // Setelah kontak diperkaya, skor dihitung ulang supaya urutannya tetap benar
  // (misl. alamat baru membantu mencocokkan wilayah).
  hasil = perkaya
    .map((item) => ({
      ...item,
      skor: skorHasil(item.nama, `${item.layanan} ${item.kategori}`, token),
    }))
    .sort((a, b) => {
      const prioritasA = prioritasWilayah(a);
      const prioritasB = prioritasWilayah(b);
      if (prioritasA !== prioritasB) return prioritasA - prioritasB;
      if (b.skor !== a.skor) return b.skor - a.skor;
      return String(a.nama).localeCompare(String(b.nama), "id");
    });

  const catatan = [
    catatanTambahan,
    galat.length > 0
      ? "Sebagian sumber peta sedang sibuk, jadi hasil mungkin lebih sedikit dari biasanya."
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  const nilai = { hasil, catatan, variasi, dicoba };

  cache.set(kunciCache, { nilai, kedaluwarsa: Date.now() + TTL_CACHE_MS });
  if (cache.size > 200) {
    const tertua = cache.keys().next().value;
    cache.delete(tertua);
  }

  return nilai;
}
