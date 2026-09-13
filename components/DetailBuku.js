// components/DetailBuku.js
"use client";

import { useState } from "react";
import {
  formatTanggal,
  getProgressBuku,
  getSisaHalaman,
  getEstimasiSelesai,
  getProgressBab,
  cekBabSelesai,
  cekBukuSelesai,
  getStreak,
  getHalamanRange,
  getTotalHalamanBuku,
  hitungHariKe,
} from "@/lib/bedahBukuData";

export default function DetailBuku({ buku, onUpdateBuku, onDeleteBuku }) {
  const [editTarget, setEditTarget] = useState(false);
  const [targetBaru, setTargetBaru] = useState(buku.targetPerHari || 10);
  const [editKesimpulan, setEditKesimpulan] = useState(false);
  const [kesimpulanText, setKesimpulanText] = useState(buku.kesimpulan || "");
  const [confirmHapus, setConfirmHapus] = useState(false);

  const progress = getProgressBuku(buku);
  const sisa = getSisaHalaman(buku);
  const estimasi = getEstimasiSelesai(buku);
  const streak = getStreak(buku);
  const totalHalamanBuku = getTotalHalamanBuku(buku);
  const halamanSelesai = buku.halamanSelesai || [];
  const bukuSelesai = cekBukuSelesai(buku);

  // ========== SIMPAN TARGET BARU ==========
  const handleSimpanTarget = () => {
    const target = parseInt(targetBaru);
    if (!target || target <= 0) return;

    const updated = {
      ...buku,
      targetPerHari: target,
    };
    onUpdateBuku(updated);
    setEditTarget(false);
  };

  // ========== SIMPAN KESIMPULAN ==========
  const handleSimpanKesimpulan = () => {
    const updated = {
      ...buku,
      kesimpulan: kesimpulanText,
      kesimpulanUpdatedAt: new Date().toISOString(),
    };
    onUpdateBuku(updated);
    setEditKesimpulan(false);
  };

  // ========== HAPUS BUKU ==========
  const handleHapusBuku = () => {
    if (onDeleteBuku) {
      onDeleteBuku(buku.id);
    }
  };

  // ========== RIWAYAT BACA ==========
  // Sort dari tanggal terbaru
  const riwayatBaca = Object.entries(buku.progressHarian || {})
    .map(([tanggal, entry]) => ({ tanggal, ...entry }))
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal));

  return (
    <div className="space-y-4">
      {/* ========== HEADER BUKU ========== */}
      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          <div className="flex flex-wrap justify-between items-start gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="badge badge-primary badge-sm">
                  {buku.kategoriId === "belajar" ? "📘 Buku Belajar" : "📖 Buku Santai"}
                </span>
                {bukuSelesai && (
                  <span className="badge badge-success badge-sm">✅ Selesai</span>
                )}
              </div>
              <h1 className="text-xl font-bold text-gray-800 mb-1">
                {buku.judul}
              </h1>
              <p className="text-sm text-gray-600">
                ✍️ {buku.penulis}
                {buku.edisi && ` • ${buku.edisi}`}
              </p>
            </div>

            <div className="flex gap-1">
              <button
                className="btn btn-ghost btn-xs text-red-500"
                onClick={() => setConfirmHapus(true)}
                title="Hapus buku"
              >
                🗑️
              </button>
            </div>
          </div>

          {/* Konfirmasi Hapus */}
          {confirmHapus && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded p-3">
              <p className="text-sm text-red-700 mb-2">
                Yakin mau hapus buku ini? Semua riwayat baca bakal hilang.
              </p>
              <div className="flex gap-2">
                <button
                  className="btn btn-error btn-sm"
                  onClick={handleHapusBuku}
                >
                  Ya, Hapus
                </button>
                <button
                  className="btn btn-ghost btn-sm text-gray-700"
                  onClick={() => setConfirmHapus(false)}
                >
                  Batal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========== INFO CARDS ========== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Progress */}
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-3">
            <p className="text-xs text-gray-500 mb-1">📊 Progress</p>
            <p className="text-xl font-bold text-gray-800">{progress}%</p>
            <progress
              className="progress progress-primary w-full h-2 mt-1"
              value={progress}
              max="100"
            />
            <p className="text-xs text-gray-500 mt-1">
              {halamanSelesai.length} / {totalHalamanBuku} hal
            </p>
          </div>
        </div>

        {/* Target per Hari */}
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-3">
            <p className="text-xs text-gray-500 mb-1">🎯 Target / Hari</p>
            {!editTarget ? (
              <div className="flex items-center justify-between">
                <p className="text-xl font-bold text-gray-800">
                  {buku.targetPerHari}
                </p>
                <button
                  className="btn btn-ghost btn-xs"
                  onClick={() => {
                    setTargetBaru(buku.targetPerHari);
                    setEditTarget(true);
                  }}
                >
                  ✏️
                </button>
              </div>
            ) : (
              <div className="flex gap-1 items-center">
                <input
                  type="number"
                  min="1"
                  className="input input-bordered input-xs w-16 text-gray-800 bg-white"
                  value={targetBaru}
                  onChange={(e) => setTargetBaru(e.target.value)}
                  autoFocus
                />
                <button
                  className="btn btn-primary btn-xs"
                  onClick={handleSimpanTarget}
                >
                  ✓
                </button>
                <button
                  className="btn btn-ghost btn-xs"
                  onClick={() => setEditTarget(false)}
                >
                  ✕
                </button>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">halaman/hari</p>
          </div>
        </div>

        {/* Sisa Halaman */}
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-3">
            <p className="text-xs text-gray-500 mb-1">📄 Sisa</p>
            <p className="text-xl font-bold text-gray-800">{sisa}</p>
            <p className="text-xs text-gray-500 mt-1">halaman</p>
          </div>
        </div>

        {/* Estimasi Selesai */}
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-3">
            <p className="text-xs text-gray-500 mb-1">🏁 Estimasi Selesai</p>
            <p className="text-sm font-bold text-gray-800">
              {estimasi ? formatTanggal(estimasi, "pendek") : "—"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              🔥 Streak: {streak} hari
            </p>
          </div>
        </div>
      </div>

      {/* ========== PROGRESS PER BAB ========== */}
      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          <h3 className="text-base font-bold text-gray-800 mb-3">
            📚 Progress per Bab
          </h3>

          <div className="space-y-3">
            {buku.bab?.map((bab, idx) => {
              const babProgress = getProgressBab(buku, bab.id);
              const babSelesai = cekBabSelesai(buku, bab.id);
              const totalHalamanBab = bab.halamanAkhir - bab.halamanAwal + 1;

              return (
                <div key={bab.id} className="border border-gray-200 rounded p-3">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">
                        {idx + 1}. {bab.nama}
                      </p>
                      <p className="text-xs text-gray-500">
                        Hal. {bab.halamanAwal}–{bab.halamanAkhir} ({totalHalamanBab} hal)
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-700">
                        {babProgress}%
                      </span>
                      {babSelesai && <span className="text-sm">✅</span>}
                    </div>
                  </div>
                  <progress
                    className={`progress ${
                      babSelesai ? "progress-success" : "progress-primary"
                    } w-full h-2`}
                    value={babProgress}
                    max="100"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========== GRID HALAMAN (VISUAL) ========== */}
      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          <h3 className="text-base font-bold text-gray-800 mb-3">
            📄 Peta Halaman
          </h3>
          <p className="text-xs text-gray-500 mb-3">
            🟢 Udah dibaca • ⚪ Belum dibaca
          </p>

          <div className="flex flex-wrap gap-1">
            {getHalamanRange(buku.halamanMulai || 1, buku.totalHalaman).map((h) => {
              const dibaca = halamanSelesai.includes(h);
              return (
                <div
                  key={h}
                  className={`w-7 h-7 rounded flex items-center justify-center text-[10px] font-semibold border ${
                    dibaca
                      ? "bg-green-500 text-white border-green-600"
                      : "bg-gray-100 text-gray-500 border-gray-200"
                  }`}
                  title={`Halaman ${h}${dibaca ? " (udah dibaca)" : ""}`}
                >
                  {h}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========== KESIMPULAN AKHIR ========== */}
      {bukuSelesai && (
        <div className="card bg-gradient-to-br from-green-50 to-blue-50 shadow border-2 border-green-300">
          <div className="card-body p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-bold text-green-800">
                🎓 Kesimpulan Akhir Buku
              </h3>
              {!editKesimpulan && (
                <button
                  className="btn btn-ghost btn-xs text-gray-600"
                  onClick={() => {
                    setKesimpulanText(buku.kesimpulan || "");
                    setEditKesimpulan(true);
                  }}
                >
                  {buku.kesimpulan ? "✏️ Edit" : "➕ Tambah"}
                </button>
              )}
            </div>

            {!editKesimpulan && buku.kesimpulan && (
              <div className="text-sm text-gray-800 whitespace-pre-wrap bg-white p-3 rounded border border-green-200">
                {buku.kesimpulan}
              </div>
            )}

            {!editKesimpulan && !buku.kesimpulan && (
              <p className="text-sm text-gray-500 italic">
                Buku udah selesai! Tulis kesimpulan: apa yang dipelajari, apa yang mau diimplementasikan, dll.
              </p>
            )}

            {editKesimpulan && (
              <div className="space-y-2">
                <textarea
                  className="textarea textarea-bordered w-full text-sm text-gray-800 bg-white"
                  rows="6"
                  placeholder="Apa yang gua pelajari dari buku ini?&#10;Apa yang mau gua implementasikan?&#10;Konsep kunci yang gua inget?&#10;..."
                  value={kesimpulanText}
                  onChange={(e) => setKesimpulanText(e.target.value)}
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    className="btn btn-primary btn-sm flex-1"
                    onClick={handleSimpanKesimpulan}
                  >
                    💾 Simpan
                  </button>
                  <button
                    className="btn btn-ghost btn-sm text-gray-700"
                    onClick={() => setEditKesimpulan(false)}
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========== RIWAYAT BACA ========== */}
      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          <h3 className="text-base font-bold text-gray-800 mb-3">
            📅 Riwayat Baca ({riwayatBaca.length} hari)
          </h3>

          {riwayatBaca.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              <p className="text-2xl mb-2">📭</p>
              <p className="text-sm">
                Belum ada riwayat baca. Input dari kalender.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {riwayatBaca.map((entry) => (
                <div
                  key={entry.tanggal}
                  className="p-3 rounded border border-gray-200 bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-semibold text-gray-800">
                      📅 {formatTanggal(entry.tanggal, "pendek")}
                    </p>
                    <span className="text-xs text-gray-500">
                      Hal. {entry.halamanMulai}–{entry.halamanAkhir} (
                      {entry.halamanList?.length || 0} hal)
                    </span>
                  </div>
                  {entry.catatan && (
                    <p className="text-xs text-gray-700 whitespace-pre-wrap mt-1 bg-white p-2 rounded border border-gray-200">
                      📝 {entry.catatan}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-1">
                    {entry.gdriveUrl && (
                      <a
                        href={entry.gdriveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs link link-primary"
                      >
                        📁 GDrive
                      </a>
                    )}
                    {entry.tiktokUrl && (
                      <a
                        href={entry.tiktokUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs link link-primary"
                      >
                        🎬 TikTok
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}