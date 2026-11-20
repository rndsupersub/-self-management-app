// app/api/telegram/get-file-url/route.js
// Ambil file Telegram (mis. voice note hafalan) TANPA membocorkan token bot.
//
// Versi lama membalas URL "https://api.telegram.org/file/bot<TOKEN>/..." ke
// siapa pun tanpa login. Artinya siapa pun yang memanggil endpoint ini bisa
// membaca token bot dan mengambil alih bot (baca semua pesan, kirim pesan
// atas nama bot). Sekarang:
// - mode JSON wajib login (Firebase ID token)
// - yang dikirim ke browser cuma URL bertanda tangan, berlaku 10 menit
// - mode raw (dipakai elemen <audio>) memverifikasi tanda tangan; token bot
//   tidak pernah keluar dari server.

import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { verifyFirebaseIdToken } from "@/lib/firebaseIdToken";

const MASA_BERLAKU_MS = 10 * 60 * 1000;
const POLA_FILE_ID = /^[A-Za-z0-9_\-+/=]{5,300}$/;

function tanda(fileId, kedaluwarsa, token) {
  return createHmac("sha256", token).update(`${fileId}.${kedaluwarsa}`).digest("hex");
}

function tandaValid({ fileId, kedaluwarsa, sig, token }) {
  if (!/^\d{10,16}$/.test(String(kedaluwarsa || ""))) return false;
  if (Number(kedaluwarsa) < Date.now()) return false;
  if (!sig) return false;
  const harap = Buffer.from(tanda(fileId, kedaluwarsa, token), "utf8");
  const kirim = Buffer.from(String(sig), "utf8");
  if (harap.length !== kirim.length) return false;
  return timingSafeEqual(harap, kirim);
}

const TIPE_FILE = {
  oga: "audio/ogg",
  ogg: "audio/ogg",
  opus: "audio/ogg",
  mp3: "audio/mpeg",
  m4a: "audio/mp4",
  wav: "audio/wav",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  pdf: "application/pdf",
};

function tipeDari(filePath) {
  const ekstensi = String(filePath || "").split(".").pop().toLowerCase();
  return TIPE_FILE[ekstensi] || "application/octet-stream";
}

async function ambilFilePath(token, fileId) {
  const res = await fetch(
    `https://api.telegram.org/bot${token}/getFile?file_id=${encodeURIComponent(fileId)}`
  );
  const data = await res.json();
  if (!data.ok) throw new Error(data.description || "Gagal ambil file dari Telegram");
  const filePath = data.result?.file_path;
  if (!filePath) throw new Error("file_path nggak ada");
  return { filePath, fileSize: data.result?.file_size || 0 };
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get("fileId") || "";

    if (!fileId) {
      return NextResponse.json({ ok: false, error: "fileId wajib" }, { status: 400 });
    }
    if (!POLA_FILE_ID.test(fileId)) {
      return NextResponse.json({ ok: false, error: "fileId tidak valid" }, { status: 400 });
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      return NextResponse.json(
        { ok: false, error: "TELEGRAM_BOT_TOKEN belum diset" },
        { status: 500 }
      );
    }

    // Mode raw: dipakai <audio src="...">. Elemen audio tidak bisa mengirim
    // header Authorization, jadi keabsahan dicek lewat tanda tangan HMAC yang
    // dibuat server saat user login.
    if (searchParams.get("raw") === "1") {
      const kedaluwarsa = searchParams.get("exp") || "";
      const sig = searchParams.get("sig") || "";
      if (!tandaValid({ fileId, kedaluwarsa, sig, token })) {
        return NextResponse.json({ ok: false, error: "Link kedaluwarsa" }, { status: 403 });
      }

      const { filePath } = await ambilFilePath(token, fileId);
      const upstream = await fetch(`https://api.telegram.org/file/bot${token}/${filePath}`);
      if (!upstream.ok) {
        return NextResponse.json(
          { ok: false, error: "Gagal unduh file dari Telegram" },
          { status: 502 }
        );
      }

      const isi = await upstream.arrayBuffer();
      return new Response(isi, {
        status: 200,
        headers: {
          "Content-Type": tipeDari(filePath),
          "Cache-Control": "private, max-age=600",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }

    // Mode JSON: wajib user yang login.
    const header = req.headers.get("authorization") || "";
    const idToken = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
    const decoded = await verifyFirebaseIdToken(idToken);
    if (!decoded) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { filePath, fileSize } = await ambilFilePath(token, fileId);
    const kedaluwarsa = String(Date.now() + MASA_BERLAKU_MS);
    const sig = tanda(fileId, kedaluwarsa, token);
    const fileUrl =
      `/api/telegram/get-file-url?fileId=${encodeURIComponent(fileId)}` +
      `&exp=${kedaluwarsa}&sig=${sig}&raw=1`;

    return NextResponse.json(
      { ok: true, fileUrl, filePath, fileSize },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[get-file-url] Error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
