// lib/telegramData.js

// ========== KONFIGURASI TELEGRAM ==========
export const TELEGRAM_CONFIG = {
  botToken: process.env.TELEGRAM_BOT_TOKEN || "",
  chatId: process.env.TELEGRAM_CHAT_ID || "",
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

// ========== KIRIM PESAN TELEGRAM ==========
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

// ========== KIRIM PESAN DENGAN TOMBOL INLINE ==========
export async function sendTelegramWithButtons(chatId, text, buttons) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN belum diset");

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const body = {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: buttons,
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return await res.json();
}

// ========== JAWAB CALLBACK QUERY ==========
export async function answerCallbackQuery(callbackQueryId, text = "") {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const url = `https://api.telegram.org/bot${token}/answerCallbackQuery`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      callback_query_id: callbackQueryId,
      text,
    }),
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
  if (buttons) {
    body.reply_markup = { inline_keyboard: buttons };
  }
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

// ========== CARI MENU DARI COMMAND ==========
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

// ========== CARI PATH DI DALAM NESTED MENU ==========
export function resolveBelajarPath(payload, kategori) {
  if (!payload || !kategori) return null;

  const norm = (s) => (s || "").toLowerCase().trim().replace(/\s+/g, "");

  if (payload.includes("/")) {
    const segments = payload.split("/").map((s) => norm(s));
    return searchByPath(segments, kategori);
  }

  const target = norm(payload);
  const matches = [];
  searchAllNested(kategori, [], target, matches);

  if (matches.length === 0) return null;
  if (matches.length === 1) return matches[0];
  return { multiple: true, options: matches };
}

function searchByPath(segments, kategori) {
  const norm = (s) => (s || "").toLowerCase().trim().replace(/\s+/g, "");
  let currentArr = kategori;
  let current = null;
  const path = [];
  const labels = [];

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    let found = null;

    if (i === 0) {
      found = (currentArr || []).find((k) => norm(k.nama) === seg);
    } else if (i === 1 && current) {
      found = (current.subKategori || []).find((s) => norm(s.nama) === seg);
    } else if (i === 2 && current) {
      found = (current.tools || []).find((t) => norm(t.nama) === seg);
    } else if (i === 3 && current) {
      found = (current.fitur || []).find((f) => norm(f.nama) === seg);
    } else if (i === 4 && current) {
      found = (current.parts || []).find((p) => norm(p.nama) === seg);
    }

    if (!found) return null;
    path.push(found.id);
    labels.push(found.nama);
    current = found;
  }

  return { path, item: current, labels };
}

function searchAllNested(items, currentPath, target, results) {
  const norm = (s) => (s || "").toLowerCase().trim().replace(/\s+/g, "");
  (items || []).forEach((item) => {
    const newPath = [...currentPath, item.id];
    if (norm(item.nama) === target) {
      results.push({ path: newPath, item, labels: newPath.map((id) => findLabelById(items, id) || id) });
    }
    if (item.subKategori) searchAllNested(item.subKategori, newPath, target, results);
    if (item.tools) searchAllNested(item.tools, newPath, target, results);
    if (item.fitur) searchAllNested(item.fitur, newPath, target, results);
    if (item.parts) searchAllNested(item.parts, newPath, target, results);
  });
}

function findLabelById(items, id) {
  for (const item of items || []) {
    if (item.id === id) return item.nama;
    if (item.subKategori) {
      const r = findLabelById(item.subKategori, id);
      if (r) return r;
    }
    if (item.tools) {
      const r = findLabelById(item.tools, id);
      if (r) return r;
    }
    if (item.fitur) {
      const r = findLabelById(item.fitur, id);
      if (r) return r;
    }
    if (item.parts) {
      const r = findLabelById(item.parts, id);
      if (r) return r;
    }
  }
  return null;
}

// ========== BUILD MENU HELP (HTML) ==========
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

Contoh dengan auto-choose:
/belajar solidworks | latihan extrude | A

<b>🔹 COMMAND LAIN</b>
/menu_list — daftar semua menu
/status — cek status sync
/help — panduan ini
/undo — batalin input terakhir (max 5 menit)
/today — ringkasan hari ini

<b>🔹 TIPS</b>
• Menu auto-detect dari web
• Bisa pakai path lengkap: /belajar design/3d/solidworks | ...
• Bisa pakai nama tool: /belajar solidworks | ...

📱 Bot by @SelfManagementBot`;
}

// ========== BUILD MENU LIST (HTML) ==========
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