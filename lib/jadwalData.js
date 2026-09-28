// lib/jadwalData.js

// ========== JADWAL SENIN - SABTU ==========
export const JADWAL_KERJA = [
  { id: "olahraga", waktuMulai: "05:30", waktuSelesai: "06:30", label: "🏃 Olahraga", unit: "60 menit" },
  { id: "persiapan", waktuMulai: "06:30", waktuSelesai: "07:30", label: "🚿 Persiapan, sarapan, subuh", unit: "60 menit" },
  { id: "perjalanan_pagi", waktuMulai: "07:30", waktuSelesai: "09:00", label: "🚗 Perjalanan ke kantor", unit: "90 menit" },
  { id: "bedah-buku", waktuMulai: "09:00", waktuSelesai: "10:00", label: "📚 Bedah Buku", unit: "10 halaman" },
  { id: "blender_solidworks", waktuMulai: "10:00", waktuSelesai: "11:00", label: "💻 Blender / SolidWorks", unit: "1 jam", manual: ["Blender", "SolidWorks"] },
  { id: "desain", waktuMulai: "11:00", waktuSelesai: "12:00", label: "🎨 Illustrator / Photoshop", unit: "1 jam", manual: ["Illustrator", "Photoshop"] },
  { id: "dzuhur", waktuMulai: "12:00", waktuSelesai: "13:00", label: "🕌 Dzuhur + makan siang", unit: "60 menit" },
  { id: "kerja", waktuMulai: "13:00", waktuSelesai: "18:00", label: "💼 Kerja (R&D)", unit: "5 jam" },
  { id: "transisi", waktuMulai: "18:00", waktuSelesai: "20:30", label: "🏠 Perjalanan pulang, makan, mandi, isya", unit: "---" },
  { id: "bisnis", waktuMulai: "20:30", waktuSelesai: "21:30", label: "💼 Bisnis", unit: "1 jam" },
  { id: "hafalan", waktuMulai: "21:30", waktuSelesai: "22:00", label: "📖 Hafalan Qur'an", unit: "1 halaman" },
  { id: "mandarin", waktuMulai: "22:00", waktuSelesai: "22:30", label: "🌏 Bahasa Mandarin", unit: "30 menit" },
  { id: "teknik", waktuMulai: "22:30", waktuSelesai: "23:15", label: "📐 Review Teknik Mesin", unit: "45 menit" },
  { id: "fikih", waktuMulai: "23:15", waktuSelesai: "23:45", label: "📖 Fikih Syafii", unit: "30 menit", hari: [2, 4, 6] },
  { id: "keuangan", waktuMulai: "23:45", waktuSelesai: "23:50", label: "💰 Keuangan", unit: "5 menit" },
  { id: "youtube", waktuMulai: "23:50", waktuSelesai: "23:55", label: "🎬 YouTube Short", unit: "5 menit" },
  { id: "tidur", waktuMulai: "23:55", waktuSelesai: "00:00", label: "😴 Persiapan tidur", unit: "5 menit" },
];

// ========== JADWAL MINGGU ==========
export const JADWAL_MINGGU = [
  { id: "olahraga_ringan", waktuMulai: "06:00", waktuSelesai: "07:30", label: "🏃 Olahraga ringan, sarapan", unit: "90 menit" },
  { id: "recovery", waktuMulai: "07:30", waktuSelesai: "12:00", label: "🧘 Recovery / healing", unit: "4.5 jam" },
  { id: "makan_siang", waktuMulai: "12:00", waktuSelesai: "13:00", label: "🍽️ Makan siang", unit: "60 menit" },
  { id: "bisnis_youtube", waktuMulai: "13:00", waktuSelesai: "17:00", label: "💼 Bisnis + produksi YouTube", unit: "4 jam" },
  { id: "santai", waktuMulai: "17:00", waktuSelesai: "18:00", label: "☕ Waktu santai", unit: "60 menit" },
  { id: "transisi_minggu", waktuMulai: "18:00", waktuSelesai: "20:30", label: "🏠 Makan, mandi, isya, istirahat", unit: "---" },
  { id: "review_keuangan", waktuMulai: "20:30", waktuSelesai: "21:00", label: "💰 Review keuangan + murajaah", unit: "30 menit" },
  { id: "refleksi", waktuMulai: "21:00", waktuSelesai: "21:30", label: "📝 Refleksi & perencanaan minggu depan", unit: "30 menit" },
  { id: "tidur_minggu", waktuMulai: "21:30", waktuSelesai: "22:00", label: "😴 Waktu pribadi, tidur", unit: "30 menit" },
];

// ========== TEMPLATE DEFAULT ==========
export const DEFAULT_JADWAL = {
  kerja: JADWAL_KERJA,
  minggu: JADWAL_MINGGU,
};

// ========== MAPPING JADWAL → SUMBER DATA (Deteksi Otomatis) ==========
// 3 lapis deteksi:
//   Lapis 1: toolIds (paling spesifik)
//   Lapis 2: kategoriIds / subKategoriIds
//   Lapis 3: fallback (sumber generic)
//
// Field:
//   sumber: nama field di Firestore user doc
//   tanggalField: nama field yang nyimpen tanggal (default: tanggal)
//   toolIds: array ID tool dari belajarLogHarian yang memicu
//   kategoriIds: array ID kategori (lapis 2)
//   subKategoriIds: array ID sub-kategori (lapis 2)
//   labels: mapping toolId → label display
//   warnas: mapping toolId → warna (id dari WARNA_OPTIONS)
//   manual: kalau ada, user bisa override manual
//   nested: true kalau datanya nested (contoh: bedahBuku.buku[].progressHarian)

export const MAPPING_JADWAL_OTOMATIS = {
  olahraga: {
    sumber: "olahraga",
    field: "harian",           // olahraga.harian[tanggal] ada data
    cekTanggal: true,
  },

  "bedah-buku": {
    sumber: "bedahBuku",
    nested: "buku",
    field: "progressHarian",   // bedahBuku.buku[].progressHarian[tanggal]
    cekTanggal: true,
  },

  blender_solidworks: {
    sumber: "belajarLogHarian",
    toolIds: ["blender", "solidworks"],
    labels: { blender: "Blender", solidworks: "SolidWorks" },
    warnas: { blender: "orange", solidworks: "teal" },
    manual: ["Blender", "SolidWorks"],
  },

  desain: {
    sumber: "belajarLogHarian",
    toolIds: ["illustrator", "photoshop"],
    labels: { illustrator: "Illustrator", photoshop: "Photoshop" },
    warnas: { illustrator: "purple", photoshop: "pink" },
    manual: ["Illustrator", "Photoshop"],
  },

  kerja: {
    sumber: "pekerjaan",
    nested: "brands[].kegiatan",
    cekTanggal: true,
  },

  bisnis: {
    sumber: "bisnisBrands",
    nested: "kegiatan",
    cekTanggal: true,
  },

  hafalan: {
    sumber: "hafalanMembaca",
    cekTanggal: true,
  },

  mandarin: {
    sumber: "belajarLogHarian",
    toolIds: ["hsk_1", "everydaychinese_101days"],
    labels: { hsk_1: "HSK 1", everydaychinese_101days: "EverydayChinese" },
    warnas: { hsk_1: "blue", everydaychinese_101days: "blue" },
    kategoriIds: ["bahasa"],  // fallback
  },

  teknik: {
    sumber: "belajarLogHarian",
    kategoriIds: ["review_mesin"],
    warnas: { _default: "teal" },
  },

  fikih: {
    sumber: "belajarLogHarian",
    subKategoriIds: ["fiqih"],
    warnas: { _default: "green" },
  },

  keuangan: {
    sumber: "keuanganTransaksi",
    cekTanggal: true,
  },

  youtube: {
    sumber: "youtube_logs",
    fieldTanggal: "tanggal",
    cekTanggal: true,
  },
};

// ========== HELPER: FORMAT WAKTU ==========
export function formatWaktu(mulai, selesai) {
  return `${mulai} -- ${selesai}`;
}

// ========== HELPER: AMBIL JADWAL UNTUK TANGGAL ==========
export function getJadwalUntukTanggal(jadwalUser, dateStr) {
  const date = new Date(dateStr);
  const day = date.getDay();

  const jadwalSumber =
    jadwalUser?.kerja && jadwalUser?.minggu ? jadwalUser : DEFAULT_JADWAL;

  if (day === 0) {
    return {
      jadwal: jadwalSumber.minggu || JADWAL_MINGGU,
      hari: "Minggu",
      dayIndex: 0,
    };
  }

  const jadwal = (jadwalSumber.kerja || JADWAL_KERJA).filter((item) => {
    if (item.hari && !item.hari.includes(day)) return false;
    return true;
  });

  const namaHari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  return { jadwal, hari: namaHari[day], dayIndex: day };
}

// ========== HELPER: CEK HARI INI ==========
export function isHariIni(dateStr) {
  const today = new Date().toISOString().split("T")[0];
  return dateStr === today;
}

// ========== HELPER: TAMBAH HARI ==========
export function tambahHari(dateStr, jumlah) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + jumlah);
  return d.toISOString().split("T")[0];
}

// ========== HELPER: FORMAT TANGGAL PANJANG ==========
export function formatTanggalPanjang(dateStr) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ========== DETEKSI OTOMATIS JADWAL ==========
// Fungsi: cek apakah jadwal item ini auto-selesai berdasarkan data Firestore
// Return: { auto: true/false, sumberTool: "blender"/null, label: "Blender", warna: "orange" }

export function deteksiJadwalOtomatis(jadwalId, tanggal, userData) {
  const mapping = MAPPING_JADWAL_OTOMATIS[jadwalId];
  if (!mapping || !userData) return { auto: false };

  const sumber = userData[mapping.sumber];
  if (!sumber) return { auto: false };

  // ========== LAPIS 1: TOOL IDs ==========
  if (mapping.toolIds && Array.isArray(mapping.toolIds)) {
    const logHariItu = sumber[tanggal];
    if (Array.isArray(logHariItu)) {
      // Cari log dengan toolId yang match
      const matchLogs = logHariItu.filter((log) =>
        mapping.toolIds.includes(log.toolId)
      );
      if (matchLogs.length > 0) {
        // Ambil yang terakhir (paling baru)
        const lastLog = matchLogs[matchLogs.length - 1];
        const toolId = lastLog.toolId;
        return {
          auto: true,
          sumberTool: toolId,
          label: mapping.labels?.[toolId] || toolId,
          warna: mapping.warnas?.[toolId] || "gray",
        };
      }
    }
  }

  // ========== LAPIS 2: KATEGORI / SUB-KATEGORI ==========
  if (mapping.kategoriIds && Array.isArray(mapping.kategoriIds)) {
    const logHariItu = sumber[tanggal];
    if (Array.isArray(logHariItu)) {
      const matchLogs = logHariItu.filter((log) =>
        mapping.kategoriIds.includes(log.kategoriId)
      );
      if (matchLogs.length > 0) {
        const lastLog = matchLogs[matchLogs.length - 1];
        return {
          auto: true,
          sumberTool: lastLog.kategoriId,
          label: null,
          warna: mapping.warnas?._default || "gray",
        };
      }
    }
  }

  if (mapping.subKategoriIds && Array.isArray(mapping.subKategoriIds)) {
    const logHariItu = sumber[tanggal];
    if (Array.isArray(logHariItu)) {
      const matchLogs = logHariItu.filter((log) =>
        mapping.subKategoriIds.includes(log.subKategoriId)
      );
      if (matchLogs.length > 0) {
        const lastLog = matchLogs[matchLogs.length - 1];
        return {
          auto: true,
          sumberTool: lastLog.subKategoriId,
          label: null,
          warna: mapping.warnas?._default || "gray",
        };
      }
    }
  }

  // ========== LAPIS 2.5: NESTED FIELDS ==========
  // Contoh: bedahBuku.buku[].progressHarian[tanggal]
  if (mapping.nested === "buku" && Array.isArray(sumber.buku)) {
    for (const buku of sumber.buku) {
      if (buku.progressHarian && buku.progressHarian[tanggal]) {
        return { auto: true, sumberTool: buku.id, label: null, warna: "blue" };
      }
    }
  }

  // Contoh: pekerjaan[].brands[].kegiatan[]
  if (mapping.nested === "brands[].kegiatan" && Array.isArray(sumber)) {
    for (const pt of sumber) {
      for (const brand of pt.brands || []) {
        for (const keg of brand.kegiatan || []) {
          if (keg.tanggal === tanggal) {
            return { auto: true, sumberTool: keg.id, label: null, warna: "indigo" };
          }
        }
      }
    }
  }

  // Contoh: bisnisBrands[].kegiatan[]
  if (mapping.nested === "kegiatan" && Array.isArray(sumber)) {
    for (const brand of sumber) {
      for (const keg of brand.kegiatan || []) {
        if (keg.tanggal === tanggal) {
          return { auto: true, sumberTool: keg.id, label: null, warna: "orange" };
        }
      }
    }
  }

  // ========== LAPIS 3: FALLBACK (field direct dengan tanggal) ==========
  if (mapping.cekTanggal && sumber[tanggal]) {
    return { auto: true, sumberTool: null, label: null, warna: "gray" };
  }

  // Special case: youtube_logs (array, bukan object dengan key tanggal)
  if (mapping.sumber === "youtube_logs" && Array.isArray(sumber)) {
    const logsHariItu = sumber.filter((l) => l.tanggal === tanggal);
    if (logsHariItu.length > 0) {
      return { auto: true, sumberTool: logsHariItu[0].id, label: null, warna: "red" };
    }
  }

  // Special case: olahraga.harian[tanggal]
  if (mapping.sumber === "olahraga" && sumber.harian && sumber.harian[tanggal]) {
    return { auto: true, sumberTool: null, label: null, warna: "green" };
  }

  // Special case: keuanganTransaksi[tanggal]
  if (mapping.sumber === "keuanganTransaksi" && sumber[tanggal]) {
    return { auto: true, sumberTool: null, label: null, warna: "yellow" };
  }

  // Special case: hafalanMembaca[tanggal]
  if (mapping.sumber === "hafalanMembaca" && sumber[tanggal]) {
    return { auto: true, sumberTool: null, label: null, warna: "green" };
  }

  return { auto: false };
}