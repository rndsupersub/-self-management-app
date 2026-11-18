// lib/telegramReminder.js
// Config + logic buat Telegram Reminder Interaktif Bertingkat.
// Versi: 3.1 (FIX TOTAL TIMEZONE WIB)

import { sendTelegramWithButtons } from "./telegramData";
import { DEFAULT_JADWAL, deteksiJadwalOtomatis } from "./jadwalData";

// ========== CONFIG REMINDER PER MENU ==========
// `scheduleId` = ID asli item di jadwalUser/dailyProgress web.
// ID config lama tetap dipakai buat nyimpen setting user (biar setting lama
// nggak hilang), tapi progress/log selalu nulis ke scheduleId.
export const REMINDER_CONFIG = {
  olahraga: { label: "Olahraga", emoji: "🏃", scheduleId: "olahraga" },
  "bedah-buku": { label: "Bedah Buku", emoji: "📚", scheduleId: "bedah-buku" },
  blender: { label: "Blender / SolidWorks", emoji: "🧊", scheduleId: "blender_solidworks" },
  illustrator: { label: "Illustrator / Photoshop", emoji: "🎨", scheduleId: "desain" },
  bisnis: { label: "Bisnis", emoji: "💼", scheduleId: "bisnis" },
  hafalan: { label: "Hafalan Qur'an", emoji: "📖", scheduleId: "hafalan" },
  "belajar-bahasa": { label: "Belajar Bahasa", emoji: "🌏", scheduleId: "mandarin" },
  "review-mesin": { label: "Review Teknik Mesin", emoji: "🔧", scheduleId: "teknik" },
  keuangan: { label: "Keuangan", emoji: "💰", scheduleId: "keuangan" },
  youtube: { label: "YouTube Short", emoji: "📺", scheduleId: "youtube" },
};

// ========== HELPER: RESOLVE ID REMINDER ==========
// Terima ID config lama ("blender") maupun ID jadwal ("blender_solidworks").
export function getReminderConfig(id) {
  if (!id) return null;
  if (REMINDER_CONFIG[id]) return { id, config: REMINDER_CONFIG[id] };
  const key = Object.keys(REMINDER_CONFIG).find(
    (k) => REMINDER_CONFIG[k].scheduleId === id
  );
  return key ? { id: key, config: REMINDER_CONFIG[key] } : null;
}

export function getReminderIds(id) {
  const found = getReminderConfig(id);
  return [...new Set([id, found?.id, found?.config?.scheduleId].filter(Boolean))];
}

// ========== SUMBER JADWAL (SATU SUMBER LOGIKA) ==========
// Reminder pribadi WAJIB baca jadwal yang sama dengan web. Kalau user ngehapus
// atau ngedit aktivitas di "Kelola Jadwal", daftar reminder ikut berubah —
// nggak ada daftar terpisah yang bisa beda sama jadwal.
export function getJadwalSumber(userData) {
  const jadwalUser = userData?.jadwalUser;
  const lengkap =
    Array.isArray(jadwalUser?.kerja) && Array.isArray(jadwalUser?.minggu);
  return lengkap ? jadwalUser : DEFAULT_JADWAL;
}

function rapikanLabel(teks) {
  return String(teks || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

// Cari item jadwal buat satu config reminder: utamakan ID, lalu label.
export function cariJadwalUntukReminder(daftarJadwal, config) {
  if (!Array.isArray(daftarJadwal) || !config) return null;

  const byId = daftarJadwal.find((j) => j?.id && j.id === config.scheduleId);
  if (byId) return byId;

  const target = rapikanLabel(config.label);
  if (!target) return null;

  return (
    daftarJadwal.find((j) => {
      const label = rapikanLabel(j?.label);
      if (!label) return false;
      // Samain labelnya, atau diawali nama aktivitasnya ("Olahraga ringan"
      // cocok sama "Olahraga"). "Review keuangan" TIDAK dianggap "Keuangan",
      // biar aktivitas yang udah dihapus nggak muncul lagi gara-gara mirip.
      return label === target || label.startsWith(target);
    }) || null
  );
}

// Reminder yang beneran ada di jadwal user (kerja + minggu), urut sesuai config.
export function getReminderAktif(userData) {
  const { kerja, minggu } = getJadwalSumber(userData);
  const semua = [...(kerja || []), ...(minggu || [])];

  return Object.keys(REMINDER_CONFIG)
    .map((menuId) => {
      const config = REMINDER_CONFIG[menuId];
      const jadwalItem = cariJadwalUntukReminder(semua, config);
      return jadwalItem ? { menuId, config, jadwalItem } : null;
    })
    .filter(Boolean);
}

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

export function buildStatusReminderText(userReminderSettings, userData) {
  const aktif = getReminderAktif(userData);
  const lines = [`<b>📋 STATUS REMINDER LO</b>`, ``];

  if (aktif.length === 0) {
    lines.push(`<i>Belum ada aktivitas di jadwal lo yang punya reminder.</i>`);
    lines.push(``);
    lines.push(
      `Tambah aktivitasnya lagi lewat <b>Kelola Jadwal</b> di web — daftar ini ngikutin jadwal, jadi otomatis nyesuaiin.`
    );
    return lines.join("\n");
  }

  aktif.forEach(({ menuId, config, jadwalItem }) => {
    const enabled = userReminderSettings?.[menuId]?.enabled ?? true;
    const emoji = enabled ? "🟢" : "🔴";
    const status = enabled ? "ON" : "OFF";
    const { mulai, selesai } = parseJadwalJam(jadwalItem);
    const jam = mulai ? ` · ${mulai}${selesai ? `–${selesai}` : ""}` : "";
    lines.push(`${emoji} ${config.emoji} ${config.label} — <b>${status}</b>${jam}`);
  });

  lines.push(``);
  lines.push(`<i>Klik tombol buat toggle ON/OFF. Daftar ini ngikutin jadwal di web.</i>`);
  return lines.join("\n");
}

export function buildStatusReminderButtons(userReminderSettings, userData) {
  const aktif = getReminderAktif(userData);
  const rows = [];

  for (let i = 0; i < aktif.length; i += 2) {
    const row = [];
    const menuId1 = aktif[i].menuId;
    const config1 = aktif[i].config;
    const enabled1 = userReminderSettings?.[menuId1]?.enabled ?? true;
    row.push({
      text: `${enabled1 ? "🟢" : "🔴"} ${config1.label}`.slice(0, 30),
      callback_data: `rem_toggle|${menuId1}`,
    });

    if (aktif[i + 1]) {
      const menuId2 = aktif[i + 1].menuId;
      const config2 = aktif[i + 1].config;
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
  // Web nulis progress pakai ID jadwal (blender_solidworks, desain, mandarin,
  // teknik), sedangkan tombol/reminder lama pakai ID config (blender, …).
  // Cek dua-duanya biar reminder berhenti begitu aktivitas selesai di web.
  const sudahDiProgress = getReminderIds(menuId).some((id) => {
    const progress = dayProgress[id];
    return progress?.selesai === true || progress?.mulai === true;
  });
  if (sudahDiProgress) return true;

  // Banyak menu (Olahraga, Bedah Buku, Hafalan, Belajar, Keuangan, Youtube,
  // Pekerjaan, Bisnis) nggak nyimpen dailyProgress: web nandain selesai dari
  // data sumbernya lewat deteksiJadwalOtomatis(). Reminder wajib pakai sumber
  // yang sama, kalau nggak reminder tetap bunyi walau datanya udah diisi.
  const scheduleId = getReminderConfig(menuId)?.config?.scheduleId || menuId;
  try {
    return deteksiJadwalOtomatis(scheduleId, tanggal, userData)?.auto === true;
  } catch (e) {
    console.error("[reminder] deteksiJadwalOtomatis gagal:", e.message);
    return false;
  }
}

export function cekReminderSudahDikirim(userData, tanggal, menuId, lapis) {
  return getReminderIds(menuId).some((id) => {
    const log = userData?.reminderLog?.[tanggal]?.[id];
    return log?.[lapis] === true;
  });
}

// ========== LOGIKA UTAMA: SCAN JADWAL WEB ==========
export function tentukanReminderYangHarusDikirim(userData, sekarangHHMM) {
  const tanggal = todayStr();
  const hasil = [];

  // FIX: Pake getWIBDate() biar hari Minggu/Senin akurat
  const wib = getWIBDate();
  const dayIndex = wib.getDay(); 
  const isMinggu = dayIndex === 0;
  
  // Sumber jadwal sama kayak web: kalau user belum pernah nyimpen jadwal,
  // pakai DEFAULT_JADWAL. Kalau array-nya ada (walau kosong), itu disengaja.
  const jadwalUser = getJadwalSumber(userData);
  const jadwalHariIni = isMinggu ? (jadwalUser.minggu || []) : (jadwalUser.kerja || []);

  Object.keys(REMINDER_CONFIG).forEach((menuId) => {
    const config = REMINDER_CONFIG[menuId];

    const enabled = userData?.reminderSettings?.[menuId]?.enabled ?? true;
    if (!enabled) return;

    const jadwalItem = cariJadwalUntukReminder(jadwalHariIni, config);

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
      reminderId: menuId,
      scheduleId: config.scheduleId || menuId,
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