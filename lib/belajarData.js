// lib/belajarData.js

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

export const DEFAULT_WARNA_KATEGORI = {
  design: "purple",
  bahasa: "blue",
  agama: "green",
};

export const DEFAULT_KATEGORI = [
  {
    id: "design", nama: "🎨 Belajar Design", warna: "purple",
    subKategori: [
      {
        id: "2d", nama: "🖌️ 2D Design",
        tools: [
          { id: "illustrator", nama: "Illustrator", warna: "purple",
            fitur: [{ id: "adobe_illustrator_beginners", nama: "Adobe Illustrator Tutorial for Beginners", materi: "📌 Adobe Illustrator Tutorial for Beginners\n• Channel: Bring Your Own Laptop\n• URL: https://youtu.be/r9gaPGQ1EG0\n\n📌 29 Part.", parts: [
              { id: "part_1", nama: "Part 1: Introduction", materi: "📌 Timestamp: 0:00", gdriveUrl: "", catatan: "" },
              { id: "part_2", nama: "Part 2: Getting Started", materi: "📌 Timestamp: 1:11", gdriveUrl: "", catatan: "" },
              { id: "part_3", nama: "Part 3: What is Illustrator Used For?", materi: "📌 Timestamp: 2:58", gdriveUrl: "", catatan: "" },
              { id: "part_4", nama: "Part 4: Quick Tour", materi: "📌 Timestamp: 6:38", gdriveUrl: "", catatan: "" },
              { id: "part_5", nama: "Part 5: Draw Rounded Rectangles", materi: "📌 Timestamp: 17:34", gdriveUrl: "", catatan: "" },
              { id: "part_6", nama: "Part 6: How to Draw Lines", materi: "📌 Timestamp: 32:20", gdriveUrl: "", catatan: "" },
              { id: "part_7", nama: "Part 7: Scaling Stroke Effects", materi: "📌 Timestamp: 49:10", gdriveUrl: "", catatan: "" },
              { id: "part_8", nama: "Part 8: Saving to Creative Cloud", materi: "📌 Timestamp: 55:48", gdriveUrl: "", catatan: "" },
              { id: "part_9", nama: "Part 9: Exporting Images", materi: "📌 Timestamp: 1:09:39", gdriveUrl: "", catatan: "" },
              { id: "part_10", nama: "Part 10: Shape Builder Tool", materi: "📌 Timestamp: 1:14:34", gdriveUrl: "", catatan: "" },
              { id: "part_11", nama: "Part 11: Class Project 2", materi: "📌 Timestamp: 1:25:09", gdriveUrl: "", catatan: "" },
              { id: "part_12", nama: "Part 12: Layer", materi: "📌 Timestamp: 1:46:17", gdriveUrl: "", catatan: "" },
              { id: "part_13", nama: "Part 13: Math in Fields", materi: "📌 Timestamp: 1:57:24", gdriveUrl: "", catatan: "" },
              { id: "part_14", nama: "Part 14: Class Project 3", materi: "📌 Timestamp: 2:10:09", gdriveUrl: "", catatan: "" },
              { id: "part_15", nama: "Part 15: Curvature Tool", materi: "📌 Timestamp: 2:11:16", gdriveUrl: "", catatan: "" },
              { id: "part_16", nama: "Part 16: Curves & Straight Lines", materi: "📌 Timestamp: 2:25:12", gdriveUrl: "", catatan: "" },
              { id: "part_17", nama: "Part 17: Class Project 4", materi: "📌 Timestamp: 2:32:53", gdriveUrl: "", catatan: "" },
              { id: "part_18", nama: "Part 18: Combining Shapes", materi: "📌 Timestamp: 2:36:14", gdriveUrl: "", catatan: "" },
              { id: "part_19", nama: "Part 19: Pen Tool", materi: "📌 Timestamp: 2:48:18", gdriveUrl: "", catatan: "" },
              { id: "part_20", nama: "Part 20: Class Project 5", materi: "📌 Timestamp: 3:02:14", gdriveUrl: "", catatan: "" },
              { id: "part_21", nama: "Part 21: Panel Tidying Up", materi: "📌 Timestamp: 3:23:39", gdriveUrl: "", catatan: "" },
              { id: "part_22", nama: "Part 22: Class Project 6", materi: "📌 Timestamp: ~3:26:20", gdriveUrl: "", catatan: "" },
              { id: "part_23", nama: "Part 23: Combining Tools", materi: "📌 Timestamp: ~3:38:10", gdriveUrl: "", catatan: "" },
              { id: "part_24", nama: "Part 24: Class Project 7", materi: "📌 Timestamp: 2:36:53", gdriveUrl: "", catatan: "" },
              { id: "part_25", nama: "Part 25: AI Generative Recoloring", materi: "📌 Timestamp: 2:42:56", gdriveUrl: "", catatan: "" },
              { id: "part_26", nama: "Part 26: Mood Boards", materi: "📌 Timestamp: 2:47:41", gdriveUrl: "", catatan: "" },
              { id: "part_27", nama: "Part 27: Class Project 8", materi: "📌 Timestamp: 3:32:31", gdriveUrl: "", catatan: "" },
              { id: "part_28", nama: "Part 28: Class Project 9", materi: "📌 Timestamp: 3:52:30", gdriveUrl: "", catatan: "" },
              { id: "part_29", nama: "Part 29: Printing T-Shirt", materi: "📌 Timestamp: 3:57:40", gdriveUrl: "", catatan: "" },
            ]}], karyaMingguan: [] },
          { id: "photoshop", nama: "Photoshop", warna: "pink",
            fitur: [{ id: "adobe_photoshop_beginners", nama: "Adobe Photoshop for Beginners", materi: "📌 Photoshop for Beginners | FREE COURSE\n• Channel: Envato Tuts+\n• URL: https://www.youtube.com/watch?v=IyR_uYsRdPs\n\n📌 23 Part.", parts: [
              { id: "part_1", nama: "Part 1: Welcome to the Course", materi: "📌 Timestamp: 0:00", gdriveUrl: "", catatan: "" },
              { id: "part_2", nama: "Part 2: Getting Started", materi: "📌 Timestamp: 1:50", gdriveUrl: "", catatan: "" },
              { id: "part_3", nama: "Part 3: How Photoshop Layers Work", materi: "📌 Timestamp: 3:10", gdriveUrl: "", catatan: "" },
              { id: "part_4", nama: "Part 4: Combining Multiple Images", materi: "📌 Timestamp: 12:06", gdriveUrl: "", catatan: "" },
              { id: "part_5", nama: "Part 5: Tone Adjustment With Levels", materi: "📌 Timestamp: 20:40", gdriveUrl: "", catatan: "" },
              { id: "part_6", nama: "Part 6: Color Adjustment", materi: "📌 Timestamp: 25:17", gdriveUrl: "", catatan: "" },
              { id: "part_7", nama: "Part 7: Hue Adjustments", materi: "📌 Timestamp: 29:21", gdriveUrl: "", catatan: "" },
              { id: "part_8", nama: "Part 8: How to Work With Type", materi: "📌 Timestamp: 37:42", gdriveUrl: "", catatan: "" },
              { id: "part_9", nama: "Part 9: Warped Type and Type on a Path", materi: "📌 Timestamp: 49:37", gdriveUrl: "", catatan: "" },
              { id: "part_10", nama: "Part 10: Layer Styles and Effects", materi: "📌 Timestamp: 1:07:17", gdriveUrl: "", catatan: "" },
              { id: "part_11", nama: "Part 11: How to Crop", materi: "📌 Timestamp: 1:24:46", gdriveUrl: "", catatan: "" },
              { id: "part_12", nama: "Part 12: Resizing and Resolution", materi: "📌 Timestamp: 1:32:08", gdriveUrl: "", catatan: "" },
              { id: "part_13", nama: "Part 13: Rectangle and Elliptical Marquee Tool", materi: "📌 Timestamp: 1:41:49", gdriveUrl: "", catatan: "" },
              { id: "part_14", nama: "Part 14: Clipping Masks", materi: "📌 Timestamp: 1:47:58", gdriveUrl: "", catatan: "" },
              { id: "part_15", nama: "Part 15: Quick Selection Tool", materi: "📌 Timestamp: 1:52:27", gdriveUrl: "", catatan: "" },
              { id: "part_16", nama: "Part 16: Layer Masks", materi: "📌 Timestamp: 2:00:18", gdriveUrl: "", catatan: "" },
              { id: "part_17", nama: "Part 17: Select and Mask", materi: "📌 Timestamp: 2:06:25", gdriveUrl: "", catatan: "" },
              { id: "part_18", nama: "Part 18: Understanding Photoshop Smart Objects", materi: "📌 Timestamp: 2:18:38", gdriveUrl: "", catatan: "" },
              { id: "part_19", nama: "Part 19: Transforming and Warping Layers", materi: "📌 Timestamp: 2:30:09", gdriveUrl: "", catatan: "" },
              { id: "part_20", nama: "Part 20: Retouching With Healing Brush", materi: "📌 Timestamp: 2:37:58", gdriveUrl: "", catatan: "" },
              { id: "part_21", nama: "Part 21: Content-Aware Scale", materi: "📌 Timestamp: 2:45:55", gdriveUrl: "", catatan: "" },
              { id: "part_22", nama: "Part 22: Exporting Images", materi: "📌 Timestamp: 2:54:11", gdriveUrl: "", catatan: "" },
              { id: "part_23", nama: "Part 23: What Next?", materi: "📌 Timestamp: 3:04:49", gdriveUrl: "", catatan: "" },
            ]}], karyaMingguan: [] },
        ],
      },
      {
        id: "3d", nama: "🧊 3D Design",
        tools: [
          { id: "blender", nama: "Blender", warna: "orange",
            fitur: [{ id: "blender_guru_donut", nama: "Blender Guru --- Donut", materi: "📌 Beginner Blender Tutorial (2026)\n• Channel: Blender Guru\n• URL: https://www.youtube.com/watch?v=z-Xl9tGqH14\n\n📌 8 Part.", parts: [
              { id: "part_1", nama: "Part 1: The Basics", materi: "📌 Timestamp: 00:00 -- 28:16", gdriveUrl: "", catatan: "" },
              { id: "part_2", nama: "Part 2: Basic Modelling", materi: "📌 Timestamp: 28:16 -- 59:05", gdriveUrl: "", catatan: "" },
              { id: "part_3", nama: "Part 3: Organic Modelling", materi: "📌 Timestamp: 59:05 -- 1:30:13", gdriveUrl: "", catatan: "" },
              { id: "part_4", nama: "Part 4: Materials", materi: "📌 Timestamp: 1:30:13 -- 2:03:46", gdriveUrl: "", catatan: "" },
              { id: "part_5", nama: "Part 5: Texturing", materi: "📌 Timestamp: 2:03:46 -- 2:35:40", gdriveUrl: "", catatan: "" },
              { id: "part_6", nama: "Part 6: UV Unwrapping", materi: "📌 Timestamp: 2:35:40 -- 3:09:26", gdriveUrl: "", catatan: "" },
              { id: "part_7", nama: "Part 7: Scattering", materi: "📌 Timestamp: 3:09:26 -- 3:46:11", gdriveUrl: "", catatan: "" },
              { id: "part_8", nama: "Part 8: Lighting and Rendering", materi: "📌 Timestamp: 3:46:11 -- 4:55:00", gdriveUrl: "", catatan: "" },
            ]}], karyaMingguan: [] },
          { id: "solidworks", nama: "SolidWorks", warna: "teal",
            fitur: [
              { id: "basic_features", nama: "Basic Features", fitur: [
                { id: "sketch", nama: "Sketch", materi: "", gdriveUrl: "", catatan: "" },
                { id: "extrude", nama: "Extrude", materi: "", gdriveUrl: "", catatan: "" },
                { id: "cut_extrude", nama: "Cut Extrude", materi: "", gdriveUrl: "", catatan: "" },
                { id: "revolve", nama: "Revolve", materi: "", gdriveUrl: "", catatan: "" },
                { id: "fillet_chamfer", nama: "Fillet & Chamfer", materi: "", gdriveUrl: "", catatan: "" },
                { id: "rib_draft", nama: "Rib & Draft", materi: "", gdriveUrl: "", catatan: "" },
                { id: "pattern", nama: "Pattern", materi: "", gdriveUrl: "", catatan: "" },
                { id: "swept", nama: "Swept Boss/Base", materi: "", gdriveUrl: "", catatan: "" },
                { id: "lofted", nama: "Lofted Boss/Base", materi: "", gdriveUrl: "", catatan: "" },
                { id: "boundary", nama: "Boundary Boss/Base", materi: "", gdriveUrl: "", catatan: "" },
                { id: "3d_sketch", nama: "3D Sketch", materi: "", gdriveUrl: "", catatan: "" },
              ]},
              { id: "assembly", nama: "Assembly", fitur: [
                { id: "basic_assembly", nama: "Basic Assembly", materi: "", gdriveUrl: "", catatan: "" },
                { id: "advanced_mates", nama: "Advanced Mates", materi: "", gdriveUrl: "", catatan: "" },
                { id: "assembly_new_part", nama: "Assembly New Part", materi: "", gdriveUrl: "", catatan: "" },
                { id: "exploded_view", nama: "Exploded View", materi: "", gdriveUrl: "", catatan: "" },
              ]},
              { id: "drawing", nama: "Drawing", fitur: [
                { id: "drawing_basics", nama: "Drawing Basics", materi: "", gdriveUrl: "", catatan: "" },
                { id: "exploded_drawing", nama: "Exploded Drawing", materi: "", gdriveUrl: "", catatan: "" },
              ]},
              { id: "surface_modeling", nama: "Surface Modeling", fitur: [
                { id: "surface_basics", nama: "Surface Basics", materi: "", gdriveUrl: "", catatan: "" },
              ]},
              { id: "advanced_modeling", nama: "Advanced Modeling", fitur: [
                { id: "advanced_basics", nama: "Advanced Basics", materi: "", gdriveUrl: "", catatan: "" },
              ]},
              { id: "sheet_metal", nama: "Sheet Metal", fitur: [
                { id: "base_flange", nama: "Base Flange", materi: "", gdriveUrl: "", catatan: "" },
                { id: "edge_flange", nama: "Edge Flange", materi: "", gdriveUrl: "", catatan: "" },
              ]},
              { id: "electrical", nama: "Electrical", fitur: [] },
              { id: "mould_design", nama: "Mould Design", fitur: [] },
              { id: "weldments", nama: "Weldments", fitur: [] },
              { id: "routing", nama: "Routing", fitur: [] },
              { id: "simulation", nama: "Simulation", fitur: [] },
              { id: "plastic", nama: "Plastic", fitur: [] },
              { id: "cam", nama: "CAM", fitur: [] },
              { id: "visualize", nama: "Visualize", fitur: [] },
              { id: "pdm", nama: "PDM", fitur: [] },
            ], karyaMingguan: [] },
        ],
      },
    ],
  },

  {
    id: "bahasa", nama: "🌏 Belajar Bahasa", warna: "blue",
    subKategori: [
      {
        id: "inggris", nama: "Bahasa Inggris",
        tools: [
          { id: "grammar", nama: "Grammar", warna: "blue",
            fitur: [{
              id: "toefl_teatu",
              nama: "TOEFL Structure (TEATU with Mr Wira)",
              materi:
                "📌 TOEFL Structure --- TEATU with Mr Wira\n" +
                "• Channel: Kampung Inggris LC\n" +
                "• Playlist: TOEFL Structure Skill 1-15\n\n" +
                "📌 15 Part. Lihat tiap Part buat ringkasan.\n\n" +
                "📌 Catatan: Materi structure TOEFL dari skill dasar sampai lanjutan.",
              parts: [
                { id: "part_1", nama: "Skill 1: Harus Ada Subject dan Verb", materi: "📌 Materi\n• Pastikan setiap kalimat punya subject & verb.\n• Subject dan verb diujikan berselang-seling.\n\n📌 Sumber: TEATU with Mr Wira, Skill 1.", gdriveUrl: "", catatan: "" },
                { id: "part_2", nama: "Skill 2: Perhatikan Objects of Preposition", materi: "📌 Materi\n• Object of preposition = noun, gerund, atau prepositional phrase.\n• Hati-hati: letaknya bisa di belakang, tengah, atau depan.\n• Preposition: with, to, in, on, at.\n\n📌 Sumber: TEATU with Mr Wira, Skill 2.", gdriveUrl: "", catatan: "" },
                { id: "part_3", nama: "Skill 3: Hati-hati dengan Appositives", materi: "📌 Materi\n• Appositive = noun/pronoun yang jelasin noun/pronoun lain.\n• Dipisah pakai koma.\n• Nggak ngaruh ke subject-verb agreement.\n\n📌 Sumber: TEATU with Mr Wira, Skill 3.", gdriveUrl: "", catatan: "" },
                { id: "part_4", nama: "Skill 4: Present Participle", materi: "📌 Materi\n• Present participle: V-ing.\n• Sering keluar di TOEFL structure.\n\n📌 Sumber: TEATU with Mr Wira, Skill 4.", gdriveUrl: "", catatan: "" },
                { id: "part_5", nama: "Skill 5: Perhatikan Past Participle", materi: "📌 Materi\n• Past participle: V2, V3.\n• Bedain sama present participle.\n\n📌 Sumber: TEATU with Mr Wira, Skill 5.", gdriveUrl: "", catatan: "" },
                { id: "part_6", nama: "Skill 6: Use Coordinate Connectors Correctly", materi: "📌 Materi\n• Coordinate connectors: and, but, or, so, yet.\n• Hubungin dua clause setara.\n\n📌 Sumber: TEATU with Mr Wira, Skill 6.", gdriveUrl: "", catatan: "" },
                { id: "part_7", nama: "Skill 7: Use Adverb Time & Cause Connectors", materi: "📌 Materi\n• Time connectors: after, before, as long as, during.\n• Cause connectors: since, due to, as, because.\n\n📌 Sumber: TEATU with Mr Wira, Skill 7.", gdriveUrl: "", catatan: "" },
                { id: "part_8", nama: "Skill 8: Use Other Adverb Connector Correctly", materi: "📌 Materi\n• Adverb connector lain.\n• Hubungin dua clause nggak setara.\n\n📌 Sumber: TEATU with Mr Wira, Skill 8.", gdriveUrl: "", catatan: "" },
                { id: "part_9", nama: "Skill 9: Noun Clause Connectors", materi: "📌 Materi\n• Noun clause = sekumpulan kata yang berperan sebagai noun.\n• Connector: that, what, whatever, who, dll.\n\n📌 Sumber: TEATU with Mr Wira, Skill 9.", gdriveUrl: "", catatan: "" },
                { id: "part_10", nama: "Skill 10: Use Noun Clause Connector/Subject Correctly", materi: "📌 Materi\n• Noun clause connector yang berperan sebagai subject.\n• Perhatikan strukturnya.\n\n📌 Sumber: TEATU with Mr Wira, Skill 10.", gdriveUrl: "", catatan: "" },
                { id: "part_11", nama: "Skill 11: Use Adjective Clause Connectors Correctly", materi: "📌 Materi\n• Adjective clause = clause yang jelasin noun.\n• Connector: who, whom, which, that, whose.\n\n📌 Sumber: TEATU with Mr Wira, Skill 11.", gdriveUrl: "", catatan: "" },
                { id: "part_12", nama: "Skill 12: Adjective Clause Connector/Subjects", materi: "📌 Materi\n• Adjective clause connector yang berperan sebagai subject.\n• Perhatikan subject-verb agreement.\n\n📌 Sumber: TEATU with Mr Wira, Skill 12.", gdriveUrl: "", catatan: "" },
                { id: "part_13", nama: "Skill 13: Use Reduced Adverb Clause Correctly", materi: "📌 Materi\n• Cara ngurangin adverb clause tanpa ngubah makna.\n• Skill tingkat tinggi.\n\n📌 Sumber: TEATU with Mr Wira, Skill 13.", gdriveUrl: "", catatan: "" },
                { id: "part_14", nama: "Skill 14: More Practice Reduced Adverb Clause", materi: "📌 Materi\n• Latihan tambahan Reduced Adverb Clause.\n\n📌 Sumber: TEATU with Mr Wira, Skill 14.", gdriveUrl: "", catatan: "" },
                { id: "part_15", nama: "Skill 15: Invert the Subject and Verb with Question Word", materi: "📌 Materi\n• Inversi subject-verb dengan question word.\n• Hukum subject-verb agreement.\n\n📌 Sumber: TEATU with Mr Wira, Skill 15.", gdriveUrl: "", catatan: "" },
              ],
            }],
          },
          { id: "listening", nama: "Listening", warna: "indigo",
            fitur: [{ id: "english_speaking_course", nama: "English Speaking Course", materi: "📌 English Speaking Course\n• Playlist: 801 video\n• URL: https://www.youtube.com/playlist?list=PLOCvbe7RB9fZMMtLM5IP-1oBVxjYownyc\n\n📌 20 Part pertama.", parts: [
              { id: "part_1", nama: "Part 1: Daily English Conversations About Emergencies & Safety", materi: "📌 Materi\n• Percakapan darurat & keamanan.", gdriveUrl: "", catatan: "" },
              { id: "part_2", nama: "Part 2: Real-life English Conversations", materi: "📌 Materi\n• Speak English naturally.", gdriveUrl: "", catatan: "" },
              { id: "part_3", nama: "Part 3: 2 Hours of Daily English Conversations", materi: "📌 Materi\n• 2 jam percakapan.", gdriveUrl: "", catatan: "" },
              { id: "part_4", nama: "Part 4: Common English Mistakes", materi: "📌 Materi\n• Kesalahan umum.", gdriveUrl: "", catatan: "" },
              { id: "part_5", nama: "Part 5: Daily English Conversations Vol. 2", materi: "📌 Materi\n• 2 jam percakapan (lanjutan).", gdriveUrl: "", catatan: "" },
              { id: "part_6", nama: "Part 6: 75 Minutes to Speak Like a Native", materi: "📌 Materi\n• 75 menit percakapan.", gdriveUrl: "", catatan: "" },
              { id: "part_7", nama: "Part 7: Daily Routines English Conversations", materi: "📌 Materi\n• Rutinitas harian.", gdriveUrl: "", catatan: "" },
              { id: "part_8", nama: "Part 8: English Speaking Practice for Beginners", materi: "📌 Materi\n• Speaking pemula.", gdriveUrl: "", catatan: "" },
              { id: "part_9", nama: "Part 9: Practice English Speaking with Shadowing", materi: "📌 Materi\n• Teknik shadowing.", gdriveUrl: "", catatan: "" },
              { id: "part_10", nama: "Part 10: 30 Minutes of Daily English Conversations", materi: "📌 Materi\n• 30 menit percakapan.", gdriveUrl: "", catatan: "" },
              { id: "part_11", nama: "Part 11: Learn English Conversations for Beginners", materi: "📌 Materi\n• Percakapan pemula.", gdriveUrl: "", catatan: "" },
              { id: "part_12", nama: "Part 12: English Speaking Practice Vol. 2", materi: "📌 Materi\n• Speaking pemula lanjutan.", gdriveUrl: "", catatan: "" },
              { id: "part_13", nama: "Part 13: Common Mistakes in Daily Conversations", materi: "📌 Materi\n• Kesalahan umum.", gdriveUrl: "", catatan: "" },
              { id: "part_14", nama: "Part 14: Practice English Speaking Daily", materi: "📌 Materi\n• Latihan speaking harian.", gdriveUrl: "", catatan: "" },
              { id: "part_15", nama: "Part 15: 100 Daily English Conversations", materi: "📌 Materi\n• 100 percakapan.", gdriveUrl: "", catatan: "" },
              { id: "part_16", nama: "Part 16: Daily English Conversations for Practice", materi: "📌 Materi\n• Percakapan harian.", gdriveUrl: "", catatan: "" },
              { id: "part_17", nama: "Part 17: Fix Common Mistakes", materi: "📌 Materi\n• Benerin kesalahan umum.", gdriveUrl: "", catatan: "" },
              { id: "part_18", nama: "Part 18: Basic English Conversations", materi: "📌 Materi\n• Percakapan dasar.", gdriveUrl: "", catatan: "" },
              { id: "part_19", nama: "Part 19: Learn English Through Real-Life Situations", materi: "📌 Materi\n• Situasi nyata.", gdriveUrl: "", catatan: "" },
              { id: "part_20", nama: "Part 20: 30 Minutes Real-life Conversations", materi: "📌 Materi\n• 30 menit percakapan nyata.", gdriveUrl: "", catatan: "" },
            ]}],
          },
        ],
      },
      {
        id: "mandarin", nama: "Bahasa Mandarin",
        tools: [
          { id: "hsk_1", nama: "HSK 1", warna: "blue",
            fitur: [{ id: "everydaychinese_101days", nama: "EverydayChinese: Learn Mandarin in 101 Days", materi: "📌 EverydayChinese\n• Playlist: 41 video\n• URL: https://www.youtube.com/playlist?list=PLrYgra2FrMh_jGBcMmNWPnSh-kHwGiaXG\n\n📌 41 Part.", parts: [
              { id: "part_1", nama: "Part 1: How to Say Hello", materi: "📌 Materi\n• Nǐ hǎo / Nín hǎo", gdriveUrl: "", catatan: "" },
              { id: "part_2", nama: "Part 2: Say How Are You?", materi: "📌 Materi\n• Nǐ hǎo ma?", gdriveUrl: "", catatan: "" },
              { id: "part_3", nama: "Part 3: What's Your Name?", materi: "📌 Materi\n• Nǐ jiào shén me míng zi?", gdriveUrl: "", catatan: "" },
              { id: "part_4", nama: "Part 4: Glad to Meet You", materi: "📌 Materi\n• Hěn gāo xìng rèn shi nǐ", gdriveUrl: "", catatan: "" },
              { id: "part_5", nama: "Part 5: Nationality/Country Name", materi: "📌 Materi\n• Guó jiā", gdriveUrl: "", catatan: "" },
              { id: "part_6", nama: "Part 6: What is Your Nationality?", materi: "📌 Materi\n• Nǐ shì nǎ guó rén", gdriveUrl: "", catatan: "" },
              { id: "part_7", nama: "Part 7: Are You American?", materi: "📌 Materi\n• Nǐ shì měi guó rén ma?", gdriveUrl: "", catatan: "" },
              { id: "part_8", nama: "Part 8: Can You Speak Chinese?", materi: "📌 Materi\n• Nǐ huì shūo hàn yǔ ma", gdriveUrl: "", catatan: "" },
              { id: "part_9", nama: "Part 9: Who is She?", materi: "📌 Materi\n• Tā shì shéi", gdriveUrl: "", catatan: "" },
              { id: "part_10", nama: "Part 10: Review Lesson 1-10", materi: "📌 Materi\n• Review Day 1-10.", gdriveUrl: "", catatan: "" },
              { id: "part_11", nama: "Part 11: They Are All My Friends", materi: "📌 Materi\n• Tā men dōu shì wǒ de péng you", gdriveUrl: "", catatan: "" },
              { id: "part_12", nama: "Part 12: What's Your Surname?", materi: "📌 Materi\n• Nǐ xìng shén me", gdriveUrl: "", catatan: "" },
              { id: "part_13", nama: "Part 13: What Is Your Job?", materi: "📌 Materi\n• Zhí yè / Gōng zuò", gdriveUrl: "", catatan: "" },
              { id: "part_14", nama: "Part 14: I Am Busy", materi: "📌 Materi\n• Wǒ hěn máng", gdriveUrl: "", catatan: "" },
              { id: "part_15", nama: "Part 15: Numbers 1-100", materi: "📌 Materi\n• Count 1-100.", gdriveUrl: "", catatan: "" },
              { id: "part_16", nama: "Part 16: Asking for Phone Number", materi: "📌 Materi\n• Phone number.", gdriveUrl: "", catatan: "" },
              { id: "part_17", nama: "Part 17: Numbers 100-999", materi: "📌 Materi\n• 100-999.", gdriveUrl: "", catatan: "" },
              { id: "part_18", nama: "Part 18: Numbers 1,000-10,000", materi: "📌 Materi\n• Qiān & Wàn", gdriveUrl: "", catatan: "" },
              { id: "part_19", nama: "Part 19: How Old Are You?", materi: "📌 Materi\n• Asking age.", gdriveUrl: "", catatan: "" },
              { id: "part_20", nama: "Part 20: Review Lesson 11-19", materi: "📌 Materi\n• Review.", gdriveUrl: "", catatan: "" },
              { id: "part_21", nama: "Part 21: How Many Friends Do You Have?", materi: "📌 Materi\n• Measure word 个.", gdriveUrl: "", catatan: "" },
              { id: "part_22", nama: "Part 22: 8 Common Chinese Measure Words", materi: "📌 Materi\n• Classifiers.", gdriveUrl: "", catatan: "" },
              { id: "part_23", nama: "Part 23: Want in Chinese", materi: "📌 Materi\n• I want a cup of coffee.", gdriveUrl: "", catatan: "" },
              { id: "part_24", nama: "Part 24: This & That", materi: "📌 Materi\n• What is this?", gdriveUrl: "", catatan: "" },
              { id: "part_25", nama: "Part 25: Different ORs in Chinese", materi: "📌 Materi\n• 或者 vs 还是", gdriveUrl: "", catatan: "" },
              { id: "part_26", nama: "Part 26: Whose in Chinese", materi: "📌 Materi\n• 谁的", gdriveUrl: "", catatan: "" },
              { id: "part_27", nama: "Part 27: Indicating Location with 在", materi: "📌 Materi\n• Are you at home?", gdriveUrl: "", catatan: "" },
              { id: "part_28", nama: "Part 28: Here & There", materi: "📌 Materi\n• Where are you?", gdriveUrl: "", catatan: "" },
              { id: "part_29", nama: "Part 29: Gratitude & Apology", materi: "📌 Materi\n• Thank you, sorry.", gdriveUrl: "", catatan: "" },
              { id: "part_30", nama: "Part 30: Review Lesson 21-29", materi: "📌 Materi\n• Review.", gdriveUrl: "", catatan: "" },
              { id: "part_31", nama: "Part 31: 想 vs 要", materi: "📌 Materi\n• What would you like to eat?", gdriveUrl: "", catatan: "" },
              { id: "part_32", nama: "Part 32: How is sth/sb?", materi: "📌 Materi\n• 这道菜怎么样?", gdriveUrl: "", catatan: "" },
              { id: "part_33", nama: "Part 33: Affirmative-Negative Question", materi: "📌 Materi\n• 辣不辣?", gdriveUrl: "", catatan: "" },
              { id: "part_34", nama: "Part 34: Modal Verbs 能 vs 会", materi: "📌 Materi\n• 不能吃辣!", gdriveUrl: "", catatan: "" },
              { id: "part_35", nama: "Part 35: CAN in Chinese", materi: "📌 Materi\n• 会 vs 能 vs 可以", gdriveUrl: "", catatan: "" },
              { id: "part_36", nama: "Part 36: Talk About Weather", materi: "📌 Materi\n• 今天天气怎么样?", gdriveUrl: "", catatan: "" },
              { id: "part_37", nama: "Part 37: Years, Months, Days & Weeks", materi: "📌 Materi\n• 几月几号?", gdriveUrl: "", catatan: "" },
              { id: "part_38", nama: "Part 38: Telling the Time", materi: "📌 Materi\n• 几点了?", gdriveUrl: "", catatan: "" },
              { id: "part_39", nama: "Part 39: Talk About Prices", materi: "📌 Materi\n• 多少钱?", gdriveUrl: "", catatan: "" },
              { id: "part_40", nama: "Part 40: Learn Fast Chinese", materi: "📌 Materi\n• EverydayChinese101.", gdriveUrl: "", catatan: "" },
              { id: "part_41", nama: "Part 41: Learn Mandarin for Beginners", materi: "📌 Materi\n• EverydayChinese101.", gdriveUrl: "", catatan: "" },
            ]}],
          },
        ],
      },
    ],
  },

  {
    id: "agama", nama: "📖 Belajar Agama", warna: "green",
    subKategori: [
      { id: "fiqih", nama: "Fiqih Syafii",
        tools: [
          { id: "bab_1_thaharah", nama: "Bab I: Thaharah", warna: "green", fitur: [
            { id: "air_najis", nama: "Air & Najis", gdriveUrl: "", catatan: "", materi: "📌 Air & Najis\n• Air mutlak suci & menyucikan.\n• Air 2 qullah nggak jadi najis kecuali berubah.\n\n📌 Najis\n• Bangkai, darah, daging babi, khamer, kencing, tinja.\n• Bangkai ikan & belalang tidak najis.\n\n📌 Sumber: Al Umm (Imam Syafi'i), Bab Thaharah." },
            { id: "wudhu", nama: "Wudhu", gdriveUrl: "", catatan: "", materi: "📌 Fardhu Wudhu\n1. Niat\n2. Membasuh wajah\n3. Kedua tangan sampai siku\n4. Mengusap kepala\n5. Kedua kaki sampai mata kaki\n6. Tertib\n\n📌 Sumber: Al Umm, Bab Wudhu." },
            { id: "mandi_wajib", nama: "Mandi Wajib", gdriveUrl: "", catatan: "", materi: "📌 Hal Mewajibkan Mandi\n1. Junub\n2. Selesai haidh\n3. Selesai nifas\n\n📌 Sumber: Al Umm, Bab Mandi." },
            { id: "tayammum", nama: "Tayammum", gdriveUrl: "", catatan: "", materi: "📌 Kapan Boleh Tayammum\n1. Tidak ada air\n2. Sakit\n3. Musafir\n\n📌 Sumber: Al Umm, Bab Tayammum." },
          ]},
          { id: "bab_2_shalat", nama: "Bab II: Shalat", warna: "green", fitur: [
            { id: "syarat_rukun", nama: "Syarat & Rukun", gdriveUrl: "", catatan: "", materi: "📌 Syarat & Rukun Shalat\n• 5 syarat, 13 rukun.\n\n📌 Sumber: Madzhab Syafii (umum)." },
            { id: "shalat_wajib", nama: "Shalat Wajib", gdriveUrl: "", catatan: "", materi: "📌 Shalat Wajib 5 Waktu\n1. Subuh: 2 rakaat\n2. Zhuhur: 4\n3. Ashar: 4\n4. Maghrib: 3\n5. Isya: 4\n\n📌 Sumber: Al Umm, Bab Shalat." },
            { id: "shalat_sunnah", nama: "Shalat Sunnah", gdriveUrl: "", catatan: "", materi: "📌 Shalat Sunnah\n• Rawatib, Tahajud, Witir, Dhuha, Tarawih.\n\n📌 Sumber: Al Umm, Bab Shalat Sunnah." },
            { id: "sujud_sahwi", nama: "Sujud Sahwi", gdriveUrl: "", catatan: "", materi: "📌 Sujud Sahwi\n• Sujud 2x karena lupa.\n\n📌 Sumber: Madzhab Syafii (umum)." },
          ]},
          { id: "bab_3_zakat", nama: "Bab III: Zakat", warna: "green", fitur: [
            { id: "zakat_harta", nama: "Zakat Harta", gdriveUrl: "", catatan: "", materi: "📌 Zakat Harta\n• Emas: nishab 85 gram, 2.5%\n• Perak: 595 gram, 2.5%\n\n📌 Sumber: Al Umm, Bab Zakat." },
            { id: "zakat_fitrah", nama: "Zakat Fitrah", gdriveUrl: "", catatan: "", materi: "📌 Zakat Fitrah\n• 1 sha' (~2.5 kg) makanan pokok.\n• Sebelum shalat Idul Fitri.\n\n📌 Sumber: Madzhab Syafii (umum)." },
          ]},
          { id: "bab_4_puasa", nama: "Bab IV: Puasa", warna: "green", fitur: [
            { id: "puasa_ramadhan", nama: "Puasa Ramadhan", gdriveUrl: "", catatan: "", materi: "📌 Puasa Ramadhan\n• Wajib bagi muslim yang baligh, berakal, mampu.\n\n📌 Sumber: Madzhab Syafii (umum)." },
            { id: "puasa_sunnah", nama: "Puasa Sunnah", gdriveUrl: "", catatan: "", materi: "📌 Puasa Sunnah\n• Senin-Kamis, Ayyamul Bidh, Arafah, Asyura, 6 Syawal, Sya'ban.\n\n📌 Sumber: Madzhab Syafii (umum)." },
          ]},
          { id: "bab_5_haji", nama: "Bab V: Haji", warna: "green", fitur: [
            { id: "haji_wajib", nama: "Haji Wajib", gdriveUrl: "", catatan: "", materi: "📌 Haji Wajib\n• Rukun: Ihram, wukuf, thawaf, sai, tahallul, tertib.\n\n📌 Sumber: Al Umm, Bab Haji." },
            { id: "umrah", nama: "Umrah", gdriveUrl: "", catatan: "", materi: "📌 Umrah\n• Rukun: Ihram, thawaf, sai, tahallul, tertib.\n\n📌 Sumber: Madzhab Syafii (umum)." },
          ]},
          { id: "bab_6_nikah", nama: "Bab VI: Nikah", warna: "green", fitur: [
            { id: "rukun_nikah", nama: "Rukun Nikah", gdriveUrl: "", catatan: "", materi: "📌 Rukun Nikah\n1. Suami\n2. Istri\n3. Wali\n4. 2 saksi\n5. Ijab & kabul\n\n📌 Sumber: Al Umm, Bab Nikah." },
            { id: "talak", nama: "Talak", gdriveUrl: "", catatan: "", materi: "📌 Talak\n• Talak 1&2: boleh rujuk.\n• Talak 3: tidak boleh sampai menikah lagi.\n\n📌 Sumber: Al Umm, Bab Talak." },
          ]},
          { id: "bab_7_jual_beli", nama: "Bab VII: Jual Beli", warna: "green", fitur: [
            { id: "rukun_jual_beli", nama: "Rukun Jual Beli", gdriveUrl: "", catatan: "", materi: "📌 Rukun Jual Beli\n1. Penjual & pembeli\n2. Barang & harga\n3. Ijab & kabul\n\n📌 Sumber: Al Umm, Bab Jual Beli." },
            { id: "riba", nama: "Riba", gdriveUrl: "", catatan: "", materi: "📌 Riba\n• Riba fadhl & nasi'ah.\n• Barang ribawi: emas, perak, gandum, syair, kurma, garam.\n\n📌 Sumber: Al Umm, Bab Riba." },
          ]},
          { id: "bab_8_haidh", nama: "Bab VIII: Haidh & Istihadhah", warna: "green", fitur: [
            { id: "haidh", nama: "Haidh", gdriveUrl: "", catatan: "", materi: "📌 Haidh\n• 1 hari 1 malam s/d 15 hari.\n• Haram shalat, puasa, jima'.\n\n📌 Sumber: Al Umm, Bab Haidh." },
            { id: "istihadhah", nama: "Istihadhah", gdriveUrl: "", catatan: "", materi: "📌 Istihadhah\n• Darah penyakit.\n• Tetap shalat, wajib wudhu tiap shalat.\n\n📌 Sumber: Al Umm, Bab Istihadhah." },
          ]},
        ],
      },
      { id: "tauhid", nama: "Tauhid",
        tools: [
          { id: "bab_1_pendahuluan", nama: "Bab I: Pendahuluan", warna: "green", fitur: [
            { id: "marifat_taklid", nama: "Ma'rifat & Taklid", gdriveUrl: "", catatan: "", materi: "📌 Ma'rifat & Taklid\n• Ma'rifat: keteguhan hati sesuai kenyataan, dari dalil.\n• Taklid: tanpa dalil.\n• Fardhu 'ain.\n\n📌 Sumber: Kifayatul Awam, Bab I." },
            { id: "hukum_akal", nama: "Hukum Akal", gdriveUrl: "", catatan: "", materi: "📌 Hukum Akal\n1. Wajib\n2. Mustahil\n3. Jaiz\n\n📌 Sumber: Kifayatul Awam, Bab I." },
          ]},
          { id: "bab_2_uluhiyyah", nama: "Bab II: Tauhid Uluhiyyah", warna: "green", fitur: [
            { id: "sifat_wajib_allah", nama: "20 Sifat Wajib Allah", gdriveUrl: "", catatan: "", materi: "📌 20 Sifat Wajib Allah\nWujud, Qidam, Baqo', Mukholafatuhu lil hawadist, Qiyamuhu binafsihi, Wahdaniyyah, Qudrot, Irodat, Ilmu, Hayat, Sama', Bashor, Kalam, Kaunuhu Qodiron, Kaunuhu Muridan, Kaunuhu 'Aliman, Kaunuhu Hayyan, Kaunuhu Sami'an, Kaunuhu Bashiron, Kaunuhu Mutakalliman.\n\n📌 Sumber: Kifayatul Awam, Bab II." },
            { id: "sifat_mustahil_allah", nama: "20 Sifat Mustahil Allah", gdriveUrl: "", catatan: "", materi: "📌 20 Sifat Mustahil\nKebalikan 20 sifat wajib.\n\n📌 Sumber: Kifayatul Awam, Bab II." },
            { id: "sifat_jaiz_allah", nama: "1 Sifat Jaiz Allah", gdriveUrl: "", catatan: "", materi: "📌 Sifat Jaiz Allah\n• Menciptakan yang baik & buruk.\n\n📌 Sumber: Kifayatul Awam, Bab II." },
          ]},
          { id: "bab_3_nabawiyyah", nama: "Bab III: Tauhid Nabawiyyah", warna: "green", fitur: [
            { id: "sifat_wajib_rasul", nama: "Sifat Wajib Rasul", gdriveUrl: "", catatan: "", materi: "📌 4 Sifat Wajib Rasul: Sidiq, Amanah, Tabligh, Fathonah.\n\n📌 Sumber: Kifayatul Awam, Bab III." },
            { id: "sifat_mustahil_rasul", nama: "Sifat Mustahil Rasul", gdriveUrl: "", catatan: "", materi: "📌 4 Sifat Mustahil Rasul: Kadzb, Khiyanat, Kitman, Baladah.\n\n📌 Sumber: Kifayatul Awam, Bab III." },
            { id: "sifat_jaiz_rasul", nama: "Sifat Jaiz Rasul", gdriveUrl: "", catatan: "", materi: "📌 Sifat Jaiz Rasul\n• Sifat kemanusiaan.\n\n📌 Sumber: Kifayatul Awam, Bab III." },
          ]},
          { id: "bab_4_samiyyah", nama: "Bab IV: Tauhid Sam'iyyah", warna: "green", fitur: [
            { id: "qodho_qodar", nama: "Qodho & Qodar", gdriveUrl: "", catatan: "", materi: "📌 Qodho & Qodar\n• Qodho qodim, Qodar hadist.\n\n📌 Sumber: Kifayatul Awam, Bab IV." },
            { id: "melihat_allah", nama: "Melihat Allah", gdriveUrl: "", catatan: "", materi: "📌 Melihat Allah\n• Di akhirat, dalil QS Al-A'raf: 143.\n\n📌 Sumber: Kifayatul Awam, Bab IV." },
            { id: "mengutus_rasul", nama: "Mengutus Para Rasul", gdriveUrl: "", catatan: "", materi: "📌 Mengutus Para Rasul\n• Jaiz bagi Allah.\n\n📌 Sumber: Kifayatul Awam, Bab IV." },
            { id: "masa_cemerlang", nama: "Masa-Masa Cemerlang", gdriveUrl: "", catatan: "", materi: "📌 Masa Cemerlang\n• Sahabat > tabi'in > tabi' tabi'in.\n\n📌 Sumber: Kifayatul Awam, Bab IV." },
            { id: "silsilah_nabi", nama: "Silsilah Nabi", gdriveUrl: "", catatan: "", materi: "📌 Silsilah Nabi\n• Lahir di Mekkah, wafat di Madinah.\n\n📌 Sumber: Kifayatul Awam, Bab IV." },
            { id: "haudh_syafaat_dosa", nama: "Haudh, Syafa'at & Dosa", gdriveUrl: "", catatan: "", materi: "📌 Haudh, Syafa'at & Dosa\n• Haudh: telaga Nabi.\n• Syafa'at: khusus Nabi.\n• Dosa: selain kufur tidak mengkufurkan.\n\n📌 Sumber: Kifayatul Awam, Bab IV." },
          ]},
        ],
      },
    ],
  },
];

export const DEFAULT_TARGET_HARIAN = {
  design: { target: 1, satuan: "materi" },
  bahasa: { target: 1, satuan: "materi" },
  agama: { target: 1, satuan: "bab" },
};

export function generateId(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

export function formatTanggal(dateStr, opsi = "panjang") {
  const d = new Date(dateStr);
  if (opsi === "pendek") return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  return d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

// FIXED: handle nested fitur
export function findItem(kategori, path) {
  if (!path || path.length === 0) return null;
  let current = kategori, parent = null, parentArray = null;
  for (let i = 0; i < path.length; i++) {
    const id = path[i];
    if (i === 0) { const f = current.find((k) => k.id === id); if (!f) return null; parent = current; parentArray = current; current = f; }
    else if (i === 1) { const f = current.subKategori?.find((s) => s.id === id); if (!f) return null; parent = current; parentArray = current.subKategori; current = f; }
    else if (i === 2) { const f = current.tools?.find((t) => t.id === id); if (!f) return null; parent = current; parentArray = current.tools; current = f; }
    else {
      let found = null, arrayName = null;
      if (current.fitur && Array.isArray(current.fitur)) { found = current.fitur.find((f) => f.id === id); if (found) arrayName = "fitur"; }
      if (!found && current.parts && Array.isArray(current.parts)) { found = current.parts.find((p) => p.id === id); if (found) arrayName = "parts"; }
      if (!found) return null;
      parent = current; parentArray = current[arrayName]; current = found;
    }
  }
  return { item: current, parent, parentArray, level: path.length };
}

export function updateItem(kategori, path, updatedFields) {
  const result = findItem(kategori, path);
  if (!result) return kategori;
  const newKategori = JSON.parse(JSON.stringify(kategori));
  const newResult = findItem(newKategori, path);
  if (!newResult) return kategori;
  const { parentArray: newParentArray, item: newItem } = newResult;
  const index = newParentArray.findIndex((i) => i.id === newItem.id);
  if (index !== -1) newParentArray[index] = { ...newParentArray[index], ...updatedFields };
  return newKategori;
}

export function addItem(kategori, path, newItem) {
  const newKategori = JSON.parse(JSON.stringify(kategori));
  const result = findItem(newKategori, path);
  if (!result) return kategori;
  const { item, level } = result;
  if (level === 1) { if (!item.subKategori) item.subKategori = []; item.subKategori.push(newItem); }
  else if (level === 2) { if (!item.tools) item.tools = []; item.tools.push(newItem); }
  else if (level === 3) { if (item.parts) item.parts.push(newItem); else { if (!item.fitur) item.fitur = []; item.fitur.push(newItem); } }
  else { if (item.parts) item.parts.push(newItem); else { if (!item.fitur) item.fitur = []; item.fitur.push(newItem); } }
  return newKategori;
}

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

export function getMingguIni() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const senin = new Date(now.setDate(diff));
  return senin.toISOString().split("T")[0];
}

export function formatMinggu(tanggal) {
  const d = new Date(tanggal);
  return `Minggu ${d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}`;
}

export function kategoriPunyaKaryaMingguan(kategoriId) { return kategoriId === "design"; }

export function getKategoriIdFromPath(path) { if (!path || path.length === 0) return null; return path[0]; }

export function getLabelKategoriById(kategoriList, kategoriId) {
  return kategoriList.find((k) => k.id === kategoriId)?.nama || kategoriId;
}

export function getDefaultTargetByKategori(kategoriId) {
  return DEFAULT_TARGET_HARIAN[kategoriId] || { target: 1, satuan: "materi" };
}

export function getDefaultWarnaByKategori(kategoriId) {
  return DEFAULT_WARNA_KATEGORI[kategoriId] || "gray";
}

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

export function getWarnaStyle(warnaId) {
  return WARNA_OPTIONS.find((w) => w.id === warnaId) || WARNA_OPTIONS[9];
}

export function initLogHarian() { return {}; }

export function getLogByKategoriTanggal(logHarian, kategoriId, tanggal) {
  if (!logHarian || !logHarian[tanggal]) return [];
  return (logHarian[tanggal] || []).filter((log) => log.kategoriId === kategoriId);
}

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
  logKategori.forEach((log) => { if (log.catatan || log.gdriveUrl) itemUnik.add(`${log.subKategoriId}_${log.toolId}_${log.fiturId}_${log.partId || ""}`); });
  const itemSelesai = itemUnik.size;
  const persen = totalItem > 0 ? Math.min(100, Math.round((itemSelesai / totalItem) * 100)) : 0;
  return { totalItem, itemSelesai, persen };
}

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
  if (log.gdriveUrl) target.gdriveUrl = existingGdrive ? `${existingGdrive}\n${log.gdriveUrl}` : log.gdriveUrl;
  return newKategori;
}

export function syncMateriToLog(kategoriData, logHarian, path, catatan, gdriveUrl, tanggal) {
  if (!catatan.trim() && !gdriveUrl.trim()) return { kategori: kategoriData, logHarian };
  const newKategori = updateItem(kategoriData, path, { catatan, gdriveUrl });
  const newLogHarian = JSON.parse(JSON.stringify(logHarian || {}));
  if (!newLogHarian[tanggal]) newLogHarian[tanggal] = [];
  const logEntry = { id: `log_${Date.now()}`, kategoriId: path[0], subKategoriId: path[1] || "", toolId: path[2] || "", fiturId: path[3] || "", partId: path[4] || "", catatan, gdriveUrl, telegramMessageId: "", sumber: "materi", updatedAt: new Date().toISOString() };
  newLogHarian[tanggal].push(logEntry);
  return { kategori: newKategori, logHarian: newLogHarian };
}

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

export function updateLogSync(kategoriData, logHarian, oldLog, newLog, tanggal) {
  const newLogHarian = JSON.parse(JSON.stringify(logHarian || {}));
  if (newLogHarian[tanggal]) {
    newLogHarian[tanggal] = newLogHarian[tanggal].map((l) => l.id === oldLog.id ? { ...newLog, id: oldLog.id, sumber: oldLog.sumber } : l);
  }
  let newKategori = kategoriData;
  if (oldLog.sumber === "materi") {
    const path = [newLog.kategoriId, newLog.subKategoriId, newLog.toolId];
    if (newLog.fiturId) path.push(newLog.fiturId);
    if (newLog.partId) path.push(newLog.partId);
    newKategori = updateItem(kategoriData, path, { catatan: newLog.catatan, gdriveUrl: newLog.gdriveUrl });
  }
  return { kategori: newKategori, logHarian: newLogHarian };
}

export function getSubKategoriSiblings(kategoriData, kategoriId, currentSubKategoriId) {
  const kategori = kategoriData.find((k) => k.id === kategoriId);
  if (!kategori || !kategori.subKategori) return [];
  return kategori.subKategori.filter((s) => s.id !== currentSubKategoriId).map((s) => ({ id: s.id, nama: s.nama }));
}