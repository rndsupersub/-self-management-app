// lib/youtubeData.js

export const YOUTUBE_CHANNELS = [
  { id: "gua", nama: "🎥 Channel Gua" },
  { id: "adik", nama: "🎬 Channel Adik" }
];

export const KONTEN_STATUS = [
  { id: "idea", nama: "💡 Ide", color: "bg-gray-500" },
  { id: "recording", nama: "🎙️ Recording", color: "bg-orange-500" },
  { id: "editing", nama: "✂️ Editing", color: "bg-yellow-500" },
  { id: "ready", nama: "📦 Ready to Upload", color: "bg-blue-500" },
  { id: "publish", nama: "✅ Published", color: "bg-green-500" }
];

export const TIPE_KONTEN = [
  { id: "short", nama: "📱 Short", icon: "📱" },
  { id: "video", nama: "🖥️ Video", icon: "🖥️" }
];

export function generateYoutubeId() {
  return `yt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

// Target: Minggu (0) target 6 konten (Produksi). Senin-Sabtu target 1 konten (Upload).
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
    const localDate = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split("T")[0];
    week.push(localDate);
  }
  return week;
}

export function formatDateShort(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" });
}