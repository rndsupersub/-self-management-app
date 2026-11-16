// lib/keuanganData.js
// Data default + helper buat fitur Keuangan.
// Struktur: Dompet, Goals, Sumber Pemasukan, Kategori, Transaksi.

import { formatTanggalLokal, getTanggalHariIniLokal, parseTanggalLokal } from "./tanggalLokal.js";

// ========== DOMPET DEFAULT (7 DOMPET) ==========

export const DEFAULT_DOMPET = [
  {
    id: "operasional",
    nama: "Operasional",
    tipe: "spending",
    periode: "mingguan",
    budget: 0,
    warna: "blue",
  },
  {
    id: "lifestyle",
    nama: "Lifestyle",
    tipe: "spending",
    periode: "mingguan",
    budget: 0,
    warna: "purple",
  },
  {
    id: "keluarga",
    nama: "Keluarga",
    tipe: "spending",
    periode: "mingguan",
    budget: 0,
    warna: "green",
  },
  {
    id: "survey",
    nama: "Survey",
    tipe: "spending",
    periode: "mingguan",
    budget: 0,
    warna: "orange",
  },
  {
    id: "dana_main",
    nama: "Dana Main",
    tipe: "spending",
    periode: "2mingguan",
    budget: 0,
    warna: "pink",
  },
  {
    id: "dana_darurat",
    nama: "Dana Darurat",
    tipe: "target",
    periode: "alltime",
    saldo: 0,
    warna: "red",
  },
  {
    id: "tabungan",
    nama: "Tabungan",
    tipe: "target",
    periode: "alltime",
    saldo: 0,
    warna: "teal",
  },
];

// ========== GOALS DEFAULT ==========

export const DEFAULT_GOALS = [
  { id: "goal_dana_darurat", nama: "Dana Darurat", target: 2000000, walletId: "dana_darurat" },
  { id: "goal_tabungan_umum", nama: "Tabungan Umum", target: 5000000, walletId: "tabungan" },
  { id: "goal_kurban", nama: "Kurban", target: 3000000, walletId: "kurban" },
  { id: "goal_investasi_emas", nama: "Investasi Emas", target: 5000000, walletId: "investasi_emas" },
  { id: "goal_modal_bisnis", nama: "Modal Bisnis", target: 5000000, walletId: "modal_bisnis" },
  { id: "goal_laptop", nama: "Laptop", target: 20000000, walletId: "tabungan" },
  { id: "goal_mobil", nama: "Mobil", target: 10000000000, walletId: "tabungan" },
  { id: "goal_rumah", nama: "Rumah", target: 35000000000, walletId: "tabungan" },
];

// ========== SUMBER PEMASUKAN DEFAULT ==========

export const DEFAULT_SUMBER_PEMASUKAN = [
  { id: "gaji_senin", nama: "Gaji Senin", nominal: 90000, hari: 1 },
  { id: "gaji_sabtu", nama: "Gaji Sabtu", nominal: 450000, hari: 6 },
  { id: "gaji_25", nama: "Gaji Tanggal 25", nominal: 2000000, tanggal: 25 },
];

// ========== KATEGORI DEFAULT ==========

export const DEFAULT_KATEGORI = {
  masuk: [
    { id: "kat_gaji_senin", nama: "Gaji Senin" },
    { id: "kat_gaji_sabtu", nama: "Gaji Sabtu" },
    { id: "kat_gaji_25", nama: "Gaji Tanggal 25" },
    { id: "kat_bonus", nama: "Bonus" },
    { id: "kat_thr", nama: "THR" },
    { id: "kat_lainnya_masuk", nama: "Lainnya" },
  ],
  keluar: [
    { id: "kat_operasional", nama: "Operasional" },
    { id: "kat_lifestyle", nama: "Lifestyle" },
    { id: "kat_keluarga", nama: "Keluarga" },
    { id: "kat_survey", nama: "Survey" },
    { id: "kat_dana_main", nama: "Dana Main" },
    { id: "kat_darurat", nama: "Darurat" },
    { id: "kat_tak_terduga", nama: "Tak Terduga" },
    { id: "kat_lainnya_keluar", nama: "Lainnya" },
  ],
  tabungan: [
    { id: "kat_dana_darurat", nama: "Setor Dana Darurat" },
    { id: "kat_tabungan_umum", nama: "Setor Tabungan Umum" },
    { id: "kat_kurban", nama: "Setor Kurban" },
    { id: "kat_investasi_emas", nama: "Beli Emas" },
    { id: "kat_modal_bisnis", nama: "Setor Modal Bisnis" },
    { id: "kat_laptop", nama: "Setor Laptop" },
    { id: "kat_mobil", nama: "Setor Mobil" },
    { id: "kat_rumah", nama: "Setor Rumah" },
  ],
  sedekah: [
    { id: "kat_sedekah_rutin", nama: "Sedekah Rutin" },
    { id: "kat_sedekah_lainnya", nama: "Sedekah Lainnya" },
  ],
};

// ========== HELPER: KATEGORI EFEKTIF ==========
// Web & Telegram harus baca daftar yang sama. Kalau user belum pernah nyimpen
// kategori (atau nyimpen array kosong), pakai DEFAULT_KATEGORI biar wizard
// Telegram nggak kehilangan step kategori dan transaksi nggak jadi "Lainnya".

export function getKategoriList(userKategori = {}) {
  const hasil = {};
  Object.keys(DEFAULT_KATEGORI).forEach((jenis) => {
    const list = userKategori?.[jenis];
    hasil[jenis] = Array.isArray(list) && list.length > 0 ? list : DEFAULT_KATEGORI[jenis];
  });
  return hasil;
}

// ========== HELPER: NAMA KATEGORI TRANSAKSI ==========
// Transaksi nyimpen `kategoriId`; data lama cuma punya `walletId` atau `kategori`.
// Resolve berlapis biar Top 5 / Riwayat nggak collapse jadi "Tanpa Kategori".

export function cariKategoriById(kategoriList, id) {
  if (!id) return null;
  for (const jenis of ["masuk", "keluar", "tabungan", "sedekah"]) {
    const ketemu = (kategoriList?.[jenis] || []).find((k) => k.id === id);
    if (ketemu) return ketemu;
  }
  return null;
}

export function namaKategoriTransaksi(trx, kategoriList = DEFAULT_KATEGORI, dompetList) {
  // Selalu pakai daftar efektif: user yang belum pernah nyimpen kategori tetap
  // dapat default, jadi Top 5 / Riwayat nggak jatuh ke "Tanpa Kategori" palsu.
  const daftar = getKategoriList(kategoriList);
  const daftarDompet = Array.isArray(dompetList) && dompetList.length > 0 ? dompetList : DEFAULT_DOMPET;

  const kat = cariKategoriById(daftar, trx?.kategoriId);
  if (kat) return kat.nama;

  if (trx?.kategori) {
    const legacy = cariKategoriById(daftar, trx.kategori);
    return legacy ? legacy.nama : trx.kategori;
  }

  if (trx?.walletId) {
    const dompet = daftarDompet.find((d) => d.id === trx.walletId);
    if (dompet) return dompet.nama;
  }

  return trx?.jenis === "sedekah" || trx?.tipe === "sedekah"
    ? "Sedekah"
    : "Tanpa Kategori";
}

// ========== SETTING DEFAULT ==========

export const DEFAULT_SETTING = {
  warningPersen: 80,
  dangerPersen: 100,
};

// ========== HELPER: DOMPET DARI KATEGORI ==========
// Satu sumber logika buat web & Telegram. Dulu Telegram nanya dompet manual,
// sementara web nurunin dari nama kategori — sekarang dua-duanya pakai ini.
export function deriveWalletId(kategoriList, jenis, kategoriId) {
  const kategoriObj = (kategoriList?.[jenis] || []).find((k) => k.id === kategoriId);
  if (!kategoriObj) return "";
  const nama = (kategoriObj.nama || "").toLowerCase();
  if (nama.includes("dana darurat")) return "dana_darurat";
  if (
    nama.includes("tabungan") ||
    nama.includes("laptop") ||
    nama.includes("mobil") ||
    nama.includes("rumah")
  )
    return "tabungan";
  if (nama.includes("kurban")) return "kurban";
  if (nama.includes("emas")) return "investasi_emas";
  if (nama.includes("modal bisnis") || nama.includes("modal clothing"))
    return "modal_bisnis";
  if (nama.includes("operasional") || nama.includes("bensin"))
    return "operasional";
  if (nama.includes("lifestyle")) return "lifestyle";
  if (nama.includes("keluarga")) return "keluarga";
  if (nama.includes("survey")) return "survey";
  if (nama.includes("dana main")) return "dana_main";
  if (nama.includes("sedekah")) return "sedekah";
  return "";
}

// ========== HELPER: GENERATE ID ==========

export function generateId(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

// ========== HELPER: FORMAT RUPIAH ==========

export function formatRupiah(angka) {
  if (!angka || angka === 0) return "Rp 0";
  return "Rp " + Math.round(angka).toLocaleString("id-ID");
}

// Format ringkas buat sumbu grafik: 540 rb, 1,2 jt, 3 M.
export function formatRupiahSingkat(angka) {
  const nilai = Number(angka) || 0;
  const n = Math.abs(nilai);
  const tanda = nilai < 0 ? "-" : "";
  const potong = (v, desimal) => {
    const teks = v.toFixed(desimal).replace(".", ",");
    return desimal > 0 ? teks.replace(/,0$/, "") : teks;
  };
  if (n >= 1_000_000_000) return `${tanda}${potong(n / 1_000_000_000, n >= 10_000_000_000 ? 0 : 1)} M`;
  if (n >= 1_000_000) return `${tanda}${potong(n / 1_000_000, n >= 10_000_000 ? 0 : 1)} jt`;
  if (n >= 1_000) return `${tanda}${Math.round(n / 1_000)} rb`;
  return `${tanda}${n}`;
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
  if (opsi === "hari") {
    return d.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
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

// ========== HELPER: TANGGAL HARI INI ==========

export function getTanggalHariIni() {
  return getTanggalHariIniLokal();
}

// ========== HELPER: TAMBAH HARI ==========

export function tambahHari(dateStr, jumlah) {
  const d = parseTanggalLokal(dateStr);
  if (!d) return "";
  d.setDate(d.getDate() + jumlah);
  return formatTanggalLokal(d);
}

// ========== HELPER: GET MINGGU RANGE ==========
// Senin-Minggu

export function getMingguRange(dateStr) {
  const date = parseTanggalLokal(dateStr);
  if (!date) return { tanggalMulai: "", tanggalSelesai: "" };
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const senin = new Date(date.setDate(diff));
  senin.setHours(0, 0, 0, 0);
  const minggu = new Date(senin);
  minggu.setDate(senin.getDate() + 6);

  return {
    tanggalMulai: formatTanggalLokal(senin),
    tanggalSelesai: formatTanggalLokal(minggu),
  };
}

// ========== HELPER: GET BULAN RANGE ==========

export function getBulanRange(dateStr) {
  let date = parseTanggalLokal(dateStr);
  if (!date) date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth();

  return {
    tanggalMulai: formatTanggalLokal(new Date(year, month, 1)),
    tanggalSelesai: formatTanggalLokal(new Date(year, month + 1, 0)),
    bulan: `${year}-${String(month + 1).padStart(2, "0")}`,
  };
}

// ========== HELPER: FLATTEN TRANSAKSI ==========
// Transaksi disimpan per tanggal. Helper ini bikin array flat.

// Data lama (Sheets / versi awal) kadang nyimpen `tipe` & `jumlah`, bukan
// `jenis` & `nominal`. Normalisasi di sini biar transaksi lama tetap kehitung.

export function normalisasiTrx(trx = {}) {
  const jenis = trx.jenis || trx.tipe || "";
  const nominal = Number(trx.nominal ?? trx.jumlah ?? 0) || 0;
  return { ...trx, jenis, nominal };
}

export function flattenTransaksi(keuanganTransaksi) {
  if (!keuanganTransaksi || typeof keuanganTransaksi !== "object") return [];
  const result = [];
  Object.entries(keuanganTransaksi).forEach(([tanggal, list]) => {
    if (Array.isArray(list)) {
      list.forEach((trx) => {
        result.push({ ...normalisasiTrx(trx), tanggal });
      });
    }
  });
  return result;
}

// ========== HELPER: AKSI TRANSAKSI (DELTA) ==========
// Dipakai web & Telegram: simpan sebagai aksi (tambah/edit/hapus), bukan
// menimpa seluruh peta. Hasilnya tulisan yang telat nggak menghapus
// perubahan yang sudah tersimpan.

export function terapkanAksiTransaksi(keuanganTransaksi, { aksi, tanggal, trx, id } = {}) {
  const baru = { ...(keuanganTransaksi || {}) };
  if (!tanggal) return baru;
  const list = Array.isArray(baru[tanggal]) ? [...baru[tanggal]] : [];

  if (aksi === "tambah") {
    list.push(normalisasiTrx(trx));
  } else if (aksi === "edit") {
    const idx = list.findIndex((t) => t.id === id);
    if (idx === -1) list.push(normalisasiTrx(trx));
    else list[idx] = normalisasiTrx({ ...list[idx], ...trx });
  } else if (aksi === "hapus") {
    const sisa = list.filter((t) => t.id !== id);
    if (sisa.length > 0) baru[tanggal] = sisa;
    else delete baru[tanggal];
    return baru;
  }

  if (list.length > 0) baru[tanggal] = list;
  else delete baru[tanggal];
  return baru;
}

// ========== HELPER: HITUNG TOTAL BY JENIS ==========

export function hitungTotalByJenis(keuanganTransaksi, jenis, filterFn = null) {
  const flat = flattenTransaksi(keuanganTransaksi);
  return flat
    .filter((trx) => {
      if (trx.jenis !== jenis) return false;
      if (filterFn && !filterFn(trx)) return false;
      return true;
    })
    .reduce((sum, trx) => sum + (Number(trx.nominal) || 0), 0);
}

// ========== HELPER: HITUNG CASH ==========

export function hitungCash(keuanganTransaksi) {
  const masuk = hitungTotalByJenis(keuanganTransaksi, "masuk");
  const keluar = hitungTotalByJenis(keuanganTransaksi, "keluar");
  const tabungan = hitungTotalByJenis(keuanganTransaksi, "tabungan");
  const sedekah = hitungTotalByJenis(keuanganTransaksi, "sedekah");
  return masuk - keluar - tabungan - sedekah;
}

// ========== HELPER: PENGELUARAN BULAN INI ==========

export function hitungPengeluaranBulanIni(keuanganTransaksi) {
  const bulanIni = getBulanRange(getTanggalHariIni()).bulan;
  return hitungTotalByJenis(keuanganTransaksi, "keluar", (trx) =>
    trx.tanggal.startsWith(bulanIni)
  ) + hitungTotalByJenis(keuanganTransaksi, "sedekah", (trx) =>
    trx.tanggal.startsWith(bulanIni)
  );
}

// ========== HELPER: PENGELUARAN MINGGU INI ==========

export function hitungPengeluaranMingguIni(keuanganTransaksi) {
  const range = getMingguRange(getTanggalHariIni());
  return hitungTotalByJenis(keuanganTransaksi, "keluar", (trx) =>
    trx.tanggal >= range.tanggalMulai && trx.tanggal <= range.tanggalSelesai
  ) + hitungTotalByJenis(keuanganTransaksi, "sedekah", (trx) =>
    trx.tanggal >= range.tanggalMulai && trx.tanggal <= range.tanggalSelesai
  );
}

// ========== HELPER: REALISASI WALLET ==========
// Total keluar dari wallet tertentu di periode tertentu

export function hitungRealisasiWallet(keuanganTransaksi, walletId, periode) {
  const range =
    periode === "mingguan"
      ? getMingguRange(getTanggalHariIni())
      : periode === "2mingguan"
      ? {
          tanggalMulai: tambahHari(getTanggalHariIni(), -14),
          tanggalSelesai: getTanggalHariIni(),
        }
      : getBulanRange(getTanggalHariIni());

  return hitungTotalByJenis(
    keuanganTransaksi,
    "keluar",
    (trx) =>
      trx.walletId === walletId &&
      trx.tanggal >= range.tanggalMulai &&
      trx.tanggal <= range.tanggalSelesai
  );
}

// ========== HELPER: SALDO WALLET TARGET ==========
// Total tabungan yang masuk ke wallet target

export function hitungSaldoWallet(keuanganTransaksi, walletId) {
  return hitungTotalByJenis(
    keuanganTransaksi,
    "tabungan",
    (trx) => trx.walletId === walletId
  );
}

// ========== HELPER: PROGRESS WALLET ==========

export function hitungProgressWallet(wallet, keuanganTransaksi) {
  if (wallet.tipe === "spending") {
    const realisasi = hitungRealisasiWallet(
      keuanganTransaksi,
      wallet.id,
      wallet.periode
    );
    const budget = wallet.budget || 0;
    const persen = budget > 0 ? Math.round((realisasi / budget) * 100) : 0;
    const sisa = budget - realisasi;
    return { budget, realisasi, sisa, persen };
  }
  // target
  const saldo = hitungSaldoWallet(keuanganTransaksi, wallet.id);
  const target = wallet.budget || 0;
  const persen = target > 0 ? Math.round((saldo / target) * 100) : 0;
  const sisa = Math.max(target - saldo, 0);
  return { budget: target, realisasi: saldo, sisa, persen };
}

// ========== HELPER: STATUS WALLET ==========

export function getWalletStatus(wallet, persen, setting = DEFAULT_SETTING) {
  if (wallet.tipe === "spending") {
    if (persen >= setting.dangerPersen) return { label: "Over Budget", emoji: "🔴", warna: "red" };
    if (persen >= setting.warningPersen) return { label: "Warning", emoji: "🟡", warna: "yellow" };
    return { label: "Aman", emoji: "🟢", warna: "green" };
  }
  // target
  if (persen >= 100) return { label: "Tercapai", emoji: "🟢", warna: "green" };
  if (persen >= setting.warningPersen) return { label: "Mendekati", emoji: "🟡", warna: "yellow" };
  return { label: "Masih Jauh", emoji: "🔴", warna: "red" };
}

// ========== HELPER: PROGRESS GOAL ==========

export function hitungProgressGoal(goal, dompetList, keuanganTransaksi) {
  const saldo = hitungSaldoWallet(keuanganTransaksi, goal.walletId);
  const target = goal.target || 1;
  const persen = Math.min(100, Math.round((saldo / target) * 100));
  return { saldo, target, persen };
}

// ========== HELPER: RASIO TABUNGAN ==========
// Total tabungan bulan ini / total pemasukan bulan ini

export function hitungRasioTabungan(keuanganTransaksi) {
  const bulanIni = getBulanRange(getTanggalHariIni()).bulan;
  const totalTabungan = hitungTotalByJenis(keuanganTransaksi, "tabungan", (trx) =>
    trx.tanggal.startsWith(bulanIni)
  );
  const totalMasuk = hitungTotalByJenis(keuanganTransaksi, "masuk", (trx) =>
    trx.tanggal.startsWith(bulanIni)
  );
  if (totalMasuk === 0) return 0;
  return Math.min(100, Math.round((totalTabungan / totalMasuk) * 100));
}

// ========== HELPER: KONSISTENSI INPUT ==========
// Berapa hari di bulan ini yang udah ada transaksi

export function hitungKonsistensiInput(keuanganTransaksi) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const hariIni = today.getDate(); // udah lewat berapa hari di bulan ini

  if (!keuanganTransaksi || hariIni === 0) return 0;

  let hariTerisi = 0;
  for (let d = 1; d <= hariIni; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    if (keuanganTransaksi[dateStr] && keuanganTransaksi[dateStr].length > 0) {
      hariTerisi++;
    }
  }

  return Math.round((hariTerisi / hariIni) * 100);
}

// ========== HELPER: FINANCIAL HEALTH SCORE ==========
// 4 komponen:
// - Budget Sehat: 40% (% dompet spending yang nggak over budget)
// - Goals Progress: 30% (rata-rata % progress semua goals)
// - Rasio Tabungan: 20% (% tabungan vs pemasukan bulan ini, max 100%)
// - Konsistensi Input: 10% (% hari yang udah diinput bulan ini)

export function hitungHealthScore(
  dompetList,
  goalsList,
  keuanganTransaksi,
  setting = DEFAULT_SETTING
) {
  // 1. Budget Sehat (40%)
  const dompetSpending = (dompetList || []).filter((d) => d.tipe === "spending");
  let dompetAman = 0;
  dompetSpending.forEach((d) => {
    const { persen } = hitungProgressWallet(d, keuanganTransaksi);
    if (persen < setting.warningPersen) dompetAman++;
  });
  const budgetScore =
    dompetSpending.length > 0
      ? (dompetAman / dompetSpending.length) * 40
      : 40;

  // 2. Goals Progress (30%)
  const goals = goalsList || [];
  let totalPersenGoal = 0;
  goals.forEach((g) => {
    const { persen } = hitungProgressGoal(g, dompetList, keuanganTransaksi);
    totalPersenGoal += persen;
  });
  const goalsScore =
    goals.length > 0 ? (totalPersenGoal / goals.length) * 0.3 : 0;

  // 3. Rasio Tabungan (20%)
  const rasio = hitungRasioTabungan(keuanganTransaksi);
  const tabunganScore = Math.min(rasio, 100) * 0.2;

  // 4. Konsistensi Input (10%)
  const konsistensi = hitungKonsistensiInput(keuanganTransaksi);
  const konsistensiScore = konsistensi * 0.1;

  const total = Math.round(budgetScore + goalsScore + tabunganScore + konsistensiScore);

  let kategori = "Perlu Perhatian";
  let emoji = "🔴";
  let warna = "red";
  if (total >= 80) {
    kategori = "Sangat Sehat";
    emoji = "🟢";
    warna = "green";
  } else if (total >= 60) {
    kategori = "Sehat";
    emoji = "🟢";
    warna = "green";
  } else if (total >= 40) {
    kategori = "Cukup";
    emoji = "🟠";
    warna = "orange";
  }

  return {
    total,
    kategori,
    emoji,
    warna,
    breakdown: {
      budgetScore: Math.round(budgetScore),
      goalsScore: Math.round(goalsScore),
      tabunganScore: Math.round(tabunganScore),
      konsistensiScore: Math.round(konsistensiScore),
    },
  };
}

// ========== HELPER: SMART ALERT ==========
// Generate alert berdasarkan kondisi keuangan

export function generateSmartAlert(dompetList, goalsList, keuanganTransaksi, setting) {
  const alerts = [];

  // Cek wallet over budget
  const dompetSpending = (dompetList || []).filter((d) => d.tipe === "spending");
  const overBudget = dompetSpending.filter((d) => {
    const { persen } = hitungProgressWallet(d, keuanganTransaksi);
    return persen >= setting.dangerPersen;
  });
  if (overBudget.length > 0) {
    alerts.push({
      tipe: "danger",
      emoji: "🔴",
      pesan: `${overBudget.length} dompet OVER BUDGET: ${overBudget.map((d) => d.nama).join(", ")}`,
    });
  }

  // Cek cash
  const cash = hitungCash(keuanganTransaksi);
  if (cash < 0) {
    alerts.push({
      tipe: "danger",
      emoji: "🚨",
      pesan: `Cash MINUS (${formatRupiah(cash)}). Kurangi pengeluaran!`,
    });
  } else if (cash < 300000) {
    alerts.push({
      tipe: "warning",
      emoji: "⚠️",
      pesan: `Cash tipis (${formatRupiah(cash)}). Hati-hati.`,
    });
  }

  // Cek goals
  const goals = goalsList || [];
  goals.forEach((g) => {
    const { persen } = hitungProgressGoal(g, dompetList, keuanganTransaksi);
    if (persen < 50 && persen > 0) {
      alerts.push({
        tipe: "info",
        emoji: "📊",
        pesan: `Goal "${g.nama}" baru ${persen}% dari target.`,
      });
    }
  });

  // Cek konsistensi
  const konsistensi = hitungKonsistensiInput(keuanganTransaksi);
  if (konsistensi < 50) {
    alerts.push({
      tipe: "warning",
      emoji: "📝",
      pesan: `Konsistensi input rendah (${konsistensi}%). Rajin catat transaksi!`,
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      tipe: "success",
      emoji: "✅",
      pesan: "Semua aman. Keuangan sehat!",
    });
  }

  return alerts;
}