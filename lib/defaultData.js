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
      // ========== JUZ 1 ==========
      {
        id: "juz_1",
        label: "Juz 1",
        type: "expandable",
        children: [
          { id: "juz1_alfatihah", label: "Al-Fatihah (1-7)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz1_baqarah_1_5", label: "Al-Baqarah (1-5)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz1_baqarah_6_10", label: "Al-Baqarah (6-10)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz1_baqarah_11_15", label: "Al-Baqarah (11-15)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz1_baqarah_16_20", label: "Al-Baqarah (16-20)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz1_baqarah_21_25", label: "Al-Baqarah (21-25)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz1_baqarah_26_30", label: "Al-Baqarah (26-30)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz1_baqarah_31_35", label: "Al-Baqarah (31-35)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz1_baqarah_36_40", label: "Al-Baqarah (36-40)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz1_baqarah_41_45", label: "Al-Baqarah (41-45)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz1_baqarah_46_50", label: "Al-Baqarah (46-50)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz1_baqarah_51_55", label: "Al-Baqarah (51-55)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz1_baqarah_56_60", label: "Al-Baqarah (56-60)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz1_baqarah_61_65", label: "Al-Baqarah (61-65)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz1_baqarah_66_70", label: "Al-Baqarah (66-70)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz1_baqarah_71_75", label: "Al-Baqarah (71-75)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz1_baqarah_76_80", label: "Al-Baqarah (76-80)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz1_baqarah_81_85", label: "Al-Baqarah (81-85)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz1_baqarah_86_90", label: "Al-Baqarah (86-90)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz1_baqarah_91_95", label: "Al-Baqarah (91-95)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz1_baqarah_96_100", label: "Al-Baqarah (96-100)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz1_baqarah_101_105", label: "Al-Baqarah (101-105)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz1_baqarah_106_110", label: "Al-Baqarah (106-110)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz1_baqarah_111_115", label: "Al-Baqarah (111-115)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz1_baqarah_116_120", label: "Al-Baqarah (116-120)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz1_baqarah_121_125", label: "Al-Baqarah (121-125)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz1_baqarah_126_130", label: "Al-Baqarah (126-130)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz1_baqarah_131_135", label: "Al-Baqarah (131-135)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz1_baqarah_136_140", label: "Al-Baqarah (136-140)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz1_baqarah_141", label: "Al-Baqarah (141)", type: "leaf", target: 1, unit: "halaman" }
        ]
      },

      // ========== JUZ 30 ==========
      {
        id: "juz_30",
        label: "Juz 30",
        type: "expandable",
        children: [
          { id: "juz30_annaba", label: "An-Naba (1-40)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz30_annaziat", label: "An-Nazi'at (1-46)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz30_abasa", label: "'Abasa (1-42)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz30_attakwir", label: "At-Takwir (1-29)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz30_alinfitar", label: "Al-Infitar (1-19)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz30_almutaffifin", label: "Al-Mutaffifin (1-36)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz30_alinsyiqaq", label: "Al-Insyiqaq (1-25)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz30_alburuj", label: "Al-Buruj (1-22)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz30_attariq", label: "At-Tariq (1-17)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz30_alala", label: "Al-A'la (1-19)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz30_alghasyiyah", label: "Al-Gasyiyah (1-26)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz30_alfajr", label: "Al-Fajr (1-30)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz30_albalad", label: "Al-Balad (1-20)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz30_asyams", label: "Asy-Syams (1-15)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz30_allail", label: "Al-Lail (1-21)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz30_adduha", label: "Ad-Duha (1-11)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz30_asyarh", label: "Asy-Syarh (1-8)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz30_attin", label: "At-Tin (1-8)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz30_alalaq", label: "Al-'Alaq (1-19)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz30_alqadr", label: "Al-Qadr (1-5)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz30_albayyinah", label: "Al-Bayyinah (1-8)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz30_azzalzalah", label: "Az-Zalzalah (1-8)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz30_aladiyat", label: "Al-'Adiyat (1-11)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz30_alqariah", label: "Al-Qari'ah (1-11)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz30_attakasur", label: "At-Takasur (1-8)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz30_alasr", label: "Al-'Asr (1-3)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz30_alhumazah", label: "Al-Humazah (1-9)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz30_alfil", label: "Al-Fil (1-5)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz30_quraisy", label: "Quraisy (1-4)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz30_almaun", label: "Al-Ma'un (1-7)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz30_alkausar", label: "Al-Kausar (1-3)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz30_alkafirun", label: "Al-Kafirun (1-6)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz30_annasr", label: "An-Nasr (1-3)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz30_allahab", label: "Al-Lahab (1-5)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz30_alikhlas", label: "Al-Ikhlas (1-4)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz30_alfalaq", label: "Al-Falaq (1-5)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz30_annas", label: "An-Nas (1-6)", type: "leaf", target: 1, unit: "halaman" }
        ]
      },

      // ========== JUZ 29 ==========
      {
        id: "juz_29",
        label: "Juz 29",
        type: "expandable",
        children: [
          { id: "juz29_almulk", label: "Al-Mulk (1-30)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz29_alqalam", label: "Al-Qalam (1-52)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz29_alhaqqah", label: "Al-Haqqah (1-52)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz29_almaarij", label: "Al-Ma'arij (1-44)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz29_nuh", label: "Nuh (1-28)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz29_aljinn", label: "Al-Jinn (1-28)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz29_almuzzammil", label: "Al-Muzzammil (1-20)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz29_almuddassir", label: "Al-Muddassir (1-56)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz29_alqiyamah", label: "Al-Qiyamah (1-40)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz29_alinsan", label: "Al-Insan (1-31)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz29_almursalat", label: "Al-Mursalat (1-50)", type: "leaf", target: 1, unit: "halaman" }
        ]
      },

      // ========== JUZ 28 ==========
      {
        id: "juz_28",
        label: "Juz 28",
        type: "expandable",
        children: [
          { id: "juz28_almujadilah", label: "Al-Mujadilah (1-22)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz28_alhasyr", label: "Al-Hasyr (1-24)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz28_almumtahanah", label: "Al-Mumtahanah (1-13)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz28_assaff", label: "As-Saff (1-14)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz28_aljumuah", label: "Al-Jumu'ah (1-11)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz28_almunafiqun", label: "Al-Munafiqun (1-11)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz28_attagabun", label: "At-Tagabun (1-18)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz28_attalaq", label: "At-Talaq (1-12)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz28_attahrim", label: "At-Tahrim (1-12)", type: "leaf", target: 1, unit: "halaman" }
        ]
      },

      // ========== JUZ 27 ==========
      {
        id: "juz_27",
        label: "Juz 27",
        type: "expandable",
        children: [
          { id: "juz27_alqamar", label: "Al-Qamar (1-55)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz27_arrahman", label: "Ar-Rahman (1-78)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz27_alwaqiah", label: "Al-Waqi'ah (1-96)", type: "leaf", target: 1, unit: "halaman" },
          { id: "juz27_alhadid", label: "Al-Hadid (1-29)", type: "leaf", target: 1, unit: "halaman" }
        ]
      }
    ]
  },

  // ========== BISNIS (SEMENTARA) ==========
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

  // ========== REVIEW TEKNIK MESIN (SEMENTARA) ==========
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
      }
    ]
  },

  // ========== FIQIH SYAFII (SEMENTARA) ==========
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
      }
    ]
  }
];