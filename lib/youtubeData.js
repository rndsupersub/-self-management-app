// lib/youtubeData.js

export const YOUTUBE_CHANNELS = [
  { id: "gua", nama: "🎥 Channel Gua" },
  { id: "adik", nama: "🎬 Channel Adik" }
];

export const KONTEN_STATUS = [
  { id: "idea", nama: "💡 Ide", color: "bg-gray-500" },
  { id: "editing", nama: "✂️ Editing (Produksi)", color: "bg-yellow-500" },
  { id: "ready", nama: "📦 Stok Ready", color: "bg-blue-500" },
  { id: "publish", nama: "✅ Published", color: "bg-green-500" }
];

// Helper untuk generate ID
export function generateYoutubeId() {
  return `yt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

// Logika Target: Minggu (0) target 6 konten (Produksi). Senin-Sabtu target 1 konten (Upload).
export function getTargetHarian(dateString) {
  const date = new Date(dateString);
  const day = date.getDay();
  if (day === 0) {
    return { target: 6, label: "Target: Siapkan 6 Stok Konten", satuan: "Stok" };
  }
  return { target: 1, label: "Target: Upload 1 Konten", satuan: "Post" };
}

// Helper Kalender: Dapatkan 7 hari dalam minggu dari tanggal yang dipilih
export function getWeekDates(currentDateStr) {
  const current = new Date(currentDateStr);
  const day = current.getDay();
  const diff = current.getDate() - day; // Geser ke hari Minggu
  const startOfWeek = new Date(current.setDate(diff));
  
  const week = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    // Format YYYY-MM-DD lokal
    const localDate = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split("T")[0];
    week.push(localDate);
  }
  return week;
}