// app/api/sync-sheets/route.js
import { NextResponse } from "next/server";
import { google } from "googleapis";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// ========== CONSTANTS ==========
const PASTEL_COLORS = [
  { red: 0.85, green: 0.92, blue: 1.0 }, { red: 1.0, green: 0.95, blue: 0.8 },
  { red: 0.9, green: 1.0, blue: 0.9 }, { red: 1.0, green: 0.9, blue: 0.9 },
  { red: 0.95, green: 0.9, blue: 1.0 }, { red: 1.0, green: 0.92, blue: 0.85 },
  { red: 0.85, green: 0.95, blue: 0.95 }, { red: 0.95, green: 0.85, blue: 0.95 },
];

const STATUS_COLORS = {
  selesai: { red: 0.8, green: 1.0, blue: 0.8 },
  belum: { red: 1.0, green: 0.85, blue: 0.85 },
};

const TIPE_COLORS = {
  Masuk: { red: 0.8, green: 1.0, blue: 0.8 },
  Keluar: { red: 1.0, green: 0.85, blue: 0.85 },
  Tabungan: { red: 0.85, green: 0.92, blue: 1.0 },
  Sedekah: { red: 0.95, green: 0.85, blue: 0.95 },
};

// ========== HELPERS ==========
function parsePrivateKey(raw) {
  if (!raw) return "";
  let key = String(raw).trim();
  if (key.startsWith('"') && key.endsWith('"')) key = key.slice(1, -1);
  if (key.startsWith("'") && key.endsWith("'")) key = key.slice(1, -1);
  if (key.includes("\\n")) key = key.replace(/\\n/g, "\n");
  return key.trim();
}

function getColLetter(idx) {
  let letter = "";
  let n = idx;
  while (n >= 0) {
    letter = String.fromCharCode((n % 26) + 65) + letter;
    n = Math.floor(n / 26) - 1;
  }
  return letter;
}

function escapeForFormula(s) {
  return String(s).replace(/"/g, '""');
}

// Helper buat bikin Time Schedule (Bar Chart karakter)
function generateTimelineBar(start, end) {
  if (!start) return "-";
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : new Date(start);
  const diffDays = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
  
  // 1 hari = 1 blok, maksimal 20 blok biar ga kepanjangan
  const blocks = Math.min(diffDays, 20);
  const bar = "█".repeat(blocks);
  return `${bar} (${diffDays} hari)`;
}

// ========== FIREBASE ADMIN ==========
let adminApp = null;
function getAdminApp() {
  if (adminApp) return adminApp;
  if (getApps().length > 0) { adminApp = getApps()[0]; return adminApp; }
  const privateKey = parsePrivateKey(process.env.FIREBASE_PRIVATE_KEY);
  adminApp = initializeApp({
    credential: cert({ projectId: process.env.FIREBASE_PROJECT_ID, clientEmail: process.env.FIREBASE_CLIENT_EMAIL, privateKey }),
  });
  return adminApp;
}

// ========== GOOGLE AUTH ==========
function getAuth() {
  const privateKey = parsePrivateKey(process.env.GOOGLE_PRIVATE_KEY);
  return new google.auth.GoogleAuth({
    credentials: { client_email: process.env.GOOGLE_CLIENT_EMAIL, private_key: privateKey },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

// ========== MENU CONFIG ==========
const MENU_CONFIG = {
  belajar: {
    sheetName: "Belajar",
    hiddenCols: ["firestoreId", "updatedAt", "menu", "judul"],
    cfCol: "kategori",
    headers: [
      { name: "firestoreId", width: 100 }, { name: "menu", width: 80 },
      { name: "kategori", width: 180 }, { name: "subKategori", width: 150 },
      { name: "tool", width: 150 }, { name: "fitur", width: 200 },
      { name: "part", width: 250 }, { name: "judul", width: 200 },
      { name: "tanggal", width: 100 }, { name: "status", width: 80 },
      { name: "catatan", width: 300 }, { name: "gdriveUrl", width: 250 },
      { name: "updatedAt", width: 150 },
    ],
    flatten: (data) => {
      const rows = [];
      (data?.belajar?.kategori || []).forEach((kat) => {
        (kat.subKategori || []).forEach((sub) => {
          (sub.tools || []).forEach((tool) => {
            (tool.fitur || []).forEach((fitur) => {
              if (fitur.parts && fitur.parts.length > 0) {
                fitur.parts.forEach((part) => {
                  rows.push({ firestoreId: part.id, menu: "belajar", kategori: kat.nama, subKategori: sub.nama, tool: tool.nama, fitur: fitur.nama, part: part.nama, judul: part.nama, tanggal: "", status: "", catatan: part.catatan || "", gdriveUrl: part.gdriveUrl || "", updatedAt: part.updatedAt || "" });
                });
              } else {
                rows.push({ firestoreId: fitur.id, menu: "belajar", kategori: kat.nama, subKategori: sub.nama, tool: tool.nama, fitur: fitur.nama, part: "", judul: fitur.nama, tanggal: "", status: "", catatan: fitur.catatan || "", gdriveUrl: fitur.gdriveUrl || "", updatedAt: fitur.updatedAt || "" });
              }
            });
          });
        });
      });
      return rows;
    },
  },
  pekerjaan: {
    sheetName: "Pekerjaan",
    hiddenCols: ["firestoreId", "updatedAt", "menu"],
    cfCol: "status",
    headers: [
      { name: "firestoreId", width: 100 }, { name: "menu", width: 80 },
      { name: "pt", width: 150 }, { name: "brand", width: 150 },
      { name: "judul", width: 250 }, { name: "tanggalMulai", width: 100 },
      { name: "tanggalSelesai", width: 100 }, { name: "Timeline", width: 180 },
      { name: "status", width: 100 }, { name: "catatan", width: 300 },
      { name: "updatedAt", width: 150 },
    ],
    flatten: (data) => {
      const rows = [];
      (data?.pekerjaan || []).forEach((pt) => {
        (pt.brands || []).forEach((brand) => {
          (brand.kegiatan || []).forEach((keg) => {
            const start = keg.tanggalMulai || keg.tanggal || "";
            const end = keg.tanggalSelesai || keg.tanggal || "";
            rows.push({
              firestoreId: keg.id, menu: "pekerjaan", pt: pt.nama, brand: brand.nama, judul: keg.judul || "", 
              tanggalMulai: start, tanggalSelesai: end, Timeline: generateTimelineBar(start, end),
              status: keg.status || "", catatan: keg.catatan || "", updatedAt: keg.updatedAt || "",
            });
          });
        });
      });
      return rows;
    },
  },
  keuangan: {
    sheetName: "Keuangan",
    hiddenCols: ["firestoreId", "updatedAt", "menu"],
    cfCol: "tipe",
    numCol: "jumlah",
    headers: [
      { name: "firestoreId", width: 100 }, { name: "menu", width: 80 },
      { name: "tanggal", width: 100 }, { name: "tipe", width: 100 },
      { name: "kategori", width: 150 }, { name: "jumlah", width: 120 },
      { name: "dompet", width: 120 }, { name: "catatan", width: 300 },
      { name: "updatedAt", width: 150 },
    ],
    flatten: (data) => {
      const rows = [];
      const transaksi = data?.keuanganTransaksi || {};
      Object.keys(transaksi).forEach((tanggal) => {
        (transaksi[tanggal] || []).forEach((tx) => {
          rows.push({ firestoreId: tx.id, menu: "keuangan", tanggal, tipe: tx.tipe || tx.jenis || "", kategori: tx.kategori || tx.kategoriId || "", jumlah: Number(tx.jumlah || tx.nominal || 0), dompet: tx.dompet || tx.walletId || "", catatan: tx.catatan || "", updatedAt: tx.updatedAt || "" });
        });
      });
      return rows;
    },
  },
  olahraga: {
    sheetName: "Olahraga",
    hiddenCols: ["firestoreId", "updatedAt", "menu"],
    headers: [
      { name: "firestoreId", width: 150 }, { name: "menu", width: 80 },
      { name: "tanggal", width: 100 }, { name: "aktivitas", width: 150 },
      { name: "durasi", width: 100 }, { name: "catatan", width: 300 },
      { name: "updatedAt", width: 150 },
    ],
    flatten: (data) => {
      const rows = [];
      const harian = data?.olahraga?.harian || {};
      Object.keys(harian).forEach((tanggal) => {
        const entry = harian[tanggal] || {};
        rows.push({ firestoreId: `olahraga_${tanggal}`, menu: "olahraga", tanggal, aktivitas: entry.aktivitas || entry.jenis || "", durasi: entry.durasi || entry.jarak || entry.jumlah || "", catatan: entry.catatan || "", updatedAt: entry.updatedAt || "" });
      });
      return rows;
    },
  },
  hafalan: {
    sheetName: "Hafalan",
    hiddenCols: ["firestoreId", "updatedAt", "menu"],
    headers: [
      { name: "firestoreId", width: 150 }, { name: "menu", width: 80 },
      { name: "tanggal", width: 100 }, { name: "suratId", width: 120 },
      { name: "juzId", width: 100 }, { name: "halaman", width: 100 },
      { name: "catatan", width: 300 }, { name: "updatedAt", width: 150 },
    ],
    flatten: (data) => {
      const rows = [];
      const membaca = data?.hafalanMembaca || {};
      Object.keys(membaca).forEach((tanggal) => {
        const entry = membaca[tanggal] || {};
        rows.push({ firestoreId: entry.id || `hafalan_${tanggal}`, menu: "hafalan", tanggal, suratId: entry.suratId || "", juzId: entry.juzId || "", halaman: `${entry.halamanMulai || 0}-${entry.halamanSelesai || 0}`, catatan: entry.catatan || "", updatedAt: entry.updatedAt || "" });
      });
      return rows;
    },
  },
  bisnis: {
    sheetName: "Bisnis",
    hiddenCols: ["firestoreId", "updatedAt", "menu"],
    cfCol: "status",
    headers: [
      { name: "firestoreId", width: 100 }, { name: "menu", width: 80 },
      { name: "brand", width: 150 }, { name: "judul", width: 250 },
      { name: "tanggalMulai", width: 100 }, { name: "tanggalSelesai", width: 100 },
      { name: "Timeline", width: 180 }, { name: "status", width: 100 },
      { name: "catatan", width: 300 }, { name: "updatedAt", width: 150 },
    ],
    flatten: (data) => {
      const rows = [];
      (data?.bisnisBrands || []).forEach((brand) => {
        (brand.kegiatan || []).forEach((keg) => {
          const start = keg.tanggalMulai || keg.tanggal || "";
          const end = keg.tanggalSelesai || keg.tanggal || "";
          rows.push({
            firestoreId: keg.id, menu: "bisnis", brand: brand.nama, judul: keg.judul || "", 
            tanggalMulai: start, tanggalSelesai: end, Timeline: generateTimelineBar(start, end),
            status: keg.status || "", catatan: keg.catatan || "", updatedAt: keg.updatedAt || "",
          });
        });
      });
      return rows;
    },
  },
  youtube: {
    sheetName: "YouTube",
    hiddenCols: ["firestoreId", "updatedAt", "menu"],
    headers: [
      { name: "firestoreId", width: 100 }, { name: "menu", width: 80 },
      { name: "channel", width: 120 }, { name: "judul", width: 250 },
      { name: "tipe", width: 100 }, { name: "tanggal", width: 100 },
      { name: "status", width: 100 }, { name: "linkYoutube", width: 250 },
      { name: "gdriveUrl", width: 250 }, { name: "catatan", width: 300 },
      { name: "updatedAt", width: 150 },
    ],
    flatten: (data) => {
      const rows = [];
      (data?.youtube_logs || []).forEach((log) => {
        rows.push({ firestoreId: log.id, menu: "youtube", channel: log.channel || "", judul: log.judul || "", tipe: log.tipe || "", tanggal: log.tanggal || "", status: log.status || "", linkYoutube: log.linkYoutube || "", gdriveUrl: log.gdriveUrl || "", catatan: log.catatan || "", updatedAt: log.updatedAt || "" });
      });
      return rows;
    },
  },
  bedahbuku: {
    sheetName: "BedahBuku",
    hiddenCols: ["firestoreId", "updatedAt", "menu"],
    headers: [
      { name: "firestoreId", width: 100 }, { name: "menu", width: 80 },
      { name: "judul", width: 250 }, { name: "penulis", width: 150 },
      { name: "kategoriId", width: 120 }, { name: "totalHalaman", width: 100 },
      { name: "targetPerHari", width: 100 }, { name: "tanggalMulai", width: 100 },
      { name: "updatedAt", width: 150 },
    ],
    flatten: (data) => {
      const rows = [];
      (data?.bedahBuku?.buku || []).forEach((b) => {
        rows.push({ firestoreId: b.id, menu: "bedahbuku", judul: b.judul || "", penulis: b.penulis || "", kategoriId: b.kategoriId || "", totalHalaman: b.totalHalaman || 0, targetPerHari: b.targetPerHari || 0, tanggalMulai: b.tanggalMulai || "", updatedAt: b.updatedAt || "" });
      });
      return rows;
    },
  },
  custom: {
    sheetName: "MenuCustom",
    hiddenCols: ["firestoreId", "updatedAt", "menu", "judul"],
    headers: [
      { name: "firestoreId", width: 100 }, { name: "menu", width: 80 },
      { name: "customId", width: 100 }, { name: "kategori", width: 150 },
      { name: "subKategori", width: 150 }, { name: "tool", width: 150 },
      { name: "fitur", width: 200 }, { name: "part", width: 250 },
      { name: "judul", width: 200 }, { name: "catatan", width: 300 },
      { name: "updatedAt", width: 150 },
    ],
    flatten: (data) => {
      const rows = [];
      const menusCustom = data?.menusCustom || {};
      Object.keys(menusCustom).forEach((customId) => {
        const menu = menusCustom[customId] || {};
        (menu.subKategori || []).forEach((sub) => {
          (sub.tools || []).forEach((tool) => {
            (tool.fitur || []).forEach((fitur) => {
              if (fitur.parts && fitur.parts.length > 0) {
                fitur.parts.forEach((part) => {
                  rows.push({ firestoreId: part.id, menu: "custom", customId, kategori: menu.nama || "", subKategori: sub.nama || "", tool: tool.nama || "", fitur: fitur.nama || "", part: part.nama || "", judul: part.nama || "", catatan: part.catatan || "", updatedAt: part.updatedAt || "" });
                });
              } else {
                rows.push({ firestoreId: fitur.id, menu: "custom", customId, kategori: menu.nama || "", subKategori: sub.nama || "", tool: tool.nama || "", fitur: fitur.nama || "", part: "", judul: fitur.nama || "", catatan: fitur.catatan || "", updatedAt: fitur.updatedAt || "" });
              }
            });
          });
        });
      });
      return rows;
    },
  },
};

// ========== GET OR CREATE SHEET ==========
async function getOrCreateSheet(sheets, spreadsheetId, sheetName) {
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
  const existing = spreadsheet.data.sheets?.find((s) => s.properties?.title === sheetName);
  if (existing) return existing.properties.sheetId;
  const result = await sheets.spreadsheets.batchUpdate({
    spreadsheetId, requestBody: { requests: [{ addSheet: { properties: { title: sheetName } } }] },
  });
  return result.data.replies?.[0]?.addSheet?.properties?.sheetId;
}

// ========== SORT ROWS ==========
function sortRows(rows) {
  return rows.slice().sort((a, b) => {
    const keys = ["kategori", "subKategori", "tool", "fitur"];
    for (const k of keys) {
      const av = (a[k] || "").toString(); const bv = (b[k] || "").toString();
      if (av !== bv) return av.localeCompare(bv);
    }
    return 0;
  });
}

// ========== ENSURE HEADER ==========
async function ensureHeader(sheets, spreadsheetId, sheetName, headers) {
  const headerValues = headers.map(h => h.name);
  try {
    const res = await sheets.spreadsheets.values.get({ spreadsheetId, range: `${sheetName}!A1:Z1` });
    const firstRow = res.data.values?.[0] || [];
    const isHeaderCorrect = firstRow.length === headerValues.length && headerValues.every((val, i) => val === firstRow[i]);
    if (!isHeaderCorrect) {
      await sheets.spreadsheets.values.clear({ spreadsheetId, range: `${sheetName}!A:Z` });
      await sheets.spreadsheets.values.update({
        spreadsheetId, range: `${sheetName}!A1`, valueInputOption: "USER_ENTERED", requestBody: { values: [headerValues] },
      });
    }
  } catch (e) {
    await sheets.spreadsheets.values.update({
      spreadsheetId, range: `${sheetName}!A1`, valueInputOption: "USER_ENTERED", requestBody: { values: [headerValues] },
    });
  }
}

// ========== CONDITIONAL FORMATTING ==========
async function replaceConditionalFormats(sheets, spreadsheetId, sheetId, targetColIdx, newRules) {
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId, fields: "sheets.properties,sheets.conditionalFormats" });
  const sheet = spreadsheet.data.sheets?.find((s) => s.properties?.sheetId === sheetId);
  const existingRules = sheet?.conditionalFormats || [];
  const deleteRequests = [];
  existingRules.forEach((rule, idx) => {
    const touches = (rule.ranges || []).some((r) => r.startColumnIndex === targetColIdx && r.endColumnIndex === targetColIdx + 1);
    if (touches) deleteRequests.push({ deleteConditionalFormatRule: { sheetId, index: idx } });
  });
  deleteRequests.sort((a, b) => b.deleteConditionalFormatRule.index - a.deleteConditionalFormatRule.index);
  const addRequests = newRules.map((rule) => ({ addConditionalFormatRule: { rule } }));
  if (deleteRequests.length === 0 && addRequests.length === 0) return;
  await sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests: [...deleteRequests, ...addRequests] } });
}

function buildCFRule(sheetId, colIdx, value, color) {
  const colLetter = getColLetter(colIdx);
  return {
    ranges: [{ sheetId, startRowIndex: 1, startColumnIndex: colIdx, endColumnIndex: colIdx + 1 }],
    booleanRule: {
      condition: { type: "CUSTOM_FORMULA", values: [{ userEnteredValue: `=EXACT($${colLetter}2,"${escapeForFormula(value)}")` }] },
      format: { backgroundColor: color },
    },
  };
}

async function applyConditionalFormatting(sheets, spreadsheetId, sheetId, config, newRows) {
  if (!config.cfCol) return;
  const colIdx = config.headers.findIndex((h) => h.name === config.cfCol);
  if (colIdx === -1) return;
  const rules = [];
  if (config.cfCol === "kategori") {
    const uniqueKategori = [...new Set(newRows.map((r) => r.kategori).filter(Boolean))].sort();
    uniqueKategori.forEach((kat, idx) => rules.push(buildCFRule(sheetId, colIdx, kat, PASTEL_COLORS[idx % PASTEL_COLORS.length])));
  } else if (config.cfCol === "status") {
    Object.keys(STATUS_COLORS).forEach((status) => rules.push(buildCFRule(sheetId, colIdx, status, STATUS_COLORS[status])));
  } else if (config.cfCol === "tipe") {
    Object.keys(TIPE_COLORS).forEach((tipe) => rules.push(buildCFRule(sheetId, colIdx, tipe, TIPE_COLORS[tipe])));
  }
  await replaceConditionalFormats(sheets, spreadsheetId, sheetId, colIdx, rules);
}

// ========== RUPIAH FORMAT ==========
async function applyRupiahFormat(sheets, spreadsheetId, sheetId, config) {
  if (!config.numCol) return;
  const colIdx = config.headers.findIndex((h) => h.name === config.numCol);
  if (colIdx === -1) return;
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{
        repeatCell: {
          range: { sheetId, startRowIndex: 1, startColumnIndex: colIdx, endColumnIndex: colIdx + 1 },
          cell: { userEnteredFormat: { numberFormat: { type: "CURRENCY", pattern: "\"Rp\"#,##0" } } },
          fields: "userEnteredFormat.numberFormat",
        },
      }],
    },
  });
}

// ========== SMART SYNC ==========
async function smartSyncRows(sheets, spreadsheetId, sheetName, headers, newRows, hiddenCols) {
  const sheetId = await getOrCreateSheet(sheets, spreadsheetId, sheetName);
  const headerNames = headers.map((h) => h.name);
  await ensureHeader(sheets, spreadsheetId, sheetName, headers);

  let oldRows = [];
  try {
    const res = await sheets.spreadsheets.values.get({ spreadsheetId, range: `${sheetName}!A2:Z` });
    oldRows = res.data.values || [];
  } catch (e) {}

  const oldMap = new Map();
  oldRows.forEach((row, idx) => { if (row[0]) oldMap.set(row[0], { row, rowIndex: idx + 2 }); });

  const newMap = new Map();
  newRows.forEach((r) => newMap.set(r.firestoreId, r));

  const toAdd = [], toUpdate = [], toDelete = [];

  for (const [id, newRow] of newMap.entries()) {
    const values = headerNames.map((h) => newRow[h] ?? "");
    if (oldMap.has(id)) {
      const old = oldMap.get(id);
      if (JSON.stringify(old.row) !== JSON.stringify(values)) toUpdate.push({ range: `${sheetName}!A${old.rowIndex}`, values: [values] });
    } else { toAdd.push(values); }
  }

  for (const [id, old] of oldMap.entries()) { if (!newMap.has(id)) toDelete.push({ rowIndex: old.rowIndex }); }

  toDelete.sort((a, b) => b.rowIndex - a.rowIndex);
  for (const del of toDelete) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId, requestBody: { requests: [{ deleteDimension: { range: { sheetId, dimension: "ROWS", startIndex: del.rowIndex - 1, endIndex: del.rowIndex } } }] },
    });
  }

  if (toUpdate.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({ spreadsheetId, requestBody: { valueInputOption: "USER_ENTERED", data: toUpdate } });
  }
  if (toAdd.length > 0) {
    await sheets.spreadsheets.values.append({
      spreadsheetId, range: `${sheetName}!A1`, valueInputOption: "USER_ENTERED", insertDataOption: "INSERT_ROWS", requestBody: { values: toAdd },
    });
  }

  const widthRequests = headers.map((h, i) => ({
    updateDimensionProperties: {
      range: { sheetId, dimension: "COLUMNS", startIndex: i, endIndex: i + 1 },
      properties: { pixelSize: h.width || 120 }, fields: "pixelSize",
    },
  }));

  const hideRequests = (hiddenCols || []).map((colName) => headerNames.indexOf(colName)).filter((idx) => idx !== -1).map((idx) => ({
    updateDimensionProperties: { range: { sheetId, dimension: "COLUMNS", startIndex: idx, endIndex: idx + 1 }, properties: { hiddenByUser: true }, fields: "hiddenByUser" },
  }));

  const showRequests = headerNames.map((colName, idx) => ({ colName, idx })).filter(({ colName }) => !(hiddenCols || []).includes(colName)).map(({ idx }) => ({
    updateDimensionProperties: { range: { sheetId, dimension: "COLUMNS", startIndex: idx, endIndex: idx + 1 }, properties: { hiddenByUser: false }, fields: "hiddenByUser" },
  }));

  const totalDataRows = Math.max(oldRows.length, newRows.length) + 5;

  const borderRequest = {
    updateBorders: {
      range: { sheetId, startRowIndex: 0, endRowIndex: Math.max(2, totalDataRows), startColumnIndex: 0, endColumnIndex: headers.length },
      top: { style: "SOLID", width: 1, color: { red: 0.8, green: 0.8, blue: 0.8 } },
      bottom: { style: "SOLID", width: 1, color: { red: 0.8, green: 0.8, blue: 0.8 } },
      left: { style: "SOLID", width: 1, color: { red: 0.8, green: 0.8, blue: 0.8 } },
      right: { style: "SOLID", width: 1, color: { red: 0.8, green: 0.8, blue: 0.8 } },
      innerHorizontal: { style: "SOLID", width: 1, color: { red: 0.8, green: 0.8, blue: 0.8 } },
      innerVertical: { style: "SOLID", width: 1, color: { red: 0.8, green: 0.8, blue: 0.8 } },
    },
  };

  const sheetData = await sheets.spreadsheets.get({ spreadsheetId, fields: "sheets.properties,sheets.bandedRanges" });
  const sheet = sheetData.data.sheets?.find((s) => s.properties?.sheetId === sheetId);
  const bandedRanges = sheet?.bandedRanges || [];
  const deleteBandingRequests = bandedRanges.map((br) => ({ deleteBanding: { bandedRangeId: br.bandedRangeId } }));

  const addBandingRequest = {
    addBanding: {
      bandedRange: {
        range: { sheetId, startRowIndex: 1, endRowIndex: Math.max(2, totalDataRows), startColumnIndex: 0, endColumnIndex: headers.length },
        rowProperties: { firstBandColor: { red: 1, green: 1, blue: 1 }, secondBandColor: { red: 0.97, green: 0.97, blue: 0.97 } },
      },
    },
  };

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        { updateSheetProperties: { properties: { sheetId, gridProperties: { frozenRowCount: 1 } }, fields: "gridProperties.frozenRowCount" } },
        {
          repeatCell: {
            range: { sheetId, startRowIndex: 0, endRowIndex: 1 },
            cell: { userEnteredFormat: { backgroundColor: { red: 0.2, green: 0.4, blue: 0.6 }, textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } }, horizontalAlignment: "CENTER", verticalAlignment: "MIDDLE" } },
            fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)",
          },
        },
        {
          repeatCell: {
            range: { sheetId, startRowIndex: 1 }, // FIX BUG: Teks Hitam untuk data!
            cell: { userEnteredFormat: { textFormat: { foregroundColor: { red: 0, green: 0, blue: 0 } }, wrapStrategy: "WRAP", verticalAlignment: "MIDDLE" } },
            fields: "userEnteredFormat(textFormat,wrapStrategy,verticalAlignment)",
          },
        },
        ...widthRequests, ...hideRequests, ...showRequests, borderRequest, ...deleteBandingRequests, addBandingRequest,
      ],
    },
  });

  return sheetId;
}

// ========== DASHBOARD (DEADLINE TERDEKAT) ==========
async function updateDashboardSheet(sheets, spreadsheetId, userData) {
  const sheetName = "Dashboard";
  const sheetId = await getOrCreateSheet(sheets, spreadsheetId, sheetName);
  const now = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });

  // ---- Kumpulkan Deadline Terdekat ----
  const deadlines = [];
  
  // Dari Pekerjaan
  (userData.pekerjaan || []).forEach((pt) => {
    (pt.brands || []).forEach((brand) => {
      (brand.kegiatan || []).forEach((keg) => {
        if (keg.status !== "selesai" && (keg.tanggalSelesai || keg.tanggal)) {
          deadlines.push({
            tipe: "Pekerjaan", pt: pt.nama, brand: brand.nama, judul: keg.judul, tanggal: keg.tanggalSelesai || keg.tanggal
          });
        }
      });
    });
  });

  // Dari Bisnis
  (userData.bisnisBrands || []).forEach((brand) => {
    (brand.kegiatan || []).forEach((keg) => {
      if (keg.status !== "selesai" && (keg.tanggalSelesai || keg.tanggal)) {
        deadlines.push({
          tipe: "Bisnis", pt: "-", brand: brand.nama, judul: keg.judul, tanggal: keg.tanggalSelesai || keg.tanggal
        });
      }
    });
  });

  // Urutkan dari tanggal terdekat
  deadlines.sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));
  const topDeadlines = deadlines.slice(0, 10); // Ambil 10 teratas

  // ---- Keuangan bulan ini ----
  const now2 = new Date();
  const currentMonth = `${now2.getFullYear()}-${String(now2.getMonth() + 1).padStart(2, "0")}`;
  let masukBulan = 0, keluarBulan = 0, tabunganBulan = 0, sedekahBulan = 0;
  Object.keys(userData.keuanganTransaksi || {}).forEach((tanggal) => {
    if (!tanggal.startsWith(currentMonth)) return;
    (userData.keuanganTransaksi[tanggal] || []).forEach((tx) => {
      const nominal = Number(tx.jumlah || tx.nominal || 0);
      const tipe = (tx.tipe || tx.jenis || "").toLowerCase();
      if (tipe === "masuk") masukBulan += nominal;
      else if (tipe === "keluar") keluarBulan += nominal;
      else if (tipe === "tabungan") tabunganBulan += nominal;
      else if (tipe === "sedekah") sedekahBulan += nominal;
    });
  });
  const saldoBulan = masukBulan - keluarBulan - tabunganBulan - sedekahBulan;

  // ---- Build values ----
  const values = [];
  values.push(["📊 SELF MANAGEMENT DASHBOARD", "", "", "", ""]);
  values.push([`Terakhir di-sync: ${now}`, "", "", "", ""]);
  values.push(["", "", "", "", ""]);
  
  // Deadline Table
  values.push(["📅 DEADLINE TERDEKAT (BELUM SELESAI)", "", "", "", ""]);
  values.push(["Tipe", "PT / Brand", "Kegiatan", "Deadline", "Sisa Hari"]);
  
  const today = new Date();
  today.setHours(0,0,0,0);
  
  topDeadlines.forEach((d) => {
    const deadlineDate = new Date(d.tanggal);
    deadlineDate.setHours(0,0,0,0);
    const diffDays = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
    
    let statusHari = `H-${diffDays}`;
    if (diffDays < 0) statusHari = `Lewat ${Math.abs(diffDays)} hari`;
    else if (diffDays === 0) statusHari = `Hari Ini!`;
    
    values.push([d.tipe, `${d.pt} - ${d.brand}`, d.judul, d.tanggal, statusHari]);
  });

  const deadlineEndRow = 5 + topDeadlines.length;

  values.push(["", "", "", "", ""]);
  const keuanganHeaderRow = deadlineEndRow + 2; 
  values.push([`💰 RINGKASAN KEUANGAN BULAN INI (${currentMonth})`, "", "", "", ""]);
  values.push(["Kategori", "Nominal", "% dari Masuk", "Progress", ""]);

  const buildKeuanganRow = (label, nominal) => {
    const pctVal = masukBulan > 0 ? (nominal / masukBulan) : 0;
    const pctStr = (pctVal * 100).toFixed(1) + "%";
    const progressBar = masukBulan > 0 ? getProgressBar(pctVal * 100) : "-";
    return [label, nominal, pctStr, progressBar, ""];
  };

  values.push(buildKeuanganRow("Masuk", masukBulan));
  values.push(buildKeuanganRow("Keluar", keluarBulan));
  values.push(buildKeuanganRow("Tabungan", tabunganBulan));
  values.push(buildKeuanganRow("Sedekah", sedekahBulan));
  values.push(["", "", "", "", ""]);
  values.push(["Saldo Bersih", saldoBulan, "", "", ""]);

  // Unmerge & Clear
  try {
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId, fields: "sheets.properties,sheets.merges" });
    const sheet = spreadsheet.data.sheets?.find((s) => s.properties?.sheetId === sheetId);
    if (sheet?.merges?.length > 0) {
      await sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests: sheet.merges.map((m) => ({ unmergeCells: { range: m } })) } });
    }
  } catch (e) {}
  try { await sheets.spreadsheets.values.clear({ spreadsheetId, range: `${sheetName}!A:Z` }); } catch (e) {}

  // Write values
  await sheets.spreadsheets.values.update({
    spreadsheetId, range: `${sheetName}!A1`, valueInputOption: "USER_ENTERED", requestBody: { values },
  });

  // Styling
  const totalRows = values.length;
  const requests = [
    { mergeCells: { range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 5 }, mergeType: "MERGE_ALL" } },
    { mergeCells: { range: { sheetId, startRowIndex: 1, endRowIndex: 2, startColumnIndex: 0, endColumnIndex: 5 }, mergeType: "MERGE_ALL" } },
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 0, endRowIndex: 1 },
        cell: { userEnteredFormat: { backgroundColor: { red: 0.1, green: 0.2, blue: 0.4 }, textFormat: { bold: true, fontSize: 16, foregroundColor: { red: 1, green: 1, blue: 1 } }, horizontalAlignment: "CENTER", verticalAlignment: "MIDDLE", padding: { top: 12, bottom: 12 } } },
        fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment,padding)",
      },
    },
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: 2 },
        cell: { userEnteredFormat: { textFormat: { italic: true, fontSize: 10, foregroundColor: { red: 0.4, green: 0.4, blue: 0.4 } }, horizontalAlignment: "CENTER", padding: { bottom: 8 } } },
        fields: "userEnteredFormat(textFormat,horizontalAlignment,padding)",
      },
    },
  ];

  // Section Header Style
  const sectionHeaderRows = [4, keuanganHeaderRow]; 
  sectionHeaderRows.forEach((row1Based) => {
    const rowIdx = row1Based - 1; 
    requests.push({ mergeCells: { range: { sheetId, startRowIndex: rowIdx, endRowIndex: rowIdx + 1, startColumnIndex: 0, endColumnIndex: 5 }, mergeType: "MERGE_ALL" } });
    requests.push({
      repeatCell: {
        range: { sheetId, startRowIndex: rowIdx, endRowIndex: rowIdx + 1 },
        cell: { userEnteredFormat: { backgroundColor: { red: 0.25, green: 0.5, blue: 0.7 }, textFormat: { bold: true, fontSize: 12, foregroundColor: { red: 1, green: 1, blue: 1 } }, horizontalAlignment: "LEFT", verticalAlignment: "MIDDLE", padding: { top: 8, bottom: 8, left: 8 } } },
        fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment,padding)",
      },
    });
  });

  // Table Header Style
  const tableHeaderRows = [5, keuanganHeaderRow + 1]; 
  tableHeaderRows.forEach((row1Based) => {
    const rowIdx = row1Based - 1;
    requests.push({
      repeatCell: {
        range: { sheetId, startRowIndex: rowIdx, endRowIndex: rowIdx + 1, startColumnIndex: 0, endColumnIndex: 5 },
        cell: { userEnteredFormat: { backgroundColor: { red: 0.9, green: 0.9, blue: 0.9 }, textFormat: { bold: true, fontSize: 10, foregroundColor: {red:0, green:0, blue:0} }, horizontalAlignment: "CENTER", verticalAlignment: "MIDDLE", padding: { top: 6, bottom: 6 }, borders: { top: { style: "SOLID", color: { red: 0.6, green: 0.6, blue: 0.6 } }, bottom: { style: "SOLID", color: { red: 0.6, green: 0.6, blue: 0.6 } }, left: { style: "SOLID", color: { red: 0.6, green: 0.6, blue: 0.6 } }, right: { style: "SOLID", color: { red: 0.6, green: 0.6, blue: 0.6 } } } } },
        fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment,padding,borders)",
      },
    });
  });

  requests.push(
    { updateDimensionProperties: { range: { sheetId, dimension: "COLUMNS", startIndex: 0, endIndex: 1 }, properties: { pixelSize: 250 }, fields: "pixelSize" } },
    { updateDimensionProperties: { range: { sheetId, dimension: "COLUMNS", startIndex: 1, endIndex: 2 }, properties: { pixelSize: 150 }, fields: "pixelSize" } },
    { updateDimensionProperties: { range: { sheetId, dimension: "COLUMNS", startIndex: 2, endIndex: 3 }, properties: { pixelSize: 200 }, fields: "pixelSize" } },
    { updateDimensionProperties: { range: { sheetId, dimension: "COLUMNS", startIndex: 3, endIndex: 4 }, properties: { pixelSize: 120 }, fields: "pixelSize" } },
    { updateDimensionProperties: { range: { sheetId, dimension: "COLUMNS", startIndex: 4, endIndex: 5 }, properties: { pixelSize: 200 }, fields: "pixelSize" } }
  );

  requests.push({ updateSheetProperties: { properties: { sheetId, gridProperties: { frozenRowCount: 2 } }, fields: "gridProperties.frozenRowCount" } });

  await sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests } });
}

// ========== MAIN HANDLER ==========
export async function POST(req) {
  try {
    const body = await req.json();
    const { uid } = body;
    if (!uid) return NextResponse.json({ error: "uid wajib diisi" }, { status: 400 });

    const admin = getAdminApp();
    const firestore = getFirestore(admin);
    const userRef = firestore.collection("users").doc(uid);
    const userSnap = await userRef.get();
    if (!userSnap.exists) return NextResponse.json({ error: "user tidak ditemukan" }, { status: 404 });

    const userData = userSnap.data();
    const auth = getAuth();
    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
    if (!spreadsheetId) return NextResponse.json({ error: "GOOGLE_SHEETS_ID belum diset" }, { status: 500 });

    try { await updateDashboardSheet(sheets, spreadsheetId, userData); } catch (err) { console.error("[sync-sheets] dashboard error:", err.message); }

    const results = [];
    for (const [menuKey, config] of Object.entries(MENU_CONFIG)) {
      try {
        const rawRows = config.flatten(userData);
        const sortedRows = sortRows(rawRows);
        const sheetId = await smartSyncRows(sheets, spreadsheetId, config.sheetName, config.headers, sortedRows, config.hiddenCols || []);

        try { await applyConditionalFormatting(sheets, spreadsheetId, sheetId, config, sortedRows); } catch (e) { console.error(`[sync-sheets] CF error ${menuKey}:`, e.message); }
        try { await applyRupiahFormat(sheets, spreadsheetId, sheetId, config); } catch (e) { console.error(`[sync-sheets] numFormat error ${menuKey}:`, e.message); }

        results.push({ menu: menuKey, sheet: config.sheetName, rows: sortedRows.length, status: "ok" });
      } catch (err) {
        console.error(`[sync-sheets] Error sync ${menuKey}:`, err.message);
        results.push({ menu: menuKey, sheet: config.sheetName, status: "error", error: err.message });
      }
    }

    return NextResponse.json({ success: true, timestamp: new Date().toISOString(), results, spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}` });
  } catch (err) {
    console.error("[sync-sheets] Fatal error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: "Endpoint sync-sheets aktif. Gunakan POST dengan { uid }." });
}