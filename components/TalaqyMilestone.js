 // components/TalaqyMilestone.js
"use client";

import { useState, useMemo } from "react";
import {
  DEFAULT_MILESTONE,
  DEFAULT_JENIS_KESALAHAN,
  formatTanggal,
  formatTanggalPendek,
  hitungProgressJuz,
  hitungTotalHalamanJuz,
  getMilestoneStatus,
  getTotalKesalahan,
  formatKesalahan,
} from "@/lib/hafalanData";

export default function TalaqyMilestone({
  juzId,
  hafalanMembaca = {},
  hafalanTalaqy = {},
  jenisKesalahanList = DEFAULT_JENIS_KESALAHAN,
  onUpdateTalaqy,
}) {
  const [showForm, setShowForm] = useState(false);
  const [activeMilestone, setActiveMilestone] = useState(null);
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split("T")[0],
    voiceNoteUrl: "",
    kesalahan: {},
    catatan: "",
  });
  const [errorMsg, setErrorMsg] = useState("");

  // ========== HITUNG PROGRESS JUZ ==========
  const halamanSelesai = useMemo(() => {
    return hitungProgressJuz(hafalanMembaca, juzId);
  }, [hafalanMembaca, juzId]);

  const totalHalaman = hitungTotalHalamanJuz(juzId);

  const { persen, milestones } = useMemo(() => {
    return getMilestoneStatus(juzId, halamanSelesai);
  }, [juzId, halamanSelesai]);

  // ========== DATA TALAQY JUZ INI ==========
  const talaqyJuz = hafalanTalaqy?.[juzId] || {};

  // ========== BUKA FORM ==========
  const handleBukaForm = (milestoneId) => {
    setActiveMilestone(milestoneId);
    const existing = talaqyJuz[milestoneId];
    if (existing) {
      setFormData({
        tanggal: existing.tanggal || new Date().toISOString().split("T")[0],
        voiceNoteUrl: existing.voiceNoteUrl || "",
        kesalahan: existing.kesalahan || {},
        catatan: existing.catatan || "",
      });
    } else {
      setFormData({
        tanggal: new Date().toISOString().split("T")[0],
        voiceNoteUrl: "",
        kesalahan: {},
        catatan: "",
      });
    }
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
    if (!activeMilestone) {
      setErrorMsg("Milestone belum dipilih.");
      return;
    }

    const updated = JSON.parse(JSON.stringify(hafalanTalaqy || {}));
    if (!updated[juzId]) updated[juzId] = {};
    updated[juzId][activeMilestone] = {
      milestoneId: activeMilestone,
      tanggal: formData.tanggal,
      voiceNoteUrl: formData.voiceNoteUrl,
      kesalahan: formData.kesalahan,
      totalKesalahan: getTotalKesalahan(formData.kesalahan),
      catatan: formData.catatan,
      updatedAt: new Date().toISOString(),
    };
    onUpdateTalaqy(updated);
    setShowForm(false);
    setActiveMilestone(null);
  };

  // ========== HAPUS ==========
  const handleHapus = (milestoneId) => {
    if (!confirm("Hapus talaqy milestone ini?")) return;
    const updated = JSON.parse(JSON.stringify(hafalanTalaqy || {}));
    if (updated[juzId]) {
      delete updated[juzId][milestoneId];
    }
    onUpdateTalaqy(updated);
  };

  // ========== HELPER ==========
  const getMilestoneLabel = (id) => {
    return DEFAULT_MILESTONE.find((m) => m.id === id)?.label || id;
  };

  return (
    <div className="space-y-4">
      {/* REMINDER */}
      <div className="alert alert-info py-2 text-xs">
        <span>
          📌 Talaqy diisi per milestone (1/4 juz, 1/2 juz, 1 juz). Rekam voice
          note, kirim ke Telegram bot, catat kesalahan.
        </span>
      </div>

      {/* PROGRESS JUZ */}
      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold text-gray-800">
              📊 Progress Juz
            </h3>
            <span className="badge badge-primary badge-sm font-bold">
              {persen}%
            </span>
          </div>
          <progress
            className="progress progress-primary w-full h-3"
            value={persen}
            max="100"
          />
          <p className="text-xs text-gray-500 mt-2">
            {halamanSelesai} / {totalHalaman} halaman
          </p>
        </div>
      </div>

      {/* MILESTONE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {milestones.map((m) => {
          const talaqyEntry = talaqyJuz[m.id];
          const sudahDiisi = !!talaqyEntry;

          return (
            <div
              key={m.id}
              className={`card shadow border ${
                m.tercapai
                  ? "bg-gradient-to-br from-green-50 to-blue-50 border-green-300"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="card-body p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-sm font-bold text-gray-800">
                    🎯 {m.label}
                  </h4>
                  {m.tercapai && (
                    <span className="text-xs badge badge-success badge-sm">
                      ✅ Tercapai
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mb-2">
                  Target: {m.persen}% progress juz
                </p>

                {sudahDiisi ? (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-600">
                      📅 {formatTanggalPendek(talaqyEntry.tanggal)}
                    </p>
                    {talaqyEntry.totalKesalahan > 0 && (
                      <p className="text-xs text-red-600">
                        ⚠️ Total: {talaqyEntry.totalKesalahan} kesalahan
                      </p>
                    )}
                    {talaqyEntry.voiceNoteUrl && (
                      <a
                        href={talaqyEntry.voiceNoteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs link link-primary inline-block"
                      >
                        🎙️ Voice Note
                      </a>
                    )}
                    <div className="flex gap-1 mt-2">
                      <button
                        className="btn btn-ghost btn-xs flex-1"
                        onClick={() => handleBukaForm(m.id)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="btn btn-ghost btn-xs text-red-500"
                        onClick={() => handleHapus(m.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    className="btn btn-primary btn-xs w-full"
                    onClick={() => handleBukaForm(m.id)}
                    disabled={!m.tercapai}
                    title={
                      !m.tercapai
                        ? "Milestone belum tercapai"
                        : "Isi talaqy"
                    }
                  >
                    {m.tercapai ? "➕ Isi Talaqy" : "🔒 Belum Tercapai"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* FORM TALAQY */}
      {showForm && activeMilestone && (
        <div className="card bg-white shadow border border-blue-300">
          <div className="card-body p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-gray-800">
                ✏️ Talaqy — {getMilestoneLabel(activeMilestone)}
              </h3>
              <button
                className="btn btn-ghost btn-xs text-gray-500"
                onClick={() => {
                  setShowForm(false);
                  setActiveMilestone(null);
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
                📸 Nanti otomatis keisi kalau lo kirim voice note talaqy ke
                Telegram bot.
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
              {getTotalKesalahan(formData.kesalahan) > 0 && (
                <p className="text-xs text-red-600 mt-1">
                  Total: {getTotalKesalahan(formData.kesalahan)} kesalahan
                </p>
              )}
            </div>

            {/* Catatan */}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">
                📝 Catatan
              </label>
              <textarea
                className="textarea textarea-bordered w-full text-sm text-gray-800 bg-white"
                rows="3"
                placeholder="Catatan talaqy milestone ini..."
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
                  setActiveMilestone(null);
                }}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HISTORY TALAQY */}
      {Object.keys(talaqyJuz).length > 0 && (
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">
              📚 History Talaqy ({Object.keys(talaqyJuz).length})
            </h3>
            <div className="space-y-2">
              {Object.entries(talaqyJuz).map(([milestoneId, entry]) => (
                <div
                  key={milestoneId}
                  className="p-3 rounded border border-gray-200 bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">
                        🎯 {getMilestoneLabel(milestoneId)}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        📅 {formatTanggal(entry.tanggal)}
                      </p>
                      {entry.totalKesalahan > 0 && (
                        <p className="text-xs text-red-600 mt-1">
                          ⚠️ {entry.totalKesalahan} kesalahan —{" "}
                          {formatKesalahan(entry.kesalahan)}
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