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

// ========== AMBIL USER ==========
async function resolveUser(firestore, chatId) {
  const chatIdNum = Number(chatId);
  const chatIdStr = String(chatId);

  const attempts = [];

  // Try number
  try {
    const snap = await firestore.collection("users")
      .where("telegramChatId", "==", chatIdNum).limit(1).get();
    if (!snap.empty) {
      return { uid: snap.docs[0].id, data: snap.docs[0].data(), source: "number-match" };
    }
    attempts.push("number: no match");
  } catch (e) {
    attempts.push(`number: ${e.message}`);
  }

  // Try string
  try {
    const snap = await firestore.collection("users")
      .where("telegramChatId", "==", chatIdStr).limit(1).get();
    if (!snap.empty) {
      return { uid: snap.docs[0].id, data: snap.docs[0].data(), source: "string-match" };
    }
    attempts.push("string: no match");
  } catch (e) {
    attempts.push(`string: ${e.message}`);
  }

  // Fallback: user pertama
  const allUsers = await firestore.collection("users").limit(1).get();
  if (allUsers.empty) return null;

  const doc = allUsers.docs[0];
  const userRef = firestore.collection("users").doc(doc.id);
  await userRef.update({ telegramChatId: chatIdNum });
  const refreshed = await userRef.get();
  return { uid: doc.id, data: refreshed.data(), source: "fallback", attempts };
}

// ========== HANDLE PESAN ==========
async function handleTextMessage(chatId, text, userData, messageId) {
  const parsed = parseCommand(text);

  if (!parsed) {
    await sendTelegramMessage(chatId, `🤖 Halo! Kirim /help atau /menu_list.`);
    return;
  }

  const { command, payload, catatan } = parsed;

  if (command === "help") {
    await sendTelegramMessage(chatId, buildHelpText());
    return;
  }

  if (command === "debug") {
    const menus = userData.menus || [];
    const menusCustom = userData.menusCustom || {};
    const source = userData._source || "unknown";
    const sample = menus.slice(0, 3).map((m) => m.id || "?").join(", ");
    await sendTelegramMessage(
      chatId,
      `<b>🔍 DEBUG INFO</b>

<b>UID:</b> ${userData._uid}
<b>Source:</b> ${source}
<b>menus count:</b> ${menus.length}
<b>menusCustom keys:</b> ${Object.keys(menusCustom).length}
<b>Sample menus:</b> ${sample || "(kosong)"}

<i>Kalau menus count = 0, berarti bot baca user yang salah.</i>`
    );
    return;
  }

  if (command === "menu_list") {
    const menus = userData.menus || [];
    const menusCustom = userData.menusCustom || {};
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
📋 Menu aktif: ${menusCount}
📅 Hari ini: ${today}`
    );
    return;
  }

  if (command === "today") {
    const today = new Date().toISOString().split("T")[0];
    const progress = userData.dailyProgress?.[today] || {};
    await sendTelegramMessage(
      chatId,
      `<b>📅 Ringkasan Hari Ini</b>

Tanggal: ${today}
📝 ${Object.keys(progress).length} aktivitas tercatat.`
    );
    return;
  }

  if (command === "undo") {
    await sendTelegramMessage(chatId, "⚠️ Fitur undo masih dikembangkan.");
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
      `🎯 Kirim ke <b>${menu.label}</b>?\n\n📝 Catatan: ${fullCatatan}`,
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
      `🎯 Kirim ke <b>${found.menu.nama}</b>?\n\n📝 Catatan: ${fullCatatan}`,
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
      chatId, messageId,
      `<b>✅ Tersimpan di ${menuId}</b>\n\n📝 Catatan: ${catatan}`,
      [[{ text: "📊 Sync Now", callback_data: `syncnow` }]]
    );
    return;
  }

  if (action === "confirm_custom") {
    const customKey = parts[1];
    const catatan = parts.slice(2).join("|");
    await saveToFirestore(userData, customKey, catatan, "custom");
    await editTelegramMessage(
      chatId, messageId,
      `<b>✅ Tersimpan di ${customKey}</b>\n\n📝 Catatan: ${catatan}`,
      [[{ text: "📊 Sync Now", callback_data: `syncnow` }]]
    );
    return;
  }

  if (action === "delete") {
    await editTelegramMessage(chatId, messageId, "🗑️ Dihapus.");
    return;
  }

  if (action === "syncnow") {
    await editTelegramMessage(chatId, messageId, "📊 Sync dijalankan.");
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
      menuId, catatan,
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
      await sendTelegramMessage(chatId, "⛔ Bot ini private.");
      return NextResponse.json({ ok: true });
    }

    const admin = getAdminApp();
    const firestore = getFirestore(admin);
    const user = await resolveUser(firestore, chatId);
    if (!user) {
      await sendTelegramMessage(chatId, "❌ User nggak ditemukan.");
      return NextResponse.json({ ok: true });
    }

    const userData = {
      ...user.data,
      _uid: user.uid,
      _source: user.source,
    };

    if (update.callback_query) {
      await handleCallback(update.callback_query, userData);
      return NextResponse.json({ ok: true });
    }

    if (update.message && update.message.text) {
      await handleTextMessage(chatId, update.message.text, userData, update.message.message_id);
      return NextResponse.json({ ok: true });
    }

    await sendTelegramMessage(chatId, "🤖 Format nggak didukung.");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[telegram] Error:", err);
    return NextResponse.json({ ok: true, error: err.message });
  }
}

export async function GET() {
  return NextResponse.json({ status: "Telegram webhook aktif." });
}