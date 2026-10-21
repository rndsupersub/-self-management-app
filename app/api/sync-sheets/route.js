// app/api/sync-sheets/route.js
import { NextResponse } from "next/server";
import { google } from "googleapis";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// ========== HELPER: PARSE PRIVATE KEY ==========
function parsePrivateKey(raw) {
  if (!raw) return "";
  let key = String(raw).trim();
  if (key.startsWith('"') && key.endsWith('"')) key = key.slice(1, -1);
  if (key.startsWith("'") && key.endsWith("'")) key = key.slice(1, -1);
  if (key.includes("\\n")) key = key.replace(/\\n/g, "\n");
  return key.trim();
}

// ========== FIREBASE ADMIN INIT ==========
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

// ========== MAPPING MENU & LEBAR KOLOM ==========
// Gua tambahin `width` biar kolomnya rapi
const MENU_CONFIG = {
  belajar: {
    sheetName: "Belajar",
    headers: [
      { name: "firestoreId", width: 100 },
      { name: "menu", width: 80 },
      { name: "kategori", width: 120 },
      { name: "subKategori", width: 120 },
      { name: "tool", width: 120 },
      { name: "fitur", width: 120 },
      { name: "part", width: 120 },
      { name: "judul", width: 200 },
      { name: "tanggal", width: 100 },
      { name: "status", width: 80 },
      { name: "catatan", width: 300 },
      { name: "gdriveUrl", width: 250 },
      { name: "updatedAt", width: 150 },
    ],
    flatten: (data) => {
      const rows = [];
      const kategori = data?.belajar?.kategori || [];
      kategori.forEach((kat) => {
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
      const pekerjaan = data?.pekerjaan || [];
      pekerjaan.forEach((pt) => {
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
        const list = transaksi[tanggal] || [];
        list.forEach((tx) => {
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
      const brands = data?.bisnisBrands || [];
      brands.forEach((brand) => {
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
      const logs = data?.youtube_logs || [];
      logs.forEach((log) => {
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
      const buku = data?.bedahBuku?.buku || [];
      buku.forEach((b) => {
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
    headers: [
      { name: "firestoreId", width: 100 },
      { name: "menu", width: 80 },
      { name: "customId", width: 100 },
      { name: "kategori", width: 120 },
      { name: "subKategori", width: 120 },
      { name: "tool", width: 120 },
      { name: "fitur", width: 120 },
      { name: "part", width: 120 },
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

// ========== HELPER: GET OR CREATE SHEET ==========
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

// ========== HELPER: SMART SYNC ==========
async function smartSyncRows(sheets, spreadsheetId, sheetName, headers, newRows) {
  const sheetId = await getOrCreateSheet(sheets, spreadsheetId, sheetName);
  const headerNames = headers.map((h) => h.name);
  
  // 1. Baca data lama
  let oldRows = [];
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A2:Z`,
    });
    oldRows = res.data.values || [];
  } catch (e) {}

  // 2. Map data lama
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

  // Cek baru & update
  for (const [id, newRow] of newMap.entries()) {
    const values = headerNames.map((h) => newRow[h] ?? "");
    if (oldMap.has(id)) {
      const old = oldMap.get(id);
      if (JSON.stringify(old.row) !== JSON.stringify(values)) {
        toUpdate.push({
          range: `${sheetName}!A${old.rowIndex}`,
          values: [values],
        });
      }
    } else {
      toAdd.push(values);
    }
  }

  // Cek delete
  for (const [id, old] of oldMap.entries()) {
    if (!newMap.has(id)) toDelete.push({ rowIndex: old.rowIndex });
  }

  // 3. Eksekusi Delete (dari bawah ke atas)
  toDelete.sort((a, b) => b.rowIndex - a.rowIndex);
  for (const del of toDelete) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{
          deleteDimension: {
            range: { sheetId, dimension: "ROWS", startIndex: del.rowIndex - 1, endIndex: del.rowIndex },
          },
        }],
      },
    });
  }

  // 4. Eksekusi Update
  if (toUpdate.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: { valueInputOption: "USER_ENTERED", data: toUpdate },
    });
  }

  // 5. Eksekusi Add
  if (toAdd.length > 0) {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: toAdd },
    });
  }

  // 6. Styling (Header, Width, Wrap)
  const widthRequests = headers.map((h, i) => ({
    updateDimensionProperties: {
      range: {
        sheetId,
        dimension: "COLUMNS",
        startIndex: i,
        endIndex: i + 1,
      },
      properties: { pixelSize: h.width || 120 },
      fields: "pixelSize",
    },
  }));

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        // Freeze Row 1
        {
          updateSheetProperties: {
            properties: { sheetId, gridProperties: { frozenRowCount: 1 } },
            fields: "gridProperties.frozenRowCount",
          },
        },
        // Style Header
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
            fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)",
          },
        },
        // Wrap Text (biar catatan panjang turun)
        {
          repeatCell: {
            range: { sheetId, startRowIndex: 1 },
            cell: { userEnteredFormat: { wrapStrategy: "WRAP", verticalAlignment: "TOP" } },
            fields: "userEnteredFormat(wrapStrategy,verticalAlignment)",
          },
        },
        // Set Width
        ...widthRequests,
      ],
    },
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

    const results = [];
    for (const [menuKey, config] of Object.entries(MENU_CONFIG)) {
      try {
        const newRows = config.flatten(userData);
        await smartSyncRows(sheets, spreadsheetId, config.sheetName, config.headers, newRows);
        results.push({ menu: menuKey, sheet: config.sheetName, rows: newRows.length, status: "ok" });
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