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
  await sendTelegramMessage(
    chatId,
    `<b>✅ Berhasil di-link!</b>\n\nUID: <code>${uid}</code>\n\nKirim /help buat panduan.\n📱 <i>Link ini permanent.</i>`
  );
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

// ========== HANDLE NESTED ==========
async function handleNestedMenu(firestore, chatId, messageId, userData, command, payload, catatan, mode = "A") {
  let kategoriArr = [];
  if (command === "belajar") {
    kategoriArr = userData.belajar?.kategori || [];
  } else if (command === "pekerjaan") {
    kategoriArr = userData.pekerjaan || [];
  } else if (command === "bisnis") {
    kategoriArr = userData.bisnisBrands || [];
  }

  if (kategoriArr.length === 0) {
    await editTelegramMessage(
      chatId, messageId,
      `⚠️ Menu <b>${command}</b> kosong.\n\nBuka web dulu → tambah data di menu ${command}.`
    );
    return;
  }

  // Kalau payload ada → cari
  if (payload) {
    const result = resolveNestedPath(payload, kategoriArr);
    if (result && result.found) {
      const labelPath = result.labels.join(" → ");
      const buttons = [
        [{ text: "✅ Ya", callback_data: `saveNested|${command}|${result.path.join("/")}||${catatan || payload}` }],
        [{ text: "❌ Batal", callback_data: "cancel" }],
      ];
      await editTelegramMessage(
        chatId, messageId,
        `<b>📋 Ringkasan</b>\n\nMenu: <b>${command} → ${labelPath}</b>\n📝 Catatan: ${catatan || payload}\n\nSimpen?`,
        buttons
      );
      return;
    } else if (result && result.multiple) {
      const buttons = result.multiple.slice(0, 5).map((m) => [
        { text: m.labels.join(" → ").slice(0, 40), callback_data: `saveNested|${command}|${m.path.join("/")}||${catatan || payload}` },
      ]);
      buttons.push([{ text: "❌ Batal", callback_data: "cancel" }]);
      await editTelegramMessage(
        chatId, messageId,
        `<b>⚠️ Ada ${result.multiple.length} match.</b>\nPilih:`,
        buttons
      );
      return;
    }
    // Fallback ke Mode C
  }

  // Mode C — pilih level 1
  const buttons = kategoriArr.slice(0, 5).map((k) => [
    { text: (k.nama || k.label || "").slice(0, 40), callback_data: `pickNested|${command}|0|${k.id}|` },
  ]);
  buttons.push([{ text: "❌ Batal", callback_data: "cancel" }]);
  await editTelegramMessage(
    chatId, messageId,
    `<b>📚 ${command} → pilih:</b>`,
    buttons
  );
}

// ========== HANDLE NESTED PICK (Mode C) ==========
async function handleNestedPick(firestore, chatId, messageId, userData, menuId, level, itemId, catatanBawa) {
  const userRef = firestore.collection("users").doc(userData._uid);
  const snap = await userRef.get();
  const data = snap.data();
  let kategoriArr = [];
  if (menuId === "belajar") kategoriArr = data.belajar?.kategori || [];
  else if (menuId === "pekerjaan") kategoriArr = data.pekerjaan || [];
  else if (menuId === "bisnis") kategoriArr = data.bisnisBrands || [];

  const item = kategoriArr.find((x) => x.id === itemId);
  if (!item) {
    await editTelegramMessage(chatId, messageId, "❌ Item nggak ditemukan.");
    return;
  }

  const children = item.subKategori || item.tools || item.fitur || item.parts || item.brands || item.kegiatan || [];

  if (children.length === 0) {
    // Leaf — minta catatan
    await editTelegramMessage(
      chatId, messageId,
      `<b>✏️ Ketik catatan lo:</b>\n\nPath: ${menuId} → ${item.nama || item.label}\n\nKetik catatan (atau kirim "-" kalau kosong):`
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

  // Ada children
  const buttons = children.slice(0, 5).map((c) => [
    {
      text: (c.nama || c.label || "").slice(0, 40),
      callback_data: `pickNested|${menuId}|${level + 1}|${c.id}|`,
    },
  ]);
  buttons.push([{ text: "❌ Batal", callback_data: "cancel" }]);
  await editTelegramMessage(
    chatId, messageId,
    `<b>${menuId} → ${item.nama || item.label} → pilih:</b>`,
    buttons
  );
}

// ========== SIMPAN NESTED LEAF ==========
async function saveNestedLeaf(firestore, userData, menuId, path, catatan, chatId, messageId) {
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
    await editTelegramMessage(
      chatId, messageId,
      `<b>✅ Tersimpan!</b>\n\n📚 Belajar → ${path.join(" → ")}\n📝 ${catatan}\n\n📊 Auto-sync ke Sheets.`,
      [[{ text: "📊 Sync Now", callback_data: `syncnow` }]]
    );
    return;
  }

  if (menuId === "pekerjaan") {
    const userRef = firestore.collection("users").doc(userData._uid);
    const snap = await userRef.get();
    const data = snap.data();
    const pekerjaan = data.pekerjaan || [];
    // path = [ptId, brandId, kegiatanId]
    const ptId = path[0];
    const brandId = path[1];
    const kegId = path[2];
    const pt = pekerjaan.find((p) => p.id === ptId);
    if (!pt) { await editTelegramMessage(chatId, messageId, "❌ PT nggak ketemu."); return; }
    const brand = (pt.brands || []).find((b) => b.id === brandId);
    if (!brand) { await editTelegramMessage(chatId, messageId, "❌ Brand nggak ketemu."); return; }
    if (!brand.kegiatan) brand.kegiatan = [];
    // Kalau kegId ada → update. Kalau nggak → tambah baru.
    if (kegId) {
      const keg = brand.kegiatan.find((k) => k.id === kegId);
      if (keg) {
        keg.catatan = catatan;
        keg.updatedAt = new Date().toISOString();
      }
    } else {
      brand.kegiatan.push({
        id: `keg_${Date.now()}`,
        judul: catatan.slice(0, 50),
        tanggal: new Date().toISOString().split("T")[0],
        status: "belum",
        catatan,
        createdAt: new Date().toISOString(),
      });
    }
    await userRef.update({ pekerjaan });
    await editTelegramMessage(chatId, messageId, `<b>✅ Tersimpan di Pekerjaan</b>\n\n📝 ${catatan}`);
    return;
  }

  if (menuId === "bisnis") {
    const userRef = firestore.collection("users").doc(userData._uid);
    const snap = await userRef.get();
    const data = snap.data();
    const brands = data.bisnisBrands || [];
    const brandId = path[0];
    const brand = brands.find((b) => b.id === brandId);
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
    await editTelegramMessage(chatId, messageId, `<b>✅ Tersimpan di Bisnis</b>\n\n📝 ${catatan}`);
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

  // ==== COMMAND SPESIAL ====
  if (command === "start") {
    await sendTelegramMessage(chatId, `👋 Halo <b>${fromData?.first_name || "Sobat"}</b>!\n\nBuat mulai: kirim /help.`);
    return;
  }
  if (command === "link") {
    if (!payload) {
      await sendTelegramMessage(chatId, `⚠️ Format: <code>/link KODE</code>`);
      return;
    }
    await handleLink(firestore, chatId, payload, fromData);
    return;
  }
  if (command === "help") {
    await sendTelegramMessage(chatId, buildHelpText());
    return;
  }

  if (!userData) {
    await sendTelegramMessage(chatId, `⚠️ Belum di-link.\nBuka web → 🤖 Telegram → Generate Pairing Code → kirim <code>/link KODE</code>.`);
    return;
  }

  if (command === "menu_list") {
    await sendTelegramMessage(chatId, buildMenuListText(userData.menus || [], userData.menusCustom || {}));
    return;
  }
  if (command === "debug") {
    const menus = userData.menus || [];
    await sendTelegramMessage(
      chatId,
      `<b>🔍 DEBUG</b>\n\nUID: <code>${userData._uid}</code>\nmenus: ${menus.length}\npekerjaan: ${(userData.pekerjaan || []).length}\nbelajar.kategori: ${(userData.belajar?.kategori || []).length}\nbisnisBrands: ${(userData.bisnisBrands || []).length}`
    );
    return;
  }
  if (command === "status") {
    const today = new Date().toISOString().split("T")[0];
    await sendTelegramMessage(chatId, `<b>📊 Status</b>\n\n🟢 Telegram: Aktif\n🟢 Firestore: Tersambung\n📅 Hari ini: ${today}`);
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

  // ==== KARYA MINGGUAN ====
  if (command === "karya") {
    if (!payload) {
      await sendTelegramMessage(chatId, `⚠️ Format: <code>/karya [tool] | [link_tiktok] | [catatan]</code>`);
      return;
    }
    const parts = payload.split("|").map((p) => p.trim());
    const toolName = parts[0];
    const linkTiktok = catatan || "";
    const catatanKarya = parts[1] || "";

    const kategoriArr = userData.belajar?.kategori || [];
    const result = resolveNestedPath(toolName, kategoriArr);
    if (!result || !result.found) {
      await sendTelegramMessage(chatId, `❌ Tool "${toolName}" nggak ketemu.`);
      return;
    }
    const userRef = firestore.collection("users").doc(userData._uid);
    const snap = await userRef.get();
    const data = snap.data();
    const kategori = data.belajar?.kategori || [];
    const path = result.path;
    let arr = kategori;
    let found = null;
    for (let i = 0; i < path.length; i++) {
      found = arr.find((x) => x.id === path[i]);
      if (!found) break;
      if (i < path.length - 1) {
        arr = found.tools || found.subKategori || found.fitur || found.parts || [];
      }
    }
    if (!found) {
      await sendTelegramMessage(chatId, `❌ Tool nggak ketemu.`);
      return;
    }
    if (!found.karyaMingguan) found.karyaMingguan = [];
    found.karyaMingguan.push({
      id: `kw_${Date.now()}`,
      tanggal: new Date().toISOString().split("T")[0],
      linkTiktok,
      catatan: catatanKarya,
    });
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

    // ✅ FIX: CEK NESTED DULU (sebelum cek catatan kosong)
    if (menu.id === "belajar" || menu.id === "pekerjaan" || menu.id === "bisnis") {
      const msg = await sendTelegramWithButtons(chatId, `⏳ Loading...`, []);
      if (msg.ok) {
        await handleNestedMenu(firestore, chatId, msg.result.message_id, userData, menu.id, payload, catatan, "A");
      }
      return;
    }

    // Top-level biasa (Olahraga, Keuangan, dll) → butuh catatan
    const fullCatatan = catatan || payload;
    if (!fullCatatan) {
      await sendTelegramMessage(chatId, `⚠️ Catatan kosong. Contoh: /${menu.id} isi catatan`);
      return;
    }

    await sendTelegramWithButtons(
      chatId,
      `<b>📋 Ringkasan</b>\n\nMenu: <b>${menu.label}</b>\n📝 Catatan: ${fullCatatan}\n\nSimpen?`,
      [
        [{ text: "✅ Ya", callback_data: `confirm|${menu.id}||${fullCatatan}` }],
        [{ text: "❌ Batal", callback_data: "cancel" }],
      ]
    );
    return;
  }

  if (found.type === "custom") {
    const fullCatatan = catatan || payload;
    if (!fullCatatan) {
      await sendTelegramMessage(chatId, `⚠️ Catatan kosong.`);
      return;
    }
    await sendTelegramWithButtons(
      chatId,
      `<b>📋 Ringkasan</b>\n\nMenu: <b>${found.menu.nama}</b>\n📝 Catatan: ${fullCatatan}\n\nSimpen?`,
      [
        [{ text: "✅ Ya", callback_data: `confirm_custom|${found.key}||${fullCatatan}` }],
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
    return;
  }

  if (action === "confirm") {
    const menuId = parts[1];
    const catatan = parts.slice(2).join("|");
    await saveTopLevel(firestore, userData, menuId, catatan);
    await editTelegramMessage(
      chatId, messageId,
      `<b>✅ Tersimpan di ${menuId}</b>\n\n📝 ${catatan}\n\n📊 Auto-sync ke Sheets.`,
      [[{ text: "📊 Sync Now", callback_data: `syncnow` }]]
    );
    return;
  }

  if (action === "confirm_custom") {
    const customKey = parts[1];
    const catatan = parts.slice(2).join("|");
    await saveCustom(firestore, userData, customKey, catatan);
    await editTelegramMessage(
      chatId, messageId,
      `<b>✅ Tersimpan di ${customKey}</b>\n\n📝 ${catatan}`,
      [[{ text: "📊 Sync Now", callback_data: `syncnow` }]]
    );
    return;
  }

  if (action === "pickNested") {
    const [, menuId, level, itemId] = parts;
    await handleNestedPick(firestore, chatId, messageId, userData, menuId, parseInt(level), itemId, "");
    return;
  }

  if (action === "saveNested") {
    const [, menuId, pathStr, , catatan] = parts;
    const path = pathStr.split("/");
    await saveNestedLeaf(firestore, userData, menuId, path, catatan, chatId, messageId);
    return;
  }

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

    // Cek state "awaiting catatan" (Mode C leaf)
    const stateRef = firestore.collection("telegramState").doc(String(chatId));
    const stateSnap = await stateRef.get();
    const state = stateSnap.exists ? stateSnap.data() : null;

    if (update.message?.text && state?.awaiting === "catatan" && !update.message.text.startsWith("/")) {
      // User lagi nunggu masukin catatan (Mode C)
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
      if (!userData) {
        await sendTelegramMessage(chatId, `⚠️ Belum di-link.`);
        return NextResponse.json({ ok: true });
      }
      await handleCallback(update.callback_query, userData, firestore);
      return NextResponse.json({ ok: true });
    }

    if (update.message && update.message.text) {
      await handleTextMessage(firestore, chatId, update.message.text, userData, update.message.message_id, fromData);
      return NextResponse.json({ ok: true });
    }

    await sendTelegramMessage(chatId, "🤖 Format nggak didukung (Fase 1).");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[telegram] Error:", err);
    return NextResponse.json({ ok: true, error: err.message });
  }
}

export async function GET() {
  return NextResponse.json({ status: "Telegram webhook aktif." });
}