// components/EvaluasiPekerjaan.js
"use client";

import { useState, useMemo, useEffect } from "react";
import { DEFAULT_FIELD_EVALUASI, DEFAULT_PERIODE_EVALUASI, DEFAULT_FIELD_EVALUASI_VENDOR, TIPE_FIELD, generateId, getPeriodeRange, formatTanggalPendek, autoGenerateSummaryFromLaporan } from "@/lib/evaluasiData";
import { Pin, Calendar, AlertTriangle, CalendarDays, Target, Pencil, Plus, Save, Trash2, BarChart3, Settings, RefreshCw, List, FileText, Factory, Eye, EyeOff, CheckSquare, ChevronRight, CheckCircle2, X, MessageSquare, Inbox } from "lucide-react";

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
  const [activePeriode, setActivePeriode] = useState(periodeEvaluasiList[0]?.id || "bulanan");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [formValues, setFormValues] = useState({});
  const [showHistory, setShowHistory] = useState(false);
  const [showVendorSection, setShowVendorSection] = useState(true);
  const [savedNotif, setSavedNotif] = useState(false);

  const [showPekerjaanSection, setShowPekerjaanSection] = useState(true);
  const [hideEmptyVendors, setHideEmptyVendors] = useState(true);

  const [showKelolaField, setShowKelolaField] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState(null);
  const [fieldForm, setFieldForm] = useState({ label: "", tipe: "long" });

  const [showKelolaFrekuensi, setShowKelolaFrekuensi] = useState(false);
  const [editingFrekuensiId, setEditingFrekuensiId] = useState(null);
  const [frekuensiForm, setFrekuensiForm] = useState({ label: "", tipe: "bulanan", customStart: "", customEnd: "" });

  const [showKelolaFieldVendor, setShowKelolaFieldVendor] = useState(false);
  const [editingFieldVendorId, setEditingFieldVendorId] = useState(null);
  const [fieldVendorForm, setFieldVendorForm] = useState({ label: "", tipe: "long" });

  const periodeAktif = useMemo(() => {
    const def = periodeEvaluasiList.find((p) => p.id === activePeriode);
    if (!def) return null;
    return getPeriodeRange(def.tipe, selectedDate, def);
  }, [activePeriode, selectedDate, periodeEvaluasiList]);

  const key = periodeAktif?.key;

  const evaluasiTersimpan = useMemo(() => {
    if (!key) return null;
    return evaluasiData?.[activePeriode]?.[key] || null;
  }, [evaluasiData, activePeriode, key]);

  useEffect(() => {
    if (evaluasiTersimpan?.fields) {
      setFormValues(evaluasiTersimpan.fields);
    } else {
      const empty = {};
      fieldEvaluasiList.forEach((f) => { empty[f.id] = f.tipe === "score" ? 5 : ""; });
      setFormValues(empty);
    }
  }, [evaluasiTersimpan, fieldEvaluasiList]);

  const handlePrev = () => {
    const def = periodeEvaluasiList.find((p) => p.id === activePeriode);
    if (!def) return;
    if (def.tipe === "bulanan") { const d = new Date(selectedDate); d.setMonth(d.getMonth() - 1); setSelectedDate(d.toISOString().split("T")[0]); }
    else if (def.tipe === "triwulan") { const d = new Date(selectedDate); d.setMonth(d.getMonth() - 3); setSelectedDate(d.toISOString().split("T")[0]); }
    else if (def.tipe === "semester") { const d = new Date(selectedDate); d.setMonth(d.getMonth() - 6); setSelectedDate(d.toISOString().split("T")[0]); }
    else if (def.tipe === "tahunan") { const d = new Date(selectedDate); d.setFullYear(d.getFullYear() - 1); setSelectedDate(d.toISOString().split("T")[0]); }
  };

  const handleNext = () => {
    const def = periodeEvaluasiList.find((p) => p.id === activePeriode);
    if (!def) return;
    if (def.tipe === "bulanan") { const d = new Date(selectedDate); d.setMonth(d.getMonth() + 1); setSelectedDate(d.toISOString().split("T")[0]); }
    else if (def.tipe === "triwulan") { const d = new Date(selectedDate); d.setMonth(d.getMonth() + 3); setSelectedDate(d.toISOString().split("T")[0]); }
    else if (def.tipe === "semester") { const d = new Date(selectedDate); d.setMonth(d.getMonth() + 6); setSelectedDate(d.toISOString().split("T")[0]); }
    else if (def.tipe === "tahunan") { const d = new Date(selectedDate); d.setFullYear(d.getFullYear() + 1); setSelectedDate(d.toISOString().split("T")[0]); }
  };

  const handleToday = () => setSelectedDate(new Date().toISOString().split("T")[0]);
  const handleDateChange = (e) => setSelectedDate(e.target.value);
  const handleUpdateValue = (fieldId, value) => { setFormValues({ ...formValues, [fieldId]: value }); };

  const handleAutoGenerate = () => {
    if (!periodeAktif) return;
    const summary = autoGenerateSummaryFromLaporan(laporanData, periodeAktif.periodeMulai, periodeAktif.periodeSelesai);
    const targetField = fieldEvaluasiList.find((f) => f.id === "efektivitas") || fieldEvaluasiList[0];
    if (targetField) setFormValues({ ...formValues, [targetField.id]: summary });
  };

  const handleSimpan = () => {
    if (!onUpdateEvaluasi || !periodeAktif) return;
    const newData = JSON.parse(JSON.stringify(evaluasiData || {}));
    if (!newData[activePeriode]) newData[activePeriode] = {};
    const oldVendorEvals = newData[activePeriode][periodeAktif.key]?.vendorEvaluations || {};
    newData[activePeriode][periodeAktif.key] = { periodeMulai: periodeAktif.periodeMulai, periodeSelesai: periodeAktif.periodeSelesai, label: periodeAktif.label, tipe: periodeAktif.tipe, fields: formValues, vendorEvaluations: oldVendorEvals, updatedAt: new Date().toISOString() };
    onUpdateEvaluasi(newData);
    setSavedNotif(true); setTimeout(() => setSavedNotif(false), 2000);
  };

  const handleHapusHistoryPekerjaan = (periodeKey) => {
    if (!confirm("Hapus history evaluasi pekerjaan periode ini? Tindakan ini tidak bisa dibatalkan.")) return;
    const newData = JSON.parse(JSON.stringify(evaluasiData || {}));
    if (newData[activePeriode] && newData[activePeriode][periodeKey]) {
      delete newData[activePeriode][periodeKey];
      onUpdateEvaluasi(newData);
      if (periodeKey === key) {
        const empty = {}; fieldEvaluasiList.forEach((f) => { empty[f.id] = f.tipe === "score" ? 5 : ""; });
        setFormValues(empty);
      }
    }
  };

  const handleBukaTambahField = () => { setFieldForm({ label: "", tipe: "long" }); setEditingFieldId(null); };
  const handleBukaEditField = (field) => { setFieldForm({ label: field.label.replace(/^[^\w\s]+\s/, ''), tipe: field.tipe || "long" }); setEditingFieldId(field.id); };
  const handleSimpanField = () => {
    if (!fieldForm.label.trim()) return;
    const newField = { id: editingFieldId || generateId("field"), label: fieldForm.label, tipe: fieldForm.tipe };
    let updated = editingFieldId ? fieldEvaluasiList.map((f) => (f.id === editingFieldId ? newField : f)) : [...fieldEvaluasiList, newField];
    onUpdateFieldEvaluasi(updated);
    if (!editingFieldId) { const emptyVal = fieldForm.tipe === "score" ? 5 : ""; setFormValues((prev) => ({ ...prev, [newField.id]: emptyVal })); }
    handleBukaTambahField();
  };
  const handleHapusField = (id) => { if (!confirm("Hapus field ini? Data evaluasi yang udah keisi bakal ilang dari tampilan.")) return; onUpdateFieldEvaluasi(fieldEvaluasiList.filter((f) => f.id !== id)); };

  const handleBukaTambahFrekuensi = () => { setFrekuensiForm({ label: "", tipe: "bulanan", customStart: "", customEnd: "" }); setEditingFrekuensiId(null); };
  const handleBukaEditFrekuensi = (freq) => { setFrekuensiForm({ label: freq.label.replace(/^[^\w\s]+\s/, ''), tipe: freq.tipe || "bulanan", customStart: freq.customStart || "", customEnd: freq.customEnd || "" }); setEditingFrekuensiId(freq.id); };
  const handleSimpanFrekuensi = () => {
    if (!frekuensiForm.label.trim()) return;
    if (frekuensiForm.tipe === "custom" && (!frekuensiForm.customStart || !frekuensiForm.customEnd)) { alert("Isi tanggal mulai & selesai untuk custom."); return; }
    const newFreq = { id: editingFrekuensiId || generateId("freq"), label: frekuensiForm.label, tipe: frekuensiForm.tipe, customStart: frekuensiForm.tipe === "custom" ? frekuensiForm.customStart : "", customEnd: frekuensiForm.tipe === "custom" ? frekuensiForm.customEnd : "" };
    let updated = editingFrekuensiId ? periodeEvaluasiList.map((f) => (f.id === editingFrekuensiId ? newFreq : f)) : [...periodeEvaluasiList, newFreq];
    onUpdatePeriodeEvaluasi(updated); handleBukaTambahFrekuensi();
  };
  const handleHapusFrekuensi = (id) => {
    if (periodeEvaluasiList.length <= 1) { alert("Minimal harus ada 1 frekuensi."); return; }
    if (!confirm("Hapus frekuensi ini?")) return;
    onUpdatePeriodeEvaluasi(periodeEvaluasiList.filter((f) => f.id !== id));
    if (activePeriode === id) { const sisa = periodeEvaluasiList.filter((f) => f.id !== id); setActivePeriode(sisa[0]?.id || "bulanan"); }
  };

  const handleBukaTambahFieldVendor = () => { setFieldVendorForm({ label: "", tipe: "long" }); setEditingFieldVendorId(null); };
  const handleBukaEditFieldVendor = (field) => { setFieldVendorForm({ label: field.label.replace(/^[^\w\s]+\s/, ''), tipe: field.tipe || "long" }); setEditingFieldVendorId(field.id); };
  const handleSimpanFieldVendor = () => {
    if (!fieldVendorForm.label.trim()) return;
    const newField = { id: editingFieldVendorId || generateId("field_v"), label: fieldVendorForm.label, tipe: fieldVendorForm.tipe };
    let updated = editingFieldVendorId ? fieldEvaluasiVendorList.map((f) => (f.id === editingFieldVendorId ? newField : f)) : [...fieldEvaluasiVendorList, newField];
    onUpdateFieldEvaluasiVendor(updated); handleBukaTambahFieldVendor();
  };
  const handleHapusFieldVendor = (id) => { if (!confirm("Hapus field evaluasi vendor ini?")) return; onUpdateFieldEvaluasiVendor(fieldEvaluasiVendorList.filter((f) => f.id !== id)); };

  const historyList = useMemo(() => {
    const data = evaluasiData?.[activePeriode] || {};
    return Object.entries(data).map(([k, val]) => ({ key: k, ...val })).sort((a, b) => b.key.localeCompare(a.key));
  }, [evaluasiData, activePeriode]);

  const filteredVendors = useMemo(() => {
    return vendorList.filter((vendor) => {
      if (!hideEmptyVendors) return true;
      return !!(vendor.evaluasi?.[activePeriode]?.[key]);
    });
  }, [vendorList, hideEmptyVendors, activePeriode, key]);

  const renderFieldInput = (field, value, onChange) => {
    const val = value ?? (field.tipe === "score" ? 5 : "");
    if (field.tipe === "score") return (<div className="flex items-center gap-3"><input type="range" min="1" max="10" step="1" className="range range-primary range-sm flex-1" value={val || 5} onChange={(e) => onChange(parseInt(e.target.value))} /><span className="badge badge-primary badge-sm font-bold w-10 text-center">{val || 5}</span></div>);
    if (field.tipe === "text") return (<input type="text" className="input input-bordered input-sm w-full text-gray-800 bg-white" placeholder={`Isi ${field.label}...`} value={val} onChange={(e) => onChange(e.target.value)} />);
    return (<textarea className="textarea textarea-bordered w-full text-sm text-gray-800 bg-white" rows="3" placeholder={`Isi ${field.label}...`} value={val} onChange={(e) => onChange(e.target.value)} />);
  };

  if (!periodeAktif) {
    return (<div className="alert alert-warning text-xs flex items-center gap-2" data-html2canvas-ignore="true"><AlertTriangle size={16} /> Frekuensi evaluasi belum ada. Tambahin dulu di <Settings size={14}/> Kelola Frekuensi.</div>);
  }

  return (
    <div className="space-y-4">
      <div className="alert alert-info py-2 text-xs flex items-center gap-1" data-html2canvas-ignore="true">
        <Pin size={14}/> Evaluasi diisi per periode. Bisa auto-generate dari laporan.
      </div>

      <div className="flex flex-wrap justify-between items-center gap-2" data-html2canvas-ignore="true">
        <div className="tabs tabs-boxed bg-white shadow border border-gray-200 p-1 w-fit">
          {periodeEvaluasiList.map((freq) => (<button key={freq.id} className={`tab ${activePeriode === freq.id ? "tab-active bg-blue-600 text-white font-semibold" : "text-gray-600"}`} onClick={() => setActivePeriode(freq.id)}>{freq.label}</button>))}
        </div>
        <button className="btn btn-ghost btn-xs text-gray-600 flex items-center gap-1" onClick={() => setShowKelolaFrekuensi(true)}><Settings size={14}/> Kelola Frekuensi</button>
      </div>

      <div className="card bg-white shadow border border-gray-200" data-html2canvas-ignore="true">
        <div className="card-body p-4">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <div className="flex items-center gap-1">
              <button className="btn btn-ghost btn-sm text-gray-700" onClick={handlePrev}>‹</button>
              <h3 className="text-sm font-bold text-gray-800 min-w-[200px] text-center">{periodeAktif.label}</h3>
              <button className="btn btn-ghost btn-sm text-gray-700" onClick={handleNext}>›</button>
            </div>
            <div className="flex items-center gap-2">
              <input type="date" className="input input-bordered input-sm text-gray-800 bg-white" value={selectedDate} onChange={handleDateChange} />
              <button className="btn btn-outline btn-xs text-gray-700 flex items-center gap-1" onClick={handleToday}><CalendarDays size={14}/> Periode Ini</button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1"><Calendar size={12}/> {formatTanggalPendek(periodeAktif.periodeMulai)} -- {formatTanggalPendek(periodeAktif.periodeSelesai)}</p>
        </div>
      </div>

      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          <div className="flex flex-wrap justify-between items-center mb-3 gap-2">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1"><FileText size={16}/> Evaluasi Kinerja Pekerjaan ({periodeAktif.label})</h3>
            <div className="flex gap-1" data-html2canvas-ignore="true">
              <button className="btn btn-ghost btn-xs text-gray-600 flex items-center gap-1" onClick={() => setShowPekerjaanSection(!showPekerjaanSection)}>{showPekerjaanSection ? <><EyeOff size={14}/> Sembunyikan</> : <><Eye size={14}/> Tampilkan</>}</button>
              {showPekerjaanSection && (<><button className="btn btn-outline btn-xs text-gray-700 flex items-center gap-1" onClick={handleAutoGenerate} title="Isi otomatis dari laporan di periode ini"><RefreshCw size={14}/> Auto-generate</button><button className="btn btn-ghost btn-xs text-gray-600 flex items-center gap-1" onClick={() => setShowKelolaField(true)}><Settings size={14}/> Kelola Field</button></>)}
            </div>
          </div>

          {showPekerjaanSection && (
            <>
              {fieldEvaluasiList.length === 0 ? (<p className="text-sm text-gray-400 italic text-center py-6 flex flex-col items-center gap-2"><FileText size={32} className="opacity-50"/> Belum ada field evaluasi.</p>) : (
                <div className="space-y-3">
                  {fieldEvaluasiList.map((field) => (<div key={field.id}><label className="text-xs font-semibold text-gray-600 mb-1 block">{field.label}</label>{renderFieldInput(field, formValues[field.id], (val) => handleUpdateValue(field.id, val))}</div>))}
                </div>
              )}
              {evaluasiTersimpan?.updatedAt && (<p className="text-xs text-gray-500 mt-3 flex items-center gap-1"><Calendar size={12}/> Terakhir disimpan: {new Date(evaluasiTersimpan.updatedAt).toLocaleString("id-ID")}</p>)}
            </>
          )}
        </div>
      </div>

      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          <div className="flex flex-wrap justify-between items-center mb-3 gap-2">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1"><Factory size={16}/> Ringkasan Evaluasi Vendor ({filteredVendors.length})</h3>
            <div className="flex gap-2 items-center" data-html2canvas-ignore="true">
              <label className="label cursor-pointer gap-2"><span className="label-text text-xs text-gray-600">Sembunyikan vendor kosong</span><input type="checkbox" className="checkbox checkbox-xs" checked={hideEmptyVendors} onChange={(e) => setHideEmptyVendors(e.target.checked)} /></label>
              <button className="btn btn-ghost btn-xs text-gray-600 flex items-center gap-1" onClick={() => setShowVendorSection(!showVendorSection)}>{showVendorSection ? <><EyeOff size={14}/> Sembunyikan</> : <><Eye size={14}/> Tampilkan</>}</button>
              <button className="btn btn-ghost btn-xs text-gray-600 flex items-center gap-1" onClick={() => setShowKelolaFieldVendor(true)}><Settings size={14}/> Field Vendor</button>
            </div>
          </div>

          {showVendorSection && (
            filteredVendors.length === 0 ? (<p className="text-sm text-gray-400 italic text-center py-4 flex flex-col items-center gap-2"><Inbox size={32} className="opacity-50"/> Belum ada vendor yang dievaluasi di periode ini.</p>) : (
              <div className="space-y-4">
                {filteredVendors.map((vendor) => {
                  const vendorEval = vendor.evaluasi?.[activePeriode]?.[key];
                  return (
                    <div key={vendor.id} className="border border-gray-200 rounded p-3 bg-gray-50">
                      <div className="flex justify-between items-center mb-2 border-b border-gray-200 pb-2">
                        <h4 className="text-sm font-bold text-gray-800 flex items-center gap-1"><Factory size={14}/> {vendor.nama}</h4>
                        <span className="text-[10px] text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">{vendorEval ? `Diisi: ${new Date(vendorEval.updatedAt).toLocaleDateString("id-ID")}` : "Belum Dievaluasi"}</span>
                      </div>
                      <div className="space-y-2">
                        {vendorEval ? (
                          fieldEvaluasiVendorList.map((field) => {
                            const val = vendorEval.fields?.[field.id];
                            if (!val) return null;
                            return (<div key={field.id} className="bg-white p-2 rounded border border-gray-100"><p className="text-[10px] font-semibold text-gray-500 mb-1">{field.label}</p><p className="text-xs text-gray-800 whitespace-pre-wrap">{val}</p></div>);
                          })
                        ) : (<p className="text-xs text-gray-400 italic">Tidak ada data evaluasi untuk periode ini.</p>)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      </div>

      <div className="flex gap-2" data-html2canvas-ignore="true">
        <button className="btn btn-primary btn-sm flex-1 flex items-center justify-center gap-2" onClick={handleSimpan} disabled={fieldEvaluasiList.length === 0}><Save size={16}/> Simpan Evaluasi Pekerjaan ({periodeAktif.label})</button>
      </div>

      {savedNotif && (<div className="alert alert-success py-2 text-xs flex items-center gap-1" data-html2canvas-ignore="true"><CheckCircle2 size={14}/> Evaluasi berhasil disimpan!</div>)}

      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          <div className="flex justify-between items-center mb-3" data-html2canvas-ignore="true">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1"><List size={16}/> History Evaluasi Pekerjaan ({historyList.length})</h3>
            <button className="btn btn-ghost btn-xs text-gray-600 flex items-center gap-1" onClick={() => setShowHistory(!showHistory)}>{showHistory ? <><EyeOff size={14}/> Sembunyikan</> : <><Eye size={14}/> Tampilkan</>}</button>
          </div>
          {showHistory && (
            historyList.length === 0 ? (<p className="text-xs text-gray-400 italic text-center py-4">Belum ada evaluasi tersimpan.</p>) : (
              <div className="space-y-2">
                {historyList.map((ev) => (
                  <details key={ev.key} className="border border-gray-200 rounded p-2 bg-gray-50">
                    <summary className="text-sm font-semibold text-gray-800 cursor-pointer flex justify-between items-center">
                      <span className="flex items-center gap-1"><Calendar size={14}/> {ev.label || ev.key}</span>
                      <button onClick={(e) => { e.preventDefault(); handleHapusHistoryPekerjaan(ev.key); }} className="btn btn-ghost btn-xs text-red-500" title="Hapus History" data-html2canvas-ignore="true"><Trash2 size={14}/></button>
                    </summary>
                    <div className="mt-2 space-y-2">
                      {fieldEvaluasiList.map((f) => {
                        const val = ev.fields?.[f.id]; if (val === undefined || val === null || val === "") return null;
                        return (<div key={f.id} className="bg-white p-2 rounded border border-gray-200"><p className="text-xs font-semibold text-gray-600">{f.label}</p><p className="text-xs text-gray-700 whitespace-pre-wrap">{val}</p></div>);
                      })}
                    </div>
                  </details>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* MODAL KELOLA FIELD KINERJA */}
      {showKelolaField && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" data-html2canvas-ignore="true">
          <div className="card bg-white shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="card-body p-4">
              <div className="flex justify-between items-center mb-3"><h3 className="text-base font-bold text-gray-800 flex items-center gap-1"><Settings size={18}/> Kelola Field Evaluasi Kinerja</h3><button className="btn btn-ghost btn-sm text-gray-700" onClick={() => setShowKelolaField(false)}><X size={18}/></button></div>
              <div className="space-y-1 mb-4">
                {fieldEvaluasiList.map((f) => (
                  <div key={f.id} className="flex justify-between items-center bg-gray-50 rounded px-2 py-1 border border-gray-200">
                    <div className="flex-1"><p className="text-sm text-gray-700">{f.label}</p><span className="text-[10px] text-gray-500">Tipe: {f.tipe}</span></div>
                    <div className="flex gap-1"><button className="btn btn-ghost btn-xs text-gray-600" onClick={() => handleBukaEditField(f)}><Pencil size={14}/></button><button className="btn btn-ghost btn-xs text-red-500" onClick={() => handleHapusField(f.id)}><Trash2 size={14}/></button></div>
                  </div>
                ))}
              </div>
              <div className="bg-purple-50 rounded p-3 border border-purple-200 space-y-2">
                <p className="text-xs font-semibold text-purple-700 flex items-center gap-1">{editingFieldId ? <><Pencil size={14}/> Edit Field</> : <><Plus size={14}/> Tambah Field Baru</>}</p>
                <input type="text" className="input input-bordered input-sm w-full text-gray-800 bg-white" placeholder="Nama field" value={fieldForm.label} onChange={(e) => setFieldForm({ ...fieldForm, label: e.target.value })} />
                <select className="select select-bordered select-sm w-full text-gray-800 bg-white" value={fieldForm.tipe} onChange={(e) => setFieldForm({ ...fieldForm, tipe: e.target.value })}>{TIPE_FIELD.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}</select>
                <div className="flex gap-2"><button className="btn btn-primary btn-sm flex-1 flex items-center justify-center gap-1" onClick={handleSimpanField} disabled={!fieldForm.label.trim()}>{editingFieldId ? <><Save size={14}/> Simpan</> : <><Plus size={14}/> Tambah</>}</button>{editingFieldId && <button className="btn btn-ghost btn-sm text-gray-700" onClick={handleBukaTambahField}>Batal</button>}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KELOLA FREKUENSI */}
      {showKelolaFrekuensi && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" data-html2canvas-ignore="true">
          <div className="card bg-white shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="card-body p-4">
              <div className="flex justify-between items-center mb-3"><h3 className="text-base font-bold text-gray-800 flex items-center gap-1"><Settings size={18}/> Kelola Frekuensi Evaluasi</h3><button className="btn btn-ghost btn-sm text-gray-700" onClick={() => setShowKelolaFrekuensi(false)}><X size={18}/></button></div>
              <div className="space-y-1 mb-4">
                {periodeEvaluasiList.map((freq) => (
                  <div key={freq.id} className="flex justify-between items-center bg-gray-50 rounded px-2 py-1 border border-gray-200">
                    <div className="flex-1"><p className="text-sm text-gray-700">{freq.label}</p><span className="text-[10px] text-gray-500">Tipe: {freq.tipe}{freq.tipe === "custom" && ` (${freq.customStart} s/d ${freq.customEnd})`}</span></div>
                    <div className="flex gap-1"><button className="btn btn-ghost btn-xs text-gray-600" onClick={() => handleBukaEditFrekuensi(freq)}><Pencil size={14}/></button><button className="btn btn-ghost btn-xs text-red-500" onClick={() => handleHapusFrekuensi(freq.id)}><Trash2 size={14}/></button></div>
                  </div>
                ))}
              </div>
              <div className="bg-blue-50 rounded p-3 border border-blue-200 space-y-2">
                <p className="text-xs font-semibold text-blue-700 flex items-center gap-1">{editingFrekuensiId ? <><Pencil size={14}/> Edit Frekuensi</> : <><Plus size={14}/> Tambah Frekuensi Baru</>}</p>
                <input type="text" className="input input-bordered input-sm w-full text-gray-800 bg-white" placeholder="Nama frekuensi" value={frekuensiForm.label} onChange={(e) => setFrekuensiForm({ ...frekuensiForm, label: e.target.value })} />
                <select className="select select-bordered select-sm w-full text-gray-800 bg-white" value={frekuensiForm.tipe} onChange={(e) => setFrekuensiForm({ ...frekuensiForm, tipe: e.target.value })}>
                  <option value="bulanan">Bulanan (1 bulan)</option><option value="triwulan">Triwulan (3 bulan)</option><option value="semester">Semester (6 bulan)</option><option value="tahunan">Tahunan (12 bulan)</option><option value="custom">Custom (tanggal manual)</option>
                </select>
                {frekuensiForm.tipe === "custom" && (<div className="grid grid-cols-2 gap-2"><div><label className="text-xs text-gray-600 mb-1 block">Mulai</label><input type="date" className="input input-bordered input-sm w-full text-gray-800 bg-white" value={frekuensiForm.customStart} onChange={(e) => setFrekuensiForm({ ...frekuensiForm, customStart: e.target.value })} /></div><div><label className="text-xs text-gray-600 mb-1 block">Selesai</label><input type="date" className="input input-bordered input-sm w-full text-gray-800 bg-white" value={frekuensiForm.customEnd} onChange={(e) => setFrekuensiForm({ ...frekuensiForm, customEnd: e.target.value })} /></div></div>)}
                <div className="flex gap-2"><button className="btn btn-primary btn-sm flex-1 flex items-center justify-center gap-1" onClick={handleSimpanFrekuensi} disabled={!frekuensiForm.label.trim()}>{editingFrekuensiId ? <><Save size={14}/> Simpan</> : <><Plus size={14}/> Tambah</>}</button>{editingFrekuensiId && <button className="btn btn-ghost btn-sm text-gray-700" onClick={handleBukaTambahFrekuensi}>Batal</button>}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KELOLA FIELD VENDOR */}
      {showKelolaFieldVendor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" data-html2canvas-ignore="true">
          <div className="card bg-white shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="card-body p-4">
              <div className="flex justify-between items-center mb-3"><h3 className="text-base font-bold text-gray-800 flex items-center gap-1"><Settings size={18}/> Kelola Field Evaluasi Vendor</h3><button className="btn btn-ghost btn-sm text-gray-700" onClick={() => setShowKelolaFieldVendor(false)}><X size={18}/></button></div>
              <div className="space-y-1 mb-4">
                {fieldEvaluasiVendorList.map((f) => (
                  <div key={f.id} className="flex justify-between items-center bg-gray-50 rounded px-2 py-1 border border-gray-200">
                    <div className="flex-1"><p className="text-sm text-gray-700">{f.label}</p><span className="text-[10px] text-gray-500">Tipe: {f.tipe}</span></div>
                    <div className="flex gap-1"><button className="btn btn-ghost btn-xs text-gray-600" onClick={() => handleBukaEditFieldVendor(f)}><Pencil size={14}/></button><button className="btn btn-ghost btn-xs text-red-500" onClick={() => handleHapusFieldVendor(f.id)}><Trash2 size={14}/></button></div>
                  </div>
                ))}
              </div>
              <div className="bg-orange-50 rounded p-3 border border-orange-200 space-y-2">
                <p className="text-xs font-semibold text-orange-700 flex items-center gap-1">{editingFieldVendorId ? <><Pencil size={14}/> Edit Field Vendor</> : <><Plus size={14}/> Tambah Field Vendor Baru</>}</p>
                <input type="text" className="input input-bordered input-sm w-full text-gray-800 bg-white" placeholder="Nama field vendor" value={fieldVendorForm.label} onChange={(e) => setFieldVendorForm({ ...fieldVendorForm, label: e.target.value })} />
                <select className="select select-bordered select-sm w-full text-gray-800 bg-white" value={fieldVendorForm.tipe} onChange={(e) => setFieldVendorForm({ ...fieldVendorForm, tipe: e.target.value })}>{TIPE_FIELD.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}</select>
                <div className="flex gap-2"><button className="btn btn-primary btn-sm flex-1 flex items-center justify-center gap-1" onClick={handleSimpanFieldVendor} disabled={!fieldVendorForm.label.trim()}>{editingFieldVendorId ? <><Save size={14}/> Simpan</> : <><Plus size={14}/> Tambah</>}</button>{editingFieldVendorId && <button className="btn btn-ghost btn-sm text-gray-700" onClick={handleBukaTambahFieldVendor}>Batal</button>}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}