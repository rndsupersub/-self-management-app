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
  { id: "gambar", label: "Gambar", petunjuk: "Papan kosong buat nggambar" },
  { id: "slide", label: "Slide", petunjuk: "Tulisan per halaman" },
];

export const KOLOM_IDE = [
  { id: "kuning", bg: "bg-yellow-50", border: "border-yellow-200", teks: "text-yellow-900" },
  { id: "biru", bg: "bg-blue-50", border: "border-blue-200", teks: "text-blue-900" },
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
      },
    ],
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
    // `coretan` disimpan juga supaya gambar bisa diedit & di-undo lagi nanti.
    isi = {
      dataUrl: typeof isi.dataUrl === "string" ? isi.dataUrl : "",
      coretan: Array.isArray(isi.coretan) ? isi.coretan : [],
    };
  } else {
    const slides = Array.isArray(isi.slides) && isi.slides.length > 0 ? isi.slides : slideKosong().slides;
    isi = {
      slides: slides.map((s) => ({
        id: s.id || idBaru("slide"),
        judul: s.judul || "",
        isi: s.isi || "",
        perataan: s.perataan || "left",
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
  if (data.tipe === "gambar") return data.isi.dataUrl ? "Ada gambar" : "Papan masih kosong";
  return `${data.isi.slides.length} slide`;
}
