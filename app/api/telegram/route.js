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
async function startWizard(firestore, chatId, menuId, userData) {
  let config = WIZARD_CONFIG[menuId];
  if (!config) {
    if (userData.menusCustom && userData.menusCustom[menuId]) {
      config = CUSTOM_MENU_WIZARD;
    } else {
      await sendTelegramMessage(chatId, `❌ Menu "${menuId}" nggak punya wizard.`);
      return;
    }
  }

  const fields = {};
  config.steps.forEach((s) => {
    if (s.default !== undefined) {
      if (s.default === "today") fields[s.key] = today();
      else fields[s.key] = s.default;
    }
  });

  const state = {
    menuId,
    currentStep: 0,
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
      console.error("[renderStep] editTelegramMessage (ringkasan) error:", e.message);
      // Fallback: kirim pesan baru kalau edit gagal
      await sendTelegramWithButtons(chatId, ringkasan, buttons);
    }

    // FIX: Set awaiting null biar next text input nggak dianggap wizard
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
      console.error("[renderStep] step.source error:", e.message);
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

  if (step.type === "text" || step.type === "number" || step.type === "optional-text") {
    buttons = [];
    if (step.type === "optional-text") {
      buttons.push([{ text: "⏭️ Skip", callback_data: "wiz_skip" }]);
    }
  }

  // Tambah tombol navigasi
  const navRow = [];
  if (stepIdx > 0) navRow.push({ text: "⬅️ Kembali", callback_data: "wiz_back" });
  navRow.push({ text: "❌ Batal", callback_data: "wiz_cancel" });
  buttons.push(navRow);

  try {
    await editTelegramMessage(chatId, state.messageId, text, buttons);
  } catch (e) {
    console.error("[renderStep] editTelegramMessage error:", e.message);
    await sendTelegramWithButtons(chatId, text, buttons);
  }

  // Update state awaiting
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
    // FIX: Kalau step udah nggak ada, hapus state
    await clearState(firestore, chatId);
    await sendTelegramMessage(chatId, `⚠️ Wizard udah selesai. Kirim /help.`);
    return;
  }

  if (step.type === "number") {
    const num = parseInt(text.replace(/[^\d-]/g, ""));
    if (isNaN(num)) {
      await sendTelegramMessage(chatId, `⚠️ Harus angka. Coba lagi:`);
      return;
    }
    state.fields[step.key] = num;
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

  // ========== PEKERJAAN ==========
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

  // ========== BISNIS ==========
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

// ========== HANDLE PESAN TEKS ==========
async function handleTextMessage(firestore, chatId, text, userData, messageId, fromData) {
  // Cek state wizard
  const state = await getState(firestore, chatId);

  // Kalau ada state wizard & user lagi nunggu input text
  if (state && state.awaiting && !text.startsWith("/")) {
    // Date manual
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
    // Text/number input untuk step
    if (state.awaitingType === "text" || state.awaitingType === "number" || state.awaitingType === "optional-text") {
      await handleWizardInput(firestore, chatId, text, state, userData);
      return;
    }
  }

  // FIX: Kalau ada state wizard tapi nggak awaiting & user kirim text random → hapus state
  if (state && !state.awaiting && !text.startsWith("/")) {
    // User lagi di ringkasan (udah lewat step terakhir) tapi kirim text random
    // Ingatkan: klik [✅ Simpan] atau [❌ Batal]
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

  // ==== MENU COMMAND → MULAI WIZARD ====
  const found = findMenuByCommand(command, userData.menus, userData.menusCustom);
  if (!found) {
    await sendTelegramMessage(chatId, `❌ Menu "${command}" nggak ada.\nKetik /menu_list.`);
    return;
  }

  const hasWizard = WIZARD_CONFIG[command] || (userData.menusCustom && userData.menusCustom[command]);

  if (hasWizard) {
    await startWizard(firestore, chatId, command, userData);
  } else {
    await sendTelegramMessage(chatId, `⚠️ Menu "${command}" belum punya wizard.`);
  }
}

// ========== HANDLE CALLBACK ==========
async function handleCallback(callbackQuery, userData, firestore) {
  const { id: callbackId, message, data } = callbackQuery;
  const chatId = message.chat.id;
  const messageId = message.message_id;
  await answerCallbackQuery(callbackId);

  const parts = data.split("|");
  const action = parts[0];

  // Sync now
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

  // Wizard callback
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