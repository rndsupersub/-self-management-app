// lib/evaluasiData.js

// ========== FIELD EVALUASI DEFAULT ==========
// User bisa tambah/hapus/edit ini nanti (kayak Olahraga).
// Setiap field punya: id, label, tipe ("text" | "long" | "score")
export const DEFAULT_FIELD_EVALUASI = [
  { id: "efektivitas", label: "🎯 Efektivitas", tipe: "long" },
  { id: "efisiensi", label: "⚡ Efisiensi", tipe: "long" },
  { id: "kendala", label: "🚧 Kendala", tipe: "long" },
  { id: "solusi", label: "💡 Solusi", tipe: "long" },
  { id: "energi", label: "🔋 Energi (1-10)", tipe: "score" },
  { id: "mood", label: "😊 Mood", tipe: "text" },
  { id: "catatanBebas", label: "📝 Catatan Bebas", tipe: "long" },
];

// ========== TIPE FIELD ==========
export const TIPE_FIELD = [
  { id: "text", label: "✏️ Pendek (1 baris)" },
  { id: "long", label: "📝 Panjang (textarea)" },
  { id: "score", label: "🔢 Skor (1-10)" },
];

// ========== HELPER: GENERATE ID ==========
export function generateId(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

// ========== HELPER: FORMAT TANGGAL ==========
export function formatTanggalPanjang(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatTanggalPendek(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ========== HELPER: TAMBAH HARI ==========
export function tambahHari(dateStr, jumlah) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + jumlah);
  return d.toISOString().split("T")[0];
}

// ========== HELPER: GET MINGGU RANGE ==========
// Return: { mingguKe, tahun, tanggalMulai (Senin), tanggalSelesai (Minggu), label }
export function getMingguRange(dateStr) {
  const date = new Date(dateStr);
  const day = date.getDay(); // 0 = Minggu, 1 = Senin

  // Cari Senin minggu ini
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const senin = new Date(date.setDate(diff));
  const minggu = new Date(senin);
  minggu.setDate(senin.getDate() + 6);

  const tanggalMulai = senin.toISOString().split("T")[0];
  const tanggalSelesai = minggu.toISOString().split("T")[0];

  // ISO week number
  const target = new Date(senin.valueOf());
  const dayNr = (senin.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  const mingguKe = 1 + Math.ceil((firstThursday - target) / 604800000);

  return {
    mingguKe,
    tahun: senin.getFullYear(),
    tanggalMulai,
    tanggalSelesai,
    label: `Minggu ${mingguKe} (${formatTanggalPendek(tanggalMulai)} – ${formatTanggalPendek(tanggalSelesai)})`,
  };
}

// ========== HELPER: VALIDASI SCORE ==========
export function clampScore(val) {
  const num = parseInt(val);
  if (isNaN(num)) return 0;
  return Math.max(1, Math.min(10, num));
}