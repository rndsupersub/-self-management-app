// components/EvaluasiPekerjaan.js
"use client";

import { useState, useMemo, useEffect } from "react";
import { getPeriodeRange, formatTanggalPendek } from "@/lib/evaluasiData";
import { Pin, Calendar, AlertTriangle, CalendarDays, Target, Pencil, Plus, Save, Trash2, BarChart3, Settings, RefreshCw, List, FileText, Factory, Eye, EyeOff, CheckSquare, ChevronRight, CheckCircle2, X, MessageSquare, Inbox, Link as LinkIcon, Building, ThumbsUp, ThumbsDown, Clock, Smartphone, Monitor, FolderOpen } from "lucide-react";
import { getLabelHasil, getBadgeClass, getWarnaHasil, formatTanggal } from "@/lib/vendorData"; 

const getTodayLocalDate = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const adjustDate = (dateStr, type, amount) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dateObj = new Date(y, m - 1, d);
  
  if (type === "days") dateObj.setDate(dateObj.getDate() + amount);
  else if (type === "months") dateObj.setMonth(dateObj.getMonth() + amount);
  else if (type === "years") dateObj.setFullYear(dateObj.getFullYear() + amount);

  const newY = dateObj.getFullYear();
  const newM = String(dateObj.getMonth() + 1).padStart(2, "0");
  const newD = String(dateObj.getDate()).padStart(2, "0");
  return `${newY}-${newM}-${newD}`;
};

const formatTanggalPanjangLokal = (dateStr) => {
  if (!dateStr || dateStr === "Data Lama") return dateStr;
  const [y, m, d] = dateStr.split("-").map(Number);
  const dateObj = new Date(y, m - 1, d);
  return dateObj.toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

export default function EvaluasiPekerjaan({
  kegiatanList = [],
  laporanData = {},
  evaluasiData = {},
  vendorList = [],
  periodeEvaluasiList = [],
  onUpdateEvaluasi,
  onUpdatePeriodeEvaluasi,
}) {
  const [mainTab, setMainTab] = useState("evaluasi"); 

  const [activePeriode, setActivePeriode] = useState(periodeEvaluasiList[0]?.id || "bulanan");
  const [selectedDate, setSelectedDate] = useState(getTodayLocalDate());
  
  const [evaluationReports, setEvaluationReports] = useState([]); 
  const [editingIndex, setEditingIndex] = useState(null); 
  
  const [showHistory, setShowHistory] = useState(false);
  const [savedNotif, setSavedNotif] = useState(false);

  const [showAllVendorDetails, setShowAllVendorDetails] = useState(true);
  const [expandedVendors, setExpandedVendors] = useState({});
  const [hideEmptyVendors, setHideEmptyVendors] = useState(true);
  const [showVendorSection, setShowVendorSection] = useState(true);

  const [showPekerjaanSection, setShowPekerjaanSection] = useState(true);
  const [showKelolaFrekuensi, setShowKelolaFrekuensi] = useState(false);
  const [editingFrekuensiId, setEditingFrekuensiId] = useState(null);
  const [frekuensiForm, setFrekuensiForm] = useState({ label: "", tipe: "bulanan", customStart: "", customEnd: "" });

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

  // Load data & Migrasi data lama
  useEffect(() => {
    if (evaluasiTersimpan?.reports) {
      setEvaluationReports(evaluasiTersimpan.reports);
    } else if (evaluasiTersimpan?.fields) {
      setEvaluationReports([{
        tanggal: "Data Lama",
        ringkasan: evaluasiTersimpan.fields.ringkasan || "",
        kendala: evaluasiTersimpan.fields.kendala || "",
        solusi: evaluasiTersimpan.fields.solusi || "",
        gdriveUrl: ""
      }]);
    } else {
      setEvaluationReports([]);
    }
    setEditingIndex(null); 
  }, [evaluasiTersimpan]);

  const handlePrev = () => {
    const def = periodeEvaluasiList.find((p) => p.id === activePeriode);
    if (!def) return;
    if (def.tipe === "bulanan") setSelectedDate(adjustDate(selectedDate, "months", -1));
    else if (def.tipe === "triwulan") setSelectedDate(adjustDate(selectedDate, "months", -3));
    else if (def.tipe === "semester") setSelectedDate(adjustDate(selectedDate, "months", -6));
    else if (def.tipe === "tahunan") setSelectedDate(adjustDate(selectedDate, "years", -1));
  };

  const handleNext = () => {
    const def = periodeEvaluasiList.find((p) => p.id === activePeriode);
    if (!def) return;
    if (def.tipe === "bulanan") setSelectedDate(adjustDate(selectedDate, "months", 1));
    else if (def.tipe === "triwulan") setSelectedDate(adjustDate(selectedDate, "months", 3));
    else if (def.tipe === "semester") setSelectedDate(adjustDate(selectedDate, "months", 6));
    else if (def.tipe === "tahunan") setSelectedDate(adjustDate(selectedDate, "years", 1));
  };

  const handleToday = () => setSelectedDate(getTodayLocalDate());
  const handleDateChange = (e) => setSelectedDate(e.target.value);

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

    const newReports = laporanHarian.map(lap => ({
      tanggal: lap.tanggal,
      ringkasan: lap.fields?.ringkasan || lap.konten || "",
      kendala: lap.fields?.kendala || "",
      solusi: lap.fields?.solusi || "",
      gdriveUrl: lap.gdriveUrl || ""
    }));

    setEvaluationReports(newReports);
    setEditingIndex(null);
  };

  const handleUpdateReport = (index, field, value) => {
    const updated = [...evaluationReports];
    updated[index][field] = value;
    setEvaluationReports(updated);
  };

  const handleDeleteReport = (index) => {
    if (!confirm("Hapus kotak evaluasi tanggal ini?")) return;
    const updated = evaluationReports.filter((_, i) => i !== index);
    setEvaluationReports(updated);
    if (editingIndex === index) setEditingIndex(null);
  };

  const handleTambahKotakManual = () => {
    const today = getTodayLocalDate();
    setEvaluationReports([...evaluationReports, { tanggal: today, ringkasan: "", kendala: "", solusi: "", gdriveUrl: "" }]);
    setEditingIndex(evaluationReports.length); 
  };

  // FUNGSI BATAL EDIT (Global)
  const handleBatalEdit = () => {
    if (evaluasiTersimpan?.reports) {
      setEvaluationReports(evaluasiTersimpan.reports);
    } else if (evaluasiTersimpan?.fields) {
      setEvaluationReports([{ tanggal: "Data Lama", ...evaluasiTersimpan.fields }]);
    } else {
      setEvaluationReports([]);
    }
    setEditingIndex(null);
  };

  const handleSimpan = () => {
    if (!onUpdateEvaluasi || !periodeAktif) return;
    const newData = JSON.parse(JSON.stringify(evaluasiData || {}));
    if (!newData[activePeriode]) newData[activePeriode] = {};
    
    newData[activePeriode][periodeAktif.key] = { 
      periodeMulai: periodeAktif.periodeMulai, 
      periodeSelesai: periodeAktif.periodeSelesai, 
      label: periodeAktif.label, 
      tipe: periodeAktif.tipe, 
      reports: evaluationReports, 
      updatedAt: new Date().toISOString() 
    };
    
    onUpdateEvaluasi(newData);
    setEditingIndex(null); 
    setSavedNotif(true); setTimeout(() => setSavedNotif(false), 2000);
  };

  const handleEditHistory = (ev) => {
    const dateToSet = ev.tanggal || ev.tanggalMulai || (ev.key.length === 7 ? `${ev.key}-01` : ev.key);
    if (dateToSet) setSelectedDate(dateToSet);
    if (ev.reports) {
      setEvaluationReports(ev.reports);
    } else if (ev.fields) {
      setEvaluationReports([{ tanggal: "Data Lama", ...ev.fields }]);
    }
    setEditingIndex(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHapusHistoryPekerjaan = (periodeKey) => {
    if (!confirm("Hapus history evaluasi pekerjaan periode ini?")) return;
    const newData = JSON.parse(JSON.stringify(evaluasiData || {}));
    if (newData[activePeriode] && newData[activePeriode][periodeKey]) {
      delete newData[activePeriode][periodeKey];
      onUpdateEvaluasi(newData);
      if (periodeKey === key) {
        setEvaluationReports([]);
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
      const delay = logs.filter(l => l.hasil === "delay").length;

      return { vendor, logs, total, layak, tidakLayak, onTrack, delay };
    }).filter(v => {
      if (hideEmptyVendors) return v.total > 0;
      return true;
    });
  }, [vendorList, periodeAktif, hideEmptyVendors]);

  const toggleVendorDetail = (vendorId) => {
    setExpandedVendors(prev => ({ ...prev, [vendorId]: !prev[vendorId] }));
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
              <button className="btn btn-outline btn-xs text-gray-700 flex items-center gap-1" onClick={handleToday}><CalendarDays size={14}/> Hari Ini</button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1"><Calendar size={12}/> {formatTanggalPendek(periodeAktif.periodeMulai)} -- {formatTanggalPendek(periodeAktif.periodeSelesai)}</p>
        </div>
      </div>

      {/* TAB UTAMA: EVALUASI vs VENDOR INSIGHT */}
      <div className="flex gap-2 border-b border-gray-200 pb-2" data-html2canvas-ignore="true">
        <button className={`btn btn-sm ${mainTab === 'evaluasi' ? 'btn-primary' : 'btn-ghost text-gray-600'}`} onClick={() => setMainTab('evaluasi')}>
          <FileText size={16} className="mr-1"/> Evaluasi Kinerja
        </button>
        <button className={`btn btn-sm ${mainTab === 'vendor' ? 'btn-primary' : 'btn-ghost text-gray-600'}`} onClick={() => setMainTab('vendor')}>
          <Factory size={16} className="mr-1"/> Insight Vendor
        </button>
      </div>

      {/* ======================= KONTEN TAB EVALUASI (KOTAK-KOTAK) ======================= */}
      {mainTab === 'evaluasi' && (
        <div className="card bg-white shadow border border-gray-200 animate-fade-in">
          <div className="card-body p-4">
            <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1"><FileText size={16}/> Evaluasi Kinerja Pekerjaan ({periodeAktif.label})</h3>
              <div className="flex gap-1" data-html2canvas-ignore="true">
                <button className="btn btn-outline btn-xs text-gray-700 flex items-center gap-1" onClick={handleTambahKotakManual}><Plus size={14}/> Tambah Kotak</button>
                <button className="btn btn-outline btn-xs text-gray-700 flex items-center gap-1" onClick={handleAutoGenerate} title="Tarik data dari laporan"><RefreshCw size={14}/> Auto-generate</button>
              </div>
            </div>

            {evaluationReports.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg">
                <FileText size={40} className="mx-auto mb-2 text-gray-300"/>
                <p className="text-sm text-gray-500">Belum ada data evaluasi. Klik "Auto-generate" untuk narik dari laporan.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {evaluationReports.map((report, index) => {
                  const isEditing = editingIndex === index;

                  return (
                    <div key={index} className="card bg-gray-50 border border-gray-200 shadow-sm">
                      <div className="card-body p-4 space-y-3">
                        
                        {/* HEADER KOTAK */}
                        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-primary"/>
                            {isEditing ? (
                              <input 
                                type="date" 
                                className="input input-ghost input-sm font-bold text-gray-800 p-0 h-auto min-h-0 focus:bg-white focus:border focus:px-2" 
                                value={report.tanggal} 
                                onChange={(e) => handleUpdateReport(index, 'tanggal', e.target.value)} 
                              />
                            ) : (
                              <h4 className="text-sm font-bold text-gray-800">{formatTanggalPanjangLokal(report.tanggal)}</h4>
                            )}
                          </div>
                          <div className="flex gap-1">
                            {!isEditing && (
                              <button className="btn btn-ghost btn-xs text-blue-500" onClick={() => setEditingIndex(index)} title="Edit Data"><Pencil size={16}/></button>
                            )}
                            <button className="btn btn-ghost btn-xs text-red-500" onClick={() => handleDeleteReport(index)} title="Hapus Kotak"><Trash2 size={16}/></button>
                          </div>
                        </div>

                        {/* ISI KOTAK */}
                        {isEditing ? (
                          <div className="animate-fade-in space-y-3">
                            <div>
                              <label className="text-xs font-semibold text-gray-600 mb-1 block">Ringkasan Pekerjaan</label>
                              <textarea className="textarea textarea-bordered w-full text-sm text-gray-800 bg-white font-mono" rows="2" value={report.ringkasan} onChange={(e) => handleUpdateReport(index, 'ringkasan', e.target.value)} />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-gray-600 mb-1 block">Kendala</label>
                              <textarea className="textarea textarea-bordered w-full text-sm text-gray-800 bg-white font-mono" rows="2" value={report.kendala} onChange={(e) => handleUpdateReport(index, 'kendala', e.target.value)} />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-gray-600 mb-1 block">Solusi</label>
                              <textarea className="textarea textarea-bordered w-full text-sm text-gray-800 bg-white font-mono" rows="2" value={report.solusi} onChange={(e) => handleUpdateReport(index, 'solusi', e.target.value)} />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-gray-600 mb-1 block flex items-center gap-1"><FolderOpen size={14}/> Link Google Drive</label>
                              <input type="url" className="input input-bordered input-sm w-full text-gray-800 bg-white" placeholder="https://drive.google.com/..." value={report.gdriveUrl || ""} onChange={(e) => handleUpdateReport(index, 'gdriveUrl', e.target.value)} />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {report.ringkasan && (
                              <div>
                                <p className="text-[10px] font-semibold text-gray-500 mb-0.5">Ringkasan Pekerjaan</p>
                                <p className="text-sm text-gray-800 whitespace-pre-wrap">{report.ringkasan}</p>
                              </div>
                            )}
                            {report.kendala && (
                              <div>
                                <p className="text-[10px] font-semibold text-gray-500 mb-0.5">Kendala</p>
                                <p className="text-sm text-gray-800 whitespace-pre-wrap">{report.kendala}</p>
                              </div>
                            )}
                            {report.solusi && (
                              <div>
                                <p className="text-[10px] font-semibold text-gray-500 mb-0.5">Solusi</p>
                                <p className="text-sm text-gray-800 whitespace-pre-wrap">{report.solusi}</p>
                              </div>
                            )}
                            {report.gdriveUrl && (
                              <div>
                                <a href={report.gdriveUrl} target="_blank" rel="noopener noreferrer" className="text-xs link link-primary flex items-center gap-1"><LinkIcon size={12}/> Lihat GDrive</a>
                              </div>
                            )}
                            {!report.ringkasan && !report.kendala && !report.solusi && !report.gdriveUrl && (
                              <p className="text-xs text-gray-400 italic">Kosong. Klik Edit untuk mengisi.</p>
                            )}
                          </div>
                        )}

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* TOMBOL SIMPAN & BATAL (GLOBAL) */}
            <div className="flex gap-2 mt-6" data-html2canvas-ignore="true">
              <button className="btn btn-primary btn-sm flex-1 flex items-center justify-center gap-2" onClick={handleSimpan} disabled={evaluationReports.length === 0}><Save size={16}/> Simpan Evaluasi Pekerjaan</button>
              {(editingIndex !== null) && (
                <button className="btn btn-ghost btn-sm text-gray-600" onClick={handleBatalEdit}>Batal</button>
              )}
            </div>
            {savedNotif && (<div className="alert alert-success py-2 text-xs flex items-center gap-1 mt-2" data-html2canvas-ignore="true"><CheckCircle2 size={14}/> Evaluasi berhasil disimpan!</div>)}
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
                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                          <button type="button" onClick={() => handleEditHistory(ev)} className="btn btn-ghost btn-xs text-blue-500" title="Edit History"><Pencil size={14}/></button>
                          <button type="button" onClick={() => handleHapusHistoryPekerjaan(ev.key)} className="btn btn-ghost btn-xs text-red-500" title="Hapus History"><Trash2 size={14}/></button>
                        </div>
                      </summary>
                      <div className="mt-2 space-y-2">
                        {ev.reports && ev.reports.map((rep, i) => (
                          <div key={i} className="bg-white p-2 rounded border border-gray-200 mb-2">
                            <p className="text-xs font-bold text-gray-700 flex items-center gap-1 mb-1"><Calendar size={12}/> {formatTanggalPanjangLokal(rep.tanggal)}</p>
                            {rep.ringkasan && <div className="mb-1"><span className="text-[10px] font-semibold text-gray-500">Ringkasan:</span> <p className="text-xs text-gray-700 whitespace-pre-wrap">{rep.ringkasan}</p></div>}
                            {rep.kendala && <div className="mb-1"><span className="text-[10px] font-semibold text-gray-500">Kendala:</span> <p className="text-xs text-gray-700 whitespace-pre-wrap">{rep.kendala}</p></div>}
                            {rep.solusi && <div><span className="text-[10px] font-semibold text-gray-500">Solusi:</span> <p className="text-xs text-gray-700 whitespace-pre-wrap">{rep.solusi}</p></div>}
                            {rep.gdriveUrl && <a href={rep.gdriveUrl} target="_blank" rel="noopener noreferrer" className="text-xs link link-primary mt-1 flex items-center gap-1"><LinkIcon size={10}/> GDrive</a>}
                          </div>
                        ))}
                        {ev.fields && (
                          <div className="bg-white p-2 rounded border border-gray-200">
                            <p className="text-xs font-bold text-gray-700 mb-1">Data Lama</p>
                            {ev.fields.ringkasan && <p className="text-xs text-gray-700 whitespace-pre-wrap">{ev.fields.ringkasan}</p>}
                            {ev.fields.kendala && <p className="text-xs text-gray-700 whitespace-pre-wrap">{ev.fields.kendala}</p>}
                            {ev.fields.solusi && <p className="text-xs text-gray-700 whitespace-pre-wrap">{ev.fields.solusi}</p>}
                          </div>
                        )}
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
              
              <div className="flex gap-2 items-center flex-wrap" data-html2canvas-ignore="true">
                <button 
                  className="btn btn-outline btn-xs text-gray-700 flex items-center gap-1"
                  onClick={() => setShowAllVendorDetails(!showAllVendorDetails)}
                >
                  {showAllVendorDetails ? <><EyeOff size={14}/> Sembunyikan Semua Detail</> : <><Eye size={14}/> Tampilkan Semua Detail</>}
                </button>
                <label className="label cursor-pointer gap-2">
                  <span className="label-text text-xs text-gray-600">Sembunyikan vendor kosong</span>
                  <input type="checkbox" className="checkbox checkbox-xs" checked={hideEmptyVendors} onChange={(e) => setHideEmptyVendors(e.target.checked)} />
                </label>
              </div>
            </div>

            {vendorInsights.length === 0 ? (<p className="text-sm text-gray-400 italic text-center py-4 flex flex-col items-center gap-2"><Inbox size={32} className="opacity-50"/> Belum ada kunjungan vendor di periode ini.</p>) : (
              <div className="space-y-4">
                {vendorInsights.map(({ vendor, logs, total, layak, tidakLayak, onTrack, delay }) => {
                  const isExpanded = showAllVendorDetails && (expandedVendors[vendor.id] !== false);

                  return (
                    <div key={vendor.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      
                      {/* HEADER VENDOR & STATS */}
                      <div className="flex flex-wrap justify-between items-center gap-4 mb-4 border-b border-gray-200 pb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-bold text-gray-800 flex items-center gap-2"><Factory size={18} className="text-primary"/> {vendor.nama}</h4>
                            <button 
                              onClick={() => toggleVendorDetail(vendor.id)}
                              className="btn btn-ghost btn-xs btn-square text-gray-500"
                              title={isExpanded ? "Sembunyikan detail" : "Tampilkan detail"}
                            >
                              {isExpanded ? <EyeOff size={16}/> : <Eye size={16}/>}
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Total {total} Kunjungan di periode ini</p>
                        </div>
                        
                        {/* BADGES STATISTIK */}
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

                      {/* TIMELINE LOG KUNJUNGAN (Bisa disembunyikan) */}
                      {isExpanded && (
                        <div className="space-y-2 animate-fade-in">
                          {logs.length === 0 ? (
                            <p className="text-xs text-gray-400 italic text-center py-2">Belum ada kunjungan.</p>
                          ) : (
                            logs.map((log) => (
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
                            ))
                          )}
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
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