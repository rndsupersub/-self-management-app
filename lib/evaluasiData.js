// lib/evaluasiData.js

import { formatTanggalLokal, parseTanggalLokal } from "./tanggalLokal.js";

// ========== FIELD EVALUASI KINERJA DEFAULT ==========
// User bisa tambah/hapus/edit ini nanti.
// Setiap field punya: id, label, tipe ("text" | "long" | "score")

export const DEFAULT_FIELD_EVALUASI = [
  { id: "efektivitas", label: "🎯 Efektivitas", tipe: "long" },
  { id: "efisiensi", label: "⚡ Efisiensi", tipe: "long" },
  { id: "kendala", label: "🚧 Kendala", tipe: "long" },
  { id: "solusi", label: "💡 Solusi", tipe: "long" },
  { id: "energi", label: "🔋 Energi (1-10)", tipe: "score" },
  { id: "mood", label: "😊 Mood", tipe: "text" },
  { id: "catatanBebas", label: "📝 Catatan Bebas", tipe: "long" },
];

// ========== FIELD EVALUASI VENDOR DEFAULT ==========
// Field evaluasi vendor, bisa tambah/edit/hapus.

export const DEFAULT_FIELD_EVALUASI_VENDOR = [
  { id: "kualitasProduk", label: "⭐ Kualitas Produk", tipe: "long" },
  { id: "ketepatanWaktu", label: "⏱️ Ketepatan Waktu", tipe: "long" },
  { id: "hargaHpp", label: "💰 Harga / HPP", tipe: "long" },
  { id: "komunikasi", label: "📞 Komunikasi", tipe: "long" },
  { id: "pengiriman", label: "🚚 Pengiriman", tipe: "long" },
  { id: "catatanBebasVendor", label: "📝 Catatan Bebas", tipe: "long" },
];

// ========== PERIODE EVALUASI DEFAULT ==========

export const DEFAULT_PERIODE_EVALUASI = [
  { id: "bulanan", label: "📆 Bulanan", tipe: "bulanan" },
  { id: "triwulan", label: "📅 Triwulan", tipe: "triwulan" },
  { id: "semester", label: "📆 Semester", tipe: "semester" },
  { id: "tahunan", label: "📅 Tahunan", tipe: "tahunan" },
];

// ========== TIPE FIELD ==========

export const TIPE_FIELD = [
  { id: "text", label: "✏️ Pendek (1 baris)" },
  { id: "long", label: "📝 Panjang (textarea)" },
  { id: "score", label: "🔢 Skor (1-10)" },
];

// ========== HELPER: GENERATE ID ==========

export function generateId(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

// ========== HELPER: FORMAT TANGGAL ==========

export function formatTanggalPanjang(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

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

// ========== HELPER: GET PERIODE RANGE ==========
// Return: { key, periodeMulai, periodeSelesai, label }

export function getPeriodeRange(tipe, dateStr, customDef = null) {
  if (!dateStr) return null;
  const date = parseTanggalLokal(dateStr);
  if (!date) return null;

  // ===== BULANAN =====
  if (tipe === "bulanan") {
    const year = date.getFullYear();
    const month = date.getMonth();
    const mulai = formatTanggalLokal(new Date(year, month, 1));
    const selesai = formatTanggalLokal(new Date(year, month + 1, 0));
    const namaBulan = new Date(year, month, 1).toLocaleDateString("id-ID", {
      month: "long",
    });
    return {
      key: `${year}-${String(month + 1).padStart(2, "0")}`,
      periodeMulai: mulai,
      periodeSelesai: selesai,
      label: `${namaBulan} ${year}`,
      tipe: "bulanan",
    };
  }

  // ===== TRIWULAN =====
  if (tipe === "triwulan") {
    const year = date.getFullYear();
    const month = date.getMonth();
    const q = Math.floor(month / 3) + 1;
    const startMonth = (q - 1) * 3;
    const mulai = formatTanggalLokal(new Date(year, startMonth, 1));
    const selesai = formatTanggalLokal(new Date(year, startMonth + 3, 0));
    return {
      key: `${year}-Q${q}`,
      periodeMulai: mulai,
      periodeSelesai: selesai,
      label: `Q${q} ${year}`,
      tipe: "triwulan",
    };
  }

  // ===== SEMESTER =====
  if (tipe === "semester") {
    const year = date.getFullYear();
    const month = date.getMonth();
    const s = month < 6 ? 1 : 2;
    const startMonth = s === 1 ? 0 : 6;
    const mulai = formatTanggalLokal(new Date(year, startMonth, 1));
    const selesai = formatTanggalLokal(new Date(year, startMonth + 6, 0));
    return {
      key: `${year}-S${s}`,
      periodeMulai: mulai,
      periodeSelesai: selesai,
      label: `Semester ${s} ${year}`,
      tipe: "semester",
    };
  }

  // ===== TAHUNAN =====
  if (tipe === "tahunan") {
    const year = date.getFullYear();
    return {
      key: `${year}`,
      periodeMulai: `${year}-01-01`,
      periodeSelesai: `${year}-12-31`,
      label: `Tahun ${year}`,
      tipe: "tahunan",
    };
  }

  // ===== CUSTOM =====
  if (tipe === "custom" && customDef) {
    return {
      key: customDef.id,
      periodeMulai: customDef.customStart,
      periodeSelesai: customDef.customEnd,
      label: customDef.label,
      tipe: "custom",
    };
  }

  return null;
}

// ========== HELPER: NORMALISASI DATA EVALUASI ==========
// Data lama (single object `fields`) dan data Telegram lama (key YYYY-MM
// untuk semua periode) dimigrasikan ke skema web: key range yang benar +
// array `reports`.

function ringkasanDariFields(fields) {
  if (!fields) return "";
  if (fields.ringkasan) return fields.ringkasan;
  const parts = [];
  if (fields.efektivitas) parts.push(`Efektivitas: ${fields.efektivitas}`);
  if (fields.efisiensi) parts.push(`Efisiensi: ${fields.efisiensi}`);
  if (fields.energi) parts.push(`Energi: ${fields.energi}/10`);
  if (fields.mood) parts.push(`Mood: ${fields.mood}`);
  if (fields.catatanBebas) parts.push(fields.catatanBebas);
  return parts.join("\n");
}

export function normalizeEvaluasiData(evaluasiData) {
  if (!evaluasiData || typeof evaluasiData !== "object") return {};

  const hasil = {};
  const tipeValid = ["bulanan", "triwulan", "semester", "tahunan"];

  Object.entries(evaluasiData).forEach(([tipe, entries]) => {
    if (!entries || typeof entries !== "object") return;

    const target = {};
    Object.entries(entries).forEach(([key, entry]) => {
      if (!entry || typeof entry !== "object") return;

      let kunci = key;
      let item = { ...entry };
      const basis =
        entry.periodeMulai ||
        entry.tanggal ||
        (key.length === 10 ? key : key.length === 7 ? `${key}-01` : null);
      const tanggalLaporan = entry.periodeMulai || entry.tanggal || basis || "";

      if (tipeValid.includes(tipe) && basis) {
        const range = getPeriodeRange(tipe, basis);
        if (range) {
          kunci = range.key;
          // Range kanonik menang biar data Telegram lama (yang nyimpen
          // tanggal acuan sebagai periodeMulai) nggak bikin label aneh.
          item = {
            ...item,
            ...range,
            reports: item.reports,
            fields: item.fields,
            updatedAt: item.updatedAt,
          };
        }
      }

      if (!Array.isArray(item.reports) && item.fields) {
        item.reports = [
          {
            tanggal: tanggalLaporan,
            ringkasan: ringkasanDariFields(item.fields),
            kendala: item.fields.kendala || "",
            solusi: item.fields.solusi || "",
            gdriveUrl: item.gdriveUrl || "",
          },
        ];
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

// ========== HELPER: GET MINGGU RANGE ==========
// Return: { mingguKe, tahun, tanggalMulai (Senin), tanggalSelesai
// (Minggu), label }

export function getMingguRange(dateStr) {
  const date = parseTanggalLokal(dateStr);
  if (!date) {
    return { mingguKe: 0, tahun: 0, tanggalMulai: "", tanggalSelesai: "", label: "-" };
  }
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const senin = new Date(date.setDate(diff));
  senin.setHours(0, 0, 0, 0);
  const minggu = new Date(senin);
  minggu.setDate(senin.getDate() + 6);

  const tanggalMulai = formatTanggalLokal(senin);
  const tanggalSelesai = formatTanggalLokal(minggu);

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
    label: `Minggu ${mingguKe} (${formatTanggalPendek(
      tanggalMulai
    )} -- ${formatTanggalPendek(tanggalSelesai)})`,
  };
}

// ========== HELPER: VALIDASI SCORE ==========

export function clampScore(val) {
  const num = parseInt(val);
  if (isNaN(num)) return 0;
  return Math.max(1, Math.min(10, num));
}

// ========== HELPER: AUTO-GENERATE SUMMARY DARI LAPORAN ==========
// Ambil semua laporan (harian, mingguan, bulanan) yang ada di
// periode tertentu, gabungin jadi teks summary.

export function autoGenerateSummaryFromLaporan(
  laporanData,
  periodeMulai,
  periodeSelesai
) {
  if (!laporanData) return "Belum ada laporan di periode ini.";

  const parts = [];

  // ===== LAPORAN HARIAN =====
  const harian = laporanData.harian || {};
  const harianInRange = Object.values(harian).filter(
    (l) => l.tanggal >= periodeMulai && l.tanggal <= periodeSelesai
  );
  if (harianInRange.length > 0) {
    parts.push(`📋 Laporan Harian (${harianInRange.length} entri):`);
    harianInRange
      .slice()
      .sort((a, b) => a.tanggal.localeCompare(b.tanggal))
      .forEach((l) => {
        const isi = (l.konten || "").replace(/\n/g, " ").substring(0, 120);
        parts.push(`  • ${formatTanggalPendek(l.tanggal)}: ${isi}...`);
      });
  }

  // ===== LAPORAN MINGGUAN =====
  const mingguan = laporanData.mingguan || {};
  const mingguanInRange = Object.values(mingguan).filter(
    (l) =>
      l.tanggalMulai >= periodeMulai && l.tanggalSelesai <= periodeSelesai
  );
  if (mingguanInRange.length > 0) {
    parts.push(`\n📅 Laporan Mingguan (${mingguanInRange.length} entri):`);
    mingguanInRange
      .slice()
      .sort((a, b) => a.tanggalMulai.localeCompare(b.tanggalMulai))
      .forEach((l) => {
        const isi = (l.konten || "").replace(/\n/g, " ").substring(0, 150);
        parts.push(`  • Minggu ${l.mingguKe}: ${isi}...`);
      });
  }

  // ===== LAPORAN BULANAN =====
  const bulanan = laporanData.bulanan || {};
  const bulananInRange = Object.values(bulanan).filter((l) => {
    const key = `${l.tahun}-${String(l.bulan).padStart(2, "0")}`;
    return key >= periodeMulai.substring(0, 7) && key <= periodeSelesai.substring(0, 7);
  });
  if (bulananInRange.length > 0) {
    parts.push(`\n📆 Laporan Bulanan (${bulananInRange.length} entri):`);
    bulananInRange.forEach((l) => {
      const isi = (l.konten || "").replace(/\n/g, " ").substring(0, 200);
      parts.push(`  • ${l.namaBulan} ${l.tahun}: ${isi}...`);
    });
  }

  if (parts.length === 0) {
    return "Belum ada laporan di periode ini.";
  }

  return parts.join("\n");
}

// ========== HELPER: AUTO-GENERATE SUMMARY VENDOR ==========
// Ambil log kunjungan vendor yang ada di periode tertentu,
// hitung statistik, return teks summary.

export function autoGenerateVendorSummary(
  vendor,
  periodeMulai,
  periodeSelesai
) {
  const logKunjungan = (vendor.logKunjungan || []).filter(
    (l) => l.tanggal >= periodeMulai && l.tanggal <= periodeSelesai
  );

  const totalKunjungan = logKunjungan.length;
  if (totalKunjungan === 0) {
    return "Belum ada kunjungan di periode ini.";
  }

  const hasilCount = {};
  logKunjungan.forEach((l) => {
    hasilCount[l.hasil] = (hasilCount[l.hasil] || 0) + 1;
  });

  const parts = [];
  parts.push(`📊 Total kunjungan: ${totalKunjungan}`);
  parts.push(`\nRincian hasil:`);
  Object.entries(hasilCount).forEach(([hasil, count]) => {
    parts.push(`  • ${hasil}: ${count}x`);
  });

  // Kunjungan terakhir
  const terakhir = logKunjungan
    .slice()
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal))[0];
  if (terakhir) {
    parts.push(
      `\n📅 Kunjungan terakhir: ${formatTanggalPendek(
        terakhir.tanggal
      )} (${terakhir.tujuanId || "-"})`
    );
  }

  return parts.join("\n");
}