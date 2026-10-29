// components/EvaluasiPekerjaan.js
"use client";

import { useState, useMemo, useEffect } from "react";
import { getPeriodeRange, formatTanggalPendek } from "@/lib/evaluasiData";
import { Pin, Calendar, AlertTriangle, CalendarDays, Target, Pencil, Plus, Save, Trash2, BarChart3, Settings, RefreshCw, List, FileText, Factory, Eye, EyeOff, CheckSquare, ChevronRight, CheckCircle2, X, MessageSquare, Inbox, Link as LinkIcon, Building, ThumbsUp, ThumbsDown, Clock, Smartphone, Monitor, LayoutDashboard, Activity } from "lucide-react";
import { getLabelHasil, getBadgeClass, getWarnaHasil, formatTanggal } from "@/lib/vendorData"; 

const DEFAULT_FIELDS = [
  { id: "ringkasan", label: "Ringkasan Pekerjaan", tipe: "long" },
  { id: "kendala", label: "Kendala", tipe: "long" },
  { id: "solusi", label: "Solusi", tipe: "long" },
];

export default function EvaluasiPekerjaan({
  kegiatanList = [],
  laporanData = {},
  evaluasiData = {},
  vendorList = [],
  periodeEvaluasiList = [],
  onUpdateEvaluasi,
  onUpdatePeriodeEvaluasi,
}) {
  // State buat Tab Utama (Evaluasi vs Vendor Insight)
  const [mainTab, setMainTab] = useState("evaluasi"); 

  const [activePeriode, setActivePeriode] = useState(periodeEvaluasiList[0]?.id || "bulanan");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [formValues, setFormValues] = useState({});
  const [showHistory, setShowHistory] = useState(false);
  const [showVendorSection, setShowVendorSection] = useState(true);
  const [savedNotif, setSavedNotif] = useState(false);

  const [showPekerjaanSection, setShowPekerjaanSection] = useState(true);
  const [hideEmptyVendors, setHideEmptyVendors] = useState(true);

  const [showKelolaFrekuensi, setShowKelolaFrekuensi] = useState(false);
  const [editingFrekuensiId, setEditingFrekuensiId] = useState(null);
  const [frekuensiForm, setFrekuensiForm] = useState({ label: "", tipe: "bulanan", customStart: "", customEnd: "" });

  const fields = useMemo(() => laporanData?.fields || DEFAULT_FIELDS, [laporanData]);

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
      fields.forEach((f) => { empty[f.id] = ""; });
      setFormValues(empty);
    }
  }, [evaluasiTersimpan, fields]);

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
    const start = periodeAktif.periodeMulai;
    const end = periodeAktif.periodeSelesai;

    let laporanHarian = [];
    if (laporanData?.harian) {
      laporanHarian = Object.values(laporanData.harian)
        .filter(data => data.tanggal >= start && data.tanggal <= end)
        .sort((a, b) => a.tanggal.localeCompare(b.tanggal));
    }

    if (laporanHarian.length === 0) { alert("Tidak ada laporan harian di periode ini."); return; }

    let aggregatedData = {};

    laporanHarian.forEach(lap => {
      const tgl = lap.tanggal;
      if (lap.fields) {
        Object.entries(lap.fields).forEach(([fId, val]) => {
          if (val?.trim()) {
            if (!aggregatedData[fId]) aggregatedData[fId] = [];
            aggregatedData[fId].push(`[📅 ${tgl}]\n${val.trim()}`);
          }
        });
      } else if (lap.konten?.trim()) {
        if (!aggregatedData["ringkasan"]) aggregatedData["ringkasan"] = [];
        aggregatedData["ringkasan"].push(`[📅 ${tgl}]\n${lap.konten.trim()}`);
      }
    });

    const newValues = { ...formValues };
    fields.forEach((field) => {
      if (aggregatedData[field.id]?.length) {
        newValues[field.id] = aggregatedData[field.id].join("\n\n");
      }
    });
    setFormValues(newValues);
  };

  const handleSimpan = () => {
    if (!onUpdateEvaluasi || !periodeAktif) return;
    const newData = JSON.parse(JSON.stringify(evaluasiData || {}));
    if (!newData[activePeriode]) newData[activePeriode] = {};
    newData[activePeriode][periodeAktif.key] = { periodeMulai: periodeAktif.periodeMulai, periodeSelesai: periodeAktif.periodeSelesai, label: periodeAktif.label, tipe: periodeAktif.tipe, fields: formValues, updatedAt: new Date().toISOString() };
    onUpdateEvaluasi(newData);
    setSavedNotif(true); setTimeout(() => setSavedNotif(false), 2000);
  };

  const handleHapusHistoryPekerjaan = (periodeKey) => {
    if (!confirm("Hapus history evaluasi pekerjaan periode ini?")) return;
    const newData = JSON.parse(JSON.stringify(evaluasiData || {}));
    if (newData[activePeriode] && newData[activePeriode][periodeKey]) {
      delete newData[activePeriode][periodeKey];
      onUpdateEvaluasi(newData);
      if (periodeKey === key) {
        const empty = {}; fields.forEach((f) => { empty[f.id] = ""; });
        setFormValues(empty);
      }
    }
  };

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

  const historyList = useMemo(() => {
    const data = evaluasiData?.[activePeriode] || {};
    return Object.entries(data).map(([k, val]) => ({ key: k, ...val })).sort((a, b) => b.key.localeCompare(a.key));
  }, [evaluasiData, activePeriode]);

  // LOGIKA VENDOR INSIGHT (Tambah Delay)
  const vendorInsights = useMemo(() => {
    if (!periodeAktif) return [];
    
    const start = periodeAktif.periodeMulai;
    const end = periodeAktif.periodeSelesai;

    return vendorList.map((vendor) => {
      const logs = (vendor.logKunjungan || [])
        .filter(log => log.tanggal >= start && log.tanggal <= end)
        .sort((a, b) => b.tanggal.localeCompare(a.tanggal));

      const total = logs.length;
      const layak = logs.filter(l => l.hasil === "layak").length;
      const tidakLayak = logs.filter(l => l.hasil === "tidak_layak").length;
      const onTrack = logs.filter(l => l.hasil === "on_track").length;
      const delay = logs.filter(l => l.hasil === "delay").length; // Tambahan Delay

      return {
        vendor,
        logs,
        total,
        layak,
        tidakLayak,
        onTrack,
        delay
      };
    }).filter(v => {
      if (hideEmptyVendors) return v.total > 0;
      return true;
    });
  }, [vendorList, periodeAktif, hideEmptyVendors]);

  const renderFieldInput = (field, value, onChange) => {
    const val = value ?? "";
    if (field.tipe === "text") return (<input type="text" className="input input-bordered input-sm w-full text-gray-800 bg-white" placeholder={`Isi ${field.label}...`} value={val} onChange={(e) => onChange(e.target.value)} />);
    return (<textarea className="textarea textarea-bordered w-full text-sm text-gray-800 bg-white font-mono" rows="5" placeholder={`Isi ${field.label}...`} value={val} onChange={(e) => onChange(e.target.value)} />);
  };

  if (!periodeAktif) {
    return (<div className="alert alert-warning text-xs flex items-center gap-2" data-html2canvas-ignore="true"><AlertTriangle size={16} /> Frekuensi evaluasi belum ada. Tambahin dulu di <Settings size={14}/> Kelola Frekuensi.</div>);
  }

  return (
    <div className="space-y-4">
      {/* HEADER TAB FREKUENSI */}
      <div className="flex flex-wrap justify-between items-center gap-2" data-html2canvas-ignore="true">
        <div className="tabs tabs-boxed bg-white shadow border border-gray-200 p-1 w-fit">
          {periodeEvaluasiList.map((freq) => (<button key={freq.id} className={`tab ${activePeriode === freq.id ? "tab-active bg-blue-600 text-white font-semibold" : "text-gray-600"}`} onClick={() => setActivePeriode(freq.id)}>{freq.label}</button>))}
        </div>
        <button className="btn btn-ghost btn-xs text-gray-600 flex items-center gap-1" onClick={() => setShowKelolaFrekuensi(true)}><Settings size={14}/> Kelola Frekuensi</button>
      </div>

      {/* NAVIGASI PERIODE */}
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

      {/* TAB UTAMA: EVALUASI vs VENDOR INSIGHT */}
      <div className="flex gap-2 border-b border-gray-200 pb-2" data-html2canvas-ignore="true">
        <button 
          className={`btn btn-sm ${mainTab === 'evaluasi' ? 'btn-primary' : 'btn-ghost text-gray-600'}`} 
          onClick={() => setMainTab('evaluasi')}
        >
          <FileText size={16} className="mr-1"/> Evaluasi Kinerja
        </button>
        <button 
          className={`btn btn-sm ${mainTab === 'vendor' ? 'btn-primary' : 'btn-ghost text-gray-600'}`} 
          onClick={() => setMainTab('vendor')}
        >
          <Factory size={16} className="mr-1"/> Insight Vendor
        </button>
      </div>

      {/* ======================= KONTEN TAB EVALUASI ======================= */}
      {mainTab === 'evaluasi' && (
        <div className="card bg-white shadow border border-gray-200 animate-fade-in">
          <div className="card-body p-4">
            <div className="flex flex-wrap justify-between items-center mb-3 gap-2">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1"><FileText size={16}/> Evaluasi Kinerja Pekerjaan ({periodeAktif.label})</h3>
              <div className="flex gap-1" data-html2canvas-ignore="true">
                <button className="btn btn-ghost btn-xs text-gray-600 flex items-center gap-1" onClick={() => setShowPekerjaanSection(!showPekerjaanSection)}>{showPekerjaanSection ? <><EyeOff size={14}/> Sembunyikan</> : <><Eye size={14}/> Tampilkan</>}</button>
                {showPekerjaanSection && (<><button className="btn btn-outline btn-xs text-gray-700 flex items-center gap-1" onClick={handleAutoGenerate} title="Tarik data dari laporan"><RefreshCw size={14}/> Auto-generate</button></>)}
              </div>
            </div>

            {showPekerjaanSection && (
              <>
                {fields.length === 0 ? (<p className="text-sm text-gray-400 italic text-center py-6 flex flex-col items-center gap-2"><FileText size={32} className="opacity-50"/> Belum ada field evaluasi.</p>) : (
                  <div className="space-y-3">
                    {fields.map((field) => (<div key={field.id}><label className="text-xs font-semibold text-gray-600 mb-1 block">{field.label}</label>{renderFieldInput(field, formValues[field.id], (val) => handleUpdateValue(field.id, val))}</div>))}
                  </div>
                )}
                {evaluasiTersimpan?.updatedAt && (<p className="text-xs text-gray-500 mt-3 flex items-center gap-1"><Calendar size={12}/> Terakhir disimpan: {new Date(evaluasiTersimpan.updatedAt).toLocaleString("id-ID")}</p>)}
                
                <div className="flex gap-2 mt-4" data-html2canvas-ignore="true">
                  <button className="btn btn-primary btn-sm flex-1 flex items-center justify-center gap-2" onClick={handleSimpan} disabled={fields.length === 0}><Save size={16}/> Simpan Evaluasi Pekerjaan</button>
                </div>
                {savedNotif && (<div className="alert alert-success py-2 text-xs flex items-center gap-1 mt-2" data-html2canvas-ignore="true"><CheckCircle2 size={14}/> Evaluasi berhasil disimpan!</div>)}
              </>
            )}
          </div>

          {/* HISTORY EVALUASI PEKERJAAN */}
          <div className="card-body p-4 border-t border-gray-200">
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
                        {fields.map((f) => {
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
      )}

      {/* ======================= KONTEN TAB VENDOR INSIGHT ======================= */}
      {mainTab === 'vendor' && (
        <div className="card bg-white shadow border border-gray-200 animate-fade-in">
          <div className="card-body p-4">
            <div className="flex flex-wrap justify-between items-center mb-3 gap-2">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1"><Factory size={16}/> Insight Kunjungan Vendor</h3>
              <div className="flex gap-2 items-center" data-html2canvas-ignore="true">
                <label className="label cursor-pointer gap-2">
                  <span className="label-text text-xs text-gray-600">Sembunyikan vendor kosong</span>
                  <input type="checkbox" className="checkbox checkbox-xs" checked={hideEmptyVendors} onChange={(e) => setHideEmptyVendors(e.target.checked)} />
                </label>
                <button className="btn btn-ghost btn-xs text-gray-600 flex items-center gap-1" onClick={() => setShowVendorSection(!showVendorSection)}>{showVendorSection ? <><EyeOff size={14}/> Sembunyikan</> : <><Eye size={14}/> Tampilkan</>}</button>
              </div>
            </div>

            {showVendorSection && (
              vendorInsights.length === 0 ? (<p className="text-sm text-gray-400 italic text-center py-4 flex flex-col items-center gap-2"><Inbox size={32} className="opacity-50"/> Belum ada kunjungan vendor di periode ini.</p>) : (
                <div className="space-y-4">
                  {vendorInsights.map(({ vendor, logs, total, layak, tidakLayak, onTrack, delay }) => (
                    <div key={vendor.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      
                      {/* HEADER VENDOR & STATS */}
                      <div className="flex flex-wrap justify-between items-center gap-4 mb-4 border-b border-gray-200 pb-3">
                        <div className="flex-1">
                          <h4 className="text-base font-bold text-gray-800 flex items-center gap-2"><Factory size={18} className="text-primary"/> {vendor.nama}</h4>
                          <p className="text-xs text-gray-500 mt-1">Total {total} Kunjungan di periode ini</p>
                        </div>
                        
                        {/* BADGES STATISTIK (Tambah Delay) */}
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 border border-green-300 flex items-center gap-1 font-semibold">
                            <ThumbsUp size={12}/> Layak: {layak}
                          </span>
                          <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 border border-red-300 flex items-center gap-1 font-semibold">
                            <ThumbsDown size={12}/> Tidak Layak: {tidakLayak}
                          </span>
                          <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 border border-blue-300 flex items-center gap-1 font-semibold">
                            <CheckCircle2 size={12}/> On Track: {onTrack}
                          </span>
                          <span className="text-xs px-2 py-1 rounded bg-orange-100 text-orange-700 border border-orange-300 flex items-center gap-1 font-semibold">
                            <Clock size={12}/> Delay: {delay}
                          </span>
                        </div>
                      </div>

                      {/* TIMELINE LOG KUNJUNGAN */}
                      <div className="space-y-2">
                        {logs.map((log) => (
                          <div key={log.id} className="bg-white p-3 rounded border border-gray-200 flex flex-col md:flex-row gap-3">
                            
                            {/* Tanggal & Metode */}
                            <div className="md:w-1/4 flex flex-col gap-1 shrink-0">
                              <span className="text-xs font-semibold text-gray-800 flex items-center gap-1"><Calendar size={12}/> {formatTanggal(log.tanggal, "pendek")}</span>
                              <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                {log.metode === "online" ? <><Monitor size={10}/> Online</> : <><Building size={10}/> Offline</>}
                              </span>
                            </div>
                            
                            {/* Hasil */}
                            <div className="md:w-1/4 shrink-0">
                               <span className={`text-[10px] px-2 py-0.5 rounded border inline-flex items-center gap-1 ${getBadgeClass(getWarnaHasil(log.hasil))}`}>
                                 {log.hasil === "layak" && <ThumbsUp size={10}/>}
                                 {log.hasil === "tidak_layak" && <ThumbsDown size={10}/>}
                                 {log.hasil === "on_track" && <CheckCircle2 size={10}/>}
                                 {log.hasil === "delay" && <Clock size={10}/>}
                                 {getLabelHasil(log.hasil)}
                               </span>
                            </div>

                            {/* Catatan */}
                            <div className="flex-1">
                              <p className="text-xs text-gray-700 whitespace-pre-wrap">{log.catatan || "-"}</p>
                            </div>

                          </div>
                        ))}
                      </div>

                    </div>
                  ))}
                </div>
              )
            )}
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
    </div>
  );
}