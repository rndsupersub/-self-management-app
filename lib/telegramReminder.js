// lib/telegramReminder.js
// Config + logic buat Telegram Reminder Interaktif Bertingkat.
// Versi: 3.1 (FIX TOTAL TIMEZONE WIB)

import { sendTelegramMessage, sendTelegramWithButtons } from "./telegramData";

// ========== CONFIG REMINDER PER MENU ==========
export const REMINDER_CONFIG = {
  olahraga: { label: "Olahraga", emoji: "🏃" },
  "bedah-buku": { label: "Bedah Buku", emoji: "📚" },
  blender: { label: "Blender / SolidWorks", emoji: "🧊" },
  illustrator: { label: "Illustrator / Photoshop", emoji: "🎨" },
  bisnis: { label: "Bisnis", emoji: "💼" },
  hafalan: { label: "Hafalan Qur'an", emoji: "📖" },
  "belajar-bahasa": { label: "Belajar Bahasa", emoji: "🌏" },
  "review-mesin": { label: "Review Teknik Mesin", emoji: "🔧" },
  keuangan: { label: "Keuangan", emoji: "💰" },
  youtube: { label: "YouTube Short", emoji: "📺" },
};

// ========== FUNGSI SAKTI: PAKSA WAKTU WIB ==========
function getWIBDate() {
  const now = new Date();
  // Ambil waktu UTC dalam milidetik
  const utcMs = now.getTime() + (now.getTimezoneOffset() * 60000);
  // Tambah 7 jam buat WIB
  return new Date(utcMs + (3600000 * 7));
}

// ========== HELPER: FORMAT TANGGAL & JAM ==========
export function todayStr() {
  const wib = getWIBDate();
  const year = wib.getFullYear();
  const month = String(wib.getMonth() + 1).padStart(2, "0");
  const day = String(wib.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function nowHHMM() {
  const wib = getWIBDate();
  const hh = String(wib.getHours()).padStart(2, "0");
  const mm = String(wib.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function hhmmToMinutes(hhmm) {
  const [hh, mm] = hhmm.split(":").map(Number);
  return hh * 60 + mm;
}

export function selisihMenit(jamTarget, jamSekarang) {
  return hhmmToMinutes(jamTarget) - hhmmToMinutes(jamSekarang);
}

export function tentukanLapis(selisih) {
  if (selisih >= 14 && selisih <= 16) return { lapis: 1, label: "H-15 menit" };
  if (selisih >= 4 && selisih <= 6) return { lapis: 2, label: "H-5 menit" };
  if (selisih >= 0 && selisih <= 2) return { lapis: 3, label: "H-1 menit" };
  if (selisih < 0) return { lapis: 4, label: "Lewat deadline" };
  return null;
}

// ========== HELPER: BACA JAM DARI JADWAL WEB ==========
function parseJadwalJam(item) {
  let mulai = "";
  let selesai = "";

  if (item.jam && typeof item.jam === 'string' && item.jam.includes('-')) {
    const parts = item.jam.split(/\s*-\s*|\s*--\s*/);
    if (parts.length >= 2) {
      mulai = parts[0].trim();
      selesai = parts[1].trim();
    }
  } else if (item.waktu && typeof item.waktu === 'string' && item.waktu.includes('-')) {
    const parts = item.waktu.split(/\s*-\s*|\s*--\s*/);
    if (parts.length >= 2) {
      mulai = parts[0].trim();
      selesai = parts[1].trim();
    }
  } else {
    mulai = item.jamMulai || item.waktuMulai || item.start || "";
    selesai = item.jamSelesai || item.waktuSelesai || item.end || "";
  }

  const isValidTime = (t) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(t);
  
  return {
    mulai: isValidTime(mulai) ? mulai : "",
    selesai: isValidTime(selesai) ? selesai : ""
  };
}

export function buildReminderText(menuId, lapis, config, jamMulai, deadline) {
  const emoji = config.emoji || "⏰";
  const label = config.label || menuId;

  let header = "";
  let body = "";

  if (lapis === 1) {
    header = `${emoji} <b>Reminder: ${label}</b>`;
    body = `⏰ 15 menit lagi waktunya <b>${label}</b>.\n📅 Jadwal: <b>${jamMulai} – ${deadline}</b>\n\nUdah siap mulai?`;
  } else if (lapis === 2) {
    header = `${emoji} <b>Reminder: ${label}</b>`;
    body = `⏰ 5 menit lagi waktunya <b>${label}</b>.\n📅 Jadwal: <b>${jamMulai} – ${deadline}</b>\n\nAyo mulai!`;
  } else if (lapis === 3) {
    header = `${emoji} <b>⚠️ Reminder Terakhir: ${label}</b>`;
    body = `⚠️ 1 menit lagi! <b>${label}</b> belum dimulai.\n📅 Jadwal: <b>${jamMulai} – ${deadline}</b>\n\nMulai sekarang?`;
  } else if (lapis === 4) {
    header = `${emoji} <b>⚠️ Deadline Lewat: ${label}</b>`;
    body = `⚠️ Waktu <b>${label}</b> udah lewat.\n📅 Jadwal: <b>${jamMulai} – ${deadline}</b>\n\nLo belum isi log hari ini. Mau isi sekarang atau skip?`;
  }

  return `${header}\n\n${body}`;
}

export function buildReminderButtons(menuId, lapis) {
  if (lapis === 4) {
    return [
      [
        { text: "✅ Isi Sekarang", callback_data: `rem_isi|${menuId}` },
        { text: "🚫 Skip Hari Ini", callback_data: `rem_skip|${menuId}` },
      ],
    ];
  }
  return [
    [
      { text: "✅ Udah Mulai", callback_data: `rem_mulai|${menuId}` },
      { text: "🚫 Belum Mau Mulai", callback_data: `rem_belum|${menuId}` },
    ],
  ];
}

export function buildStatusReminderText(userReminderSettings) {
  const lines = [`<b>📋 STATUS REMINDER LO</b>`, ``];

  Object.keys(REMINDER_CONFIG).forEach((menuId) => {
    const config = REMINDER_CONFIG[menuId];
    const enabled = userReminderSettings?.[menuId]?.enabled ?? true;
    const emoji = enabled ? "🟢" : "🔴";
    const status = enabled ? "ON" : "OFF";
    lines.push(`${emoji} ${config.emoji} ${config.label} — <b>${status}</b>`);
  });

  lines.push(``);
  lines.push(`<i>Klik tombol buat toggle ON/OFF.</i>`);
  return lines.join("\n");
}

export function buildStatusReminderButtons(userReminderSettings) {
  const menuIds = Object.keys(REMINDER_CONFIG);
  const rows = [];

  for (let i = 0; i < menuIds.length; i += 2) {
    const row = [];
    const menuId1 = menuIds[i];
    const config1 = REMINDER_CONFIG[menuId1];
    const enabled1 = userReminderSettings?.[menuId1]?.enabled ?? true;
    row.push({
      text: `${enabled1 ? "🟢" : "🔴"} ${config1.label}`.slice(0, 30),
      callback_data: `rem_toggle|${menuId1}`,
    });

    if (menuIds[i + 1]) {
      const menuId2 = menuIds[i + 1];
      const config2 = REMINDER_CONFIG[menuId2];
      const enabled2 = userReminderSettings?.[menuId2]?.enabled ?? true;
      row.push({
        text: `${enabled2 ? "🟢" : "🔴"} ${config2.label}`.slice(0, 30),
        callback_data: `rem_toggle|${menuId2}`,
      });
    }
    rows.push(row);
  }

  rows.push([
    { text: "⏸️ Pause Semua", callback_data: "rem_pause_all" },
    { text: "▶️ Resume Semua", callback_data: "rem_resume_all" },
  ]);

  return rows;
}

export function cekAktivitasSudahDikerjain(userData, tanggal, menuId) {
  const dayProgress = userData?.dailyProgress?.[tanggal] || {};
  const progress = dayProgress[menuId];
  if (!progress) return false;
  return progress.selesai === true || progress.mulai === true;
}

export function cekReminderSudahDikirim(userData, tanggal, menuId, lapis) {
  const log = userData?.reminderLog?.[tanggal]?.[menuId];
  if (!log) return false;
  return log[lapis] === true;
}

// ========== LOGIKA UTAMA: SCAN JADWAL WEB ==========
export function tentukanReminderYangHarusDikirim(userData, sekarangHHMM) {
  const tanggal = todayStr();
  const hasil = [];

  // FIX: Pake getWIBDate() biar hari Minggu/Senin akurat
  const wib = getWIBDate();
  const dayIndex = wib.getDay(); 
  const isMinggu = dayIndex === 0;
  
  const jadwalUser = userData?.jadwalUser || { kerja: [], minggu: [] };
  const jadwalHariIni = isMinggu ? (jadwalUser.minggu || []) : (jadwalUser.kerja || []);

  Object.keys(REMINDER_CONFIG).forEach((menuId) => {
    const config = REMINDER_CONFIG[menuId];

    const enabled = userData?.reminderSettings?.[menuId]?.enabled ?? true;
    if (!enabled) return;

    const jadwalItem = jadwalHariIni.find((j) => {
      const cleanLabel = (j.label || "").toLowerCase().replace(/[^a-z0-9]/g, "");
      const cleanConfig = (config.label || "").toLowerCase().replace(/[^a-z0-9]/g, "");
      return cleanLabel.includes(cleanConfig) || cleanConfig.includes(cleanLabel);
    });

    if (!jadwalItem) return;

    const { mulai, selesai } = parseJadwalJam(jadwalItem);
    if (!mulai) return;

    if (cekAktivitasSudahDikerjain(userData, tanggal, menuId)) return;

    const selisihMulai = selisihMenit(mulai, sekarangHHMM);
    const deadline = selesai || (() => {
      const [h, m] = mulai.split(":").map(Number);
      return `${String(h + 1).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    })();
    const selisihDeadline = selisihMenit(deadline, sekarangHHMM);

    let lapisInfo = tentukanLapis(selisihMulai);

    if (!lapisInfo && selisihDeadline < 0) {
      lapisInfo = { lapis: 4, label: "Lewat deadline" };
    }

    if (!lapisInfo) return;

    if (cekReminderSudahDikirim(userData, tanggal, menuId, lapisInfo.lapis)) return;

    hasil.push({
      menuId,
      lapis: lapisInfo.lapis,
      lapisLabel: lapisInfo.label,
      config,
      jamMulai: mulai,
      deadline: deadline
    });
  });

  return hasil;
}

export async function kirimReminder(chatId, menuId, lapis, config, jamMulai, deadline) {
  const text = buildReminderText(menuId, lapis, config, jamMulai, deadline);
  const buttons = buildReminderButtons(menuId, lapis);
  return await sendTelegramWithButtons(chatId, text, buttons);
}

export function parseReminderCallback(data) {
  const parts = data.split("|");
  const action = parts[0];
  const menuId = parts[1] || null;
  return { action, menuId };
}