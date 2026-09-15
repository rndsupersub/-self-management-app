// components/EvaluasiPekerjaan.js
"use client";

import { useState, useMemo, useEffect } from "react";
import {
  DEFAULT_FIELD_EVALUASI,
  DEFAULT_PERIODE_EVALUASI,
  DEFAULT_FIELD_EVALUASI_VENDOR,
  TIPE_FIELD,
  generateId,
  getPeriodeRange,
  formatTanggalPanjang,
  formatTanggalPendek,
  tambahHari,
  clampScore,
  autoGenerateSummaryFromLaporan,
  autoGenerateVendorSummary,
} from "@/lib/evaluasiData";

export default function EvaluasiPekerjaan({
  kegiatanList = [],
  laporanData = {},
  evaluasiData = {},
  vendorList = [],
  fieldEvaluasiList = DEFAULT_FIELD_EVALUASI,
  periodeEvaluasiList = DEFAULT_PERIODE_EVALUASI,
  fieldEvaluasiVendorList = DEFAULT_FIELD_EVALUASI_VENDOR,
  onUpdateEvaluasi,
  onUpdateFieldEvaluasi,
  onUpdatePeriodeEvaluasi,
  onUpdateFieldEvaluasiVendor,
}) {
  const [activePeriode, setActivePeriode] = useState(
    periodeEvaluasiList[0]?.id || "bulanan"
  );
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [formValues, setFormValues] = useState({});
  const [vendorValues, setVendorValues] = useState({});
  const [showHistory, setShowHistory] = useState(false);
  const [showVendorSection, setShowVendorSection] = useState(true);
  const [savedNotif, setSavedNotif] = useState(false);

  // Kelola Field Kinerja
  const [showKelolaField, setShowKelolaField] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState(null);
  const [fieldForm, setFieldForm] = useState({
    label: "",
    emoji: "📌",
    tipe: "long",
  });

  // Kelola Frekuensi
  const [showKelolaFrekuensi, setShowKelolaFrekuensi] = useState(false);
  const [editingFrekuensiId, setEditingFrekuensiId] = useState(null);
  const [frekuensiForm, setFrekuensiForm] = useState({
    label: "",
    emoji: "📅",
    tipe: "bulanan",
    customStart: "",
    customEnd: "",
  });

  // Kelola Field Vendor
  const [showKelolaFieldVendor, setShowKelolaFieldVendor] = useState(false);
  const [editingFieldVendorId, setEditingFieldVendorId] = useState(null);
  const [fieldVendorForm, setFieldVendorForm] = useState({
    label: "",
    emoji: "📌",
    tipe: "long",
  });

  // ========== CARI DATA PERIODE YANG AKTIF ==========
  const periodeAktif = useMemo(() => {
    const def = periodeEvaluasiList.find((p) => p.id === activePeriode);
    if (!def) return null;
    return getPeriodeRange(def.tipe, selectedDate, def);
  }, [activePeriode, selectedDate, periodeEvaluasiList]);

  const key = periodeAktif?.key;

  // ========== AMBIL DATA TERSIMPAN ==========
  const evaluasiTersimpan = useMemo(() => {
    if (!key) return null;
    return evaluasiData?.[activePeriode]?.[key] || null;
  }, [evaluasiData, activePeriode, key]);

  // ========== LOAD NILAI KE FORM ==========
  useEffect(() => {
    if (evaluasiTersimpan?.fields) {
      setFormValues(evaluasiTersimpan.fields);
    } else {
      const empty = {};
      fieldEvaluasiList.forEach((f) => {
        empty[f.id] = f.tipe === "score" ? 5 : "";
      });
      setFormValues(empty);
    }
  }, [evaluasiTersimpan, fieldEvaluasiList]);

  useEffect(() => {
    if (evaluasiTersimpan?.vendorEvaluations) {
      setVendorValues(evaluasiTersimpan.vendorEvaluations);
    } else {
      setVendorValues({});
    }
  }, [evaluasiTersimpan]);

  // ========== NAVIGASI PERIODE ==========
  const handlePrev = () => {
    const def = periodeEvaluasiList.find((p) => p.id === activePeriode);
    if (!def) return;
    if (def.tipe === "bulanan") {
      const d = new Date(selectedDate);
      d.setMonth(d.getMonth() - 1);
      setSelectedDate(d.toISOString().split("T")[0]);
    } else if (def.tipe === "triwulan") {
      const d = new Date(selectedDate);
      d.setMonth(d.getMonth() - 3);
      setSelectedDate(d.toISOString().split("T")[0]);
    } else if (def.tipe === "semester") {
      const d = new Date(selectedDate);
      d.setMonth(d.getMonth() - 6);
      setSelectedDate(d.toISOString().split("T")[0]);
    } else if (def.tipe === "tahunan") {
      const d = new Date(selectedDate);
      d.setFullYear(d.getFullYear() - 1);
      setSelectedDate(d.toISOString().split("T")[0]);
    }
  };

  const handleNext = () => {
    const def = periodeEvaluasiList.find((p) => p.id === activePeriode);
    if (!def) return;
    if (def.tipe === "bulanan") {
      const d = new Date(selectedDate);
      d.setMonth(d.getMonth() + 1);
      setSelectedDate(d.toISOString().split("T")[0]);
    } else if (def.tipe === "triwulan") {
      const d = new Date(selectedDate);
      d.setMonth(d.getMonth() + 3);
      setSelectedDate(d.toISOString().split("T")[0]);
    } else if (def.tipe === "semester") {
      const d = new Date(selectedDate);
      d.setMonth(d.getMonth() + 6);
      setSelectedDate(d.toISOString().split("T")[0]);
    } else if (def.tipe === "tahunan") {
      const d = new Date(selectedDate);
      d.setFullYear(d.getFullYear() + 1);
      setSelectedDate(d.toISOString().split("T")[0]);
    }
  };

  const handleToday = () =>
    setSelectedDate(new Date().toISOString().split("T")[0]);
  const handleDateChange = (e) => setSelectedDate(e.target.value);

  // ========== UPDATE FIELD ==========
  const handleUpdateValue = (fieldId, value) => {
    setFormValues({ ...formValues, [fieldId]: value });
  };

  const handleUpdateVendorValue = (vendorId, fieldId, value) => {
    setVendorValues({
      ...vendorValues,
      [vendorId]: {
        ...(vendorValues[vendorId] || {}),
        [fieldId]: value,
      },
    });
  };

  // ========== AUTO-GENERATE SUMMARY ==========
  const handleAutoGenerate = () => {
    if (!periodeAktif) return;
    const summary = autoGenerateSummaryFromLaporan(
      laporanData,
      periodeAktif.periodeMulai,
      periodeAktif.periodeSelesai
    );
    // Masukkan ke field pertama (efektivitas) atau ke catatanBebas
    const targetField =
      fieldEvaluasiList.find((f) => f.id === "efektivitas") ||
      fieldEvaluasiList[0];
    if (targetField) {
      setFormValues({
        ...formValues,
        [targetField.id]: summary,
      });
    }
  };

  const handleAutoGenerateVendor = (vendorId) => {
    if (!periodeAktif) return;
    const vendor = vendorList.find((v) => v.id === vendorId);
    if (!vendor) return;
    const summary = autoGenerateVendorSummary(
      vendor,
      periodeAktif.periodeMulai,
      periodeAktif.periodeSelesai
    );
    const targetField = fieldEvaluasiVendorList[0];
    if (targetField) {
      handleUpdateVendorValue(vendorId, targetField.id, summary);
    }
  };

  // ========== SIMPAN EVALUASI ==========
  const handleSimpan = () => {
    if (!onUpdateEvaluasi || !periodeAktif) return;
    const newData = JSON.parse(JSON.stringify(evaluasiData || {}));
    if (!newData[activePeriode]) newData[activePeriode] = {};
    newData[activePeriode][periodeAktif.key] = {
      periodeMulai: periodeAktif.periodeMulai,
      periodeSelesai: periodeAktif.periodeSelesai,
      label: periodeAktif.label,
      tipe: periodeAktif.tipe,
      fields: formValues,
      vendorEvaluations: vendorValues,
      updatedAt: new Date().toISOString(),
    };
    onUpdateEvaluasi(newData);
    setSavedNotif(true);
    setTimeout(() => setSavedNotif(false), 2000);
  };

  // ========== KELOLA FIELD KINERJA ==========
  const handleBukaTambahField = () => {
    setFieldForm({ label: "", emoji: "📌", tipe: "long" });
    setEditingFieldId(null);
  };

  const handleBukaEditField = (field) => {
    const parts = field.label.trim().split(" ");
    const emoji = parts[0] || "📌";
    const nama = parts.slice(1).join(" ") || "";
    setFieldForm({ label: nama, emoji, tipe: field.tipe || "long" });
    setEditingFieldId(field.id);
  };

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
    if (!editingFieldId) {
      const emptyVal = fieldForm.tipe === "score" ? 5 : "";
      setFormValues((prev) => ({ ...prev, [newField.id]: emptyVal }));
    }
    handleBukaTambahField();
  };

  const handleHapusField = (id) => {
    if (
      !confirm(
        "Hapus field ini? Data evaluasi yang udah keisi bakal ilang dari tampilan (tetap tersimpan di Firestore)."
      )
    )
      return;
    onUpdateFieldEvaluasi(fieldEvaluasiList.filter((f) => f.id !== id));
  };

  // ========== KELOLA FREKUENSI ==========
  const handleBukaTambahFrekuensi = () => {
    setFrekuensiForm({
      label: "",
      emoji: "📅",
      tipe: "bulanan",
      customStart: "",
      customEnd: "",
    });
    setEditingFrekuensiId(null);
  };

  const handleBukaEditFrekuensi = (freq) => {
    const parts = freq.label.trim().split(" ");
    const emoji = parts[0] || "📅";
    const nama = parts.slice(1).join(" ") || "";
    setFrekuensiForm({
      label: nama,
      emoji,
      tipe: freq.tipe || "bulanan",
      customStart: freq.customStart || "",
      customEnd: freq.customEnd || "",
    });
    setEditingFrekuensiId(freq.id);
  };

  const handleSimpanFrekuensi = () => {
    if (!frekuensiForm.label.trim()) return;
    if (
      frekuensiForm.tipe === "custom" &&
      (!frekuensiForm.customStart || !frekuensiForm.customEnd)
    ) {
      alert("Isi tanggal mulai & selesai untuk custom.");
      return;
    }
    const fullLabel = `${frekuensiForm.emoji} ${frekuensiForm.label}`.trim();
    const newFreq = {
      id: editingFrekuensiId || generateId("freq"),
      label: fullLabel,
      tipe: frekuensiForm.tipe,
      customStart:
        frekuensiForm.tipe === "custom" ? frekuensiForm.customStart : "",
      customEnd:
        frekuensiForm.tipe === "custom" ? frekuensiForm.customEnd : "",
    };
    let updated;
    if (editingFrekuensiId) {
      updated = periodeEvaluasiList.map((f) =>
        f.id === editingFrekuensiId ? newFreq : f
      );
    } else {
      updated = [...periodeEvaluasiList, newFreq];
    }
    onUpdatePeriodeEvaluasi(updated);
    handleBukaTambahFrekuensi();
  };

  const handleHapusFrekuensi = (id) => {
    if (periodeEvaluasiList.length <= 1) {
      alert("Minimal harus ada 1 frekuensi.");
      return;
    }
    if (!confirm("Hapus frekuensi ini?")) return;
    onUpdatePeriodeEvaluasi(periodeEvaluasiList.filter((f) => f.id !== id));
    if (activePeriode === id) {
      const sisa = periodeEvaluasiList.filter((f) => f.id !== id);
      setActivePeriode(sisa[0]?.id || "bulanan");
    }
  };

  // ========== KELOLA FIELD VENDOR ==========
  const handleBukaTambahFieldVendor = () => {
    setFieldVendorForm({ label: "", emoji: "📌", tipe: "long" });
    setEditingFieldVendorId(null);
  };

  const handleBukaEditFieldVendor = (field) => {
    const parts = field.label.trim().split(" ");
    const emoji = parts[0] || "📌";
    const nama = parts.slice(1).join(" ") || "";
    setFieldVendorForm({ label: nama, emoji, tipe: field.tipe || "long" });
    setEditingFieldVendorId(field.id);
  };

  const handleSimpanFieldVendor = () => {
    if (!fieldVendorForm.label.trim()) return;
    const fullLabel = `${fieldVendorForm.emoji} ${fieldVendorForm.label}`.trim();
    const newField = {
      id: editingFieldVendorId || generateId("field_v"),
      label: fullLabel,
      tipe: fieldVendorForm.tipe,
    };
    let updated;
    if (editingFieldVendorId) {
      updated = fieldEvaluasiVendorList.map((f) =>
        f.id === editingFieldVendorId ? newField : f
      );
    } else {
      updated = [...fieldEvaluasiVendorList, newField];
    }
    onUpdateFieldEvaluasiVendor(updated);
    handleBukaTambahFieldVendor();
  };

  const handleHapusFieldVendor = (id) => {
    if (!confirm("Hapus field evaluasi vendor ini?")) return;
    onUpdateFieldEvaluasiVendor(
      fieldEvaluasiVendorList.filter((f) => f.id !== id)
    );
  };

  // ========== HISTORY ==========
  const historyList = useMemo(() => {
    const data = evaluasiData?.[activePeriode] || {};
    return Object.entries(data)
      .map(([k, val]) => ({ key: k, ...val }))
      .sort((a, b) => b.key.localeCompare(a.key));
  }, [evaluasiData, activePeriode]);

  // ========== RENDER FIELD INPUT ==========
  const renderFieldInput = (field, value, onChange) => {
    const val = value ?? (field.tipe === "score" ? 5 : "");
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
            onChange={(e) => onChange(parseInt(e.target.value))}
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
          onChange={(e) => onChange(e.target.value)}
        />
      );
    }
    return (
      <textarea
        className="textarea textarea-bordered w-full text-sm text-gray-800 bg-white"
        rows="3"
        placeholder={`Isi ${field.label}...`}
        value={val}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  };

  // ========== RENDER ==========
  if (!periodeAktif) {
    return (
      <div className="alert alert-warning text-xs">
        ⚠️ Frekuensi evaluasi belum ada. Tambahin dulu di ⚙️ Kelola Frekuensi.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* REMINDER */}
      <div className="alert alert-info py-2 text-xs">
        <span>
          📌 Evaluasi diisi per periode. Bisa auto-generate dari laporan +
          auto-generate dari log kunjungan vendor.
        </span>
      </div>

      {/* TAB FREKUENSI + KELOLA */}
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="tabs tabs-boxed bg-white shadow border border-gray-200 p-1 w-fit">
          {periodeEvaluasiList.map((freq) => (
            <button
              key={freq.id}
              className={`tab ${
                activePeriode === freq.id
                  ? "tab-active bg-blue-600 text-white"
                  : ""
              }`}
              onClick={() => setActivePeriode(freq.id)}
            >
              {freq.label}
            </button>
          ))}
        </div>
        <button
          className="btn btn-ghost btn-xs text-gray-600"
          onClick={() => setShowKelolaFrekuensi(true)}
        >
          ⚙️ Kelola Frekuensi
        </button>
      </div>

      {/* NAVIGASI PERIODE */}
      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <div className="flex items-center gap-1">
              <button
                className="btn btn-ghost btn-sm text-gray-700"
                onClick={handlePrev}
              >
                ‹
              </button>
              <h3 className="text-sm font-bold text-gray-800 min-w-[200px] text-center">
                {periodeAktif.label}
              </h3>
              <button
                className="btn btn-ghost btn-sm text-gray-700"
                onClick={handleNext}
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
                📅 Periode Ini
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            📅 {formatTanggalPendek(periodeAktif.periodeMulai)} --{" "}
            {formatTanggalPendek(periodeAktif.periodeSelesai)}
          </p>
        </div>
      </div>

      {/* FORM EVALUASI KINERJA */}
      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          <div className="flex flex-wrap justify-between items-center mb-3 gap-2">
            <h3 className="text-sm font-bold text-gray-800">
              📝 Evaluasi Kinerja ({periodeAktif.label})
            </h3>
            <div className="flex gap-1">
              <button
                className="btn btn-outline btn-xs text-gray-700"
                onClick={handleAutoGenerate}
                title="Isi otomatis dari laporan di periode ini"
              >
                🔄 Auto-generate dari Laporan
              </button>
              <button
                className="btn btn-ghost btn-xs text-gray-600"
                onClick={() => setShowKelolaField(true)}
              >
                ⚙️ Kelola Field
              </button>
            </div>
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
                  {renderFieldInput(
                    field,
                    formValues[field.id],
                    (val) => handleUpdateValue(field.id, val)
                  )}
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
        </div>
      </div>

      {/* SECTION EVALUASI VENDOR */}
      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          <div className="flex flex-wrap justify-between items-center mb-3 gap-2">
            <h3 className="text-sm font-bold text-gray-800">
              🏭 Evaluasi Kinerja Vendor ({vendorList.length})
            </h3>
            <div className="flex gap-1">
              <button
                className="btn btn-ghost btn-xs text-gray-600"
                onClick={() => setShowVendorSection(!showVendorSection)}
              >
                {showVendorSection ? "▲ Sembunyikan" : "▼ Tampilkan"}
              </button>
              <button
                className="btn btn-ghost btn-xs text-gray-600"
                onClick={() => setShowKelolaFieldVendor(true)}
              >
                ⚙️ Kelola Field
              </button>
            </div>
          </div>

          {showVendorSection &&
            (vendorList.length === 0 ? (
              <p className="text-sm text-gray-400 italic text-center py-4">
                Belum ada vendor. Tambahin dulu di tab 🏭 Vendor.
              </p>
            ) : (
              <div className="space-y-4">
                {vendorList.map((vendor) => (
                  <div
                    key={vendor.id}
                    className="border border-gray-200 rounded p-3 bg-gray-50"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-bold text-gray-800">
                        🏭 {vendor.nama}
                      </h4>
                      <button
                        className="btn btn-outline btn-xs text-gray-700"
                        onClick={() => handleAutoGenerateVendor(vendor.id)}
                        title="Auto-generate dari log kunjungan vendor"
                      >
                        🔄 Auto-generate
                      </button>
                    </div>
                    <div className="space-y-2">
                      {fieldEvaluasiVendorList.map((field) => (
                        <div key={field.id}>
                          <label className="text-xs font-semibold text-gray-600 mb-1 block">
                            {field.label}
                          </label>
                          {renderFieldInput(
                            field,
                            vendorValues[vendor.id]?.[field.id],
                            (val) =>
                              handleUpdateVendorValue(
                                vendor.id,
                                field.id,
                                val
                              )
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
        </div>
      </div>

      {/* SIMPAN */}
      <div className="flex gap-2">
        <button
          className="btn btn-primary btn-sm flex-1"
          onClick={handleSimpan}
          disabled={fieldEvaluasiList.length === 0}
        >
          💾 Simpan Evaluasi ({periodeAktif.label})
        </button>
      </div>

      {savedNotif && (
        <div className="alert alert-success py-2 text-xs">
          <span>✅ Evaluasi berhasil disimpan!</span>
        </div>
      )}

      {/* HISTORY */}
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
                        📅 {ev.label || ev.key}
                      </summary>
                      <div className="mt-2 space-y-2">
                        {fieldEvaluasiList.map((f) => {
                          const val = ev.fields?.[f.id];
                          if (val === undefined || val === null || val === "")
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
                        {ev.vendorEvaluations &&
                          Object.keys(ev.vendorEvaluations).length > 0 && (
                            <div className="bg-white p-2 rounded border border-gray-200">
                              <p className="text-xs font-semibold text-gray-600 mb-1">
                                🏭 Evaluasi Vendor
                              </p>
                              <p className="text-xs text-gray-500">
                                {Object.keys(ev.vendorEvaluations).length}{" "}
                                vendor dievaluasi
                              </p>
                            </div>
                          )}
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

      {/* MODAL KELOLA FIELD KINERJA */}
      {showKelolaField && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card bg-white shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="card-body p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-bold text-gray-800">
                  ⚙️ Kelola Field Evaluasi Kinerja
                </h3>
                <button
                  className="btn btn-ghost btn-sm text-gray-700"
                  onClick={() => setShowKelolaField(false)}
                >
                  ✕
                </button>
              </div>

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
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-ghost btn-xs text-red-500"
                        onClick={() => handleHapusField(f.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>

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
                  />
                  <input
                    type="text"
                    className="input input-bordered input-sm flex-1 text-gray-800 bg-white"
                    placeholder="Nama field"
                    value={fieldForm.label}
                    onChange={(e) =>
                      setFieldForm({ ...fieldForm, label: e.target.value })
                    }
                  />
                </div>
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

      {/* MODAL KELOLA FREKUENSI */}
      {showKelolaFrekuensi && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card bg-white shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="card-body p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-bold text-gray-800">
                  ⚙️ Kelola Frekuensi Evaluasi
                </h3>
                <button
                  className="btn btn-ghost btn-sm text-gray-700"
                  onClick={() => setShowKelolaFrekuensi(false)}
                >
                  ✕
                </button>
              </div>

              <div className="space-y-1 mb-4">
                {periodeEvaluasiList.map((freq) => (
                  <div
                    key={freq.id}
                    className="flex justify-between items-center bg-gray-50 rounded px-2 py-1 border border-gray-200"
                  >
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">{freq.label}</p>
                      <span className="text-[10px] text-gray-500">
                        Tipe: {freq.tipe}
                        {freq.tipe === "custom" &&
                          ` (${freq.customStart} s/d ${freq.customEnd})`}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        className="btn btn-ghost btn-xs text-gray-600"
                        onClick={() => handleBukaEditFrekuensi(freq)}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-ghost btn-xs text-red-500"
                        onClick={() => handleHapusFrekuensi(freq.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 rounded p-3 border border-blue-200 space-y-2">
                <p className="text-xs font-semibold text-blue-700">
                  {editingFrekuensiId
                    ? "✏️ Edit Frekuensi"
                    : "➕ Tambah Frekuensi Baru"}
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="input input-bordered input-sm w-16 text-center text-gray-800 bg-white"
                    placeholder="📅"
                    value={frekuensiForm.emoji}
                    onChange={(e) =>
                      setFrekuensiForm({
                        ...frekuensiForm,
                        emoji: e.target.value,
                      })
                    }
                  />
                  <input
                    type="text"
                    className="input input-bordered input-sm flex-1 text-gray-800 bg-white"
                    placeholder="Nama frekuensi"
                    value={frekuensiForm.label}
                    onChange={(e) =>
                      setFrekuensiForm({
                        ...frekuensiForm,
                        label: e.target.value,
                      })
                    }
                  />
                </div>
                <select
                  className="select select-bordered select-sm w-full text-gray-800 bg-white"
                  value={frekuensiForm.tipe}
                  onChange={(e) =>
                    setFrekuensiForm({
                      ...frekuensiForm,
                      tipe: e.target.value,
                    })
                  }
                >
                  <option value="bulanan">📆 Bulanan (1 bulan)</option>
                  <option value="triwulan">📅 Triwulan (3 bulan)</option>
                  <option value="semester">📆 Semester (6 bulan)</option>
                  <option value="tahunan">📅 Tahunan (12 bulan)</option>
                  <option value="custom">🎯 Custom (tanggal manual)</option>
                </select>
                {frekuensiForm.tipe === "custom" && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">
                        Mulai
                      </label>
                      <input
                        type="date"
                        className="input input-bordered input-sm w-full text-gray-800 bg-white"
                        value={frekuensiForm.customStart}
                        onChange={(e) =>
                          setFrekuensiForm({
                            ...frekuensiForm,
                            customStart: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">
                        Selesai
                      </label>
                      <input
                        type="date"
                        className="input input-bordered input-sm w-full text-gray-800 bg-white"
                        value={frekuensiForm.customEnd}
                        onChange={(e) =>
                          setFrekuensiForm({
                            ...frekuensiForm,
                            customEnd: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    className="btn btn-primary btn-sm flex-1"
                    onClick={handleSimpanFrekuensi}
                    disabled={!frekuensiForm.label.trim()}
                  >
                    {editingFrekuensiId ? "💾 Simpan" : "➕ Tambah"}
                  </button>
                  {editingFrekuensiId && (
                    <button
                      className="btn btn-ghost btn-sm text-gray-700"
                      onClick={handleBukaTambahFrekuensi}
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

      {/* MODAL KELOLA FIELD VENDOR */}
      {showKelolaFieldVendor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card bg-white shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="card-body p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-bold text-gray-800">
                  ⚙️ Kelola Field Evaluasi Vendor
                </h3>
                <button
                  className="btn btn-ghost btn-sm text-gray-700"
                  onClick={() => setShowKelolaFieldVendor(false)}
                >
                  ✕
                </button>
              </div>

              <div className="space-y-1 mb-4">
                {fieldEvaluasiVendorList.map((f) => (
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
                        onClick={() => handleBukaEditFieldVendor(f)}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-ghost btn-xs text-red-500"
                        onClick={() => handleHapusFieldVendor(f.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-orange-50 rounded p-3 border border-orange-200 space-y-2">
                <p className="text-xs font-semibold text-orange-700">
                  {editingFieldVendorId
                    ? "✏️ Edit Field Vendor"
                    : "➕ Tambah Field Vendor Baru"}
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="input input-bordered input-sm w-16 text-center text-gray-800 bg-white"
                    placeholder="📌"
                    value={fieldVendorForm.emoji}
                    onChange={(e) =>
                      setFieldVendorForm({
                        ...fieldVendorForm,
                        emoji: e.target.value,
                      })
                    }
                  />
                  <input
                    type="text"
                    className="input input-bordered input-sm flex-1 text-gray-800 bg-white"
                    placeholder="Nama field vendor"
                    value={fieldVendorForm.label}
                    onChange={(e) =>
                      setFieldVendorForm({
                        ...fieldVendorForm,
                        label: e.target.value,
                      })
                    }
                  />
                </div>
                <select
                  className="select select-bordered select-sm w-full text-gray-800 bg-white"
                  value={fieldVendorForm.tipe}
                  onChange={(e) =>
                    setFieldVendorForm({
                      ...fieldVendorForm,
                      tipe: e.target.value,
                    })
                  }
                >
                  {TIPE_FIELD.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button
                    className="btn btn-primary btn-sm flex-1"
                    onClick={handleSimpanFieldVendor}
                    disabled={!fieldVendorForm.label.trim()}
                  >
                    {editingFieldVendorId ? "💾 Simpan" : "➕ Tambah"}
                  </button>
                  {editingFieldVendorId && (
                    <button
                      className="btn btn-ghost btn-sm text-gray-700"
                      onClick={handleBukaTambahFieldVendor}
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