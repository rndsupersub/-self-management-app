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
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
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

// ========== CARI NESTED PATH ==========
// Return { found: true, path, item, labels } atau { found: false, multiple: [...] } atau null
export function resolveNestedPath(payload, kategori) {
  if (!kategori) return null;
  const norm = (s) => (s || "").toLowerCase().trim().replace(/\s+/g, "");

  // Kalau pakai "/" → path spesifik
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

  // Nggak pakai "/" → cari nama
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
// Kalau item punya subKategori/tools/fitur/parts → cari leaf
// Kalau nggak → item itu leaf
export function findLeaf(item) {
  if (!item) return null;
  if (item.subKategori && item.subKategori.length > 0) return findLeaf(item.subKategori[0]);
  if (item.tools && item.tools.length > 0) return findLeaf(item.tools[0]);
  if (item.fitur && item.fitur.length > 0) return findLeaf(item.fitur[0]);
  if (item.parts && item.parts.length > 0) return findLeaf(item.parts[0]);
  return item;
}

// ========== BUILD HELP v2 ==========
export function buildHelpText() {
  return `<b>📖 PANDUAN BOT SELF MANAGEMENT</b>

━━━━━━━━━━━━━━━━━━━━━━
<b>🎯 TENTANG BOT</b>
━━━━━━━━━━━━━━━━━━━━━━
Bot ini buat catat aktivitas harian lo dari HP.
Semua otomatis masuk ke:
• Website Self Management
• Google Sheets (backup)

━━━━━━━━━━━━━━━━━━━━━━
<b>📝 CARA PAKAI (3 CARA)</b>
━━━━━━━━━━━━━━━━━━━━━━

<b>【CARA 1 — Cepat】</b>
Format: /menu_id [catatan]

Contoh:
<code>/olahraga lari 7km pagi</code>
<code>/keuangan 50000 makan siang</code>
<code>/hafalan juz30 annaba ayat 1-10</code>

<b>【CARA 2 — Menu Bercabang】</b>
Format: /menu_id [nama_tool] | [catatan]

Contoh:
<code>/belajar solidworks | latihan extrude</code>
<code>/belajar blender | nonton part 3</code>
<code>/belajar illustrator | part 1-5</code>

<b>【CARA 3 — Interaktif (Klik-klik)】</b>
Ketik: <code>/belajar</code>
Bot bakal tanya step-by-step.
Tinggal klik tombol sampai selesai.

━━━━━━━━━━━━━━━━━━━━━━
<b>🔧 COMMAND LAIN</b>
━━━━━━━━━━━━━━━━━━━━━━
/menu_list — daftar semua menu
/karya — tambah karya mingguan
/status — cek koneksi & sync
/today — ringkasan hari ini
/unlink — putus koneksi Telegram
/help — panduan ini

━━━━━━━━━━━━━━━━━━━━━━
<b>🎨 KARYA MINGGUAN</b>
━━━━━━━━━━━━━━━━━━━━━━
Format:
<code>/karya [tool] | [link_tiktok] | [catatan]</code>

Contoh:
<code>/karya illustrator | https://tiktok.com/xxx</code>

━━━━━━━━━━━━━━━━━━━━━━
<b>❓ KALAU BINGUNG</b>
━━━━━━━━━━━━━━━━━━━━━━
1. Ketik /menu_list → liat menu.
2. Pilih menu → /menu_id
3. Kalau bingung, ketik /menu_id doang
   → bot bakal guide lo klik-klik.

━━━━━━━━━━━━━━━━━━━━━━
<b>💡 TIPS</b>
━━━━━━━━━━━━━━━━━━━━━━
• Bot auto-detect menu dari website lo.
• Nambah menu baru di web?
  Otomatis muncul di /menu_list.
• Catatan bisa panjang.
• Semua auto-sync ke Sheets.

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