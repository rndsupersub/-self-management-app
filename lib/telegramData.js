// lib/telegramData.js

// ========== KONFIGURASI ==========
export const TELEGRAM_CONFIG = {
  botToken: process.env.TELEGRAM_BOT_TOKEN || "",
  apiBase: "https://api.telegram.org",
};

// ========== ESCAPE HTML ==========
function escapeHtml(text) {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ========== GENERATE PAIRING CODE ==========
export function generatePairingCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // tanpa I, O, 0, 1 (biar gampang dibaca)
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// ========== KIRIM PESAN ==========
export async function sendTelegramMessage(chatId, text, options = {}) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN belum diset");

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const body = {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    ...options,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!data.ok) {
    console.error("[Telegram] Send failed:", data);
  }
  return data;
}

// ========== KIRIM PESAN + TOMBOL ==========
export async function sendTelegramWithButtons(chatId, text, buttons) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN belum diset");

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const body = {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: buttons },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return await res.json();
}

// ========== JAWAB CALLBACK ==========
export async function answerCallbackQuery(callbackQueryId, text = "") {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const url = `https://api.telegram.org/bot${token}/answerCallbackQuery`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callback_query_id: callbackQueryId, text }),
  });
}

// ========== EDIT PESAN ==========
export async function editTelegramMessage(chatId, messageId, text, buttons = null) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const url = `https://api.telegram.org/bot${token}/editMessageText`;
  const body = {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: "HTML",
  };
  if (buttons) body.reply_markup = { inline_keyboard: buttons };
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ========== PARSE COMMAND ==========
export function parseCommand(text) {
  if (!text || !text.startsWith("/")) return null;

  const parts = text.split("|").map((p) => p.trim());
  const firstPart = parts[0];
  const catatan = parts[1] || "";
  const autoChoice = parts[2] || "";

  const tokens = firstPart.split(/\s+/);
  const commandToken = tokens[0];
  const command = commandToken.slice(1).toLowerCase();
  const payload = tokens.slice(1).join(" ").trim();

  return { command, payload, catatan, autoChoice };
}

// ========== CARI MENU ==========
export function findMenuByCommand(command, menus, menusCustom) {
  const topMenu = (menus || []).find((m) => m.id === command && m.visible !== false);
  if (topMenu) return { type: "top", menu: topMenu };

  const customById = (menusCustom || {})[command];
  if (customById) return { type: "custom", menu: customById, key: command };

  if (menusCustom && typeof menusCustom === "object") {
    const customKey = Object.keys(menusCustom).find(
      (k) => (menusCustom[k].nama || "").toLowerCase() === command
    );
    if (customKey) return { type: "custom", menu: menusCustom[customKey], key: customKey };
  }

  return null;
}

// ========== BUILD HELP ==========
export function buildHelpText() {
  return `<b>📖 PANDUAN BOT SELF MANAGEMENT</b>

<b>🔹 FORMAT DASAR</b>
/menu_id [catatan]

<b>🔹 CONTOH</b>
/olahraga lari 7km pagi
/keuangan 50000 | makan siang
/belajar solidworks | latihan extrude
/hafalan juz30 annaba ayat 1-10

<b>🔹 FORMAT ADVANCED</b>
/menu_id payload | catatan | A

<b>🔹 COMMAND LAIN</b>
/menu_list — daftar semua menu
/status — cek status sync
/help — panduan ini
/today — ringkasan hari ini

<b>🔹 TIPS</b>
• Menu auto-detect dari web
• Bisa pakai path lengkap: /belajar design/3d/solidworks | ...
• Bisa pakai nama tool: /belajar solidworks | ...

📱 Bot by @self_manage_alfathan_bot`;
}

// ========== BUILD MENU LIST ==========
export function buildMenuListText(menus, menusCustom) {
  const visibleTop = (menus || []).filter((m) => m.visible !== false);
  const customList = Object.values(menusCustom || {});

  let text = "<b>📋 DAFTAR MENU AKTIF</b>\n\n";
  text += "<b>Top-level:</b>\n";
  visibleTop.forEach((m) => {
    text += `/${m.id} — ${escapeHtml(m.label)}\n`;
  });

  if (customList.length > 0) {
    text += "\n<b>Custom:</b>\n";
    customList.forEach((m) => {
      const namaLower = (m.nama || "").toLowerCase().replace(/[^\w]/g, "");
      text += `/${namaLower} — ${escapeHtml(m.nama)}\n`;
    });
  }

  text += "\n<i>Ketik /help buat panduan lengkap.</i>";
  return text;
}