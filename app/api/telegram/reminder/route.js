// app/api/telegram/reminder/route.js
import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import {
  tentukanReminderYangHarusDikirim,
  kirimReminder,
  nowHHMM,
  todayStr,
} from "@/lib/telegramReminder";

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

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const secret = body?.secret || req.headers.get("x-cron-secret");
    const expectedSecret = process.env.CRON_SECRET;

    if (expectedSecret && secret !== expectedSecret) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const admin = getAdminApp();
    const firestore = getFirestore(admin);
    const sekarang = nowHHMM();
    const tanggal = todayStr();

    console.log(`[reminder] Cek reminder jam ${sekarang}, tanggal ${tanggal}`);

    const usersSnap = await firestore
      .collection("users")
      .where("telegramChatId", "!=", null)
      .get();

    if (usersSnap.empty) {
      return NextResponse.json({ ok: true, message: "Nggak ada user yang link Telegram.", jam: sekarang });
    }

    const results = [];

    for (const userDoc of usersSnap.docs) {
      const userData = { ...userDoc.data(), _uid: userDoc.id };
      const chatId = userData.telegramChatId;
      if (!chatId) continue;

      const reminders = tentukanReminderYangHarusDikirim(userData, sekarang);

      if (reminders.length === 0) {
        results.push({ uid: userDoc.id, sent: 0, message: "Nggak ada reminder yang waktunya." });
        continue;
      }

      const sentList = [];
      for (const rem of reminders) {
        try {
          await kirimReminder(chatId, rem.menuId, rem.lapis, rem.config);

          await firestore.collection("users").doc(userDoc.id).set(
            {
              reminderLog: {
                ...(userData.reminderLog || {}),
                [tanggal]: {
                  ...((userData.reminderLog || {})[tanggal] || {}),
                  [rem.menuId]: {
                    ...(((userData.reminderLog || {})[tanggal] || {})[rem.menuId] || {}),
                    [rem.lapis]: true,
                  },
                },
              },
            },
            { merge: true }
          );

          sentList.push({ menuId: rem.menuId, lapis: rem.lapis, lapisLabel: rem.lapisLabel });
        } catch (err) {
          console.error(`[reminder] Gagal kirim:`, err.message);
          sentList.push({ menuId: rem.menuId, lapis: rem.lapis, error: err.message });
        }
      }

      results.push({ uid: userDoc.id, sent: sentList.length, reminders: sentList });
    }

    return NextResponse.json({ ok: true, jam: sekarang, tanggal, totalUsers: usersSnap.size, results });
  } catch (err) {
    console.error("[reminder] Fatal error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Endpoint reminder aktif. Cron-job.org harus POST ke endpoint ini tiap menit.",
    jamSekarang: nowHHMM(),
  });
}