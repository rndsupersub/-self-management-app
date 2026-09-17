// lib/keuanganData.js
// Data default + helper buat fitur Keuangan.
// Struktur: Dompet, Goals, Sumber Pemasukan, Kategori, Transaksi.

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

// ========== SETTING DEFAULT ==========

export const DEFAULT_SETTING = {
  warningPersen: 80,
  dangerPersen: 100,
};

// ========== HELPER: GENERATE ID ==========

export function generateId(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

// ========== HELPER: FORMAT RUPIAH ==========

export function formatRupiah(angka) {
  if (!angka || angka === 0) return "Rp 0";
  return "Rp " + Math.round(angka).toLocaleString("id-ID");
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
  return new Date().toISOString().split("T")[0];
}

// ========== HELPER: TAMBAH HARI ==========

export function tambahHari(dateStr, jumlah) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + jumlah);
  return d.toISOString().split("T")[0];
}

// ========== HELPER: GET MINGGU RANGE ==========
// Senin-Minggu

export function getMingguRange(dateStr) {
  const date = new Date(dateStr);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const senin = new Date(date.setDate(diff));
  const minggu = new Date(senin);
  minggu.setDate(senin.getDate() + 6);

  return {
    tanggalMulai: senin.toISOString().split("T")[0],
    tanggalSelesai: minggu.toISOString().split("T")[0],
  };
}

// ========== HELPER: GET BULAN RANGE ==========

export function getBulanRange(dateStr) {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = date.getMonth();

  return {
    tanggalMulai: new Date(year, month, 1).toISOString().split("T")[0],
    tanggalSelesai: new Date(year, month + 1, 0).toISOString().split("T")[0],
    bulan: `${year}-${String(month + 1).padStart(2, "0")}`,
  };
}

// ========== HELPER: FLATTEN TRANSAKSI ==========
// Transaksi disimpan per tanggal. Helper ini bikin array flat.

export function flattenTransaksi(keuanganTransaksi) {
  if (!keuanganTransaksi || typeof keuanganTransaksi !== "object") return [];
  const result = [];
  Object.entries(keuanganTransaksi).forEach(([tanggal, list]) => {
    if (Array.isArray(list)) {
      list.forEach((trx) => {
        result.push({ ...trx, tanggal });
      });
    }
  });
  return result;
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
    .reduce((sum, trx) => sum + (parseInt(trx.nominal) || 0), 0);
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