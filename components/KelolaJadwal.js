// components/KelolaJadwal.js
"use client";

import { useState } from "react";
import { generateId } from "@/lib/pekerjaanData";

export default function KelolaJadwal({
  jadwal,
  hari,
  dayIndex,
  jadwalUser,
  onUpdateJadwal,
  onClose,
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    waktuMulai: "06:00",
    waktuSelesai: "07:00",
    label: "",
    unit: "60 menit",
  });

  // ========== SIMPAN KE FIRESTORE ==========
  const simpanJadwal = async (jadwalBaru) => {
    // Kalau hari Minggu (dayIndex 0), update jadwal.minggu
    // Kalau Senin-Sabtu (dayIndex 1-6), update jadwal.kerja
    const key = dayIndex === 0 ? "minggu" : "kerja";
    const updated = {
      ...(jadwalUser || {}),
      [key]: jadwalBaru,
    };
    await onUpdateJadwal(updated);
  };

  // ========== TAMBAH ==========
  const handleTambah = () => {
    if (!formData.label.trim()) return;

    const newItem = {
      id: generateId("jadwal"),
      waktuMulai: formData.waktuMulai,
      waktuSelesai: formData.waktuSelesai,
      label: formData.label,
      unit: formData.unit,
    };

    let jadwalBaru;
    if (editingId) {
      jadwalBaru = jadwal.map((item) =>
        item.id === editingId ? { ...item, ...newItem, id: editingId } : item
      );
    } else {
      jadwalBaru = [...jadwal, newItem];
    }

    // Sort berdasarkan waktuMulai
    jadwalBaru.sort((a, b) => a.waktuMulai.localeCompare(b.waktuMulai));

    simpanJadwal(jadwalBaru);
    setShowForm(false);
    setEditingId(null);
    setFormData({
      waktuMulai: "06:00",
      waktuSelesai: "07:00",
      label: "",
      unit: "60 menit",
    });
  };

  // ========== EDIT ==========
  const handleEdit = (item) => {
    setFormData({
      waktuMulai: item.waktuMulai,
      waktuSelesai: item.waktuSelesai,
      label: item.label,
      unit: item.unit,
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  // ========== HAPUS ==========
  const handleHapus = (id) => {
    if (!confirm("Hapus kegiatan ini dari jadwal?")) return;
    const jadwalBaru = jadwal.filter((item) => item.id !== id);
    simpanJadwal(jadwalBaru);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card bg-white shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="card-body p-4">
          {/* HEADER */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-gray-800">
              ⚙️ Kelola Jadwal — {hari}
            </h3>
            <button
              className="btn btn-ghost btn-sm text-gray-700"
              onClick={onClose}
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-gray-500 mb-3">
            💡 Edit jadwal untuk hari <strong>{hari}</strong>. Perubahan disimpan di Firestore.
          </p>

          {/* TOMBOL TAMBAH */}
          <button
            className="btn btn-primary btn-sm w-full mb-3"
            onClick={() => {
              setFormData({
                waktuMulai: "06:00",
                waktuSelesai: "07:00",
                label: "",
                unit: "60 menit",
              });
              setEditingId(null);
              setShowForm(true);
            }}
          >
            ➕ Tambah Kegiatan
          </button>

          {/* FORM */}
          {showForm && (
            <div className="bg-blue-50 rounded p-3 mb-3 space-y-2 border border-blue-200">
              <p className="text-xs font-semibold text-blue-700">
                {editingId ? "✏️ Edit Kegiatan" : "✏️ Tambah Kegiatan"}
              </p>
              <div className="flex gap-2">
                <input
                  type="time"
                  className="input input-bordered input-sm text-gray-800 bg-white"
                  value={formData.waktuMulai}
                  onChange={(e) =>
                    setFormData({ ...formData, waktuMulai: e.target.value })
                  }
                />
                <input
                  type="time"
                  className="input input-bordered input-sm text-gray-800 bg-white"
                  value={formData.waktuSelesai}
                  onChange={(e) =>
                    setFormData({ ...formData, waktuSelesai: e.target.value })
                  }
                />
              </div>
              <input
                type="text"
                className="input input-bordered input-sm w-full text-gray-800 bg-white"
                placeholder="Label (misal: 📚 NPD)"
                value={formData.label}
                onChange={(e) =>
                  setFormData({ ...formData, label: e.target.value })
                }
              />
              <input
                type="text"
                className="input input-bordered input-sm w-full text-gray-800 bg-white"
                placeholder="Unit (misal: 10 halaman)"
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
              />
              <div className="flex gap-2">
                <button
                  className="btn btn-primary btn-sm flex-1"
                  onClick={handleTambah}
                >
                  {editingId ? "💾 Simpan" : "➕ Tambah"}
                </button>
                <button
                  className="btn btn-ghost btn-sm text-gray-700"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                >
                  Batal
                </button>
              </div>
            </div>
          )}

          {/* LIST JADWAL */}
          <div className="space-y-2">
            {jadwal.length === 0 ? (
              <p className="text-sm text-gray-400 italic text-center py-4">
                Belum ada kegiatan di hari ini.
              </p>
            ) : (
              jadwal.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 p-2 rounded border border-gray-200 bg-gray-50"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      {item.label}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.waktuMulai} – {item.waktuSelesai} • {item.unit}
                    </p>
                  </div>
                  <button
                    className="btn btn-ghost btn-xs"
                    onClick={() => handleEdit(item)}
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    className="btn btn-ghost btn-xs text-red-500"
                    onClick={() => handleHapus(item.id)}
                    title="Hapus"
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}