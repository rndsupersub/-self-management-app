// lib/belajarData.js

// Data default + helper buat fitur Belajar.
// Struktur: Belajar → Kategori → Sub-kategori → Tool → Fitur.
// Karya Mingguan cuma ada di kategori Design.

export const DEFAULT_KATEGORI = [
  // ========== KATEGORI 1: DESIGN ==========
  {
    id: "design",
    nama: "🎨 Belajar Design",
    subKategori: [
      {
        id: "2d",
        nama: "🖌️ 2D Design",
        tools: [
          {
            id: "illustrator",
            nama: "Illustrator",
            fitur: [
              { id: "pen_tool", nama: "Pen Tool", gdriveUrl: "", catatan: "" },
              { id: "layer", nama: "Layer", gdriveUrl: "", catatan: "" },
              { id: "masking", nama: "Masking", gdriveUrl: "", catatan: "" },
            ],
            karyaMingguan: [], // Design punya Karya Mingguan
          },
          {
            id: "photoshop",
            nama: "Photoshop",
            fitur: [
              { id: "layer_ps", nama: "Layer", gdriveUrl: "", catatan: "" },
              { id: "selection", nama: "Selection", gdriveUrl: "", catatan: "" },
            ],
            karyaMingguan: [], // Design punya Karya Mingguan
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
            karyaMingguan: [], // Design punya Karya Mingguan
          },
          {
            id: "solidworks",
            nama: "SolidWorks",
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
              {
                id: "electrical",
                nama: "Electrical",
                fitur: [],
              },
              {
                id: "mould_design",
                nama: "Mould Design",
                fitur: [],
              },
            ],
            karyaMingguan: [], // Design punya Karya Mingguan
          },
        ],
      },
    ],
  },

  // ========== KATEGORI 2: BAHASA ==========
  // Nggak ada karyaMingguan.
  {
    id: "bahasa",
    nama: "🌏 Belajar Bahasa",
    subKategori: [
      {
        id: "inggris",
        nama: "Bahasa Inggris",
        tools: [
          {
            id: "grammar",
            nama: "Grammar",
            fitur: [],
            // NGGAK ADA karyaMingguan
          },
          {
            id: "listening",
            nama: "Listening",
            fitur: [],
            // NGGAK ADA karyaMingguan
          },
        ],
      },
      {
        id: "mandarin",
        nama: "Bahasa Mandarin",
        tools: [
          {
            id: "hsk_1",
            nama: "HSK 1",
            fitur: [], // Kosongin dulu, user bisa nambah manual
            // NGGAK ADA karyaMingguan
          },
        ],
      },
    ],
  },

  // ========== KATEGORI 3: AGAMA ==========
  // Nggak ada karyaMingguan.
  {
    id: "agama",
    nama: "📖 Belajar Agama",
    subKategori: [
      // ========== SUB-KATEGORI: FIQIH ==========
      {
        id: "fiqih",
        nama: "Fiqih Syafii",
        tools: [
          {
            id: "bab_thaharah",
            nama: "Bab Thaharah",
            fitur: [],
          },
          {
            id: "bab_shalat",
            nama: "Bab Shalat",
            fitur: [],
          },
        ],
      },

      // ========== SUB-KATEGORI: TAUHID (OPSI C - HYBRID) ==========
      {
        id: "tauhid",
        nama: "Tauhid",
        tools: [
          {
            id: "bab_1_pendahuluan",
            nama: "Bab I: Pendahuluan",
            fitur: [
              { id: "marifat_taklid", nama: "Ma'rifat & Taklid", gdriveUrl: "", catatan: "" },
              { id: "hukum_akal", nama: "Hukum Akal", gdriveUrl: "", catatan: "" },
            ],
          },
          {
            id: "bab_2_uluhiyyah",
            nama: "Bab II: Tauhid Uluhiyyah",
            fitur: [
              { id: "sifat_wajib_allah", nama: "20 Sifat Wajib Allah", gdriveUrl: "", catatan: "" },
              { id: "sifat_mustahil_allah", nama: "20 Sifat Mustahil Allah", gdriveUrl: "", catatan: "" },
              { id: "sifat_jaiz_allah", nama: "1 Sifat Jaiz Allah", gdriveUrl: "", catatan: "" },
            ],
          },
          {
            id: "bab_3_nabawiyyah",
            nama: "Bab III: Tauhid Nabawiyyah",
            fitur: [
              { id: "sifat_wajib_rasul", nama: "Sifat Wajib Rasul", gdriveUrl: "", catatan: "" },
              { id: "sifat_mustahil_rasul", nama: "Sifat Mustahil Rasul", gdriveUrl: "", catatan: "" },
              { id: "sifat_jaiz_rasul", nama: "Sifat Jaiz Rasul", gdriveUrl: "", catatan: "" },
            ],
          },
          {
            id: "bab_4_samiyyah",
            nama: "Bab IV: Tauhid Sam'iyyah",
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

// ========== TARGET HARIAN DEFAULT (PER KATEGORI) ==========
// User bisa ubah target ini (Editable Total).
export const DEFAULT_TARGET_HARIAN = {
  design: { target: 1, satuan: "materi" },
  bahasa: { target: 1, satuan: "materi" },
  agama: { target: 1, satuan: "bab" },
};

// ========== HELPER: GENERATE ID UNIK ==========
export function generateId(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

// ========== HELPER: FORMAT TANGGAL ==========
export function formatTanggal(dateStr, opsi = "panjang") {
  const d = new Date(dateStr);
  if (opsi === "pendek") {
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ========== HELPER: CARI ITEM BERDASARKAN PATH ==========
// Path: array of id, misal ["design", "2d", "illustrator"]
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
      parent = current;
      parentArray = current;
      current = found;
    } else if (i === 1) {
      const found = current.subKategori?.find((s) => s.id === id);
      if (!found) return null;
      parent = current;
      parentArray = current.subKategori;
      current = found;
    } else if (i === 2) {
      const found = current.tools?.find((t) => t.id === id);
      if (!found) return null;
      parent = current;
      parentArray = current.tools;
      current = found;
    } else if (i === 3) {
      const found = current.fitur?.find((f) => f.id === id);
      if (!found) return null;
      parent = current;
      parentArray = current.fitur;
      current = found;
    } else if (i === 4) {
      const found = current.parts?.find((p) => p.id === id);
      if (!found) return null;
      parent = current;
      parentArray = current.parts;
      current = found;
    }
  }
  return { item: current, parent, parentArray, level: path.length };
}

// ========== HELPER: UPDATE ITEM DI HIERARKI ==========
export function updateItem(kategori, path, updatedFields) {
  const result = findItem(kategori, path);
  if (!result) return kategori;
  const { item } = result;
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

// ========== HELPER: TAMBAH ITEM DI HIERARKI ==========
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
    if (!item.fitur) item.fitur = [];
    item.fitur.push(newItem);
  } else if (level === 4) {
    if (!item.parts) item.parts = [];
    item.parts.push(newItem);
  }
  return newKategori;
}

// ========== HELPER: HAPUS ITEM DI HIERARKI ==========
export function deleteItem(kategori, path) {
  const newKategori = JSON.parse(JSON.stringify(kategori));
  const result = findItem(newKategori, path);
  if (!result) return kategori;
  const { item, parentArray } = result;
  if (path.length === 1) {
    return parentArray.filter((i) => i.id !== item.id);
  }
  const rebuildResult = findItem(newKategori, path.slice(0, -1));
  if (!rebuildResult) return kategori;
  const { item: parentItem } = rebuildResult;
  const lastId = path[path.length - 1];
  if (parentItem.subKategori) {
    parentItem.subKategori = parentItem.subKategori.filter((s) => s.id !== lastId);
  }
  if (parentItem.tools) {
    parentItem.tools = parentItem.tools.filter((t) => t.id !== lastId);
  }
  if (parentItem.fitur) {
    parentItem.fitur = parentItem.fitur.filter((f) => f.id !== lastId);
  }
  if (parentItem.parts) {
    parentItem.parts = parentItem.parts.filter((p) => p.id !== lastId);
  }
  return newKategori;
}

// ========== HELPER: DAPETIN MINGGU INI ==========
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
  return `Minggu ${d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;
}

// ========== HELPER: CEK APAKAH KATEGORI PUNYA KARYA MINGGUAN ==========
export function kategoriPunyaKaryaMingguan(kategoriId) {
  return kategoriId === "design";
}

// ========== HELPER: DAPETIN KATEGORI ID DARI PATH ==========
// Path: ["design", "2d", "illustrator"] → return "design"
export function getKategoriIdFromPath(path) {
  if (!path || path.length === 0) return null;
  return path[0];
}

// ========== HELPER: DAPETIN LABEL KATEGORI ==========
export function getLabelKategoriById(kategoriList, kategoriId) {
  return kategoriList.find((k) => k.id === kategoriId)?.nama || kategoriId;
}

// ========== HELPER: DAPETIN DEFAULT TARGET PER KATEGORI ==========
export function getDefaultTargetByKategori(kategoriId) {
  return DEFAULT_TARGET_HARIAN[kategoriId] || { target: 1, satuan: "materi" };
}

// ========== HELPER: INIT LOG HARIAN ==========
// Bikin struktur log harian kosong.
export function initLogHarian() {
  return {
    "2026-01-01": [],
  };
}

// ========== HELPER: GET LOG BY KATEGORI & TANGGAL ==========
// Ambil log belajar untuk kategori tertentu di tanggal tertentu.
export function getLogByKategoriTanggal(logHarian, kategoriId, tanggal) {
  if (!logHarian || !logHarian[tanggal]) return [];
  return (logHarian[tanggal] || []).filter((log) => log.kategoriId === kategoriId);
}

// ========== HELPER: HITUNG PROGRESS BELAJAR ==========
// Hitung berapa item yang udah selesai di kategori tertentu.
// Item dianggap selesai kalau punya catatan atau gdriveUrl.
export function hitungProgressBelajar(kategoriData, logHarian, kategoriId) {
  let totalItem = 0;
  let itemSelesai = 0;

  // Kumpulin semua leaf item di kategori ini
  const kategori = kategoriData.find((k) => k.id === kategoriId);
  if (!kategori) return { totalItem, itemSelesai, persen: 0 };

  const kumpulinLeaf = (items, parentPath = []) => {
    items.forEach((item) => {
      const currentPath = [...parentPath, item.id];
      if (item.subKategori) {
        kumpulinLeaf(item.subKategori, currentPath);
      } else if (item.tools) {
        kumpulinLeaf(item.tools, currentPath);
      } else if (item.fitur && item.fitur.length > 0) {
        kumpulinLeaf(item.fitur, currentPath);
      } else if (item.parts) {
        kumpulinLeaf(item.parts, currentPath);
      } else {
        // Ini leaf
        totalItem++;
      }
    });
  };

  // Mulai dari subKategori
  kumpulinLeaf(kategori.subKategori || []);

  // Cek log harian, hitung yang udah punya catatan
  const semuaLog = Object.values(logHarian || {}).flat();
  const logKategori = semuaLog.filter((log) => log.kategoriId === kategoriId);

  // Item unik yang udah ada catatannya
  const itemUnik = new Set();
  logKategori.forEach((log) => {
    if (log.catatan || log.gdriveUrl) {
      const key = `${log.subKategoriId}_${log.toolId}_${log.fiturId}_${log.partId || ""}`;
      itemUnik.add(key);
    }
  });

  itemSelesai = itemUnik.size;

  const persen = totalItem > 0 ? Math.min(100, Math.round((itemSelesai / totalItem) * 100)) : 0;

  return { totalItem, itemSelesai, persen };
}