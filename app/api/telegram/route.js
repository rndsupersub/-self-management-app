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

// ========== FIREBASE ADMIN ==========
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

// ========== RESOLVE USER BY CHAT ID ==========
async function resolveUser(firestore, chatId) {
  const chatIdNum = Number(chatId);
  const chatIdStr = String(chatId);

  // Try number
  try {
    const snap = await firestore.collection("users")
      .where("telegramChatId", "==", chatIdNum).limit(1).get();
    if (!snap.empty) {
      return { uid: snap.docs[0].id, data: snap.docs[0].data() };
    }
  } catch (e) {}

  // Try string
  try {
    const snap = await firestore.collection("users")
      .where("telegramChatId", "==", chatIdStr).limit(1).get();
    if (!snap.empty) {
      return { uid: snap.docs[0].id, data: snap.docs[0].data() };
    }
  } catch (e) {}

  return null;
}

// ========== HANDLE /link ==========
async function handleLink(firestore, chatId, code, fromData) {
  const codeUpper = code.toUpperCase().trim();

  // Cek kode di Firestore
  const codeRef = firestore.collection("pairingCodes").doc(codeUpper);
  const codeSnap = await codeRef.get();

  if (!codeSnap.exists) {
    await sendTelegramMessage(chatId, `❌ Kode <b>${codeUpper}</b> nggak valid atau udah kepake.\n\nBuka web → Telegram Setting → Generate code baru.`);
    return;
  }

  const codeData = codeSnap.data();
  const uid = codeData.uid;

  // Update user — set telegramChatId
  await firestore.collection("users").doc(uid).update({
    telegramChatId: Number(chatId),
    telegramUsername: fromData?.username || "",
    telegramFirstName: fromData?.first_name || "",
    telegramLinkedAt: new Date().toISOString(),
  });

  // Hapus code
  await codeRef.delete();

  await sendTelegramMessage(
    chatId,
    `<b>✅ Berhasil di-link!</b>

Akun Telegram lo udah nyambung ke Self Management.
UID: <code>${uid}</code>

<b>Langkah selanjutnya:</b>
• Kirim /help buat panduan
• Kirim /menu_list buat lihat menu
• Kirim /olahraga lari 7km buat simpen catatan

📱 <i>Link ini permanent. Nggak perlu pairing ulang.</i>`
  );
}

// ========== HANDLE PESAN ==========
async function handleTextMessage(firestore, chatId, text, userData, messageId, fromData) {
  const parsed = parseCommand(text);

  if (!parsed) {
    await sendTelegramMessage(chatId, `🤖 Halo! Kirim /help atau /menu_list.`);
    return;
  }

  const { command, payload, catatan } = parsed;

  // ==== COMMAND SPESIAL (nggak butuh userData) ====
  if (command === "start") {
    await sendTelegramMessage(
      chatId,
      `👋 Halo <b>${fromData?.first_name || "Sobat"}</b>!

Bot ini buat Self Management. Untuk mulai:

1️⃣ Buka web lo
2️⃣ Klik <b>🤖 Telegram</b> di navbar
3️⃣ Klik <b>Generate Pairing Code</b>
4️⃣ Kirim ke sini: <code>/link KODE_LO</code>

Kalau udah link, kirim /help buat panduan.`
    );
    return;
  }

  if (command === "link") {
    if (!payload) {
      await sendTelegramMessage(chatId, `⚠️ Format: <code>/link KODE</code>\n\nContoh: /link ABC123`);
      return;
    }
    await handleLink(firestore, chatId, payload, fromData);
    return;
  }

  if (command === "help") {
    await sendTelegramMessage(chatId, buildHelpText());
    return;
  }

  // ==== COMMAND YANG BUTUH USER ====
  if (!userData) {
    await sendTelegramMessage(
      chatId,
      `⚠️ Akun Telegram lo belum di-link ke Self Management.\n\nBuka web → 🤖 Telegram → Generate Pairing Code → kirim <code>/link KODE</code>.`
    );
    return;
  }

  if (command === "menu_list") {
    const menus = userData.menus || [];
    const menusCustom = userData.menusCustom || {};
    await sendTelegramMessage(chatId, buildMenuListText(menus, menusCustom));
    return;
  }

  if (command === "debug") {
    const menus = userData.menus || [];
    await sendTelegramMessage(
      chatId,
      `<b>🔍 DEBUG</b>\n\nUID: <code>${userData._uid}</code>\nmenus count: ${menus.length}\nSample: ${menus.slice(0, 3).map((m) => m.id).join(", ")}`
    );
    return;
  }

  if (command === "status") {
    const today = new Date().toISOString().split("T")[0];
    const menusCount = (userData.menus || []).filter((m) => m.visible !== false).length;
    await sendTelegramMessage(
      chatId,
      `<b>📊 Status Sync</b>\n\n🟢 Telegram: Aktif\n📋 Menu aktif: ${menusCount}\n📅 Hari ini: ${today}`
    );
    return;
  }

  if (command === "today") {
    const today = new Date().toISOString().split("T")[0];
    const progress = userData.dailyProgress?.[today] || {};
    await sendTelegramMessage(
      chatId,
      `<b>📅 Ringkasan Hari Ini</b>\n\n📝 ${Object.keys(progress).length} aktivitas tercatat.`
    );
    return;
  }

  if (command === "unlink") {
    await firestore.collection("users").doc(userData._uid).update({
      telegramChatId: null,
      telegramUsername: null,
      telegramFirstName: null,
      telegramLinkedAt: null,
    });
    await sendTelegramMessage(chatId, `✅ Akun Telegram lo udah di-unlink. Buat link lagi, generate code baru di web.`);
    return;
  }

  // ==== MENU COMMAND ====
  const found = findMenuByCommand(command, userData.menus, userData.menusCustom);
  if (!found) {
    await sendTelegramMessage(chatId, `❌ Menu "${command}" nggak ada.\nKetik /menu_list buat lihat daftar.`);
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
      `<b>✅ Tersimpan di ${menuId}</b>\n\n📝 ${catatan}`,
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
      `<b>✅ Tersimpan di ${customKey}</b>\n\n📝 ${catatan}`,
      [[{ text: "📊 Sync Now", callback_data: `syncnow` }]]
    );
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

    await userRef.update({ dailyProgress });
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
    const fromData = message.from || message.chat;

    const admin = getAdminApp();
    const firestore = getFirestore(admin);

    // Cari user by chatId
    const user = await resolveUser(firestore, chatId);
    const userData = user ? { ...user.data, _uid: user.uid } : null;

    // Handle callback (butuh userData)
    if (update.callback_query) {
      if (!userData) {
        await sendTelegramMessage(chatId, `⚠️ Akun belum di-link. Ketik /start.`);
        return NextResponse.json({ ok: true });
      }
      await handleCallback(update.callback_query, userData);
      return NextResponse.json({ ok: true });
    }

    // Handle text
    if (update.message && update.message.text) {
      await handleTextMessage(firestore, chatId, update.message.text, userData, update.message.message_id, fromData);
      return NextResponse.json({ ok: true });
    }

    await sendTelegramMessage(chatId, "🤖 Format nggak didukung (Fase 1).");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[telegram] Error:", err);
    return NextResponse.json({ ok: true, error: err.message });
  }
}

export async function GET() {
  return NextResponse.json({ status: "Telegram webhook aktif." });
}