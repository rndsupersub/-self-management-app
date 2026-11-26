// lib/direktoriData.js
// Mesin pencari direktori Vendor / Agency / Jasa.

import { cocokPilihan } from "./filterMulti.js";
//
// Prinsip:
// - Isi direktori milik user (bisa tambah/edit/hapus), jadi tidak ada data
//   karangan di sini. Yang disediakan cuma saran jenis layanan supaya user
//   tidak perlu mengetik dari nol.
// - Urutan hasil mengikuti prioritas wilayah yang diminta: Bandung, Jakarta,
//   JABODETABEK, Jawa Tengah, Jawa Timur, provinsi lain di Indonesia, lalu
//   China, Jepang, Korea, Asia lain, Amerika, Eropa.
// - Pencarian tahan typo ringan: "moulding" ketemu juga saat user menulis
//   "molding"/"injeksi", "busa" ketemu "sponge", dst.

export const JENIS_MITRA = [
  { id: "vendor", label: "Vendor", ikon: "factory" },
  { id: "agency", label: "Agency", ikon: "sparkles" },
  { id: "jasa", label: "Jasa", ikon: "briefcase" },
];

export const STATUS_MITRA = [
  { id: "aktif", label: "Aktif", ikon: "check" },
  { id: "tutup", label: "Tutup usaha", ikon: "x" },
];

// Prioritas wilayah: angka kecil tampil lebih dulu. "grup" cuma untuk
// mengelompokkan pilihan di form, bukan untuk sorting.
export const WILAYAH = [
  { id: "bandung", label: "Bandung", grup: "Indonesia", prioritas: 10 },
  { id: "jakarta", label: "Jakarta", grup: "Indonesia", prioritas: 20 },
  {
    id: "jabodetabek",
    label: "JABODETABEK (Bogor, Depok, Tangerang, Bekasi)",
    grup: "Indonesia",
    prioritas: 30,
  },
  { id: "jawa_tengah", label: "Jawa Tengah", grup: "Indonesia", prioritas: 40 },
  { id: "jawa_timur", label: "Jawa Timur", grup: "Indonesia", prioritas: 50 },
  {
    id: "indonesia_lain",
    label: "Provinsi lain di Indonesia",
    grup: "Indonesia",
    prioritas: 60,
  },
  { id: "china", label: "China", grup: "Asia", prioritas: 70 },
  { id: "jepang", label: "Jepang", grup: "Asia", prioritas: 80 },
  { id: "korea", label: "Korea", grup: "Asia", prioritas: 90 },
  { id: "asia_lain", label: "Asia lainnya", grup: "Asia", prioritas: 100 },
  { id: "amerika", label: "Amerika", grup: "Benua lain", prioritas: 110 },
  { id: "eropa", label: "Eropa", grup: "Benua lain", prioritas: 120 },
  { id: "lainnya", label: "Belum ditentukan", grup: "Lainnya", prioritas: 130 },
];

export const WILAYAH_DEFAULT = "bandung";

// Saran jenis layanan. User tetap boleh mengetik apa pun; daftar ini hanya
// pintasan supaya tidak perlu menghafal istilah.
export const SARAN_LAYANAN = [
  { jenis: "vendor", label: "Injection Moulding" },
  { jenis: "vendor", label: "Blow Moulding" },
  { jenis: "vendor", label: "Rotational Moulding" },
  { jenis: "vendor", label: "Compression Moulding" },
  { jenis: "vendor", label: "Moulding (lainnya)" },
  { jenis: "vendor", label: "Busa / Sponge" },
  { jenis: "vendor", label: "Chemical" },
  { jenis: "vendor", label: "Bahan Baku" },
  { jenis: "vendor", label: "Komponen" },
  { jenis: "vendor", label: "Packing / Kemasan" },
  { jenis: "vendor", label: "Percetakan Kemasan" },
  { jenis: "vendor", label: "Tekstil" },
  { jenis: "vendor", label: "Logam / Machining" },
  { jenis: "vendor", label: "Elektronik" },
  { jenis: "vendor", label: "Penyedia Barang" },
  { jenis: "agency", label: "UI/UX" },
  { jenis: "agency", label: "Branding" },
  { jenis: "agency", label: "Desain Grafis" },
  { jenis: "agency", label: "Desain Logo" },
  { jenis: "agency", label: "Desain Poster" },
  { jenis: "agency", label: "Desain Label Stiker" },
  { jenis: "agency", label: "Desain Kemasan" },
  { jenis: "agency", label: "Desain Produk" },
  { jenis: "agency", label: "Digital Marketing" },
  { jenis: "agency", label: "Social Media" },
  { jenis: "agency", label: "Foto / Video" },
  { jenis: "agency", label: "Event Organizer" },
  { jenis: "agency", label: "Web Development" },
  { jenis: "jasa", label: "Ekspor Impor" },
  { jenis: "jasa", label: "Marketing" },
  { jenis: "jasa", label: "Penyedia Host Live" },
  { jenis: "jasa", label: "Logistik / Pengiriman" },
  { jenis: "jasa", label: "Penerjemah" },
  { jenis: "jasa", label: "Legal / Perizinan" },
  { jenis: "jasa", label: "Akuntansi / Pajak" },
  { jenis: "jasa", label: "Perawatan Mesin" },
  { jenis: "jasa", label: "Tenaga Kerja" },
];

// Sinonim supaya pencarian tidak tersandera ejaan.
const SINONIM = {
  moulding: ["molding", "mould", "mold", "cetak", "cetakan"],
  injection: ["injeksi", "inject", "suntik"],
  blow: ["tiup"],
  busa: ["sponge", "spons", "foam"],
  packing: ["kemasan", "packaging", "kemas"],
  desain: ["design", "desainer", "designer"],
  agency: ["agensi"],
  branding: ["brand", "merek"],
  jasa: ["service", "layanan"],
  ekspor: ["export", "expor"],
  impor: ["import"],
  host: ["hostlive", "live"],
  wa: ["whatsapp"],
  telp: ["telepon", "phone", "telpon"],
  stiker: ["sticker", "label"],
  chemical: ["kimia", "bahan kimia"],
  mobil: ["mobil", "automotive", "autocare"],
  percetakan: ["printing", "cetak"],
  konveksi: ["garment", "garmen"],
  gudang: ["warehouse", "logistik"],
};

export function normalisasiTeks(nilai) {
  return String(nilai ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const PETA_SINONIM = (() => {
  const peta = new Map();
  for (const [kunci, daftar] of Object.entries(SINONIM)) {
    const semua = [...new Set([kunci, ...daftar].map(normalisasiTeks))];
    for (const kata of semua) {
      const kumpulan = peta.get(kata) || new Set();
      semua.forEach((k) => kumpulan.add(k));
      peta.set(kata, kumpulan);
    }
  }
  return peta;
})();

export function perluasToken(token) {
  const dasar = normalisasiTeks(token);
  if (!dasar) return [];
  const sinonim = PETA_SINONIM.get(dasar);
  return sinonim ? [...sinonim] : [dasar];
}

export function getWilayah(id) {
  return WILAYAH.find((w) => w.id === id) || WILAYAH[WILAYAH.length - 1];
}

export function labelJenis(id) {
  return JENIS_MITRA.find((j) => j.id === id)?.label || "Lainnya";
}

export function labelStatus(id) {
  return STATUS_MITRA.find((s) => s.id === id)?.label || "Aktif";
}

// Tebak wilayah dari kota/provinsi/negara kalau user belum memilih.
export function deteksiWilayah({ kota = "", provinsi = "", negara = "" } = {}) {
  const teks = normalisasiTeks(`${kota} ${provinsi} ${negara}`);
  if (!teks) return WILAYAH_DEFAULT;

  if (/\b(bandung|bandung barat|cimahi|subang|purwakarta)\b/.test(teks)) return "bandung";
  if (/\bjakarta\b|\bdki\b/.test(teks)) return "jakarta";
  if (/\b(bogor|depok|tangerang|bekasi|karawang|serang|banten)\b/.test(teks))
    return "jabodetabek";
  if (/\b(semarang|solo|surakarta|magelang|yogyakarta|jogja|jepara|kudus|pekalongan|cilacap|tegal)\b/.test(teks))
    return "jawa_tengah";
  if (/\b(surabaya|sidoarjo|gresik|malang|pasuruan|mojokerto|kediri|jember|madiun)\b/.test(teks))
    return "jawa_timur";
  if (/china|tiongkok|cina|guangzhou|shenzhen|ningbo|yiwu|dongguan|shanghai|zhejiang|jiangsu/.test(teks))
    return "china";
  if (/jepang|japan|osaka|tokyo|nagoya|aichi/.test(teks)) return "jepang";
  if (/korea|seoul|busan|incheon/.test(teks)) return "korea";
  if (/vietnam|thailand|thai|malaysia|singapore|singapura|india|taiwan|filipina|philippines|myanmar|kamboja|cambodia|bangladesh|pakistan|sri lanka|timor/.test(teks))
    return "asia_lain";
  if (/amerika|usa|united states|us\b|kanada|canada|brazil|meksiko|mexico|argentina|chile/.test(teks))
    return "amerika";
  if (/eropa|europe|jerman|germany|belanda|netherlands|italia|italy|spanyol|spain|prancis|france|inggris|uk\b|england|polandia|turki|turkey|swedia|switzerland|swiss|portugal|belgia|belgium|austria/.test(teks))
    return "eropa";
  if (/indonesia/.test(teks)) return "indonesia_lain";
  return "lainnya";
}

export function prioritasWilayah(mitra = {}) {
  const id = mitra.wilayah && WILAYAH.some((w) => w.id === mitra.wilayah)
    ? mitra.wilayah
    : deteksiWilayah(mitra);
  return getWilayah(id).prioritas;
}

export function buatMitraKosong(awal = {}) {
  return {
    id: "",
    nama: "",
    jenis: "vendor",
    layanan: "",
    tags: "",
    status: "aktif",
    statusCatatan: "",
    kontak: { wa: "", telepon: "", email: "", fax: "", narahubung: "" },
    alamat: "",
    kota: "",
    provinsi: "",
    negara: "Indonesia",
    wilayah: WILAYAH_DEFAULT,
    mapsUrl: "",
    mapsKoordinat: "",
    website: "",
    catatan: "",
    koordinat: null,
    sumber: "",
    sumberUrl: "",
    ...awal,
    kontak: { ...{ wa: "", telepon: "", email: "", fax: "", narahubung: "" }, ...(awal.kontak || {}) },
  };
}

export function generateId(prefix = "mitra") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// Hanya izinkan tautan http(s). Tanpa ini, isian seperti "javascript:..."
// bisa jadi celah XSS saat dirender sebagai href.
export function tautanAman(url) {
  const teks = String(url || "").trim();
  if (!teks) return "";
  if (/^https?:\/\//i.test(teks)) return teks;
  if (/^[a-z][a-z0-9+.-]*:/i.test(teks)) return "";
  return `https://${teks.replace(/^\/+/, "")}`;
}

export function tautanWhatsApp(nomor) {
  let digit = String(nomor || "").replace(/\D/g, "");
  if (!digit) return "";
  if (digit.startsWith("0")) digit = `62${digit.slice(1)}`;
  else if (digit.startsWith("8")) digit = `62${digit}`;
  return `https://wa.me/${digit}`;
}

export function tautanTelepon(nomor) {
  const bersih = String(nomor || "").replace(/[^\d+]/g, "");
  return bersih ? `tel:${bersih}` : "";
}

export function tautanEmail(email) {
  const teks = String(email || "").trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(teks) ? `mailto:${teks}` : "";
}

// Kunci untuk mendeteksi entri ganda. Nama saja tidak cukup: dua cabang
// "Toko Sumber Jaya" bisa berbeda tempat. Jadi koordinat ikut dihitung.
export function kunciMitra(mitra = {}) {
  const lat = Number(mitra.koordinat?.lat);
  const lon = Number(mitra.koordinat?.lon);
  const lokasi =
    Number.isFinite(lat) && Number.isFinite(lon) && lat !== 0 && lon !== 0
      ? `${lat.toFixed(3)},${lon.toFixed(3)}`
      : normalisasiTeks(mitra.alamat || mitra.kota || "").slice(0, 60);
  return `${normalisasiTeks(mitra.nama)}|${lokasi}`;
}

// Titik presisi di Google Maps. Dipakai sebagai tombol kedua kalau nama usaha
// tidak ditemukan Google Maps (nama bisa kembar, koordinat tidak).
export function tautanKoordinat(mitra = {}) {
  const lat = Number(mitra.koordinat?.lat);
  const lon = Number(mitra.koordinat?.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat === 0 || lon === 0) return "";
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
}

// Google Maps: kalau user menempel link, pakai link itu. Kalau tidak, pakai
// titik koordinat (hasil pencarian peta) supaya Maps langsung membuka tempat
// yang benar, bukan cuma kota. Terakhir, cari berdasarkan alamat.
export function tautanMaps(mitra = {}) {
  const langsung = tautanAman(mitra.mapsUrl);
  if (langsung) return langsung;

  const lat = Number(mitra.koordinat?.lat);
  const lon = Number(mitra.koordinat?.lon);
  if (Number.isFinite(lat) && Number.isFinite(lon) && lat !== 0 && lon !== 0) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
  }

  const alamat = [mitra.alamat, mitra.kota, mitra.provinsi, mitra.negara]
    .filter(Boolean)
    .join(", ");
  if (!alamat.trim()) return "";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(alamat)}`;
}

function teksPencarian(mitra) {
  return normalisasiTeks(
    [
      mitra.nama,
      labelJenis(mitra.jenis),
      mitra.layanan,
      mitra.tags,
      mitra.kota,
      mitra.provinsi,
      mitra.negara,
      getWilayah(mitra.wilayah).label,
      mitra.alamat,
      mitra.catatan,
      mitra.statusCatatan,
      mitra.kontak?.narahubung,
      mitra.kontak?.email,
      mitra.kontak?.wa,
      mitra.kontak?.telepon,
    ]
      .filter(Boolean)
      .join(" ")
  );
}

function skorRelevansi(mitra, tokenGrup) {
  const nama = normalisasiTeks(mitra.nama);
  const layanan = normalisasiTeks(`${mitra.layanan} ${mitra.tags}`);
  let skor = 0;
  for (const grup of tokenGrup) {
    if (grup.some((kata) => nama.includes(kata))) skor += 3;
    else if (grup.some((kata) => layanan.includes(kata))) skor += 2;
    else skor += 1;
  }
  return skor;
}

export function cariMitra(list = [], opsi = {}) {
  const { q = "", jenis = "semua", wilayah = "semua", status = "semua", urut = "wilayah" } = opsi;

  const tokenGrup = String(q)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(perluasToken)
    .filter((grup) => grup.length > 0);

  const hasil = [];
  for (const mitra of list) {
    if (!mitra) continue;
    if (!cocokPilihan(mitra.jenis, jenis)) continue;
    if (!cocokPilihan(mitra.status || "aktif", status)) continue;
    if (wilayah !== "semua") {
      const idWilayah = mitra.wilayah || deteksiWilayah(mitra);
      if (idWilayah !== wilayah) continue;
    }

    const teks = teksPencarian(mitra);
    if (tokenGrup.length > 0) {
      const cocok = tokenGrup.every((grup) => grup.some((kata) => teks.includes(kata)));
      if (!cocok) continue;
    }

    hasil.push({ mitra, skor: skorRelevansi(mitra, tokenGrup) });
  }

  const bandingkanNama = (a, b) =>
    String(a.mitra.nama || "").localeCompare(String(b.mitra.nama || ""), "id");

  if (urut === "nama") {
    hasil.sort(bandingkanNama);
  } else if (urut === "terbaru") {
    hasil.sort((a, b) =>
      String(b.mitra.updatedAt || b.mitra.createdAt || "").localeCompare(
        String(a.mitra.updatedAt || a.mitra.createdAt || "")
      )
    );
  } else {
    hasil.sort((a, b) => {
      const wilayahA = prioritasWilayah(a.mitra);
      const wilayahB = prioritasWilayah(b.mitra);
      if (wilayahA !== wilayahB) return wilayahA - wilayahB;
      const statusA = (a.mitra.status || "aktif") === "aktif" ? 0 : 1;
      const statusB = (b.mitra.status || "aktif") === "aktif" ? 0 : 1;
      if (statusA !== statusB) return statusA - statusB;
      if (b.skor !== a.skor) return b.skor - a.skor;
      return bandingkanNama(a, b);
    });
  }

  return hasil.map((h) => h.mitra);
}

// Contoh kata kunci di kotak pencarian. Ini cuma pintasan supaya user tidak
// bingung mau mengetik apa; semua kata kunci bebas dipakai.
export const CONTOH_PENCARIAN = [
  "bengkel las",
  "digital printing",
  "konveksi",
  "injection moulding",
  "jasa ekspedisi",
  "agency branding",
  "fotografi produk",
  "percetakan kemasan",
];

// Ubah satu hasil pencarian peta jadi entri direktori milik user, supaya hasil
// yang berguna bisa disimpan, diedit, dan diberi catatan sendiri.
export function mitraDariHasilCari(hasil = {}) {
  return buatMitraKosong({
    nama: hasil.nama || "",
    jenis: hasil.jenis || "vendor",
    layanan: hasil.layanan || "",
    tags: hasil.kategori || "",
    kontak: hasil.kontak || {},
    alamat: hasil.alamat || "",
    kota: hasil.kota || "",
    provinsi: hasil.provinsi || "",
    negara: hasil.negara || "",
    wilayah: hasil.wilayah || WILAYAH_DEFAULT,
    mapsUrl: hasil.mapsUrl || "",
    mapsKoordinat: hasil.mapsKoordinat || "",
    website: hasil.website || "",
    catatan: hasil.jamBuka ? `Jam buka (data peta): ${hasil.jamBuka}` : "",
    status: hasil.status === "tutup" ? "tutup" : "aktif",
    statusCatatan: hasil.statusCatatan || "",
    koordinat: hasil.koordinat || null,
    sumber: "openstreetmap",
    sumberUrl: hasil.tautanOsm || "",
  });
}

// Pilih kategori vendor yang tersedia di halaman (kategori Pekerjaan dan
// Bisnis berbeda), berdasarkan layanan entri direktori.
function pilihKategoriVendor(layanan = "", tags = "", kategoriTersedia = []) {
  const teks = normalisasiTeks(`${layanan} ${tags}`);
  const kandidat = [];

  if (/packing|kemasan|kardus|packaging|stiker|label/.test(teks)) {
    kandidat.push("packing", "packing_kemasan");
  }
  if (/komponen|spare part|suku cadang/.test(teks)) {
    kandidat.push("komponen");
  }
  if (/maklon|produksi|mould|mold|injeksi|injection|blow/.test(teks)) {
    kandidat.push("produksi", "jasa");
  }
  if (/logistik|ekspedisi|pengiriman|kurir|distributor|reseller|gudang/.test(teks)) {
    kandidat.push("logistik", "distributor");
  }
  if (/digital|desain|design|branding|marketing|agency|agensi|web|foto|video|konten|host/.test(teks)) {
    kandidat.push("digital", "jasa");
  }
  if (/jasa|service|layanan|bengkel|las|bubut|cetak|printing|percetakan|konveksi|jahit|maklon|produksi/.test(teks)) {
    kandidat.push("produksi", "jasa");
  }
  if (/bahan|kimia|chemical|tekstil|kain|busa|spons|plastik/.test(teks)) {
    kandidat.push("supplier_bahan", "bahan_baku");
  }
  kandidat.push("lainnya_bisnis", "lainnya");

  const daftar = Array.isArray(kategoriTersedia) ? kategoriTersedia : [];
  for (const id of kandidat) {
    if (daftar.some((k) => k.id === id)) return id;
  }
  return daftar[0]?.id || "lainnya";
}

// Ubah satu entri direktori jadi vendor yang siap tampil di tab Vendor.
// Semua isian diambil dari data yang sudah didapat (nama, kontak, alamat,
// catatan, peta), jadi user tidak perlu mengetik ulang.
export function vendorDariMitra(mitra = {}, kategoriTersedia = []) {
  const kontak = mitra.kontak || {};
  const telepon = kontak.wa || kontak.telepon || "";
  const catatan = [
    mitra.catatan,
    mitra.layanan ? `Layanan: ${mitra.layanan}` : "",
    mitra.website ? `Website: ${mitra.website}` : "",
    mitra.status === "tutup"
      ? `Tutup usaha${mitra.statusCatatan ? `: ${mitra.statusCatatan}` : ""}`
      : "",
    tautanMaps(mitra) ? `Peta: ${tautanMaps(mitra)}` : "",
    "Diimpor dari Direktori.",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    id: `vendor_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    nama: String(mitra.nama || "").trim(),
    kategoriId: pilihKategoriVendor(mitra.layanan, mitra.tags, kategoriTersedia),
    kontak: {
      nama: kontak.narahubung || "",
      telp: telepon,
      email: kontak.email || "",
    },
    alamat: [mitra.alamat, mitra.kota, mitra.provinsi, mitra.negara]
      .filter(Boolean)
      .join(", "),
    moq: { nilai: 0, satuan: "pcs" },
    hpp: 0,
    // Jangan kasih status mentah: vendor hasil impor belum punya pertanyaan
    // terjawab maupun kunjungan, jadi di web harus tampil "Belum ada status".
    // Statusnya nanti dihitung otomatis begitu ada data.
    status: "belum",
    statusMode: "otomatis",
    catatan,
    pertanyaanAwal: [],
    logKunjungan: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Ubah banyak entri sekaligus, lewati nama yang sudah ada di daftar vendor.
export function vendorDariDaftarMitra(mitraList = [], vendorList = [], kategoriTersedia = []) {
  const sudahAda = new Set(
    (vendorList || []).map((v) => normalisasiTeks(v?.nama)).filter(Boolean)
  );
  const hasil = [];
  for (const mitra of mitraList || []) {
    if (!mitra?.nama) continue;
    const nama = normalisasiTeks(mitra.nama);
    if (!nama || sudahAda.has(nama)) continue;
    sudahAda.add(nama);
    hasil.push(vendorDariMitra(mitra, kategoriTersedia));
  }
  return hasil;
}

// Ubah entri vendor sebuah brand jadi entri direktori, supaya user tidak
// mengetik ulang kontak yang sudah dia punya.
export function imporDariVendorBrand(vendorList = [], namaBrand = "") {
  const hasil = [];
  for (const v of vendorList || []) {
    if (!v?.nama) continue;
    hasil.push(
      buatMitraKosong({
        nama: v.nama,
        jenis: "vendor",
        layanan: v.kategoriLabel || v.kategoriId || "",
        tags: namaBrand ? `dari brand ${namaBrand}` : "",
        kontak: {
          wa: v.kontak?.telp || "",
          telepon: v.kontak?.telp || "",
          email: v.kontak?.email || "",
          fax: "",
          narahubung: v.kontak?.nama || "",
        },
        alamat: v.alamat || "",
        catatan: v.catatan || "",
        sumber: "impor-vendor",
      })
    );
  }
  return hasil;
}
