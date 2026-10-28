// components/KalenderBelajar.js
"use client";

import { useState, useMemo } from "react";
import { HOLIDAYS } from "@/lib/holidays";
import { getLabelKategoriById, getDefaultTargetByKategori, formatTanggal, getWarnaStyle, getWarnaToolByPath } from "@/lib/belajarData";
import { Target, CheckCircle2, Pencil, Save, X, Link as LinkIcon, Calendar, FileText, ArrowRight, Info, MessageSquare, FolderOpen, AlertTriangle, Plus } from "lucide-react";

export default function KalenderBelajar({
  kategoriId = "design",
  subKategoriId = "",
  kategoriData = [],
  logHarian = {},
  targetHarian = {},
  onUpdateLog,
  onUpdateTarget,
  subKategoriSiblings = [],
  onPindahSubKategori,
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingLogId, setEditingLogId] = useState(null);
  const [editTargetMode, setEditTargetMode] = useState(false);
  const [targetInput, setTargetInput] = useState("");

  const [filterSubKategori, setFilterSubKategori] = useState("all");
  const [filterTool, setFilterTool] = useState("all");

  const [formData, setFormData] = useState({ subKategoriId: "", toolId: "", fiturId: "", partId: "", catatan: "", gdriveUrl: "" });
  const [errorMsg, setErrorMsg] = useState("");

  const kategoriObj = useMemo(() => (kategoriData || []).find((k) => k.id === kategoriId), [kategoriData, kategoriId]);
  const subKategoriList = kategoriObj?.subKategori || [];

  const defaultTarget = getDefaultTargetByKategori(kategoriId);
  const currentTarget = targetHarian[kategoriId] || defaultTarget;

  const generateCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const totalDays = lastDay.getDate();
    const days = [];
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({ day: d, date: dateStr });
    }
    return days;
  };

  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextYear = () => setCurrentMonth(new Date(currentMonth.getFullYear() + 1, currentMonth.getMonth(), 1));
  const prevYear = () => setCurrentMonth(new Date(currentMonth.getFullYear() - 1, currentMonth.getMonth(), 1));
  const goToToday = () => { const now = new Date(); setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1)); setSelectedDate(now.toISOString().split("T")[0]); };
  const handleMonthChange = (e) => setCurrentMonth(new Date(currentMonth.getFullYear(), parseInt(e.target.value), 1));
  const handleYearChange = (e) => setCurrentMonth(new Date(parseInt(e.target.value), currentMonth.getMonth(), 1));

  const logDiTanggal = selectedDate ? logHarian[selectedDate] || [] : [];
  const logDiTanggalByKategori = logDiTanggal.filter((l) => l.kategoriId === kategoriId && l.subKategoriId === subKategoriId);

  const logBulanIni = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const prefix = `${year}-${String(month + 1).padStart(2, "0")}`;
    const result = [];
    Object.entries(logHarian || {}).forEach(([tanggal, list]) => {
      if (!tanggal.startsWith(prefix)) return;
      (list || []).forEach((log) => {
        if (log.kategoriId !== kategoriId) return;
        if (subKategoriId && log.subKategoriId !== subKategoriId) return;
        if (filterSubKategori !== "all" && log.subKategoriId !== filterSubKategori) return;
        if (filterTool !== "all" && log.toolId !== filterTool) return;
        result.push({ ...log, tanggal });
      });
    });
    return result.sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  }, [logHarian, currentMonth, kategoriId, subKategoriId, filterSubKategori, filterTool]);

  const getLabelByLog = (log) => {
    const parts = [];
    const sub = subKategoriList.find((s) => s.id === log.subKategoriId);
    if (sub) parts.push(sub.nama);
    if (sub && log.toolId) { const tool = (sub.tools || []).find((t) => t.id === log.toolId); if (tool) parts.push(tool.nama); }
    if (sub && log.toolId && log.fiturId) { const tool = (sub.tools || []).find((t) => t.id === log.toolId); const fitur = (tool?.fitur || []).find((f) => f.id === log.fiturId); if (fitur) parts.push(fitur.nama); }
    if (log.partId) { const tool = (sub?.tools || []).find((t) => t.id === log.toolId); const fitur = (tool?.fitur || []).find((f) => f.id === log.fiturId); const part = (fitur?.parts || []).find((p) => p.id === log.partId); if (part) parts.push(part.nama); }
    return parts.join(" → ") || "-";
  };

  const handleDateClick = (date) => {
    if (date === selectedDate) { setSelectedDate(null); setShowForm(false); setEditingLogId(null); return; }
    setSelectedDate(date); setShowForm(false); setEditingLogId(null); setErrorMsg(""); resetFormData();
  };

  const resetFormData = () => {
    setFormData({ subKategoriId: subKategoriId || subKategoriList[0]?.id || "", toolId: "", fiturId: "", partId: "", catatan: "", gdriveUrl: "" });
  };

  const subKategoriTerpilih = subKategoriList.find((s) => s.id === formData.subKategoriId);
  const toolList = subKategoriTerpilih?.tools || [];
  const toolTerpilih = toolList.find((t) => t.id === formData.toolId);
  const fiturList = toolTerpilih?.fitur || [];
  const fiturTerpilih = fiturList.find((f) => f.id === formData.fiturId);
  const partList = fiturTerpilih?.parts || [];

  const handleBukaFormTambah = () => { resetFormData(); setEditingLogId(null); setErrorMsg(""); setShowForm(true); };
  const handleEdit = (log) => { setFormData({ subKategoriId: log.subKategoriId || "", toolId: log.toolId || "", fiturId: log.fiturId || "", partId: log.partId || "", catatan: log.catatan || "", gdriveUrl: log.gdriveUrl || "" }); setEditingLogId(log.id); setErrorMsg(""); setShowForm(true); };

  const handleSimpan = () => {
    setErrorMsg("");
    if (!formData.subKategoriId) { setErrorMsg("Pilih sub-kategori dulu."); return; }
    if (!formData.toolId) { setErrorMsg("Pilih tool dulu."); return; }
    if (!formData.catatan.trim() && !formData.gdriveUrl.trim()) { setErrorMsg("Isi catatan atau link GDrive."); return; }

    const updated = JSON.parse(JSON.stringify(logHarian || {}));
    if (!updated[selectedDate]) updated[selectedDate] = [];

    const newLog = { id: editingLogId || `log_${Date.now()}`, kategoriId, subKategoriId: formData.subKategoriId, toolId: formData.toolId, fiturId: formData.fiturId || "", partId: formData.partId || "", catatan: formData.catatan, gdriveUrl: formData.gdriveUrl, telegramMessageId: "", sumber: "kalender", updatedAt: new Date().toISOString() };

    if (editingLogId) updated[selectedDate] = updated[selectedDate].map((l) => l.id === editingLogId ? newLog : l);
    else updated[selectedDate].push(newLog);

    onUpdateLog(updated, { action: editingLogId ? "edit" : "add", log: newLog });
    setShowForm(false); setEditingLogId(null); resetFormData();
  };

  const handleHapus = (log) => {
    if (!confirm("Hapus catatan belajar ini? Yang di halaman materi juga bakal kehapus.")) return;
    const updated = JSON.parse(JSON.stringify(logHarian || {}));
    updated[selectedDate] = (updated[selectedDate] || []).filter((l) => l.id !== log.id);
    if (updated[selectedDate].length === 0) delete updated[selectedDate];
    onUpdateLog(updated, { action: "delete", log });
  };

  const handleBukaEditTarget = () => { setTargetInput(currentTarget.target); setEditTargetMode(true); };
  const handleSimpanTarget = () => {
    const t = parseInt(targetInput);
    if (!t || t <= 0) return;
    onUpdateTarget({ ...targetHarian, [kategoriId]: { ...currentTarget, target: t } });
    setEditTargetMode(false);
  };

  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const currentYear = new Date().getFullYear();
  const years = []; for (let y = currentYear - 1; y <= currentYear + 5; y++) years.push(y);
  const todayStr = new Date().toISOString().split("T")[0];

  const getLogsByDate = (date) => {
    const logs = logHarian[date] || [];
    return logs.filter((l) => l.kategoriId === kategoriId && (!subKategoriId || l.subKategoriId === subKategoriId));
  };

  const getWarnaLog = (log) => {
    const path = [log.kategoriId, log.subKategoriId, log.toolId];
    if (log.fiturId) path.push(log.fiturId);
    if (log.partId) path.push(log.partId);
    return getWarnaToolByPath(kategoriData, path);
  };

  const hitungLogHariIni = logDiTanggalByKategori.length;
  const targetTercapai = hitungLogHariIni >= (currentTarget.target || 1);

  const allToolsInKategori = useMemo(() => {
    const result = [];
    subKategoriList.forEach((sub) => {
      (sub.tools || []).forEach((t) => result.push({ ...t, subKategoriId: sub.id, subKategoriNama: sub.nama }));
    });
    return result;
  }, [subKategoriList]);

  return (
    <div className="space-y-4">
      {subKategoriSiblings.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {subKategoriSiblings.map((sib) => (
            <button key={sib.id} className="btn btn-outline btn-sm text-gray-700 hover:bg-blue-50" onClick={() => onPindahSubKategori && onPindahSubKategori(sib.id)}>
              <ArrowRight size={14} className="mr-1 rotate-180" /> Pindah ke {sib.nama}
            </button>
          ))}
        </div>
      )}

      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700 flex items-center gap-1"><Target size={16} /> Target Harian --- {getLabelKategoriById(kategoriData, kategoriId)}</span>
              {!editTargetMode ? (
                <>
                  <span className="text-sm font-bold text-blue-700">{currentTarget.target} {currentTarget.satuan}</span>
                  <button className="btn btn-ghost btn-xs text-gray-500" onClick={handleBukaEditTarget} title="Edit target"><Pencil size={14} /></button>
                </>
              ) : (
                <>
                  <input type="number" min="1" className="input input-bordered input-xs w-16 text-gray-800 bg-white" value={targetInput} onChange={(e) => setTargetInput(e.target.value)} autoFocus />
                  <span className="text-xs text-gray-600">{currentTarget.satuan}</span>
                  <button className="btn btn-primary btn-xs" onClick={handleSimpanTarget}><Save size={14} /></button>
                  <button className="btn btn-ghost btn-xs" onClick={() => setEditTargetMode(false)}><X size={14} /></button>
                </>
              )}
            </div>
            <span className="text-xs text-gray-500">
              {hitungLogHariIni > 0 && (<>Hari ini: {hitungLogHariIni}/{currentTarget.target} {targetTercapai && <CheckCircle2 size={14} className="inline text-green-600 ml-1" />}</>)}
            </span>
          </div>
        </div>
      </div>

      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
            <div className="flex items-center gap-1">
              <button className="btn btn-ghost btn-sm text-gray-700" onClick={prevYear}>«</button>
              <button className="btn btn-ghost btn-sm text-gray-700" onClick={prevMonth}>‹</button>
            </div>
            <div className="flex items-center gap-2">
              <select className="select select-bordered select-sm text-gray-800 bg-white" value={currentMonth.getMonth()} onChange={handleMonthChange}>
                {monthNames.map((name, idx) => <option key={idx} value={idx}>{name}</option>)}
              </select>
              <select className="select select-bordered select-sm text-gray-800 bg-white" value={currentMonth.getFullYear()} onChange={handleYearChange}>
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-1">
              <button className="btn btn-ghost btn-sm text-gray-700" onClick={nextMonth}>›</button>
              <button className="btn btn-ghost btn-sm text-gray-700" onClick={nextYear}>»</button>
            </div>
          </div>

          <div className="flex justify-center mb-3">
            <button className="btn btn-outline btn-xs text-gray-700" onClick={goToToday}><Calendar size={14} className="mr-1"/> Hari Ini</button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {dayNames.map((day) => <div key={day} className="text-center text-xs font-bold text-gray-600 bg-gray-100 py-2 rounded">{day}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {generateCalendar().map((item, idx) => {
              if (!item) return <div key={idx} className="aspect-square" />;
              const isSelected = item.date === selectedDate;
              const isToday = item.date === todayStr;
              const logs = getLogsByDate(item.date);
              const holiday = HOLIDAYS[item.date];
              const isHolidayDate = !!holiday;

              let boxClass = "bg-white text-gray-800 border-gray-200 hover:bg-gray-100";
              if (isToday && !isSelected && !isHolidayDate) boxClass = "bg-yellow-50 text-gray-900 border-yellow-300 font-bold";
              if (isHolidayDate && !isSelected) boxClass = "bg-red-600 text-white border-red-700 font-bold";
              if (isSelected) boxClass = "bg-blue-100 text-blue-900 border-2 border-blue-600 font-bold ring-1 ring-blue-300";

              return (
                <button key={item.date} className={`aspect-square rounded border ${boxClass} relative transition text-sm p-1 flex flex-col`} onClick={() => handleDateClick(item.date)} title={holiday || ""}>
                  <span className="text-xs">{item.day}</span>
                  <div className="flex-1 flex flex-col gap-0.5 mt-0.5 overflow-hidden">
                    {logs.slice(0, 3).map((log, i) => {
                      const warna = getWarnaLog(log);
                      const style = getWarnaStyle(warna);
                      return (
                        <div key={log.id || i} className={`${style.bg} ${style.text} text-[8px] px-1 rounded truncate leading-tight`} title={getLabelByLog(log)}>
                          {log.toolId || log.fiturId || "•"}
                        </div>
                      );
                    })}
                    {logs.length > 3 && <span className="text-[8px] text-gray-500 leading-none">+{logs.length - 3}</span>}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3 mt-4 text-xs text-gray-600">
            <div className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-red-600 border border-red-700" /><span>Libur Nasional</span></div>
            <div className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-yellow-50 border border-yellow-300" /><span>Hari Ini</span></div>
            <div className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-blue-100 border-2 border-blue-600" /><span>Tanggal Dipilih</span></div>
            <div className="flex items-center gap-1"><span className="w-4 h-2 rounded bg-purple-500" /><span>Bar = catatan belajar</span></div>
          </div>
        </div>
      </div>

      {selectedDate && (
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-4">
            <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
              <div>
                <h3 className="text-base font-bold text-gray-800 flex items-center gap-1"><Calendar size={16}/> {formatTanggal(selectedDate, "panjang")}</h3>
                <p className="text-xs text-gray-500 mt-1">{hitungLogHariIni} catatan • Target {currentTarget.target} {currentTarget.satuan} {targetTercapai && <span className="text-green-600 font-bold ml-1 flex items-center inline-flex"><CheckCircle2 size={12} className="mr-0.5"/> Tercapai</span>}</p>
              </div>
              {!showForm && <button className="btn btn-primary btn-sm" onClick={handleBukaFormTambah}><Plus size={16} className="mr-1"/> Tambah Catatan</button>}
            </div>

            {showForm && (
              <div className="bg-blue-50 rounded p-3 space-y-3 border border-blue-200 mb-3">
                <p className="text-xs font-semibold text-blue-700 flex items-center gap-1">{editingLogId ? <><Pencil size={14}/> Edit Catatan Belajar</> : <><Plus size={14}/> Tambah Catatan Belajar</>}</p>
                
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Sub-Kategori</label>
                  <select className="select select-bordered select-sm w-full text-gray-800 bg-white" value={formData.subKategoriId} onChange={(e) => setFormData({ ...formData, subKategoriId: e.target.value, toolId: "", fiturId: "", partId: "" })}>
                    <option value="">-- Pilih Sub-Kategori --</option>
                    {subKategoriList.map((s) => <option key={s.id} value={s.id}>{s.nama}</option>)}
                  </select>
                </div>

                {formData.subKategoriId && (
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Tool</label>
                    <select className="select select-bordered select-sm w-full text-gray-800 bg-white" value={formData.toolId} onChange={(e) => setFormData({ ...formData, toolId: e.target.value, fiturId: "", partId: "" })}>
                      <option value="">-- Pilih Tool --</option>
                      {toolList.map((t) => <option key={t.id} value={t.id}>{t.nama}</option>)}
                    </select>
                  </div>
                )}

                {formData.toolId && fiturList.length > 0 && (
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Fitur / Materi</label>
                    <select className="select select-bordered select-sm w-full text-gray-800 bg-white" value={formData.fiturId} onChange={(e) => setFormData({ ...formData, fiturId: e.target.value, partId: "" })}>
                      <option value="">-- Pilih Fitur --</option>
                      {fiturList.map((f) => <option key={f.id} value={f.id}>{f.nama}</option>)}
                    </select>
                  </div>
                )}

                {formData.fiturId && partList.length > 0 && (
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Part</label>
                    <select className="select select-bordered select-sm w-full text-gray-800 bg-white" value={formData.partId} onChange={(e) => setFormData({ ...formData, partId: e.target.value })}>
                      <option value="">-- Pilih Part --</option>
                      {partList.map((p) => <option key={p.id} value={p.id}>{p.nama}</option>)}
                    </select>
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block flex items-center gap-1"><FileText size={14}/> Catatan</label>
                  <textarea className="textarea textarea-bordered w-full text-sm text-gray-800 bg-white" rows="3" placeholder="Catatan belajar hari ini..." value={formData.catatan} onChange={(e) => setFormData({ ...formData, catatan: e.target.value })} />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block flex items-center gap-1"><LinkIcon size={14}/> Link Google Drive (opsional)</label>
                  <input type="url" className="input input-bordered input-sm w-full text-gray-800 bg-white" placeholder="https://drive.google.com/..." value={formData.gdriveUrl} onChange={(e) => setFormData({ ...formData, gdriveUrl: e.target.value })} />
                  <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1"><Info size={12}/> Nanti bisa juga via Telegram.</p>
                </div>

                {errorMsg && <div className="alert alert-error py-2 text-xs flex items-center gap-1"><AlertTriangle size={14}/> {errorMsg}</div>}

                <div className="flex gap-2">
                  <button className="btn btn-primary btn-sm flex-1" onClick={handleSimpan}>{editingLogId ? <><Save size={16} className="mr-1"/> Simpan</> : <><Plus size={16} className="mr-1"/> Tambah</>}</button>
                  <button className="btn btn-ghost btn-sm text-gray-700" onClick={() => { setShowForm(false); setEditingLogId(null); }}>Batal</button>
                </div>
              </div>
            )}

            {!showForm && logDiTanggalByKategori.length === 0 && (
              <div className="text-center py-6 text-gray-400">
                <FileText size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">Belum ada catatan belajar di tanggal ini.</p>
              </div>
            )}

            {!showForm && logDiTanggalByKategori.length > 0 && (
              <div className="space-y-2">
                {logDiTanggalByKategori.map((log, idx) => {
                  const warna = getWarnaLog(log);
                  const style = getWarnaStyle(warna);
                  return (
                    <div key={log.id || idx} className="p-3 rounded border border-gray-200 bg-gray-50">
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`w-2 h-2 rounded-full ${style.bg}`} />
                            <p className="text-sm font-semibold text-gray-800">{getLabelByLog(log)}</p>
                          </div>
                          {log.catatan && <p className="text-xs text-gray-700 whitespace-pre-wrap mt-1 bg-white p-2 rounded border border-gray-200 flex items-start gap-1"><MessageSquare size={12} className="mt-0.5 shrink-0"/> {log.catatan}</p>}
                          {log.gdriveUrl && <a href={log.gdriveUrl} target="_blank" rel="noopener noreferrer" className="text-xs link link-primary mt-1 inline-flex items-center gap-1"><FolderOpen size={12}/> GDrive</a>}
                        </div>
                        <div className="flex gap-1" data-html2canvas-ignore="true">
                          <button className="btn btn-ghost btn-xs" onClick={() => handleEdit(log)} title="Edit"><Pencil size={14} /></button>
                          <button className="btn btn-ghost btn-xs text-red-500" onClick={() => handleHapus(log)} title="Hapus"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          <div className="flex justify-between items-center flex-wrap gap-2 mb-3">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1"><FolderOpen size={16}/> Semua Catatan Belajar --- {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()} ({logBulanIni.length})</h3>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs text-gray-500">Filter:</span>
              <select className="select select-bordered select-xs text-gray-800 bg-white" value={filterSubKategori} onChange={(e) => { setFilterSubKategori(e.target.value); setFilterTool("all"); }}>
                <option value="all">Semua Sub-Kategori</option>
                {subKategoriList.map((s) => <option key={s.id} value={s.id}>{s.nama}</option>)}
              </select>
              <select className="select select-bordered select-xs text-gray-800 bg-white" value={filterTool} onChange={(e) => setFilterTool(e.target.value)}>
                <option value="all">Semua Tool</option>
                {allToolsInKategori.filter((t) => filterSubKategori === "all" || t.subKategoriId === filterSubKategori).map((t) => <option key={t.id} value={t.id}>{t.nama}</option>)}
              </select>
              {(filterSubKategori !== "all" || filterTool !== "all") && (
                <button className="btn btn-ghost btn-xs text-gray-500" onClick={() => { setFilterSubKategori("all"); setFilterTool("all"); }}><X size={14} /> Reset</button>
              )}
            </div>
          </div>

          {logBulanIni.length === 0 ? (
            <p className="text-xs text-gray-400 italic text-center py-4">Belum ada catatan belajar di bulan ini.</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {logBulanIni.map((log, idx) => {
                const warna = getWarnaLog(log);
                const style = getWarnaStyle(warna);
                return (
                  <div key={`${log.tanggal}_${log.id || idx}`} className="p-3 rounded border border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100 transition" onClick={() => { setSelectedDate(log.tanggal); setShowForm(false); setEditingLogId(null); }}>
                    <div className="flex items-start gap-2">
                      <span className={`w-2 h-2 rounded-full ${style.bg} mt-1.5 flex-shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <p className="text-sm font-semibold text-gray-800">{getLabelByLog(log)}</p>
                          <span className="text-xs text-gray-500 flex-shrink-0 flex items-center gap-1"><Calendar size={12}/> {formatTanggal(log.tanggal, "pendek")}</span>
                        </div>
                        {log.catatan && <p className="text-xs text-gray-600 mt-1 whitespace-pre-wrap">{log.catatan.length > 150 ? log.catatan.substring(0, 150) + "..." : log.catatan}</p>}
                        {log.gdriveUrl && <a href={log.gdriveUrl} target="_blank" rel="noopener noreferrer" className="text-xs link link-primary mt-1 inline-flex items-center gap-1" onClick={(e) => e.stopPropagation()}><LinkIcon size={12}/> GDrive</a>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {!selectedDate && (
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-6 text-center text-gray-400">
            <Calendar size={40} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Klik tanggal di kalender untuk tambah / lihat catatan. Atau klik catatan di list bawah.</p>
          </div>
        </div>
      )}
    </div>
  );
}