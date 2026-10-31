// components/BelajarUpload.js
"use client";

import { useState, useEffect, useMemo } from "react";
import { formatTanggal } from "@/lib/belajarData";
import { BookOpen, Pencil, Plus, Save, Inbox, MessageSquare, FolderOpen, Link as LinkIcon, AlertTriangle, CheckCircle2, Eye, EyeOff, X, List, Calendar, Trash2 } from "lucide-react";

export default function BelajarUpload({ item, onUpdate, path = [], kategoriId, kategoriData = [], logHarian = {}, onUpdateLog, today, mode = "hasil-belajar" }) {
  const isMateriMode = mode === "materi";

  const [materi, setMateri] = useState(item?.materi || "");
  const [isEditingMateri, setIsEditingMateri] = useState(false);
  const [formData, setFormData] = useState({ subKategoriId: "", toolId: "", fiturId: "", partId: "", catatan: "", gdriveUrl: "" });
  const [showForm, setShowForm] = useState(false);
  const [editingLogId, setEditingLogId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => { setMateri(item?.materi || ""); setIsEditingMateri(false); }, [item?.id]);

  const kategoriObj = useMemo(() => (kategoriData || []).find((k) => k.id === kategoriId), [kategoriData, kategoriId]);
  const subKategoriList = kategoriObj?.subKategori || [];

  const prefillFromPath = () => { setFormData({ subKategoriId: path[1] || "", toolId: path[2] || "", fiturId: path[3] || "", partId: path[4] || "", catatan: "", gdriveUrl: "" }); };

  useEffect(() => {
    if (isMateriMode) return;
    if (!today) return;
    const safeLog = logHarian || {};
    const entries = safeLog[today] || [];
    const matched = entries.find((e) => (e.subKategoriId || "") === (path[1] || "") && (e.toolId || "") === (path[2] || "") && (e.fiturId || "") === (path[3] || "") && (e.partId || "") === (path[4] || ""));
    if (matched && matched.catatan && !formData.catatan) {
      setFormData((prev) => ({ ...prev, catatan: matched.catatan, gdriveUrl: matched.gdriveUrl || "" }));
    }
  }, [logHarian, today, path.join("/"), isMateriMode]);

  useEffect(() => { prefillFromPath(); setShowForm(false); setEditingLogId(null); setErrorMsg(""); }, [path.join("/")]);

  const riwayat = useMemo(() => {
    const result = [];
    if (!logHarian) return result;
    
    Object.entries(logHarian).forEach(([tanggal, list]) => {
      // PENGAMAN: Kalau list bukan array (misal kosong atau object), skip aja biar nggak crash
      if (!Array.isArray(list)) return; 
      
      list.forEach((log) => {
        if (!log) return;
        if (log.kategoriId !== kategoriId) return;
        if ((log.subKategoriId || "") !== (path[1] || "")) return;
        if ((log.toolId || "") !== (path[2] || "")) return;
        if ((log.fiturId || "") !== (path[3] || "")) return;
        if ((log.partId || "") !== (path[4] || "")) return;
        result.push({ ...log, tanggal });
      });
    });
    return result.sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  }, [logHarian, kategoriId, path]);

  const subKategoriTerpilih = subKategoriList.find((s) => s.id === formData.subKategoriId);
  const toolList = subKategoriTerpilih?.tools || [];
  const toolTerpilih = toolList.find((t) => t.id === formData.toolId);
  const fiturList = toolTerpilih?.fitur || [];
  const fiturTerpilih = fiturList.find((f) => f.id === formData.fiturId);
  const partList = fiturTerpilih?.parts || [];

  const handleBukaFormTambah = () => { prefillFromPath(); setEditingLogId(null); setErrorMsg(""); setShowForm(true); };

  const handleEdit = (log) => { setFormData({ subKategoriId: log.subKategoriId || "", toolId: log.toolId || "", fiturId: log.fiturId || "", partId: log.partId || "", catatan: log.catatan || "", gdriveUrl: log.gdriveUrl || "" }); setEditingLogId(log.id); setErrorMsg(""); setShowForm(true); };

  const handleSimpan = () => {
    setErrorMsg("");
    if (!formData.subKategoriId) { setErrorMsg("Pilih sub-kategori dulu."); return; }
    if (!formData.toolId) { setErrorMsg("Pilih tool dulu."); return; }
    if (!formData.catatan.trim() && !formData.gdriveUrl.trim()) { setErrorMsg("Isi catatan atau link GDrive."); return; }
    if (!today) { setErrorMsg("Tanggal belum siap."); return; }

    const updated = JSON.parse(JSON.stringify(logHarian || {}));
    if (!updated[today] || !Array.isArray(updated[today])) updated[today] = [];

    const newLog = { id: editingLogId || `log_${Date.now()}`, kategoriId, subKategoriId: formData.subKategoriId, toolId: formData.toolId, fiturId: formData.fiturId || "", partId: formData.partId || "", catatan: formData.catatan, gdriveUrl: formData.gdriveUrl, telegramMessageId: "", sumber: "kalender", updatedAt: new Date().toISOString() };

    if (editingLogId) updated[today] = updated[today].map((l) => (l.id === editingLogId ? newLog : l));
    else updated[today].push(newLog);

    if (onUpdateLog) onUpdateLog(updated, { action: editingLogId ? "edit" : "add", log: newLog });

    setShowForm(false); setEditingLogId(null); prefillFromPath();
    setSaved(true); setTimeout(() => setSaved(false), 2500);
  };

  const handleHapus = (log) => {
    if (!confirm("Hapus catatan ini?")) return;
    const updated = JSON.parse(JSON.stringify(logHarian || {}));
    if (updated[log.tanggal] && Array.isArray(updated[log.tanggal])) {
      updated[log.tanggal] = updated[log.tanggal].filter((l) => l.id !== log.id);
      if (updated[log.tanggal].length === 0) delete updated[log.tanggal];
      if (onUpdateLog) onUpdateLog(updated, { action: "delete", log });
    }
  };

  const handleSimpanMateri = () => { onUpdate({ materi }); setIsEditingMateri(false); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const getLabelByLog = (log) => {
    const parts = [];
    const sub = subKategoriList.find((s) => s.id === log.subKategoriId);
    if (sub) parts.push(sub.nama);
    if (sub && log.toolId) { const tool = (sub.tools || []).find((t) => t.id === log.toolId); if (tool) parts.push(tool.nama); }
    if (log.fiturId) { const tool = (sub?.tools || []).find((t) => t.id === log.toolId); const fitur = (tool?.fitur || []).find((f) => f.id === log.fiturId); if (fitur) parts.push(fitur.nama); }
    if (log.partId) { const tool = (sub?.tools || []).find((t) => t.id === log.toolId); const fitur = (tool?.fitur || []).find((f) => f.id === log.fiturId); const part = (fitur?.parts || []).find((p) => p.id === log.partId); if (part) parts.push(part.nama); }
    return parts.join(" → ") || "-";
  };

  if (isMateriMode) {
    const hasMateri = !!item?.materi;
    return (
      <div className="space-y-4">
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-4">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="text-base font-bold text-gray-800 flex items-center gap-1"><BookOpen size={16}/> Materi</h3>
                <p className="text-xs text-gray-500 mt-1">Ringkasan referensi. Lo bisa edit.</p>
              </div>
              {!isEditingMateri && <button className="btn btn-ghost btn-xs text-gray-600 flex items-center gap-1" onClick={() => setIsEditingMateri(true)}>{hasMateri ? <><Pencil size={14}/> Edit</> : <><Plus size={14}/> Tambah</>}</button>}
            </div>
            {!isEditingMateri && hasMateri && <p className="text-sm text-gray-800 whitespace-pre-wrap bg-gray-50 p-3 rounded border border-gray-200">{item.materi}</p>}
            {!isEditingMateri && !hasMateri && <div className="text-center py-6 text-gray-400"><Inbox size={32} className="mx-auto mb-2 opacity-50"/><p className="text-sm">Belum ada materi.</p></div>}
            {isEditingMateri && (
              <div className="space-y-3">
                <textarea className="textarea textarea-bordered w-full text-sm text-gray-800 bg-white" rows="10" placeholder="Tulis materi..." value={materi} onChange={(e) => setMateri(e.target.value)} autoFocus />
                <div className="flex gap-2"><button className="btn btn-primary btn-sm flex-1 flex items-center justify-center gap-1" onClick={handleSimpanMateri}><Save size={16}/> Simpan</button><button className="btn btn-ghost btn-sm text-gray-700" onClick={() => { setMateri(item?.materi || ""); setIsEditingMateri(false); }}>Batal</button></div>
              </div>
            )}
            {saved && <div className="alert alert-success mt-3 py-2 text-xs flex items-center gap-1"><CheckCircle2 size={14}/> Disimpan!</div>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
            <div>
              <h3 className="text-base font-bold text-gray-800 flex items-center gap-1"><MessageSquare size={16}/> Hasil Belajar --- {formatTanggal(today, "panjang")}</h3>
              <p className="text-xs text-gray-500 mt-1">Catatan belajar lo. Otomatis muncul di Kalender.</p>
            </div>
            {!showForm && <button className="btn btn-primary btn-sm flex items-center gap-1" onClick={handleBukaFormTambah}><Plus size={16}/> Tambah Catatan</button>}
          </div>

          {showForm && (
            <div className="bg-blue-50 rounded p-3 space-y-3 border border-blue-200">
              <p className="text-xs font-semibold text-blue-700 flex items-center gap-1">{editingLogId ? <><Pencil size={14}/> Edit Catatan</> : <><Plus size={14}/> Tambah Catatan</>}</p>
              
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
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Fitur</label>
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
                <label className="text-xs font-semibold text-gray-600 mb-1 block flex items-center gap-1"><MessageSquare size={14}/> Catatan</label>
                <textarea className="textarea textarea-bordered w-full text-sm text-gray-800 bg-white" rows="3" placeholder="Catatan belajar..." value={formData.catatan} onChange={(e) => setFormData({ ...formData, catatan: e.target.value })} />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block flex items-center gap-1"><FolderOpen size={14}/> Link Google Drive (opsional)</label>
                <input type="url" className="input input-bordered input-sm w-full text-gray-800 bg-white" placeholder="https://drive.google.com/..." value={formData.gdriveUrl} onChange={(e) => setFormData({ ...formData, gdriveUrl: e.target.value })} />
              </div>

              {errorMsg && <div className="alert alert-error py-2 text-xs flex items-center gap-1"><AlertTriangle size={14}/> {errorMsg}</div>}

              <div className="flex gap-2">
                <button className="btn btn-primary btn-sm flex-1 flex items-center justify-center gap-1" onClick={handleSimpan}>{editingLogId ? <><Save size={16}/> Simpan</> : <><Plus size={16}/> Tambah</>}</button>
                <button className="btn btn-ghost btn-sm text-gray-700" onClick={() => { setShowForm(false); setEditingLogId(null); }}>Batal</button>
              </div>
            </div>
          )}

          {!showForm && riwayat.length === 0 && (
            <div className="text-center py-6 text-gray-400"><Inbox size={32} className="mx-auto mb-2 opacity-50"/><p className="text-sm">Belum ada catatan. Kirim via Telegram atau klik "+ Tambah Catatan".</p></div>
          )}

          {saved && !showForm && <div className="alert alert-success mt-3 py-2 text-xs flex items-center gap-1"><CheckCircle2 size={14}/> Berhasil disimpan!</div>}
        </div>
      </div>

      {riwayat.length > 0 && (
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-4">
            <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-1"><List size={16}/> Riwayat ({riwayat.length})</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {riwayat.map((log, idx) => (
                <div key={log.id || idx} className="p-3 rounded border border-gray-200 bg-gray-50">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">{getLabelByLog(log)}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1"><Calendar size={12}/> {formatTanggal(log.tanggal, "pendek")} {log.sumber === "telegram" && <span className="ml-2 badge badge-ghost badge-xs">dari Telegram</span>}</p>
                      {log.catatan && <p className="text-sm text-gray-700 whitespace-pre-wrap mt-2 bg-white p-2 rounded border border-gray-200 flex items-start gap-1"><MessageSquare size={12} className="mt-0.5 shrink-0"/> {log.catatan}</p>}
                      {log.gdriveUrl && <a href={log.gdriveUrl} target="_blank" rel="noopener noreferrer" className="text-xs link link-primary mt-1 inline-flex items-center gap-1"><LinkIcon size={12}/> GDrive</a>}
                    </div>
                    <div className="flex gap-1" data-html2canvas-ignore="true">
                      <button className="btn btn-ghost btn-xs" onClick={() => handleEdit(log)} title="Edit"><Pencil size={14}/></button>
                      <button className="btn btn-ghost btn-xs text-red-500" onClick={() => handleHapus(log)} title="Hapus"><Trash2 size={14}/></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}