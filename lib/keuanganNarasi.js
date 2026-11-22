// lib/keuanganNarasi.js
// Penjelasan keuangan dalam bahasa manusia, bukan cuma angka.
//
// Tujuan: menjawab "kenapa periodenya begini, apa yang harus dilakukan, dan
// apa yang harus dijaga". Semua kalimat di sini dihitung dari transaksi yang
// benar-benar ada (bukan karangan), lalu dipetakan ke saran yang masuk akal
// untuk kategori pengeluarannya.

import { formatRupiah, namaKategoriTransaksi } from "./keuanganData.js";

// Saran per jenis pengeluaran. Angkanya tetap dihitung dari data; teksnya
// hanya memberi cara konkret untuk memangkas.
const POLA_SARAN = [
  {
    pola: /rokok|vape|tembakau|sigaret|gudang garam|sampoerna|djarum|marlboro|dunhill/i,
    saran: (potong) =>
      `Rokok/vape termasuk pengeluaran yang bisa dipangkas tanpa mengurangi kebutuhan. Kurangi setengah porsi dulu, misalnya tinggal satu bungkus untuk dua hari — hemat sekitar ${formatRupiah(potong)}.`,
  },
  {
    pola: /kopi|coffee|kafe|cafe|starbucks|janji jiwa|kopi kenangan|kopic|tomoro/i,
    saran: (potong) =>
      `Kopi bisa lebih murah tanpa mengubah kebiasaan: buat sendiri 3–4 hari dalam seminggu, sisanya baru beli di luar. Dengan cara itu sekitar ${formatRupiah(potong)} bisa diselamatkan.`,
  },
  {
    pola: /makan|warung|resto|restoran|food|jajan|kudapan|snack|gofood|grabfood|shopeefood/i,
    saran: (potong) =>
      `Untuk makan, bawa bekal 2 hari seminggu dan sisakan 1 hari untuk jajan. Pola ini biasanya memotong sekitar ${formatRupiah(potong)} dari pos ini.`,
  },
  {
    pola: /transport|ojek|ojol|grab|gojek|bensin|bbm|parkir|tol|tiket/i,
    saran: (potong) =>
      `Gabungkan perjalanan dalam satu rute dan kurangi 2 perjalanan yang bisa ditunda. Perkiraan penghematan: ${formatRupiah(potong)}.`,
  },
  {
    pola: /belanja|shopee|tokopedia|lazada|tiktok shop|online|marketplace|ecommerce/i,
    saran: (potong) =>
      `Terapkan aturan "tunda 24 jam" sebelum checkout. Barang yang tetap dibeli setelah sehari biasanya memang perlu — sisanya bisa menghemat sekitar ${formatRupiah(potong)}.`,
  },
  {
    pola: /game|hiburan|nonton|langganan|subscription|netflix|spotify|youtube premium|disney/i,
    saran: (potong) =>
      `Cek langganan yang jarang dipakai, lalu hentikan satu yang paling jarang dibuka. Itu saja sudah menghemat sekitar ${formatRupiah(potong)}.`,
  },
  {
    pola: /listrik|air|internet|wifi|pulsa|kuota|token/i,
    saran: (potong) =>
      `Untuk tagihan rutin, pilih paket yang sesuai pemakaian nyata (bukan paket terbesar). Selisihnya bisa mencapai ${formatRupiah(potong)}.`,
  },
  {
    pola: /kesehatan|obat|dokter|klinik|vitamin|gym|olahraga/i,
    saran: () =>
      "Pengeluaran kesehatan sebaiknya tidak dipotong. Kalau angkanya naik, cek apakah ada yang bisa dicegah dengan pola tidur dan makan yang lebih teratur.",
  },
  {
    pola: /sedekah|donasi|zakat|infaq/i,
    saran: () =>
      "Sedekah jangan dikorbankan demi angka. Kalau cash flow sedang berat, kecilkan nominalnya sebentar, bukan dihentikan.",
  },
  {
    pola: /cicilan|hutang|utang|kredit|paylater|pinjaman/i,
    saran: (potong) =>
      `Cicilan/hutang adalah prioritas pertama: jangan sampai telat. Kalau ada sisa, alihkan sekitar ${formatRupiah(potong)} untuk pelunasan lebih cepat.`,
  },
];

function saranUntuk(nama, potong) {
  for (const aturan of POLA_SARAN) {
    if (aturan.pola.test(String(nama || ""))) return aturan.saran(potong);
  }
  return `Tetapkan plafon untuk pos "${nama}" dan berhenti kalau plafonnya habis — sekitar ${formatRupiah(potong)} bisa dihemat dari sini.`;
}

function kelompokkan(list, kategoriList, dompetList) {
  const peta = new Map();
  for (const trx of list) {
    if (trx.jenis !== "keluar" && trx.jenis !== "sedekah") continue;
    const nama = namaKategoriTransaksi(trx, kategoriList, dompetList) || "Lainnya";
    peta.set(nama, (peta.get(nama) || 0) + trx.nominal);
  }
  return peta;
}

const kapital = (teks) => {
  const t = String(teks || "");
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : t;
};

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
      pemicu: [],
      saran: [
        "Mulai dari yang paling sering: catat makan, transport, dan jajan hari ini.",
        "Catat juga pemasukan sekecil apa pun, supaya persentase tabungan bisa dihitung.",
      ],
      pertahankan: [],
      target: null,
    };
  }

  const sekarangKategori = kelompokkan(sekarang.list, kategoriList, dompetList);
  const laluKategori = kelompokkan(lalu?.list || [], kategoriList, dompetList);

  const semua = [...sekarangKategori.entries()]
    .map(([kategori, total]) => {
      const sebelumnya = laluKategori.get(kategori) || 0;
      return {
        kategori,
        total,
        sebelumnya,
        delta: total - sebelumnya,
        porsi: keluarSekarang > 0 ? Math.round((total / keluarSekarang) * 100) : 0,
      };
    })
    .sort((a, b) => b.total - a.total);

  const pemicu = semua.slice(0, 4).map((item) => ({
    ...item,
    saran: saranUntuk(item.kategori, Math.round(item.total * 0.2)),
  }));

  const defisit = net < 0;
  const selisihKeluar = keluarSekarang - keluarLalu;
  const persenKeluar =
    keluarLalu > 0 ? Math.round((selisihKeluar / keluarLalu) * 100) : null;

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

  if (pemicu.length > 0) {
    const utama = pemicu[0];
    const naik = pemicu.filter((p) => p.delta > 0).slice(0, 3);
    let kalimat = `Penyebab terbesarnya ${utama.kategori} (${formatRupiah(
      utama.total
    )}, ${utama.porsi}% dari pengeluaran)`;
    if (naik.length > 0) {
      kalimat += `, dan yang naik dibanding ${labelPembanding}: ${naik
        .map((p) => `${p.kategori} +${formatRupiah(p.delta)}`)
        .join(", ")}`;
    }
    bagian.push(`${kalimat}.`);
  }

  if (persenKeluar !== null && persenKeluar !== 0) {
    bagian.push(
      persenKeluar > 0
        ? `Total pengeluaran naik ${Math.abs(persenKeluar)}% dari ${labelPembanding}.`
        : `Total pengeluaran turun ${Math.abs(persenKeluar)}% dari ${labelPembanding}.`
    );
  }

  // Saran: satu per pemicu utama (maks 3), lalu tambahan sesuai kondisi.
  const saran = [];
  for (const item of pemicu.slice(0, 3)) {
    const teks = item.saran;
    if (teks && !saran.includes(teks)) saran.push(teks);
  }

  const idealTabungan = Math.round((masuk * 0.1) / 1000) * 1000;
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
      )} dengan memangkas pos terbesar dulu, bukan memotong tabungan.`
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

  // Yang harus dipertahankan supaya goals tetap terisi.
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
  if (pemicu.some((p) => p.delta < 0)) {
    const turun = pemicu.filter((p) => p.delta < 0)[0];
    pertahankan.push(
      `${turun.kategori} berhasil turun ${formatRupiah(
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
    pemicu,
    saran: saran.slice(0, 5),
    pertahankan: pertahankan.slice(0, 4),
    target,
  };
}
