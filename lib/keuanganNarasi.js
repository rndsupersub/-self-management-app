// lib/keuanganNarasi.js
// Penjelasan keuangan dalam bahasa manusia, bukan cuma angka.
//
// Tujuan: menjawab "kenapa periodenya begini, pos/item apa yang bikin jebol,
// apa yang harus dilakukan, dan apa yang harus dijaga". Semua kalimat dihitung
// dari transaksi yang benar-benar ada, bukan karangan.
//
// Penting: yang disebut sebagai penyebab bukan cuma nama dompet ("Dana Main"),
// tapi juga jenis pengeluarannya ("rokok", "kopi", "makan") — dibaca dari
// catatan transaksi dan nama kategorinya. Jadi kalimatnya langsung nyambung
// dengan yang user rasakan sendiri.

import { formatRupiah, namaKategoriTransaksi } from "./keuanganData.js";

const bulatkan = (n) => Math.round(n / 1000) * 1000;

const kapital = (teks) => {
  const t = String(teks || "");
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : t;
};

// Jenis pengeluaran yang paling sering bikin over budget. `rasio` = bagian
// yang realistis dipangkas tanpa mengorbankan kebutuhan (0 = jangan dipotong).
export const JENIS_PENGELUARAN = [
  {
    id: "rokok",
    label: "Rokok/Vape",
    pola: /rokok|vape|tembakau|sigaret|gudang garam|sampoerna|djarum|marlboro|dunhill|juul|pod/i,
    rasio: 0.4,
    aksi: "kurangi setengahnya dulu (mis. 1 bungkus jadi 3 hari sekali)",
  },
  {
    id: "kopi",
    label: "Kopi",
    pola: /kopi|coffee|kafe|cafe|starbucks|janji jiwa|kopi kenangan|tomoro|kopic/i,
    rasio: 0.4,
    aksi: "buat sendiri 3–4 hari seminggu, sisanya baru beli di luar",
  },
  {
    id: "makan",
    label: "Makan/Jajan",
    pola: /makan|warung|resto|restoran|food|jajan|kudapan|snack|gofood|grabfood|shopeefood|beverage|minum/i,
    rasio: 0.25,
    aksi: "bawa bekal 2 hari seminggu dan tetap sisakan 1 hari untuk jajan",
  },
  {
    id: "transport",
    label: "Transport",
    pola: /transport|ojek|ojol|grab|gojek|bensin|bbm|parkir|tol|tiket|krl|mrt/i,
    rasio: 0.2,
    aksi: "gabungkan perjalanan dalam satu rute dan tunda 2 perjalanan yang tidak mendesak",
  },
  {
    id: "belanja",
    label: "Belanja Online",
    pola: /belanja|shopee|tokopedia|lazada|tiktok shop|online|marketplace|ecommerce|checkout/i,
    rasio: 0.3,
    aksi: "pakai aturan tunda 24 jam sebelum checkout; yang tetap dibeli setelah sehari biasanya memang perlu",
  },
  {
    id: "hiburan",
    label: "Hiburan & Langganan",
    pola: /game|top up|topup|hiburan|nonton|langganan|subscription|netflix|spotify|youtube premium|disney|steam/i,
    rasio: 0.5,
    aksi: "hentikan satu langganan yang paling jarang dibuka, dan batasi top up jadi sekali sebulan",
  },
  {
    id: "tagihan",
    label: "Tagihan",
    pola: /listrik|air|internet|wifi|pulsa|kuota|token|iuran/i,
    rasio: 0.15,
    aksi: "pilih paket sesuai pemakaian nyata, bukan paket terbesar",
  },
  {
    id: "kesehatan",
    label: "Kesehatan",
    pola: /kesehatan|obat|dokter|klinik|vitamin|gym|olahraga|asuransi/i,
    rasio: 0,
    aksi: "jangan dipotong; kalau naik, cek pemicunya (pola tidur/makan) supaya tidak berulang",
  },
  {
    id: "sedekah",
    label: "Sedekah",
    pola: /sedekah|donasi|zakat|infaq/i,
    rasio: 0,
    aksi: "jangan dihentikan; kalau cash flow berat, kecilkan nominalnya sebentar",
  },
  {
    id: "cicilan",
    label: "Cicilan/Hutang",
    pola: /cicilan|hutang|utang|kredit|paylater|pinjaman/i,
    rasio: 0,
    aksi: "jangan sampai telat; kalau ada sisa, alihkan ke pelunasan lebih cepat",
  },
];

const POLA_LAIN = {
  rasio: 0.2,
  aksi: "buka 2 transaksi terbesar di pos ini, lalu pilih satu yang bisa ditunda atau dikurangi",
};

function cariJenis(nama, catatan) {
  const teks = `${nama || ""} ${catatan || ""}`;
  return JENIS_PENGELUARAN.find((j) => j.pola.test(teks)) || null;
}

// Kelompokkan pengeluaran per JENIS (rokok, kopi, ...) dan sisanya per pos.
function kelompokkanItem(list, kategoriList, dompetList) {
  const peta = new Map();
  for (const trx of list) {
    if (trx.jenis !== "keluar" && trx.jenis !== "sedekah") continue;
    const pos = namaKategoriTransaksi(trx, kategoriList, dompetList) || "Lainnya";
    const jenis = cariJenis(pos, trx.catatan);
    const id = jenis ? jenis.id : `pos:${pos}`;
    const label = jenis ? jenis.label : pos;
    const ada = peta.get(id) || { id, label, total: 0, jumlah: 0, jenis };
    ada.total += trx.nominal;
    ada.jumlah += 1;
    peta.set(id, ada);
  }
  return peta;
}

function daftarItem(peta, totalKeluar) {
  return [...peta.values()]
    .map((item) => {
      const rasio = item.jenis ? item.jenis.rasio : POLA_LAIN.rasio;
      const aksi = item.jenis ? item.jenis.aksi : POLA_LAIN.aksi;
      return {
        ...item,
        porsi: totalKeluar > 0 ? Math.round((item.total / totalKeluar) * 100) : 0,
        rasio,
        aksi,
        potong: rasio > 0 ? bulatkan(item.total * rasio) : 0,
      };
    })
    .sort((a, b) => b.total - a.total);
}

function gabungNominal(daftar, batas = 3) {
  if (daftar.length === 0) return "";
  const bagian = daftar
    .slice(0, batas)
    .map((d) => `${d.label} ${formatRupiah(d.total)} (${d.porsi}%)`);
  if (daftar.length > batas) bagian.push(`${daftar.length - batas} pos lain`);
  return bagian.join(", ");
}

export function buatPenjelasan(analisis, { kategoriList, dompetList } = {}) {
  const { sekarang, lalu, labelPeriode, labelPembanding, periode } = analisis || {};
  if (!sekarang) return null;

  const sebutan = labelPeriode || periode?.label || "Periode ini";
  const keluarSekarang = sekarang.total.keluar + sekarang.total.sedekah;
  const keluarLalu = (lalu?.total?.keluar || 0) + (lalu?.total?.sedekah || 0);
  const masuk = sekarang.total.masuk;
  const tabungan = sekarang.total.tabungan;
  const net = sekarang.net;

  if (sekarang.jumlahTrx === 0) {
    return {
      judul: `Penjelasan ${sebutan}`,
      status: "kosong",
      ringkas: `Belum ada transaksi di ${sebutan}. Catat pemasukan dan pengeluaran dulu supaya penjelasan ini bisa menghitung kebiasaanmu.`,
      penyebab: [],
      pemicu: [],
      saran: [
        "Mulai dari yang paling sering: catat makan, transport, dan jajan hari ini.",
        "Catat juga pemasukan sekecil apa pun, supaya persentase tabungan bisa dihitung.",
      ],
      pertahankan: [],
      hematTotal: 0,
      target: null,
    };
  }

  const petaSekarang = kelompokkanItem(sekarang.list, kategoriList, dompetList);
  const petaLalu = kelompokkanItem(lalu?.list || [], kategoriList, dompetList);
  const itemSekarang = daftarItem(petaSekarang, keluarSekarang);

  const penyebab = itemSekarang.slice(0, 6).map((item) => ({
    ...item,
    sebelumnya: petaLalu.get(item.id)?.total || 0,
    delta: item.total - (petaLalu.get(item.id)?.total || 0),
  }));

  const defisit = net < 0;
  const selisihKeluar = keluarSekarang - keluarLalu;
  const persenKeluar = keluarLalu > 0 ? Math.round((selisihKeluar / keluarLalu) * 100) : null;

  // ---- Ringkasan: status, lalu siapa penyebabnya (dengan nama barang) ----
  const bagian = [];
  if (defisit) {
    bagian.push(
      `${kapital(sebutan)} over budget: pengeluaran ${formatRupiah(
        keluarSekarang
      )} lebih besar dari pemasukan ${formatRupiah(masuk)}, kurang ${formatRupiah(
        Math.abs(net)
      )}.`
    );
  } else if (masuk > 0) {
    bagian.push(
      `${kapital(sebutan)} masih surplus ${formatRupiah(net)} dari pemasukan ${formatRupiah(
        masuk
      )} dan pengeluaran ${formatRupiah(keluarSekarang)}.`
    );
  } else {
    bagian.push(
      `${kapital(sebutan)} hanya berisi pengeluaran ${formatRupiah(keluarSekarang)} tanpa pemasukan tercatat.`
    );
  }

  if (penyebab.length > 0) {
    bagian.push(`Penyebab terbesarnya: ${gabungNominal(penyebab)}.`);
  }

  const naik = penyebab.filter((p) => p.delta > 0).sort((a, b) => b.delta - a.delta).slice(0, 3);
  if (naik.length > 0) {
    bagian.push(
      `Yang naik dibanding ${labelPembanding}: ${naik
        .map((p) => `${p.label} +${formatRupiah(p.delta)}`)
        .join(", ")}.`
    );
  }

  if (persenKeluar !== null && persenKeluar !== 0) {
    bagian.push(
      persenKeluar > 0
        ? `Total pengeluaran naik ${Math.abs(persenKeluar)}% dari ${labelPembanding}.`
        : `Total pengeluaran turun ${Math.abs(persenKeluar)}% dari ${labelPembanding}.`
    );
  }

  // ---- Cara menghemat: satu kalimat pendek per item, plus angkanya ----
  const saran = [];
  const denganPotongan = penyebab.filter((p) => p.potong > 0);
  const tanpaPotongan = penyebab.filter((p) => p.potong === 0 && p.rasio === 0);

  for (const item of denganPotongan.slice(0, 4)) {
    saran.push(
      `${item.label} ${formatRupiah(item.total)}: ${item.aksi} → hemat ± ${formatRupiah(
        item.potong
      )}.`
    );
  }
  for (const item of tanpaPotongan.slice(0, 2)) {
    saran.push(`${item.label}: ${item.aksi}.`);
  }

  const hematTotal = denganPotongan.reduce((acc, item) => acc + item.potong, 0);
  if (hematTotal > 0) {
    saran.push(
      defisit
        ? `Kalau semua langkah di atas jalan, terkumpul ± ${formatRupiah(
            hematTotal
          )} — ${hematTotal >= Math.abs(net) ? "cukup" : "belum cukup"} untuk menutup kurang ${formatRupiah(
            Math.abs(net)
          )}.`
        : `Kalau semua langkah di atas jalan, ada tambahan ± ${formatRupiah(
            hematTotal
          )} yang bisa dipindah ke tabungan.`
    );
  }

  const idealTabungan = bulatkan(masuk * 0.1);
  if (masuk > 0 && tabungan < idealTabungan) {
    saran.push(
      `Sisihkan tabungan di awal, bukan dari sisa: target 10% pemasukan = ${formatRupiah(
        idealTabungan
      )}. Sekarang baru ${formatRupiah(tabungan)}; kurang ${formatRupiah(
        idealTabungan - tabungan
      )}.`
    );
  }
  if (defisit) {
    saran.push(
      `Tutup kekurangan ${formatRupiah(
        Math.abs(net)
      )} dengan memangkas pos terbesar dulu, jangan memotong tabungan.`
    );
  }
  if (periode?.granularitas === "hari" && sekarang.hariAktif > 0) {
    const perHari = Math.round(keluarSekarang / sekarang.hariAktif);
    saran.push(
      `Rata-rata pengeluaran ${formatRupiah(
        perHari
      )} per hari aktif. Pasang plafon harian di angka itu, lalu turunkan perlahan 5–10%.`
    );
  }

  // ---- Yang harus dipertahankan ----
  const pertahankan = [];
  if (tabungan > 0) {
    pertahankan.push(
      `Konsisten menabung ${formatRupiah(
        tabungan
      )} di periode ini — jadikan kebiasaan tetap, bukan sekali jalan.`
    );
  }
  if (sekarang.total.sedekah > 0) {
    pertahankan.push(
      `Sedekah ${formatRupiah(sekarang.total.sedekah)} tetap jalan; itu bagian yang tidak perlu dikorbankan.`
    );
  }
  if (net > 0) {
    pertahankan.push(
      `Surplus ${formatRupiah(net)} sebaiknya langsung dipindah ke tabungan/tujuan, jangan dibiarkan di dompet harian.`
    );
  }
  const turun = penyebab.filter((p) => p.delta < 0).sort((a, b) => a.delta - b.delta)[0];
  if (turun) {
    pertahankan.push(
      `${turun.label} berhasil turun ${formatRupiah(
        Math.abs(turun.delta)
      )} dibanding ${labelPembanding} — pertahankan polanya.`
    );
  }
  if (pertahankan.length === 0) {
    pertahankan.push(
      "Belum ada pola yang bisa dijaga. Mulai dari satu kebiasaan kecil: menabung nominal tetap setiap menerima pemasukan."
    );
  }

  const target =
    masuk > 0
      ? {
          ideal: idealTabungan,
          sekarang: tabungan,
          selisih: Math.max(0, idealTabungan - tabungan),
          pesan:
            tabungan >= idealTabungan
              ? `Tabungan ${formatRupiah(tabungan)} sudah di atas target 10% (${formatRupiah(
                  idealTabungan
                )}). Pertahankan dan jangan dipakai untuk konsumsi.`
              : `Target tabungan 10% = ${formatRupiah(
                  idealTabungan
                )}. Tambah ${formatRupiah(
                  Math.max(0, idealTabungan - tabungan)
                )} lagi supaya goals tetap terisi.`,
        }
      : null;

  return {
    judul: `Penjelasan ${sebutan}`,
    status: defisit ? "defisit" : "surplus",
    ringkas: bagian.join(" "),
    penyebab,
    hematTotal,
    // Dipertahankan untuk pemakai lama (Telegram/ekspor): ringkasan per pos.
    pemicu: penyebab.map((p) => ({
      kategori: p.label,
      total: p.total,
      sebelumnya: p.sebelumnya,
      delta: p.delta,
      porsi: p.porsi,
      saran: `${p.label}: ${p.aksi}.${p.potong > 0 ? ` Potensi hemat ${formatRupiah(p.potong)}.` : ""}`,
    })),
    saran: saran.slice(0, 6),
    pertahankan: pertahankan.slice(0, 4),
    target,
  };
}
