// components/KelolaJadwal.js
"use client";

import { useState } from "react";
import { generateId } from "@/lib/pekerjaanData";
import { ArrowUp, ArrowDown, Pencil, Trash2, Plus, Save, X } from "lucide-react";

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
    const key = dayIndex === 0 ? "minggu" : "kerja";
    const updated = {
      ...(jadwalUser || {}),
      [key]: jadwalBaru,
    };
    await onUpdateJadwal(updated);
  };

  // ========== TAMBAH / EDIT ==========
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

    // Sort otomatis DIHAPUS agar urutan manual (panah) tidak hancur.
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

  // ========== NAIK / TURUN (PANAH) ==========
  const handleMoveUp = (index) => {
    if (index === 0) return; // Udah paling atas
    const newJadwal = [...jadwal];
    // Tukar posisi dengan item di atasnya
    [newJadwal[index - 1], newJadwal[index]] = [newJadwal[index], newJadwal[index - 1]];
    simpanJadwal(newJadwal);
  };

  const handleMoveDown = (index) => {
    if (index === jadwal.length - 1) return; // Udah paling bawah
    const newJadwal = [...jadwal];
    // Tukar posisi dengan item di bawahnya
    [newJadwal[index + 1], newJadwal[index]] = [newJadwal[index], newJadwal[index + 1]];
    simpanJadwal(newJadwal);
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
              <X size={18} />
            </button>
          </div>

          <p className="text-xs text-gray-500 mb-3">
            💡 Edit jadwal untuk hari <strong>{hari}</strong>. Gunakan tombol panah untuk menggeser urutan.
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
            <Plus size={16} className="mr-1" /> Tambah Kegiatan
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
                  {editingId ? <><Save size={16} className="mr-1"/> Simpan</> : <><Plus size={16} className="mr-1"/> Tambah</>}
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
              jadwal.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 p-2 rounded border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  {/* PANAH NAIK / TURUN */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      className={`btn btn-ghost btn-xs px-1 h-6 min-h-0 ${index === 0 ? "text-gray-300" : "text-gray-600 hover:bg-gray-200"}`}
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      title="Geser ke atas"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      className={`btn btn-ghost btn-xs px-1 h-6 min-h-0 ${index === jadwal.length - 1 ? "text-gray-300" : "text-gray-600 hover:bg-gray-200"}`}
                      onClick={() => handleMoveDown(index)}
                      disabled={index === jadwal.length - 1}
                      title="Geser ke bawah"
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>

                  {/* INFO JADWAL */}
                  <div className="flex-1 ml-1">
                    <p className="text-sm font-medium text-gray-800">
                      {item.label}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.waktuMulai} – {item.waktuSelesai} • {item.unit}
                    </p>
                  </div>

                  {/* TOMBOL EDIT & HAPUS */}
                  <button
                    className="btn btn-ghost btn-xs text-blue-500 hover:bg-blue-50"
                    onClick={() => handleEdit(item)}
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    className="btn btn-ghost btn-xs text-red-500 hover:bg-red-50"
                    onClick={() => handleHapus(item.id)}
                    title="Hapus"
                  >
                    <Trash2 size={16} />
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