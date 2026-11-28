// components/DetailKegiatan.js
// Pusat lihat + edit satu kegiatan.
// Semua field (judul, kategori, prioritas, sumber, tanggal mulai/selesai, catatan)
// bisa diedit langsung di halaman ini — nggak ada modal, nggak ada lempar balik ke brand.
"use client";

import { useState } from "react";
import {
  generateId,
  formatRentang,
  rentangKegiatan,
  hexToRgba,
} from "@/lib/pekerjaanData";
import { Settings, X, Pencil, Trash2, Plus, Check, Save, Info } from "lucide-react";
import { statusVendorEfektif } from "@/lib/vendorStatus";
import {
  vendorEfektifKegiatan,
  PIC_TANPA_VENDOR,
  MODE_PIC_TANPA_VENDOR,
  normalisasiModeTanpaVendor,
  infoPIC,
} from "@/lib/kegiatanVendor";

function formDariKegiatan(keg) {
  const { mulai, selesai } = rentangKegiatan(keg);
  return {
    judul: keg?.judul || "",
    kategori: keg?.kategori || "",
    prioritas: keg?.prioritas || "",
    sumber: keg?.sumber || "",
    catatan: keg?.catatan || "",
    tanggalMulai: mulai || "",
    tanggalSelesai: selesai || "",
    vendorId: keg?.vendorId || "",
    // Tiga peran tanpa vendor dipisah: riset & pengembangan (rnd), belum ada
    // yang mengerjakan (belum), dan produksi sendiri (produksi). Data lama
    // "internal" → belum; "manual" tanpa vendor → produksi.
    vendorMode: (() => {
      const tanpaVendor = normalisasiModeTanpaVendor(keg?.vendorMode);
      if (tanpaVendor) return tanpaVendor;
      if (keg?.vendorMode === "otomatis") return "otomatis";
      if (keg?.vendorMode === "manual") return keg?.vendorId ? "manual" : "produksi";
      return keg?.vendorId ? "manual" : "otomatis";
    })(),
  };
}

const MAP_WARNA = {
  red: "bg-red-100 text-red-700 border-red-300",
  yellow: "bg-yellow-100 text-yellow-700 border-yellow-300",
  blue: "bg-blue-100 text-blue-700 border-blue-300",
  gray: "bg-gray-100 text-gray-700 border-gray-300",
  orange: "bg-orange-100 text-orange-700 border-orange-300",
  purple: "bg-purple-100 text-purple-700 border-purple-300",
  green: "bg-green-100 text-green-700 border-green-300",
  brown: "bg-amber-100 text-amber-700 border-amber-300",
  pink: "bg-pink-100 text-pink-700 border-pink-300",
  teal: "bg-teal-100 text-teal-700 border-teal-300",
  indigo: "bg-indigo-100 text-indigo-700 border-indigo-300",
};

export default function DetailKegiatan({
  kegiatan,
  prioritasList = [],
  sumberList = [],
  sections = [],
  kategoriList = [],
  vendorList = [],
  onUpdate,
  onDelete,
  onToggleStatus,
  onUpdateSections,
}) {
  // ?edit=1 dari tombol pensil di list → langsung buka mode edit.
  // Dibaca sekali saat mount (halaman ini cuma render setelah data Firestore siap).
  const [isEditing, setIsEditing] = useState(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("edit") === "1";
  });
  const [form, setForm] = useState(() => formDariKegiatan(kegiatan));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [formTambah, setFormTambah] = useState({});
  const [editCatatan, setEditCatatan] = useState(null);
  const [confirmHapus, setConfirmHapus] = useState(false);

  const [showKelolaSection, setShowKelolaSection] = useState(false);
  const [draftSections, setDraftSections] = useState([]);
  const [errorSection, setErrorSection] = useState("");
  // Saran vendor yang sudah ditolak user (per sesi), biar nggak nagih.
  const [saranDiabaikan, setSaranDiabaikan] = useState([]);

  // Sinkronin form kalau data kegiatan berubah dari Firestore (selama nggak lagi ngedit).
  // Form di-refresh tiap kali mode edit dibuka, jadi nggak perlu effect di sini.

  if (!kegiatan) {
    return (
      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-8 text-center text-gray-400">
          <p className="text-3xl mb-2">📋</p>
          <p className="text-sm">Kegiatan tidak ditemukan.</p>
        </div>
      </div>
    );
  }

  const { mulai, selesai } = rentangKegiatan(kegiatan);
  const isSelesai = kegiatan.status === "selesai";
  const badgeClass = (warna) => MAP_WARNA[warna] || MAP_WARNA.gray;

  const kategoriData = kategoriList.find((k) => k.id === kegiatan.kategori);
  const prioritasData = prioritasList.find((p) => p.id === kegiatan.prioritas);
  const sumberData = sumberList.find((s) => s.id === kegiatan.sumber);
  // Relasi ke vendor brand ini (otomatis / manual) + status efektifnya.
  // Mode otomatis memakai mesin saran yang sama dengan filter kalender.
  const relasiVendor = vendorEfektifKegiatan({
    kegiatan,
    vendorList,
    kategoriNama: kategoriData?.label || "",
  });
  const vendorTerkait = relasiVendor.vendor;
  const statusVendorTerkait = vendorTerkait ? statusVendorEfektif(vendorTerkait) : null;
  // Beberapa kandidat sekaligus, urut dari yang paling kuat. Kalau kegiatan
  // sudah terhubung ke vendor, kandidat lain tetap ditampilkan supaya user bisa
  // ganti kalau saran/penautan sebelumnya ternyata salah.
  const kandidatVendor = relasiVendor.kandidat
    .filter((s) => s.vendor.id !== vendorTerkait?.id)
    // Kalau sudah ada vendor terpilih, tampilkan cuma alternatif yang buktinya
    // kuat, biar nggak berisik dan user nggak asal ganti.
    .filter((s) => !vendorTerkait || s.kuat)
    .filter((s) => !saranDiabaikan.includes(s.vendor.id))
    .slice(0, 3);
  const tampilkanSaran = kandidatVendor.length > 0;
  const abaikanSaran = (id) =>
    setSaranDiabaikan((prev) => (prev.includes(id) ? prev : [...prev, id]));

  // ========== MODE EDIT: MULAI / BATAL / SIMPAN ==========
  const mulaiEdit = () => {
    setForm(formDariKegiatan(kegiatan));
    setError("");
    setIsEditing(true);
  };

  const batalEdit = () => {
    setForm(formDariKegiatan(kegiatan));
    setError("");
    setIsEditing(false);
  };

  const simpanEdit = async () => {
    if (!form.judul.trim()) {
      setError("Judul kegiatan wajib diisi.");
      return;
    }
    if (!form.tanggalMulai) {
      setError("Tanggal mulai wajib diisi.");
      return;
    }
    const tanggalSelesai = form.tanggalSelesai || form.tanggalMulai;
    if (tanggalSelesai < form.tanggalMulai) {
      setError("Tanggal selesai nggak boleh sebelum tanggal mulai.");
      return;
    }

    setSaving(true);
    try {
      await onUpdate(kegiatan.id, {
        judul: form.judul.trim(),
        kategori: form.kategori,
        prioritas: form.prioritas,
        sumber: form.sumber,
        catatan: form.catatan,
        vendorId: form.vendorMode === "manual" ? form.vendorId || "" : "",
        vendorMode:
          form.vendorMode === "manual"
            ? "manual"
            : normalisasiModeTanpaVendor(form.vendorMode) || "otomatis",
        tanggalMulai: form.tanggalMulai,
        tanggalSelesai,
        // `tanggal` tetap disimpan biar data lama & fitur lain (sync sheets/telegram) aman.
        tanggal: form.tanggalMulai,
      });
      setError("");
      setIsEditing(false);
    } catch (e) {
      setError("Gagal nyimpen: " + (e?.message || "coba lagi."));
    } finally {
      setSaving(false);
    }
  };

  // ========== CATATAN PER SECTION ==========
  const simpanSections = (newSections) =>
    onUpdate(kegiatan.id, { sections: newSections });

  const handleTambahCatatan = (sectionId) => {
    const teks = formTambah[sectionId]?.trim();
    if (!teks) return;
    const sectionSekarang = kegiatan.sections?.[sectionId] || [];
    const catatanBaru = {
      id: generateId("cat"),
      teks,
      createdAt: new Date().toISOString(),
    };
    simpanSections({
      ...kegiatan.sections,
      [sectionId]: [...sectionSekarang, catatanBaru],
    });
    setFormTambah({ ...formTambah, [sectionId]: "" });
  };

  const handleSimpanCatatan = (sectionId) => {
    if (!editCatatan) return;
    const teks = editCatatan.teks.trim();
    if (!teks) return;
    const sectionSekarang = kegiatan.sections?.[sectionId] || [];
    simpanSections({
      ...kegiatan.sections,
      [sectionId]: sectionSekarang.map((c) =>
        c.id === editCatatan.catatanId
          ? { ...c, teks, updatedAt: new Date().toISOString() }
          : c
      ),
    });
    setEditCatatan(null);
  };

  const handleHapusCatatan = (sectionId, catatanId) => {
    if (!confirm("Hapus catatan ini?")) return;
    const sectionSekarang = kegiatan.sections?.[sectionId] || [];
    simpanSections({
      ...kegiatan.sections,
      [sectionId]: sectionSekarang.filter((c) => c.id !== catatanId),
    });
  };

  // ========== KELOLA SECTION ==========
  const bukaKelolaSection = () => {
    setDraftSections(sections.map((s) => ({ ...s })));
    setErrorSection("");
    setShowKelolaSection(true);
  };

  const ubahDraftSection = (id, field, value) => {
    setDraftSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const tambahDraftSection = () => {
    setDraftSections((prev) => [
      ...prev,
      { id: generateId("sec"), label: "", deskripsi: "" },
    ]);
  };

  const hapusDraftSection = (id) => {
    setDraftSections((prev) => prev.filter((s) => s.id !== id));
  };

  const simpanKelolaSection = async () => {
    const rapi = draftSections
      .map((s) => ({
        id: s.id,
        label: (s.label || "").trim(),
        deskripsi: (s.deskripsi || "").trim(),
      }))
      .filter((s) => s.label);

    if (rapi.length === 0) {
      setErrorSection("Minimal harus ada 1 section.");
      return;
    }
    try {
      await onUpdateSections(rapi);
      setShowKelolaSection(false);
      setErrorSection("");
    } catch (e) {
      setErrorSection("Gagal nyimpen section: " + (e?.message || "coba lagi."));
    }
  };

  return (
    <div className="space-y-4">
      {/* ========== HEADER KEGIATAN ========== */}
      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          {isEditing ? (
            /* ---------- FORM EDIT ---------- */
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="text-base font-bold text-gray-800">✏️ Edit Kegiatan</h2>
                <span className="text-xs text-gray-400">
                  Perubahan langsung tersimpan
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">
                  Judul Kegiatan
                </label>
                <input
                  type="text"
                  className="input input-bordered input-sm w-full text-gray-800 bg-white"
                  value={form.judul}
                  onChange={(e) => setForm({ ...form, judul: e.target.value })}
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">
                    Kategori
                  </label>
                  <select
                    className="select select-bordered select-sm w-full text-gray-800 bg-white"
                    value={form.kategori}
                    onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                  >
                    <option value="">Tanpa kategori</option>
                    {kategoriList.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">
                    Prioritas
                  </label>
                  <select
                    className="select select-bordered select-sm w-full text-gray-800 bg-white"
                    value={form.prioritas}
                    onChange={(e) => setForm({ ...form, prioritas: e.target.value })}
                  >
                    <option value="">Tanpa prioritas</option>
                    {prioritasList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">
                    Sumber
                  </label>
                  <select
                    className="select select-bordered select-sm w-full text-gray-800 bg-white"
                    value={form.sumber}
                    onChange={(e) => setForm({ ...form, sumber: e.target.value })}
                  >
                    <option value="">Tanpa sumber</option>
                    {sumberList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">
                  Penanggung Jawab / PIC
                </label>
                <select
                  className="select select-bordered select-sm w-full text-gray-800 bg-white"
                  value={
                    form.vendorMode === "manual" && form.vendorId
                      ? form.vendorId
                      : form.vendorMode === "manual"
                        ? "produksi"
                        : PIC_TANPA_VENDOR[form.vendorMode]
                          ? form.vendorMode
                          : "otomatis"
                  }
                  onChange={(e) => {
                    const nilai = e.target.value;
                    if (nilai === "otomatis") {
                      setForm({ ...form, vendorMode: "otomatis", vendorId: "" });
                    } else if (PIC_TANPA_VENDOR[nilai]) {
                      setForm({ ...form, vendorMode: nilai, vendorId: "" });
                    } else {
                      setForm({ ...form, vendorMode: "manual", vendorId: nilai });
                    }
                  }}
                >
                  <option value="otomatis">🤖 Otomatis — pilih dari bukti kunjungan/nama</option>
                  {MODE_PIC_TANPA_VENDOR.map((id) => (
                    <option key={id} value={id}>
                      {PIC_TANPA_VENDOR[id].emoji} {PIC_TANPA_VENDOR[id].label}
                    </option>
                  ))}
                  {vendorList.length > 0 && (
                    <optgroup label="Vendor — dikunci manual">
                      {vendorList.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.nama} · {statusVendorEfektif(v).label}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {form.vendorMode === "manual" && form.vendorId && !vendorList.some((v) => v.id === form.vendorId) && (
                    <option value={form.vendorId}>Vendor lama (dihapus dari daftar)</option>
                  )}
                </select>
                <p className="text-[10px] text-gray-500 mt-1">
                  <strong>R&amp;D</strong> untuk riset &amp; pengembangan, <strong>Belum ada yang mengerjakan</strong> kalau PIC menyusul, <strong>Produksi sendiri</strong> kalau dikerjakan tanpa vendor. Pilih vendor untuk mengunci manual; otomatis memakai nama vendor &amp; log kunjungan yang cocok.
                </p>
                {relasiVendor.mode === "otomatis" && relasiVendor.vendor && (
                  <p className="text-[10px] text-amber-700 mt-1">
                    Saran otomatis saat ini: <strong>{relasiVendor.vendor.nama}</strong>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    className="input input-bordered input-sm w-full text-gray-800 bg-white"
                    value={form.tanggalMulai}
                    onChange={(e) =>
                      setForm({ ...form, tanggalMulai: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">
                    Tanggal Selesai
                  </label>
                  <input
                    type="date"
                    className="input input-bordered input-sm w-full text-gray-800 bg-white"
                    value={form.tanggalSelesai}
                    onChange={(e) =>
                      setForm({ ...form, tanggalSelesai: e.target.value })
                    }
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    Kosongin kalau kegiatan cuma 1 hari.
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">
                  Catatan
                </label>
                <textarea
                  className="textarea textarea-bordered w-full text-sm text-gray-800 bg-white"
                  rows="3"
                  placeholder="Deskripsi singkat kegiatan (opsional)"
                  value={form.catatan}
                  onChange={(e) => setForm({ ...form, catatan: e.target.value })}
                />
              </div>

              {error && (
                <p className="text-xs text-error bg-red-50 border border-red-200 rounded px-2 py-1">
                  {error}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={simpanEdit}
                  disabled={saving}
                >
                  <Save size={14} className="mr-1" />
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
                <button
                  className="btn btn-ghost btn-sm text-gray-700"
                  onClick={batalEdit}
                  disabled={saving}
                >
                  Batal
                </button>
                <button
                  className="btn btn-ghost btn-sm text-gray-500 ml-auto"
                  onClick={() => {
                    setConfirmHapus(true);
                    setIsEditing(false);
                  }}
                  title="Hapus kegiatan"
                >
                  <Trash2 size={14} className="mr-1" /> Hapus
                </button>
              </div>
            </div>
          ) : (
            /* ---------- MODE LIHAT ---------- */
            <div className="flex flex-wrap justify-between items-start gap-3">
              <div className="flex-1 min-w-[240px]">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  {kegiatan.judul}
                </h1>
                <div className="flex flex-wrap gap-2 mb-2">
                  {kategoriData && (
                    <span
                      className={`text-xs px-2 py-1 rounded border ${
                        kategoriData.customHex
                          ? ""
                          : badgeClass(kategoriData.warna)
                      }`}
                      style={
                        kategoriData.customHex
                          ? {
                              backgroundColor: hexToRgba(
                                kategoriData.customHex,
                                0.15
                              ),
                              color: kategoriData.customHex,
                              borderColor: kategoriData.customHex,
                            }
                          : undefined
                      }
                    >
                      {kategoriData.label}
                    </span>
                  )}
                  {prioritasData && (
                    <span
                      className={`text-xs px-2 py-1 rounded border ${badgeClass(
                        prioritasData.warna
                      )}`}
                    >
                      {prioritasData.label}
                    </span>
                  )}
                  {sumberData && (
                    <span
                      className={`text-xs px-2 py-1 rounded border ${badgeClass(
                        sumberData.warna
                      )}`}
                    >
                      {sumberData.label}
                    </span>
                  )}
                  <span
                    className={`text-xs px-2 py-1 rounded border ${
                      isSelesai
                        ? "bg-green-100 text-green-700 border-green-300"
                        : "bg-gray-100 text-gray-700 border-gray-300"
                    }`}
                  >
                    {isSelesai ? "✅ Selesai" : "⏳ Belum Selesai"}
                  </span>
                </div>
                {vendorTerkait && (
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                    <span className="px-2 py-1 rounded border border-stone-300 bg-stone-100 text-stone-700">🏭 {vendorTerkait.nama}</span>
                    <span className={`px-2 py-1 rounded border ${badgeClass(statusVendorTerkait.warna)}`}>{statusVendorTerkait.label}</span>
                    <span className="text-gray-500">{vendorTerkait.logKunjungan?.length || 0} kunjungan</span>
                    <span className={`px-1.5 py-0.5 rounded border text-[10px] ${relasiVendor.mode === "otomatis" ? "border-amber-300 bg-amber-50 text-amber-800" : "border-stone-300 bg-white text-stone-600"}`}>
                      {relasiVendor.mode === "otomatis" ? "🤖 otomatis" : "✍️ manual"}
                    </span>
                    {relasiVendor.mode === "otomatis" && relasiVendor.sumber === "manual-lama" && (
                      <span className="text-[10px] text-gray-500">belum ada bukti otomatis yang kuat</span>
                    )}
                  </div>
                )}
                {infoPIC(relasiVendor.mode) && (
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                    <span className="px-2 py-1 rounded border border-stone-300 bg-stone-100 text-stone-700">
                      {infoPIC(relasiVendor.mode).emoji} {infoPIC(relasiVendor.mode).label}
                    </span>
                    <span className="text-gray-500">{infoPIC(relasiVendor.mode).catatan}</span>
                  </div>
                )}
                {tampilkanSaran && (
                  <div className="mt-2 rounded border border-amber-300 bg-amber-50 p-2 text-xs text-stone-700" data-html2canvas-ignore="true">
                    <p className="font-semibold flex items-center gap-1">
                      {vendorTerkait ? "🔁 Bukan vendor ini? Vendor lain yang mungkin" : "🔗 Mungkin terkait"}
                    </p>
                    <ul className="mt-1 space-y-1.5">
                      {kandidatVendor.map((saran) => (
                        <li
                          key={saran.vendor.id}
                          className="rounded border border-amber-200 bg-white/70 p-1.5"
                        >
                          <p className="font-semibold text-stone-800">
                            {saran.vendor.nama}
                            {saran.kuat && (
                              <span className="ml-1 text-[10px] font-normal text-amber-700">
                                · bukti kuat
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-stone-600 mt-0.5">{saran.alasan}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            <button
                              type="button"
                              className="btn btn-xs btn-primary"
                              onClick={() => onUpdate(kegiatan.id, { vendorId: saran.vendor.id, vendorMode: "manual" })}
                            >
                              {vendorTerkait ? `Ganti ke ${saran.vendor.nama}` : `Hubungkan ke ${saran.vendor.nama}`}
                            </button>
                            <button
                              type="button"
                              className="btn btn-xs btn-ghost text-stone-600"
                              onClick={() => abaikanSaran(saran.vendor.id)}
                            >
                              Bukan ini
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <p className="text-[10px] text-stone-500 mt-1">
                      Relasi tidak diubah otomatis — pilih sendiri vendor yang benar.
                    </p>
                  </div>
                )}
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-2">
                  📅 {formatRentang(mulai, selesai, "panjang")}
                </p>
                {kegiatan.catatan && (
                  <p className="text-sm text-gray-600 mt-2 italic whitespace-pre-wrap">
                    💬 {kegiatan.catatan}
                  </p>
                )}
              </div>

              {/* Tombol Aksi */}
              <div className="flex flex-col gap-2">
                <button
                  className={`btn btn-sm ${
                    isSelesai ? "btn-ghost text-gray-700" : "btn-success"
                  }`}
                  onClick={() => onToggleStatus(kegiatan.id)}
                >
                  {isSelesai ? "↩️ Batalkan Selesai" : "✓ Tandai Selesai"}
                </button>
                <div className="flex gap-2">
                  <button
                    className="btn btn-ghost btn-sm text-stone-500 hover:text-stone-800"
                    onClick={mulaiEdit}
                  >
                    <Pencil size={14} className="mr-1" /> Edit
                  </button>
                  <button
                    className="btn btn-ghost btn-sm text-stone-400 hover:text-error"
                    onClick={() => setConfirmHapus(true)}
                  >
                    <Trash2 size={14} className="mr-1" /> Hapus
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Konfirmasi Hapus */}
          {confirmHapus && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded p-3">
              <p className="text-sm text-error mb-2">
                Yakin mau hapus kegiatan ini? Data akan masuk history.
              </p>
              <div className="flex gap-2">
                <button
                  className="btn btn-error btn-sm"
                  onClick={() => {
                    onDelete(kegiatan.id);
                    setConfirmHapus(false);
                  }}
                >
                  Ya, Hapus
                </button>
                <button
                  className="btn btn-ghost btn-sm text-gray-700"
                  onClick={() => setConfirmHapus(false)}
                >
                  Batal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========== SECTION KEGIATAN ========== */}
      <div className="flex flex-wrap justify-between items-center gap-2">
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <Info size={13} />
          Section = tempat nyatet kerjaan per tahap (analisis → desain → vendor).
        </p>
        <button
          className="btn btn-ghost btn-xs text-gray-600"
          onClick={bukaKelolaSection}
        >
          <Settings size={14} className="mr-1" /> Kelola Section
        </button>
      </div>

      {sections.length === 0 && (
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-6 text-center text-gray-400 text-sm">
            Belum ada section. Klik <strong>Kelola Section</strong> buat nambah.
          </div>
        </div>
      )}

      {sections.map((section) => {
        const catatanList = kegiatan.sections?.[section.id] || [];
        return (
          <div key={section.id} className="card bg-white shadow border border-gray-200">
            <div className="card-body p-4">
              <div className="flex justify-between items-start gap-2 mb-1">
                <div>
                  <h3 className="text-base font-bold text-gray-800">
                    {section.label}
                  </h3>
                  {section.deskripsi && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {section.deskripsi}
                    </p>
                  )}
                </div>
                <span className="text-xs text-gray-400 shrink-0">
                  {catatanList.length} catatan
                </span>
              </div>

              {/* Daftar Catatan */}
              {catatanList.length === 0 ? (
                <p className="text-sm text-gray-400 italic my-2">
                  Belum ada catatan di section ini.
                </p>
              ) : (
                <div className="space-y-2 my-2">
                  {catatanList.map((cat) => {
                    const sedangEdit =
                      editCatatan?.sectionId === section.id &&
                      editCatatan?.catatanId === cat.id;
                    return (
                      <div
                        key={cat.id}
                        className="p-2 rounded bg-gray-50 border border-gray-200"
                      >
                        {sedangEdit ? (
                          <div className="space-y-2">
                            <textarea
                              className="textarea textarea-bordered w-full text-sm text-gray-800 bg-white"
                              rows="3"
                              value={editCatatan.teks}
                              onChange={(e) =>
                                setEditCatatan({
                                  ...editCatatan,
                                  teks: e.target.value,
                                })
                              }
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <button
                                className="btn btn-primary btn-xs"
                                onClick={() => handleSimpanCatatan(section.id)}
                                disabled={!editCatatan.teks.trim()}
                              >
                                <Check size={12} className="mr-1" /> Simpan
                              </button>
                              <button
                                className="btn btn-ghost btn-xs text-gray-700"
                                onClick={() => setEditCatatan(null)}
                              >
                                Batal
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start gap-2">
                            <div className="flex-1">
                              <p className="text-sm text-gray-800 whitespace-pre-wrap">
                                {cat.teks}
                              </p>
                              <p className="text-[10px] text-gray-400 mt-1">
                                {new Date(cat.createdAt).toLocaleString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                                {cat.updatedAt ? " · diedit" : ""}
                              </p>
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <button
                                className="btn btn-ghost btn-xs text-stone-400 hover:text-stone-800"
                                title="Edit catatan"
                                onClick={() =>
                                  setEditCatatan({
                                    sectionId: section.id,
                                    catatanId: cat.id,
                                    teks: cat.teks,
                                  })
                                }
                              >
                                <Pencil size={12} />
                              </button>
                              <button
                                className="btn btn-ghost btn-xs text-stone-400 hover:text-error"
                                title="Hapus catatan"
                                onClick={() =>
                                  handleHapusCatatan(section.id, cat.id)
                                }
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Form Tambah Catatan */}
              <div className="flex gap-2">
                <textarea
                  className="textarea textarea-bordered text-sm flex-1 text-gray-800 bg-white"
                  rows="2"
                  placeholder={`Tambah catatan ${section.label}...`}
                  value={formTambah[section.id] || ""}
                  onChange={(e) =>
                    setFormTambah({
                      ...formTambah,
                      [section.id]: e.target.value,
                    })
                  }
                />
                <button
                  className="btn btn-primary btn-sm self-end"
                  onClick={() => handleTambahCatatan(section.id)}
                  disabled={!formTambah[section.id]?.trim()}
                  title="Tambah catatan"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {/* ========== MODAL KELOLA SECTION ========== */}
      {showKelolaSection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card bg-white shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="card-body p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                  <Settings size={18} /> Kelola Section
                </h3>
                <button
                  className="btn btn-ghost btn-sm text-gray-700"
                  onClick={() => setShowKelolaSection(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-xs text-gray-500 mb-3">
                Section dipakai di semua kegiatan brand ini. Mau rename? Ganti
                labelnya. Mau nambah tahap baru? Tambah di bawah.
              </p>

              <div className="space-y-2">
                {draftSections.map((s) => (
                  <div
                    key={s.id}
                    className="bg-gray-50 border border-gray-200 rounded p-2 space-y-1"
                  >
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="input input-bordered input-sm flex-1 text-gray-800 bg-white"
                        placeholder="Nama section (misal: 📦 Produksi)"
                        value={s.label}
                        onChange={(e) =>
                          ubahDraftSection(s.id, "label", e.target.value)
                        }
                      />
                      <button
                        className="btn btn-ghost btn-sm text-stone-400 hover:text-error"
                        onClick={() => hapusDraftSection(s.id)}
                        title="Hapus section"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <input
                      type="text"
                      className="input input-bordered input-sm w-full text-gray-800 bg-white"
                      placeholder="Deskripsi singkat (biar nggak lupa fungsinya)"
                      value={s.deskripsi || ""}
                      onChange={(e) =>
                        ubahDraftSection(s.id, "deskripsi", e.target.value)
                      }
                    />
                  </div>
                ))}
              </div>

              <button
                className="btn btn-outline btn-sm w-full mt-3"
                onClick={tambahDraftSection}
              >
                <Plus size={14} className="mr-1" /> Tambah Section
              </button>

              {errorSection && (
                <p className="text-xs text-error bg-red-50 border border-red-200 rounded px-2 py-1 mt-2">
                  {errorSection}
                </p>
              )}

              <p className="text-[10px] text-gray-500 mt-3">
                Catatan di section yang dihapus nggak ikut kehapus — cuma
                disembunyikan. Kalau section-nya dibikin lagi, catatannya balik.
              </p>

              <div className="flex gap-2 mt-3">
                <button
                  className="btn btn-primary btn-sm flex-1"
                  onClick={simpanKelolaSection}
                >
                  <Save size={14} className="mr-1" /> Simpan Section
                </button>
                <button
                  className="btn btn-ghost btn-sm text-gray-700"
                  onClick={() => setShowKelolaSection(false)}
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
