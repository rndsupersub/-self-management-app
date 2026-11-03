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

  // ========== STATE EDIT RIWAYAT ==========
  const [editingRiwayat, setEditingRiwayat] = useState(null); // tanggal
  const [editRiwayatForm, setEditRiwayatForm] = useState({
    halamanMulai: 1,
    halamanAkhir: 1,
    catatan: "",
  });

  const progress = getProgressBuku(buku);
  const sisa = getSisaHalaman(buku);
  const estimasi = getEstimasiSelesai(buku);
  const streak = getStreak(buku);
  const totalHalamanBuku = getTotalHalamanBuku(buku);
  const halamanSelesai = buku.halamanSelesai || [];
  const bukuSelesai = cekBukuSelesai(buku);
  const halamanMulai = buku.halamanMulai || 1;

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

  // ========== TOGGLE HALAMAN (PETA HALAMAN) ==========
  const handleToggleHalaman = (h) => {
    const sudah = halamanSelesai.includes(h);
    const newHalamanSelesai = sudah
      ? halamanSelesai.filter((x) => x !== h)
      : [...halamanSelesai, h].sort((a, b) => a - b);

    onUpdateBuku({ ...buku, halamanSelesai: newHalamanSelesai });
  };

  // ========== RIWAYAT BACA ==========
  const riwayatBaca = Object.entries(buku.progressHarian || {})
    .map(([tanggal, entry]) => ({ tanggal, ...entry }))
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal));

  // ========== HAPUS RIWAYAT ==========
  const handleHapusRiwayat = (tanggal) => {
    if (
      !confirm(
        "Hapus riwayat baca ini? Halaman yang tercatat di riwayat ini akan dihapus dari Peta Halaman (kecuali tercatat di riwayat lain)."
      )
    )
      return;

    const entry = buku.progressHarian[tanggal];
    if (!entry) return;

    const pagesInEntry = new Set(
      entry.halamanList || getHalamanRange(entry.halamanMulai, entry.halamanAkhir)
    );

    // Halaman yang juga tercatat di riwayat lain harus tetap hijau
    const pagesInOtherEntries = new Set();
    Object.entries(buku.progressHarian).forEach(([t, e]) => {
      if (t !== tanggal) {
        (e.halamanList || getHalamanRange(e.halamanMulai, e.halamanAkhir)).forEach(
          (h) => pagesInOtherEntries.add(h)
        );
      }
    });

    const newHalamanSelesai = halamanSelesai.filter(
      (h) => !pagesInEntry.has(h) || pagesInOtherEntries.has(h)
    );

    const newProgressHarian = { ...buku.progressHarian };
    delete newProgressHarian[tanggal];

    onUpdateBuku({
      ...buku,
      progressHarian: newProgressHarian,
      halamanSelesai: newHalamanSelesai,
    });
  };

  // ========== EDIT RIWAYAT ==========
  const handleEditRiwayat = (entry) => {
    setEditingRiwayat(entry.tanggal);
    setEditRiwayatForm({
      halamanMulai: entry.halamanMulai || 1,
      halamanAkhir: entry.halamanAkhir || 1,
      catatan: entry.catatan || "",
    });
  };

  const handleSimpanEditRiwayat = () => {
    if (!editingRiwayat) return;
    const mulai = parseInt(editRiwayatForm.halamanMulai);
    const akhir = parseInt(editRiwayatForm.halamanAkhir);
    if (!mulai || !akhir || akhir < mulai) {
      alert("Halaman akhir harus >= halaman mulai.");
      return;
    }

    const oldEntry = buku.progressHarian[editingRiwayat];
    if (!oldEntry) return;

    const oldPages = new Set(
      oldEntry.halamanList || getHalamanRange(oldEntry.halamanMulai, oldEntry.halamanAkhir)
    );
    const newPages = new Set(getHalamanRange(mulai, akhir));

    const pagesToRemove = [...oldPages].filter((h) => !newPages.has(h));
    const pagesToAdd = [...newPages].filter((h) => !oldPages.has(h));

    // Halaman yang juga tercatat di riwayat lain harus tetap hijau
    const pagesInOtherEntries = new Set();
    Object.entries(buku.progressHarian).forEach(([t, e]) => {
      if (t !== editingRiwayat) {
        (e.halamanList || getHalamanRange(e.halamanMulai, e.halamanAkhir)).forEach(
          (h) => pagesInOtherEntries.add(h)
        );
      }
    });

    let newHalamanSelesai = halamanSelesai.filter(
      (h) => !pagesToRemove.includes(h) || pagesInOtherEntries.has(h)
    );
    newHalamanSelesai = [...new Set([...newHalamanSelesai, ...pagesToAdd])].sort(
      (a, b) => a - b
    );

    const newProgressHarian = {
      ...buku.progressHarian,
      [editingRiwayat]: {
        ...oldEntry,
        halamanMulai: mulai,
        halamanAkhir: akhir,
        halamanList: getHalamanRange(mulai, akhir),
        catatan: editRiwayatForm.catatan,
      },
    };

    onUpdateBuku({
      ...buku,
      progressHarian: newProgressHarian,
      halamanSelesai: newHalamanSelesai,
    });
    setEditingRiwayat(null);
  };

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
              {halamanSelesai.filter((h) => h >= halamanMulai).length} / {totalHalamanBuku} hal
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
            🟢 Udah dibaca • ⚪ Belum dibaca • Klik halaman untuk toggle
          </p>
          {halamanMulai > 1 && (
            <p className="text-xs text-blue-600 mb-3">
              ℹ️ Halaman 1–{halamanMulai - 1} adalah front matter, tidak dihitung dalam progress.
            </p>
          )}

          <div className="flex flex-wrap gap-1">
            {getHalamanRange(1, buku.totalHalaman).map((h) => {
              const dibaca = halamanSelesai.includes(h);
              const isFrontMatter = h < halamanMulai;
              return (
                <button
                  key={h}
                  onClick={() => handleToggleHalaman(h)}
                  className={`w-7 h-7 rounded flex items-center justify-center text-[10px] font-semibold border transition ${
                    dibaca
                      ? "bg-green-500 text-white border-green-600 hover:bg-green-600"
                      : isFrontMatter
                      ? "bg-blue-50 text-blue-400 border-blue-200 hover:bg-blue-100"
                      : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200"
                  }`}
                  title={`Halaman ${h}${dibaca ? " (udah dibaca)" : ""}${isFrontMatter ? " (front matter)" : ""}`}
                >
                  {h}
                </button>
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
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        Hal. {entry.halamanMulai}–{entry.halamanAkhir} (
                        {entry.halamanList?.length || 0} hal)
                      </span>
                      <button
                        className="btn btn-ghost btn-xs text-blue-500"
                        onClick={() => handleEditRiwayat(entry)}
                        title="Edit riwayat"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-ghost btn-xs text-red-500"
                        onClick={() => handleHapusRiwayat(entry.tanggal)}
                        title="Hapus riwayat"
                      >
                        🗑️
                      </button>
                    </div>
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

      {/* ========== MODAL EDIT RIWAYAT ========== */}
      {editingRiwayat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card bg-white shadow-xl w-full max-w-md">
            <div className="card-body p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-bold text-gray-800">
                  ✏️ Edit Riwayat Baca
                </h3>
                <button
                  className="btn btn-ghost btn-sm text-gray-700"
                  onClick={() => setEditingRiwayat(null)}
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-gray-500 mb-3">
                📅 {formatTanggal(editingRiwayat, "pendek")}
              </p>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">
                      Halaman Mulai
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={buku.totalHalaman}
                      className="input input-bordered input-sm w-full text-gray-800 bg-white"
                      value={editRiwayatForm.halamanMulai}
                      onChange={(e) =>
                        setEditRiwayatForm({
                          ...editRiwayatForm,
                          halamanMulai: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">
                      Halaman Akhir
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={buku.totalHalaman}
                      className="input input-bordered input-sm w-full text-gray-800 bg-white"
                      value={editRiwayatForm.halamanAkhir}
                      onChange={(e) =>
                        setEditRiwayatForm({
                          ...editRiwayatForm,
                          halamanAkhir: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">
                    Catatan
                  </label>
                  <textarea
                    className="textarea textarea-bordered w-full text-sm text-gray-800 bg-white"
                    rows="3"
                    placeholder="Catatan baca hari ini..."
                    value={editRiwayatForm.catatan}
                    onChange={(e) =>
                      setEditRiwayatForm({
                        ...editRiwayatForm,
                        catatan: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  className="btn btn-primary btn-sm flex-1"
                  onClick={handleSimpanEditRiwayat}
                >
                  💾 Simpan
                </button>
                <button
                  className="btn btn-ghost btn-sm text-gray-700"
                  onClick={() => setEditingRiwayat(null)}
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}