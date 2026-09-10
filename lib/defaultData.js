// lib/defaultData.js

export const DEFAULT_ACTIVITIES = [
  // ========== LEAF ACTIVITIES ==========
  {
    id: "npd",
    label: "📚 NPD",
    type: "leaf",
    target: 10,
    unit: "halaman"
  },
  {
    id: "olahraga",
    label: "🏃 Olahraga",
    type: "leaf",
    target: 7,
    unit: "km"
  },
  {
    id: "mandarin",
    label: "🌏 Mandarin",
    type: "leaf",
    target: 1,
    unit: "lesson"
  },

  // ========== HAFALAN QUR'AN ==========
  {
    id: "hafalan",
    label: "📖 Hafalan Qur'an",
    type: "expandable",
    children: [
      {
        id: "juz_1",
        label: "Juz 1",
        type: "expandable",
        children: [
          { id: "juz1_alfatihah", label: "Al-Fatihah", type: "leaf" },
          { id: "juz1_baqarah_1_5", label: "Al-Baqarah (1-5)", type: "leaf" },
          { id: "juz1_baqarah_6_10", label: "Al-Baqarah (6-10)", type: "leaf" }
        ]
      },
      {
        id: "juz_30",
        label: "Juz 30",
        type: "expandable",
        children: [
          { id: "juz30_annaba", label: "An-Naba", type: "leaf" },
          { id: "juz30_annaziat", label: "An-Nazi'at", type: "leaf" },
          { id: "juz30_abasa", label: "'Abasa", type: "leaf" }
        ]
      },
      {
        id: "juz_29",
        label: "Juz 29",
        type: "expandable",
        children: [
          { id: "juz29_almulk", label: "Al-Mulk", type: "leaf" },
          { id: "juz29_alqalam", label: "Al-Qalam", type: "leaf" }
        ]
      }
    ]
  },

  // ========== REVIEW TEKNIK MESIN ==========
  {
    id: "teknik",
    label: "📐 Review Teknik Mesin",
    type: "expandable",
    children: [
      {
        id: "semester_1",
        label: "Semester 1",
        type: "expandable",
        children: [
          { id: "mtk1", label: "Matematika 1", type: "leaf" },
          { id: "fisika1", label: "Fisika Dasar", type: "leaf" },
          { id: "kimia1", label: "Kimia Dasar", type: "leaf" }
        ]
      },
      {
        id: "semester_2",
        label: "Semester 2",
        type: "expandable",
        children: [
          { id: "mtk2", label: "Matematika 2", type: "leaf" },
          { id: "termodinamika", label: "Termodinamika", type: "leaf" },
          { id: "mekanika_fluida", label: "Mekanika Fluida", type: "leaf" }
        ]
      },
      {
        id: "semester_3",
        label: "Semester 3",
        type: "expandable",
        children: [
          { id: "mtk3", label: "Matematika 3", type: "leaf" },
          { id: "mekanika_teknik", label: "Mekanika Teknik", type: "leaf" },
          { id: "material_teknik", label: "Material Teknik", type: "leaf" }
        ]
      },
      {
        id: "semester_4",
        label: "Semester 4",
        type: "expandable",
        children: [
          { id: "mtk4", label: "Matematika 4", type: "leaf" },
          { id: "kekuatan_material", label: "Kekuatan Material", type: "leaf" },
          { id: "termodinamika_2", label: "Termodinamika 2", type: "leaf" }
        ]
      },
      {
        id: "semester_5",
        label: "Semester 5",
        type: "expandable",
        children: [
          { id: "mtk5", label: "Matematika 5", type: "leaf" },
          { id: "mesin_fluida", label: "Mesin Fluida", type: "leaf" },
          { id: "perpindahan_panas", label: "Perpindahan Panas", type: "leaf" }
        ]
      },
      {
        id: "semester_6",
        label: "Semester 6",
        type: "expandable",
        children: [
          { id: "mtk6", label: "Matematika 6", type: "leaf" },
          { id: "teknik_manufaktur", label: "Teknik Manufaktur", type: "leaf" },
          { id: "sistem_tenaga", label: "Sistem Tenaga", type: "leaf" }
        ]
      },
      {
        id: "semester_7",
        label: "Semester 7",
        type: "expandable",
        children: [
          { id: "mtk7", label: "Matematika 7", type: "leaf" },
          { id: "getaran_mekanik", label: "Getaran Mekanik", type: "leaf" },
          { id: "kontrol_otomatis", label: "Kontrol Otomatis", type: "leaf" }
        ]
      },
      {
        id: "semester_8",
        label: "Semester 8",
        type: "expandable",
        children: [
          { id: "mtk8", label: "Matematika 8", type: "leaf" },
          { id: "teknik_energi", label: "Teknik Energi", type: "leaf" },
          { id: "ta", label: "Tugas Akhir", type: "leaf" }
        ]
      }
    ]
  },

  // ========== BISNIS ==========
  {
    id: "bisnis",
    label: "💼 Bisnis",
    type: "expandable",
    children: [
      {
        id: "bisnis_sept",
        label: "September 2026",
        type: "expandable",
        children: [
          { id: "bisnis_13sep", label: "13 Sept: Revisi Logo", type: "leaf" },
          { id: "bisnis_20sep", label: "20 Sept: Finalisasi Logo", type: "leaf" },
          { id: "bisnis_27sep", label: "27 Sept: Finalisasi Strategic Plan", type: "leaf" }
        ]
      },
      {
        id: "bisnis_okt",
        label: "Oktober 2026",
        type: "expandable",
        children: [
          { id: "bisnis_4okt", label: "4 Okt: Validasi Produk", type: "leaf" },
          { id: "bisnis_11okt", label: "11 Okt: Prototype", type: "leaf" },
          { id: "bisnis_18okt", label: "18 Okt: Uji Pasar", type: "leaf" },
          { id: "bisnis_25okt", label: "25 Okt: Perbaikan", type: "leaf" }
        ]
      },
      {
        id: "bisnis_nov",
        label: "November 2026",
        type: "expandable",
        children: [
          { id: "bisnis_1nov", label: "1 Nov: Persiapan Produksi", type: "leaf" },
          { id: "bisnis_15nov", label: "15 Nov: Produksi Awal", type: "leaf" },
          { id: "bisnis_30nov", label: "30 Nov: Persiapan Launching", type: "leaf" }
        ]
      },
      {
        id: "bisnis_des",
        label: "Desember 2026",
        type: "expandable",
        children: [
          { id: "bisnis_15des", label: "15 Des: Launching", type: "leaf" },
          { id: "bisnis_31des", label: "31 Des: Evaluasi Launching", type: "leaf" }
        ]
      }
    ]
  },

  // ========== FIQIH SYAFII ==========
  {
    id: "fiqih",
    label: "📖 Fiqih Syafii",
    type: "expandable",
    children: [
      {
        id: "fiqih_thaharah",
        label: "Bab Thaharah (Bersuci)",
        type: "expandable",
        children: [
          { id: "fiqih_wudhu", label: "Wudhu", type: "leaf" },
          { id: "fiqih_mandi", label: "Mandi Junub", type: "leaf" },
          { id: "fiqih_tayamum", label: "Tayamum", type: "leaf" }
        ]
      },
      {
        id: "fiqih_shalat",
        label: "Bab Shalat",
        type: "expandable",
        children: [
          { id: "fiqih_syarat_wajib", label: "Syarat Wajib Shalat", type: "leaf" },
          { id: "fiqih_rukun", label: "Rukun Shalat", type: "leaf" },
          { id: "fiqih_bacaan", label: "Bacaan Shalat", type: "leaf" }
        ]
      },
      {
        id: "fiqih_zakat",
        label: "Bab Zakat",
        type: "expandable",
        children: [
          { id: "fiqih_zakat_mal", label: "Zakat Mal", type: "leaf" },
          { id: "fiqih_zakat_fitrah", label: "Zakat Fitrah", type: "leaf" }
        ]
      },
      {
        id: "fiqih_puasa",
        label: "Bab Puasa",
        type: "expandable",
        children: [
          { id: "fiqih_puasa_wajib", label: "Puasa Wajib", type: "leaf" },
          { id: "fiqih_puasa_sunnah", label: "Puasa Sunnah", type: "leaf" }
        ]
      },
      {
        id: "fiqih_haji",
        label: "Bab Haji",
        type: "expandable",
        children: [
          { id: "fiqih_haji_rukun", label: "Rukun Haji", type: "leaf" },
          { id: "fiqih_haji_wajib", label: "Wajib Haji", type: "leaf" }
        ]
      }
    ]
  }
];