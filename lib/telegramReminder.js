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
  jamKeMenit,
  menitKeJam,
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
  "review-mesin": {
    label: "Review Teknik Mesin",
    emoji: "🔧",
    scheduleId: "teknik",
    // Nama jadwal bisa beda antar user (mis. "Belajar Teknik Mesin").
    aliases: ["Belajar Teknik Mesin", "Teknik Mesin"],
  },
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

// ========== STATUS ON/OFF REMINDER ==========
// Setting bisa disimpan pakai ID config ("bedah-buku") atau ID jadwal
// ("blender_solidworks"). Dulu cuma satu key yang dibaca, jadi aktivitas bisa
// kelihatan ON padahal tersimpan OFF di key yang lain.
export function reminderEnabled(settings, menuId) {
  const found = getReminderConfig(menuId);
  const key = found?.id || menuId;
  const scheduleId = found?.config?.scheduleId || menuId;
  const sumber = settings || {};
  const nilai =
    sumber[key]?.enabled ??
    (scheduleId !== key ? sumber[scheduleId]?.enabled : undefined);
  return nilai !== false;
}

export function isReminderAktif(userData, menuId) {
  return reminderEnabled(userData?.reminderSettings, menuId);
}

// Kegiatan yang reminder-nya dimatikan = waktu kosong. Dipakai saat pindah
// jadwal: jam kegiatan yang di-OFF-kan ikut ditawarkan sebagai slot baru.
export function getJadwalReminderDimatikan(userData, daftar) {
  const list = Array.isArray(daftar) ? daftar : [];
  const mati = new Map();
  const hidup = new Set();

  Object.keys(REMINDER_CONFIG).forEach((menuId) => {
    const config = REMINDER_CONFIG[menuId];
    const item = cariJadwalUntukReminder(list, config);
    if (!item || !item._kunci) return;

    if (isReminderAktif(userData, menuId)) {
      hidup.add(item._kunci);
      return;
    }
    if (mati.has(item._kunci)) return;

    const { mulai, selesai } = parseJadwalJam(item);
    const a = jamKeMenit(mulai);
    const b = jamKeMenit(selesai);
    if (a === null || b === null) return;

    mati.set(item._kunci, {
      kunci: item._kunci,
      menuId,
      label: config.label,
      mulai: a,
      akhir: b > a ? b : b + 1440,
    });
  });

  // Kalau satu item kecocokan dua reminder dan salah satunya masih ON, waktu
  // itu tetap sibuk — jangan ditawarkan.
  return [...mati.values()].filter((x) => !hidup.has(x.kunci));
}

// Cari item jadwal buat satu config reminder: utamakan ID, lalu label.
export function cariJadwalUntukReminder(daftarJadwal, config) {
  if (!Array.isArray(daftarJadwal) || !config) return null;

  const byId = daftarJadwal.find((j) => j?.id && j.id === config.scheduleId);
  if (byId) return byId;

  const targetList = [config.label, ...(config.aliases || [])]
    .map(rapikanLabel)
    .filter(Boolean);
  if (targetList.length === 0) return null;

  return (
    daftarJadwal.find((j) => {
      const label = rapikanLabel(j?.label);
      if (!label) return false;
      // Samain labelnya, atau diawali nama aktivitasnya ("Olahraga ringan"
      // cocok sama "Olahraga"). "Review keuangan" TIDAK dianggap "Keuangan",
      // biar aktivitas yang udah dihapus nggak muncul lagi gara-gara mirip.
      return targetList.some(
        (target) => label === target || label.startsWith(target)
      );
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

// Daftar reminder buat /reminder.
// Aktivitas yang HARI INI nggak ada di jadwal (misal Review Teknik Mesin yang
// cuma di hari kerja, atau jadwal Minggu) tetap ditampilkan supaya statusnya
// kelihatan — bukan hilang tanpa penjelasan. `diJadwalHariIni` yang nentuin
// boleh dipindah hari ini atau nggak.
export function getReminderAktif(userData) {
  const jadwalHariIni = getJadwalHariIni(userData, todayStr());
  const sumber = getJadwalSumber(userData);
  const semuaHari = [
    ...(Array.isArray(sumber?.kerja) ? sumber.kerja : []),
    ...(Array.isArray(sumber?.minggu) ? sumber.minggu : []),
  ];

  return Object.keys(REMINDER_CONFIG)
    .map((menuId) => {
      const config = REMINDER_CONFIG[menuId];
      const hariIni = cariJadwalUntukReminder(jadwalHariIni, config);
      const jadwalItem =
        hariIni || cariJadwalUntukReminder(semuaHari, config);
      return jadwalItem
        ? { menuId, config, jadwalItem, diJadwalHariIni: Boolean(hariIni) }
        : null;
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
    body = `⚠️ Waktu <b>${label}</b> udah lewat.\n📅 Jadwal: <b>${jamMulai} – ${deadline}</b>\n\nLo belum isi log hari ini. Mau isi sekarang, pindah jadwal, atau skip?`;
  } else if (lapis === 5) {
    header = `${emoji} <b>Sedang Berjalan: ${label}</b>`;
    body = `⏳ Sekarang jadwal <b>${label}</b>.\n📅 Jadwal: <b>${jamMulai} – ${deadline}</b>\n\nBelum sempat mulai? Masih bisa pindah ke jam lain hari ini.`;
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
  if (lapis === 5) {
    return [
      [
        { text: "✅ Udah Mulai", callback_data: `rem_mulai|${menuId}` },
        { text: "🕒 Pindah Jadwal", callback_data: `rem_pindah|${menuId}` },
      ],
      [{ text: "🚫 Skip Hari Ini", callback_data: `rem_skip|${menuId}` }],
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
// Blok "istirahat" (perjalanan pulang, mandi, isya, santai, recovery) bukan
// waktu yang benar-benar sibuk — hafalan/materi audio masih bisa dikerjakan
// sambil jalan. Slot di dalam blok ini ikut ditawarkan, tanpa menghapus slot
// kosong biasa.
const POLA_ISTIRAHAT =
  /istirahat|transisi|perjalanan pulang|mandi|isya|tidur|santai|recovery/i;

export function isJadwalIstirahat(item) {
  return POLA_ISTIRAHAT.test(String(item?.label || ""));
}

function cariSlotIstirahat(daftar, durasi, maks = 3) {
  const hasil = [];
  const list = daftar || [];

  list.forEach((item) => {
    if (!isJadwalIstirahat(item)) return;
    const { mulai, selesai } = parseJadwalJam(item);
    const a = jamKeMenit(mulai);
    const b = jamKeMenit(selesai);
    if (a === null || b === null) return;
    const akhir = b > a ? b : b + 1440;
    if (akhir - a < durasi) return;

    // Waktu yang sudah dipakai aktivitas lain — termasuk yang barusan
    // dipindah ke blok istirahat ini — TIDAK boleh ditawarkan lagi. Kalau dua
    // kegiatan tertunda sama-sama pindah ke 19:30–20:30, yang kedua bakal
    // nabrak. Karena itu cek bentrok ke semua item selain blok istirahatnya.
    const sibuk = [];
    list.forEach((lain) => {
      if (lain === item) return;
      const jamLain = parseJadwalJam(lain);
      const mulaiLain = jamKeMenit(jamLain.mulai);
      const selesaiLain = jamKeMenit(jamLain.selesai);
      if (mulaiLain === null || selesaiLain === null) return;
      const akhirLain = selesaiLain > mulaiLain ? selesaiLain : selesaiLain + 1440;
      sibuk.push([mulaiLain, akhirLain]);
    });
    const bebas = (menit) =>
      !sibuk.some(
        ([mulaiSibuk, selesaiSibuk]) =>
          menit < selesaiSibuk && menit + durasi > mulaiSibuk
      );

    const kandidat = [a, akhir - durasi];
    if (akhir - a >= durasi + 60) {
      kandidat.push(Math.round((a + (akhir - a - durasi) / 2) / 5) * 5);
    }

    // Maksimal 2 pilihan per blok, biar satu blok panjang nggak menghabiskan
    // kuota dan blok istirahat lain (mis. transisi sore) tetap kebagian.
    [...new Set(kandidat)].slice(0, 2).forEach((menit) => {
      if (hasil.length >= maks) return;
      if (hasil.some((s) => s.menitMulai === menit)) return;
      if (!bebas(menit)) return;
      hasil.push({
        mulai: menitKeJam(menit),
        selesai: menitKeJam(menit + durasi),
        menitMulai: menit,
        istirahat: true,
      });
    });
  });
  return hasil;
}

export function getPindahInfo(userData, menuId, tanggal = todayStr(), sekarangHHMM = nowHHMM()) {
  const found = getReminderConfig(menuId);
  if (!found) return null;

  const daftar = getJadwalHariIni(userData, tanggal);
  const item = cariJadwalUntukReminder(daftar, found.config);
  if (!item) return null;

  const sekarang = parseJadwalJam(item);
  const durasi = durasiMenitJadwal(item);

  // Kegiatan yang reminder-nya dimatikan user = waktu kosong. Jadi jadwalnya
  // nggak dihitung sibuk dan jamnya ikut ditawarkan saat pindah jadwal.
  const dimatikan = getJadwalReminderDimatikan(userData, daftar);
  const kunciDimatikan = new Set(dimatikan.map((d) => d.kunci));
  const lain = daftar.filter(
    (j) => j._kunci !== item._kunci && !kunciDimatikan.has(j._kunci)
  );

  // Cuma tawarkan jam yang belum lewat hari ini, biar nggak "pindah" ke jam
  // yang udah kelewat. Slot tepat di menit sekarang masih boleh.
  const batasMenit = hhmmToMinutes(sekarangHHMM);
  const belumLewat = (s) =>
    s.mulai !== sekarang.mulai && s.menitMulai >= batasMenit;
  const slotKosong = cariSlotKosong(lain, durasi, { maks: 14 }).filter(belumLewat);
  const slotIstirahat = cariSlotIstirahat(lain, durasi).filter(belumLewat);
  const slots = [...slotKosong, ...slotIstirahat]
    .filter(
      (s, i, arr) => arr.findIndex((x) => x.menitMulai === s.menitMulai) === i
    )
    .sort((a, b) => a.menitMulai - b.menitMulai)
    .map((slot) => {
      const akhir = slot.menitMulai + durasi;
      const bebas = dimatikan.find(
        (d) => slot.menitMulai < d.akhir && akhir > d.mulai
      );
      return bebas ? { ...slot, dimatikan: bebas.label } : slot;
    })
    .slice(0, 10);

  return {
    menuId: found.id,
    config: found.config,
    item,
    durasi,
    sekarang,
    slots,
    dimatikan,
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

  lines.push("<b>Slot yang bisa dipakai hari ini:</b>");
  slots.forEach((slot, i) => {
    const tanda = slot.dimatikan
      ? ` <i>(reminder ${slot.dimatikan} OFF)</i>`
      : slot.istirahat
        ? " <i>(istirahat)</i>"
        : "";
    lines.push(`${i + 1}. ${slot.mulai} – ${slot.selesai}${tanda}`);
  });
  lines.push("");
  const bebas = (info.dimatikan || []).map((d) => d.label);
  if (bebas.length > 0) {
    lines.push(
      `🔓 <i>Waktu kegiatan yang reminder-nya OFF dihitung kosong: ${bebas.join(", ")}.</i>`
    );
  }
  lines.push(
    `Keterangan: <i>(istirahat)</i> = perjalanan pulang, mandi, isya, atau santai — bisa dipakai sambil dengar hafalan.`
  );
  lines.push(
    `Pilih jam baru di bawah. Jadwal di web otomatis ikut berubah untuk hari ini saja; besok balik normal.`
  );
  return lines.join("\n");
}

export function buildPindahButtons(menuId, slots = []) {
  const rows = [];
  for (let i = 0; i < slots.length; i += 2) {
    const tombol = (slot) => ({
      text: `${slot.istirahat ? "🛋️" : slot.dimatikan ? "🔓" : "🕒"} ${slot.mulai} – ${slot.selesai}`,
      // Pakai JAM, bukan index: daftar slot dihitung ulang saat tombol ditekan,
      // jadi index bisa bergeser kalau ada slot yang keburu lewat.
      callback_data: `rem_slot|${menuId}|${slot.mulai}`,
    });
    const row = [tombol(slots[i])];
    if (slots[i + 1]) row.push(tombol(slots[i + 1]));
    rows.push(row);
  }

  rows.push([
    { text: "✅ Isi Sekarang", callback_data: `rem_isi|${menuId}` },
    { text: "🚫 Skip Hari Ini", callback_data: `rem_skip|${menuId}` },
  ]);
  rows.push([{ text: "⬅️ Status Reminder", callback_data: "rem_status" }]);
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

  aktif.forEach(({ menuId, config, jadwalItem, diJadwalHariIni }) => {
    const enabled = reminderEnabled(userReminderSettings, menuId);
    const emoji = enabled ? "🟢" : "🔴";
    const status = enabled ? "ON" : "OFF";
    const { mulai, selesai } = parseJadwalJam(jadwalItem);
    const jam = mulai ? ` · ${mulai}${selesai ? `–${selesai}` : ""}` : "";
    const tanda = !diJadwalHariIni
      ? " (di luar jadwal hari ini)"
      : jadwalItem._dipindah
        ? " (dipindah hari ini)"
        : "";
    lines.push(`${emoji} ${config.emoji} ${config.label} — <b>${status}</b>${jam}${tanda}`);
  });

  lines.push(``);
  lines.push(
    `<i>Klik nama aktivitas buat ON/OFF. Reminder 🔴 = waktunya dianggap kosong, jadi ikut ditawarkan saat pindah jadwal. Tombol 🕒 buat pindah jadwal hari ini, jam istirahat juga ikut.</i>`
  );
  return lines.join("\n");
}

export function buildStatusReminderButtons(userReminderSettings, userData) {
  const aktif = getReminderAktif(userData);
  const rows = [];

  aktif.forEach(({ menuId, config, diJadwalHariIni }) => {
    const enabled = reminderEnabled(userReminderSettings, menuId);
    const row = [
      {
        text: `${enabled ? "🟢" : "🔴"} ${config.label}`.slice(0, 30),
        callback_data: `rem_toggle|${menuId}`,
      },
    ];
    if (diJadwalHariIni) {
      row.push({ text: "🕒 Pindah", callback_data: `rem_pindah|${menuId}` });
    }
    rows.push(row);
  });

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

    if (!isReminderAktif(userData, menuId)) return;

    const jadwalItem = cariJadwalUntukReminder(jadwalHariIni, config);

    if (!jadwalItem) return;

    const { mulai, selesai } = parseJadwalJam(jadwalItem);
    if (!mulai) return;

    if (cekAktivitasSudahDikerjain(userData, tanggal, menuId, jadwalItem)) return;

    const mulaiMenit = hhmmToMinutes(mulai);
    const deadline = selesai || menitKeJam(mulaiMenit + 60);
    // Deadline yang lewat tengah malam (misal 23:55–00:00) jangan dianggap
    // "udah lewat" begitu aktivitasnya mulai.
    let deadlineMenit = hhmmToMinutes(deadline);
    if (deadlineMenit <= mulaiMenit) deadlineMenit += 1440;
    const sekarangMenit = hhmmToMinutes(sekarangHHMM);
    const selisihDeadline = deadlineMenit - sekarangMenit;

    let lapisInfo = tentukanLapis(selisihMenit(mulai, sekarangHHMM));

    // Lewat jam mulai tapi belum lewat jam selesai = sedang berjalan, bukan
    // "deadline lewat". Dulu aktivitas 21:30–22:00 yang dicek jam 21:31 dapat
    // pesan "deadline lewat" dan tombolnya jadi nggak masuk akal.
    if (lapisInfo?.lapis === 4 && selisihDeadline >= 0) {
      lapisInfo = { lapis: 5, label: "Sedang berjalan" };
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