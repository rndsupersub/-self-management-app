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
  buildHelpText,
  buildMenuListText,
} from "@/lib/telegramData";
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
} from "@/lib/telegramWizard";

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
  const codeSnap = await codeRef.get();
  if (!codeSnap.exists) {
    await sendTelegramMessage(chatId, `❌ Kode <b>${codeUpper}</b> nggak valid atau udah kepake.`);
    return;
  }
  const uid = codeSnap.data().uid;
  await firestore.collection("users").doc(uid).update({
    telegramChatId: Number(chatId),
    telegramUsername: fromData?.username || "",
    telegramFirstName: fromData?.first_name || "",
    telegramLinkedAt: new Date().toISOString(),
  });
  await codeRef.delete();
  await sendTelegramMessage(chatId, `<b>✅ Berhasil di-link!</b>\n\nUID: <code>${uid}</code>\n\nKirim /help buat panduan.`);
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
    if (step.type === "optional-text" || step.type === "optional-number") {
      buttons.push([{ text: "⏭️ Skip", callback_data: "wiz_skip" }]);
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
    else if (opt === "besok") {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      state.fields[step.key] = d.toISOString().split("T")[0];
    } else if (opt === "kemarin") {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      state.fields[step.key] = d.toISOString().split("T")[0];
    }
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
        `<b>✅ Tersimpan!</b>\n\nMenu: <b>${config.label}</b>\n\n📊 Auto-sync ke Sheets.`,
        [[{ text: "📊 Sync Now", callback_data: `syncnow|${userData._uid}` }]]
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
      kategori: f.kategoriId || "analisis",
      prioritas: f.prioritasId || "utama",
      sumber: f.sumberId || "bos",
      catatan: f.catatan || "",
      gdriveUrl: f.gdriveUrl || "",
      tanggalMulai: f.tanggalMulai || todayStr,
      tanggalSelesai: f.tanggalSelesai || f.tanggalMulai || todayStr,
      tanggal: f.tanggalMulai || todayStr,
      status: "belum",
      sections: { analisis: [], desain: [], vendor: [], lainnya: [] },
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
    if (!brand.laporanData) brand.laporanData = { harian: {}, mingguan: {}, bulanan: {} };

    if (f.periode === "harian") {
      if (!brand.laporanData.harian) brand.laporanData.harian = {};
      brand.laporanData.harian[f.tanggal] = {
        id: `lap_${Date.now()}`,
        tanggal: f.tanggal,
        konten: f.konten || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } else if (f.periode === "mingguan") {
      if (!brand.laporanData.mingguan) brand.laporanData.mingguan = {};
      brand.laporanData.mingguan[f.tanggal] = {
        id: `lap_${Date.now()}`,
        tanggalMulai: f.tanggal,
        tanggalSelesai: f.tanggal,
        mingguKe: 1,
        konten: f.konten || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } else if (f.periode === "bulanan") {
      if (!brand.laporanData.bulanan) brand.laporanData.bulanan = {};
      const key = f.tanggal.substring(0, 7);
      brand.laporanData.bulanan[key] = {
        id: `lap_${Date.now()}`,
        tahun: parseInt(f.tanggal.substring(0, 4)),
        bulan: parseInt(f.tanggal.substring(5, 7)),
        namaBulan: new Date(f.tanggal).toLocaleDateString("id-ID", { month: "long" }),
        konten: f.konten || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
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
    if (!brand.evaluasiData) brand.evaluasiData = {};

    const periodeKey = f.tanggal.substring(0, 7);
    if (!brand.evaluasiData[f.periode]) brand.evaluasiData[f.periode] = {};
    brand.evaluasiData[f.periode][periodeKey] = {
      periodeMulai: f.tanggal,
      periodeSelesai: f.tanggal,
      label: f.periode,
      tipe: f.periode,
      fields: {
        efektivitas: f.efektivitas || "",
        efisiensi: f.efisiensi || "",
        kendala: f.kendala || "",
        solusi: f.solusi || "",
        energi: parseInt(f.energi) || 5,
        mood: f.mood || "",
        catatanBebas: f.catatanBebas || "",
      },
      updatedAt: new Date().toISOString(),
    };
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
      kategori: f.kategoriId || "analisis",
      prioritas: f.prioritasId || "utama",
      sumber: f.sumberId || "gua",
      catatan: f.catatan || "",
      gdriveUrl: f.gdriveUrl || "",
      tanggal: f.tanggal || todayStr,
      tanggalMulai: f.tanggal || todayStr,
      tanggalSelesai: f.tanggal || todayStr,
      status: "belum",
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
    if (!brand.laporanData) brand.laporanData = { harian: {}, mingguan: {}, bulanan: {} };

    if (f.periode === "harian") {
      if (!brand.laporanData.harian) brand.laporanData.harian = {};
      brand.laporanData.harian[f.tanggal] = {
        id: `lap_${Date.now()}`,
        tanggal: f.tanggal,
        konten: f.konten || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } else if (f.periode === "mingguan") {
      if (!brand.laporanData.mingguan) brand.laporanData.mingguan = {};
      brand.laporanData.mingguan[f.tanggal] = {
        id: `lap_${Date.now()}`,
        tanggalMulai: f.tanggal,
        tanggalSelesai: f.tanggal,
        mingguKe: 1,
        konten: f.konten || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } else if (f.periode === "bulanan") {
      if (!brand.laporanData.bulanan) brand.laporanData.bulanan = {};
      const key = f.tanggal.substring(0, 7);
      brand.laporanData.bulanan[key] = {
        id: `lap_${Date.now()}`,
        tahun: parseInt(f.tanggal.substring(0, 4)),
        bulan: parseInt(f.tanggal.substring(5, 7)),
        namaBulan: new Date(f.tanggal).toLocaleDateString("id-ID", { month: "long" }),
        konten: f.konten || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    await userRef.update({ bisnisBrands: brands });
    return;
  }

  // BISNIS → EVALUASI
  if (menuId === "bisnis_evaluasi") {
    const brands = userData.bisnisBrands || [];
    const bIdx = brands.findIndex((b) => b.id === f.brandId);
    if (bIdx === -1) throw new Error("Brand nggak ketemu");
    const brand = brands[bIdx];
    if (!brand.evaluasiData) brand.evaluasiData = {};

    const periodeKey = f.tanggal.substring(0, 7);
    if (!brand.evaluasiData[f.periode]) brand.evaluasiData[f.periode] = {};
    brand.evaluasiData[f.periode][periodeKey] = {
      periodeMulai: f.tanggal,
      periodeSelesai: f.tanggal,
      label: f.periode,
      tipe: f.periode,
      fields: {
        efektivitas: f.efektivitas || "",
        efisiensi: f.efisiensi || "",
        kendala: f.kendala || "",
        solusi: f.solusi || "",
        energi: parseInt(f.energi) || 5,
        mood: f.mood || "",
        catatanBebas: f.catatanBebas || "",
      },
      updatedAt: new Date().toISOString(),
    };
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
    current[f.jenis] = f.jumlah || "";
    if (f.catatan) current.catatan = f.catatan;
    current.updatedAt = new Date().toISOString();
    olahraga.harian[todayStr] = current;
    await userRef.update({ olahraga });
    return;
  }

  // KEUANGAN
  if (menuId === "keuangan") {
    const transaksi = userData.keuanganTransaksi || {};
    if (!transaksi[todayStr]) transaksi[todayStr] = [];
    transaksi[todayStr].push({
      id: `trx_${Date.now()}`,
      jenis: f.jenis,
      nominal: f.nominal,
      kategoriId: f.kategoriId || "",
      walletId: f.walletId || "",
      catatan: f.catatan || "",
      updatedAt: new Date().toISOString(),
    });
    await userRef.update({ keuanganTransaksi: transaksi });
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
    buku.progressHarian[todayStr] = {
      halamanMulai: f.halamanMulai,
      halamanSelesai: f.halamanSelesai,
      catatan: f.catatan || "",
      updatedAt: new Date().toISOString(),
    };
    if (!buku.halamanSelesai) buku.halamanSelesai = [];
    for (let i = f.halamanMulai; i <= f.halamanSelesai; i++) {
      if (!buku.halamanSelesai.includes(i)) buku.halamanSelesai.push(i);
    }
    await userRef.update({ bedahBuku });
    return;
  }

  // MENU CUSTOM
  if (userData.menusCustom && userData.menusCustom[menuId]) {
    const logs = userData.menusCustomLogHarian || {};
    if (!logs[todayStr]) logs[todayStr] = {};
    logs[todayStr][menuId] = {
      catatan: f.catatan || "",
      gdriveUrl: f.gdriveUrl || "",
      updatedAt: new Date().toISOString(),
    };
    await userRef.update({ menusCustomLogHarian: logs });
    return;
  }

  throw new Error(`Menu "${menuId}" belum didukung.`);
}

// ==========================================================
// ========== WIZARD VENDOR (DINAMIS + CRUD PERTANYAAN) ==========
// ==========================================================
// Struktur state phase-based:
//   phase "fields"           → render field vendor (getVendorFieldsSteps)
//   phase "questions"        → loop pertanyaan awal
//   phase "manage_questions" → tombol [➕ Tambah][✏️ Edit][🗑️ Hapus][✅ Lanjut]
//   phase "add_question_text"   → input pertanyaan baru
//   phase "add_question_type"   → pilih tipe pertanyaan baru
//   phase "edit_question_pick"  → pilih nomor pertanyaan yang diedit
//   phase "edit_question_text"  → input pertanyaan baru (edit)
//   phase "edit_question_type"  → pilih tipe baru (edit)
//   phase "delete_question_pick" → pilih nomor pertanyaan yang dihapus
//   phase "summary"          → ringkasan + simpan

const VENDOR_MENUS = ["pekerjaan_vendor", "bisnis_vendor"];

// ========== MULAI WIZARD VENDOR ==========
async function startVendorWizard(firestore, chatId, menuId, userData, extraFields = {}) {
  // Ambil snapshot pertanyaan dari userData (kalau kosong, pakai default kosong)
  let questions = userData.vendorPertanyaanList || [];

  const fields = { ...extraFields };
  const config = { steps: getVendorFieldsSteps(menuId) };
  config.steps.forEach((s) => {
    if (s.default !== undefined && fields[s.key] === undefined) {
      if (s.default === "today") fields[s.key] = today();
      else fields[s.key] = s.default;
    }
  });

  // Skip step yang udah diisi dari extraFields
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

// ========== RENDER VENDOR STEP ==========
async function renderVendorStep(firestore, chatId, state, userData) {
  const config = { label: state.menuId === "pekerjaan_vendor" ? "💼 Pekerjaan → 🏪 Vendor" : "💼 Bisnis → 🏪 Vendor", steps: getVendorFieldsSteps(state.menuId) };
  const steps = config.steps;

  // ==== PHASE: FIELDS ====
  if (state.phase === "fields") {
    const stepIdx = state.currentStep;
    if (stepIdx >= steps.length) {
      // Pindah ke phase "questions"
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

  // ==== PHASE: QUESTIONS ====
  if (state.phase === "questions") {
    const qIdx = state.currentQuestionIdx;
    const questions = state.questions || [];

    if (qIdx >= questions.length) {
      // Semua pertanyaan udah dijawab → masuk manage_questions
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

    // Kalau checkbox, awaiting = null (user klik tombol).
    // Kalau short/long, awaiting = q.id
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

  // ==== PHASE: MANAGE_QUESTIONS ====
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

  // ==== PHASE: ADD_QUESTION_TEXT ====
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

  // ==== PHASE: ADD_QUESTION_TYPE ====
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

  // ==== PHASE: EDIT_QUESTION_PICK ====
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

  // ==== PHASE: EDIT_QUESTION_TEXT ====
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

  // ==== PHASE: EDIT_QUESTION_TYPE ====
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

  // ==== PHASE: DELETE_QUESTION_PICK ====
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

  // ==== PHASE: SUMMARY ====
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

// ========== HANDLE VENDOR TEXT INPUT ==========
async function handleVendorTextInput(firestore, chatId, text, state, userData) {
  const awaiting = state.awaiting;

  // ==== Field Vendor (phase: fields) ====
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

  // ==== Jawaban pertanyaan tipe short/long (phase: questions) ====
  if (state.phase === "questions" && awaiting) {
    const qId = awaiting;
    state.answers[qId] = text === "-" ? "" : text;
    state.currentQuestionIdx++;
    state.awaiting = null;
    await setState(firestore, chatId, state);
    await renderVendorStep(firestore, chatId, state, userData);
    return;
  }

  // ==== Input pertanyaan baru (add_question_text) ====
  if (state.phase === "add_question_text" && awaiting === "new_question_text") {
    state.newQuestionTemp = { pertanyaan: text.trim() };
    state.phase = "add_question_type";
    state.awaiting = null;
    await setState(firestore, chatId, state);
    await renderVendorStep(firestore, chatId, state, userData);
    return;
  }

  // ==== Input edit pertanyaan (edit_question_text) ====
  if (state.phase === "edit_question_text" && awaiting === "edit_question_text") {
    state.newQuestionTemp.pertanyaan = text.trim();
    state.phase = "edit_question_type";
    state.awaiting = null;
    await setState(firestore, chatId, state);
    await renderVendorStep(firestore, chatId, state, userData);
    return;
  }

  // Fallback
  await sendTelegramMessage(chatId, `⚠️ Input nggak dikenali. Klik tombol yang tersedia.`);
}

// ========== HANDLE VENDOR CALLBACK ==========
async function handleVendorCallback(firestore, chatId, data, state, userData, messageId) {
  const parts = data.split("|");
  const action = parts[0];

  // ==== CANCEL ====
  if (action === "vend_cancel") {
    await clearState(firestore, chatId);
    await editTelegramMessage(chatId, messageId, "❌ Dibatalkan.");
    return;
  }

  // ==== BACK (di phase fields) ====
  if (action === "vend_back") {
    if (state.phase === "fields") {
      state.currentStep = Math.max(0, state.currentStep - 1);
      state.awaiting = null;
      await setState(firestore, chatId, state);
      await renderVendorStep(firestore, chatId, state, userData);
    }
    return;
  }

  // ==== BACK (dari summary ke manage_questions) ====
  if (action === "vend_back_summary") {
    state.phase = "manage_questions";
    state.awaiting = null;
    await setState(firestore, chatId, state);
    await renderVendorStep(firestore, chatId, state, userData);
    return;
  }

  // ==== SKIP (di phase fields) ====
  if (action === "vend_skip") {
    if (state.phase === "fields") {
      state.currentStep++;
      state.awaiting = null;
      await setState(firestore, chatId, state);
      await renderVendorStep(firestore, chatId, state, userData);
    }
    return;
  }

  // ==== PICK (pilih choice di phase fields) ====
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

  // ==== JAWAB pertanyaan checkbox (phase questions) ====
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

  // ==== MANAGE QUESTIONS: TAMBAH ====
  if (action === "vend_q_add") {
    state.phase = "add_question_text";
    state.newQuestionTemp = {};
    state.awaiting = "new_question_text";
    state.awaitingType = "text";
    await setState(firestore, chatId, state);
    await renderVendorStep(firestore, chatId, state, userData);
    return;
  }

  // ==== MANAGE QUESTIONS: EDIT ====
  if (action === "vend_q_edit") {
    state.phase = "edit_question_pick";
    await setState(firestore, chatId, state);
    await renderVendorStep(firestore, chatId, state, userData);
    return;
  }

  // ==== MANAGE QUESTIONS: HAPUS ====
  if (action === "vend_q_del") {
    state.phase = "delete_question_pick";
    await setState(firestore, chatId, state);
    await renderVendorStep(firestore, chatId, state, userData);
    return;
  }

  // ==== MANAGE QUESTIONS: LANJUT ====
  if (action === "vend_q_done") {
    state.phase = "summary";
    state.awaiting = null;
    await setState(firestore, chatId, state);
    await renderVendorStep(firestore, chatId, state, userData);
    return;
  }

  // ==== PILIH TIPE PERTANYAAN BARU/EDIT ====
  if (action === "vend_qtype") {
    const tipe = parts[1];
    // Edit atau tambah?
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

  // ==== EDIT: PILIH NOMOR ====
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

  // ==== DELETE: PILIH NOMOR ====
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

  // ==== SAVE VENDOR ====
  if (action === "vend_save") {
    try {
      await saveVendorWizard(firestore, userData, state);
      await clearState(firestore, chatId);
      const config = { label: state.menuId === "pekerjaan_vendor" ? "💼 Pekerjaan → 🏪 Vendor" : "💼 Bisnis → 🏪 Vendor" };
      await editTelegramMessage(
        chatId,
        messageId,
        `<b>✅ Tersimpan!</b>\n\nMenu: <b>${config.label}</b>\n\n📊 Auto-sync ke Sheets.`,
        [[{ text: "📊 Sync Now", callback_data: `syncnow|${userData._uid}` }]]
      );
    } catch (err) {
      console.error("[vendor save] Error:", err);
      await sendTelegramMessage(chatId, `❌ Gagal simpen: ${err.message}`);
    }
    return;
  }
}

// ========== SAVE VENDOR WIZARD ==========
async function saveVendorWizard(firestore, userData, state) {
  const menuId = state.menuId;
  const f = state.fields;
  const questions = state.questions || [];
  const answers = state.answers || {};
  const userRef = firestore.collection("users").doc(userData._uid);

  // Bangun list jawaban
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

  // Simpan ke pekerjaan atau bisnis
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

  // Update vendorPertanyaanList (kalau ada perubahan struktur)
  // Hanya update kalau pertanyaan beda dari userData
  const oldQs = userData.vendorPertanyaanList || [];
  const oldIds = oldQs.map((q) => q.id).sort().join(",");
  const newIds = questions.map((q) => q.id).sort().join(",");
  const oldText = oldQs.map((q) => `${q.id}:${q.pertanyaan}:${q.tipe}`).join("|");
  const newText = questions.map((q) => `${q.id}:${q.pertanyaan}:${q.tipe}`).join("|");

  if (oldIds !== newIds || oldText !== newText) {
    await userRef.update({ vendorPertanyaanList: questions });
  }
}

// ========== HANDLE SUB-MENU PICK ==========
async function handleSubMenuPick(firestore, chatId, messageId, userData, command, subMenuId, baseFields) {
  // Kalau vendor → pakai vendor wizard dinamis
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

  // Kalau sub-menu lain → pakai wizard biasa
  const wizardKey = `${command}_${subMenuId}`;
  const config = WIZARD_CONFIG[wizardKey];
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
    // Vendor wizard
    if (state.awaiting && !text.startsWith("/")) {
      await handleVendorTextInput(firestore, chatId, text, state, userData);
      return;
    }
    if (!state.awaiting && !text.startsWith("/")) {
      await sendTelegramMessage(chatId, `⚠️ Klik tombol yang tersedia.`);
      return;
    }
  }

  if (state && !state.phase && state.awaiting && !text.startsWith("/")) {
    if (state.awaiting === "date_manual") {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(text.trim())) {
        await sendTelegramMessage(chatId, `⚠️ Format salah. Ketik <code>YYYY-MM-DD</code> (contoh: 2026-10-05):`);
        return;
      }
      state.fields[state.awaitingKey] = text.trim();
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
  const { command, payload, catatan } = parsed;

  if (command === "start") {
    await sendTelegramMessage(chatId, `👋 Halo <b>${fromData?.first_name || "Sobat"}</b>!\n\nKirim /help buat panduan.`);
    return;
  }
  if (command === "link") {
    if (!payload) { await sendTelegramMessage(chatId, `⚠️ Format: <code>/link KODE</code>`); return; }
    await handleLink(firestore, chatId, payload, fromData);
    return;
  }
  if (command === "help") {
    await sendTelegramMessage(chatId, buildHelpText());
    return;
  }
  if (!userData) {
    await sendTelegramMessage(chatId, `⚠️ Belum di-link.\nBuka web → 🤖 Telegram → Generate Pairing Code → <code>/link KODE</code>.`);
    return;
  }
  if (command === "menu_list") {
    await sendTelegramMessage(chatId, buildMenuListText(userData.menus || [], userData.menusCustom || {}));
    return;
  }
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
    const todayStr = today();
    const progress = userData.dailyProgress?.[todayStr] || {};
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

  // ==== KARYA ====
  if (command === "karya") {
    if (!payload) { await sendTelegramMessage(chatId, `⚠️ Format: <code>/karya [tool] | [link] | [catatan]</code>`); return; }
    const parts = payload.split("|").map((p) => p.trim());
    const toolName = parts[0];
    const linkTiktok = catatan || "";
    const catatanKarya = parts[1] || "";

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
    found.karyaMingguan.push({
      id: `kw_${Date.now()}`,
      tanggal: today(),
      linkTiktok,
      catatan: catatanKarya,
    });
    await userRef.update({ belajar: { kategori } });
    await sendTelegramMessage(chatId, `✅ Karya mingguan ditambah ke ${result.labels.join(" → ")}.`);
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

  // Bisnis: langsung brandId
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
    await editTelegramMessage(chatId, messageId, "📊 Sync dijalankan.");
    try {
      const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";
      await fetch(`${baseUrl}/api/sync-sheets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: userData._uid }),
      });
    } catch (e) { console.error(e); }
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
      await editTelegramMessage(chatId, messageId, "⚠️ Wizard udah selesai / expired.");
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