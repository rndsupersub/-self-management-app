// app/api/sync-sheets/route.js
import { NextResponse } from "next/server";
import { google } from "googleapis";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// ========== CONSTANTS ==========
const PASTEL_COLORS = [
  { red: 0.85, green: 0.92, blue: 1.0 },
  { red: 1.0, green: 0.95, blue: 0.8 },
  { red: 0.9, green: 1.0, blue: 0.9 },
  { red: 1.0, green: 0.9, blue: 0.9 },
  { red: 0.95, green: 0.9, blue: 1.0 },
  { red: 1.0, green: 0.92, blue: 0.85 },
  { red: 0.85, green: 0.95, blue: 0.95 },
  { red: 0.95, green: 0.85, blue: 0.95 },
  { red: 0.9, green: 0.92, blue: 0.85 },
  { red: 0.9, green: 0.88, blue: 0.85 },
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

// ========== FIREBASE ADMIN ==========
let adminApp = null;
function getAdminApp() {
  if (adminApp) return adminApp;
  if (getApps().length > 0) {
    adminApp = getApps()[0];
    return adminApp;
  }
  const privateKey = parsePrivateKey(process.env.FIREBASE_PRIVATE_KEY);
  adminApp = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  });
  return adminApp;
}

// ========== GOOGLE AUTH ==========
function getAuth() {
  const privateKey = parsePrivateKey(process.env.GOOGLE_PRIVATE_KEY);
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: privateKey,
    },
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
      { name: "firestoreId", width: 100 },
      { name: "menu", width: 80 },
      { name: "kategori", width: 180 },
      { name: "subKategori", width: 150 },
      { name: "tool", width: 150 },
      { name: "fitur", width: 200 },
      { name: "part", width: 250 },
      { name: "judul", width: 200 },
      { name: "tanggal", width: 100 },
      { name: "status", width: 80 },
      { name: "catatan", width: 300 },
      { name: "gdriveUrl", width: 250 },
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
                  rows.push({
                    firestoreId: part.id,
                    menu: "belajar",
                    kategori: kat.nama,
                    subKategori: sub.nama,
                    tool: tool.nama,
                    fitur: fitur.nama,
                    part: part.nama,
                    judul: part.nama,
                    tanggal: "",
                    status: "",
                    catatan: part.catatan || "",
                    gdriveUrl: part.gdriveUrl || "",
                    updatedAt: part.updatedAt || "",
                  });
                });
              } else {
                rows.push({
                  firestoreId: fitur.id,
                  menu: "belajar",
                  kategori: kat.nama,
                  subKategori: sub.nama,
                  tool: tool.nama,
                  fitur: fitur.nama,
                  part: "",
                  judul: fitur.nama,
                  tanggal: "",
                  status: "",
                  catatan: fitur.catatan || "",
                  gdriveUrl: fitur.gdriveUrl || "",
                  updatedAt: fitur.updatedAt || "",
                });
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
      { name: "firestoreId", width: 100 },
      { name: "menu", width: 80 },
      { name: "pt", width: 150 },
      { name: "brand", width: 150 },
      { name: "judul", width: 250 },
      { name: "tanggal", width: 100 },
      { name: "status", width: 100 },
      { name: "catatan", width: 300 },
      { name: "updatedAt", width: 150 },
    ],
    flatten: (data) => {
      const rows = [];
      (data?.pekerjaan || []).forEach((pt) => {
        (pt.brands || []).forEach((brand) => {
          (brand.kegiatan || []).forEach((keg) => {
            rows.push({
              firestoreId: keg.id,
              menu: "pekerjaan",
              pt: pt.nama,
              brand: brand.nama,
              judul: keg.judul || "",
              tanggal: keg.tanggal || "",
              status: keg.status || "",
              catatan: keg.catatan || "",
              updatedAt: keg.updatedAt || "",
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
      { name: "firestoreId", width: 100 },
      { name: "menu", width: 80 },
      { name: "tanggal", width: 100 },
      { name: "tipe", width: 100 },
      { name: "kategori", width: 150 },
      { name: "jumlah", width: 120 },
      { name: "dompet", width: 120 },
      { name: "catatan", width: 300 },
      { name: "updatedAt", width: 150 },
    ],
    flatten: (data) => {
      const rows = [];
      const transaksi = data?.keuanganTransaksi || {};
      Object.keys(transaksi).forEach((tanggal) => {
        (transaksi[tanggal] || []).forEach((tx) => {
          rows.push({
            firestoreId: tx.id,
            menu: "keuangan",
            tanggal,
            tipe: tx.tipe || tx.jenis || "",
            kategori: tx.kategori || tx.kategoriId || "",
            jumlah: tx.jumlah || tx.nominal || 0,
            dompet: tx.dompet || tx.walletId || "",
            catatan: tx.catatan || "",
            updatedAt: tx.updatedAt || "",
          });
        });
      });
      return rows;
    },
  },
  olahraga: {
    sheetName: "Olahraga",
    hiddenCols: ["firestoreId", "updatedAt", "menu"],
    headers: [
      { name: "firestoreId", width: 150 },
      { name: "menu", width: 80 },
      { name: "tanggal", width: 100 },
      { name: "aktivitas", width: 150 },
      { name: "durasi", width: 100 },
      { name: "catatan", width: 300 },
      { name: "updatedAt", width: 150 },
    ],
    flatten: (data) => {
      const rows = [];
      const harian = data?.olahraga?.harian || {};
      Object.keys(harian).forEach((tanggal) => {
        const entry = harian[tanggal] || {};
        rows.push({
          firestoreId: `olahraga_${tanggal}`,
          menu: "olahraga",
          tanggal,
          aktivitas: entry.aktivitas || entry.jenis || "",
          durasi: entry.durasi || entry.jarak || entry.jumlah || "",
          catatan: entry.catatan || "",
          updatedAt: entry.updatedAt || "",
        });
      });
      return rows;
    },
  },
  hafalan: {
    sheetName: "Hafalan",
    hiddenCols: ["firestoreId", "updatedAt", "menu"],
    headers: [
      { name: "firestoreId", width: 150 },
      { name: "menu", width: 80 },
      { name: "tanggal", width: 100 },
      { name: "suratId", width: 120 },
      { name: "juzId", width: 100 },
      { name: "halaman", width: 100 },
      { name: "catatan", width: 300 },
      { name: "updatedAt", width: 150 },
    ],
    flatten: (data) => {
      const rows = [];
      const membaca = data?.hafalanMembaca || {};
      Object.keys(membaca).forEach((tanggal) => {
        const entry = membaca[tanggal] || {};
        rows.push({
          firestoreId: entry.id || `hafalan_${tanggal}`,
          menu: "hafalan",
          tanggal,
          suratId: entry.suratId || "",
          juzId: entry.juzId || "",
          halaman: `${entry.halamanMulai || 0}-${entry.halamanSelesai || 0}`,
          catatan: entry.catatan || "",
          updatedAt: entry.updatedAt || "",
        });
      });
      return rows;
    },
  },
  bisnis: {
    sheetName: "Bisnis",
    hiddenCols: ["firestoreId", "updatedAt", "menu"],
    cfCol: "status",
    headers: [
      { name: "firestoreId", width: 100 },
      { name: "menu", width: 80 },
      { name: "brand", width: 150 },
      { name: "judul", width: 250 },
      { name: "tanggal", width: 100 },
      { name: "status", width: 100 },
      { name: "catatan", width: 300 },
      { name: "updatedAt", width: 150 },
    ],
    flatten: (data) => {
      const rows = [];
      (data?.bisnisBrands || []).forEach((brand) => {
        (brand.kegiatan || []).forEach((keg) => {
          rows.push({
            firestoreId: keg.id,
            menu: "bisnis",
            brand: brand.nama,
            judul: keg.judul || "",
            tanggal: keg.tanggal || "",
            status: keg.status || "",
            catatan: keg.catatan || "",
            updatedAt: keg.updatedAt || "",
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
      { name: "firestoreId", width: 100 },
      { name: "menu", width: 80 },
      { name: "channel", width: 120 },
      { name: "judul", width: 250 },
      { name: "tipe", width: 100 },
      { name: "tanggal", width: 100 },
      { name: "status", width: 100 },
      { name: "linkYoutube", width: 250 },
      { name: "gdriveUrl", width: 250 },
      { name: "catatan", width: 300 },
      { name: "updatedAt", width: 150 },
    ],
    flatten: (data) => {
      const rows = [];
      (data?.youtube_logs || []).forEach((log) => {
        rows.push({
          firestoreId: log.id,
          menu: "youtube",
          channel: log.channel || "",
          judul: log.judul || "",
          tipe: log.tipe || "",
          tanggal: log.tanggal || "",
          status: log.status || "",
          linkYoutube: log.linkYoutube || "",
          gdriveUrl: log.gdriveUrl || "",
          catatan: log.catatan || "",
          updatedAt: log.updatedAt || "",
        });
      });
      return rows;
    },
  },
  bedahbuku: {
    sheetName: "BedahBuku",
    hiddenCols: ["firestoreId", "updatedAt", "menu"],
    headers: [
      { name: "firestoreId", width: 100 },
      { name: "menu", width: 80 },
      { name: "judul", width: 250 },
      { name: "penulis", width: 150 },
      { name: "kategoriId", width: 120 },
      { name: "totalHalaman", width: 100 },
      { name: "targetPerHari", width: 100 },
      { name: "tanggalMulai", width: 100 },
      { name: "updatedAt", width: 150 },
    ],
    flatten: (data) => {
      const rows = [];
      (data?.bedahBuku?.buku || []).forEach((b) => {
        rows.push({
          firestoreId: b.id,
          menu: "bedahbuku",
          judul: b.judul || "",
          penulis: b.penulis || "",
          kategoriId: b.kategoriId || "",
          totalHalaman: b.totalHalaman || 0,
          targetPerHari: b.targetPerHari || 0,
          tanggalMulai: b.tanggalMulai || "",
          updatedAt: b.updatedAt || "",
        });
      });
      return rows;
    },
  },
  custom: {
    sheetName: "MenuCustom",
    hiddenCols: ["firestoreId", "updatedAt", "menu", "judul"],
    headers: [
      { name: "firestoreId", width: 100 },
      { name: "menu", width: 80 },
      { name: "customId", width: 100 },
      { name: "kategori", width: 150 },
      { name: "subKategori", width: 150 },
      { name: "tool", width: 150 },
      { name: "fitur", width: 200 },
      { name: "part", width: 250 },
      { name: "judul", width: 200 },
      { name: "catatan", width: 300 },
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
                  rows.push({
                    firestoreId: part.id,
                    menu: "custom",
                    customId,
                    kategori: menu.nama || "",
                    subKategori: sub.nama || "",
                    tool: tool.nama || "",
                    fitur: fitur.nama || "",
                    part: part.nama || "",
                    judul: part.nama || "",
                    catatan: part.catatan || "",
                    updatedAt: part.updatedAt || "",
                  });
                });
              } else {
                rows.push({
                  firestoreId: fitur.id,
                  menu: "custom",
                  customId,
                  kategori: menu.nama || "",
                  subKategori: sub.nama || "",
                  tool: tool.nama || "",
                  fitur: fitur.nama || "",
                  part: "",
                  judul: fitur.nama || "",
                  catatan: fitur.catatan || "",
                  updatedAt: fitur.updatedAt || "",
                });
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
  const existing = spreadsheet.data.sheets?.find(
    (s) => s.properties?.title === sheetName
  );
  if (existing) return existing.properties.sheetId;

  const result = await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{ addSheet: { properties: { title: sheetName } } }],
    },
  });
  return result.data.replies?.[0]?.addSheet?.properties?.sheetId;
}

// ========== SORT ROWS ==========
function sortRows(rows) {
  return rows.slice().sort((a, b) => {
    const keys = ["kategori", "subKategori", "tool", "fitur"];
    for (const k of keys) {
      const av = (a[k] || "").toString();
      const bv = (b[k] || "").toString();
      if (av !== bv) return av.localeCompare(bv);
    }
    return 0;
  });
}

// ========== CONDITIONAL FORMATTING ==========
async function replaceConditionalFormats(sheets, spreadsheetId, sheetId, targetColIdx, newRules) {
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets.properties,sheets.conditionalFormats",
  });
  const sheet = spreadsheet.data.sheets?.find((s) => s.properties?.sheetId === sheetId);
  const existingRules = sheet?.conditionalFormats || [];

  // Delete existing rules that touch target column
  const deleteRequests = [];
  existingRules.forEach((rule, idx) => {
    const touches = (rule.ranges || []).some(
      (r) => r.startColumnIndex === targetColIdx && r.endColumnIndex === targetColIdx + 1
    );
    if (touches) {
      deleteRequests.push({ deleteConditionalFormatRule: { sheetId, index: idx } });
    }
  });
  // Delete in reverse order to avoid index shifts
  deleteRequests.sort(
    (a, b) => b.deleteConditionalFormatRule.index - a.deleteConditionalFormatRule.index
  );

  const addRequests = newRules.map((rule) => ({
    addConditionalFormatRule: { rule },
  }));

  if (deleteRequests.length === 0 && addRequests.length === 0) return;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [...deleteRequests, ...addRequests],
    },
  });
}

function buildCFRule(sheetId, colIdx, value, color) {
  const colLetter = getColLetter(colIdx);
  const rule = {
    ranges: [
      {
        sheetId,
        startRowIndex: 1,
        startColumnIndex: colIdx,
        endColumnIndex: colIdx + 1,
      },
    ],
    booleanRule: {
      condition: {
        type: "CUSTOM_FORMULA",
        values: [
          {
            userEnteredValue: `=EXACT($${colLetter}2,"${escapeForFormula(value)}")`,
          },
        ],
      },
      format: {
        backgroundColor: color,
      },
    },
  };
  return rule;
}

async function applyConditionalFormatting(sheets, spreadsheetId, sheetId, config, newRows) {
  if (!config.cfCol) return;
  const colIdx = config.headers.findIndex((h) => h.name === config.cfCol);
  if (colIdx === -1) return;

  const rules = [];

  if (config.cfCol === "kategori") {
    const uniqueKategori = [...new Set(newRows.map((r) => r.kategori).filter(Boolean))].sort();
    uniqueKategori.forEach((kat, idx) => {
      const color = PASTEL_COLORS[idx % PASTEL_COLORS.length];
      rules.push(buildCFRule(sheetId, colIdx, kat, color));
    });
  } else if (config.cfCol === "status") {
    Object.keys(STATUS_COLORS).forEach((status) => {
      rules.push(buildCFRule(sheetId, colIdx, status, STATUS_COLORS[status]));
    });
  } else if (config.cfCol === "tipe") {
    Object.keys(TIPE_COLORS).forEach((tipe) => {
      rules.push(buildCFRule(sheetId, colIdx, tipe, TIPE_COLORS[tipe]));
    });
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
      requests: [
        {
          repeatCell: {
            range: {
              sheetId,
              startRowIndex: 1,
              startColumnIndex: colIdx,
              endColumnIndex: colIdx + 1,
            },
            cell: {
              userEnteredFormat: {
                numberFormat: { type: "CURRENCY", pattern: "\"Rp\"#,##0" },
              },
            },
            fields: "userEnteredFormat.numberFormat",
          },
        },
      ],
    },
  });
}

// ========== SMART SYNC ==========
async function smartSyncRows(sheets, spreadsheetId, sheetName, headers, newRows, hiddenCols) {
  const sheetId = await getOrCreateSheet(sheets, spreadsheetId, sheetName);
  const headerNames = headers.map((h) => h.name);

  // 1. Read old data
  let oldRows = [];
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A2:Z`,
    });
    oldRows = res.data.values || [];
  } catch (e) {}

  // 2. Map old
  const oldMap = new Map();
  oldRows.forEach((row, idx) => {
    const id = row[0];
    if (id) oldMap.set(id, { row, rowIndex: idx + 2 });
  });

  const newMap = new Map();
  newRows.forEach((r) => newMap.set(r.firestoreId, r));

  const toAdd = [];
  const toUpdate = [];
  const toDelete = [];

  for (const [id, newRow] of newMap.entries()) {
    const values = headerNames.map((h) => newRow[h] ?? "");
    if (oldMap.has(id)) {
      const old = oldMap.get(id);
      if (JSON.stringify(old.row) !== JSON.stringify(values)) {
        toUpdate.push({ range: `${sheetName}!A${old.rowIndex}`, values: [values] });
      }
    } else {
      toAdd.push(values);
    }
  }

  for (const [id, old] of oldMap.entries()) {
    if (!newMap.has(id)) toDelete.push({ rowIndex: old.rowIndex });
  }

  // 3. Delete (from bottom to top)
  toDelete.sort((a, b) => b.rowIndex - a.rowIndex);
  for (const del of toDelete) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId,
                dimension: "ROWS",
                startIndex: del.rowIndex - 1,
                endIndex: del.rowIndex,
              },
            },
          },
        ],
      },
    });
  }

  // 4. Update
  if (toUpdate.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: { valueInputOption: "USER_ENTERED", data: toUpdate },
    });
  }

  // 5. Add
  if (toAdd.length > 0) {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: toAdd },
    });
  }

  // 6. Styling base (width, header, wrap, border, banding, freeze, hide)
  const widthRequests = headers.map((h, i) => ({
    updateDimensionProperties: {
      range: { sheetId, dimension: "COLUMNS", startIndex: i, endIndex: i + 1 },
      properties: { pixelSize: h.width || 120 },
      fields: "pixelSize",
    },
  }));

  const hideRequests = (hiddenCols || [])
    .map((colName) => headerNames.indexOf(colName))
    .filter((idx) => idx !== -1)
    .map((idx) => ({
      updateDimensionProperties: {
        range: { sheetId, dimension: "COLUMNS", startIndex: idx, endIndex: idx + 1 },
        properties: { hiddenByUser: true },
        fields: "hiddenByUser",
      },
    }));

  // Show columns that shouldn't be hidden (in case previously hidden)
  const showRequests = headerNames
    .map((colName, idx) => ({ colName, idx }))
    .filter(({ colName }) => !(hiddenCols || []).includes(colName))
    .map(({ idx }) => ({
      updateDimensionProperties: {
        range: { sheetId, dimension: "COLUMNS", startIndex: idx, endIndex: idx + 1 },
        properties: { hiddenByUser: false },
        fields: "hiddenByUser",
      },
    }));

  const totalDataRows = Math.max(oldRows.length, newRows.length) + 5;

  const borderRequest = {
    updateBorders: {
      range: {
        sheetId,
        startRowIndex: 0,
        endRowIndex: Math.max(2, totalDataRows),
        startColumnIndex: 0,
        endColumnIndex: headers.length,
      },
      top: { style: "SOLID", width: 1, color: { red: 0.8, green: 0.8, blue: 0.8 } },
      bottom: { style: "SOLID", width: 1, color: { red: 0.8, green: 0.8, blue: 0.8 } },
      left: { style: "SOLID", width: 1, color: { red: 0.8, green: 0.8, blue: 0.8 } },
      right: { style: "SOLID", width: 1, color: { red: 0.8, green: 0.8, blue: 0.8 } },
      innerHorizontal: { style: "SOLID", width: 1, color: { red: 0.8, green: 0.8, blue: 0.8 } },
      innerVertical: { style: "SOLID", width: 1, color: { red: 0.8, green: 0.8, blue: 0.8 } },
    },
  };

  const sheetData = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets.properties,sheets.bandedRanges",
  });
  const sheet = sheetData.data.sheets?.find((s) => s.properties?.sheetId === sheetId);
  const bandedRanges = sheet?.bandedRanges || [];
  const deleteBandingRequests = bandedRanges.map((br) => ({
    deleteBanding: { bandedRangeId: br.bandedRangeId },
  }));

  const addBandingRequest = {
    addBanding: {
      bandedRange: {
        range: {
          sheetId,
          startRowIndex: 1,
          endRowIndex: Math.max(2, totalDataRows),
          startColumnIndex: 0,
          endColumnIndex: headers.length,
        },
        rowProperties: {
          firstBandColor: { red: 1, green: 1, blue: 1 },
          secondBandColor: { red: 0.97, green: 0.97, blue: 0.97 },
        },
      },
    },
  };

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          updateSheetProperties: {
            properties: { sheetId, gridProperties: { frozenRowCount: 1 } },
            fields: "gridProperties.frozenRowCount",
          },
        },
        {
          repeatCell: {
            range: { sheetId, startRowIndex: 0, endRowIndex: 1 },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.2, green: 0.4, blue: 0.6 },
                textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } },
                horizontalAlignment: "CENTER",
                verticalAlignment: "MIDDLE",
              },
            },
            fields:
              "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)",
          },
        },
        {
          repeatCell: {
            range: { sheetId, startRowIndex: 1 },
            cell: {
              userEnteredFormat: { wrapStrategy: "WRAP", verticalAlignment: "TOP" },
            },
            fields: "userEnteredFormat(wrapStrategy,verticalAlignment)",
          },
        },
        ...widthRequests,
        ...hideRequests,
        ...showRequests,
        borderRequest,
        ...deleteBandingRequests,
        addBandingRequest,
      ],
    },
  });

  return sheetId;
}

// ========== DASHBOARD ==========
async function updateDashboardSheet(sheets, spreadsheetId, userData) {
  const sheetName = "Dashboard";
  const sheetId = await getOrCreateSheet(sheets, spreadsheetId, sheetName);
  const now = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });

  // ---- Summary ----
  const totalBelajar = (userData.belajar?.kategori || []).reduce((acc, kat) => {
    return acc + (kat.subKategori || []).reduce((a2, sub) => {
      return a2 + (sub.tools || []).reduce((a3, tool) => {
        return a3 + (tool.fitur || []).reduce((a4, fitur) => {
          return a4 + (fitur.parts?.length || 0);
        }, 0);
      }, 0);
    }, 0);
  }, 0);

  const totalPekerjaan = (userData.pekerjaan || []).reduce((acc, pt) => {
    return acc + (pt.brands || []).reduce((a2, brand) => a2 + (brand.kegiatan?.length || 0), 0);
  }, 0);

  const totalKeuangan = Object.values(userData.keuanganTransaksi || {}).reduce(
    (acc, list) => acc + (list?.length || 0),
    0
  );
  const totalHafalan = Object.keys(userData.hafalanMembaca || {}).length;
  const totalOlahraga = Object.keys(userData.olahraga?.harian || {}).length;
  const totalBisnis = (userData.bisnisBrands || []).reduce(
    (acc, brand) => acc + (brand.kegiatan?.length || 0),
    0
  );
  const totalYoutube = (userData.youtube_logs || []).length;
  const totalBedahBuku = (userData.bedahBuku?.buku || []).length;

  // ---- Progress per kategori ----
  const kategoriProgress = (userData.belajar?.kategori || []).map((kat) => {
    let total = 0;
    let terisi = 0;
    (kat.subKategori || []).forEach((sub) => {
      (sub.tools || []).forEach((tool) => {
        (tool.fitur || []).forEach((fitur) => {
          (fitur.parts || []).forEach((part) => {
            total++;
            if (
              (part.catatan && part.catatan.trim() !== "") ||
              (part.gdriveUrl && part.gdriveUrl.trim() !== "")
            ) {
              terisi++;
            }
          });
        });
      });
    });
    return { nama: kat.nama || "Unknown", terisi, total };
  });

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
  values.push(["📈 RINGKASAN", "", "", "", ""]);
  values.push(["📚 Total Belajar (Part)", totalBelajar, "💼 Total Pekerjaan", totalPekerjaan, ""]);
  values.push(["💰 Total Keuangan", totalKeuangan, "📖 Total Hafalan", totalHafalan, ""]);
  values.push(["🏃 Total Olahraga", totalOlahraga, "🏢 Total Bisnis", totalBisnis, ""]);
  values.push(["📺 Total YouTube", totalYoutube, "📚 Total Bedah Buku", totalBedahBuku, ""]);
  values.push(["", "", "", "", ""]);
  values.push(["📚 PROGRESS BELAJAR PER KATEGORI", "", "", "", ""]);
  values.push(["Kategori", "Terisi", "Total", "%", "Progress"]);

  const progressStartRow = 11; // 0-indexed = row 12 (1-based)
  kategoriProgress.forEach((k) => {
    const pct = k.total > 0 ? (k.terisi / k.total) * 100 : 0;
    const sparkline =
      k.total > 0
        ? `=SPARKLINE({${k.terisi},${k.total - k.terisi}},{"charttype","bar";"color1","#4CAF50";"color2","#E0E0E0";"max",${k.total}})`
        : "-";
    values.push([
      k.nama,
      k.terisi,
      k.total,
      pct.toFixed(1) + "%",
      sparkline,
    ]);
  });

  const progressEndRow = 11 + kategoriProgress.length;

  values.push(["", "", "", "", ""]);
  const keuanganHeaderRow = progressEndRow + 2; // 1-based row index for header
  values.push([`💰 RINGKASAN KEUANGAN BULAN INI (${currentMonth})`, "", "", "", ""]);
  values.push(["Kategori", "Nominal", "% dari Masuk", "Progress", ""]);

  const keuanganDataStart = progressEndRow + 4;
  const buildKeuanganRow = (label, nominal) => {
    const pct = masukBulan > 0 ? (nominal / masukBulan) * 100 : 0;
    const sparkline =
      masukBulan > 0
        ? `=SPARKLINE({${nominal},${masukBulan - nominal}},{"charttype","bar";"color1","#4CAF50";"color2","#E0E0E0";"max",${masukBulan}})`
        : "-";
    return [label, nominal, pct.toFixed(1) + "%", sparkline, ""];
  };

  values.push(buildKeuanganRow("Masuk", masukBulan));
  values.push(buildKeuanganRow("Keluar", keluarBulan));
  values.push(buildKeuanganRow("Tabungan", tabunganBulan));
  values.push(buildKeuanganRow("Sedekah", sedekahBulan));
  values.push(["", "", "", "", ""]);
  values.push(["Saldo Bersih", saldoBulan, "", "", ""]);

  // Unmerge all cells in dashboard first
  try {
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: "sheets.properties,sheets.merges",
    });
    const sheet = spreadsheet.data.sheets?.find((s) => s.properties?.sheetId === sheetId);
    const merges = sheet?.merges || [];
    if (merges.length > 0) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: merges.map((m) => ({ unmergeCells: { range: m } })),
        },
      });
    }
  } catch (e) {
    console.error("[dashboard] unmerge error:", e.message);
  }

  // Clear old content
  try {
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: `${sheetName}!A:Z`,
    });
  } catch (e) {}

  // Write values
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetName}!A1`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });

  // Styling
  const totalRows = values.length;
  const requests = [
    // Merge title
    {
      mergeCells: {
        range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 5 },
        mergeType: "MERGE_ALL",
      },
    },
    // Merge subtitle
    {
      mergeCells: {
        range: { sheetId, startRowIndex: 1, endRowIndex: 2, startColumnIndex: 0, endColumnIndex: 5 },
        mergeType: "MERGE_ALL",
      },
    },
    // Style title
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 0, endRowIndex: 1 },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.1, green: 0.2, blue: 0.4 },
            textFormat: { bold: true, fontSize: 16, foregroundColor: { red: 1, green: 1, blue: 1 } },
            horizontalAlignment: "CENTER",
            verticalAlignment: "MIDDLE",
            padding: { top: 12, bottom: 12 },
          },
        },
        fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment,padding)",
      },
    },
    // Style subtitle
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: 2 },
        cell: {
          userEnteredFormat: {
            textFormat: { italic: true, fontSize: 10, foregroundColor: { red: 0.4, green: 0.4, blue: 0.4 } },
            horizontalAlignment: "CENTER",
            padding: { bottom: 8 },
          },
        },
        fields: "userEnteredFormat(textFormat,horizontalAlignment,padding)",
      },
    },
  ];

  // Section header helper
  const sectionHeaderRows = [4, 10, keuanganHeaderRow + 1]; // 1-based indices
  sectionHeaderRows.forEach((row1Based) => {
    const rowIdx = row1Based - 1; // 0-based
    if (rowIdx < 0 || rowIdx >= totalRows) return;
    requests.push({
      mergeCells: {
        range: { sheetId, startRowIndex: rowIdx, endRowIndex: rowIdx + 1, startColumnIndex: 0, endColumnIndex: 5 },
        mergeType: "MERGE_ALL",
      },
    });
    requests.push({
      repeatCell: {
        range: { sheetId, startRowIndex: rowIdx, endRowIndex: rowIdx + 1 },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.25, green: 0.5, blue: 0.7 },
            textFormat: { bold: true, fontSize: 12, foregroundColor: { red: 1, green: 1, blue: 1 } },
            horizontalAlignment: "LEFT",
            verticalAlignment: "MIDDLE",
            padding: { top: 8, bottom: 8, left: 8 },
          },
        },
        fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment,padding)",
      },
    });
  });

  // Style table headers
  const tableHeaderRows = [10, keuanganHeaderRow + 2]; // 1-based indices (Kategori/Terisi/...)
  tableHeaderRows.forEach((row1Based) => {
    const rowIdx = row1Based - 1;
    if (rowIdx < 0 || rowIdx >= totalRows) return;
    requests.push({
      repeatCell: {
        range: { sheetId, startRowIndex: rowIdx, endRowIndex: rowIdx + 1, startColumnIndex: 0, endColumnIndex: 5 },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.9, green: 0.9, blue: 0.9 },
            textFormat: { bold: true, fontSize: 10 },
            horizontalAlignment: "CENTER",
            verticalAlignment: "MIDDLE",
            padding: { top: 6, bottom: 6 },
            borders: {
              top: { style: "SOLID", color: { red: 0.6, green: 0.6, blue: 0.6 } },
              bottom: { style: "SOLID", color: { red: 0.6, green: 0.6, blue: 0.6 } },
              left: { style: "SOLID", color: { red: 0.6, green: 0.6, blue: 0.6 } },
              right: { style: "SOLID", color: { red: 0.6, green: 0.6, blue: 0.6 } },
            },
          },
        },
        fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment,padding,borders)",
      },
    });
  });

  // Column widths
  requests.push(
    { updateDimensionProperties: { range: { sheetId, dimension: "COLUMNS", startIndex: 0, endIndex: 1 }, properties: { pixelSize: 250 }, fields: "pixelSize" } },
    { updateDimensionProperties: { range: { sheetId, dimension: "COLUMNS", startIndex: 1, endIndex: 2 }, properties: { pixelSize: 120 }, fields: "pixelSize" } },
    { updateDimensionProperties: { range: { sheetId, dimension: "COLUMNS", startIndex: 2, endIndex: 3 }, properties: { pixelSize: 100 }, fields: "pixelSize" } },
    { updateDimensionProperties: { range: { sheetId, dimension: "COLUMNS", startIndex: 3, endIndex: 4 }, properties: { pixelSize: 100 }, fields: "pixelSize" } },
    { updateDimensionProperties: { range: { sheetId, dimension: "COLUMNS", startIndex: 4, endIndex: 5 }, properties: { pixelSize: 300 }, fields: "pixelSize" } }
  );

  // Freeze title
  requests.push({
    updateSheetProperties: {
      properties: { sheetId, gridProperties: { frozenRowCount: 2 } },
      fields: "gridProperties.frozenRowCount",
    },
  });

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests },
  });
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

    // Update dashboard
    try {
      await updateDashboardSheet(sheets, spreadsheetId, userData);
    } catch (err) {
      console.error("[sync-sheets] dashboard error:", err.message);
    }

    // Sync each sheet
    const results = [];
    for (const [menuKey, config] of Object.entries(MENU_CONFIG)) {
      try {
        const rawRows = config.flatten(userData);
        const sortedRows = sortRows(rawRows);
        const sheetId = await smartSyncRows(
          sheets,
          spreadsheetId,
          config.sheetName,
          config.headers,
          sortedRows,
          config.hiddenCols || []
        );

        // Apply CF and number format
        try {
          await applyConditionalFormatting(sheets, spreadsheetId, sheetId, config, sortedRows);
        } catch (e) {
          console.error(`[sync-sheets] CF error ${menuKey}:`, e.message);
        }
        try {
          await applyRupiahFormat(sheets, spreadsheetId, sheetId, config);
        } catch (e) {
          console.error(`[sync-sheets] numFormat error ${menuKey}:`, e.message);
        }

        results.push({ menu: menuKey, sheet: config.sheetName, rows: sortedRows.length, status: "ok" });
      } catch (err) {
        console.error(`[sync-sheets] Error sync ${menuKey}:`, err.message);
        results.push({ menu: menuKey, sheet: config.sheetName, status: "error", error: err.message });
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
    });
  } catch (err) {
    console.error("[sync-sheets] Fatal error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: "Endpoint sync-sheets aktif. Gunakan POST dengan { uid }." });
}