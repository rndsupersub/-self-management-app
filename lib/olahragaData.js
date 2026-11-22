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

// Tanggal lokal (WIB), bukan toISOString. Di UTC+7, toISOString untuk jam
// 00:00–06:59 masih tanggal kemarin, jadi minggu bisa bergeser satu hari.
export function tanggalLokal(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ========== HELPER: DAPETIN TANGGAL SENIN MINGGU INI ==========
export function getMingguIni() {
  const now = new Date();
  const day = now.getDay(); // 0 = Minggu, 1 = Senin, ...
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Senin
  const senin = new Date(now.getFullYear(), now.getMonth(), diff);
  return tanggalLokal(senin);
}

// ========== HELPER: TAMBAH HARI ==========
export function tambahHari(dateStr, jumlah) {
  const [tahun, bulan, hari] = String(dateStr).split("-").map(Number);
  const d = new Date(tahun, (bulan || 1) - 1, hari || 1);
  d.setDate(d.getDate() + jumlah);
  return tanggalLokal(d);
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
// ========== JENIS OLAHRAGA YANG BISA DIEDIT ==========
// Dulu jenis olahraga dipaku di kode (jogging, push up, leg raise, plank),
// jadi user tidak bisa menambah sepeda, renang, atau apa pun. Sekarang daftar
// ini disimpan di dokumen user dan bisa ditambah/dihapus dari halaman olahraga.
export const DEFAULT_JENIS_OLAHRAGA = [
  { id: "jogging", label: "Jogging", satuan: "km", ikon: "footprints", field2: { key: "pace", label: "Pace" } },
  { id: "pushUp", label: "Push Up", satuan: "reps", ikon: "dumbbell" },
  { id: "legRaise", label: "Leg Raise", satuan: "reps", ikon: "activity" },
  { id: "plank", label: "Plank", satuan: "detik", ikon: "timer" },
];

export const SATUAN_OLAHRAGA = [
  { id: "km", label: "Kilometer (km)" },
  { id: "meter", label: "Meter" },
  { id: "menit", label: "Menit" },
  { id: "detik", label: "Detik" },
  { id: "reps", label: "Repetisi (reps)" },
  { id: "set", label: "Set" },
  { id: "kali", label: "Kali" },
  { id: "putaran", label: "Putaran" },
];

// Normalisasi daftar jenis: buang yang tidak valid, pastikan id unik.
export function normalisasiJenis(list) {
  const sumber = Array.isArray(list) && list.length > 0 ? list : DEFAULT_JENIS_OLAHRAGA;
  const hasil = [];
  const dipakai = new Set();
  for (const item of sumber) {
    const label = String(item?.label || "").trim();
    if (!label) continue;
    let id = String(item?.id || "").trim() || `jenis_${hasil.length + 1}`;
    if (dipakai.has(id)) id = `${id}_${hasil.length + 1}`;
    dipakai.add(id);
    hasil.push({
      id,
      label,
      satuan: item?.satuan || "reps",
      ikon: item?.ikon || "dumbbell",
      field2: item?.field2 || null,
    });
  }
  return hasil.length > 0 ? hasil : DEFAULT_JENIS_OLAHRAGA;
}

// Baca nilai satu jenis dari data harian. Bentuk lama (jogging.km,
// pushUp.reps, ...) tetap kebaca supaya data lama tidak hilang.
export function bacaEntri(harian = {}, jenis = {}) {
  const entri = harian?.entri || {};
  if (typeof entri[jenis.id] === "number") return entri[jenis.id];
  const lama = harian?.[jenis.id];
  if (typeof lama === "number") return lama;
  if (lama && typeof lama === "object") {
    for (const kunci of ["nilai", "km", "reps", "detik", "menit", "meter", "set", "kali"]) {
      if (typeof lama[kunci] === "number") return lama[kunci];
    }
  }
  return 0;
}

export function bacaPace(harian = {}, jenis = {}) {
  if (!jenis?.field2) return 0;
  const pace = harian?.pace || {};
  if (typeof pace[jenis.id] === "number") return pace[jenis.id];
  if (jenis.id === "jogging" && typeof harian?.jogging?.pace === "number") {
    return harian.jogging.pace;
  }
  return 0;
}

// Tulis nilai satu jenis tanpa menghapus data jenis lain.
export function tulisEntri(harian = {}, jenis = {}, nilai, pace) {
  const baru = { ...harian, entri: { ...(harian?.entri || {}) } };
  const angka = Number(nilai) || 0;
  if (angka > 0) baru.entri[jenis.id] = angka;
  else delete baru.entri[jenis.id];

  if (jenis.field2) {
    baru.pace = { ...(harian?.pace || {}) };
    const p = Number(pace) || 0;
    if (p > 0) baru.pace[jenis.id] = p;
    else delete baru.pace[jenis.id];
  }

  // Hapus bentuk lama untuk jenis ini supaya nilainya tidak dobel.
  if (["jogging", "pushUp", "legRaise", "plank"].includes(jenis.id)) {
    delete baru[jenis.id];
  }
  return baru;
}

export function adaKegiatan(harian = {}, jenisList = DEFAULT_JENIS_OLAHRAGA) {
  if (!harian) return false;
  if (jenisList.some((j) => bacaEntri(harian, j) > 0)) return true;
  return Boolean(String(harian.catatan || "").trim());
}

// Target mingguan juga mengikuti jenis yang diedit user.
export function bacaTarget(target = {}, jenis = {}) {
  const entri = target?.entri || {};
  if (typeof entri[jenis.id] === "number") return entri[jenis.id];
  const lama = target?.[jenis.id];
  if (lama && typeof lama === "object") {
    for (const kunci of ["nilai", "km", "reps", "detik", "menit"]) {
      if (typeof lama[kunci] === "number") return lama[kunci];
    }
  }
  if (typeof lama === "number") return lama;
  return 0;
}

export function tulisTarget(target = {}, jenis = {}, nilai, pace) {
  const baru = { ...target, entri: { ...(target?.entri || {}) } };
  const angka = Number(nilai) || 0;
  if (angka > 0) baru.entri[jenis.id] = angka;
  else delete baru.entri[jenis.id];

  if (jenis.field2) {
    baru.pace = { ...(target?.pace || {}) };
    const p = Number(pace) || 0;
    if (p > 0) baru.pace[jenis.id] = p;
    else delete baru.pace[jenis.id];
  }

  if (["jogging", "pushUp", "legRaise", "plank"].includes(jenis.id)) {
    delete baru[jenis.id];
  }
  return baru;
}

export function bacaPaceTarget(target = {}, jenis = {}) {
  if (!jenis?.field2) return 0;
  const pace = target?.pace || {};
  if (typeof pace[jenis.id] === "number") return pace[jenis.id];
  if (jenis.id === "jogging" && typeof target?.jogging?.pace === "number") {
    return target.jogging.pace;
  }
  return 0;
}

// Naikkan target semua jenis dengan kenaikan yang masuk akal per satuan.
export function naikkanTarget(target = {}, jenisList = DEFAULT_JENIS_OLAHRAGA) {
  let hasil = { ...target };
  for (const jenis of jenisList) {
    const nilai = bacaTarget(hasil, jenis);
    const tambah =
      jenis.satuan === "km"
        ? 1
        : jenis.satuan === "reps"
          ? 5
          : jenis.satuan === "detik"
            ? 10
            : jenis.satuan === "menit"
              ? 2
              : 1;
    const pace = bacaPaceTarget(hasil, jenis);
    hasil = tulisTarget(
      hasil,
      jenis,
      nilai > 0 ? nilai + tambah : 0,
      jenis.field2 && pace > 0 ? Math.max(1, pace - 0.5) : pace
    );
  }
  return hasil;
}
