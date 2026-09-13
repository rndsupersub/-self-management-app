// lib/jadwalData.js

// ========== JADWAL SENIN - SABTU ==========
export const JADWAL_KERJA = [
  { id: "olahraga", waktu: "05:30 – 06:30", label: "🏃 Olahraga", unit: "60 menit" },
  { id: "persiapan", waktu: "06:30 – 07:30", label: "🚿 Persiapan, sarapan, subuh", unit: "60 menit" },
  { id: "perjalanan_pagi", waktu: "07:30 – 09:00", label: "🚗 Perjalanan ke kantor", unit: "90 menit" },
  { id: "npd", waktu: "09:00 – 10:00", label: "📚 NPD", unit: "10 halaman" },
  { id: "blender_solidworks", waktu: "10:00 – 11:00", label: "💻 Blender / SolidWorks", unit: "1 jam", manual: ["Blender", "SolidWorks"] },
  { id: "desain", waktu: "11:00 – 12:00", label: "🎨 Illustrator / Photoshop", unit: "1 jam", manual: ["Illustrator", "Photoshop"] },
  { id: "dzuhur", waktu: "12:00 – 13:00", label: "🕌 Dzuhur + makan siang", unit: "60 menit" },
  { id: "kerja", waktu: "13:00 – 18:00", label: "💼 Kerja (R&D)", unit: "5 jam" },
  { id: "transisi", waktu: "18:00 – 20:30", label: "🏠 Perjalanan pulang, makan, mandi, isya", unit: "—" },
  { id: "bisnis", waktu: "20:30 – 21:30", label: "💼 Bisnis", unit: "1 jam" },
  { id: "hafalan", waktu: "21:30 – 22:00", label: "📖 Hafalan Qur'an", unit: "1 halaman" },
  { id: "mandarin", waktu: "22:00 – 22:30", label: "🌏 Bahasa Mandarin", unit: "30 menit" },
  { id: "teknik", waktu: "22:30 – 23:15", label: "📐 Review Teknik Mesin", unit: "45 menit" },
  { id: "fikih", waktu: "23:15 – 23:45", label: "📖 Fikih Syafii", unit: "30 menit", hari: [2, 4, 6] }, // Selasa, Kamis, Sabtu
  { id: "keuangan", waktu: "23:45 – 23:50", label: "💰 Keuangan", unit: "5 menit" },
  { id: "youtube", waktu: "23:50 – 23:55", label: "🎬 YouTube Short", unit: "5 menit" },
  { id: "tidur", waktu: "23:55 – 00:00", label: "😴 Persiapan tidur", unit: "5 menit" },
];

// ========== JADWAL MINGGU ==========
export const JADWAL_MINGGU = [
  { id: "olahraga_ringan", waktu: "06:00 – 07:30", label: "🏃 Olahraga ringan, sarapan", unit: "90 menit" },
  { id: "recovery", waktu: "07:30 – 12:00", label: "🧘 Recovery / healing", unit: "4.5 jam" },
  { id: "makan_siang", waktu: "12:00 – 13:00", label: "🍽️ Makan siang", unit: "60 menit" },
  { id: "bisnis_youtube", waktu: "13:00 – 17:00", label: "💼 Bisnis + produksi YouTube", unit: "4 jam" },
  { id: "santai", waktu: "17:00 – 18:00", label: "☕ Waktu santai", unit: "60 menit" },
  { id: "transisi", waktu: "18:00 – 20:30", label: "🏠 Makan, mandi, isya, istirahat", unit: "—" },
  { id: "review_keuangan", waktu: "20:30 – 21:00", label: "💰 Review keuangan + murajaah", unit: "30 menit" },
  { id: "refleksi", waktu: "21:00 – 21:30", label: "📝 Refleksi & perencanaan minggu depan", unit: "30 menit" },
  { id: "tidur", waktu: "21:30 – 22:00", label: "😴 Waktu pribadi, tidur", unit: "30 menit" },
];

// ========== HELPER: AMBIL JADWAL HARI INI ==========
export function getJadwalHariIni(date = new Date()) {
  const day = date.getDay(); // 0 = Minggu, 1 = Senin, ..., 6 = Sabtu

  if (day === 0) {
    return { jadwal: JADWAL_MINGGU, hari: "Minggu" };
  }

  // Senin - Sabtu
  const jadwal = JADWAL_KERJA.filter((item) => {
    // Kalau item punya field "hari", cek apakah hari ini termasuk
    if (item.hari && !item.hari.includes(day)) return false;
    return true;
  });

  const namaHari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  return { jadwal, hari: namaHari[day] };
}