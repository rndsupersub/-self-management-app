// lib/telegramData.js

// ========== KONFIGURASI TELEGRAM ==========
export const TELEGRAM_CONFIG = {
  botToken: process.env.TELEGRAM_BOT_TOKEN || "",
  chatId: process.env.TELEGRAM_CHAT_ID || "",
  apiBase: "https://api.telegram.org",
};

// ========== KIRIM PESAN TELEGRAM ==========
export async function sendTelegramMessage(chatId, text, options = {}) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN belum diset");

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const body = {
    chat_id: chatId,
    text,
    parse_mode: "Markdown",
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
    parse_mode: "Markdown",
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

// ========== EDIT PESAN (untuk update status) ==========
export async function editTelegramMessage(chatId, messageId, text, buttons = null) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const url = `https://api.telegram.org/bot${token}/editMessageText`;
  const body = {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: "Markdown",
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
// Input: "/belajar solidworks | latihan extrude | A"
// Output: { command: "belajar", payload: "solidworks", catatan: "latihan extrude", autoChoice: "A" }
export function parseCommand(text) {
  if (!text || !text.startsWith("/")) return null;

  // Split per "|" — pertama = command + payload, kedua = catatan, ketiga = autoChoice
  const parts = text.split("|").map((p) => p.trim());
  const firstPart = parts[0]; // "/belajar solidworks"
  const catatan = parts[1] || "";
  const autoChoice = parts[2] || "";

  // Parse first part: split by space
  const tokens = firstPart.split(/\s+/);
  const commandToken = tokens[0]; // "/belajar"
  const command = commandToken.slice(1).toLowerCase(); // "belajar"
  const payload = tokens.slice(1).join(" ").trim(); // "solidworks"

  return { command, payload, catatan, autoChoice };
}

// ========== CARI MENU DARI COMMAND ==========
// Prioritas:
// 1. Exact match di menus (ID)
// 2. Match di menusCustom (ID)
// 3. Match di menusCustom (nama lowercase)
export function findMenuByCommand(command, menus, menusCustom) {
  // Cek di menus (top-level)
  const topMenu = (menus || []).find((m) => m.id === command && m.visible !== false);
  if (topMenu) return { type: "top", menu: topMenu };

  // Cek di menusCustom (by ID)
  const customById = (menusCustom || {})[command];
  if (customById) return { type: "custom", menu: customById, key: command };

  // Cek di menusCustom (by nama)
  if (menusCustom && typeof menusCustom === "object") {
    const customKey = Object.keys(menusCustom).find(
      (k) => (menusCustom[k].nama || "").toLowerCase() === command
    );
    if (customKey) return { type: "custom", menu: menusCustom[customKey], key: customKey };
  }

  return null;
}

// ========== CARI PATH DI DALAM NESTED MENU ==========
// Cari di belajar.kategori[].subKategori[].tools[].fitur[].parts[]
// Input: payload "solidworks" atau "design/3d/solidworks"
// Output: { path: [...], item, labels: [...] } atau null
export function resolveBelajarPath(payload, kategori) {
  if (!payload || !kategori) return null;

  const norm = (s) => (s || "").toLowerCase().trim().replace(/\s+/g, "");

  // Kalau pakai "/" → split jadi path
  if (payload.includes("/")) {
    const segments = payload.split("/").map((s) => norm(s));
    return searchByPath(segments, kategori);
  }

  // Kalau nggak pakai "/" → cari di seluruh nested
  const target = norm(payload);
  const matches = [];
  searchAllNested(kategori, [], target, matches);

  if (matches.length === 0) return null;
  if (matches.length === 1) return matches[0];
  // >1 match → return all
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
    let foundArray = null;

    if (i === 0) {
      // Cari di kategori
      found = (currentArr || []).find((k) => norm(k.nama) === seg);
      foundArray = currentArr;
    } else if (i === 1 && current) {
      found = (current.subKategori || []).find((s) => norm(s.nama) === seg);
      foundArray = current.subKategori;
    } else if (i === 2 && current) {
      found = (current.tools || []).find((t) => norm(t.nama) === seg);
      foundArray = current.tools;
    } else if (i === 3 && current) {
      found = (current.fitur || []).find((f) => norm(f.nama) === seg);
      foundArray = current.fitur;
    } else if (i === 4 && current) {
      found = (current.parts || []).find((p) => norm(p.nama) === seg);
      foundArray = current.parts;
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
      results.push({
        path: newPath,
        item,
        labels: newPath.map((id) => findLabelById(items, id) || id),
      });
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

// ========== BUILD MENU HELP ==========
export function buildHelpText() {
  return `📖 *PANDUAN BOT SELF MANAGEMENT*

🔹 *FORMAT DASAR*
/menu_id [catatan]

🔹 *CONTOH*
/olahraga lari 7km pagi
/keuangan 50000 | makan siang
/belajar solidworks | latihan extrude
/hafalan juz30 annaba ayat 1-10

🔹 *FORMAT ADVANCED*
/menu_id payload | catatan | A

Contoh dengan auto-choose:
/belajar solidworks | latihan extrude | A

🔹 *COMMAND LAIN*
/menu_list — daftar semua menu
/status — cek status sync
/help — panduan ini
/undo — batalin input terakhir (max 5 menit)
/today — ringkasan hari ini

🔹 *TIPS*
• Menu auto-detect dari web
• Bisa pakai path lengkap: /belajar design/3d/solidworks | ...
• Bisa pakai nama tool: /belajar solidworks | ...

📱 Bot by @SelfManagementBot`;
}

// ========== BUILD MENU LIST ==========
export function buildMenuListText(menus, menusCustom) {
  const visibleTop = (menus || []).filter((m) => m.visible !== false);
  const customList = Object.values(menusCustom || {});

  let text = "📋 *DAFTAR MENU AKTIF*\n\n";
  text += "*Top-level:*\n";
  visibleTop.forEach((m) => {
    text += `/${m.id} — ${m.label}\n`;
  });

  if (customList.length > 0) {
    text += "\n*Custom:*\n";
    customList.forEach((m) => {
      const namaLower = (m.nama || "").toLowerCase().replace(/[^\w]/g, "");
      text += `/${namaLower} — ${m.nama}\n`;
    });
  }

  text += "\n_Ketik /help buat panduan lengkap._";
  return text;
}