// components/KalenderYouTube.js
"use client";

import { useState, useMemo } from "react";
import { HOLIDAYS } from "@/lib/holidays";
import { formatTanggal } from "@/lib/belajarData";
import {
  KONTEN_STATUS,
  TIPE_KONTEN,
  getTargetHarian,
  generateYoutubeId,
} from "@/lib/youtubeData";

export default function KalenderYouTube({
  channelId,
  channelNama,
  logs = [],
  onUpdateLog,
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingLogId, setEditingLogId] = useState(null);
  const [formData, setFormData] = useState({
    judul: "",
    tipe: "short",
    status: "idea",
    linkYoutube: "",
    gdriveUrl: "",
    catatan: "",
  });
  const [errorMsg, setErrorMsg] = useState("");

  const channelLogs = useMemo(
    () => logs.filter((l) => l.channel === channelId),
    [logs, channelId]
  );

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

  const logDiTanggal = selectedDate
    ? channelLogs.filter((l) => l.tanggal === selectedDate)
    : [];

  const logBulanIni = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const prefix = `${year}-${String(month + 1).padStart(2, "0")}`;
    return channelLogs
      .filter((l) => l.tanggal && l.tanggal.startsWith(prefix))
      .sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  }, [channelLogs, currentMonth]);

  const resetForm = () => {
    setFormData({
      judul: "",
      tipe: "short",
      status: "idea",
      linkYoutube: "",
      gdriveUrl: "",
      catatan: "",
    });
    setEditingLogId(null);
    setErrorMsg("");
  };

  const handleDateClick = (date) => {
    if (date === selectedDate) {
      setSelectedDate(null);
      setShowForm(false);
      setEditingLogId(null);
      return;
    }
    setSelectedDate(date);
    setShowForm(false);
    resetForm();
  };

  const handleBukaFormTambah = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEdit = (log) => {
    setFormData({
      judul: log.judul || "",
      tipe: log.tipe || "short",
      status: log.status || "idea",
      linkYoutube: log.linkYoutube || "",
      gdriveUrl: log.gdriveUrl || "",
      catatan: log.catatan || "",
    });
    setEditingLogId(log.id);
    setErrorMsg("");
    setShowForm(true);
  };

  const handleSimpan = () => {
    setErrorMsg("");
    if (!formData.judul.trim()) {
      setErrorMsg("Isi judul dulu.");
      return;
    }
    if (!selectedDate) {
      setErrorMsg("Tanggal belum dipilih.");
      return;
    }

    const newLog = {
      id: editingLogId || generateYoutubeId(),
      channel: channelId,
      tanggal: selectedDate,
      judul: formData.judul,
      tipe: formData.tipe,
      status: formData.status,
      linkYoutube: formData.linkYoutube,
      gdriveUrl: formData.tipe === "video" ? formData.gdriveUrl : "",
      catatan: formData.catatan,
      updatedAt: new Date().toISOString(),
    };

    let updated;
    if (editingLogId) updated = logs.map((l) => (l.id === editingLogId ? newLog : l));
    else updated = [...logs, newLog];

    onUpdateLog(updated);
    setShowForm(false);
    setEditingLogId(null);
    resetForm();
  };

  const handleHapus = (log) => {
    if (!confirm("Hapus konten ini?")) return;
    const updated = logs.filter((l) => l.id !== log.id);
    onUpdateLog(updated);
    setShowForm(false);
    setEditingLogId(null);
  };

  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear - 1; y <= currentYear + 5; y++) years.push(y);
  const todayStr = new Date().toISOString().split("T")[0];

  const getLogsByDate = (date) => channelLogs.filter((l) => l.tanggal === date);

  const getStatusStyle = (statusId) => {
    const s = KONTEN_STATUS.find((x) => x.id === statusId);
    return s || KONTEN_STATUS[0];
  };

  return (
    <div className="space-y-4">
      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
            <div className="flex items-center gap-1">
              <button className="btn btn-ghost btn-sm text-gray-700" onClick={prevYear}>«</button>
              <button className="btn btn-ghost btn-sm text-gray-700" onClick={prevMonth}>‹</button>
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
              <button className="btn btn-ghost btn-sm text-gray-700" onClick={nextMonth}>›</button>
              <button className="btn btn-ghost btn-sm text-gray-700" onClick={nextYear}>»</button>
            </div>
          </div>

          <div className="flex justify-center mb-3">
            <button className="btn btn-outline btn-xs text-gray-700" onClick={goToToday}>
              📅 Hari Ini
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {dayNames.map((day) => (
              <div key={day} className="text-center text-xs font-bold text-gray-600 bg-gray-100 py-2 rounded">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {generateCalendar().map((item, idx) => {
              if (!item) return <div key={idx} className="aspect-square" />;
              const isSelected = item.date === selectedDate;
              const isToday = item.date === todayStr;
              const dayLogs = getLogsByDate(item.date);
              const holiday = HOLIDAYS[item.date];
              const isHolidayDate = !!holiday;
              const target = getTargetHarian(item.date);

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
                  className={`aspect-square rounded border ${boxClass} relative transition text-sm p-1 flex flex-col`}
                  onClick={() => handleDateClick(item.date)}
                  title={holiday || ""}
                >
                  <span className="text-xs">{item.day}</span>
                  <div className="flex-1 flex flex-col gap-0.5 mt-0.5 overflow-hidden">
                    {dayLogs.slice(0, 3).map((log, i) => {
                      const statusStyle = getStatusStyle(log.status);
                      return (
                        <div
                          key={log.id || i}
                          className={`${statusStyle.color} text-white text-[8px] px-1 rounded truncate leading-tight`}
                          title={log.judul}
                        >
                          {log.tipe === "short" ? "📱" : "🖥️"} {log.judul}
                        </div>
                      );
                    })}
                    {dayLogs.length > 3 && (
                      <span className="text-[8px] text-gray-500 leading-none">
                        +{dayLogs.length - 3}
                      </span>
                    )}
                  </div>
                  {dayLogs.length > 0 && (
                    <span className="absolute top-0.5 right-1 text-[8px] font-mono text-gray-400">
                      {dayLogs.length}/{target.target}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

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
              <span className="w-4 h-2 rounded bg-blue-500" />
              <span>Bar = konten (warna per status)</span>
            </div>
          </div>
        </div>
      </div>

      {selectedDate && (
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-4">
            <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
              <div>
                <h3 className="text-base font-bold text-gray-800">
                  📌 {formatTanggal(selectedDate, "panjang")}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {logDiTanggal.length} konten • Target {getTargetHarian(selectedDate).target}{" "}
                  {getTargetHarian(selectedDate).satuan}
                </p>
              </div>
              {!showForm && (
                <button className="btn btn-primary btn-sm" onClick={handleBukaFormTambah}>
                  + Tambah Konten
                </button>
              )}
            </div>

            {showForm && (
              <div className="bg-blue-50 rounded p-3 space-y-3 border border-blue-200 mb-3">
                <p className="text-xs font-semibold text-blue-700">
                  {editingLogId ? "✏️ Edit Konten" : "✏️ Tambah Konten"}
                </p>

                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">
                    Judul Konten
                  </label>
                  <input
                    type="text"
                    className="input input-bordered input-sm w-full text-gray-800 bg-white"
                    value={formData.judul}
                    onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                    placeholder="Judul / ide konten..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">
                      Tipe
                    </label>
                    <select
                      className="select select-bordered select-sm w-full text-gray-800 bg-white"
                      value={formData.tipe}
                      onChange={(e) => setFormData({ ...formData, tipe: e.target.value })}
                    >
                      {TIPE_KONTEN.map((t) => (
                        <option key={t.id} value={t.id}>{t.nama}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">
                      Status
                    </label>
                    <select
                      className="select select-bordered select-sm w-full text-gray-800 bg-white"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      {KONTEN_STATUS.map((s) => (
                        <option key={s.id} value={s.id}>{s.nama}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">
                    🔗 Link YouTube
                  </label>
                  <input
                    type="url"
                    className="input input-bordered input-sm w-full text-gray-800 bg-white"
                    placeholder="https://youtube.com/..."
                    value={formData.linkYoutube}
                    onChange={(e) => setFormData({ ...formData, linkYoutube: e.target.value })}
                  />
                </div>

                {formData.tipe === "video" && (
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">
                      📁 Link GDrive (Thumbnail / Mentahan)
                    </label>
                    <input
                      type="url"
                      className="input input-bordered input-sm w-full text-gray-800 bg-white"
                      placeholder="https://drive.google.com/..."
                      value={formData.gdriveUrl}
                      onChange={(e) => setFormData({ ...formData, gdriveUrl: e.target.value })}
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">
                    📝 Catatan
                  </label>
                  <textarea
                    className="textarea textarea-bordered w-full text-sm text-gray-800 bg-white"
                    rows="3"
                    placeholder="Catatan..."
                    value={formData.catatan}
                    onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                  />
                </div>

                {errorMsg && (
                  <div className="alert alert-error py-2 text-xs">
                    <span>⚠️ {errorMsg}</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <button className="btn btn-primary btn-sm flex-1" onClick={handleSimpan}>
                    {editingLogId ? "💾 Simpan" : "➕ Tambah"}
                  </button>
                  <button
                    className="btn btn-ghost btn-sm text-gray-700"
                    onClick={() => {
                      setShowForm(false);
                      setEditingLogId(null);
                      resetForm();
                    }}
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}

            {!showForm && logDiTanggal.length === 0 && (
              <div className="text-center py-6 text-gray-400">
                <p className="text-2xl mb-2">📭</p>
                <p className="text-sm">Belum ada konten di tanggal ini.</p>
              </div>
            )}

            {!showForm && logDiTanggal.length > 0 && (
              <div className="space-y-2">
                {logDiTanggal.map((log, idx) => {
                  const statusStyle = getStatusStyle(log.status);
                  return (
                    <div key={log.id || idx} className="p-3 rounded border border-gray-200 bg-gray-50">
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className={`w-2 h-2 rounded-full ${statusStyle.color}`} />
                            <p className="text-sm font-semibold text-gray-800">{log.judul}</p>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded text-white ${statusStyle.color}`}>
                              {statusStyle.nama}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {log.tipe === "short" ? "📱 Short" : "🖥️ Video"}
                            {log.linkYoutube && (
                              <>
                                {" • "}
                                <a href={log.linkYoutube} target="_blank" rel="noopener noreferrer" className="link link-primary">
                                  🔗 YouTube
                                </a>
                              </>
                            )}
                            {log.gdriveUrl && (
                              <>
                                {" • "}
                                <a href={log.gdriveUrl} target="_blank" rel="noopener noreferrer" className="link link-primary">
                                  📁 GDrive
                                </a>
                              </>
                            )}
                          </p>
                          {log.catatan && (
                            <p className="text-xs text-gray-700 whitespace-pre-wrap mt-1 bg-white p-2 rounded border border-gray-200">
                              📝 {log.catatan}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <button className="btn btn-ghost btn-xs" onClick={() => handleEdit(log)} title="Edit">✏️</button>
                          <button className="btn btn-ghost btn-xs text-red-500" onClick={() => handleHapus(log)} title="Hapus">🗑️</button>
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
          <h3 className="text-sm font-bold text-gray-800 mb-3">
            📋 Semua Konten — {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()} ({logBulanIni.length})
          </h3>
          {logBulanIni.length === 0 ? (
            <p className="text-xs text-gray-400 italic text-center py-4">
              Belum ada konten di bulan ini.
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {logBulanIni.map((log, idx) => {
                const statusStyle = getStatusStyle(log.status);
                return (
                  <div
                    key={`${log.tanggal}_${log.id || idx}`}
                    className="p-3 rounded border border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100 transition"
                    onClick={() => {
                      setSelectedDate(log.tanggal);
                      setShowForm(false);
                      setEditingLogId(null);
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <span className={`w-2 h-2 rounded-full ${statusStyle.color} mt-1.5 flex-shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <p className="text-sm font-semibold text-gray-800">{log.judul}</p>
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            📅 {formatTanggal(log.tanggal, "pendek")}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {log.tipe === "short" ? "📱 Short" : "🖥️ Video"} • {statusStyle.nama}
                        </p>
                        {log.catatan && (
                          <p className="text-xs text-gray-600 mt-1 whitespace-pre-wrap">
                            {log.catatan.length > 150 ? log.catatan.substring(0, 150) + "..." : log.catatan}
                          </p>
                        )}
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
            <p className="text-2xl mb-2">👆</p>
            <p className="text-sm">
              Klik tanggal di kalender untuk tambah / lihat konten. Atau klik konten di list bawah.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}