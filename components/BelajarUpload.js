// components/BelajarUpload.js
"use client";

import { useState, useEffect } from "react";

export default function BelajarUpload({
  item,
  onUpdate,
  path = [],
  kategoriId,
  logHarian = {},
  onUpdateLog,
  today,
}) {
  const [gdriveUrl, setGdriveUrl] = useState(item?.gdriveUrl || "");
  const [catatan, setCatatan] = useState(item?.catatan || "");
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  // Sync state kalau item berubah
  useEffect(() => {
    setGdriveUrl(item?.gdriveUrl || "");
    setCatatan(item?.catatan || "");
  }, [item?.id]);

  // ========== RIWAYAT BELAJAR DARI LOG ==========
  const riwayat = [];
  Object.entries(logHarian || {}).forEach(([tanggal, list]) => {
    (list || []).forEach((log) => {
      if (log.kategoriId !== kategoriId) return;
      if ((log.subKategoriId || "") !== (path[1] || "")) return;
      if ((log.toolId || "") !== (path[2] || "")) return;
      if ((log.fiturId || "") !== (path[3] || "")) return;
      if ((log.partId || "") !== (path[4] || "")) return;
      riwayat.push({ ...log, tanggal });
    });
  });
  riwayat.sort((a, b) => b.tanggal.localeCompare(a.tanggal));

  // ========== SIMPAN ==========
  const handleSimpan = () => {
    // 1. Update materi
    onUpdate({ gdriveUrl, catatan });

    // 2. Sync ke kalender
    if (onUpdateLog && today && (catatan.trim() || gdriveUrl.trim())) {
      const updated = JSON.parse(JSON.stringify(logHarian || {}));
      if (!updated[today]) updated[today] = [];

      // Cari log dengan sumber "materi" untuk fitur ini di hari ini
      const idx = updated[today].findIndex(
        (l) =>
          l.sumber === "materi" &&
          l.kategoriId === kategoriId &&
          (l.subKategoriId || "") === (path[1] || "") &&
          (l.toolId || "") === (path[2] || "") &&
          (l.fiturId || "") === (path[3] || "") &&
          (l.partId || "") === (path[4] || "")
      );

      const logBaru = {
        id: idx >= 0 ? updated[today][idx].id : `log_${Date.now()}`,
        kategoriId,
        subKategoriId: path[1] || "",
        toolId: path[2] || "",
        fiturId: path[3] || "",
        partId: path[4] || "",
        catatan,
        gdriveUrl,
        telegramMessageId: "",
        sumber: "materi",
        updatedAt: new Date().toISOString(),
      };

      if (idx >= 0) updated[today][idx] = logBaru;
      else updated[today].push(logBaru);

      onUpdateLog(updated, { action: "materi_sync", log: logBaru });
    }

    setIsEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleBatal = () => {
    setGdriveUrl(item?.gdriveUrl || "");
    setCatatan(item?.catatan || "");
    setIsEditing(false);
  };

  const hasContent = item?.gdriveUrl || item?.catatan;

  return (
    <div className="space-y-4">
      {/* CATATAN & LINK */}
      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-base font-bold text-gray-800">📤 Hasil Belajar</h3>
            {!isEditing && (
              <button
                className="btn btn-ghost btn-xs text-gray-600"
                onClick={() => setIsEditing(true)}
              >
                {hasContent ? "✏️ Edit" : "➕ Tambah"}
              </button>
            )}
          </div>

          {/* MODE VIEW */}
          {!isEditing && hasContent && (
            <div className="space-y-3">
              {gdriveUrl && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-600 w-24">📁 GDrive:</span>
                  <a
                    href={gdriveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link link-primary text-sm truncate flex-1"
                  >
                    {gdriveUrl}
                  </a>
                </div>
              )}
              {catatan && (
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">📝 Catatan:</p>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap bg-gray-50 p-2 rounded border border-gray-200">
                    {catatan}
                  </p>
                </div>
              )}
            </div>
          )}

          {!isEditing && !hasContent && (
            <div className="text-center py-6 text-gray-400">
              <p className="text-2xl mb-2">📭</p>
              <p className="text-sm">Belum ada catatan. Klik "+ Tambah" untuk mulai.</p>
            </div>
          )}

          {/* MODE EDIT */}
          {isEditing && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">
                  📝 Catatan
                </label>
                <textarea
                  className="textarea textarea-bordered w-full text-sm text-gray-800 bg-white"
                  rows="5"
                  placeholder="Catatan belajar..."
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">
                  📁 Link Google Drive (opsional)
                </label>
                <input
                  type="url"
                  className="input input-bordered input-sm w-full text-gray-800 bg-white"
                  placeholder="https://drive.google.com/..."
                  value={gdriveUrl}
                  onChange={(e) => setGdriveUrl(e.target.value)}
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  📸 Nanti bisa juga via Telegram (kirim catatan → otomatis muncul di sini).
                </p>
              </div>
              <div className="flex gap-2">
                <button className="btn btn-primary btn-sm flex-1" onClick={handleSimpan}>
                  💾 Simpan
                </button>
                <button className="btn btn-ghost btn-sm text-gray-700" onClick={handleBatal}>
                  Batal
                </button>
              </div>
            </div>
          )}

          {saved && (
            <div className="alert alert-success mt-3 py-2">
              <span className="text-sm">✅ Berhasil disimpan! Catatan juga muncul di kalender hari ini.</span>
            </div>
          )}
        </div>
      </div>

      {/* RIWAYAT BELAJAR DARI KALENDER */}
      {riwayat.length > 0 && (
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-4">
            <h3 className="text-base font-bold text-gray-800 mb-3">
              📅 Riwayat Belajar ({riwayat.length})
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {riwayat.map((log, idx) => (
                <div
                  key={log.id || idx}
                  className="p-3 rounded border border-gray-200 bg-gray-50"
                >
                  <div className="flex justify-between items-start gap-2">
                    <p className="text-xs font-semibold text-gray-500">
                      📅 {log.tanggal}
                      {log.sumber === "materi" && (
                        <span className="ml-2 badge badge-ghost badge-xs">dari materi</span>
                      )}
                      {log.sumber === "kalender" && (
                        <span className="ml-2 badge badge-ghost badge-xs">dari kalender</span>
                      )}
                    </p>
                  </div>
                  {log.catatan && (
                    <p className="text-sm text-gray-700 whitespace-pre-wrap mt-1">
                      📝 {log.catatan}
                    </p>
                  )}
                  {log.gdriveUrl && (
                    <a
                      href={log.gdriveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs link link-primary mt-1 inline-block"
                    >
                      📁 GDrive
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}