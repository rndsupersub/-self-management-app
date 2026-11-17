// app/api/telegram/route.js
import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import {
  sendTelegramMessage,
  sendTelegramWithButtons,
  answerCallbackQuery,
  editTelegramMessage,
  parseCommand,
  findMenuByCommand,
  setBotCommands,
} from "@/lib/telegramData";
import { buildHelpView, buildMenuListView, BOT_COMMANDS, COMMAND_ALIAS } from "@/lib/telegramHelp";
import {
  WIZARD_CONFIG,
  CUSTOM_MENU_WIZARD,
  SUB_MENU_CONFIG,
  buildRingkasan,
  buildRingkasanVendor,
  progressLabel,
  getVendorFieldsSteps,
  generateWizardId,
  today,
  besok,
  kemarin,
  vendorLists,
} from "@/lib/telegramWizard";
import {
  REMINDER_CONFIG,
  buildStatusReminderText,
  buildStatusReminderButtons,
  parseReminderCallback,
  getReminderConfig,
  todayStr,
} from "@/lib/telegramReminder";

// === TAMBAHAN BARU: Import helper buat reminder proyek ===
import { REMINDER_PROYEK_CONFIG } from "@/lib/telegramReminderProyek";
import { verifyTelegramWebhook } from "@/lib/telegramSecurity";
import { syncUserToSheets } from "@/lib/sheetsSync";
import { deriveWalletId, getKategoriList, terapkanAksiTransaksi } from "@/lib/keuanganData";
import { getMingguRange, getBulanRange } from "@/lib/laporanData";
import { getPeriodeRange } from "@/lib/evaluasiData";

// ========== ADAPTER: TELEGRAM → SKEMA WEB ==========
// Web membaca laporan sebagai { reports:[{id,judul,fields:{ringkasan,kendala,solusi},gdriveUrl}], updatedAt }
// dan evaluasi sebagai { ...range, reports:[{tanggal,ringkasan,kendala,solusi,gdriveUrl}], updatedAt }.
// Data lama (single object) dimigrasikan tanpa ngehapus report yang udah ada di web.
function reportsLaporan(existing) {
  if (Array.isArray(existing?.reports)) return [...existing.reports];
  if (existing?.fields) {
    return [
      {
        id: `rep_migrasi_${Date.now()}`,
        judul: existing.judul || "Laporan",
        fields: existing.fields,
        gdriveUrl: existing.gdriveUrl || "",
      },
    ];
  }
  if (typeof existing?.konten === "string" && existing.konten.trim()) {
    return [
      {
        id: `rep_migrasi_${Date.now()}`,
        judul: existing.judul || "Laporan",
        fields: { ringkasan: existing.konten, kendala: "", solusi: "" },
        gdriveUrl: existing.gdriveUrl || "",
      },
    ];
  }
  return [];
}

function simpanLaporanKeBrand(brand, f) {
  if (!brand.laporanData) brand.laporanData = {};

  const report = (judul) => ({
    id: `rep_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    judul,
    fields: { ringkasan: f.konten || "", kendala: "", solusi: "" },
    gdriveUrl: f.gdriveUrl || "",
  });

  if (f.periode === "harian") {
    if (!brand.laporanData.harian) brand.laporanData.harian = {};
    const prev = brand.laporanData.harian[f.tanggal] || {};
    brand.laporanData.harian[f.tanggal] = {
      ...prev,
      tanggal: f.tanggal,
      reports: [...reportsLaporan(prev), report(`📋 Laporan ${f.tanggal}`)],
      updatedAt: new Date().toISOString(),
    };
  } else if (f.periode === "mingguan") {
    const r = getMingguRange(f.tanggal);
    if (!brand.laporanData.mingguan) brand.laporanData.mingguan = {};
    const prev = brand.laporanData.mingguan[r.tanggalMulai] || {};
    // Key mingguan = hari Senin (sama kayak web), bukan tanggal pilihan.
    brand.laporanData.mingguan[r.tanggalMulai] = {
      ...prev,
      tanggalMulai: r.tanggalMulai,
      tanggalSelesai: r.tanggalSelesai,
      mingguKe: r.mingguKe,
      tahun: r.tahun,
      reports: [...reportsLaporan(prev), report(`📋 Laporan ${r.label}`)],
      updatedAt: new Date().toISOString(),
    };
  } else {
    const r = getBulanRange(f.tanggal);
    const key = `${r.tahun}-${String(r.bulan).padStart(2, "0")}`;
    if (!brand.laporanData.bulanan) brand.laporanData.bulanan = {};
    const prev = brand.laporanData.bulanan[key] || {};
    brand.laporanData.bulanan[key] = {
      ...prev,
      tahun: r.tahun,
      bulan: r.bulan,
      namaBulan: r.namaBulan,
      reports: [...reportsLaporan(prev), report(`📋 Laporan ${r.label}`)],
      updatedAt: new Date().toISOString(),
    };
  }
}

function simpanEvaluasiKeBrand(brand, f) {
  const range = getPeriodeRange(f.periode, f.tanggal);
  if (!range) throw new Error("Periode evaluasi nggak valid");

  if (!brand.evaluasiData) brand.evaluasiData = {};
  if (!brand.evaluasiData[f.periode]) brand.evaluasiData[f.periode] = {};

  const ringkasanParts = [];
  if (f.efektivitas) ringkasanParts.push(`Efektivitas: ${f.efektivitas}`);
  if (f.efisiensi) ringkasanParts.push(`Efisiensi: ${f.efisiensi}`);
  if (f.energi) ringkasanParts.push(`Energi: ${f.energi}/10`);
  if (f.mood) ringkasanParts.push(`Mood: ${f.mood}`);
  if (f.catatanBebas) ringkasanParts.push(f.catatanBebas);

  const prev = brand.evaluasiData[f.periode][range.key] || {};
  const reports = Array.isArray(prev.reports) ? [...prev.reports] : [];
  reports.push({
    tanggal: f.tanggal,
    ringkasan: ringkasanParts.join("\n") || "Evaluasi dari Telegram",
    kendala: f.kendala || "",
    solusi: f.solusi || "",
    gdriveUrl: "",
  });

  brand.evaluasiData[f.periode][range.key] = {
    ...prev,
    ...range,
    reports,
    updatedAt: new Date().toISOString(),
  };
}

// === TAMBAHAN BARU: Helper UI Reminder Proyek ===
function settingsProyek(userData) {
  return {
    ...REMINDER_PROYEK_CONFIG,
    ...(userData?.reminderProyekSettings || {}),
  };
}

function snoozeUntil(days) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

function simpanSnoozeProyek(userData, reminderId, days) {
  return {
    ...(userData.reminderProyekSnooze || {}),
    [reminderId]: snoozeUntil(days),
  };
}

function buildStatusReminderProyekText(settings) {
  const isEnabled = settings?.enabled !== false;
  const isDeadlineOn = settings?.deadlineH7 !== false;
  const isVendorOn = settings?.vendorFollowUp !== false;

  let text = `<b>📋 STATUS REMINDER PROYEK LO</b>\n\n`;
  text += `${isDeadlineOn && isEnabled ? "🟢" : "🔴"} Deadline Kegiatan — <b>${isDeadlineOn && isEnabled ? "ON" : "OFF"}</b>\n`;
  text += `${isVendorOn && isEnabled ? "🟢" : "🔴"} Vendor Follow Up — <b>${isVendorOn && isEnabled ? "ON" : "OFF"}</b>\n\n`;
  text += `<i>Klik tombol buat toggle ON/OFF.</i>`;
  return text;
}

function buildStatusReminderProyekButtons(settings) {
  const isEnabled = settings?.enabled !== false;
  const isDeadlineOn = settings?.deadlineH7 !== false;
  const isVendorOn = settings?.vendorFollowUp !== false;

  const btnDeadline = isDeadlineOn && isEnabled ? "🟢 Deadline Kegiatan" : "🔴 Deadline Kegiatan";
  const btnVendor = isVendorOn && isEnabled ? "🟢 Vendor Follow Up" : "🔴 Vendor Follow Up";

  return [
    [{ text: btnDeadline, callback_data: "proyek_toggle_deadline" }],
    [{ text: btnVendor, callback_data: "proyek_toggle_vendor" }],
    [
      { text: "⏸️ Pause Semua Proyek", callback_data: "proyek_pause_all" },
      { text: "▶️ Resume Semua Proyek", callback_data: "proyek_resume_all" },
    ],
  ];
}
// === END HELPER UI REMINDER PROYEK ===

// ========== FIREBASE ADMIN ==========
let adminApp = null;
function getAdminApp() {
  if (adminApp) return adminApp;
  if (getApps().length > 0) {
    adminApp = getApps()[0];
    return adminApp;
  }
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || "")
    .trim()
    .replace(/^"|"$/g, "")
    .replace(/\\n/g, "\n");
  adminApp = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  });
  return adminApp;
}

// ========== RESOLVE USER ==========
async function resolveUser(firestore, chatId) {
  const chatIdNum = Number(chatId);
  const chatIdStr = String(chatId);
  try {
    const snap = await firestore.collection("users").where("telegramChatId", "==", chatIdNum).limit(1).get();
    if (!snap.empty) return { uid: snap.docs[0].id, data: snap.docs[0].data() };
  } catch (e) {}
  try {
    const snap = await firestore.collection("users").where("telegramChatId", "==", chatIdStr).limit(1).get();
    if (!snap.empty) return { uid: snap.docs[0].id, data: snap.docs[0].data() };
  } catch (e) {}
  return null;
}

// ========== STATE MANAGEMENT ==========
async function getState(firestore, chatId) {
  const ref = firestore.collection("telegramState").doc(String(chatId));
  const snap = await ref.get();
  return snap.exists ? snap.data() : null;
}
async function setState(firestore, chatId, state) {
  const ref = firestore.collection("telegramState").doc(String(chatId));
  await ref.set({ ...state, updatedAt: new Date().toISOString() });
}
async function clearState(firestore, chatId) {
  const ref = firestore.collection("telegramState").doc(String(chatId));
  await ref.delete();
}

// ========== HANDLE /link ==========
async function handleLink(firestore, chatId, code, fromData) {
  const codeUpper = code.toUpperCase().trim();
  const codeRef = firestore.collection("pairingCodes").doc(codeUpper);

  // Baca + hapus kode dalam satu transaksi biar nggak bisa dipakai dua kali
  // (race condition), dan tolak kode yang udah kedaluwarsa.
  let result;
  try {
    result = await firestore.runTransaction(async (tx) => {
      const codeSnap = await tx.get(codeRef);
      if (!codeSnap.exists) return { status: "invalid" };

      const data = codeSnap.data();
      const createdAt = data.createdAt ? new Date(data.createdAt).getTime() : 0;
      const expiresAt = data.expiresAt
        ? new Date(data.expiresAt).getTime()
        : createdAt + 10 * 60 * 1000;

      if (!expiresAt || expiresAt < Date.now()) {
        tx.delete(codeRef);
        return { status: "expired" };
      }

      const userRef = firestore.collection("users").doc(data.uid);
      tx.update(userRef, {
        telegramChatId: Number(chatId),
        telegramUsername: fromData?.username || "",
        telegramFirstName: fromData?.first_name || "",
        telegramLinkedAt: new Date().toISOString(),
      });
      tx.delete(codeRef);
      return { status: "ok", uid: data.uid };
    });
  } catch (err) {
    console.error("[handleLink] Error:", err.message);
    await sendTelegramMessage(chatId, `❌ Gagal link akun. Coba generate kode baru di web.`);
    return;
  }

  if (result.status === "invalid") {
    await sendTelegramMessage(chatId, `❌ Kode <b>${codeUpper}</b> nggak valid atau udah kepake.`);
    return;
  }
  if (result.status === "expired") {
    await sendTelegramMessage(chatId, `⌛ Kode <b>${codeUpper}</b> udah kedaluwarsa. Generate kode baru di web.`);
    return;
  }

  await setBotCommands(BOT_COMMANDS);
  const { text, keyboard } = buildHelpView("root");
  await sendTelegramMessage(chatId, `<b>✅ Berhasil di-link!</b>\n\nSekarang bot siap dipakai.`);
  await sendTelegramWithButtons(chatId, text, keyboard);
}

// ========== WIZARD BIASA — MULAI ==========
async function startWizard(firestore, chatId, wizardKey, userData, extraFields = {}) {
  let config = WIZARD_CONFIG[wizardKey];
  if (!config) {
    if (userData.menusCustom && userData.menusCustom[wizardKey]) {
      config = CUSTOM_MENU_WIZARD;
    } else {
      await sendTelegramMessage(chatId, `❌ Wizard "${wizardKey}" nggak ada.`);
      return;
    }
  }

  const fields = { ...extraFields };
  config.steps.forEach((s) => {
    if (s.default !== undefined && fields[s.key] === undefined) {
      if (s.default === "today") fields[s.key] = today();
      else fields[s.key] = s.default;
    }
  });

  let startStep = 0;
  if (extraFields.ptId || extraFields.brandId) {
    for (let i = 0; i < config.steps.length; i++) {
      if (fields[config.steps[i].key] === undefined) {
        startStep = i;
        break;
      }
    }
  }

  const state = {
    menuId: wizardKey,
    currentStep: startStep,
    fields,
    awaiting: null,
  };
  await setState(firestore, chatId, state);

  const msg = await sendTelegramWithButtons(chatId, `⏳ Loading...`, []);
  if (msg.ok) {
    state.messageId = msg.result.message_id;
    await setState(firestore, chatId, state);
    await renderStep(firestore, chatId, state, userData);
  }
}

// ========== WIZARD BIASA — RENDER STEP ==========
async function renderStep(firestore, chatId, state, userData) {
  let config = WIZARD_CONFIG[state.menuId];
  if (!config) config = CUSTOM_MENU_WIZARD;

  const steps = config.steps;
  const stepIdx = state.currentStep;

  if (stepIdx >= steps.length) {
    let ringkasan;
    try {
      ringkasan = buildRingkasan(state.menuId, steps, state.fields, userData);
    } catch (e) {
      console.error("[renderStep] buildRingkasan error:", e.message);
      ringkasan = `<b>📋 Ringkasan</b>\n\nMenu: <b>${config.label}</b>\n\nSimpen?`;
    }

    const buttons = [
      [{ text: "✅ Simpan", callback_data: "wiz_save" }],
      [
        { text: "⬅️ Kembali", callback_data: "wiz_back" },
        { text: "❌ Batal", callback_data: "wiz_cancel" },
      ],
    ];

    try {
      await editTelegramMessage(chatId, state.messageId, ringkasan, buttons);
    } catch (e) {
      console.error("[renderStep] edit error:", e.message);
      await sendTelegramWithButtons(chatId, ringkasan, buttons);
    }

    state.awaiting = null;
    state.awaitingType = null;
    await setState(firestore, chatId, state);
    return;
  }

  const step = steps[stepIdx];
  const progress = progressLabel(stepIdx, steps.length);

  let text = `<b>${progress} — ${step.label}</b>\n`;
  if (step.hint) text += `\n<i>${step.hint}</i>`;
  if (!step.required) text += `\n<i>(Opsional — bisa skip)</i>`;

  let buttons = [];

  if (step.type === "choice") {
    let opts = [];
    try {
      opts = step.source(userData, state) || [];
    } catch (e) {
      console.error("[renderStep] source error:", e.message);
      opts = [];
    }
    if (opts.length === 0) {
      text += `\n\n⚠️ <i>Nggak ada pilihan. Data kosong di web. Skip aja.</i>`;
      buttons.push([{ text: "⏭️ Skip", callback_data: "wiz_skip" }]);
    } else {
      const rows = [];
      for (let i = 0; i < opts.length; i += 2) {
        const row = [];
        row.push({ text: (opts[i].label || "").slice(0, 30), callback_data: `wiz_pick|${opts[i].id}` });
        if (opts[i + 1]) {
          row.push({ text: (opts[i + 1].label || "").slice(0, 30), callback_data: `wiz_pick|${opts[i + 1].id}` });
        }
        rows.push(row);
      }
      buttons = rows;
      if (!step.required) {
        buttons.push([{ text: step.skipLabel || "⏭️ Skip", callback_data: "wiz_skip" }]);
      }
    }
  }

  if (step.type === "date") {
    buttons = [
      [
        { text: "📅 Hari Ini", callback_data: "wiz_date|today" },
        { text: "📅 Besok", callback_data: "wiz_date|besok" },
      ],
      [{ text: "📅 Kemarin", callback_data: "wiz_date|kemarin" }],
      [{ text: "✏️ Manual (YYYY-MM-DD)", callback_data: "wiz_date_manual" }],
    ];
    if (!step.required) {
      buttons.push([{ text: "⏭️ Skip", callback_data: "wiz_skip" }]);
    }
  }

  if (step.type === "text" || step.type === "number" || step.type === "optional-text" || step.type === "optional-number") {
    buttons = [];
    if (step.type === "optional-text" || step.type === "optional-number" || !step.required) {
      buttons.push([{ text: step.skipLabel || "⏭️ Skip", callback_data: "wiz_skip" }]);
    }
  }

  const navRow = [];
  if (stepIdx > 0) navRow.push({ text: "⬅️ Kembali", callback_data: "wiz_back" });
  navRow.push({ text: "❌ Batal", callback_data: "wiz_cancel" });
  buttons.push(navRow);

  try {
    await editTelegramMessage(chatId, state.messageId, text, buttons);
  } catch (e) {
    console.error("[renderStep] edit error:", e.message);
    await sendTelegramWithButtons(chatId, text, buttons);
  }

  state.awaiting = step.type === "choice" || step.type === "date" ? null : step.key;
  state.awaitingType = step.type;
  await setState(firestore, chatId, state);
}

// ========== WIZARD BIASA — HANDLE INPUT ==========
async function handleWizardInput(firestore, chatId, text, state, userData) {
  let config = WIZARD_CONFIG[state.menuId];
  if (!config) config = CUSTOM_MENU_WIZARD;
  const step = config.steps[state.currentStep];
  if (!step) {
    await clearState(firestore, chatId);
    await sendTelegramMessage(chatId, `⚠️ Wizard udah selesai. Kirim /help.`);
    return;
  }

  if (step.type === "number" || step.type === "optional-number") {
    if (text === "-" && step.type === "optional-number") {
      state.fields[step.key] = "";
    } else {
      const num = parseInt(text.replace(/[^\d-]/g, ""));
      if (isNaN(num)) {
        await sendTelegramMessage(chatId, `⚠️ Harus angka. Coba lagi:`);
        return;
      }
      state.fields[step.key] = num;
    }
  } else {
    state.fields[step.key] = text === "-" ? "" : text;
  }

  state.currentStep++;
  state.awaiting = null;
  await setState(firestore, chatId, state);
  await renderStep(firestore, chatId, state, userData);
}

// ========== WIZARD BIASA — HANDLE CALLBACK ==========
async function handleWizardCallback(firestore, chatId, data, state, userData, messageId) {
  const parts = data.split("|");
  const action = parts[0];

  let config = WIZARD_CONFIG[state.menuId];
  if (!config) config = CUSTOM_MENU_WIZARD;

  if (action === "wiz_cancel") {
    await clearState(firestore, chatId);
    await editTelegramMessage(chatId, messageId, "❌ Dibatalkan.");
    return;
  }

  if (action === "wiz_back") {
    state.currentStep = Math.max(0, state.currentStep - 1);
    state.awaiting = null;
    await setState(firestore, chatId, state);
    await renderStep(firestore, chatId, state, userData);
    return;
  }

  if (action === "wiz_skip") {
    state.currentStep++;
    state.awaiting = null;
    await setState(firestore, chatId, state);
    await renderStep(firestore, chatId, state, userData);
    return;
  }

  if (action === "wiz_pick") {
    const value = parts.slice(1).join("|");
    const step = config.steps[state.currentStep];
    if (!step) return;
    state.fields[step.key] = value;
    state.currentStep++;
    state.awaiting = null;
    await setState(firestore, chatId, state);
    await renderStep(firestore, chatId, state, userData);
    return;
  }

  if (action === "wiz_date") {
    const opt = parts[1];
    const step = config.steps[state.currentStep];
    if (!step) return;
    if (opt === "today") state.fields[step.key] = today();
    else if (opt === "besok") state.fields[step.key] = besok();
    else if (opt === "kemarin") state.fields[step.key] = kemarin();
    state.currentStep++;
    state.awaiting = null;
    await setState(firestore, chatId, state);
    await renderStep(firestore, chatId, state, userData);
    return;
  }

  if (action === "wiz_date_manual") {
    state.awaiting = "date_manual";
    state.awaitingKey = config.steps[state.currentStep]?.key;
    await setState(firestore, chatId, state);
    await sendTelegramMessage(chatId, `✏️ Ketik tanggal format <code>YYYY-MM-DD</code>:`);
    return;
  }

  if (action === "wiz_save") {
    try {
      await saveWizard(firestore, userData, state);
      await clearState(firestore, chatId);
      await editTelegramMessage(
        chatId,
        messageId,
        `<b>✅ Tersimpan!</b>\n\nMenu: <b>${config.label}</b>\n\nData udah masuk ke website. Mau backup ke Google Sheets sekarang?`,
        [[{ text: "📊 Sync ke Sheets", callback_data: `syncnow|${userData._uid}` }]]
      );
    } catch (err) {
      console.error("[wizard save] Error:", err);
      await sendTelegramMessage(chatId, `❌ Gagal simpen: ${err.message}`);
    }
    return;
  }
}

// ========== WIZARD BIASA — SIMPAN ==========
async function saveWizard(firestore, userData, state) {
  const menuId = state.menuId;
  const f = state.fields;
  const userRef = firestore.collection("users").doc(userData._uid);
  const todayStr = today();

  // PEKERJAAN → KALENDER
  if (menuId === "pekerjaan") {
    const pekerjaan = userData.pekerjaan || [];
    const ptIdx = pekerjaan.findIndex((p) => p.id === f.ptId);
    if (ptIdx === -1) throw new Error("PT nggak ketemu");
    const brandIdx = (pekerjaan[ptIdx].brands || []).findIndex((b) => b.id === f.brandId);
    if (brandIdx === -1) throw new Error("Brand nggak ketemu");
    if (!pekerjaan[ptIdx].brands[brandIdx].kegiatan) {
      pekerjaan[ptIdx].brands[brandIdx].kegiatan = [];
    }
    pekerjaan[ptIdx].brands[brandIdx].kegiatan.push({
      id: `keg_${Date.now()}`,
      judul: f.judul || "Tanpa judul",
      kategori: f.kategoriId || "",
      prioritas: f.prioritasId || "utama",
      sumber: f.sumberId || "bos",
      catatan: f.catatan || "",
      gdriveUrl: f.gdriveUrl || "",
      tanggalMulai: f.tanggalMulai || todayStr,
      tanggalSelesai: f.tanggalSelesai || f.tanggalMulai || todayStr,
      tanggal: f.tanggalMulai || todayStr,
      status: "belum",
      sections: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    await userRef.update({ pekerjaan });
    return;
  }

  // PEKERJAAN → LAPORAN
  if (menuId === "pekerjaan_laporan") {
    const pekerjaan = userData.pekerjaan || [];
    const ptIdx = pekerjaan.findIndex((p) => p.id === f.ptId);
    if (ptIdx === -1) throw new Error("PT nggak ketemu");
    const brandIdx = (pekerjaan[ptIdx].brands || []).findIndex((b) => b.id === f.brandId);
    if (brandIdx === -1) throw new Error("Brand nggak ketemu");
    const brand = pekerjaan[ptIdx].brands[brandIdx];

    // Simpan pakai skema yang dibaca web (reports[]), bukan format lama.
    simpanLaporanKeBrand(brand, f);
    await userRef.update({ pekerjaan });
    return;
  }

  // PEKERJAAN → EVALUASI
  if (menuId === "pekerjaan_evaluasi") {
    const pekerjaan = userData.pekerjaan || [];
    const ptIdx = pekerjaan.findIndex((p) => p.id === f.ptId);
    if (ptIdx === -1) throw new Error("PT nggak ketemu");
    const brandIdx = (pekerjaan[ptIdx].brands || []).findIndex((b) => b.id === f.brandId);
    if (brandIdx === -1) throw new Error("Brand nggak ketemu");
    const brand = pekerjaan[ptIdx].brands[brandIdx];

    // Simpan pakai skema yang dibaca web (reports[] per periode).
    simpanEvaluasiKeBrand(brand, f);
    await userRef.update({ pekerjaan });
    return;
  }

  // BISNIS → KALENDER
  if (menuId === "bisnis") {
    const brands = userData.bisnisBrands || [];
    const bIdx = brands.findIndex((b) => b.id === f.brandId);
    if (bIdx === -1) throw new Error("Brand nggak ketemu");
    if (!brands[bIdx].kegiatan) brands[bIdx].kegiatan = [];
    brands[bIdx].kegiatan.push({
      id: `keg_${Date.now()}`,
      judul: f.judul || "Tanpa judul",
      kategori: f.kategoriId || "",
      prioritas: f.prioritasId || "utama",
      sumber: f.sumberId || "gua",
      catatan: f.catatan || "",
      gdriveUrl: f.gdriveUrl || "",
      tanggalMulai: f.tanggalMulai || todayStr,
      tanggalSelesai: f.tanggalSelesai || f.tanggalMulai || todayStr,
      tanggal: f.tanggalMulai || todayStr,
      status: "belum",
      sections: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    await userRef.update({ bisnisBrands: brands });
    return;
  }

  // BISNIS → LAPORAN
  if (menuId === "bisnis_laporan") {
    const brands = userData.bisnisBrands || [];
    const bIdx = brands.findIndex((b) => b.id === f.brandId);
    if (bIdx === -1) throw new Error("Brand nggak ketemu");
    const brand = brands[bIdx];

    simpanLaporanKeBrand(brand, f);
    await userRef.update({ bisnisBrands: brands });
    return;
  }

  // BISNIS → EVALUASI
  if (menuId === "bisnis_evaluasi") {
    const brands = userData.bisnisBrands || [];
    const bIdx = brands.findIndex((b) => b.id === f.brandId);
    if (bIdx === -1) throw new Error("Brand nggak ketemu");
    const brand = brands[bIdx];

    simpanEvaluasiKeBrand(brand, f);
    await userRef.update({ bisnisBrands: brands });
    return;
  }

  // BELAJAR
  if (menuId === "belajar") {
    const logHarian = userData.belajarLogHarian || {};
    if (!logHarian[todayStr]) logHarian[todayStr] = [];
    logHarian[todayStr].push({
      id: `log_${Date.now()}`,
      kategoriId: f.kategoriId,
      subKategoriId: f.subKategoriId || "",
      toolId: f.toolId || "",
      fiturId: f.fiturId || "",
      partId: f.partId || "",
      catatan: f.catatan || "",
      gdriveUrl: f.gdriveUrl || "",
      telegramMessageId: "",
      sumber: "telegram",
      updatedAt: new Date().toISOString(),
    });
    await userRef.update({ belajarLogHarian: logHarian });
    return;
  }

  // OLAHRAGA
  if (menuId === "olahraga") {
    const olahraga = userData.olahraga || { minggu: [], harian: {}, fieldEvaluasi: [] };
    if (!olahraga.harian) olahraga.harian = {};
    const current = olahraga.harian[todayStr] || {};
    const angka = parseInt(String(f.jumlah || "").replace(/[^\d]/g, "")) || 0;
    // Samain bentuknya sama web: { jogging:{km}, pushUp:{reps}, legRaise:{reps}, plank:{detik} }.
    if (f.jenis === "jogging") current.jogging = { ...(current.jogging || {}), km: angka };
    else if (f.jenis === "push-up") current.pushUp = { ...(current.pushUp || {}), reps: angka };
    else if (f.jenis === "leg-raise") current.legRaise = { ...(current.legRaise || {}), reps: angka };
    else if (f.jenis === "plank") current.plank = { ...(current.plank || {}), detik: angka };
    if (f.catatan) current.catatan = f.catatan;
    current.updatedAt = new Date().toISOString();
    olahraga.harian[todayStr] = current;
    await userRef.update({ olahraga });
    return;
  }

  // KEUANGAN
  if (menuId === "keuangan") {
    const tanggalTrx = f.tanggal || todayStr;
    const kategoriList = getKategoriList(userData.keuanganKategori);
    const trxBaru = {
      id: `trx_${Date.now()}`,
      jenis: f.jenis,
      nominal: parseInt(f.nominal) || 0,
      kategoriId: f.kategoriId || "",
      // Dompet diturunkan dari kategori (sama kayak web), bukan ditanya manual.
      walletId: deriveWalletId(kategoriList, f.jenis, f.kategoriId),
      metode: f.metode || "Cash",
      catatan: f.catatan || "",
      sumber: "telegram",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    // Baca data terbaru di dalam transaksi + terapkan sebagai delta, biar
    // transaksi Telegram nggak menimpa edit/hapus yang baru dilakukan di web.
    await firestore.runTransaction(async (tx) => {
      const snap = await tx.get(userRef);
      const transaksi = snap.data()?.keuanganTransaksi || {};
      tx.update(userRef, {
        keuanganTransaksi: terapkanAksiTransaksi(transaksi, {
          aksi: "tambah",
          tanggal: tanggalTrx,
          trx: trxBaru,
        }),
      });
    });
    return;
  }

  // HAFALAN
  if (menuId === "hafalan") {
    const membaca = userData.hafalanMembaca || {};
    membaca[todayStr] = {
      juzId: f.juzId,
      suratId: f.suratId,
      halamanMulai: f.halamanMulai || 0,
      halamanSelesai: f.halamanSelesai || 0,
      sudah: true,
      catatan: f.catatan || "",
      updatedAt: new Date().toISOString(),
    };
    await userRef.update({ hafalanMembaca: membaca });
    return;
  }

  // YOUTUBE
  if (menuId === "youtube") {
    const logs = userData.youtube_logs || [];
    logs.push({
      id: `yt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      channel: f.channel,
      judul: f.judul || "",
      tipe: f.tipe || "short",
      status: f.status || "idea",
      tanggal: todayStr,
      linkYoutube: f.linkYoutube || "",
      gdriveUrl: f.gdriveUrl || "",
      catatan: f.catatan || "",
      updatedAt: new Date().toISOString(),
    });
    await userRef.update({ youtube_logs: logs });
    return;
  }

  // BEDAH BUKU
  if (menuId === "bedah-buku") {
    const bedahBuku = userData.bedahBuku || { kategori: [], buku: [] };
    const bukuIdx = (bedahBuku.buku || []).findIndex((b) => b.id === f.bukuId);
    if (bukuIdx === -1) throw new Error("Buku nggak ketemu");
    const buku = bedahBuku.buku[bukuIdx];
    if (!buku.progressHarian) buku.progressHarian = {};
    const mulai = parseInt(f.halamanMulai) || 0;
    const akhir = parseInt(f.halamanSelesai) || mulai;
    const halamanList = [];
    for (let i = mulai; i <= akhir; i++) halamanList.push(i);
    // Web baca halamanAkhir + halamanList (dulu bot nulis halamanSelesai → nggak kebaca).
    buku.progressHarian[todayStr] = {
      halamanMulai: mulai,
      halamanAkhir: akhir,
      halamanList,
      catatan: f.catatan || "",
      gdriveUrl: "",
      createdAt: new Date().toISOString(),
    };
    buku.halamanSelesai = Array.from(new Set([...(buku.halamanSelesai || []), ...halamanList])).sort((a, b) => a - b);
    await userRef.update({ bedahBuku });
    return;
  }

  // MENU CUSTOM
  if (userData.menusCustom && userData.menusCustom[menuId]) {
    const logs = userData.menusCustomLogHarian || {};
    // Web berharap array per tanggal (bukan object) — dulu bot nulis object → web crash.
    if (!Array.isArray(logs[todayStr])) logs[todayStr] = [];
    logs[todayStr].push({
      id: `log_${Date.now()}`,
      kategoriId: menuId,
      subKategoriId: "",
      toolId: "",
      fiturId: "",
      partId: "",
      catatan: f.catatan || "",
      gdriveUrl: f.gdriveUrl || "",
      sumber: "telegram",
      updatedAt: new Date().toISOString(),
    });
    await userRef.update({ menusCustomLogHarian: logs });
    return;
  }

  throw new Error(`Menu "${menuId}" belum didukung.`);
}
// ========== WIZARD VENDOR ==========
const VENDOR_MENUS = ["pekerjaan_vendor", "bisnis_vendor"];

async function startVendorWizard(firestore, chatId, menuId, userData, extraFields = {}) {
  // Vendor Pekerjaan & Bisnis punya daftar kategori/pertanyaan sendiri.
  let questions = vendorLists(userData, menuId).pertanyaan;

  const fields = { ...extraFields };
  const config = { steps: getVendorFieldsSteps(menuId) };
  config.steps.forEach((s) => {
    if (s.default !== undefined && fields[s.key] === undefined) {
      if (s.default === "today") fields[s.key] = today();
      else fields[s.key] = s.default;
    }
  });

  let startStep = 0;
  if (extraFields.ptId || extraFields.brandId) {
    for (let i = 0; i < config.steps.length; i++) {
      if (fields[config.steps[i].key] === undefined) {
        startStep = i;
        break;
      }
    }
  }

  const state = {
    menuId,
    phase: "fields",
    currentStep: startStep,
    fields,
    questions,
    answers: {},
    currentQuestionIdx: 0,
    newQuestionTemp: {},
    awaiting: null,
    awaitingType: null,
  };

  await setState(firestore, chatId, state);
  const msg = await sendTelegramWithButtons(chatId, `⏳ Loading...`, []);
  if (msg.ok) {
    state.messageId = msg.result.message_id;
    await setState(firestore, chatId, state);
    await renderVendorStep(firestore, chatId, state, userData);
  }
}

async function renderVendorStep(firestore, chatId, state, userData) {
  const config = { label: state.menuId === "pekerjaan_vendor" ? "💼 Pekerjaan → 🏪 Vendor" : "💼 Bisnis → 🏪 Vendor", steps: getVendorFieldsSteps(state.menuId) };
  const steps = config.steps;

  if (state.phase === "fields") {
    const stepIdx = state.currentStep;
    if (stepIdx >= steps.length) {
      state.phase = "questions";
      state.currentQuestionIdx = 0;
      state.awaiting = null;
      state.awaitingType = null;
      await setState(firestore, chatId, state);
      return renderVendorStep(firestore, chatId, state, userData);
    }

    const step = steps[stepIdx];
    const progress = `Step ${stepIdx + 1}/${steps.length}`;
    let text = `<b>${progress} — ${step.label}</b>\n`;
    if (step.hint) text += `\n<i>${step.hint}</i>`;
    if (!step.required) text += `\n<i>(Opsional — bisa skip)</i>`;

    let buttons = [];

    if (step.type === "choice") {
      let opts = [];
      try {
        opts = step.source(userData, state) || [];
      } catch (e) { opts = []; }
      if (opts.length === 0) {
        text += `\n\n⚠️ <i>Nggak ada pilihan. Skip aja.</i>`;
        buttons.push([{ text: "⏭️ Skip", callback_data: "vend_skip" }]);
      } else {
        const rows = [];
        for (let i = 0; i < opts.length; i += 2) {
          const row = [];
          row.push({ text: (opts[i].label || "").slice(0, 30), callback_data: `vend_pick|${step.key}|${opts[i].id}` });
          if (opts[i + 1]) {
            row.push({ text: (opts[i + 1].label || "").slice(0, 30), callback_data: `vend_pick|${step.key}|${opts[i + 1].id}` });
          }
          rows.push(row);
        }
        buttons = rows;
        if (!step.required) {
          buttons.push([{ text: step.skipLabel || "⏭️ Skip", callback_data: "vend_skip" }]);
        }
      }
    }

    if (step.type === "text" || step.type === "number" || step.type === "optional-text" || step.type === "optional-number") {
      if (step.type === "optional-text" || step.type === "optional-number") {
        buttons.push([{ text: "⏭️ Skip", callback_data: "vend_skip" }]);
      }
    }

    const navRow = [];
    if (stepIdx > 0) navRow.push({ text: "⬅️ Kembali", callback_data: "vend_back" });
    navRow.push({ text: "❌ Batal", callback_data: "vend_cancel" });
    buttons.push(navRow);

    try {
      await editTelegramMessage(chatId, state.messageId, text, buttons);
    } catch (e) {
      await sendTelegramWithButtons(chatId, text, buttons);
    }

    state.awaiting = step.type === "choice" ? null : step.key;
    state.awaitingType = step.type;
    await setState(firestore, chatId, state);
    return;
  }

  if (state.phase === "questions") {
    const qIdx = state.currentQuestionIdx;
    const questions = state.questions || [];

    if (qIdx >= questions.length) {
      state.phase = "manage_questions";
      state.awaiting = null;
      state.awaitingType = null;
      await setState(firestore, chatId, state);
      return renderVendorStep(firestore, chatId, state, userData);
    }

    const q = questions[qIdx];
    const progress = `Pertanyaan ${qIdx + 1}/${questions.length}`;
    let text = `<b>📋 ${progress}</b>\n\n❓ ${q.pertanyaan}\n`;
    if (q.tipe === "checkbox") text += `\n<i>Pilih Ya / Tidak / Skip</i>`;
    else if (q.tipe === "short") text += `\n<i>Ketik jawaban pendek (atau "-" buat kosong)</i>`;
    else text += `\n<i>Ketik jawaban panjang (atau "-" buat kosong)</i>`;

    let buttons = [];
    if (q.tipe === "checkbox") {
      buttons = [
        [
          { text: "✅ Ya", callback_data: `vend_ans|${q.id}|true` },
          { text: "❌ Tidak", callback_data: `vend_ans|${q.id}|false` },
        ],
        [{ text: "⏭️ Skip", callback_data: `vend_ans|${q.id}|skip` }],
      ];
    } else {
      buttons = [[{ text: "⏭️ Skip", callback_data: `vend_ans|${q.id}|skip` }]];
    }

    try {
      await editTelegramMessage(chatId, state.messageId, text, buttons);
    } catch (e) {
      await sendTelegramWithButtons(chatId, text, buttons);
    }

    if (q.tipe === "checkbox") {
      state.awaiting = null;
      state.awaitingType = "choice";
    } else {
      state.awaiting = q.id;
      state.awaitingType = q.tipe === "short" ? "optional-text" : "optional-text";
    }
    await setState(firestore, chatId, state);
    return;
  }

  if (state.phase === "manage_questions") {
    const questions = state.questions || [];
    let text = `<b>✏️ Mau ubah pertanyaan awal?</b>\n\n<b>📋 Pertanyaan Awal (${questions.length}):</b>\n`;
    questions.forEach((q, idx) => {
      text += `${idx + 1}. ${q.pertanyaan} <i>(${q.tipe})</i>\n`;
    });
    text += `\nPilih aksi:`;

    const buttons = [
      [
        { text: "➕ Tambah", callback_data: "vend_q_add" },
        { text: "✏️ Edit", callback_data: "vend_q_edit" },
      ],
      [
        { text: "🗑️ Hapus", callback_data: "vend_q_del" },
        { text: "✅ Lanjut", callback_data: "vend_q_done" },
      ],
      [{ text: "❌ Batal", callback_data: "vend_cancel" }],
    ];

    try {
      await editTelegramMessage(chatId, state.messageId, text, buttons);
    } catch (e) {
      await sendTelegramWithButtons(chatId, text, buttons);
    }

    state.awaiting = null;
    state.awaitingType = "choice";
    await setState(firestore, chatId, state);
    return;
  }

  if (state.phase === "add_question_text") {
    const text = `<b>➕ Tambah Pertanyaan</b>\n\n✏️ Ketik pertanyaan baru:`;
    const buttons = [[{ text: "❌ Batal", callback_data: "vend_cancel" }]];
    try {
      await editTelegramMessage(chatId, state.messageId, text, buttons);
    } catch (e) {
      await sendTelegramWithButtons(chatId, text, buttons);
    }
    state.awaiting = "new_question_text";
    state.awaitingType = "text";
    await setState(firestore, chatId, state);
    return;
  }

  if (state.phase === "add_question_type") {
    const text = `<b>➕ Tambah Pertanyaan</b>\n\nPertanyaan: <i>${state.newQuestionTemp.pertanyaan}</i>\n\n📝 Pilih tipe:`;
    const buttons = [
      [
        { text: "✅ Checkbox", callback_data: "vend_qtype|checkbox" },
        { text: "✏️ Pendek", callback_data: "vend_qtype|short" },
      ],
      [
        { text: "📝 Panjang", callback_data: "vend_qtype|long" },
        { text: "❌ Batal", callback_data: "vend_cancel" },
      ],
    ];
    try {
      await editTelegramMessage(chatId, state.messageId, text, buttons);
    } catch (e) {
      await sendTelegramWithButtons(chatId, text, buttons);
    }
    state.awaiting = null;
    state.awaitingType = "choice";
    await setState(firestore, chatId, state);
    return;
  }

  if (state.phase === "edit_question_pick") {
    const questions = state.questions || [];
    if (questions.length === 0) {
      state.phase = "manage_questions";
      await setState(firestore, chatId, state);
      return renderVendorStep(firestore, chatId, state, userData);
    }

    const rows = [];
    for (let i = 0; i < questions.length; i += 3) {
      const row = [];
      for (let j = i; j < Math.min(i + 3, questions.length); j++) {
        row.push({ text: `${j + 1}`, callback_data: `vend_edit_pick|${j}` });
      }
      rows.push(row);
    }
    rows.push([{ text: "❌ Batal", callback_data: "vend_cancel" }]);

    const text = `<b>✏️ Edit Pertanyaan</b>\n\n📝 Pilih nomor pertanyaan yang mau diedit:`;
    try {
      await editTelegramMessage(chatId, state.messageId, text, rows);
    } catch (e) {
      await sendTelegramWithButtons(chatId, text, rows);
    }
    state.awaiting = null;
    state.awaitingType = "choice";
    await setState(firestore, chatId, state);
    return;
  }

  if (state.phase === "edit_question_text") {
    const text = `<b>✏️ Edit Pertanyaan</b>\n\nPertanyaan lama: <i>${state.newQuestionTemp.oldPertanyaan}</i>\n\n✏️ Ketik pertanyaan baru:`;
    const buttons = [[{ text: "❌ Batal", callback_data: "vend_cancel" }]];
    try {
      await editTelegramMessage(chatId, state.messageId, text, buttons);
    } catch (e) {
      await sendTelegramWithButtons(chatId, text, buttons);
    }
    state.awaiting = "edit_question_text";
    state.awaitingType = "text";
    await setState(firestore, chatId, state);
    return;
  }

  if (state.phase === "edit_question_type") {
    const text = `<b>✏️ Edit Pertanyaan</b>\n\nPertanyaan baru: <i>${state.newQuestionTemp.pertanyaan}</i>\n\n📝 Pilih tipe baru:`;
    const buttons = [
      [
        { text: "✅ Checkbox", callback_data: "vend_qtype|checkbox" },
        { text: "✏️ Pendek", callback_data: "vend_qtype|short" },
      ],
      [
        { text: "📝 Panjang", callback_data: "vend_qtype|long" },
        { text: "❌ Batal", callback_data: "vend_cancel" },
      ],
    ];
    try {
      await editTelegramMessage(chatId, state.messageId, text, buttons);
    } catch (e) {
      await sendTelegramWithButtons(chatId, text, buttons);
    }
    state.awaiting = null;
    state.awaitingType = "choice";
    await setState(firestore, chatId, state);
    return;
  }

  if (state.phase === "delete_question_pick") {
    const questions = state.questions || [];
    if (questions.length === 0) {
      state.phase = "manage_questions";
      await setState(firestore, chatId, state);
      return renderVendorStep(firestore, chatId, state, userData);
    }

    const rows = [];
    for (let i = 0; i < questions.length; i += 3) {
      const row = [];
      for (let j = i; j < Math.min(i + 3, questions.length); j++) {
        row.push({ text: `${j + 1}. ${questions[j].pertanyaan.slice(0, 15)}`, callback_data: `vend_del_pick|${j}` });
      }
      rows.push(row);
    }
    rows.push([{ text: "❌ Batal", callback_data: "vend_cancel" }]);

    const text = `<b>🗑️ Hapus Pertanyaan</b>\n\nPilih nomor pertanyaan yang mau dihapus:`;
    try {
      await editTelegramMessage(chatId, state.messageId, text, rows);
    } catch (e) {
      await sendTelegramWithButtons(chatId, text, rows);
    }
    state.awaiting = null;
    state.awaitingType = "choice";
    await setState(firestore, chatId, state);
    return;
  }

  if (state.phase === "summary") {
    let ringkasan;
    try {
      ringkasan = buildRingkasanVendor(state.menuId, state.fields, state.questions, state.answers, userData);
    } catch (e) {
      console.error("[renderVendorStep] buildRingkasanVendor error:", e.message);
      ringkasan = `<b>📋 Ringkasan Vendor</b>\n\nNama: <b>${state.fields.nama || "-"}</b>\n\nSimpen?`;
    }

    const buttons = [
      [{ text: "✅ Simpan", callback_data: "vend_save" }],
      [
        { text: "⬅️ Kembali", callback_data: "vend_back_summary" },
        { text: "❌ Batal", callback_data: "vend_cancel" },
      ],
    ];

    try {
      await editTelegramMessage(chatId, state.messageId, ringkasan, buttons);
    } catch (e) {
      await sendTelegramWithButtons(chatId, ringkasan, buttons);
    }
    state.awaiting = null;
    state.awaitingType = null;
    await setState(firestore, chatId, state);
    return;
  }
}

async function handleVendorTextInput(firestore, chatId, text, state, userData) {
  const awaiting = state.awaiting;

  if (state.phase === "fields") {
    const steps = getVendorFieldsSteps(state.menuId);
    const step = steps[state.currentStep];
    if (!step) {
      await clearState(firestore, chatId);
      return;
    }
    const val = text === "-" ? "" : text;
    if (step.type === "number" || step.type === "optional-number") {
      const num = parseInt(text.replace(/[^\d-]/g, ""));
      if (isNaN(num)) {
        await sendTelegramMessage(chatId, `⚠️ Harus angka. Coba lagi:`);
        return;
      }
      state.fields[step.key] = num;
    } else {
      state.fields[step.key] = val;
    }
    state.currentStep++;
    state.awaiting = null;
    await setState(firestore, chatId, state);
    await renderVendorStep(firestore, chatId, state, userData);
    return;
  }

  if (state.phase === "questions" && awaiting) {
    const qId = awaiting;
    state.answers[qId] = text === "-" ? "" : text;
    state.currentQuestionIdx++;
    state.awaiting = null;
    await setState(firestore, chatId, state);
    await renderVendorStep(firestore, chatId, state, userData);
    return;
  }

  if (state.phase === "add_question_text" && awaiting === "new_question_text") {
    state.newQuestionTemp = { pertanyaan: text.trim() };
    state.phase = "add_question_type";
    state.awaiting = null;
    await setState(firestore, chatId, state);
    await renderVendorStep(firestore, chatId, state, userData);
    return;
  }

  if (state.phase === "edit_question_text" && awaiting === "edit_question_text") {
    state.newQuestionTemp.pertanyaan = text.trim();
    state.phase = "edit_question_type";
    state.awaiting = null;
    await setState(firestore, chatId, state);
    await renderVendorStep(firestore, chatId, state, userData);
    return;
  }

  await sendTelegramMessage(chatId, `⚠️ Input nggak dikenali. Klik tombol yang tersedia.`);
}

async function handleVendorCallback(firestore, chatId, data, state, userData, messageId) {
  const parts = data.split("|");
  const action = parts[0];

  if (action === "vend_cancel") {
    await clearState(firestore, chatId);
    await editTelegramMessage(chatId, messageId, "❌ Dibatalkan.");
    return;
  }

  if (action === "vend_back") {
    if (state.phase === "fields") {
      state.currentStep = Math.max(0, state.currentStep - 1);
      state.awaiting = null;
      await setState(firestore, chatId, state);
      await renderVendorStep(firestore, chatId, state, userData);
    }
    return;
  }

  if (action === "vend_back_summary") {
    state.phase = "manage_questions";
    state.awaiting = null;
    await setState(firestore, chatId, state);
    await renderVendorStep(firestore, chatId, state, userData);
    return;
  }

  if (action === "vend_skip") {
    if (state.phase === "fields") {
      state.currentStep++;
      state.awaiting = null;
      await setState(firestore, chatId, state);
      await renderVendorStep(firestore, chatId, state, userData);
    }
    return;
  }

  if (action === "vend_pick") {
    const stepKey = parts[1];
    const value = parts.slice(2).join("|");
    if (state.phase === "fields") {
      state.fields[stepKey] = value;
      state.currentStep++;
      state.awaiting = null;
      await setState(firestore, chatId, state);
      await renderVendorStep(firestore, chatId, state, userData);
    }
    return;
  }

  if (action === "vend_ans") {
    const qId = parts[1];
    const valStr = parts[2];
    if (valStr === "skip") {
      state.answers[qId] = "";
    } else if (valStr === "true") {
      state.answers[qId] = true;
    } else if (valStr === "false") {
      state.answers[qId] = false;
    }
    state.currentQuestionIdx++;
    state.awaiting = null;
    await setState(firestore, chatId, state);
    await renderVendorStep(firestore, chatId, state, userData);
    return;
  }

  if (action === "vend_q_add") {
    state.phase = "add_question_text";
    state.newQuestionTemp = {};
    state.awaiting = "new_question_text";
    state.awaitingType = "text";
    await setState(firestore, chatId, state);
    await renderVendorStep(firestore, chatId, state, userData);
    return;
  }

  if (action === "vend_q_edit") {
    state.phase = "edit_question_pick";
    await setState(firestore, chatId, state);
    await renderVendorStep(firestore, chatId, state, userData);
    return;
  }

  if (action === "vend_q_del") {
    state.phase = "delete_question_pick";
    await setState(firestore, chatId, state);
    await renderVendorStep(firestore, chatId, state, userData);
    return;
  }

  if (action === "vend_q_done") {
    state.phase = "summary";
    state.awaiting = null;
    await setState(firestore, chatId, state);
    await renderVendorStep(firestore, chatId, state, userData);
    return;
  }

  if (action === "vend_qtype") {
    const tipe = parts[1];
    if (state.phase === "add_question_type") {
      const newQ = {
        id: generateWizardId("q"),
        pertanyaan: state.newQuestionTemp.pertanyaan,
        tipe,
      };
      state.questions = [...(state.questions || []), newQ];
      state.newQuestionTemp = {};
      state.phase = "manage_questions";
    } else if (state.phase === "edit_question_type") {
      const editIdx = state.newQuestionTemp.editIdx;
      if (editIdx !== undefined && state.questions[editIdx]) {
        state.questions[editIdx] = {
          ...state.questions[editIdx],
          pertanyaan: state.newQuestionTemp.pertanyaan,
          tipe,
        };
      }
      state.newQuestionTemp = {};
      state.phase = "manage_questions";
    }
    state.awaiting = null;
    await setState(firestore, chatId, state);
    await renderVendorStep(firestore, chatId, state, userData);
    return;
  }

  if (action === "vend_edit_pick") {
    const idx = parseInt(parts[1]);
    const q = state.questions[idx];
    if (!q) return;
    state.newQuestionTemp = { oldPertanyaan: q.pertanyaan, editIdx: idx };
    state.phase = "edit_question_text";
    state.awaiting = "edit_question_text";
    state.awaitingType = "text";
    await setState(firestore, chatId, state);
    await renderVendorStep(firestore, chatId, state, userData);
    return;
  }

  if (action === "vend_del_pick") {
    const idx = parseInt(parts[1]);
    const newQuestions = (state.questions || []).filter((_, i) => i !== idx);
    state.questions = newQuestions;
    state.phase = "manage_questions";
    state.awaiting = null;
    await setState(firestore, chatId, state);
    await renderVendorStep(firestore, chatId, state, userData);
    return;
  }

  if (action === "vend_save") {
    try {
      await saveVendorWizard(firestore, userData, state);
      await clearState(firestore, chatId);
      const config = { label: state.menuId === "pekerjaan_vendor" ? "💼 Pekerjaan → 🏪 Vendor" : "💼 Bisnis → 🏪 Vendor" };
      await editTelegramMessage(
        chatId,
        messageId,
        `<b>✅ Tersimpan!</b>\n\nMenu: <b>${config.label}</b>\n\nData udah masuk ke website. Mau backup ke Google Sheets sekarang?`,
        [[{ text: "📊 Sync ke Sheets", callback_data: `syncnow|${userData._uid}` }]]
      );
    } catch (err) {
      console.error("[vendor save] Error:", err);
      await sendTelegramMessage(chatId, `❌ Gagal simpen: ${err.message}`);
    }
    return;
  }
}

async function saveVendorWizard(firestore, userData, state) {
  const menuId = state.menuId;
  const f = state.fields;
  const questions = state.questions || [];
  const answers = state.answers || {};
  const userRef = firestore.collection("users").doc(userData._uid);

  const pertanyaanAwal = questions.map((q) => {
    const jawab = answers[q.id];
    let finalJawab = "";
    if (q.tipe === "checkbox") {
      if (jawab === true) finalJawab = true;
      else if (jawab === false) finalJawab = false;
      else finalJawab = "";
    } else {
      finalJawab = jawab || "";
    }
    return {
      id: q.id,
      pertanyaan: q.pertanyaan,
      tipe: q.tipe,
      jawaban: finalJawab,
    };
  });

  const vendorBaru = {
    id: `vendor_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    nama: f.nama,
    kategoriId: f.kategoriId,
    kontak: {
      nama: f.kontakNama || "",
      telp: f.kontakTelp || "",
      email: f.kontakEmail || "",
    },
    alamat: f.alamat || "",
    moq: {
      nilai: parseInt(f.moqNilai) || 0,
      satuan: f.moqSatuan || "pcs",
    },
    hpp: parseInt(f.hpp) || 0,
    status: f.status || "silver",
    catatan: f.catatan || "",
    pertanyaanAwal,
    logKunjungan: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (menuId === "pekerjaan_vendor") {
    const pekerjaan = userData.pekerjaan || [];
    const ptIdx = pekerjaan.findIndex((p) => p.id === f.ptId);
    if (ptIdx === -1) throw new Error("PT nggak ketemu");
    const brandIdx = (pekerjaan[ptIdx].brands || []).findIndex((b) => b.id === f.brandId);
    if (brandIdx === -1) throw new Error("Brand nggak ketemu");
    if (!pekerjaan[ptIdx].brands[brandIdx].vendorList) {
      pekerjaan[ptIdx].brands[brandIdx].vendorList = [];
    }
    pekerjaan[ptIdx].brands[brandIdx].vendorList.push(vendorBaru);
    await userRef.update({ pekerjaan });
  } else if (menuId === "bisnis_vendor") {
    const brands = userData.bisnisBrands || [];
    const bIdx = brands.findIndex((b) => b.id === f.brandId);
    if (bIdx === -1) throw new Error("Brand nggak ketemu");
    if (!brands[bIdx].vendorList) brands[bIdx].vendorList = [];
    brands[bIdx].vendorList.push(vendorBaru);
    await userRef.update({ bisnisBrands: brands });
  } else {
    throw new Error(`Menu "${menuId}" bukan vendor.`);
  }

  const oldQs = vendorLists(userData, menuId).pertanyaan;
  const oldIds = oldQs.map((q) => q.id).sort().join(",");
  const newIds = questions.map((q) => q.id).sort().join(",");
  const oldText = oldQs.map((q) => `${q.id}:${q.pertanyaan}:${q.tipe}`).join("|");
  const newText = questions.map((q) => `${q.id}:${q.pertanyaan}:${q.tipe}`).join("|");

  if (oldIds !== newIds || oldText !== newText) {
    await userRef.update({ [vendorLists(userData, menuId).keyPertanyaan]: questions });
  }
}

// ========== HANDLE SUB-MENU PICK ==========
async function handleSubMenuPick(firestore, chatId, messageId, userData, command, subMenuId, baseFields) {
  if (subMenuId === "vendor") {
    const wizardKey = `${command}_vendor`;
    await clearState(firestore, chatId);
    await editTelegramMessage(
      chatId,
      messageId,
      `<b>✅ Sub-menu dipilih: 🏪 Vendor</b>\n\n⏳ Loading wizard...`
    );
    await startVendorWizard(firestore, chatId, wizardKey, userData, baseFields);
    return;
  }

  let wizardKey = `${command}_${subMenuId}`;
  let config  = WIZARD_CONFIG[wizardKey];
  // "Kalender" pakai wizard utama (dulu nyari "pekerjaan_kalender" yang nggak ada → dead-end).
  if (!config && subMenuId === "kalender") {
    wizardKey = command;
    config = WIZARD_CONFIG[wizardKey];
  }
  if (!config) {
    await editTelegramMessage(chatId, messageId, `⚠️ Sub-menu "${subMenuId}" belum punya wizard.`);
    return;
  }

  await clearState(firestore, chatId);
  await editTelegramMessage(
    chatId,
    messageId,
    `<b>✅ Sub-menu dipilih: ${config.label}</b>\n\n⏳ Loading wizard...`
  );

  const msg = await sendTelegramWithButtons(chatId, `⏳ Loading...`, []);
  if (!msg.ok) return;

  const fields = { ...baseFields };
  config.steps.forEach((s) => {
    if (s.default !== undefined && fields[s.key] === undefined) {
      if (s.default === "today") fields[s.key] = today();
      else fields[s.key] = s.default;
    }
  });

  let startStep = 0;
  for (let i = 0; i < config.steps.length; i++) {
    if (fields[config.steps[i].key] === undefined) {
      startStep = i;
      break;
    }
  }

  const state = {
    menuId: wizardKey,
    currentStep: startStep,
    fields,
    awaiting: null,
    messageId: msg.result.message_id,
  };
  await setState(firestore, chatId, state);
  await renderStep(firestore, chatId, state, userData);
}

// ========== HANDLE PESAN TEKS ==========
async function handleTextMessage(firestore, chatId, text, userData, messageId, fromData) {
  const state = await getState(firestore, chatId);

  // ==== STATE AKTIF: CEK VENDOR vs WIZARD BIASA ====
  if (state && state.phase && VENDOR_MENUS.includes(state.menuId)) {
    if (state.awaiting && !text.startsWith("/")) {
      await handleVendorTextInput(firestore, chatId, text, state, userData);
      return;
    }
    if (!state.awaiting && !text.startsWith("/")) {
      await sendTelegramMessage(chatId, `⚠️ Klik tombol yang tersedia.`);
      return;
    }
  }

  if (state && state.mode === "submenu" && !text.startsWith("/")) {
    await sendTelegramMessage(
      chatId,
      `⚠️ Pilih dari tombol di atas ya (PT → Brand → menu). Kalau mau batal, kirim /help.`
    );
    return;
  }

  if (state && !state.phase && state.awaiting && !text.startsWith("/")) {
    if (state.awaiting === "date_manual") {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      const tgl = text.trim();
      const valid = dateRegex.test(tgl) && !Number.isNaN(new Date(tgl).getTime()) && new Date(tgl).toISOString().split("T")[0] === tgl;
      if (!valid) {
        await sendTelegramMessage(chatId, `⚠️ Tanggal nggak valid. Ketik <code>YYYY-MM-DD</code> (contoh: 2026-10-05):`);
        return;
      }
      state.fields[state.awaitingKey] = tgl;
      state.currentStep++;
      state.awaiting = null;
      state.awaitingKey = null;
      await setState(firestore, chatId, state);
      await renderStep(firestore, chatId, state, userData);
      return;
    }
    if (state.awaitingType === "text" || state.awaitingType === "number" || state.awaitingType === "optional-text" || state.awaitingType === "optional-number") {
      await handleWizardInput(firestore, chatId, text, state, userData);
      return;
    }
  }

  if (state && !state.phase && !state.awaiting && !text.startsWith("/")) {
    await sendTelegramMessage(
      chatId,
      `⚠️ Wizard lagi di ringkasan.\n\nKlik <b>[✅ Simpan]</b> buat simpen, atau <b>[❌ Batal]</b> buat batalin.`
    );
    return;
  }

  // ==== COMMAND ====
  const parsed = parseCommand(text);
  if (!parsed) {
    await sendTelegramMessage(chatId, `🤖 Halo! Kirim /help atau /menu_list.`);
    return;
  }
  const { command: rawCommand, payload, catatan, autoChoice } = parsed;
  // Alias underscore (dari menu "/") → command asli yang pakai tanda hubung.
  const command = COMMAND_ALIAS[rawCommand] || rawCommand;

  if (command === "start" || command === "help") {
    const { text, keyboard } = buildHelpView("root");
    await sendTelegramWithButtons(chatId, text, keyboard);
    return;
  }
  if (command === "link") {
    if (!payload) { await sendTelegramMessage(chatId, `⚠️ Format: <code>/link KODE</code>`); return; }
    await handleLink(firestore, chatId, payload, fromData);
    return;
  }
  if (!userData) {
    await sendTelegramMessage(chatId, `⚠️ Belum di-link.\nBuka web → 🤖 Telegram → Generate Pairing Code → <code>/link KODE</code>.`);
    return;
  }
  if (command === "menu_list") {
    const { text, keyboard } = buildMenuListView(userData);
    await sendTelegramWithButtons(chatId, text, keyboard);
    return;
  }

  // ==== TAMBAHAN BARU: HANDLE COMMAND /dashboard ====
  if (command === "dashboard") {
    const jadwalUser = userData.jadwalUser || { kerja: [], minggu: [] };
    
    // Ambil hari ini (0 = Minggu, 1 = Senin, dst)
    const dayIndex = new Date().getDay(); 
    const isMinggu = dayIndex === 0;
    
    const jadwalHariIni = isMinggu ? (jadwalUser.minggu || []) : (jadwalUser.kerja || []);
    const labelHari = isMinggu ? "Hari Minggu" : "Hari Kerja";

    if (jadwalHariIni.length === 0) {
      await sendTelegramMessage(chatId, `📅 <b>Jadwal ${labelHari}</b>\n\nBelum ada jadwal yang diatur untuk hari ini, Bos.`);
      return;
    }

    let pesan = `📅 <b>JADWAL ${labelHari.toUpperCase()} (HARI INI)</b>\n\n`;
    
    jadwalHariIni.forEach((item, index) => {
      // Bersihin emoji di label
      const labelBersih = (item.label || "").replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
      
      // Ambil jam (support format lama dan baru)
      let jamStr = "";
      if (item.jam) jamStr = item.jam;
      else if (item.jamMulai || item.waktuMulai) {
         jamStr = `${item.jamMulai || item.waktuMulai} - ${item.jamSelesai || item.waktuSelesai}`;
      } else if (item.waktu) jamStr = item.waktu;
      
      pesan += `<b>${index + 1}. ${labelBersih}</b>\n`;
      if (jamStr && jamStr !== " - ") pesan += `⏰ ${jamStr}\n`;
      if (item.unit) pesan += `🎯 Target: ${item.unit}\n`;
      pesan += `\n`;
    });

    pesan += `💡 <i>Buka web untuk menandai kegiatan yang sudah selesai.</i>`;
    
    await sendTelegramMessage(chatId, pesan);
    return;
  }
  // ==== END TAMBAHAN ====

  if (command === "debug") {
    const menus = userData.menus || [];
    await sendTelegramMessage(chatId, `<b>🔍 DEBUG</b>\n\nUID: <code>${userData._uid}</code>\nmenus: ${menus.length}\npekerjaan: ${(userData.pekerjaan || []).length}\nbelajar: ${(userData.belajar?.kategori || []).length}\nbisnis: ${(userData.bisnisBrands || []).length}`);
    return;
  }
  if (command === "status") {
    await sendTelegramMessage(chatId, `<b>📊 Status</b>\n\n🟢 Telegram: Aktif\n🟢 Firestore: Tersambung`);
    return;
  }
  if (command === "today") {
    const todayStrLocal = today();
    const progress = userData.dailyProgress?.[todayStrLocal] || {};
    await sendTelegramMessage(chatId, `<b>📅 Ringkasan Hari Ini</b>\n\n📝 ${Object.keys(progress).length} aktivitas.`);
    return;
  }
  if (command === "unlink") {
    await firestore.collection("users").doc(userData._uid).update({
      telegramChatId: null, telegramUsername: null, telegramFirstName: null, telegramLinkedAt: null,
    });
    await sendTelegramMessage(chatId, `✅ Unlink berhasil.`);
    return;
  }

  // ==== REMINDER PRIBADI ====
  if (command === "reminder") {
    const settings = userData.reminderSettings || {};
    const text = buildStatusReminderText(settings);
    const buttons = buildStatusReminderButtons(settings);
    await sendTelegramWithButtons(chatId, text, buttons);
    return;
  }

  if (command === "pause") {
    const settings = userData.reminderSettings || {};
    const newSettings = { ...settings };
    Object.keys(REMINDER_CONFIG).forEach((menuId) => {
      newSettings[menuId] = { ...(newSettings[menuId] || {}), enabled: false };
    });
    await firestore.collection("users").doc(userData._uid).set(
      { reminderSettings: newSettings },
      { merge: true }
    );
    await sendTelegramMessage(chatId, `⏸️ <b>Semua reminder pribadi dimatiin.</b>\n\nKetik /reminder buat cek status.`);
    return;
  }

  if (command === "resume") {
    const settings = userData.reminderSettings || {};
    const newSettings = { ...settings };
    Object.keys(REMINDER_CONFIG).forEach((menuId) => {
      newSettings[menuId] = { ...(newSettings[menuId] || {}), enabled: true };
    });
    await firestore.collection("users").doc(userData._uid).set(
      { reminderSettings: newSettings },
      { merge: true }
    );
    await sendTelegramMessage(chatId, `▶️ <b>Semua reminder pribadi dinyalain.</b>\n\nKetik /reminder buat cek status.`);
    return;
  }

  // ==== REMINDER PROYEK ====
  if (command === "reminder-proyek") {
    const settings = settingsProyek(userData);
    const textUI = buildStatusReminderProyekText(settings);
    const buttons = buildStatusReminderProyekButtons(settings);
    await sendTelegramWithButtons(chatId, textUI, buttons);
    return;
  }

  if (command === "pause-proyek") {
    await firestore.collection("users").doc(userData._uid).set(
      { reminderProyekSettings: { ...settingsProyek(userData), enabled: false } },
      { merge: true }
    );
    await sendTelegramMessage(chatId, `⏸️ <b>Reminder Proyek dimatiin.</b>\n\nReminder pribadi <b>TETAP JALAN</b>.\n\nKetik /resume-proyek buat nyalain lagi.`);
    return;
  }

  if (command === "resume-proyek") {
    await firestore.collection("users").doc(userData._uid).set(
      { reminderProyekSettings: { ...settingsProyek(userData), enabled: true } },
      { merge: true }
    );
    await sendTelegramMessage(chatId, `▶️ <b>Reminder Proyek dinyalain.</b>\n\nKetik /reminder-proyek buat cek status.`);
    return;
  }

  // ==== KARYA ====
  if (command === "karya") {
    const FORMAT_KARYA = `<code>/karya [tool] | [link] | [judul]</code>`;
    if (!payload) { await sendTelegramMessage(chatId, `⚠️ Format: ${FORMAT_KARYA}`); return; }
    const toolName = payload.trim();
    // parseCommand: segmen ke-2 = catatan/link, segmen ke-3 = autoChoice/judul.
    // Judul WAJIB karena web (KaryaMingguan) nampilin `judul` sebagai nama karya.
    // Dulu bot nyimpen tanpa judul → kartu karya di web kosong.
    const linkTiktok = (catatan || "").trim();
    const judulKarya = (autoChoice || "").trim();
    if (!judulKarya) {
      await sendTelegramMessage(
        chatId,
        `⚠️ <b>Judul karya belum diisi.</b>\n\nFormat: ${FORMAT_KARYA}\nContoh: <code>/karya Blender | https://tiktok.com/@lo/video/123 | Review SolidWorks</code>`
      );
      return;
    }

    const kategoriArr = userData.belajar?.kategori || [];
    const { resolveNestedPath } = await import("@/lib/telegramData");
    const result = resolveNestedPath(toolName, kategoriArr);
    if (!result || !result.found) { await sendTelegramMessage(chatId, `❌ Tool "${toolName}" nggak ketemu.`); return; }

    const userRef = firestore.collection("users").doc(userData._uid);
    const snap = await userRef.get();
    const data = snap.data();
    const kategori = data.belajar?.kategori || [];
    let arr = kategori;
    let found = null;
    for (let i = 0; i < result.path.length; i++) {
      found = arr.find((x) => x.id === result.path[i]);
      if (!found) break;
      if (i < result.path.length - 1) {
        arr = found.tools || found.subKategori || found.fitur || found.parts || [];
      }
    }
    if (!found) { await sendTelegramMessage(chatId, `❌ Tool nggak ketemu.`); return; }
    if (!found.karyaMingguan) found.karyaMingguan = [];
    // Web (KaryaMingguan.js) baca { id, judul, link, tanggal }.
    found.karyaMingguan.push({
      id: `karya_${Date.now()}`,
      judul: judulKarya,
      link: linkTiktok,
      tanggal: new Date().toISOString(),
    });
    await userRef.update({ belajar: { kategori } });
    await sendTelegramMessage(chatId, `✅ Karya "${judulKarya}" ditambah ke ${result.labels.join(" → ")}.`);
    return;
  }

  // ==== MENU COMMAND → WIZARD ATAU SUB-MENU ====
  const found = findMenuByCommand(command, userData.menus, userData.menusCustom);
  if (!found) {
    await sendTelegramMessage(chatId, `❌ Menu "${command}" nggak ada.\nKetik /menu_list.`);
    return;
  }

  const hasSubMenu = SUB_MENU_CONFIG[command];
  if (hasSubMenu) {
    await startWizardWithSubMenu(firestore, chatId, command, userData);
    return;
  }

  const hasWizard = WIZARD_CONFIG[command] || (userData.menusCustom && userData.menusCustom[command]);
  if (hasWizard) {
    await startWizard(firestore, chatId, command, userData);
  } else {
    await sendTelegramMessage(chatId, `⚠️ Menu "${command}" belum punya wizard.`);
  }
}

// ========== WIZARD DENGAN SUB-MENU ==========
async function startWizardWithSubMenu(firestore, chatId, command, userData) {
  const config = WIZARD_CONFIG[command];
  if (!config) {
    await sendTelegramMessage(chatId, `⚠️ Menu "${command}" belum punya wizard utama.`);
    return;
  }

  const fields = {};

  if (command === "pekerjaan") {
    const state = {
      menuId: command,
      currentStep: 0,
      fields,
      awaiting: null,
      mode: "submenu",
      subMenuCommand: command,
    };
    await setState(firestore, chatId, state);
    const msg = await sendTelegramWithButtons(chatId, `⏳ Loading...`, []);
    if (msg.ok) {
      state.messageId = msg.result.message_id;
      await setState(firestore, chatId, state);
      await renderStepSubMenu(firestore, chatId, state, userData);
    }
    return;
  }

  const state = {
    menuId: command,
    currentStep: 0,
    fields,
    awaiting: null,
    mode: "submenu",
    subMenuCommand: command,
  };
  await setState(firestore, chatId, state);
  const msg = await sendTelegramWithButtons(chatId, `⏳ Loading...`, []);
  if (msg.ok) {
    state.messageId = msg.result.message_id;
    await setState(firestore, chatId, state);
    await renderStepSubMenu(firestore, chatId, state, userData);
  }
}

// ========== RENDER STEP SUB-MENU ==========
async function renderStepSubMenu(firestore, chatId, state, userData) {
  const command = state.subMenuCommand;
  const fields = state.fields;

  if (command === "pekerjaan" && !fields.ptId) {
    const opts = (userData.pekerjaan || []).map((p) => ({ id: p.id, label: p.nama }));
    if (opts.length === 0) {
      await editTelegramMessage(chatId, state.messageId, `⚠️ Menu <b>Pekerjaan</b> kosong. Buka web dulu.`);
      await clearState(firestore, chatId);
      return;
    }
    const buttons = opts.slice(0, 8).map((o) => [{ text: o.label.slice(0, 30), callback_data: `sub_pick_pt|${o.id}` }]);
    buttons.push([{ text: "❌ Batal", callback_data: "wiz_cancel" }]);
    await editTelegramMessage(chatId, state.messageId, `<b>🏢 Pilih PT:</b>`, buttons);
    return;
  }

  if (!fields.brandId) {
    let opts = [];
    if (command === "pekerjaan") {
      const pt = (userData.pekerjaan || []).find((p) => p.id === fields.ptId);
      opts = (pt?.brands || []).map((b) => ({ id: b.id, label: b.nama }));
    } else {
      opts = (userData.bisnisBrands || []).map((b) => ({ id: b.id, label: b.nama }));
    }
    if (opts.length === 0) {
      await editTelegramMessage(chatId, state.messageId, `⚠️ Brand kosong. Buka web dulu.`);
      await clearState(firestore, chatId);
      return;
    }
    const buttons = opts.slice(0, 8).map((o) => [{ text: o.label.slice(0, 30), callback_data: `sub_pick_brand|${o.id}` }]);
    buttons.push([{ text: "❌ Batal", callback_data: "wiz_cancel" }]);
    await editTelegramMessage(chatId, state.messageId, `<b>🏷️ Pilih Brand:</b>`, buttons);
    return;
  }

  const subMenuList = SUB_MENU_CONFIG[command] || [];
  const buttons = [
    [
      { text: subMenuList[0].label, callback_data: `sub_pick_menu|${subMenuList[0].id}` },
      { text: subMenuList[1].label, callback_data: `sub_pick_menu|${subMenuList[1].id}` },
    ],
    [
      { text: subMenuList[2].label, callback_data: `sub_pick_menu|${subMenuList[2].id}` },
      { text: subMenuList[3].label, callback_data: `sub_pick_menu|${subMenuList[3].id}` },
    ],
    [{ text: "❌ Batal", callback_data: "wiz_cancel" }],
  ];
  await editTelegramMessage(chatId, state.messageId, `<b>📂 Mau isi yang mana?</b>`, buttons);
}

// ========== HANDLE CALLBACK ==========
async function handleCallback(callbackQuery, userData, firestore) {
  const { id: callbackId, message, data } = callbackQuery;
  const chatId = message.chat.id;
  const messageId = message.message_id;
  await answerCallbackQuery(callbackId);

  const parts = data.split("|");
  const action = parts[0];

  // ==== PANDUAN BERTINGKAT (NAV / OPEN / START) ====
  if (action === "nav") {
    const { text, keyboard } = buildHelpView(parts[1] || "root");
    await editTelegramMessage(chatId, messageId, text, keyboard);
    return;
  }

  if (action === "open") {
    const target = parts[1];
    if (target === "reminder") {
      const settings = userData?.reminderSettings || {};
      await editTelegramMessage(
        chatId,
        messageId,
        buildStatusReminderText(settings),
        buildStatusReminderButtons(settings)
      );
    } else if (target === "reminder_proyek") {
      const settings = settingsProyek(userData);
      await editTelegramMessage(
        chatId,
        messageId,
        buildStatusReminderProyekText(settings),
        buildStatusReminderProyekButtons(settings)
      );
    }
    return;
  }

  if (action === "start") {
    const command = parts[1];
    if (!userData) {
      await editTelegramMessage(chatId, messageId, `⚠️ Link akun dulu di web.`);
      return;
    }
    const menu = findMenuByCommand(command, userData.menus, userData.menusCustom);
    if (!menu) {
      await editTelegramMessage(chatId, messageId, `⚠️ Menu "${command}" belum ada.`);
      return;
    }
    await clearState(firestore, chatId);
    if (SUB_MENU_CONFIG[command]) {
      await startWizardWithSubMenu(firestore, chatId, command, userData);
    } else {
      await startWizard(firestore, chatId, command, userData);
    }
    return;
  }

  // ==== SUB-MENU: PILIH PT ====
  if (action === "sub_pick_pt") {
    const ptId = parts[1];
    const state = await getState(firestore, chatId);
    if (!state) return;
    state.fields.ptId = ptId;
    await setState(firestore, chatId, state);
    await renderStepSubMenu(firestore, chatId, state, userData);
    return;
  }

  // ==== SUB-MENU: PILIH BRAND ====
  if (action === "sub_pick_brand") {
    const brandId = parts[1];
    const state = await getState(firestore, chatId);
    if (!state) return;
    state.fields.brandId = brandId;
    await setState(firestore, chatId, state);
    await renderStepSubMenu(firestore, chatId, state, userData);
    return;
  }

  // ==== SUB-MENU: PILIH MENU ====
  if (action === "sub_pick_menu") {
    const subMenuId = parts[1];
    const state = await getState(firestore, chatId);
    if (!state) return;
    const command = state.subMenuCommand;
    const baseFields = { ...state.fields };
    await clearState(firestore, chatId);
    await handleSubMenuPick(firestore, chatId, messageId, userData, command, subMenuId, baseFields);
    return;
  }

  // ==== SYNC NOW ====
  if (action === "syncnow") {
    await editTelegramMessage(chatId, messageId, "📊 Sync dijalankan...");
    try {
      // Panggil langsung logika yang sama dengan web (tanpa HTTP internal),
      // jadi hasil Sheets dari bot & web selalu identik.
      const { results } = await syncUserToSheets(userData);
      const gagal = results.filter((r) => r.status === "error");
      await editTelegramMessage(
        chatId,
        messageId,
        gagal.length === 0
          ? "✅ Sync selesai. Buka spreadsheet untuk lihat hasilnya."
          : `⚠️ Sync selesai, ${gagal.length} bagian gagal: ${gagal.map((g) => g.sheet).join(", ")}`
      );
    } catch (e) {
      console.error(e);
      await editTelegramMessage(chatId, messageId, `❌ Sync gagal: ${e.message}`);
    }
    return;
  }

  // ==== REMINDER CALLBACK (PRIBADI) ====
  if (action.startsWith("rem_")) {
    const { action: remAction, menuId } = parseReminderCallback(data);

    if (remAction === "rem_toggle" && menuId) {
      const settings = userData.reminderSettings || {};
      const settingKey = getReminderConfig(menuId)?.id || menuId;
      const current = settings[settingKey]?.enabled ?? true;
      const newSettings = {
        ...settings,
        [settingKey]: { ...(settings[settingKey] || {}), enabled: !current },
      };
      await firestore.collection("users").doc(userData._uid).set(
        { reminderSettings: newSettings },
        { merge: true }
      );
      const text = buildStatusReminderText(newSettings);
      const buttons = buildStatusReminderButtons(newSettings);
      await editTelegramMessage(chatId, messageId, text, buttons);
      return;
    }

    if (remAction === "rem_pause_all") {
      const settings = userData.reminderSettings || {};
      const newSettings = { ...settings };
      Object.keys(REMINDER_CONFIG).forEach((mid) => {
        newSettings[mid] = { ...(newSettings[mid] || {}), enabled: false };
      });
      await firestore.collection("users").doc(userData._uid).set(
        { reminderSettings: newSettings },
        { merge: true }
      );
      const text = buildStatusReminderText(newSettings);
      const buttons = buildStatusReminderButtons(newSettings);
      await editTelegramMessage(chatId, messageId, text, buttons);
      return;
    }

    if (remAction === "rem_resume_all") {
      const settings = userData.reminderSettings || {};
      const newSettings = { ...settings };
      Object.keys(REMINDER_CONFIG).forEach((mid) => {
        newSettings[mid] = { ...(newSettings[mid] || {}), enabled: true };
      });
      await firestore.collection("users").doc(userData._uid).set(
        { reminderSettings: newSettings },
        { merge: true }
      );
      const text = buildStatusReminderText(newSettings);
      const buttons = buildStatusReminderButtons(newSettings);
      await editTelegramMessage(chatId, messageId, text, buttons);
      return;
    }

    // Tombol lama pakai ID config (blender), tombol baru pakai ID jadwal
    // (blender_solidworks). Resolve dua-duanya ke key yang sama.
    const remInfo = getReminderConfig(menuId);
    const reminderKey = remInfo?.id || menuId;
    const scheduleKey = remInfo?.config?.scheduleId || menuId;
    const reminderLabel = remInfo?.config?.label || menuId;
    const reminderIds = [...new Set([reminderKey, scheduleKey])];

    if (remAction === "rem_mulai" && menuId) {
      const todayLocal = todayStr();
      const progressHariIni = (userData.dailyProgress || {})[todayLocal] || {};
      await firestore.collection("users").doc(userData._uid).set(
        {
          dailyProgress: {
            ...(userData.dailyProgress || {}),
            [todayLocal]: {
              ...progressHariIni,
              // Web baca progress pakai ID jadwal.
              [scheduleKey]: {
                ...(progressHariIni[scheduleKey] || {}),
                mulai: true,
                mulaiAt: new Date().toISOString(),
                override: true,
              },
            },
          },
          reminderLog: {
            ...(userData.reminderLog || {}),
            [todayLocal]: {
              ...((userData.reminderLog || {})[todayLocal] || {}),
              ...Object.fromEntries(reminderIds.map((id) => [id, { 1: true, 2: true, 3: true, 4: true }])),
            },
          },
        },
        { merge: true }
      );
      await editTelegramMessage(
        chatId,
        messageId,
        `✅ <b>Mantap!</b>\n\nLo udah mulai <b>${reminderLabel}</b>.\n\n📝 Jangan lupa isi log-nya di web ya.\n\n<i>Reminder buat aktivitas ini dimatiin.</i>`
      );
      return;
    }

    if (remAction === "rem_belum" && menuId) {
      await editTelegramMessage(
        chatId,
        messageId,
        `🚫 <b>Oke, dicatat.</b>\n\nReminder buat <b>${reminderLabel}</b> bakal dikirim lagi nanti.\n\n<i>Semangat, bos!</i>`
      );
      return;
    }

    if (remAction === "rem_isi" && menuId) {
      await editTelegramMessage(
        chatId,
        messageId,
        `✅ <b>Oke!</b>\n\nLo mau isi <b>${reminderLabel}</b> sekarang.\n\n📝 Silakan buka web: <b>self-management-app</b>\n\n<i>Reminder dimatiin.</i>`
      );
      const todayLocal = todayStr();
      await firestore.collection("users").doc(userData._uid).set(
        {
          reminderLog: {
            ...(userData.reminderLog || {}),
            [todayLocal]: {
              ...((userData.reminderLog || {})[todayLocal] || {}),
              ...Object.fromEntries(reminderIds.map((id) => [id, { 1: true, 2: true, 3: true, 4: true }])),
            },
          },
        },
        { merge: true }
      );
      return;
    }

    if (remAction === "rem_skip" && menuId) {
      const todayLocal = todayStr();
      await firestore.collection("users").doc(userData._uid).set(
        {
          reminderLog: {
            ...(userData.reminderLog || {}),
            [todayLocal]: {
              ...((userData.reminderLog || {})[todayLocal] || {}),
              ...Object.fromEntries(reminderIds.map((id) => [id, { 1: true, 2: true, 3: true, 4: true }])),
            },
          },
        },
        { merge: true }
      );
      await editTelegramMessage(
        chatId,
        messageId,
        `🚫 <b>Oke, skip hari ini.</b>\n\nReminder buat <b>${reminderLabel}</b> dimatiin sampai besok.\n\n<i>Jangan lupa besok ya, bos!</i>`
      );
      return;
    }

    return;
  }

  // ==== REMINDER PROYEK CALLBACK ====
  if (action.startsWith("proyek_")) {
    if (action === "proyek_toggle_deadline") {
      const settings = settingsProyek(userData);
      const newSettings = { ...settings, deadlineH7: settings.deadlineH7 === false, deadlineH3: settings.deadlineH7 === false, deadlineH1: settings.deadlineH7 === false, deadlineLewat: settings.deadlineH7 === false };
      await firestore.collection("users").doc(userData._uid).set({ reminderProyekSettings: newSettings }, { merge: true });
      await editTelegramMessage(chatId, messageId, buildStatusReminderProyekText(newSettings), buildStatusReminderProyekButtons(newSettings));
      return;
    }

    if (action === "proyek_toggle_vendor") {
      const settings = settingsProyek(userData);
      const newSettings = { ...settings, vendorFollowUp: settings.vendorFollowUp === false };
      await firestore.collection("users").doc(userData._uid).set({ reminderProyekSettings: newSettings }, { merge: true });
      await editTelegramMessage(chatId, messageId, buildStatusReminderProyekText(newSettings), buildStatusReminderProyekButtons(newSettings));
      return;
    }

    if (action === "proyek_pause_all") {
      const settings = settingsProyek(userData);
      const newSettings = { ...settings, enabled: false };
      await firestore.collection("users").doc(userData._uid).set({ reminderProyekSettings: newSettings }, { merge: true });
      await editTelegramMessage(chatId, messageId, buildStatusReminderProyekText(newSettings), buildStatusReminderProyekButtons(newSettings));
      return;
    }

    if (action === "proyek_resume_all") {
      const settings = settingsProyek(userData);
      const newSettings = { ...settings, enabled: true };
      await firestore.collection("users").doc(userData._uid).set({ reminderProyekSettings: newSettings }, { merge: true });
      await editTelegramMessage(chatId, messageId, buildStatusReminderProyekText(newSettings), buildStatusReminderProyekButtons(newSettings));
      return;
    }

    if (action === "proyek_selesai") {
      const tipeData = parts[1];
      const kegId = parts[2];
      const isPekerjaan = tipeData === "pekerjaan_deadline";
      let updated = false;

      if (isPekerjaan) {
        const pekerjaan = userData.pekerjaan || [];
        for (let p of pekerjaan) {
          for (let b of p.brands || []) {
            const kegIdx = (b.kegiatan || []).findIndex((k) => k.id === kegId);
            if (kegIdx !== -1) {
              b.kegiatan[kegIdx].status = "selesai";
              b.kegiatan[kegIdx].updatedAt = new Date().toISOString();
              updated = true;
              break;
            }
          }
          if (updated) break;
        }
        if (updated) await firestore.collection("users").doc(userData._uid).set({ pekerjaan }, { merge: true });
      } else {
        const brands = userData.bisnisBrands || [];
        for (let b of brands) {
          const kegIdx = (b.kegiatan || []).findIndex((k) => k.id === kegId);
          if (kegIdx !== -1) {
            b.kegiatan[kegIdx].status = "selesai";
            b.kegiatan[kegIdx].updatedAt = new Date().toISOString();
            updated = true;
            break;
          }
        }
        if (updated) await firestore.collection("users").doc(userData._uid).set({ bisnisBrands: brands }, { merge: true });
      }

      if (updated) {
        const reminderId = isPekerjaan ? `pekerjaan_${kegId}` : `bisnis_${kegId}`;
        const snooze = { ...(userData.reminderProyekSnooze || {}) };
        delete snooze[reminderId];
        await firestore.collection("users").doc(userData._uid).set(
          { reminderProyekSnooze: snooze },
          { merge: true }
        );
        await editTelegramMessage(chatId, messageId, `✅ <b>Mantap!</b>\n\nKegiatan berhasil ditandai <b>Selesai</b>.`);
      } else {
        await editTelegramMessage(chatId, messageId, `⚠️ Gagal update, kegiatan nggak ketemu.`);
      }
      return;
    }

    if (action === "proyek_tunda") {
      const tipeData = parts[1];
      const idData = parts[2];
      const reminderId = tipeData === "pekerjaan_deadline" ? `pekerjaan_${idData}` : `bisnis_${idData}`;
      await firestore.collection("users").doc(userData._uid).set(
        { reminderProyekSnooze: simpanSnoozeProyek(userData, reminderId, 1) },
        { merge: true }
      );
      await editTelegramMessage(chatId, messageId, `⏳ Oke, reminder buat kegiatan ini ditunda 1 hari.`);
      return;
    }

    if (action === "proyek_vendor_followup") {
      await editTelegramMessage(chatId, messageId, `📞 <b>Siap Follow Up!</b>\n\nSilakan buka web di menu Pekerjaan/Bisnis untuk isi log kunjungan vendor.`);
      return;
    }

    if (action === "proyek_vendor_tunda") {
      const tipeData = parts[1];
      const vendorId = parts[2];
      const reminderId = tipeData === "vendor_followup" ? `vendor_${vendorId}` : `vendor_bisnis_${vendorId}`;
      await firestore.collection("users").doc(userData._uid).set(
        { reminderProyekSnooze: simpanSnoozeProyek(userData, reminderId, 7) },
        { merge: true }
      );
      await editTelegramMessage(chatId, messageId, `⏳ Oke, reminder vendor ini ditunda 1 minggu.`);
      return;
    }

    if (action === "proyek_vendor_belum") {
      const tipeData = parts[1];
      const vendorId = parts[2];
      const isPekerjaan = tipeData === "vendor_followup";
      let updated = false;

      if (isPekerjaan) {
        const pekerjaan = userData.pekerjaan || [];
        for (let p of pekerjaan) {
          for (let b of p.brands || []) {
            const vIdx = (b.vendorList || []).findIndex((v) => v.id === vendorId);
            if (vIdx !== -1) {
              b.vendorList[vIdx].status = "belum_digunakan";
              updated = true;
              break;
            }
          }
          if (updated) break;
        }
        if (updated) await firestore.collection("users").doc(userData._uid).set({ pekerjaan }, { merge: true });
      } else {
        const brands = userData.bisnisBrands || [];
        for (let b of brands) {
          const vIdx = (b.vendorList || []).findIndex((v) => v.id === vendorId);
          if (vIdx !== -1) {
            b.vendorList[vIdx].status = "belum_digunakan";
            updated = true;
            break;
          }
        }
        if (updated) await firestore.collection("users").doc(userData._uid).set({ bisnisBrands: brands }, { merge: true });
      }

      if (updated) {
        const reminderId = isPekerjaan ? `vendor_${vendorId}` : `vendor_bisnis_${vendorId}`;
        const snooze = { ...(userData.reminderProyekSnooze || {}) };
        delete snooze[reminderId];
        await firestore.collection("users").doc(userData._uid).set(
          { reminderProyekSnooze: snooze },
          { merge: true }
        );
      }

      await editTelegramMessage(chatId, messageId, `🚫 Oke, vendor ini ditandai <b>Belum Digunakan</b>.\n\nDatanya tetap aman, cuma reminder-nya yang mati.`);
      return;
    }

    return;
  }

  // ==== VENDOR CALLBACK ====
  if (action.startsWith("vend_")) {
    const state = await getState(firestore, chatId);
    if (!state) {
      await editTelegramMessage(chatId, messageId, "⚠️ Wizard udah selesai / expired.");
      return;
    }
    state.messageId = messageId;
    await setState(firestore, chatId, state);
    await handleVendorCallback(firestore, chatId, data, state, userData, messageId);
    return;
  }

  // ==== WIZARD CALLBACK BIASA ====
  if (action.startsWith("wiz_")) {
    const state = await getState(firestore, chatId);
    if (!state) {
      await editTelegramMessage
      (chatId, messageId, "⚠️ Wizard udah selesai / expired.");
      return;
    }
    state.messageId = messageId;
    await setState(firestore, chatId, state);
    await handleWizardCallback(firestore, chatId, data, state, userData, messageId);
    return;
  }
}

// ========== MAIN HANDLER ==========
export async function POST(req) {
  if (!verifyTelegramWebhook(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const update = await req.json();
    const message = update.message || update.callback_query?.message;
    if (!message) return NextResponse.json({ ok: true });

    const chatId = message.chat.id;
    const fromData = message.from || message.chat;

    const admin = getAdminApp();
    const firestore = getFirestore(admin);

    const user = await resolveUser(firestore, chatId);
    const userData = user ? { ...user.data, _uid: user.uid } : null;

    if (update.callback_query) {
      if (!userData) { await sendTelegramMessage(chatId, `⚠️ Belum di-link.`); return NextResponse.json({ ok: true }); }
      await handleCallback(update.callback_query, userData, firestore);
      return NextResponse.json({ ok: true });
    }

    if (update.message && update.message.text) {
      await handleTextMessage(firestore, chatId, update.message.text, userData, update.message.message_id, fromData);
      return NextResponse.json({ ok: true });
    }

    // ==== HANDLE VOICE NOTE (VN) ====
    if (update.message && update.message.voice) {
      if (!userData) {
        await sendTelegramMessage(chatId, `⚠️ Belum di-link. Buka web → Telegram → Generate Pairing Code.`);
        return NextResponse.json({ ok: true });
      }

      const voice = update.message.voice;
      const fileId = voice.file_id;
      const duration = voice.duration || 0;

      const state = await getState(firestore, chatId);

      if (state && state.menuId === "hafalan") {
        const suratId = state.fields?.suratId;
        const juzId = state.fields?.juzId;

        if (!suratId || !juzId) {
          await sendTelegramMessage(chatId, `⚠️ Pilih surat dulu. Ketik /hafalan.`);
          return NextResponse.json({ ok: true });
        }

        const todayLocal = today();
        const voiceNote = {
          id: `vn_${Date.now()}`,
          fileId,
          duration,
          tanggal: todayLocal,
          suratId,
          juzId,
          createdAt: new Date().toISOString(),
        };

        const current = userData.hafalanVoiceNotes || {};
        const suratList = current[suratId] || [];
        const updated = {
          ...current,
          [suratId]: [...suratList, voiceNote],
        };

        await firestore.collection("users").doc(userData._uid).set(
          { hafalanVoiceNotes: updated },
          { merge: true }
        );

        await sendTelegramMessage(
          chatId,
          `✅ <b>Voice Note tersimpan!</b>\n\n📖 Surat: <b>${suratId}</b>\n⏱️ Durasi: ${duration} detik\n📅 ${todayLocal}\n\n<i>Buka web → Hafalan → ${suratId} → Rekaman Hafalan</i>`
        );
        return NextResponse.json({ ok: true });
      } else {
        await sendTelegramMessage(
          chatId,
          `⚠️ <b>Kirim VN lewat menu /hafalan dulu ya.</b>\n\n1. Ketik /hafalan\n2. Pilih Juz & Surat\n3. Baru kirim VN\n\n<i>Atau kalo mau simpen VN ke surat tertentu tanpa wizard, kirim format:</i>\n<code>/vn suratId</code>\n\nContoh: <code>/vn 1_alfatihah</code>`
        );
        return NextResponse.json({ ok: true });
      }
    }

    await sendTelegramMessage(chatId, "🤖 Format nggak didukung.");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[telegram] Error:", err);
    return NextResponse.json({ ok: true, error: err.message });
  }
}

export async function GET() {
  return NextResponse.json({ status: "Telegram webhook aktif." });
}