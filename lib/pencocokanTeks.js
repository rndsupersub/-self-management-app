// lib/pencocokanTeks.js
// Pencocokan kata yang sadar batas kata.
//
// Kenapa tidak pakai `includes` biasa:
// - "busa".includes di "busana" -> true, padahal busa (spons) dan busana
//   (pakaian) dua benda berbeda.
// - "jok" di "jokowow" -> true, padahal itu nama orang, bukan jok kendaraan.
//
// Aturan di sini:
// - kata sama persis            -> 10
// - kata + akhiran Indonesia    -> 6  (joknya, busanya, jok-jok)
// - beda 1 huruf (typo ringan)  -> 4  (hanya untuk kata >= 4 huruf)
// - selain itu                  -> 0  (tidak dianggap cocok)
//
// Jadi hasil yang benar-benar cocok selalu berada di atas hasil yang cuma
// kebetulan mengandung huruf yang sama.

const AKHIRAN = new Set([
  "nya",
  "kah",
  "lah",
  "pun",
  "ku",
  "mu",
  "an",
  "kan",
  "in",
  "i",
  "e",
  "s",
]);

// Kata yang terlalu umum untuk dijadikan penentu relevansi.
export const KATA_UMUM = new Set([
  "di",
  "ke",
  "dari",
  "dan",
  "atau",
  "yang",
  "untuk",
  "dengan",
  "the",
  "and",
  "of",
  "in",
  "jasa",
  "service",
  "layanan",
  "vendor",
  "supplier",
  "toko",
  "usaha",
]);

export function kataDari(teks) {
  return String(teks ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

// Jarak edit terbatas. Dipakai hanya untuk typo ringan, bukan pencocokan bebas.
export function jarakEdit(a, b, batas = 1) {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > batas) return batas + 1;
  const baris = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let sebelumnya = baris[0];
    baris[0] = i;
    let minimum = baris[0];
    for (let j = 1; j <= b.length; j++) {
      const simpan = baris[j];
      baris[j] = Math.min(
        baris[j] + 1,
        baris[j - 1] + 1,
        sebelumnya + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
      sebelumnya = simpan;
      if (baris[j] < minimum) minimum = baris[j];
    }
    if (minimum > batas) return batas + 1;
  }
  return baris[b.length];
}

// Nilai kecocokan satu kata (dari nama tempat) terhadap satu token pencarian.
export function cocokKata(kandidat, token) {
  const k = String(kandidat || "").toLowerCase();
  const t = String(token || "").toLowerCase();
  if (!k || !t) return 0;
  if (k === t) return 10;
  if (k.startsWith(t)) {
    const sisa = k.slice(t.length);
    if (sisa.length > 0 && sisa.length <= 3 && AKHIRAN.has(sisa)) return 6;
    return 0;
  }
  if (t.length >= 4 && jarakEdit(k, t, 1) <= 1) return 4;
  return 0;
}

// Skor satu teks (nama tempat, layanan, alamat) terhadap seluruh token.
// `kuat` = jumlah token yang benar-benar cocok (bukan cuma mirip).
export function skorTeks(teks, tokenList = []) {
  const kata = kataDari(teks);
  if (kata.length === 0 || tokenList.length === 0) return { skor: 0, kuat: 0 };

  let skor = 0;
  let kuat = 0;
  let tokenCocok = 0;

  for (const token of tokenList) {
    if (!token) continue;
    let terbaik = 0;
    for (const k of kata) {
      const nilai = cocokKata(k, token);
      if (nilai > terbaik) terbaik = nilai;
      if (terbaik === 10) break;
    }
    if (terbaik > 0) tokenCocok++;
    if (terbaik >= 6) kuat++;
    skor += terbaik;
  }

  // Nama yang ditulis menyatu ("jokset", "bengkelas") tetap cocok dengan
  // pencarian dua kata ("jok set", "bengkel las").
  if (tokenCocok === 0 && tokenList.length > 1) {
    const gabung = kata.join("");
    const target = tokenList.join("");
    if (gabung === target) {
      skor = 10;
      kuat = 1;
      tokenCocok = tokenList.length;
    }
  }

  // Bonus kalau semua kata kunci kena, supaya "Jok Set Motor" menang dari
  // tempat yang cuma cocok satu kata.
  if (tokenCocok === tokenList.length && tokenList.length > 1) skor += 4;

  return { skor, kuat };
}

// Versi ringkas untuk dipakai mesin pencari direktori.
export function skorRelevansi({ nama = "", layanan = "", alamat = "" }, tokenList = []) {
  const utama = skorTeks(nama, tokenList);
  const tambahan = skorTeks(layanan, tokenList);
  const lokasi = skorTeks(alamat, tokenList);
  return {
    skor: utama.skor + Math.round(tambahan.skor * 0.5) + Math.round(lokasi.skor * 0.25),
    kuat: utama.kuat + (tambahan.kuat > 0 ? 1 : 0),
  };
}

// Pecah teks jadi token pencarian yang bersih (tanpa kata umum).
export function tokenPencarian(teks) {
  return kataDari(teks).filter((k) => k.length >= 2 && !KATA_UMUM.has(k));
}
