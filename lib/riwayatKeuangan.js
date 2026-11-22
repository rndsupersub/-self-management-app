// lib/riwayatKeuangan.js
// Riwayat keuangan: minggu ini, bulan ini, triwulan, semester, tahunan.
// Setiap periode dibandingkan dengan periode sebelumnya yang panjangnya sama
// (untuk minggu/bulan) atau periode penuh sebelumnya (triwulan/semester/tahun).
// Semua periode dihitung dari tanggal lokal (WIB), bukan toISOString, karena
// di UTC+7 `new Date(2026, 10, 1).toISOString()` jatuh ke 31 Oktober.
// Logika di sini murni (tanpa Firestore) biar bisa dipakai web & Telegram.

import { DEFAULT_DOMPET, flattenTransaksi, namaKategoriTransaksi } from "./keuanganData.js";
import {
  formatTanggalLokal,
  getTanggalHariIniLokal,
  parseTanggalLokal,
} from "./tanggalLokal.js";
import { buatPenjelasan } from "./keuanganNarasi.js";

const fmt = formatTanggalLokal;

export const PERIODE_RIWAYAT = [
  { kunci: "minggu", label: "Minggu Ini", granularitas: "hari" },
  { kunci: "bulan", label: "Bulan Ini", granularitas: "minggu" },
  { kunci: "triwulan", label: "Triwulan", granularitas: "bulan" },
  { kunci: "semester", label: "Semester", granularitas: "bulan" },
  { kunci: "tahun", label: "Tahunan", granularitas: "bulan" },
  { kunci: "custom", label: "Rentang Sendiri", granularitas: "bulan" },
];

function awalBulan(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function akhirBulan(d) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function tambahHari(d, n) {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  c.setHours(0, 0, 0, 0);
  return c;
}

function seninDari(d) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  const day = c.getDay();
  c.setDate(c.getDate() - day + (day === 0 ? -6 : 1));
  return c;
}

// geser 0 = periode yang diminta, geser 1 = periode pembanding sebelumnya.
export function getRentangRiwayat(kunci, hariIni = getTanggalHariIniLokal(), geser = 0) {
  const now = parseTanggalLokal(hariIni) || new Date();
  // Senin = 0 ... Minggu = 6
  const hariKe = (now.getDay() + 6) % 7;

  if (kunci === "minggu") {
    const senin = tambahHari(seninDari(now), -7 * geser);
    // Pembanding dipotong di hari yang sama (Senin–hari ini), supaya "minggu
    // ini 3 hari" tidak dibandingkan dengan "minggu lalu 7 hari".
    return { mulai: fmt(senin), selesai: fmt(tambahHari(senin, hariKe)) };
  }

  if (kunci === "bulan") {
    const awal = new Date(now.getFullYear(), now.getMonth() - geser, 1);
    const maksHari = akhirBulan(awal).getDate();
    const hari = Math.min(now.getDate(), maksHari);
    const selesai = new Date(awal.getFullYear(), awal.getMonth(), hari);
    return { mulai: fmt(awal), selesai: fmt(selesai) };
  }

  const panjang = kunci === "triwulan" ? 3 : kunci === "semester" ? 6 : 12;
  const bulanAwal =
    kunci === "triwulan"
      ? Math.floor(now.getMonth() / 3) * 3
      : kunci === "semester"
        ? now.getMonth() < 6
          ? 0
          : 6
        : 0;

  const awal = new Date(now.getFullYear(), bulanAwal - panjang * geser, 1);
  const akhirPenuh = akhirBulan(new Date(awal.getFullYear(), awal.getMonth() + panjang - 1, 1));
  const selesai = geser === 0 && akhirPenuh > now ? now : akhirPenuh;

  return { mulai: fmt(awal), selesai: fmt(selesai) };
}

// Rentang tanggal bebas (dipilih user). Urutannya dibetulkan otomatis: kalau
// tanggal akhir lebih awal dari tanggal mulai, keduanya ditukar.
export function rentangBebas(mulai, selesai) {
  const a = parseTanggalLokal(mulai);
  const b = parseTanggalLokal(selesai);
  if (!a || !b) return null;
  const awal = a <= b ? a : b;
  const akhir = a <= b ? b : a;
  return { mulai: fmt(awal), selesai: fmt(akhir) };
}

// Pembanding untuk rentang bebas: panjang hari yang sama, tepat sebelum
// rentangnya. Jadi "1–15 Nov" dibandingkan dengan "17–31 Okt".
export function rentangSebelumnya(rentang) {
  const a = parseTanggalLokal(rentang?.mulai);
  const b = parseTanggalLokal(rentang?.selesai);
  if (!a || !b) return { mulai: "", selesai: "" };
  const hari = Math.round((b - a) / 86400000) + 1;
  const akhirLalu = tambahHari(a, -1);
  return { mulai: fmt(tambahHari(akhirLalu, -(hari - 1))), selesai: fmt(akhirLalu) };
}

// Rentang pendek tetap enak dibaca per hari; rentang panjang per bulan.
export function granularitasRentang(rentang) {
  const a = parseTanggalLokal(rentang?.mulai);
  const b = parseTanggalLokal(rentang?.selesai);
  if (!a || !b) return "bulan";
  const hari = Math.round((b - a) / 86400000) + 1;
  if (hari <= 31) return "hari";
  if (hari <= 120) return "minggu";
  return "bulan";
}

export function labelRentang(rentang) {
  const mulai = parseTanggalLokal(rentang?.mulai);
  const selesai = parseTanggalLokal(rentang?.selesai);
  if (!mulai || !selesai) return "";

  if (mulai.getFullYear() === selesai.getFullYear() && mulai.getMonth() === selesai.getMonth()) {
    return mulai.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
  }

  const pendek = (d) =>
    d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  return `${pendek(mulai)} – ${pendek(selesai)}`;
}

// ========== RINGKASAN PERIODE ==========

export function ringkasPeriode(keuanganTransaksi, rentang) {
  const list = flattenTransaksi(keuanganTransaksi)
    .filter((t) => t.tanggal >= rentang.mulai && t.tanggal <= rentang.selesai)
    .sort(
      (a, b) =>
        b.tanggal.localeCompare(a.tanggal) ||
        String(b.updatedAt || "").localeCompare(String(a.updatedAt || ""))
    );

  const total = { masuk: 0, keluar: 0, tabungan: 0, sedekah: 0 };
  list.forEach((t) => {
    if (total[t.jenis] !== undefined) total[t.jenis] += t.nominal;
  });

  const net = total.masuk - total.keluar - total.tabungan - total.sedekah;
  const hariAktif = new Set(list.map((t) => t.tanggal)).size;

  return { list, total, net, jumlahTrx: list.length, hariAktif };
}

function hitungSelisih(sekarang, sebelumnya) {
  const selisih = sekarang - sebelumnya;
  // Pembagi pakai nilai absolut: kalau periode lalu minus (mis. cash flow),
  // persentase nggak boleh berbalik tanda dan bikin "naik -97%" yang bingung.
  const persen = sebelumnya === 0 ? null : Math.round((selisih / Math.abs(sebelumnya)) * 100);
  return { selisih, persen };
}

export function bandingkan(sekarang, sebelumnya) {
  return {
    masuk: hitungSelisih(sekarang.total.masuk, sebelumnya.total.masuk),
    keluar: hitungSelisih(
      sekarang.total.keluar + sekarang.total.sedekah,
      sebelumnya.total.keluar + sebelumnya.total.sedekah
    ),
    net: hitungSelisih(sekarang.net, sebelumnya.net),
  };
}

// ========== SEGMEN (HARIAN / MINGGUAN / BULANAN) ==========

export function segmenPeriode(keuanganTransaksi, rentang, granularitas = "bulan") {
  const buckets = [];
  const akhir = parseTanggalLokal(rentang.selesai);
  let d = parseTanggalLokal(rentang.mulai);
  if (!d || !akhir) return [];

  if (granularitas === "hari") {
    while (d <= akhir) {
      buckets.push({
        mulai: fmt(d),
        selesai: fmt(d),
        label: d.toLocaleDateString("id-ID", { weekday: "short", day: "numeric" }),
      });
      d = tambahHari(d, 1);
    }
  } else if (granularitas === "minggu") {
    while (d <= akhir) {
      const calonAkhir = tambahHari(d, 6);
      const selesaiSegmen = calonAkhir > akhir ? akhir : calonAkhir;
      buckets.push({
        mulai: fmt(d),
        selesai: fmt(selesaiSegmen),
        label: `${d.getDate()}–${selesaiSegmen.getDate()} ${selesaiSegmen.toLocaleDateString(
          "id-ID",
          { month: "short" }
        )}`,
      });
      d = tambahHari(selesaiSegmen, 1);
    }
  } else {
    d = awalBulan(d);
    while (d <= akhir) {
      const akhirSegmen = akhirBulan(d);
      const selesaiSegmen = akhirSegmen > akhir ? akhir : akhirSegmen;
      buckets.push({
        mulai: fmt(d),
        selesai: fmt(selesaiSegmen),
        label: d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" }),
      });
      d = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    }
  }

  const flat = flattenTransaksi(keuanganTransaksi);

  return buckets.map((b) => {
    const total = { masuk: 0, keluar: 0, tabungan: 0, sedekah: 0 };
    let jumlahTrx = 0;
    flat.forEach((t) => {
      if (t.tanggal < b.mulai || t.tanggal > b.selesai) return;
      jumlahTrx++;
      if (total[t.jenis] !== undefined) total[t.jenis] += t.nominal;
    });
    return {
      ...b,
      ...total,
      net: total.masuk - total.keluar - total.tabungan - total.sedekah,
      jumlahTrx,
    };
  });
}

// ========== TOP KATEGORI ==========

export function topKategoriPeriode(list, kategoriList = {}, dompetList = [], batas = 5) {
  const totalKeluar = list
    .filter((t) => t.jenis === "keluar" || t.jenis === "sedekah")
    .reduce((sum, t) => sum + t.nominal, 0);

  const grouped = {};
  list.forEach((t) => {
    if (t.jenis !== "keluar" && t.jenis !== "sedekah") return;
    const nama = namaKategoriTransaksi(t, kategoriList, dompetList);
    if (!grouped[nama]) grouped[nama] = { kategori: nama, total: 0, jumlah: 0 };
    grouped[nama].total += t.nominal;
    grouped[nama].jumlah++;
  });

  return Object.values(grouped)
    .map((g) => ({
      ...g,
      persen: totalKeluar > 0 ? Math.round((g.total / totalKeluar) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, batas);
}

// ========== INSIGHT ==========

function buatInsight({ sekarang, lalu, banding, segmen, top, labelPeriode, labelPembanding }) {
  const insight = [];

  if (sekarang.jumlahTrx === 0) {
    insight.push({
      tipe: "info",
      pesan: `Belum ada transaksi tercatat di ${labelPeriode}.`,
    });
    return insight;
  }

  const keluarSekarang = sekarang.total.keluar + sekarang.total.sedekah;
  const keluarLalu = lalu.total.keluar + lalu.total.sedekah;

  if (lalu.jumlahTrx === 0) {
    insight.push({
      tipe: "info",
      pesan: `Belum ada data pembanding (${labelPembanding}), jadi angka ini jadi patokan awal.`,
    });
  } else if (keluarSekarang > keluarLalu) {
    insight.push({
      tipe: "warning",
      pesan: `Pengeluaran naik ${Math.abs(banding.keluar.persen)}% (Rp ${Math.abs(
        banding.keluar.selisih
      ).toLocaleString("id-ID")} lebih besar dari ${labelPembanding}).`,
    });
  } else if (keluarSekarang < keluarLalu) {
    insight.push({
      tipe: "success",
      pesan: `Pengeluaran turun ${Math.abs(banding.keluar.persen)}% dibanding ${labelPembanding}.`,
    });
  } else {
    insight.push({ tipe: "info", pesan: "Pengeluaran sama dengan periode sebelumnya." });
  }

  const terburuk = segmen
    .filter((s) => s.keluar > 0)
    .sort((a, b) => b.keluar - a.keluar)[0];
  if (terburuk) {
    insight.push({
      tipe: "danger",
      pesan: `Paling jeblok di ${terburuk.label}: keluar ${terburuk.keluar.toLocaleString(
        "id-ID"
      )} rupiah, net ${terburuk.net.toLocaleString("id-ID")} rupiah.`,
    });
  }

  if (sekarang.net < 0) {
    insight.push({
      tipe: "danger",
      pesan: `Cash flow minus ${Math.abs(sekarang.net).toLocaleString(
        "id-ID"
      )} rupiah — keluar + tabungan + sedekah lebih besar dari pemasukan.`,
    });
  } else if (sekarang.total.masuk > 0) {
    insight.push({
      tipe: "success",
      pesan: `Cash flow positif ${sekarang.net.toLocaleString("id-ID")} rupiah dari pemasukan ${sekarang.total.masuk.toLocaleString(
        "id-ID"
      )} rupiah.`,
    });
  }

  if (top.length > 0) {
    insight.push({
      tipe: "info",
      pesan: `Paling banyak keluar ke ${top[0].kategori}: ${top[0].total.toLocaleString(
        "id-ID"
      )} rupiah (${top[0].persen}% dari pengeluaran).`,
    });
  }

  return insight;
}

// ========== ANALISIS LENGKAP (DIPAKAI UI) ==========

export function analisisRiwayat(
  keuanganTransaksi,
  kunci,
  {
    kategoriList = undefined,
    dompetList = DEFAULT_DOMPET,
    hariIni = getTanggalHariIniLokal(),
    mulai,
    selesai,
  } = {}
) {
  const dasar = PERIODE_RIWAYAT.find((p) => p.kunci === kunci) || PERIODE_RIWAYAT[1];

  // Rentang sendiri: tanggal dipilih user, pembandingnya rentang sama panjang
  // tepat sebelumnya. Kalau tanggalnya belum lengkap, jatuh ke bulan ini.
  let periode = dasar;
  let rentang;
  let rentangLalu;
  if (dasar.kunci === "custom") {
    const bebas = rentangBebas(mulai, selesai);
    rentang = bebas || getRentangRiwayat("bulan", hariIni, 0);
    rentangLalu = bebas
      ? rentangSebelumnya(bebas)
      : getRentangRiwayat("bulan", hariIni, 1);
    periode = { ...dasar, granularitas: granularitasRentang(rentang) };
  } else {
    rentang = getRentangRiwayat(periode.kunci, hariIni, 0);
    rentangLalu = getRentangRiwayat(periode.kunci, hariIni, 1);
  }

  const sekarang = ringkasPeriode(keuanganTransaksi, rentang);
  const lalu = ringkasPeriode(keuanganTransaksi, rentangLalu);
  const segmen = segmenPeriode(keuanganTransaksi, rentang, periode.granularitas);
  const segmenLalu = segmenPeriode(keuanganTransaksi, rentangLalu, periode.granularitas);
  const top = topKategoriPeriode(sekarang.list, kategoriList, dompetList);
  const banding = bandingkan(sekarang, lalu);

  const labelPeriode = labelRentang(rentang);
  const labelPembanding = labelRentang(rentangLalu);

  const hasil = {
    periode,
    rentang,
    rentangLalu,
    labelPeriode,
    labelPembanding,
    sekarang,
    lalu,
    segmen,
    segmenLalu,
    top,
    banding,
  };

  return {
    ...hasil,
    insight: buatInsight({ ...hasil, top }),
    penjelasan: buatPenjelasan(hasil, { kategoriList, dompetList }),
  };
}
