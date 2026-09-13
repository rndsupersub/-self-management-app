// lib/bedahBukuData.js

// ========== KATEGORI ==========
export const DEFAULT_KATEGORI = [
  { id: "belajar", nama: "📘 Buku Belajar" },
  { id: "santai", nama: "📖 Buku Santai" },
];

// ========== TEMPLATE BUKU PDMA ==========
export const DEFAULT_BUKU_PDMA = {
  id: "pdma",
  kategoriId: "belajar",
  judul: "Product Development and Management Body of Knowledge",
  penulis: "PDMA",
  edisi: "2nd Edition (2020)",
  totalHalaman: 296,
  halamanMulai: 5,
  targetPerHari: 10,
  tanggalMulai: "2026-09-13",
  bab: [
    { id: "bab1", nama: "Strategy", halamanAwal: 5, halamanAkhir: 48 },
    {
      id: "bab2",
      nama: "Portfolio Management",
      halamanAwal: 53,
      halamanAkhir: 80,
    },
    {
      id: "bab3",
      nama: "Product Innovation Process",
      halamanAwal: 81,
      halamanAkhir: 117,
    },
    {
      id: "bab4",
      nama: "Product Design and Development Tools",
      halamanAwal: 121,
      halamanAkhir: 159,
    },
    {
      id: "bab5",
      nama: "Market Research in Product Innovation",
      halamanAwal: 163,
      halamanAkhir: 198,
    },
    {
      id: "bab6",
      nama: "Culture, Teams, and Leadership",
      halamanAwal: 199,
      halamanAkhir: 230,
    },
    {
      id: "bab7",
      nama: "Product Innovation Management",
      halamanAwal: 233,
      halamanAkhir: 296,
    },
  ],
  halamanSelesai: [],
  progressHarian: {},
  mingguan: [],
  kesimpulan: null,
  createdAt: new Date().toISOString(),
};

// ========== TEMPLATE BEDAH BUKU DEFAULT ==========
export const DEFAULT_BEDAH_BUKU = {
  kategori: DEFAULT_KATEGORI,
  buku: [DEFAULT_BUKU_PDMA],
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

// ========== HELPER: TAMBAH HARI ==========
export function tambahHari(dateStr, jumlah) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + jumlah);
  return d.toISOString().split("T")[0];
}

// ========== HELPER: RANGE HALAMAN ==========
// Input: 5, 14 → Output: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
export function getHalamanRange(mulai, akhir) {
  const result = [];
  for (let i = mulai; i <= akhir; i++) result.push(i);
  return result;
}

// ========== HELPER: TOTAL HALAMAN BUKU ==========
export function getTotalHalamanBuku(buku) {
  return buku.totalHalaman - (buku.halamanMulai || 1) + 1;
}

// ========== HELPER: PROGRESS BUKU (%) ==========
export function getProgressBuku(buku) {
  const total = getTotalHalamanBuku(buku);
  const selesai = buku.halamanSelesai?.length || 0;
  return Math.min(100, Math.round((selesai / total) * 100));
}

// ========== HELPER: SISA HALAMAN ==========
export function getSisaHalaman(buku) {
  const total = getTotalHalamanBuku(buku);
  const selesai = buku.halamanSelesai?.length || 0;
  return Math.max(0, total - selesai);
}

// ========== HELPER: ESTIMASI SELESAI ==========
// Otomatis molor kalau target per hari diubah
export function getEstimasiSelesai(buku) {
  const sisa = getSisaHalaman(buku);
  const target = buku.targetPerHari || 10;
  if (target <= 0 || sisa <= 0) return null;
  const hariLagi = Math.ceil(sisa / target);
  return tambahHari(new Date().toISOString().split("T")[0], hariLagi);
}

// ========== HELPER: PROGRESS BAB (%) ==========
export function getProgressBab(buku, babId) {
  const bab = buku.bab?.find((b) => b.id === babId);
  if (!bab) return 0;
  const totalHalamanBab = bab.halamanAkhir - bab.halamanAwal + 1;
  const selesai = (buku.halamanSelesai || []).filter(
    (h) => h >= bab.halamanAwal && h <= bab.halamanAkhir
  ).length;
  return Math.min(100, Math.round((selesai / totalHalamanBab) * 100));
}

// ========== HELPER: CEK BAB SELESAI ==========
export function cekBabSelesai(buku, babId) {
  return getProgressBab(buku, babId) >= 100;
}

// ========== HELPER: CEK BUKU SELESAI ==========
export function cekBukuSelesai(buku) {
  return getProgressBuku(buku) >= 100;
}

// ========== HELPER: GET BAB BY HALAMAN ==========
export function getBabByHalaman(buku, halaman) {
  return (
    buku.bab?.find(
      (b) => halaman >= b.halamanAwal && halaman <= b.halamanAkhir
    ) || null
  );
}

// ========== HELPER: HARI KE BERAPA ==========
export function getHariKe(buku) {
  if (!buku.tanggalMulai) return 1;
  const mulai = new Date(buku.tanggalMulai);
  const now = new Date();
  const diff = Math.floor((now - mulai) / (1000 * 60 * 60 * 24));
  return diff + 1;
}

// ========== HELPER: STREAK BACA ==========
// Berapa hari berturut-turut baca sampai hari ini
export function getStreak(buku) {
  const progressHarian = buku.progressHarian || {};
  const today = new Date().toISOString().split("T")[0];

  let streak = 0;
  let current = today;

  // Kalau hari ini belum diisi, mulai dari kemarin
  if (!progressHarian[current]) {
    current = tambahHari(current, -1);
  }

  while (progressHarian[current]) {
    streak++;
    current = tambahHari(current, -1);
  }
  return streak;
}

// ========== HELPER: HARI YANG BELUM DIISI ==========
export function getHariBelumDiisi(buku, maxHari = 14) {
  const progressHarian = buku.progressHarian || {};
  const result = [];
  const today = new Date().toISOString().split("T")[0];

  for (let i = 0; i < maxHari; i++) {
    const tgl = tambahHari(today, -i);
    if (tgl < buku.tanggalMulai) break;
    if (!progressHarian[tgl]) result.push(tgl);
  }
  return result.reverse();
}

// ========== HELPER: CEK APAKAH BISA BACA HARI INI ==========
export function bisaBacaHariIni(buku) {
  const today = new Date().toISOString().split("T")[0];
  const progressHarian = buku.progressHarian || {};
  return !progressHarian[today];
}

// ========== HELPER: CARI HALAMAN BERIKUTNYA ==========
// Halaman terkecil yang belum dibaca
export function getHalamanBerikutnya(buku) {
  const selesai = buku.halamanSelesai || [];
  const mulai = buku.halamanMulai || 1;
  const akhir = buku.totalHalaman;

  for (let i = mulai; i <= akhir; i++) {
    if (!selesai.includes(i)) return i;
  }
  return null; // semua udah dibaca
}

// ========== HELPER: VALIDASI RANGE ==========
// Cek apakah range valid (harus urut, mulai dari halaman berikutnya)
export function validasiRange(buku, mulai, akhir) {
  const halamanBerikutnya = getHalamanBerikutnya(buku);
  if (halamanBerikutnya === null) {
    return { valid: false, pesan: "Buku udah selesai 100%." };
  }
  if (mulai !== halamanBerikutnya) {
    return {
      valid: false,
      pesan: `Halaman harus mulai dari ${halamanBerikutnya} (halaman berikutnya yang belum dibaca).`,
    };
  }
  if (akhir < mulai) {
    return { valid: false, pesan: "Halaman akhir harus lebih besar dari halaman mulai." };
  }
  if (akhir > buku.totalHalaman) {
    return {
      valid: false,
      pesan: `Halaman akhir maksimal ${buku.totalHalaman}.`,
    };
  }
  return { valid: true, pesan: "OK" };
}

// ========== HELPER: PESAN HARIAN ==========
export function getPesanHarian(buku) {
  const progress = getProgressBuku(buku);
  const streak = getStreak(buku);
  const sisa = getSisaHalaman(buku);
  const estimasi = getEstimasiSelesai(buku);
  const belumHariIni = bisaBacaHariIni(buku);

  if (progress >= 100) {
    return {
      tipe: "selesai",
      pesan: `🎉 Selamat! Buku "${buku.judul}" udah selesai 100%!`,
    };
  }

  if (belumHariIni) {
    return {
      tipe: "warning",
      pesan: `📖 Hari ini belum baca! Target: ${buku.targetPerHari} halaman. Streak: ${streak} hari. Sisa: ${sisa} halaman.`,
    };
  }

  return {
    tipe: "sukses",
    pesan: `✅ Hari ini udah baca! Streak: ${streak} hari. Sisa: ${sisa} halaman (estimasi selesai: ${estimasi}).`,
  };
}