// lib/vendorStatus.js
//
// Status vendor (Gold / Silver / Bronze / Blacklist) dihitung dari dua sumber:
//
// 1. PERTANYAAN AWAL (profiling)  → bobot kecil (40%).
//    Tiap pertanyaan checkbox punya `bobot` (1-5) dan `dampak`:
//      - "positif" → jawaban "Ya" menambah nilai
//      - "negatif" → jawaban "Ya" mengurangi nilai (pertanyaan jebakan)
//      - "netral"  → tidak dinilai
//    Pertanyaan tiap vendor boleh beda, jadi yang dibandingkan bukan isi
//    pertanyaannya, tapi NILAI jawabannya terhadap dampak yang dipilih user.
//    Jawaban teks (pendek/panjang) cuma menandai profiling sudah diisi, tidak
//    dinilai supaya tidak menilai panjang tulisan.
//
// 2. KUNJUNGAN (realitas lapangan) → bobot besar (60%).
//    Status kunjungan: layak +2, tidak layak −2, belum diketahui 0.
//    Progress: selesai +0,5, delay −0,5.
//    Kunjungan lebih berat karena ini bukti nyata, bukan klaim awal.
//
// Kalau belum ada pertanyaan terjawab DAN belum ada kunjungan → "Belum ada
// status". Status manual tetap bisa dipakai kapan saja (mengunci status),
// dan semua data lama yang sudah punya status tetap terbaca sebagai manual.

import {
  STATUS_VENDOR,
  STATUS_BELUM,
  getStatusKunjungan,
  getProgressKunjungan,
} from "./vendorData.js";

// ========== PARAMETER (bisa diubah tanpa menyentuh logika) ==========
export const AMBANG_VENDOR = {
  gold: 80, // skor minimal Gold
  silver: 55, // skor minimal Silver
  bronze: 25, // skor minimal Bronze (di bawah ini Blacklist)
  minimalKunjunganGold: 2, // Gold wajib punya realitas kunjungan
  kunjunganBlacklist: 2, // minimal kunjungan sebelum pola jelek dianggap Blacklist
  rasioTidakLayakBlacklist: 0.5, // >= separuh kunjungan tidak layak → Blacklist
  bobotPertanyaan: 40,
  bobotKunjungan: 60,
};

// ========== LABEL STATUS ==========
const SEMUA_STATUS = [...STATUS_VENDOR, STATUS_BELUM];

export const DAFTAR_STATUS_FILTER = SEMUA_STATUS;

export function labelStatus(status) {
  return SEMUA_STATUS.find((s) => s.id === status)?.label || "⚪ Belum ada status";
}

export function warnaStatus(status) {
  return SEMUA_STATUS.find((s) => s.id === status)?.warna || "gray";
}

// ========== HELPER KECIL ==========
function keAngka(nilai) {
  const n = Number(nilai);
  return Number.isFinite(n) ? n : 0;
}

function jawabanTerisi(q) {
  if (!q) return false;
  if (q.tipe === "checkbox") return typeof q.jawaban === "boolean";
  return String(q.jawaban ?? "").trim() !== "";
}

function statusManualValid(status) {
  return STATUS_VENDOR.some((s) => s.id === status);
}

// ========== SKOR PERTANYAAN (PROFILING) ==========
export function hitungSkorPertanyaan(vendor) {
  const daftar = Array.isArray(vendor?.pertanyaanAwal) ? vendor.pertanyaanAwal : [];
  let nilai = 0;
  let maks = 0;
  let terjawab = 0;

  daftar.forEach((q) => {
    if (!jawabanTerisi(q)) return;
    terjawab += 1;

    // Hanya checkbox yang dinilai. Jawaban teks tetap dihitung sebagai
    // "profiling sudah diisi" supaya vendor tidak selamanya "belum ada status".
    if (q.tipe !== "checkbox") return;

    const bobot = Math.max(1, keAngka(q.bobot) || 1);
    const dampak = q.dampak === "negatif" || q.dampak === "netral" ? q.dampak : "positif";
    maks += bobot;
    if (dampak === "netral") return;

    const jawabanYa = q.jawaban === true;
    const sesuai = dampak === "negatif" ? !jawabanYa : jawabanYa;
    nilai += sesuai ? bobot : -bobot;
  });

  if (maks === 0) {
    return { skor: null, nilai: 0, maks: 0, terjawab, total: daftar.length };
  }

  // Nilai -maks..+maks dipetakan ke 0..100 (50 = netral).
  const skor = Math.round(((nilai / maks + 1) / 2) * 100);
  return { skor, nilai, maks, terjawab, total: daftar.length };
}

// ========== SKOR KUNJUNGAN (REALITAS) ==========
export function hitungSkorKunjungan(vendor) {
  const daftar = (vendor?.logKunjungan || []).filter(Boolean);
  let nilai = 0;
  let maks = 0;
  let layak = 0;
  let tidakLayak = 0;
  let selesai = 0;
  let delay = 0;
  let terakhir = "";

  daftar.forEach((log) => {
    const tanggal = log.tanggal || log.createdAt || "";
    if (tanggal && tanggal > terakhir) terakhir = tanggal;

    maks += 2;
    const status = getStatusKunjungan(log);
    if (status === "layak") {
      nilai += 2;
      layak += 1;
    } else if (status === "tidak_layak") {
      nilai -= 2;
      tidakLayak += 1;
    }

    const progress = getProgressKunjungan(log);
    if (progress === "selesai") {
      nilai += 0.5;
      selesai += 1;
    } else if (progress === "delay") {
      nilai -= 0.5;
      delay += 1;
    }
  });

  if (maks === 0) {
    return { skor: null, nilai: 0, total: 0, layak: 0, tidakLayak: 0, selesai: 0, delay: 0, terakhir: "" };
  }

  const dibatasi = Math.max(-maks, Math.min(maks, nilai));
  const skor = Math.round(((dibatasi / maks + 1) / 2) * 100);
  return { skor, nilai: dibatasi, total: daftar.length, layak, tidakLayak, selesai, delay, terakhir };
}

// ========== GABUNGKAN DUA SKOR ==========
function gabungSkor(pertanyaan, kunjungan, ambang) {
  const komponen = [];
  if (pertanyaan.skor !== null) komponen.push({ skor: pertanyaan.skor, bobot: ambang.bobotPertanyaan });
  if (kunjungan.skor !== null) komponen.push({ skor: kunjungan.skor, bobot: ambang.bobotKunjungan });
  if (komponen.length === 0) return null;
  const totalBobot = komponen.reduce((n, k) => n + k.bobot, 0);
  const nilai = komponen.reduce((n, k) => n + k.skor * k.bobot, 0);
  return Math.round(nilai / totalBobot);
}

function statusDariSkor(skor, kunjungan, ambang) {
  const polaJelek =
    kunjungan.total >= ambang.kunjunganBlacklist &&
    kunjungan.tidakLayak / kunjungan.total >= ambang.rasioTidakLayakBlacklist;

  if (polaJelek) return "blacklist";
  if (skor >= ambang.gold && kunjungan.total >= ambang.minimalKunjunganGold) return "gold";
  if (skor >= ambang.silver) return "silver";
  if (skor >= ambang.bronze) return "bronze";
  return "blacklist";
}

// ========== FUNGSI UTAMA ==========
// Return semua yang dibutuhkan UI: status, skor, rincian, alasan.
export function statusVendorEfektif(vendor, opsi = {}) {
  const ambang = { ...AMBANG_VENDOR, ...(opsi.ambang || {}) };
  const pertanyaan = hitungSkorPertanyaan(vendor);
  const kunjungan = hitungSkorKunjungan(vendor);
  const adaData = pertanyaan.terjawab > 0 || kunjungan.total > 0;

  const mode =
    vendor?.statusMode === "manual" || vendor?.statusMode === "otomatis"
      ? vendor.statusMode
      : statusManualValid(vendor?.status)
      ? "manual"
      : "otomatis";

  const autoSkor = gabungSkor(pertanyaan, kunjungan, ambang);
  let autoStatus = adaData && autoSkor !== null ? statusDariSkor(autoSkor, kunjungan, ambang) : "belum";

  const polaJelek =
    kunjungan.total >= ambang.kunjunganBlacklist &&
    kunjungan.tidakLayak / Math.max(1, kunjungan.total) >= ambang.rasioTidakLayakBlacklist;

  // Jangan Blacklist cuma karena 1-2 pertanyaan awal yang belum didukung bukti
  // lapangan. Blacklist dari skor baru berlaku kalau sudah ada kunjungan atau
  // minimal 3 pertanyaan terjawab; selain itu status terendah = Bronze.
  const buktiTipis = !polaJelek && kunjungan.total === 0 && pertanyaan.terjawab < 3;
  if (autoStatus === "blacklist" && buktiTipis) autoStatus = "bronze";

  let status = autoStatus;
  if (mode === "manual") {
    if (statusManualValid(vendor?.status)) status = vendor.status;
    else if (vendor?.status === "belum" || !adaData) status = "belum";
  }

  const alasan = [];
  if (mode === "manual" && statusManualValid(vendor?.status)) {
    alasan.push("Status dikunci manual oleh user.");
    if (autoSkor !== null) alasan.push(`Skor otomatis saat ini ${autoSkor}/100.`);
  } else if (!adaData) {
    alasan.push("Belum ada pertanyaan terjawab dan belum ada kunjungan, jadi belum punya status.");
    alasan.push("Status akan muncul setelah minimal satu pertanyaan dijawab atau satu kunjungan dicatat.");
  } else if (status === "blacklist" && kunjungan.total > 0 && kunjungan.tidakLayak / Math.max(1, kunjungan.total) >= ambang.rasioTidakLayakBlacklist && kunjungan.total >= ambang.kunjunganBlacklist) {
    alasan.push(`${kunjungan.tidakLayak} dari ${kunjungan.total} kunjungan menilai vendor tidak layak.`);
  } else if (autoSkor >= ambang.gold && kunjungan.total < ambang.minimalKunjunganGold) {
    alasan.push(`Skor ${autoSkor}/100 sudah tinggi, tapi Gold butuh minimal ${ambang.minimalKunjunganGold} kunjungan sebagai bukti lapangan.`);
  } else if (buktiTipis && autoSkor < ambang.bronze) {
    alasan.push(`Skor ${autoSkor}/100 masih rendah, tapi bukti baru ${pertanyaan.terjawab} pertanyaan dan belum ada kunjungan. Blacklist butuh minimal 3 pertanyaan terjawab atau kunjungan yang menilai tidak layak.`);
  } else {
    alasan.push(`Skor ${autoSkor}/100 dari pertanyaan (profiling) dan kunjungan (realitas).`);
  }

  return {
    status,
    label: labelStatus(status),
    warna: warnaStatus(status),
    mode,
    skor: status === "belum" && !adaData ? null : autoSkor,
    adaData,
    pertanyaan,
    kunjungan,
    alasan: alasan.join(" "),
    ambang,
  };
}

// Versi pendek untuk list/kartu.
export function labelStatusVendor(vendor) {
  return statusVendorEfektif(vendor).label;
}

export function warnaStatusVendor(vendor) {
  return statusVendorEfektif(vendor).warna;
}

// Ringkasan satu baris untuk time schedule / tooltip.
export function ringkasStatusVendor(vendor) {
  const info = statusVendorEfektif(vendor);
  if (info.skor === null) return info.label;
  return `${info.label} · ${info.skor}/100`;
}
