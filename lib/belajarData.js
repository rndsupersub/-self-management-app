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
              { id: "air_najis", nama: "Air & Najis", gdriveUrl: "", catatan: "" },
              { id: "wudhu", nama: "Wudhu", gdriveUrl: "", catatan: "" },
              { id: "mandi_wajib", nama: "Mandi Wajib", gdriveUrl: "", catatan: "" },
              { id: "tayammum", nama: "Tayammum", gdriveUrl: "", catatan: "" },
            ],
          },
          {
            id: "bab_2_shalat",
            nama: "Bab II: Shalat",
            warna: "green",
            fitur: [
              { id: "syarat_rukun", nama: "Syarat & Rukun", gdriveUrl: "", catatan: "" },
              { id: "shalat_wajib", nama: "Shalat Wajib", gdriveUrl: "", catatan: "" },
              { id: "shalat_sunnah", nama: "Shalat Sunnah", gdriveUrl: "", catatan: "" },
              { id: "sujud_sahwi", nama: "Sujud Sahwi", gdriveUrl: "", catatan: "" },
            ],
          },
          {
            id: "bab_3_zakat",
            nama: "Bab III: Zakat",
            warna: "green",
            fitur: [
              { id: "zakat_harta", nama: "Zakat Harta", gdriveUrl: "", catatan: "" },
              { id: "zakat_fitrah", nama: "Zakat Fitrah", gdriveUrl: "", catatan: "" },
            ],
          },
          {
            id: "bab_4_puasa",
            nama: "Bab IV: Puasa",
            warna: "green",
            fitur: [
              { id: "puasa_ramadhan", nama: "Puasa Ramadhan", gdriveUrl: "", catatan: "" },
              { id: "puasa_sunnah", nama: "Puasa Sunnah", gdriveUrl: "", catatan: "" },
            ],
          },
          {
            id: "bab_5_haji",
            nama: "Bab V: Haji",
            warna: "green",
            fitur: [
              { id: "haji_wajib", nama: "Haji Wajib", gdriveUrl: "", catatan: "" },
              { id: "umrah", nama: "Umrah", gdriveUrl: "", catatan: "" },
            ],
          },
          {
            id: "bab_6_nikah",
            nama: "Bab VI: Nikah",
            warna: "green",
            fitur: [
              { id: "rukun_nikah", nama: "Rukun Nikah", gdriveUrl: "", catatan: "" },
              { id: "talak", nama: "Talak", gdriveUrl: "", catatan: "" },
            ],
          },
          {
            id: "bab_7_jual_beli",
            nama: "Bab VII: Jual Beli",
            warna: "green",
            fitur: [
              { id: "rukun_jual_beli", nama: "Rukun Jual Beli", gdriveUrl: "", catatan: "" },
              { id: "riba", nama: "Riba", gdriveUrl: "", catatan: "" },
            ],
          },
          {
            id: "bab_8_haidh",
            nama: "Bab VIII: Haidh & Istihadhah",
            warna: "green",
            fitur: [
              { id: "haidh", nama: "Haidh", gdriveUrl: "", catatan: "" },
              { id: "istihadhah", nama: "Istihadhah", gdriveUrl: "", catatan: "" },
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
// Return array of { id, nama } dari sub-kategori lain di kategori yang sama.
// Contoh: kalau current sub-kategori = "fiqih", return [{ id: "tauhid", nama: "Tauhid" }]
export function getSubKategoriSiblings(kategoriData, kategoriId, currentSubKategoriId) {
  const kategori = kategoriData.find((k) => k.id === kategoriId);
  if (!kategori || !kategori.subKategori) return [];
  return kategori.subKategori
    .filter((s) => s.id !== currentSubKategoriId)
    .map((s) => ({ id: s.id, nama: s.nama }));
}