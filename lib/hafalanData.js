// lib/hafalanData.js
// Data default + helper buat fitur Hafalan Qur'an.
// Struktur: Membaca (harian) + Murajaah (mingguan) + Talaqy (milestone).

import { DEFAULT_ACTIVITIES } from "./defaultData";

// ========== TARGET HARIAN DEFAULT ==========

export const DEFAULT_TARGET_HARIAN = 5; // 5 halaman/hari

// ========== MILESTONE ==========

export const DEFAULT_MILESTONE = [
  { id: "milestone_1_4", label: "1/4 Juz", persen: 25 },
  { id: "milestone_1_2", label: "1/2 Juz", persen: 50 },
  { id: "milestone_1", label: "1 Juz", persen: 100 },
];

// ========== JENIS KESALAHAN ==========

export const DEFAULT_JENIS_KESALAHAN = [
  { id: "harakaat", label: "Harakaat" },
  { id: "lupaAyat", label: "Lupa Ayat" },
  { id: "tajwid", label: "Tajwid" },
  { id: "makhraj", label: "Makhraj" },
  { id: "waqaf", label: "Waqaf" },
  { id: "lainnya", label: "Lainnya" },
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

// ========== HELPER: AMBIL DAFTAR SURAT DI JUZ ==========

export function getSuratListByJuz(juzId) {
  // Cari dari DEFAULT_ACTIVITIES
  const hafalanActivity = DEFAULT_ACTIVITIES.find((a) => a.id === "hafalan");
  if (!hafalanActivity) return [];
  const juz = hafalanActivity.children?.find((j) => j.id === juzId);
  if (!juz) return [];
  return juz.children || [];
}

// ========== HELPER: HITUNG TOTAL HALAMAN JUZ ==========

export function hitungTotalHalamanJuz(juzId, suratList = null) {
  // Asumsi: 1 juz = 20 halaman (mushaf standar Indonesia)
  // Bisa juga dihitung dari jumlah ayat, tapi sementara fix 20.
  return 20;
}

// ========== HELPER: AUTO-SARAN HALAMAN BERIKUTNYA ==========

export function hitungHalamanBerikutnya(halamanTerakhir) {
  // Saran default: halaman terakhir + target harian
  const mulai = (halamanTerakhir || 0) + 1;
  const selesai = mulai + DEFAULT_TARGET_HARIAN - 1;
  return { mulai, selesai };
}

// ========== HELPER: CEK MILESTONE ==========

export function getMilestoneStatus(juzId, halamanSelesai) {
  const totalHalaman = hitungTotalHalamanJuz(juzId);
  const persen = Math.round((halamanSelesai / totalHalaman) * 100);
  const milestones = DEFAULT_MILESTONE.map((m) => ({
    ...m,
    tercapai: persen >= m.persen,
  }));
  return { persen, milestones };
}

// ========== HELPER: TOTAL KESALAHAN ==========

export function getTotalKesalahan(kesalahanObj) {
  if (!kesalahanObj || typeof kesalahanObj !== "object") return 0;
  return Object.values(kesalahanObj).reduce(
    (sum, val) => sum + (parseInt(val) || 0),
    0
  );
}

// ========== HELPER: FORMAT KESALAHAN ==========

export function formatKesalahan(kesalahanObj) {
  if (!kesalahanObj) return "-";
  const parts = [];
  DEFAULT_JENIS_KESALAHAN.forEach((jk) => {
    const val = kesalahanObj[jk.id] || 0;
    if (val > 0) {
      parts.push(`${jk.label}: ${val}x`);
    }
  });
  return parts.length > 0 ? parts.join(", ") : "-";
}

// ========== HELPER: MIGRASI DATA LAMA ==========

export function migrasiHafalanLama(dailyProgress, hafalanDataSekarang) {
  // Kalau nggak ada data lama, skip
  if (
    !dailyProgress ||
    typeof dailyProgress !== "object" ||
    Array.isArray(dailyProgress)
  ) {
    return { membaca: {}, murajaah: {}, migrated: false };
  }

  const membacaBaru = { ...(hafalanDataSekarang?.membaca || {}) };
  const murajaahBaru = { ...(hafalanDataSekarang?.murajaah || {}) };
  let migrated = false;

  Object.keys(dailyProgress).forEach((tanggal) => {
    const dayData = dailyProgress[tanggal];
    if (!dayData) return;

    // Ambil data lama dari field "hafalan"
    const hafalanLama = dayData.hafalan;
    if (hafalanLama?.murajaahHarian?.lembar) {
      if (!murajaahBaru[tanggal]) {
        murajaahBaru[tanggal] = {
          halamanMulai: 0,
          halamanSelesai: 0,
          catatan: "",
          voiceNoteUrl: "",
          kesalahan: {},
          dariMigrasi: true,
        };
      }
      migrated = true;
    }
  });

  return { membaca: membacaBaru, murajaah: murajaahBaru, migrated };
}

// ========== HELPER: HITUNG PROGRESS JUZ ==========

export function hitungProgressJuz(hafalanMembaca, juzId) {
  // Hitung berapa halaman yang udah selesai di juz tertentu
  if (!hafalanMembaca) return 0;
  let totalHalamanSelesai = 0;

  Object.values(hafalanMembaca).forEach((entry) => {
    if (entry.juzId === juzId && entry.sudah) {
      const jml = (entry.halamanSelesai || 0) - (entry.halamanMulai || 0) + 1;
      totalHalamanSelesai += jml > 0 ? jml : 0;
    }
  });

  return totalHalamanSelesai;
}

// ========== HELPER: HITUNG PROGRESS SEMUA JUZ ==========

export function hitungProgressSemuaJuz(hafalanMembaca) {
  if (!hafalanMembaca) return {};
  const progress = {};

  Object.values(hafalanMembaca).forEach((entry) => {
    if (!entry.juzId) return;
    if (!progress[entry.juzId]) progress[entry.juzId] = 0;
    if (entry.sudah) {
      const jml = (entry.halamanSelesai || 0) - (entry.halamanMulai || 0) + 1;
      progress[entry.juzId] += jml > 0 ? jml : 0;
    }
  });

  return progress;
}