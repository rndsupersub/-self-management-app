// app/api/panduan/cari/route.js
// Pencarian panduan/tutorial (video YouTube + tautan panduan).
//
// Kenapa lewat server:
// - halaman YouTube tidak bisa dibaca langsung dari browser karena diblokir
//   CORS, dan hasilnya perlu di-cache
// - endpoint wajib login supaya tidak jadi gerbang gratis untuk siapa pun

import { NextResponse } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/firebaseIdToken";
import { cariPanduan } from "@/lib/panduanCari";

export const maxDuration = 60;

const BATAS_PER_MENIT = 15;
const jejakUser = new Map();

function bolehCari(uid) {
  const sekarang = Date.now();
  const jejak = (jejakUser.get(uid) || []).filter((waktu) => sekarang - waktu < 60_000);
  if (jejak.length >= BATAS_PER_MENIT) return false;
  jejak.push(sekarang);
  jejakUser.set(uid, jejak);
  if (jejakUser.size > 500) jejakUser.clear();
  return true;
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
        { ok: false, error: "Sesi login tidak valid. Muat ulang halaman, lalu login lagi." },
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

    if (!bolehCari(decoded.uid)) {
      return NextResponse.json(
        {
          ok: false,
          error: "Terlalu banyak pencarian dalam satu menit. Tunggu sebentar lalu coba lagi.",
        },
        { status: 429 }
      );
    }

    const data = await cariPanduan({ q });

    return NextResponse.json(
      { ok: true, ...data },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[panduan/cari] Error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Pencarian panduan gagal." },
      { status: 503 }
    );
  }
}
