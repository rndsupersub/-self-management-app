// app/api/telegram/sync-status/route.js
import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { sendTelegramMessage } from "@/lib/telegramData";
import { REMINDER_CONFIG, todayStr } from "@/lib/telegramReminder";

let adminApp = null;
function getAdminApp() {
  if (adminApp) return adminApp;
  if (getApps().length > 0) {
    adminApp = getApps()[0];
    return adminApp;
  }
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || "")
    .trim()
    .replace(/^"|"$/g, "")
    .replace(/\\n/g, "\n");
  adminApp = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  });
  return adminApp;
}

function formatJam(isoString) {
  if (!isoString) return "-";
  const d = new Date(isoString);
  const jakartaOffset = 7 * 60;
  const utcMinutes = d.getUTCHours() * 60 + d.getUTCMinutes();
  const jakartaMinutes = (utcMinutes + jakartaOffset) % (24 * 60);
  const hh = String(Math.floor(jakartaMinutes / 60)).padStart(2, "0");
  const mm = String(jakartaMinutes % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { uid, aktivitasId, aktivitasLabel, status, waktu } = body;

    if (!uid) return NextResponse.json({ ok: false, error: "uid wajib" }, { status: 400 });
    if (!aktivitasId) return NextResponse.json({ ok: false, error: "aktivitasId wajib" }, { status: 400 });
    if (!status || !["mulai", "selesai"].includes(status)) {
      return NextResponse.json({ ok: false, error: "status harus 'mulai' atau 'selesai'" }, { status: 400 });
    }

    const admin = getAdminApp();
    const firestore = getFirestore(admin);
    const userRef = firestore.collection("users").doc(uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return NextResponse.json({ ok: false, error: "User nggak ketemu" }, { status: 404 });
    }

    const userData = userSnap.data();
    const chatId = userData.telegramChatId;

    if (!chatId) {
      return NextResponse.json({ ok: true, message: "User belum link Telegram, sinyal diskip.", status, aktivitasId });
    }

    const config = REMINDER_CONFIG[aktivitasId];
    const label = aktivitasLabel || config?.label || aktivitasId;
    const emoji = config?.emoji || "📌";
    const tanggal = todayStr();
    const waktuStr = formatJam(waktu || new Date().toISOString());

    let pesan = "";
    if (status === "mulai") {
      pesan = `▶️ <b>Mulai!</b>\n\n${emoji} <b>${label}</b>\n📅 ${tanggal}\n⏰ ${waktuStr}\n\nSemangat, bos! 🔥\n\n<i>Reminder buat aktivitas ini dimatiin.</i>`;
    } else if (status === "selesai") {
      pesan = `✅ <b>Selesai!</b>\n\n${emoji} <b>${label}</b>\n📅 ${tanggal}\n⏰ ${waktuStr}\n\nMantap, bos! 🎉`;
    }

    try {
      await sendTelegramMessage(chatId, pesan);
    } catch (err) {
      return NextResponse.json({ ok: true, message: "Progress diupdate, tapi gagal kirim Telegram.", error: err.message, status, aktivitasId });
    }

    try {
      await userRef.set(
        {
          reminderLog: {
            ...(userData.reminderLog || {}),
            [tanggal]: {
              ...((userData.reminderLog || {})[tanggal] || {}),
              [aktivitasId]: { 1: true, 2: true, 3: true, 4: true },
            },
          },
        },
        { merge: true }
      );
    } catch (err) {
      console.error("[sync-status] Gagal update reminderLog:", err.message);
    }

    return NextResponse.json({ ok: true, message: "Sinyal terkirim ke Telegram.", status, aktivitasId, waktu: waktuStr });
  } catch (err) {
    console.error("[sync-status] Fatal error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, message: "Endpoint sync-status aktif. POST dengan { uid, aktivitasId, status }." });
}