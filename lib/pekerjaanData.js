// lib/pekerjaanData.js

// ========== PRIORITAS ==========
export const DEFAULT_PRIORITAS = [
  { id: "utama", label: "🔥 Utama", warna: "red" },
  { id: "sedang", label: "🔸 Sedang", warna: "yellow" },
  { id: "ide", label: "💡 Ide", warna: "blue" },
  { id: "drop", label: "🚫 Drop", warna: "gray" },
  { id: "ditunda", label: "⏸️ Ditunda", warna: "orange" },
];

// ========== SUMBER IDE ==========
export const DEFAULT_SUMBER = [
  { id: "bos", label: "💼 Bos", warna: "purple" },
  { id: "gua", label: "👤 Gua", warna: "green" },
  { id: "marketing", label: "📢 Marketing", warna: "orange" },
  { id: "supervisor", label: "👔 Supervisor", warna: "blue" },
  { id: "vendor", label: "🏭 Vendor", warna: "brown" },
  { id: "tim", label: "👥 Tim", warna: "pink" },
  { id: "lainnya", label: "📌 Lainnya", warna: "gray" },
];

// ========== SECTION KEGIATAN ==========
// Section = tempat nyatet satu kegiatan per tahap kerja R&D.
// Ini BUKAN kategori kalender (kategori = warna di kalender) dan BUKAN daftar vendor.
// `deskripsi` dipakai di UI biar fungsi tiap section nggak kelupaan.
export const DEFAULT_SECTIONS = [
  {
    id: "analisis",
    label: "📊 Analisis",
    deskripsi: "Riset pasar, kompetitor, harga, dan spesifikasi produk.",
  },
  {
    id: "desain",
    label: "🎨 Desain",
    deskripsi: "Brief, revisi, file desain, kemasan, dan mockup.",
  },
  {
    id: "vendor",
    label: "🏭 Vendor",
    deskripsi: "Kontak vendor, MOQ, harga, sample, dan nego.",
  },
  {
    id: "lainnya",
    label: "📝 Lainnya",
    deskripsi: "Rapat, arahan bos, dan catatan di luar 3 tahap di atas.",
  },
];

// ========== KATEGORI KEGIATAN (UNTUK KALENDER) ==========
// Setiap kategori punya: id, label, warna (id palet), customHex (opsional)
// Kalau customHex diisi → warna pakai hex manual. Kalau kosong → pakai palet.
export const DEFAULT_KATEGORI_KEGIATAN = [
  { id: "analisis", label: "📊 Analisis", warna: "green", customHex: "" },
  { id: "design", label: "🎨 Design", warna: "purple", customHex: "" },
  { id: "vendor", label: "🏭 Vendor", warna: "gray", customHex: "" },
  { id: "rapat", label: "👥 Rapat", warna: "blue", customHex: "" },
  { id: "lainnya", label: "📝 Lainnya", warna: "orange", customHex: "" },
];

// ========== PALET WARNA (10 DEFAULT) ==========
export const WARNA_OPTIONS = [
  { id: "red", label: "🔴 Merah", bg: "bg-red-500", hover: "hover:bg-red-600", text: "text-white", dot: "bg-red-500", border: "border-red-600" },
  { id: "orange", label: "🟠 Orange", bg: "bg-orange-500", hover: "hover:bg-orange-600", text: "text-white", dot: "bg-orange-500", border: "border-orange-600" },
  { id: "yellow", label: "🟡 Kuning", bg: "bg-yellow-500", hover: "hover:bg-yellow-600", text: "text-white", dot: "bg-yellow-500", border: "border-yellow-600" },
  { id: "green", label: "🟢 Hijau", bg: "bg-green-500", hover: "hover:bg-green-600", text: "text-white", dot: "bg-green-500", border: "border-green-600" },
  { id: "teal", label: "🩵 Teal", bg: "bg-teal-500", hover: "hover:bg-teal-600", text: "text-white", dot: "bg-teal-500", border: "border-teal-600" },
  { id: "blue", label: "🔵 Biru", bg: "bg-blue-500", hover: "hover:bg-blue-600", text: "text-white", dot: "bg-blue-500", border: "border-blue-600" },
  { id: "indigo", label: "🔷 Indigo", bg: "bg-indigo-500", hover: "hover:bg-indigo-600", text: "text-white", dot: "bg-indigo-500", border: "border-indigo-600" },
  { id: "purple", label: "🟣 Ungu", bg: "bg-purple-500", hover: "hover:bg-purple-600", text: "text-white", dot: "bg-purple-500", border: "border-purple-600" },
  { id: "pink", label: "🩷 Pink", bg: "bg-pink-500", hover: "hover:bg-pink-600", text: "text-white", dot: "bg-pink-500", border: "border-pink-600" },
  { id: "gray", label: "⚪ Abu", bg: "bg-gray-500", hover: "hover:bg-gray-600", text: "text-white", dot: "bg-gray-500", border: "border-gray-600" },
];

// ========== HELPER: CARI WARNA DARI PALET ==========
export function getWarnaStyle(warnaId) {
  return WARNA_OPTIONS.find((w) => w.id === warnaId) || WARNA_OPTIONS[9];
}

// ========== HELPER: CONVERT HEX KE RGBA ==========
export function hexToRgba(hex, alpha = 1) {
  if (!hex) return `rgba(128, 128, 128, ${alpha})`;
  let h = hex.replace("#", "");
  if (h.length === 3) {
    h = h.split("").map((c) => c + c).join("");
  }
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ========== HELPER: GET STYLE KATEGORI ==========
// Return style yang dipakai di kalender — bisa palet atau custom hex
export function getKategoriStyle(kategori) {
  if (!kategori) {
    return {
      bg: "bg-gray-500",
      hover: "hover:bg-gray-600",
      text: "text-white",
      dot: "bg-gray-500",
      border: "border-gray-600",
      isCustom: false,
      customHex: "",
      inlineStyle: null,
    };
  }

  if (kategori.customHex && kategori.customHex.trim() !== "") {
    return {
      bg: "",
      hover: "",
      text: "text-white",
      dot: "",
      border: "",
      isCustom: true,
      customHex: kategori.customHex,
      inlineStyle: {
        backgroundColor: kategori.customHex,
        color: "#fff",
        borderColor: kategori.customHex,
      },
    };
  }

  const palet = getWarnaStyle(kategori.warna);
  return {
    ...palet,
    isCustom: false,
    customHex: "",
    inlineStyle: null,
  };
}

// ========== TEMPLATE PT & BRAND ==========
export const DEFAULT_PT = [
  {
    id: "elfiqa",
    nama: "PT Elfiqa",
    brands: [
      { id: "supersub", nama: "Supersub", kegiatan: [] },
      { id: "velqo", nama: "Velqo", kegiatan: [] },
    ],
  },
];

// ========== HELPER: GENERATE ID ==========
export function generateId(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

// ========== HELPER: FORMAT TANGGAL ==========
export function formatTanggal(dateStr, opsi = "panjang") {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (opsi === "pendek") {
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ========== HELPER: RENTANG TANGGAL KEGIATAN ==========
// Sumber kebenaran tanggal = tanggalMulai & tanggalSelesai.
// Field `tanggal` cuma peninggalan versi lama (sebelum ada range), tetap dibaca
// supaya 16 kegiatan lama nggak perlu migrasi.
export function rentangKegiatan(kegiatan) {
  if (!kegiatan) return { mulai: "", selesai: "" };
  const mulai = kegiatan.tanggalMulai || kegiatan.tanggal || "";
  const selesai = kegiatan.tanggalSelesai || kegiatan.tanggal || mulai;
  return { mulai, selesai };
}

// ========== HELPER: FORMAT RENTANG TANGGAL ==========
// 1 hari  → "Rabu, 1 April 2026" (opsi panjang) / "1 Apr 2026" (pendek)
// >1 hari → "1 Apr – 27 Apr 2026" (pendek) / "1 April 2026 – 27 April 2026"
export function formatRentang(mulai, selesai, opsi = "pendek") {
  const { mulai: m, selesai: s } = rentangKegiatan({
    tanggalMulai: mulai,
    tanggalSelesai: selesai,
  });
  if (!m) return "-";
  if (!s || m === s) return formatTanggal(m, opsi);

  const sameYear = new Date(m).getFullYear() === new Date(s).getFullYear();
  const fmt = (date, withYear) =>
    new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: opsi === "pendek" ? "short" : "long",
      ...(withYear ? { year: "numeric" } : {}),
    });

  return `${fmt(m, !sameYear)} – ${fmt(s, true)}`;
}

// ========== HELPER: CARI PT ==========
export function findPT(pts, ptId) {
  return pts.find((pt) => pt.id === ptId) || null;
}

// ========== HELPER: CARI BRAND ==========
export function findBrand(pts, ptId, brandId) {
  const pt = findPT(pts, ptId);
  if (!pt) return null;
  return pt.brands.find((b) => b.id === brandId) || null;
}

// ========== HELPER: CARI KEGIATAN ==========
export function findKegiatan(pts, ptId, brandId, kegId) {
  const brand = findBrand(pts, ptId, brandId);
  if (!brand) return null;
  return brand.kegiatan.find((k) => k.id === kegId) || null;
}