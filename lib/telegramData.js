// lib/telegramData.js

// ========== KONFIGURASI ==========
export const TELEGRAM_CONFIG = {
  botToken: process.env.TELEGRAM_BOT_TOKEN || "",
  apiBase: "https://api.telegram.org",
};

// ========== ESCAPE HTML ==========
export function escapeHtml(text) {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}// ========== GENERATE PAIRING CODE ==========
export function generatePairingCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const values = new Uint32Array(6);
  globalThis.crypto.getRandomValues(values);
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[values[i] % chars.length];
  }
  return code;
}

// ========== KIRIM PESAN ==========
export async function sendTelegramMessage(chatId, text, options = {}) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN belum diset");
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const body = { chat_id: chatId, text, parse_mode: "HTML", ...options };
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!data.ok) console.error("[Telegram] Send failed:", data);
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
  if (!token) return;
  const url = `https://api.telegram.org/bot${token}/answerCallbackQuery`;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ callback_query_id: callbackQueryId, text }),
    });
  } catch (e) {
    // Gagal jawab callback jangan sampai membatalkan aksi user: dulu error di
    // sini bikin seluruh handler tombol berhenti sebelum apa pun dikerjakan.
    console.error("[Telegram] answerCallbackQuery gagal:", e.message);
  }
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

// ========== CARI NESTED PATH ==========
export function resolveNestedPath(payload, kategori) {
  if (!kategori) return null;
  const norm = (s) => (s || "").toLowerCase().trim().replace(/\s+/g, "");

  if (payload.includes("/")) {
    const segs = payload.split("/").map(norm);
    let currentArr = kategori;
    let current = null;
    const path = [];
    const labels = [];
    for (const seg of segs) {
      let found = null;
      if (current === null) {
        found = (currentArr || []).find((k) => norm(k.nama) === seg);
      } else {
        found =
          (current.subKategori || []).find((s) => norm(s.nama) === seg) ||
          (current.tools || []).find((t) => norm(t.nama) === seg) ||
          (current.fitur || []).find((f) => norm(f.nama) === seg) ||
          (current.parts || []).find((p) => norm(p.nama) === seg);
      }
      if (!found) return null;
      path.push(found.id);
      labels.push(found.nama);
      current = found;
      if (!current.subKategori && !current.tools && !current.fitur && !current.parts) {
        currentArr = null;
      }
    }
    return { found: true, path, item: current, labels };
  }

  const target = norm(payload);
  const matches = [];
  searchAllNested(kategori, [], target, matches, []);
  if (matches.length === 0) return null;
  if (matches.length === 1) return { found: true, ...matches[0] };
  return { found: false, multiple: matches };
}

function searchAllNested(items, currentPath, target, results, parentLabels) {
  const norm = (s) => (s || "").toLowerCase().trim().replace(/\s+/g, "");
  (items || []).forEach((item) => {
    const newPath = [...currentPath, item.id];
    const newLabels = [...parentLabels, item.nama];
    if (norm(item.nama) === target) {
      results.push({ path: newPath, item, labels: newLabels });
    }
    if (item.subKategori) searchAllNested(item.subKategori, newPath, target, results, newLabels);
    if (item.tools) searchAllNested(item.tools, newPath, target, results, newLabels);
    if (item.fitur) searchAllNested(item.fitur, newPath, target, results, newLabels);
    if (item.parts) searchAllNested(item.parts, newPath, target, results, newLabels);
  });
}

// ========== CARI LEAF PALING DALEM ==========
export function findLeaf(item) {
  if (!item) return null;
  if (item.subKategori && item.subKategori.length > 0) return findLeaf(item.subKategori[0]);
  if (item.tools && item.tools.length > 0) return findLeaf(item.tools[0]);
  if (item.fitur && item.fitur.length > 0) return findLeaf(item.fitur[0]);
  if (item.parts && item.parts.length > 0) return findLeaf(item.parts[0]);
  return item;
}

// ========== DAFTARKAN COMMAND KE MENU BIRU TELEGRAM ==========
// Tanpa ini, tombol "/" di Telegram kosong dan user nggak tau harus ngetik apa.
export async function setBotCommands(commands = []) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || commands.length === 0) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/setMyCommands`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commands }),
    });
  } catch (e) {
    console.error("[Telegram] setMyCommands gagal:", e.message);
  }
}
