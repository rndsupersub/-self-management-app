// app/api/sync-sheets/route.js
import { NextResponse } from "next/server";
import { google } from "googleapis";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

// ========== FIREBASE INIT ==========
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

// ========== GOOGLE AUTH ==========
function getAuth() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return auth;
}

// ========== MAPPING MENU → FIELD FIRESTORE ==========
// Tiap menu punya config:
//   field       : field di Firestore user doc
//   sheetName   : nama sheet di Spreadsheet
//   flatten     : function untuk flatten data nested → array of rows
//   headers     : kolom header

const MENU_CONFIG = {
  belajar: {
    sheetName: "Belajar",
    headers: ["firestoreId", "menu", "kategori", "subKategori", "tool", "fitur", "part", "judul", "tanggal", "status", "catatan", "gdriveUrl", "updatedAt"],
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
    headers: ["firestoreId", "menu", "pt", "brand", "judul", "tanggal", "status", "catatan", "updatedAt"],
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
    headers: ["firestoreId", "menu", "tanggal", "tipe", "kategori", "jumlah", "dompet", "catatan", "updatedAt"],
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
            tipe: tx.tipe || "",
            kategori: tx.kategori || "",
            jumlah: tx.jumlah || 0,
            dompet: tx.dompet || "",
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
    headers: ["firestoreId", "menu", "tanggal", "aktivitas", "durasi", "catatan", "updatedAt"],
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
          durasi: entry.durasi || entry.jarak || "",
          catatan: entry.catatan || "",
          updatedAt: entry.updatedAt || "",
        });
      });
      return rows;
    },
  },

  hafalan: {
    sheetName: "Hafalan",
    headers: ["firestoreId", "menu", "tanggal", "suratId", "juzId", "halaman", "catatan", "updatedAt"],
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
    headers: ["firestoreId", "menu", "brand", "judul", "tanggal", "status", "catatan", "updatedAt"],
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
    headers: ["firestoreId", "menu", "channel", "judul", "tipe", "tanggal", "status", "linkYoutube", "gdriveUrl", "catatan", "updatedAt"],
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
    headers: ["firestoreId", "menu", "judul", "penulis", "kategoriId", "totalHalaman", "targetPerHari", "tanggalMulai", "updatedAt"],
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
    headers: ["firestoreId", "menu", "customId", "kategori", "subKategori", "tool", "fitur", "part", "judul", "catatan", "updatedAt"],
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

// ========== HELPER: WRITE ROWS TO SHEET ==========
async function writeRowsToSheet(sheets, spreadsheetId, sheetName, headers, rows) {
  // Clear dulu
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: `${sheetName}!A:Z`,
  });

  // Tulis header + rows
  const values = [headers];
  rows.forEach((r) => {
    values.push(headers.map((h) => r[h] ?? ""));
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetName}!A1`,
    valueInputOption: "RAW",
    requestBody: { values },
  });
}

// ========== MAIN HANDLER ==========
export async function POST(req) {
  try {
    const body = await req.json();
    const { uid } = body;

    if (!uid) {
      return NextResponse.json({ error: "uid wajib diisi" }, { status: 400 });
    }

    // Get user data dari Firestore
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      return NextResponse.json({ error: "user tidak ditemukan" }, { status: 404 });
    }
    const userData = userSnap.data();

    // Setup Google Sheets
    const auth = getAuth();
    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

    if (!spreadsheetId) {
      return NextResponse.json({ error: "GOOGLE_SHEETS_ID belum diset" }, { status: 500 });
    }

    // Sync tiap menu
    const results = [];
    for (const [menuKey, config] of Object.entries(MENU_CONFIG)) {
      try {
        // Bikin sheet kalau belum ada
        await getOrCreateSheet(sheets, spreadsheetId, config.sheetName);

        // Flatten data
        const rows = config.flatten(userData);

        // Tulis ke sheet
        await writeRowsToSheet(
          sheets,
          spreadsheetId,
          config.sheetName,
          config.headers,
          rows
        );

        results.push({ menu: menuKey, sheet: config.sheetName, rows: rows.length, status: "ok" });
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
  return NextResponse.json({
    message: "Endpoint sync-sheets aktif. Gunakan POST dengan { uid }.",
  });
}