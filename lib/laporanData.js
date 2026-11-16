// lib/laporanData.js

import { formatTanggalLokal, getTanggalHariIniLokal, parseTanggalLokal } from "./tanggalLokal.js";
import { rentangKegiatan } from "./pekerjaanData.js";
import {
  HASIL_KUNJUNGAN,
  DEFAULT_TUJUAN_KUNJUNGAN,
  METODE_KUNJUNGAN,
  DEFAULT_KATEGORI_VENDOR,
} from "./vendorData.js";

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

// ========== HELPER: NARASI LAPORAN (BAHASA MANUSIA) ==========
// Auto-generate versi lama cuma nulis "Status: Selesai / Tanggal: ..." dan
// "[2026-11-16] Hasil: on_track". Pembaca nggak dapat gambaran apa pun.
// Semua kalimat di bawah disusun biar laporan bisa dibaca tanpa buka aplikasi:
// apa yang dikerjakan, untuk siapa, sudah sampai mana, kendalanya apa, dan
// langkah berikutnya apa.

const LABEL_SECTION_BAWAAN = {
  analisis: "Analisis",
  desain: "Desain",
  vendor: "Vendor",
  lainnya: "Lainnya",
};

const KETERANGAN_METODE = {
  offline: "kunjungan langsung",
  wa: "lewat WhatsApp",
  gmeet: "lewat Google Meet",
  zoom: "lewat Zoom",
};

function labelBersih(label) {
  return String(label || "")
    .replace(/^[^\p{L}\p{N}]+/u, "")
    .trim();
}

function labelDari(list, id) {
  const ketemu = (list || []).find((x) => x.id === id);
  return labelBersih(ketemu?.label || ketemu?.nama || id || "");
}

export function labelSection(id) {
  return LABEL_SECTION_BAWAAN[id] || labelBersih(String(id || "").replace(/^sec_/, "Section "));
}

// Jumlah hari kalender inklusif (1 hari = 1).
export function selisihHari(mulai, selesai) {
  const a = parseTanggalLokal(mulai);
  const b = parseTanggalLokal(selesai);
  if (!a || !b) return 0;
  return Math.round((b - a) / 86400000) + 1;
}

// Narasi satu kegiatan: { ringkasan, kendala, solusi }.
export function narasiKegiatan(kegiatan, opsi = {}) {
  const {
    acuan = getTanggalHariIniLokal(),
    ptNama = "",
    brandNama = "",
    prioritasList = [],
    sumberList = [],
    kategoriList = [],
  } = opsi;

  const judul = kegiatan?.judul || "(tanpa judul)";
  const { mulai, selesai } = rentangKegiatan(kegiatan);
  const sudahSelesai = kegiatan?.status === "selesai";
  const durasi = selisihHari(mulai, selesai || mulai);
  const baris = [];

  // Kalimat inti: apa, untuk siapa, sudah sampai mana.
  let kalimat = `"${judul}"`;
  if (sudahSelesai) {
    if (!mulai) {
      kalimat += " ditandai selesai";
    } else if (selesai && selesai !== mulai) {
      kalimat += ` dikerjakan ${formatTanggalPanjang(mulai)} sampai ${formatTanggalPendek(
        selesai
      )} (${durasi} hari) dan sudah selesai`;
    } else {
      kalimat += ` selesai dikerjakan pada ${formatTanggalPanjang(mulai)}`;
    }
  } else if (!mulai) {
    kalimat += " belum punya tanggal pengerjaan";
  } else if (acuan < mulai) {
    kalimat += ` belum mulai, dijadwalkan ${formatTanggalPanjang(mulai)}`;
  } else if (selesai && acuan > selesai) {
    // Sudah lewat target: jangan bilang "hari ke-16", itu malah bikin bingung.
    kalimat += ` masih dikerjakan padahal target selesai ${formatTanggalPendek(
      selesai
    )} sudah lewat (rencana ${durasi} hari)`;
  } else {
    kalimat += ` masih dikerjakan, ini hari ke-${selisihHari(mulai, acuan)}`;
    if (selesai && selesai !== mulai) {
      kalimat += ` dari ${durasi} hari, sisa ${selisihHari(acuan, selesai) - 1} hari`;
    }
  }
  if (brandNama) kalimat += ` — brand ${brandNama}`;
  if (ptNama) kalimat += ` (${ptNama})`;
  baris.push(kalimat + ".");

  // Bukti kerja: section mana saja yang sudah ada catatannya.
  const sectionBerisi = Object.entries(kegiatan?.sections || {})
    .map(([id, list]) => ({ id, jumlah: Array.isArray(list) ? list.length : 0 }))
    .filter((s) => s.jumlah > 0);
  if (sectionBerisi.length) {
    baris.push(
      `Catatan tahapan: ${sectionBerisi
        .map((s) => `${labelSection(s.id)} (${s.jumlah} catatan)`)
        .join(", ")}.`
    );
  }

  if (kegiatan?.catatan) baris.push(`Catatan: ${kegiatan.catatan}`);

  const konteks = [];
  const prioritas = labelDari(prioritasList, kegiatan?.prioritas);
  const sumber = labelDari(sumberList, kegiatan?.sumber);
  const kategori = labelDari(kategoriList, kegiatan?.kategori);
  if (prioritas) konteks.push(`prioritas ${prioritas.toLowerCase()}`);
  if (sumber) konteks.push(`ide dari ${sumber.toLowerCase()}`);
  if (kategori) konteks.push(`kategori ${kategori.toLowerCase()}`);
  if (konteks.length) baris.push(`Konteks: ${konteks.join(", ")}.`);

  // Kendala hanya ditulis kalau memang ada masalah.
  let kendala = "";
  if (!sudahSelesai && selesai && acuan > selesai) {
    kendala = `Lewat ${selisihHari(selesai, acuan) - 1} hari dari target ${
      selesai !== mulai ? formatTanggalPendek(selesai) : formatTanggalPanjang(selesai)
    }.`;
  }

  let solusi = "";
  if (!sudahSelesai) {
    if (kendala) {
      solusi = "Selesaikan sisanya atau geser target tanggal, lalu kabari alasannya di catatan.";
    } else if (sectionBerisi.length === 0) {
      solusi = "Isi catatan tahapan biar progres kerja kelihatan buktinya.";
    } else {
      solusi = `Lanjutkan tahap ${labelSection(
        sectionBerisi[sectionBerisi.length - 1].id
      )} sampai target selesai.`;
    }
  }

  return { ringkasan: baris.join("\n"), kendala, solusi };
}

// Narasi kunjungan/log vendor di satu periode.
export function narasiKunjunganVendor(vendor, logs, opsi = {}) {
  if (!logs || logs.length === 0) return { ringkasan: "", kendala: "", solusi: "" };

  const {
    tujuanList = DEFAULT_TUJUAN_KUNJUNGAN,
    hasilList = HASIL_KUNJUNGAN,
    metodeList = METODE_KUNJUNGAN,
    kategoriList = DEFAULT_KATEGORI_VENDOR,
  } = opsi;

  const nama = vendor?.nama || "Vendor";
  const kategori = labelDari(kategoriList, vendor?.kategori);
  const baris = [];

  const hasilUnik = [...new Set(logs.map((l) => l.hasil))]
    .map((h) => labelDari(hasilList, h).toLowerCase())
    .filter(Boolean);

  const pembuka = `Ada ${logs.length} kunjungan/komunikasi dengan ${nama}${
    kategori ? ` (vendor ${kategori.toLowerCase()})` : ""
  } di periode ini`;
  baris.push(
    `${pembuka}${hasilUnik.length ? `, ${logs.length > 1 ? "hasil akhirnya" : "hasilnya"}: ${hasilUnik.join(", ")}.` : "."}`
  );

  logs.forEach((log) => {
    const via = KETERANGAN_METODE[log.metode] || labelDari(metodeList, log.metode).toLowerCase();
    const tujuan = labelDari(tujuanList, log.tujuanId).toLowerCase();
    const hasil = labelDari(hasilList, log.hasil);
    let kalimat = `${formatTanggalPanjang(log.tanggal)} — ${via || "kontak"}`;
    if (tujuan) kalimat += ` untuk ${tujuan}`;
    if (hasil) kalimat += `; hasil: ${hasil}`;
    if (log.catatan) kalimat += `. Catatan: ${log.catatan}`;
    baris.push(`• ${kalimat}.`);
  });

  // Kendala & saran berdasar hasil kunjungan terakhir.
  const kunjunganBermasalah = logs.filter((l) => l.hasil === "delay" || l.hasil === "tidak_layak");
  let kendala = "";
  let solusi = "";
  if (kunjunganBermasalah.length > 0) {
    const terakhir = kunjunganBermasalah[kunjunganBermasalah.length - 1];
    kendala = `${formatTanggalPendek(terakhir.tanggal)}: ${
      labelDari(hasilList, terakhir.hasil) || "ada masalah"
    }${terakhir.catatan ? ` — ${terakhir.catatan}` : ""}.`;
    solusi = `Konfirmasi ulang ke ${nama}: penyebab, tanggal perbaikan, dan siapa yang bertanggung jawab.`;
  } else if (logs.some((l) => l.hasil === "on_track")) {
    solusi = `Pertahankan jadwal dengan ${nama}, cek progres berikutnya sebelum target selesai.`;
  }

  return { ringkasan: baris.join("\n"), kendala, solusi };
}

// Ringkasan pembuka untuk laporan mingguan/bulanan.
export function narasiRingkasanPeriode(kegiatanList, vendorList, periode = {}) {
  const { label = "periode ini", tanggalMulai = "", tanggalSelesai = "" } = periode;
  const kegiatan = kegiatanList || [];
  if (kegiatan.length === 0) return "";

  const selesai = kegiatan.filter((k) => k.status === "selesai");
  const jalan = kegiatan.filter((k) => k.status !== "selesai");
  const acuan = tanggalSelesai || getTanggalHariIniLokal();
  const baris = [];

  baris.push(
    `Periode ${label}: ${kegiatan.length} kegiatan dikerjakan (${selesai.length} selesai, ${jalan.length} masih jalan).`
  );

  if (selesai.length) {
    baris.push(`Selesai: ${selesai.map((k) => `"${k.judul}"`).join(", ")}.`);
  }
  if (jalan.length) {
    baris.push(
      `Masih jalan: ${jalan
        .map((k) => {
          const { mulai, selesai: akhir } = rentangKegiatan(k);
          const sisa = akhir ? selisihHari(acuan, akhir) - 1 : null;
          const status = sisa === null ? "tanpa target" : sisa > 0 ? `sisa ${sisa} hari` : "jatuh tempo";
          return `"${k.judul}"${mulai ? ` (mulai ${formatTanggalPendek(mulai)}, ${status})` : ""}`;
        })
        .join(", ")}.`
    );
  }

  const semuaLog = (vendorList || []).flatMap((v) =>
    (v.logKunjungan || [])
      .filter((l) => l.tanggal >= tanggalMulai && l.tanggal <= tanggalSelesai)
      .map((l) => ({ ...l, vendor: v.nama }))
  );
  if (semuaLog.length) {
    const perVendor = {};
    semuaLog.forEach((l) => {
      if (!perVendor[l.vendor]) perVendor[l.vendor] = [];
      perVendor[l.vendor].push(l.hasil);
    });
    baris.push(
      `Kunjungan vendor: ${Object.entries(perVendor)
        .map(([nama, hasil]) => `${nama} ${hasil.length}x (${[...new Set(hasil)].map((h) => labelDari(HASIL_KUNJUNGAN, h).toLowerCase()).join("/")})`)
        .join("; ")}.`
    );
  }

  const lewat = jalan.filter((k) => {
    const { selesai: akhir } = rentangKegiatan(k);
    return akhir && acuan > akhir;
  });
  if (lewat.length) {
    baris.push(`Perlu perhatian: ${lewat.map((k) => `"${k.judul}" sudah lewat target`).join(", ")}.`);
  }

  return baris.join("\n");
}

// ========== HELPER: GENERATE ID ==========
export function generateId(prefix = "laporan") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}