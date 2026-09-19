// components/KalenderBelajar.js
"use client";

import { useState, useMemo } from "react";
import { HOLIDAYS } from "@/lib/holidays";
import {
  getLabelKategoriById,
  getDefaultTargetByKategori,
  formatTanggal,
} from "@/lib/belajarData";

export default function KalenderBelajar({
  kategoriId = "design",
  kategoriData = [],
  logHarian = {},
  targetHarian = {},
  onUpdateLog,
  onUpdateTarget,
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editTargetMode, setEditTargetMode] = useState(false);
  const [targetInput, setTargetInput] = useState("");

  // ========== FORM STATE ==========
  const [formData, setFormData] = useState({
    subKategoriId: "",
    toolId: "",
    fiturId: "",
    partId: "",
    catatan: "",
    gdriveUrl: "",
  });
  const [errorMsg, setErrorMsg] = useState("");

  // ========== AMBIL DATA KATEGORI ==========
  const kategoriObj = useMemo(() => {
    return (kategoriData || []).find((k) => k.id === kategoriId);
  }, [kategoriData, kategoriId]);

  const subKategoriList = kategoriObj?.subKategori || [];

  // ========== TARGET HARIAN ==========
  const defaultTarget = getDefaultTargetByKategori(kategoriId);
  const currentTarget = targetHarian[kategoriId] || defaultTarget;

  // ========== GENERATE KALENDER ==========
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

  // ========== NAVIGASI ==========
  const nextMonth = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const prevMonth = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextYear = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear() + 1, currentMonth.getMonth(), 1));
  const prevYear = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear() - 1, currentMonth.getMonth(), 1));
  const goToToday = () => {
    const now = new Date();
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(now.toISOString().split("T")[0]);
  };

  const handleMonthChange = (e) =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), parseInt(e.target.value), 1));
  const handleYearChange = (e) =>
    setCurrentMonth(new Date(parseInt(e.target.value), currentMonth.getMonth(), 1));

  // ========== LOG DI TANGGAL ==========
  const logDiTanggal = selectedDate ? (logHarian[selectedDate] || []) : [];
  const logDiTanggalByKategori = logDiTanggal.filter((l) => l.kategoriId === kategoriId);

  // ========== DAPETIN PATH LABEL ==========
  const getLabelByPath = (log) => {
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

  // ========== KLIK TANGGAL ==========
  const handleDateClick = (date) => {
    if (date === selectedDate) {
      setSelectedDate(null);
      setShowForm(false);
      setEditingIndex(null);
      return;
    }
    setSelectedDate(date);
    setShowForm(false);
    setEditingIndex(null);
    setErrorMsg("");
    resetFormData();
  };

  // ========== RESET FORM ==========
  const resetFormData = () => {
    setFormData({
      subKategoriId: subKategoriList[0]?.id || "",
      toolId: "",
      fiturId: "",
      partId: "",
      catatan: "",
      gdriveUrl: "",
    });
  };

  // ========== TOOL LIST (dari sub-kategori terpilih) ==========
  const subKategoriTerpilih = subKategoriList.find((s) => s.id === formData.subKategoriId);
  const toolList = subKategoriTerpilih?.tools || [];

  const toolTerpilih = toolList.find((t) => t.id === formData.toolId);
  const fiturList = toolTerpilih?.fitur || [];

  const fiturTerpilih = fiturList.find((f) => f.id === formData.fiturId);
  const partList = fiturTerpilih?.parts || [];

  // ========== BUKA FORM TAMBAH ==========
  const handleBukaFormTambah = () => {
    resetFormData();
    setEditingIndex(null);
    setErrorMsg("");
    setShowForm(true);
  };

  // ========== BUKA FORM EDIT ==========
  const handleEdit = (index) => {
    const log = logDiTanggalByKategori[index];
    // Cari index sebenarnya di logDiTanggal
    const realIndex = logDiTanggal.findIndex((l) => l === log);
    setFormData({
      subKategoriId: log.subKategoriId || "",
      toolId: log.toolId || "",
      fiturId: log.fiturId || "",
      partId: log.partId || "",
      catatan: log.catatan || "",
      gdriveUrl: log.gdriveUrl || "",
    });
    setEditingIndex(realIndex);
    setErrorMsg("");
    setShowForm(true);
  };

  // ========== SIMPAN LOG ==========
  const handleSimpan = () => {
    setErrorMsg("");

    if (!formData.subKategoriId) {
      setErrorMsg("Pilih sub-kategori dulu.");
      return;
    }
    if (!formData.toolId) {
      setErrorMsg("Pilih tool dulu.");
      return;
    }
    if (!formData.catatan.trim() && !formData.gdriveUrl.trim()) {
      setErrorMsg("Isi catatan atau link GDrive.");
      return;
    }

    const updated = JSON.parse(JSON.stringify(logHarian || {}));
    if (!updated[selectedDate]) updated[selectedDate] = [];

    const newLog = {
      id: editingIndex !== null ? logDiTanggal[editingIndex]?.id : `log_${Date.now()}`,
      kategoriId,
      subKategoriId: formData.subKategoriId,
      toolId: formData.toolId,
      fiturId: formData.fiturId || "",
      partId: formData.partId || "",
      catatan: formData.catatan,
      gdriveUrl: formData.gdriveUrl,
      telegramMessageId: "", // Nanti diisi bot Telegram
      updatedAt: new Date().toISOString(),
    };

    if (editingIndex !== null) {
      // Hapus yang lama, tambah yang baru (biar bisa pindah kategori juga)
      const oldLog = logDiTanggal[editingIndex];
      updated[selectedDate] = updated[selectedDate].filter((l) => l !== oldLog);
      updated[selectedDate].push(newLog);
    } else {
      updated[selectedDate].push(newLog);
    }

    onUpdateLog(updated);
    setShowForm(false);
    setEditingIndex(null);
    resetFormData();
  };

  // ========== HAPUS LOG ==========
  const handleHapus = (index) => {
    if (!confirm("Hapus catatan belajar ini?")) return;
    const logToDelete = logDiTanggalByKategori[index];
    const realIndex = logDiTanggal.findIndex((l) => l === logToDelete);
    const updated = JSON.parse(JSON.stringify(logHarian || {}));
    updated[selectedDate] = updated[selectedDate].filter((l) => l !== logToDelete);
    if (updated[selectedDate].length === 0) {
      delete updated[selectedDate];
    }
    onUpdateLog(updated);
  };

  // ========== EDIT TARGET ==========
  const handleBukaEditTarget = () => {
    setTargetInput(currentTarget.target);
    setEditTargetMode(true);
  };

  const handleSimpanTarget = () => {
    const t = parseInt(targetInput);
    if (!t || t <= 0) return;
    onUpdateTarget({
      ...targetHarian,
      [kategoriId]: { ...currentTarget, target: t },
    });
    setEditTargetMode(false);
  };

  // ========== HELPER ==========
  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear - 1; y <= currentYear + 5; y++) years.push(y);

  const todayStr = new Date().toISOString().split("T")[0];

  const getLogCountByDate = (date) => {
    const logs = logHarian[date] || [];
    return logs.filter((l) => l.kategoriId === kategoriId).length;
  };

  const hitungLogHariIni = logDiTanggalByKategori.length;
  const targetTercapai = hitungLogHariIni >= (currentTarget.target || 1);

  return (
    <div className="space-y-4">
      {/* TARGET HARIAN */}
      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">
                🎯 Target Harian — {getLabelKategoriById(kategoriData, kategoriId)}
              </span>
              {!editTargetMode ? (
                <>
                  <span className="text-sm font-bold text-blue-700">
                    {currentTarget.target} {currentTarget.satuan}
                  </span>
                  <button
                    className="btn btn-ghost btn-xs text-gray-500"
                    onClick={handleBukaEditTarget}
                    title="Edit target"
                  >
                    ✏️
                  </button>
                </>
              ) : (
                <>
                  <input
                    type="number"
                    min="1"
                    className="input input-bordered input-xs w-16 text-gray-800 bg-white"
                    value={targetInput}
                    onChange={(e) => setTargetInput(e.target.value)}
                    autoFocus
                  />
                  <span className="text-xs text-gray-600">{currentTarget.satuan}</span>
                  <button className="btn btn-primary btn-xs" onClick={handleSimpanTarget}>
                    ✓
                  </button>
                  <button
                    className="btn btn-ghost btn-xs"
                    onClick={() => setEditTargetMode(false)}
                  >
                    ✕
                  </button>
                </>
              )}
            </div>
            <span className="text-xs text-gray-500">
              Target diisi per kategori, bisa diubah kapan aja
            </span>
          </div>
        </div>
      </div>

      {/* KALENDER */}
      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          {/* Navigasi */}
          <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
            <div className="flex items-center gap-1">
              <button className="btn btn-ghost btn-sm text-gray-700" onClick={prevYear} title="Tahun sebelumnya">
                «
              </button>
              <button className="btn btn-ghost btn-sm text-gray-700" onClick={prevMonth} title="Bulan sebelumnya">
                ‹
              </button>
            </div>
            <div className="flex items-center gap-2">
              <select
                className="select select-bordered select-sm text-gray-800 bg-white"
                value={currentMonth.getMonth()}
                onChange={handleMonthChange}
              >
                {monthNames.map((name, idx) => (
                  <option key={idx} value={idx}>{name}</option>
                ))}
              </select>
              <select
                className="select select-bordered select-sm text-gray-800 bg-white"
                value={currentMonth.getFullYear()}
                onChange={handleYearChange}
              >
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1">
              <button className="btn btn-ghost btn-sm text-gray-700" onClick={nextMonth} title="Bulan berikutnya">
                ›
              </button>
              <button className="btn btn-ghost btn-sm text-gray-700" onClick={nextYear} title="Tahun berikutnya">
                »
              </button>
            </div>
          </div>

          <div className="flex justify-center mb-3">
            <button className="btn btn-outline btn-xs text-gray-700" onClick={goToToday}>
              📅 Hari Ini
            </button>
          </div>

          {/* Header hari */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {dayNames.map((day) => (
              <div key={day} className="text-center text-xs font-bold text-gray-600 bg-gray-100 py-2 rounded">
                {day}
              </div>
            ))}
          </div>

          {/* Grid tanggal */}
          <div className="grid grid-cols-7 gap-1">
            {generateCalendar().map((item, idx) => {
              if (!item) return <div key={idx} className="aspect-square" />;
              const isSelected = item.date === selectedDate;
              const isToday = item.date === todayStr;
              const logCount = getLogCountByDate(item.date);
              const holiday = HOLIDAYS[item.date];
              const isHolidayDate = !!holiday;

              let boxClass = "bg-white text-gray-800 border-gray-200 hover:bg-gray-100";
              if (isToday && !isSelected && !isHolidayDate) {
                boxClass = "bg-yellow-50 text-gray-900 border-yellow-300 font-bold";
              }
              if (isHolidayDate && !isSelected) {
                boxClass = "bg-red-600 text-white border-red-700 font-bold";
              }
              if (isSelected) {
                boxClass = "bg-blue-100 text-blue-900 border-2 border-blue-600 font-bold ring-1 ring-blue-300";
              }

              return (
                <button
                  key={item.date}
                  className={`aspect-square rounded border ${boxClass} relative transition text-sm`}
                  onClick={() => handleDateClick(item.date)}
                  title={holiday || ""}
                >
                  <span className="absolute top-1 left-2">{item.day}</span>
                  {logCount > 0 && (
                    <span className="absolute bottom-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-green-500 text-white text-[9px] flex items-center justify-center font-bold">
                      {logCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legenda */}
          <div className="flex flex-wrap gap-3 mt-4 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 rounded bg-red-600 border border-red-700" />
              <span>Libur Nasional</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 rounded bg-yellow-50 border border-yellow-300" />
              <span>Hari Ini</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 rounded bg-blue-100 border-2 border-blue-600" />
              <span>Tanggal Dipilih</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 rounded-full bg-green-500 text-white text-[8px] flex items-center justify-center font-bold">
                1
              </span>
              <span>Ada Catatan Belajar</span>
            </div>
          </div>
        </div>
      </div>

      {/* DETAIL TANGGAL */}
      {selectedDate && (
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-4">
            <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
              <div>
                <h3 className="text-base font-bold text-gray-800">
                  📌 {formatTanggal(selectedDate, "panjang")}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {hitungLogHariIni} catatan • Target {currentTarget.target} {currentTarget.satuan}{" "}
                  {targetTercapai && <span className="text-green-600 font-bold">✅ Tercapai</span>}
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
              <div className="bg-blue-50 rounded p-3 space-y-3 border border-blue-200 mb-3">
                <p className="text-xs font-semibold text-blue-700">
                  {editingIndex !== null ? "✏️ Edit Catatan Belajar" : "✏️ Tambah Catatan Belajar"}
                </p>

                {/* Sub-kategori */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Sub-Kategori</label>
                  <select
                    className="select select-bordered select-sm w-full text-gray-800 bg-white"
                    value={formData.subKategoriId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        subKategoriId: e.target.value,
                        toolId: "",
                        fiturId: "",
                        partId: "",
                      })
                    }
                  >
                    <option value="">-- Pilih Sub-Kategori --</option>
                    {subKategoriList.map((s) => (
                      <option key={s.id} value={s.id}>{s.nama}</option>
                    ))}
                  </select>
                </div>

                {/* Tool */}
                {formData.subKategoriId && (
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Tool</label>
                    <select
                      className="select select-bordered select-sm w-full text-gray-800 bg-white"
                      value={formData.toolId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          toolId: e.target.value,
                          fiturId: "",
                          partId: "",
                        })
                      }
                    >
                      <option value="">-- Pilih Tool --</option>
                      {toolList.map((t) => (
                        <option key={t.id} value={t.id}>{t.nama}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Fitur */}
                {formData.toolId && fiturList.length > 0 && (
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Fitur / Materi</label>
                    <select
                      className="select select-bordered select-sm w-full text-gray-800 bg-white"
                      value={formData.fiturId}
                      onChange={(e) =>
                        setFormData({ ...formData, fiturId: e.target.value, partId: "" })
                      }
                    >
                      <option value="">-- Pilih Fitur --</option>
                      {fiturList.map((f) => (
                        <option key={f.id} value={f.id}>{f.nama}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Part (kalau ada) */}
                {formData.fiturId && partList.length > 0 && (
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Part</label>
                    <select
                      className="select select-bordered select-sm w-full text-gray-800 bg-white"
                      value={formData.partId}
                      onChange={(e) => setFormData({ ...formData, partId: e.target.value })}
                    >
                      <option value="">-- Pilih Part --</option>
                      {partList.map((p) => (
                        <option key={p.id} value={p.id}>{p.nama}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Catatan */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">📝 Catatan</label>
                  <textarea
                    className="textarea textarea-bordered w-full text-sm text-gray-800 bg-white"
                    rows="3"
                    placeholder="Catatan belajar hari ini... (apa yang dipelajari, apa yang udah paham, apa yang masih bingung)"
                    value={formData.catatan}
                    onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                  />
                </div>

                {/* GDrive */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">
                    📁 Link Google Drive (opsional)
                  </label>
                  <input
                    type="url"
                    className="input input-bordered input-sm w-full text-gray-800 bg-white"
                    placeholder="https://drive.google.com/..."
                    value={formData.gdriveUrl}
                    onChange={(e) => setFormData({ ...formData, gdriveUrl: e.target.value })}
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    📸 Nanti bisa juga via Telegram (kirim catatan → otomatis muncul di sini).
                  </p>
                </div>

                {errorMsg && (
                  <div className="alert alert-error py-2 text-xs">
                    <span>⚠️ {errorMsg}</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <button className="btn btn-primary btn-sm flex-1" onClick={handleSimpan}>
                    {editingIndex !== null ? "💾 Simpan" : "➕ Tambah"}
                  </button>
                  <button
                    className="btn btn-ghost btn-sm text-gray-700"
                    onClick={() => {
                      setShowForm(false);
                      setEditingIndex(null);
                    }}
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}

            {/* LIST LOG */}
            {!showForm && logDiTanggalByKategori.length === 0 && (
              <div className="text-center py-6 text-gray-400">
                <p className="text-2xl mb-2">📖</p>
                <p className="text-sm">Belum ada catatan belajar di tanggal ini.</p>
              </div>
            )}

            {!showForm && logDiTanggalByKategori.length > 0 && (
              <div className="space-y-2">
                {logDiTanggalByKategori.map((log, idx) => (
                  <div
                    key={log.id || idx}
                    className="p-3 rounded border border-gray-200 bg-gray-50"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">
                          {getLabelByPath(log)}
                        </p>
                        {log.catatan && (
                          <p className="text-xs text-gray-700 whitespace-pre-wrap mt-1 bg-white p-2 rounded border border-gray-200">
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
                      <div className="flex gap-1">
                        <button
                          className="btn btn-ghost btn-xs"
                          onClick={() => handleEdit(idx)}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-ghost btn-xs text-red-500"
                          onClick={() => handleHapus(idx)}
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
      )}

      {!selectedDate && (
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-8 text-center text-gray-400">
            <p className="text-3xl mb-2">👆</p>
            <p className="text-sm">Klik salah satu tanggal di kalender untuk lihat / tambah catatan belajar.</p>
          </div>
        </div>
      )}
    </div>
  );
}