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
  resolveNestedPath,
  buildHelpText,
  buildMenuListText,
} from "@/lib/telegramData";

// ========== FIREBASE ADMIN ==========
let adminApp = null;
function getAdminApp() {
  if (adminApp) return adminApp;
  if (getApps().length > 0) { adminApp = getApps()[0]; return adminApp; }
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || "")
    .trim().replace(/^"|"$/g, "").replace(/\\n/g, "\n");
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

// ========== HELPER: NAVIGATE PATH ==========
// Ambil root array berdasarkan menuId
function getRootArray(data, menuId) {
  if (menuId === "belajar") return data.belajar?.kategori || [];
  if (menuId === "pekerjaan") return data.pekerjaan || [];
  if (menuId === "bisnis") return data.bisnisBrands || [];
  return [];
}

// Navigate path → dapat item di level terakhir + children array
// Contoh path ["ptId", "brandId"] → item = brand, children = brand.kegiatan
function navigatePath(rootArray, path) {
  let current = rootArray;
  let item = null;
  for (let i = 0; i < path.length; i++) {
    item = current.find((x) => x.id === path[i]);
    if (!item) return null;
    if (i < path.length - 1) {
      current = item.brands || item.subKategori || item.tools || item.fitur || item.parts || item.kegiatan || [];
    }
  }
  // Children dari item terakhir
  const children = item.brands || item.subKategori || item.tools || item.fitur || item.parts || item.kegiatan || [];
  return { item, children };
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

// ========== SIMPAN LOG HARIAN ==========
async function simpanKeLogHarian(firestore, uid, entry) {
  const userRef = firestore.collection("users").doc(uid);
  const snap = await userRef.get();
  const data = snap.data() || {};
  const today = entry.tanggal || new Date().toISOString().split("T")[0];
  const logHarian = data.belajarLogHarian || {};
  if (!logHarian[today]) logHarian[today] = [];
  logHarian[today].push({
    id: `log_${Date.now()}`,
    kategoriId: entry.kategoriId,
    subKategoriId: entry.subKategoriId || "",
    toolId: entry.toolId || "",
    fiturId: entry.fiturId || "",
    partId: entry.partId || "",
    catatan: entry.catatan || "",
    gdriveUrl: entry.gdriveUrl || "",
    telegramMessageId: "",
    sumber: "telegram",
    updatedAt: new Date().toISOString(),
  });
  await userRef.update({ belajarLogHarian: logHarian });
}

// ========== HANDLE NESTED (Mulai dari root) ==========
async function handleNestedMenu(firestore, chatId, messageId, userData, command, payload, catatan) {
  const rootArray = getRootArray(userData, command);

  if (rootArray.length === 0) {
    await editTelegramMessage(chatId, messageId, `⚠️ Menu <b>${command}</b> kosong.\n\nBuka web dulu.`);
    return;
  }

  // Kalau payload ada → cari
  if (payload && command === "belajar") {
    const result = resolveNestedPath(payload, rootArray);
    if (result && result.found) {
      const buttons = [
        [{ text: "✅ Ya", callback_data: `saveNested|${command}|${result.path.join("/")}|${catatan || payload}` }],
        [{ text: "❌ Batal", callback_data: "cancel" }],
      ];
      await editTelegramMessage(
        chatId, messageId,
        `<b>📋 Ringkasan</b>\n\n<b>${result.labels.join(" → ")}</b>\n📝 ${catatan || payload}\n\nSimpen?`,
        buttons
      );
      return;
    }
  }

  // Mode C — tampilin level 1
  const buttons = rootArray.slice(0, 8).map((k) => [
    { text: (k.nama || k.label || "").slice(0, 40), callback_data: `pickNested|${command}|${k.id}` },
  ]);
  buttons.push([{ text: "❌ Batal", callback_data: "cancel" }]);
  await editTelegramMessage(chatId, messageId, `<b>📚 ${command} → pilih:</b>`, buttons);
}

// ========== HANDLE NESTED PICK (Mode C) ==========
async function handleNestedPick(firestore, chatId, messageId, userData, menuId, itemId) {
  const rootArray = getRootArray(userData, menuId);
  const item = rootArray.find((x) => x.id === itemId);
  if (!item) {
    await editTelegramMessage(chatId, messageId, "❌ Item nggak ditemukan.");
    return;
  }

  const children = item.brands || item.subKategori || item.tools || item.fitur || item.parts || item.kegiatan || [];

  if (children.length === 0) {
    // Leaf — minta catatan
    await editTelegramMessage(
      chatId, messageId,
      `<b>✏️ Ketik catatan lo:</b>\n\nPath: ${menuId} → ${item.nama || item.label}\n\nKetik catatan (atau "-" kalau kosong):`
    );
    await firestore.collection("telegramState").doc(String(chatId)).set({
      menuId,
      path: [item.id],
      labels: [item.nama || item.label],
      awaiting: "catatan",
      updatedAt: new Date().toISOString(),
    });
    return;
  }

  // Ada children → tampilin
  const buttons = children.slice(0, 8).map((c) => [
    {
      text: (c.nama || c.label || "").slice(0, 40),
      callback_data: `pickNestedSub|${menuId}|${item.id}|${c.id}`,
    },
  ]);
  buttons.push([{ text: "❌ Batal", callback_data: "cancel" }]);
  await editTelegramMessage(
    chatId, messageId,
    `<b>${menuId} → ${item.nama || item.label} → pilih:</b>`,
    buttons
  );
}

// ========== HANDLE NESTED SUB-PICK (Level 2+) ==========
async function handleNestedSubPick(firestore, chatId, messageId, userData, menuId, parentId, childId) {
  // parentId = PT id, childId = brand id (atau parent → child di level lain)
  const rootArray = getRootArray(userData, menuId);
  const parent = rootArray.find((x) => x.id === parentId);
  if (!parent) {
    await editTelegramMessage(chatId, messageId, "❌ Parent nggak ketemu.");
    return;
  }

  const childArray = parent.brands || parent.subKategori || parent.tools || parent.fitur || parent.parts || parent.kegiatan || [];
  const child = childArray.find((c) => c.id === childId);
  if (!child) {
    await editTelegramMessage(chatId, messageId, "❌ Child nggak ketemu.");
    return;
  }

  const grandChildren = child.subKategori || child.tools || child.fitur || child.parts || child.kegiatan || [];

  if (grandChildren.length === 0) {
    // Leaf — minta catatan
    await editTelegramMessage(
      chatId, messageId,
      `<b>✏️ Ketik catatan lo:</b>\n\nPath: ${menuId} → ${parent.nama || parent.label} → ${child.nama || child.label}\n\nKetik catatan (atau "-"):`
    );
    await firestore.collection("telegramState").doc(String(chatId)).set({
      menuId,
      path: [parent.id, child.id],
      labels: [parent.nama || parent.label, child.nama || child.label],
      awaiting: "catatan",
      updatedAt: new Date().toISOString(),
    });
    return;
  }

  // Ada grandChildren → tampilin
  const buttons = grandChildren.slice(0, 8).map((g) => [
    {
      text: (g.nama || g.label || "").slice(0, 40),
      callback_data: `pickNestedSub2|${menuId}|${parent.id}|${child.id}|${g.id}`,
    },
  ]);
  buttons.push([{ text: "❌ Batal", callback_data: "cancel" }]);
  await editTelegramMessage(
    chatId, messageId,
    `<b>${menuId} → ${parent.nama || parent.label} → ${child.nama || child.label} → pilih:</b>`,
    buttons
  );
}

// ========== SIMPAN NESTED LEAF ==========
async function saveNestedLeaf(firestore, userData, menuId, path, catatan, chatId, messageId) {
  const userRef = firestore.collection("users").doc(userData._uid);
  const snap = await userRef.get();
  const data = snap.data();

  if (menuId === "belajar") {
    const today = new Date().toISOString().split("T")[0];
    await simpanKeLogHarian(firestore, userData._uid, {
      kategoriId: "belajar",
      subKategoriId: path[0] || "",
      toolId: path[1] || "",
      fiturId: path[2] || "",
      partId: path[3] || "",
      catatan,
      tanggal: today,
    });
    await editTelegramMessage(chatId, messageId, `<b>✅ Tersimpan!</b>\n\n📚 ${path.join(" → ")}\n📝 ${catatan}`);
    return;
  }

  if (menuId === "pekerjaan") {
    const pekerjaan = data.pekerjaan || [];
    const pt = pekerjaan.find((p) => p.id === path[0]);
    if (!pt) { await editTelegramMessage(chatId, messageId, "❌ PT nggak ketemu."); return; }
    const brand = (pt.brands || []).find((b) => b.id === path[1]);
    if (!brand) { await editTelegramMessage(chatId, messageId, "❌ Brand nggak ketemu."); return; }
    if (!brand.kegiatan) brand.kegiatan = [];
    brand.kegiatan.push({
      id: `keg_${Date.now()}`,
      judul: catatan.slice(0, 50),
      tanggal: new Date().toISOString().split("T")[0],
      status: "belum",
      catatan,
      createdAt: new Date().toISOString(),
    });
    await userRef.update({ pekerjaan });
    await editTelegramMessage(chatId, messageId, `<b>✅ Tersimpan di Pekerjaan</b>\n\n${pt.nama} → ${brand.nama}\n📝 ${catatan}`);
    return;
  }

  if (menuId === "bisnis") {
    const brands = data.bisnisBrands || [];
    const brand = brands.find((b) => b.id === path[0]);
    if (!brand) { await editTelegramMessage(chatId, messageId, "❌ Brand nggak ketemu."); return; }
    if (!brand.kegiatan) brand.kegiatan = [];
    brand.kegiatan.push({
      id: `keg_${Date.now()}`,
      judul: catatan.slice(0, 50),
      tanggal: new Date().toISOString().split("T")[0],
      status: "belum",
      catatan,
      createdAt: new Date().toISOString(),
    });
    await userRef.update({ bisnisBrands: brands });
    await editTelegramMessage(chatId, messageId, `<b>✅ Tersimpan di Bisnis</b>\n\n${brand.nama}\n📝 ${catatan}`);
    return;
  }
}

// ========== HANDLE PESAN ==========
async function handleTextMessage(firestore, chatId, text, userData, messageId, fromData) {
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
    const today = new Date().toISOString().split("T")[0];
    const progress = userData.dailyProgress?.[today] || {};
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
    found.karyaMingguan.push({ id: `kw_${Date.now()}`, tanggal: new Date().toISOString().split("T")[0], linkTiktok, catatan: catatanKarya });
    await userRef.update({ belajar: { kategori } });
    await sendTelegramMessage(chatId, `✅ Karya mingguan ditambah ke ${result.labels.join(" → ")}.`);
    return;
  }

  // ==== MENU COMMAND ====
  const found = findMenuByCommand(command, userData.menus, userData.menusCustom);
  if (!found) {
    await sendTelegramMessage(chatId, `❌ Menu "${command}" nggak ada.\nKetik /menu_list.`);
    return;
  }

  if (found.type === "top") {
    const menu = found.menu;

    // Nested dulu
    if (menu.id === "belajar" || menu.id === "pekerjaan" || menu.id === "bisnis") {
      const msg = await sendTelegramWithButtons(chatId, `⏳ Loading...`, []);
      if (msg.ok) {
        await handleNestedMenu(firestore, chatId, msg.result.message_id, userData, menu.id, payload, catatan);
      }
      return;
    }

    const fullCatatan = catatan || payload;
    if (!fullCatatan) {
      await sendTelegramMessage(chatId, `⚠️ Catatan kosong. Contoh: /${menu.id} isi catatan`);
      return;
    }

    await sendTelegramWithButtons(
      chatId,
      `<b>📋 Ringkasan</b>\n\nMenu: <b>${menu.label}</b>\n📝 ${fullCatatan}\n\nSimpen?`,
      [
        [{ text: "✅ Ya", callback_data: `confirm|${menu.id}|${fullCatatan}` }],
        [{ text: "❌ Batal", callback_data: "cancel" }],
      ]
    );
    return;
  }

  if (found.type === "custom") {
    const fullCatatan = catatan || payload;
    if (!fullCatatan) { await sendTelegramMessage(chatId, `⚠️ Catatan kosong.`); return; }
    await sendTelegramWithButtons(
      chatId,
      `<b>📋 Ringkasan</b>\n\nMenu: <b>${found.menu.nama}</b>\n📝 ${fullCatatan}\n\nSimpen?`,
      [
        [{ text: "✅ Ya", callback_data: `confirm_custom|${found.key}|${fullCatatan}` }],
        [{ text: "❌ Batal", callback_data: "cancel" }],
      ]
    );
    return;
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

  if (action === "cancel") {
    await editTelegramMessage(chatId, messageId, "❌ Dibatalkan.");
    await firestore.collection("telegramState").doc(String(chatId)).delete();
    return;
  }

  if (action === "confirm") {
    const menuId = parts[1];
    const catatan = parts.slice(2).join("|");
    await saveTopLevel(firestore, userData, menuId, catatan);
    await editTelegramMessage(chatId, messageId, `<b>✅ Tersimpan di ${menuId}</b>\n\n📝 ${catatan}`);
    return;
  }

  if (action === "confirm_custom") {
    const customKey = parts[1];
    const catatan = parts.slice(2).join("|");
    await saveCustom(firestore, userData, customKey, catatan);
    await editTelegramMessage(chatId, messageId, `<b>✅ Tersimpan di ${customKey}</b>\n\n📝 ${catatan}`);
    return;
  }

  // Pick level 1 (PT / Kategori / Brand)
  if (action === "pickNested") {
    const menuId = parts[1];
    const itemId = parts[2];
    await handleNestedPick(firestore, chatId, messageId, userData, menuId, itemId);
    return;
  }

  // Pick level 2 (Brand)
  if (action === "pickNestedSub") {
    const menuId = parts[1];
    const parentId = parts[2];
    const childId = parts[3];
    await handleNestedSubPick(firestore, chatId, messageId, userData, menuId, parentId, childId);
    return;
  }

  // Pick level 3 (Kegiatan)
  if (action === "pickNestedSub2") {
    const menuId = parts[1];
    const parentId = parts[2];
    const childId = parts[3];
    const grandId = parts[4];
    // Untuk kasus Pekerjaan → PT → Brand → Kegiatan, kita anggap grandId = leaf
    // Minta catatan
    const rootArray = getRootArray(userData, menuId);
    const parent = rootArray.find((x) => x.id === parentId);
    const child = (parent?.brands || []).find((b) => b.id === childId);
    const grand = (child?.kegiatan || []).find((k) => k.id === grandId);

    await editTelegramMessage(
      chatId, messageId,
      `<b>✏️ Ketik catatan lo:</b>\n\nPath: ${menuId} → ${parent?.nama} → ${child?.nama} → ${grand?.judul || grand?.nama}\n\nKetik catatan (atau "-"):`
    );
    await firestore.collection("telegramState").doc(String(chatId)).set({
      menuId,
      path: [parentId, childId, grandId],
      awaiting: "catatan",
      updatedAt: new Date().toISOString(),
    });
    return;
  }

  // Save nested (dari Mode A/B)
  if (action === "saveNested") {
    const menuId = parts[1];
    const pathStr = parts[2];
    const catatan = parts[3];
    const path = pathStr.split("/");
    await saveNestedLeaf(firestore, userData, menuId, path, catatan, chatId, messageId);
    return;
  }

  if (action === "syncnow") {
    await editTelegramMessage(chatId, messageId, "📊 Sync dijalankan.");
    return;
  }
}

// ========== SIMPAN TOP-LEVEL ==========
async function saveTopLevel(firestore, userData, menuId, catatan) {
  const userRef = firestore.collection("users").doc(userData._uid);
  const today = new Date().toISOString().split("T")[0];
  const snap = await userRef.get();
  const data = snap.data();
  const dailyProgress = data.dailyProgress || {};
  const todayData = dailyProgress[today] || {};
  todayData[menuId] = { ...(todayData[menuId] || {}), catatan, updatedAt: new Date().toISOString() };
  dailyProgress[today] = todayData;
  await userRef.update({ dailyProgress });
}

async function saveCustom(firestore, userData, menuId, catatan) {
  const userRef = firestore.collection("users").doc(userData._uid);
  const today = new Date().toISOString().split("T")[0];
  const snap = await userRef.get();
  const data = snap.data();
  const logs = data.menusCustomLogHarian || {};
  const todayLog = logs[today] || {};
  todayLog[menuId] = { ...(todayLog[menuId] || {}), catatan, updatedAt: new Date().toISOString() };
  logs[today] = todayLog;
  await userRef.update({ menusCustomLogHarian: logs });
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

    // Cek state awaiting catatan
    const stateRef = firestore.collection("telegramState").doc(String(chatId));
    const stateSnap = await stateRef.get();
    const state = stateSnap.exists ? stateSnap.data() : null;

    if (update.message?.text && state?.awaiting === "catatan" && !update.message.text.startsWith("/")) {
      const catatan = update.message.text.trim();
      if (catatan && catatan !== "-") {
        await saveNestedLeaf(firestore, userData, state.menuId, state.path, catatan, chatId, message.message_id);
      } else {
        await sendTelegramMessage(chatId, "⚠️ Catatan kosong, dibatalin.");
      }
      await stateRef.delete();
      return NextResponse.json({ ok: true });
    }

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