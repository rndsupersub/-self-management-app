// lib/olahragaData.js

// ========== TARGET DEFAULT MINGGU 1 ==========
// Ini template awal. User bisa edit.
export const DEFAULT_TARGET_MINGGU_1 = {
  jogging: { km: 4, pace: 8.5 },
  pushUp: { reps: 20 },
  legRaise: { reps: 20 },
  plank: { detik: 30 },
};

// ========== FIELD EVALUASI DEFAULT ==========
// User bisa tambah/hapus/edit field ini.
export const DEFAULT_FIELD_EVALUASI = [
  { id: "nyeriOtot", label: "💪 Nyeri Otot" },
  { id: "napas", label: "🫁 Napas" },
  { id: "mood", label: "😊 Mood" },
  { id: "tidur", label: "😴 Tidur" },
  { id: "makan", label: "🍽️ Makan" },
  { id: "catatanBebas", label: "📝 Catatan Bebas" },
];

// ========== TEMPLATE OLAHRAGA DEFAULT ==========
export const DEFAULT_OLAHRAGA = {
  minggu: [],
  harian: {},
  fieldEvaluasi: DEFAULT_FIELD_EVALUASI,
};

// ========== HELPER: GENERATE ID UNIK ==========
export function generateId(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

// ========== HELPER: FORMAT TANGGAL ==========
export function formatTanggal(dateStr, opsi = "panjang") {
  const d = new Date(dateStr);
  if (opsi === "pendek") {
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ========== HELPER: DAPETIN TANGGAL SENIN MINGGU INI ==========
export function getMingguIni() {
  const now = new Date();
  const day = now.getDay(); // 0 = Minggu, 1 = Senin, ...
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Senin
  const senin = new Date(now.setDate(diff));
  return senin.toISOString().split("T")[0];
}

// ========== HELPER: TAMBAH HARI ==========
export function tambahHari(dateStr, jumlah) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + jumlah);
  return d.toISOString().split("T")[0];
}

// ========== HELPER: HITUNG TANGGAL SELESAI (MINGGU = 7 HARI) ==========
export function hitungTanggalSelesai(tanggalMulai) {
  return tambahHari(tanggalMulai, 6); // Senin + 6 = Minggu
}

// ========== HELPER: FORMAT LABEL MINGGU ==========
export function formatMinggu(mingguKe, tanggalMulai, tanggalSelesai) {
  const mulai = new Date(tanggalMulai).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
  const selesai = new Date(tanggalSelesai).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `Minggu ${mingguKe} (${mulai} – ${selesai})`;
}

// ========== HELPER: SARAN KEPUTUSAN ==========
// Analisis sederhana dari evaluasi, kasih saran naik/stay/turun.
export function getSaranKeputusan(evaluasi) {
  if (!evaluasi) return { saran: "stay", alasan: "Belum ada evaluasi." };

  // Convert ke lowercase biar gampang analisis
  const text = Object.values(evaluasi)
    .filter((v) => typeof v === "string")
    .join(" ")
    .toLowerCase();

  // Kata kunci yang menandakan sakit / berat / sulit
  const kataNegatif = [
    "sakit",
    "nyeri",
    "berat",
    "sulit",
    "capek",
    "lelah",
    "sesak",
    "nggak kuat",
    "tidak kuat",
    "gagal",
    "kurang",
  ];

  // Kata kunci yang menandakan mampu / enteng / segar
  const kataPositif = [
    "mampu",
    "enteng",
    "segar",
    "kuat",
    "mudah",
    "oke",
    "baik",
    "cukup",
    "nyaman",
    "lancar",
  ];

  const adaNegatif = kataNegatif.some((k) => text.includes(k));
  const adaPositif = kataPositif.some((k) => text.includes(k));

  if (adaNegatif && !adaPositif) {
    return {
      saran: "turun",
      alasan: "Evaluasi menunjukkan ada keluhan. Saran: turunkan intensitas atau stay.",
    };
  }
  if (adaNegatif && adaPositif) {
    return {
      saran: "stay",
      alasan: "Evaluasi campuran. Saran: stay di level yang sama dulu.",
    };
  }
  if (adaPositif && !adaNegatif) {
    return {
      saran: "naik",
      alasan: "Evaluasi positif. Saran: naik level minggu depan.",
    };
  }
  return {
    saran: "stay",
    alasan: "Evaluasi netral. Saran: stay dulu.",
  };
}

// ========== HELPER: TARGET NAIK LEVEL ==========
// Dari target minggu sebelumnya, hitung target minggu berikutnya.
export function hitungTargetNaik(targetLama) {
  return {
    jogging: {
      km: (targetLama.jogging?.km || 0) + 1, // +1 km
      pace: Math.max(5, (targetLama.jogging?.pace || 8.5) - 0.5), // -0.5 pace
    },
    pushUp: { reps: (targetLama.pushUp?.reps || 0) + 5 },
    legRaise: { reps: (targetLama.legRaise?.reps || 0) + 5 },
    plank: { detik: (targetLama.plank?.detik || 0) + 10 },
  };
}