// lib/sheetsSync.js
// Logika sinkronisasi Firestore → Google Sheets (server only).
//
// Prinsip:
// - Kolom = yang dibaca orang, bukan nama field database. Maksimal 7 kolom.
// - Tiap sheet DIBANGUN ULANG dari nol setiap sync, jadi data yang dihapus di
//   aplikasi ikut hilang di spreadsheet (versi lama cuma append/diff, sisa
//   barisnya nyangkut).
// - Ada sheet "Ringkasan" supaya workbook-nya punya tujuan, bukan tabel mentah.

import { google } from "googleapis";
import { DEFAULT_DOMPET, getKategoriList } from "@/lib/keuanganData";
import { parseTanggalLokal } from "@/lib/tanggalLokal";
import { DEFAULT_JADWAL, deteksiJadwalOtomatis } from "@/lib/jadwalData";
import {
  formatJamJadwal,
  getJadwalHarian,
  parseJamJadwal,
  todayWIB,
} from "@/lib/jadwalHarian";

// ========== TAMPILAN ==========
// Warna disamain sama tema web (indigo + slate), bukan biru tua generik.
const GARIS = { style: "SOLID", width: 1, color: { red: 0.9, green: 0.91, blue: 0.94 } };
const WARNA_HEADER = { red: 0.31, green: 0.27, blue: 0.9 };
const WARNA_SECTION = { red: 0.39, green: 0.4, blue: 0.94 };
const WARNA_SUBHEADER = { red: 0.93, green: 0.94, blue: 1 };
const WARNA_BARIS_A = { red: 1, green: 1, blue: 1 };
const WARNA_BARIS_B = { red: 0.97, green: 0.98, blue: 0.99 };

const LABEL_JENIS_KEUANGAN = {
  masuk: "Masuk",
  keluar: "Keluar",
  tabungan: "Tabungan",
  sedekah: "Sedekah",
};

const LABEL_STATUS_KEGIATAN = {
  selesai: "✅ Selesai",
  belum: "⏳ Belum selesai",
};

// ========== HELPER ==========
function tglIndo(tanggal) {
  const d = parseTanggalLokal(tanggal);
  if (!d) return "";
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function durasiHari(mulai, selesai) {
  const a = parseTanggalLokal(mulai);
  const b = parseTanggalLokal(selesai);
  if (!a || !b) return "";
  return Math.round((b - a) / 86400000) + 1;
}

function labelDari(list, id) {
  const ketemu = (list || []).find((x) => x.id === id);
  return ketemu?.label || ketemu?.nama || id || "";
}

function rentangKegiatan(keg) {
  const mulai = keg?.tanggalMulai || keg?.tanggal || "";
  const selesai = keg?.tanggalSelesai || keg?.tanggal || mulai;
  return { mulai, selesai };
}

function formatJam(iso) {
  const d = new Date();
  return d.toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" });
}

// ========== BARIS KEGIATAN (PEKERJAAN & BISNIS) ==========
function barisKegiatan(data, sumber) {
  const rows = [];
  const tambah = (keg, brandNama) => {
    const { mulai, selesai } = rentangKegiatan(keg);
    rows.push({
      mulai,
      selesai,
      durasi: durasiHari(mulai, selesai),
      status: LABEL_STATUS_KEGIATAN[keg.status === "selesai" ? "selesai" : "belum"],
      kegiatan: keg.judul || "",
      brand: brandNama,
      catatan: keg.catatan || "",
    });
  };

  if (sumber === "bisnis") {
    (data?.bisnisBrands || []).forEach((brand) => {
      (brand.kegiatan || []).forEach((keg) => tambah(keg, brand.nama || ""));
    });
    return rows;
  }

  (data?.pekerjaan || []).forEach((pt) => {
    (pt.brands || []).forEach((brand) => {
      const nama = [brand.nama, pt.nama].filter(Boolean).join(" · ");
      (brand.kegiatan || []).forEach((keg) => tambah(keg, nama));
    });
  });
  return rows;
}

const KOLOM_KEGIATAN = [
  { key: "mulai", label: "Mulai", lebar: 120 },
  { key: "selesai", label: "Selesai", lebar: 120 },
  { key: "durasi", label: "Durasi (hari)", lebar: 105, angka: true },
  { key: "status", label: "Status", lebar: 140 },
  { key: "kegiatan", label: "Kegiatan", lebar: 320 },
  { key: "brand", label: "Brand", lebar: 220 },
  { key: "catatan", label: "Catatan", lebar: 300 },
];

// ========== JADWAL ==========
const NAMA_HARI_PENDEK = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

function labelHariItem(item) {
  if (Array.isArray(item.hari) && item.hari.length > 0) {
    return item.hari.map((d) => NAMA_HARI_PENDEK[d] || d).join(", ");
  }
  return "Senin–Sabtu";
}

function statusAktivitas(data, tanggal, item) {
  const progress = data?.dailyProgress?.[tanggal] || {};
  const ditandai =
    progress[item.id]?.selesai === true || progress[item._kunci]?.selesai === true;
  if (ditandai) return LABEL_STATUS_KEGIATAN.selesai;

  try {
    if (deteksiJadwalOtomatis(item.id, tanggal, data)?.auto === true) {
      return LABEL_STATUS_KEGIATAN.selesai;
    }
  } catch (err) {
    // Deteksi otomatis cuma pelengkap; jangan gagalkan sync karenanya.
  }
  return LABEL_STATUS_KEGIATAN.belum;
}

function barisJadwal(data) {
  const sumber =
    data?.jadwalUser &&
    Array.isArray(data.jadwalUser.kerja) &&
    Array.isArray(data.jadwalUser.minggu)
      ? data.jadwalUser
      : DEFAULT_JADWAL;

  const tanggal = todayWIB();
  const overrideHari = data?.jadwalOverride?.[tanggal] || {};
  const rows = [];

  const tambah = (daftar, namaHari) => {
    (daftar || []).forEach((item, index) => {
      const { mulai, selesai } = parseJamJadwal(item);
      const ubah = overrideHari[item.id || `idx_${index}`];
      rows.push({
        hari: namaHari === "Senin–Sabtu" ? labelHariItem(item) : namaHari,
        jam: formatJamJadwal(mulai, selesai),
        aktivitas: String(item.label || "").trim(),
        target: item.unit || "",
        catatan: ubah
          ? `🕒 Dipindah hari ini (asal ${ubah.asli || "-"})`
          : "",
      });
    });
  };

  tambah(sumber.kerja, "Senin–Sabtu");
  tambah(sumber.minggu, "Minggu");
  return rows;
}

// ========== DAFTAR SHEET ==========
export const MENU = [
  {
    kunci: "jadwal",
    nama: "Jadwal",
    kolom: [
      { key: "hari", label: "Hari", lebar: 130 },
      { key: "jam", label: "Jam", lebar: 130 },
      { key: "aktivitas", label: "Aktivitas", lebar: 300 },
      { key: "target", label: "Target", lebar: 150 },
      { key: "catatan", label: "Catatan", lebar: 240 },
    ],
    baris: barisJadwal,
    urut: () => 0,
  },
  {
    kunci: "pekerjaan",
    nama: "Pekerjaan",
    kolom: KOLOM_KEGIATAN,
    baris: (data) => barisKegiatan(data, "pekerjaan"),
    urut: (a, b) =>
      a.status.localeCompare(b.status) || String(a.mulai).localeCompare(String(b.mulai)),
  },
  {
    kunci: "bisnis",
    nama: "Bisnis",
    kolom: KOLOM_KEGIATAN,
    baris: (data) => barisKegiatan(data, "bisnis"),
    urut: (a, b) =>
      a.status.localeCompare(b.status) || String(a.mulai).localeCompare(String(b.mulai)),
  },
  {
    kunci: "keuangan",
    nama: "Keuangan",
    kolom: [
      { key: "tanggal", label: "Tanggal", lebar: 120 },
      { key: "jenis", label: "Jenis", lebar: 110 },
      { key: "kategori", label: "Kategori", lebar: 200 },
      { key: "nominal", label: "Nominal", lebar: 140, rupiah: true },
      { key: "dompet", label: "Dompet", lebar: 150 },
      { key: "catatan", label: "Catatan", lebar: 320 },
    ],
    baris: (data) => {
      const kategoriList = getKategoriList(data?.keuanganKategori);
      const dompetList =
        Array.isArray(data?.keuanganDompet) && data.keuanganDompet.length > 0
          ? data.keuanganDompet
          : DEFAULT_DOMPET;
      const rows = [];
      Object.entries(data?.keuanganTransaksi || {}).forEach(([tanggal, list]) => {
        (list || []).forEach((tx) => {
          const jenis = tx.jenis || tx.tipe || "";
          const kategoriId = tx.kategoriId || tx.kategori || "";
          rows.push({
            tanggal,
            jenis: LABEL_JENIS_KEUANGAN[jenis] || jenis,
            kategori: labelDari(kategoriList?.[jenis], kategoriId) || kategoriId,
            nominal: Number(tx.nominal ?? tx.jumlah ?? 0) || 0,
            dompet: labelDari(dompetList, tx.walletId || tx.dompet),
            catatan: tx.catatan || "",
          });
        });
      });
      return rows;
    },
    urut: (a, b) => String(b.tanggal).localeCompare(String(a.tanggal)),
  },
  {
    kunci: "belajar",
    nama: "Belajar",
    kolom: [
      { key: "kategori", label: "Kategori", lebar: 190 },
      { key: "subKategori", label: "Sub Kategori", lebar: 170 },
      { key: "tool", label: "Tool", lebar: 170 },
      { key: "materi", label: "Fitur / Part", lebar: 300 },
      { key: "catatan", label: "Catatan", lebar: 320 },
      { key: "link", label: "Materi GDrive", lebar: 200 },
    ],
    baris: (data) => {
      const rows = [];
      (data?.belajar?.kategori || []).forEach((kat) => {
        (kat.subKategori || []).forEach((sub) => {
          (sub.tools || []).forEach((tool) => {
            (tool.fitur || []).forEach((fitur) => {
              const parts = Array.isArray(fitur.parts) ? fitur.parts : [];
              if (parts.length === 0) {
                rows.push({
                  kategori: kat.nama || "",
                  subKategori: sub.nama || "",
                  tool: tool.nama || "",
                  materi: fitur.nama || "",
                  catatan: fitur.catatan || "",
                  link: fitur.gdriveUrl || "",
                });
                return;
              }
              parts.forEach((part) => {
                rows.push({
                  kategori: kat.nama || "",
                  subKategori: sub.nama || "",
                  tool: tool.nama || "",
                  materi: `${fitur.nama || ""}${part.nama ? ` → ${part.nama}` : ""}`,
                  catatan: part.catatan || "",
                  link: part.gdriveUrl || "",
                });
              });
            });
          });
        });
      });
      return rows;
    },
    urut: (a, b) =>
      a.kategori.localeCompare(b.kategori) ||
      a.subKategori.localeCompare(b.subKategori) ||
      a.tool.localeCompare(b.tool),
  },
  {
    kunci: "olahraga",
    nama: "Olahraga",
    kolom: [
      { key: "tanggal", label: "Tanggal", lebar: 130 },
      { key: "jogging", label: "Jogging (km)", lebar: 120, angka: true },
      { key: "pushUp", label: "Push Up (reps)", lebar: 125, angka: true },
      { key: "legRaise", label: "Leg Raise (reps)", lebar: 130, angka: true },
      { key: "plank", label: "Plank (detik)", lebar: 120, angka: true },
      { key: "catatan", label: "Catatan", lebar: 320 },
    ],
    baris: (data) => {
      const rows = [];
      Object.entries(data?.olahraga?.harian || {}).forEach(([tanggal, entry]) => {
        rows.push({
          tanggal,
          jogging: entry?.jogging?.km ?? "",
          pushUp: entry?.pushUp?.reps ?? "",
          legRaise: entry?.legRaise?.reps ?? "",
          plank: entry?.plank?.detik ?? "",
          catatan: entry?.catatan || "",
        });
      });
      return rows;
    },
    urut: (a, b) => String(b.tanggal).localeCompare(String(a.tanggal)),
  },
  {
    kunci: "hafalan",
    nama: "Hafalan",
    kolom: [
      { key: "tanggal", label: "Tanggal", lebar: 130 },
      { key: "juz", label: "Juz", lebar: 110 },
      { key: "surat", label: "Surat", lebar: 200 },
      { key: "halaman", label: "Halaman", lebar: 120 },
      { key: "catatan", label: "Catatan", lebar: 340 },
    ],
    baris: (data) => {
      const rows = [];
      Object.entries(data?.hafalanMembaca || {}).forEach(([tanggal, entry]) => {
        const mulai = entry?.halamanMulai || 0;
        const selesai = entry?.halamanSelesai || 0;
        rows.push({
          tanggal,
          juz: String(entry?.juzId || "").replace(/_/g, " "),
          surat: String(entry?.suratId || "").replace(/_/g, " "),
          halaman: selesai > mulai ? `${mulai}–${selesai}` : mulai,
          catatan: entry?.catatan || "",
        });
      });
      return rows;
    },
    urut: (a, b) => String(b.tanggal).localeCompare(String(a.tanggal)),
  },
  {
    kunci: "youtube",
    nama: "YouTube",
    kolom: [
      { key: "tanggal", label: "Tanggal", lebar: 130 },
      { key: "channel", label: "Channel", lebar: 180 },
      { key: "judul", label: "Judul Video", lebar: 340 },
      { key: "tipe", label: "Tipe", lebar: 110 },
      { key: "status", label: "Status", lebar: 140 },
      { key: "link", label: "Link", lebar: 240 },
    ],
    baris: (data) => {
      const rows = [];
      (data?.youtube_logs || []).forEach((log) => {
        rows.push({
          tanggal: log.tanggal || "",
          channel: log.channel || "",
          judul: log.judul || "",
          tipe: log.tipe || "",
          status: log.status || "",
          link: log.linkYoutube || log.gdriveUrl || "",
        });
      });
      return rows;
    },
    urut: (a, b) => String(b.tanggal).localeCompare(String(a.tanggal)),
  },
  {
    kunci: "bedahbuku",
    nama: "Bedah Buku",
    kolom: [
      { key: "judul", label: "Judul Buku", lebar: 300 },
      { key: "penulis", label: "Penulis", lebar: 200 },
      { key: "kategori", label: "Kategori", lebar: 160 },
      { key: "totalHalaman", label: "Halaman", lebar: 110, angka: true },
      { key: "targetPerHari", label: "Target / Hari", lebar: 120, angka: true },
      { key: "mulai", label: "Mulai Baca", lebar: 130 },
    ],
    baris: (data) => {
      const rows = [];
      (data?.bedahBuku?.buku || []).forEach((b) => {
        rows.push({
          judul: b.judul || "",
          penulis: b.penulis || "",
          kategori: b.kategoriId || "",
          totalHalaman: b.totalHalaman || 0,
          targetPerHari: b.targetPerHari || 0,
          mulai: b.tanggalMulai || "",
        });
      });
      return rows;
    },
    urut: (a, b) => a.judul.localeCompare(b.judul),
  },
  {
    kunci: "custom",
    nama: "Menu Custom",
    kolom: [
      { key: "menu", label: "Menu", lebar: 190 },
      { key: "subKategori", label: "Sub Kategori", lebar: 180 },
      { key: "tool", label: "Tool", lebar: 180 },
      { key: "materi", label: "Fitur / Part", lebar: 320 },
      { key: "catatan", label: "Catatan", lebar: 320 },
    ],
    baris: (data) => {
      const rows = [];
      Object.values(data?.menusCustom || {}).forEach((menu) => {
        (menu?.subKategori || []).forEach((sub) => {
          (sub.tools || []).forEach((tool) => {
            (tool.fitur || []).forEach((fitur) => {
              const parts = Array.isArray(fitur.parts) ? fitur.parts : [];
              if (parts.length === 0) {
                rows.push({
                  menu: menu?.nama || "",
                  subKategori: sub.nama || "",
                  tool: tool.nama || "",
                  materi: fitur.nama || "",
                  catatan: fitur.catatan || "",
                });
                return;
              }
              parts.forEach((part) => {
                rows.push({
                  menu: menu?.nama || "",
                  subKategori: sub.nama || "",
                  tool: tool.nama || "",
                  materi: `${fitur.nama || ""}${part.nama ? ` → ${part.nama}` : ""}`,
                  catatan: part.catatan || "",
                });
              });
            });
          });
        });
      });
      return rows;
    },
    urut: (a, b) => a.menu.localeCompare(b.menu),
  },
];

// ========== SHEET: PASTIKAN ADA ==========
export async function pastikanSheet(sheets, spreadsheetId, nama) {
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets.properties",
  });
  const existing = spreadsheet.data.sheets?.find((s) => s.properties?.title === nama);
  if (existing) return existing.properties.sheetId;

  const result = await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests: [{ addSheet: { properties: { title: nama } } }] },
  });
  return result.data.replies?.[0]?.addSheet?.properties?.sheetId;
}

// Bersihin banding & conditional formatting peninggalan versi lama, supaya
// warna baris nggak nyasar ke kolom yang sudah beda.
async function bersihkanFormatLama(sheets, spreadsheetId, sheetId) {
  const info = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets.properties,sheets.bandedRanges,sheets.conditionalFormats,sheets.merges",
  });
  const sheet = info.data.sheets?.find((s) => s.properties?.sheetId === sheetId);
  const requests = [];

  (sheet?.bandedRanges || []).forEach((br) => {
    requests.push({ deleteBanding: { bandedRangeId: br.bandedRangeId } });
  });
  // Merge lama (mis. dari tab Dashboard versi sebelumnya) harus dilepas dulu,
  // kalau nggak merge baru bisa gagal / tampilan nyangkut.
  (sheet?.merges || []).forEach((range) => {
    requests.push({ unmergeCells: { range } });
  });
  const cf = sheet?.conditionalFormats || [];
  for (let i = cf.length - 1; i >= 0; i--) {
    requests.push({ deleteConditionalFormatRule: { sheetId, index: i } });
  }

  if (requests.length > 0) {
    await sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests } });
  }
}

// ========== TULIS SATU SHEET (BANGUN ULANG) ==========
export async function tulisSheet(sheets, spreadsheetId, nama, kolom, baris) {
  const sheetId = await pastikanSheet(sheets, spreadsheetId, nama);
  await bersihkanFormatLama(sheets, spreadsheetId, sheetId);

  // Clear total: inilah yang bikin data yang dihapus di aplikasi ikut hilang.
  await sheets.spreadsheets.values.clear({ spreadsheetId, range: `${nama}!A:Z` });

  const values = [kolom.map((k) => k.label)];
  if (baris.length === 0) {
    values.push(["Belum ada data di aplikasi", ...kolom.slice(1).map(() => "")]);
  } else {
    baris.forEach((row) =>
      values.push(kolom.map((k) => (row[k.key] === undefined ? "" : row[k.key])))
    );
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${nama}!A1`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });

  const jumlahBaris = values.length;
  const jumlahKolom = kolom.length;

  const requests = [
    {
      updateSheetProperties: {
        properties: { sheetId, gridProperties: { frozenRowCount: 1 } },
        fields: "gridProperties.frozenRowCount",
      },
    },
    {
      repeatCell: {
        range: {
          sheetId,
          startRowIndex: 0,
          endRowIndex: 1,
          startColumnIndex: 0,
          endColumnIndex: jumlahKolom,
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: WARNA_HEADER,
            textFormat: {
              bold: true,
              fontSize: 11,
              foregroundColor: { red: 1, green: 1, blue: 1 },
            },
            verticalAlignment: "MIDDLE",
            padding: { top: 8, bottom: 8, left: 6, right: 6 },
          },
        },
        fields: "userEnteredFormat(backgroundColor,textFormat,verticalAlignment,padding)",
      },
    },
    {
      repeatCell: {
        range: {
          sheetId,
          startRowIndex: 1,
          endRowIndex: jumlahBaris,
          startColumnIndex: 0,
          endColumnIndex: jumlahKolom,
        },
        cell: {
          userEnteredFormat: {
            textFormat: { fontSize: 10, foregroundColor: { red: 0.1, green: 0.1, blue: 0.1 } },
            wrapStrategy: "WRAP",
            verticalAlignment: "MIDDLE",
            padding: { top: 4, bottom: 4, left: 6, right: 6 },
          },
        },
        fields: "userEnteredFormat(textFormat,wrapStrategy,verticalAlignment,padding)",
      },
    },
    {
      updateBorders: {
        range: {
          sheetId,
          startRowIndex: 0,
          endRowIndex: jumlahBaris,
          startColumnIndex: 0,
          endColumnIndex: jumlahKolom,
        },
        top: GARIS,
        bottom: GARIS,
        left: GARIS,
        right: GARIS,
        innerHorizontal: GARIS,
        innerVertical: GARIS,
      },
    },
    {
      setBasicFilter: {
        filter: {
          range: {
            sheetId,
            startRowIndex: 0,
            endRowIndex: jumlahBaris,
            startColumnIndex: 0,
            endColumnIndex: jumlahKolom,
          },
        },
      },
    },
    ...kolom.map((k, i) => ({
      updateDimensionProperties: {
        range: { sheetId, dimension: "COLUMNS", startIndex: i, endIndex: i + 1 },
        properties: { pixelSize: k.lebar || 140 },
        fields: "pixelSize",
      },
    })),
    // Baris zebra biar tabel panjang tetap enak dibaca.
    {
      addBanding: {
        bandedRange: {
          range: {
            sheetId,
            startRowIndex: 1,
            endRowIndex: Math.max(2, jumlahBaris),
            startColumnIndex: 0,
            endColumnIndex: jumlahKolom,
          },
          rowProperties: {
            firstBandColor: WARNA_BARIS_A,
            secondBandColor: WARNA_BARIS_B,
          },
        },
      },
    },
  ];

  kolom.forEach((k, i) => {
    if (k.rupiah) {
      requests.push({
        repeatCell: {
          range: { sheetId, startRowIndex: 1, startColumnIndex: i, endColumnIndex: i + 1 },
          cell: {
            userEnteredFormat: {
              numberFormat: { type: "CURRENCY", pattern: '"Rp"#,##0' },
              horizontalAlignment: "RIGHT",
            },
          },
          fields: "userEnteredFormat(numberFormat,horizontalAlignment)",
        },
      });
    }
    if (k.angka) {
      requests.push({
        repeatCell: {
          range: { sheetId, startRowIndex: 1, startColumnIndex: i, endColumnIndex: i + 1 },
          cell: { userEnteredFormat: { horizontalAlignment: "CENTER" } },
          fields: "userEnteredFormat(horizontalAlignment)",
        },
      });
    }
  });

  await sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests } });
  return baris.length;
}

// ========== SHEET RINGKASAN ==========
function ringkasanKeuanganBulanIni(data) {
  const now = new Date();
  const bulan = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const total = { masuk: 0, keluar: 0, tabungan: 0, sedekah: 0 };
  Object.entries(data?.keuanganTransaksi || {}).forEach(([tanggal, list]) => {
    if (!String(tanggal).startsWith(bulan)) return;
    (list || []).forEach((tx) => {
      const jenis = tx.jenis || tx.tipe;
      if (total[jenis] !== undefined) total[jenis] += Number(tx.nominal ?? tx.jumlah ?? 0) || 0;
    });
  });
  return {
    label: now.toLocaleDateString("id-ID", { month: "long", year: "numeric" }),
    ...total,
    saldo: total.masuk - total.keluar - total.tabungan - total.sedekah,
  };
}

function deadlineTerdekat(data) {
  const daftar = [];
  const hariIni = new Date();
  const hariIniStr = `${hariIni.getFullYear()}-${String(hariIni.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(hariIni.getDate()).padStart(2, "0")}`;

  const pertimbangkan = (keg, info) => {
    const { selesai } = rentangKegiatan(keg);
    if (!selesai || keg.status === "selesai") return;
    const sisa = durasiHari(hariIniStr, selesai) - 1;
    daftar.push({ ...info, judul: keg.judul || "", deadline: selesai, sisa });
  };

  (data?.pekerjaan || []).forEach((pt) => {
    (pt.brands || []).forEach((brand) => {
      (brand.kegiatan || []).forEach((keg) =>
        pertimbangkan(keg, { bagian: "Pekerjaan", brand: brand.nama || "" })
      );
    });
  });
  (data?.bisnisBrands || []).forEach((brand) => {
    (brand.kegiatan || []).forEach((keg) =>
      pertimbangkan(keg, { bagian: "Bisnis", brand: brand.nama || "" })
    );
  });

  return daftar
    .sort((a, b) => String(a.deadline).localeCompare(String(b.deadline)))
    .slice(0, 8);
}

export async function tulisRingkasan(sheets, spreadsheetId, data, jumlahPerMenu) {
  const nama = "Dashboard";
  const sheetId = await pastikanSheet(sheets, spreadsheetId, nama);
  await bersihkanFormatLama(sheets, spreadsheetId, sheetId);
  await sheets.spreadsheets.values.clear({ spreadsheetId, range: `${nama}!A:Z` });

  const keuangan = ringkasanKeuanganBulanIni(data);
  const deadlines = deadlineTerdekat(data);

  // Isi dashboard niru halaman utama web: jadwal hari ini + progres + uang.
  const tanggal = todayWIB();
  const infoHari = getJadwalHarian(
    data?.jadwalUser,
    data?.jadwalOverride?.[tanggal],
    tanggal
  );
  const jadwalHariIni = infoHari.daftar || [];
  const jumlahAktivitas = jadwalHariIni.length;
  const jumlahSelesai = jadwalHariIni.filter(
    (item) => statusAktivitas(data, tanggal, item) === LABEL_STATUS_KEGIATAN.selesai
  ).length;
  const persenSelesai = jumlahAktivitas
    ? Math.round((jumlahSelesai / jumlahAktivitas) * 100)
    : 0;
  const jumlahDipindah = jadwalHariIni.filter((item) => item._dipindah).length;

  const values = [];
  const penanda = { judul: [], section: [], subheader: [], rupiah: [] };

  const tambah = (row, jenis) => {
    values.push(row);
    if (jenis) penanda[jenis].push(values.length);
  };

  tambah(["SELF MANAGEMENT — DASHBOARD", "", "", ""], "judul");
  tambah([`Terakhir disinkron: ${formatJam()}`, "", "", ""]);
  tambah([
    `Hari ini: ${infoHari.hari}, ${tglIndo(tanggal)} · ${infoHari.labelHari}`,
    "",
    "",
    "",
  ]);
  tambah([]);

  tambah([
    `JADWAL HARI INI${jumlahDipindah > 0 ? ` · ${jumlahDipindah} dipindah` : ""}`,
    "",
    "",
    "",
  ], "section");
  tambah(["Jam", "Aktivitas", "Target", "Status"], "subheader");
  if (jadwalHariIni.length === 0) {
    tambah(["Belum ada jadwal untuk hari ini", "", "", ""]);
  } else {
    jadwalHariIni.forEach((item) => {
      const { mulai, selesai } = parseJamJadwal(item);
      tambah([
        formatJamJadwal(mulai, selesai),
        `${String(item.label || "").trim()}${item._dipindah ? " (dipindah)" : ""}`,
        item.unit || "",
        statusAktivitas(data, tanggal, item),
      ]);
    });
  }
  tambah([
    `Progres hari ini: ${jumlahSelesai} dari ${jumlahAktivitas} selesai (${persenSelesai}%)`,
    "",
    "",
    "",
  ]);

  tambah([]);
  tambah(["JUMLAH DATA PER BAGIAN", "", "", ""], "section");
  tambah(["Bagian", "Jumlah", "", ""], "subheader");
  Object.entries(jumlahPerMenu).forEach(([menu, jumlah]) =>
    tambah([menu, jumlah, "", ""])
  );

  tambah([]);
  tambah([`KEUANGAN ${keuangan.label.toUpperCase()}`, "", "", ""], "section");
  tambah(["Keterangan", "Nominal", "", ""], "subheader");
  [
    ["Pemasukan", keuangan.masuk],
    ["Pengeluaran", keuangan.keluar],
    ["Tabungan", keuangan.tabungan],
    ["Sedekah", keuangan.sedekah],
    ["Sisa (pemasukan − pengeluaran − tabungan − sedekah)", keuangan.saldo],
  ].forEach(([label, nominal]) => {
    tambah([label, nominal, "", ""]);
    penanda.rupiah.push(values.length);
  });

  tambah([]);
  tambah(["DEADLINE TERDEKAT (BELUM SELESAI)", "", "", ""], "section");
  tambah(["Kegiatan", "Brand", "Deadline", "Sisa hari"], "subheader");
  if (deadlines.length === 0) {
    tambah(["Tidak ada deadline yang belum selesai 🎉", "", "", ""]);
  } else {
    deadlines.forEach((d) => {
      tambah([
        `${d.judul} (${d.bagian})`,
        d.brand,
        tglIndo(d.deadline),
        d.sisa < 0 ? `Lewat ${Math.abs(d.sisa)} hari` : d.sisa === 0 ? "Hari ini" : `H-${d.sisa}`,
      ]);
    });
  }

  tambah([]);
  tambah(["CATATAN", "", "", ""], "section");
  tambah([
    'Sheet "Jadwal" berisi jadwal lengkap, sheet lain berisi detail per menu. Data yang kamu hapus di aplikasi ikut hilang di sini setelah sync ulang.',
    "",
    "",
    "",
  ]);

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${nama}!A1`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });

  const jumlahBaris = values.length;
  const requests = [
    {
      updateSheetProperties: {
        properties: { sheetId, gridProperties: { frozenRowCount: 2 } },
        fields: "gridProperties.frozenRowCount",
      },
    },
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 4 },
        cell: {
          userEnteredFormat: {
            backgroundColor: WARNA_HEADER,
            textFormat: {
              bold: true,
              fontSize: 14,
              foregroundColor: { red: 1, green: 1, blue: 1 },
            },
            verticalAlignment: "MIDDLE",
            padding: { top: 12, bottom: 12, left: 8 },
          },
        },
        fields: "userEnteredFormat(backgroundColor,textFormat,verticalAlignment,padding)",
      },
    },
    {
      repeatCell: {
        range: {
          sheetId,
          startRowIndex: 1,
          endRowIndex: jumlahBaris,
          startColumnIndex: 0,
          endColumnIndex: 4,
        },
        cell: {
          userEnteredFormat: {
            textFormat: { fontSize: 11, foregroundColor: { red: 0.1, green: 0.1, blue: 0.1 } },
            verticalAlignment: "MIDDLE",
            wrapStrategy: "WRAP",
            padding: { top: 5, bottom: 5, left: 8 },
          },
        },
        fields: "userEnteredFormat(textFormat,verticalAlignment,wrapStrategy,padding)",
      },
    },
    ...penanda.section.map((baris) => ({
      repeatCell: {
        range: {
          sheetId,
          startRowIndex: baris - 1,
          endRowIndex: baris,
          startColumnIndex: 0,
          endColumnIndex: 4,
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: WARNA_SECTION,
            textFormat: { bold: true, fontSize: 11, foregroundColor: { red: 1, green: 1, blue: 1 } },
            verticalAlignment: "MIDDLE",
            padding: { top: 8, bottom: 8, left: 8 },
          },
        },
        fields: "userEnteredFormat(backgroundColor,textFormat,verticalAlignment,padding)",
      },
    })),
    // Section & judul digabung jadi satu baris penuh, kayak heading di web.
    ...[...penanda.judul, ...penanda.section].map((baris) => ({
      mergeCells: {
        range: {
          sheetId,
          startRowIndex: baris - 1,
          endRowIndex: baris,
          startColumnIndex: 0,
          endColumnIndex: 4,
        },
        mergeType: "MERGE_ALL",
      },
    })),
    ...penanda.subheader.map((baris) => ({
      repeatCell: {
        range: {
          sheetId,
          startRowIndex: baris - 1,
          endRowIndex: baris,
          startColumnIndex: 0,
          endColumnIndex: 4,
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: WARNA_SUBHEADER,
            textFormat: { bold: true, fontSize: 10, foregroundColor: WARNA_HEADER },
            padding: { top: 5, bottom: 5, left: 8 },
          },
        },
        fields: "userEnteredFormat(backgroundColor,textFormat,padding)",
      },
    })),
    ...penanda.rupiah.map((baris) => ({
      repeatCell: {
        range: {
          sheetId,
          startRowIndex: baris - 1,
          endRowIndex: baris,
          startColumnIndex: 1,
          endColumnIndex: 2,
        },
        cell: {
          userEnteredFormat: {
            numberFormat: { type: "CURRENCY", pattern: '"Rp"#,##0' },
            horizontalAlignment: "RIGHT",
          },
        },
        fields: "userEnteredFormat(numberFormat,horizontalAlignment)",
      },
    })),
    {
      updateDimensionProperties: {
        range: { sheetId, dimension: "COLUMNS", startIndex: 0, endIndex: 1 },
        properties: { pixelSize: 230 },
        fields: "pixelSize",
      },
    },
    {
      updateDimensionProperties: {
        range: { sheetId, dimension: "COLUMNS", startIndex: 1, endIndex: 2 },
        properties: { pixelSize: 330 },
        fields: "pixelSize",
      },
    },
    {
      updateDimensionProperties: {
        range: { sheetId, dimension: "COLUMNS", startIndex: 2, endIndex: 4 },
        properties: { pixelSize: 150 },
        fields: "pixelSize",
      },
    },
  ];

  await sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests } });
}

// ========== ENTRY POINT SERVER ==========
// Dipakai endpoint /api/sync-sheets (dari web) dan bot Telegram, jadi dua-duanya
// pakai logika yang sama persis (nggak ada dua versi mapping data).

function parsePrivateKey(raw) {
  if (!raw) return "";
  let key = String(raw).trim();
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1);
  }
  if (key.includes("\n")) key = key.replace(/\n/g, "\n");
  return key.trim();
}

export function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: parsePrivateKey(process.env.GOOGLE_PRIVATE_KEY),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

// Bangun ulang semua sheet + ringkasan dari data user yang ada di Firestore.
// Data yang sudah dihapus otomatis hilang karena tiap sheet di-clear dulu.
export async function syncUserToSheets(userData) {
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  if (!spreadsheetId) throw new Error("GOOGLE_SHEETS_ID belum diset");

  const sheets = getSheetsClient();
  const results = [];
  const jumlahPerMenu = {};

  // Bersihin dulu sisa tab model lama supaya hasil sync kelihatan bedanya.
  try {
    await rapikanTabLama(sheets, spreadsheetId);
  } catch (err) {
    console.error("[sync-sheets] gagal rapikan tab lama:", err.message);
  }

  for (const menu of MENU) {
    try {
      const baris = menu.baris(userData).slice().sort(menu.urut);
      const jumlah = await tulisSheet(sheets, spreadsheetId, menu.nama, menu.kolom, baris);
      jumlahPerMenu[menu.nama] = jumlah;
      results.push({ sheet: menu.nama, rows: jumlah, status: "ok" });
    } catch (err) {
      console.error(`[sync-sheets] gagal sync ${menu.kunci}:`, err.message);
      jumlahPerMenu[menu.nama] = "-";
      results.push({ sheet: menu.nama, status: "error", error: err.message });
    }
  }

  try {
    // Nama fungsinya masih tulisRingkasan (biar import lama aman), tapi isi
    // dan tab-nya sekarang "Dashboard" — niru halaman utama web.
    await tulisRingkasan(sheets, spreadsheetId, userData, jumlahPerMenu);
    results.push({ sheet: "Dashboard", status: "ok" });
  } catch (err) {
    console.error("[sync-sheets] gagal sync dashboard:", err.message);
    results.push({ sheet: "Dashboard", status: "error", error: err.message });
  }

  // Urutkan tab: Dashboard paling depan, lalu menu, sisanya di belakang.
  try {
    await rapikanTabLama(sheets, spreadsheetId);
  } catch (err) {
    console.error("[sync-sheets] gagal urutkan tab:", err.message);
  }

  return {
    results,
    jumlahPerMenu,
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
  };
}

// ========== RAPIKAN TAB LAMA ==========
// Sync versi lama pakai nama tab "BedahBuku", "MenuCustom", dan "Ringkasan".
// Kalau dibiarkan, setelah sync baru user tetap lihat tab lama berisi data
// model lama (kolom firestoreId, Timeline ███, dst) — kesannya sync-nya nggak
// berubah. Jadi nama lamanya dirapikan / sisa tab kotor dihapus dulu.
const NAMA_TAB_LAMA = {
  BedahBuku: "Bedah Buku",
  MenuCustom: "Menu Custom",
  Ringkasan: "Dashboard",
};

export async function rapikanTabLama(sheets, spreadsheetId) {
  const info = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets.properties(sheetId,title,index)",
  });
  const daftar = (info.data.sheets || []).map((s) => ({ ...s.properties }));
  if (daftar.length === 0) return;

  const titleAda = new Set(daftar.map((s) => s.title));

  // 1. Ganti nama tab lama (kalau nama barunya belum ada).
  const rename = [];
  Object.entries(NAMA_TAB_LAMA).forEach(([lama, baru]) => {
    const sheet = daftar.find((s) => s.title === lama);
    if (!sheet || titleAda.has(baru)) return;
    rename.push({
      updateSheetProperties: {
        properties: { sheetId: sheet.sheetId, title: baru },
        fields: "title",
      },
    });
    titleAda.delete(lama);
    titleAda.add(baru);
    sheet.title = baru;
  });
  if (rename.length > 0) {
    await sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests: rename } });
  }

  // 2. Hapus tab sisa yang jelas bukan bagian aplikasi (Sheet1, Ringkasan
  // lama, dsb), tapi minimal satu tab harus tersisa.
  const namaResmi = new Set(["Dashboard", ...MENU.map((m) => m.nama)]);
  const buang = daftar.filter(
    (s) =>
      daftar.length > 1 &&
      !namaResmi.has(s.title) &&
      (/^sheet\s*\d+$/i.test(s.title) ||
        s.title === "Sheet1" ||
        s.title === "Sheet 1" ||
        s.title === "Ringkasan")
  );
  if (buang.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: buang.map((s) => ({ deleteSheet: { sheetId: s.sheetId } })),
      },
    });
  }

  // 3. Urutkan: Dashboard paling depan, lalu urutan menu, sisanya di belakang.
  const urutan = ["Dashboard", ...MENU.map((m) => m.nama)];
  const sisa = daftar.filter((s) => !urutan.includes(s.title)).map((s) => s.title);
  const final = [...urutan.filter((n) => titleAda.has(n)), ...sisa];
  const infoBaru = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets.properties(sheetId,title)",
  });
  const peta = new Map((infoBaru.data.sheets || []).map((s) => [s.properties.title, s.properties.sheetId]));
  const pindah = [];
  final.forEach((nama, index) => {
    const sheetId = peta.get(nama);
    if (sheetId === undefined) return;
    pindah.push({
      updateSheetProperties: {
        properties: { sheetId, index },
        fields: "index",
      },
    });
  });
  if (pindah.length > 0) {
    await sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests: pindah } });
  }
}
