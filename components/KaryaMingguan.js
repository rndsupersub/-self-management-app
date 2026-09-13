// components/KaryaMingguan.js
"use client";

import { useState, useEffect } from "react";
import { generateId, formatTanggal, getMingguIni } from "@/lib/belajarData";

export default function KaryaMingguan({ karyaMingguan = [], onUpdate }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    minggu: 1,
    tanggal: "",
    tiktokUrl: "",
    catatan: "",
  });

  // ========== AUTO-SUGGEST MINGGU BARU ==========
  useEffect(() => {
    if (karyaMingguan.length === 0) {
      setFormData((prev) => ({
        ...prev,
        minggu: 1,
        tanggal: getMingguIni(),
      }));
    } else {
      // Cari minggu tertinggi
      const maxMinggu = Math.max(...karyaMingguan.map((k) => k.minggu || 0));
      const nextMinggu = maxMinggu + 1;
      // Tanggal minggu berikutnya = +7 hari dari minggu terakhir
      const lastKarya = karyaMingguan.find((k) => k.minggu === maxMinggu);
      let nextTanggal = getMingguIni();
      if (lastKarya?.tanggal) {
        const d = new Date(lastKarya.tanggal);
        d.setDate(d.getDate() + 7);
        nextTanggal = d.toISOString().split("T")[0];
      }
      setFormData((prev) => ({
        ...prev,
        minggu: nextMinggu,
        tanggal: nextTanggal,
      }));
    }
  }, [karyaMingguan.length]);

  // ========== TAMBAH / EDIT KARYA ==========
  const handleSimpan = () => {
    if (!formData.tiktokUrl.trim()) return;

    const newKarya = {
      id: editingId || generateId("karya"),
      minggu: parseInt(formData.minggu) || 1,
      tanggal: formData.tanggal || getMingguIni(),
      tiktokUrl: formData.tiktokUrl,
      catatan: formData.catatan,
      createdAt: new Date().toISOString(),
    };

    let updated;
    if (editingId) {
      updated = karyaMingguan.map((k) =>
        k.id === editingId ? { ...k, ...newKarya } : k
      );
    } else {
      updated = [...karyaMingguan, newKarya];
    }

    // Sort by minggu
    updated.sort((a, b) => (a.minggu || 0) - (b.minggu || 0));

    onUpdate(updated);
    resetForm();
  };

  // ========== HAPUS KARYA ==========
  const handleHapus = (id) => {
    if (!confirm("Hapus karya mingguan ini?")) return;
    const updated = karyaMingguan.filter((k) => k.id !== id);
    onUpdate(updated);
  };

  // ========== EDIT ==========
  const handleEdit = (karya) => {
    setFormData({
      minggu: karya.minggu,
      tanggal: karya.tanggal,
      tiktokUrl: karya.tiktokUrl,
      catatan: karya.catatan || "",
    });
    setEditingId(karya.id);
    setShowForm(true);
  };

  // ========== RESET FORM ==========
  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      minggu: karyaMingguan.length + 1,
      tanggal: "",
      tiktokUrl: "",
      catatan: "",
    });
  };

  return (
    <div className="card bg-white shadow border border-gray-200">
      <div className="card-body p-4">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-base font-bold text-gray-800">
            🎬 Karya Mingguan
          </h3>
          <button
            className="btn btn-primary btn-xs"
            onClick={() => {
              if (showForm) {
                resetForm();
              } else {
                setShowForm(true);
              }
            }}
          >
            {showForm ? "Batal" : "+ Tambah Karya"}
          </button>
        </div>

        <p className="text-xs text-gray-500 mb-3">
          💡 Upload karya lo tiap minggu ke TikTok, terus paste link-nya di sini.
          Ini jadi portofolio lo.
        </p>

        {/* FORM TAMBAH/EDIT */}
        {showForm && (
          <div className="bg-blue-50 rounded p-3 mb-3 space-y-2 border border-blue-200">
            <p className="text-xs font-semibold text-blue-700">
              {editingId ? "✏️ Edit Karya" : "✏️ Tambah Karya Baru"}
            </p>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-gray-600 mb-1 block">
                  Minggu ke-
                </label>
                <input
                  type="number"
                  min="1"
                  className="input input-bordered input-sm w-full text-gray-800 bg-white"
                  value={formData.minggu}
                  onChange={(e) =>
                    setFormData({ ...formData, minggu: e.target.value })
                  }
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-600 mb-1 block">
                  Tanggal
                </label>
                <input
                  type="date"
                  className="input input-bordered input-sm w-full text-gray-800 bg-white"
                  value={formData.tanggal}
                  onChange={(e) =>
                    setFormData({ ...formData, tanggal: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-600 mb-1 block">
                🎬 Link TikTok *
              </label>
              <input
                type="url"
                className="input input-bordered input-sm w-full text-gray-800 bg-white"
                placeholder="https://tiktok.com/@user/video/..."
                value={formData.tiktokUrl}
                onChange={(e) =>
                  setFormData({ ...formData, tiktokUrl: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-xs text-gray-600 mb-1 block">
                📝 Catatan
              </label>
              <textarea
                className="textarea textarea-bordered w-full text-sm text-gray-800 bg-white"
                rows="2"
                placeholder='Misal: "Minggu ini belajar Pen Tool, hasilnya..."'
                value={formData.catatan}
                onChange={(e) =>
                  setFormData({ ...formData, catatan: e.target.value })
                }
              />
            </div>

            <div className="flex gap-2">
              <button
                className="btn btn-primary btn-sm flex-1"
                onClick={handleSimpan}
                disabled={!formData.tiktokUrl.trim()}
              >
                {editingId ? "💾 Simpan" : "➕ Tambah"}
              </button>
              <button
                className="btn btn-ghost btn-sm text-gray-700"
                onClick={resetForm}
              >
                Batal
              </button>
            </div>
          </div>
        )}

        {/* LIST KARYA */}
        {karyaMingguan.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            <p className="text-2xl mb-2">🎬</p>
            <p className="text-sm">
              Belum ada karya mingguan. Klik "+ Tambah Karya" untuk mulai.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {karyaMingguan
              .slice()
              .sort((a, b) => (a.minggu || 0) - (b.minggu || 0))
              .map((karya) => (
                <div
                  key={karya.id}
                  className="flex items-start gap-3 p-3 rounded border bg-gray-50 border-gray-200"
                >
                  <div className="flex flex-col items-center justify-center bg-purple-100 text-purple-700 rounded w-12 h-12 flex-shrink-0">
                    <span className="text-[10px] leading-none uppercase">
                      Mgg
                    </span>
                    <span className="text-lg font-bold leading-none">
                      {karya.minggu}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <a
                      href={karya.tiktokUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-primary hover:underline truncate block"
                    >
                      🎬 {karya.tiktokUrl}
                    </a>
                    <p className="text-xs text-gray-500 mt-1">
                      📅 {formatTanggal(karya.tanggal, "pendek")}
                    </p>
                    {karya.catatan && (
                      <p className="text-xs text-gray-600 mt-1 whitespace-pre-wrap">
                        💬 {karya.catatan}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      className="btn btn-ghost btn-xs"
                      onClick={() => handleEdit(karya)}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn btn-ghost btn-xs text-red-500"
                      onClick={() => handleHapus(karya.id)}
                      title="Hapus"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}