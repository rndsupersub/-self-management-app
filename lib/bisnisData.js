// lib/bisnisData.js
// Data default + helper buat fitur Bisnis.
// Struktur: Bisnis → Brand → Kegiatan (tanpa PT).

// ========== REUSE DARI PEKERJAAN ==========
// Biar konsisten, kita reuse default dari pekerjaanData.js.

export {
  DEFAULT_PRIORITAS as DEFAULT_BISNIS_PRIORITAS,
  DEFAULT_SUMBER as DEFAULT_BISNIS_SUMBER,
  DEFAULT_SECTIONS as DEFAULT_BISNIS_SECTIONS,
  DEFAULT_KATEGORI_KEGIATAN as DEFAULT_BISNIS_KATEGORI,
  WARNA_OPTIONS as BISNIS_WARNA_OPTIONS,
  getKategoriStyle as getBisnisKategoriStyle,
  hexToRgba as bisnisHexToRgba,
} from "./pekerjaanData";

// Vendor Bisnis punya daftar sendiri. Dulu cuma re-export dari vendorData,
// jadi Bisnis nampilin kategori & pertanyaan milik Pekerjaan.
export { SATUAN_MOQ as DEFAULT_BISNIS_VENDOR_SATUAN_MOQ } from "./vendorData";

export const DEFAULT_BISNIS_VENDOR_KATEGORI = [
  { id: "supplier_bahan", label: "🧱 Supplier Bahan" },
  { id: "produksi", label: "🏭 Jasa Produksi / Maklon" },
  { id: "packing", label: "📦 Packing & Kemasan" },
  { id: "distributor", label: "🚚 Distributor / Reseller" },
  { id: "logistik", label: "📮 Ekspedisi / Logistik" },
  { id: "digital", label: "💻 Jasa Digital / Freelance" },
  { id: "lainnya_bisnis", label: "📝 Lainnya" },
];

export const DEFAULT_BISNIS_VENDOR_PERTANYAAN = [
  { id: "bq_tempo", pertanyaan: "Vendor bisa kasih tempo / konsinyasi pembayaran?", tipe: "checkbox" },
  { id: "bq_custom", pertanyaan: "Vendor bisa custom kemasan / label brand?", tipe: "checkbox" },
  { id: "bq_rutin", pertanyaan: "Vendor bisa kirim rutin sesuai jadwal produksi?", tipe: "checkbox" },
  { id: "bq_moq", pertanyaan: "MOQ vendor masih masuk skala bisnis kecil?", tipe: "checkbox" },
  { id: "bq_reseller", pertanyaan: "Vendor bisa suplai buat harga reseller?", tipe: "checkbox" },
  { id: "bq_garansi", pertanyaan: "Ada garansi / ganti rugi kalau barang cacat?", tipe: "checkbox" },
];

export const DEFAULT_BISNIS_VENDOR_TUJUAN = [
  { id: "bq_scanning", label: "🔍 Cari Vendor Baru" },
  { id: "bq_negosiasi", label: "💰 Negosiasi Harga / MOQ" },
  { id: "bq_sample", label: "🧪 Ambil Sample Produk" },
  { id: "bq_kontrol", label: "⏱️ Kontrol Pengiriman" },
  { id: "bq_serah_terima", label: "📦 Serah Terima Barang" },
  { id: "bq_evaluasi", label: "📊 Evaluasi Kerjasama" },
];

export {
  DEFAULT_FIELD_EVALUASI as DEFAULT_BISNIS_FIELD_EVALUASI,
  DEFAULT_FIELD_EVALUASI_VENDOR as DEFAULT_BISNIS_FIELD_EVALUASI_VENDOR,
  DEFAULT_PERIODE_EVALUASI as DEFAULT_BISNIS_PERIODE_EVALUASI,
} from "./evaluasiData";

// ========== TEMPLATE BRAND DEFAULT ==========

export const DEFAULT_BISNIS_BRANDS = [
  {
    id: "level-up",
    nama: "Level Up",
    kegiatan: [],
    vendorList: [],
    laporanData: {},
    evaluasiData: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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

// ========== HELPER: CARI BRAND ==========

export function findBisnisBrand(brands, brandId) {
  return brands.find((b) => b.id === brandId) || null;
}

// ========== HELPER: CARI KEGIATAN ==========

export function findBisnisKegiatan(brands, brandId, kegId) {
  const brand = findBisnisBrand(brands, brandId);
  if (!brand) return null;
  return brand.kegiatan?.find((k) => k.id === kegId) || null;
}

// ========== HELPER: MIGRASI BISNIS LAMA ==========
// Data lama disimpan di field "bisnisKegiatan" (object per tanggal).
// Migrasi ini pindahin semua kegiatan lama ke brand "Level Up".
//
// Return: { brands: [...], migrated: true/false }

export function migrasiBisnisLama(bisnisKegiatanLama, brandsSekarang) {
  // Kalau nggak ada data lama, nggak usah migrasi
  if (
    !bisnisKegiatanLama ||
    typeof bisnisKegiatanLama !== "object" ||
    Array.isArray(bisnisKegiatanLama)
  ) {
    return { brands: brandsSekarang, migrated: false };
  }

  const tanggalKeys = Object.keys(bisnisKegiatanLama);
  if (tanggalKeys.length === 0) {
    return { brands: brandsSekarang, migrated: false };
  }

  // Kalau brandsSekarang udah ada brand dengan kegiatan, skip migrasi
  const adaKegiatanLama = brandsSekarang?.some(
    (b) => (b.kegiatan || []).length > 0
  );
  if (adaKegiatanLama) {
    return { brands: brandsSekarang, migrated: false };
  }

  // Konversi format lama ke format baru
  // Format lama: { "2026-09-13": [{ id, judul, status, catatan }, ...] }
  // Format baru: array kegiatan di dalam brand.kegiatan
  const kegiatanBaru = [];
  tanggalKeys.forEach((tanggal) => {
    const listKegiatan = bisnisKegiatanLama[tanggal] || [];
    listKegiatan.forEach((keg) => {
      kegiatanBaru.push({
        id: keg.id || generateId("keg"),
        judul: keg.judul || "Tanpa judul",
        kategori: "lainnya",
        prioritas: "utama",
        sumber: "gua",
        catatan: keg.catatan || "",
        tanggalMulai: tanggal,
        tanggalSelesai: tanggal,
        tanggal: tanggal,
        status: keg.status === "selesai" ? "selesai" : "belum",
        sections: {
          analisis: [],
          desain: [],
          vendor: [],
          lainnya: [],
        },
        createdAt: keg.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });
  });

  // Cari brand "Level Up" atau bikin baru
  const levelUpIndex = brandsSekarang.findIndex((b) => b.id === "level-up");
  let brandsBaru;

  if (levelUpIndex >= 0) {
    brandsBaru = brandsSekarang.map((b, i) =>
      i === levelUpIndex
        ? {
            ...b,
            kegiatan: [...(b.kegiatan || []), ...kegiatanBaru],
            updatedAt: new Date().toISOString(),
          }
        : b
    );
  } else {
    brandsBaru = [
      ...brandsSekarang,
      {
        id: "level-up",
        nama: "Level Up",
        kegiatan: kegiatanBaru,
        vendorList: [],
        laporanData: {},
        evaluasiData: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  return { brands: brandsBaru, migrated: true };
}

// ========== HELPER: TEMPLATE SETTINGS DEFAULT ==========
// Dipakai pas pertama kali bikin user atau pas load dari Firestore.

export const DEFAULT_BISNIS_SETTINGS = {
  bisnisBrands: DEFAULT_BISNIS_BRANDS,
};