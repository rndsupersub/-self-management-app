// app/api/sync-sheets/route.js
// Endpoint sync Firestore → Google Sheets dari web.
// Semua logika sheet ada di lib/sheetsSync.js (dipakai juga oleh bot Telegram).
//
// Keamanan: wajib ID token Firebase dan uid harus sama dengan pemilik token.
// Versi lama nerima `uid` mentah, jadi siapa pun bisa memicu sync data user lain.

import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { verifyFirebaseIdToken } from "@/lib/firebaseIdToken";
import { syncUserToSheets } from "@/lib/sheetsSync";
import { parsePrivateKey } from "@/lib/privateKey";

let adminApp = null;
function getAdminApp() {
  if (adminApp) return adminApp;
  if (getApps().length > 0) {
    adminApp = getApps()[0];
    return adminApp;
  }
  adminApp = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: parsePrivateKey(
        process.env.FIREBASE_PRIVATE_KEY,
        "FIREBASE_PRIVATE_KEY"
      ),
    }),
  });
  return adminApp;
}

export async function POST(req) {
  try {
    const header = req.headers.get("authorization") || "";
    const idToken = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
    const decoded = await verifyFirebaseIdToken(idToken);
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Gagal karena env kurang itu penyebab paling sering "sudah diklik sync
    // tapi spreadsheet nggak berubah". Sebutkan nama variabelnya, bukan isinya.
    const ENV_WAJIB = ["GOOGLE_SHEETS_ID", "GOOGLE_CLIENT_EMAIL", "GOOGLE_PRIVATE_KEY"];
    const envKurang = ENV_WAJIB.filter((kunci) => !process.env[kunci]);
    if (envKurang.length > 0) {
      return NextResponse.json(
        {
          error: `Konfigurasi server belum lengkap: ${envKurang.join(
            ", "
          )}. Tambahkan di Environment Variables lalu redeploy.`,
        },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const uid = body.uid || decoded.uid;
    if (uid !== decoded.uid) {
      return NextResponse.json({ error: "UID nggak cocok" }, { status: 403 });
    }

    const firestore = getFirestore(getAdminApp());
    const userSnap = await firestore.collection("users").doc(uid).get();
    if (!userSnap.exists) {
      return NextResponse.json({ error: "user tidak ditemukan" }, { status: 404 });
    }

    const { results, spreadsheetUrl } = await syncUserToSheets(userSnap.data());
    const gagal = results.filter((r) => r.status === "error");
    const berhasil = results.filter((r) => r.status === "ok");

    // Sebelumnya respons tetap 200 walau semua tab gagal, jadi tombol sempat
    // bilang "Sync berhasil — 0 baris". Sekarang kegagalan dilaporkan jujur.
    if (berhasil.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Sync gagal di semua tab. ${gagal[0]?.error || "Penyebab tidak diketahui."}`,
          timestamp: new Date().toISOString(),
          results,
          spreadsheetUrl,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: gagal.length === 0,
      error:
        gagal.length > 0
          ? `Gagal di tab ${gagal.map((r) => r.sheet).join(", ")}: ${gagal[0].error}`
          : undefined,
      timestamp: new Date().toISOString(),
      results,
      spreadsheetUrl,
    });
  } catch (err) {
    console.error("[sync-sheets] Fatal error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message:
      "Endpoint sync-sheets aktif. POST dengan header Authorization: Bearer <ID token> dan body { uid }.",
  });
}
