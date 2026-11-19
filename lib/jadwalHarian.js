// lib/jadwalHarian.js
// SATU SUMBER LOGIKA JADWAL HARIAN (web + Telegram).
//
// Kenapa ada file ini?
// - Web dan bot sama-sama perlu tahu jadwal hari ini SETELAH ada perubahan
//   harian ("pindah jadwal"). Dulu tiap tempat baca `jadwalUser` mentah, jadi
//   perubahan di satu tempat nggak kebaca di tempat lain.
// - Perpindahan disimpan terpisah (`jadwalOverride[YYYY-MM-DD]`), bukan dengan
//   menimpa `jadwalUser`. Jadi jadwal asli nggak hilang dan besok kembali
//   normal — sesuai prinsip "data nggak boleh hilang".

import { DEFAULT_JADWAL } from "./jadwalData";

export const ZONA_WIB = "Asia/Jakarta";

const NAMA_HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

// ========== TANGGAL ==========
export function todayWIB() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA_WIB,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

// Parse "YYYY-MM-DD" tanpa geser zona waktu (new Date("2026-11-19") = UTC).
function keTanggalLokal(tanggal) {
  const cocok = String(tanggal || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!cocok) return null;
  return new Date(Number(cocok[1]), Number(cocok[2]) - 1, Number(cocok[3]));
}

export function namaHari(tanggal) {
  const d = keTanggalLokal(tanggal);
  if (!d) return "";
  return NAMA_HARI[d.getDay()];
}

// ========== JAM ==========
export function jamKeMenit(jam) {
  if (!jam || typeof jam !== "string") return null;
  const cocok = jam.trim().match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  if (!cocok) return null;
  return Number(cocok[1]) * 60 + Number(cocok[2]);
}

export function menitKeJam(menit) {
  const nilai = ((Math.round(menit) % 1440) + 1440) % 1440;
  const jj = String(Math.floor(nilai / 60)).padStart(2, "0");
  const mm = String(nilai % 60).padStart(2, "0");
  return `${jj}:${mm}`;
}

// Baca jam dari semua bentuk data jadwal (baru: jam/jamMulai, lama: waktu).
export function parseJamJadwal(item) {
  if (!item) return { mulai: "", selesai: "" };

  const dariRentang = (teks) => {
    if (typeof teks !== "string") return null;
    const bagian = teks.split(/\s*(?:--|-|–|—)\s*/).filter(Boolean);
    if (bagian.length < 2) return null;
    return { mulai: bagian[0].trim(), selesai: bagian[1].trim() };
  };

  const rentang =
    dariRentang(item.jam) || dariRentang(item.waktu) || dariRentang(item.range);
  const mulai = rentang?.mulai || item.jamMulai || item.waktuMulai || item.start || "";
  const selesai = rentang?.selesai || item.jamSelesai || item.waktuSelesai || item.end || "";

  const valid = (t) => /^([01]?\d|2[0-3]):[0-5]\d$/.test(String(t || "").trim());
  return {
    mulai: valid(mulai) ? String(mulai).trim() : "",
    selesai: valid(selesai) ? String(selesai).trim() : "",
  };
}

export function formatJamJadwal(mulai, selesai) {
  if (!mulai && !selesai) return "";
  if (mulai && selesai) return `${mulai} – ${selesai}`;
  return mulai || selesai;
}

export function durasiMenitJadwal(item) {
  const { mulai, selesai } = parseJamJadwal(item);
  const a = jamKeMenit(mulai);
  const b = jamKeMenit(selesai);
  if (a === null || b === null) return 30;
  // 23:55 – 00:00 dianggap 5 menit, bukan negatif.
  const durasi = b > a ? b - a : b + 1440 - a;
  return durasi > 0 ? durasi : 30;
}

// Label tanpa emoji, buat tampilan yang rapi.
export function bersihkanLabel(label) {
  return String(label || "")
    .replace(
      /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{FE0F}\u{200D}]/gu,
      ""
    )
    .replace(/\s+/g, " ")
    .trim();
}

// ========== JADWAL DASAR (tanpa perubahan harian) ==========
export function getJadwalDasar(jadwalUser, tanggal) {
  const sumber =
    jadwalUser && Array.isArray(jadwalUser.kerja) && Array.isArray(jadwalUser.minggu)
      ? jadwalUser
      : DEFAULT_JADWAL;

  const d = keTanggalLokal(tanggal);
  const dayIndex = d ? d.getDay() : new Date().getDay();
  const isMinggu = dayIndex === 0;

  if (isMinggu) {
    return {
      daftar: sumber.minggu || [],
      hari: "Minggu",
      labelHari: "Hari Minggu",
      isMinggu: true,
      dayIndex,
    };
  }

  const daftar = (sumber.kerja || []).filter(
    (item) => !Array.isArray(item?.hari) || item.hari.includes(dayIndex)
  );

  return {
    daftar,
    hari: NAMA_HARI[dayIndex],
    labelHari: "Hari Kerja",
    isMinggu: false,
    dayIndex,
  };
}

// Kunci stabil per item. Item lama tanpa id tetap bisa dipindah lewat index.
export function kunciJadwal(item, index) {
  return item?.id || `idx_${index}`;
}

// ========== JADWAL HARI INI + PERUBAHAN HARIAN ==========
export function getJadwalHarian(jadwalUser, overrideHari, tanggal) {
  const dasar = getJadwalDasar(jadwalUser, tanggal);
  const override =
    overrideHari && typeof overrideHari === "object" && !Array.isArray(overrideHari)
      ? overrideHari
      : {};

  const daftar = (dasar.daftar || []).map((item, index) => {
    const kunci = kunciJadwal(item, index);
    const ubah = override[kunci];
    const asli = parseJamJadwal(item);

    if (!ubah) {
      return { ...item, _kunci: kunci, _dipindah: false, _jamAsli: "" };
    }

    const mulai = ubah.mulai || parseJamJadwal(ubah).mulai || asli.mulai;
    const selesai = ubah.selesai || parseJamJadwal(ubah).selesai || asli.selesai;
    const jam = ubah.jam || formatJamJadwal(mulai, selesai);

    return {
      ...item,
      jam,
      waktu: jam,
      jamMulai: mulai,
      waktuMulai: mulai,
      jamSelesai: selesai,
      waktuSelesai: selesai,
      _kunci: kunci,
      _dipindah: true,
      _jamAsli: ubah.asli || formatJamJadwal(asli.mulai, asli.selesai),
    };
  });

  return { ...dasar, daftar };
}

// Urutkan untuk TAMPILAN saja (data tersimpan tetap urut sesuai Kelola Jadwal).
export function urutkanJadwal(daftar) {
  return [...(daftar || [])].sort((a, b) => {
    const aMulai = jamKeMenit(parseJamJadwal(a).mulai);
    const bMulai = jamKeMenit(parseJamJadwal(b).mulai);
    if (aMulai === null && bMulai === null) return 0;
    if (aMulai === null) return 1;
    if (bMulai === null) return -1;
    return aMulai - bMulai;
  });
}

// ========== SLOT KOSONG ==========
// Hitung celah waktu yang nggak kepakai jadwal lain pada hari itu.
export function cariSlotKosong(daftar, durasiMenit = 30, opsi = {}) {
  const {
    batasMulai = 5 * 60, // 05:00
    batasSelesai = 23 * 60 + 55, // 23:55
    maks = 6,
    langkah = 5,
  } = opsi;

  const durasi = Math.max(5, Number(durasiMenit) || 30);
  const sibuk = [];

  (daftar || []).forEach((item) => {
    const { mulai, selesai } = parseJamJadwal(item);
    const a = jamKeMenit(mulai);
    const b = jamKeMenit(selesai);
    if (a === null) return;
    let akhir = b === null ? a + durasiMenitJadwal(item) : b;
    if (akhir <= a) akhir += 1440; // lewat tengah malam
    // Buang rentang di luar jam yang masuk akal.
    if (akhir <= batasMulai || a >= batasSelesai) return;
    sibuk.push([Math.max(a, batasMulai), Math.min(akhir, batasSelesai)]);
  });

  sibuk.sort((a, b) => a[0] - b[0]);
  const gabung = [];
  sibuk.forEach(([a, b]) => {
    const terakhir = gabung[gabung.length - 1];
    if (terakhir && a <= terakhir[1]) terakhir[1] = Math.max(terakhir[1], b);
    else gabung.push([a, b]);
  });

  const slot = [];
  let posisi = batasMulai;
  const tambahCelah = (dari, sampai) => {
    let awal = dari;
    // Bulatkan ke atas kelipatan 5 menit biar jamnya enak dibaca.
    if (awal % langkah !== 0) awal += langkah - (awal % langkah);

    const akhir = sampai - durasi;
    if (awal > akhir || slot.length >= maks) return;

    // Dua pilihan per celah: paling awal & paling akhir. Kalau celahnya
    // panjang, dua-duanya tetap kepakai; kalau sempit, cuma satu.
    const kandidat = [awal];
    if (akhir - awal >= 30) kandidat.push(akhir);

    kandidat.forEach((menit) => {
      if (slot.length >= maks) return;
      if (slot.some((s) => s.menitMulai === menit)) return;
      slot.push({
        mulai: menitKeJam(menit),
        selesai: menitKeJam(menit + durasi),
        menitMulai: menit,
      });
    });
  };

  gabung.forEach(([a, b]) => {
    if (a > posisi) tambahCelah(posisi, a);
    posisi = Math.max(posisi, b);
  });
  if (posisi < batasSelesai) tambahCelah(posisi, batasSelesai);

  return slot;
}

// ========== BUAT DATA PERPINDAHAN ==========
export function buatOverrideHari(jadwalUser, overrideLama, tanggal, kunciItem, slot) {
  const info = getJadwalHarian(jadwalUser, overrideLama?.[tanggal], tanggal);
  const item = info.daftar.find((j) => j._kunci === kunciItem);
  if (!item) return null;

  const asli = parseJamJadwal(item);
  const mulai = slot?.mulai;
  const selesai = slot?.selesai;
  if (!jamKeMenit(mulai) && jamKeMenit(mulai) !== 0) return null;
  if (!selesai) return null;

  const jam = formatJamJadwal(mulai, selesai);
  return {
    jam,
    mulai,
    selesai,
    asli: item._jamAsli || formatJamJadwal(asli.mulai, asli.selesai),
    label: bersihkanLabel(item.label),
    at: new Date().toISOString(),
  };
}

// Hapus semua perubahan harian pada satu tanggal (kembali ke jadwal asli).
export function hapusOverrideTanggal(jadwalOverride, tanggal) {
  const baru = { ...(jadwalOverride || {}) };
  delete baru[tanggal];
  return baru;
}
