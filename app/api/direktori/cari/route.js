// app/api/direktori/cari/route.js
// Proxy pencarian direktori ke peta publik (OpenStreetMap).
//
// Kenapa lewat server, bukan langsung dari browser:
// - aturan Nominatim mewajibkan User-Agent yang jelas dan maksimal ~1
//   permintaan/detik; kalau dipanggil langsung dari browser, satu user bisa
//   membanjiri layanan gratis itu dan seluruh aplikasi kena blokir
// - hasilnya bisa di-cache di server, jadi pencarian yang sama tidak
//   memanggil layanan luar berulang kali
// - endpoint ini wajib login (Firebase ID token) supaya tidak jadi "gerbang
//   gratis" bagi siapa pun yang menemukan URL-nya

import { NextResponse } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/firebaseIdToken";
import { cariUsaha } from "@/lib/direktoriCari";

// Pencarian bisa mencoba beberapa variasi kata kunci. Beri ruang cukup supaya
// tidak terpotong di tengah jalan pada hosting serverless.
export const maxDuration = 60;

const JENIS_VALID = new Set(["semua", "vendor", "agency", "jasa"]);
const WILAYAH_VALID = new Set([
  "semua",
  "bandung",
  "jakarta",
  "jabodetabek",
  "jawa_tengah",
  "jawa_timur",
  "indonesia_lain",
  "china",
  "jepang",
  "korea",
  "asia_lain",
  "amerika",
  "eropa",
]);

const JEDA_MINIMAL_MS = 850;
const BATAS_PER_MENIT = 20;
const catatanUser = new Map();
let terakhirPanggil = 0;

function bolehCari(uid) {
  const sekarang = Date.now();
  const jejak = (catatanUser.get(uid) || []).filter((waktu) => sekarang - waktu < 60_000);
  if (jejak.length >= BATAS_PER_MENIT) return false;
  jejak.push(sekarang);
  catatanUser.set(uid, jejak);
  if (catatanUser.size > 500) catatanUser.clear();
  return true;
}

function jeda(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET(req) {
  try {
    if (!process.env.FIREBASE_PROJECT_ID) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "FIREBASE_PROJECT_ID belum diset di server. Set variabel itu di Vercel, lalu deploy ulang.",
        },
        { status: 500 }
      );
    }

    const header = req.headers.get("authorization") || "";
    const idToken = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
    const decoded = await verifyFirebaseIdToken(idToken);
    if (!decoded) {
      return NextResponse.json(
        {
          ok: false,
          error: "Sesi login tidak valid. Muat ulang halaman, lalu login lagi.",
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const q = String(searchParams.get("q") || "")
      .replace(/[\u0000-\u001f\u007f]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 120);

    if (q.length < 2) {
      return NextResponse.json(
        { ok: false, error: "Kata kunci minimal 2 huruf." },
        { status: 400 }
      );
    }

    const wilayahDiminta = String(searchParams.get("wilayah") || "semua");
    const jenisDiminta = String(searchParams.get("jenis") || "semua");
    const wilayah = WILAYAH_VALID.has(wilayahDiminta) ? wilayahDiminta : "semua";
    // Jenis boleh dikirim lebih dari satu, dipisah koma (vendor,jasa).
    const jenis = jenisDiminta
      .split(",")
      .map((j) => j.trim())
      .filter((j) => JENIS_VALID.has(j) && j !== "semua");

    if (!bolehCari(decoded.uid)) {
      return NextResponse.json(
        {
          ok: false,
          error: "Terlalu banyak pencarian dalam satu menit. Tunggu sebentar lalu coba lagi.",
        },
        { status: 429 }
      );
    }

    // Jaga jarak antar permintaan ke Nominatim (aturan layanan gratisnya).
    const selisih = Date.now() - terakhirPanggil;
    if (selisih < JEDA_MINIMAL_MS) await jeda(JEDA_MINIMAL_MS - selisih);
    terakhirPanggil = Date.now();

    const { hasil, catatan, variasi, dicoba } = await cariUsaha({ q, wilayah, jenis });

    return NextResponse.json(
      {
        ok: true,
        q,
        wilayah,
        jenis,
        jumlah: hasil.length,
        hasil,
        catatan,
        variasi: variasi || [],
        dicoba: dicoba || [],
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[direktori/cari] Error:", err);
    const pesan =
      err?.name === "TimeoutError"
        ? "Pencarian memakan waktu terlalu lama. Coba lagi atau persempit wilayahnya."
        : err?.message || "Pencarian gagal.";
    return NextResponse.json({ ok: false, error: pesan }, { status: 503 });
  }
}
