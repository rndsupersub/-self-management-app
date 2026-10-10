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

export const DEFAULT_WARNA_KATEGORI = { design: "purple", bahasa: "blue", agama: "green", review_mesin: "teal" };

export const DEFAULT_KATEGORI = [
  // ========== DESIGN ==========
  {
    id: "design", nama: "🎨 Belajar Design", warna: "purple",
    subKategori: [
      { id: "2d", nama: "🖌️ 2D Design", tools: [
        { id: "illustrator", nama: "Illustrator", warna: "purple", fitur: [{ id: "adobe_illustrator_beginners", nama: "Adobe Illustrator Tutorial for Beginners", materi: "📌 Adobe Illustrator Tutorial for Beginners\n• Channel: Bring Your Own Laptop\n• URL: https://youtu.be/r9gaPGQ1EG0\n\n📌 29 Part.", parts: [
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
        { id: "photoshop", nama: "Photoshop", warna: "pink", fitur: [{ id: "adobe_photoshop_beginners", nama: "Adobe Photoshop for Beginners", materi: "📌 Photoshop for Beginners | FREE COURSE\n• Channel: Envato Tuts+\n• URL: https://www.youtube.com/watch?v=IyR_uYsRdPs\n\n📌 23 Part.", parts: [
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
      ]},
      { id: "3d", nama: "🧊 3D Design", tools: [
        { id: "blender", nama: "Blender", warna: "orange", fitur: [{ id: "blender_guru_donut", nama: "Blender Guru --- Donut", materi: "📌 Beginner Blender Tutorial (2026)\n• Channel: Blender Guru\n• URL: https://www.youtube.com/watch?v=z-Xl9tGqH14\n\n📌 8 Part.", parts: [
          { id: "part_1", nama: "Part 1: The Basics", materi: "📌 Timestamp: 00:00 -- 28:16", gdriveUrl: "", catatan: "" },
          { id: "part_2", nama: "Part 2: Basic Modelling", materi: "📌 Timestamp: 28:16 -- 59:05", gdriveUrl: "", catatan: "" },
          { id: "part_3", nama: "Part 3: Organic Modelling", materi: "📌 Timestamp: 59:05 -- 1:30:13", gdriveUrl: "", catatan: "" },
          { id: "part_4", nama: "Part 4: Materials", materi: "📌 Timestamp: 1:30:13 -- 2:03:46", gdriveUrl: "", catatan: "" },
          { id: "part_5", nama: "Part 5: Texturing", materi: "📌 Timestamp: 2:03:46 -- 2:35:40", gdriveUrl: "", catatan: "" },
          { id: "part_6", nama: "Part 6: UV Unwrapping", materi: "📌 Timestamp: 2:35:40 -- 3:09:26", gdriveUrl: "", catatan: "" },
          { id: "part_7", nama: "Part 7: Scattering", materi: "📌 Timestamp: 3:09:26 -- 3:46:11", gdriveUrl: "", catatan: "" },
          { id: "part_8", nama: "Part 8: Lighting and Rendering", materi: "📌 Timestamp: 3:46:11 -- 4:55:00", gdriveUrl: "", catatan: "" },
        ]}], karyaMingguan: [] },
        { id: "solidworks", nama: "SolidWorks", warna: "teal", fitur: [
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
          { id: "surface_modeling", nama: "Surface Modeling", fitur: [{ id: "surface_basics", nama: "Surface Basics", materi: "", gdriveUrl: "", catatan: "" }]},
          { id: "advanced_modeling", nama: "Advanced Modeling", fitur: [{ id: "advanced_basics", nama: "Advanced Basics", materi: "", gdriveUrl: "", catatan: "" }]},
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
      ]},
    ],
  },

  // ========== BAHASA ==========
  {
    id: "bahasa", nama: "🌏 Belajar Bahasa", warna: "blue",
    subKategori: [
      { id: "inggris", nama: "Bahasa Inggris", tools: [
        { id: "grammar", nama: "Grammar", warna: "blue", fitur: [{ id: "toefl_teatu", nama: "TOEFL Structure (TEATU with Mr Wira)", materi: "📌 TOEFL Structure --- TEATU with Mr Wira\n• Channel: Kampung Inggris LC\n\n📌 15 Part.", parts: [
          { id: "part_1", nama: "Skill 1: Harus Ada Subject dan Verb", materi: "📌 Materi\n• Subject & verb.\n\n📌 Sumber: TEATU Skill 1.", gdriveUrl: "", catatan: "" },
          { id: "part_2", nama: "Skill 2: Perhatikan Objects of Preposition", materi: "📌 Materi\n• Object of preposition.\n\n📌 Sumber: TEATU Skill 2.", gdriveUrl: "", catatan: "" },
          { id: "part_3", nama: "Skill 3: Hati-hati dengan Appositives", materi: "📌 Materi\n• Appositive.\n\n📌 Sumber: TEATU Skill 3.", gdriveUrl: "", catatan: "" },
          { id: "part_4", nama: "Skill 4: Present Participle", materi: "📌 Materi\n• V-ing.\n\n📌 Sumber: TEATU Skill 4.", gdriveUrl: "", catatan: "" },
          { id: "part_5", nama: "Skill 5: Perhatikan Past Participle", materi: "📌 Materi\n• V2, V3.\n\n📌 Sumber: TEATU Skill 5.", gdriveUrl: "", catatan: "" },
          { id: "part_6", nama: "Skill 6: Use Coordinate Connectors Correctly", materi: "📌 Materi\n• and, but, or, so, yet.\n\n📌 Sumber: TEATU Skill 6.", gdriveUrl: "", catatan: "" },
          { id: "part_7", nama: "Skill 7: Use Adverb Time & Cause Connectors", materi: "📌 Materi\n• Time & cause connectors.\n\n📌 Sumber: TEATU Skill 7.", gdriveUrl: "", catatan: "" },
          { id: "part_8", nama: "Skill 8: Use Other Adverb Connector Correctly", materi: "📌 Materi\n• Adverb connector.\n\n📌 Sumber: TEATU Skill 8.", gdriveUrl: "", catatan: "" },
          { id: "part_9", nama: "Skill 9: Noun Clause Connectors", materi: "📌 Materi\n• Noun clause.\n\n📌 Sumber: TEATU Skill 9.", gdriveUrl: "", catatan: "" },
          { id: "part_10", nama: "Skill 10: Use Noun Clause Connector/Subject Correctly", materi: "📌 Materi\n• Noun clause connector/subject.\n\n📌 Sumber: TEATU Skill 10.", gdriveUrl: "", catatan: "" },
          { id: "part_11", nama: "Skill 11: Use Adjective Clause Connectors Correctly", materi: "📌 Materi\n• Adjective clause.\n\n📌 Sumber: TEATU Skill 11.", gdriveUrl: "", catatan: "" },
          { id: "part_12", nama: "Skill 12: Adjective Clause Connector/Subjects", materi: "📌 Materi\n• Adj clause connector/subject.\n\n📌 Sumber: TEATU Skill 12.", gdriveUrl: "", catatan: "" },
          { id: "part_13", nama: "Skill 13: Use Reduced Adverb Clause Correctly", materi: "📌 Materi\n• Reduced adverb clause.\n\n📌 Sumber: TEATU Skill 13.", gdriveUrl: "", catatan: "" },
          { id: "part_14", nama: "Skill 14: More Practice Reduced Adverb Clause", materi: "📌 Materi\n• Latihan tambahan.\n\n📌 Sumber: TEATU Skill 14.", gdriveUrl: "", catatan: "" },
          { id: "part_15", nama: "Skill 15: Invert the Subject and Verb with Question Word", materi: "📌 Materi\n• Inversi subject-verb.\n\n📌 Sumber: TEATU Skill 15.", gdriveUrl: "", catatan: "" },
        ]}]},
        { id: "listening", nama: "Listening", warna: "indigo", fitur: [{ id: "english_speaking_course", nama: "English Speaking Course", materi: "📌 English Speaking Course\n• Playlist: 801 video\n• URL: https://www.youtube.com/playlist?list=PLOCvbe7RB9fZMMtLM5IP-1oBVxjYownyc\n\n📌 20 Part pertama.", parts: [
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
        ]}]},
      ]},
      { id: "mandarin", nama: "Bahasa Mandarin", tools: [
        { id: "hsk_1", nama: "HSK 1", warna: "blue", fitur: [{ id: "everydaychinese_101days", nama: "EverydayChinese: Learn Mandarin Chinese for Beginners in 101 Days", materi: "📌 EverydayChinese: Learn Mandarin Chinese for Beginners in 101 Days\n• Playlist: 41 video\n• Channel: Everyday Chinese\n• URL: https://www.youtube.com/playlist?list=PLrYgra2FrMh_jGBcMmNWPnSh-kHwGiaXG\n\n📌 41 Part.", parts: [
          { id: "part_1", nama: "Part 1: How to Say 'Hello' in Chinese", materi: "📌 Nǐ hǎo / Nín hǎo", gdriveUrl: "", catatan: "" },
          { id: "part_2", nama: "Part 2: Say 'How Are You?' in Chinese", materi: "📌 Nǐ hǎo ma?", gdriveUrl: "", catatan: "" },
          { id: "part_3", nama: "Part 3: What's Your Name?", materi: "📌 Nǐ jiào shén me míng zi?", gdriveUrl: "", catatan: "" },
          { id: "part_4", nama: "Part 4: Glad to Meet You", materi: "📌 Hěn gāo xìng rèn shi nǐ", gdriveUrl: "", catatan: "" },
          { id: "part_5", nama: "Part 5: How to Say Your Nationality/Country Name", materi: "📌 Guó jiā / 哪国人", gdriveUrl: "", catatan: "" },
          { id: "part_6", nama: "Part 6: What is Your Nationality?", materi: "📌 Nǐ shì nǎ guó rén", gdriveUrl: "", catatan: "" },
          { id: "part_7", nama: "Part 7: Are You American?", materi: "📌 Nǐ shì měi guó rén ma", gdriveUrl: "", catatan: "" },
          { id: "part_8", nama: "Part 8: Can You Speak Chinese?", materi: "📌 Nǐ huì shuō hàn yǔ ma", gdriveUrl: "", catatan: "" },
          { id: "part_9", nama: "Part 9: Who is She?", materi: "📌 Tā shì shéi", gdriveUrl: "", catatan: "" },
          { id: "part_10", nama: "Part 10: Review Lesson 1-10", materi: "📌 Review Day 1-10.", gdriveUrl: "", catatan: "" },
          { id: "part_11", nama: "Part 11: They Are All My Friends", materi: "📌 Tā men dōu shì wǒ de péng you", gdriveUrl: "", catatan: "" },
          { id: "part_12", nama: "Part 12: What's Your Surname?", materi: "📌 Nǐ xìng shén me", gdriveUrl: "", catatan: "" },
          { id: "part_13", nama: "Part 13: What Is Your Job?", materi: "📌 Zhí yè / Gōng zuò", gdriveUrl: "", catatan: "" },
          { id: "part_14", nama: "Part 14: Is Chinese Difficult to Learn? No, Just Follow Me!", materi: "📌 Wǒ hěn máng", gdriveUrl: "", catatan: "" },
          { id: "part_15", nama: "Part 15: Learn Chinese Numbers (1-100)", materi: "📌 Count 1-100.", gdriveUrl: "", catatan: "" },
          { id: "part_16", nama: "Part 16: Asking for Phone Number", materi: "📌 Phone number.", gdriveUrl: "", catatan: "" },
          { id: "part_17", nama: "Part 17: Counting in Mandarin: 100-999", materi: "📌 100-999.", gdriveUrl: "", catatan: "" },
          { id: "part_18", nama: "Part 18: Counting Thousand/Ten Thousand: 1,000-10,000", materi: "📌 Qiān & Wàn", gdriveUrl: "", catatan: "" },
          { id: "part_19", nama: "Part 19: How Old Are You?", materi: "📌 Asking age.", gdriveUrl: "", catatan: "" },
          { id: "part_20", nama: "Part 20: Summary Review Lessons 11-19", materi: "📌 Review.", gdriveUrl: "", catatan: "" },
          { id: "part_21", nama: "Part 21: How Many + Measure Word 个", materi: "📌 How Many Friends Do You Have?", gdriveUrl: "", catatan: "" },
          { id: "part_22", nama: "Part 22: 8 Common Chinese Measure Words You Must Know", materi: "📌 Classifiers.", gdriveUrl: "", catatan: "" },
          { id: "part_23", nama: "Part 23: Want in Chinese (I Want a Cup of Coffee)", materi: "📌 想要", gdriveUrl: "", catatan: "" },
          { id: "part_24", nama: "Part 24: This & That in Chinese", materi: "📌 What is this?", gdriveUrl: "", catatan: "" },
          { id: "part_25", nama: "Part 25: The Different 'OR's: 或者 vs 还是", materi: "📌 Do you want tea or coffee?", gdriveUrl: "", catatan: "" },
          { id: "part_26", nama: "Part 26: Here & There in Chinese", materi: "📌 Where are you?", gdriveUrl: "", catatan: "" },
          { id: "part_27", nama: "Part 27: Gratitude & Apology in Chinese", materi: "📌 Thank You, Sorry.", gdriveUrl: "", catatan: "" },
          { id: "part_28", nama: "Part 28: Summary Review Lessons 21-29", materi: "📌 Review.", gdriveUrl: "", catatan: "" },
          { id: "part_29", nama: "Part 29: 想 xiǎng vs. 要 yào", materi: "📌 What Would You Like to Eat?", gdriveUrl: "", catatan: "" },
          { id: "part_30", nama: "Part 30: How is sth/sb?", materi: "📌 这道菜怎么样?", gdriveUrl: "", catatan: "" },
          { id: "part_31", nama: "Part 31: 30 Basic Chinese Lessons in 3 Hours", materi: "📌 SUPER EASY Chinese Course.", gdriveUrl: "", catatan: "" },
          { id: "part_32", nama: "Part 32: Affirmative-Negative Question", materi: "📌 这道菜辣不辣?", gdriveUrl: "", catatan: "" },
          { id: "part_33", nama: "Part 33: Chinese Modal Verbs 能 vs 会", materi: "📌 我不能吃辣!", gdriveUrl: "", catatan: "" },
          { id: "part_34", nama: "Part 34: 'CAN' in Chinese: 会 vs 能 vs 可以", materi: "📌 我能问你一个问题吗?", gdriveUrl: "", catatan: "" },
          { id: "part_35", nama: "Part 35: Talk About the Weather", materi: "📌 今天天气怎么样?", gdriveUrl: "", catatan: "" },
          { id: "part_36", nama: "Part 36: Years, Months, Days & Weeks", materi: "📌 今天是几月几号?", gdriveUrl: "", catatan: "" },
          { id: "part_37", nama: "Part 37: Telling the Time", materi: "📌 现在几点?", gdriveUrl: "", catatan: "" },
          { id: "part_38", nama: "Part 38: Talk About Prices", materi: "📌 这个多少钱?", gdriveUrl: "", catatan: "" },
          { id: "part_39", nama: "Part 39: EverydayChinese101: Learn Fast Chinese", materi: "📌 Real-Life with Joyce.", gdriveUrl: "", catatan: "" },
          { id: "part_40", nama: "Part 40: Learn Mandarin for Beginners", materi: "📌 Extra lesson.", gdriveUrl: "", catatan: "" },
          { id: "part_41", nama: "Part 41: Learn Mandarin for Beginners (Bonus)", materi: "📌 Extra lesson.", gdriveUrl: "", catatan: "" },
        ]}]},
      ]},
    ],
  },

  // ========== AGAMA ==========
  {
    id: "agama", nama: "📖 Belajar Agama", warna: "green",
    subKategori: [
      { id: "fiqih", nama: "Fiqih Syafii", tools: [
        { id: "bab_1_thaharah", nama: "Bab I: Thaharah", warna: "green", fitur: [
          { id: "air_najis", nama: "Air & Najis", gdriveUrl: "", catatan: "", materi: "📌 Air & Najis\n• Air mutlak suci & menyucikan.\n• Air 2 qullah nggak jadi najis kecuali berubah.\n\n📌 Sumber: Al Umm (Imam Syafi'i), Bab Thaharah." },
          { id: "wudhu", nama: "Wudhu", gdriveUrl: "", catatan: "", materi: "📌 Fardhu Wudhu\n1. Niat\n2. Membasuh wajah\n3. Kedua tangan sampai siku\n4. Mengusap kepala\n5. Kedua kaki sampai mata kaki\n6. Tertib\n\n📌 Sumber: Al Umm, Bab Wudhu." },
          { id: "mandi_wajib", nama: "Mandi Wajib", gdriveUrl: "", catatan: "", materi: "📌 Hal Mewajibkan Mandi\n1. Junub\n2. Selesai haidh\n3. Selesai nifas\n\n📌 Sumber: Al Umm, Bab Mandi." },
          { id: "tayammum", nama: "Tayammum", gdriveUrl: "", catatan: "", materi: "📌 Kapan Boleh Tayammum\n1. Tidak ada air\n2. Sakit\n3. Musafir\n\n📌 Sumber: Al Umm, Bab Tayammum." },
        ]},
        { id: "bab_2_shalat", nama: "Bab II: Shalat", warna: "green", fitur: [
          { id: "syarat_rukun", nama: "Syarat & Rukun", gdriveUrl: "", catatan: "", materi: "📌 Syarat & Rukun Shalat\n• 5 syarat, 13 rukun.\n\n📌 Sumber: Madzhab Syafii." },
          { id: "shalat_wajib", nama: "Shalat Wajib", gdriveUrl: "", catatan: "", materi: "📌 5 Waktu: Subuh(2), Zhuhur(4), Ashar(4), Maghrib(3), Isya(4).\n\n📌 Sumber: Al Umm, Bab Shalat." },
          { id: "shalat_sunnah", nama: "Shalat Sunnah", gdriveUrl: "", catatan: "", materi: "📌 Rawatib, Tahajud, Witir, Dhuha, Tarawih.\n\n📌 Sumber: Al Umm." },
          { id: "sujud_sahwi", nama: "Sujud Sahwi", gdriveUrl: "", catatan: "", materi: "📌 Sujud 2x karena lupa.\n\n📌 Sumber: Madzhab Syafii." },
        ]},
        { id: "bab_3_zakat", nama: "Bab III: Zakat", warna: "green", fitur: [
          { id: "zakat_harta", nama: "Zakat Harta", gdriveUrl: "", catatan: "", materi: "📌 Emas 85g (2.5%), Perak 595g (2.5%).\n\n📌 Sumber: Al Umm, Bab Zakat." },
          { id: "zakat_fitrah", nama: "Zakat Fitrah", gdriveUrl: "", catatan: "", materi: "📌 1 sha' (~2.5kg) makanan pokok.\n\n📌 Sumber: Madzhab Syafii." },
        ]},
        { id: "bab_4_puasa", nama: "Bab IV: Puasa", warna: "green", fitur: [
          { id: "puasa_ramadhan", nama: "Puasa Ramadhan", gdriveUrl: "", catatan: "", materi: "📌 Wajib bagi muslim baligh, berakal, mampu.\n\n📌 Sumber: Madzhab Syafii." },
          { id: "puasa_sunnah", nama: "Puasa Sunnah", gdriveUrl: "", catatan: "", materi: "📌 Senin-Kamis, Ayyamul Bidh, Arafah, Asyura, 6 Syawal, Sya'ban.\n\n📌 Sumber: Madzhab Syafii." },
        ]},
        { id: "bab_5_haji", nama: "Bab V: Haji", warna: "green", fitur: [
          { id: "haji_wajib", nama: "Haji Wajib", gdriveUrl: "", catatan: "", materi: "📌 Rukun: Ihram, wukuf, thawaf, sai, tahallul, tertib.\n\n📌 Sumber: Al Umm." },
          { id: "umrah", nama: "Umrah", gdriveUrl: "", catatan: "", materi: "📌 Rukun: Ihram, thawaf, sai, tahallul, tertib.\n\n📌 Sumber: Madzhab Syafii." },
        ]},
        { id: "bab_6_nikah", nama: "Bab VI: Nikah", warna: "green", fitur: [
          { id: "rukun_nikah", nama: "Rukun Nikah", gdriveUrl: "", catatan: "", materi: "📌 Suami, istri, wali, 2 saksi, ijab & kabul.\n\n📌 Sumber: Al Umm." },
          { id: "talak", nama: "Talak", gdriveUrl: "", catatan: "", materi: "📌 Talak 1&2: boleh rujuk.\n• Talak 3: tidak boleh sampai menikah lagi.\n\n📌 Sumber: Al Umm." },
        ]},
        { id: "bab_7_jual_beli", nama: "Bab VII: Jual Beli", warna: "green", fitur: [
          { id: "rukun_jual_beli", nama: "Rukun Jual Beli", gdriveUrl: "", catatan: "", materi: "📌 Penjual-pembeli, barang-harga, ijab-kabul.\n\n📌 Sumber: Al Umm." },
          { id: "riba", nama: "Riba", gdriveUrl: "", catatan: "", materi: "📌 Riba fadhl & nasi'ah.\n\n📌 Sumber: Al Umm." },
        ]},
        { id: "bab_8_haidh", nama: "Bab VIII: Haidh & Istihadhah", warna: "green", fitur: [
          { id: "haidh", nama: "Haidh", gdriveUrl: "", catatan: "", materi: "📌 1 hari 1 malam s/d 15 hari.\n\n📌 Sumber: Al Umm." },
          { id: "istihadhah", nama: "Istihadhah", gdriveUrl: "", catatan: "", materi: "📌 Darah penyakit. Tetap shalat, wajib wudhu tiap shalat.\n\n📌 Sumber: Al Umm." },
        ]},
      ]},
      { id: "tauhid", nama: "Tauhid", tools: [
        { id: "bab_1_pendahuluan", nama: "Bab I: Pendahuluan", warna: "green", fitur: [
          { id: "marifat_taklid", nama: "Ma'rifat & Taklid", gdriveUrl: "", catatan: "", materi: "📌 Ma'rifat: dari dalil. Taklid: tanpa dalil. Fardhu 'ain.\n\n📌 Sumber: Kifayatul Awam, Bab I." },
          { id: "hukum_akal", nama: "Hukum Akal", gdriveUrl: "", catatan: "", materi: "📌 Wajib, Mustahil, Jaiz.\n\n📌 Sumber: Kifayatul Awam, Bab I." },
        ]},
        { id: "bab_2_uluhiyyah", nama: "Bab II: Tauhid Uluhiyyah", warna: "green", fitur: [
          { id: "sifat_wajib_allah", nama: "20 Sifat Wajib Allah", gdriveUrl: "", catatan: "", materi: "📌 Wujud, Qidam, Baqo', Mukholafatuhu lil hawadist, Qiyamuhu binafsihi, Wahdaniyyah, Qudrot, Irodat, Ilmu, Hayat, Sama', Bashor, Kalam, Kaunuhu Qodiron, Kaunuhu Muridan, Kaunuhu 'Aliman, Kaunuhu Hayyan, Kaunuhu Sami'an, Kaunuhu Bashiron, Kaunuhu Mutakalliman.\n\n📌 Sumber: Kifayatul Awam, Bab II." },
          { id: "sifat_mustahil_allah", nama: "20 Sifat Mustahil Allah", gdriveUrl: "", catatan: "", materi: "📌 Kebalikan 20 sifat wajib.\n\n📌 Sumber: Kifayatul Awam, Bab II." },
          { id: "sifat_jaiz_allah", nama: "1 Sifat Jaiz Allah", gdriveUrl: "", catatan: "", materi: "📌 Menciptakan yang baik & buruk.\n\n📌 Sumber: Kifayatul Awam, Bab II." },
        ]},
        { id: "bab_3_nabawiyyah", nama: "Bab III: Tauhid Nabawiyyah", warna: "green", fitur: [
          { id: "sifat_wajib_rasul", nama: "Sifat Wajib Rasul", gdriveUrl: "", catatan: "", materi: "📌 Sidiq, Amanah, Tabligh, Fathonah.\n\n📌 Sumber: Kifayatul Awam, Bab III." },
          { id: "sifat_mustahil_rasul", nama: "Sifat Mustahil Rasul", gdriveUrl: "", catatan: "", materi: "📌 Kadzb, Khiyanat, Kitman, Baladah.\n\n📌 Sumber: Kifayatul Awam, Bab III." },
          { id: "sifat_jaiz_rasul", nama: "Sifat Jaiz Rasul", gdriveUrl: "", catatan: "", materi: "📌 Sifat kemanusiaan.\n\n📌 Sumber: Kifayatul Awam, Bab III." },
        ]},
        { id: "bab_4_samiyyah", nama: "Bab IV: Tauhid Sam'iyyah", warna: "green", fitur: [
          { id: "qodho_qodar", nama: "Qodho & Qodar", gdriveUrl: "", catatan: "", materi: "📌 Qodho qodim, Qodar hadist.\n\n📌 Sumber: Kifayatul Awam, Bab IV." },
          { id: "melihat_allah", nama: "Melihat Allah", gdriveUrl: "", catatan: "", materi: "📌 Di akhirat. QS Al-A'raf: 143.\n\n📌 Sumber: Kifayatul Awam, Bab IV." },
          { id: "mengutus_rasul", nama: "Mengutus Para Rasul", gdriveUrl: "", catatan: "", materi: "📌 Jaiz bagi Allah.\n\n📌 Sumber: Kifayatul Awam, Bab IV." },
          { id: "masa_cemerlang", nama: "Masa-Masa Cemerlang", gdriveUrl: "", catatan: "", materi: "📌 Sahabat > tabi'in > tabi' tabi'in.\n\n📌 Sumber: Kifayatul Awam, Bab IV." },
          { id: "silsilah_nabi", nama: "Silsilah Nabi", gdriveUrl: "", catatan: "", materi: "📌 Lahir di Mekkah, wafat di Madinah.\n\n📌 Sumber: Kifayatul Awam, Bab IV." },
          { id: "haudh_syafaat_dosa", nama: "Haudh, Syafa'at & Dosa", gdriveUrl: "", catatan: "", materi: "📌 Haudh: telaga Nabi.\n• Syafa'at: khusus Nabi.\n• Dosa: selain kufur tidak mengkufurkan.\n\n📌 Sumber: Kifayatul Awam, Bab IV." },
        ]},
      ]},
    ],
  },

  // ========== REVIEW TEKNIK MESIN ==========
  {
    id: "review_mesin", nama: "🔧 Review Teknik Mesin", warna: "teal",
    subKategori: [
      { id: "matematika_sains", nama: "📐 Matematika & Sains Dasar", tools: [
        { id: "matematika", nama: "Matematika", warna: "teal", fitur: [
          // ===== FITUR 1: NUMBER & ALGEBRA =====
          { id: "number_algebra", nama: "Number & Algebra", materi: "📌 Number & Algebra\n• Dasar bilangan, aljabar, persamaan, logaritma.\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 1-17.", parts: [
            { id: "fractions_decimals", nama: "Fractions, Decimals, Percentages", materi: "📌 Fractions, Decimals & Percentages\n• Fractions: numerator/denominator, proper/improper, mixed number.\n• Operasi: penjumlahan (LCM), perkalian (cancelling), pembagian (invert).\n• Decimals: terminating vs non-terminating, significant figures, decimal places.\n• Percentages: konversi desimal↔persen, hitung persentase.\n• Ratio & proportion: direct & inverse.\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 1.", gdriveUrl: "", catatan: "" },
            { id: "indices_standard_form", nama: "Indices & Standard Form", materi: "📌 Indices & Standard Form\n• Laws of indices: a^m × a^n = a^(m+n); a^m ÷ a^n = a^(m−n); (a^m)^n = a^(mn).\n• a^0 = 1; a^−n = 1/a^n; a^(m/n) = n√(a^m).\n• Standard form: a × 10^n, di mana 1 ≤ a < 10.\n• Engineering notation: pangkat kelipatan 3 (k, M, G, m, μ, n, p).\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 2.", gdriveUrl: "", catatan: "" },
            { id: "computer_numbering", nama: "Computer Numbering Systems", materi: "📌 Computer Numbering Systems\n• Binary (base 2): konversi binary↔decimal.\n• Octal (base 8): konversi decimal↔octal.\n• Hexadecimal (base 16): konversi hex↔decimal↔binary.\n• Konversi decimal→binary via octal.\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 3.", gdriveUrl: "", catatan: "" },
            { id: "algebra_basic", nama: "Algebra (Basic, Polynomial, Partial Fractions)", materi: "📌 Algebra\n• Basic operations: penjumlahan, perkalian, pembagian aljabar.\n• Laws of indices untuk aljabar.\n• Brackets & factorisation: HCF, grouping.\n• Polynomial division: long division.\n• Factor theorem & remainder theorem.\n• Partial fractions: linear, repeated linear, quadratic factors.\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 5-7.", gdriveUrl: "", catatan: "" },
            { id: "equations", nama: "Equations (Simple, Simultaneous, Transposition)", materi: "📌 Equations\n• Simple equations: ax + b = c, cross-multiplication.\n• Simultaneous equations: substitution, elimination.\n• Transposition of formulae: rearrange formula untuk cari variabel.\n• Practical problems: Ohm's law, gas law, dll.\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 8-10.", gdriveUrl: "", catatan: "" },
            { id: "quadratic_inequalities", nama: "Quadratic Equations & Inequalities", materi: "📌 Quadratic Equations & Inequalities\n• Quadratic: ax² + bx + c = 0.\n• Metode: factorisation, completing the square, formula.\n• Quadratic formula: x = [−b ± √(b²−4ac)] / 2a.\n• Inequalities: simple, modulus, quotients, square functions, quadratic.\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 11-12.", gdriveUrl: "", catatan: "" },
            { id: "logarithms_exponential", nama: "Logarithms & Exponential", materi: "📌 Logarithms & Exponential\n• Log laws: log(AB) = log A + log B; log(A/B) = log A − log B; log A^n = n log A.\n• Common log (base 10), natural log (base e).\n• Indicial equations: 2^x = 3 → x = log 3 / log 2.\n• Exponential function: e^x, e^(−x), power series.\n• Graphs of exponential functions.\n• Laws of growth and decay: y = Ae^(−kx), y = A(1 − e^(−kx)).\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 13-14.", gdriveUrl: "", catatan: "" },
            { id: "number_sequences", nama: "Number Sequences (AP, GP)", materi: "📌 Number Sequences\n• Arithmetic Progression (AP): a, a+d, a+2d, ...\n• nth term: a + (n−1)d. Sum: S_n = n/2[2a + (n−1)d].\n• Geometric Progression (GP): a, ar, ar², ...\n• nth term: ar^(n−1). Sum: S_n = a(1−r^n)/(1−r).\n• Sum to infinity: S_∞ = a/(1−r) untuk |r| < 1.\n• Combinations & permutations: nCr, nPr.\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 15.", gdriveUrl: "", catatan: "" },
            { id: "binomial_series", nama: "Binomial Series", materi: "📌 Binomial Series\n• Pascal's triangle.\n• Binomial theorem: (a+x)^n = a^n + na^(n−1)x + ...\n• Ekspansi (1+x)^n untuk |x| < 1.\n• Aplikasi: aproksimasi numerik, small changes.\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 16.", gdriveUrl: "", catatan: "" },
            { id: "iterative_methods", nama: "Iterative Methods (Newton-Raphson)", materi: "📌 Iterative Methods\n• Newton-Raphson: r₂ = r₁ − f(r₁)/f'(r₁).\n• Functional notation method untuk cari initial estimate.\n• Aplikasi: solusi persamaan non-linear.\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 17.", gdriveUrl: "", catatan: "" },
          ]},

          // ===== FITUR 2: MENSURATION =====
          { id: "mensuration", nama: "Mensuration", materi: "📌 Mensuration\n• Area, volume, surface area.\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 18-21.", parts: [
            { id: "areas_plane_figures", nama: "Areas of Plane Figures", materi: "📌 Areas of Plane Figures\n• Quadrilaterals: rectangle, square, parallelogram, rhombus, trapezium.\n• Area: square=x², rectangle=l×b, parallelogram=b×h, triangle=½×b×h, trapezium=½(a+b)h.\n• Circle: πr² atau πd²/4. Semicircle: ½πr². Sector: (θ/360)πr² = ½r²θ.\n• Ellipse: πab.\n• Composite figures & similar shapes.\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 18.", gdriveUrl: "", catatan: "" },
            { id: "circle_properties", nama: "Circle & Properties", materi: "📌 Circle & Properties\n• Radius, diameter, circumference (c = 2πr = πd).\n• Tangent, sector, chord, segment, arc.\n• Arc length: s = rθ (θ dalam radian).\n• Area of sector: ½r²θ.\n• Equation of circle: x² + y² = r² (centre origin); (x−a)² + (y−b)² = r² (centre (a,b)).\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 19.", gdriveUrl: "", catatan: "" },
            { id: "volumes_surface_areas", nama: "Volumes & Surface Areas", materi: "📌 Volumes & Surface Areas\n• Rectangular prism: V=l×b×h, SA=2(bh+hl+lb).\n• Cylinder: V=πr²h, SA=2πrh+2πr².\n• Pyramid: V=⅓×A×h.\n• Cone: V=⅓πr²h, SA=πrl+πr².\n• Sphere: V=(4/3)πr³, SA=4πr².\n• Frustum of cone: V=⅓πh(R²+Rr+r²), SA=πl(R+r)+πr²+πR².\n• Frustum & zone of sphere.\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 20.", gdriveUrl: "", catatan: "" },
            { id: "irregular_areas_volumes", nama: "Irregular Areas & Volumes", materi: "📌 Irregular Areas & Volumes\n• Trapezoidal rule: Area = d[½(y₁+yₙ) + y₂ + ... + yₙ₋₁].\n• Mid-ordinate rule: Area = d(y₁ + y₂ + ... + yₙ).\n• Simpson's rule: Area = (d/3)[(y₁+yₙ) + 4(sum even) + 2(sum odd)].\n• Volume of irregular solids: Simpson's rule untuk volume.\n• Mean value of waveform: area/base.\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 21.", gdriveUrl: "", catatan: "" },
          ]},

          // ===== FITUR 3: TRIGONOMETRY =====
          { id: "trigonometry", nama: "Trigonometry", materi: "📌 Trigonometry\n• Rasio trig, waveform, identitas, compound angles.\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 22-27.", parts: [
            { id: "intro_trigonometry", nama: "Introduction to Trigonometry", materi: "📌 Introduction to Trigonometry\n• Pythagoras: b² = a² + c².\n• Rasio: sin θ = opp/hyp, cos θ = adj/hyp, tan θ = opp/adj.\n• Reciprocal: cosec, sec, cot.\n• Sudut istimewa: sin 30°, cos 60°, tan 45°, dll (surd form).\n• Solution of right-angled triangles.\n• Angle of elevation & depression.\n• Evaluasi rasio trig sudut sembarang.\n• Aproksimasi sudut kecil: sin x ≈ x, tan x ≈ x, cos x ≈ 1 − x²/2.\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 22.", gdriveUrl: "", catatan: "" },
            { id: "trig_waveforms", nama: "Trigonometric Waveforms", materi: "📌 Trigonometric Waveforms\n• Graph y = sin A, cos A, tan A.\n• Angles of any magnitude (CAST rule).\n• Produksi sine & cosine wave.\n• Sine & cosine curves: amplitudo, period, lag/lead.\n• Sinusoidal form: y = A sin(ωt ± α).\n• Waveform harmonics: fundamental, harmonik ke-3, ke-5, dll.\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 23.", gdriveUrl: "", catatan: "" },
            { id: "cartesian_polar", nama: "Cartesian & Polar Co-ordinates", materi: "📌 Cartesian & Polar Co-ordinates\n• Cartesian: (x, y). Polar: (r, θ).\n• Konversi Cartesian→Polar: r = √(x²+y²), θ = tan⁻¹(y/x).\n• Konversi Polar→Cartesian: x = r cos θ, y = r sin θ.\n• R→P dan P→R pada calculator.\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 24.", gdriveUrl: "", catatan: "" },
            { id: "triangles", nama: "Triangles (Sine & Cosine Rules)", materi: "📌 Triangles\n• Sine rule: a/sin A = b/sin B = c/sin C.\n• Cosine rule: a² = b² + c² − 2bc cos A.\n• Area of triangle: ½ab sin C, atau √(s(s−a)(s−b)(s−c)).\n• Practical situations: jib crane, phasor, dll.\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 25.", gdriveUrl: "", catatan: "" },
            { id: "trig_identities_equations", nama: "Trigonometric Identities & Equations", materi: "📌 Trigonometric Identities & Equations\n• Identitas: sin²θ + cos²θ = 1; 1 + tan²θ = sec²θ; cot²θ + 1 = cosec²θ.\n• tan θ = sin θ/cos θ; cot θ = cos θ/sin θ.\n• Trigonometric equations: a sin²A + b sin A + c = 0.\n• Gunakan identitas untuk reduce equations.\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 26.", gdriveUrl: "", catatan: "" },
            { id: "compound_angles", nama: "Compound Angles", materi: "📌 Compound Angles\n• sin(A±B) = sin A cos B ± cos A sin B.\n• cos(A±B) = cos A cos B ∓ sin A sin B.\n• tan(A±B) = (tan A ± tan B)/(1 ∓ tan A tan B).\n• Double angles: sin 2A = 2 sin A cos A; cos 2A = cos²A − sin²A = 1 − 2sin²A = 2cos²A − 1; tan 2A = 2tan A/(1 − tan²A).\n• Konversi a sin ωt + b cos ωt → R sin(ωt + α).\n• Product-to-sum & sum-to-product.\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 27.", gdriveUrl: "", catatan: "" },
          ]},

          // ===== FITUR 4: GRAPHS =====
          { id: "graphs", nama: "Graphs", materi: "📌 Graphs\n• Straight line, non-linear laws, log scales, graphical solution.\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 28-32.", parts: [
            { id: "straight_line_graphs", nama: "Straight Line Graphs", materi: "📌 Straight Line Graphs\n• y = mx + c: m = gradient, c = y-intercept.\n• Gradient: m = (y₂−y₁)/(x₂−x₁).\n• Practical problems: temperature conversion, Hooke's law, dll.\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 28.", gdriveUrl: "", catatan: "" },
            { id: "non_linear_laws", nama: "Reduction of Non-Linear Laws", materi: "📌 Reduction of Non-Linear Laws\n• y = ax² + b → plot y vs x².\n• y = a/x + b → plot y vs 1/x.\n• y = ax² + bx → plot y/x vs x.\n• y = ax^n → lg y = n lg x + lg a (plot lg y vs lg x).\n• y = ab^x → lg y = (lg b)x + lg a (plot lg y vs x).\n• y = ae^(kx) → ln y = kx + ln a (plot ln y vs x).\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 29.", gdriveUrl: "", catatan: "" },
            { id: "logarithmic_scales", nama: "Graphs with Logarithmic Scales", materi: "📌 Graphs with Logarithmic Scales\n• Log-log graph paper untuk y = ax^n.\n• Log-linear graph paper untuk y = ab^x dan y = ae^(kx).\n• Penentuan law dari grafik.\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 30.", gdriveUrl: "", catatan: "" },
            { id: "graphical_solution", nama: "Graphical Solution of Equations", materi: "📌 Graphical Solution of Equations\n• Simultaneous equations: titik potong 2 garis.\n• Quadratic equations: parabola, titik potong dengan x-axis.\n• Linear & quadratic simultaneously.\n• Cubic equations: titik potong dengan x-axis.\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 31.", gdriveUrl: "", catatan: "" },
            { id: "functions_curves", nama: "Functions & Their Curves", materi: "📌 Functions & Their Curves\n• Standard curves: straight line, quadratic, cubic, trig, circle, ellipse, hyperbola, log, exponential, polar.\n• Simple transformations: y=af(x), y=f(x)+a, y=f(x+a), y=f(ax), y=−f(x), y=f(−x).\n• Periodic functions.\n• Continuous & discontinuous functions.\n• Even & odd functions.\n• Inverse functions.\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 32.", gdriveUrl: "", catatan: "" },
          ]},

          // ===== FITUR 5: VECTORS =====
          { id: "vectors", nama: "Vectors", materi: "📌 Vectors\n• Addition, resolution, subtraction, combination of waveforms.\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 33-34.", parts: [
            { id: "vector_addition_resolution", nama: "Vector Addition & Resolution", materi: "📌 Vector Addition & Resolution\n• Scalar vs vector.\n• Nose-to-tail method & parallelogram method.\n• Resolution: horizontal H = F cos θ, vertical V = F sin θ.\n• Resultant: R = √(H²+V²), θ = tan⁻¹(V/H).\n• Vector subtraction.\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 33.", gdriveUrl: "", catatan: "" },
            { id: "combination_waveforms", nama: "Combination of Waveforms", materi: "📌 Combination of Waveforms\n• Plotting periodic functions: tambah ordinat.\n• Determining resultant phasors by calculation.\n• Cosine rule & sine rule untuk phasor.\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 34.", gdriveUrl: "", catatan: "" },
          ]},

          // ===== FITUR 6: COMPLEX NUMBERS =====
          { id: "complex_numbers", nama: "Complex Numbers", materi: "📌 Complex Numbers\n• Cartesian, Argand, polar, De Moivre.\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 35-36.", parts: [
            { id: "cartesian_argand", nama: "Cartesian Complex Numbers & Argand Diagram", materi: "📌 Cartesian Complex Numbers & Argand\n• j = √−1.\n• Bentuk a + jb: a = real part, jb = imaginary part.\n• Operasi: +, −, ×, ÷ (kalikan dengan conjugate untuk ÷).\n• Complex conjugate: a + jb → a − jb.\n• Argand diagram: sumbu x = real, sumbu y = imaginary.\n• Polar form: Z = r∠θ, di mana r = √(x²+y²), θ = tan⁻¹(y/x).\n• Multiplication & division in polar form: r₁r₂∠(θ₁+θ₂), r₁/r₂∠(θ₁−θ₂).\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 35.", gdriveUrl: "", catatan: "" },
            { id: "de_moivre", nama: "De Moivre's Theorem", materi: "📌 De Moivre's Theorem\n• [r∠θ]^n = r^n∠nθ.\n• Powers of complex numbers.\n• Roots of complex numbers: n solutions, terpisah 360°/n.\n• Aplikasi: a.c. theory, mechanical vector analysis.\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 36.", gdriveUrl: "", catatan: "" },
          ]},

          // ===== FITUR 7: STATISTICS =====
          { id: "statistics", nama: "Statistics", materi: "📌 Statistics\n• Presentation, central tendency, probability, distributions.\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 37-41.", parts: [
            { id: "presentation_data", nama: "Presentation of Statistical Data", materi: "📌 Presentation of Statistical Data\n• Discrete vs continuous data.\n• Ungrouped data: pictogram, horizontal bar chart, vertical bar chart, percentage component bar chart, pie diagram.\n• Grouped data: frequency distribution, tally diagram, histogram, frequency polygon, cumulative frequency distribution (ogive).\n• Class interval, class mid-point, class boundary.\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 37.", gdriveUrl: "", catatan: "" },
            { id: "central_tendency", nama: "Measures of Central Tendency & Dispersion", materi: "📌 Central Tendency & Dispersion\n• Mean: x̄ = Σx/n (discrete), x̄ = Σfx/Σf (grouped).\n• Median: nilai tengah setelah ranked.\n• Mode: nilai paling sering muncul.\n• Standard deviation: σ = √[Σ(x−x̄)²/n] (discrete), σ = √[Σf(x−x̄)²/Σf] (grouped).\n• Quartiles, deciles, percentiles.\n• Semi-interquartile range: (Q₃−Q₁)/2.\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 38.", gdriveUrl: "", catatan: "" },
            { id: "probability", nama: "Probability", materi: "📌 Probability\n• Probability: 0 ≤ p ≤ 1.\n• Addition law (OR): pA + pB.\n• Multiplication law (AND): pA × pB.\n• Dependent & independent events.\n• Conditional probability.\n• Expectation: E = pn.\n• Permutations & combinations.\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 39.", gdriveUrl: "", catatan: "" },
            { id: "binomial_poisson", nama: "Binomial & Poisson Distribution", materi: "📌 Binomial & Poisson Distribution\n• Binomial: (q+p)^n, successive terms.\n• Probabilitas 0, 1, 2, ..., n kali dalam n trials.\n• Poisson: e^(−λ)(1 + λ + λ²/2! + ...).\n• λ = np. Approximation untuk n besar, p kecil, np < 5.\n• Histogram of probabilities.\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 40.", gdriveUrl: "", catatan: "" },
            { id: "normal_distribution", nama: "Normal Distribution", materi: "📌 Normal Distribution\n• Kurva normal: simetris, bell-shaped.\n• Standardised normal curve: z = (x − x̄)/σ.\n• Tabel partial areas under normal curve.\n• Testing for normal distribution: normal probability paper.\n• Mean & standard deviation dari grafik.\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 41.", gdriveUrl: "", catatan: "" },
          ]},

          // ===== FITUR 8: DIFFERENTIAL CALCULUS =====
          { id: "differential_calculus", nama: "Differential Calculus", materi: "📌 Differential Calculus\n• Differentiation, methods, applications, parametric, implicit, logarithmic.\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 42-47.", parts: [
            { id: "intro_differentiation", nama: "Introduction to Differentiation", materi: "📌 Introduction to Differentiation\n• Functional notation: f(x), f(0), f(2), dll.\n• Gradient of a curve.\n• Differentiation from first principles: f'(x) = lim[δx→0] (f(x+δx)−f(x))/δx.\n• General rule: y = ax^n → dy/dx = anx^(n−1).\n• Differentiation of sin, cos, e^(ax), ln(ax).\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 42.", gdriveUrl: "", catatan: "" },
            { id: "methods_differentiation", nama: "Methods of Differentiation", materi: "📌 Methods of Differentiation\n• Standard derivatives: ax^n, sin ax, cos ax, e^(ax), ln ax.\n• Product rule: y = uv → dy/dx = u(dv/dx) + v(du/dx).\n• Quotient rule: y = u/v → dy/dx = [v(du/dx) − u(dv/dx)]/v².\n• Function of a function: dy/dx = (dy/du)(du/dx).\n• Successive differentiation: d²y/dx², d³y/dx³.\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 43.", gdriveUrl: "", catatan: "" },
            { id: "applications_differentiation", nama: "Applications of Differentiation", materi: "📌 Applications of Differentiation\n• Rates of change: dy/dx, dp/dh, di/dt, dθ/dt.\n• Velocity: v = dx/dt. Acceleration: a = dv/dt = d²x/dt².\n• Turning points: dy/dx = 0.\n• Max/min: d²y/dx² < 0 (max), > 0 (min).\n• Practical problems: max area, min surface area, max volume.\n• Tangents & normals.\n• Small changes: δy ≈ (dy/dx)·δx.\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 44.", gdriveUrl: "", catatan: "" },
            { id: "parametric_equations", nama: "Differentiation of Parametric Equations", materi: "📌 Parametric Equations\n• x = f(θ), y = g(θ).\n• dy/dx = (dy/dθ)/(dx/dθ).\n• d²y/dx² = [d/dθ(dy/dx)]/(dx/dθ).\n• Common parametric: ellipse, parabola, hyperbola, cardioid, astroid, cycloid.\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 45.", gdriveUrl: "", catatan: "" },
            { id: "implicit_functions", nama: "Differentiation of Implicit Functions", materi: "📌 Implicit Functions\n• d/dx[f(y)] = d/dy[f(y)] × dy/dx.\n• Differentiate term by term dengan respect to x.\n• Product & quotient rule untuk implicit.\n• Contoh: x² + y² = 25 → 2x + 2y(dy/dx) = 0.\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 46.", gdriveUrl: "", catatan: "" },
            { id: "logarithmic_differentiation", nama: "Logarithmic Differentiation", materi: "📌 Logarithmic Differentiation\n• Take ln both sides untuk simplify products/quotients.\n• d/dx[ln f(x)] = f'(x)/f(x).\n• Untuk [f(x)]^x: ln y = x ln f(x).\n• Contoh: y = x^x → dy/dx = x^x(1 + ln x).\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 47.", gdriveUrl: "", catatan: "" },
          ]},

          // ===== FITUR 9: INTEGRAL CALCULUS =====
          { id: "integral_calculus", nama: "Integral Calculus", materi: "📌 Integral Calculus\n• Standard, substitutions, partial fractions, by parts, numerical, areas, volumes.\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 48-59.", parts: [
            { id: "standard_integration", nama: "Standard Integration", materi: "📌 Standard Integration\n• ∫ax^n dx = ax^(n+1)/(n+1) + c (n ≠ −1).\n• ∫cos ax dx = (1/a) sin ax + c.\n• ∫sin ax dx = −(1/a) cos ax + c.\n• ∫e^(ax) dx = (1/a)e^(ax) + c.\n• ∫(1/x) dx = ln x + c.\n• Definite integrals: ∫[a,b] f(x) dx = F(b) − F(a).\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 48.", gdriveUrl: "", catatan: "" },
            { id: "algebraic_substitutions", nama: "Integration using Algebraic Substitutions", materi: "📌 Algebraic Substitutions\n• Let u = f(x), du = f'(x) dx.\n• ∫k[f(x)]^n f'(x) dx → substitusi u.\n• Change of limits untuk definite integral.\n• Contoh: ∫cos(3x+7) dx, misal u = 3x+7.\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 49.", gdriveUrl: "", catatan: "" },
            { id: "trig_substitutions", nama: "Integration using Trigonometric Substitutions", materi: "📌 Trigonometric Substitutions\n• ∫sin²x dx = ½(x − sin 2x/2) + c.\n• ∫cos²x dx = ½(x + sin 2x/2) + c.\n• ∫tan²x dx = tan x − x + c.\n• ∫cot²x dx = −cot x − x + c.\n• Powers of sines & cosines.\n• Products: sin A cos B, cos A sin B, cos A cos B, sin A sin B.\n• Substitusi sin θ: x = a sin θ.\n• Substitusi tan θ: x = a tan θ.\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 50.", gdriveUrl: "", catatan: "" },
            { id: "partial_fractions", nama: "Integration using Partial Fractions", materi: "📌 Integration using Partial Fractions\n• Linear factors: ∫[A/(x+a)] dx = A ln(x+a) + c.\n• Repeated linear factors.\n• Quadratic factors.\n• Contoh: ∫(11−3x)/(x²+2x−3) dx.\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 51.", gdriveUrl: "", catatan: "" },
            { id: "t_tan_substitution", nama: "t = tan(θ/2) Substitution", materi: "📌 t = tan(θ/2) Substitution\n• sin θ = 2t/(1+t²); cos θ = (1−t²)/(1+t²); dθ = 2dt/(1+t²).\n• Untuk integral rasional trigonometri.\n• Contoh: ∫dθ/(5+4cos θ).\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 52.", gdriveUrl: "", catatan: "" },
            { id: "integration_by_parts", nama: "Integration by Parts", materi: "📌 Integration by Parts\n• ∫u dv = uv − ∫v du.\n• Pilih u = algebraic term (kecuali ln x, pilih ln x sebagai u).\n• Contoh: ∫x cos x dx, ∫x ln x dx, ∫e^(ax) cos bx dx.\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 53.", gdriveUrl: "", catatan: "" },
            { id: "numerical_integration", nama: "Numerical Integration", materi: "📌 Numerical Integration\n• Trapezoidal rule: ∫y dx ≈ d[½(y₁+yₙ) + y₂ + ... + yₙ₋₁].\n• Mid-ordinate rule: ∫y dx ≈ d(y₁ + y₂ + ... + yₙ).\n• Simpson's rule: ∫y dx ≈ (d/3)[(y₁+yₙ) + 4(sum even) + 2(sum odd)].\n• Aplikasi: fungsi yang sulit/tidak bisa diintegralkan analitik.\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 54.", gdriveUrl: "", catatan: "" },
            { id: "areas_curves", nama: "Areas Under & Between Curves", materi: "📌 Areas Under & Between Curves\n• Area under curve: A = ∫[a,b] y dx.\n• Area between curves: A = ∫[a,b] [f₂(x) − f₁(x)] dx.\n• Jika kurva di bawah x-axis, area negatif.\n• Contoh: area di bawah y = 2x+3, dari x=1 ke x=4.\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 55.", gdriveUrl: "", catatan: "" },
            { id: "mean_rms_values", nama: "Mean & RMS Values", materi: "📌 Mean & RMS Values\n• Mean value: ȳ = (1/(b−a)) ∫[a,b] y dx.\n• RMS value: y_rms = √[(1/(b−a)) ∫[a,b] y² dx].\n• Sine wave: mean = (2/π)×max, rms = (1/√2)×max.\n• Aplikasi: a.c. theory.\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 56.", gdriveUrl: "", catatan: "" },
            { id: "volumes_revolution", nama: "Volumes of Solids of Revolution", materi: "📌 Volumes of Solids of Revolution\n• Rotasi tentang x-axis: V = ∫[a,b] πy² dx.\n• Rotasi tentang y-axis: V = ∫[c,d] πx² dy.\n• Contoh: bola, kerucut, frustum sphere.\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 57.", gdriveUrl: "", catatan: "" },
            { id: "centroids", nama: "Centroids of Simple Shapes", materi: "📌 Centroids\n• First moment of area: Ay.\n• x̄ = ∫xy dx / ∫y dx; ȳ = ½∫y² dx / ∫y dx.\n• Centroid area antara curve & y-axis.\n• Theorem of Pappus: V = area × distance moved by centroid.\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 58.", gdriveUrl: "", catatan: "" },
            { id: "second_moments", nama: "Second Moments of Area", materi: "📌 Second Moments of Area\n• Second moment of area: I = Ay².\n• Radius of gyration: k = √(I/A).\n• Rectangle: I = bl³/3 (sisi b), bl³/12 (centroid).\n• Circle: I = πr⁴/4 (diameter), πr⁴/2 (polar).\n• Parallel axis theorem: I_DD = I_GG + Ad².\n• Perpendicular axis theorem: I_OZ = I_OX + I_OY.\n• Composite areas.\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 59.", gdriveUrl: "", catatan: "" },
          ]},

          // ===== FITUR 10: FURTHER NUMBER & ALGEBRA =====
          { id: "further_number_algebra", nama: "Further Number & Algebra", materi: "📌 Further Number & Algebra\n• Boolean, matrices, determinants.\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 60-62.", parts: [
            { id: "boolean_algebra", nama: "Boolean Algebra & Logic Circuits", materi: "📌 Boolean Algebra & Logic Circuits\n• Or-function: A + B.\n• And-function: A · B.\n• Not-function: Ā.\n• Truth table.\n• Laws & rules of Boolean algebra.\n• De Morgan's laws: A+B = Ā·B̄; A·B = Ā+B̄.\n• Karnaugh maps: 2, 3, 4 variables.\n• Logic gates: AND, OR, NOT, NAND, NOR.\n• Universal logic gates: NAND, NOR.\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 60.", gdriveUrl: "", catatan: "" },
            { id: "matrices_determinants", nama: "Matrices & Determinants", materi: "📌 Matrices & Determinants\n• Matrix notation, addition, subtraction, multiplication.\n• Unit matrix, scalar multiplication.\n• Determinant 2×2: |a b; c d| = ad − bc.\n• Determinant 3×3: minor, cofactor, expansion.\n• Inverse matrix: A⁻¹ = adj A / |A|.\n• Aplikasi: solve simultaneous equations.\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 61.", gdriveUrl: "", catatan: "" },
            { id: "simultaneous_matrix", nama: "Simultaneous Equations (Matrix/Determinant)", materi: "📌 Simultaneous Equations (Matrix/Determinant)\n• Matrix method: AX = B → X = A⁻¹B.\n• Determinant method: x/Dx = −y/Dy = 1/D.\n• Cramer's rule untuk 3 unknowns.\n• Aplikasi: Kirchhoff's laws, mesh analysis, dll.\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 62.", gdriveUrl: "", catatan: "" },
          ]},

          // ===== FITUR 11: DIFFERENTIAL EQUATIONS =====
          { id: "differential_equations", nama: "Differential Equations", materi: "📌 Differential Equations\n• dy/dx = f(x), f(y), f(x)·f(y).\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 63.", parts: [
            { id: "de_fx", nama: "dy/dx = f(x)", materi: "📌 Differential Equations: dy/dx = f(x)\n• Solusi: y = ∫f(x) dx.\n• Contoh: x(dy/dx) = 2 − 4x³ → dy/dx = 2/x − 4x² → y = 2 ln x − (4/3)x³ + c.\n• Boundary conditions untuk particular solution.\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 63.3.", gdriveUrl: "", catatan: "" },
            { id: "de_fy", nama: "dy/dx = f(y)", materi: "📌 Differential Equations: dy/dx = f(y)\n• Rearrange: dx = dy/f(y).\n• Solusi: x = ∫dy/f(y).\n• Contoh: dy/dx = 3 + 2y → dx = dy/(3+2y) → x = ½ ln(3+2y) + c.\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 63.4.", gdriveUrl: "", catatan: "" },
            { id: "de_fxfy", nama: "dy/dx = f(x)·f(y)", materi: "📌 Differential Equations: dy/dx = f(x)·f(y)\n• Separation of variables: dy/f(y) = f(x) dx.\n• Solusi: ∫dy/f(y) = ∫f(x) dx.\n• Contoh: 4xy(dy/dx) = y²−1 → ∫4y/(y²−1) dy = ∫1/x dx → 2 ln(y²−1) = ln x + c.\n• Aplikasi: R-L circuit, adiabatic expansion, cooling.\n\n📌 Sumber: Engineering Mathematics, John Bird, Ch 63.5.", gdriveUrl: "", catatan: "" },
          ]},
        ]},

        // ===== FISIKA (BARU - dari buku Serway & Jewett) =====
        { id: "fisika", nama: "Fisika", warna: "blue", fitur: [
          // ===== FITUR 1: MECHANICS =====
          { id: "mechanics", nama: "Mechanics", materi: "📌 Mechanics\n• Fundamental Newtonian mechanics & fluid mechanics.\n\n📌 Sumber: Physics for Scientists and Engineers, Serway & Jewett, Ch 1-14.", parts: [
            { id: "ch1_physics_measurement", nama: "Ch 1: Physics and Measurement", materi: "📌 Physics and Measurement\n• SI units: length (m), mass (kg), time (s).\n• Dimensional analysis: [v]=L/T, [a]=L/T².\n• Conversion of units, significant figures.\n• Density ρ=m/V, atomic mass unit.\n\n📌 Sumber: Serway & Jewett, Ch 1.", gdriveUrl: "", catatan: "" },
            { id: "ch2_motion_1d", nama: "Ch 2: Motion in One Dimension", materi: "📌 Motion in One Dimension\n• Displacement Δx = xf − xi, velocity v = dx/dt, acceleration a = dv/dt.\n• Kinematics: vf = vi + at; xf = xi + vit + ½at²; vf² = vi² + 2a(xf−xi).\n• Freely falling objects: a = −g = −9.80 m/s².\n\n📌 Sumber: Serway & Jewett, Ch 2.", gdriveUrl: "", catatan: "" },
            { id: "ch3_vectors", nama: "Ch 3: Vectors", materi: "📌 Vectors\n• Scalar vs vector, coordinate systems.\n• Vector addition: graphical & components.\n• Ax = A cos θ, Ay = A sin θ, A = √(Ax²+Ay²).\n• Unit vectors i, j, k.\n\n📌 Sumber: Serway & Jewett, Ch 3.", gdriveUrl: "", catatan: "" },
            { id: "ch4_motion_2d", nama: "Ch 4: Motion in Two Dimensions", materi: "📌 Motion in Two Dimensions\n• Position, velocity, acceleration vectors.\n• Projectile motion: ax=0, ay=−g. Range R = vi² sin 2θi / g.\n• Uniform circular motion: ac = v²/r, period T = 2πr/v.\n• Tangential & radial acceleration.\n• Relative velocity.\n\n📌 Sumber: Serway & Jewett, Ch 4.", gdriveUrl: "", catatan: "" },
            { id: "ch5_laws_motion", nama: "Ch 5: The Laws of Motion", materi: "📌 The Laws of Motion\n• Newton I: benda diam/GLB jika ΣF=0.\n• Newton II: ΣF = ma.\n• Newton III: F12 = −F21.\n• Gaya gravitasi: Fg = mg. Gaya normal, tegangan tali.\n• Gaya gesek: fs ≤ μsn, fk = μkn.\n\n📌 Sumber: Serway & Jewett, Ch 5.", gdriveUrl: "", catatan: "" },
            { id: "ch6_circular_motion", nama: "Ch 6: Circular Motion & Other Applications", materi: "📌 Circular Motion & Applications\n• Newton II untuk uniform circular motion: ΣF = mv²/r.\n• Nonuniform circular motion: at = dv/dt, ar = −v²/r.\n• Motion in accelerated frames, fictitious forces.\n• Resistive forces: R = −bv (linear), R = ½DρAv² (quadratic).\n• Terminal speed.\n\n📌 Sumber: Serway & Jewett, Ch 6.", gdriveUrl: "", catatan: "" },
            { id: "ch7_energy_system", nama: "Ch 7: Energy of a System", materi: "📌 Energy of a System\n• Work: W = F Δr cos θ = ∫F·dr.\n• Kinetic energy: K = ½mv². Work–KE theorem: Wnet = ΔK.\n• Potential energy: Ug = mgy, Us = ½kx².\n• Conservative & nonconservative forces.\n• Energy diagrams, equilibrium.\n\n📌 Sumber: Serway & Jewett, Ch 7.", gdriveUrl: "", catatan: "" },
            { id: "ch8_conservation_energy", nama: "Ch 8: Conservation of Energy", materi: "📌 Conservation of Energy\n• Nonisolated system: ΔEsystem = ΣT.\n• Isolated system: ΔEsystem = 0.\n• Mechanical energy: Emech = K + U, conserved if no friction.\n• Friction: ΔEmech = −fkd.\n• Power: P = dE/dt = F·v.\n\n📌 Sumber: Serway & Jewett, Ch 8.", gdriveUrl: "", catatan: "" },
            { id: "ch9_momentum", nama: "Ch 9: Linear Momentum and Collisions", materi: "📌 Linear Momentum & Collisions\n• p = mv. Newton II: ΣF = dp/dt.\n• Impulse: I = ∫F dt = Δp.\n• Conservation of momentum (isolated system): Σpi = Σpf.\n• Collisions: elastic (K conserved), inelastic, perfectly inelastic.\n• Center of mass: rCM = (1/M)Σmiri.\n\n📌 Sumber: Serway & Jewett, Ch 9.", gdriveUrl: "", catatan: "" },
            { id: "ch10_rotation", nama: "Ch 10: Rotation of Rigid Object", materi: "📌 Rotation of Rigid Object\n• Angular position θ, ω = dθ/dt, α = dω/dt.\n• Kinematika rotasi: ωf = ωi + αt; θf = θi + ωit + ½αt².\n• v = rω, at = rα, ar = rω².\n• Moment of inertia: I = Σmiri².\n• Rotational KE: KR = ½Iω².\n• Torque: τ = rF sin θ = Iα.\n\n📌 Sumber: Serway & Jewett, Ch 10.", gdriveUrl: "", catatan: "" },
            { id: "ch11_angular_momentum", nama: "Ch 11: Angular Momentum", materi: "📌 Angular Momentum\n• L = r × p. Untuk rigid body: L = Iω.\n• Στ = dL/dt.\n• Conservation of angular momentum (isolated): Li = Lf.\n• Precession of gyroscope: ωp = Mgh/Iω.\n\n📌 Sumber: Serway & Jewett, Ch 11.", gdriveUrl: "", catatan: "" },
            { id: "ch12_equilibrium_elasticity", nama: "Ch 12: Static Equilibrium & Elasticity", materi: "📌 Static Equilibrium & Elasticity\n• Syarat equilibrium: ΣF = 0 dan Στ = 0.\n• Center of gravity.\n• Stress & strain: Young modulus Y = (F/A)/(ΔL/Li).\n• Shear modulus S = (F/A)/(Δx/h).\n• Bulk modulus B = −ΔP/(ΔV/Vi).\n\n📌 Sumber: Serway & Jewett, Ch 12.", gdriveUrl: "", catatan: "" },
            { id: "ch13_gravitation", nama: "Ch 13: Universal Gravitation", materi: "📌 Universal Gravitation\n• Hukum gravitasi Newton: F = G m1m2/r².\n• G = 6.673×10⁻¹¹ N·m²/kg².\n• g = GME/r². Hukum Kepler: T² = (4π²/GMS)a³.\n• Gravitational potential energy: U = −GMm/r.\n• Escape speed: vesc = √(2GM/R).\n\n📌 Sumber: Serway & Jewett, Ch 13.", gdriveUrl: "", catatan: "" },
            { id: "ch14_fluid_mechanics", nama: "Ch 14: Fluid Mechanics", materi: "📌 Fluid Mechanics\n• Pressure: P = F/A. Pascal: 1 Pa = 1 N/m².\n• Variasi tekanan: P = P0 + ρgh.\n• Pascal's law, Archimedes: B = ρfluid gV.\n• Equation of continuity: A1v1 = A2v2.\n• Bernoulli: P + ½ρv² + ρgy = constant.\n\n📌 Sumber: Serway & Jewett, Ch 14.", gdriveUrl: "", catatan: "" },
          ]},

          // ===== FITUR 2: OSCILLATIONS & MECHANICAL WAVES =====
          { id: "oscillations_waves", nama: "Oscillations & Mechanical Waves", materi: "📌 Oscillations & Mechanical Waves\n• SHM, wave motion, sound, superposition.\n\n📌 Sumber: Serway & Jewett, Ch 15-18.", parts: [
            { id: "ch15_oscillatory", nama: "Ch 15: Oscillatory Motion", materi: "📌 Oscillatory Motion\n• Simple Harmonic Motion (SHM): F = −kx, a = −ω²x.\n• x(t) = A cos(ωt + φ), ω = √(k/m).\n• Periode T = 2π√(m/k), frekuensi f = 1/T.\n• Energi: E = ½kA². vmax = ωA, amax = ω²A.\n• Pendulum: T = 2π√(L/g).\n• Damped oscillation, forced oscillation, resonance.\n\n📌 Sumber: Serway & Jewett, Ch 15.", gdriveUrl: "", catatan: "" },
            { id: "ch16_wave_motion", nama: "Ch 16: Wave Motion", materi: "📌 Wave Motion\n• Transverse & longitudinal waves.\n• Wave function: y = A sin(kx − ωt). k = 2π/λ, ω = 2π/T.\n• Wave speed: v = λf = ω/k.\n• Speed on string: v = √(T/μ).\n• Reflection & transmission.\n• Power: P = ½μω²A²v.\n• Linear wave equation: ∂²y/∂x² = (1/v²) ∂²y/∂t².\n\n📌 Sumber: Serway & Jewett, Ch 16.", gdriveUrl: "", catatan: "" },
            { id: "ch17_sound_waves", nama: "Ch 17: Sound Waves", materi: "📌 Sound Waves\n• Speed of sound: v = √(B/ρ).\n• Sound wave: displacement & pressure.\n• Intensity: I = P/A = ½ρvω²s²max = ΔP²max/(2ρv).\n• Sound level: β = 10 log(I/I0), I0 = 10⁻¹² W/m².\n• Doppler effect: f' = f (v ± vO)/(v ∓ vS).\n• Shock waves, Mach number.\n\n📌 Sumber: Serway & Jewett, Ch 17.", gdriveUrl: "", catatan: "" },
            { id: "ch18_superposition", nama: "Ch 18: Superposition & Standing Waves", materi: "📌 Superposition & Standing Waves\n• Superposition principle, interference.\n• Standing waves: y = 2A sin(kx) cos(ωt).\n• Node: x = nλ/2. Antinode: x = nλ/4.\n• String fixed both ends: fn = (n/2L)√(T/μ).\n• Pipe open both ends: fn = nv/2L.\n• Pipe closed one end: fn = nv/4L (n odd).\n• Beats: fbeat = |f1 − f2|.\n• Fourier synthesis.\n\n📌 Sumber: Serway & Jewett, Ch 18.", gdriveUrl: "", catatan: "" },
          ]},

          // ===== FITUR 3: THERMODYNAMICS =====
          { id: "thermodynamics", nama: "Thermodynamics", materi: "📌 Thermodynamics\n• Temperature, heat, kinetic theory, heat engines, entropy.\n\n📌 Sumber: Serway & Jewett, Ch 19-22.", parts: [
            { id: "ch19_temperature", nama: "Ch 19: Temperature", materi: "📌 Temperature\n• Zeroth law: thermal equilibrium.\n• Celsius, Fahrenheit, Kelvin: TC = T − 273.15; TF = 9/5 TC + 32.\n• Thermal expansion: ΔL = αLi ΔT, ΔV = βVi ΔT, β = 3α.\n• Ideal gas law: PV = nRT = NkBT. R = 8.314 J/mol·K, kB = 1.38×10⁻²³ J/K.\n\n📌 Sumber: Serway & Jewett, Ch 19.", gdriveUrl: "", catatan: "" },
            { id: "ch20_first_law", nama: "Ch 20: The First Law of Thermodynamics", materi: "📌 The First Law of Thermodynamics\n• Heat Q, internal energy Eint, work W.\n• First law: ΔEint = Q + W.\n• Specific heat: Q = mcΔT. Molar: Q = nCΔT.\n• Latent heat: Q = ±mL.\n• Proses: adiabatic (Q=0), isobaric (W=−PΔV), isovolumetric (W=0), isothermal (ΔEint=0).\n• Energy transfer: conduction, convection, radiation (Stefan: P = σAeT⁴).\n\n📌 Sumber: Serway & Jewett, Ch 20.", gdriveUrl: "", catatan: "" },
            { id: "ch21_kinetic_theory", nama: "Ch 21: The Kinetic Theory of Gases", materi: "📌 The Kinetic Theory of Gases\n• P = (2/3)(N/V)(½m0v̄²).\n• Temperature: ½m0v̄² = (3/2)kBT.\n• Internal energy monatomic: Eint = (3/2)nRT.\n• Molar specific heat: CV = (3/2)R (monatomic), (5/2)R (diatomic), (7/2)R (polyatomic). CP = CV + R.\n• Adiabatic: PV^γ = constant, γ = CP/CV.\n• Maxwell-Boltzmann: vrms = √(3kBT/m0), vavg, vmp.\n\n📌 Sumber: Serway & Jewett, Ch 21.", gdriveUrl: "", catatan: "" },
            { id: "ch22_heat_engines", nama: "Ch 22: Heat Engines, Entropy & Second Law", materi: "📌 Heat Engines, Entropy & Second Law\n• Heat engine: Weng = |Qh| − |Qc|. Efficiency e = Weng/|Qh|.\n• Carnot: eC = 1 − Tc/Th.\n• Refrigerator/Heat pump: COP = |Qc|/W atau |Qh|/W.\n• Second law: Kelvin-Planck, Clausius.\n• Entropy: ΔS = ∫dQr/T. ΔS ≥ 0 untuk isolated system.\n• Entropy mikroskopik: S = kB ln W.\n\n📌 Sumber: Serway & Jewett, Ch 22.", gdriveUrl: "", catatan: "" },
          ]},

          // ===== FITUR 4: ELECTRICITY & MAGNETISM =====
          { id: "electricity_magnetism", nama: "Electricity & Magnetism", materi: "📌 Electricity & Magnetism\n• Electric fields, Gauss, potential, capacitance, current, magnetism, induction.\n\n📌 Sumber: Serway & Jewett, Ch 23-34.", parts: [
            { id: "ch23_electric_fields", nama: "Ch 23: Electric Fields", materi: "📌 Electric Fields\n• Electric charge, conductors, insulators.\n• Coulomb's law: F = ke |q1q2|/r². ke = 8.99×10⁹ N·m²/C².\n• Electric field: E = F/q0 = ke q/r².\n• Continuous distribution: E = ke ∫dq/r².\n• Electric field lines, motion of charged particle.\n\n📌 Sumber: Serway & Jewett, Ch 23.", gdriveUrl: "", catatan: "" },
            { id: "ch24_gauss_law", nama: "Ch 24: Gauss's Law", materi: "📌 Gauss's Law\n• Electric flux: ΦE = ∫E·dA.\n• Gauss: ΦE = qin/ε0.\n• Aplikasi: sphere, cylinder, plane.\n• Conductor in electrostatic equilibrium: E=0 inside, charge on surface, E=σ/ε0 outside.\n\n📌 Sumber: Serway & Jewett, Ch 24.", gdriveUrl: "", catatan: "" },
            { id: "ch25_electric_potential", nama: "Ch 25: Electric Potential", materi: "📌 Electric Potential\n• Potential difference: ΔV = −∫E·ds.\n• Potential due to point charge: V = ke q/r.\n• Potential energy: U = qV = ke q1q2/r.\n• Equipotential surfaces.\n• E = −dV/ds (gradien).\n• Potential due to continuous distribution, conductor.\n• Millikan oil-drop, Van de Graaff, xerography.\n\n📌 Sumber: Serway & Jewett, Ch 25.", gdriveUrl: "", catatan: "" },
            { id: "ch26_capacitance", nama: "Ch 26: Capacitance & Dielectrics", materi: "📌 Capacitance & Dielectrics\n• Capacitance: C = Q/ΔV. Farad (F).\n• Parallel plate: C = ε0A/d.\n• Cylindrical: C = 2πε0L / ln(b/a).\n• Spherical: C = 4πε0 ab/(b−a).\n• Parallel: Ceq = ΣCi. Series: 1/Ceq = Σ 1/Ci.\n• Energy: U = Q²/2C = ½CΔV² = ½QΔV.\n• Dielectric: C = kC0. E = E0/k.\n\n📌 Sumber: Serway & Jewett, Ch 26.", gdriveUrl: "", catatan: "" },
            { id: "ch27_current_resistance", nama: "Ch 27: Current & Resistance", materi: "📌 Current & Resistance\n• Current: I = dQ/dt. Ampere (A).\n• Current density: J = I/A = nqvd.\n• Drift speed: vd = qEτ/m.\n• Ohm's law: ΔV = IR. Resistivity: R = ρL/A.\n• Temperature: ρ = ρ0[1 + α(T−T0)].\n• Power: P = IΔV = I²R = ΔV²/R.\n\n📌 Sumber: Serway & Jewett, Ch 27.", gdriveUrl: "", catatan: "" },
            { id: "ch28_dc_circuits", nama: "Ch 28: Direct Current Circuits", materi: "📌 Direct Current Circuits\n• Electromotive force (emf): ΔV = ε − Ir.\n• Resistors series: Req = ΣRi. Parallel: 1/Req = Σ 1/Ri.\n• Kirchhoff: ΣI = 0 (junction), ΣΔV = 0 (loop).\n• RC circuit: q = Q(1−e^(−t/RC)), discharge.\n• Electrical meters, household wiring.\n\n📌 Sumber: Serway & Jewett, Ch 28.", gdriveUrl: "", catatan: "" },
            { id: "ch29_magnetic_fields", nama: "Ch 29: Magnetic Fields", materi: "📌 Magnetic Fields\n• Magnetic force: F = qv × B, F = IL × B.\n• Motion in magnetic field: r = mv/qB, T = 2πm/qB.\n• Torque on loop: τ = NIAB sin θ.\n• Hall effect.\n\n📌 Sumber: Serway & Jewett, Ch 29.", gdriveUrl: "", catatan: "" },
            { id: "ch30_sources_magnetic", nama: "Ch 30: Sources of the Magnetic Field", materi: "📌 Sources of the Magnetic Field\n• Biot-Savart: dB = (μ0/4π) I ds × r / r².\n• Ampere's law: ∮B·ds = μ0I.\n• Solenoid: B = μ0nI.\n• Parallel conductors: F/L = μ0I1I2/(2πd).\n• Magnetism in matter.\n\n📌 Sumber: Serway & Jewett, Ch 30.", gdriveUrl: "", catatan: "" },
            { id: "ch31_faraday", nama: "Ch 31: Faraday's Law", materi: "📌 Faraday's Law\n• Fluks magnetik: ΦB = ∫B·dA.\n• Faraday: ε = −N dΦB/dt.\n• Lenz's law: arah arus menentang perubahan fluks.\n• Motional emf: ε = BLv.\n• Generators, eddy currents.\n\n📌 Sumber: Serway & Jewett, Ch 31.", gdriveUrl: "", catatan: "" },
            { id: "ch32_inductance", nama: "Ch 32: Inductance", materi: "📌 Inductance\n• Self-inductance: ε = −L dI/dt.\n• Solenoid: L = μ0N²A/l.\n• RL circuit: I = (ε/R)(1−e^(−Rt/L)).\n• Energy: U = ½LI².\n• Mutual inductance.\n• LC oscillation: ω = 1/√(LC).\n• RLC circuit.\n\n📌 Sumber: Serway & Jewett, Ch 32.", gdriveUrl: "", catatan: "" },
            { id: "ch33_ac_circuits", nama: "Ch 33: Alternating Current Circuits", materi: "📌 Alternating Current Circuits\n• AC sources: Δv = ΔVmax sin ωt.\n• R: I = ΔV/R. L: XL = ωL. C: XC = 1/ωC.\n• Impedansi: Z = √(R² + (XL−XC)²).\n• Resonance: ω0 = 1/√(LC).\n• Transformer: V2/V1 = N2/N1.\n\n📌 Sumber: Serway & Jewett, Ch 33.", gdriveUrl: "", catatan: "" },
            { id: "ch34_em_waves", nama: "Ch 34: Electromagnetic Waves", materi: "📌 Electromagnetic Waves\n• Displacement current, Ampere-Maxwell.\n• Maxwell equations: Gauss (E), Gauss (B), Faraday, Ampere-Maxwell.\n• EM waves: E = cB, c = 1/√(μ0ε0) = 3.00×10⁸ m/s.\n• Energy: uE = ½ε0E², uB = ½B²/μ0.\n• Poynting vector: S = E×B/μ0. Intensity I = Savg = EmaxBmax/2μ0.\n• Radiation pressure.\n• Spectrum EM.\n\n📌 Sumber: Serway & Jewett, Ch 34.", gdriveUrl: "", catatan: "" },
          ]},

          // ===== FITUR 5: LIGHT & OPTICS =====
          { id: "light_optics", nama: "Light & Optics", materi: "📌 Light & Optics\n• Nature of light, image formation, interference, diffraction, polarization.\n\n📌 Sumber: Serway & Jewett, Ch 35-38.", parts: [
            { id: "ch35_nature_light", nama: "Ch 35: The Nature of Light & Geometric Optics", materi: "📌 The Nature of Light & Geometric Optics\n• Ray approximation, speed of light c = 3.00×10⁸ m/s.\n• Reflection: θ1' = θ1.\n• Refraction: n1 sin θ1 = n2 sin θ2. Indeks bias n = c/v.\n• Huygens's principle, dispersion.\n• Total internal reflection: sin θc = n2/n1 (n1>n2).\n\n📌 Sumber: Serway & Jewett, Ch 35.", gdriveUrl: "", catatan: "" },
            { id: "ch36_image_formation", nama: "Ch 36: Image Formation", materi: "📌 Image Formation\n• Flat mirrors, spherical mirrors: 1/p + 1/q = 2/R.\n• Refraction at spherical surface: n1/p + n2/q = (n2−n1)/R.\n• Thin lens: 1/p + 1/q = 1/f. Magnification M = −q/p.\n• Lens aberrations, camera, eye, magnifier, microscope, telescope.\n\n📌 Sumber: Serway & Jewett, Ch 36.", gdriveUrl: "", catatan: "" },
            { id: "ch37_interference", nama: "Ch 37: Interference of Light Waves", materi: "📌 Interference of Light Waves\n• Kondisi interferensi: koheren, monokromatik.\n• Young double-slit: terang d sin θ = mλ. Gelap d sin θ = (m+½)λ.\n• Distribusi intensitas: I = Imax cos²(πd sin θ/λ).\n• Interferensi thin films.\n• Michelson interferometer.\n\n📌 Sumber: Serway & Jewett, Ch 37.", gdriveUrl: "", catatan: "" },
            { id: "ch38_diffraction_polarization", nama: "Ch 38: Diffraction Patterns & Polarization", materi: "📌 Diffraction Patterns & Polarization\n• Single-slit: gelap a sin θ = mλ (m≠0).\n• Circular aperture: sin θ = 1.22 λ/D.\n• Diffraction grating: d sin θ = mλ.\n• X-ray diffraction: Bragg 2d sin θ = mλ.\n• Polarization: Malus I = Imax cos²θ.\n\n📌 Sumber: Serway & Jewett, Ch 38.", gdriveUrl: "", catatan: "" },
          ]},

          // ===== FITUR 6: MODERN PHYSICS =====
          { id: "modern_physics", nama: "Modern Physics", materi: "📌 Modern Physics\n• Relativity, quantum, atomic, molecules, nuclear, particle.\n\n📌 Sumber: Serway & Jewett, Ch 39-46.", parts: [
            { id: "ch39_relativity", nama: "Ch 39: Relativity", materi: "📌 Relativity\n• Prinsip relativitas Galilean & Einstein.\n• Postulat: kecepatan cahaya konstan, hukum fisika sama di semua inertial frame.\n• Dilatasi waktu: Δt = γ Δtp. Kontraksi panjang: L = Lp/γ.\n• Lorentz: γ = 1/√(1−v²/c²).\n• Momentum relativistik: p = γmv. Energi: E = γmc², E0 = mc².\n\n📌 Sumber: Serway & Jewett, Ch 39.", gdriveUrl: "", catatan: "" },
            { id: "ch40_quantum_intro", nama: "Ch 40: Introduction to Quantum Physics", materi: "📌 Introduction to Quantum Physics\n• Radiasi blackbody, hipotesis Planck: E = hf.\n• Efek fotolistrik: Kmax = hf − φ. h = 6.626×10⁻³⁴ J·s.\n• Compton effect: Δλ = (h/mec)(1−cos θ).\n• Sifat gelombang partikel: λ = h/p.\n• Prinsip ketidakpastian Heisenberg.\n\n📌 Sumber: Serway & Jewett, Ch 40.", gdriveUrl: "", catatan: "" },
            { id: "ch41_quantum_mechanics", nama: "Ch 41: Quantum Mechanics", materi: "📌 Quantum Mechanics\n• Persamaan Schrödinger: −(ħ²/2m)∂²ψ/∂x² + Uψ = Eψ.\n• Partikel dalam sumur potensial.\n• Efek tunneling.\n• Osilator harmonik sederhana.\n\n📌 Sumber: Serway & Jewett, Ch 41.", gdriveUrl: "", catatan: "" },
            { id: "ch42_atomic_physics", nama: "Ch 42: Atomic Physics", materi: "📌 Atomic Physics\n• Spektrum atom hidrogen.\n• Model Bohr: En = −13.6/n² eV. rn = n²a0.\n• Bilangan kuantum, prinsip eksklusi Pauli.\n• Laser.\n\n📌 Sumber: Serway & Jewett, Ch 42.", gdriveUrl: "", catatan: "" },
            { id: "ch43_molecules_solids", nama: "Ch 43: Molecules and Solids", materi: "📌 Molecules and Solids\n• Ikatan molekul, spektrum molekul.\n• Bonding in solids.\n• Free-electron theory of metals.\n• Band theory: insulator, semiconductor, conductor.\n• Semikonduktor devices, superconductivity.\n\n📌 Sumber: Serway & Jewett, Ch 43.", gdriveUrl: "", catatan: "" },
            { id: "ch44_nuclear_structure", nama: "Ch 44: Nuclear Structure", materi: "📌 Nuclear Structure\n• Sifat inti: proton, neutron, nomor atom & massa.\n• Energi ikat inti: Eb = [Zmp + Nmn − M]c².\n• Radioaktivitas: α, β, γ.\n• Hukum peluruhan: N = N0e^(−λt). Waktu paruh T1/2 = ln 2/λ.\n• NMR & MRI.\n\n📌 Sumber: Serway & Jewett, Ch 44.", gdriveUrl: "", catatan: "" },
            { id: "ch45_nuclear_applications", nama: "Ch 45: Applications of Nuclear Physics", materi: "📌 Applications of Nuclear Physics\n• Reaksi neutron, fisi nuklir.\n• Reaktor nuklir, fusi nuklir.\n• Radiation damage, detektor radiasi, penggunaan radiasi.\n\n📌 Sumber: Serway & Jewett, Ch 45.", gdriveUrl: "", catatan: "" },
            { id: "ch46_particle_cosmology", nama: "Ch 46: Particle Physics & Cosmology", materi: "📌 Particle Physics & Cosmology\n• Gaya fundamental: gravitasi, elektromagnetik, kuat, lemah.\n• Antipartikel, meson, klasifikasi partikel.\n• Hukum konservasi, strange particles.\n• Quark: up, down, strange, charmed, bottom, top.\n• Standard Model, cosmic connection.\n\n📌 Sumber: Serway & Jewett, Ch 46.", gdriveUrl: "", catatan: "" },
          ]},
        ]},

              { id: "kimia_dasar", nama: "Kimia Dasar", warna: "green", fitur: [
          { id: "kimia_bab_1", nama: "1. Essential Ideas of Chemistry", materi: "", gdriveUrl: "", catatan: "", parts: [
            { id: "kimia_1_1", nama: "1.1 Chemistry in Context", materi: "", gdriveUrl: "", catatan: "" },
            { id: "kimia_1_2", nama: "1.2 Phases and Classification of Matter", materi: "", gdriveUrl: "", catatan: "" },
            { id: "kimia_1_3", nama: "1.3 Physical and Chemical Properties", materi: "", gdriveUrl: "", catatan: "" },
            { id: "kimia_1_4", nama: "1.4 Measurements", materi: "", gdriveUrl: "", catatan: "" },
            { id: "kimia_1_5", nama: "1.5 Measurement Uncertainty, Accuracy, and Precision", materi: "", gdriveUrl: "", catatan: "" },
            { id: "kimia_1_6", nama: "1.6 Mathematical Treatment of Measurement Results", materi: "", gdriveUrl: "", catatan: "" },
            { id: "kimia_1_7", nama: "1.7 How to Solve Chemistry Problems", materi: "", gdriveUrl: "", catatan: "" },
          ]},
          { id: "kimia_bab_2", nama: "2. Atoms, Molecules, and Ions", materi: "", gdriveUrl: "", catatan: "", parts: [
            { id: "kimia_2_1", nama: "2.1 Early Ideas in Atomic Theory", materi: "", gdriveUrl: "", catatan: "" },
            { id: "kimia_2_2", nama: "2.2 Evolution of Atomic Theory", materi: "", gdriveUrl: "", catatan: "" },
            { id: "kimia_2_3", nama: "2.3 Atomic Structure and Symbolism", materi: "", gdriveUrl: "", catatan: "" },
            { id: "kimia_2_4", nama: "2.4 Chemical Formulas", materi: "", gdriveUrl: "", catatan: "" },
            { id: "kimia_2_5", nama: "2.5 The Periodic Table", materi: "", gdriveUrl: "", catatan: "" },
            { id: "kimia_2_6", nama: "2.6 Molecular and Ionic Compounds", materi: "", gdriveUrl: "", catatan: "" },
            { id: "kimia_2_7", nama: "2.7 Chemical Nomenclature", materi: "", gdriveUrl: "", catatan: "" },
          ]},
          { id: "kimia_bab_3", nama: "3. Composition of Substances and Solutions", materi: "", gdriveUrl: "", catatan: "", parts: [
            { id: "kimia_3_1", nama: "3.1 Formula Mass and the Mole Concept", materi: "", gdriveUrl: "", catatan: "" },
            { id: "kimia_3_2", nama: "3.2 Determining Empirical and Molecular Formulas", materi: "", gdriveUrl: "", catatan: "" },
            { id: "kimia_3_3", nama: "3.3 Molarity", materi: "", gdriveUrl: "", catatan: "" },
            { id: "kimia_3_4", nama: "3.4 Other Units for Solution Concentrations", materi: "", gdriveUrl: "", catatan: "" },
          ]},
          { id: "kimia_bab_4", nama: "4. Stoichiometry of Chemical Reactions", materi: "", gdriveUrl: "", catatan: "", parts: [
            { id: "kimia_4_1", nama: "4.1 Writing and Balancing Chemical Equations", materi: "", gdriveUrl: "", catatan: "" },
            { id: "kimia_4_2", nama: "4.2 Classifying Chemical Reactions", materi: "", gdriveUrl: "", catatan: "" },
            { id: "kimia_4_3", nama: "4.3 Reaction Stoichiometry", materi: "", gdriveUrl: "", catatan: "" },
            { id: "kimia_4_4", nama: "4.4 Reaction Yields", materi: "", gdriveUrl: "", catatan: "" },
            { id: "kimia_4_5", nama: "4.5 Quantitative Chemical Analysis", materi: "", gdriveUrl: "", catatan: "" },
          ]},
          { id: "kimia_bab_5", nama: "5. Gases", materi: "", gdriveUrl: "", catatan: "", parts: [
            { id: "kimia_5_1", nama: "5.1 Characteristics of Gases", materi: "", gdriveUrl: "", catatan: "" },
            { id: "kimia_5_2", nama: "5.2 Gas Pressure", materi: "", gdriveUrl: "", catatan: "" },
            { id: "kimia_5_3", nama: "5.3 Relating Pressure, Volume, Amount, and Temperature", materi: "", gdriveUrl: "", catatan: "" },
            { id: "kimia_5_4", nama: "5.4 Stoichiometry of Gaseous Substances", materi: "", gdriveUrl: "", catatan: "" },
            { id: "kimia_5_5", nama: "5.5 The Kinetic-Molecular Theory", materi: "", gdriveUrl: "", catatan: "" },
            { id: "kimia_5_6", nama: "5.6 Effusion and Diffusion of Gases", materi: "", gdriveUrl: "", catatan: "" },
            { id: "kimia_5_7", nama: "5.7 Non-Ideal Gas Behavior", materi: "", gdriveUrl: "", catatan: "" },
          ]},
          { id: "kimia_bab_6", nama: "6. Thermochemistry", materi: "", gdriveUrl: "", catatan: "", parts: [
            { id: "kimia_6_1", nama: "6.1 The Nature of Energy", materi: "", gdriveUrl: "", catatan: "" },
            { id: "kimia_6_2", nama: "6.2 The First Law of Thermodynamics", materi: "", gdriveUrl: "", catatan: "" },
            { id: "kimia_6_3", nama: "6.3 Enthalpy", materi: "", gdriveUrl: "", catatan: "" },
            { id: "kimia_6_4", nama: "6.4 Enthalpy of Reaction", materi: "", gdriveUrl: "", catatan: "" },
            { id: "kimia_6_5", nama: "6.5 Calorimetry", materi: "", gdriveUrl: "", catatan: "" },
            { id: "kimia_6_6", nama: "6.6 Hess's Law", materi: "", gdriveUrl: "", catatan: "" },
            { id: "kimia_6_7", nama: "6.7 Enthalpies of Formation", materi: "", gdriveUrl: "", catatan: "" },
            { id: "kimia_6_8", nama: "6.8 Types of Solutions and Solubility", materi: "", gdriveUrl: "", catatan: "" },
            { id: "kimia_6_9", nama: "6.9 Foods and Fuels", materi: "", gdriveUrl: "", catatan: "" },
          ]},
          { id: "kimia_bab_7", nama: "7. Kinetics", materi: "", gdriveUrl: "", catatan: "", parts: [
            { id: "kimia_7_1", nama: "7.1 Chemical Reaction Rates", materi: "", gdriveUrl: "", catatan: "" },
            { id: "kimia_7_2", nama: "7.2 Factors Affecting Reaction Rates", materi: "", gdriveUrl: "", catatan: "" },
            { id: "kimia_7_3", nama: "7.3 Rate Laws", materi: "", gdriveUrl: "", catatan: "" },
            { id: "kimia_7_4", nama: "7.4 Integrated Rate Laws", materi: "", gdriveUrl: "", catatan: "" },
            { id: "kimia_7_5", nama: "7.5 Collision Theory", materi: "", gdriveUrl: "", catatan: "" },
            { id: "kimia_7_6", nama: "7.6 Reaction Mechanisms", materi: "", gdriveUrl: "", catatan: "" },
            { id: "kimia_7_7", nama: "7.7 Catalysis", materi: "", gdriveUrl: "", catatan: "" },
          ]},
          { id: "kimia_bab_8", nama: "8. Chemical Equilibrium", materi: "", gdriveUrl: "", catatan: "", parts: [
            { id: "kimia_8_1", nama: "8.1 Chemical Equilibria", materi: "", gdriveUrl: "", catatan: "" },
            { id: "kimia_8_2", nama: "8.2 Equilibrium Constants", materi: "", gdriveUrl: "", catatan: "" },
            { id: "kimia_8_3", nama: "8.3 Equilibrium Calculations", materi: "", gdriveUrl: "", catatan: "" },
            { id: "kimia_8_4", nama: "8.4 Shifting Equilibria - Le Chatelier's Principle", materi: "", gdriveUrl: "", catatan: "" },
          ]},
          { id: "kimia_bab_9", nama: "9. Acid-Base Equilibrium", materi: "", gdriveUrl: "", catatan: "", parts: [
            { id: "kimia_9_1", nama: "9.1 Brønsted-Lowry Acids and Bases", materi: "", gdriveUrl: "", catatan: "" },
            { id: "kimia_9_2", nama: "9.2 pH and pOH", materi: "", gdriveUrl: "", catatan: "" },
            { id: "kimia_9_3", nama: "9.3 Relative Strengths of Acids and Bases", materi: "", gdriveUrl: "", catatan: "" },
            { id: "kimia_9_4", nama: "9.4 Polyprotic Acids", materi: "", gdriveUrl: "", catatan: "" },
            { id: "kimia_9_5", nama: "9.5 Hydrolysis of Salt Solutions", materi: "", gdriveUrl: "", catatan: "" },
            { id: "kimia_9_6", nama: "9.6 Lewis Acids and Bases", materi: "", gdriveUrl: "", catatan: "" },
          ]},
          { id: "kimia_bab_10", nama: "10. Buffers, Titrations and Solubility Equilibria", materi: "", gdriveUrl: "", catatan: "", parts: [
            { id: "kimia_10_1", nama: "10.1 Acid-Base Buffers", materi: "", gdriveUrl: "", catatan: "" },
            { id: "kimia_10_2", nama: "10.2 Practical Aspects of Buffers", materi: "", gdriveUrl: "", catatan: "" },
            { id: "kimia_10_3", nama: "10.3 Acid-Base Titrations", materi: "", gdriveUrl: "", catatan: "" },
            { id: "kimia_10_4", nama: "10.4 Solving Titration Problems", materi: "", gdriveUrl: "", catatan: "" },
            { id: "kimia_10_5", nama: "10.5 Solubility Equilibria", materi: "", gdriveUrl: "", catatan: "" },
          ]},
          { id: "kimia_bab_11", nama: "11. Entropy and Free Energy", materi: "", gdriveUrl: "", catatan: "", parts: [
            { id: "kimia_11_1", nama: "11.1 Spontaneity", materi: "", gdriveUrl: "", catatan: "" },
            { id: "kimia_11_2", nama: "11.2 Entropy", materi: "", gdriveUrl: "", catatan: "" },
            { id: "kimia_11_3", nama: "11.3 The Second and Third Laws of Thermodynamics", materi: "", gdriveUrl: "", catatan: "" },
            { id: "kimia_11_4", nama: "11.4 Gibbs Free Energy", materi: "", gdriveUrl: "", catatan: "" },
          ]},
          { id: "kimia_bab_12", nama: "12. Electrochemistry", materi: "", gdriveUrl: "", catatan: "", parts: [
            { id: "kimia_12_1", nama: "12.1 Balancing Oxidation-Reduction Reactions", materi: "", gdriveUrl: "", catatan: "" },
            { id: "kimia_12_2", nama: "12.2 Galvanic Cells", materi: "", gdriveUrl: "", catatan: "" },
            { id: "kimia_12_3", nama: "12.3 Standard Reduction Potentials", materi: "", gdriveUrl: "", catatan: "" },
            { id: "kimia_12_4", nama: "12.4 The Nernst Equation", materi: "", gdriveUrl: "", catatan: "" },
            { id: "kimia_12_5", nama: "12.5 Batteries and Fuel Cells", materi: "", gdriveUrl: "", catatan: "" },
            { id: "kimia_12_6", nama: "12.6 Electrolysis", materi: "", gdriveUrl: "", catatan: "" },
          ]},
        ]},
      ]},
      { id: "material_struktur", nama: "🧱 Material & Struktur", tools: [
{ id: "material_teknik", nama: "Material Teknik", warna: "orange", fitur: [
  { id: "mt_bab_1", nama: "1. Introduction", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "mt_1_1", nama: "1.1 Historical Perspective", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_1_2", nama: "1.2 Materials Science and Engineering", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_1_3", nama: "1.3 Why Study Materials Science and Engineering?", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_1_4", nama: "1.4 Classification of Materials", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_1_5", nama: "1.5 Advanced Materials", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_1_6", nama: "1.6 Modern Materials' Needs", materi: "", gdriveUrl: "", catatan: "" },
  ]},
  { id: "mt_bab_2", nama: "2. Atomic Structure and Interatomic Bonding", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "mt_2_1", nama: "2.1 Atomic Structure", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_2_2", nama: "2.2 Electrons in Atoms", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_2_3", nama: "2.3 The Periodic Table", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_2_4", nama: "2.4 Bonding Forces and Energies", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_2_5", nama: "2.5 Primary Interatomic Bonds", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_2_6", nama: "2.6 Secondary Bonding or van der Waals Bonding", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_2_7", nama: "2.7 Mixed Bonding", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_2_8", nama: "2.8 Molecules", materi: "", gdriveUrl: "", catatan: "" },
  ]},
  { id: "mt_bab_3", nama: "3. The Structure of Crystalline Solids", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "mt_3_1", nama: "3.1 Fundamental Concepts", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_3_2", nama: "3.2 Unit Cells", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_3_3", nama: "3.3 Metallic Crystal Structures", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_3_4", nama: "3.4 Density Computations", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_3_5", nama: "3.5 Polymorphism and Allotropy", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_3_6", nama: "3.6 Crystal Systems", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_3_7", nama: "3.7 Point Coordinates", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_3_8", nama: "3.8 Crystallographic Directions", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_3_9", nama: "3.9 Crystallographic Planes", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_3_10", nama: "3.10 Linear and Planar Densities", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_3_11", nama: "3.11 Close-Packed Crystal Structures", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_3_12", nama: "3.12 Single Crystals", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_3_13", nama: "3.13 Polycrystalline Materials", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_3_14", nama: "3.14 Anisotropy", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_3_15", nama: "3.15 X-Ray Diffraction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_3_16", nama: "3.16 Noncrystalline Solids", materi: "", gdriveUrl: "", catatan: "" },
  ]},
  { id: "mt_bab_4", nama: "4. Imperfections in Solids", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "mt_4_1", nama: "4.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_4_2", nama: "4.2 Vacancies and Self-Interstitials", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_4_3", nama: "4.3 Impurities in Solids", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_4_4", nama: "4.4 Specification of Composition", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_4_5", nama: "4.5 Dislocations - Linear Defects", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_4_6", nama: "4.6 Interfacial Defects", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_4_7", nama: "4.7 Bulk or Volume Defects", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_4_8", nama: "4.8 Atomic Vibrations", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_4_9", nama: "4.9 Basic Concepts of Microscopy", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_4_10", nama: "4.10 Microscopic Techniques", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_4_11", nama: "4.11 Grain-Size Determination", materi: "", gdriveUrl: "", catatan: "" },
  ]},
  { id: "mt_bab_5", nama: "5. Diffusion", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "mt_5_1", nama: "5.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_5_2", nama: "5.2 Diffusion Mechanisms", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_5_3", nama: "5.3 Fick's First Law", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_5_4", nama: "5.4 Fick's Second Law - Nonsteady-State Diffusion", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_5_5", nama: "5.5 Factors That Influence Diffusion", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_5_6", nama: "5.6 Diffusion in Semiconducting Materials", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_5_7", nama: "5.7 Other Diffusion Paths", materi: "", gdriveUrl: "", catatan: "" },
  ]},
  { id: "mt_bab_6", nama: "6. Mechanical Properties of Metals", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "mt_6_1", nama: "6.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_6_2", nama: "6.2 Concepts of Stress and Strain", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_6_3", nama: "6.3 Stress-Strain Behavior", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_6_4", nama: "6.4 Anelasticity", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_6_5", nama: "6.5 Elastic Properties of Materials", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_6_6", nama: "6.6 Tensile Properties", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_6_7", nama: "6.7 True Stress and Strain", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_6_8", nama: "6.8 Elastic Recovery After Plastic Deformation", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_6_9", nama: "6.9 Compressive, Shear, and Torsional Deformations", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_6_10", nama: "6.10 Hardness", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_6_11", nama: "6.11 Variability of Material Properties", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_6_12", nama: "6.12 Design/Safety Factors", materi: "", gdriveUrl: "", catatan: "" },
  ]},
  { id: "mt_bab_7", nama: "7. Dislocations and Strengthening Mechanisms", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "mt_7_1", nama: "7.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_7_2", nama: "7.2 Basic Concepts", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_7_3", nama: "7.3 Characteristics of Dislocations", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_7_4", nama: "7.4 Slip Systems", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_7_5", nama: "7.5 Slip in Single Crystals", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_7_6", nama: "7.6 Plastic Deformation of Polycrystalline Materials", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_7_7", nama: "7.7 Deformation by Twinning", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_7_8", nama: "7.8 Strengthening by Grain Size Reduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_7_9", nama: "7.9 Solid-Solution Strengthening", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_7_10", nama: "7.10 Strain Hardening", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_7_11", nama: "7.11 Recovery", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_7_12", nama: "7.12 Recrystallization", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_7_13", nama: "7.13 Grain Growth", materi: "", gdriveUrl: "", catatan: "" },
  ]},
  { id: "mt_bab_8", nama: "8. Failure", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "mt_8_1", nama: "8.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_8_2", nama: "8.2 Fundamentals of Fracture", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_8_3", nama: "8.3 Ductile Fracture", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_8_4", nama: "8.4 Brittle Fracture", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_8_5", nama: "8.5 Principles of Fracture Mechanics", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_8_6", nama: "8.6 Fracture Toughness Testing", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_8_7", nama: "8.7 Cyclic Stresses", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_8_8", nama: "8.8 The S-N Curve", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_8_9", nama: "8.9 Crack Initiation and Propagation", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_8_10", nama: "8.10 Factors That Affect Fatigue Life", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_8_11", nama: "8.11 Environmental Effects", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_8_12", nama: "8.12 Generalized Creep Behavior", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_8_13", nama: "8.13 Stress and Temperature Effects", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_8_14", nama: "8.14 Data Extrapolation Methods", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_8_15", nama: "8.15 Alloys for High-Temperature Use", materi: "", gdriveUrl: "", catatan: "" },
  ]},
  { id: "mt_bab_9", nama: "9. Phase Diagrams", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "mt_9_1", nama: "9.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_9_2", nama: "9.2 Solubility Limit", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_9_3", nama: "9.3 Phases", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_9_4", nama: "9.4 Microstructure", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_9_5", nama: "9.5 Phase Equilibria", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_9_6", nama: "9.6 One-Component Phase Diagrams", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_9_7", nama: "9.7 Binary Isomorphous Systems", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_9_8", nama: "9.8 Interpretation of Phase Diagrams", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_9_9", nama: "9.9 Development of Microstructure in Isomorphous Alloys", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_9_10", nama: "9.10 Mechanical Properties of Isomorphous Alloys", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_9_11", nama: "9.11 Binary Eutectic Systems", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_9_12", nama: "9.12 Development of Microstructure in Eutectic Alloys", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_9_13", nama: "9.13 Equilibrium Diagrams Having Intermediate Phases", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_9_14", nama: "9.14 Eutectoid and Peritectic Reactions", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_9_15", nama: "9.15 Congruent Phase Transformations", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_9_16", nama: "9.16 Ceramic and Ternary Phase Diagrams", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_9_17", nama: "9.17 The Gibbs Phase Rule", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_9_18", nama: "9.18 The Iron-Iron Carbide Phase Diagram", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_9_19", nama: "9.19 Development of Microstructure in Iron-Carbon Alloys", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_9_20", nama: "9.20 The Influence of Other Alloying Elements", materi: "", gdriveUrl: "", catatan: "" },
  ]},
  { id: "mt_bab_10", nama: "10. Phase Transformations", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "mt_10_1", nama: "10.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_10_2", nama: "10.2 Basic Concepts", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_10_3", nama: "10.3 The Kinetics of Phase Transformations", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_10_4", nama: "10.4 Metastable Versus Equilibrium States", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_10_5", nama: "10.5 Isothermal Transformation Diagrams", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_10_6", nama: "10.6 Continuous-Cooling Transformation Diagrams", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_10_7", nama: "10.7 Mechanical Behavior of Iron-Carbon Alloys", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_10_8", nama: "10.8 Tempered Martensite", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_10_9", nama: "10.9 Review of Phase Transformations", materi: "", gdriveUrl: "", catatan: "" },
  ]},
  { id: "mt_bab_11", nama: "11. Applications and Processing of Metal Alloys", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "mt_11_1", nama: "11.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_11_2", nama: "11.2 Ferrous Alloys", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_11_3", nama: "11.3 Nonferrous Alloys", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_11_4", nama: "11.4 Forming Operations", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_11_5", nama: "11.5 Casting", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_11_6", nama: "11.6 Miscellaneous Techniques", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_11_7", nama: "11.7 Annealing Processes", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_11_8", nama: "11.8 Heat Treatment of Steels", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_11_9", nama: "11.9 Precipitation Hardening", materi: "", gdriveUrl: "", catatan: "" },
  ]},
  { id: "mt_bab_17", nama: "17. Corrosion and Degradation of Materials", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "mt_17_1", nama: "17.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_17_2", nama: "17.2 Electrochemical Considerations", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_17_3", nama: "17.3 Corrosion Rates", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_17_4", nama: "17.4 Prediction of Corrosion Rates", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_17_5", nama: "17.5 Passivity", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_17_6", nama: "17.6 Environmental Effects", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_17_7", nama: "17.7 Forms of Corrosion", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_17_8", nama: "17.8 Corrosion Environments", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_17_9", nama: "17.9 Corrosion Prevention", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_17_10", nama: "17.10 Oxidation", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_17_11", nama: "17.11 Corrosion of Ceramic Materials", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mt_17_12", nama: "17.12 Degradation of Polymers", materi: "", gdriveUrl: "", catatan: "" },
  ]},
  ]},
  { id: "struktur_properti_material", nama: "Struktur & Properti Material", warna: "orange", fitur: [
  { id: "sp_bab_1", nama: "1. Materials for Engineering", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "sp_1_1", nama: "1.1 The Material World", materi: "", gdriveUrl: "", catatan: "" },
    { id: "sp_1_2", nama: "1.2 Materials Science and Engineering", materi: "", gdriveUrl: "", catatan: "" },
    { id: "sp_1_3", nama: "1.3 Six Materials That Changed Your World", materi: "", gdriveUrl: "", catatan: "" },
    { id: "sp_1_4", nama: "1.4 Processing and Selecting Materials", materi: "", gdriveUrl: "", catatan: "" },
    { id: "sp_1_5", nama: "1.5 Looking at Materials by Powers of Ten", materi: "", gdriveUrl: "", catatan: "" },
  ]},
  { id: "sp_bab_2", nama: "2. Atomic Bonding", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "sp_2_1", nama: "2.1 Atomic Structure", materi: "", gdriveUrl: "", catatan: "" },
    { id: "sp_2_2", nama: "2.2 The Ionic Bond", materi: "", gdriveUrl: "", catatan: "" },
    { id: "sp_2_3", nama: "2.3 The Covalent Bond", materi: "", gdriveUrl: "", catatan: "" },
    { id: "sp_2_4", nama: "2.4 The Metallic Bond", materi: "", gdriveUrl: "", catatan: "" },
    { id: "sp_2_5", nama: "2.5 The Secondary, or van der Waals, Bond", materi: "", gdriveUrl: "", catatan: "" },
    { id: "sp_2_6", nama: "2.6 Materials—The Bonding Classification", materi: "", gdriveUrl: "", catatan: "" },
  ]},
  { id: "sp_bab_3", nama: "3. Crystalline Structure—Perfection", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "sp_3_1", nama: "3.1 Seven Systems and Fourteen Lattices", materi: "", gdriveUrl: "", catatan: "" },
    { id: "sp_3_2", nama: "3.2 Metal Structures", materi: "", gdriveUrl: "", catatan: "" },
    { id: "sp_3_3", nama: "3.3 Ceramic Structures", materi: "", gdriveUrl: "", catatan: "" },
    { id: "sp_3_4", nama: "3.4 Polymeric Structures", materi: "", gdriveUrl: "", catatan: "" },
    { id: "sp_3_5", nama: "3.5 Semiconductor Structures", materi: "", gdriveUrl: "", catatan: "" },
    { id: "sp_3_6", nama: "3.6 Lattice Positions, Directions, and Planes", materi: "", gdriveUrl: "", catatan: "" },
    { id: "sp_3_7", nama: "3.7 X-Ray Diffraction", materi: "", gdriveUrl: "", catatan: "" },
  ]},
  { id: "sp_bab_4", nama: "4. Crystal Defects and Noncrystalline Structure—Imperfection", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "sp_4_1", nama: "4.1 The Solid Solution—Chemical Imperfection", materi: "", gdriveUrl: "", catatan: "" },
    { id: "sp_4_2", nama: "4.2 Point Defects—Zero-Dimensional Imperfections", materi: "", gdriveUrl: "", catatan: "" },
    { id: "sp_4_3", nama: "4.3 Linear Defects, or Dislocations—One-Dimensional Imperfections", materi: "", gdriveUrl: "", catatan: "" },
    { id: "sp_4_4", nama: "4.4 Planar Defects—Two-Dimensional Imperfections", materi: "", gdriveUrl: "", catatan: "" },
    { id: "sp_4_5", nama: "4.5 Noncrystalline Solids—Three-Dimensional Imperfections", materi: "", gdriveUrl: "", catatan: "" },
  ]},
  { id: "sp_bab_5", nama: "5. Diffusion", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "sp_5_1", nama: "5.1 Thermally Activated Processes", materi: "", gdriveUrl: "", catatan: "" },
    { id: "sp_5_2", nama: "5.2 Thermal Production of Point Defects", materi: "", gdriveUrl: "", catatan: "" },
    { id: "sp_5_3", nama: "5.3 Point Defects and Solid-State Diffusion", materi: "", gdriveUrl: "", catatan: "" },
    { id: "sp_5_4", nama: "5.4 Steady-State Diffusion", materi: "", gdriveUrl: "", catatan: "" },
    { id: "sp_5_5", nama: "5.5 Alternate Diffusion Paths", materi: "", gdriveUrl: "", catatan: "" },
  ]},
  { id: "sp_bab_6", nama: "6. Mechanical Behavior", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "sp_6_1", nama: "6.1 Stress Versus Strain", materi: "", gdriveUrl: "", catatan: "" },
    { id: "sp_6_2", nama: "6.2 Elastic Deformation", materi: "", gdriveUrl: "", catatan: "" },
    { id: "sp_6_3", nama: "6.3 Plastic Deformation", materi: "", gdriveUrl: "", catatan: "" },
    { id: "sp_6_4", nama: "6.4 Hardness", materi: "", gdriveUrl: "", catatan: "" },
    { id: "sp_6_5", nama: "6.5 Creep and Stress Relaxation", materi: "", gdriveUrl: "", catatan: "" },
    { id: "sp_6_6", nama: "6.6 Viscoelastic Deformation", materi: "", gdriveUrl: "", catatan: "" },
  ]},
  { id: "sp_bab_7", nama: "7. Thermal Behavior", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "sp_7_1", nama: "7.1 Heat Capacity", materi: "", gdriveUrl: "", catatan: "" },
    { id: "sp_7_2", nama: "7.2 Thermal Expansion", materi: "", gdriveUrl: "", catatan: "" },
    { id: "sp_7_3", nama: "7.3 Thermal Conductivity", materi: "", gdriveUrl: "", catatan: "" },
    { id: "sp_7_4", nama: "7.4 Thermal Shock", materi: "", gdriveUrl: "", catatan: "" },
  ]},
  { id: "sp_bab_8", nama: "8. Failure Analysis and Prevention", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "sp_8_1", nama: "8.1 Impact Energy", materi: "", gdriveUrl: "", catatan: "" },
    { id: "sp_8_2", nama: "8.2 Fracture Toughness", materi: "", gdriveUrl: "", catatan: "" },
    { id: "sp_8_3", nama: "8.3 Fatigue", materi: "", gdriveUrl: "", catatan: "" },
    { id: "sp_8_4", nama: "8.4 Nondestructive Testing", materi: "", gdriveUrl: "", catatan: "" },
    { id: "sp_8_5", nama: "8.5 Failure Analysis and Prevention", materi: "", gdriveUrl: "", catatan: "" },
  ]},
  { id: "sp_bab_9", nama: "9. Phase Diagrams—Equilibrium Microstructural Development", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "sp_9_1", nama: "9.1 The Phase Rule", materi: "", gdriveUrl: "", catatan: "" },
    { id: "sp_9_2", nama: "9.2 The Phase Diagram", materi: "", gdriveUrl: "", catatan: "" },
    { id: "sp_9_3", nama: "9.3 The Lever Rule", materi: "", gdriveUrl: "", catatan: "" },
    { id: "sp_9_4", nama: "9.4 Microstructural Development During Slow Cooling", materi: "", gdriveUrl: "", catatan: "" },
  ]},
  { id: "sp_bab_10", nama: "10. Kinetics—Heat Treatment", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "sp_10_1", nama: "10.1 Time—The Third Dimension", materi: "", gdriveUrl: "", catatan: "" },
    { id: "sp_10_2", nama: "10.2 The TTT Diagram", materi: "", gdriveUrl: "", catatan: "" },
    { id: "sp_10_3", nama: "10.3 Hardenability", materi: "", gdriveUrl: "", catatan: "" },
    { id: "sp_10_4", nama: "10.4 Precipitation Hardening", materi: "", gdriveUrl: "", catatan: "" },
    { id: "sp_10_5", nama: "10.5 Annealing", materi: "", gdriveUrl: "", catatan: "" },
    { id: "sp_10_6", nama: "10.6 The Kinetics of Phase Transformations for Nonmetals", materi: "", gdriveUrl: "", catatan: "" },
  ]},
  { id: "sp_bab_11", nama: "11. Structural Materials—Metals, Ceramics, and Glasses", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "sp_11_1", nama: "11.1 Metals", materi: "", gdriveUrl: "", catatan: "" },
    { id: "sp_11_2", nama: "11.2 Ceramics and Glasses", materi: "", gdriveUrl: "", catatan: "" },
    { id: "sp_11_3", nama: "11.3 Processing the Structural Materials", materi: "", gdriveUrl: "", catatan: "" },
  ]},
  { id: "sp_bab_12", nama: "12. Structural Materials—Polymers and Composites", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "sp_12_1", nama: "12.1 Polymers", materi: "", gdriveUrl: "", catatan: "" },
    { id: "sp_12_2", nama: "12.2 Composites", materi: "", gdriveUrl: "", catatan: "" },
    { id: "sp_12_3", nama: "12.3 Processing the Structural Materials", materi: "", gdriveUrl: "", catatan: "" },
  ]},
  { id: "sp_bab_13", nama: "13. Electronic Materials", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "sp_13_1", nama: "13.1 Charge Carriers and Conduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "sp_13_2", nama: "13.2 Energy Levels and Energy Bands", materi: "", gdriveUrl: "", catatan: "" },
    { id: "sp_13_3", nama: "13.3 Conductors", materi: "", gdriveUrl: "", catatan: "" },
    { id: "sp_13_4", nama: "13.4 Insulators", materi: "", gdriveUrl: "", catatan: "" },
    { id: "sp_13_5", nama: "13.5 Semiconductors", materi: "", gdriveUrl: "", catatan: "" },
    { id: "sp_13_6", nama: "13.6 Composites", materi: "", gdriveUrl: "", catatan: "" },
    { id: "sp_13_7", nama: "13.7 Electrical Classification of Materials", materi: "", gdriveUrl: "", catatan: "" },
  ]},
  { id: "sp_bab_14", nama: "14. Optical and Magnetic Materials", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "sp_14_1", nama: "14.1 Optical Materials", materi: "", gdriveUrl: "", catatan: "" },
    { id: "sp_14_2", nama: "14.2 Magnetic Materials", materi: "", gdriveUrl: "", catatan: "" },
  ]},
  { id: "sp_bab_15", nama: "15. Materials in Engineering Design", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "sp_15_1", nama: "15.1 Material Properties—Engineering Design Parameters", materi: "", gdriveUrl: "", catatan: "" },
    { id: "sp_15_2", nama: "15.2 Selection of Structural Materials—Case Studies", materi: "", gdriveUrl: "", catatan: "" },
    { id: "sp_15_3", nama: "15.3 Selection of Electronic, Optical, and Magnetic Materials—Case Studies", materi: "", gdriveUrl: "", catatan: "" },
    { id: "sp_15_4", nama: "15.4 Materials and Our Environment", materi: "", gdriveUrl: "", catatan: "" },
  ]},
]},
{ id: "statika_struktur", nama: "Statika Struktur", warna: "red", fitur: [
  { id: "statika_bab_1", nama: "1. General Principles", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "statika_1_1", nama: "1.1 Mechanics", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_1_2", nama: "1.2 Fundamental Concepts", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_1_3", nama: "1.3 Units of Measurement", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_1_4", nama: "1.4 The International System of Units", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_1_5", nama: "1.5 Numerical Calculations", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_1_6", nama: "1.6 General Procedure for Analysis", materi: "", gdriveUrl: "", catatan: "" },
  ]},
  { id: "statika_bab_2", nama: "2. Force Vectors", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "statika_2_1", nama: "2.1 Scalars and Vectors", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_2_2", nama: "2.2 Vector Operations", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_2_3", nama: "2.3 Vector Addition of Forces", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_2_4", nama: "2.4 Addition of a System of Coplanar Forces", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_2_5", nama: "2.5 Cartesian Vectors", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_2_6", nama: "2.6 Addition of Cartesian Vectors", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_2_7", nama: "2.7 Position Vectors", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_2_8", nama: "2.8 Force Vector Directed Along a Line", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_2_9", nama: "2.9 Dot Product", materi: "", gdriveUrl: "", catatan: "" },
  ]},
  { id: "statika_bab_3", nama: "3. Equilibrium of a Particle", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "statika_3_1", nama: "3.1 Condition for the Equilibrium of a Particle", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_3_2", nama: "3.2 The Free-Body Diagram", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_3_3", nama: "3.3 Coplanar Force Systems", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_3_4", nama: "3.4 Three-Dimensional Force Systems", materi: "", gdriveUrl: "", catatan: "" },
  ]},
  { id: "statika_bab_4", nama: "4. Force System Resultants", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "statika_4_1", nama: "4.1 Moment of a Force - Scalar Formulation", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_4_2", nama: "4.2 Cross Product", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_4_3", nama: "4.3 Moment of a Force - Vector Formulation", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_4_4", nama: "4.4 Principle of Moments", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_4_5", nama: "4.5 Moment of a Force about a Specified Axis", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_4_6", nama: "4.6 Moment of a Couple", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_4_7", nama: "4.7 Simplification of a Force and Couple System", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_4_8", nama: "4.8 Further Simplification of a Force and Couple System", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_4_9", nama: "4.9 Reduction of a Simple Distributed Loading", materi: "", gdriveUrl: "", catatan: "" },
  ]},
  { id: "statika_bab_5", nama: "5. Equilibrium of a Rigid Body", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "statika_5_1", nama: "5.1 Conditions for Rigid-Body Equilibrium", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_5_2", nama: "5.2 Free-Body Diagrams", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_5_3", nama: "5.3 Equations of Equilibrium", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_5_4", nama: "5.4 Two- and Three-Force Members", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_5_5", nama: "5.5 Free-Body Diagrams (3D)", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_5_6", nama: "5.6 Equations of Equilibrium (3D)", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_5_7", nama: "5.7 Constraints and Statical Determinacy", materi: "", gdriveUrl: "", catatan: "" },
  ]},
  { id: "statika_bab_6", nama: "6. Structural Analysis", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "statika_6_1", nama: "6.1 Simple Trusses", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_6_2", nama: "6.2 The Method of Joints", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_6_3", nama: "6.3 Zero-Force Members", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_6_4", nama: "6.4 The Method of Sections", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_6_5", nama: "6.5 Space Trusses", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_6_6", nama: "6.6 Frames and Machines", materi: "", gdriveUrl: "", catatan: "" },
  ]},
  { id: "statika_bab_7", nama: "7. Internal Forces", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "statika_7_1", nama: "7.1 Internal Forces Developed in Structural Members", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_7_2", nama: "7.2 Shear and Moment Equations and Diagrams", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_7_3", nama: "7.3 Relations between Distributed Load, Shear, and Moment", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_7_4", nama: "7.4 Cables", materi: "", gdriveUrl: "", catatan: "" },
  ]},
  { id: "statika_bab_8", nama: "8. Friction", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "statika_8_1", nama: "8.1 Characteristics of Dry Friction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_8_2", nama: "8.2 Problems Involving Dry Friction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_8_3", nama: "8.3 Wedges", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_8_4", nama: "8.4 Frictional Forces on Screws", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_8_5", nama: "8.5 Frictional Forces on Flat Belts", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_8_6", nama: "8.6 Frictional Forces on Collar Bearings, Pivot Bearings, and Disks", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_8_7", nama: "8.7 Frictional Forces on Journal Bearings", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_8_8", nama: "8.8 Rolling Resistance", materi: "", gdriveUrl: "", catatan: "" },
  ]},
  { id: "statika_bab_9", nama: "9. Center of Gravity and Centroid", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "statika_9_1", nama: "9.1 Center of Gravity, Center of Mass, and the Centroid of a Body", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_9_2", nama: "9.2 Composite Bodies", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_9_3", nama: "9.3 Theorems of Pappus and Guldinus", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_9_4", nama: "9.4 Resultant of a General Distributed Loading", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_9_5", nama: "9.5 Fluid Pressure", materi: "", gdriveUrl: "", catatan: "" },
  ]},
  { id: "statika_bab_10", nama: "10. Moments of Inertia", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "statika_10_1", nama: "10.1 Definition of Moments of Inertia for Areas", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_10_2", nama: "10.2 Parallel-Axis Theorem for an Area", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_10_3", nama: "10.3 Radius of Gyration of an Area", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_10_4", nama: "10.4 Moments of Inertia for Composite Areas", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_10_5", nama: "10.5 Product of Inertia for an Area", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_10_6", nama: "10.6 Moments of Inertia for an Area about Inclined Axes", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_10_7", nama: "10.7 Mohr's Circle for Moments of Inertia", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_10_8", nama: "10.8 Mass Moment of Inertia", materi: "", gdriveUrl: "", catatan: "" },
  ]},
  { id: "statika_bab_11", nama: "11. Virtual Work", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "statika_11_1", nama: "11.1 Definition of Work", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_11_2", nama: "11.2 Principle of Virtual Work", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_11_3", nama: "11.3 Principle of Virtual Work for a System of Connected Rigid Bodies", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_11_4", nama: "11.4 Conservative Forces", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_11_5", nama: "11.5 Potential Energy", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_11_6", nama: "11.6 Potential-Energy Criterion for Equilibrium", materi: "", gdriveUrl: "", catatan: "" },
    { id: "statika_11_7", nama: "11.7 Stability of Equilibrium Configuration", materi: "", gdriveUrl: "", catatan: "" },
  ]},
]},        { id: "mekanika_kekuatan_material", nama: "Mekanika Kekuatan Material", warna: "red", fitur: [
  { id: "mkm_bab_1", nama: "1. Tension, Compression, and Shear", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "mkm_1_1", nama: "1.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_1_2", nama: "1.2 Normal Stress and Strain", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_1_3", nama: "1.3 Mechanical Properties of Materials", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_1_4", nama: "1.4 Elasticity, Plasticity, and Creep", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_1_5", nama: "1.5 Linear Elasticity, Hooke's Law, and Poisson's Ratio", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_1_6", nama: "1.6 Shear Stress and Strain", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_1_7", nama: "1.7 Allowable Stresses and Allowable Loads", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_1_8", nama: "1.8 Design for Axial Loads and Direct Shear", materi: "", gdriveUrl: "", catatan: "" },
  ]},
  { id: "mkm_bab_2", nama: "2. Axially Loaded Members", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "mkm_2_1", nama: "2.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_2_2", nama: "2.2 Changes in Lengths of Axially Loaded Members", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_2_3", nama: "2.3 Changes in Lengths under Nonuniform Conditions", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_2_4", nama: "2.4 Statically Indeterminate Structures", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_2_5", nama: "2.5 Thermal Effects, Misfits, and Prestrains", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_2_6", nama: "2.6 Stresses on Inclined Sections", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_2_7", nama: "2.7 Strain Energy", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_2_8", nama: "2.8 Impact Loading", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_2_9", nama: "2.9 Repeated Loading and Fatigue", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_2_10", nama: "2.10 Stress Concentrations", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_2_11", nama: "2.11 Nonlinear Behavior", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_2_12", nama: "2.12 Elastoplastic Analysis", materi: "", gdriveUrl: "", catatan: "" },
  ]},
  { id: "mkm_bab_3", nama: "3. Torsion", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "mkm_3_1", nama: "3.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_3_2", nama: "3.2 Torsional Deformations of a Circular Bar", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_3_3", nama: "3.3 Circular Bars and Tubes", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_3_4", nama: "3.4 Nonuniform Torsion", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_3_5", nama: "3.5 Pure Shear", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_3_6", nama: "3.6 Relationship Between Moduli of Elasticity E and G", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_3_7", nama: "3.7 Transmission of Power by Circular Shafts", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_3_8", nama: "3.8 Statically Indeterminate Torsional Members", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_3_9", nama: "3.9 Strain Energy in Torsion", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_3_10", nama: "3.10 Torsion of Noncircular Prismatic Shafts", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_3_11", nama: "3.11 Thin-Walled Tubes", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_3_12", nama: "3.12 Stress Concentrations in Torsion", materi: "", gdriveUrl: "", catatan: "" },
  ]},
  { id: "mkm_bab_4", nama: "4. Shear Forces and Bending Moments", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "mkm_4_1", nama: "4.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_4_2", nama: "4.2 Types of Beams, Loads, and Reactions", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_4_3", nama: "4.3 Shear Forces and Bending Moments", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_4_4", nama: "4.4 Relationships Between Loads, Shear Forces, and Bending Moments", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_4_5", nama: "4.5 Shear-Force and Bending-Moment Diagrams", materi: "", gdriveUrl: "", catatan: "" },
  ]},
  { id: "mkm_bab_5", nama: "5. Stresses in Beams (Basic Topics)", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "mkm_5_1", nama: "5.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_5_2", nama: "5.2 Pure Bending and Nonuniform Bending", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_5_3", nama: "5.3 Curvature of a Beam", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_5_4", nama: "5.4 Longitudinal Strains in Beams", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_5_5", nama: "5.5 Normal Stresses in Beams (Linearly Elastic)", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_5_6", nama: "5.6 Design of Beams for Bending Stresses", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_5_7", nama: "5.7 Nonprismatic Beams", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_5_8", nama: "5.8 Shear Stresses in Beams of Rectangular Cross Section", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_5_9", nama: "5.9 Shear Stresses in Beams of Circular Cross Section", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_5_10", nama: "5.10 Shear Stresses in Beams with Flanges", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_5_11", nama: "5.11 Built-Up Beams and Shear Flow", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_5_12", nama: "5.12 Beams with Axial Loads", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_5_13", nama: "5.13 Stress Concentrations in Bending", materi: "", gdriveUrl: "", catatan: "" },
  ]},
  { id: "mkm_bab_6", nama: "6. Stresses in Beams (Advanced Topics)", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "mkm_6_1", nama: "6.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_6_2", nama: "6.2 Composite Beams", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_6_3", nama: "6.3 Transformed-Section Method", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_6_4", nama: "6.4 Doubly Symmetric Beams with Inclined Loads", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_6_5", nama: "6.5 Bending of Unsymmetric Beams", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_6_6", nama: "6.6 The Shear-Center Concept", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_6_7", nama: "6.7 Shear Stresses in Beams of Thin-Walled Open Cross Sections", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_6_8", nama: "6.8 Shear Stresses in Wide-Flange Beams", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_6_9", nama: "6.9 Shear Centers of Thin-Walled Open Sections", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_6_10", nama: "6.10 Elastoplastic Bending", materi: "", gdriveUrl: "", catatan: "" },
  ]},
  { id: "mkm_bab_7", nama: "7. Analysis of Stress and Strain", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "mkm_7_1", nama: "7.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_7_2", nama: "7.2 Plane Stress", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_7_3", nama: "7.3 Principal Stresses and Maximum Shear Stresses", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_7_4", nama: "7.4 Mohr's Circle for Plane Stress", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_7_5", nama: "7.5 Hooke's Law for Plane Stress", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_7_6", nama: "7.6 Triaxial Stress", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_7_7", nama: "7.7 Plane Strain", materi: "", gdriveUrl: "", catatan: "" },
  ]},
  { id: "mkm_bab_8", nama: "8. Applications of Plane Stress", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "mkm_8_1", nama: "8.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_8_2", nama: "8.2 Spherical Pressure Vessels", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_8_3", nama: "8.3 Cylindrical Pressure Vessels", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_8_4", nama: "8.4 Maximum Stresses in Beams", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_8_5", nama: "8.5 Combined Loadings", materi: "", gdriveUrl: "", catatan: "" },
  ]},
  { id: "mkm_bab_9", nama: "9. Deflections of Beams", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "mkm_9_1", nama: "9.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_9_2", nama: "9.2 Differential Equations of the Deflection Curve", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_9_3", nama: "9.3 Deflection Formulas", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_9_4", nama: "9.4 Deflections by Integration of the Bending-Moment Equation", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_9_5", nama: "9.5 Method of Superposition", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_9_6", nama: "9.6 Moment-Area Method", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_9_7", nama: "9.7 Nonprismatic Beams", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_9_8", nama: "9.8 Strain Energy", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_9_9", nama: "9.9 Castigliano's Theorem", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_9_10", nama: "9.10 Deflections Produced by Impact", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_9_11", nama: "9.11 Temperature Effects", materi: "", gdriveUrl: "", catatan: "" },
  ]},
  { id: "mkm_bab_10", nama: "10. Statically Indeterminate Beams", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "mkm_10_1", nama: "10.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_10_2", nama: "10.2 Types of Statically Indeterminate Beams", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_10_3", nama: "10.3 Differential Equations of the Deflection Curve", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_10_4", nama: "10.4 Method of Superposition", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_10_5", nama: "10.5 Temperature Effects", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_10_6", nama: "10.6 Longitudinal Displacements at the Ends of Beams", materi: "", gdriveUrl: "", catatan: "" },
  ]},
  { id: "mkm_bab_11", nama: "11. Columns", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "mkm_11_1", nama: "11.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_11_2", nama: "11.2 Idealized Buckling Models", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_11_3", nama: "11.3 Critical Loads of Columns with Pinned Supports", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_11_4", nama: "11.4 Columns with Other Support Conditions", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_11_5", nama: "11.5 Columns with Eccentric Axial Loads", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_11_6", nama: "11.6 The Secant Formula", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_11_7", nama: "11.7 Design Formulas for Columns", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_11_8", nama: "11.8 Aluminum Columns", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_11_9", nama: "11.9 Wood Columns", materi: "", gdriveUrl: "", catatan: "" },
  ]},
  { id: "mkm_bab_12", nama: "12. Review of Centroids and Moments of Inertia", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "mkm_12_1", nama: "12.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_12_2", nama: "12.2 Centroids of Plane Areas", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_12_3", nama: "12.3 Centroids of Composite Areas", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_12_4", nama: "12.4 Moments of Inertia of Plane Areas", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_12_5", nama: "12.5 Parallel-Axis Theorem", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_12_6", nama: "12.6 Polar Moments of Inertia", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_12_7", nama: "12.7 Products of Inertia", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_12_8", nama: "12.8 Rotation of Axes", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mkm_12_9", nama: "12.9 Principal Axes, Principal Points, and Principal Moments of Inertia", materi: "", gdriveUrl: "", catatan: "" },
  ]},
]},
        { id: "karakterisasi_material", nama: "Karakterisasi Material", warna: "orange", fitur: [
          { id: "km_bab_1", nama: "1. Light Microscopy", materi: "", gdriveUrl: "", catatan: "", parts: [
            { id: "km_1_1", nama: "1.1 Optical Principles", materi: "", gdriveUrl: "", catatan: "" },
            { id: "km_1_2", nama: "1.2 Instrumentation", materi: "", gdriveUrl: "", catatan: "" },
            { id: "km_1_3", nama: "1.3 Specimen Preparation", materi: "", gdriveUrl: "", catatan: "" },
            { id: "km_1_4", nama: "1.4 Imaging Modes", materi: "", gdriveUrl: "", catatan: "" },
            { id: "km_1_5", nama: "1.5 Confocal Microscopy", materi: "", gdriveUrl: "", catatan: "" },
          ]},
          { id: "km_bab_2", nama: "2. X-ray Diffraction Methods", materi: "", gdriveUrl: "", catatan: "", parts: [
            { id: "km_2_1", nama: "2.1 X-ray Radiation", materi: "", gdriveUrl: "", catatan: "" },
            { id: "km_2_2", nama: "2.2 Theoretical Background of Diffraction", materi: "", gdriveUrl: "", catatan: "" },
            { id: "km_2_3", nama: "2.3 X-ray Diffractometry", materi: "", gdriveUrl: "", catatan: "" },
            { id: "km_2_4", nama: "2.4 Wide Angle X-ray Diffraction and Scattering", materi: "", gdriveUrl: "", catatan: "" },
          ]},
          { id: "km_bab_3", nama: "3. Transmission Electron Microscopy", materi: "", gdriveUrl: "", catatan: "", parts: [
            { id: "km_3_1", nama: "3.1 Instrumentation", materi: "", gdriveUrl: "", catatan: "" },
            { id: "km_3_2", nama: "3.2 Specimen Preparation", materi: "", gdriveUrl: "", catatan: "" },
            { id: "km_3_3", nama: "3.3 Image Modes", materi: "", gdriveUrl: "", catatan: "" },
            { id: "km_3_4", nama: "3.4 Selected Area Diffraction", materi: "", gdriveUrl: "", catatan: "" },
            { id: "km_3_5", nama: "3.5 Images of Crystal Defects", materi: "", gdriveUrl: "", catatan: "" },
          ]},
          { id: "km_bab_4", nama: "4. Scanning Electron Microscopy", materi: "", gdriveUrl: "", catatan: "", parts: [
            { id: "km_4_1", nama: "4.1 Instrumentation", materi: "", gdriveUrl: "", catatan: "" },
            { id: "km_4_2", nama: "4.2 Contrast Formation", materi: "", gdriveUrl: "", catatan: "" },
            { id: "km_4_3", nama: "4.3 Operational Variables", materi: "", gdriveUrl: "", catatan: "" },
            { id: "km_4_4", nama: "4.4 Specimen Preparation", materi: "", gdriveUrl: "", catatan: "" },
          ]},
          { id: "km_bab_5", nama: "5. Scanning Probe Microscopy", materi: "", gdriveUrl: "", catatan: "", parts: [
            { id: "km_5_1", nama: "5.1 Instrumentation", materi: "", gdriveUrl: "", catatan: "" },
            { id: "km_5_2", nama: "5.2 Scanning Tunneling Microscopy", materi: "", gdriveUrl: "", catatan: "" },
            { id: "km_5_3", nama: "5.3 Atomic Force Microscopy", materi: "", gdriveUrl: "", catatan: "" },
            { id: "km_5_4", nama: "5.4 Image Artifacts", materi: "", gdriveUrl: "", catatan: "" },
          ]},
          { id: "km_bab_6", nama: "6. X-ray Spectroscopy for Elemental Analysis", materi: "", gdriveUrl: "", catatan: "", parts: [
            { id: "km_6_1", nama: "6.1 Features of Characteristic X-rays", materi: "", gdriveUrl: "", catatan: "" },
            { id: "km_6_2", nama: "6.2 X-ray Fluorescence Spectrometry", materi: "", gdriveUrl: "", catatan: "" },
            { id: "km_6_3", nama: "6.3 EDS in Electron Microscopes", materi: "", gdriveUrl: "", catatan: "" },
            { id: "km_6_4", nama: "6.4 Qualitative and Quantitative Analysis", materi: "", gdriveUrl: "", catatan: "" },
          ]},
          { id: "km_bab_7", nama: "7. Electron Spectroscopy for Surface Analysis", materi: "", gdriveUrl: "", catatan: "", parts: [
            { id: "km_7_1", nama: "7.1 Basic Principles", materi: "", gdriveUrl: "", catatan: "" },
            { id: "km_7_2", nama: "7.2 Instrumentation", materi: "", gdriveUrl: "", catatan: "" },
            { id: "km_7_3", nama: "7.3 Characteristics of Electron Spectra", materi: "", gdriveUrl: "", catatan: "" },
            { id: "km_7_4", nama: "7.4 Qualitative and Quantitative Analysis", materi: "", gdriveUrl: "", catatan: "" },
          ]},
          { id: "km_bab_8", nama: "8. Secondary Ion Mass Spectrometry for Surface Analysis", materi: "", gdriveUrl: "", catatan: "", parts: [
            { id: "km_8_1", nama: "8.1 Basic Principles", materi: "", gdriveUrl: "", catatan: "" },
            { id: "km_8_2", nama: "8.2 Instrumentation", materi: "", gdriveUrl: "", catatan: "" },
            { id: "km_8_3", nama: "8.3 Surface Structure Analysis", materi: "", gdriveUrl: "", catatan: "" },
            { id: "km_8_4", nama: "8.4 SIMS Imaging", materi: "", gdriveUrl: "", catatan: "" },
            { id: "km_8_5", nama: "8.5 SIMS Depth Profiling", materi: "", gdriveUrl: "", catatan: "" },
          ]},
          { id: "km_bab_9", nama: "9. Vibrational Spectroscopy for Molecular Analysis", materi: "", gdriveUrl: "", catatan: "", parts: [
            { id: "km_9_1", nama: "9.1 Theoretical Background", materi: "", gdriveUrl: "", catatan: "" },
            { id: "km_9_2", nama: "9.2 Fourier Transform Infrared Spectroscopy", materi: "", gdriveUrl: "", catatan: "" },
            { id: "km_9_3", nama: "9.3 Raman Microscopy", materi: "", gdriveUrl: "", catatan: "" },
            { id: "km_9_4", nama: "9.4 Interpretation of Vibrational Spectra", materi: "", gdriveUrl: "", catatan: "" },
          ]},
          { id: "km_bab_10", nama: "10. Thermal Analysis", materi: "", gdriveUrl: "", catatan: "", parts: [
            { id: "km_10_1", nama: "10.1 Common Characteristics", materi: "", gdriveUrl: "", catatan: "" },
            { id: "km_10_2", nama: "10.2 Differential Thermal Analysis and Differential Scanning Calorimetry", materi: "", gdriveUrl: "", catatan: "" },
            { id: "km_10_3", nama: "10.3 Thermogravimetry", materi: "", gdriveUrl: "", catatan: "" },
          ]},
        ]},
      ]},
      { id: "mekanika_termofluida", nama: "⚙️ Mekanika & Termofluida", tools: [
        { id: "termodinamika", nama: "Termodinamika", warna: "blue", fitur: [
  { id: "td_bab_1", nama: "1. Introduction and Basic Concepts", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "td_1_1", nama: "1.1 Thermodynamics and Energy", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_1_2", nama: "1.2 Importance of Dimensions and Units", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_1_3", nama: "1.3 Systems and Control Volumes", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_1_4", nama: "1.4 Properties of a System", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_1_5", nama: "1.5 Density and Specific Gravity", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_1_6", nama: "1.6 State and Equilibrium", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_1_7", nama: "1.7 Processes and Cycles", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_1_8", nama: "1.8 Temperature and the Zeroth Law of Thermodynamics", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_1_9", nama: "1.9 Pressure", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_1_10", nama: "1.10 Pressure Measurement Devices", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_1_11", nama: "1.11 Problem-Solving Technique", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "td_bab_2", nama: "2. Energy, Energy Transfer, and General Energy Analysis", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "td_2_1", nama: "2.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_2_2", nama: "2.2 Forms of Energy", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_2_3", nama: "2.3 Energy Transfer by Heat", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_2_4", nama: "2.4 Energy Transfer by Work", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_2_5", nama: "2.5 Mechanical Forms of Work", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_2_6", nama: "2.6 The First Law of Thermodynamics", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_2_7", nama: "2.7 Energy Conversion Efficiencies", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_2_8", nama: "2.8 Energy and Environment", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "td_bab_3", nama: "3. Properties of Pure Substances", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "td_3_1", nama: "3.1 Pure Substance", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_3_2", nama: "3.2 Phases of a Pure Substance", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_3_3", nama: "3.3 Phase-Change Processes of Pure Substances", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_3_4", nama: "3.4 Property Diagrams for Phase-Change Processes", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_3_5", nama: "3.5 Property Tables", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_3_6", nama: "3.6 The Ideal-Gas Equation of State", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_3_7", nama: "3.7 Compressibility Factor", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_3_8", nama: "3.8 Other Equations of State", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "td_bab_4", nama: "4. Energy Analysis of Closed Systems", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "td_4_1", nama: "4.1 Moving Boundary Work", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_4_2", nama: "4.2 Energy Balance for Closed Systems", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_4_3", nama: "4.3 Specific Heats", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_4_4", nama: "4.4 Internal Energy, Enthalpy, and Specific Heats of Ideal Gases", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_4_5", nama: "4.5 Internal Energy, Enthalpy, and Specific Heats of Solids and Liquids", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "td_bab_5", nama: "5. Mass and Energy Analysis of Control Volumes", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "td_5_1", nama: "5.1 Conservation of Mass", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_5_2", nama: "5.2 Flow Work and the Energy of a Flowing Fluid", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_5_3", nama: "5.3 Energy Analysis of Steady-Flow Systems", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_5_4", nama: "5.4 Some Steady-Flow Engineering Devices", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_5_5", nama: "5.5 Energy Analysis of Unsteady-Flow Processes", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "td_bab_6", nama: "6. The Second Law of Thermodynamics", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "td_6_1", nama: "6.1 Introduction to the Second Law", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_6_2", nama: "6.2 Thermal Energy Reservoirs", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_6_3", nama: "6.3 Heat Engines", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_6_4", nama: "6.4 Refrigerators and Heat Pumps", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_6_5", nama: "6.5 Perpetual-Motion Machines", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_6_6", nama: "6.6 Reversible and Irreversible Processes", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_6_7", nama: "6.7 The Carnot Cycle", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_6_8", nama: "6.8 The Carnot Principles", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_6_9", nama: "6.9 The Thermodynamic Temperature Scale", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_6_10", nama: "6.10 The Carnot Heat Engine", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_6_11", nama: "6.11 The Carnot Refrigerator and Heat Pump", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "td_bab_7", nama: "7. Entropy", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "td_7_1", nama: "7.1 Entropy", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_7_2", nama: "7.2 The Increase of Entropy Principle", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_7_3", nama: "7.3 Entropy Change of Pure Substances", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_7_4", nama: "7.4 Isentropic Processes", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_7_5", nama: "7.5 Property Diagrams Involving Entropy", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_7_6", nama: "7.6 What is Entropy?", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_7_7", nama: "7.7 The T ds Relations", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_7_8", nama: "7.8 Entropy Change of Liquids and Solids", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_7_9", nama: "7.9 The Entropy Change of Ideal Gases", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_7_10", nama: "7.10 Reversible Steady-Flow Work", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_7_11", nama: "7.11 Minimizing the Compressor Work", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_7_12", nama: "7.12 Isentropic Efficiencies of Steady-Flow Devices", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_7_13", nama: "7.13 Entropy Balance", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "td_bab_8", nama: "8. Exergy", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "td_8_1", nama: "8.1 Exergy: Work Potential of Energy", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_8_2", nama: "8.2 Reversible Work and Irreversibility", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_8_3", nama: "8.3 Second-Law Efficiency", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_8_4", nama: "8.4 Exergy Change of a System", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_8_5", nama: "8.5 Exergy Transfer by Heat, Work, and Mass", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_8_6", nama: "8.6 The Decrease of Exergy Principle and Exergy Destruction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_8_7", nama: "8.7 Exergy Balance: Closed Systems", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_8_8", nama: "8.8 Exergy Balance: Control Volumes", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "td_bab_9", nama: "9. Gas Power Cycles", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "td_9_1", nama: "9.1 Basic Considerations in the Analysis of Power Cycles", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_9_2", nama: "9.2 The Carnot Cycle and Its Value in Engineering", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_9_3", nama: "9.3 Air-Standard Assumptions", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_9_4", nama: "9.4 An Overview of Reciprocating Engines", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_9_5", nama: "9.5 Otto Cycle: The Ideal Cycle for Spark-Ignition Engines", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_9_6", nama: "9.6 Diesel Cycle: The Ideal Cycle for Compression-Ignition Engines", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_9_7", nama: "9.7 Stirling and Ericsson Cycles", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_9_8", nama: "9.8 Brayton Cycle: The Ideal Cycle for Gas-Turbine Engines", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_9_9", nama: "9.9 The Brayton Cycle with Regeneration", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_9_10", nama: "9.10 The Brayton Cycle with Intercooling, Reheating, and Regeneration", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_9_11", nama: "9.11 Ideal Jet-Propulsion Cycles", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_9_12", nama: "9.12 Second-Law Analysis of Gas Power Cycles", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "td_bab_10", nama: "10. Vapor and Combined Power Cycles", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "td_10_1", nama: "10.1 The Carnot Vapor Cycle", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_10_2", nama: "10.2 Rankine Cycle: The Ideal Cycle for Vapor Power Cycles", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_10_3", nama: "10.3 Deviation of Actual Vapor Power Cycles from Idealized Ones", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_10_4", nama: "10.4 How Can We Increase the Efficiency of the Rankine Cycle?", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_10_5", nama: "10.5 The Ideal Reheat Rankine Cycle", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_10_6", nama: "10.6 The Ideal Regenerative Rankine Cycle", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_10_7", nama: "10.7 Second-Law Analysis of Vapor Power Cycles", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_10_8", nama: "10.8 Cogeneration", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_10_9", nama: "10.9 Combined Gas–Vapor Power Cycles", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "td_bab_11", nama: "11. Refrigeration Cycles", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "td_11_1", nama: "11.1 Refrigerators and Heat Pumps", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_11_2", nama: "11.2 The Reversed Carnot Cycle", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_11_3", nama: "11.3 The Ideal Vapor-Compression Refrigeration Cycle", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_11_4", nama: "11.4 Actual Vapor-Compression Refrigeration Cycle", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_11_5", nama: "11.5 Second-Law Analysis of Vapor-Compression Refrigeration Cycle", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_11_6", nama: "11.6 Selecting the Right Refrigerant", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_11_7", nama: "11.7 Heat Pump Systems", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_11_8", nama: "11.8 Innovative Vapor-Compression Refrigeration Systems", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_11_9", nama: "11.9 Gas Refrigeration Cycles", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_11_10", nama: "11.10 Absorption Refrigeration Systems", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "td_bab_12", nama: "12. Thermodynamic Property Relations", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "td_12_1", nama: "12.1 A Little Math—Partial Derivatives and Associated Relations", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_12_2", nama: "12.2 The Maxwell Relations", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_12_3", nama: "12.3 The Clapeyron Equation", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_12_4", nama: "12.4 General Relations for du, dh, ds, cv, and cp", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_12_5", nama: "12.5 The Joule-Thomson Coefficient", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_12_6", nama: "12.6 The Δh, Δu, and Δs of Real Gases", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "td_bab_13", nama: "13. Gas Mixtures", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "td_13_1", nama: "13.1 Composition of a Gas Mixture: Mass and Mole Fractions", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_13_2", nama: "13.2 P-v-T Behavior of Gas Mixtures: Ideal and Real Gases", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_13_3", nama: "13.3 Properties of Gas Mixtures: Ideal and Real Gases", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_13_4", nama: "13.4 Chemical Potential and the Separation Work of Mixtures", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "td_bab_14", nama: "14. Gas–Vapor Mixtures and Air-Conditioning", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "td_14_1", nama: "14.1 Dry and Atmospheric Air", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_14_2", nama: "14.2 Specific and Relative Humidity of Air", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_14_3", nama: "14.3 Dew-Point Temperature", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_14_4", nama: "14.4 Adiabatic Saturation and Wet-Bulb Temperatures", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_14_5", nama: "14.5 The Psychrometric Chart", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_14_6", nama: "14.6 Human Comfort and Air-Conditioning", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_14_7", nama: "14.7 Air-Conditioning Processes", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "td_bab_15", nama: "15. Chemical Reactions", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "td_15_1", nama: "15.1 Fuels and Combustion", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_15_2", nama: "15.2 Theoretical and Actual Combustion Processes", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_15_3", nama: "15.3 Enthalpy of Formation and Enthalpy of Combustion", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_15_4", nama: "15.4 First-Law Analysis of Reacting Systems", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_15_5", nama: "15.5 Adiabatic Flame Temperature", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_15_6", nama: "15.6 Entropy Change of Reacting Systems", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_15_7", nama: "15.7 Second-Law Analysis of Reacting Systems", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "td_bab_16", nama: "16. Chemical and Phase Equilibrium", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "td_16_1", nama: "16.1 Criterion for Chemical Equilibrium", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_16_2", nama: "16.2 The Equilibrium Constant for Ideal-Gas Mixtures", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_16_3", nama: "16.3 Some Remarks about the KP of Ideal-Gas Mixtures", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_16_4", nama: "16.4 Chemical Equilibrium for Simultaneous Reactions", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_16_5", nama: "16.5 Variation of KP with Temperature", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_16_6", nama: "16.6 Phase Equilibrium", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "td_bab_17", nama: "17. Compressible Flow", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "td_17_1", nama: "17.1 Stagnation Properties", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_17_2", nama: "17.2 Speed of Sound and Mach Number", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_17_3", nama: "17.3 One-Dimensional Isentropic Flow", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_17_4", nama: "17.4 Isentropic Flow Through Nozzles", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_17_5", nama: "17.5 Shock Waves and Expansion Waves", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_17_6", nama: "17.6 Duct Flow with Heat Transfer and Negligible Friction (Rayleigh Flow)", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_17_7", nama: "17.7 Steam Nozzles", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "td_bab_18", nama: "18. Renewable Energy (Web Chapter)", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "td_18_1", nama: "18.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_18_2", nama: "18.2 Solar Energy", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_18_3", nama: "18.3 Wind Energy", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_18_4", nama: "18.4 Hydropower", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_18_5", nama: "18.5 Geothermal Energy", materi: "", gdriveUrl: "", catatan: "" },
    { id: "td_18_6", nama: "18.6 Biomass Energy", materi: "", gdriveUrl: "", catatan: "" }
  ]}
]},
        { id: "perpindahan_kalor", nama: "Perpindahan Kalor", warna: "red", fitur: [
  { id: "pk_bab_1", nama: "1. Introduction", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "pk_1_1", nama: "1.1 Modes of Heat Transfer", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_1_2", nama: "1.2 Laws of Heat Transfer", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_1_3", nama: "1.3 Law of Conservation of Mass", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_1_4", nama: "1.4 Newton's Law of Motion", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_1_5", nama: "1.5 First Law of Thermodynamics", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_1_6", nama: "1.6 Second Law of Thermodynamics", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_1_7", nama: "1.7 Fourier's Law of Heat Conduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_1_8", nama: "1.8 Newton's Law of Cooling", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_1_9", nama: "1.9 Stefan-Boltzmann Law", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_1_10", nama: "1.10 Dimensional Formulae", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_1_11", nama: "1.11 Dimensionless Equations", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_1_12", nama: "1.12 Dimensional Analysis", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_1_13", nama: "1.13 Application of Dimensional Analysis for a Forced Convection Equation", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_1_14", nama: "1.14 Application of Dimensional Analysis for a Natural Convection Equation", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_1_15", nama: "1.15 Buckingham's π Theorem", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_1_16", nama: "1.16 Unit Systems", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_1_17", nama: "1.17 Basic SI Units", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_1_18", nama: "1.18 Conversion Factors to SI Units", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "pk_bab_2", nama: "2. Conduction", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "pk_2_1", nama: "2.1 Fourier's Law", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_2_2", nama: "2.2 Steady State Conduction through Plane Wall", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_2_3", nama: "2.3 Heat Flow through Composite Plane Wall", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_2_4", nama: "2.4 Heat Flow through a Hollow Cylinder", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_2_5", nama: "2.5 Heat Flow through a Sphere", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_2_6", nama: "2.6 Electrical Analogy of Heat Conduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_2_7", nama: "2.7 Systems with Variable Thermal Conductivity", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_2_8", nama: "2.8 Plane Wall with Variable k", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_2_9", nama: "2.9 Flat Plane with Variable k", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_2_10", nama: "2.10 Hollow Cylinder with Variable k", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_2_11", nama: "2.11 Hollow Sphere with Variable k", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_2_12", nama: "2.12 Temperature Distribution through Plane Wall", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_2_13", nama: "2.13 Thermal Resistance of a Composite Wall (Bounded by Fluids)", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_2_14", nama: "2.14 Thermal Resistance of a Composite Cylinder (Bounded by Fluids)", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_2_15", nama: "2.15 Thermal Insulation", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_2_16", nama: "2.16 Optimum Thickness of Insulation", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_2_17", nama: "2.17 Critical Radius of Insulation for Pipe (Cylinder)", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_2_18", nama: "2.18 Critical Radius of Insulation for Insulated Sphere", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_2_19", nama: "2.19 Differential Equation for One-Dimensional Heat Conduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_2_20", nama: "2.20 Differential Heat Conduction Equation in Cartesian Coordinates", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_2_21", nama: "2.21 Different Forms of the Differential Equation", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_2_22", nama: "2.22 Differential Heat Conduction Equation in Cylindrical Coordinates", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_2_23", nama: "2.23 Internal Temperature Gradient", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_2_24", nama: "2.24 Systems with Negligible ITG / Lumped Heat Capacity Analysis", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_2_25", nama: "2.25 Biot and Fourier's Number", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_2_26", nama: "2.26 Physical Significance of Biot and Fourier's Numbers", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_2_27", nama: "2.27 Varying Surrounding Fluid Temperature", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_2_28", nama: "2.28 Response Time of a Temperature Measuring Instrument", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_2_29", nama: "2.29 Extended Surfaces - Fins", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_2_30", nama: "2.30 Classification of Extended Surfaces", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_2_31", nama: "2.31 Effectiveness of Fin", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_2_32", nama: "2.32 Efficiency of Fin", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_2_33", nama: "2.33 Analysis of Rectangular Fin of Uniform Cross Section", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_2_34", nama: "2.34 Infinitely Long Fin", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_2_35", nama: "2.35 Fin with Insulated End", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_2_36", nama: "2.36 Fin with Convection off the End", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_2_37", nama: "2.37 Pin Fin of Uniform Cross Section", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_2_38", nama: "2.38 Heat Flow through Finned System", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "pk_bab_3", nama: "3. Convection", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "pk_3_1", nama: "3.1 Classification of Convection", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_3_2", nama: "3.2 Examples of Natural Convection and Forced Convection", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_3_3", nama: "3.3 Individual and Overall Heat Transfer Coefficients", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_3_4", nama: "3.4 Fouling Factor", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_3_5", nama: "3.5 Resistance Form of Overall Coefficient", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_3_6", nama: "3.6 Magnitude of Film Heat Transfer Coefficients", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_3_7", nama: "3.7 Approximate Range of Values of Overall Heat Transfer Coefficients, U", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_3_8", nama: "3.8 Classification of Heat Transfer Coefficients", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_3_9", nama: "3.9 Flow Arrangement in Heat Exchanger", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_3_10", nama: "3.10 Counter-Current Flow v/s Co-Current Flow", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_3_11", nama: "3.11 Energy Balances", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_3_12", nama: "3.12 Sensible Heat", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_3_13", nama: "3.13 Latent Heat", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_3_14", nama: "3.14 Heat Flux", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_3_15", nama: "3.15 Concept of Log Mean Temperature Difference and its Derivation", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_3_16", nama: "3.16 LMTD for Counter Current Flow", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_3_17", nama: "3.17 LMTD for Parallel/Co-Current Flow", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_3_18", nama: "3.18 Application of Dimensional Analysis to Heat Transfer by Convection", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_3_19", nama: "3.19 Hydrodynamic/Velocity Boundary Layer", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_3_20", nama: "3.20 Boundary Layer Formation in Straight Pipes", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_3_21", nama: "3.21 The Differential Equation of Continuity in Cartesian Coordinates", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_3_22", nama: "3.22 Forced Convection: Laminar Boundary Layer over a Flat Plate", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_3_23", nama: "3.23 The Differential Equation of Heat Convection in Cartesian Coordinates", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_3_24", nama: "3.24 The Thermal Boundary Layer", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_3_25", nama: "3.25 Heat Transfer in Laminar Boundary Layer / Laminar Flow over a Flat Plate", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_3_26", nama: "3.26 Turbulent Boundary Layer Calculations", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_3_27", nama: "3.27 Heat Transfer in Turbulent Flow over a Flat Plate", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_3_28", nama: "3.28 Empirical Correlations for Flow Across Cylinders and Spheres", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_3_29", nama: "3.29 Flow Across Cylinders", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_3_30", nama: "3.30 Non-Circular Cylinders", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_3_31", nama: "3.31 Spheres", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_3_32", nama: "3.32 Empirical Equations for Laminar and Turbulent Flow in Forced Convection (Dittus-Boelter and Sieder-Tate Equations)", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_3_33", nama: "3.33 Film Coefficients in Pipes - Laminar Flow", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_3_34", nama: "3.34 Film Coefficients in Pipes - Turbulent Flow", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_3_35", nama: "3.35 Turbulent Flow of Gases", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_3_36", nama: "3.36 Flow in Non-Circular Cross-Sections", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_3_37", nama: "3.37 The Colburn Analogy; Colburn j Factor", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_3_38", nama: "3.38 Film Coefficients in Pipes - in Transition Region", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_3_39", nama: "3.39 Wilson Plot", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_3_40", nama: "3.40 Natural Convection", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_3_41", nama: "3.41 Empirical Correlations for Natural Convection", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_3_42", nama: "3.42 Vertical Plates and Vertical Cylinders", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_3_43", nama: "3.43 Horizontal Cylinders", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_3_44", nama: "3.44 Horizontal Plates", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_3_45", nama: "3.45 Spheres", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_3_46", nama: "3.46 Boiling", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_3_47", nama: "3.47 Heat Transfer to Boiling Liquids", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_3_48", nama: "3.48 Pool Boiling of Saturated Liquid", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_3_49", nama: "3.49 Correlations in Pool Boiling Heat Transfer", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_3_50", nama: "3.50 Nucleate Saturated Pool Boiling", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_3_51", nama: "3.51 Peak Heat Flux in Nucleate Pool Boiling", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_3_52", nama: "3.52 Stable Film Pool Boiling", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_3_53", nama: "3.53 Simplified Relations for Boiling Heat Transfer for Water", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_3_54", nama: "3.54 Condensation", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_3_55", nama: "3.55 Heat Transfer in Condensation of Vapours", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_3_56", nama: "3.56 Drop-wise Condensation", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_3_57", nama: "3.57 Film-wise Condensation", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_3_58", nama: "3.58 Effect of Non-Condensable Gases", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_3_59", nama: "3.59 Difference between Drop-wise and Film-wise Condensation", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_3_60", nama: "3.60 Condensation on a Vertical Plate: Nusselt's Theory", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_3_61", nama: "3.61 Dimensionless Form of the Nusselt Equation", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "pk_bab_4", nama: "4. Radiation", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "pk_4_1", nama: "4.1 Introduction to Radiation", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_4_2", nama: "4.2 Absorptivity, Reflectivity, Transmissivity", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_4_3", nama: "4.3 Black Body", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_4_4", nama: "4.4 Kirchhoff's Law", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_4_5", nama: "4.5 Emissive Power and Emissivity", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_4_6", nama: "4.6 Monochromatic Emissive Power", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_4_7", nama: "4.7 Total Emissive Power", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_4_8", nama: "4.8 Monochromatic Emissivity", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_4_9", nama: "4.9 Grey Body", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_4_10", nama: "4.10 Stefan-Boltzmann Law", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_4_11", nama: "4.11 Planck's Law", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_4_12", nama: "4.12 Wien's Displacement Law", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_4_13", nama: "4.13 Concept of a Black Body", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_4_14", nama: "4.14 Exchange of Energy between Two Parallel Planes (Multiple Reflection Method)", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_4_15", nama: "4.15 Radiation Shields", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_4_16", nama: "4.16 Radiation Shape Factor", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_4_17", nama: "4.17 Electrical Network Analogy and Radiation Systems", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_4_18", nama: "4.18 Radiosity-Irradiation Approach", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_4_19", nama: "4.19 Radiosity, Irradiation", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_4_20", nama: "4.20 Radiation Network for Two Surfaces which See Each Other and Nothing Else", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_4_21", nama: "4.21 Radiation Network for Three Surfaces", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_4_22", nama: "4.22 Radiation Network for Two Parallel Surfaces Separated by One Radiation Shield", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_4_23", nama: "4.23 Radiation Network for Cylinders Separated by Cylindrical Radiation Shield", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "pk_bab_5", nama: "5. Heat Exchangers", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "pk_5_1", nama: "5.1 Definitions of Cooler, Condenser, Chiller, Evaporator, Vaporiser and Reboiler Heat Exchanger", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_5_2", nama: "5.2 Double Pipe Heat Exchanger", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_5_3", nama: "5.3 Shell and Tube Heat Exchanger", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_5_4", nama: "5.4 Tubes", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_5_5", nama: "5.5 Tube Pitch", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_5_6", nama: "5.6 Clearance", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_5_7", nama: "5.7 Baffles", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_5_8", nama: "5.8 Tube Sheet", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_5_9", nama: "5.9 Shell Side and Tube Side Passes", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_5_10", nama: "5.10 Difference between Single Pass and Multipass Heat Exchanger", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_5_11", nama: "5.11 Classification of Shell and Tube Heat Exchangers", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_5_12", nama: "5.12 Fixed Tube Sheet Exchanger", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_5_13", nama: "5.13 Fixed Tube Sheet 1-2 Shell and Tube Heat Exchanger", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_5_14", nama: "5.14 Removable-Bundle Heat Exchanger", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_5_15", nama: "5.15 Internal Floating Head Heat Exchanger", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_5_16", nama: "5.16 U-Tube Heat Exchanger", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_5_17", nama: "5.17 Kettler Reboilers/Reboiler Exchanger", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_5_18", nama: "5.18 Finned Tube Heat Exchanger", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_5_19", nama: "5.19 Plate Type Heat Exchanger", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_5_20", nama: "5.20 Scrapped Surface Heat Exchanger", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_5_21", nama: "5.21 Graphite Block Heat Exchanger", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_5_22", nama: "5.22 Heat Transfer in Agitated Vessel", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_5_23", nama: "5.23 Calculation of a Double Pipe Heat Exchanger", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_5_24", nama: "5.24 Calculation of Shell and Tube Heat Exchanger", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_5_25", nama: "5.25 Effectiveness - NTU Method", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_5_26", nama: "5.26 Effectiveness", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_5_27", nama: "5.27 Capacity Ratio", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_5_28", nama: "5.28 NTU", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "pk_bab_6", nama: "6. Evaporation", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "pk_6_1", nama: "6.1 Objective of Evaporation", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_6_2", nama: "6.2 Properties of Evaporating Fluids Influencing Process of Evaporation", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_6_3", nama: "6.3 Performance of Tubular Evaporators", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_6_4", nama: "6.4 Capacity", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_6_5", nama: "6.5 Steam Economy", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_6_6", nama: "6.6 Methods of Increasing Economy", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_6_7", nama: "6.7 Boiling Point Elevation", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_6_8", nama: "6.8 Duhring's Rule", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_6_9", nama: "6.9 Material and Enthalpy Balances for Single-Effect Evaporator", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_6_10", nama: "6.10 Evaporator Types", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_6_11", nama: "6.11 Open Pan Evaporator / Jacketed Pan Evaporator", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_6_12", nama: "6.12 Horizontal Tube Evaporator", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_6_13", nama: "6.13 Calendria-Type / Standard Vertical Tube Evaporator / Short Tube Evaporator", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_6_14", nama: "6.14 Long Tube Vertical Evaporator", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_6_15", nama: "6.15 Forced Circulation Evaporators", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_6_16", nama: "6.16 Forced Circulation Evaporators with a Horizontal External Heating Element", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_6_17", nama: "6.17 Multiple-Effect Evaporation", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_6_18", nama: "6.18 Forward Feed", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_6_19", nama: "6.19 Backward Feed", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_6_20", nama: "6.20 Mixed Feed", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_6_21", nama: "6.21 Comparison of Forward Feed and Backward Feed Arrangements", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_6_22", nama: "6.22 Vapour Recompression", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_6_23", nama: "6.23 Mechanical Recompression", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_6_24", nama: "6.24 Thermal Recompression", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_6_25", nama: "6.25 Choice of Steam Pressure", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_6_26", nama: "6.26 Pressure in the Vapour Space", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_6_27", nama: "6.27 Evaporator Accessories", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pk_6_28", nama: "6.28 Materials of Construction for Evaporators", materi: "", gdriveUrl: "", catatan: "" }
  ]}
]},
        { id: "mekanika_fluida", nama: "Mekanika Fluida", warna: "cyan", fitur: [
  { id: "mf_bab_1", nama: "1. Introduction and Basic Concepts", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "mf_1_1", nama: "1.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_1_2", nama: "1.2 The No-Slip Condition", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_1_3", nama: "1.3 A Brief History of Fluid Mechanics", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_1_4", nama: "1.4 Classification of Fluid Flows", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_1_5", nama: "1.5 System and Control Volume", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_1_6", nama: "1.6 Importance of Dimensions and Units", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_1_7", nama: "1.7 Mathematical Modeling of Engineering Problems", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_1_8", nama: "1.8 Problem-Solving Technique", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_1_9", nama: "1.9 Engineering Software Packages", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_1_10", nama: "1.10 Accuracy, Precision, and Significant Digits", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "mf_bab_2", nama: "2. Properties of Fluids", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "mf_2_1", nama: "2.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_2_2", nama: "2.2 Density and Specific Gravity", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_2_3", nama: "2.3 Vapor Pressure and Cavitation", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_2_4", nama: "2.4 Energy and Specific Heats", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_2_5", nama: "2.5 Coefficient of Compressibility", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_2_6", nama: "2.6 Viscosity", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_2_7", nama: "2.7 Surface Tension and Capillary Effect", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "mf_bab_3", nama: "3. Pressure and Fluid Statics", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "mf_3_1", nama: "3.1 Pressure", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_3_2", nama: "3.2 The Manometer", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_3_3", nama: "3.3 The Barometer and Atmospheric Pressure", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_3_4", nama: "3.4 Introduction to Fluid Statics", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_3_5", nama: "3.5 Hydrostatic Forces on Submerged Plane Surfaces", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_3_6", nama: "3.6 Hydrostatic Forces on Submerged Curved Surfaces", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_3_7", nama: "3.7 Buoyancy and Stability", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_3_8", nama: "3.8 Fluids in Rigid-Body Motion", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "mf_bab_4", nama: "4. Fluid Kinematics", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "mf_4_1", nama: "4.1 Lagrangian and Eulerian Descriptions", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_4_2", nama: "4.2 Fundamentals of Flow Visualization", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_4_3", nama: "4.3 Plots of Fluid Flow Data", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_4_4", nama: "4.4 Other Kinematic Descriptions", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_4_5", nama: "4.5 The Reynolds Transport Theorem", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "mf_bab_5", nama: "5. Mass, Bernoulli, and Energy Equations", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "mf_5_1", nama: "5.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_5_2", nama: "5.2 Conservation of Mass", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_5_3", nama: "5.3 Mechanical Energy and Efficiency", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_5_4", nama: "5.4 The Bernoulli Equation", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_5_5", nama: "5.5 Applications of the Bernoulli Equation", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_5_6", nama: "5.6 General Energy Equation", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_5_7", nama: "5.7 Energy Analysis of Steady Flows", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "mf_bab_6", nama: "6. Momentum Analysis of Flow Systems", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "mf_6_1", nama: "6.1 Newton's Laws and Conservation of Momentum", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_6_2", nama: "6.2 Choosing a Control Volume", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_6_3", nama: "6.3 Forces Acting on a Control Volume", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_6_4", nama: "6.4 The Linear Momentum Equation", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_6_5", nama: "6.5 Review of Rotational Motion and Angular Momentum", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_6_6", nama: "6.6 The Angular Momentum Equation", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "mf_bab_7", nama: "7. Dimensional Analysis and Modeling", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "mf_7_1", nama: "7.1 Dimensions and Units", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_7_2", nama: "7.2 Dimensional Homogeneity", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_7_3", nama: "7.3 Dimensional Analysis and Similarity", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_7_4", nama: "7.4 The Method of Repeating Variables and the Buckingham Pi Theorem", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_7_5", nama: "7.5 Experimental Testing and Incomplete Similarity", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "mf_bab_8", nama: "8. Flow in Pipes", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "mf_8_1", nama: "8.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_8_2", nama: "8.2 Laminar and Turbulent Flows", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_8_3", nama: "8.3 The Entrance Region", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_8_4", nama: "8.4 Laminar Flow in Pipes", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_8_5", nama: "8.5 Turbulent Flow in Pipes", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_8_6", nama: "8.6 Minor Losses", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_8_7", nama: "8.7 Piping Networks and Pump Selection", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_8_8", nama: "8.8 Flow Rate and Velocity Measurement", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "mf_bab_9", nama: "9. Differential Analysis of Fluid Flow", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "mf_9_1", nama: "9.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_9_2", nama: "9.2 Conservation of Mass - The Continuity Equation", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_9_3", nama: "9.3 The Stream Function", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_9_4", nama: "9.4 Conservation of Linear Momentum - Cauchy's Equation", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_9_5", nama: "9.5 The Navier-Stokes Equation", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_9_6", nama: "9.6 Differential Analysis of Fluid Flow Problems", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "mf_bab_10", nama: "10. Approximate Solutions of the Navier-Stokes Equation", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "mf_10_1", nama: "10.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_10_2", nama: "10.2 Nondimensionalized Equations of Motion", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_10_3", nama: "10.3 The Creeping Flow Approximation", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_10_4", nama: "10.4 Approximation for Inviscid Regions of Flow", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_10_5", nama: "10.5 The Irrotational Flow Approximation", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_10_6", nama: "10.6 The Boundary Layer Approximation", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "mf_bab_11", nama: "11. Flow Over Bodies: Drag and Lift", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "mf_11_1", nama: "11.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_11_2", nama: "11.2 Drag and Lift", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_11_3", nama: "11.3 Friction and Pressure Drag", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_11_4", nama: "11.4 Drag Coefficients of Common Geometries", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_11_5", nama: "11.5 Parallel Flow over Flat Plates", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_11_6", nama: "11.6 Flow over Cylinders and Spheres", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_11_7", nama: "11.7 Lift", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "mf_bab_12", nama: "12. Compressible Flow", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "mf_12_1", nama: "12.1 Stagnation Properties", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_12_2", nama: "12.2 Speed of Sound and Mach Number", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_12_3", nama: "12.3 One-Dimensional Isentropic Flow", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_12_4", nama: "12.4 Isentropic Flow through Nozzles", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_12_5", nama: "12.5 Shock Waves and Expansion Waves", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_12_6", nama: "12.6 Duct Flow with Heat Transfer and Negligible Friction (Rayleigh Flow)", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_12_7", nama: "12.7 Adiabatic Duct Flow with Friction (Fanno Flow)", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "mf_bab_13", nama: "13. Open-Channel Flow", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "mf_13_1", nama: "13.1 Classification of Open-Channel Flows", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_13_2", nama: "13.2 Froude Number and Wave Speed", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_13_3", nama: "13.3 Specific Energy", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_13_4", nama: "13.4 Continuity and Energy Equations", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_13_5", nama: "13.5 Uniform Flow in Channels", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_13_6", nama: "13.6 Best Hydraulic Cross Sections", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_13_7", nama: "13.7 Gradually Varied Flow", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_13_8", nama: "13.8 Rapidly Varied Flow and Hydraulic Jump", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_13_9", nama: "13.9 Flow Control and Measurement", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "mf_bab_14", nama: "14. Turbomachinery", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "mf_14_1", nama: "14.1 Classifications and Terminology", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_14_2", nama: "14.2 Pumps", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_14_3", nama: "14.3 Pump Scaling Laws", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_14_4", nama: "14.4 Turbines", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_14_5", nama: "14.5 Turbine Scaling Laws", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "mf_bab_15", nama: "15. Introduction to Computational Fluid Dynamics", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "mf_15_1", nama: "15.1 Introduction and Fundamentals", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_15_2", nama: "15.2 Laminar CFD Calculations", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_15_3", nama: "15.3 Turbulent CFD Calculations", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_15_4", nama: "15.4 CFD with Heat Transfer", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_15_5", nama: "15.5 Compressible Flow CFD Calculations", materi: "", gdriveUrl: "", catatan: "" },
    { id: "mf_15_6", nama: "15.6 Open-Channel Flow CFD Calculations", materi: "", gdriveUrl: "", catatan: "" }
  ]}
]},
        { id: "getaran_mekanik", nama: "Getaran Mekanik", warna: "purple", fitur: [
  { id: "gm_bab_1", nama: "1. Fundamentals of Vibration", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "gm_1_1", nama: "1.1 Preliminary Remarks", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_1_2", nama: "1.2 Brief History of the Study of Vibration", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_1_3", nama: "1.3 Importance of the Study of Vibration", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_1_4", nama: "1.4 Basic Concepts of Vibration", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_1_5", nama: "1.5 Classification of Vibration", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_1_6", nama: "1.6 Vibration Analysis Procedure", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_1_7", nama: "1.7 Spring Elements", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_1_8", nama: "1.8 Mass or Inertia Elements", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_1_9", nama: "1.9 Damping Elements", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_1_10", nama: "1.10 Harmonic Motion", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_1_11", nama: "1.11 Harmonic Analysis", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_1_12", nama: "1.12 Examples Using MATLAB", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_1_13", nama: "1.13 Vibration Literature", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "gm_bab_2", nama: "2. Free Vibration of Single-Degree-of-Freedom Systems", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "gm_2_1", nama: "2.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_2_2", nama: "2.2 Free Vibration of an Undamped Translational System", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_2_3", nama: "2.3 Free Vibration of an Undamped Torsional System", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_2_4", nama: "2.4 Response of First-Order Systems and Time Constant", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_2_5", nama: "2.5 Rayleigh's Energy Method", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_2_6", nama: "2.6 Free Vibration with Viscous Damping", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_2_7", nama: "2.7 Graphical Representation of Characteristic Roots and Corresponding Solutions", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_2_8", nama: "2.8 Parameter Variations and Root Locus Representations", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_2_9", nama: "2.9 Free Vibration with Coulomb Damping", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_2_10", nama: "2.10 Free Vibration with Hysteretic Damping", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_2_11", nama: "2.11 Stability of Systems", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_2_12", nama: "2.12 Examples Using MATLAB", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "gm_bab_3", nama: "3. Harmonically Excited Vibration", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "gm_3_1", nama: "3.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_3_2", nama: "3.2 Equation of Motion", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_3_3", nama: "3.3 Response of an Undamped System Under Harmonic Force", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_3_4", nama: "3.4 Response of a Damped System Under Harmonic Force", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_3_5", nama: "3.5 Response of a Damped System Under F(t) = F0 e^(iωt)", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_3_6", nama: "3.6 Response of a Damped System Under the Harmonic Motion of the Base", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_3_7", nama: "3.7 Response of a Damped System Under Rotating Unbalance", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_3_8", nama: "3.8 Forced Vibration with Coulomb Damping", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_3_9", nama: "3.9 Forced Vibration with Hysteresis Damping", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_3_10", nama: "3.10 Forced Motion with Other Types of Damping", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_3_11", nama: "3.11 Self-Excitation and Stability Analysis", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_3_12", nama: "3.12 Transfer-Function Approach", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_3_13", nama: "3.13 Solutions Using Laplace Transforms", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_3_14", nama: "3.14 Frequency Transfer Functions", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_3_15", nama: "3.15 Examples Using MATLAB", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "gm_bab_4", nama: "4. Vibration Under General Forcing Conditions", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "gm_4_1", nama: "4.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_4_2", nama: "4.2 Response Under a General Periodic Force", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_4_3", nama: "4.3 Response Under a Periodic Force of Irregular Form", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_4_4", nama: "4.4 Response Under a Nonperiodic Force", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_4_5", nama: "4.5 Convolution Integral", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_4_6", nama: "4.6 Response Spectrum", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_4_7", nama: "4.7 Laplace Transforms", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_4_8", nama: "4.8 Numerical Methods", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_4_9", nama: "4.9 Response to Irregular Forcing Conditions Using Numerical Methods", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_4_10", nama: "4.10 Examples Using MATLAB", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "gm_bab_5", nama: "5. Two-Degree-of-Freedom Systems", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "gm_5_1", nama: "5.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_5_2", nama: "5.2 Equations of Motion for Forced Vibration", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_5_3", nama: "5.3 Free-Vibration Analysis of an Undamped System", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_5_4", nama: "5.4 Torsional System", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_5_5", nama: "5.5 Coordinate Coupling and Principal Coordinates", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_5_6", nama: "5.6 Forced-Vibration Analysis", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_5_7", nama: "5.7 Semidefinite Systems", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_5_8", nama: "5.8 Self-Excitation and Stability Analysis", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_5_9", nama: "5.9 Transfer-Function Approach", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_5_10", nama: "5.10 Solutions Using Laplace Transform", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_5_11", nama: "5.11 Solutions Using Frequency Transfer Functions", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_5_12", nama: "5.12 Examples Using MATLAB", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "gm_bab_6", nama: "6. Multidegree-of-Freedom Systems", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "gm_6_1", nama: "6.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_6_2", nama: "6.2 Modeling of Continuous Systems as Multidegree-of-Freedom Systems", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_6_3", nama: "6.3 Using Newton's Second Law to Derive Equations of Motion", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_6_4", nama: "6.4 Influence Coefficients", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_6_5", nama: "6.5 Potential and Kinetic Energy Expressions in Matrix Form", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_6_6", nama: "6.6 Generalized Coordinates and Generalized Forces", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_6_7", nama: "6.7 Using Lagrange's Equations to Derive Equations of Motion", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_6_8", nama: "6.8 Equations of Motion of Undamped Systems in Matrix Form", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_6_9", nama: "6.9 Eigenvalue Problem", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_6_10", nama: "6.10 Solution of the Eigenvalue Problem", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_6_11", nama: "6.11 Expansion Theorem", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_6_12", nama: "6.12 Unrestrained Systems", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_6_13", nama: "6.13 Free Vibration of Undamped Systems", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_6_14", nama: "6.14 Forced Vibration of Undamped Systems Using Modal Analysis", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_6_15", nama: "6.15 Forced Vibration of Viscously Damped Systems", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_6_16", nama: "6.16 Self-Excitation and Stability Analysis", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_6_17", nama: "6.17 Examples Using MATLAB", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "gm_bab_7", nama: "7. Determination of Natural Frequencies and Mode Shapes", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "gm_7_1", nama: "7.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_7_2", nama: "7.2 Dunkerley's Formula", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_7_3", nama: "7.3 Rayleigh's Method", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_7_4", nama: "7.4 Holzer's Method", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_7_5", nama: "7.5 Matrix Iteration Method", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_7_6", nama: "7.6 Jacobi's Method", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_7_7", nama: "7.7 Standard Eigenvalue Problem", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_7_8", nama: "7.8 Examples Using MATLAB", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "gm_bab_8", nama: "8. Continuous Systems", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "gm_8_1", nama: "8.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_8_2", nama: "8.2 Transverse Vibration of a String or Cable", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_8_3", nama: "8.3 Longitudinal Vibration of a Bar or Rod", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_8_4", nama: "8.4 Torsional Vibration of a Shaft or Rod", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_8_5", nama: "8.5 Lateral Vibration of Beams", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_8_6", nama: "8.6 Vibration of Membranes", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_8_7", nama: "8.7 Rayleigh's Method", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_8_8", nama: "8.8 The Rayleigh-Ritz Method", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_8_9", nama: "8.9 Examples Using MATLAB", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "gm_bab_9", nama: "9. Vibration Control", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "gm_9_1", nama: "9.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_9_2", nama: "9.2 Vibration Nomograph and Vibration Criteria", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_9_3", nama: "9.3 Reduction of Vibration at the Source", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_9_4", nama: "9.4 Balancing of Rotating Machines", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_9_5", nama: "9.5 Whirling of Rotating Shafts", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_9_6", nama: "9.6 Balancing of Reciprocating Engines", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_9_7", nama: "9.7 Control of Vibration", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_9_8", nama: "9.8 Control of Natural Frequencies", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_9_9", nama: "9.9 Introduction of Damping", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_9_10", nama: "9.10 Vibration Isolation", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_9_11", nama: "9.11 Vibration Absorbers", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_9_12", nama: "9.12 Examples Using MATLAB", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "gm_bab_10", nama: "10. Vibration Measurement and Applications", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "gm_10_1", nama: "10.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_10_2", nama: "10.2 Transducers", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_10_3", nama: "10.3 Vibration Pickups", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_10_4", nama: "10.4 Frequency-Measuring Instruments", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_10_5", nama: "10.5 Vibration Exciters", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_10_6", nama: "10.6 Signal Analysis", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_10_7", nama: "10.7 Dynamic Testing of Machines and Structures", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_10_8", nama: "10.8 Experimental Modal Analysis", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_10_9", nama: "10.9 Machine-Condition Monitoring and Diagnosis", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_10_10", nama: "10.10 Examples Using MATLAB", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "gm_bab_11", nama: "11. Numerical Integration Methods in Vibration Analysis", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "gm_11_1", nama: "11.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_11_2", nama: "11.2 Finite Difference Method", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_11_3", nama: "11.3 Central Difference Method for Single-Degree-of-Freedom Systems", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_11_4", nama: "11.4 Runge-Kutta Method for Single-Degree-of-Freedom Systems", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_11_5", nama: "11.5 Central Difference Method for Multidegree-of-Freedom Systems", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_11_6", nama: "11.6 Finite Difference Method for Continuous Systems", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_11_7", nama: "11.7 Runge-Kutta Method for Multidegree-of-Freedom Systems", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_11_8", nama: "11.8 Houbolt Method", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_11_9", nama: "11.9 Wilson Method", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_11_10", nama: "11.10 Newmark Method", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_11_11", nama: "11.11 Examples Using MATLAB", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "gm_bab_12", nama: "12. Finite Element Method", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "gm_12_1", nama: "12.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_12_2", nama: "12.2 Equations of Motion of an Element", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_12_3", nama: "12.3 Mass Matrix, Stiffness Matrix, and Force Vector", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_12_4", nama: "12.4 Transformation of Element Matrices and Vectors", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_12_5", nama: "12.5 Equations of Motion of the Complete System of Finite Elements", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_12_6", nama: "12.6 Incorporation of Boundary Conditions", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_12_7", nama: "12.7 Consistent- and Lumped-Mass Matrices", materi: "", gdriveUrl: "", catatan: "" },
    { id: "gm_12_8", nama: "12.8 Examples Using MATLAB", materi: "", gdriveUrl: "", catatan: "" }
  ]}
]},
        { id: "kinematika_dinamika", nama: "Kinematika & Dinamika", warna: "teal", fitur: [
  { id: "kd_bab_1", nama: "1. Kinematics of a Particle", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "kd_1_1", nama: "1.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "kd_1_2", nama: "1.2 Rectilinear Kinematics: Continuous Motion", materi: "", gdriveUrl: "", catatan: "" },
    { id: "kd_1_3", nama: "1.3 Rectilinear Kinematics: Erratic Motion", materi: "", gdriveUrl: "", catatan: "" },
    { id: "kd_1_4", nama: "1.4 General Curvilinear Motion", materi: "", gdriveUrl: "", catatan: "" },
    { id: "kd_1_5", nama: "1.5 Curvilinear Motion: Rectangular Components", materi: "", gdriveUrl: "", catatan: "" },
    { id: "kd_1_6", nama: "1.6 Motion of a Projectile", materi: "", gdriveUrl: "", catatan: "" },
    { id: "kd_1_7", nama: "1.7 Curvilinear Motion: Normal and Tangential Components", materi: "", gdriveUrl: "", catatan: "" },
    { id: "kd_1_8", nama: "1.8 Curvilinear Motion: Cylindrical Components", materi: "", gdriveUrl: "", catatan: "" },
    { id: "kd_1_9", nama: "1.9 Absolute Dependent Motion Analysis of Two Particles", materi: "", gdriveUrl: "", catatan: "" },
    { id: "kd_1_10", nama: "1.10 Relative-Motion of Two Particles Using Translating Axes", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "kd_bab_2", nama: "2. Kinetics of a Particle: Force and Acceleration", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "kd_2_1", nama: "2.1 Newton's Second Law of Motion", materi: "", gdriveUrl: "", catatan: "" },
    { id: "kd_2_2", nama: "2.2 The Equation of Motion", materi: "", gdriveUrl: "", catatan: "" },
    { id: "kd_2_3", nama: "2.3 Equation of Motion for a System of Particles", materi: "", gdriveUrl: "", catatan: "" },
    { id: "kd_2_4", nama: "2.4 Equations of Motion: Rectangular Coordinates", materi: "", gdriveUrl: "", catatan: "" },
    { id: "kd_2_5", nama: "2.5 Equations of Motion: Normal and Tangential Coordinates", materi: "", gdriveUrl: "", catatan: "" },
    { id: "kd_2_6", nama: "2.6 Equations of Motion: Cylindrical Coordinates", materi: "", gdriveUrl: "", catatan: "" },
    { id: "kd_2_7", nama: "2.7 Central-Force Motion and Space Mechanics", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "kd_bab_3", nama: "3. Kinetics of a Particle: Work and Energy", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "kd_3_1", nama: "3.1 The Work of a Force", materi: "", gdriveUrl: "", catatan: "" },
    { id: "kd_3_2", nama: "3.2 Principle of Work and Energy", materi: "", gdriveUrl: "", catatan: "" },
    { id: "kd_3_3", nama: "3.3 Principle of Work and Energy for a System of Particles", materi: "", gdriveUrl: "", catatan: "" },
    { id: "kd_3_4", nama: "3.4 Power and Efficiency", materi: "", gdriveUrl: "", catatan: "" },
    { id: "kd_3_5", nama: "3.5 Conservative Forces and Potential Energy", materi: "", gdriveUrl: "", catatan: "" },
    { id: "kd_3_6", nama: "3.6 Conservation of Energy", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "kd_bab_4", nama: "4. Kinetics of a Particle: Impulse and Momentum", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "kd_4_1", nama: "4.1 Principle of Linear Impulse and Momentum", materi: "", gdriveUrl: "", catatan: "" },
    { id: "kd_4_2", nama: "4.2 Principle of Linear Impulse and Momentum for a System of Particles", materi: "", gdriveUrl: "", catatan: "" },
    { id: "kd_4_3", nama: "4.3 Conservation of Linear Momentum for a System of Particles", materi: "", gdriveUrl: "", catatan: "" },
    { id: "kd_4_4", nama: "4.4 Impact", materi: "", gdriveUrl: "", catatan: "" },
    { id: "kd_4_5", nama: "4.5 Angular Momentum", materi: "", gdriveUrl: "", catatan: "" },
    { id: "kd_4_6", nama: "4.6 Relation Between Moment of a Force and Angular Momentum", materi: "", gdriveUrl: "", catatan: "" },
    { id: "kd_4_7", nama: "4.7 Principle of Angular Impulse and Momentum", materi: "", gdriveUrl: "", catatan: "" },
    { id: "kd_4_8", nama: "4.8 Steady Flow of a Fluid Stream", materi: "", gdriveUrl: "", catatan: "" },
    { id: "kd_4_9", nama: "4.9 Propulsion with Variable Mass", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "kd_bab_5", nama: "5. Planar Kinematics of a Rigid Body", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "kd_5_1", nama: "5.1 Planar Rigid-Body Motion", materi: "", gdriveUrl: "", catatan: "" },
    { id: "kd_5_2", nama: "5.2 Translation", materi: "", gdriveUrl: "", catatan: "" },
    { id: "kd_5_3", nama: "5.3 Rotation about a Fixed Axis", materi: "", gdriveUrl: "", catatan: "" },
    { id: "kd_5_4", nama: "5.4 Absolute Motion Analysis", materi: "", gdriveUrl: "", catatan: "" },
    { id: "kd_5_5", nama: "5.5 Relative-Motion Analysis: Velocity", materi: "", gdriveUrl: "", catatan: "" },
    { id: "kd_5_6", nama: "5.6 Instantaneous Center of Zero Velocity", materi: "", gdriveUrl: "", catatan: "" },
    { id: "kd_5_7", nama: "5.7 Relative-Motion Analysis: Acceleration", materi: "", gdriveUrl: "", catatan: "" },
    { id: "kd_5_8", nama: "5.8 Relative-Motion Analysis Using Rotating Axes", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "kd_bab_6", nama: "6. Planar Kinetics of a Rigid Body: Force and Acceleration", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "kd_6_1", nama: "6.1 Mass Moment of Inertia", materi: "", gdriveUrl: "", catatan: "" },
    { id: "kd_6_2", nama: "6.2 Planar Kinetic Equations of Motion", materi: "", gdriveUrl: "", catatan: "" },
    { id: "kd_6_3", nama: "6.3 Equations of Motion: Translation", materi: "", gdriveUrl: "", catatan: "" },
    { id: "kd_6_4", nama: "6.4 Equations of Motion: Rotation about a Fixed Axis", materi: "", gdriveUrl: "", catatan: "" },
    { id: "kd_6_5", nama: "6.5 Equations of Motion: General Plane Motion", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "kd_bab_7", nama: "7. Planar Kinetics of a Rigid Body: Work and Energy", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "kd_7_1", nama: "7.1 Kinetic Energy", materi: "", gdriveUrl: "", catatan: "" },
    { id: "kd_7_2", nama: "7.2 The Work of a Force", materi: "", gdriveUrl: "", catatan: "" },
    { id: "kd_7_3", nama: "7.3 The Work of a Couple Moment", materi: "", gdriveUrl: "", catatan: "" },
    { id: "kd_7_4", nama: "7.4 Principle of Work and Energy", materi: "", gdriveUrl: "", catatan: "" },
    { id: "kd_7_5", nama: "7.5 Conservation of Energy", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "kd_bab_8", nama: "8. Planar Kinetics of a Rigid Body: Impulse and Momentum", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "kd_8_1", nama: "8.1 Linear and Angular Momentum", materi: "", gdriveUrl: "", catatan: "" },
    { id: "kd_8_2", nama: "8.2 Principle of Impulse and Momentum", materi: "", gdriveUrl: "", catatan: "" },
    { id: "kd_8_3", nama: "8.3 Conservation of Momentum", materi: "", gdriveUrl: "", catatan: "" },
    { id: "kd_8_4", nama: "8.4 Eccentric Impact", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "kd_bab_9", nama: "9. Three-Dimensional Kinematics of a Rigid Body", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "kd_9_1", nama: "9.1 Rotation about a Fixed Point", materi: "", gdriveUrl: "", catatan: "" },
    { id: "kd_9_2", nama: "9.2 The Time Derivative of a Vector Measured from Either a Fixed or Translating-Rotating System", materi: "", gdriveUrl: "", catatan: "" },
    { id: "kd_9_3", nama: "9.3 General Motion", materi: "", gdriveUrl: "", catatan: "" },
    { id: "kd_9_4", nama: "9.4 Relative-Motion Analysis Using Translating and Rotating Axes", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "kd_bab_10", nama: "10. Three-Dimensional Kinetics of a Rigid Body", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "kd_10_1", nama: "10.1 Moments and Products of Inertia", materi: "", gdriveUrl: "", catatan: "" },
    { id: "kd_10_2", nama: "10.2 Angular Momentum", materi: "", gdriveUrl: "", catatan: "" },
    { id: "kd_10_3", nama: "10.3 Kinetic Energy", materi: "", gdriveUrl: "", catatan: "" },
    { id: "kd_10_4", nama: "10.4 Equations of Motion", materi: "", gdriveUrl: "", catatan: "" },
    { id: "kd_10_5", nama: "10.5 Gyroscopic Motion", materi: "", gdriveUrl: "", catatan: "" },
    { id: "kd_10_6", nama: "10.6 Torque-Free Motion", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "kd_bab_11", nama: "11. Vibrations", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "kd_11_1", nama: "11.1 Undamped Free Vibration", materi: "", gdriveUrl: "", catatan: "" },
    { id: "kd_11_2", nama: "11.2 Energy Methods", materi: "", gdriveUrl: "", catatan: "" },
    { id: "kd_11_3", nama: "11.3 Undamped Forced Vibration", materi: "", gdriveUrl: "", catatan: "" },
    { id: "kd_11_4", nama: "11.4 Viscous Damped Free Vibration", materi: "", gdriveUrl: "", catatan: "" },
    { id: "kd_11_5", nama: "11.5 Viscous Damped Forced Vibration", materi: "", gdriveUrl: "", catatan: "" },
    { id: "kd_11_6", nama: "11.6 Electrical Circuit Analogs", materi: "", gdriveUrl: "", catatan: "" }
  ]}
]},
{ id: "analisis_teknik", nama: "Analisis Teknik", warna: "brown", fitur: [
  { id: "at_bab_1", nama: "1. First-Order ODEs", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "at_1_1", nama: "1.1 Basic Concepts. Modeling", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_1_2", nama: "1.2 Geometric Meaning of y' = f(x, y). Direction Fields, Euler's Method", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_1_3", nama: "1.3 Separable ODEs. Modeling", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_1_4", nama: "1.4 Exact ODEs. Integrating Factors", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_1_5", nama: "1.5 Linear ODEs. Bernoulli Equation. Population Dynamics", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_1_6", nama: "1.6 Orthogonal Trajectories", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_1_7", nama: "1.7 Existence and Uniqueness of Solutions for Initial Value Problems", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "at_bab_2", nama: "2. Second-Order Linear ODEs", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "at_2_1", nama: "2.1 Homogeneous Linear ODEs of Second Order", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_2_2", nama: "2.2 Homogeneous Linear ODEs with Constant Coefficients", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_2_3", nama: "2.3 Differential Operators", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_2_4", nama: "2.4 Modeling of Free Oscillations of a Mass-Spring System", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_2_5", nama: "2.5 Euler-Cauchy Equations", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_2_6", nama: "2.6 Existence and Uniqueness of Solutions. Wronskian", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_2_7", nama: "2.7 Nonhomogeneous ODEs", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_2_8", nama: "2.8 Modeling: Forced Oscillations. Resonance", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_2_9", nama: "2.9 Modeling: Electric Circuits", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_2_10", nama: "2.10 Solution by Variation of Parameters", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "at_bab_3", nama: "3. Higher Order Linear ODEs", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "at_3_1", nama: "3.1 Homogeneous Linear ODEs", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_3_2", nama: "3.2 Homogeneous Linear ODEs with Constant Coefficients", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_3_3", nama: "3.3 Nonhomogeneous Linear ODEs", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "at_bab_4", nama: "4. Systems of ODEs. Phase Plane. Qualitative Methods", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "at_4_1", nama: "4.0 For Reference: Basics of Matrices and Vectors", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_4_2", nama: "4.1 Systems of ODEs as Models in Engineering Applications", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_4_3", nama: "4.2 Basic Theory of Systems of ODEs. Wronskian", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_4_4", nama: "4.3 Constant-Coefficient Systems. Phase Plane Method", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_4_5", nama: "4.4 Criteria for Critical Points. Stability", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_4_6", nama: "4.5 Qualitative Methods for Nonlinear Systems", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_4_7", nama: "4.6 Nonhomogeneous Linear Systems of ODEs", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "at_bab_5", nama: "5. Series Solutions of ODEs. Special Functions", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "at_5_1", nama: "5.1 Power Series Method", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_5_2", nama: "5.2 Legendre's Equation. Legendre Polynomials Pn(x)", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_5_3", nama: "5.3 Extended Power Series Method: Frobenius Method", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_5_4", nama: "5.4 Bessel's Equation. Bessel Functions Jv(x)", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_5_5", nama: "5.5 Bessel Functions Yv(x). General Solution", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "at_bab_6", nama: "6. Laplace Transforms", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "at_6_1", nama: "6.1 Laplace Transform. Linearity. First Shifting Theorem (s-Shifting)", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_6_2", nama: "6.2 Transforms of Derivatives and Integrals. ODEs", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_6_3", nama: "6.3 Unit Step Function (Heaviside Function). Second Shifting Theorem (t-Shifting)", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_6_4", nama: "6.4 Short Impulses. Dirac's Delta Function. Partial Fractions", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_6_5", nama: "6.5 Convolution. Integral Equations", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_6_6", nama: "6.6 Differentiation and Integration of Transforms. ODEs with Variable Coefficients", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_6_7", nama: "6.7 Systems of ODEs", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_6_8", nama: "6.8 Laplace Transform: General Formulas", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_6_9", nama: "6.9 Table of Laplace Transforms", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "at_bab_7", nama: "7. Linear Algebra: Matrices, Vectors, Determinants. Linear Systems", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "at_7_1", nama: "7.1 Matrices, Vectors: Addition and Scalar Multiplication", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_7_2", nama: "7.2 Matrix Multiplication", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_7_3", nama: "7.3 Linear Systems of Equations. Gauss Elimination", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_7_4", nama: "7.4 Linear Independence. Rank of a Matrix. Vector Space", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_7_5", nama: "7.5 Solutions of Linear Systems: Existence, Uniqueness", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_7_6", nama: "7.6 For Reference: Second- and Third-Order Determinants", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_7_7", nama: "7.7 Determinants. Cramer's Rule", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_7_8", nama: "7.8 Inverse of a Matrix. Gauss-Jordan Elimination", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_7_9", nama: "7.9 Vector Spaces, Inner Product Spaces, Linear Transformations", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "at_bab_8", nama: "8. Linear Algebra: Matrix Eigenvalue Problems", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "at_8_1", nama: "8.1 The Matrix Eigenvalue Problem. Determining Eigenvalues and Eigenvectors", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_8_2", nama: "8.2 Some Applications of Eigenvalue Problems", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_8_3", nama: "8.3 Symmetric, Skew-Symmetric, and Orthogonal Matrices", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_8_4", nama: "8.4 Eigenbases. Diagonalization. Quadratic Forms", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_8_5", nama: "8.5 Complex Matrices and Forms", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "at_bab_9", nama: "9. Vector Differential Calculus. Grad, Div, Curl", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "at_9_1", nama: "9.1 Vectors in 2-Space and 3-Space", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_9_2", nama: "9.2 Inner Product (Dot Product)", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_9_3", nama: "9.3 Vector Product (Cross Product)", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_9_4", nama: "9.4 Vector and Scalar Functions and Their Fields. Vector Calculus: Derivatives", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_9_5", nama: "9.5 Curves. Arc Length. Curvature. Torsion", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_9_6", nama: "9.6 Calculus Review: Functions of Several Variables", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_9_7", nama: "9.7 Gradient of a Scalar Field. Directional Derivative", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_9_8", nama: "9.8 Divergence of a Vector Field", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_9_9", nama: "9.9 Curl of a Vector Field", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "at_bab_10", nama: "10. Vector Integral Calculus. Integral Theorems", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "at_10_1", nama: "10.1 Line Integrals", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_10_2", nama: "10.2 Path Independence of Line Integrals", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_10_3", nama: "10.3 Calculus Review: Double Integrals", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_10_4", nama: "10.4 Green's Theorem in the Plane", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_10_5", nama: "10.5 Surfaces for Surface Integrals", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_10_6", nama: "10.6 Surface Integrals", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_10_7", nama: "10.7 Triple Integrals. Divergence Theorem of Gauss", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_10_8", nama: "10.8 Further Applications of the Divergence Theorem", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_10_9", nama: "10.9 Stokes's Theorem", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "at_bab_11", nama: "11. Fourier Analysis", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "at_11_1", nama: "11.1 Fourier Series", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_11_2", nama: "11.2 Arbitrary Period. Even and Odd Functions. Half-Range Expansions", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_11_3", nama: "11.3 Forced Oscillations", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_11_4", nama: "11.4 Approximation by Trigonometric Polynomials", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_11_5", nama: "11.5 Sturm-Liouville Problems. Orthogonal Functions", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_11_6", nama: "11.6 Orthogonal Series. Generalized Fourier Series", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_11_7", nama: "11.7 Fourier Integral", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_11_8", nama: "11.8 Fourier Cosine and Sine Transforms", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_11_9", nama: "11.9 Fourier Transform. Discrete and Fast Fourier Transforms", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_11_10", nama: "11.10 Tables of Transforms", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "at_bab_12", nama: "12. Partial Differential Equations (PDEs)", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "at_12_1", nama: "12.1 Basic Concepts of PDEs", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_12_2", nama: "12.2 Modeling: Vibrating String, Wave Equation", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_12_3", nama: "12.3 Solution by Separating Variables. Use of Fourier Series", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_12_4", nama: "12.4 D'Alembert's Solution of the Wave Equation. Characteristics", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_12_5", nama: "12.5 Modeling: Heat Flow from a Body in Space. Heat Equation", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_12_6", nama: "12.6 Heat Equation: Solution by Fourier Series. Steady Two-Dimensional Heat Problems. Dirichlet Problem", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_12_7", nama: "12.7 Heat Equation: Modeling Very Long Bars. Solution by Fourier Integrals and Transforms", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_12_8", nama: "12.8 Modeling: Membrane, Two-Dimensional Wave Equation", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_12_9", nama: "12.9 Rectangular Membrane. Double Fourier Series", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_12_10", nama: "12.10 Laplacian in Polar Coordinates. Circular Membrane. Fourier-Bessel Series", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_12_11", nama: "12.11 Laplace's Equation in Cylindrical and Spherical Coordinates. Potential", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "at_bab_13", nama: "13. Complex Numbers and Functions. Complex Differentiation", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "at_13_1", nama: "13.1 Complex Numbers and Their Geometric Representation", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_13_2", nama: "13.2 Polar Form of Complex Numbers. Powers and Roots", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_13_3", nama: "13.3 Derivative. Analytic Function", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_13_4", nama: "13.4 Cauchy-Riemann Equations. Laplace's Equation", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_13_5", nama: "13.5 Exponential Function", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_13_6", nama: "13.6 Trigonometric and Hyperbolic Functions", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_13_7", nama: "13.7 Logarithm. General Power. Principal Value", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "at_bab_14", nama: "14. Complex Integration", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "at_14_1", nama: "14.1 Line Integral in the Complex Plane", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_14_2", nama: "14.2 Cauchy's Integral Theorem", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_14_3", nama: "14.3 Cauchy's Integral Formula", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_14_4", nama: "14.4 Derivatives of Analytic Functions", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "at_bab_15", nama: "15. Power Series, Taylor Series", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "at_15_1", nama: "15.1 Sequences, Series, Convergence Tests", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_15_2", nama: "15.2 Power Series", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_15_3", nama: "15.3 Functions Given by Power Series", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_15_4", nama: "15.4 Taylor and Maclaurin Series", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_15_5", nama: "15.5 Uniform Convergence", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "at_bab_16", nama: "16. Laurent Series. Residue Integration", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "at_16_1", nama: "16.1 Laurent Series", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_16_2", nama: "16.2 Singularities and Zeros. Infinity", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_16_3", nama: "16.3 Residue Integration Method", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "at_bab_17", nama: "17. Conformal Mapping", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "at_17_1", nama: "17.1 Geometry of Analytic Functions: Conformal Mapping", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_17_2", nama: "17.2 Linear Fractional Transformations (Möbius Transformations)", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_17_3", nama: "17.3 Special Linear Fractional Transformations", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_17_4", nama: "17.4 Conformal Mapping by Other Functions", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_17_5", nama: "17.5 Riemann Surfaces", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "at_bab_18", nama: "18. Complex Analysis and Potential Theory", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "at_18_1", nama: "18.1 Electrostatic Fields", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_18_2", nama: "18.2 Use of Conformal Mapping. Modeling", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_18_3", nama: "18.3 Heat Problems", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_18_4", nama: "18.4 Fluid Flow", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_18_5", nama: "18.5 Poisson's Integral Formula for Potentials", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_18_6", nama: "18.6 General Properties of Harmonic Functions", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "at_bab_19", nama: "19. Numerics in General", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "at_19_1", nama: "19.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_19_2", nama: "19.2 Solution of Equations by Iteration", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_19_3", nama: "19.3 Interpolation", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_19_4", nama: "19.4 Spline Interpolation", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_19_5", nama: "19.5 Numeric Integration and Differentiation", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "at_bab_20", nama: "20. Numeric Linear Algebra", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "at_20_1", nama: "20.1 Linear Systems: Gauss Elimination", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_20_2", nama: "20.2 Linear Systems: LU-Factorization, Matrix Inversion", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_20_3", nama: "20.3 Linear Systems: Solution by Iteration", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_20_4", nama: "20.4 Linear Systems: Ill-Conditioning, Norms", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_20_5", nama: "20.5 Least Squares Method", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_20_6", nama: "20.6 Matrix Eigenvalue Problems: Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_20_7", nama: "20.7 Inclusion of Matrix Eigenvalues", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_20_8", nama: "20.8 Power Method for Eigenvalues", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_20_9", nama: "20.9 Tridiagonalization and QR-Factorization", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "at_bab_21", nama: "21. Numerics for ODEs and PDEs", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "at_21_1", nama: "21.1 Methods for First-Order ODEs", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_21_2", nama: "21.2 Multistep Methods", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_21_3", nama: "21.3 Methods for Systems and Higher Order ODEs", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_21_4", nama: "21.4 Methods for Elliptic PDEs", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_21_5", nama: "21.5 Neumann and Mixed Problems. Irregular Boundary", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_21_6", nama: "21.6 Methods for Parabolic PDEs", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_21_7", nama: "21.7 Method for Hyperbolic PDEs", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "at_bab_22", nama: "22. Unconstrained Optimization. Linear Programming", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "at_22_1", nama: "22.1 Basic Concepts. Unconstrained Optimization: Method of Steepest Descent", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_22_2", nama: "22.2 Linear Programming", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_22_3", nama: "22.3 Simplex Method", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_22_4", nama: "22.4 Simplex Method: Difficulties", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "at_bab_23", nama: "23. Graphs. Combinatorial Optimization", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "at_23_1", nama: "23.1 Graphs and Digraphs", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_23_2", nama: "23.2 Shortest Path Problems. Complexity", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_23_3", nama: "23.3 Bellman's Principle. Dijkstra's Algorithm", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_23_4", nama: "23.4 Shortest Spanning Trees: Greedy Algorithm", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_23_5", nama: "23.5 Shortest Spanning Trees: Prim's Algorithm", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_23_6", nama: "23.6 Flows in Networks", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_23_7", nama: "23.7 Maximum Flow: Ford-Fulkerson", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "at_bab_24", nama: "24. Data Analysis. Probability Theory", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "at_24_1", nama: "24.1 Data Representation. Average. Spread", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_24_2", nama: "24.2 Experiments, Outcomes, Events", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_24_3", nama: "24.3 Probability", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_24_4", nama: "24.4 Permutations and Combinations", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_24_5", nama: "24.5 Random Variables. Probability Distributions", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_24_6", nama: "24.6 Mean and Variance of a Distribution", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_24_7", nama: "24.7 Binomial, Poisson, and Hypergeometric Distributions", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_24_8", nama: "24.8 Normal Distribution", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_24_9", nama: "24.9 Distributions of Several Random Variables", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "at_bab_25", nama: "25. Mathematical Statistics", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "at_25_1", nama: "25.1 Introduction. Random Sampling", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_25_2", nama: "25.2 Point Estimation of Parameters", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_25_3", nama: "25.3 Confidence Intervals", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_25_4", nama: "25.4 Testing of Hypotheses. Decisions", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_25_5", nama: "25.5 Quality Control", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_25_6", nama: "25.6 Acceptance Sampling", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_25_7", nama: "25.7 Goodness of Fit. χ²-Test", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_25_8", nama: "25.8 Nonparametric Tests", materi: "", gdriveUrl: "", catatan: "" },
    { id: "at_25_9", nama: "25.9 Regression. Fitting Straight Lines. Correlation", materi: "", gdriveUrl: "", catatan: "" }
  ]}
]},
      ]},
      { id: "manufaktur_produksi", nama: "🏭 Manufaktur & Produksi", tools: [
        { id: "proses_manufaktur", nama: "Proses Manufaktur", warna: "orange", fitur: [
  { id: "pm_bab_1", nama: "1. What is Manufacturing?", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "pm_1_1", nama: "1.1 What is Manufacturing?", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_1_2", nama: "1.2 Product Design and Concurrent Engineering", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_1_3", nama: "1.3 Design for Manufacture, Assembly, Disassembly, and Service", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_1_4", nama: "1.4 Green Design and Manufacturing", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_1_5", nama: "1.5 Selection of Materials", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_1_6", nama: "1.6 Selection of Manufacturing Processes", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_1_7", nama: "1.7 Computer-integrated Manufacturing", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_1_8", nama: "1.8 Quality Assurance and Total Quality Management", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_1_9", nama: "1.9 Lean Production and Agile Manufacturing", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_1_10", nama: "1.10 Manufacturing Costs and Global Competition", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_1_11", nama: "1.11 Trends in Manufacturing", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "pm_bab_2", nama: "2. Mechanical Behavior, Testing, and Manufacturing Properties of Materials", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "pm_2_1", nama: "2.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_2_2", nama: "2.2 Tension", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_2_3", nama: "2.3 Compression", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_2_4", nama: "2.4 Torsion", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_2_5", nama: "2.5 Bending (Flexure)", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_2_6", nama: "2.6 Hardness", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_2_7", nama: "2.7 Fatigue", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_2_8", nama: "2.8 Creep", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_2_9", nama: "2.9 Impact", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_2_10", nama: "2.10 Failure and Fracture of Materials", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_2_11", nama: "2.11 Residual Stresses", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_2_12", nama: "2.12 Work, Heat, and Temperature", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "pm_bab_3", nama: "3. Physical Properties of Materials", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "pm_3_1", nama: "3.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_3_2", nama: "3.2 Density", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_3_3", nama: "3.3 Melting Point", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_3_4", nama: "3.4 Specific Heat", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_3_5", nama: "3.5 Thermal Conductivity", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_3_6", nama: "3.6 Thermal Expansion", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_3_7", nama: "3.7 Electrical, Magnetic, and Optical Properties", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_3_8", nama: "3.8 Corrosion Resistance", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "pm_bab_10", nama: "10. Fundamentals of Metal Casting", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "pm_10_1", nama: "10.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_10_2", nama: "10.2 Solidification of Metals", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_10_3", nama: "10.3 Fluid Flow", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_10_4", nama: "10.4 Fluidity of Molten Metal", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_10_5", nama: "10.5 Heat Transfer", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_10_6", nama: "10.6 Defects", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "pm_bab_11", nama: "11. Metal-casting Processes and Equipment", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "pm_11_1", nama: "11.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_11_2", nama: "11.2 Expendable-mold, Permanent-pattern Casting Processes", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_11_3", nama: "11.3 Expendable-mold, Expendable-pattern Casting Processes", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_11_4", nama: "11.4 Permanent-mold Casting Processes", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_11_5", nama: "11.5 Casting Techniques for Single-crystal Components", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_11_6", nama: "11.6 Rapid Solidification", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_11_7", nama: "11.7 Inspection of Castings", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_11_8", nama: "11.8 Melting Practice and Furnaces", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_11_9", nama: "11.9 Foundries and Foundry Automation", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "pm_bab_12", nama: "12. Metal Casting: Design, Materials, and Economics", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "pm_12_1", nama: "12.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_12_2", nama: "12.2 Design Considerations in Casting", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_12_3", nama: "12.3 Casting Alloys", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_12_4", nama: "12.4 Economics of Casting", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "pm_bab_13", nama: "13. Metal-rolling Processes and Equipment", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "pm_13_1", nama: "13.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_13_2", nama: "13.2 The Flat-rolling Process", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_13_3", nama: "13.3 Flat-rolling Practice", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_13_4", nama: "13.4 Rolling Mills", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_13_5", nama: "13.5 Various Rolling Processes and Mills", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "pm_bab_14", nama: "14. Metal-forging Processes and Equipment", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "pm_14_1", nama: "14.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_14_2", nama: "14.2 Open-die Forging", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_14_3", nama: "14.3 Impression-die and Closed-die Forging", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_14_4", nama: "14.4 Various Forging Operations", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_14_5", nama: "14.5 Forgeability of Metals; Forging Defects", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_14_6", nama: "14.6 Die Design, Die Materials, and Lubrication", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_14_7", nama: "14.7 Die-manufacturing Methods and Die Failure", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_14_8", nama: "14.8 Forging Machines", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_14_9", nama: "14.9 Economics of Forging", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "pm_bab_15", nama: "15. Metal Extrusion and Drawing Processes and Equipment", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "pm_15_1", nama: "15.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_15_2", nama: "15.2 The Extrusion Process", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_15_3", nama: "15.3 Hot Extrusion", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_15_4", nama: "15.4 Cold Extrusion", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_15_5", nama: "15.5 Extrusion Defects", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_15_6", nama: "15.6 Design Considerations", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_15_7", nama: "15.7 Extrusion Equipment", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_15_8", nama: "15.8 The Drawing Process", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_15_9", nama: "15.9 Drawing Practice", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_15_10", nama: "15.10 Drawing Defects and Residual Stresses", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_15_11", nama: "15.11 Drawing Equipment", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "pm_bab_16", nama: "16. Sheet-metal Forming Processes and Equipment", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "pm_16_1", nama: "16.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_16_2", nama: "16.2 Shearing", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_16_3", nama: "16.3 Sheet-metal Characteristics and Formability", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_16_4", nama: "16.4 Formability Tests for Sheet Metals", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_16_5", nama: "16.5 Bending Sheets, Plates, and Tubes", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_16_6", nama: "16.6 Miscellaneous Bending and Related Forming Operations", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_16_7", nama: "16.7 Deep Drawing", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_16_8", nama: "16.8 Rubber Forming and Hydroforming", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_16_9", nama: "16.9 Spinning", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_16_10", nama: "16.10 Superplastic Forming", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_16_11", nama: "16.11 Hot Stamping", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_16_12", nama: "16.12 Specialized Forming Processes", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_16_13", nama: "16.13 Manufacturing of Metal Honeycomb Structures", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_16_14", nama: "16.14 Design Considerations in Sheet-metal Forming", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_16_15", nama: "16.15 Equipment for Sheet-metal Forming", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_16_16", nama: "16.16 Economics of Sheet-forming Operations", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "pm_bab_17", nama: "17. Powder Metal Processes and Equipment", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "pm_17_1", nama: "17.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_17_2", nama: "17.2 Production of Metal Powders", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_17_3", nama: "17.3 Compaction of Metal Powders", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_17_4", nama: "17.4 Sintering", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_17_5", nama: "17.5 Secondary and Finishing Operations", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_17_6", nama: "17.6 Design Considerations", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_17_7", nama: "17.7 Economics of Powder Metallurgy", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "pm_bab_18", nama: "18. Ceramics, Glasses, and Superconductors: Processing and Equipment", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "pm_18_1", nama: "18.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_18_2", nama: "18.2 Shaping Ceramics", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_18_3", nama: "18.3 Forming and Shaping of Glass", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_18_4", nama: "18.4 Techniques for Strengthening and Annealing Glass", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_18_5", nama: "18.5 Design Considerations for Ceramics and Glasses", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_18_6", nama: "18.6 Processing of Superconductors", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "pm_bab_19", nama: "19. Plastics and Composite Materials: Forming and Shaping", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "pm_19_1", nama: "19.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_19_2", nama: "19.2 Extrusion", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_19_3", nama: "19.3 Injection Molding", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_19_4", nama: "19.4 Blow Molding", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_19_5", nama: "19.5 Rotational Molding", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_19_6", nama: "19.6 Thermoforming", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_19_7", nama: "19.7 Compression Molding", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_19_8", nama: "19.8 Transfer Molding", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_19_9", nama: "19.9 Casting", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_19_10", nama: "19.10 Foam Molding", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_19_11", nama: "19.11 Cold Forming and Solid-phase Forming", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_19_12", nama: "19.12 Processing Elastomers", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_19_13", nama: "19.13 Processing Polymer-matrix Composites", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_19_14", nama: "19.14 Processing Metal-matrix and Ceramic-matrix Composites", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_19_15", nama: "19.15 Design Considerations", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_19_16", nama: "19.16 Economics of Processing Plastics and Composite Materials", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "pm_bab_20", nama: "20. Rapid-prototyping Processes and Operations", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "pm_20_1", nama: "20.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_20_2", nama: "20.2 Subtractive Processes", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_20_3", nama: "20.3 Additive Processes", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_20_4", nama: "20.4 Virtual Prototyping", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_20_5", nama: "20.5 Self-replicating Machines", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_20_6", nama: "20.6 Direct Manufacturing and Rapid Tooling", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "pm_bab_30", nama: "30. Fusion-welding Processes", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "pm_30_1", nama: "30.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_30_2", nama: "30.2 Oxyfuel-gas Welding", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_30_3", nama: "30.3 Arc-welding Processes: Nonconsumable Electrode", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_30_4", nama: "30.4 Arc-welding Processes: Consumable Electrode", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_30_5", nama: "30.5 Electrodes for Arc Welding", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_30_6", nama: "30.6 Electron-beam Welding", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_30_7", nama: "30.7 Laser-beam Welding", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_30_8", nama: "30.8 Cutting", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_30_9", nama: "30.9 The Weld Joint, Weld Quality, and Testing", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_30_10", nama: "30.10 Joint Design and Process Selection", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "pm_bab_31", nama: "31. Solid-State Welding Processes", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "pm_31_1", nama: "31.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_31_2", nama: "31.2 Cold Welding and Roll Bonding", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_31_3", nama: "31.3 Ultrasonic Welding", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_31_4", nama: "31.4 Friction Welding", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_31_5", nama: "31.5 Resistance Welding", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_31_6", nama: "31.6 Explosion Welding", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_31_7", nama: "31.7 Diffusion Bonding", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_31_8", nama: "31.8 Economics of Welding Operations", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "pm_bab_32", nama: "32. Brazing, Soldering, Adhesive-bonding, and Mechanical Fastening Processes", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "pm_32_1", nama: "32.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_32_2", nama: "32.2 Brazing", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_32_3", nama: "32.3 Soldering", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_32_4", nama: "32.4 Adhesive-bonding", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_32_5", nama: "32.5 Mechanical Fastening", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_32_6", nama: "32.6 Joining Plastics, Ceramics, and Glasses", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pm_32_7", nama: "32.7 Economics of Joining Operations", materi: "", gdriveUrl: "", catatan: "" }
  ]}
]},
        { id: "proses_manufaktur_lanjut", nama: "Proses Manufaktur Lanjut", warna: "darkorange", fitur: [
  { id: "pml_bab_21", nama: "21. Fundamentals of Machining", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "pml_21_1", nama: "21.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_21_2", nama: "21.2 Mechanics of Cutting", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_21_3", nama: "21.3 Cutting Forces and Power", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_21_4", nama: "21.4 Temperatures in Cutting", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_21_5", nama: "21.5 Tool Life: Wear and Failure", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_21_6", nama: "21.6 Surface Finish and Integrity", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_21_7", nama: "21.7 Machinability", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "pml_bab_22", nama: "22. Cutting-tool Materials and Cutting Fluids", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "pml_22_1", nama: "22.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_22_2", nama: "22.2 High-speed Steels", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_22_3", nama: "22.3 Cast-cobalt Alloys", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_22_4", nama: "22.4 Carbides", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_22_5", nama: "22.5 Coated Tools", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_22_6", nama: "22.6 Alumina-based Ceramics", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_22_7", nama: "22.7 Cubic Boron Nitride", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_22_8", nama: "22.8 Silicon-nitride-based Ceramics", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_22_9", nama: "22.9 Diamond", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_22_10", nama: "22.10 Whisker-reinforced Materials and Nanomaterials", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_22_11", nama: "22.11 Tool Costs and Reconditioning of Tools", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_22_12", nama: "22.12 Cutting Fluids", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "pml_bab_23", nama: "23. Machining Processes: Turning and Hole Making", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "pml_23_1", nama: "23.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_23_2", nama: "23.2 The Turning Process", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_23_3", nama: "23.3 Lathes and Lathe Operations", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_23_4", nama: "23.4 Boring and Boring Machines", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_23_5", nama: "23.5 Drilling, Drills, and Drilling Machines", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_23_6", nama: "23.6 Reaming and Reamers", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_23_7", nama: "23.7 Tapping and Taps", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "pml_bab_24", nama: "24. Machining Processes: Milling, Broaching, Sawing, Filing, and Gear Manufacturing", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "pml_24_1", nama: "24.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_24_2", nama: "24.2 Milling and Milling Machines", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_24_3", nama: "24.3 Planing and Shaping", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_24_4", nama: "24.4 Broaching and Broaching Machines", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_24_5", nama: "24.5 Sawing", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_24_6", nama: "24.6 Filing", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_24_7", nama: "24.7 Gear Manufacturing by Machining", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "pml_bab_25", nama: "25. Machining Centers, Machine-tool Structures, and Machining Economics", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "pml_25_1", nama: "25.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_25_2", nama: "25.2 Machining Centers", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_25_3", nama: "25.3 Machine-tool Structures", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_25_4", nama: "25.4 Vibration and Chatter in Machining Operations", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_25_5", nama: "25.5 High-speed Machining", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_25_6", nama: "25.6 Hard Machining", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_25_7", nama: "25.7 Ultraprecision Machining", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_25_8", nama: "25.8 Machining Economics", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "pml_bab_26", nama: "26. Abrasive Machining and Finishing Operations", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "pml_26_1", nama: "26.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_26_2", nama: "26.2 Abrasives and Bonded Abrasives", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_26_3", nama: "26.3 The Grinding Process", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_26_4", nama: "26.4 Grinding Operations and Machines", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_26_5", nama: "26.5 Design Considerations for Grinding", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_26_6", nama: "26.6 Ultrasonic Machining", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_26_7", nama: "26.7 Finishing Operations", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_26_8", nama: "26.8 Deburring Operations", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_26_9", nama: "26.9 Economics of Abrasive Machining and Finishing Operations", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "pml_bab_27", nama: "27. Advanced Machining Processes and Equipment", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "pml_27_1", nama: "27.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_27_2", nama: "27.2 Chemical Machining", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_27_3", nama: "27.3 Electrochemical Machining", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_27_4", nama: "27.4 Electrochemical Grinding", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_27_5", nama: "27.5 Electrical-discharge Machining", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_27_6", nama: "27.6 Laser-beam Machining", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_27_7", nama: "27.7 Electron-beam Machining", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_27_8", nama: "27.8 Water-jet Machining", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_27_9", nama: "27.9 Abrasive-jet Machining", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_27_10", nama: "27.10 Hybrid Machining Systems", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_27_11", nama: "27.11 Economics of Advanced Machining Processes", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "pml_bab_33", nama: "33. Surface Roughness and Measurement: Friction, Wear, and Lubrication", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "pml_33_1", nama: "33.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_33_2", nama: "33.2 Surface Structure and Integrity", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_33_3", nama: "33.3 Surface Texture and Roughness", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_33_4", nama: "33.4 Friction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_33_5", nama: "33.5 Wear", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_33_6", nama: "33.6 Lubrication", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_33_7", nama: "33.7 Metalworking Fluids and Their Selection", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "pml_bab_34", nama: "34. Surface Treatments, Coatings, and Cleaning", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "pml_34_1", nama: "34.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_34_2", nama: "34.2 Mechanical Surface Treatments", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_34_3", nama: "34.3 Mechanical Plating and Cladding", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_34_4", nama: "34.4 Case Hardening and Hard Facing", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_34_5", nama: "34.5 Thermal Spraying", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_34_6", nama: "34.6 Vapor Deposition", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_34_7", nama: "34.7 Ion Implantation and Diffusion Coating", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_34_8", nama: "34.8 Laser Treatments", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_34_9", nama: "34.9 Electroplating, Electroless Plating, and Electroforming", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_34_10", nama: "34.10 Conversion Coatings", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_34_11", nama: "34.11 Hot Dipping", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_34_12", nama: "34.12 Porcelain Enameling, Ceramic and Organic Coatings", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_34_13", nama: "34.13 Diamond Coating and Diamond-like Carbon", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_34_14", nama: "34.14 Surface Texturing", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_34_15", nama: "34.15 Painting", materi: "", gdriveUrl: "", catatan: "" },
    { id: "pml_34_16", nama: "34.16 Cleaning of Surfaces", materi: "", gdriveUrl: "", catatan: "" }
  ]}
]},
        { id: "teknik_pengecoran_pengelasan", nama: "Teknik Pengecoran & Pengelasan", warna: "crimson", fitur: [
  { id: "tpp_bab_10", nama: "10. Fundamentals of Metal Casting", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "tpp_10_1", nama: "10.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "tpp_10_2", nama: "10.2 Solidification of Metals", materi: "", gdriveUrl: "", catatan: "" },
    { id: "tpp_10_3", nama: "10.3 Fluid Flow", materi: "", gdriveUrl: "", catatan: "" },
    { id: "tpp_10_4", nama: "10.4 Fluidity of Molten Metal", materi: "", gdriveUrl: "", catatan: "" },
    { id: "tpp_10_5", nama: "10.5 Heat Transfer", materi: "", gdriveUrl: "", catatan: "" },
    { id: "tpp_10_6", nama: "10.6 Defects", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "tpp_bab_11", nama: "11. Metal-casting Processes and Equipment", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "tpp_11_1", nama: "11.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "tpp_11_2", nama: "11.2 Expendable-mold, Permanent-pattern Casting Processes", materi: "", gdriveUrl: "", catatan: "" },
    { id: "tpp_11_3", nama: "11.3 Expendable-mold, Expendable-pattern Casting Processes", materi: "", gdriveUrl: "", catatan: "" },
    { id: "tpp_11_4", nama: "11.4 Permanent-mold Casting Processes", materi: "", gdriveUrl: "", catatan: "" },
    { id: "tpp_11_5", nama: "11.5 Casting Techniques for Single-crystal Components", materi: "", gdriveUrl: "", catatan: "" },
    { id: "tpp_11_6", nama: "11.6 Rapid Solidification", materi: "", gdriveUrl: "", catatan: "" },
    { id: "tpp_11_7", nama: "11.7 Inspection of Castings", materi: "", gdriveUrl: "", catatan: "" },
    { id: "tpp_11_8", nama: "11.8 Melting Practice and Furnaces", materi: "", gdriveUrl: "", catatan: "" },
    { id: "tpp_11_9", nama: "11.9 Foundries and Foundry Automation", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "tpp_bab_12", nama: "12. Metal Casting: Design, Materials, and Economics", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "tpp_12_1", nama: "12.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "tpp_12_2", nama: "12.2 Design Considerations in Casting", materi: "", gdriveUrl: "", catatan: "" },
    { id: "tpp_12_3", nama: "12.3 Casting Alloys", materi: "", gdriveUrl: "", catatan: "" },
    { id: "tpp_12_4", nama: "12.4 Economics of Casting", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "tpp_bab_30", nama: "30. Fusion-welding Processes", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "tpp_30_1", nama: "30.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "tpp_30_2", nama: "30.2 Oxyfuel-gas Welding", materi: "", gdriveUrl: "", catatan: "" },
    { id: "tpp_30_3", nama: "30.3 Arc-welding Processes: Nonconsumable Electrode", materi: "", gdriveUrl: "", catatan: "" },
    { id: "tpp_30_4", nama: "30.4 Arc-welding Processes: Consumable Electrode", materi: "", gdriveUrl: "", catatan: "" },
    { id: "tpp_30_5", nama: "30.5 Electrodes for Arc Welding", materi: "", gdriveUrl: "", catatan: "" },
    { id: "tpp_30_6", nama: "30.6 Electron-beam Welding", materi: "", gdriveUrl: "", catatan: "" },
    { id: "tpp_30_7", nama: "30.7 Laser-beam Welding", materi: "", gdriveUrl: "", catatan: "" },
    { id: "tpp_30_8", nama: "30.8 Cutting", materi: "", gdriveUrl: "", catatan: "" },
    { id: "tpp_30_9", nama: "30.9 The Weld Joint, Weld Quality, and Testing", materi: "", gdriveUrl: "", catatan: "" },
    { id: "tpp_30_10", nama: "30.10 Joint Design and Process Selection", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "tpp_bab_31", nama: "31. Solid-State Welding Processes", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "tpp_31_1", nama: "31.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "tpp_31_2", nama: "31.2 Cold Welding and Roll Bonding", materi: "", gdriveUrl: "", catatan: "" },
    { id: "tpp_31_3", nama: "31.3 Ultrasonic Welding", materi: "", gdriveUrl: "", catatan: "" },
    { id: "tpp_31_4", nama: "31.4 Friction Welding", materi: "", gdriveUrl: "", catatan: "" },
    { id: "tpp_31_5", nama: "31.5 Resistance Welding", materi: "", gdriveUrl: "", catatan: "" },
    { id: "tpp_31_6", nama: "31.6 Explosion Welding", materi: "", gdriveUrl: "", catatan: "" },
    { id: "tpp_31_7", nama: "31.7 Diffusion Bonding", materi: "", gdriveUrl: "", catatan: "" },
    { id: "tpp_31_8", nama: "31.8 Economics of Welding Operations", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "tpp_bab_32", nama: "32. Brazing, Soldering, Adhesive-bonding, and Mechanical Fastening Processes", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "tpp_32_1", nama: "32.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "tpp_32_2", nama: "32.2 Brazing", materi: "", gdriveUrl: "", catatan: "" },
    { id: "tpp_32_3", nama: "32.3 Soldering", materi: "", gdriveUrl: "", catatan: "" },
    { id: "tpp_32_4", nama: "32.4 Adhesive-bonding", materi: "", gdriveUrl: "", catatan: "" },
    { id: "tpp_32_5", nama: "32.5 Mechanical Fastening", materi: "", gdriveUrl: "", catatan: "" },
    { id: "tpp_32_6", nama: "32.6 Joining Plastics, Ceramics, and Glasses", materi: "", gdriveUrl: "", catatan: "" },
    { id: "tpp_32_7", nama: "32.7 Economics of Joining Operations", materi: "", gdriveUrl: "", catatan: "" }
  ]}
]},
        { id: "pemotongan_pembentukan_logam", nama: "Pemotongan & Pembentukan Logam", warna: "gold", fitur: [
  { id: "ppl_bab_13", nama: "13. Metal-rolling Processes and Equipment", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "ppl_13_1", nama: "13.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_13_2", nama: "13.2 The Flat-rolling Process", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_13_3", nama: "13.3 Flat-rolling Practice", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_13_4", nama: "13.4 Rolling Mills", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_13_5", nama: "13.5 Various Rolling Processes and Mills", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "ppl_bab_14", nama: "14. Metal-forging Processes and Equipment", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "ppl_14_1", nama: "14.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_14_2", nama: "14.2 Open-die Forging", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_14_3", nama: "14.3 Impression-die and Closed-die Forging", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_14_4", nama: "14.4 Various Forging Operations", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_14_5", nama: "14.5 Forgeability of Metals; Forging Defects", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_14_6", nama: "14.6 Die Design, Die Materials, and Lubrication", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_14_7", nama: "14.7 Die-manufacturing Methods and Die Failure", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_14_8", nama: "14.8 Forging Machines", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_14_9", nama: "14.9 Economics of Forging", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "ppl_bab_15", nama: "15. Metal Extrusion and Drawing Processes and Equipment", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "ppl_15_1", nama: "15.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_15_2", nama: "15.2 The Extrusion Process", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_15_3", nama: "15.3 Hot Extrusion", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_15_4", nama: "15.4 Cold Extrusion", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_15_5", nama: "15.5 Extrusion Defects", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_15_6", nama: "15.6 Design Considerations", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_15_7", nama: "15.7 Extrusion Equipment", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_15_8", nama: "15.8 The Drawing Process", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_15_9", nama: "15.9 Drawing Practice", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_15_10", nama: "15.10 Drawing Defects and Residual Stresses", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_15_11", nama: "15.11 Drawing Equipment", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "ppl_bab_16", nama: "16. Sheet-metal Forming Processes and Equipment", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "ppl_16_1", nama: "16.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_16_2", nama: "16.2 Shearing", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_16_3", nama: "16.3 Sheet-metal Characteristics and Formability", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_16_4", nama: "16.4 Formability Tests for Sheet Metals", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_16_5", nama: "16.5 Bending Sheets, Plates, and Tubes", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_16_6", nama: "16.6 Miscellaneous Bending and Related Forming Operations", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_16_7", nama: "16.7 Deep Drawing", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_16_8", nama: "16.8 Rubber Forming and Hydroforming", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_16_9", nama: "16.9 Spinning", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_16_10", nama: "16.10 Superplastic Forming", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_16_11", nama: "16.11 Hot Stamping", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_16_12", nama: "16.12 Specialized Forming Processes", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_16_13", nama: "16.13 Manufacturing of Metal Honeycomb Structures", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_16_14", nama: "16.14 Design Considerations in Sheet-metal Forming", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_16_15", nama: "16.15 Equipment for Sheet-metal Forming", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_16_16", nama: "16.16 Economics of Sheet-forming Operations", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "ppl_bab_21", nama: "21. Fundamentals of Machining", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "ppl_21_1", nama: "21.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_21_2", nama: "21.2 Mechanics of Cutting", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_21_3", nama: "21.3 Cutting Forces and Power", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_21_4", nama: "21.4 Temperatures in Cutting", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_21_5", nama: "21.5 Tool Life: Wear and Failure", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_21_6", nama: "21.6 Surface Finish and Integrity", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_21_7", nama: "21.7 Machinability", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "ppl_bab_23", nama: "23. Machining Processes: Turning and Hole Making", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "ppl_23_1", nama: "23.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_23_2", nama: "23.2 The Turning Process", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_23_3", nama: "23.3 Lathes and Lathe Operations", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_23_4", nama: "23.4 Boring and Boring Machines", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_23_5", nama: "23.5 Drilling, Drills, and Drilling Machines", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_23_6", nama: "23.6 Reaming and Reamers", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_23_7", nama: "23.7 Tapping and Taps", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "ppl_bab_24", nama: "24. Machining Processes: Milling, Broaching, Sawing, Filing, and Gear Manufacturing", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "ppl_24_1", nama: "24.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_24_2", nama: "24.2 Milling and Milling Machines", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_24_3", nama: "24.3 Planing and Shaping", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_24_4", nama: "24.4 Broaching and Broaching Machines", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_24_5", nama: "24.5 Sawing", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_24_6", nama: "24.6 Filing", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_24_7", nama: "24.7 Gear Manufacturing by Machining", materi: "", gdriveUrl: "", catatan: "" }
  ]},
  { id: "ppl_bab_26", nama: "26. Abrasive Machining and Finishing Operations", materi: "", gdriveUrl: "", catatan: "", parts: [
    { id: "ppl_26_1", nama: "26.1 Introduction", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_26_2", nama: "26.2 Abrasives and Bonded Abrasives", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_26_3", nama: "26.3 The Grinding Process", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_26_4", nama: "26.4 Grinding Operations and Machines", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_26_5", nama: "26.5 Design Considerations for Grinding", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_26_6", nama: "26.6 Ultrasonic Machining", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_26_7", nama: "26.7 Finishing Operations", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_26_8", nama: "26.8 Deburring Operations", materi: "", gdriveUrl: "", catatan: "" },
    { id: "ppl_26_9", nama: "26.9 Economics of Abrasive Machining and Finishing Operations", materi: "", gdriveUrl: "", catatan: "" }
  ]}
]},
        { id: "analisis_kegagalan", nama: "Analisis Kegagalan", warna: "red", fitur: [] },
        { id: "corrosion_control", nama: "Corrosion Control & Mitigation", warna: "gray", fitur: [] },
        { id: "material_komposit", nama: "Material Komposit", warna: "purple", fitur: [] },
      ]},
      { id: "desain_gambar", nama: "🎨 Desain & Gambar", tools: [
        { id: "gambar_teknik", nama: "Gambar Teknik", warna: "purple", fitur: [] },
        { id: "desain_elemen_mesin", nama: "Desain Elemen Mesin", warna: "pink", fitur: [] },
        { id: "desain_produk", nama: "Desain Produk", warna: "pink", fitur: [] },
        { id: "reverse_engineering", nama: "Reverse Engineering", warna: "purple", fitur: [] },
      ]},
      { id: "kontrol_elektronika", nama: "🤖 Kontrol & Elektronika", tools: [
        { id: "mekatronika", nama: "Mekatronika", warna: "yellow", fitur: [] },
        { id: "kontrol_otomatik", nama: "Teknik Kontrol Otomatik", warna: "yellow", fitur: [] },
        { id: "sistem_penggerak_elektrik", nama: "Sistem Penggerak Elektrik", warna: "orange", fitur: [] },
        { id: "maintenance_reliability", nama: "Maintenance & Reliability", warna: "gray", fitur: [] },
      ]},
      { id: "umum_manajemen", nama: "📋 Umum & Manajemen", tools: [
        { id: "k3l", nama: "K3L", warna: "green", fitur: [] },
        { id: "kelayakan_proyek", nama: "Analisis Kelayakan Proyek", warna: "green", fitur: [] },
        { id: "technopreneurship", nama: "Technopreneurship", warna: "green", fitur: [] },
        { id: "metodologi_penelitian", nama: "Metodologi Penelitian", warna: "indigo", fitur: [] },
      ]},
    ],
  },
];

export const DEFAULT_TARGET_HARIAN = { design: { target: 1, satuan: "materi" }, bahasa: { target: 1, satuan: "materi" }, agama: { target: 1, satuan: "bab" }, review_mesin: { target: 1, satuan: "materi" } };

export function generateId(prefix = "id") { return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`; }

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
  const now = new Date(); const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const senin = new Date(now.setDate(diff));
  return senin.toISOString().split("T")[0];
}

export function formatMinggu(tanggal) { const d = new Date(tanggal); return `Minggu ${d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}`; }
export function kategoriPunyaKaryaMingguan(kategoriId) { return kategoriId === "design"; }
export function getKategoriIdFromPath(path) { if (!path || path.length === 0) return null; return path[0]; }
export function getLabelKategoriById(kategoriList, kategoriId) { return kategoriList.find((k) => k.id === kategoriId)?.nama || kategoriId; }
export function getDefaultTargetByKategori(kategoriId) { return DEFAULT_TARGET_HARIAN[kategoriId] || { target: 1, satuan: "materi" }; }
export function getDefaultWarnaByKategori(kategoriId) { return DEFAULT_WARNA_KATEGORI[kategoriId] || "gray"; }

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

export function getWarnaStyle(warnaId) { return WARNA_OPTIONS.find((w) => w.id === warnaId) || WARNA_OPTIONS[9]; }
export function initLogHarian() { return {}; }
export function getLogByKategoriTanggal(logHarian, kategoriId, tanggal) { if (!logHarian || !logHarian[tanggal]) return []; return (logHarian[tanggal] || []).filter((log) => log.kategoriId === kategoriId); }

export function hitungProgressBelajar(kategoriData, logHarian, kategoriId) {
  let totalItem = 0;
  const kategori = kategoriData.find((k) => k.id === kategoriId);
  if (!kategori) return { totalItem: 0, itemSelesai: 0, persen: 0 };
  const kumpulinLeaf = (items) => { items.forEach((item) => { if (item.subKategori) kumpulinLeaf(item.subKategori); else if (item.tools) kumpulinLeaf(item.tools); else if (item.fitur && item.fitur.length > 0) kumpulinLeaf(item.fitur); else if (item.parts) kumpulinLeaf(item.parts); else totalItem++; }); };
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