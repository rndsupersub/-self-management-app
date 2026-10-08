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
  progressLabel,
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

// ========== WIZARD — MULAI ==========
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

  // Kalau ada extraFields (ptId, brandId), skip step yang udah diisi
  let startStep = 0;
  if (extraFields.ptId || extraFields.brandId) {
    // Cari step pertama yang belum diisi
    for (let i = 0; i < config.steps.length; i++) {
      const stepKey = config.steps[i].key;
      if (fields[stepKey] === undefined) {
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

// ========== WIZARD — RENDER STEP ==========
async function renderStep(firestore, chatId, state, userData) {
  let config = WIZARD_CONFIG[state.menuId];
  if (!config) config = CUSTOM_MENU_WIZARD;

  const steps = config.steps;
  const stepIdx = state.currentStep;

  // Kalau udah lewat step terakhir → tampil ringkasan
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

  // Tombol navigasi
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

// ========== WIZARD — HANDLE INPUT ==========
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

// ========== WIZARD — HANDLE CALLBACK ==========
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

// ========== WIZARD — SIMPAN ==========
async function saveWizard(firestore, userData, state) {
  const menuId = state.menuId;
  const f = state.fields;
  const userRef = firestore.collection("users").doc(userData._uid);
  const todayStr = today();

  // ========== PEKERJAAN → KALENDER ==========
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

  // ========== PEKERJAAN → VENDOR ==========
  if (menuId === "pekerjaan_vendor") {
    const pekerjaan = userData.pekerjaan || [];
    const ptIdx = pekerjaan.findIndex((p) => p.id === f.ptId);
    if (ptIdx === -1) throw new Error("PT nggak ketemu");
    const brandIdx = (pekerjaan[ptIdx].brands || []).findIndex((b) => b.id === f.brandId);
    if (brandIdx === -1) throw new Error("Brand nggak ketemu");
    if (!pekerjaan[ptIdx].brands[brandIdx].vendorList) {
      pekerjaan[ptIdx].brands[brandIdx].vendorList = [];
    }
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
      pertanyaanAwal: (userData.vendorPertanyaanList || []).map((q) => ({
        id: q.id,
        pertanyaan: q.pertanyaan,
        tipe: q.tipe,
        jawaban: q.tipe === "checkbox" ? false : "",
      })),
      logKunjungan: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    pekerjaan[ptIdx].brands[brandIdx].vendorList.push(vendorBaru);
    await userRef.update({ pekerjaan });
    return;
  }

  // ========== PEKERJAAN → LAPORAN ==========
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
      const key = f.tanggal;
      brand.laporanData.mingguan[key] = {
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

  // ========== PEKERJAAN → EVALUASI ==========
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

  // ========== BISNIS → KALENDER ==========
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

  // ========== BISNIS → VENDOR ==========
  if (menuId === "bisnis_vendor") {
    const brands = userData.bisnisBrands || [];
    const bIdx = brands.findIndex((b) => b.id === f.brandId);
    if (bIdx === -1) throw new Error("Brand nggak ketemu");
    if (!brands[bIdx].vendorList) brands[bIdx].vendorList = [];
    brands[bIdx].vendorList.push({
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
      pertanyaanAwal: (userData.vendorPertanyaanList || []).map((q) => ({
        id: q.id,
        pertanyaan: q.pertanyaan,
        tipe: q.tipe,
        jawaban: q.tipe === "checkbox" ? false : "",
      })),
      logKunjungan: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    await userRef.update({ bisnisBrands: brands });
    return;
  }

  // ========== BISNIS → LAPORAN ==========
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

  // ========== BISNIS → EVALUASI ==========
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

  // ========== BELAJAR ==========
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

  // ========== OLAHRAGA ==========
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

  // ========== KEUANGAN ==========
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

  // ========== HAFALAN ==========
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

  // ========== YOUTUBE ==========
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

  // ========== BEDAH BUKU ==========
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

  // ========== MENU CUSTOM ==========
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

// ========== HANDLE SUB-MENU PICK ==========
async function handleSubMenuPick(firestore, chatId, messageId, userData, command, subMenuId, baseFields) {
  const wizardKey = `${command}_${subMenuId}`;
  const config = WIZARD_CONFIG[wizardKey];
  if (!config) {
    await editTelegramMessage(chatId, messageId, `⚠️ Sub-menu "${subMenuId}" belum punya wizard.`);
    return;
  }

  // Hapus pesan lama, mulai wizard baru
  await clearState(firestore, chatId);
  await editTelegramMessage(
    chatId,
    messageId,
    `<b>✅ Sub-menu dipilih: ${config.label}</b>\n\n⏳ Loading wizard...`
  );

  // Kirim pesan baru untuk wizard
  const msg = await sendTelegramWithButtons(chatId, `⏳ Loading...`, []);
  if (!msg.ok) return;

  // Set state dengan extraFields
  const fields = { ...baseFields };
  config.steps.forEach((s) => {
    if (s.default !== undefined && fields[s.key] === undefined) {
      if (s.default === "today") fields[s.key] = today();
      else fields[s.key] = s.default;
    }
  });

  // Skip step yang udah diisi dari baseFields
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

  if (state && state.awaiting && !text.startsWith("/")) {
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

  if (state && !state.awaiting && !text.startsWith("/")) {
    await sendTelegramMessage(
      chatId,
      `⚠️ Wizard lagi di ringkasan.\n\nKlik <b>[✅ Simpan]</b> buat simpen, atau <b>[❌ Batal]</b> buat batalin.`
    );
    return;
  }

  const parsed = parseCommand(text);
  if (!parsed) {
    await sendTelegramMessage(chatId, `🤖 Halo! Kirim /help atau /menu_list.`);
    return;
  }
  const { command, payload, catatan } = parsed;

  // ==== COMMAND SPESIAL ====
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

  // Cek apakah menu ini punya sub-menu (pekerjaan/bisnis)
  const hasSubMenu = SUB_MENU_CONFIG[command];
  if (hasSubMenu) {
    // Kalau ada sub-menu, mulai dengan step ptId (pekerjaan) atau brandId (bisnis)
    await startWizardWithSubMenu(firestore, chatId, command, userData);
    return;
  }

  // Wizard biasa (belajar, olahraga, keuangan, dll)
  const hasWizard = WIZARD_CONFIG[command] || (userData.menusCustom && userData.menusCustom[command]);
  if (hasWizard) {
    await startWizard(firestore, chatId, command, userData);
  } else {
    await sendTelegramMessage(chatId, `⚠️ Menu "${command}" belum punya wizard.`);
  }
}

// ========== WIZARD DENGAN SUB-MENU (Pekerjaan/Bisnis) ==========
async function startWizardWithSubMenu(firestore, chatId, command, userData) {
  const config = WIZARD_CONFIG[command]; // Wizard "kalender" default
  if (!config) {
    await sendTelegramMessage(chatId, `⚠️ Menu "${command}" belum punya wizard utama.`);
    return;
  }

  // Step 1 & 2: ptId (khusus pekerjaan) dan brandId
  const fields = {};
  let startStep = 0;

  // Kalau pekerjaan, tanya PT dulu
  if (command === "pekerjaan") {
    // Set state dengan currentStep = 0 (ptId), mode = "submenu"
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

  // Step 0: PT (khusus pekerjaan)
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

  // Step 1: Brand
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

  // Step 2: Pilih Sub-Menu (Kalender/Vendor/Laporan/Evaluasi)
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

  // ==== WIZARD CALLBACK ====
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