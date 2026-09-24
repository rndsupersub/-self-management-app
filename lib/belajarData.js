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
        { id: "fisika_1", nama: "Fisika I", warna: "blue", fitur: [] },
        { id: "fisika_2", nama: "Fisika II", warna: "blue", fitur: [] },
        { id: "kimia_dasar", nama: "Kimia Dasar", warna: "green", fitur: [] },
      ]},
      { id: "material_struktur", nama: "🧱 Material & Struktur", tools: [
        { id: "material_teknik", nama: "Material Teknik", warna: "orange", fitur: [] },
        { id: "struktur_properti_material", nama: "Struktur & Properti Material", warna: "orange", fitur: [] },
        { id: "mekanika_kekuatan_material", nama: "Mekanika Kekuatan Material", warna: "red", fitur: [] },
        { id: "statika_struktur", nama: "Statika Struktur", warna: "red", fitur: [] },
        { id: "karakterisasi_material", nama: "Karakterisasi Material", warna: "orange", fitur: [] },
      ]},
      { id: "mekanika_termofluida", nama: "⚙️ Mekanika & Termofluida", tools: [
        { id: "termodinamika", nama: "Termodinamika", warna: "blue", fitur: [] },
        { id: "perpindahan_kalor", nama: "Perpindahan Kalor", warna: "red", fitur: [] },
        { id: "mekanika_fluida", nama: "Mekanika Fluida", warna: "blue", fitur: [] },
        { id: "getaran_mekanik", nama: "Getaran Mekanik", warna: "yellow", fitur: [] },
        { id: "kinematika_dinamika", nama: "Kinematika & Dinamika", warna: "yellow", fitur: [] },
        { id: "analisis_teknik", nama: "Analisis Teknik", warna: "indigo", fitur: [] },
      ]},
      { id: "manufaktur_produksi", nama: "🏭 Manufaktur & Produksi", tools: [
        { id: "proses_manufaktur", nama: "Proses Manufaktur", warna: "red", fitur: [] },
        { id: "proses_manufaktur_lanjut", nama: "Proses Manufaktur Lanjut", warna: "red", fitur: [] },
        { id: "pengecoran_pengelasan", nama: "Teknik Pengecoran & Pengelasan", warna: "orange", fitur: [] },
        { id: "pemotongan_pembentukan", nama: "Pemotongan & Pembentukan Logam", warna: "orange", fitur: [] },
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