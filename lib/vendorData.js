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

// ========== HASIL KUNJUNGAN ==========
export const HASIL_KUNJUNGAN = [
  { id: "layak", label: "✅ Layak", warna: "green" },
  { id: "tidak_layak", label: "❌ Tidak Layak", warna: "red" },
  { id: "on_track", label: "⏳ On Track", warna: "blue" },
  { id: "delay", label: "⚠️ Delay", warna: "orange" },
  { id: "selesai", label: "🎉 Selesai", warna: "purple" },
];

// ========== STATUS VENDOR ==========
export const STATUS_VENDOR = [
  { id: "recommended", label: "🟢 Recommended", warna: "green" },
  { id: "netral", label: "🟡 Netral", warna: "yellow" },
  { id: "blacklist", label: "🔴 Blacklist", warna: "red" },
];

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
// Dari poin A, C, D, E, G — sesuai obrolan
export const DEFAULT_PERTANYAAN_VENDOR = [
  {
    id: "q_negosiasi",
    pertanyaan: "Vendor bisa handle negosiasi harga?",
    tipe: "checkbox",
  },
  {
    id: "q_audit",
    pertanyaan: "Vendor bisa audit kapasitas produksi?",
    tipe: "checkbox",
  },
  {
    id: "q_trial",
    pertanyaan: "Vendor bisa trial order / sample?",
    tipe: "checkbox",
  },
  {
    id: "q_rapat",
    pertanyaan: "Vendor bisa rapat rutin / koordinasi?",
    tipe: "checkbox",
  },
  {
    id: "q_evaluasi",
    pertanyaan: "Vendor bisa evaluasi performa berkala?",
    tipe: "checkbox",
  },
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
  pertanyaanVendor: DEFAULT_PERTANYAAN_VENDOR,
  vendor: [], // list vendor (kosong di awal)
};

// ========== HELPER: GENERATE ID ==========
export function generateId(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

// ========== HELPER: FORMAT TANGGAL ==========
export function formatTanggal(dateStr, opsi = "panjang") {
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

export function getLabelHasil(id) {
  return HASIL_KUNJUNGAN.find((h) => h.id === id)?.label || id;
}

export function getWarnaHasil(id) {
  return HASIL_KUNJUNGAN.find((h) => h.id === id)?.warna || "gray";
}

export function getLabelStatus(id) {
  return STATUS_VENDOR.find((s) => s.id === id)?.label || id;
}

export function getWarnaStatus(id) {
  return STATUS_VENDOR.find((s) => s.id === id)?.warna || "gray";
}

// ========== HELPER: STATISTIK VENDOR ==========
export function getTotalKunjungan(vendor) {
  return (vendor.logKunjungan || []).length;
}

export function getKunjunganTerakhir(vendor) {
  const log = vendor.logKunjungan || [];
  if (log.length === 0) return null;
  return log
    .slice()
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal))[0];
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