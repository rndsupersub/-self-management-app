// lib/telegramReminder.js
// Config + logic buat Telegram Reminder Interaktif Bertingkat.
// Versi: 1.0
//
// Konsep:
// - Reminder per menu (belajar, olahraga, keuangan, dll).
// - Bertingkat 3: H-15 menit, H-5 menit, H-1 menit.
// - Final: lewat deadline.
// - Tombol: ✅ Udah mulai | 🚫 Belum mau mulai
// - Auto-stop kalau aktivitas udah dikerjain.
// - Toggle per menu (ON/OFF) via Telegram & web.

import { sendTelegramMessage, sendTelegramWithButtons } from "./telegramData";

// ========== CONFIG REMINDER PER MENU ==========
// Sesuai jadwal lo di website.
// Format jam: "HH:MM" (24 jam, timezone Asia/Jakarta).
//
// Struktur:
// {
//   [menuId]: {
//     label: "Nama Menu",
//     jamMulai: "HH:MM",      // jam mulai aktivitas
//     deadline: "HH:MM",      // jam deadline (akhir aktivitas)
//     enabled: true,          // default ON/OFF
//     emoji: "📚",
//   }
// }
export const REMINDER_CONFIG = {
  olahraga: {
    label: "Olahraga",
    jamMulai: "05:30",
    deadline: "06:30",
    enabled: true,
    emoji: "🏃",
  },
  "bedah-buku": {
    label: "Bedah Buku",
    jamMulai: "09:00",
    deadline: "10:00",
    enabled: true,
    emoji: "📚",
  },
  blender: {
    label: "Blender / SolidWorks",
    jamMulai: "10:00",
    deadline: "11:00",
    enabled: true,
    emoji: "🧊",
  },
  illustrator: {
    label: "Illustrator / Photoshop",
    jamMulai: "11:00",
    deadline: "12:00",
    enabled: true,
    emoji: "🎨",
  },
  bisnis: {
    label: "Bisnis",
    jamMulai: "20:30",
    deadline: "21:30",
    enabled: true,
    emoji: "💼",
  },
  hafalan: {
    label: "Hafalan Qur'an",
    jamMulai: "21:30",
    deadline: "22:00",
    enabled: true,
    emoji: "📖",
  },
  "belajar-bahasa": {
    label: "Belajar Bahasa",
    jamMulai: "22:00",
    deadline: "22:30",
    enabled: true,
    emoji: "🌏",
  },
  "review-mesin": {
    label: "Review Teknik Mesin",
    jamMulai: "22:30",
    deadline: "23:15",
    enabled: true,
    emoji: "🔧",
  },
  keuangan: {
    label: "Keuangan",
    jamMulai: "23:45",
    deadline: "23:50",
    enabled: true,
    emoji: "💰",
  },
  youtube: {
    label: "YouTube Short",
    jamMulai: "23:50",
    deadline: "23:55",
    enabled: true,
    emoji: "📺",
  },
};

// ========== HELPER: FORMAT TANGGAL & JAM ==========
export function todayStr() {
  return new Date().toISOString().split("T")[0];
}

// Ambil waktu sekarang dalam format "HH:MM" timezone Asia/Jakarta.
export function nowHHMM() {
  const now = new Date();
  // Konversi ke timezone Asia/Jakarta (UTC+7)
  const jakartaOffset = 7 * 60; // menit
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const jakartaMinutes = (utcMinutes + jakartaOffset) % (24 * 60);
  const hh = String(Math.floor(jakartaMinutes / 60)).padStart(2, "0");
  const mm = String(jakartaMinutes % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

// Konversi "HH:MM" ke total menit dari tengah malam.
export function hhmmToMinutes(hhmm) {
  const [hh, mm] = hhmm.split(":").map(Number);
  return hh * 60 + mm;
}

// ========== HELPER: HITUNG SELISIH MENIT ==========
// Return selisih menit antara jamTarget dan jamSekarang.
// Positif = jamTarget masih di depan.
// Negatif = jamTarget udah lewat.
export function selisihMenit(jamTarget, jamSekarang) {
  return hhmmToMinutes(jamTarget) - hhmmToMinutes(jamSekarang);
}

// ========== HELPER: TENTUKAN LAPIS REMINDER ==========
// Berdasarkan selisih menit, tentukan lapis reminder:
// - 15 menit → lapis 1
// - 5 menit → lapis 2
// - 1 menit → lapis 3
// - 0 atau negatif (lewat deadline) → final
// - selain itu → null (belum waktunya)
//
// Kita kasih toleransi ±1 menit biar nggak kelewat.
export function tentukanLapis(selisih) {
  if (selisih >= 14 && selisih <= 16) return { lapis: 1, label: "H-15 menit" };
  if (selisih >= 4 && selisih <= 6) return { lapis: 2, label: "H-5 menit" };
  if (selisih >= 0 && selisih <= 2) return { lapis: 3, label: "H-1 menit" };
  if (selisih < 0) return { lapis: 4, label: "Lewat deadline" };
  return null;
}

// ========== HELPER: BUILD TEKS REMINDER ==========
export function buildReminderText(menuId, lapis, config) {
  const emoji = config.emoji || "⏰";
  const label = config.label || menuId;
  const jamMulai = config.jamMulai;
  const deadline = config.deadline;

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

// ========== HELPER: BUILD TOMBOL REMINDER ==========
export function buildReminderButtons(menuId, lapis) {
  if (lapis === 4) {
    // Final: isi sekarang atau skip
    return [
      [
        { text: "✅ Isi Sekarang", callback_data: `rem_isi|${menuId}` },
        { text: "🚫 Skip Hari Ini", callback_data: `rem_skip|${menuId}` },
      ],
    ];
  }
  // Lapis 1-3: udah mulai atau belum mau mulai
  return [
    [
      { text: "✅ Udah Mulai", callback_data: `rem_mulai|${menuId}` },
      { text: "🚫 Belum Mau Mulai", callback_data: `rem_belum|${menuId}` },
    ],
  ];
}

// ========== HELPER: BUILD STATUS REMINDER ==========
// Buat command /reminder di Telegram.
export function buildStatusReminderText(userReminderSettings) {
  const lines = [`<b>📋 STATUS REMINDER LO</b>`, ``];

  Object.keys(REMINDER_CONFIG).forEach((menuId) => {
    const config = REMINDER_CONFIG[menuId];
    const enabled = userReminderSettings?.[menuId]?.enabled ?? config.enabled;
    const emoji = enabled ? "🟢" : "🔴";
    const status = enabled ? "ON" : "OFF";
    lines.push(`${emoji} ${config.emoji} ${config.label} — <b>${status}</b>`);
  });

  lines.push(``);
  lines.push(`<i>Klik tombol buat toggle ON/OFF.</i>`);
  return lines.join("\n");
}

// ========== HELPER: BUILD TOMBOL STATUS ==========
// Buat command /reminder. Tombol toggle per menu.
export function buildStatusReminderButtons(userReminderSettings) {
  const menuIds = Object.keys(REMINDER_CONFIG);
  const rows = [];

  // Bikin baris 2 tombol per baris
  for (let i = 0; i < menuIds.length; i += 2) {
    const row = [];
    const menuId1 = menuIds[i];
    const config1 = REMINDER_CONFIG[menuId1];
    const enabled1 = userReminderSettings?.[menuId1]?.enabled ?? config1.enabled;
    row.push({
      text: `${enabled1 ? "🟢" : "🔴"} ${config1.label}`.slice(0, 30),
      callback_data: `rem_toggle|${menuId1}`,
    });

    if (menuIds[i + 1]) {
      const menuId2 = menuIds[i + 1];
      const config2 = REMINDER_CONFIG[menuId2];
      const enabled2 = userReminderSettings?.[menuId2]?.enabled ?? config2.enabled;
      row.push({
        text: `${enabled2 ? "🟢" : "🔴"} ${config2.label}`.slice(0, 30),
        callback_data: `rem_toggle|${menuId2}`,
      });
    }
    rows.push(row);
  }

  // Baris terakhir: tombol pause all & resume all
  rows.push([
    { text: "⏸️ Pause Semua", callback_data: "rem_pause_all" },
    { text: "▶️ Resume Semua", callback_data: "rem_resume_all" },
  ]);

  return rows;
}

// ========== HELPER: CEK APAKAH AKTIVITAS UDAH DIKERJAIN ==========
// Cek dari userData.dailyProgress[tanggal][menuId].
// Kalau selesai === true atau mulai === true, return true.
export function cekAktivitasSudahDikerjain(userData, tanggal, menuId) {
  const dayProgress = userData?.dailyProgress?.[tanggal] || {};
  const progress = dayProgress[menuId];
  if (!progress) return false;
  return progress.selesai === true || progress.mulai === true;
}

// ========== HELPER: CEK APAKAH REMINDER SUDAH DIKIRIM HARI INI ==========
// Biar nggak spam, kita catat reminder yang udah dikirim di userData.reminderLog.
// Format: reminderLog[tanggal][menuId][lapis] = true
export function cekReminderSudahDikirim(userData, tanggal, menuId, lapis) {
  const log = userData?.reminderLog?.[tanggal]?.[menuId];
  if (!log) return false;
  return log[lapis] === true;
}

// ========== HELPER: TENTUKAN REMINDER YANG HARUS DIKIRIM ==========
// Return array of { menuId, lapis, config } yang harus dikirim sekarang.
export function tentukanReminderYangHarusDikirim(userData, sekarangHHMM) {
  const tanggal = todayStr();
  const hasil = [];

  Object.keys(REMINDER_CONFIG).forEach((menuId) => {
    const config = REMINDER_CONFIG[menuId];

    // Cek toggle user
    const enabled = userData?.reminderSettings?.[menuId]?.enabled ?? config.enabled;
    if (!enabled) return;

    // Cek apakah aktivitas udah dikerjain
    if (cekAktivitasSudahDikerjain(userData, tanggal, menuId)) return;

    // Hitung selisih ke jamMulai & deadline
    const selisihMulai = selisihMenit(config.jamMulai, sekarangHHMM);
    const selisihDeadline = selisihMenit(config.deadline, sekarangHHMM);

    // Tentukan lapis
    let lapisInfo = tentukanLapis(selisihMulai);

    // Kalau udah lewat deadline, dan belum dikerjain, kirim final
    if (!lapisInfo && selisihDeadline < 0) {
      lapisInfo = { lapis: 4, label: "Lewat deadline" };
    }

    if (!lapisInfo) return;

    // Cek apakah reminder lapis ini udah dikirim
    if (cekReminderSudahDikirim(userData, tanggal, menuId, lapisInfo.lapis)) return;

    hasil.push({
      menuId,
      lapis: lapisInfo.lapis,
      lapisLabel: lapisInfo.label,
      config,
    });
  });

  return hasil;
}

// ========== KIRIM REMINDER ==========
export async function kirimReminder(chatId, menuId, lapis, config) {
  const text = buildReminderText(menuId, lapis, config);
  const buttons = buildReminderButtons(menuId, lapis);
  return await sendTelegramWithButtons(chatId, text, buttons);
}

// ========== HANDLE CALLBACK REMINDER ==========
// Return { action, menuId } buat diproses di route.js.
export function parseReminderCallback(data) {
  const parts = data.split("|");
  const action = parts[0];
  const menuId = parts[1] || null;
  return { action, menuId };
}