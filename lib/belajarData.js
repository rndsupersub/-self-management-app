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
                  "📌 29 Part (Chapter). Lihat tiap Part buat ringkasan.\n\n" +
                  "📌 Catatan: Tutorial dari nol sampai bisa desain T-shirt.",
                parts: [
                  { id: "part_1", nama: "Part 1: Introduction", materi: "📌 Timestamp: 0:00\n\n📌 Materi\n• Perkenalan course\n\n📌 Sumber: Adobe Illustrator Tutorial for Beginners, Part 1.", gdriveUrl: "", catatan: "" },
                  { id: "part_2", nama: "Part 2: Getting Started", materi: "📌 Timestamp: 1:11\n\n📌 Materi\n• Cara mulai pakai Illustrator\n\n📌 Sumber: Adobe Illustrator Tutorial for Beginners, Part 2.", gdriveUrl: "", catatan: "" },
                  { id: "part_3", nama: "Part 3: What is Illustrator Used For?", materi: "📌 Timestamp: 2:58\n\n📌 Materi\n• Fungsi Illustrator\n• Bedanya sama Photoshop\n\n📌 Sumber: Adobe Illustrator Tutorial for Beginners, Part 3.", gdriveUrl: "", catatan: "" },
                  { id: "part_4", nama: "Part 4: Quick Tour", materi: "📌 Timestamp: 6:38\n\n📌 Materi\n• Interface Illustrator\n• Toolbar, panel, artboard\n\n📌 Sumber: Adobe Illustrator Tutorial for Beginners, Part 4.", gdriveUrl: "", catatan: "" },
                  { id: "part_5", nama: "Part 5: Draw Rounded Rectangles", materi: "📌 Timestamp: 17:34\n\n📌 Materi\n• Bikin rounded rectangle\n• Fill & stroke\n\n📌 Sumber: Adobe Illustrator Tutorial for Beginners, Part 5.", gdriveUrl: "", catatan: "" },
                  { id: "part_6", nama: "Part 6: How to Draw Lines", materi: "📌 Timestamp: 32:20\n\n📌 Materi\n• Line tool\n• Line cap & join\n\n📌 Sumber: Adobe Illustrator Tutorial for Beginners, Part 6.", gdriveUrl: "", catatan: "" },
                  { id: "part_7", nama: "Part 7: Scaling Stroke Effects", materi: "📌 Timestamp: 49:10\n\n📌 Materi\n• Efek scaling stroke\n\n📌 Sumber: Adobe Illustrator Tutorial for Beginners, Part 7.", gdriveUrl: "", catatan: "" },
                  { id: "part_8", nama: "Part 8: Saving to Creative Cloud", materi: "📌 Timestamp: 55:48\n\n📌 Materi\n• Simpan ke Creative Cloud\n\n📌 Sumber: Adobe Illustrator Tutorial for Beginners, Part 8.", gdriveUrl: "", catatan: "" },
                  { id: "part_9", nama: "Part 9: Exporting Images", materi: "📌 Timestamp: 1:09:39\n\n📌 Materi\n• Export gambar\n\n📌 Sumber: Adobe Illustrator Tutorial for Beginners, Part 9.", gdriveUrl: "", catatan: "" },
                  { id: "part_10", nama: "Part 10: Shape Builder Tool", materi: "📌 Timestamp: 1:14:34\n\n📌 Materi\n• Shape Builder Tool\n\n📌 Sumber: Adobe Illustrator Tutorial for Beginners, Part 10.", gdriveUrl: "", catatan: "" },
                  { id: "part_11", nama: "Part 11: Class Project 2", materi: "📌 Timestamp: 1:25:09\n\n📌 Materi\n• Latihan project\n\n📌 Sumber: Adobe Illustrator Tutorial for Beginners, Part 11.", gdriveUrl: "", catatan: "" },
                  { id: "part_12", nama: "Part 12: Layer", materi: "📌 Timestamp: 1:46:17\n\n📌 Materi\n• Layer panel\n\n📌 Sumber: Adobe Illustrator Tutorial for Beginners, Part 12.", gdriveUrl: "", catatan: "" },
                  { id: "part_13", nama: "Part 13: Math in Fields", materi: "📌 Timestamp: 1:57:24\n\n📌 Materi\n• Pakai matematika di field input\n\n📌 Sumber: Adobe Illustrator Tutorial for Beginners, Part 13.", gdriveUrl: "", catatan: "" },
                  { id: "part_14", nama: "Part 14: Class Project 3", materi: "📌 Timestamp: 2:10:09\n\n📌 Materi\n• Latihan project\n\n📌 Sumber: Adobe Illustrator Tutorial for Beginners, Part 14.", gdriveUrl: "", catatan: "" },
                  { id: "part_15", nama: "Part 15: Curvature Tool", materi: "📌 Timestamp: 2:11:16\n\n📌 Materi\n• Curvature Tool\n\n📌 Sumber: Adobe Illustrator Tutorial for Beginners, Part 15.", gdriveUrl: "", catatan: "" },
                  { id: "part_16", nama: "Part 16: Curves & Straight Lines", materi: "📌 Timestamp: 2:25:12\n\n📌 Materi\n• Gabungin curve & garis lurus\n\n📌 Sumber: Adobe Illustrator Tutorial for Beginners, Part 16.", gdriveUrl: "", catatan: "" },
                  { id: "part_17", nama: "Part 17: Class Project 4", materi: "📌 Timestamp: 2:32:53\n\n📌 Materi\n• Latihan project\n\n📌 Sumber: Adobe Illustrator Tutorial for Beginners, Part 17.", gdriveUrl: "", catatan: "" },
                  { id: "part_18", nama: "Part 18: Combining Shapes", materi: "📌 Timestamp: 2:36:14\n\n📌 Materi\n• Pathfinder\n\n📌 Sumber: Adobe Illustrator Tutorial for Beginners, Part 18.", gdriveUrl: "", catatan: "" },
                  { id: "part_19", nama: "Part 19: Pen Tool", materi: "📌 Timestamp: 2:48:18\n\n📌 Materi\n• Pen Tool\n\n📌 Sumber: Adobe Illustrator Tutorial for Beginners, Part 19.", gdriveUrl: "", catatan: "" },
                  { id: "part_20", nama: "Part 20: Class Project 5", materi: "📌 Timestamp: 3:02:14\n\n📌 Materi\n• Latihan project\n\n📌 Sumber: Adobe Illustrator Tutorial for Beginners, Part 20.", gdriveUrl: "", catatan: "" },
                  { id: "part_21", nama: "Part 21: Panel Tidying Up", materi: "📌 Timestamp: 3:23:39\n\n📌 Materi\n• Rapiin panel\n\n📌 Sumber: Adobe Illustrator Tutorial for Beginners, Part 21.", gdriveUrl: "", catatan: "" },
                  { id: "part_22", nama: "Part 22: Class Project 6", materi: "📌 Timestamp: ~3:26:20\n\n📌 Materi\n• Latihan project\n\n📌 Sumber: Adobe Illustrator Tutorial for Beginners, Part 22.", gdriveUrl: "", catatan: "" },
                  { id: "part_23", nama: "Part 23: Combining Tools", materi: "📌 Timestamp: ~3:38:10\n\n📌 Materi\n• Gabungin beberapa tool\n\n📌 Sumber: Adobe Illustrator Tutorial for Beginners, Part 23.", gdriveUrl: "", catatan: "" },
                  { id: "part_24", nama: "Part 24: Class Project 7", materi: "📌 Timestamp: 2:36:53\n\n📌 Materi\n• Latihan project\n\n📌 Sumber: Adobe Illustrator Tutorial for Beginners, Part 24.", gdriveUrl: "", catatan: "" },
                  { id: "part_25", nama: "Part 25: AI Generative Recoloring", materi: "📌 Timestamp: 2:42:56\n\n📌 Materi\n• AI Generative Recoloring\n\n📌 Sumber: Adobe Illustrator Tutorial for Beginners, Part 25.", gdriveUrl: "", catatan: "" },
                  { id: "part_26", nama: "Part 26: Mood Boards", materi: "📌 Timestamp: 2:47:41\n\n📌 Materi\n• Bikin mood board\n\n📌 Sumber: Adobe Illustrator Tutorial for Beginners, Part 26.", gdriveUrl: "", catatan: "" },
                  { id: "part_27", nama: "Part 27: Class Project 8", materi: "📌 Timestamp: 3:32:31\n\n📌 Materi\n• Latihan project\n\n📌 Sumber: Adobe Illustrator Tutorial for Beginners, Part 27.", gdriveUrl: "", catatan: "" },
                  { id: "part_28", nama: "Part 28: Class Project 9", materi: "📌 Timestamp: 3:52:30\n\n📌 Materi\n• Latihan project\n\n📌 Sumber: Adobe Illustrator Tutorial for Beginners, Part 28.", gdriveUrl: "", catatan: "" },
                  { id: "part_29", nama: "Part 29: Printing T-Shirt", materi: "📌 Timestamp: 3:57:40\n\n📌 Materi\n• Desain T-shirt\n• Printing\n\n📌 Sumber: Adobe Illustrator Tutorial for Beginners, Part 29.", gdriveUrl: "", catatan: "" },
                ],
              },
            ],
            karyaMingguan: [],
          },
          {
            id: "photoshop", nama: "Photoshop", warna: "pink",
            fitur: [
              {
                id: "adobe_photoshop_beginners",
                nama: "Adobe Photoshop for Beginners",
                materi:
                  "📌 Photoshop for Beginners | FREE COURSE\n" +
                  "• Video full course: ~3 jam\n" +
                  "• Channel: Envato Tuts+\n" +
                  "• URL: https://www.youtube.com/watch?v=IyR_uYsRdPs\n\n" +
                  "📌 23 Part (Chapter). Lihat tiap Part buat ringkasan.\n\n" +
                  "📌 Catatan: Tutorial dari nol — layer, tone, mask, retouch, sampai export.",
                parts: [
                  { id: "part_1", nama: "Part 1: Welcome to the Course", materi: "📌 Timestamp: 0:00\n\n📌 Materi\n• Perkenalan course\n• Apa yang bakal dipelajari\n\n📌 Sumber: Photoshop for Beginners, Part 1.", gdriveUrl: "", catatan: "" },
                  { id: "part_2", nama: "Part 2: Getting Started", materi: "📌 Timestamp: 1:50\n\n📌 Materi\n• Setup awal Photoshop\n• Workspace\n\n📌 Sumber: Photoshop for Beginners, Part 2.", gdriveUrl: "", catatan: "" },
                  { id: "part_3", nama: "Part 3: How Photoshop Layers Work", materi: "📌 Timestamp: 3:10\n\n📌 Materi\n• Layer dasar\n• Layer panel\n• Blend mode\n\n📌 Sumber: Photoshop for Beginners, Part 3.", gdriveUrl: "", catatan: "" },
                  { id: "part_4", nama: "Part 4: Combining Multiple Images", materi: "📌 Timestamp: 12:06\n\n📌 Materi\n• Gabungin gambar\n• Layer stacking\n\n📌 Sumber: Photoshop for Beginners, Part 4.", gdriveUrl: "", catatan: "" },
                  { id: "part_5", nama: "Part 5: Tone Adjustment With Levels", materi: "📌 Timestamp: 20:40\n\n📌 Materi\n• Levels adjustment\n• Atur tonal (gelap/terang)\n\n📌 Sumber: Photoshop for Beginners, Part 5.", gdriveUrl: "", catatan: "" },
                  { id: "part_6", nama: "Part 6: Color Adjustment", materi: "📌 Timestamp: 25:17\n\n📌 Materi\n• Color Balance\n• Atur warna\n\n📌 Sumber: Photoshop for Beginners, Part 6.", gdriveUrl: "", catatan: "" },
                  { id: "part_7", nama: "Part 7: Hue Adjustments", materi: "📌 Timestamp: 29:21\n\n📌 Materi\n• Hue/Saturation\n• Ganti warna\n\n📌 Sumber: Photoshop for Beginners, Part 7.", gdriveUrl: "", catatan: "" },
                  { id: "part_8", nama: "Part 8: How to Work With Type", materi: "📌 Timestamp: 37:42\n\n📌 Materi\n• Type tool\n• Font & paragraph\n\n📌 Sumber: Photoshop for Beginners, Part 8.", gdriveUrl: "", catatan: "" },
                  { id: "part_9", nama: "Part 9: Warped Type and Type on a Path", materi: "📌 Timestamp: 49:37\n\n📌 Materi\n• Warp text\n• Text di sepanjang path\n\n📌 Sumber: Photoshop for Beginners, Part 9.", gdriveUrl: "", catatan: "" },
                  { id: "part_10", nama: "Part 10: Layer Styles and Effects", materi: "📌 Timestamp: 1:07:17\n\n📌 Materi\n• Drop shadow, stroke, glow\n• Layer style\n\n📌 Sumber: Photoshop for Beginners, Part 10.", gdriveUrl: "", catatan: "" },
                  { id: "part_11", nama: "Part 11: How to Crop", materi: "📌 Timestamp: 1:24:46\n\n📌 Materi\n• Crop tool\n• Atur komposisi\n\n📌 Sumber: Photoshop for Beginners, Part 11.", gdriveUrl: "", catatan: "" },
                  { id: "part_12", nama: "Part 12: Resizing and Resolution", materi: "📌 Timestamp: 1:32:08\n\n📌 Materi\n• Resize gambar\n• Resolusi (ppi/dpi)\n\n📌 Sumber: Photoshop for Beginners, Part 12.", gdriveUrl: "", catatan: "" },
                  { id: "part_13", nama: "Part 13: Rectangle and Elliptical Marquee Tool", materi: "📌 Timestamp: 1:41:49\n\n📌 Materi\n• Marquee tool\n• Selection dasar\n\n📌 Sumber: Photoshop for Beginners, Part 13.", gdriveUrl: "", catatan: "" },
                  { id: "part_14", nama: "Part 14: Clipping Masks", materi: "📌 Timestamp: 1:47:58\n\n📌 Materi\n• Clipping mask\n• Masking antar layer\n\n📌 Sumber: Photoshop for Beginners, Part 14.", gdriveUrl: "", catatan: "" },
                  { id: "part_15", nama: "Part 15: Quick Selection Tool", materi: "📌 Timestamp: 1:52:27\n\n📌 Materi\n• Quick Selection\n• Selection cerdas\n\n📌 Sumber: Photoshop for Beginners, Part 15.", gdriveUrl: "", catatan: "" },
                  { id: "part_16", nama: "Part 16: Layer Masks", materi: "📌 Timestamp: 2:00:18\n\n📌 Materi\n• Layer mask\n• Non-destructive editing\n\n📌 Sumber: Photoshop for Beginners, Part 16.", gdriveUrl: "", catatan: "" },
                  { id: "part_17", nama: "Part 17: Select and Mask", materi: "📌 Timestamp: 2:06:25\n\n📌 Materi\n• Select and Mask\n• Refine edge\n\n📌 Sumber: Photoshop for Beginners, Part 17.", gdriveUrl: "", catatan: "" },
                  { id: "part_18", nama: "Part 18: Understanding Photoshop Smart Objects", materi: "📌 Timestamp: 2:18:38\n\n📌 Materi\n• Smart Object\n• Non-destructive scaling\n\n📌 Sumber: Photoshop for Beginners, Part 18.", gdriveUrl: "", catatan: "" },
                  { id: "part_19", nama: "Part 19: Transforming and Warping Layers", materi: "📌 Timestamp: 2:30:09\n\n📌 Materi\n• Transform (scale, rotate, skew)\n• Warp\n\n📌 Sumber: Photoshop for Beginners, Part 19.", gdriveUrl: "", catatan: "" },
                  { id: "part_20", nama: "Part 20: Retouching With Healing Brush", materi: "📌 Timestamp: 2:37:58\n\n📌 Materi\n• Healing Brush\n• Retouch foto\n\n📌 Sumber: Photoshop for Beginners, Part 20.", gdriveUrl: "", catatan: "" },
                  { id: "part_21", nama: "Part 21: Content-Aware Scale", materi: "📌 Timestamp: 2:45:55\n\n📌 Materi\n• Content-Aware Scale\n• Resize tanpa distorsi\n\n📌 Sumber: Photoshop for Beginners, Part 21.", gdriveUrl: "", catatan: "" },
                  { id: "part_22", nama: "Part 22: Exporting Images", materi: "📌 Timestamp: 2:54:11\n\n📌 Materi\n• Export PNG, JPG\n• Export for Web\n\n📌 Sumber: Photoshop for Beginners, Part 22.", gdriveUrl: "", catatan: "" },
                  { id: "part_23", nama: "Part 23: What Next?", materi: "📌 Timestamp: 3:04:49\n\n📌 Materi\n• Next steps\n• Tips lanjutan\n\n📌 Sumber: Photoshop for Beginners, Part 23.", gdriveUrl: "", catatan: "" },
                ],
              },
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
                  "📌 8 Chapter (Part). Lihat tiap Part buat ringkasan.\n\n" +
                  "📌 Catatan: Tutorial bikin donut + kopi dari nol sampai render final.",
                parts: [
                  { id: "part_1", nama: "Part 1: The Basics", materi: "📌 Timestamp: 00:00 -- 28:16\n\n📌 Materi\n• Intro & kenalan sama Blender 4.0\n• Download & install Blender\n• Interface: viewport, toolbar, outliner, properties\n• Navigasi: orbit, pan, zoom\n• Render mode & camera dasar\n• Bikin objek pertama (donut) + material dasar\n• Render pertama\n\n📌 Sumber: Beginner Blender Tutorial (2026), Part 1.", gdriveUrl: "", catatan: "" },
                  { id: "part_2", nama: "Part 2: Basic Modelling", materi: "📌 Timestamp: 28:16 -- 59:05\n\n📌 Materi\n• Scale & rotation\n• Add torus (cincin donut)\n• Subdivision surface modifier\n• Proportional editing\n• Deformasi donut biar nggak kaku\n• Duplicate object\n• Name objects biar rapi\n\n📌 Sumber: Beginner Blender Tutorial (2026), Part 2.", gdriveUrl: "", catatan: "" },
                  { id: "part_3", nama: "Part 3: Organic Modelling", materi: "📌 Timestamp: 59:05 -- 1:30:13\n\n📌 Materi\n• Solidify modifier\n• Snap to face\n• Apply subsurf\n• Bikin icing (lelehan coklat) bergelombang\n• Extrude icing\n• Shrinkwrap modifier\n• Sculpt mode: inflate, grab, mask brush\n• Filter & smooth brush\n\n📌 Sumber: Beginner Blender Tutorial (2026), Part 3.", gdriveUrl: "", catatan: "" },
                  { id: "part_4", nama: "Part 4: Materials", materi: "📌 Timestamp: 1:30:13 -- 2:03:46\n\n📌 Materi\n• Bikin countertop (meja)\n• Parenting objects\n• Material nodes dasar\n• Countertop texture: roughness map, normal map\n• Material donut & icing\n• Texture painting dasar\n\n📌 Sumber: Beginner Blender Tutorial (2026), Part 4.", gdriveUrl: "", catatan: "" },
                  { id: "part_5", nama: "Part 5: Texturing", materi: "📌 Timestamp: 2:03:46 -- 2:35:40\n\n📌 Materi\n• Bikin sprinkle (meses) pakai geometry nodes\n• Scatter points\n• Poisson disk\n• Weight painting\n• Real-world size\n• Fix sprinkle density\n\n📌 Sumber: Beginner Blender Tutorial (2026), Part 5.", gdriveUrl: "", catatan: "" },
                  { id: "part_6", nama: "Part 6: UV Unwrapping", materi: "📌 Timestamp: 2:35:40 -- 3:09:26\n\n📌 Materi\n• Model sprinkle (cylinder)\n• Sprinkle variants\n• Organize with collections\n• Scattering collection\n• Random rotation (Euler)\n• Distance & sizing sprinkle\n• UV unwrap dasar\n\n📌 Sumber: Beginner Blender Tutorial (2026), Part 6.", gdriveUrl: "", catatan: "" },
                  { id: "part_7", nama: "Part 7: Scattering", materi: "📌 Timestamp: 3:09:26 -- 3:46:11\n\n📌 Materi\n• Apply material ke multiple objects\n• Random values per material\n• Metallic sprinkle\n• Bikin piring & kopi\n• Stack donut\n• Assign sprinkle\n• Scale countertop & backsplash\n• Icing colors & ceramic plate material\n\n📌 Sumber: Beginner Blender Tutorial (2026), Part 7.", gdriveUrl: "", catatan: "" },
                  { id: "part_8", nama: "Part 8: Lighting and Rendering", materi: "📌 Timestamp: 3:46:11 -- 4:55:00\n\n📌 Materi\n• Sky texture lighting\n• Kitchen enclosure & window\n• Shaping light & install addon\n• Compositor: glare, lens distortion, chromatic aberration\n• Color management (AgX)\n• Animation: keyframe, dope sheet, graph editor\n• Keyframe ease & scale\n• Sample count & noise threshold\n• Render still + image sequence\n• Depth of field & motion blur\n• Video editing & export final\n\n📌 Sumber: Beginner Blender Tutorial (2026), Part 8.", gdriveUrl: "", catatan: "" },
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
              { id: "shalat_wajib", nama: "Shalat Wajib", gdriveUrl: "", catatan: "", materi: "📌 Shalat Wajib 5 Waktu\n1. Subuh: 2 rakaat\n2. Zhuhur: 4 rakaat\n3. Ashar: 4 rakaat\n4. Maghrib: 3 rakaat\n5. Isya: 4 rakaat\n\n📌 Qashar\n• Musafir boleh qashar 4 rakaat jadi 2 rakaat.\n• Syarat: perjalanan minimal 2 marhalah (~80 km).\n\n📌 Jamak\n• Boleh jamak Zhuhur-Ashar, Maghrib-Isya.\n• Jamak taqdim atau ta'khir.\n\n📌 Sumber: Al Umm, Bab Shalat." },
              { id: "shalat_sunnah", nama: "Shalat Sunnah", gdriveUrl: "", catatan: "", materi: "📌 Shalat Sunnah Rawatib\n• 2 rakaat sebelum Subuh\n• 4 rakaat sebelum Zhuhur, 2 rakaat sesudah\n• 2 rakaat sesudah Maghrib\n• 2 rakaat sesudah Isya\n\n📌 Shalat Sunnah Lain\n• Tahajud\n• Witir\n• Dhuha\n• Tarawih\n\n📌 Sumber: Al Umm, Bab Shalat Sunnah." },
              { id: "sujud_sahwi", nama: "Sujud Sahwi", gdriveUrl: "", catatan: "", materi: "📌 Sujud Sahwi\n• Sujud 2x sebelum/sesudah salam karena lupa.\n\n📌 Penyebab\n1. Meninggalkan sunnah ab'adh\n2. Ragu jumlah rakaat\n3. Kelebihan/kekurangan rakaat\n\n📌 Sumber: Madzhab Syafii (umum)." },
            ],
          },
          {
            id: "bab_3_zakat", nama: "Bab III: Zakat", warna: "green",
            fitur: [
              { id: "zakat_harta", nama: "Zakat Harta", gdriveUrl: "", catatan: "", materi: "📌 Zakat Emas & Perak\n• Emas: nishab 20 dinar (~85 gram), zakat 2.5%\n• Perak: nishab 200 dirham (~595 gram), zakat 2.5%\n\n📌 Zakat Hewan Ternak\n• Unta: nishab 5 ekor\n• Sapi: nishab 30 ekor\n• Kambing: nishab 40 ekor\n\n📌 Zakat Tanaman\n• Nishab 5 wasaq (~653 kg), zakat 10% atau 5%\n\n📌 Rikaz (Harta Karun)\n• Zakat 20%\n\n📌 Sumber: Al Umm, Bab Zakat." },
              { id: "zakat_fitrah", nama: "Zakat Fitrah", gdriveUrl: "", catatan: "", materi: "📌 Zakat Fitrah\n• Wajib bagi setiap muslim yang mampu.\n• Besar: 1 sha' (~2.5 kg) makanan pokok.\n• Waktu: sebelum shalat Idul Fitri.\n\n📌 Sumber: Madzhab Syafii (umum)." },
            ],
          },
          {
            id: "bab_4_puasa", nama: "Bab IV: Puasa", warna: "green",
            fitur: [
              { id: "puasa_ramadhan", nama: "Puasa Ramadhan", gdriveUrl: "", catatan: "", materi: "📌 Puasa Ramadhan\n• Wajib bagi muslim yang baligh, berakal, mampu.\n• Yang boleh tidak puasa: sakit, musafir, haidh, nifas, hamil, menyusui, tua.\n• Qadha: wajib ganti di hari lain.\n\n📌 Yang Membatalkan\n• Makan, minum, muntah sengaja, jima', keluar mani sengaja, haidh/nifas.\n\n📌 Sumber: Madzhab Syafii (umum)." },
              { id: "puasa_sunnah", nama: "Puasa Sunnah", gdriveUrl: "", catatan: "", materi: "📌 Puasa Sunnah\n• Senin & Kamis\n• Ayyamul Bidh (13, 14, 15 Hijriyah)\n• Arafah (9 Dzulhijjah)\n• Asyura (10 Muharram)\n• 6 hari Syawal\n• Sya'ban\n\n📌 Sumber: Madzhab Syafii (umum)." },
            ],
          },
          {
            id: "bab_5_haji", nama: "Bab V: Haji", warna: "green",
            fitur: [
              { id: "haji_wajib", nama: "Haji Wajib", gdriveUrl: "", catatan: "", materi: "📌 Haji Wajib\n• Wajib bagi muslim yang mampu.\n• Sekali seumur hidup.\n\n📌 Rukun Haji\n1. Ihram\n2. Wukuf di Arafah\n3. Thawaf ifadhah\n4. Sai\n5. Tahallul\n6. Tertib\n\n📌 Sumber: Al Umm, Bab Haji." },
              { id: "umrah", nama: "Umrah", gdriveUrl: "", catatan: "", materi: "📌 Umrah\n• Rukun: Ihram, thawaf, sai, tahallul, tertib.\n• Wajib: sekali seumur hidup.\n\n📌 Sumber: Madzhab Syafii (umum)." },
            ],
          },
          {
            id: "bab_6_nikah", nama: "Bab VI: Nikah", warna: "green",
            fitur: [
              { id: "rukun_nikah", nama: "Rukun Nikah", gdriveUrl: "", catatan: "", materi: "📌 Rukun Nikah\n1. Calon suami\n2. Calon istri\n3. Wali\n4. Dua saksi\n5. Ijab & kabul\n\n📌 Sumber: Al Umm, Bab Nikah." },
              { id: "talak", nama: "Talak", gdriveUrl: "", catatan: "", materi: "📌 Talak\n• Talak 1 & 2: boleh rujuk sebelum iddah habis.\n• Talak 3: tidak boleh rujuk sampai mantan istri menikah dengan orang lain.\n• Iddah: 3 quru', 3 bulan, atau melahirkan.\n\n📌 Sumber: Al Umm, Bab Talak." },
            ],
          },
          {
            id: "bab_7_jual_beli", nama: "Bab VII: Jual Beli", warna: "green",
            fitur: [
              { id: "rukun_jual_beli", nama: "Rukun Jual Beli", gdriveUrl: "", catatan: "", materi: "📌 Rukun Jual Beli\n1. Penjual & pembeli\n2. Barang & harga\n3. Ijab & kabul\n\n📌 Khiyar\n• Khiyar majelis, syarat, aib.\n\n📌 Sumber: Al Umm, Bab Jual Beli." },
              { id: "riba", nama: "Riba", gdriveUrl: "", catatan: "", materi: "📌 Riba\n• Riba fadhl: tukar barang sejenis takaran beda.\n• Riba nasi'ah: tukar barang dengan tempo.\n\n📌 Barang Ribawi\n• Emas, perak, gandum, syair, kurma, garam.\n\n📌 Sumber: Al Umm, Bab Riba." },
            ],
          },
          {
            id: "bab_8_haidh", nama: "Bab VIII: Haidh & Istihadhah", warna: "green",
            fitur: [
              { id: "haidh", nama: "Haidh", gdriveUrl: "", catatan: "", materi: "📌 Haidh\n• Darah dari rahim perempuan sehat.\n• Minimal 1 hari 1 malam, maksimal 15 hari.\n\n📌 Hukum\n• Haram shalat, puasa, thawaf, jima', menyentuh mushaf.\n• Wajib qadha puasa, tidak qadha shalat.\n\n📌 Sumber: Al Umm, Bab Haidh." },
              { id: "istihadhah", nama: "Istihadhah", gdriveUrl: "", catatan: "", materi: "📌 Istihadhah\n• Darah penyakit keluar terus-menerus.\n\n📌 Hukum\n• Tetap shalat, puasa, boleh digauli.\n• Wajib wudhu setiap kali shalat fardhu.\n\n📌 Sumber: Al Umm, Bab Istihadhah." },
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
              { id: "marifat_taklid", nama: "Ma'rifat & Taklid", gdriveUrl: "", catatan: "", materi: "📌 Ma'rifat\n• Keteguhan hati yang sesuai kenyataan, timbul dari dalil.\n• Wajib tahu 50 akidah.\n\n📌 Taklid\n• Keteguhan tanpa dalil.\n• Ulama beda pendapat.\n\n📌 Hukum Mempelajari Tauhid\n• Fardhu 'ain.\n\n📌 Sumber: Kifayatul Awam, Bab I." },
              { id: "hukum_akal", nama: "Hukum Akal", gdriveUrl: "", catatan: "", materi: "📌 Hukum Akal 3\n1. Wajib\n2. Mustahil\n3. Jaiz\n\n📌 Pembagian Lain\n• Dhoruri\n• Nadhori\n\n📌 Sumber: Kifayatul Awam, Bab I." },
            ],
          },
          {
            id: "bab_2_uluhiyyah", nama: "Bab II: Tauhid Uluhiyyah", warna: "green",
            fitur: [
              { id: "sifat_wajib_allah", nama: "20 Sifat Wajib Allah", gdriveUrl: "", catatan: "", materi: "📌 20 Sifat Wajib: Wujud, Qidam, Baqo', Mukholafatuhu lil hawadist, Qiyamuhu binafsihi, Wahdaniyyah, Qudrot, Irodat, Ilmu, Hayat, Sama', Bashor, Kalam, Kaunuhu Qodiron, Kaunuhu Muridan, Kaunuhu 'Aliman, Kaunuhu Hayyan, Kaunuhu Sami'an, Kaunuhu Bashiron, Kaunuhu Mutakalliman.\n\n📌 Sumber: Kifayatul Awam, Bab II." },
              { id: "sifat_mustahil_allah", nama: "20 Sifat Mustahil Allah", gdriveUrl: "", catatan: "", materi: "📌 20 Sifat Mustahil (kebalikan 20 Wajib): Al-'Adam, Al-Hudust, Al-Fana, Al-Mumatsalah, Al-Ikhtiyaj, At-Ta'adud, Al-'Ajzu, Al-Karohah, Al-Jahl, Al-Maut, Ash-Shomam, Al-'Umyu, Al-Khirs, Kaunuhu 'Ajizan, Kaunuhu Karihan, Kaunuhu Jahilan, Kaunuhu Mayyitan, Kaunuhu Ashomma, Kaunuhu A'ma, Kaunuhu Abkama.\n\n📌 Sumber: Kifayatul Awam, Bab II." },
              { id: "sifat_jaiz_allah", nama: "1 Sifat Jaiz Allah", gdriveUrl: "", catatan: "", materi: "📌 Sifat Jaiz Allah\n• Allah wenang menciptakan yang baik dan buruk.\n• Berbeda dengan Mu'tazilah.\n\n📌 Sumber: Kifayatul Awam, Bab II." },
            ],
          },
          {
            id: "bab_3_nabawiyyah", nama: "Bab III: Tauhid Nabawiyyah", warna: "green",
            fitur: [
              { id: "sifat_wajib_rasul", nama: "Sifat Wajib Rasul", gdriveUrl: "", catatan: "", materi: "📌 4 Sifat Wajib Rasul: Sidiq, Amanah, Tabligh, Fathonah.\n\n📌 Sumber: Kifayatul Awam, Bab III." },
              { id: "sifat_mustahil_rasul", nama: "Sifat Mustahil Rasul", gdriveUrl: "", catatan: "", materi: "📌 4 Sifat Mustahil Rasul: Kadzb, Khiyanat, Kitman, Baladah.\n\n📌 Sumber: Kifayatul Awam, Bab III." },
              { id: "sifat_jaiz_rasul", nama: "Sifat Jaiz Rasul", gdriveUrl: "", catatan: "", materi: "📌 Sifat Jaiz Rasul\n• Sifat kemanusiaan (sakit, makan, minum, menikah).\n\n📌 Sumber: Kifayatul Awam, Bab III." },
            ],
          },
          {
            id: "bab_4_samiyyah", nama: "Bab IV: Tauhid Sam'iyyah", warna: "green",
            fitur: [
              { id: "qodho_qodar", nama: "Qodho & Qodar", gdriveUrl: "", catatan: "", materi: "📌 Qodho & Qodar\n• Baik & buruk sudah ditentukan.\n• Qodho: qodim (sifat Allah).\n• Qodar: hadist (baru).\n\n📌 Sumber: Kifayatul Awam, Bab IV." },
              { id: "melihat_allah", nama: "Melihat Allah", gdriveUrl: "", catatan: "", materi: "📌 Melihat Allah\n• Allah bisa dilihat di akhirat.\n• Dalil: QS Al-A'raf: 143.\n\n📌 Sumber: Kifayatul Awam, Bab IV." },
              { id: "mengutus_rasul", nama: "Mengutus Para Rasul", gdriveUrl: "", catatan: "", materi: "📌 Mengutus Para Rasul\n• Jaiz bagi Allah (karunia, bukan kewajiban).\n\n📌 Sumber: Kifayatul Awam, Bab IV." },
              { id: "masa_cemerlang", nama: "Masa-Masa Cemerlang", gdriveUrl: "", catatan: "", materi: "📌 Masa Cemerlang\n• Sahabat > tabi'in > tabi' tabi'in.\n• Khalifah: Abu Bakar, Umar, Utsman, Ali.\n\n📌 Sumber: Kifayatul Awam, Bab IV." },
              { id: "silsilah_nabi", nama: "Silsilah Nabi", gdriveUrl: "", catatan: "", materi: "📌 Silsilah Nabi\n• Lahir di Mekkah, wafat di Madinah.\n• Ayah: sampai Adnan.\n• Ibu: Aminah binti Wahab.\n• 7 putra-putri Nabi.\n\n📌 Sumber: Kifayatul Awam, Bab IV." },
              { id: "haudh_syafaat_dosa", nama: "Haudh, Syafa'at & Dosa", gdriveUrl: "", catatan: "", materi: "📌 Haudh\n• Telaga Nabi, bukan Kautsar.\n\n📌 Syafa'at\n• Khusus Nabi Muhammad.\n\n📌 Dosa\n• Selain kufur tidak mengkufurkan.\n• Wajib taubat.\n\n📌 Sumber: Kifayatul Awam, Bab IV." },
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