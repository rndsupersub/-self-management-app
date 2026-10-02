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
    `<b>✅ Berhasil di-link!</b>\n\nAkun Telegram lo udah nyambung.\nUID: <code>${uid}</code>\n\nKirim /help buat panduan.\n📱 <i>Link ini permanent.</i>`
  );
}

// ========== HELPER: SIMPAN LOG HARIAN ==========
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

// ========== HANDLE NESTED (Belajar/Pekerjaan/Bisnis) ==========
async function handleNestedMenu(firestore, chatId, messageId, userData, command, payload, catatan, mode = "A") {
  const kategoriId = command;
  let kategoriArr = [];

  if (command === "belajar") {
    kategoriArr = userData.belajar?.kategori || [];
  } else if (command === "pekerjaan") {
    kategoriArr = userData.pekerjaan || [];
  } else if (command === "bisnis") {
    kategoriArr = userData.bisnisBrands || [];
  }

  if (kategoriArr.length === 0) {
    await editTelegramMessage(chatId, messageId, `⚠️ Menu "${command}" kosong. Buka web dulu.`);
    return;
  }

  // Kalau payload ada → cari
  if (payload) {
    const result = resolveNestedPath(payload, kategoriArr);
    if (result && result.found) {
      // Konfirmasi simpen
      const labelPath = result.labels.join(" → ");
      await editTelegramMessage(
        chatId,
        messageId,
        `<b>📋 Ringkasan</b>\n\nMenu: ${command} → ${labelPath}\n📝 Catatan: ${catatan || payload}\n\nSimpen?\n[✅ Ya] [✏️ Edit] [❌ Batal]`
      );
      return;
    } else if (result && result.multiple) {
      // Multiple choice
      const buttons = result.multiple.slice(0, 5).map((m) => [
        { text: m.labels.join(" → ").slice(0, 40), callback_data: `pickPath|${command}|${m.path.join("/")}|${catatan || payload}` },
      ]);
      buttons.push([{ text: "❌ Batal", callback_data: "cancel" }]);
      await editTelegramMessage(
        chatId,
        messageId,
        `<b>⚠️ Ada ${result.multiple.length} match.</b>\nPilih:`,
        buttons
      );
      return;
    }
    // Nggak ketemu → fallback ke mode C (tampilin pilihan level 1)
  }

  // Mode C — tampilin pilihan level 1
  const buttons = kategoriArr.slice(0, 5).map((k) => [
    { text: k.nama || k.label, callback_data: `pickNested|${command}|0|${k.id}|${catatan || ""}` },
  ]);
  buttons.push([{ text: "❌ Batal", callback_data: "cancel" }]);
  await editTelegramMessage(
    chatId,
    messageId,
    `<b>📚 ${command} → pilih:</b>`,
    buttons
  );
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

    // Cari tool di belajar
    const kategoriArr = userData.belajar?.kategori || [];
    const result = resolveNestedPath(toolName, kategoriArr);
    if (!result || !result.found) {
      await sendTelegramMessage(chatId, `❌ Tool "${toolName}" nggak ketemu.`);
      return;
    }
    // Simpen ke tool.karyaMingguan
    const userRef = firestore.collection("users").doc(userData._uid);
    const snap = await userRef.get();
    const data = snap.data();
    const kategori = data.belajar?.kategori || [];
    // Find by path
    const path = result.path;
    let target = { kategori };
    let arr = target.kategori;
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
    const fullCatatan = catatan || payload;
    if (!fullCatatan) {
      await sendTelegramMessage(chatId, `⚠️ Catatan kosong. Contoh: /${menu.id} isi catatan`);
      return;
    }

    // Kalau menu top-level = Belajar/Pekerjaan/Bisnis → handle nested
    if (menu.id === "belajar" || menu.id === "pekerjaan" || menu.id === "bisnis") {
      const msg = await sendTelegramWithButtons(chatId, `⏳ Loading...`, []);
      if (msg.ok) await handleNestedMenu(firestore, chatId, msg.result.message_id, userData, menu.id, payload, catatan, "A");
      return;
    }

    // Menu top-level lain (Olahraga, Keuangan, dll) → langsung konfirmasi
    await sendTelegramWithButtons(
      chatId,
      `<b>📋 Ringkasan</b>\n\nMenu: ${menu.label}\n📝 Catatan: ${fullCatatan}\n\nSimpen?`,
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
      `<b>📋 Ringkasan</b>\n\nMenu: ${found.menu.nama}\n📝 Catatan: ${fullCatatan}\n\nSimpen?`,
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

  // ==== NESTED PICK (Mode C) ====
  if (action === "pickNested") {
    const [, menuId, level, itemId, catatanBawa] = parts;
    await handleNestedPick(firestore, chatId, messageId, userData, menuId, parseInt(level), itemId, catatanBawa);
    return;
  }

  if (action === "pickPath") {
    // Data: pickPath|belajar|design/3d/solidworks|catatan
    const [, menuId, pathStr, catatanBawa] = parts;
    const path = pathStr.split("/");
    await saveNestedLeaf(firestore, userData, menuId, path, catatanBawa, "telegram", chatId, messageId);
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

// ========== HANDLE NESTED PICK (Mode C) ==========
async function handleNestedPick(firestore, chatId, messageId, userData, menuId, level, itemId, catatanBawa) {
  const userRef = firestore.collection("users").doc(userData._uid);
  const snap = await userRef.get();
  const data = snap.data();
  const kategoriArr = menuId === "belajar" ? (data.belajar?.kategori || []) : menuId === "pekerjaan" ? (data.pekerjaan || []) : (data.bisnisBrands || []);

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
      `<b>✏️ Ketik catatan lo:</b>\n\nPath: ${menuId} → ${item.nama || item.label}`
    );
    // Simpen state untuk nunggu catatan (via Firestore telegramState)
    await firestore.collection("telegramState").doc(String(chatId)).set({
      menuId, path: [...(catatanBawa?.path || []), item.id],
      labels: [...(catatanBawa?.labels || []), item.nama || item.label],
      awaiting: "catatan",
      updatedAt: new Date().toISOString(),
    });
    return;
  }

  // Ada children — tampilin tombol
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

// ========== SIMPAN NESTED LEAF ==========
async function saveNestedLeaf(firestore, userData, menuId, path, catatan, sumber, chatId, messageId) {
  const userRef = firestore.collection("users").doc(userData._uid);
  const today = new Date().toISOString().split("T")[0];

  if (menuId === "belajar") {
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
  } else if (menuId === "pekerjaan") {
    // Simpen ke pekerjaan[pt].brands[brand].kegiatan
    await editTelegramMessage(chatId, messageId, `✅ Pekerjaan tersimpan.`);
  } else if (menuId === "bisnis") {
    await editTelegramMessage(chatId, messageId, `✅ Bisnis tersimpan.`);
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