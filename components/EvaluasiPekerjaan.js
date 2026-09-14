// components/EvaluasiPekerjaan.js
"use client";

import { useState, useMemo, useEffect } from "react";
import {
  DEFAULT_FIELD_EVALUASI,
  TIPE_FIELD,
  generateId,
  getMingguRange,
  formatTanggalPanjang,
  formatTanggalPendek,
  tambahHari,
  clampScore,
} from "@/lib/evaluasiData";

export default function EvaluasiPekerjaan({
  kegiatanList = [],
  evaluasiData = {},
  fieldEvaluasiList = DEFAULT_FIELD_EVALUASI,
  onUpdateEvaluasi,
  onUpdateFieldEvaluasi,
}) {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [formValues, setFormValues] = useState({});
  const [showHistory, setShowHistory] = useState(false);
  const [savedNotif, setSavedNotif] = useState(false);

  // ========== STATE KELOLA FIELD ==========
  const [showKelolaField, setShowKelolaField] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState(null);
  const [fieldForm, setFieldForm] = useState({
    label: "",
    emoji: "📌",
    tipe: "long",
  });

  // ========== HITUNG PERIODE MINGGU ==========
  const periode = useMemo(() => {
    return getMingguRange(selectedDate);
  }, [selectedDate]);

  const key = periode.tanggalMulai;

  // ========== AMBIL DATA TERSIMPAN ==========
  const evaluasiTersimpan = useMemo(() => {
    return evaluasiData?.[key] || null;
  }, [evaluasiData, key]);

  // ========== LOAD NILAI KE FORM ==========
  useEffect(() => {
    if (evaluasiTersimpan?.fields) {
      setFormValues(evaluasiTersimpan.fields);
    } else {
      // Reset ke kosong
      const empty = {};
      fieldEvaluasiList.forEach((f) => {
        empty[f.id] = f.tipe === "score" ? 5 : "";
      });
      setFormValues(empty);
    }
  }, [evaluasiTersimpan, fieldEvaluasiList]);

  // ========== FILTER KEGIATAN DI MINGGU INI ==========
  const kegiatanMingguIni = useMemo(() => {
    return (kegiatanList || []).filter((k) => {
      const mulai = k.tanggalMulai || k.tanggal;
      const selesai = k.tanggalSelesai || k.tanggal || k.tanggalMulai;
      if (!mulai || !selesai) return false;
      return mulai <= periode.tanggalSelesai && selesai >= periode.tanggalMulai;
    });
  }, [kegiatanList, periode]);

  const statistik = useMemo(() => {
    const total = kegiatanMingguIni.length;
    const selesai = kegiatanMingguIni.filter((k) => k.status === "selesai").length;
    const persen = total > 0 ? Math.round((selesai / total) * 100) : 0;
    return { total, selesai, belum: total - selesai, persen };
  }, [kegiatanMingguIni]);

  // ========== NAVIGASI ==========
  const handlePrev = () => setSelectedDate(tambahHari(selectedDate, -7));
  const handleNext = () => setSelectedDate(tambahHari(selectedDate, 7));
  const handleToday = () => setSelectedDate(new Date().toISOString().split("T")[0]);
  const handleDateChange = (e) => setSelectedDate(e.target.value);

  // ========== UPDATE FIELD VALUE ==========
  const handleUpdateValue = (fieldId, value) => {
    setFormValues({ ...formValues, [fieldId]: value });
  };

  // ========== SIMPAN EVALUASI ==========
  const handleSimpan = () => {
    if (!onUpdateEvaluasi) return;

    const newEvaluasiData = JSON.parse(JSON.stringify(evaluasiData || {}));

    newEvaluasiData[key] = {
      tanggalMulai: periode.tanggalMulai,
      tanggalSelesai: periode.tanggalSelesai,
      mingguKe: periode.mingguKe,
      tahun: periode.tahun,
      fields: formValues,
      updatedAt: new Date().toISOString(),
    };

    onUpdateEvaluasi(newEvaluasiData);
    setSavedNotif(true);
    setTimeout(() => setSavedNotif(false), 2000);
  };

  // ========== KELOLA FIELD: BUKA TAMBAH ==========
  const handleBukaTambahField = () => {
    setFieldForm({ label: "", emoji: "📌", tipe: "long" });
    setEditingFieldId(null);
  };

  // ========== KELOLA FIELD: BUKA EDIT ==========
  const handleBukaEditField = (field) => {
    const parts = field.label.trim().split(" ");
    const emoji = parts[0] || "📌";
    const nama = parts.slice(1).join(" ") || "";
    setFieldForm({
      label: nama,
      emoji,
      tipe: field.tipe || "long",
    });
    setEditingFieldId(field.id);
  };

  // ========== KELOLA FIELD: SIMPAN ==========
  const handleSimpanField = () => {
    if (!fieldForm.label.trim()) return;

    const fullLabel = `${fieldForm.emoji} ${fieldForm.label}`.trim();
    const newField = {
      id: editingFieldId || generateId("field"),
      label: fullLabel,
      tipe: fieldForm.tipe,
    };

    let updated;
    if (editingFieldId) {
      updated = fieldEvaluasiList.map((f) =>
        f.id === editingFieldId ? newField : f
      );
    } else {
      updated = [...fieldEvaluasiList, newField];
    }

    onUpdateFieldEvaluasi(updated);

    // Kalau field baru, tambahin default value ke form
    if (!editingFieldId) {
      const emptyVal = fieldForm.tipe === "score" ? 5 : "";
      setFormValues((prev) => ({ ...prev, [newField.id]: emptyVal }));
    }

    handleBukaTambahField();
  };

  // ========== KELOLA FIELD: HAPUS ==========
  const handleHapusField = (id) => {
    if (!confirm("Hapus field ini? Data evaluasi yang udah keisi di field ini bakal ilang dari tampilan (tetap tersimpan di Firestore, tapi nggak muncul lagi).")) return;
    const updated = fieldEvaluasiList.filter((f) => f.id !== id);
    onUpdateFieldEvaluasi(updated);
  };

  // ========== HISTORY LIST ==========
  const historyList = useMemo(() => {
    return Object.entries(evaluasiData || {})
      .map(([k, val]) => ({ key: k, ...val }))
      .sort((a, b) => b.key.localeCompare(a.key));
  }, [evaluasiData]);

  // ========== RENDER FIELD INPUT ==========
  const renderFieldInput = (field) => {
    const val = formValues[field.id] ?? (field.tipe === "score" ? 5 : "");

    if (field.tipe === "score") {
      return (
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            className="range range-primary range-sm flex-1"
            value={val || 5}
            onChange={(e) => handleUpdateValue(field.id, parseInt(e.target.value))}
          />
          <span className="badge badge-primary badge-sm font-bold w-10 text-center">
            {val || 5}
          </span>
        </div>
      );
    }

    if (field.tipe === "text") {
      return (
        <input
          type="text"
          className="input input-bordered input-sm w-full text-gray-800 bg-white"
          placeholder={`Isi ${field.label}...`}
          value={val}
          onChange={(e) => handleUpdateValue(field.id, e.target.value)}
        />
      );
    }

    // default: long
    return (
      <textarea
        className="textarea textarea-bordered w-full text-sm text-gray-800 bg-white"
        rows="3"
        placeholder={`Isi ${field.label}...`}
        value={val}
        onChange={(e) => handleUpdateValue(field.id, e.target.value)}
      />
    );
  };

  return (
    <div className="space-y-4">
      {/* REMINDER INFO */}
      <div className="alert alert-info py-2 text-xs">
        <span>
          📌 Evaluasi diisi setiap <strong>akhir minggu</strong> (Sabtu/Minggu)
          buat ngukur efektivitas & efisiensi kerja minggu ini.
        </span>
      </div>

      {/* NAVIGASI MINGGU */}
      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <div className="flex items-center gap-1">
              <button
                className="btn btn-ghost btn-sm text-gray-700"
                onClick={handlePrev}
                title="Minggu sebelumnya"
              >
                ‹
              </button>
              <h3 className="text-sm font-bold text-gray-800 min-w-[200px] text-center">
                {periode.label}
              </h3>
              <button
                className="btn btn-ghost btn-sm text-gray-700"
                onClick={handleNext}
                title="Minggu berikutnya"
              >
                ›
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                className="input input-bordered input-sm text-gray-800 bg-white"
                value={selectedDate}
                onChange={handleDateChange}
              />
              <button
                className="btn btn-outline btn-xs text-gray-700"
                onClick={handleToday}
              >
                📅 Minggu Ini
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RINGKASAN KEGIATAN MINGGU INI */}
      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          <h3 className="text-sm font-bold text-gray-800 mb-3">
            📊 Ringkasan Kegiatan Minggu Ini ({statistik.total})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="bg-gray-50 rounded p-2 border border-gray-200">
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-lg font-bold text-gray-800">{statistik.total}</p>
            </div>
            <div className="bg-green-50 rounded p-2 border border-green-200">
              <p className="text-xs text-gray-500">Selesai</p>
              <p className="text-lg font-bold text-green-700">{statistik.selesai}</p>
            </div>
            <div className="bg-yellow-50 rounded p-2 border border-yellow-200">
              <p className="text-xs text-gray-500">Belum</p>
              <p className="text-lg font-bold text-yellow-700">{statistik.belum}</p>
            </div>
            <div className="bg-blue-50 rounded p-2 border border-blue-200">
              <p className="text-xs text-gray-500">Progress</p>
              <p className="text-lg font-bold text-blue-700">{statistik.persen}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* FORM EVALUASI */}
      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          <div className="flex flex-wrap justify-between items-center mb-3 gap-2">
            <h3 className="text-sm font-bold text-gray-800">
              📝 Form Evaluasi Mingguan
            </h3>
            <button
              className="btn btn-ghost btn-xs text-gray-600"
              onClick={() => setShowKelolaField(true)}
              title="Kelola Field Evaluasi"
            >
              ⚙️ Kelola Field
            </button>
          </div>

          {fieldEvaluasiList.length === 0 ? (
            <p className="text-sm text-gray-400 italic text-center py-6">
              Belum ada field evaluasi. Klik ⚙️ Kelola Field untuk mulai.
            </p>
          ) : (
            <div className="space-y-3">
              {fieldEvaluasiList.map((field) => (
                <div key={field.id}>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">
                    {field.label}
                  </label>
                  {renderFieldInput(field)}
                </div>
              ))}
            </div>
          )}

          {evaluasiTersimpan?.updatedAt && (
            <p className="text-xs text-gray-500 mt-3">
              📅 Terakhir disimpan:{" "}
              {new Date(evaluasiTersimpan.updatedAt).toLocaleString("id-ID")}
            </p>
          )}

          <div className="flex gap-2 mt-4">
            <button
              className="btn btn-primary btn-sm flex-1"
              onClick={handleSimpan}
              disabled={fieldEvaluasiList.length === 0}
            >
              💾 Simpan Evaluasi
            </button>
          </div>

          {savedNotif && (
            <div className="alert alert-success py-2 mt-3 text-xs">
              <span>✅ Evaluasi berhasil disimpan!</span>
            </div>
          )}
        </div>
      </div>

      {/* HISTORY EVALUASI */}
      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-gray-800">
              📚 History Evaluasi ({historyList.length})
            </h3>
            <button
              className="btn btn-ghost btn-xs text-gray-600"
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? "▲ Sembunyikan" : "▼ Tampilkan"}
            </button>
          </div>

          {showHistory && (
            <>
              {historyList.length === 0 ? (
                <p className="text-xs text-gray-400 italic text-center py-4">
                  Belum ada evaluasi tersimpan.
                </p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {historyList.map((ev) => (
                    <details
                      key={ev.key}
                      className="border border-gray-200 rounded p-2 bg-gray-50"
                    >
                      <summary className="text-sm font-semibold text-gray-800 cursor-pointer">
                        📅{" "}
                        {ev.tanggalMulai
                          ? `Minggu ${ev.mingguKe} (${formatTanggalPendek(ev.tanggalMulai)} – ${formatTanggalPendek(ev.tanggalSelesai)})`
                          : ev.key}
                      </summary>
                      <div className="mt-2 space-y-2">
                        {fieldEvaluasiList.map((f) => {
                          const val = ev.fields?.[f.id];
                          if (
                            val === undefined ||
                            val === null ||
                            val === ""
                          )
                            return null;
                          return (
                            <div
                              key={f.id}
                              className="bg-white p-2 rounded border border-gray-200"
                            >
                              <p className="text-xs font-semibold text-gray-600">
                                {f.label}
                              </p>
                              <p className="text-xs text-gray-700 whitespace-pre-wrap">
                                {val}
                              </p>
                            </div>
                          );
                        })}
                        {ev.updatedAt && (
                          <p className="text-[10px] text-gray-400">
                            Disimpan:{" "}
                            {new Date(ev.updatedAt).toLocaleString("id-ID")}
                          </p>
                        )}
                      </div>
                    </details>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* MODAL KELOLA FIELD */}
      {showKelolaField && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card bg-white shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="card-body p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-bold text-gray-800">
                  ⚙️ Kelola Field Evaluasi
                </h3>
                <button
                  className="btn btn-ghost btn-sm text-gray-700"
                  onClick={() => setShowKelolaField(false)}
                >
                  ✕
                </button>
              </div>

              {/* List Field */}
              <div className="space-y-1 mb-4">
                {fieldEvaluasiList.map((f) => (
                  <div
                    key={f.id}
                    className="flex justify-between items-center bg-gray-50 rounded px-2 py-1 border border-gray-200"
                  >
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">{f.label}</p>
                      <span className="text-[10px] text-gray-500">
                        Tipe: {f.tipe}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        className="btn btn-ghost btn-xs text-gray-600"
                        onClick={() => handleBukaEditField(f)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-ghost btn-xs text-red-500"
                        onClick={() => handleHapusField(f.id)}
                        title="Hapus"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Form Tambah/Edit Field */}
              <div className="bg-purple-50 rounded p-3 border border-purple-200 space-y-2">
                <p className="text-xs font-semibold text-purple-700">
                  {editingFieldId ? "✏️ Edit Field" : "➕ Tambah Field Baru"}
                </p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    className="input input-bordered input-sm w-16 text-center text-gray-800 bg-white"
                    placeholder="📌"
                    value={fieldForm.emoji}
                    onChange={(e) =>
                      setFieldForm({ ...fieldForm, emoji: e.target.value })
                    }
                    title="Emoji"
                  />
                  <input
                    type="text"
                    className="input input-bordered input-sm flex-1 text-gray-800 bg-white"
                    placeholder="Nama field (misal: Prioritas Kerja)"
                    value={fieldForm.label}
                    onChange={(e) =>
                      setFieldForm({ ...fieldForm, label: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-600 mb-1 block">
                    Tipe Field
                  </label>
                  <select
                    className="select select-bordered select-sm w-full text-gray-800 bg-white"
                    value={fieldForm.tipe}
                    onChange={(e) =>
                      setFieldForm({ ...fieldForm, tipe: e.target.value })
                    }
                  >
                    {TIPE_FIELD.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    className="btn btn-primary btn-sm flex-1"
                    onClick={handleSimpanField}
                    disabled={!fieldForm.label.trim()}
                  >
                    {editingFieldId ? "💾 Simpan" : "➕ Tambah"}
                  </button>
                  {editingFieldId && (
                    <button
                      className="btn btn-ghost btn-sm text-gray-700"
                      onClick={handleBukaTambahField}
                    >
                      Batal Edit
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}