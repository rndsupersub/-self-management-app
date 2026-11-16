// lib/laporanData.js

import { formatTanggalLokal, getTanggalHariIniLokal, parseTanggalLokal } from "./tanggalLokal.js";

// ========== HELPER: TANGGAL HARI INI ==========
export function getTanggalHariIni() {
  return getTanggalHariIniLokal();
}

// ========== HELPER: FORMAT TANGGAL PANJANG ==========
export function formatTanggalPanjang(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ========== HELPER: FORMAT TANGGAL PENDEK ==========
export function formatTanggalPendek(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ========== HELPER: TAMBAH HARI ==========
export function tambahHari(dateStr, jumlah) {
  const d = parseTanggalLokal(dateStr);
  if (!d) return "";
  d.setDate(d.getDate() + jumlah);
  return formatTanggalLokal(d);
}

// ========== HELPER: GET MINGGU RANGE ==========
// Return: { mingguKe (ISO week), tanggalMulai (Senin), tanggalSelesai (Minggu), label }
export function getMingguRange(dateStr) {
  const date = parseTanggalLokal(dateStr);
  if (!date) {
    return { mingguKe: 0, tahun: 0, tanggalMulai: "", tanggalSelesai: "", label: "-" };
  }
  const day = date.getDay(); // 0 = Minggu, 1 = Senin

  // Cari Senin minggu ini
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const senin = new Date(date.setDate(diff));
  senin.setHours(0, 0, 0, 0);
  const minggu = new Date(senin);
  minggu.setDate(senin.getDate() + 6);

  const tanggalMulai = formatTanggalLokal(senin);
  const tanggalSelesai = formatTanggalLokal(minggu);

  // ISO week number
  const target = new Date(senin.valueOf());
  const dayNr = (senin.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  const mingguKe = 1 + Math.ceil((firstThursday - target) / 604800000);

  return {
    mingguKe,
    tahun: senin.getFullYear(),
    tanggalMulai,
    tanggalSelesai,
    label: `Minggu ${mingguKe} (${formatTanggalPendek(tanggalMulai)} – ${formatTanggalPendek(tanggalSelesai)})`,
  };
}

// ========== HELPER: GET BULAN RANGE ==========
// Return: { bulan, tahun, namaBulan, tanggalMulai, tanggalSelesai, label }
export function getBulanRange(dateStr) {
  let date = parseTanggalLokal(dateStr);
  if (!date) date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth();

  const tanggalMulai = formatTanggalLokal(new Date(year, month, 1));
  const tanggalSelesai = formatTanggalLokal(new Date(year, month + 1, 0));

  const namaBulan = new Date(year, month, 1).toLocaleDateString("id-ID", {
    month: "long",
  });

  return {
    bulan: month + 1,
    tahun: year,
    namaBulan,
    tanggalMulai,
    tanggalSelesai,
    label: `${namaBulan} ${year}`,
  };
}

// ========== HELPER: NORMALISASI DATA LAPORAN ==========
// Data lama (web single-object atau Telegram format `konten`) dimigrasikan
// ke skema sekarang: { reports:[{ id, judul, fields, gdriveUrl }] }.
// Weekly juga dipindah ke key hari Senin biar kebaca web.

function reportDariDataLama(entry) {
  if (entry?.fields) {
    return {
      id: entry.id || `rep_migrasi_${entry.tanggal || entry.tanggalMulai || "lama"}`,
      judul: entry.judul || "Laporan",
      fields: entry.fields,
      gdriveUrl: entry.gdriveUrl || "",
    };
  }
  if (typeof entry?.konten === "string" && entry.konten.trim()) {
    return {
      id: entry.id || `rep_migrasi_${entry.tanggal || entry.tanggalMulai || "lama"}`,
      judul: entry.judul || "Laporan",
      fields: { ringkasan: entry.konten, kendala: "", solusi: "" },
      gdriveUrl: entry.gdriveUrl || "",
    };
  }
  return null;
}

export function normalizeLaporanData(laporanData) {
  if (!laporanData || typeof laporanData !== "object") return {};

  const hasil = { ...laporanData };

  ["harian", "mingguan", "bulanan"].forEach((tipe) => {
    const sumber = laporanData[tipe];
    if (!sumber || typeof sumber !== "object") return;

    const target = {};
    Object.entries(sumber).forEach(([key, entry]) => {
      if (!entry || typeof entry !== "object") return;

      let kunci = key;
      let item = { ...entry };

      if (tipe === "mingguan") {
        const basis = entry.tanggalMulai || entry.tanggal || key;
        if (basis) {
          const range = getMingguRange(basis);
          kunci = range.tanggalMulai;
          item = {
            ...range,
            ...item,
            tanggalMulai: range.tanggalMulai,
            tanggalSelesai: range.tanggalSelesai,
            mingguKe: range.mingguKe,
            tahun: range.tahun,
          };
        }
      } else if (tipe === "bulanan") {
        const basis =
          entry.tanggal ||
          (entry.tahun && entry.bulan
            ? `${entry.tahun}-${String(entry.bulan).padStart(2, "0")}-01`
            : key);
        const range = getBulanRange(basis);
        kunci = `${range.tahun}-${String(range.bulan).padStart(2, "0")}`;
        item = { ...range, ...item };
      }

      if (!Array.isArray(item.reports)) {
        const legacy = reportDariDataLama(item);
        if (legacy) item.reports = [legacy];
      }

      if (target[kunci]) {
        target[kunci] = {
          ...target[kunci],
          ...item,
          reports: [...(target[kunci].reports || []), ...(item.reports || [])],
          updatedAt: item.updatedAt || target[kunci].updatedAt,
        };
      } else {
        target[kunci] = item;
      }
    });

    hasil[tipe] = target;
  });

  return hasil;
}

// ========== HELPER: GENERATE LAPORAN HARIAN ==========
// Filter kegiatan yang tanggal-nya match tanggal tertentu
export function generateLaporanHarian(kegiatanList, tanggal) {
  return (kegiatanList || []).filter((k) => {
    const mulai = k.tanggalMulai || k.tanggal;
    const selesai = k.tanggalSelesai || k.tanggal || k.tanggalMulai;
    if (!mulai || !selesai) return false;
    return tanggal >= mulai && tanggal <= selesai;
  });
}

// ========== HELPER: GENERATE LAPORAN MINGGUAN ==========
export function generateLaporanMingguan(kegiatanList, tanggalMulai, tanggalSelesai) {
  return (kegiatanList || []).filter((k) => {
    const mulai = k.tanggalMulai || k.tanggal;
    const selesai = k.tanggalSelesai || k.tanggal || k.tanggalMulai;
    if (!mulai || !selesai) return false;
    // Overlap check
    return mulai <= tanggalSelesai && selesai >= tanggalMulai;
  });
}

// ========== HELPER: GENERATE LAPORAN BULANAN ==========
export function generateLaporanBulanan(kegiatanList, tanggalMulai, tanggalSelesai) {
  return generateLaporanMingguan(kegiatanList, tanggalMulai, tanggalSelesai);
}

// ========== HELPER: STATISTIK KEGIATAN ==========
export function hitungStatistikKegiatan(kegiatanList) {
  const total = kegiatanList.length;
  const selesai = kegiatanList.filter((k) => k.status === "selesai").length;
  const belum = total - selesai;
  const persen = total > 0 ? Math.round((selesai / total) * 100) : 0;

  return { total, selesai, belum, persen };
}

// ========== HELPER: AUTO-GENERATE SUMMARY ==========
// Bikin summary otomatis dari list kegiatan
export function autoGenerateSummary(kegiatanList) {
  if (!kegiatanList || kegiatanList.length === 0) {
    return "Tidak ada kegiatan pada periode ini.";
  }

  const stat = hitungStatistikKegiatan(kegiatanList);
  const judulList = kegiatanList
    .slice(0, 5)
    .map((k) => `• ${k.judul}`)
    .join("\n");

  let summary = `📊 Total kegiatan: ${stat.total}\n`;
  summary += `✅ Selesai: ${stat.selesai}\n`;
  summary += `⏳ Belum: ${stat.belum}\n`;
  summary += `📈 Progress: ${stat.persen}%\n\n`;
  summary += `📋 Daftar kegiatan:\n${judulList}`;

  if (kegiatanList.length > 5) {
    summary += `\n... dan ${kegiatanList.length - 5} kegiatan lainnya.`;
  }

  return summary;
}

// ========== HELPER: GENERATE ID ==========
export function generateId(prefix = "laporan") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}