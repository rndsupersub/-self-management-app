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
    id: "design",
    nama: "🎨 Belajar Design",
    warna: "purple",
    subKategori: [
      {
        id: "2d", nama: "🖌️ 2D Design",
        tools: [
          {
            id: "illustrator", nama: "Illustrator", warna: "purple",
            fitur: [
              {
                id: "adobe_illustrator_beginners",
                nama: "Adobe Illustrator Tutorial for Beginners",
                materi:
                  "📌 Adobe Illustrator Tutorial for Beginners\n" +
                  "• Video full course: ~4 jam\n" +
                  "• Channel: Bring Your Own Laptop\n" +
                  "• URL: https://youtu.be/r9gaPGQ1EG0\n\n" +
                  "📌 Chapter (Part)\n" +
                  "1. Introduction --- 0:00\n" +
                  "2. Getting Started --- 1:11\n" +
                  "3. What is Adobe Illustrator used for? --- 2:58\n" +
                  "4. Quick Tour --- 6:38\n" +
                  "5. Draw Rounded Rectangles --- 17:34\n" +
                  "6. How to Draw Lines --- 32:20\n" +
                  "7. Scaling Stroke Effects --- 49:10\n" +
                  "8. Saving to Creative Cloud --- 55:48\n" +
                  "9. Exporting Images --- 1:09:39\n" +
                  "10. Shape Builder Tool --- 1:14:34\n" +
                  "11. Class Project 2 --- 1:25:09\n" +
                  "12. Layer --- 1:46:17\n" +
                  "13. Math in Fields --- 1:57:24\n" +
                  "14. Class Project 3 --- 2:10:09\n" +
                  "15. Curvature Tool --- 2:11:16\n" +
                  "16. Curves & Straight Lines --- 2:25:12\n" +
                  "17. Class Project 4 --- 2:32:53\n" +
                  "18. Combining Shapes --- 2:36:14\n" +
                  "19. Pen Tool --- 2:48:18\n" +
                  "20. Class Project 5 --- 3:02:14\n" +
                  "21. Panel Tidying Up --- 3:23:39\n" +
                  "22. Class Project 6 --- 3:26:20\n" +
                  "23. Combining Tools --- 3:38:10\n" +
                  "24. Class Project 7 --- 2:36:53\n" +
                  "25. AI Generative Recoloring --- 2:42:56\n" +
                  "26. Mood Boards --- 2:47:41\n" +
                  "27. Class Project 8 --- 3:32:31\n" +
                  "28. Class Project 9 --- 3:52:30\n" +
                  "29. Printing T-Shirt --- 3:57:40\n\n" +
                  "📌 Catatan: Tutorial dari nol sampai bisa desain T-shirt.",
                parts: [
                  { id: "part_1", nama: "Part 1: Introduction", materi: "📌 Timestamp: 0:00\n\n📌 Materi\n• Perkenalan course\n• Apa yang bakal dipelajari\n\n📌 Sumber: Adobe Illustrator Tutorial for Beginners, Part 1.", gdriveUrl: "", catatan: "" },
                  { id: "part_2", nama: "Part 2: Getting Started", materi: "📌 Timestamp: 1:11\n\n📌 Materi\n• Cara mulai pakai Illustrator\n• Setup awal\n\n📌 Sumber: Adobe Illustrator Tutorial for Beginners, Part 2.", gdriveUrl: "", catatan: "" },
                  { id: "part_3", nama: "Part 3: What is Illustrator Used For?", materi: "📌 Timestamp: 2:58\n\n📌 Materi\n• Fungsi Illustrator\n• Bedanya sama Photoshop\n• Contoh penggunaan\n\n📌 Sumber: Adobe Illustrator Tutorial for Beginners, Part 3.", gdriveUrl: "", catatan: "" },
                  { id: "part_4", nama: "Part 4: Quick Tour", materi: "📌 Timestamp: 6:38\n\n📌 Materi\n• Interface Illustrator\n• Toolbar, panel, artboard\n• Navigasi dasar\n\n📌 Sumber: Adobe Illustrator Tutorial for Beginners, Part 4.", gdriveUrl: "", catatan: "" },
                  { id: "part_5", nama: "Part 5: Draw Rounded Rectangles", materi: "📌 Timestamp: 17:34\n\n📌 Materi\n• Bikin rounded rectangle\n• Atur radius sudut\n• Fill & stroke\n\n📌 Sumber: Adobe Illustrator Tutorial for Beginners, Part 5.", gdriveUrl: "", catatan: "" },
                  { id: "part_6", nama: "Part 6: How to Draw Lines", materi: "📌 Timestamp: 32:20\n\n📌 Materi\n• Line tool\n• Atur ketebalan (stroke)\n• Line cap & join\n\n📌 Sumber: Adobe Illustrator Tutorial for Beginners, Part 6.", gdriveUrl: "", catatan: "" },
                  { id: "part_7", nama: "Part 7: Scaling Stroke Effects", materi: "📌 Timestamp: 49:10\n\n📌 Materi\n• Efek scaling stroke\n• Scale tool\n• Transform\n\n📌 Sumber: Adobe Illustrator Tutorial for Beginners, Part 7.", gdriveUrl: "", catatan: "" },
                  { id: "part_8", nama: "Part 8: Saving to Creative Cloud", materi: "📌 Timestamp: 55:48\n\n📌 Materi\n• Simpan ke Creative Cloud\n• Cloud document\n\n📌 Sumber: Adobe Illustrator Tutorial for Beginners, Part 8.", gdriveUrl: "", catatan: "" },
                  { id: "part_9", nama: "Part 9: Exporting Images", materi: "📌 Timestamp: 1:09:39\n\n📌 Materi\n• Export gambar (PNG, JPG, SVG)\n• Atur resolusi\n\n📌 Sumber: Adobe Illustrator Tutorial for Beginners, Part 9.", gdriveUrl: "", catatan: "" },
                  { id: "part_10", nama: "Part 10: Shape Builder Tool", materi: "📌 Timestamp: 1:14:34\n\n📌 Materi\n• Shape Builder Tool\n• Gabungin & potong shape\n\n📌 Sumber: Adobe Illustrator Tutorial for Beginners, Part 10.", gdriveUrl: "", catatan: "" },
                  { id: "part_11", nama: "Part 11: Class Project 2", materi: "📌 Timestamp: 1:25:09\n\n📌 Materi\n• Latihan project\n\n📌 Sumber: Adobe Illustrator Tutorial for Beginners, Part 11.", gdriveUrl: "", catatan: "" },
                  { id: "part_12", nama: "Part 12: Layer", materi: "📌 Timestamp: 1:46:17\n\n📌 Materi\n• Layer panel\n• Organisir objek\n• Lock & hide layer\n\n📌 Sumber: Adobe Illustrator Tutorial for Beginners, Part 12.", gdriveUrl: "", catatan: "" },
                  { id: "part_13", nama: "Part 13: Math in Fields", materi: "📌 Timestamp: 1:57:24\n\n📌 Materi\n• Pakai matematika di field input\n• Kalkulasi cepat\n\n📌 Sumber: Adobe Illustrator Tutorial for Beginners, Part 13.", gdriveUrl: "", catatan: "" },
                  { id: "part_14", nama: "Part 14: Class Project 3", materi: "📌 Timestamp: 2:10:09\n\n📌 Materi\n• Latihan project\n\n📌 Sumber: Adobe Illustrator Tutorial for Beginners, Part 14.", gdriveUrl: "", catatan: "" },
                  { id: "part_15", nama: "Part 15: Curvature Tool", materi: "📌 Timestamp: 2:11:16\n\n📌 Materi\n• Curvature Tool\n• Bikin curve halus\n\n📌 Sumber: Adobe Illustrator Tutorial for Beginners, Part 15.", gdriveUrl: "", catatan: "" },
                  { id: "part_16", nama: "Part 16: Curves & Straight Lines", materi: "📌 Timestamp: 2:25:12\n\n📌 Materi\n• Gabungin curve & garis lurus\n\n📌 Sumber: Adobe Illustrator Tutorial for Beginners, Part 16.", gdriveUrl: "", catatan: "" },
                  { id: "part_17", nama: "Part 17: Class Project 4", materi: "📌 Timestamp: 2:32:53\n\n📌 Materi\n• Latihan project\n\n📌 Sumber: Adobe Illustrator Tutorial for Beginners, Part 17.", gdriveUrl: "", catatan: "" },
                  { id: "part_18", nama: "Part 18: Combining Shapes", materi: "📌 Timestamp: 2:36:14\n\n📌 Materi\n• Pathfinder\n• Gabungin shape\n\n📌 Sumber: Adobe Illustrator Tutorial for Beginners, Part 18.", gdriveUrl: "", catatan: "" },
                  { id: "part_19", nama: "Part 19: Pen Tool", materi: "📌 Timestamp: 2:48:18\n\n📌 Materi\n• Pen Tool\n• Bikin path manual\n• Anchor point & handle\n\n📌 Sumber: Adobe Illustrator Tutorial for Beginners, Part 19.", gdriveUrl: "", catatan: "" },
                  { id: "part_20", nama: "Part 20: Class Project 5", materi: "📌 Timestamp: 3:02:14\n\n📌 Materi\n• Latihan project\n\n📌 Sumber: Adobe Illustrator Tutorial for Beginners, Part 20.", gdriveUrl: "", catatan: "" },
                  { id: "part_21", nama: "Part 21: Panel Tidying Up", materi: "📌 Timestamp: 3:23:39\n\n📌 Materi\n• Rapiin panel\n• Custom workspace\n\n📌 Sumber: Adobe Illustrator Tutorial for Beginners, Part 21.", gdriveUrl: "", catatan: "" },
                  { id: "part_22", nama: "Part 22: Class Project 6", materi: "📌 Timestamp: ~3:26:20\n\n📌 Materi\n• Latihan project\n\n📌 Sumber: Adobe Illustrator Tutorial for Beginners, Part 22.", gdriveUrl: "", catatan: "" },
                  { id: "part_23", nama: "Part 23: Combining Tools", materi: "📌 Timestamp: ~3:38:10\n\n📌 Materi\n• Gabungin beberapa tool\n\n📌 Sumber: Adobe Illustrator Tutorial for Beginners, Part 23.", gdriveUrl: "", catatan: "" },
                  { id: "part_24", nama: "Part 24: Class Project 7", materi: "📌 Timestamp: 2:36:53\n\n📌 Materi\n• Latihan project\n\n📌 Sumber: Adobe Illustrator Tutorial for Beginners, Part 24.", gdriveUrl: "", catatan: "" },
                  { id: "part_25", nama: "Part 25: AI Generative Recoloring", materi: "📌 Timestamp: 2:42:56\n\n📌 Materi\n• AI Generative Recoloring\n• Ubah warna otomatis\n\n📌 Sumber: Adobe Illustrator Tutorial for Beginners, Part 25.", gdriveUrl: "", catatan: "" },
                  { id: "part_26", nama: "Part 26: Mood Boards", materi: "📌 Timestamp: 2:47:41\n\n📌 Materi\n• Bikin mood board\n• Inspirasi desain\n\n📌 Sumber: Adobe Illustrator Tutorial for Beginners, Part 26.", gdriveUrl: "", catatan: "" },
                  { id: "part_27", nama: "Part 27: Class Project 8", materi: "📌 Timestamp: 3:32:31\n\n📌 Materi\n• Latihan project\n\n📌 Sumber: Adobe Illustrator Tutorial for Beginners, Part 27.", gdriveUrl: "", catatan: "" },
                  { id: "part_28", nama: "Part 28: Class Project 9", materi: "📌 Timestamp: 3:52:30\n\n📌 Materi\n• Latihan project\n\n📌 Sumber: Adobe Illustrator Tutorial for Beginners, Part 28.", gdriveUrl: "", catatan: "" },
                  { id: "part_29", nama: "Part 29: Printing T-Shirt", materi: "📌 Timestamp: 3:57:40\n\n📌 Materi\n• Desain T-shirt\n• Proses printing\n\n📌 Sumber: Adobe Illustrator Tutorial for Beginners, Part 29.", gdriveUrl: "", catatan: "" },
                ],
              },
            ],
            karyaMingguan: [],
          },
          {
            id: "photoshop", nama: "Photoshop", warna: "pink",
            fitur: [
              { id: "layer_ps", nama: "Layer", materi: "", gdriveUrl: "", catatan: "" },
              { id: "selection", nama: "Selection", materi: "", gdriveUrl: "", catatan: "" },
            ],
            karyaMingguan: [],
          },
        ],
      },
      {
        id: "3d", nama: "🧊 3D Design",
        tools: [
          {
            id: "blender", nama: "Blender", warna: "orange",
            fitur: [
              {
                id: "blender_guru_donut",
                nama: "Blender Guru --- Donut",
                materi:
                  "📌 Beginner Blender Tutorial (2026)\n" +
                  "• Video full course: 4 jam 55 menit\n" +
                  "• Channel: Blender Guru\n" +
                  "• URL: https://www.youtube.com/watch?v=z-Xl9tGqH14\n\n" +
                  "📌 8 Chapter (Part)\n" +
                  "1. Part 1 The Basics --- 00:00\n" +
                  "2. Part 2 Basic Modelling --- 28:16\n" +
                  "3. Part 3 Organic Modelling --- 59:05\n" +
                  "4. Part 4 Materials --- 1:30:13\n" +
                  "5. Part 5 Texturing --- 2:03:46\n" +
                  "6. Part 6 UV Unwrapping --- 2:35:40\n" +
                  "7. Part 7 Scattering --- 3:09:26\n" +
                  "8. Part 8 Lighting and Rendering --- 3:46:11\n\n" +
                  "📌 Catatan: Tutorial ini bikin donut + kopi dari nol sampai render final.",
                parts: [
                  { id: "part_1", nama: "Part 1: The Basics", materi: "📌 Timestamp: 00:00 -- 28:16\n\n📌 Materi\n• Intro & kenalan sama Blender 4.0\n• Download & install Blender\n• Interface: viewport, toolbar, outliner, properties\n• Navigasi: orbit, pan, zoom\n• Render mode & camera dasar\n• Bikin objek pertama (donut) + material dasar\n• Render pertama\n\n📌 Output: Donut sederhana + render pertama.\n\n📌 Sumber: Beginner Blender Tutorial (2026), Part 1.", gdriveUrl: "", catatan: "" },
                  { id: "part_2", nama: "Part 2: Basic Modelling", materi: "📌 Timestamp: 28:16 -- 59:05\n\n📌 Materi\n• Scale & rotation\n• Add torus (cincin donut)\n• Subdivision surface modifier\n• Proportional editing\n• Deformasi donut biar nggak kaku\n• Duplicate object\n• Name objects biar rapi\n\n📌 Output: Donut udah punya bentuk realistis.\n\n📌 Sumber: Beginner Blender Tutorial (2026), Part 2.", gdriveUrl: "", catatan: "" },
                  { id: "part_3", nama: "Part 3: Organic Modelling", materi: "📌 Timestamp: 59:05 -- 1:30:13\n\n📌 Materi\n• Solidify modifier\n• Snap to face\n• Apply subsurf\n• Bikin icing (lelehan coklat) bergelombang\n• Extrude icing\n• Shrinkwrap modifier\n• Sculpt mode: inflate, grab, mask brush\n• Filter & smooth brush\n\n📌 Output: Donut + icing realistis.\n\n📌 Sumber: Beginner Blender Tutorial (2026), Part 3.", gdriveUrl: "", catatan: "" },
                  { id: "part_4", nama: "Part 4: Materials", materi: "📌 Timestamp: 1:30:13 -- 2:03:46\n\n📌 Materi\n• Bikin countertop (meja)\n• Parenting objects\n• Material nodes dasar\n• Countertop texture: roughness map, normal map\n• Material donut & icing\n• Texture painting dasar\n\n📌 Output: Donut & meja punya material realistis.\n\n📌 Sumber: Beginner Blender Tutorial (2026), Part 4.", gdriveUrl: "", catatan: "" },
                  { id: "part_5", nama: "Part 5: Texturing", materi: "📌 Timestamp: 2:03:46 -- 2:35:40\n\n📌 Materi\n• Bikin sprinkle (meses) pakai geometry nodes\n• Scatter points\n• Poisson disk\n• Weight painting\n• Real-world size\n• Fix sprinkle density\n\n📌 Output: Sprinkle tersebar di atas icing.\n\n📌 Sumber: Beginner Blender Tutorial (2026), Part 5.", gdriveUrl: "", catatan: "" },
                  { id: "part_6", nama: "Part 6: UV Unwrapping", materi: "📌 Timestamp: 2:35:40 -- 3:09:26\n\n📌 Materi\n• Model sprinkle (cylinder)\n• Sprinkle variants\n• Organize with collections\n• Scattering collection\n• Random rotation (Euler)\n• Distance & sizing sprinkle\n• UV unwrap dasar\n\n📌 Output: Sprinkle variatif & punya UV map.\n\n📌 Sumber: Beginner Blender Tutorial (2026), Part 6.", gdriveUrl: "", catatan: "" },
                  { id: "part_7", nama: "Part 7: Scattering", materi: "📌 Timestamp: 3:09:26 -- 3:46:11\n\n📌 Materi\n• Apply material ke multiple objects\n• Random values per material\n• Metallic sprinkle\n• Bikin piring & kopi\n• Stack donut\n• Assign sprinkle\n• Scale countertop & backsplash\n• Icing colors & ceramic plate material\n\n📌 Output: Scene lengkap: donut, piring, kopi, meja.\n\n📌 Sumber: Beginner Blender Tutorial (2026), Part 7.", gdriveUrl: "", catatan: "" },
                  { id: "part_8", nama: "Part 8: Lighting and Rendering", materi: "📌 Timestamp: 3:46:11 -- 4:55:00\n\n📌 Materi\n• Sky texture lighting\n• Kitchen enclosure & window\n• Shaping light & install addon\n• Compositor: glare, lens distortion, chromatic aberration\n• Color management (AgX)\n• Animation: keyframe, dope sheet, graph editor\n• Keyframe ease & scale\n• Sample count & noise threshold\n• Render still + image sequence\n• Depth of field & motion blur\n• Video editing & export final\n\n📌 Output: Render final + animasi donut.\n\n📌 Sumber: Beginner Blender Tutorial (2026), Part 8.", gdriveUrl: "", catatan: "" },
                ],
              },
            ],
            karyaMingguan: [],
          },
          {
            id: "solidworks", nama: "SolidWorks", warna: "teal",
            fitur: [
              {
                id: "basic_features", nama: "Basic Features",
                fitur: [
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
                ],
              },
              {
                id: "assembly", nama: "Assembly",
                fitur: [
                  { id: "basic_assembly", nama: "Basic Assembly", materi: "", gdriveUrl: "", catatan: "" },
                  { id: "advanced_mates", nama: "Advanced Mates", materi: "", gdriveUrl: "", catatan: "" },
                  { id: "assembly_new_part", nama: "Assembly New Part", materi: "", gdriveUrl: "", catatan: "" },
                  { id: "exploded_view", nama: "Exploded View", materi: "", gdriveUrl: "", catatan: "" },
                ],
              },
              {
                id: "drawing", nama: "Drawing",
                fitur: [
                  { id: "drawing_basics", nama: "Drawing Basics", materi: "", gdriveUrl: "", catatan: "" },
                  { id: "exploded_drawing", nama: "Exploded Drawing", materi: "", gdriveUrl: "", catatan: "" },
                ],
              },
              {
                id: "surface_modeling", nama: "Surface Modeling",
                fitur: [
                  { id: "surface_basics", nama: "Surface Basics", materi: "", gdriveUrl: "", catatan: "" },
                ],
              },
              {
                id: "advanced_modeling", nama: "Advanced Modeling",
                fitur: [
                  { id: "advanced_basics", nama: "Advanced Basics", materi: "", gdriveUrl: "", catatan: "" },
                ],
              },
              {
                id: "sheet_metal", nama: "Sheet Metal",
                fitur: [
                  { id: "base_flange", nama: "Base Flange", materi: "", gdriveUrl: "", catatan: "" },
                  { id: "edge_flange", nama: "Edge Flange", materi: "", gdriveUrl: "", catatan: "" },
                ],
              },
              { id: "electrical", nama: "Electrical", fitur: [] },
              { id: "mould_design", nama: "Mould Design", fitur: [] },
              { id: "weldments", nama: "Weldments", fitur: [] },
              { id: "routing", nama: "Routing", fitur: [] },
              { id: "simulation", nama: "Simulation", fitur: [] },
              { id: "plastic", nama: "Plastic", fitur: [] },
              { id: "cam", nama: "CAM", fitur: [] },
              { id: "visualize", nama: "Visualize", fitur: [] },
              { id: "pdm", nama: "PDM", fitur: [] },
            ],
            karyaMingguan: [],
          },
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
          { id: "grammar", nama: "Grammar", warna: "blue", fitur: [] },
          { id: "listening", nama: "Listening", warna: "indigo", fitur: [] },
        ],
      },
      {
        id: "mandarin", nama: "Bahasa Mandarin",
        tools: [{ id: "hsk_1", nama: "HSK 1", warna: "blue", fitur: [] }],
      },
    ],
  },

  {
    id: "agama", nama: "📖 Belajar Agama", warna: "green",
    subKategori: [
      {
        id: "fiqih", nama: "Fiqih Syafii",
        tools: [
          {
            id: "bab_1_thaharah", nama: "Bab I: Thaharah", warna: "green",
            fitur: [
              { id: "air_najis", nama: "Air & Najis", gdriveUrl: "", catatan: "", materi: "📌 Air yang Suci & Menyucikan\n• Air mutlak (hujan, sungai, sumur, laut) suci dan menyucikan.\n• Air 2 qullah (5 geriba) tidak jadi najis kecuali berubah warna, bau, atau rasa.\n• Air < 2 qullah jadi najis jika terkena najis meskipun tidak berubah.\n\n📌 Najis\n• Bangkai, darah, daging babi, khamer, air kencing, tinja.\n• Bangkai ikan & belalang tidak najis.\n• Kulit bangkai jadi suci jika disamak.\n\n📌 Sumber: Al Umm (Imam Syafi'i), Bab Thaharah." },
              { id: "wudhu", nama: "Wudhu", gdriveUrl: "", catatan: "", materi: "📌 Fardhu Wudhu (QS. Al-Maa'idah: 6)\n1. Niat\n2. Membasuh wajah\n3. Membasuh kedua tangan sampai siku\n4. Mengusap kepala\n5. Membasuh kedua kaki sampai mata kaki\n6. Tertib (berurutan)\n\n📌 Sunnah Wudhu\n• Membaca basmalah\n• Membasuh kedua tangan 3x sebelum wudhu\n• Berkumur 3x\n• Istinsyaq (hirup air ke hidung) 3x\n• Mengusap seluruh kepala\n• Mengusap kedua telinga\n• Membasuh 3x setiap anggota\n\n📌 Sumber: Al Umm, Bab Wudhu." },
              { id: "mandi_wajib", nama: "Mandi Wajib", gdriveUrl: "", catatan: "", materi: "📌 Hal yang Mewajibkan Mandi\n1. Junub (persetubuhan meskipun tidak keluar mani, atau keluar mani)\n2. Selesai haidh\n3. Selesai nifas\n\n📌 Fardhu Mandi\n1. Niat\n2. Membasuh seluruh tubuh dengan air\n3. Menghilangkan najis jika ada\n\n📌 Sunnah Mandi\n• Wudhu sebelum mandi\n• Mengguyur kepala 3x\n• Menyela rambut\n• Mendahulukan kanan\n\n📌 Sumber: Al Umm, Bab Mandi." },
              { id: "tayammum", nama: "Tayammum", gdriveUrl: "", catatan: "", materi: "📌 Kapan Boleh Tayammum\n1. Tidak ada air\n2. Sakit (khawatir air membahayakan)\n3. Perjalanan (musafir)\n\n📌 Cara Tayammum\n1. Niat\n2. Menepuk debu/tanah suci dengan kedua tangan\n3. Mengusap wajah\n4. Mengusap kedua tangan sampai siku\n5. Tertib\n\n📌 Catatan\n• Debu harus suci dan berupa debu (bukan batu, kapur, dll).\n• Tayammum berlaku untuk satu shalat fardhu.\n• Jika menemukan air, wajib berwudhu.\n\n📌 Sumber: Al Umm, Bab Tayammum." },
            ],
          },
          {
            id: "bab_2_shalat", nama: "Bab II: Shalat", warna: "green",
            fitur: [
              { id: "syarat_rukun", nama: "Syarat & Rukun", gdriveUrl: "", catatan: "", materi: "📌 Syarat Shalat\n1. Suci dari hadats dan najis\n2. Menutup aurat\n3. Menghadap kiblat\n4. Masuk waktu shalat\n5. Mengetahui fardhu dan sunnah\n\n📌 Rukun Shalat (13)\n1. Niat\n2. Takbiratul ihram\n3. Berdiri (bagi yang mampu)\n4. Membaca Al-Fatihah\n5. Ruku\n6. I'tidal\n7. Sujud 2x\n8. Duduk antara 2 sujud\n9. Duduk tasyahud akhir\n10. Membaca tasyahud\n11. Membaca shalawat\n12. Salam\n13. Tertib\n\n📌 Sumber: Madzhab Syafii (umum)." },
              { id: "shalat_wajib", nama: "Shalat Wajib", gdriveUrl: "", catatan: "", materi: "📌 Shalat Wajib 5 Waktu\n1. Subuh: 2 rakaat\n2. Zhuhur: 4 rakaat\n3. Ashar: 4 rakaat\n4. Maghrib: 3 rakaat\n5. Isya: 4 rakaat\n\n📌 Qashar\n• Musafir boleh qashar (meringkas) shalat 4 rakaat jadi 2 rakaat.\n• Syarat: perjalanan minimal 2 marhalah (~80 km), bukan maksiat.\n\n📌 Jamak\n• Boleh jamak (menggabung) Zhuhur-Ashar, Maghrib-Isya.\n• Jamak taqdim (di waktu pertama) atau ta'khir (di waktu kedua).\n\n📌 Sumber: Al Umm, Bab Shalat." },
              { id: "shalat_sunnah", nama: "Shalat Sunnah", gdriveUrl: "", catatan: "", materi: "📌 Shalat Sunnah Rawatib\n• 2 rakaat sebelum Subuh\n• 4 rakaat sebelum Zhuhur, 2 rakaat sesudah\n• 2 rakaat sesudah Maghrib\n• 2 rakaat sesudah Isya\n\n📌 Shalat Sunnah Lain\n• Tahajud (malam)\n• Witir (penutup malam)\n• Dhuha\n• Tarawih (Ramadhan)\n\n📌 Catatan\n• Boleh dikerjakan sambil duduk.\n• Boleh di kendaraan (untuk sunnah).\n\n📌 Sumber: Al Umm, Bab Shalat Sunnah." },
              { id: "sujud_sahwi", nama: "Sujud Sahwi", gdriveUrl: "", catatan: "", materi: "📌 Sujud Sahwi\n• Sujud 2x sebelum salam (atau sesudah salam) karena lupa.\n\n📌 Penyebab\n1. Meninggalkan sunnah ab'adh (tasyahud awal, qunut, dll)\n2. Ragu jumlah rakaat\n3. Kelebihan/kekurangan rakaat\n\n📌 Cara\n• Takbir, sujud 2x, duduk, salam.\n• Atau sujud setelah salam.\n\n📌 Sumber: Madzhab Syafii (umum)." },
            ],
          },
          {
            id: "bab_3_zakat", nama: "Bab III: Zakat", warna: "green",
            fitur: [
              { id: "zakat_harta", nama: "Zakat Harta", gdriveUrl: "", catatan: "", materi: "📌 Zakat Emas & Perak\n• Emas: nishab 20 dinar (~85 gram), zakat 2.5%\n• Perak: nishab 200 dirham (~595 gram), zakat 2.5%\n\n📌 Zakat Hewan Ternak\n• Unta: nishab 5 ekor\n• Sapi: nishab 30 ekor\n• Kambing: nishab 40 ekor\n\n📌 Zakat Tanaman\n• Kurma, anggur, gandum, syair, jagung\n• Nishab 5 wasaq (~653 kg), zakat 10% (air hujan) atau 5% (irigasi)\n\n📌 Rikaz (Harta Karun)\n• Zakat 20%\n\n📌 Sumber: Al Umm, Bab Zakat." },
              { id: "zakat_fitrah", nama: "Zakat Fitrah", gdriveUrl: "", catatan: "", materi: "📌 Zakat Fitrah\n• Wajib bagi setiap muslim yang mampu.\n• Besar: 1 sha' (~2.5 kg) makanan pokok.\n• Waktu: sebelum shalat Idul Fitri.\n• Untuk: fakir, miskin, amil, muallaf, dll.\n\n📌 Sumber: Madzhab Syafii (umum)." },
            ],
          },
          {
            id: "bab_4_puasa", nama: "Bab IV: Puasa", warna: "green",
            fitur: [
              { id: "puasa_ramadhan", nama: "Puasa Ramadhan", gdriveUrl: "", catatan: "", materi: "📌 Puasa Ramadhan\n• Wajib bagi setiap muslim yang baligh, berakal, mampu.\n• Yang boleh tidak puasa: sakit, musafir, haidh, nifas, hamil, menyusui, tua.\n• Qadha: wajib ganti di hari lain (kecuali tua & sakit permanen, bayar fidyah).\n\n📌 Yang Membatalkan\n• Makan, minum, muntah sengaja, jima', keluar mani sengaja, haidh/nifas.\n\n📌 Sumber: Madzhab Syafii (umum)." },
              { id: "puasa_sunnah", nama: "Puasa Sunnah", gdriveUrl: "", catatan: "", materi: "📌 Puasa Sunnah\n• Senin & Kamis\n• Ayyamul Bidh (13, 14, 15 Hijriyah)\n• Arafah (9 Dzulhijjah)\n• Asyura (10 Muharram)\n• 6 hari Syawal\n• Sya'ban\n\n📌 Sumber: Madzhab Syafii (umum)." },
            ],
          },
          {
            id: "bab_5_haji", nama: "Bab V: Haji", warna: "green",
            fitur: [
              { id: "haji_wajib", nama: "Haji Wajib", gdriveUrl: "", catatan: "", materi: "📌 Haji Wajib\n• Wajib bagi muslim yang mampu (sabil = bekal + kendaraan).\n• Sekali seumur hidup.\n\n📌 Rukun Haji\n1. Ihram\n2. Wukuf di Arafah\n3. Thawaf ifadhah\n4. Sai\n5. Tahallul\n6. Tertib\n\n📌 Wajib Haji\n• Ihram dari miqat\n• Mabit di Muzdalifah & Mina\n• Melempar jumrah\n• Menjauhi larangan ihram\n\n📌 Sumber: Al Umm, Bab Haji." },
              { id: "umrah", nama: "Umrah", gdriveUrl: "", catatan: "", materi: "📌 Umrah\n• Rukun: Ihram, thawaf, sai, tahallul, tertib.\n• Wajib: sekali seumur hidup (menurut sebagian ulama).\n• Boleh kapan saja (kecuali waktu makruh).\n\n📌 Sumber: Madzhab Syafii (umum)." },
            ],
          },
          {
            id: "bab_6_nikah", nama: "Bab VI: Nikah", warna: "green",
            fitur: [
              { id: "rukun_nikah", nama: "Rukun Nikah", gdriveUrl: "", catatan: "", materi: "📌 Rukun Nikah\n1. Calon suami\n2. Calon istri\n3. Wali\n4. Dua saksi\n5. Ijab & kabul\n\n📌 Syarat\n• Muslim, bukan mahram, tidak dalam ihram, tidak dipaksa.\n• Mahar wajib, boleh disebutkan atau tidak.\n• Wanita janda harus ridha, perawan cukup diam.\n\n📌 Sumber: Al Umm, Bab Nikah." },
              { id: "talak", nama: "Talak", gdriveUrl: "", catatan: "", materi: "📌 Talak\n• Talak 1 & 2: boleh rujuk sebelum iddah habis.\n• Talak 3: tidak boleh rujuk sampai mantan istri menikah dengan orang lain.\n• Iddah: 3 quru' (suci), atau 3 bulan (menopause), atau melahirkan (hamil).\n\n📌 Sumber: Al Umm, Bab Talak." },
            ],
          },
          {
            id: "bab_7_jual_beli", nama: "Bab VII: Jual Beli", warna: "green",
            fitur: [
              { id: "rukun_jual_beli", nama: "Rukun Jual Beli", gdriveUrl: "", catatan: "", materi: "📌 Rukun Jual Beli\n1. Penjual & pembeli\n2. Barang & harga\n3. Ijab & kabul\n\n📌 Khiyar\n• Khiyar majelis: boleh batal selama belum berpisah.\n• Khiyar syarat: boleh batal dalam waktu tertentu.\n• Khiyar aib: boleh batal jika ada cacat.\n\n📌 Larangan\n• Jual beli gharar (tidak jelas).\n• Jual beli barang haram.\n• Jual beli dengan riba.\n\n📌 Sumber: Al Umm, Bab Jual Beli." },
              { id: "riba", nama: "Riba", gdriveUrl: "", catatan: "", materi: "📌 Riba\n• Riba fadhl: tukar barang sejenis dengan takaran berbeda (emas dengan emas, dll).\n• Riba nasi'ah: tukar barang dengan tempo (ada penambahan).\n\n📌 Barang Ribawi\n• Emas, perak, gandum, syair, kurma, garam.\n• Harus sama jenis, sama takaran, tunai.\n\n📌 Sumber: Al Umm, Bab Riba." },
            ],
          },
          {
            id: "bab_8_haidh", nama: "Bab VIII: Haidh & Istihadhah", warna: "green",
            fitur: [
              { id: "haidh", nama: "Haidh", gdriveUrl: "", catatan: "", materi: "📌 Haidh\n• Darah yang keluar dari rahim perempuan sehat.\n• Waktu: minimal 1 hari 1 malam, maksimal 15 hari.\n• Siklus: minimal 15 hari suci antara dua haidh.\n\n📌 Hukum\n• Haram shalat, puasa, thawaf, jima', menyentuh mushaf.\n• Wajib qadha puasa, tidak qadha shalat.\n• Suami haram menjauhi istri (jima' di vagina).\n• Boleh bercumbu selain vagina.\n\n📌 Sumber: Al Umm, Bab Haidh." },
              { id: "istihadhah", nama: "Istihadhah", gdriveUrl: "", catatan: "", materi: "📌 Istihadhah\n• Darah penyakit yang keluar terus-menerus.\n• Bukan haidh, bukan nifas.\n\n📌 Hukum\n• Tetap shalat, puasa, boleh digauli suami.\n• Wajib wudhu setiap kali shalat fardhu.\n• Wajib mandi sekali setelah haidh berhenti.\n• Jika darah terpisah (kuat/lemah), bedakan haidh & istihadhah.\n\n📌 Sumber: Al Umm, Bab Istihadhah." },
            ],
          },
        ],
      },

      {
        id: "tauhid", nama: "Tauhid",
        tools: [
          {
            id: "bab_1_pendahuluan", nama: "Bab I: Pendahuluan", warna: "green",
            fitur: [
              { id: "marifat_taklid", nama: "Ma'rifat & Taklid", gdriveUrl: "", catatan: "", materi: "📌 Ma'rifat\n• Hakikat ma'rifat: keteguhan hati yang sesuai kenyataan, timbul dari dalil.\n• Diwajibkan kepada setiap muslim mengetahui 50 akidah.\n• Dalil ijmali: dalil global (contoh: adanya alam menunjukkan adanya Allah).\n• Dalil tafsili: dalil terperinci (contoh: alam ini baru, setiap yang baru pasti ada penciptanya).\n\n📌 Taklid\n• Taklid: keteguhan kepada 50 akidah tanpa mengetahui dalil.\n• Ulama berbeda pendapat:\n  1. Imam Sanusi & Ibnul Arobi: taklid tidak cukup, orang muqollid celaka.\n  2. Sebagian ulama: taklid cukup untuk orang awam yang sulit berpikir.\n\n📌 Hukum Mempelajari Tauhid\n• Fardhu 'ain --- sebagai asas/dasar bagi ilmu lainnya.\n• Tidak sah wudhu/shalat seseorang kecuali mengetahui akidah ini dengan keteguhan.\n\n📌 Sumber: Kifayatul Awam (Syaikh Muhammad Al-Fudholi), Bab I." },
              { id: "hukum_akal", nama: "Hukum Akal", gdriveUrl: "", catatan: "", materi: "📌 Definisi Hukum Akal\n• Menetapkan sesuatu bagi sesuatu atau menafikan sesuatu dari yang lain tanpa harus ditangguhkan.\n\n📌 Hukum Akal Ada 3\n1. Wajib: ketiadaannya tidak dibenarkan akal (mesti ada).\n  • Wajib dzati mutlaq: mesti ada bukan karena yang lain (sifat wajib Allah).\n  • Wajib dzati muqoyyad: mesti ada selagi ada yang lain (sifat wajib Rasul).\n  • Wajib 'aridhi: mesti ada karena melihat sisi lain (keberadaan kita karena ilmu Allah).\n2. Mustahil: keberadaannya tidak dibenarkan akal (mesti tiada).\n  • Mustahil dzati mutlaq: mesti tiada bukan karena yang lain (sifat mustahil Allah).\n  • Mustahil dzati muqoyyad: mesti tiada selagi ada yang lain (sifat mustahil Rasul).\n  • Mustahil 'aridhi: mesti tiada karena melihat sisi lain.\n3. Jaiz: akal membenarkan ada dan tiadanya (tidak wajib, tidak mustahil).\n\n📌 Pembagian Lain\n• Dhoruri: diterima akal tanpa dipikir (contoh: benda mesti gerak/diam).\n• Nadhori: diterima akal setelah dipikir & dibuktikan (contoh: sifat-sifat Allah).\n\n📌 Sumber: Kifayatul Awam, Bab I." },
            ],
          },
          {
            id: "bab_2_uluhiyyah", nama: "Bab II: Tauhid Uluhiyyah", warna: "green",
            fitur: [
              { id: "sifat_wajib_allah", nama: "20 Sifat Wajib Allah", gdriveUrl: "", catatan: "", materi: "📌 20 Sifat Wajib bagi Allah\n1. Wujud --- Ada. Dalil: adanya alam yang baru.\n2. Qidam --- Tidak ada permulaan. Dalil: jika Allah baru, butuh pencipta (tasalsul/daur, mustahil).\n3. Baqo' --- Tidak ada akhir. Dalil: jika Allah tiada, berarti jaiz, berarti baru --- bertentangan dengan Qidam.\n4. Mukholafatuhu lil hawadist --- Berbeda dengan makhluk. Dalil: jika menyerupai makhluk, berarti baru.\n5. Qiyamuhu binafsihi --- Tidak butuh zat & pencipta. Dalil: jika butuh zat, berarti sifat; jika butuh pencipta, berarti baru.\n6. Wahdaniyyah --- Tunggal (zat, sifat, af'al). Dalil: jika ada 2 tuhan, alam bisa tiada/berselisih --- mustahil.\n7. Qudrot --- Kuasa. Dalil: adanya alam yang mungkin ada/tiada.\n8. Irodat --- Berkehendak. Dalil: menentukan sesuatu dari yang mungkin.\n9. Ilmu --- Mengetahui. Dalil: pembuat pasti tahu apa yang dibuat.\n10. Hayat --- Hidup. Dalil: yang berbuat pasti hidup.\n11. Sama' --- Mendengar. Dalil: QS Al-Hajj: 75.\n12. Bashor --- Melihat. Dalil: QS Al-Hajj: 75.\n13. Kalam --- Berbicara. Dalil: QS An-Nisa: 164.\n14. Kaunuhu Qodiron --- Terbukti Maha Kuasa.\n15. Kaunuhu Muridan --- Terbukti Maha Berkehendak.\n16. Kaunuhu 'Aliman --- Terbukti Maha Mengetahui.\n17. Kaunuhu Hayyan --- Terbukti Maha Hidup.\n18. Kaunuhu Sami'an --- Terbukti Maha Mendengar.\n19. Kaunuhu Bashiron --- Terbukti Maha Melihat.\n20. Kaunuhu Mutakalliman --- Terbukti Maha Berbicara.\n\n📌 Sumber: Kifayatul Awam, Bab II." },
              { id: "sifat_mustahil_allah", nama: "20 Sifat Mustahil Allah", gdriveUrl: "", catatan: "", materi: "📌 20 Sifat Mustahil bagi Allah (Lawan dari 20 Sifat Wajib)\n1. Al-'Adam (Tiada) --- lawan Wujud.\n2. Al-Hudust (Baru) --- lawan Qidam.\n3. Al-Fana (Binasa) --- lawan Baqo'.\n4. Al-Mumatsalah (Menyerupai makhluk) --- lawan Mukholafatuhu lil hawadist.\n5. Al-Ikhtiyaj ila mahal au mukhassis (Butuh zat/pencipta) --- lawan Qiyamuhu binafsihi.\n6. At-Ta'adud (Terbilang/lebih dari satu) --- lawan Wahdaniyyah.\n7. Al-'Ajzu (Lemah) --- lawan Qudrot.\n8. Al-Karohah (Terpaksa) --- lawan Irodat.\n9. Al-Jahl (Bodoh) --- lawan Ilmu.\n10. Al-Maut (Mati) --- lawan Hayat.\n11. Ash-Shomam (Tuli) --- lawan Sama'.\n12. Al-'Umyu (Buta) --- lawan Bashor.\n13. Al-Khirs (Bisu) --- lawan Kalam.\n14. Kaunuhu 'Ajizan (Terbukti lemah) --- lawan Kaunuhu Qodiron.\n15. Kaunuhu Karihan (Terbukti terpaksa) --- lawan Kaunuhu Muridan.\n16. Kaunuhu Jahilan (Terbukti bodoh) --- lawan Kaunuhu 'Aliman.\n17. Kaunuhu Mayyitan (Terbukti mati) --- lawan Kaunuhu Hayyan.\n18. Kaunuhu Ashomma (Terbukti tuli) --- lawan Kaunuhu Sami'an.\n19. Kaunuhu A'ma (Terbukti buta) --- lawan Kaunuhu Bashiron.\n20. Kaunuhu Abkama (Terbukti bisu) --- lawan Kaunuhu Mutakalliman.\n\n📌 Sumber: Kifayatul Awam, Bab II." },
              { id: "sifat_jaiz_allah", nama: "1 Sifat Jaiz Allah", gdriveUrl: "", catatan: "", materi: "📌 Sifat Jaiz bagi Allah\n• Allah wenang menciptakan yang baik dan buruk.\n• Allah wenang menciptakan Islam pada si Zaid, kufur pada si Umar, ilmu pada seseorang, dan bodoh pada yang lain.\n• Allah tidak wajib membuat sesuatu apa pun.\n• Berbeda dengan Mu'tazilah yang menyatakan Allah pasti melakukan yang baik.\n\n📌 Dalil\n• Hal yang mungkin telah disepakati kewenangannya.\n• Jika Allah wajib membuat sesuatu yang mungkin, maka jaiz berubah menjadi wajib --- batil.\n• Jika Allah mustahil membuat sesuatu yang mungkin, maka jaiz berubah menjadi mustahil --- batil.\n\n📌 Sumber: Kifayatul Awam, Bab II." },
            ],
          },
          {
            id: "bab_3_nabawiyyah", nama: "Bab III: Tauhid Nabawiyyah", warna: "green",
            fitur: [
              { id: "sifat_wajib_rasul", nama: "Sifat Wajib Rasul", gdriveUrl: "", catatan: "", materi: "📌 4 Sifat Wajib bagi Rasul\n1. Sidiq --- Benar dalam seluruh ucapan.\n  • Dalil: jika Rasul dusta, khabar Allah dusta --- mustahil.\n2. Amanah --- Terpelihara dari perbuatan haram & makruh.\n  • Dalil: jika Rasul berkhianat, kita diperintahkan berbuat haram --- tidak benar.\n3. Tabligh --- Menyampaikan sesuatu yang wajib disampaikan.\n  • Dalil: jika Rasul menyembunyikan, kita diperintahkan menyembunyikan ilmu --- terkutuk.\n4. Fathonah --- Cerdas, mampu mengalahkan hujjah musuh.\n  • Dalil: jika Rasul tidak cerdas, tidak mampu berargumentasi --- padahal Al-Qur'an menyatakan kemampuannya.\n\n📌 Sumber: Kifayatul Awam, Bab III." },
              { id: "sifat_mustahil_rasul", nama: "Sifat Mustahil Rasul", gdriveUrl: "", catatan: "", materi: "📌 4 Sifat Mustahil bagi Rasul (Lawan dari 4 Sifat Wajib)\n1. Kadzb (Dusta) --- lawan Sidiq.\n2. Khiyanat (Berkhianat) --- lawan Amanah.\n3. Kitman (Menyembunyikan) --- lawan Tabligh.\n4. Baladah (Bodoh) --- lawan Fathonah.\n\n📌 Sumber: Kifayatul Awam, Bab III." },
              { id: "sifat_jaiz_rasul", nama: "Sifat Jaiz Rasul", gdriveUrl: "", catatan: "", materi: "📌 Sifat Jaiz bagi Rasul\n• Terjadinya sifat kemanusiaan yang tidak mengakibatkan berkurangnya martabat mereka yang tinggi.\n• Contoh: sakit, makan, minum, menikah, dan lain-lain.\n\n📌 Dalil\n• Mereka senantiasa naik ke kedudukan yang tinggi.\n• Terjadinya sifat kemanusiaan (misal sakit) justru menambah kedudukan mereka.\n• Supaya hati selain mereka terobati ketika diuji penderitaan.\n\n📌 Sumber: Kifayatul Awam, Bab III." },
            ],
          },
          {
            id: "bab_4_samiyyah", nama: "Bab IV: Tauhid Sam'iyyah", warna: "green",
            fitur: [
              { id: "qodho_qodar", nama: "Qodho & Qodar", gdriveUrl: "", catatan: "", materi: "📌 Qodho & Qodar\n• Setiap mukallaf wajib mengi'tikadkan bahwa baik dan buruk sudah ditentukan dengan qodho dan qodar Allah.\n\n📌 Perbedaan Pendapat Ulama\n• Pendapat 1: Qodho = kehendak Allah di azali; Qodar = pengadaan Allah atas perkara yang sudah ditentukan.\n• Pendapat 2: Qodho = pengetahuan Allah di azali; Qodar = pengadaan Allah sesuai pengetahuan-Nya.\n\n📌 Kesimpulan\n• Qodho itu qodim (sifat Allah, baik irodat atau ilmu).\n• Qodar itu hadist (baru, bagian dari ta'alluq sifat qudrot).\n\n📌 Sumber: Kifayatul Awam, Bab IV." },
              { id: "melihat_allah", nama: "Melihat Allah", gdriveUrl: "", catatan: "", materi: "📌 Melihat Allah\n• Setiap mukallaf harus mengi'tikadkan bahwa Allah dapat dilihat oleh setiap mukmin dan mukminat di akhirat.\n\n📌 Dalil\n• QS Al-A'raf: 143 --- Allah mengaitkan melihat-Nya kepada tetapnya gunung.\n• Gunung tetap di tempatnya adalah jaiz/wenang.\n• Melihat Allah yang dikaitkan padanya wenang pula.\n\n📌 Catatan\n• Melihat Allah bukan seperti cara kita berhadap-hadapan.\n• Allah tidak dapat dilihat berada pada arah, berwarna, berjisim, dll.\n• Mu'tazilah menafikan melihat Allah --- ini akidah batil.\n\n📌 Sumber: Kifayatul Awam, Bab IV." },
              { id: "mengutus_rasul", nama: "Mengutus Para Rasul", gdriveUrl: "", catatan: "", materi: "📌 Mengutus Para Rasul\n• Mengutus para Rasul termasuk hal yang jaiz bagi Allah.\n• Pengutusan mereka murni sebagai karunia-Nya, bukan keniscayaan.\n• Tidak ada yang niscaya/pasti bagi Allah.\n\n📌 Sumber: Kifayatul Awam, Bab IV." },
              { id: "masa_cemerlang", nama: "Masa-Masa Cemerlang", gdriveUrl: "", catatan: "", materi: "📌 Masa-Masa Cemerlang\n• Masa kehidupan para sahabat Nabi Muhammad adalah sebaik-baiknya masa.\n• Kemudian diikuti para tabi'in, lalu pengikut tabi'in.\n\n📌 Sahabat Paling Utama\n1. Abu Bakar Shiddiq\n2. Umar bin Khottob\n3. Utsman bin 'Affan\n4. Ali bin Abi Tholib\n• Keunggulan berdasarkan urutan tersebut.\n\n📌 Sumber: Kifayatul Awam, Bab IV." },
              { id: "silsilah_nabi", nama: "Silsilah Nabi", gdriveUrl: "", catatan: "", materi: "📌 Kelahiran & Silsilah Nabi Muhammad\n• Nabi dilahirkan di Mekkah, wafat di Madinah.\n• Diwajibkan setiap orang tua (terutama bapak) mengajarkan anak-anak mereka tentang itu.\n\n📌 Silsilah dari Ayah\n• Muhammad bin Abdullah bin Abdul Mutholib bin Hasyim bin Abdu Manaf bin Qushoy bin Kilab bin Muroh bin Ka'ab bin Luay bin Gholib bin Fihir bin Malik bin Nadhor bin Kinanah bin Khuzaimah bin Mudrikah bin Ilyas bin Mudhor bin Nadzar bin Ma'ad bin Adnan.\n\n📌 Silsilah dari Ibu\n• Aminah binti Wahab bin Abdu Manaf bin Zuhroh.\n\n📌 Putra-Putri Nabi (7 orang)\n1. Qosim (putra pertama)\n2. Zainab\n3. Ruqoyah\n4. Fatimah\n5. Ummu Kulsum\n6. Abdullah (at-Thoyyib at-Thohir)\n7. Ibrahim (dari Mariyah Qibtiyyah)\n\n📌 Sumber: Kifayatul Awam, Bab IV." },
              { id: "haudh_syafaat_dosa", nama: "Haudh, Syafa'at & Dosa", gdriveUrl: "", catatan: "", materi: "📌 Haudh (Telaga)\n• Wajib mempercayai Nabi Muhammad memiliki Haudh/telaga.\n• Telaga itu didatangi seluruh makhluk beriman pada hari kiamat.\n• Ia bukan telaga Kautsar (sungai di surga).\n\n📌 Syafa'at\n• Nabi Muhammad akan memberikan syafa'at pada hari kiamat saat manusia berdiam di alam mahsyar.\n• Syafa'at ini khusus untuk Nabi Muhammad.\n\n📌 Dosa\n• Melakukan dosa selain kufur tidak memposisikan pelakunya dalam kekufuran.\n• Wajib segera bertaubat walaupun dosa kecil.\n• Taubat tidak batal dengan kembalinya seseorang pada dosa yang sama, tetapi wajib taubat baru.\n• Wajib menjauhi sombong, dengki, dan ghibah.\n\n📌 Sumber: Kifayatul Awam, Bab IV." },
            ],
          },
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
  if (opsi === "pendek") {
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  }
  return d.toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

// ============================================================
// FIXED: handle nested fitur (SolidWorks Basic Features dll)
// ============================================================
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
    } else {
      let found = null;
      let arrayName = null;
      if (current.fitur && Array.isArray(current.fitur)) {
        found = current.fitur.find((f) => f.id === id);
        if (found) arrayName = "fitur";
      }
      if (!found && current.parts && Array.isArray(current.parts)) {
        found = current.parts.find((p) => p.id === id);
        if (found) arrayName = "parts";
      }
      if (!found) return null;
      parent = current;
      parentArray = current[arrayName];
      current = found;
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
  if (index !== -1) {
    newParentArray[index] = { ...newParentArray[index], ...updatedFields };
  }
  return newKategori;
}

export function addItem(kategori, path, newItem) {
  const newKategori = JSON.parse(JSON.stringify(kategori));
  const result = findItem(newKategori, path);
  if (!result) return kategori;
  const { item, level } = result;
  if (level === 1) {
    if (!item.subKategori) item.subKategori = [];
    item.subKategori.push(newItem);
  } else if (level === 2) {
    if (!item.tools) item.tools = [];
    item.tools.push(newItem);
  } else if (level === 3) {
    if (item.parts) item.parts.push(newItem);
    else { if (!item.fitur) item.fitur = []; item.fitur.push(newItem); }
  } else {
    if (item.parts) item.parts.push(newItem);
    else { if (!item.fitur) item.fitur = []; item.fitur.push(newItem); }
  }
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

export function kategoriPunyaKaryaMingguan(kategoriId) {
  return kategoriId === "design";
}

export function getKategoriIdFromPath(path) {
  if (!path || path.length === 0) return null;
  return path[0];
}

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

export function initLogHarian() {
  return {};
}

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
  logKategori.forEach((log) => {
    if (log.catatan || log.gdriveUrl) {
      itemUnik.add(`${log.subKategoriId}_${log.toolId}_${log.fiturId}_${log.partId || ""}`);
    }
  });
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
  if (log.gdriveUrl) {
    target.gdriveUrl = existingGdrive ? `${existingGdrive}\n${log.gdriveUrl}` : log.gdriveUrl;
  }
  return newKategori;
}

export function syncMateriToLog(kategoriData, logHarian, path, catatan, gdriveUrl, tanggal) {
  if (!catatan.trim() && !gdriveUrl.trim()) return { kategori: kategoriData, logHarian };
  const newKategori = updateItem(kategoriData, path, { catatan, gdriveUrl });
  const newLogHarian = JSON.parse(JSON.stringify(logHarian || {}));
  if (!newLogHarian[tanggal]) newLogHarian[tanggal] = [];
  const logEntry = {
    id: `log_${Date.now()}`,
    kategoriId: path[0], subKategoriId: path[1] || "", toolId: path[2] || "",
    fiturId: path[3] || "", partId: path[4] || "",
    catatan, gdriveUrl, telegramMessageId: "", sumber: "materi",
    updatedAt: new Date().toISOString(),
  };
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
    newLogHarian[tanggal] = newLogHarian[tanggal].map((l) =>
      l.id === oldLog.id ? { ...newLog, id: oldLog.id, sumber: oldLog.sumber } : l
    );
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
  return kategori.subKategori
    .filter((s) => s.id !== currentSubKategoriId)
    .map((s) => ({ id: s.id, nama: s.nama }));
}