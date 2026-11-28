// lib/kegiatanVendor.js
//
// Nyambungin kegiatan ke vendor TERPILIH berdasarkan bukti yang sudah ada,
// bukan cuma tebakan dari nama:
//
// 1. Nama vendor disebut di judul / catatan / catatan section kegiatan.
// 2. Isi log kunjungan vendor menyebut hal yang sama dengan kegiatan
//    (tujuan kunjungan, hasil, atau catatan kunjungan).
// 3. Catatan / alamat profil vendor menyebut hal yang sama dengan kegiatan.
//
// Fungsi ini TIDAK mengubah data. Semua kandidat dikembalikan berurutan dari
// yang paling kuat, jadi UI bisa menampilkan beberapa rekomendasi sekaligus:
// kalau saran otomatis ternyata salah, user tinggal pilih vendor lain dari
// daftar rekomendasi (bukan cuma menerima/menolak satu tebakan).
//
// Contoh nyata: kegiatan "Controlling" di brand Handgrips, dan vendor Pawsteel
// punya beberapa kunjungan dengan tujuan "Controlling".

import { DEFAULT_TUJUAN_KUNJUNGAN } from "./vendorData.js";

// Kata yang terlalu umum: kalau ikut dicocokkan, semua vendor bisa jadi saran.
const KATA_ABAIKAN = new Set([
  "dan", "atau", "yang", "untuk", "dengan", "dari", "pada", "dalam", "ini",
  "itu", "the", "of", "to", "an", "di", "ke", "per", "oleh", "agar", "biar",
  "jadi", "sudah", "belum", "masih", "juga", "akan", "bisa", "vendor",
  "kegiatan", "proyek", "kerja", "untuk", "serta", "kepada", "sebagai",
  "hari", "tanggal", "minggu", "bulan", "tahun", "baru", "lama", "segala",
  "lain", "lainnya", "semua", "sama", "saja", "sangat", "lebih", "paling",
]);

// Sinonim yang sering dipakai campur Indonesia/Inggris. Tanpa ini, kegiatan
// "Controlling" nggak bakal cocok dengan tujuan kunjungan "Kontrol Timeline"
// (id `kontrol`) — persis kasus yang bikin Pawsteel nggak muncul.
const SINONIM = {
  control: "kontrol", controlling: "kontrol", controller: "kontrol",
  controls: "kontrol", pengawasan: "kontrol",
  supervisi: "kontrol", supervise: "kontrol", supervising: "kontrol",
  timeline: "kontrol", progres: "kontrol", progress: "kontrol",
  production: "produksi", produksi: "produksi",
  packaging: "kemasan", packing: "kemasan", kemasan: "kemasan",
  design: "desain", desain: "desain",
  meeting: "rapat", rapat: "rapat", koordinasi: "rapat", coordination: "rapat",
  negotiation: "negosiasi", negotiating: "negosiasi", negosiasi: "negosiasi",
  evaluation: "evaluasi", evaluating: "evaluasi", evaluasi: "evaluasi",
  scanning: "scan", scan: "scan",
  delivery: "kirim", pengiriman: "kirim", shipping: "kirim", kirim: "kirim",
  quality: "kualitas", kualitas: "kualitas",
  sample: "trial", sampling: "trial", sampel: "trial",
  material: "bahan", bahan: "bahan", baku: "bahan",
};

function kanonik(kata) {
  return SINONIM[kata] || kata;
}

function tokenSet(teks) {
  const hasil = new Set();
  String(teks || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .forEach((kata) => {
      if (kata.length < 3 || KATA_ABAIKAN.has(kata)) return;
      hasil.add(kanonik(kata));
    });
  return hasil;
}

function tokenCocok(a, b) {
  if (!a || !b) return false;
  if (a === b) return true;
  // "controlling" vs "control", "packaging" vs "packing" — masih dianggap sama.
  if (a.length >= 5 && b.length >= 5 && (a.includes(b) || b.includes(a))) return true;
  return false;
}

function adaKecocokan(tokenA, tokenB) {
  for (const a of tokenA) {
    for (const b of tokenB) {
      if (tokenCocok(a, b)) return true;
    }
  }
  return false;
}

function kataKecocokan(tokenA, tokenB) {
  const hasil = new Set();
  for (const a of tokenA) {
    for (const b of tokenB) {
      if (tokenCocok(a, b)) {
        // Tampilkan kata dari sisi kegiatan biar alasan mudah dibaca user.
        hasil.add(a);
      }
    }
  }
  return [...hasil];
}

function labelTujuan(tujuanId, tujuanList) {
  if (!tujuanId) return "";
  const daftar = Array.isArray(tujuanList) && tujuanList.length > 0 ? tujuanList : DEFAULT_TUJUAN_KUNJUNGAN;
  return daftar.find((t) => t.id === tujuanId)?.label || "";
}

function labelBersih(label) {
  return String(label || "").replace(/^[^\w\s]+\s*/, "").trim();
}

// Semua teks kegiatan yang boleh jadi bukti relasi.
function teksKegiatan(kegiatan, kategoriNama = "") {
  const bagian = [kegiatan?.judul, kegiatan?.catatan, kategoriNama];

  const sections = kegiatan?.sections;
  if (Array.isArray(sections)) {
    sections.forEach((c) => bagian.push(typeof c === "string" ? c : c?.teks));
  } else if (sections && typeof sections === "object") {
    Object.values(sections).forEach((daftar) => {
      if (!Array.isArray(daftar)) return;
      daftar.forEach((c) => bagian.push(typeof c === "string" ? c : c?.teks));
    });
  }

  return bagian.filter(Boolean).join(" ");
}

// Semua teks profil vendor yang boleh jadi bukti (tanpa nama, nama sudah
// dihitung sebagai bukti terkuat).
function teksProfilVendor(vendor) {
  return [vendor?.catatan, vendor?.alamat, vendor?.kontak?.nama]
    .filter(Boolean)
    .join(" ");
}

function kandidatDariVendor(vendor, tokenKegiatan, tujuanKunjunganList) {
  if (!vendor?.nama) return null;

  const tokenNama = tokenSet(vendor.nama);
  const namaCocok = adaKecocokan(tokenNama, tokenKegiatan);

  let kunjunganCocok = 0;
  let tujuanCocok = 0;
  const kata = new Set();
  const tujuan = new Set();

  (vendor.logKunjungan || []).forEach((log) => {
    if (!log || typeof log !== "object") return;
    const label = labelTujuan(log.tujuanId, tujuanKunjunganList);
    const teksKunjungan = [label, log.tujuanId, log.hasil, log.catatan]
      .filter(Boolean)
      .join(" ");
    const tokenKunjungan = tokenSet(teksKunjungan);
    const kataCocok = kataKecocokan(tokenKunjungan, tokenKegiatan);
    if (kataCocok.length === 0) return;

    kunjunganCocok += 1;
    kataCocok.forEach((k) => kata.add(k));

    const tokenTujuan = tokenSet([label, log.tujuanId].filter(Boolean).join(" "));
    if (adaKecocokan(tokenTujuan, tokenKegiatan)) tujuanCocok += 1;

    const bersih = labelBersih(label);
    if (bersih) tujuan.add(bersih);
  });

  const tokenProfil = tokenSet(teksProfilVendor(vendor));
  const kataProfil = kataKecocokan(tokenProfil, tokenKegiatan);
  const profilCocok = kataProfil.length;

  if (!namaCocok && kunjunganCocok === 0 && profilCocok === 0) return null;

  const skor =
    (namaCocok ? 100 : 0) +
    Math.min(kunjunganCocok, 10) * 12 +
    (tujuanCocok > 0 ? 8 : 0) +
    Math.min(profilCocok, 3) * 5;

  return {
    vendor,
    skor,
    namaCocok,
    kunjunganCocok,
    tujuanCocok,
    profilCocok,
    kata: [...kata],
    tujuan: [...tujuan],
    // Saran "kuat" = nama disebut, minimal 2 kunjungan mendukung, atau
    // kunjungan tujuannya persis sama dengan kegiatan.
    kuat: namaCocok || kunjunganCocok >= 2 || (kunjunganCocok >= 1 && tujuanCocok >= 1),
  };
}

function susunAlasan(kandidat) {
  const alasan = [];
  if (kandidat.namaCocok) alasan.push("Nama vendor disebut di kegiatan.");
  if (kandidat.kunjunganCocok > 0) {
    const tujuan = kandidat.tujuan.slice(0, 3).join(", ");
    const kata = kandidat.kata.slice(0, 3).join(", ");
    alasan.push(
      `${kandidat.kunjunganCocok} kunjungan${
        tujuan ? ` (${tujuan})` : ""
      } punya isi yang sama dengan kegiatan${kata ? `: ${kata}` : ""}.`
    );
  }
  if (kandidat.profilCocok > 0 && !kandidat.namaCocok) {
    alasan.push(`Catatan profil vendor menyebut hal yang sama dengan kegiatan.`);
  }
  return alasan.join(" ");
}

// Semua vendor yang punya bukti terkait, urut dari yang paling kuat.
// `batas` membatasi jumlah hasil (default 5) supaya UI tetap ringkas.
export function cariSaranVendorKegiatanSemua({
  kegiatan,
  vendorList = [],
  kategoriNama = "",
  tujuanKunjunganList = DEFAULT_TUJUAN_KUNJUNGAN,
  batas = 5,
} = {}) {
  const tokenKegiatan = tokenSet(teksKegiatan(kegiatan, kategoriNama));
  if (tokenKegiatan.size === 0) return [];

  const kandidat = [];

  (vendorList || []).forEach((vendor) => {
    const hasil = kandidatDariVendor(vendor, tokenKegiatan, tujuanKunjunganList);
    if (hasil) kandidat.push({ ...hasil, alasan: susunAlasan(hasil) });
  });

  kandidat.sort((a, b) => {
    if (b.skor !== a.skor) return b.skor - a.skor;
    if (b.kunjunganCocok !== a.kunjunganCocok) return b.kunjunganCocok - a.kunjunganCocok;
    const akhirA = waktuKunjunganTerakhir(a.vendor);
    const akhirB = waktuKunjunganTerakhir(b.vendor);
    if (akhirA !== akhirB) return akhirB.localeCompare(akhirA);
    return String(a.vendor.nama).localeCompare(String(b.vendor.nama));
  });

  const maks = Number.isFinite(batas) && batas > 0 ? batas : kandidat.length;
  return kandidat.slice(0, maks);
}

function waktuKunjunganTerakhir(vendor) {
  let terakhir = "";
  (vendor?.logKunjungan || []).forEach((log) => {
    const tanggal = String(log?.tanggal || log?.createdAt || "");
    if (tanggal > terakhir) terakhir = tanggal;
  });
  return terakhir;
}

// ========== RELASI EFEKTIF KEGIATAN ↔ VENDOR ==========
// Sama seperti status vendor: relasi bisa OTOMATIS (dihitung dari bukti),
// MANUAL (dikunci user), atau INTERNAL (belum ada yang mengerjakan / riset &
// pengembangan, jadi sengaja tanpa vendor). Aturannya:
// - vendorMode "manual"   → pakai kegiatan.vendorId apa adanya.
// - vendorMode "internal" → tanpa vendor, tidak pernah ditebak otomatis.
// - vendorMode "otomatis" → pakai kandidat terkuat; kalau tidak ada bukti kuat,
//   relasi manual lama tetap dipakai supaya data lama tidak hilang.
// - Data lama tanpa vendorMode: kalau sudah punya vendorId dianggap manual
//   (jangan menimpa pilihan user), kalau belum punya baru otomatis.
export function vendorEfektifKegiatan({
  kegiatan,
  vendorList = [],
  kategoriNama = "",
  tujuanKunjunganList = DEFAULT_TUJUAN_KUNJUNGAN,
  hanyaKuat = true,
} = {}) {
  const manualId = kegiatan?.vendorId || "";
  const manualVendor = (vendorList || []).find((v) => v.id === manualId) || null;
  const modeEksplisit =
    kegiatan?.vendorMode === "manual" ||
    kegiatan?.vendorMode === "otomatis" ||
    kegiatan?.vendorMode === "internal"
      ? kegiatan.vendorMode
      : null;
  // Manual tanpa vendor = user memang memilih "tanpa vendor"; perlakukan
  // sebagai internal supaya tampil jelas dan tidak diisi saran otomatis.
  const mode = modeEksplisit || (manualId ? "manual" : "otomatis");

  // Mode internal: dikerjakan sendiri / riset & pengembangan / belum ada
  // vendor. Ini pilihan sadar user, jadi jangan pernah menebak vendor.
  if (mode === "internal" || (mode === "manual" && !manualId)) {
    return {
      mode: "internal",
      vendor: null,
      sumber: "",
      kandidat: [],
      otomatis: null,
      alasan: "Belum ada yang mengerjakan / riset & pengembangan, tanpa vendor.",
    };
  }

  const kandidat = cariSaranVendorKegiatanSemua({
    kegiatan,
    vendorList,
    kategoriNama,
    tujuanKunjunganList,
  });
  const otomatis = kandidat.find((s) => (hanyaKuat ? s.kuat : true)) || null;

  if (mode === "manual") {
    return {
      mode: "manual",
      vendor: manualVendor,
      sumber: manualVendor ? "manual" : "",
      kandidat,
      otomatis,
      alasan: manualVendor
        ? "Relasi dikunci manual oleh user."
        : "Mode manual, belum ada vendor yang dipilih.",
    };
  }

  const vendor = otomatis?.vendor || manualVendor || null;
  return {
    mode: "otomatis",
    vendor,
    sumber: otomatis ? "otomatis" : manualVendor ? "manual-lama" : "",
    kandidat,
    otomatis,
    alasan: otomatis
      ? otomatis.alasan
      : manualVendor
        ? "Belum ada bukti otomatis yang kuat, relasi manual lama tetap dipakai."
        : "Belum ada bukti yang cukup untuk memilih vendor otomatis.",
  };
}

// Versi lama: satu vendor terbaik. Tetap diekspor supaya pemakai lama aman.
export function cariSaranVendorKegiatan(opsi = {}) {
  const daftar = cariSaranVendorKegiatanSemua(opsi);
  return daftar[0] || null;
}
