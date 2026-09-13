// components/EvaluasiMingguan.js
"use client";

import { useState, useEffect } from "react";
import {
  generateId,
  getMingguIni,
  hitungTanggalSelesai,
  formatMinggu,
  getSaranKeputusan,
  hitungTargetNaik,
  DEFAULT_TARGET_MINGGU_1,
  DEFAULT_FIELD_EVALUASI,
} from "@/lib/olahragaData";

export default function EvaluasiMingguan({
  minggu = [],
  fieldEvaluasi = DEFAULT_FIELD_EVALUASI,
  onUpdateMinggu,
  onUpdateFieldEvaluasi,
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showFieldForm, setShowFieldForm] = useState(false);
  const [newFieldLabel, setNewFieldLabel] = useState("");

  const [formData, setFormData] = useState({
    mingguKe: 1,
    tanggalMulai: "",
    tanggalSelesai: "",
    target: { ...DEFAULT_TARGET_MINGGU_1 },
    evaluasi: {},
    keputusan: "stay",
    catatanMingguan: "",
  });

  // ========== AUTO-SUGGEST MINGGU BARU ==========
  useEffect(() => {
    if (minggu.length === 0) {
      setFormData((prev) => ({
        ...prev,
        mingguKe: 1,
        tanggalMulai: getMingguIni(),
        tanggalSelesai: hitungTanggalSelesai(getMingguIni()),
        target: { ...DEFAULT_TARGET_MINGGU_1 },
      }));
    } else {
      const maxMinggu = Math.max(...minggu.map((m) => m.mingguKe || 0));
      const lastMinggu = minggu.find((m) => m.mingguKe === maxMinggu);
      let nextTanggalMulai = getMingguIni();
      if (lastMinggu?.tanggalSelesai) {
        const d = new Date(lastMinggu.tanggalSelesai);
        d.setDate(d.getDate() + 1);
        nextTanggalMulai = d.toISOString().split("T")[0];
      }

      // Auto-suggest target naik dari minggu sebelumnya
      let nextTarget = { ...DEFAULT_TARGET_MINGGU_1 };
      if (lastMinggu?.keputusan === "naik") {
        nextTarget = hitungTargetNaik(lastMinggu.target);
      } else if (lastMinggu?.target) {
        nextTarget = { ...lastMinggu.target };
      }

      setFormData((prev) => ({
        ...prev,
        mingguKe: maxMinggu + 1,
        tanggalMulai: nextTanggalMulai,
        tanggalSelesai: hitungTanggalSelesai(nextTanggalMulai),
        target: nextTarget,
      }));
    }
  }, [minggu.length]);

  // ========== TAMBAH / EDIT MINGGU ==========
  const handleSimpan = () => {
    if (!formData.tanggalMulai) return;

    const newMinggu = {
      id: editingId || generateId("minggu"),
      mingguKe: parseInt(formData.mingguKe) || 1,
      tanggalMulai: formData.tanggalMulai,
      tanggalSelesai:
        formData.tanggalSelesai || hitungTanggalSelesai(formData.tanggalMulai),
      target: formData.target,
      evaluasi: formData.evaluasi,
      keputusan: formData.keputusan,
      catatanMingguan: formData.catatanMingguan,
      createdAt: new Date().toISOString(),
    };

    let updated;
    if (editingId) {
      updated = minggu.map((m) => (m.id === editingId ? { ...m, ...newMinggu } : m));
    } else {
      updated = [...minggu, newMinggu];
    }
    updated.sort((a, b) => (a.mingguKe || 0) - (b.mingguKe || 0));

    onUpdateMinggu(updated);
    resetForm();
  };

  // ========== HAPUS MINGGU ==========
  const handleHapus = (id) => {
    if (!confirm("Hapus minggu ini? Data evaluasi akan hilang.")) return;
    const updated = minggu.filter((m) => m.id !== id);
    onUpdateMinggu(updated);
  };

  // ========== EDIT ==========
  const handleEdit = (m) => {
    setFormData({
      mingguKe: m.mingguKe,
      tanggalMulai: m.tanggalMulai,
      tanggalSelesai: m.tanggalSelesai,
      target: m.target || { ...DEFAULT_TARGET_MINGGU_1 },
      evaluasi: m.evaluasi || {},
      keputusan: m.keputusan || "stay",
      catatanMingguan: m.catatanMingguan || "",
    });
    setEditingId(m.id);
    setShowForm(true);
  };

  // ========== RESET FORM ==========
  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      mingguKe: minggu.length + 1,
      tanggalMulai: "",
      tanggalSelesai: "",
      target: { ...DEFAULT_TARGET_MINGGU_1 },
      evaluasi: {},
      keputusan: "stay",
      catatanMingguan: "",
    });
  };

  // ========== UPDATE TARGET ==========
  const updateTarget = (field, key, value) => {
    setFormData({
      ...formData,
      target: {
        ...formData.target,
        [field]: {
          ...formData.target[field],
          [key]: parseFloat(value) || 0,
        },
      },
    });
  };

  // ========== UPDATE EVALUASI ==========
  const updateEvaluasi = (fieldId, value) => {
    setFormData({
      ...formData,
      evaluasi: { ...formData.evaluasi, [fieldId]: value },
    });
  };

  // ========== TAMBAH FIELD EVALUASI BARU ==========
  const handleTambahField = () => {
    if (!newFieldLabel.trim()) return;
    const newField = {
      id: generateId("field"),
      label: newFieldLabel,
    };
    const updated = [...fieldEvaluasi, newField];
    onUpdateFieldEvaluasi(updated);
    setNewFieldLabel("");
    setShowFieldForm(false);
  };

  // ========== HAPUS FIELD EVALUASI ==========
  const handleHapusField = (fieldId) => {
    if (!confirm("Hapus field evaluasi ini? Data evaluasi di field ini akan hilang.")) return;
    const updated = fieldEvaluasi.filter((f) => f.id !== fieldId);
    onUpdateFieldEvaluasi(updated);
  };

  // ========== SARAN KEPUTUSAN ==========
  const saran = getSaranKeputusan(formData.evaluasi);

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-base font-bold text-gray-800">📊 Evaluasi Mingguan</h3>
            <div className="flex gap-1">
              <button
                className="btn btn-ghost btn-xs text-gray-600"
                onClick={() => setShowFieldForm(!showFieldForm)}
                title="Kelola Field Evaluasi"
              >
                ⚙️ Field
              </button>
              <button
                className="btn btn-primary btn-xs"
                onClick={() => {
                  if (showForm) resetForm();
                  else setShowForm(true);
                }}
              >
                {showForm ? "Batal" : "+ Tambah Minggu"}
              </button>
            </div>
          </div>

          {/* FORM TAMBAH FIELD EVALUASI */}
          {showFieldForm && (
            <div className="bg-purple-50 rounded p-3 mb-3 space-y-2 border border-purple-200">
              <p className="text-xs font-semibold text-purple-700">
                ⚙️ Kelola Field Evaluasi
              </p>
              <div className="space-y-1">
                {fieldEvaluasi.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between bg-white rounded px-2 py-1 border border-gray-200"
                  >
                    <span className="text-xs text-gray-700">{f.label}</span>
                    <button
                      className="btn btn-ghost btn-xs text-red-500"
                      onClick={() => handleHapusField(f.id)}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  className="input input-bordered input-xs flex-1 text-gray-800 bg-white"
                  placeholder="Nama field baru (misal: 🩹 Cedera)"
                  value={newFieldLabel}
                  onChange={(e) => setNewFieldLabel(e.target.value)}
                />
                <button
                  className="btn btn-primary btn-xs"
                  onClick={handleTambahField}
                  disabled={!newFieldLabel.trim()}
                >
                  ➕
                </button>
              </div>
            </div>
          )}

          {/* FORM TAMBAH/EDIT MINGGU */}
          {showForm && (
            <div className="bg-blue-50 rounded p-3 space-y-3 border border-blue-200">
              <p className="text-xs font-semibold text-blue-700">
                {editingId ? "✏️ Edit Minggu" : "✏️ Tambah Minggu Baru"}
              </p>

              {/* Minggu Ke & Tanggal */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Minggu ke-</label>
                  <input
                    type="number"
                    min="1"
                    className="input input-bordered input-sm w-full text-gray-800 bg-white"
                    value={formData.mingguKe}
                    onChange={(e) =>
                      setFormData({ ...formData, mingguKe: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Tanggal Mulai</label>
                  <input
                    type="date"
                    className="input input-bordered input-sm w-full text-gray-800 bg-white"
                    value={formData.tanggalMulai}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tanggalMulai: e.target.value,
                        tanggalSelesai: hitungTanggalSelesai(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Tanggal Selesai</label>
                  <input
                    type="date"
                    className="input input-bordered input-sm w-full text-gray-800 bg-white"
                    value={formData.tanggalSelesai}
                    onChange={(e) =>
                      setFormData({ ...formData, tanggalSelesai: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Target */}
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2">🎯 Target Minggu Ini</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-600 mb-1 block">🏃 Jogging (km)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="input input-bordered input-sm w-full text-gray-800 bg-white"
                      value={formData.target.jogging?.km || ""}
                      onChange={(e) => updateTarget("jogging", "km", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-600 mb-1 block">⏱️ Pace</label>
                    <input
                      type="number"
                      step="0.1"
                      className="input input-bordered input-sm w-full text-gray-800 bg-white"
                      value={formData.target.jogging?.pace || ""}
                      onChange={(e) => updateTarget("jogging", "pace", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-600 mb-1 block">💪 Push Up (reps)</label>
                    <input
                      type="number"
                      className="input input-bordered input-sm w-full text-gray-800 bg-white"
                      value={formData.target.pushUp?.reps || ""}
                      onChange={(e) => updateTarget("pushUp", "reps", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-600 mb-1 block">🦵 Leg Raise (reps)</label>
                    <input
                      type="number"
                      className="input input-bordered input-sm w-full text-gray-800 bg-white"
                      value={formData.target.legRaise?.reps || ""}
                      onChange={(e) => updateTarget("legRaise", "reps", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-600 mb-1 block">🧘 Plank (detik)</label>
                    <input
                      type="number"
                      className="input input-bordered input-sm w-full text-gray-800 bg-white"
                      value={formData.target.plank?.detik || ""}
                      onChange={(e) => updateTarget("plank", "detik", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Evaluasi */}
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2">📝 Evaluasi</p>
                <div className="space-y-2">
                  {fieldEvaluasi.map((f) => (
                    <div key={f.id}>
                      <label className="text-xs text-gray-600 mb-1 block">{f.label}</label>
                      <textarea
                        className="textarea textarea-bordered w-full text-sm text-gray-800 bg-white"
                        rows="2"
                        placeholder="Tulis evaluasi..."
                        value={formData.evaluasi[f.id] || ""}
                        onChange={(e) => updateEvaluasi(f.id, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Saran Keputusan */}
              <div className={`rounded p-2 border ${
                saran.saran === "naik"
                  ? "bg-green-50 border-green-200"
                  : saran.saran === "turun"
                  ? "bg-red-50 border-red-200"
                  : "bg-yellow-50 border-yellow-200"
              }`}>
                <p className="text-xs font-semibold">
                  {saran.saran === "naik" && "✅ Saran: NAIK level"}
                  {saran.saran === "turun" && "⬇️ Saran: TURUN level"}
                  {saran.saran === "stay" && "⏸️ Saran: STAY level"}
                </p>
                <p className="text-xs text-gray-600 mt-1">{saran.alasan}</p>
              </div>

              {/* Keputusan User */}
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">
                  🎯 Keputusan Lo
                </label>
                <div className="flex gap-2">
                  {["naik", "stay", "turun"].map((opt) => (
                    <button
                      key={opt}
                      className={`btn btn-sm flex-1 ${
                        formData.keputusan === opt ? "btn-primary" : "btn-outline"
                      }`}
                      onClick={() => setFormData({ ...formData, keputusan: opt })}
                    >
                      {opt === "naik" && "⬆️ Naik"}
                      {opt === "stay" && "⏸️ Stay"}
                      {opt === "turun" && "⬇️ Turun"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Catatan Mingguan */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">
                  📝 Catatan Mingguan (akumulasi)
                </label>
                <textarea
                  className="textarea textarea-bordered w-full text-sm text-gray-800 bg-white"
                  rows="3"
                  placeholder="Catatan akumulasi minggu ini..."
                  value={formData.catatanMingguan}
                  onChange={(e) =>
                    setFormData({ ...formData, catatanMingguan: e.target.value })
                  }
                />
              </div>

              {/* Tombol */}
              <div className="flex gap-2">
                <button className="btn btn-primary btn-sm flex-1" onClick={handleSimpan}>
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
        </div>
      </div>

      {/* LIST MINGGU */}
      {minggu.length === 0 && !showForm ? (
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-8 text-center text-gray-400">
            <p className="text-3xl mb-2">📊</p>
            <p className="text-sm">
              Belum ada minggu. Klik "+ Tambah Minggu" untuk mulai.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {minggu
            .slice()
            .sort((a, b) => (a.mingguKe || 0) - (b.mingguKe || 0))
            .map((m) => (
              <div
                key={m.id}
                className="card bg-white shadow border border-gray-200"
              >
                <div className="card-body p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-base font-bold text-gray-800">
                        {formatMinggu(m.mingguKe, m.tanggalMulai, m.tanggalSelesai)}
                      </h3>
                      <div className="flex gap-1 mt-1">
                        <span
                          className={`badge badge-sm ${
                            m.keputusan === "naik"
                              ? "badge-success"
                              : m.keputusan === "turun"
                              ? "badge-error"
                              : "badge-warning"
                          }`}
                        >
                          {m.keputusan === "naik" && "⬆️ Naik"}
                          {m.keputusan === "stay" && "⏸️ Stay"}
                          {m.keputusan === "turun" && "⬇️ Turun"}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        className="btn btn-ghost btn-xs"
                        onClick={() => handleEdit(m)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-ghost btn-xs text-red-500"
                        onClick={() => handleHapus(m.id)}
                        title="Hapus"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* Target */}
                  <div className="bg-gray-50 rounded p-2 mb-2">
                    <p className="text-xs font-semibold text-gray-600 mb-1">🎯 Target</p>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-700">
                      {m.target?.jogging?.km > 0 && (
                        <span className="bg-white px-2 py-0.5 rounded border border-gray-200">
                          🏃 {m.target.jogging.km} km
                          {m.target.jogging.pace > 0 && ` • pace ${m.target.jogging.pace}`}
                        </span>
                      )}
                      {m.target?.pushUp?.reps > 0 && (
                        <span className="bg-white px-2 py-0.5 rounded border border-gray-200">
                          💪 {m.target.pushUp.reps} reps
                        </span>
                      )}
                      {m.target?.legRaise?.reps > 0 && (
                        <span className="bg-white px-2 py-0.5 rounded border border-gray-200">
                          🦵 {m.target.legRaise.reps} reps
                        </span>
                      )}
                      {m.target?.plank?.detik > 0 && (
                        <span className="bg-white px-2 py-0.5 rounded border border-gray-200">
                          🧘 {m.target.plank.detik} detik
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Evaluasi */}
                  {m.evaluasi && Object.keys(m.evaluasi).length > 0 && (
                    <div className="space-y-1 mb-2">
                      <p className="text-xs font-semibold text-gray-600">📝 Evaluasi</p>
                      {Object.entries(m.evaluasi).map(([fieldId, value]) => {
                        if (!value) return null;
                        const field = fieldEvaluasi.find((f) => f.id === fieldId);
                        return (
                          <div
                            key={fieldId}
                            className="text-xs text-gray-700 bg-gray-50 rounded p-2 border border-gray-200"
                          >
                            <span className="font-semibold">{field?.label || fieldId}: </span>
                            <span className="whitespace-pre-wrap">{value}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Catatan Mingguan */}
                  {m.catatanMingguan && (
                    <div className="mt-2">
                      <p className="text-xs font-semibold text-gray-600 mb-1">
                        📝 Catatan Mingguan
                      </p>
                      <p className="text-xs text-gray-700 whitespace-pre-wrap bg-gray-50 p-2 rounded border border-gray-200">
                        {m.catatanMingguan}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}