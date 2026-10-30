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
import {
  cariReminderProyek,
  buildReminderProyekMessage,
  todayStr as todayStrProyek
} from "@/lib/telegramReminderProyek";
import { sendTelegramWithButtons } from "@/lib/telegramData";

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

      // ==========================================
      // 1. REMINDER PRIBADI (JANGAN SENTUH LOGIKANYA)
      // ==========================================
      const remindersPribadi = tentukanReminderYangHarusDikirim(userData, sekarang);
      const sentPribadi = [];

      if (remindersPribadi.length > 0) {
        for (const rem of remindersPribadi) {
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
            sentPribadi.push({ menuId: rem.menuId, lapis: rem.lapis });
          } catch (err) {
            console.error(`[reminder] Gagal kirim pribadi:`, err.message);
          }
        }
      }

      // ==========================================
      // 2. REMINDER PROYEK (PEKERJAAN & BISNIS)
      // ==========================================
      const remindersProyek = cariReminderProyek(userData);
      const sentProyek = [];
      const todayLog = userData.reminderProyekLog?.[tanggal] || {};

      for (const rem of remindersProyek) {
        // Cek apakah hari ini udah dikirim
        if (todayLog[rem.id]) continue; 

        try {
          const { text, buttons } = buildReminderProyekMessage(rem);
          await sendTelegramWithButtons(chatId, text, buttons);
          
          // Catat di log biar nggak dikirim 2x sehari
          await firestore.collection("users").doc(userDoc.id).set(
            {
              reminderProyekLog: {
                ...(userData.reminderProyekLog || {}),
                [tanggal]: {
                  ...todayLog,
                  [rem.id]: true,
                },
              },
            },
            { merge: true }
          );
          sentProyek.push({ id: rem.id, tipe: rem.tipe });
        } catch (err) {
          console.error(`[reminder proyek] Gagal kirim:`, err.message);
        }
      }

      results.push({ 
        uid: userDoc.id, 
        sentPribadi: sentPribadi.length, 
        sentProyek: sentProyek.length,
        details: { sentPribadi, sentProyek }
      });
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