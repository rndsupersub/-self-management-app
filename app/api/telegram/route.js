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
  resolveBelajarPath,
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

// ========== NORMALISASI DATA USER ==========
function getUserData(userSnap) {
  if (!userSnap.exists) return null;
  return userSnap.data();
}

// ========== HANDLE PESAN TEKS ==========
async function handleTextMessage(chatId, text, userData, messageId) {
  const parsed = parseCommand(text);

  // Bukan command → cuma balas info
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
    await sendTelegramMessage(chatId, `📊 Status Sync\n\n🟢 Telegram: Aktif\n🟢 Firestore: Tersambung\n📊 Sheets: Auto-sync tiap 5 menit\n\nSync terakhir: —`);
    return;
  }
  if (command === "today") {
    const today = new Date().toISOString().split("T")[0];
    const progress = userData.dailyProgress?.[today] || {};
    const count = Object.keys(progress).length;
    await sendTelegramMessage(chatId, `📅 Ringkasan Hari Ini\n\n${today}\n\n📝 ${count} aktivitas tercatat.`);
    return;
  }
  if (command === "undo") {
    // Cari last input < 5 menit
    const history = userData.telegramHistory || {};
    const now = Date.now();
    const entries = Object.entries(history).filter(
      ([_, h]) => now - (h.timestamp || 0) < 5 * 60 * 1000
    );
    if (entries.length === 0) {
      await sendTelegramMessage(chatId, `⚠️ Nggak ada input dalam 5 menit terakhir.`);
      return;
    }
    // Ambil yang terakhir
    entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
    const [entryId, entry] = entries[0];
    // Hapus dari Firestore
    const admin = getAdminApp();
    const firestore = getFirestore(admin);
    // Hapus session
    await firestore.collection("users").doc(userData._uid).update({
      telegramHistory: Object.fromEntries(entries.slice(1)),
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

  // ========== KALAU MENU TOP-LEVEL ==========
  if (found.type === "top") {
    const menu = found.menu;

    // Skenario 1: Top-level langsung simpen (contoh: olahraga, keuangan, hafalan)
    // Bisa simpen ke field khusus atau dailyProgress
    const fullCatatan = catatan || payload;

    if (!fullCatatan) {
      await sendTelegramMessage(chatId, `⚠️ Catatan kosong. Contoh: /${menu.id} isi catatan`);
      return;
    }

    // Konfirmasi ke user
    await sendTelegramWithButtons(
      chatId,
      `🎯 Kirim ke *${menu.label}*?\n\n📝 Catatan: ${fullCatatan}\n\n_${menu.id}_`,
      [
        [{ text: "✅ Ya", callback_data: `confirm|${menu.id}||${fullCatatan}` }],
        [{ text: "❌ Batal", callback_data: "cancel" }],
      ]
    );
    return;
  }

  // ========== KALAU MENU CUSTOM ==========
  if (found.type === "custom") {
    const fullCatatan = catatan || payload;
    if (!fullCatatan) {
      await sendTelegramMessage(chatId, `⚠️ Catatan kosong.`);
      return;
    }
    await sendTelegramWithButtons(
      chatId,
      `🎯 Kirim ke *${found.menu.nama}*?\n\n📝 Catatan: ${fullCatatan}`,
      [
        [{ text: "✅ Ya", callback_data: `confirm_custom|${found.key}||${fullCatatan}` }],
        [{ text: "❌ Batal", callback_data: "cancel" }],
      ]
    );
    return;
  }
}

// ========== HANDLE CALLBACK QUERY (TOMBOL) ==========
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
    await saveToFirestore(userData, menuId, catatan, "top", null);
    await editTelegramMessage(
      chatId,
      messageId,
      `✅ *Tersimpan di ${menuId}*\n\n📝 Catatan: ${catatan}\n📊 Sheets: auto-sync tiap 5 menit`,
      [
        [
          { text: "✏️ Edit", callback_data: `edit|${menuId}||${catatan}` },
          { text: "🗑️ Hapus", callback_data: `delete|${menuId}||${catatan}` },
        ],
        [
          { text: "📊 Sync Now", callback_data: `syncnow` },
        ],
      ]
    );
    return;
  }

  if (action === "confirm_custom") {
    const customKey = parts[1];
    const catatan = parts.slice(2).join("|");
    await saveToFirestore(userData, customKey, catatan, "custom", null);
    await editTelegramMessage(
      chatId,
      messageId,
      `✅ *Tersimpan di ${customKey}*\n\n📝 Catatan: ${catatan}\n📊 Sheets: auto-sync tiap 5 menit`,
      [
        [
          { text: "🗑️ Hapus", callback_data: `delete_custom|${customKey}||${catatan}` },
        ],
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
    // Trigger sync via API internal
    try {
      await fetch(`${process.env.VERCEL_URL ? "https://" + process.env.VERCEL_URL : "http://localhost:3000"}/api/sync-sheets`, {
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
async function saveToFirestore(userData, menuId, catatan, type, extra) {
  const admin = getAdminApp();
  const firestore = getFirestore(admin);
  const uid = userData._uid;
  const today = new Date().toISOString().split("T")[0];
  const userRef = firestore.collection("users").doc(uid);

  if (type === "top") {
    // Simpen ke dailyProgress + field khusus
    const dailyProgress = userData.dailyProgress || {};
    const todayData = dailyProgress[today] || {};
    todayData[menuId] = { ...(todayData[menuId] || {}), catatan, updatedAt: new Date().toISOString() };
    dailyProgress[today] = todayData;

    // Track history (untuk undo)
    const telegramHistory = userData.telegramHistory || {};
    telegramHistory[`${Date.now()}`] = {
      menuId,
      catatan,
      summary: `${menuId}: ${catatan}`,
      timestamp: Date.now(),
    };

    await userRef.update({ dailyProgress, telegramHistory });
  } else if (type === "custom") {
    // Simpen ke menusCustomLogHarian
    const logs = userData.menusCustomLogHarian || {};
    const todayLog = logs[today] || {};
    todayLog[menuId] = { ...(todayLog[menuId] || {}), catatan, updatedAt: new Date().toISOString() };
    logs[today] = todayLog;

    await userRef.update({ menusCustomLogHarian: logs });
  }
}

// ========== MAIN HANDLER ==========
export async function POST(req) {
  try {
    const update = await req.json();

    // Ambil chat ID dari update
    const message = update.message || update.callback_query?.message;
    if (!message) return NextResponse.json({ ok: true });

    const chatId = message.chat.id;

    // Cek apakah chat ID sesuai dengan yang di-set di ENV
    const allowedChatId = process.env.TELEGRAM_CHAT_ID;
    if (allowedChatId && String(chatId) !== String(allowedChatId)) {
      await sendTelegramMessage(chatId, "⛔ Bot ini private. Akses ditolak.");
      return NextResponse.json({ ok: true });
    }

    // Cari user berdasarkan chat ID
    const admin = getAdminApp();
    const firestore = getFirestore(admin);
    const usersSnap = await firestore
      .collection("users")
      .where("telegramChatId", "==", chatId)
      .limit(1)
      .get();

    // Kalau nggak ketemu, pake user pertama (karena single-user, lo)
    let userData = null;
    let uid = null;

    if (!usersSnap.empty) {
      userData = usersSnap.docs[0].data();
      uid = usersSnap.docs[0].id;
    } else {
      // Fallback: ambil semua users, cuma boleh 1
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

    // Handle callback query (tombol)
    if (update.callback_query) {
      await handleCallback(update.callback_query, userData);
      return NextResponse.json({ ok: true });
    }

    // Handle pesan teks
    if (update.message && update.message.text) {
      await handleTextMessage(
        chatId,
        update.message.text,
        userData,
        update.message.message_id
      );
      return NextResponse.json({ ok: true });
    }

    // Handle pesan lain (foto, voice, dll) — sementara balas info
    await sendTelegramMessage(chatId, "🤖 Format nggak didukung (Fase 1). Fitur foto & voice note bakal datang di Fase 2.");

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[telegram] Error:", err);
    return NextResponse.json({ ok: true, error: err.message });
  }
}

export async function GET() {
  return NextResponse.json({ status: "Telegram webhook aktif." });
}