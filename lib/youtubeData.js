// lib/youtubeData.js

export const YOUTUBE_CHANNELS = [
  { id: "gua", nama: "🎥 Channel Gua" },
  { id: "adik", nama: "🎬 Channel Adik" }
];

export const KONTEN_TIPE = [
  { id: "short", nama: "📱 Short (Harian)" },
  { id: "video", nama: "🖥️ Video (Mingguan)" }
];

export const KONTEN_STATUS = [
  { id: "idea", nama: "💡 Ide", color: "bg-gray-500" },
  { id: "draft", nama: "📝 Draft", color: "bg-yellow-500" },
  { id: "edit", nama: "✂️ Editing", color: "bg-orange-500" },
  { id: "upload", nama: "⏳ Uploaded", color: "bg-blue-500" },
  { id: "publish", nama: "✅ Published", color: "bg-green-500" }
];

export const DEFAULT_TARGET_YOUTUBE = {
  short: 1, // 1 short per hari
  video: 1  // 1 video per minggu
};

// Generate ID unik untuk setiap log konten
export function generateYoutubeId() {
  return `yt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}