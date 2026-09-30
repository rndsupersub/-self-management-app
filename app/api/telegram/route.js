// app/api/telegram/route.js
import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import {
  sendTelegramMessage,
  sendTelegramWithButtons,
  answerCallbackQuery,
  editTelegramMessage,
  parseCommand,
  findMenuByCommand,
  buildHelpText,
  buildMenuListText,
} from "@/lib/telegramData";

// ========== FIREBASE ADMIN INIT ==========
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

// ========== AMBIL ATAU SETUP USER ==========
// Coba 3 strategi:
//   1. Query where telegramChatId == Number(chatId)
//   2. Query where telegramChatId == String(chatId)
//   3. Fallback: user pertama + set telegramChatId
async function resolveUser(firestore, chatId) {
  const chatIdNum = Number(chatId);
  const chatIdStr = String(chatId);

  // Step 1: query number
  try {
    const snap1 = await firestore
      .collection("users")
      .where("telegramChatId", "==", chatIdNum)
      .limit(1)
      .get();
    if (!snap1.empty) {
      const doc = snap1.docs[0];
      console.log(`[resolveUser] Match number: ${doc.id}`);
      return { uid: doc.id, data: doc.data(), isNew: false };
    }
  } catch (e) {
    console.error("[resolveUser] Number query error:", e.message);
  }

  // Step 2: query string
  try {
    const snap2 = await firestore
      .collection("users")
      .where("telegramChatId", "==", chatIdStr)
      .limit(1)
      .get();
    if (!snap2.empty) {
      const doc = snap2.docs[0];
      console.log(`[resolveUser] Match string: ${doc.id}`);
      return { uid: doc.id, data: doc.data(), isNew: false };
    }
  } catch (e) {
    console.error("[resolveUser] String query error:", e.message);
  }

  // Step 3: fallback — user pertama
  const allUsers = await firestore.collection("users").limit(1).get();
  if (allUsers.empty) return null;

  const doc = allUsers.docs[0];
  const userRef = firestore.collection("users").doc(doc.id);

  // Set telegramChatId sebagai number
  await userRef.update({ telegramChatId: chatIdNum });
  console.log(`[resolveUser] Fallback set telegramChatId: ${doc.id} → ${chatIdNum}`);

  const refreshed = await userRef.get();
  return { uid: doc.id, data: refreshed.data(), isNew: true };
}

// ========== HANDLE PESAN TEKS ==========
async function handleTextMessage(chatId, text, userData, messageId) {
  const parsed = parseCommand(text);

  if (!parsed) {
    await sendTelegramMessage(
      chatId,
      `🤖 Halo! Kirim /help buat lihat panduan, atau /menu_list buat lihat daftar menu.`
    );
    return;
  }

  const { command, payload, catatan, autoChoice } = parsed;

  if (command === "help") {
    await sendTelegramMessage(chatId, buildHelpText());
    return;
  }

  if (command === "menu_list") {
    const menus = userData.menus || [];
    const menusCustom = userData.menusCustom || {};

    // LOG untuk debug
    console.log(`[menu_list] uid=${userData._uid}`);
    console.log(`[menu_list] menus count=${menus.length}`);
    console.log(`[menu_list] menusCustom keys=${Object.keys(menusCustom).length}`);
    console.log(`[menu_list] menus sample=`, menus.slice(0, 2));

    await sendTelegramMessage(chatId, buildMenuListText(menus, menusCustom));
    return;
  }

  if (command === "status") {
    const today = new Date().toISOString().split("T")[0];
    const menusCount = (userData.menus || []).filter((m) => m.visible !== false).length;
    await sendTelegramMessage(
      chatId,
      `<b>📊 Status Sync</b>

🟢 Telegram: Aktif
🟢 Firestore: Tersambung
📊 Sheets: Auto-sync tiap 5 menit
📋 Menu aktif: ${menusCount}

📅 Hari ini: ${today}`
    );
    return;
  }

  if (command === "today") {
    const today = new Date().toISOString().split("T")[0];
    const progress = userData.dailyProgress?.[today] || {};
    const count = Object.keys(progress).length;
    await sendTelegramMessage(
      chatId,
      `<b>📅 Ringkasan Hari Ini</b>

Tanggal: ${today}
📝 ${count} aktivitas tercatat.`
    );
    return;
  }

  if (command === "undo") {
    const history = userData.telegramHistory || {};
    const now = Date.now();
    const entries = Object.entries(history).filter(
      ([_, h]) => now - (h.timestamp || 0) < 5 * 60 * 1000
    );
    if (entries.length === 0) {
      await sendTelegramMessage(chatId, "⚠️ Nggak ada input dalam 5 menit terakhir.");
      return;
    }
    entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
    const [entryId, entry] = entries[0];
    const admin = getAdminApp();
    const firestore = getFirestore(admin);
    const newHistory = { ...history };
    delete newHistory[entryId];
    await firestore.collection("users").doc(userData._uid).update({
      telegramHistory: newHistory,
    });
    await sendTelegramMessage(chatId, `✅ Dibatalkan: ${entry.summary || "input terakhir"}`);
    return;
  }

  const found = findMenuByCommand(command, userData.menus, userData.menusCustom);
  if (!found) {
    await sendTelegramMessage(
      chatId,
      `❌ Menu "${command}" nggak ada.\nKetik /menu_list buat lihat daftar menu.`
    );
    return;
  }

  if (found.type === "top") {
    const menu = found.menu;
    const fullCatatan = catatan || payload;

    if (!fullCatatan) {
      await sendTelegramMessage(chatId, `⚠️ Catatan kosong. Contoh: /${menu.id} isi catatan`);
      return;
    }

    await sendTelegramWithButtons(
      chatId,
      `🎯 Kirim ke <b>${menu.label}</b>?

📝 Catatan: ${fullCatatan}`,
      [
        [{ text: "✅ Ya", callback_data: `confirm|${menu.id}||${fullCatatan}` }],
        [{ text: "❌ Batal", callback_data: "cancel" }],
      ]
    );
    return;
  }

  if (found.type === "custom") {
    const fullCatatan = catatan || payload;
    if (!fullCatatan) {
      await sendTelegramMessage(chatId, `⚠️ Catatan kosong.`);
      return;
    }
    await sendTelegramWithButtons(
      chatId,
      `🎯 Kirim ke <b>${found.menu.nama}</b>?

📝 Catatan: ${fullCatatan}`,
      [
        [{ text: "✅ Ya", callback_data: `confirm_custom|${found.key}||${fullCatatan}` }],
        [{ text: "❌ Batal", callback_data: "cancel" }],
      ]
    );
    return;
  }
}

// ========== HANDLE CALLBACK ==========
async function handleCallback(callbackQuery, userData) {
  const { id: callbackId, message, data } = callbackQuery;
  const chatId = message.chat.id;
  const messageId = message.message_id;

  await answerCallbackQuery(callbackId);

  const parts = data.split("|");
  const action = parts[0];

  if (action === "cancel") {
    await editTelegramMessage(chatId, messageId, "❌ Dibatalkan.");
    return;
  }

  if (action === "confirm") {
    const menuId = parts[1];
    const catatan = parts.slice(2).join("|");
    await saveToFirestore(userData, menuId, catatan, "top");
    await editTelegramMessage(
      chatId,
      messageId,
      `<b>✅ Tersimpan di ${menuId}</b>

📝 Catatan: ${catatan}
📊 Sheets: auto-sync tiap 5 menit`,
      [
        [
          { text: "🗑️ Hapus", callback_data: `delete|${menuId}||${catatan}` },
          { text: "📊 Sync Now", callback_data: `syncnow` },
        ],
      ]
    );
    return;
  }

  if (action === "confirm_custom") {
    const customKey = parts[1];
    const catatan = parts.slice(2).join("|");
    await saveToFirestore(userData, customKey, catatan, "custom");
    await editTelegramMessage(
      chatId,
      messageId,
      `<b>✅ Tersimpan di ${customKey}</b>

📝 Catatan: ${catatan}
📊 Sheets: auto-sync tiap 5 menit`,
      [
        [{ text: "📊 Sync Now", callback_data: `syncnow` }],
      ]
    );
    return;
  }

  if (action === "delete") {
    await editTelegramMessage(chatId, messageId, "🗑️ Dihapus.");
    return;
  }

  if (action === "syncnow") {
    await editTelegramMessage(chatId, messageId, "📊 Sync dijalankan. Cek spreadsheet.");
    try {
      const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000";
      await fetch(`${baseUrl}/api/sync-sheets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: userData._uid }),
      });
    } catch (e) {
      console.error("Sync error:", e);
    }
    return;
  }
}

// ========== SIMPAN KE FIRESTORE ==========
async function saveToFirestore(userData, menuId, catatan, type) {
  const admin = getAdminApp();
  const firestore = getFirestore(admin);
  const uid = userData._uid;
  const today = new Date().toISOString().split("T")[0];
  const userRef = firestore.collection("users").doc(uid);

  if (type === "top") {
    const dailyProgress = userData.dailyProgress || {};
    const todayData = dailyProgress[today] || {};
    todayData[menuId] = {
      ...(todayData[menuId] || {}),
      catatan,
      updatedAt: new Date().toISOString(),
    };
    dailyProgress[today] = todayData;

    const telegramHistory = userData.telegramHistory || {};
    telegramHistory[`${Date.now()}`] = {
      menuId,
      catatan,
      summary: `${menuId}: ${catatan}`,
      timestamp: Date.now(),
    };

    await userRef.update({ dailyProgress, telegramHistory });
  } else if (type === "custom") {
    const logs = userData.menusCustomLogHarian || {};
    const todayLog = logs[today] || {};
    todayLog[menuId] = {
      ...(todayLog[menuId] || {}),
      catatan,
      updatedAt: new Date().toISOString(),
    };
    logs[today] = todayLog;

    await userRef.update({ menusCustomLogHarian: logs });
  }
}

// ========== MAIN HANDLER ==========
export async function POST(req) {
  try {
    const update = await req.json();

    const message = update.message || update.callback_query?.message;
    if (!message) return NextResponse.json({ ok: true });

    const chatId = message.chat.id;

    const allowedChatId = process.env.TELEGRAM_CHAT_ID;
    if (allowedChatId && String(chatId) !== String(allowedChatId)) {
      await sendTelegramMessage(chatId, "⛔ Bot ini private. Akses ditolak.");
      return NextResponse.json({ ok: true });
    }

    const admin = getAdminApp();
    const firestore = getFirestore(admin);

    const user = await resolveUser(firestore, chatId);
    if (!user) {
      await sendTelegramMessage(chatId, "❌ User nggak ditemukan di database.");
      return NextResponse.json({ ok: true });
    }

    const userData = { ...user.data, _uid: user.uid };

    console.log(`[telegram] POST resolved: uid=${user.uid}, isNew=${user.isNew}, menus=${(userData.menus || []).length}`);

    if (update.callback_query) {
      await handleCallback(update.callback_query, userData);
      return NextResponse.json({ ok: true });
    }

    if (update.message && update.message.text) {
      await handleTextMessage(chatId, update.message.text, userData, update.message.message_id);
      return NextResponse.json({ ok: true });
    }

    await sendTelegramMessage(
      chatId,
      "🤖 Format nggak didukung (Fase 1). Fitur foto & voice note bakal datang di Fase 2."
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[telegram] Error:", err);
    return NextResponse.json({ ok: true, error: err.message });
  }
}

export async function GET() {
  return NextResponse.json({ status: "Telegram webhook aktif." });
}