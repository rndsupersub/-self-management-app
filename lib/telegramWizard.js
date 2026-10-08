// lib/telegramWizard.js
// Config wizard per menu — buat Telegram Bot.
// Versi: 2.0 (dengan sub-menu Kalender/Vendor/Laporan/Evaluasi)

// ========== HELPER: NORMALIZE ==========
export function norm(s) {
  return (s || "").toLowerCase().trim().replace(/\s+/g, "");
}

// ========== HELPER: FORMAT TANGGAL ==========
export function today() {
  return new Date().toISOString().split("T")[0];
}

export function besok() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

export function kemarin() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

// ========== HELPER: TRUNCATE ==========
export function trunc(str, max = 40) {
  if (!str) return "";
  return str.length > max ? str.slice(0, max - 1) + "…" : str;
}

// ========== SUB-MENU CONFIG ==========
// Setiap menu (pekerjaan, bisnis) punya sub-menu.
// Alur: Pilih PT (khusus pekerjaan) → Pilih Brand → Pilih Sub-Menu → Wizard.
export const SUB_MENU_CONFIG = {
  pekerjaan: [
    { id: "kalender", label: "📅 Kalender" },
    { id: "vendor", label: "🏪 Vendor" },
    { id: "laporan", label: "📊 Laporan" },
    { id: "evaluasi", label: "📝 Evaluasi" },
  ],
  bisnis: [
    { id: "kalender", label: "📅 Kalender" },
    { id: "vendor", label: "🏪 Vendor" },
    { id: "laporan", label: "📊 Laporan" },
    { id: "evaluasi", label: "📝 Evaluasi" },
  ],
};

// ========== WIZARD CONFIG ==========
export const WIZARD_CONFIG = {
  // ==========================================================
  // PEKERJAAN → KALENDER
  // ==========================================================
  pekerjaan: {
    label: "💼 Pekerjaan → 📅 Kalender",
    steps: [
      {
        key: "ptId",
        label: "🏢 Pilih PT",
        type: "choice",
        required: true,
        source: (ud) => (ud.pekerjaan || []).map((p) => ({ id: p.id, label: p.nama })),
      },
      {
        key: "brandId",
        label: "🏷️ Pilih Brand",
        type: "choice",
        required: true,
        source: (ud, st) => {
          const pt = (ud.pekerjaan || []).find((p) => p.id === st.fields.ptId);
          return (pt?.brands || []).map((b) => ({ id: b.id, label: b.nama }));
        },
      },
      {
        key: "judul",
        label: "📝 Judul Kegiatan",
        type: "text",
        required: true,
        hint: "Ketik judul kegiatan lo",
      },
      {
        key: "kategoriId",
        label: "📊 Kategori",
        type: "choice",
        required: false,
        default: "analisis",
        source: (ud) => (ud.sections || []).map((s) => ({ id: s.id, label: s.label })),
      },
      {
        key: "prioritasId",
        label: "🔥 Prioritas",
        type: "choice",
        required: false,
        default: "utama",
        source: (ud) => (ud.prioritasList || []).map((p) => ({ id: p.id, label: p.label })),
      },
      {
        key: "sumberId",
        label: "👔 Sumber",
        type: "choice",
        required: false,
        default: "bos",
        source: (ud) => (ud.sumberList || []).map((s) => ({ id: s.id, label: s.label })),
      },
      {
        key: "tanggalMulai",
        label: "📅 Tanggal Mulai",
        type: "date",
        required: false,
        default: "today",
      },
      {
        key: "tanggalSelesai",
        label: "📅 Tanggal Selesai (opsional)",
        type: "date",
        required: false,
        default: "today",
      },
      {
        key: "catatan",
        label: "📝 Catatan",
        type: "optional-text",
        required: false,
        hint: 'Ketik catatan (atau "-" buat kosong)',
      },
      {
        key: "gdriveUrl",
        label: "📁 Link GDrive (opsional)",
        type: "optional-text",
        required: false,
        hint: 'Paste link GDrive (atau "-" buat kosong)',
      },
    ],
  },

  // ==========================================================
  // PEKERJAAN → VENDOR
  // ==========================================================
  "pekerjaan_vendor": {
    label: "💼 Pekerjaan → 🏪 Vendor",
    steps: [
      {
        key: "ptId",
        label: "🏢 Pilih PT",
        type: "choice",
        required: true,
        source: (ud) => (ud.pekerjaan || []).map((p) => ({ id: p.id, label: p.nama })),
      },
      {
        key: "brandId",
        label: "🏷️ Pilih Brand",
        type: "choice",
        required: true,
        source: (ud, st) => {
          const pt = (ud.pekerjaan || []).find((p) => p.id === st.fields.ptId);
          return (pt?.brands || []).map((b) => ({ id: b.id, label: b.nama }));
        },
      },
      {
        key: "nama",
        label: "🏭 Nama Vendor",
        type: "text",
        required: true,
        hint: "Ketik nama vendor (contoh: PT ABC)",
      },
      {
        key: "kategoriId",
        label: "🏷️ Kategori Vendor",
        type: "choice",
        required: true,
        source: (ud) => (ud.vendorKategoriList || []).map((k) => ({ id: k.id, label: k.label })),
      },
      {
        key: "kontakNama",
        label: "👤 Nama Kontak",
        type: "optional-text",
        required: false,
        hint: 'Ketik nama kontak (atau "-" buat kosong)',
      },
      {
        key: "kontakTelp",
        label: "📱 No. Telp / WA",
        type: "optional-text",
        required: false,
        hint: 'Ketik nomor telp (atau "-" buat kosong)',
      },
      {
        key: "kontakEmail",
        label: "✉️ Email",
        type: "optional-text",
        required: false,
        hint: 'Ketik email (atau "-" buat kosong)',
      },
      {
        key: "alamat",
        label: "📍 Alamat",
        type: "optional-text",
        required: false,
        hint: 'Ketik alamat (atau "-" buat kosong)',
      },
      {
        key: "moqNilai",
        label: "📦 MOQ (Nilai)",
        type: "optional-number",
        required: false,
        hint: 'Ketik MOQ (contoh: 100) atau "-" buat kosong',
      },
      {
        key: "moqSatuan",
        label: "📐 Satuan MOQ",
        type: "choice",
        required: false,
        default: "pcs",
        source: (ud) => (ud.vendorSatuanMoqList || []).map((s) => ({ id: s.id, label: s.label })),
      },
      {
        key: "hpp",
        label: "💰 HPP (Rp)",
        type: "optional-number",
        required: false,
        hint: 'Ketik HPP (contoh: 15000) atau "-" buat kosong',
      },
      {
        key: "status",
        label: "🏅 Status Vendor",
        type: "choice",
        required: true,
        default: "silver",
        source: () => [
          { id: "gold", label: "🥇 Gold" },
          { id: "silver", label: "🥈 Silver" },
          { id: "bronze", label: "🥉 Bronze" },
          { id: "blacklist", label: "🔴 Blacklist" },
        ],
      },
      {
        key: "catatan",
        label: "📝 Catatan",
        type: "optional-text",
        required: false,
        hint: 'Ketik catatan (atau "-" buat kosong)',
      },
    ],
  },

  // ==========================================================
  // PEKERJAAN → LAPORAN
  // ==========================================================
  "pekerjaan_laporan": {
    label: "💼 Pekerjaan → 📊 Laporan",
    steps: [
      {
        key: "ptId",
        label: "🏢 Pilih PT",
        type: "choice",
        required: true,
        source: (ud) => (ud.pekerjaan || []).map((p) => ({ id: p.id, label: p.nama })),
      },
      {
        key: "brandId",
        label: "🏷️ Pilih Brand",
        type: "choice",
        required: true,
        source: (ud, st) => {
          const pt = (ud.pekerjaan || []).find((p) => p.id === st.fields.ptId);
          return (pt?.brands || []).map((b) => ({ id: b.id, label: b.nama }));
        },
      },
      {
        key: "periode",
        label: "📆 Periode Laporan",
        type: "choice",
        required: true,
        source: () => [
          { id: "harian", label: "📅 Harian" },
          { id: "mingguan", label: "📅 Mingguan" },
          { id: "bulanan", label: "📆 Bulanan" },
        ],
      },
      {
        key: "tanggal",
        label: "📅 Tanggal",
        type: "date",
        required: true,
        default: "today",
      },
      {
        key: "konten",
        label: "📝 Isi Laporan",
        type: "text",
        required: true,
        hint: "Ketik isi laporan (bisa panjang)",
      },
    ],
  },

  // ==========================================================
  // PEKERJAAN → EVALUASI
  // ==========================================================
  "pekerjaan_evaluasi": {
    label: "💼 Pekerjaan → 📝 Evaluasi",
    steps: [
      {
        key: "ptId",
        label: "🏢 Pilih PT",
        type: "choice",
        required: true,
        source: (ud) => (ud.pekerjaan || []).map((p) => ({ id: p.id, label: p.nama })),
      },
      {
        key: "brandId",
        label: "🏷️ Pilih Brand",
        type: "choice",
        required: true,
        source: (ud, st) => {
          const pt = (ud.pekerjaan || []).find((p) => p.id === st.fields.ptId);
          return (pt?.brands || []).map((b) => ({ id: b.id, label: b.nama }));
        },
      },
      {
        key: "periode",
        label: "📆 Periode Evaluasi",
        type: "choice",
        required: true,
        source: () => [
          { id: "bulanan", label: "📆 Bulanan" },
          { id: "triwulan", label: "📅 Triwulan" },
          { id: "semester", label: "📆 Semester" },
          { id: "tahunan", label: "📅 Tahunan" },
        ],
      },
      {
        key: "tanggal",
        label: "📅 Tanggal Acuan",
        type: "date",
        required: true,
        default: "today",
      },
      {
        key: "efektivitas",
        label: "🎯 Efektivitas",
        type: "optional-text",
        required: false,
        hint: 'Ketik efektivitas (atau "-" buat kosong)',
      },
      {
        key: "efisiensi",
        label: "⚡ Efisiensi",
        type: "optional-text",
        required: false,
        hint: 'Ketik efisiensi (atau "-" buat kosong)',
      },
      {
        key: "kendala",
        label: "🚧 Kendala",
        type: "optional-text",
        required: false,
        hint: 'Ketik kendala (atau "-" buat kosong)',
      },
      {
        key: "solusi",
        label: "💡 Solusi",
        type: "optional-text",
        required: false,
        hint: 'Ketik solusi (atau "-" buat kosong)',
      },
      {
        key: "energi",
        label: "🔋 Energi (1-10)",
        type: "number",
        required: false,
        default: 5,
      },
      {
        key: "mood",
        label: "😊 Mood",
        type: "optional-text",
        required: false,
        hint: 'Ketik mood (atau "-" buat kosong)',
      },
      {
        key: "catatanBebas",
        label: "📝 Catatan Bebas",
        type: "optional-text",
        required: false,
        hint: 'Ketik catatan (atau "-" buat kosong)',
      },
    ],
  },

  // ==========================================================
  // BISNIS → KALENDER
  // ==========================================================
  bisnis: {
    label: "💼 Bisnis → 📅 Kalender",
    steps: [
      {
        key: "brandId",
        label: "🏷️ Pilih Brand",
        type: "choice",
        required: true,
        source: (ud) => (ud.bisnisBrands || []).map((b) => ({ id: b.id, label: b.nama })),
      },
      {
        key: "judul",
        label: "📝 Judul Kegiatan",
        type: "text",
        required: true,
        hint: "Ketik judul kegiatan lo",
      },
      {
        key: "tanggal",
        label: "📅 Tanggal",
        type: "date",
        required: true,
        default: "today",
      },
      {
        key: "kategoriId",
        label: "📊 Kategori",
        type: "choice",
        required: false,
        default: "analisis",
        source: (ud) => (ud.bisnisSections || []).map((s) => ({ id: s.id, label: s.label })),
      },
      {
        key: "prioritasId",
        label: "🔥 Prioritas",
        type: "choice",
        required: false,
        default: "utama",
        source: (ud) => (ud.bisnisPrioritasList || []).map((p) => ({ id: p.id, label: p.label })),
      },
      {
        key: "sumberId",
        label: "👔 Sumber",
        type: "choice",
        required: false,
        default: "gua",
        source: (ud) => (ud.bisnisSumberList || []).map((s) => ({ id: s.id, label: s.label })),
      },
      {
        key: "catatan",
        label: "📝 Catatan",
        type: "optional-text",
        required: false,
        hint: 'Ketik catatan (atau "-")',
      },
      {
        key: "gdriveUrl",
        label: "📁 Link GDrive (opsional)",
        type: "optional-text",
        required: false,
        hint: 'Paste link (atau "-")',
      },
    ],
  },

  // ==========================================================
  // BISNIS → VENDOR
  // ==========================================================
  "bisnis_vendor": {
    label: "💼 Bisnis → 🏪 Vendor",
    steps: [
      {
        key: "brandId",
        label: "🏷️ Pilih Brand",
        type: "choice",
        required: true,
        source: (ud) => (ud.bisnisBrands || []).map((b) => ({ id: b.id, label: b.nama })),
      },
      {
        key: "nama",
        label: "🏭 Nama Vendor",
        type: "text",
        required: true,
        hint: "Ketik nama vendor",
      },
      {
        key: "kategoriId",
        label: "🏷️ Kategori Vendor",
        type: "choice",
        required: true,
        source: (ud) => (ud.vendorKategoriList || []).map((k) => ({ id: k.id, label: k.label })),
      },
      {
        key: "kontakNama",
        label: "👤 Nama Kontak",
        type: "optional-text",
        required: false,
        hint: 'Ketik nama (atau "-")',
      },
      {
        key: "kontakTelp",
        label: "📱 No. Telp / WA",
        type: "optional-text",
        required: false,
        hint: 'Ketik telp (atau "-")',
      },
      {
        key: "kontakEmail",
        label: "✉️ Email",
        type: "optional-text",
        required: false,
        hint: 'Ketik email (atau "-")',
      },
      {
        key: "alamat",
        label: "📍 Alamat",
        type: "optional-text",
        required: false,
        hint: 'Ketik alamat (atau "-")',
      },
      {
        key: "moqNilai",
        label: "📦 MOQ (Nilai)",
        type: "optional-number",
        required: false,
        hint: 'Ketik MOQ atau "-"',
      },
      {
        key: "moqSatuan",
        label: "📐 Satuan MOQ",
        type: "choice",
        required: false,
        default: "pcs",
        source: (ud) => (ud.vendorSatuanMoqList || []).map((s) => ({ id: s.id, label: s.label })),
      },
      {
        key: "hpp",
        label: "💰 HPP (Rp)",
        type: "optional-number",
        required: false,
        hint: 'Ketik HPP atau "-"',
      },
      {
        key: "status",
        label: "🏅 Status Vendor",
        type: "choice",
        required: true,
        default: "silver",
        source: () => [
          { id: "gold", label: "🥇 Gold" },
          { id: "silver", label: "🥈 Silver" },
          { id: "bronze", label: "🥉 Bronze" },
          { id: "blacklist", label: "🔴 Blacklist" },
        ],
      },
      {
        key: "catatan",
        label: "📝 Catatan",
        type: "optional-text",
        required: false,
        hint: 'Ketik catatan (atau "-")',
      },
    ],
  },

  // ==========================================================
  // BISNIS → LAPORAN
  // ==========================================================
  "bisnis_laporan": {
    label: "💼 Bisnis → 📊 Laporan",
    steps: [
      {
        key: "brandId",
        label: "🏷️ Pilih Brand",
        type: "choice",
        required: true,
        source: (ud) => (ud.bisnisBrands || []).map((b) => ({ id: b.id, label: b.nama })),
      },
      {
        key: "periode",
        label: "📆 Periode Laporan",
        type: "choice",
        required: true,
        source: () => [
          { id: "harian", label: "📅 Harian" },
          { id: "mingguan", label: "📅 Mingguan" },
          { id: "bulanan", label: "📆 Bulanan" },
        ],
      },
      {
        key: "tanggal",
        label: "📅 Tanggal",
        type: "date",
        required: true,
        default: "today",
      },
      {
        key: "konten",
        label: "📝 Isi Laporan",
        type: "text",
        required: true,
        hint: "Ketik isi laporan (bisa panjang)",
      },
    ],
  },

  // ==========================================================
  // BISNIS → EVALUASI
  // ==========================================================
  "bisnis_evaluasi": {
    label: "💼 Bisnis → 📝 Evaluasi",
    steps: [
      {
        key: "brandId",
        label: "🏷️ Pilih Brand",
        type: "choice",
        required: true,
        source: (ud) => (ud.bisnisBrands || []).map((b) => ({ id: b.id, label: b.nama })),
      },
      {
        key: "periode",
        label: "📆 Periode Evaluasi",
        type: "choice",
        required: true,
        source: () => [
          { id: "bulanan", label: "📆 Bulanan" },
          { id: "triwulan", label: "📅 Triwulan" },
          { id: "semester", label: "📆 Semester" },
          { id: "tahunan", label: "📅 Tahunan" },
        ],
      },
      {
        key: "tanggal",
        label: "📅 Tanggal Acuan",
        type: "date",
        required: true,
        default: "today",
      },
      {
        key: "efektivitas",
        label: "🎯 Efektivitas",
        type: "optional-text",
        required: false,
        hint: 'Ketik efektivitas (atau "-")',
      },
      {
        key: "efisiensi",
        label: "⚡ Efisiensi",
        type: "optional-text",
        required: false,
        hint: 'Ketik efisiensi (atau "-")',
      },
      {
        key: "kendala",
        label: "🚧 Kendala",
        type: "optional-text",
        required: false,
        hint: 'Ketik kendala (atau "-")',
      },
      {
        key: "solusi",
        label: "💡 Solusi",
        type: "optional-text",
        required: false,
        hint: 'Ketik solusi (atau "-")',
      },
      {
        key: "energi",
        label: "🔋 Energi (1-10)",
        type: "number",
        required: false,
        default: 5,
      },
      {
        key: "mood",
        label: "😊 Mood",
        type: "optional-text",
        required: false,
        hint: 'Ketik mood (atau "-")',
      },
      {
        key: "catatanBebas",
        label: "📝 Catatan Bebas",
        type: "optional-text",
        required: false,
        hint: 'Ketik catatan (atau "-")',
      },
    ],
  },

  // ==========================================================
  // BELAJAR
  // ==========================================================
  belajar: {
    label: "📚 Belajar",
    steps: [
      {
        key: "kategoriId",
        label: "📚 Pilih Kategori",
        type: "choice",
        required: true,
        source: (ud) => (ud.belajar?.kategori || []).map((k) => ({ id: k.id, label: k.nama })),
      },
      {
        key: "subKategoriId",
        label: "🎨 Pilih Sub-Kategori",
        type: "choice",
        required: true,
        source: (ud, st) => {
          const kat = (ud.belajar?.kategori || []).find((k) => k.id === st.fields.kategoriId);
          return (kat?.subKategori || []).map((s) => ({ id: s.id, label: s.nama }));
        },
      },
      {
        key: "toolId",
        label: "🛠️ Pilih Tool",
        type: "choice",
        required: true,
        source: (ud, st) => {
          const kat = (ud.belajar?.kategori || []).find((k) => k.id === st.fields.kategoriId);
          const sub = (kat?.subKategori || []).find((s) => s.id === st.fields.subKategoriId);
          return (sub?.tools || []).map((t) => ({ id: t.id, label: t.nama }));
        },
      },
      {
        key: "fiturId",
        label: "📹 Pilih Fitur",
        type: "choice",
        required: false,
        source: (ud, st) => {
          const kat = (ud.belajar?.kategori || []).find((k) => k.id === st.fields.kategoriId);
          const sub = (kat?.subKategori || []).find((s) => s.id === st.fields.subKategoriId);
          const tool = (sub?.tools || []).find((t) => t.id === st.fields.toolId);
          return (tool?.fitur || []).map((f) => ({ id: f.id, label: f.nama }));
        },
        skipLabel: "⏭️ Skip (tool aja)",
      },
      {
        key: "partId",
        label: "📄 Pilih Part",
        type: "choice",
        required: false,
        source: (ud, st) => {
          const kat = (ud.belajar?.kategori || []).find((k) => k.id === st.fields.kategoriId);
          const sub = (kat?.subKategori || []).find((s) => s.id === st.fields.subKategoriId);
          const tool = (sub?.tools || []).find((t) => t.id === st.fields.toolId);
          const fitur = (tool?.fitur || []).find((f) => f.id === st.fields.fiturId);
          return (fitur?.parts || []).map((p) => ({ id: p.id, label: p.nama }));
        },
        skipLabel: "⏭️ Skip (fitur aja)",
      },
      {
        key: "catatan",
        label: "📝 Catatan",
        type: "text",
        required: true,
        hint: "Ketik catatan belajar lo",
      },
      {
        key: "gdriveUrl",
        label: "📁 Link GDrive (opsional)",
        type: "optional-text",
        required: false,
        hint: 'Paste link (atau "-")',
      },
    ],
  },

  // ==========================================================
  // OLAHRAGA
  // ==========================================================
  olahraga: {
    label: "🏃 Olahraga",
    steps: [
      {
        key: "jenis",
        label: "🏃 Pilih Jenis",
        type: "choice",
        required: true,
        source: () => [
          { id: "jogging", label: "🏃 Jogging" },
          { id: "push-up", label: "💪 Push-up" },
          { id: "leg-raise", label: "🦵 Leg Raise" },
          { id: "plank", label: "🧘 Plank" },
        ],
      },
      {
        key: "jumlah",
        label: "🔢 Jumlah",
        type: "text",
        required: true,
        hint: "Ketik jumlah (contoh: 7 km, 20 reps, 30 detik)",
      },
      {
        key: "catatan",
        label: "📝 Catatan",
        type: "optional-text",
        required: false,
        hint: 'Ketik catatan (atau "-")',
      },
    ],
  },

  // ==========================================================
  // KEUANGAN
  // ==========================================================
  keuangan: {
    label: "💰 Keuangan",
    steps: [
      {
        key: "jenis",
        label: "💱 Jenis Transaksi",
        type: "choice",
        required: true,
        source: () => [
          { id: "masuk", label: "📥 Masuk" },
          { id: "keluar", label: "📤 Keluar" },
          { id: "tabungan", label: "🏦 Tabungan" },
          { id: "sedekah", label: "🤲 Sedekah" },
        ],
      },
      {
        key: "nominal",
        label: "💵 Nominal",
        type: "number",
        required: true,
        hint: "Ketik nominal (contoh: 50000)",
      },
      {
        key: "kategoriId",
        label: "📊 Kategori",
        type: "choice",
        required: true,
        source: (ud, st) => {
          const jenis = st.fields.jenis || "keluar";
          const kat = ud.keuanganKategori || {};
          const list = kat[jenis] || [];
          return list.map((k) => ({ id: k.id, label: k.nama }));
        },
      },
      {
        key: "walletId",
        label: "👛 Dompet",
        type: "choice",
        required: false,
        source: (ud, st) => {
          const jenis = st.fields.jenis || "keluar";
          const dompet = ud.keuanganDompet || [];
          if (jenis === "keluar") {
            return dompet.filter((d) => d.tipe === "spending").map((d) => ({ id: d.id, label: d.nama }));
          }
          if (jenis === "tabungan") {
            return dompet.filter((d) => d.tipe === "target").map((d) => ({ id: d.id, label: d.nama }));
          }
          return dompet.map((d) => ({ id: d.id, label: d.nama }));
        },
        skipLabel: "⏭️ Skip",
      },
      {
        key: "catatan",
        label: "📝 Catatan",
        type: "optional-text",
        required: false,
        hint: 'Ketik catatan (atau "-")',
      },
    ],
  },

  // ==========================================================
  // HAFALAN
  // ==========================================================
  hafalan: {
    label: "📖 Hafalan Qur'an",
    steps: [
      {
        key: "juzId",
        label: "📚 Pilih Juz",
        type: "choice",
        required: true,
        source: (ud) => {
          const hafalanAct = (ud.activities || []).find((a) => a.id === "hafalan");
          const children = hafalanAct?.children || [];
          return children.map((j) => ({ id: j.id, label: j.label }));
        },
      },
      {
        key: "suratId",
        label: "📖 Pilih Surat",
        type: "choice",
        required: true,
        source: (ud, st) => {
          const hafalanAct = (ud.activities || []).find((a) => a.id === "hafalan");
          const juz = (hafalanAct?.children || []).find((j) => j.id === st.fields.juzId);
          return (juz?.children || []).map((s) => ({ id: s.id, label: s.label }));
        },
      },
      {
        key: "halamanMulai",
        label: "📄 Halaman Mulai",
        type: "number",
        required: false,
        default: 1,
      },
      {
        key: "halamanSelesai",
        label: "📄 Halaman Selesai",
        type: "number",
        required: false,
        default: 1,
      },
      {
        key: "catatan",
        label: "📝 Catatan",
        type: "optional-text",
        required: false,
        hint: 'Ketik catatan (atau "-")',
      },
    ],
  },

  // ==========================================================
  // YOUTUBE
  // ==========================================================
  youtube: {
    label: "📺 YouTube",
    steps: [
      {
        key: "channel",
        label: "📺 Pilih Channel",
        type: "choice",
        required: true,
        source: (ud) => {
          const channels = ud.youtube?.channels || [];
          return channels.map((c) => ({ id: c.id, label: c.nama }));
        },
      },
      {
        key: "tipe",
        label: "🎬 Tipe Konten",
        type: "choice",
        required: true,
        source: () => [
          { id: "short", label: "📱 Short" },
          { id: "video", label: "🖥️ Video" },
        ],
      },
      {
        key: "judul",
        label: "📝 Judul Konten",
        type: "text",
        required: true,
        hint: "Ketik judul konten",
      },
      {
        key: "status",
        label: "🏷️ Status",
        type: "choice",
        required: true,
        default: "idea",
        source: () => [
          { id: "idea", label: "💡 Ide" },
          { id: "recording", label: "🎙️ Recording" },
          { id: "editing", label: "✂️ Editing" },
          { id: "ready", label: "📦 Ready to Upload" },
          { id: "publish", label: "✅ Published" },
        ],
      },
      {
        key: "linkYoutube",
        label: "🔗 Link YouTube (opsional)",
        type: "optional-text",
        required: false,
        hint: 'Paste link YouTube (atau "-")',
      },
      {
        key: "gdriveUrl",
        label: "📁 Link GDrive (opsional)",
        type: "optional-text",
        required: false,
        hint: 'Paste link GDrive (atau "-")',
      },
      {
        key: "catatan",
        label: "📝 Catatan",
        type: "optional-text",
        required: false,
        hint: 'Ketik catatan (atau "-")',
      },
    ],
  },

  // ==========================================================
  // BEDAH BUKU
  // ==========================================================
  "bedah-buku": {
    label: "📚 Bedah Buku",
    steps: [
      {
        key: "bukuId",
        label: "📖 Pilih Buku",
        type: "choice",
        required: true,
        source: (ud) => {
          const bukuList = ud.bedahBuku?.buku || [];
          return bukuList.map((b) => ({ id: b.id, label: b.judul }));
        },
      },
      {
        key: "halamanMulai",
        label: "📄 Halaman Mulai",
        type: "number",
        required: true,
      },
      {
        key: "halamanSelesai",
        label: "📄 Halaman Selesai",
        type: "number",
        required: true,
      },
      {
        key: "catatan",
        label: "📝 Catatan",
        type: "optional-text",
        required: false,
        hint: 'Ketik catatan (atau "-")',
      },
    ],
  },
};

// ========== WIZARD UNTUK MENU CUSTOM ==========
export const CUSTOM_MENU_WIZARD = {
  label: "📓 Menu Custom",
  steps: [
    {
      key: "catatan",
      label: "📝 Catatan",
      type: "text",
      required: true,
      hint: "Ketik catatan lo",
    },
    {
      key: "gdriveUrl",
      label: "📁 Link GDrive (opsional)",
      type: "optional-text",
      required: false,
      hint: 'Paste link (atau "-")',
    },
  ],
};

// ========== HELPER: BUILD RINGKASAN ==========
export function buildRingkasan(menuId, steps, fields, userData) {
  const config = WIZARD_CONFIG[menuId] || CUSTOM_MENU_WIZARD;
  const lines = [`<b>📋 Ringkasan</b>`, ``];
  lines.push(`Menu: <b>${config.label}</b>`);
  lines.push(``);

  const fakeState = { menuId, fields };

  steps.forEach((step) => {
    const val = fields[step.key];
    if (val === undefined || val === null || val === "") return;

    let displayVal = val;
    if (step.type === "choice" && step.source) {
      try {
        const opts = step.source(userData, fakeState) || [];
        const found = opts.find((o) => o.id === val);
        if (found) displayVal = found.label;
      } catch (e) {
        console.error("[buildRingkasan] source error:", e.message);
      }
    }
    lines.push(`${step.label}: <b>${displayVal}</b>`);
  });

  lines.push(``);
  lines.push(`Simpen?`);
  return lines.join("\n");
}

// ========== HELPER: PROGRESS LABEL ==========
export function progressLabel(stepIdx, totalSteps) {
  return `Step ${stepIdx + 1}/${totalSteps}`;
}