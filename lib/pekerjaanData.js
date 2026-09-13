// lib/pekerjaanData.js

// ========== PRIORITAS ==========
// User bisa tambah/hapus/edit ini nanti
export const DEFAULT_PRIORITAS = [
  { id: "utama", label: "🔥 Utama", warna: "red" },
  { id: "sedang", label: "🔸 Sedang", warna: "yellow" },
  { id: "ide", label: "💡 Ide", warna: "blue" },
  { id: "drop", label: "🚫 Drop", warna: "gray" },
  { id: "ditunda", label: "⏸️ Ditunda", warna: "orange" },
];

// ========== SUMBER IDE ==========
// User bisa tambah/hapus/edit ini nanti
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
// Section yang muncul di halaman detail kegiatan
export const DEFAULT_SECTIONS = [
  { id: "analisis", label: "📊 Analisis" },
  { id: "desain", label: "🎨 Desain" },
  { id: "vendor", label: "🏭 Vendor" },
  { id: "lainnya", label: "📝 Lainnya" },
];

// ========== PT & BRAND (TEMPLATE AWAL) ==========
// Ini template awal buat user baru.
// User bisa tambah PT baru, tambah brand baru, hapus, edit.
export const DEFAULT_PT = [
  {
    id: "elfiqa",
    nama: "PT Elfiqa",
    brands: [
      {
        id: "supersub",
        nama: "Supersub",
        kegiatan: [],
      },
      {
        id: "velqo",
        nama: "Velqo",
        kegiatan: [],
      },
    ],
  },
];

// ========== STRUKTUR KEGIATAN (CONTOH) ==========
// Setiap kegiatan punya struktur kayak gini:
/*
{
  id: "keg_1234567890",
  judul: "Handgrips",
  prioritas: "utama",      // refer ke DEFAULT_PRIORITAS.id
  sumber: "bos",           // refer ke DEFAULT_SUMBER.id
  tanggal: "2026-03-13",   // YYYY-MM-DD
  status: "belum",         // "belum" | "selesai"
  catatan: "Ide dari bos, jadikan utama",
  sections: {
    analisis: [
      { id: "cat_1", teks: "Analisis pasar: ...", createdAt: "..." }
    ],
    desain: [
      { id: "cat_2", teks: "Desain produk: ...", createdAt: "..." }
    ],
    vendor: [
      { id: "cat_3", teks: "Vendor A: spesialis sarung tangan", createdAt: "..." }
    ],
    lainnya: [
      { id: "cat_4", teks: "Catatan bebas: ...", createdAt: "..." }
    ]
  },
  createdAt: "2026-03-13T10:00:00.000Z",
  updatedAt: "2026-03-13T10:00:00.000Z"
}
*/

// ========== HELPER: CARI ITEM BERDASARKAN ID ==========
export function findPT(pts, ptId) {
  return pts.find((pt) => pt.id === ptId) || null;
}

export function findBrand(pts, ptId, brandId) {
  const pt = findPT(pts, ptId);
  if (!pt) return null;
  return pt.brands.find((b) => b.id === brandId) || null;
}

export function findKegiatan(pts, ptId, brandId, kegId) {
  const brand = findBrand(pts, ptId, brandId);
  if (!brand) return null;
  return brand.kegiatan.find((k) => k.id === kegId) || null;
}

// ========== HELPER: GENERATE ID UNIK ==========
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