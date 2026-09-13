// components/BelajarUpload.js
"use client";

import { useState, useEffect } from "react";

export default function BelajarUpload({ item, onUpdate }) {
  const [gdriveUrl, setGdriveUrl] = useState(item?.gdriveUrl || "");
  const [tiktokUrl, setTiktokUrl] = useState(item?.tiktokUrl || "");
  const [catatan, setCatatan] = useState(item?.catatan || "");
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  // Sync state kalau item berubah
  useEffect(() => {
    setGdriveUrl(item?.gdriveUrl || "");
    setTiktokUrl(item?.tiktokUrl || "");
    setCatatan(item?.catatan || "");
  }, [item?.id]);

  // ========== SIMPAN ==========
  const handleSimpan = () => {
    onUpdate({
      gdriveUrl,
      tiktokUrl,
      catatan,
      updatedAt: new Date().toISOString(),
    });
    setIsEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // ========== BATAL ==========
  const handleBatal = () => {
    setGdriveUrl(item?.gdriveUrl || "");
    setTiktokUrl(item?.tiktokUrl || "");
    setCatatan(item?.catatan || "");
    setIsEditing(false);
  };

  // ========== CEK APAKAH UDAH ADA ISI ==========
  const hasContent = item?.gdriveUrl || item?.tiktokUrl || item?.catatan;

  return (
    <div className="space-y-4">
      {/* CARD: LINK & CATATAN */}
      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-base font-bold text-gray-800">
              📤 Upload Hasil Belajar
            </h3>
            {!isEditing && (
              <button
                className="btn btn-ghost btn-xs text-gray-600"
                onClick={() => setIsEditing(true)}
              >
                {hasContent ? "✏️ Edit" : "➕ Tambah"}
              </button>
            )}
          </div>

          {/* MODE VIEW — kalau udah ada isi dan nggak sedang edit */}
          {!isEditing && hasContent && (
            <div className="space-y-3">
              {gdriveUrl && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-600 w-24">
                    📁 GDrive:
                  </span>
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

              {tiktokUrl && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-600 w-24">
                    🎬 TikTok:
                  </span>
                  <a
                    href={tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link link-primary text-sm truncate flex-1"
                  >
                    {tiktokUrl}
                  </a>
                </div>
              )}

              {catatan && (
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">
                    📝 Catatan:
                  </p>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap bg-gray-50 p-2 rounded border border-gray-200">
                    {catatan}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* MODE VIEW — kalau belum ada isi */}
          {!isEditing && !hasContent && (
            <div className="text-center py-6 text-gray-400">
              <p className="text-2xl mb-2">📭</p>
              <p className="text-sm">
                Belum ada upload. Klik "+ Tambah" untuk mulai.
              </p>
            </div>
          )}

          {/* MODE EDIT */}
          {isEditing && (
            <div className="space-y-3">
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
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">
                  🎬 Link TikTok (opsional)
                </label>
                <input
                  type="url"
                  className="input input-bordered input-sm w-full text-gray-800 bg-white"
                  placeholder="https://tiktok.com/@user/video/..."
                  value={tiktokUrl}
                  onChange={(e) => setTiktokUrl(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">
                  📝 Catatan
                </label>
                <textarea
                  className="textarea textarea-bordered w-full text-sm text-gray-800 bg-white"
                  rows="4"
                  placeholder="Catatan hasil belajar..."
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <button
                  className="btn btn-primary btn-sm flex-1"
                  onClick={handleSimpan}
                >
                  💾 Simpan
                </button>
                <button
                  className="btn btn-ghost btn-sm text-gray-700"
                  onClick={handleBatal}
                >
                  Batal
                </button>
              </div>
            </div>
          )}

          {/* NOTIFIKASI SUKSES */}
          {saved && (
            <div className="alert alert-success mt-3 py-2">
              <span className="text-sm">✅ Berhasil disimpan!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}