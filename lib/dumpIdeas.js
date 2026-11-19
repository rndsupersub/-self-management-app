// lib/dumpIdeas.js
// Data & logika fitur "Dump Ideas" (kotretan ide per brand).
//
// Satu ide punya salah satu dari tiga bentuk:
//   mindmap -> { root: { id, teks, anak: [...] } }
//   gambar  -> { dataUrl }               (papan kosong buat nggambar bebas)
//   slide   -> { slides: [{ id, judul, isi }] }
//
// Semua ide disimpan di subcollection users/{uid}/dumpIdeas, satu dokumen per
// ide, supaya gambar (data URL) nggak membengkakkan dokumen utama user
// (Firestore membatasi 1 MB per dokumen).

export const TIPE_IDE = [
  { id: "mindmap", label: "Mindmap", petunjuk: "Peta ide bercabang" },
  { id: "gambar", label: "Papan Tulis", petunjuk: "Gambar, tulis, dan bentuk bebas" },
  { id: "catatan", label: "Sticky Notes", petunjuk: "Papan tempel catatan" },
  { id: "slide", label: "Slide", petunjuk: "Tulisan per halaman" },
];

// Warna sticky notes (bg + border + teks) supaya konsisten saat dibaca & print.
export const WARNA_CATATAN = [
  { id: "kuning", label: "Kuning", bg: "#fef9c3", border: "#fde68a" },
  { id: "pink", label: "Pink", bg: "#fce7f3", border: "#fbcfe8" },
  { id: "biru", label: "Biru", bg: "#dbeafe", border: "#bfdbfe" },
  { id: "hijau", label: "Hijau", bg: "#dcfce7", border: "#bbf7d0" },
  { id: "oranye", label: "Oranye", bg: "#ffedd5", border: "#fed7aa" },
  { id: "ungu", label: "Ungu", bg: "#ede9fe", border: "#ddd6fe" },
];

// Pilihan tampilan slide (warna & bentuk sederhana, ala PowerPoint).
export const LATAR_SLIDE = [
  { id: "putih", label: "Putih", nilai: "#ffffff" },
  { id: "biru", label: "Biru muda", nilai: "#eff6ff" },
  { id: "hijau", label: "Hijau muda", nilai: "#f0fdf4" },
  { id: "kuning", label: "Kuning muda", nilai: "#fefce8" },
  { id: "pink", label: "Pink muda", nilai: "#fdf2f8" },
  { id: "abu", label: "Abu gelap", nilai: "#1f2937" },
];

export const BENTUK_SLIDE = [
  { id: "tidak", label: "Tanpa bentuk" },
  { id: "kotak", label: "Kotak sudut" },
  { id: "bulat", label: "Lingkaran" },
  { id: "garis", label: "Garis bawah" },
  { id: "miring", label: "Pita miring" },
];

export const WARNA_BENTUK = [
  { id: "biru", label: "Biru", nilai: "#2563eb" },
  { id: "ungu", label: "Ungu", nilai: "#7c3aed" },
  { id: "hijau", label: "Hijau", nilai: "#16a34a" },
  { id: "oranye", label: "Oranye", nilai: "#ea580c" },
  { id: "pink", label: "Pink", nilai: "#db2777" },
  { id: "abu", label: "Abu", nilai: "#475569" },
];

export const KOLOM_IDE = [
  { id: "kuning", bg: "bg-yellow-50", border: "border-yellow-200", teks: "text-yellow-900" },
  { id: "biru", bg: "bg-stone-100", border: "border-stone-200", teks: "text-stone-900" },
  { id: "hijau", bg: "bg-green-50", border: "border-green-200", teks: "text-green-900" },
  { id: "pink", bg: "bg-pink-50", border: "border-pink-200", teks: "text-pink-900" },
];

// Slide sekarang pakai teks berformat (bold, miring, ukuran, list). Isinya HTML
// sederhana dari editor, jadi dibersihkan dulu sebelum disimpan/ditampilkan.
export function bersihkanHtml(html) {
  let s = String(html || "");
  s = s.replace(/<\s*(script|style|iframe|object|embed)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "");
  s = s.replace(/\son\w+\s*=\s*"[^"]*"/gi, "").replace(/\son\w+\s*=\s*'[^']*'/gi, "");
  s = s.replace(/javascript:/gi, "");
  return s;
}

// Teks lama (belum berformat) tetap kebaca: baris baru jadi paragraf.
export function isiSlideKeHtml(isi) {
  const s = String(isi || "");
  if (/<[a-z][\s\S]*>/i.test(s)) return bersihkanHtml(s);
  const aman = s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return aman
    .split(/\n{2,}/)
    .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
    .join("");
}

export function idBaru(prefix = "ide") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function mindmapKosong(judul = "Ide Utama") {
  return { root: { id: idBaru("node"), teks: judul, anak: [] } };
}

export function slideKosong() {
  return {
    slides: [
      {
        id: idBaru("slide"),
        judul: "Judul",
        isi: "Tulis idenya di sini. Satu halaman satu poin, biar gampang dibaca.",
        latar: "#ffffff",
        warnaJudul: "#1f2937",
        bentuk: "tidak",
        warnaBentuk: "#2563eb",
        ukuranJudul: "besar",
        ukuranTeks: "sedang",
        perataan: "kiri",
      },
    ],
  };
}

export function catatanKosong() {
  return { catatan: [] };
}

export function catatanBaru(warna = "kuning") {
  return {
    id: idBaru("catatan"),
    teks: "",
    // Posisi dalam persen supaya tetap proporsional di layar & saat di-print.
    x: 8 + Math.random() * 62,
    y: 8 + Math.random() * 52,
    warna,
    ukuran: 14,
    rotasi: Math.round(Math.random() * 6 - 3),
  };
}

// Normalisasi: data lama / setengah jadi tetap kebaca (nggak pernah crash).
export function normalisasiIde(ide) {
  const tipe = TIPE_IDE.some((t) => t.id === ide?.tipe) ? ide.tipe : "mindmap";
  let isi = ide?.isi || {};

  if (tipe === "mindmap") {
    const root = isi.root && typeof isi.root === "object" ? isi.root : mindmapKosong().root;
    isi = { root: { ...root, anak: Array.isArray(root.anak) ? root.anak : [] } };
  } else if (tipe === "gambar") {
    // `coretan` + `objek` (teks/bentuk) disimpan supaya papan bisa diedit & di-undo lagi.
    isi = {
      dataUrl: typeof isi.dataUrl === "string" ? isi.dataUrl : "",
      coretan: Array.isArray(isi.coretan) ? isi.coretan : [],
      objek: Array.isArray(isi.objek) ? isi.objek : [],
    };
  } else if (tipe === "catatan") {
    const daftar = Array.isArray(isi.catatan) ? isi.catatan : (isi.papan?.catatan || []);
    isi = {
      catatan: daftar.map((c) => ({
        id: c.id || idBaru("catatan"),
        teks: c.teks || "",
        x: Number.isFinite(c.x) ? c.x : 10,
        y: Number.isFinite(c.y) ? c.y : 10,
        warna: c.warna || "kuning",
        ukuran: c.ukuran || 14,
        rotasi: Number.isFinite(c.rotasi) ? c.rotasi : 0,
      })),
    };
  } else {
    const slides = Array.isArray(isi.slides) && isi.slides.length > 0 ? isi.slides : slideKosong().slides;
    isi = {
      slides: slides.map((s) => ({
        id: s.id || idBaru("slide"),
        judul: s.judul || "",
        isi: s.isi || "",
        latar: s.latar || "#ffffff",
        warnaJudul: s.warnaJudul || "#1f2937",
        bentuk: s.bentuk || "tidak",
        warnaBentuk: s.warnaBentuk || "#2563eb",
        ukuranJudul: s.ukuranJudul || "besar",
        ukuranTeks: s.ukuranTeks || "sedang",
        perataan: s.perataan || "kiri",
      })),
    };
  }

  return {
    id: ide?.id || idBaru(),
    judul: ide?.judul || "Ide Baru",
    tipe,
    isi,
    warna: ide?.warna || "kuning",
    disembunyikan: !!ide?.disembunyikan,
    createdAt: ide?.createdAt || new Date().toISOString(),
    updatedAt: ide?.updatedAt || new Date().toISOString(),
  };
}

// Tata letak mindmap: kedalaman -> kolom, daun -> baris. Orang tua diletakkan
// di tengah anak-anaknya supaya garisnya enak dilihat.
export function susunMindmap(root) {
  const LEBAR_KOLOM = 210;
  const TINGGI_BARIS = 64;
  let baris = 0;
  const posisi = {};

  const tempatkan = (node, depth) => {
    const anak = Array.isArray(node.anak) ? node.anak : [];
    let y;
    if (anak.length === 0) {
      y = baris * TINGGI_BARIS;
      baris += 1;
    } else {
      const ys = anak.map((a) => tempatkan(a, depth + 1));
      y = (ys[0] + ys[ys.length - 1]) / 2;
    }
    posisi[node.id] = { x: depth * LEBAR_KOLOM, y };
    return y;
  };

  tempatkan(root, 0);

  const nodes = [];
  const links = [];
  const jelajah = (node, dari) => {
    const p = posisi[node.id] || { x: 0, y: 0 };
    nodes.push({ id: node.id, teks: node.teks || "", ...p });
    if (dari) links.push({ dari: posisi[dari], ke: p });
    (node.anak || []).forEach((anak) => jelajah(anak, node.id));
  };
  jelajah(root, null);

  const maxX = Math.max(0, ...nodes.map((n) => n.x));
  const maxY = Math.max(0, ...nodes.map((n) => n.y));

  return {
    nodes,
    links,
    lebar: maxX + LEBAR_KOLOM,
    tinggi: maxY + TINGGI_BARIS,
  };
}

// Helper pohon mindmap: cari node, tambah anak, hapus subtree.
export function cariNode(root, id) {
  if (!root) return null;
  if (root.id === id) return root;
  for (const anak of root.anak || []) {
    const hasil = cariNode(anak, id);
    if (hasil) return hasil;
  }
  return null;
}

export function tambahAnak(root, parentId, teks) {
  const parent = cariNode(root, parentId);
  if (!parent) return root;
  const anak = parent.anak || [];
  parent.anak = [...anak, { id: idBaru("node"), teks, anak: [] }];
  return { ...root };
}

export function ubahTeksNode(root, id, teks) {
  const node = cariNode(root, id);
  if (node) node.teks = teks;
  return { ...root };
}

export function hapusNode(root, id) {
  if (!root || root.id === id) return root;
  const bersihkan = (node) => ({
    ...node,
    anak: (node.anak || [])
      .filter((a) => a.id !== id)
      .map((a) => bersihkan(a)),
  });
  return bersihkan(root);
}

export function jumlahNode(root) {
  if (!root) return 0;
  return 1 + (root.anak || []).reduce((acc, a) => acc + jumlahNode(a), 0);
}

export function labelTipe(tipe) {
  return TIPE_IDE.find((t) => t.id === tipe)?.label || tipe;
}

// Subjudul singkat di kartu ide.
export function ringkasIde(ide) {
  const data = normalisasiIde(ide);
  if (data.tipe === "mindmap") return `${jumlahNode(data.isi.root)} cabang ide`;
  if (data.tipe === "gambar") return data.isi.dataUrl ? "Ada isi papan" : "Papan masih kosong";
  if (data.tipe === "catatan") return `${(data.isi.catatan || []).length} catatan`;
  return `${data.isi.slides.length} slide`;
}
