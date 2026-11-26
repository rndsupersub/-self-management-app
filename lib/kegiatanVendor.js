// lib/kegiatanVendor.js
//
// Nyambungin kegiatan ke vendor TERPILIH berdasarkan bukti yang sudah ada,
// bukan cuma tebakan dari nama:
//
// 1. Nama vendor disebut di judul / catatan / catatan section kegiatan.
// 2. Isi log kunjungan vendor menyebut hal yang sama dengan kegiatan
//    (tujuan kunjungan, hasil, atau catatan kunjungan).
//
// Contoh nyata: kegiatan "Controlling" di brand Handgrips, dan vendor Pawsteel
// punya beberapa kunjungan dengan tujuan "Controlling". Dulu kegiatan itu tetap
// kosong karena relasinya harus dipilih manual; sekarang sistem bisa
// menyarankan Pawsteel lengkap dengan alasannya, dan user tinggal klik
// "Hubungkan" (data tetap tidak diubah otomatis tanpa persetujuan user).

import { DEFAULT_TUJUAN_KUNJUNGAN } from "./vendorData.js";

// Kata yang terlalu umum: kalau ikut dicocokkan, semua vendor bisa jadi saran.
const KATA_ABAIKAN = new Set([
  "dan", "atau", "yang", "untuk", "dengan", "dari", "pada", "dalam", "ini",
  "itu", "the", "of", "to", "an", "di", "ke", "per", "oleh", "agar", "biar",
  "jadi", "sudah", "belum", "masih", "juga", "akan", "bisa", "vendor",
  "kegiatan", "proyek", "kerja", "untuk", "serta", "kepada", "sebagai",
]);

// Sinonim yang sering dipakai campur Indonesia/Inggris. Tanpa ini, kegiatan
// "Controlling" nggak bakal cocok dengan tujuan kunjungan "Kontrol Timeline"
// (id `kontrol`) — persis kasus yang bikin Pawsteel nggak muncul.
const SINONIM = {
  control: "kontrol", controlling: "kontrol", controller: "kontrol",
  controls: "kontrol", pengawasan: "kontrol", supervisi: "kontrol",
  supervise: "kontrol", supervising: "kontrol",
  production: "produksi", produksi: "produksi",
  packaging: "kemasan", packing: "kemasan", kemasan: "kemasan",
  design: "desain", desain: "desain",
  meeting: "rapat", rapat: "rapat",
  negotiation: "negosiasi", negotiating: "negosiasi", negosiasi: "negosiasi",
  evaluation: "evaluasi", evaluating: "evaluasi", evaluasi: "evaluasi",
  scanning: "scan", scan: "scan",
  delivery: "kirim", pengiriman: "kirim", shipping: "kirim",
  quality: "kualitas", kualitas: "kualitas",
  sample: "trial", sampling: "trial",
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

// Cari satu vendor yang paling mungkin terkait dengan kegiatan.
// Return null kalau tidak ada bukti yang cukup.
export function cariSaranVendorKegiatan({
  kegiatan,
  vendorList = [],
  kategoriNama = "",
  tujuanKunjunganList = DEFAULT_TUJUAN_KUNJUNGAN,
} = {}) {
  const tokenKegiatan = tokenSet(teksKegiatan(kegiatan, kategoriNama));
  if (tokenKegiatan.size === 0) return null;

  let terbaik = null;

  (vendorList || []).forEach((vendor) => {
    if (!vendor?.nama) return;

    const tokenNama = tokenSet(vendor.nama);
    const namaCocok = adaKecocokan(tokenNama, tokenKegiatan);

    let kunjunganCocok = 0;
    const kata = new Set();
    const tujuan = new Set();

    (vendor.logKunjungan || []).forEach((log) => {
      if (!log || typeof log !== "object") return;
      const label = labelTujuan(log.tujuanId, tujuanKunjunganList);
      const teksKunjungan = [
        label,
        log.tujuanId,
        log.hasil,
        log.catatan,
      ]
        .filter(Boolean)
        .join(" ");
      const tokenKunjungan = tokenSet(teksKunjungan);
      const kataCocok = kataKecocokan(tokenKunjungan, tokenKegiatan);
      if (kataCocok.length > 0) {
        kunjunganCocok += 1;
        kataCocok.forEach((k) => kata.add(k));
        const labelBersih = String(label || "").replace(/^[^\w\s]+\s*/, "").trim();
        if (labelBersih) tujuan.add(labelBersih);
      }
    });

    if (!namaCocok && kunjunganCocok === 0) return;

    const skor = (namaCocok ? 100 : 0) + Math.min(kunjunganCocok, 10) * 12;
    const kandidat = {
      vendor,
      skor,
      namaCocok,
      kunjunganCocok,
      kata: [...kata],
      tujuan: [...tujuan],
      // Saran "kuat" = nama disebut, atau minimal 2 kunjungan mendukung.
      kuat: namaCocok || kunjunganCocok >= 2,
    };

    if (
      !terbaik ||
      kandidat.skor > terbaik.skor ||
      (kandidat.skor === terbaik.skor && kandidat.kunjunganCocok > terbaik.kunjunganCocok)
    ) {
      terbaik = kandidat;
    }
  });

  if (!terbaik) return null;

  const alasan = [];
  if (terbaik.namaCocok) alasan.push("Nama vendor disebut di kegiatan.");
  if (terbaik.kunjunganCocok > 0) {
    const tujuan = terbaik.tujuan.slice(0, 3).join(", ");
    const kata = terbaik.kata.slice(0, 3).join(", ");
    alasan.push(
      `${terbaik.kunjunganCocok} kunjungan${
        tujuan ? ` (${tujuan})` : ""
      } punya isi yang sama dengan kegiatan${kata ? `: ${kata}` : ""}.`
    );
  }

  return { ...terbaik, alasan: alasan.join(" ") };
}
