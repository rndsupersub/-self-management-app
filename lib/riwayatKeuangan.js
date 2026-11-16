// lib/riwayatKeuangan.js
// Riwayat keuangan: minggu lalu, bulan lalu, 3 bulan, 6 bulan.
// Semua periode dihitung dari tanggal lokal (WIB), bukan toISOString,
// karena di UTC+7 `new Date(2026, 10, 1).toISOString()` jatuh ke 31 Oktober.
// Logika di sini murni (tanpa Firestore) biar bisa dipakai web & Telegram.

import { DEFAULT_DOMPET, flattenTransaksi, namaKategoriTransaksi } from "./keuanganData.js";
import {
  formatTanggalLokal,
  getTanggalHariIniLokal,
  parseTanggalLokal,
} from "./tanggalLokal.js";

const fmt = formatTanggalLokal;

export const PERIODE_RIWAYAT = [
  { kunci: "minggu-lalu", label: "Minggu Lalu", granularitas: "hari" },
  { kunci: "bulan-lalu", label: "Bulan Lalu", granularitas: "minggu" },
  { kunci: "3-bulan", label: "3 Bulan", granularitas: "bulan" },
  { kunci: "6-bulan", label: "6 Bulan", granularitas: "bulan" },
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

  if (kunci === "minggu-lalu") {
    const senin = tambahHari(seninDari(now), -7 * (geser + 1));
    return { mulai: fmt(senin), selesai: fmt(tambahHari(senin, 6)) };
  }

  const jumlahBulan = kunci === "bulan-lalu" ? 1 : kunci === "3-bulan" ? 3 : 6;
  const bulanAwalIni = awalBulan(now);
  const bulanAkhir = new Date(
    bulanAwalIni.getFullYear(),
    bulanAwalIni.getMonth() - 1 - jumlahBulan * geser,
    1
  );
  const bulanMulai = new Date(
    bulanAkhir.getFullYear(),
    bulanAkhir.getMonth() - (jumlahBulan - 1),
    1
  );

  return { mulai: fmt(bulanMulai), selesai: fmt(akhirBulan(bulanAkhir)) };
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

function formatPersen(nilai) {
  if (nilai === null || nilai === undefined) return "-";
  return `${nilai > 0 ? "+" : ""}${nilai}%`;
}

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
  { kategoriList = undefined, dompetList = DEFAULT_DOMPET, hariIni = getTanggalHariIniLokal() } = {}
) {
  const periode = PERIODE_RIWAYAT.find((p) => p.kunci === kunci) || PERIODE_RIWAYAT[0];
  const rentang = getRentangRiwayat(periode.kunci, hariIni, 0);
  const rentangLalu = getRentangRiwayat(periode.kunci, hariIni, 1);

  const sekarang = ringkasPeriode(keuanganTransaksi, rentang);
  const lalu = ringkasPeriode(keuanganTransaksi, rentangLalu);
  const segmen = segmenPeriode(keuanganTransaksi, rentang, periode.granularitas);
  const top = topKategoriPeriode(sekarang.list, kategoriList, dompetList);
  const banding = bandingkan(sekarang, lalu);

  const labelPeriode = labelRentang(rentang);
  const labelPembanding = labelRentang(rentangLalu);

  return {
    periode,
    rentang,
    rentangLalu,
    sekarang,
    lalu,
    segmen,
    top,
    banding,
    labelPeriode,
    labelPembanding,
    insight: buatInsight({ sekarang, lalu, banding, segmen, top, labelPeriode, labelPembanding }),
  };
}
