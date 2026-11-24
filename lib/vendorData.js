// lib/vendorData.js

// ========== KATEGORI VENDOR ==========
export const DEFAULT_KATEGORI_VENDOR = [
  { id: "bahan_baku", label: "🧱 Bahan Baku" },
  { id: "jasa", label: "🛠️ Jasa" },
  { id: "packing", label: "📦 Packing" },
  { id: "komponen", label: "🔩 Komponen" },
  { id: "lainnya", label: "📝 Lainnya" },
];

// ========== TUJUAN KUNJUNGAN ==========
export const DEFAULT_TUJUAN_KUNJUNGAN = [
  { id: "scanning", label: "🔍 Scanning Vendor" },
  { id: "kontrol", label: "⏱️ Kontrol Timeline" },
  { id: "serah_terima", label: "📦 Serah Terima Produk" },
  { id: "evaluasi", label: "📊 Evaluasi Vendor" },
  { id: "negosiasi", label: "💰 Negosiasi Harga" },
  { id: "trial", label: "🧪 Trial Order / Sample" },
  { id: "audit", label: "🏭 Audit Kapasitas" },
  { id: "rapat", label: "👥 Rapat Koordinasi" },
];

// ========== METODE KUNJUNGAN ==========
export const METODE_KUNJUNGAN = [
  { id: "offline", label: "🚗 Offline (Kunjungan Langsung)" },
  { id: "wa", label: "💬 Online (WhatsApp)" },
  { id: "gmeet", label: "📹 Online (Google Meet)" },
  { id: "zoom", label: "📹 Online (Zoom)" },
];

// ========== STATUS KUNJUNGAN ==========
// Kondisi vendor SAAT kunjungan (bukan status vendor keseluruhan).
export const STATUS_KUNJUNGAN = [
  { id: "layak", label: "✅ Layak", warna: "green" },
  { id: "tidak_layak", label: "❌ Tidak Layak", warna: "red" },
  { id: "belum_diketahui", label: "❔ Belum Diketahui", warna: "gray" },
];

// ========== PROGRESS KUNJUNGAN ==========
// Posisi pekerjaan saat kunjungan, dipisah dari status.
export const PROGRESS_KUNJUNGAN = [
  { id: "on_track", label: "⏳ On Track", warna: "blue" },
  { id: "delay", label: "⚠️ Delay", warna: "orange" },
  { id: "selesai", label: "🎉 Selesai", warna: "purple" },
];

// Daftar lama (gabungan status + progress). Tetap diekspor supaya data log yang
// sudah tersimpan sebelum pemisahan ini masih kebaca dan nggak hilang.
export const HASIL_KUNJUNGAN = [
  { id: "layak", label: "✅ Layak", warna: "green" },
  { id: "tidak_layak", label: "❌ Tidak Layak", warna: "red" },
  { id: "on_track", label: "⏳ On Track", warna: "blue" },
  { id: "delay", label: "⚠️ Delay", warna: "orange" },
  { id: "selesai", label: "🎉 Selesai", warna: "purple" },
];

// ========== STATUS VENDOR (NEW: Silver/Gold/Bronze/Blacklist) ==========
// Ini status yang bisa dipilih MANUAL. Status otomatis dihitung di
// lib/vendorStatus.js dari pertanyaan (profiling) + kunjungan (realitas).
export const STATUS_VENDOR = [
  { id: "gold", label: "🥇 Gold", warna: "yellow" },
  { id: "silver", label: "🥈 Silver", warna: "gray" },
  { id: "bronze", label: "🥉 Bronze", warna: "orange" },
  { id: "blacklist", label: "🔴 Blacklist", warna: "red" },
];

// Vendor yang belum punya pertanyaan terjawab / kunjungan sama sekali.
export const STATUS_BELUM = { id: "belum", label: "⚪ Belum ada status", warna: "gray" };

// ========== SATUAN MOQ ==========
export const SATUAN_MOQ = [
  { id: "pcs", label: "pcs" },
  { id: "kg", label: "kg" },
  { id: "gram", label: "gram" },
  { id: "roll", label: "roll" },
  { id: "meter", label: "meter" },
  { id: "liter", label: "liter" },
  { id: "set", label: "set" },
  { id: "box", label: "box" },
  { id: "lainnya", label: "lainnya" },
];

// ========== PERTANYAAN AWAL VENDOR (DEFAULT) ==========
export const DEFAULT_PERTANYAAN_VENDOR = [
  { id: "q_negosiasi", pertanyaan: "Vendor bisa handle negosiasi harga?", tipe: "checkbox" },
  { id: "q_audit", pertanyaan: "Vendor bisa audit kapasitas produksi?", tipe: "checkbox" },
  { id: "q_trial", pertanyaan: "Vendor bisa trial order / sample?", tipe: "checkbox" },
  { id: "q_rapat", pertanyaan: "Vendor bisa rapat rutin / koordinasi?", tipe: "checkbox" },
  { id: "q_evaluasi", pertanyaan: "Vendor bisa evaluasi performa berkala?", tipe: "checkbox" },
];

// ========== TIPE PERTANYAAN ==========
export const TIPE_PERTANYAAN = [
  { id: "checkbox", label: "✅ Checkbox (Ya/Tidak)" },
  { id: "short", label: "✏️ Jawaban Pendek" },
  { id: "long", label: "📝 Jawaban Panjang" },
];

// ========== TEMPLATE VENDOR DEFAULT ==========
export const DEFAULT_VENDOR = {
  kategoriVendor: DEFAULT_KATEGORI_VENDOR,
  tujuanKunjungan: DEFAULT_TUJUAN_KUNJUNGAN,
  statusKunjungan: STATUS_KUNJUNGAN,
  progressKunjungan: PROGRESS_KUNJUNGAN,
  hasilKunjungan: HASIL_KUNJUNGAN,
  pertanyaanVendor: DEFAULT_PERTANYAAN_VENDOR,
  vendor: [],
};

// ========== HELPER: GENERATE ID ==========
export function generateId(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

// ========== HELPER: FORMAT TANGGAL ==========
export function formatTanggal(dateStr, opsi = "panjang") {
  const d = new Date(dateStr);
  if (opsi === "pendek") {
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  }
  return d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

// ========== HELPER: FORMAT RUPIAH ==========
export function formatRupiah(angka) {
  if (!angka || angka === 0) return "Rp 0";
  return "Rp " + angka.toLocaleString("id-ID");
}

// ========== HELPER: GET LABEL ==========
export function getLabelKategoriVendor(kategoriList, id) {
  return kategoriList.find((k) => k.id === id)?.label || id;
}
export function getLabelTujuan(tujuanList, id) {
  return tujuanList.find((t) => t.id === id)?.label || id;
}
export function getLabelMetode(id) {
  return METODE_KUNJUNGAN.find((m) => m.id === id)?.label || id;
}
// Daftar hasil bisa dikelola user, jadi helper menerima daftar yang dipakai.
// Kalau daftar tidak dikirim, pakai default (dipakai komponen lain seperti
// Laporan/Evaluasi yang cuma butuh label).
export function getLabelHasil(id, daftar = HASIL_KUNJUNGAN) {
  return (daftar || HASIL_KUNJUNGAN).find((h) => h.id === id)?.label || id;
}
export function getWarnaHasil(id, daftar = HASIL_KUNJUNGAN) {
  return (daftar || HASIL_KUNJUNGAN).find((h) => h.id === id)?.warna || "gray";
}

// ========== HELPER: STATUS & PROGRESS LOG KUNJUNGAN ==========
// Log lama cuma punya `hasil`. Nilainya dipetakan ke status/progress waktu
// dibaca, jadi data lama tetap tampil benar tanpa menulis ulang dokumen.
const HASIL_KE_STATUS = { layak: "layak", tidak_layak: "tidak_layak" };
const HASIL_KE_PROGRESS = { on_track: "on_track", delay: "delay", selesai: "selesai" };

export function getStatusKunjungan(log = {}) {
  const status = log?.status;
  if (STATUS_KUNJUNGAN.some((s) => s.id === status)) return status;
  const dariHasil = HASIL_KE_STATUS[log?.hasil];
  if (dariHasil) return dariHasil;
  if (HASIL_KE_PROGRESS[log?.hasil]) return "belum_diketahui";
  return "belum_diketahui";
}

export function getProgressKunjungan(log = {}) {
  const progress = log?.progress;
  if (PROGRESS_KUNJUNGAN.some((p) => p.id === progress)) return progress;
  return HASIL_KE_PROGRESS[log?.hasil] || "";
}

export function getLabelStatusKunjungan(id) {
  return STATUS_KUNJUNGAN.find((s) => s.id === id)?.label || id || "";
}
export function getWarnaStatusKunjungan(id) {
  return STATUS_KUNJUNGAN.find((s) => s.id === id)?.warna || "gray";
}
export function getLabelProgressKunjungan(id) {
  return PROGRESS_KUNJUNGAN.find((p) => p.id === id)?.label || "";
}
export function getWarnaProgressKunjungan(id) {
  return PROGRESS_KUNJUNGAN.find((p) => p.id === id)?.warna || "gray";
}

// Warna badge yang boleh dipilih saat mengelola hasil kunjungan.
export const WARNA_HASIL = [
  { id: "green", label: "Hijau" },
  { id: "red", label: "Merah" },
  { id: "blue", label: "Biru" },
  { id: "orange", label: "Oranye" },
  { id: "purple", label: "Ungu" },
  { id: "teal", label: "Teal" },
  { id: "gray", label: "Abu-abu" },
];
export function getLabelStatus(id) {
  if (id === STATUS_BELUM.id) return STATUS_BELUM.label;
  return STATUS_VENDOR.find((s) => s.id === id)?.label || STATUS_BELUM.label;
}
export function getWarnaStatus(id) {
  if (id === STATUS_BELUM.id) return STATUS_BELUM.warna;
  return STATUS_VENDOR.find((s) => s.id === id)?.warna || "gray";
}

// ========== HELPER: STATISTIK VENDOR ==========
export function getTotalKunjungan(vendor) {
  return (vendor.logKunjungan || []).length;
}
export function getKunjunganTerakhir(vendor) {
  const log = vendor?.logKunjungan || [];
  if (log.length === 0) return null;
  // Log lama bisa belum punya `tanggal`; jangan sampai bikin halaman crash.
  return log
    .slice()
    .sort((a, b) => String(b?.tanggal || b?.createdAt || "").localeCompare(String(a?.tanggal || a?.createdAt || "")))[0];
}

// ========== HELPER: BADGE CLASS ==========
export function getBadgeClass(warna) {
  const map = {
    red: "bg-red-100 text-red-700 border-red-300",
    yellow: "bg-yellow-100 text-yellow-700 border-yellow-300",
    blue: "bg-blue-100 text-blue-700 border-blue-300",
    gray: "bg-gray-100 text-gray-700 border-gray-300",
    orange: "bg-orange-100 text-orange-700 border-orange-300",
    purple: "bg-purple-100 text-purple-700 border-purple-300",
    green: "bg-green-100 text-green-700 border-green-300",
    pink: "bg-pink-100 text-pink-700 border-pink-300",
    teal: "bg-teal-100 text-teal-700 border-teal-300",
    indigo: "bg-indigo-100 text-indigo-700 border-indigo-300",
  };
  return map[warna] || map.gray;
}

// ========== MIGRASI STATUS VENDOR ==========
export function migrasiStatusVendorLama(vendorList) {
  if (!Array.isArray(vendorList)) return vendorList;
  let changed = false;
  const mapped = {
    recommended: "gold",
    netral: "silver",
    blacklist: "blacklist",
    gold: "gold",
    silver: "silver",
    bronze: "bronze",
    // "Belum Digunakan" dari reminder Telegram = belum punya status,
    // bukan status mentah yang bikin badge nampilin id.
    belum_digunakan: "belum",
  };
  const newList = vendorList.map((v) => {
    const oldStatus = v.status;
    const newStatus = mapped[oldStatus];
    if (newStatus && newStatus !== oldStatus) {
      changed = true;
      return { ...v, status: newStatus, updatedAt: new Date().toISOString() };
    }
    return v;
  });
  return changed ? newList : vendorList;
}

export function migrasiStatusVendorPekerjaan(pekerjaan) {
  if (!Array.isArray(pekerjaan)) return pekerjaan;
  let changed = false;
  const newPekerjaan = pekerjaan.map((pt) => ({
    ...pt,
    brands: (pt.brands || []).map((brand) => {
      if (!brand.vendorList || brand.vendorList.length === 0) return brand;
      const migrated = migrasiStatusVendorLama(brand.vendorList);
      if (migrated !== brand.vendorList) {
        changed = true;
        return { ...brand, vendorList: migrated, updatedAt: new Date().toISOString() };
      }
      return brand;
    }),
  }));
  return changed ? newPekerjaan : pekerjaan;
}

export function migrasiStatusVendorBisnis(brands) {
  if (!Array.isArray(brands)) return brands;
  let changed = false;
  const newBrands = brands.map((brand) => {
    if (!brand.vendorList || brand.vendorList.length === 0) return brand;
    const migrated = migrasiStatusVendorLama(brand.vendorList);
    if (migrated !== brand.vendorList) {
      changed = true;
      return { ...brand, vendorList: migrated, updatedAt: new Date().toISOString() };
    }
    return brand;
  });
  return changed ? newBrands : brands;
}