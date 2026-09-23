// components/BelajarUpload.js
"use client";

import { useState, useEffect, useMemo } from "react";
import { formatTanggal } from "@/lib/belajarData";

export default function BelajarUpload({
  item,
  onUpdate,
  path = [],
  kategoriId,
  kategoriData = [],
  logHarian = {},
  onUpdateLog,
  today,
  mode = "hasil-belajar",
}) {
  const isMateriMode = mode === "materi";

  // ========== STATE MATERI ==========
  const [materi, setMateri] = useState(item?.materi || "");
  const [isEditingMateri, setIsEditingMateri] = useState(false);

  // ========== STATE HASIL BELAJAR (FORM KAYAK KALENDER) ==========
  const [formData, setFormData] = useState({
    subKategoriId: "",
    toolId: "",
    fiturId: "",
    partId: "",
    catatan: "",
    gdriveUrl: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [editingLogId, setEditingLogId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [saved, setSaved] = useState(false);

  // Sync state kalau item berubah
  useEffect(() => {
    setMateri(item?.materi || "");
    setIsEditingMateri(false);
  }, [item?.id]);

  // ========== DATA KATEGORI (buat dropdown) ==========
  const kategoriObj = useMemo(
    () => (kategoriData || []).find((k) => k.id === kategoriId),
    [kategoriData, kategoriId]
  );
  const subKategoriList = kategoriObj?.subKategori || [];

  // Pre-fill dropdown dari URL (path)
  const prefillFromPath = () => {
    setFormData({
      subKategoriId: path[1] || "",
      toolId: path[2] || "",
      fiturId: path[3] || "",
      partId: path[4] || "",
      catatan: "",
      gdriveUrl: "",
    });
  };

  useEffect(() => {
    prefillFromPath();
    setShowForm(false);
    setEditingLogId(null);
    setErrorMsg("");
  }, [path.join("/")]);

  // ========== RIWAYAT (log yang match leaf ini) ==========
  const riwayat = useMemo(() => {
    const result = [];
    Object.entries(logHarian || {}).forEach(([tanggal, list]) => {
      (list || []).forEach((log) => {
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

  // ========== DROPDOWN DINAMIS ==========
  const subKategoriTerpilih = subKategoriList.find((s) => s.id === formData.subKategoriId);
  const toolList = subKategoriTerpilih?.tools || [];
  const toolTerpilih = toolList.find((t) => t.id === formData.toolId);
  const fiturList = toolTerpilih?.fitur || [];
  const fiturTerpilih = fiturList.find((f) => f.id === formData.fiturId);
  const partList = fiturTerpilih?.parts || [];

  // ========== BUKA FORM TAMBAH ==========
  const handleBukaFormTambah = () => {
    prefillFromPath();
    setEditingLogId(null);
    setErrorMsg("");
    setShowForm(true);
  };

  // ========== BUKA FORM EDIT ==========
  const handleEdit = (log) => {
    setFormData({
      subKategoriId: log.subKategoriId || "",
      toolId: log.toolId || "",
      fiturId: log.fiturId || "",
      partId: log.partId || "",
      catatan: log.catatan || "",
      gdriveUrl: log.gdriveUrl || "",
    });
    setEditingLogId(log.id);
    setErrorMsg("");
    setShowForm(true);
  };

  // ========== SIMPAN HASIL BELAJAR ==========
  const handleSimpan = () => {
    setErrorMsg("");
    if (!formData.subKategoriId) { setErrorMsg("Pilih sub-kategori dulu."); return; }
    if (!formData.toolId) { setErrorMsg("Pilih tool dulu."); return; }
    if (!formData.catatan.trim() && !formData.gdriveUrl.trim()) {
      setErrorMsg("Isi catatan atau link GDrive."); return;
    }
    if (!today) { setErrorMsg("Tanggal belum siap. Coba refresh."); return; }

    const updated = JSON.parse(JSON.stringify(logHarian || {}));
    if (!updated[today]) updated[today] = [];

    const newLog = {
      id: editingLogId || `log_${Date.now()}`,
      kategoriId,
      subKategoriId: formData.subKategoriId,
      toolId: formData.toolId,
      fiturId: formData.fiturId || "",
      partId: formData.partId || "",
      catatan: formData.catatan,
      gdriveUrl: formData.gdriveUrl,
      telegramMessageId: "",
      sumber: "kalender",
      updatedAt: new Date().toISOString(),
    };

    if (editingLogId) {
      updated[today] = updated[today].map((l) => (l.id === editingLogId ? newLog : l));
    } else {
      updated[today].push(newLog);
    }

    if (onUpdateLog) {
      onUpdateLog(updated, { action: editingLogId ? "edit" : "add", log: newLog });
    }

    setShowForm(false);
    setEditingLogId(null);
    prefillFromPath();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // ========== HAPUS ==========
  const handleHapus = (log) => {
    if (!confirm("Hapus catatan ini? Yang di kalender juga bakal kehapus.")) return;
    const updated = JSON.parse(JSON.stringify(logHarian || {}));
    updated[log.tanggal] = (updated[log.tanggal] || []).filter((l) => l.id !== log.id);
    if (updated[log.tanggal].length === 0) delete updated[log.tanggal];
    if (onUpdateLog) onUpdateLog(updated, { action: "delete", log });
  };

  // ========== SIMPAN MATERI ==========
  const handleSimpanMateri = () => {
    onUpdate({ materi });
    setIsEditingMateri(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // ========== GET LABEL UNTUK RIWAYAT ==========
  const getLabelByLog = (log) => {
    const parts = [];
    const sub = subKategoriList.find((s) => s.id === log.subKategoriId);
    if (sub) parts.push(sub.nama);
    if (sub && log.toolId) {
      const tool = (sub.tools || []).find((t) => t.id === log.toolId);
      if (tool) parts.push(tool.nama);
    }
    if (sub && log.toolId && log.fiturId) {
      const tool = (sub.tools || []).find((t) => t.id === log.toolId);
      const fitur = (tool?.fitur || []).find((f) => f.id === log.fiturId);
      if (fitur) parts.push(fitur.nama);
    }
    if (log.partId) {
      const tool = (sub?.tools || []).find((t) => t.id === log.toolId);
      const fitur = (tool?.fitur || []).find((f) => f.id === log.fiturId);
      const part = (fitur?.parts || []).find((p) => p.id === log.partId);
      if (part) parts.push(part.nama);
    }
    return parts.join(" → ") || "-";
  };

  // ========== MODE MATERI ==========
  if (isMateriMode) {
    const hasMateri = !!item?.materi;
    return (
      <div className="space-y-4">
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-4">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="text-base font-bold text-gray-800">📚 Materi</h3>
                <p className="text-xs text-gray-500 mt-1">Ringkasan referensi. Lo bisa edit.</p>
              </div>
              {!isEditingMateri && (
                <button className="btn btn-ghost btn-xs text-gray-600" onClick={() => setIsEditingMateri(true)}>
                  {hasMateri ? "✏️ Edit" : "➕ Tambah"}
                </button>
              )}
            </div>
            {!isEditingMateri && hasMateri && (
              <p className="text-sm text-gray-800 whitespace-pre-wrap bg-gray-50 p-3 rounded border border-gray-200">{item.materi}</p>
            )}
            {!isEditingMateri && !hasMateri && (
              <div className="text-center py-6 text-gray-400">
                <p className="text-2xl mb-2">📭</p>
                <p className="text-sm">Belum ada materi. Klik "+ Tambah".</p>
              </div>
            )}
            {isEditingMateri && (
              <div className="space-y-3">
                <textarea className="textarea textarea-bordered w-full text-sm text-gray-800 bg-white" rows="10" placeholder="Tulis materi..." value={materi} onChange={(e) => setMateri(e.target.value)} autoFocus />
                <div className="flex gap-2">
                  <button className="btn btn-primary btn-sm flex-1" onClick={handleSimpanMateri}>💾 Simpan</button>
                  <button className="btn btn-ghost btn-sm text-gray-700" onClick={() => { setMateri(item?.materi || ""); setIsEditingMateri(false); }}>Batal</button>
                </div>
              </div>
            )}
            {saved && (<div className="alert alert-success mt-3 py-2"><span className="text-sm">✅ Materi disimpan!</span></div>)}
          </div>
        </div>
      </div>
    );
  }

  // ========== MODE HASIL BELAJAR (FORM KAYAK KALENDER) ==========
  return (
    <div className="space-y-4">
      {/* FORM CARD */}
      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
            <div>
              <h3 className="text-base font-bold text-gray-800">
                📝 Hasil Belajar --- {formatTanggal(today, "panjang")}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Catatan belajar lo. Otomatis muncul di Kalender. Nanti ke Telegram.
              </p>
            </div>
            {!showForm && (
              <button className="btn btn-primary btn-sm" onClick={handleBukaFormTambah}>
                + Tambah Catatan
              </button>
            )}
          </div>

          {/* FORM */}
          {showForm && (
            <div className="bg-blue-50 rounded p-3 space-y-3 border border-blue-200">
              <p className="text-xs font-semibold text-blue-700">
                {editingLogId ? "✏️ Edit Catatan Belajar" : "✏️ Tambah Catatan Belajar"}
              </p>

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Sub-Kategori</label>
                <select
                  className="select select-bordered select-sm w-full text-gray-800 bg-white"
                  value={formData.subKategoriId}
                  onChange={(e) => setFormData({ ...formData, subKategoriId: e.target.value, toolId: "", fiturId: "", partId: "" })}
                >
                  <option value="">-- Pilih Sub-Kategori --</option>
                  {subKategoriList.map((s) => (<option key={s.id} value={s.id}>{s.nama}</option>))}
                </select>
              </div>

              {formData.subKategoriId && (
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Tool</label>
                  <select
                    className="select select-bordered select-sm w-full text-gray-800 bg-white"
                    value={formData.toolId}
                    onChange={(e) => setFormData({ ...formData, toolId: e.target.value, fiturId: "", partId: "" })}
                  >
                    <option value="">-- Pilih Tool --</option>
                    {toolList.map((t) => (<option key={t.id} value={t.id}>{t.nama}</option>))}
                  </select>
                </div>
              )}

              {formData.toolId && fiturList.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Fitur / Materi</label>
                  <select
                    className="select select-bordered select-sm w-full text-gray-800 bg-white"
                    value={formData.fiturId}
                    onChange={(e) => setFormData({ ...formData, fiturId: e.target.value, partId: "" })}
                  >
                    <option value="">-- Pilih Fitur --</option>
                    {fiturList.map((f) => (<option key={f.id} value={f.id}>{f.nama}</option>))}
                  </select>
                </div>
              )}

              {formData.fiturId && partList.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Part</label>
                  <select
                    className="select select-bordered select-sm w-full text-gray-800 bg-white"
                    value={formData.partId}
                    onChange={(e) => setFormData({ ...formData, partId: e.target.value })}
                  >
                    <option value="">-- Pilih Part --</option>
                    {partList.map((p) => (<option key={p.id} value={p.id}>{p.nama}</option>))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">📝 Catatan</label>
                <textarea
                  className="textarea textarea-bordered w-full text-sm text-gray-800 bg-white"
                  rows="3"
                  placeholder="Catatan belajar hari ini..."
                  value={formData.catatan}
                  onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">📁 Link Google Drive (opsional)</label>
                <input
                  type="url"
                  className="input input-bordered input-sm w-full text-gray-800 bg-white"
                  placeholder="https://drive.google.com/..."
                  value={formData.gdriveUrl}
                  onChange={(e) => setFormData({ ...formData, gdriveUrl: e.target.value })}
                />
                <p className="text-[10px] text-gray-500 mt-1">📸 Nanti bisa juga via Telegram.</p>
              </div>

              {errorMsg && (<div className="alert alert-error py-2 text-xs"><span>⚠️ {errorMsg}</span></div>)}

              <div className="flex gap-2">
                <button className="btn btn-primary btn-sm flex-1" onClick={handleSimpan}>
                  {editingLogId ? "💾 Simpan" : "➕ Tambah"}
                </button>
                <button className="btn btn-ghost btn-sm text-gray-700" onClick={() => { setShowForm(false); setEditingLogId(null); }}>
                  Batal
                </button>
              </div>
            </div>
          )}

          {!showForm && riwayat.length === 0 && (
            <div className="text-center py-6 text-gray-400">
              <p className="text-2xl mb-2">📭</p>
              <p className="text-sm">Belum ada catatan. Klik "+ Tambah Catatan".</p>
            </div>
          )}

          {saved && !showForm && (
            <div className="alert alert-success mt-3 py-2">
              <span className="text-sm">✅ Berhasil disimpan! Catatan juga muncul di kalender.</span>
            </div>
          )}
        </div>
      </div>

      {/* RIWAYAT */}
      {riwayat.length > 0 && (
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-4">
            <h3 className="text-base font-bold text-gray-800 mb-3">📅 Riwayat Belajar ({riwayat.length})</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {riwayat.map((log, idx) => (
                <div key={log.id || idx} className="p-3 rounded border border-gray-200 bg-gray-50">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-gray-800">{getLabelByLog(log)}</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        📅 {formatTanggal(log.tanggal, "pendek")}
                        {log.sumber === "materi" && (<span className="ml-2 badge badge-ghost badge-xs">dari materi</span>)}
                        {log.sumber === "kalender" && (<span className="ml-2 badge badge-ghost badge-xs">dari kalender</span>)}
                      </p>
                      {log.catatan && (<p className="text-sm text-gray-700 whitespace-pre-wrap mt-2 bg-white p-2 rounded border border-gray-200">📝 {log.catatan}</p>)}
                      {log.gdriveUrl && (
                        <a href={log.gdriveUrl} target="_blank" rel="noopener noreferrer" className="text-xs link link-primary mt-1 inline-block">📁 GDrive</a>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button className="btn btn-ghost btn-xs" onClick={() => handleEdit(log)} title="Edit">✏️</button>
                      <button className="btn btn-ghost btn-xs text-red-500" onClick={() => handleHapus(log)} title="Hapus">🗑️</button>
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