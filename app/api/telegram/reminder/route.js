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
import { safeEqual } from "@/lib/telegramSecurity";

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
    const secret =
      body?.secret ||
      req.headers.get("x-cron-secret") ||
      new URL(req.url).searchParams.get("secret");
    const expectedSecret = process.env.CRON_SECRET;

    // Fail closed: cron reminder nggak boleh bisa dipanggil siapa aja.
    if (!expectedSecret) {
      return NextResponse.json(
        { ok: false, error: "CRON_SECRET belum diset" },
        { status: 503 }
      );
    }
    if (!safeEqual(secret, expectedSecret)) {
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
      // 1. REMINDER PRIBADI (DINAMIS DARI JADWAL WEB)
      // ==========================================
      const remindersPribadi = tentukanReminderYangHarusDikirim(userData, sekarang);
      const sentPribadi = [];
      // Kumpulin dulu, tulis sekali di akhir. Dulu tiap reminder nulis pakai snapshot lama
      // → key sebelumnya ketimpa dan reminder terkirim ulang tiap menit.
      const logPribadiHariIni = { ...((userData.reminderLog || {})[tanggal] || {}) };

      if (remindersPribadi.length > 0) {
        for (const rem of remindersPribadi) {
          try {
            // Pakai ID reminder (config), bukan ID item jadwal: tombol callback
            // harus bisa di-resolve balik ke config yang sama.
            await kirimReminder(chatId, rem.reminderId, rem.lapis, rem.config, rem.jamMulai, rem.deadline);

            // Tulis log pakai ID jadwal + ID config lama + ID item hari ini.
            // Jadi web yang nulis progress dengan ID jadwal tetap kebaca,
            // setting lama tetap aman, dan item Minggu (olahraga_ringan) ikut.
            const ids = [...new Set([rem.reminderId, rem.scheduleId, rem.scheduleItemId].filter(Boolean))];
            ids.forEach((id) => {
              logPribadiHariIni[id] = {
                ...(logPribadiHariIni[id] || {}),
                [rem.lapis]: true,
              };
            });
            sentPribadi.push({ menuId: rem.reminderId, scheduleId: rem.scheduleId, lapis: rem.lapis });
          } catch (err) {
            console.error(`[reminder] Gagal kirim pribadi:`, err.message);
          }
        }

        if (sentPribadi.length > 0) {
          await firestore.collection("users").doc(userDoc.id).set(
            {
              reminderLog: {
                ...(userData.reminderLog || {}),
                [tanggal]: logPribadiHariIni,
              },
            },
            { merge: true }
          );
        }
      }

      // ==========================================
      // 2. REMINDER PROYEK (PEKERJAAN & BISNIS)
      // ==========================================
      const remindersProyek = cariReminderProyek(userData);
      const sentProyek = [];
      const todayLog = { ...(userData.reminderProyekLog?.[tanggal] || {}) };

      for (const rem of remindersProyek) {
        // Cek apakah hari ini udah dikirim
        if (todayLog[rem.id]) continue;

        try {
          const { text, buttons } = buildReminderProyekMessage(rem);
          await sendTelegramWithButtons(chatId, text, buttons);

          todayLog[rem.id] = true;
          sentProyek.push({ id: rem.id, tipe: rem.tipe });
        } catch (err) {
          console.error(`[reminder proyek] Gagal kirim:`, err.message);
        }
      }

      // Tulis log sekali setelah semua reminder diproses.
      if (sentProyek.length > 0) {
        await firestore.collection("users").doc(userDoc.id).set(
          {
            reminderProyekLog: {
              ...(userData.reminderProyekLog || {}),
              [tanggal]: todayLog,
            },
          },
          { merge: true }
        );
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