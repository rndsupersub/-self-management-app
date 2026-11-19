// lib/telegramReminder.js
// Config + logic buat Telegram Reminder Interaktif Bertingkat.
// Versi: 3.1 (FIX TOTAL TIMEZONE WIB)

import { sendTelegramWithButtons } from "./telegramData";
import { DEFAULT_JADWAL, deteksiJadwalOtomatis } from "./jadwalData";
import {
  cariSlotKosong,
  durasiMenitJadwal,
  formatJamJadwal,
  getJadwalHarian,
  parseJamJadwal,
  todayWIB,
} from "./jadwalHarian";

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
// Jadwal hari ini SETELAH perubahan harian (pindah jadwal) diterapkan.
// Dipakai reminder + /dashboard + /reminder, biar semuanya satu sumber.
export function getJadwalHariIni(userData, tanggal = todayWIB()) {
  const jadwalUser = getJadwalSumber(userData);
  const overrideHari = userData?.jadwalOverride?.[tanggal];
  return getJadwalHarian(jadwalUser, overrideHari, tanggal).daftar;
}

export function getReminderAktif(userData) {
  // Pakai jadwal HARI INI (termasuk yang dipindah), biar /reminder nampilin
  // jam terbaru — bukan jadwal dasar yang bisa beda sama dashboard.
  const semua = getJadwalHariIni(userData, todayStr());

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
// Logikanya satu tempat di lib/jadwalHarian.js (dipakai web juga).
function parseJadwalJam(item) {
  return parseJamJadwal(item);
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
  const pindah = [{ text: "🕒 Pindah Jadwal", callback_data: `rem_pindah|${menuId}` }];

  if (lapis === 4) {
    return [
      [
        { text: "✅ Isi Sekarang", callback_data: `rem_isi|${menuId}` },
        { text: "🚫 Skip Hari Ini", callback_data: `rem_skip|${menuId}` },
      ],
      pindah,
    ];
  }
  return [
    [
      { text: "✅ Udah Mulai", callback_data: `rem_mulai|${menuId}` },
      { text: "🚫 Belum Mau Mulai", callback_data: `rem_belum|${menuId}` },
    ],
    pindah,
  ];
}

// ========== PINDAH JADWAL (HARI INI SAJA) ==========
// Cari item jadwal + slot kosong yang durasinya cukup buat aktivitas ini.
export function getPindahInfo(userData, menuId, tanggal = todayStr(), sekarangHHMM = nowHHMM()) {
  const found = getReminderConfig(menuId);
  if (!found) return null;

  const daftar = getJadwalHariIni(userData, tanggal);
  const item = cariJadwalUntukReminder(daftar, found.config);
  if (!item) return null;

  const sekarang = parseJadwalJam(item);
  const durasi = durasiMenitJadwal(item);
  const lain = daftar.filter((j) => j._kunci !== item._kunci);
  // Cuma tawarkan jam yang belum lewat hari ini, biar nggak "pindah" ke jam
  // yang udah kelewat. Slot tepat di menit sekarang masih boleh.
  const batasMenit = hhmmToMinutes(sekarangHHMM);
  const slots = cariSlotKosong(lain, durasi).filter(
    (s) => s.mulai !== sekarang.mulai && s.menitMulai >= batasMenit
  );

  return {
    menuId: found.id,
    config: found.config,
    item,
    durasi,
    sekarang,
    slots,
  };
}

export function buildPindahText(info) {
  if (!info) return "⚠️ Jadwal aktivitas ini nggak ketemu.";
  const { config, item, sekarang, durasi, slots } = info;
  const jamSekarang = formatJamJadwal(sekarang.mulai, sekarang.selesai);

  const lines = [
    `🕒 <b>Pindah Jadwal: ${config.label}</b>`,
    "",
    `📅 Jadwal sekarang: <b>${jamSekarang || "belum diatur"}</b>`,
    `⏱️ Durasi: ${durasi} menit`,
    "",
  ];

  if (slots.length === 0) {
    lines.push("😕 <i>Hari ini nggak ada slot kosong yang cukup.</i>");
    lines.push("");
    lines.push("Lo bisa isi sekarang atau skip buat hari ini.");
    return lines.join("\n");
  }

  lines.push("<b>Slot kosong hari ini:</b>");
  slots.forEach((slot, i) => {
    lines.push(`${i + 1}. ${slot.mulai} – ${slot.selesai}`);
  });
  lines.push("");
  lines.push(
    `Pilih jam baru di bawah. <i>Jadwal di web otomatis ikut berubah untuk hari ini saja; besok balik normal.</i>`
  );
  return lines.join("\n");
}

export function buildPindahButtons(menuId, slots = []) {
  const rows = [];
  for (let i = 0; i < slots.length; i += 2) {
    const row = [
      {
        text: `🕒 ${slots[i].mulai} – ${slots[i].selesai}`,
        callback_data: `rem_slot|${menuId}|${i}`,
      },
    ];
    if (slots[i + 1]) {
      row.push({
        text: `🕒 ${slots[i + 1].mulai} – ${slots[i + 1].selesai}`,
        callback_data: `rem_slot|${menuId}|${i + 1}`,
      });
    }
    rows.push(row);
  }

  rows.push([
    { text: "✅ Isi Sekarang", callback_data: `rem_isi|${menuId}` },
    { text: "🚫 Skip Hari Ini", callback_data: `rem_skip|${menuId}` },
  ]);
  return rows;
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
    const tanda = jadwalItem._dipindah ? " (dipindah hari ini)" : "";
    lines.push(`${emoji} ${config.emoji} ${config.label} — <b>${status}</b>${jam}${tanda}`);
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

export function cekAktivitasSudahDikerjain(userData, tanggal, menuId, jadwalItem = null) {
  const dayProgress = userData?.dailyProgress?.[tanggal] || {};
  // ID-nya bisa beda: config "olahraga" vs item Minggu "olahraga_ringan".
  // Cek ID config, ID jadwal, dan ID item hari ini sekaligus.
  const ids = [
    ...getReminderIds(menuId),
    jadwalItem?.id,
    jadwalItem?._kunci,
  ].filter(Boolean);
  const sudahDiProgress = [...new Set(ids)].some((id) => {
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

export function cekReminderSudahDikirim(userData, tanggal, menuId, lapis, jadwalItem = null) {
  const ids = [...getReminderIds(menuId), jadwalItem?.id, jadwalItem?._kunci].filter(Boolean);
  return [...new Set(ids)].some((id) => {
    const log = userData?.reminderLog?.[tanggal]?.[id];
    return log?.[lapis] === true;
  });
}

// ========== LOGIKA UTAMA: SCAN JADWAL WEB ==========
export function tentukanReminderYangHarusDikirim(userData, sekarangHHMM) {
  const tanggal = todayStr();
  const hasil = [];

  // Jadwal hari ini + perubahan harian (kalau ada yang dipindah dari Telegram).
  const jadwalHariIni = getJadwalHariIni(userData, tanggal);

  Object.keys(REMINDER_CONFIG).forEach((menuId) => {
    const config = REMINDER_CONFIG[menuId];

    const enabled = userData?.reminderSettings?.[menuId]?.enabled ?? true;
    if (!enabled) return;

    const jadwalItem = cariJadwalUntukReminder(jadwalHariIni, config);

    if (!jadwalItem) return;

    const { mulai, selesai } = parseJadwalJam(jadwalItem);
    if (!mulai) return;

    if (cekAktivitasSudahDikerjain(userData, tanggal, menuId, jadwalItem)) return;

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

    if (cekReminderSudahDikirim(userData, tanggal, menuId, lapisInfo.lapis, jadwalItem)) return;

    hasil.push({
      reminderId: menuId,
      scheduleId: jadwalItem.id || config.scheduleId || menuId,
      scheduleItemId: jadwalItem.id || jadwalItem._kunci || null,
      scheduleItemKey: jadwalItem._kunci || null,
      dipindah: jadwalItem._dipindah === true,
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