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