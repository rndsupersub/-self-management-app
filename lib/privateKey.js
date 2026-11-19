// lib/privateKey.js
// Satu-satunya tempat membaca private key service account dari env.
//
// Kenapa ada: nilai di Vercel sering ketempel beda bentuk (pakai kutip, "\n"
// literal, dobel-escape, baris hilang, atau malah seluruh isi file JSON).
// Kalau formatnya meleset sedikit saja, OpenSSL cuma bilang
// "error:1E08010C:DECODER routines::unsupported" yang tidak memberi petunjuk.
// Di sini semua bentuk umum dirapikan dulu, lalu kunci divalidasi supaya
// pesan errornya menyebut variabel mana yang bermasalah.

import { createPrivateKey } from "node:crypto";

// Kutip lurus, kutip melengkung (dari Word/WhatsApp), dan backtick.
const KUTIP = [
  ['"', '"'],
  ["'", "'"],
  ["\u201c", "\u201d"],
  ["\u2018", "\u2019"],
  ["`", "`"],
];

function buangKutip(nilai) {
  let teks = nilai;
  let berubah = true;
  while (berubah) {
    berubah = false;
    for (const [buka, tutup] of KUTIP) {
      if (teks.length > 1 && teks.startsWith(buka) && teks.endsWith(tutup)) {
        teks = teks.slice(buka.length, -tutup.length).trim();
        berubah = true;
      }
    }
  }
  return teks;
}

// Kadang yang ditempel isi file JSON utuh, bukan cuma nilai private_key.
function ambilDariJson(teks) {
  if (!teks.startsWith("{")) return teks;
  try {
    const data = JSON.parse(teks);
    if (typeof data?.private_key === "string") return data.private_key;
  } catch {
    // bukan JSON valid — biarkan, nanti dilaporkan sebagai format salah
  }
  return teks;
}

// Baris PEM maksimal 64 karakter base64. Kalau semua barisnya hilang (jadi
// satu baris panjang), bungkus ulang supaya stabil dibaca OpenSSL.
function rapikanBaris(pem) {
  const cocok = pem.match(
    /-----BEGIN ([A-Z0-9 ]*PRIVATE KEY)-----([\s\S]*?)-----END \1-----/
  );
  if (!cocok) return pem;
  const [, jenis, isi] = cocok;
  const base64 = isi.replace(/\s+/g, "");
  if (!base64) return pem;
  const baris = base64.match(/.{1,64}/g).join("\n");
  return `-----BEGIN ${jenis}-----\n${baris}\n-----END ${jenis}-----`;
}

export function normalisasiPrivateKey(raw) {
  if (raw == null || raw === "") return "";
  let teks = String(raw).trim();
  if (teks.charCodeAt(0) === 0xfeff) teks = teks.slice(1).trim();

  teks = ambilDariJson(teks);
  teks = buangKutip(teks);

  // "\n" literal (satu atau beberapa backslash) → baris baru sungguhan.
  teks = teks.replace(/\\+r/g, "\r").replace(/\\+n/g, "\n");
  // Windows line ending → seragam.
  teks = teks.replace(/\r\n?/g, "\n");
  // Spasi/tab di ujung baris bikin base64 dianggap rusak.
  teks = teks
    .split("\n")
    .map((baris) => baris.replace(/[ \t]+$/g, "").replace(/^[ \t]+/g, ""))
    .join("\n")
    .trim();

  return rapikanBaris(teks);
}

// Dipakai route API: kalau kuncinya tidak bisa dipakai, lempar pesan yang
// bisa langsung ditindaklanjuti, bukan error OpenSSL mentah.
export function parsePrivateKey(raw, nama = "PRIVATE_KEY") {
  const key = normalisasiPrivateKey(raw);

  if (!key) throw new Error(`${nama} kosong.`);

  if (!/-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----/.test(key)) {
    throw new Error(
      `${nama} bukan format kunci: penanda "-----BEGIN PRIVATE KEY-----" tidak ditemukan. Salin ulang nilai private_key dari file JSON service account (boleh tempel seluruh isi file JSON-nya).`
    );
  }
  if (!/-----END [A-Z0-9 ]*PRIVATE KEY-----/.test(key)) {
    throw new Error(
      `${nama} terpotong: penanda "-----END PRIVATE KEY-----" tidak ada. Salin ulang nilai private_key sampai akhir baris penutup.`
    );
  }

  try {
    createPrivateKey({ key, format: "pem" });
  } catch {
    throw new Error(
      `${nama} tidak bisa dibaca sistem: isi kunci tidak utuh (kemungkinan terpotong atau ada karakter yang hilang). Salin ulang dari file JSON service account, tempel apa adanya.`
    );
  }

  return key;
}
