// components/MurajaahMingguan.js
"use client";

import { useState, useMemo } from "react";
import { DEFAULT_ACTIVITIES } from "@/lib/defaultData";
import {
  DEFAULT_JENIS_KESALAHAN,
  getSuratListByJuz,
  getMingguRange,
  formatTanggal,
  formatTanggalPendek,
  getTotalKesalahan,
  formatKesalahan,
} from "@/lib/hafalanData";

export default function MurajaahMingguan({
  hafalanMurajaah = {},
  jenisKesalahanList = DEFAULT_JENIS_KESALAHAN,
  onUpdateMurajaah,
}) {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [showForm, setShowForm] = useState(false);
  const [editingDate, setEditingDate] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split("T")[0],
    juzId: "juz_1",
    suratId: "",
    halamanMulai: "",
    halamanSelesai: "",
    voiceNoteUrl: "",
    kesalahan: {},
    catatan: "",
  });
  const [errorMsg, setErrorMsg] = useState("");

  // Ambil daftar semua juz
  const hafalanActivity = DEFAULT_ACTIVITIES.find((a) => a.id === "hafalan");
  const allJuz = hafalanActivity?.children || [];

  // ========== HITUNG RANGE MINGGU ==========
  const periode = useMemo(() => {
    return getMingguRange(selectedDate);
  }, [selectedDate]);

  // ========== FILTER ENTRY DI MINGGU INI ==========
  const entriesMingguIni = useMemo(() => {
    return Object.entries(hafalanMurajaah || {})
      .map(([tanggal, entry]) => ({ tanggal, ...entry }))
      .filter(
        (e) =>
          e.tanggal >= periode.tanggalMulai &&
          e.tanggal <= periode.tanggalSelesai
      )
      .sort((a, b) => a.tanggal.localeCompare(b.tanggal));
  }, [hafalanMurajaah, periode]);

  // ========== STATISTIK MINGGU INI ==========
  const statistikMinggu = useMemo(() => {
    const totalHalaman = entriesMingguIni.reduce((sum, e) => {
      const jml = (e.halamanSelesai || 0) - (e.halamanMulai || 0) + 1;
      return sum + (jml > 0 ? jml : 0);
    }, 0);

    const totalKesalahanAll = entriesMingguIni.reduce((sum, e) => {
      return sum + getTotalKesalahan(e.kesalahan);
    }, 0);

    // Breakdown per jenis
    const breakdown = {};
    entriesMingguIni.forEach((e) => {
      Object.entries(e.kesalahan || {}).forEach(([key, val]) => {
        breakdown[key] = (breakdown[key] || 0) + (parseInt(val) || 0);
      });
    });

    return { totalHalaman, totalKesalahan: totalKesalahanAll, breakdown };
  }, [entriesMingguIni]);

  // ========== DAFTAR SURAT DI FORM ==========
  const suratListForm = getSuratListByJuz(formData.juzId);

  // ========== NAVIGASI MINGGU ==========
  const handlePrevMinggu = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 7);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const handleNextMinggu = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 7);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const handleMingguIni = () => {
    setSelectedDate(new Date().toISOString().split("T")[0]);
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  // ========== BUKA FORM TAMBAH ==========
  const handleBukaForm = () => {
    setFormData({
      tanggal: new Date().toISOString().split("T")[0],
      juzId: "juz_1",
      suratId: "",
      halamanMulai: "",
      halamanSelesai: "",
      voiceNoteUrl: "",
      kesalahan: {},
      catatan: "",
    });
    setEditingDate(null);
    setErrorMsg("");
    setShowForm(true);
  };

  // ========== BUKA FORM EDIT ==========
  const handleBukaEdit = (entry) => {
    setFormData({
      tanggal: entry.tanggal,
      juzId: entry.juzId || "juz_1",
      suratId: entry.suratId || "",
      halamanMulai: entry.halamanMulai || "",
      halamanSelesai: entry.halamanSelesai || "",
      voiceNoteUrl: entry.voiceNoteUrl || "",
      kesalahan: entry.kesalahan || {},
      catatan: entry.catatan || "",
    });
    setEditingDate(entry.tanggal);
    setErrorMsg("");
    setShowForm(true);
  };

  // ========== UPDATE KESALAHAN ==========
  const handleUpdateKesalahan = (jenisId, val) => {
    setFormData({
      ...formData,
      kesalahan: {
        ...formData.kesalahan,
        [jenisId]: parseInt(val) || 0,
      },
    });
  };

  // ========== SIMPAN ==========
  const handleSimpan = () => {
    setErrorMsg("");
    if (!formData.tanggal) {
      setErrorMsg("Isi tanggal dulu.");
      return;
    }
    if (!formData.suratId) {
      setErrorMsg("Pilih surat dulu.");
      return;
    }
    const mulai = parseInt(formData.halamanMulai);
    const selesai = parseInt(formData.halamanSelesai);
    if (!mulai || !selesai) {
      setErrorMsg("Isi halaman mulai dan selesai.");
      return;
    }
    if (selesai < mulai) {
      setErrorMsg("Halaman selesai harus lebih besar.");
      return;
    }

    const updated = { ...hafalanMurajaah };
    // Kalau edit tanggal, hapus yang lama
    if (editingDate && editingDate !== formData.tanggal) {
      delete updated[editingDate];
    }
    updated[formData.tanggal] = {
      juzId: formData.juzId,
      suratId: formData.suratId,
      halamanMulai: mulai,
      halamanSelesai: selesai,
      voiceNoteUrl: formData.voiceNoteUrl,
      kesalahan: formData.kesalahan,
      catatan: formData.catatan,
      updatedAt: new Date().toISOString(),
    };
    onUpdateMurajaah(updated);
    setShowForm(false);
    setEditingDate(null);
  };

  // ========== HAPUS ==========
  const handleHapus = (tanggal) => {
    if (!confirm("Hapus murajaah di tanggal ini?")) return;
    const updated = { ...hafalanMurajaah };
    delete updated[tanggal];
    onUpdateMurajaah(updated);
  };

  // ========== HELPER ==========
  const getSuratLabel = (suratId) => {
    for (const juz of allJuz) {
      const found = juz.children?.find((s) => s.id === suratId);
      if (found) return found.label;
    }
    return suratId;
  };

  const getJuzLabel = (juzId) => {
    return allJuz.find((j) => j.id === juzId)?.label || juzId;
  };

  // ========== HISTORY: SEMUA MINGGU ==========
  const historyMinggu = useMemo(() => {
    // Kelompokkan per minggu
    const grouped = {};
    Object.entries(hafalanMurajaah || {}).forEach(([tanggal, entry]) => {
      const mg = getMingguRange(tanggal);
      const key = mg.tanggalMulai;
      if (!grouped[key]) {
        grouped[key] = {
          key,
          label: mg.label,
          tanggalMulai: mg.tanggalMulai,
          tanggalSelesai: mg.tanggalSelesai,
          entries: [],
        };
      }
      grouped[key].entries.push({ tanggal, ...entry });
    });
    return Object.values(grouped).sort((a, b) =>
      b.key.localeCompare(a.key)
    );
  }, [hafalanMurajaah]);

  return (
    <div className="space-y-4">
      {/* REMINDER */}
      <div className="alert alert-warning py-2 text-xs">
        <span>
          📌 Murajaah diisi mingguan. Rekam voice note, kirim ke Telegram bot
          (nanti), catat kesalahan (harakaat, lupa ayat, dll).
        </span>
      </div>

      {/* NAVIGASI MINGGU */}
      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <div className="flex items-center gap-1">
              <button
                className="btn btn-ghost btn-sm text-gray-700"
                onClick={handlePrevMinggu}
                title="Minggu sebelumnya"
              >
                ‹
              </button>
              <h3 className="text-sm font-bold text-gray-800 min-w-[200px] text-center">
                {periode.label}
              </h3>
              <button
                className="btn btn-ghost btn-sm text-gray-700"
                onClick={handleNextMinggu}
                title="Minggu berikutnya"
              >
                ›
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                className="input input-bordered input-sm text-gray-800 bg-white"
                value={selectedDate}
                onChange={handleDateChange}
              />
              <button
                className="btn btn-outline btn-xs text-gray-700"
                onClick={handleMingguIni}
              >
                📅 Minggu Ini
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* STATISTIK MINGGU */}
      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          <h3 className="text-sm font-bold text-gray-800 mb-3">
            📊 Statistik Minggu Ini
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="bg-blue-50 rounded p-2 border border-blue-200">
              <p className="text-xs text-gray-500">Total Halaman</p>
              <p className="text-lg font-bold text-blue-700">
                {statistikMinggu.totalHalaman}
              </p>
            </div>
            <div className="bg-red-50 rounded p-2 border border-red-200">
              <p className="text-xs text-gray-500">Total Kesalahan</p>
              <p className="text-lg font-bold text-red-700">
                {statistikMinggu.totalKesalahan}
              </p>
            </div>
            <div className="bg-green-50 rounded p-2 border border-green-200">
              <p className="text-xs text-gray-500">Entry</p>
              <p className="text-lg font-bold text-green-700">
                {entriesMingguIni.length}
              </p>
            </div>
            <div className="bg-purple-50 rounded p-2 border border-purple-200">
              <p className="text-xs text-gray-500">Rata-rata/hari</p>
              <p className="text-lg font-bold text-purple-700">
                {entriesMingguIni.length > 0
                  ? (
                      statistikMinggu.totalHalaman / entriesMingguIni.length
                    ).toFixed(1)
                  : "0"}
              </p>
            </div>
          </div>

          {/* Breakdown Kesalahan */}
          {Object.keys(statistikMinggu.breakdown).length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-gray-600 mb-1">
                Breakdown Kesalahan:
              </p>
              <div className="flex flex-wrap gap-1">
                {Object.entries(statistikMinggu.breakdown).map(
                  ([key, val]) => {
                    const jk = jenisKesalahanList.find((j) => j.id === key);
                    return (
                      <span
                        key={key}
                        className="text-xs px-2 py-0.5 rounded border bg-red-50 text-red-700 border-red-200"
                      >
                        {jk?.label || key}: {val}x
                      </span>
                    );
                  }
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TOMBOL TAMBAH */}
      <div className="flex justify-end">
        <button className="btn btn-primary btn-sm" onClick={handleBukaForm}>
          + Tambah Murajaah
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="card bg-white shadow border border-blue-300">
          <div className="card-body p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-gray-800">
                {editingDate ? "✏️ Edit Murajaah" : "➕ Tambah Murajaah"}
              </h3>
              <button
                className="btn btn-ghost btn-xs text-gray-500"
                onClick={() => {
                  setShowForm(false);
                  setEditingDate(null);
                }}
              >
                ✕
              </button>
            </div>

            {/* Tanggal */}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">
                📅 Tanggal
              </label>
              <input
                type="date"
                className="input input-bordered input-sm w-full text-gray-800 bg-white"
                value={formData.tanggal}
                onChange={(e) =>
                  setFormData({ ...formData, tanggal: e.target.value })
                }
              />
            </div>

            {/* Juz */}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">
                📚 Juz
              </label>
              <select
                className="select select-bordered select-sm w-full text-gray-800 bg-white"
                value={formData.juzId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    juzId: e.target.value,
                    suratId: "",
                  })
                }
              >
                {allJuz.map((juz) => (
                  <option key={juz.id} value={juz.id}>
                    {juz.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Surat */}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">
                📖 Surat / Bagian
              </label>
              <select
                className="select select-bordered select-sm w-full text-gray-800 bg-white"
                value={formData.suratId}
                onChange={(e) =>
                  setFormData({ ...formData, suratId: e.target.value })
                }
              >
                <option value="">-- Pilih Surat --</option>
                {suratListForm.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Halaman */}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">
                📄 Halaman (Range)
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  min="1"
                  className="input input-bordered input-sm flex-1 text-gray-800 bg-white"
                  placeholder="Mulai"
                  value={formData.halamanMulai}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      halamanMulai: e.target.value,
                    })
                  }
                />
                <span className="text-gray-600">sampai</span>
                <input
                  type="number"
                  min="1"
                  className="input input-bordered input-sm flex-1 text-gray-800 bg-white"
                  placeholder="Selesai"
                  value={formData.halamanSelesai}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      halamanSelesai: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* Voice Note URL */}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">
                🎙️ Link Voice Note (Telegram)
              </label>
              <input
                type="url"
                className="input input-bordered input-sm w-full text-gray-800 bg-white"
                placeholder="https://telegra.ph/file/... (nanti otomatis dari Telegram)"
                value={formData.voiceNoteUrl}
                onChange={(e) =>
                  setFormData({ ...formData, voiceNoteUrl: e.target.value })
                }
              />
              <p className="text-[10px] text-gray-500 mt-1">
                📸 Nanti otomatis keisi kalau lo kirim voice note ke Telegram
                bot.
              </p>
            </div>

            {/* Kesalahan */}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">
                ⚠️ Kesalahan (isi berapa kali)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {jenisKesalahanList.map((jk) => (
                  <div key={jk.id}>
                    <label className="text-[10px] text-gray-500 block">
                      {jk.label}
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="input input-bordered input-xs w-full text-gray-800 bg-white"
                      placeholder="0"
                      value={formData.kesalahan[jk.id] || ""}
                      onChange={(e) =>
                        handleUpdateKesalahan(jk.id, e.target.value)
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Catatan */}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">
                📝 Catatan
              </label>
              <textarea
                className="textarea textarea-bordered w-full text-sm text-gray-800 bg-white"
                rows="3"
                placeholder="Catatan murajaah minggu ini..."
                value={formData.catatan}
                onChange={(e) =>
                  setFormData({ ...formData, catatan: e.target.value })
                }
              />
            </div>

            {/* Error */}
            {errorMsg && (
              <div className="alert alert-error py-2 text-xs">
                <span>⚠️ {errorMsg}</span>
              </div>
            )}

            {/* Tombol */}
            <div className="flex gap-2">
              <button
                className="btn btn-primary btn-sm flex-1"
                onClick={handleSimpan}
              >
                💾 Simpan
              </button>
              <button
                className="btn btn-ghost btn-sm text-gray-700"
                onClick={() => {
                  setShowForm(false);
                  setEditingDate(null);
                }}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIST ENTRY MINGGU INI */}
      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          <h3 className="text-sm font-bold text-gray-800 mb-3">
            📋 Murajaah Minggu Ini ({entriesMingguIni.length})
          </h3>
          {entriesMingguIni.length === 0 ? (
            <p className="text-sm text-gray-400 italic text-center py-6">
              Belum ada murajaah minggu ini. Klik "+ Tambah Murajaah".
            </p>
          ) : (
            <div className="space-y-2">
              {entriesMingguIni.map((entry) => (
                <div
                  key={entry.tanggal}
                  className="p-3 rounded border border-gray-200 bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">
                        📅 {formatTanggalPendek(entry.tanggal)}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        📖 {getSuratLabel(entry.suratId)} • 📄{" "}
                        {entry.halamanMulai}--{entry.halamanSelesai}
                      </p>
                      {getTotalKesalahan(entry.kesalahan) > 0 && (
                        <p className="text-xs text-red-600 mt-1">
                          ⚠️ {formatKesalahan(entry.kesalahan)}
                        </p>
                      )}
                      {entry.catatan && (
                        <p className="text-xs text-gray-600 mt-1 whitespace-pre-wrap">
                          📝 {entry.catatan}
                        </p>
                      )}
                      {entry.voiceNoteUrl && (
                        <a
                          href={entry.voiceNoteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs link link-primary mt-1 inline-block"
                        >
                          🎙️ Voice Note
                        </a>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        className="btn btn-ghost btn-xs"
                        onClick={() => handleBukaEdit(entry)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-ghost btn-xs text-red-500"
                        onClick={() => handleHapus(entry.tanggal)}
                        title="Hapus"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* HISTORY MINGGU */}
      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-gray-800">
              📚 History Mingguan ({historyMinggu.length})
            </h3>
            <button
              className="btn btn-ghost btn-xs text-gray-600"
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? "▲ Sembunyikan" : "▼ Tampilkan"}
            </button>
          </div>
          {showHistory && (
            <>
              {historyMinggu.length === 0 ? (
                <p className="text-xs text-gray-400 italic text-center py-4">
                  Belum ada history.
                </p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {historyMinggu.map((mg) => (
                    <details
                      key={mg.key}
                      className="border border-gray-200 rounded p-2 bg-gray-50"
                    >
                      <summary className="text-sm font-semibold text-gray-800 cursor-pointer">
                        📅 {mg.label} ({mg.entries.length} entry)
                      </summary>
                      <div className="mt-2 space-y-1">
                        {mg.entries.map((e) => (
                          <div
                            key={e.tanggal}
                            className="bg-white p-2 rounded border border-gray-200 text-xs"
                          >
                            <p className="font-semibold text-gray-700">
                              {formatTanggalPendek(e.tanggal)} —{" "}
                              {getSuratLabel(e.suratId)} ({e.halamanMulai}-
                              {e.halamanSelesai})
                            </p>
                            {getTotalKesalahan(e.kesalahan) > 0 && (
                              <p className="text-red-600">
                                ⚠️ {formatKesalahan(e.kesalahan)}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}