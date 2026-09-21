// lib/belajarData.js
// Data default + helper buat fitur Belajar.
// Struktur: Belajar → Kategori → Sub-kategori → Tool → Fitur.
// Karya Mingguan cuma ada di kategori Design.

// ========== WARNA OPTIONS (10 PALET) ==========
export const WARNA_OPTIONS = [
  { id: "red", label: "🔴 Merah", bg: "bg-red-500", text: "text-white" },
  { id: "orange", label: "🟠 Orange", bg: "bg-orange-500", text: "text-white" },
  { id: "yellow", label: "🟡 Kuning", bg: "bg-yellow-500", text: "text-white" },
  { id: "green", label: "🟢 Hijau", bg: "bg-green-500", text: "text-white" },
  { id: "teal", label: "🩵 Teal", bg: "bg-teal-500", text: "text-white" },
  { id: "blue", label: "🔵 Biru", bg: "bg-blue-500", text: "text-white" },
  { id: "indigo", label: "🔷 Indigo", bg: "bg-indigo-500", text: "text-white" },
  { id: "purple", label: "🟣 Ungu", bg: "bg-purple-500", text: "text-white" },
  { id: "pink", label: "🩷 Pink", bg: "bg-pink-500", text: "text-white" },
  { id: "gray", label: "⚪ Abu", bg: "bg-gray-500", text: "text-white" },
];

// ========== WARNA DEFAULT PER KATEGORI ==========
export const DEFAULT_WARNA_KATEGORI = {
  design: "purple",
  bahasa: "blue",
  agama: "green",
};

// ========== DEFAULT KATEGORI BELAJAR ==========
export const DEFAULT_KATEGORI = [
  // ========== KATEGORI 1: DESIGN ==========
  {
    id: "design",
    nama: "🎨 Belajar Design",
    warna: "purple",
    subKategori: [
      {
        id: "2d",
        nama: "🖌️ 2D Design",
        tools: [
          {
            id: "illustrator",
            nama: "Illustrator",
            warna: "purple",
            fitur: [
              { id: "pen_tool", nama: "Pen Tool", gdriveUrl: "", catatan: "" },
              { id: "layer", nama: "Layer", gdriveUrl: "", catatan: "" },
              { id: "masking", nama: "Masking", gdriveUrl: "", catatan: "" },
            ],
            karyaMingguan: [],
          },
          {
            id: "photoshop",
            nama: "Photoshop",
            warna: "pink",
            fitur: [
              { id: "layer_ps", nama: "Layer", gdriveUrl: "", catatan: "" },
              { id: "selection", nama: "Selection", gdriveUrl: "", catatan: "" },
            ],
            karyaMingguan: [],
          },
        ],
      },
      {
        id: "3d",
        nama: "🧊 3D Design",
        tools: [
          {
            id: "blender",
            nama: "Blender",
            warna: "orange",
            fitur: [
              {
                id: "blender_guru_donut",
                nama: "Blender Guru --- Donut",
                parts: [
                  { id: "part_1", nama: "Part 1", gdriveUrl: "", catatan: "" },
                  { id: "part_2", nama: "Part 2", gdriveUrl: "", catatan: "" },
                ],
              },
            ],
            karyaMingguan: [],
          },
          {
            id: "solidworks",
            nama: "SolidWorks",
            warna: "teal",
            fitur: [
              {
                id: "basic_features",
                nama: "Basic Features",
                fitur: [
                  { id: "sketch", nama: "Sketch", gdriveUrl: "", catatan: "" },
                  { id: "extrude", nama: "Extrude", gdriveUrl: "", catatan: "" },
                  { id: "cut_extrude", nama: "Cut Extrude", gdriveUrl: "", catatan: "" },
                  { id: "revolve", nama: "Revolve", gdriveUrl: "", catatan: "" },
                ],
              },
              {
                id: "sheet_metal",
                nama: "Sheet Metal",
                fitur: [
                  { id: "base_flange", nama: "Base Flange", gdriveUrl: "", catatan: "" },
                  { id: "edge_flange", nama: "Edge Flange", gdriveUrl: "", catatan: "" },
                ],
              },
              { id: "electrical", nama: "Electrical", fitur: [] },
              { id: "mould_design", nama: "Mould Design", fitur: [] },
            ],
            karyaMingguan: [],
          },
        ],
      },
    ],
  },

  // ========== KATEGORI 2: BAHASA ==========
  {
    id: "bahasa",
    nama: "🌏 Belajar Bahasa",
    warna: "blue",
    subKategori: [
      {
        id: "inggris",
        nama: "Bahasa Inggris",
        tools: [
          { id: "grammar", nama: "Grammar", warna: "blue", fitur: [] },
          { id: "listening", nama: "Listening", warna: "indigo", fitur: [] },
        ],
      },
      {
        id: "mandarin",
        nama: "Bahasa Mandarin",
        tools: [{ id: "hsk_1", nama: "HSK 1", warna: "blue", fitur: [] }],
      },
    ],
  },

  // ========== KATEGORI 3: AGAMA ==========
  {
    id: "agama",
    nama: "📖 Belajar Agama",
    warna: "green",
    subKategori: [
      // ========== SUB-KATEGORI: FIQIH (AL UMM) ==========
      {
        id: "fiqih",
        nama: "Fiqih Syafii",
        tools: [
          {
            id: "bab_1_thaharah",
            nama: "Bab I: Thaharah",
            warna: "green",
            fitur: [
              {
                id: "air_najis",
                nama: "Air & Najis",
                gdriveUrl: "",
                catatan:
                  "📌 Air yang Suci & Menyucikan\n" +
                  "• Air mutlak (hujan, sungai, sumur, laut) suci dan menyucikan.\n" +
                  "• Air 2 qullah (5 geriba) tidak jadi najis kecuali berubah warna, bau, atau rasa.\n" +
                  "• Air < 2 qullah jadi najis jika terkena najis meskipun tidak berubah.\n\n" +
                  "📌 Najis\n" +
                  "• Bangkai, darah, daging babi, khamer, air kencing, tinja.\n" +
                  "• Bangkai ikan & belalang tidak najis.\n" +
                  "• Kulit bangkai jadi suci jika disamak.\n\n" +
                  "📌 Sumber: Al Umm (Imam Syafi'i), Bab Thaharah.",
              },
              {
                id: "wudhu",
                nama: "Wudhu",
                gdriveUrl: "",
                catatan:
                  "📌 Fardhu Wudhu (QS. Al-Maa'idah: 6)\n" +
                  "1. Niat\n" +
                  "2. Membasuh wajah\n" +
                  "3. Membasuh kedua tangan sampai siku\n" +
                  "4. Mengusap kepala\n" +
                  "5. Membasuh kedua kaki sampai mata kaki\n" +
                  "6. Tertib (berurutan)\n\n" +
                  "📌 Sunnah Wudhu\n" +
                  "• Membaca basmalah\n" +
                  "• Membasuh kedua tangan 3x sebelum wudhu\n" +
                  "• Berkumur 3x\n" +
                  "• Istinsyaq (hirup air ke hidung) 3x\n" +
                  "• Mengusap seluruh kepala\n" +
                  "• Mengusap kedua telinga\n" +
                  "• Membasuh 3x setiap anggota\n\n" +
                  "📌 Sumber: Al Umm, Bab Wudhu.",
              },
              {
                id: "mandi_wajib",
                nama: "Mandi Wajib",
                gdriveUrl: "",
                catatan:
                  "📌 Hal yang Mewajibkan Mandi\n" +
                  "1. Junub (persetubuhan meskipun tidak keluar mani, atau keluar mani)\n" +
                  "2. Selesai haidh\n" +
                  "3. Selesai nifas\n\n" +
                  "📌 Fardhu Mandi\n" +
                  "1. Niat\n" +
                  "2. Membasuh seluruh tubuh dengan air\n" +
                  "3. Menghilangkan najis jika ada\n\n" +
                  "📌 Sunnah Mandi\n" +
                  "• Wudhu sebelum mandi\n" +
                  "• Mengguyur kepala 3x\n" +
                  "• Menyela rambut\n" +
                  "• Mendahulukan kanan\n\n" +
                  "📌 Sumber: Al Umm, Bab Mandi.",
              },
              {
                id: "tayammum",
                nama: "Tayammum",
                gdriveUrl: "",
                catatan:
                  "📌 Kapan Boleh Tayammum\n" +
                  "1. Tidak ada air\n" +
                  "2. Sakit (khawatir air membahayakan)\n" +
                  "3. Perjalanan (musafir)\n\n" +
                  "📌 Cara Tayammum\n" +
                  "1. Niat\n" +
                  "2. Menepuk debu/tanah suci dengan kedua tangan\n" +
                  "3. Mengusap wajah\n" +
                  "4. Mengusap kedua tangan sampai siku\n" +
                  "5. Tertib\n\n" +
                  "📌 Catatan\n" +
                  "• Debu harus suci dan berupa debu (bukan batu, kapur, dll).\n" +
                  "• Tayammum berlaku untuk satu shalat fardhu.\n" +
                  "• Jika menemukan air, wajib berwudhu.\n\n" +
                  "📌 Sumber: Al Umm, Bab Tayammum.",
              },
            ],
          },
          {
            id: "bab_2_shalat",
            nama: "Bab II: Shalat",
            warna: "green",
            fitur: [
              {
                id: "syarat_rukun",
                nama: "Syarat & Rukun",
                gdriveUrl: "",
                catatan:
                  "📌 Syarat Shalat\n" +
                  "1. Suci dari hadats dan najis\n" +
                  "2. Menutup aurat\n" +
                  "3. Menghadap kiblat\n" +
                  "4. Masuk waktu shalat\n" +
                  "5. Mengetahui fardhu dan sunnah\n\n" +
                  "📌 Rukun Shalat (13)\n" +
                  "1. Niat\n" +
                  "2. Takbiratul ihram\n" +
                  "3. Berdiri (bagi yang mampu)\n" +
                  "4. Membaca Al-Fatihah\n" +
                  "5. Ruku\n" +
                  "6. I'tidal\n" +
                  "7. Sujud 2x\n" +
                  "8. Duduk antara 2 sujud\n" +
                  "9. Duduk tasyahud akhir\n" +
                  "10. Membaca tasyahud\n" +
                  "11. Membaca shalawat\n" +
                  "12. Salam\n" +
                  "13. Tertib\n\n" +
                  "📌 Sumber: Madzhab Syafii (umum).",
              },
              {
                id: "shalat_wajib",
                nama: "Shalat Wajib",
                gdriveUrl: "",
                catatan:
                  "📌 Shalat Wajib 5 Waktu\n" +
                  "1. Subuh: 2 rakaat\n" +
                  "2. Zhuhur: 4 rakaat\n" +
                  "3. Ashar: 4 rakaat\n" +
                  "4. Maghrib: 3 rakaat\n" +
                  "5. Isya: 4 rakaat\n\n" +
                  "📌 Qashar\n" +
                  "• Musafir boleh qashar (meringkas) shalat 4 rakaat jadi 2 rakaat.\n" +
                  "• Syarat: perjalanan minimal 2 marhalah (~80 km), bukan maksiat.\n\n" +
                  "📌 Jamak\n" +
                  "• Boleh jamak (menggabung) Zhuhur-Ashar, Maghrib-Isya.\n" +
                  "• Jamak taqdim (di waktu pertama) atau ta'khir (di waktu kedua).\n\n" +
                  "📌 Sumber: Al Umm, Bab Shalat.",
              },
              {
                id: "shalat_sunnah",
                nama: "Shalat Sunnah",
                gdriveUrl: "",
                catatan:
                  "📌 Shalat Sunnah Rawatib\n" +
                  "• 2 rakaat sebelum Subuh\n" +
                  "• 4 rakaat sebelum Zhuhur, 2 rakaat sesudah\n" +
                  "• 2 rakaat sesudah Maghrib\n" +
                  "• 2 rakaat sesudah Isya\n\n" +
                  "📌 Shalat Sunnah Lain\n" +
                  "• Tahajud (malam)\n" +
                  "• Witir (penutup malam)\n" +
                  "• Dhuha\n" +
                  "• Tarawih (Ramadhan)\n\n" +
                  "📌 Catatan\n" +
                  "• Boleh dikerjakan sambil duduk.\n" +
                  "• Boleh di kendaraan (untuk sunnah).\n\n" +
                  "📌 Sumber: Al Umm, Bab Shalat Sunnah.",
              },
              {
                id: "sujud_sahwi",
                nama: "Sujud Sahwi",
                gdriveUrl: "",
                catatan:
                  "📌 Sujud Sahwi\n" +
                  "• Sujud 2x sebelum salam (atau sesudah salam) karena lupa.\n\n" +
                  "📌 Penyebab\n" +
                  "1. Meninggalkan sunnah ab'adh (tasyahud awal, qunut, dll)\n" +
                  "2. Ragu jumlah rakaat\n" +
                  "3. Kelebihan/kekurangan rakaat\n\n" +
                  "📌 Cara\n" +
                  "• Takbir, sujud 2x, duduk, salam.\n" +
                  "• Atau sujud setelah salam.\n\n" +
                  "📌 Sumber: Madzhab Syafii (umum).",
              },
            ],
          },
          {
            id: "bab_3_zakat",
            nama: "Bab III: Zakat",
            warna: "green",
            fitur: [
              {
                id: "zakat_harta",
                nama: "Zakat Harta",
                gdriveUrl: "",
                catatan:
                  "📌 Zakat Emas & Perak\n" +
                  "• Emas: nishab 20 dinar (~85 gram), zakat 2.5%\n" +
                  "• Perak: nishab 200 dirham (~595 gram), zakat 2.5%\n\n" +
                  "📌 Zakat Hewan Ternak\n" +
                  "• Unta: nishab 5 ekor\n" +
                  "• Sapi: nishab 30 ekor\n" +
                  "• Kambing: nishab 40 ekor\n\n" +
                  "📌 Zakat Tanaman\n" +
                  "• Kurma, anggur, gandum, syair, jagung\n" +
                  "• Nishab 5 wasaq (~653 kg), zakat 10% (air hujan) atau 5% (irigasi)\n\n" +
                  "📌 Rikaz (Harta Karun)\n" +
                  "• Zakat 20%\n\n" +
                  "📌 Sumber: Al Umm, Bab Zakat.",
              },
              {
                id: "zakat_fitrah",
                nama: "Zakat Fitrah",
                gdriveUrl: "",
                catatan:
                  "📌 Zakat Fitrah\n" +
                  "• Wajib bagi setiap muslim yang mampu.\n" +
                  "• Besar: 1 sha' (~2.5 kg) makanan pokok.\n" +
                  "• Waktu: sebelum shalat Idul Fitri.\n" +
                  "• Untuk: fakir, miskin, amil, muallaf, dll.\n\n" +
                  "📌 Sumber: Madzhab Syafii (umum).",
              },
            ],
          },
          {
            id: "bab_4_puasa",
            nama: "Bab IV: Puasa",
            warna: "green",
            fitur: [
              {
                id: "puasa_ramadhan",
                nama: "Puasa Ramadhan",
                gdriveUrl: "",
                catatan:
                  "📌 Puasa Ramadhan\n" +
                  "• Wajib bagi setiap muslim yang baligh, berakal, mampu.\n" +
                  "• Yang boleh tidak puasa: sakit, musafir, haidh, nifas, hamil, menyusui, tua.\n" +
                  "• Qadha: wajib ganti di hari lain (kecuali tua & sakit permanen, bayar fidyah).\n\n" +
                  "📌 Yang Membatalkan\n" +
                  "• Makan, minum, muntah sengaja, jima', keluar mani sengaja, haidh/nifas.\n\n" +
                  "📌 Sumber: Madzhab Syafii (umum).",
              },
              {
                id: "puasa_sunnah",
                nama: "Puasa Sunnah",
                gdriveUrl: "",
                catatan:
                  "📌 Puasa Sunnah\n" +
                  "• Senin & Kamis\n" +
                  "• Ayyamul Bidh (13, 14, 15 Hijriyah)\n" +
                  "• Arafah (9 Dzulhijjah)\n" +
                  "• Asyura (10 Muharram)\n" +
                  "• 6 hari Syawal\n" +
                  "• Sya'ban\n\n" +
                  "📌 Sumber: Madzhab Syafii (umum).",
              },
            ],
          },
          {
            id: "bab_5_haji",
            nama: "Bab V: Haji",
            warna: "green",
            fitur: [
              {
                id: "haji_wajib",
                nama: "Haji Wajib",
                gdriveUrl: "",
                catatan:
                  "📌 Haji Wajib\n" +
                  "• Wajib bagi muslim yang mampu (sabil = bekal + kendaraan).\n" +
                  "• Sekali seumur hidup.\n\n" +
                  "📌 Rukun Haji\n" +
                  "1. Ihram\n" +
                  "2. Wukuf di Arafah\n" +
                  "3. Thawaf ifadhah\n" +
                  "4. Sai\n" +
                  "5. Tahallul\n" +
                  "6. Tertib\n\n" +
                  "📌 Wajib Haji\n" +
                  "• Ihram dari miqat\n" +
                  "• Mabit di Muzdalifah & Mina\n" +
                  "• Melempar jumrah\n" +
                  "• Menjauhi larangan ihram\n\n" +
                  "📌 Sumber: Al Umm, Bab Haji.",
              },
              {
                id: "umrah",
                nama: "Umrah",
                gdriveUrl: "",
                catatan:
                  "📌 Umrah\n" +
                  "• Rukun: Ihram, thawaf, sai, tahallul, tertib.\n" +
                  "• Wajib: sekali seumur hidup (menurut sebagian ulama).\n" +
                  "• Boleh kapan saja (kecuali waktu makruh).\n\n" +
                  "📌 Sumber: Madzhab Syafii (umum).",
              },
            ],
          },
          {
            id: "bab_6_nikah",
            nama: "Bab VI: Nikah",
            warna: "green",
            fitur: [
              {
                id: "rukun_nikah",
                nama: "Rukun Nikah",
                gdriveUrl: "",
                catatan:
                  "📌 Rukun Nikah\n" +
                  "1. Calon suami\n" +
                  "2. Calon istri\n" +
                  "3. Wali\n" +
                  "4. Dua saksi\n" +
                  "5. Ijab & kabul\n\n" +
                  "📌 Syarat\n" +
                  "• Muslim, bukan mahram, tidak dalam ihram, tidak dipaksa.\n" +
                  "• Mahar wajib, boleh disebutkan atau tidak.\n" +
                  "• Wanita janda harus ridha, perawan cukup diam.\n\n" +
                  "📌 Sumber: Al Umm, Bab Nikah.",
              },
              {
                id: "talak",
                nama: "Talak",
                gdriveUrl: "",
                catatan:
                  "📌 Talak\n" +
                  "• Talak 1 & 2: boleh rujuk sebelum iddah habis.\n" +
                  "• Talak 3: tidak boleh rujuk sampai mantan istri menikah dengan orang lain.\n" +
                  "• Iddah: 3 quru' (suci), atau 3 bulan (menopause), atau melahirkan (hamil).\n\n" +
                  "📌 Sumber: Al Umm, Bab Talak.",
              },
            ],
          },
          {
            id: "bab_7_jual_beli",
            nama: "Bab VII: Jual Beli",
            warna: "green",
            fitur: [
              {
                id: "rukun_jual_beli",
                nama: "Rukun Jual Beli",
                gdriveUrl: "",
                catatan:
                  "📌 Rukun Jual Beli\n" +
                  "1. Penjual & pembeli\n" +
                  "2. Barang & harga\n" +
                  "3. Ijab & kabul\n\n" +
                  "📌 Khiyar\n" +
                  "• Khiyar majelis: boleh batal selama belum berpisah.\n" +
                  "• Khiyar syarat: boleh batal dalam waktu tertentu.\n" +
                  "• Khiyar aib: boleh batal jika ada cacat.\n\n" +
                  "📌 Larangan\n" +
                  "• Jual beli gharar (tidak jelas).\n" +
                  "• Jual beli barang haram.\n" +
                  "• Jual beli dengan riba.\n\n" +
                  "📌 Sumber: Al Umm, Bab Jual Beli.",
              },
              {
                id: "riba",
                nama: "Riba",
                gdriveUrl: "",
                catatan:
                  "📌 Riba\n" +
                  "• Riba fadhl: tukar barang sejenis dengan takaran berbeda (emas dengan emas, dll).\n" +
                  "• Riba nasi'ah: tukar barang dengan tempo (ada penambahan).\n\n" +
                  "📌 Barang Ribawi\n" +
                  "• Emas, perak, gandum, syair, kurma, garam.\n" +
                  "• Harus sama jenis, sama takaran, tunai.\n\n" +
                  "📌 Sumber: Al Umm, Bab Riba.",
              },
            ],
          },
          {
            id: "bab_8_haidh",
            nama: "Bab VIII: Haidh & Istihadhah",
            warna: "green",
            fitur: [
              {
                id: "haidh",
                nama: "Haidh",
                gdriveUrl: "",
                catatan:
                  "📌 Haidh\n" +
                  "• Darah yang keluar dari rahim perempuan sehat.\n" +
                  "• Waktu: minimal 1 hari 1 malam, maksimal 15 hari.\n" +
                  "• Siklus: minimal 15 hari suci antara dua haidh.\n\n" +
                  "📌 Hukum\n" +
                  "• Haram shalat, puasa, thawaf, jima', menyentuh mushaf.\n" +
                  "• Wajib qadha puasa, tidak qadha shalat.\n" +
                  "• Suami haram menjauhi istri (jima' di vagina).\n" +
                  "• Boleh bercumbu selain vagina.\n\n" +
                  "📌 Sumber: Al Umm, Bab Haidh.",
              },
              {
                id: "istihadhah",
                nama: "Istihadhah",
                gdriveUrl: "",
                catatan:
                  "📌 Istihadhah\n" +
                  "• Darah penyakit yang keluar terus-menerus.\n" +
                  "• Bukan haidh, bukan nifas.\n\n" +
                  "📌 Hukum\n" +
                  "• Tetap shalat, puasa, boleh digauli suami.\n" +
                  "• Wajib wudhu setiap kali shalat fardhu.\n" +
                  "• Wajib mandi sekali setelah haidh berhenti.\n" +
                  "• Jika darah terpisah (kuat/lemah), bedakan haidh & istihadhah.\n\n" +
                  "📌 Sumber: Al Umm, Bab Istihadhah.",
              },
            ],
          },
        ],
      },
      // ========== SUB-KATEGORI: TAUHID (OPSI C) ==========
      {
        id: "tauhid",
        nama: "Tauhid",
        tools: [
          {
            id: "bab_1_pendahuluan",
            nama: "Bab I: Pendahuluan",
            warna: "green",
            fitur: [
              { id: "marifat_taklid", nama: "Ma'rifat & Taklid", gdriveUrl: "", catatan: "" },
              { id: "hukum_akal", nama: "Hukum Akal", gdriveUrl: "", catatan: "" },
            ],
          },
          {
            id: "bab_2_uluhiyyah",
            nama: "Bab II: Tauhid Uluhiyyah",
            warna: "green",
            fitur: [
              { id: "sifat_wajib_allah", nama: "20 Sifat Wajib Allah", gdriveUrl: "", catatan: "" },
              { id: "sifat_mustahil_allah", nama: "20 Sifat Mustahil Allah", gdriveUrl: "", catatan: "" },
              { id: "sifat_jaiz_allah", nama: "1 Sifat Jaiz Allah", gdriveUrl: "", catatan: "" },
            ],
          },
          {
            id: "bab_3_nabawiyyah",
            nama: "Bab III: Tauhid Nabawiyyah",
            warna: "green",
            fitur: [
              { id: "sifat_wajib_rasul", nama: "Sifat Wajib Rasul", gdriveUrl: "", catatan: "" },
              { id: "sifat_mustahil_rasul", nama: "Sifat Mustahil Rasul", gdriveUrl: "", catatan: "" },
              { id: "sifat_jaiz_rasul", nama: "Sifat Jaiz Rasul", gdriveUrl: "", catatan: "" },
            ],
          },
          {
            id: "bab_4_samiyyah",
            nama: "Bab IV: Tauhid Sam'iyyah",
            warna: "green",
            fitur: [
              { id: "qodho_qodar", nama: "Qodho & Qodar", gdriveUrl: "", catatan: "" },
              { id: "melihat_allah", nama: "Melihat Allah", gdriveUrl: "", catatan: "" },
              { id: "mengutus_rasul", nama: "Mengutus Para Rasul", gdriveUrl: "", catatan: "" },
              { id: "masa_cemerlang", nama: "Masa-Masa Cemerlang", gdriveUrl: "", catatan: "" },
              { id: "silsilah_nabi", nama: "Silsilah Nabi", gdriveUrl: "", catatan: "" },
              { id: "haudh_syafaat_dosa", nama: "Haudh, Syafa'at & Dosa", gdriveUrl: "", catatan: "" },
            ],
          },
        ],
      },
    ],
  },
];

// ========== TARGET HARIAN DEFAULT ==========
export const DEFAULT_TARGET_HARIAN = {
  design: { target: 1, satuan: "materi" },
  bahasa: { target: 1, satuan: "materi" },
  agama: { target: 1, satuan: "bab" },
};

// ========== HELPER: GENERATE ID ==========
export function generateId(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

// ========== HELPER: FORMAT TANGGAL ==========
export function formatTanggal(dateStr, opsi = "panjang") {
  const d = new Date(dateStr);
  if (opsi === "pendek") {
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  }
  return d.toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

// ========== HELPER: CARI ITEM BERDASARKAN PATH ==========
export function findItem(kategori, path) {
  if (!path || path.length === 0) return null;
  let current = kategori;
  let parent = null;
  let parentArray = null;
  for (let i = 0; i < path.length; i++) {
    const id = path[i];
    if (i === 0) {
      const found = current.find((k) => k.id === id);
      if (!found) return null;
      parent = current; parentArray = current; current = found;
    } else if (i === 1) {
      const found = current.subKategori?.find((s) => s.id === id);
      if (!found) return null;
      parent = current; parentArray = current.subKategori; current = found;
    } else if (i === 2) {
      const found = current.tools?.find((t) => t.id === id);
      if (!found) return null;
      parent = current; parentArray = current.tools; current = found;
    } else if (i === 3) {
      const found = current.fitur?.find((f) => f.id === id);
      if (!found) return null;
      parent = current; parentArray = current.fitur; current = found;
    } else if (i === 4) {
      const found = current.parts?.find((p) => p.id === id);
      if (!found) return null;
      parent = current; parentArray = current.parts; current = found;
    }
  }
  return { item: current, parent, parentArray, level: path.length };
}

// ========== HELPER: UPDATE ITEM ==========
export function updateItem(kategori, path, updatedFields) {
  const result = findItem(kategori, path);
  if (!result) return kategori;
  const newKategori = JSON.parse(JSON.stringify(kategori));
  const newResult = findItem(newKategori, path);
  if (!newResult) return kategori;
  const { parentArray: newParentArray, item: newItem } = newResult;
  const index = newParentArray.findIndex((i) => i.id === newItem.id);
  if (index !== -1) {
    newParentArray[index] = { ...newParentArray[index], ...updatedFields };
  }
  return newKategori;
}

// ========== HELPER: TAMBAH ITEM ==========
export function addItem(kategori, path, newItem) {
  const newKategori = JSON.parse(JSON.stringify(kategori));
  const result = findItem(newKategori, path);
  if (!result) return kategori;
  const { item, level } = result;
  if (level === 1) { if (!item.subKategori) item.subKategori = []; item.subKategori.push(newItem); }
  else if (level === 2) { if (!item.tools) item.tools = []; item.tools.push(newItem); }
  else if (level === 3) { if (!item.fitur) item.fitur = []; item.fitur.push(newItem); }
  else if (level === 4) { if (!item.parts) item.parts = []; item.parts.push(newItem); }
  return newKategori;
}

// ========== HELPER: HAPUS ITEM ==========
export function deleteItem(kategori, path) {
  const newKategori = JSON.parse(JSON.stringify(kategori));
  const result = findItem(newKategori, path);
  if (!result) return kategori;
  const { item, parentArray } = result;
  if (path.length === 1) return parentArray.filter((i) => i.id !== item.id);
  const rebuildResult = findItem(newKategori, path.slice(0, -1));
  if (!rebuildResult) return kategori;
  const { item: parentItem } = rebuildResult;
  const lastId = path[path.length - 1];
  if (parentItem.subKategori) parentItem.subKategori = parentItem.subKategori.filter((s) => s.id !== lastId);
  if (parentItem.tools) parentItem.tools = parentItem.tools.filter((t) => t.id !== lastId);
  if (parentItem.fitur) parentItem.fitur = parentItem.fitur.filter((f) => f.id !== lastId);
  if (parentItem.parts) parentItem.parts = parentItem.parts.filter((p) => p.id !== lastId);
  return newKategori;
}

// ========== HELPER: MINGGU INI ==========
export function getMingguIni() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const senin = new Date(now.setDate(diff));
  return senin.toISOString().split("T")[0];
}

// ========== HELPER: FORMAT MINGGU ==========
export function formatMinggu(tanggal) {
  const d = new Date(tanggal);
  return `Minggu ${d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}`;
}

// ========== HELPER: KARYA MINGGUAN ==========
export function kategoriPunyaKaryaMingguan(kategoriId) {
  return kategoriId === "design";
}

// ========== HELPER: KATEGORI ID DARI PATH ==========
export function getKategoriIdFromPath(path) {
  if (!path || path.length === 0) return null;
  return path[0];
}

// ========== HELPER: LABEL KATEGORI ==========
export function getLabelKategoriById(kategoriList, kategoriId) {
  return kategoriList.find((k) => k.id === kategoriId)?.nama || kategoriId;
}

// ========== HELPER: DEFAULT TARGET ==========
export function getDefaultTargetByKategori(kategoriId) {
  return DEFAULT_TARGET_HARIAN[kategoriId] || { target: 1, satuan: "materi" };
}

// ========== HELPER: DEFAULT WARNA KATEGORI ==========
export function getDefaultWarnaByKategori(kategoriId) {
  return DEFAULT_WARNA_KATEGORI[kategoriId] || "gray";
}

// ========== HELPER: GET WARNA TOOL DARI PATH ==========
export function getWarnaToolByPath(kategoriData, path) {
  if (!path || path.length === 0) return "gray";
  const result = findItem(kategoriData, path);
  if (!result?.item) return getDefaultWarnaByKategori(path[0]);
  if (result.item.warna) return result.item.warna;
  if (path.length >= 3) {
    const toolResult = findItem(kategoriData, path.slice(0, 3));
    if (toolResult?.item?.warna) return toolResult.item.warna;
  }
  return getDefaultWarnaByKategori(path[0]);
}

// ========== HELPER: GET WARNA STYLE ==========
export function getWarnaStyle(warnaId) {
  return WARNA_OPTIONS.find((w) => w.id === warnaId) || WARNA_OPTIONS[9];
}

// ========== HELPER: INIT LOG HARIAN ==========
export function initLogHarian() {
  return {};
}

// ========== HELPER: GET LOG BY KATEGORI & TANGGAL ==========
export function getLogByKategoriTanggal(logHarian, kategoriId, tanggal) {
  if (!logHarian || !logHarian[tanggal]) return [];
  return (logHarian[tanggal] || []).filter((log) => log.kategoriId === kategoriId);
}

// ========== HELPER: HITUNG PROGRESS BELAJAR ==========
export function hitungProgressBelajar(kategoriData, logHarian, kategoriId) {
  let totalItem = 0;
  const kategori = kategoriData.find((k) => k.id === kategoriId);
  if (!kategori) return { totalItem: 0, itemSelesai: 0, persen: 0 };
  const kumpulinLeaf = (items) => {
    items.forEach((item) => {
      if (item.subKategori) kumpulinLeaf(item.subKategori);
      else if (item.tools) kumpulinLeaf(item.tools);
      else if (item.fitur && item.fitur.length > 0) kumpulinLeaf(item.fitur);
      else if (item.parts) kumpulinLeaf(item.parts);
      else totalItem++;
    });
  };
  kumpulinLeaf(kategori.subKategori || []);
  const semuaLog = Object.values(logHarian || {}).flat();
  const logKategori = semuaLog.filter((log) => log.kategoriId === kategoriId);
  const itemUnik = new Set();
  logKategori.forEach((log) => {
    if (log.catatan || log.gdriveUrl) {
      itemUnik.add(`${log.subKategoriId}_${log.toolId}_${log.fiturId}_${log.partId || ""}`);
    }
  });
  const itemSelesai = itemUnik.size;
  const persen = totalItem > 0 ? Math.min(100, Math.round((itemSelesai / totalItem) * 100)) : 0;
  return { totalItem, itemSelesai, persen };
}

// ========== HELPER: SYNC LOG → MATERI (OPSI C) ==========
export function syncLogToMateri(kategoriData, log) {
  const path = [log.kategoriId, log.subKategoriId, log.toolId];
  if (log.fiturId) path.push(log.fiturId);
  if (log.partId) path.push(log.partId);
  const newKategori = JSON.parse(JSON.stringify(kategoriData));
  const result = findItem(newKategori, path);
  if (!result?.item) return kategoriData;
  const target = result.item;
  const existingCatatan = target.catatan || "";
  const existingGdrive = target.gdriveUrl || "";
  const separator = existingCatatan ? "\n\n---\n\n" : "";
  const newCatatan = existingCatatan + separator + `📅 ${log.tanggal || ""}\n${log.catatan || ""}`;
  target.catatan = newCatatan.trim();
  if (log.gdriveUrl) {
    target.gdriveUrl = existingGdrive ? `${existingGdrive}\n${log.gdriveUrl}` : log.gdriveUrl;
  }
  return newKategori;
}

// ========== HELPER: SYNC MATERI → LOG (OPSI C) ==========
export function syncMateriToLog(kategoriData, logHarian, path, catatan, gdriveUrl, tanggal) {
  if (!catatan.trim() && !gdriveUrl.trim()) return { kategori: kategoriData, logHarian };
  const newKategori = updateItem(kategoriData, path, { catatan, gdriveUrl });
  const newLogHarian = JSON.parse(JSON.stringify(logHarian || {}));
  if (!newLogHarian[tanggal]) newLogHarian[tanggal] = [];
  const logEntry = {
    id: `log_${Date.now()}`,
    kategoriId: path[0],
    subKategoriId: path[1] || "",
    toolId: path[2] || "",
    fiturId: path[3] || "",
    partId: path[4] || "",
    catatan, gdriveUrl,
    telegramMessageId: "",
    sumber: "materi",
    updatedAt: new Date().toISOString(),
  };
  newLogHarian[tanggal].push(logEntry);
  return { kategori: newKategori, logHarian: newLogHarian };
}

// ========== HELPER: HAPUS LOG + MATERI (OPSI C) ==========
export function hapusLogSync(kategoriData, logHarian, log, tanggal) {
  const newLogHarian = JSON.parse(JSON.stringify(logHarian || {}));
  if (newLogHarian[tanggal]) {
    newLogHarian[tanggal] = newLogHarian[tanggal].filter((l) => l.id !== log.id);
    if (newLogHarian[tanggal].length === 0) delete newLogHarian[tanggal];
  }
  let newKategori = kategoriData;
  if (log.sumber === "materi") {
    const path = [log.kategoriId, log.subKategoriId, log.toolId];
    if (log.fiturId) path.push(log.fiturId);
    if (log.partId) path.push(log.partId);
    newKategori = updateItem(kategoriData, path, { catatan: "", gdriveUrl: "" });
  }
  return { kategori: newKategori, logHarian: newLogHarian };
}

// ========== HELPER: UPDATE LOG + MATERI (OPSI C) ==========
export function updateLogSync(kategoriData, logHarian, oldLog, newLog, tanggal) {
  const newLogHarian = JSON.parse(JSON.stringify(logHarian || {}));
  if (newLogHarian[tanggal]) {
    newLogHarian[tanggal] = newLogHarian[tanggal].map((l) =>
      l.id === oldLog.id ? { ...newLog, id: oldLog.id, sumber: oldLog.sumber } : l
    );
  }
  let newKategori = kategoriData;
  if (oldLog.sumber === "materi") {
    const path = [newLog.kategoriId, newLog.subKategoriId, newLog.toolId];
    if (newLog.fiturId) path.push(newLog.fiturId);
    if (newLog.partId) path.push(newLog.partId);
    newKategori = updateItem(kategoriData, path, {
      catatan: newLog.catatan,
      gdriveUrl: newLog.gdriveUrl,
    });
  }
  return { kategori: newKategori, logHarian: newLogHarian };
}

// ========== HELPER: GET SUB-KATEGORI SIBLINGS (BUAT TOMBOL NAVIGASI) ==========
export function getSubKategoriSiblings(kategoriData, kategoriId, currentSubKategoriId) {
  const kategori = kategoriData.find((k) => k.id === kategoriId);
  if (!kategori || !kategori.subKategori) return [];
  return kategori.subKategori
    .filter((s) => s.id !== currentSubKategoriId)
    .map((s) => ({ id: s.id, nama: s.nama }));
}