// components/DetailKegiatan.js
"use client";

import { useState } from "react";
import { generateId, formatTanggal } from "@/lib/pekerjaanData";

export default function DetailKegiatan({
  kegiatan,
  prioritasList = [],
  sumberList = [],
  sections = [],
  onUpdate,
  onDelete,
  onToggleStatus,
  onEdit,
}) {
  const [formTambah, setFormTambah] = useState({});
  const [confirmHapus, setConfirmHapus] = useState(false);

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

  // ========== HELPER: CARI LABEL ==========
  const getPrioritasLabel = (id) =>
    prioritasList.find((p) => p.id === id)?.label || id;
  const getPrioritasWarna = (id) =>
    prioritasList.find((p) => p.id === id)?.warna || "gray";
  const getSumberLabel = (id) =>
    sumberList.find((s) => s.id === id)?.label || id;
  const getSumberWarna = (id) =>
    sumberList.find((s) => s.id === id)?.warna || "gray";

  const getBadgeClass = (warna) => {
    const map = {
      red: "bg-red-100 text-red-700 border-red-300",
      yellow: "bg-yellow-100 text-yellow-700 border-yellow-300",
      blue: "bg-blue-100 text-blue-700 border-blue-300",
      gray: "bg-gray-100 text-gray-700 border-gray-300",
      orange: "bg-orange-100 text-orange-700 border-orange-300",
      purple: "bg-purple-100 text-purple-700 border-purple-300",
      green: "bg-green-100 text-green-700 border-green-300",
      brown: "bg-amber-100 text-amber-700 border-amber-300",
      pink: "bg-pink-100 text-pink-700 border-pink-300",
    };
    return map[warna] || map.gray;
  };

  // ========== TAMBAH CATATAN KE SECTION ==========
  const handleTambahCatatan = (sectionId) => {
    const teks = formTambah[sectionId]?.trim();
    if (!teks) return;

    const sectionSekarang = kegiatan.sections?.[sectionId] || [];
    const catatanBaru = {
      id: generateId("cat"),
      teks,
      createdAt: new Date().toISOString(),
    };

    const newSections = {
      ...kegiatan.sections,
      [sectionId]: [...sectionSekarang, catatanBaru],
    };

    onUpdate(kegiatan.id, {
      sections: newSections,
      updatedAt: new Date().toISOString(),
    });

    setFormTambah({ ...formTambah, [sectionId]: "" });
  };

  // ========== HAPUS CATATAN DARI SECTION ==========
  const handleHapusCatatan = (sectionId, catatanId) => {
    if (!confirm("Hapus catatan ini?")) return;

    const sectionSekarang = kegiatan.sections?.[sectionId] || [];
    const newSections = {
      ...kegiatan.sections,
      [sectionId]: sectionSekarang.filter((c) => c.id !== catatanId),
    };

    onUpdate(kegiatan.id, {
      sections: newSections,
      updatedAt: new Date().toISOString(),
    });
  };

  const isSelesai = kegiatan.status === "selesai";

  return (
    <div className="space-y-4">
      {/* ========== HEADER INFO KEGIATAN ========== */}
      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          <div className="flex flex-wrap justify-between items-start gap-3">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                {kegiatan.judul}
              </h1>
              <div className="flex flex-wrap gap-2 mb-2">
                <span
                  className={`text-xs px-2 py-1 rounded border ${getBadgeClass(
                    getPrioritasWarna(kegiatan.prioritas)
                  )}`}
                >
                  {getPrioritasLabel(kegiatan.prioritas)}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded border ${getBadgeClass(
                    getSumberWarna(kegiatan.sumber)
                  )}`}
                >
                  {getSumberLabel(kegiatan.sumber)}
                </span>
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
              <p className="text-sm text-gray-500">
                📅 {formatTanggal(kegiatan.tanggal)}
              </p>
              {kegiatan.catatan && (
                <p className="text-sm text-gray-600 mt-2 italic">
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
                  className="btn btn-ghost btn-sm text-gray-700"
                  onClick={() => onEdit(kegiatan)}
                >
                  ✏️ Edit
                </button>
                <button
                  className="btn btn-ghost btn-sm text-red-600"
                  onClick={() => setConfirmHapus(true)}
                >
                  🗑️ Hapus
                </button>
              </div>
            </div>
          </div>

          {/* Konfirmasi Hapus */}
          {confirmHapus && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded p-3">
              <p className="text-sm text-red-700 mb-2">
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

      {/* ========== 4 SECTION ========== */}
      {sections.map((section) => {
        const catatanList = kegiatan.sections?.[section.id] || [];
        return (
          <div
            key={section.id}
            className="card bg-white shadow border border-gray-200"
          >
            <div className="card-body p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-bold text-gray-800">
                  {section.label}
                </h3>
                <span className="text-xs text-gray-400">
                  {catatanList.length} catatan
                </span>
              </div>

              {/* Daftar Catatan */}
              {catatanList.length === 0 ? (
                <p className="text-sm text-gray-400 italic mb-3">
                  Belum ada catatan di section ini.
                </p>
              ) : (
                <div className="space-y-2 mb-3">
                  {catatanList.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-start gap-2 p-2 rounded bg-gray-50 border border-gray-200"
                    >
                      <div className="flex-1">
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">
                          {cat.teks}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(cat.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <button
                        className="btn btn-ghost btn-xs text-red-500"
                        onClick={() => handleHapusCatatan(section.id, cat.id)}
                        title="Hapus catatan"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
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
                >
                  ➕
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}