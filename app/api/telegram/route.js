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

  // Command spesial
  if (command === "help") {
    await sendTelegramMessage(chatId, buildHelpText());
    return;
  }
  if (command === "menu_list") {
    await sendTelegramMessage(
      chatId,
      buildMenuListText(userData.menus || [], userData.menusCustom || {})
    );
    return;
  }
  if (command === "status") {
    const today = new Date().toISOString().split("T")[0];
    await sendTelegramMessage(
      chatId,
      `<b>📊 Status Sync</b>

🟢 Telegram: Aktif
🟢 Firestore: Tersambung
📊 Sheets: Auto-sync tiap 5 menit

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

  // Command = menu_id
  const found = findMenuByCommand(command, userData.menus, userData.menusCustom);
  if (!found) {
    await sendTelegramMessage(
      chatId,
      `❌ Menu "${command}" nggak ada.\nKetik /menu_list buat lihat daftar menu.`
    );
    return;
  }

  // ========== MENU TOP-LEVEL ==========
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

  // ========== MENU CUSTOM ==========
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

// ========== HANDLE CALLBACK (TOMBOL) ==========
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
    const usersSnap = await firestore
      .collection("users")
      .where("telegramChatId", "==", chatId)
      .limit(1)
      .get();

    let userData = null;
    let uid = null;

    if (!usersSnap.empty) {
      userData = usersSnap.docs[0].data();
      uid = usersSnap.docs[0].id;
    } else {
      const allUsers = await firestore.collection("users").limit(1).get();
      if (!allUsers.empty) {
        userData = allUsers.docs[0].data();
        uid = allUsers.docs[0].id;
      }
    }

    if (!userData) {
      await sendTelegramMessage(chatId, "❌ User nggak ditemukan di database.");
      return NextResponse.json({ ok: true });
    }

    userData._uid = uid;

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