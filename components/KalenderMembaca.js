// components/KalenderMembaca.js
"use client";

import { useState } from "react";
import { HOLIDAYS } from "@/lib/holidays";
import {
  getSuratListByJuz,
  hitungHalamanBerikutnya,
  formatTanggal,
} from "@/lib/hafalanData";
import { DEFAULT_ACTIVITIES } from "@/lib/defaultData";

export default function KalenderMembaca({
  hafalanMembaca = {},
  targetHarian = 5,
  juzAktif = "juz_1",
  onUpdateMembaca,
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    juzId: juzAktif,
    suratId: "",
    halamanMulai: "",
    halamanSelesai: "",
    sudah: false,
    catatan: "",
  });
  const [errorMsg, setErrorMsg] = useState("");

  // Ambil daftar semua juz
  const hafalanActivity = DEFAULT_ACTIVITIES.find((a) => a.id === "hafalan");
  const allJuz = hafalanActivity?.children || [];

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
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        d
      ).padStart(2, "0")}`;
      days.push({ day: d, date: dateStr });
    }
    return days;
  };

  // ========== NAVIGASI ==========
  const nextMonth = () =>
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  const prevMonth = () =>
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  const nextYear = () =>
    setCurrentMonth(
      new Date(currentMonth.getFullYear() + 1, currentMonth.getMonth(), 1)
    );
  const prevYear = () =>
    setCurrentMonth(
      new Date(currentMonth.getFullYear() - 1, currentMonth.getMonth(), 1)
    );
  const goToToday = () => {
    const now = new Date();
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(now.toISOString().split("T")[0]);
  };
  const handleMonthChange = (e) =>
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), parseInt(e.target.value), 1)
    );
  const handleYearChange = (e) =>
    setCurrentMonth(
      new Date(parseInt(e.target.value), currentMonth.getMonth(), 1)
    );

  // ========== KLIK TANGGAL ==========
  const handleDateClick = (date) => {
    if (date === selectedDate) {
      setSelectedDate(null);
      setShowForm(false);
      return;
    }
    setSelectedDate(date);
    setShowForm(true);
    setErrorMsg("");

    // Load data lama kalau ada
    const existing = hafalanMembaca[date];
    if (existing) {
      setFormData({
        juzId: existing.juzId || juzAktif,
        suratId: existing.suratId || "",
        halamanMulai: existing.halamanMulai || "",
        halamanSelesai: existing.halamanSelesai || "",
        sudah: existing.sudah || false,
        catatan: existing.catatan || "",
      });
    } else {
      // Auto-suggest halaman berikutnya dari tanggal terakhir
      const tanggalList = Object.keys(hafalanMembaca || {}).sort();
      let halamanSaran = { mulai: 1, selesai: targetHarian };
      if (tanggalList.length > 0) {
        const terakhir = tanggalList[tanggalList.length - 1];
        const entryTerakhir = hafalanMembaca[terakhir];
        if (entryTerakhir?.halamanSelesai) {
          halamanSaran = hitungHalamanBerikutnya(entryTerakhir.halamanSelesai);
        }
      }
      setFormData({
        juzId: juzAktif,
        suratId: "",
        halamanMulai: halamanSaran.mulai,
        halamanSelesai: halamanSaran.selesai,
        sudah: false,
        catatan: "",
      });
    }
  };

  // ========== DAFTAR SURAT (berdasarkan juz yang dipilih di form) ==========
  const suratListForm = getSuratListByJuz(formData.juzId);

  // ========== SIMPAN ==========
  const handleSimpan = () => {
    setErrorMsg("");
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

    const updated = { ...hafalanMembaca };
    updated[selectedDate] = {
      juzId: formData.juzId,
      suratId: formData.suratId,
      halamanMulai: mulai,
      halamanSelesai: selesai,
      sudah: formData.sudah,
      catatan: formData.catatan,
      updatedAt: new Date().toISOString(),
    };
    onUpdateMembaca(updated);
    setShowForm(false);
  };

  // ========== HAPUS ==========
  const handleHapus = () => {
    if (!selectedDate) return;
    if (!confirm("Hapus hafalan di tanggal ini?")) return;
    const updated = { ...hafalanMembaca };
    delete updated[selectedDate];
    onUpdateMembaca(updated);
    setShowForm(false);
    setSelectedDate(null);
  };

  // ========== HELPER ==========
  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear - 1; y <= currentYear + 5; y++) years.push(y);
  const todayStr = new Date().toISOString().split("T")[0];

  const hasEntry = (date) => !!hafalanMembaca[date];
  const selectedEntry = selectedDate ? hafalanMembaca[selectedDate] : null;

  // Ambil nama surat dari ID
  const getSuratLabel = (suratId) => {
    for (const juz of allJuz) {
      const found = juz.children?.find((s) => s.id === suratId);
      if (found) return found.label;
    }
    return suratId;
  };

  return (
    <div className="space-y-4">
      {/* Info Target */}
      <div className="alert alert-info py-2 text-xs">
        <span>
          🎯 Target: <strong>{targetHarian} halaman/hari</strong>. Klik tanggal
          untuk input hafalan.
        </span>
      </div>

      {/* KALENDER */}
      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          {/* Navigasi */}
          <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
            <div className="flex items-center gap-1">
              <button
                className="btn btn-ghost btn-sm text-gray-700"
                onClick={prevYear}
                title="Tahun sebelumnya"
              >
                «
              </button>
              <button
                className="btn btn-ghost btn-sm text-gray-700"
                onClick={prevMonth}
                title="Bulan sebelumnya"
              >
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
                  <option key={idx} value={idx}>
                    {name}
                  </option>
                ))}
              </select>
              <select
                className="select select-bordered select-sm text-gray-800 bg-white"
                value={currentMonth.getFullYear()}
                onChange={handleYearChange}
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1">
              <button
                className="btn btn-ghost btn-sm text-gray-700"
                onClick={nextMonth}
                title="Bulan berikutnya"
              >
                ›
              </button>
              <button
                className="btn btn-ghost btn-sm text-gray-700"
                onClick={nextYear}
                title="Tahun berikutnya"
              >
                »
              </button>
            </div>
          </div>

          <div className="flex justify-center mb-3">
            <button
              className="btn btn-outline btn-xs text-gray-700"
              onClick={goToToday}
            >
              📅 Hari Ini
            </button>
          </div>

          {/* Header hari */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-bold text-gray-600 bg-gray-100 py-2 rounded"
              >
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
              const adaEntry = hasEntry(item.date);
              const holiday = HOLIDAYS[item.date];
              const isHolidayDate = !!holiday;

              let boxClass =
                "bg-white text-gray-800 border-gray-200 hover:bg-gray-100";
              if (isToday && !isSelected && !isHolidayDate) {
                boxClass =
                  "bg-yellow-50 text-gray-900 border-yellow-300 font-bold";
              }
              if (isHolidayDate && !isSelected) {
                boxClass = "bg-red-600 text-white border-red-700 font-bold";
              }
              if (isSelected) {
                boxClass =
                  "bg-blue-100 text-blue-900 border-2 border-blue-600 font-bold ring-1 ring-blue-300";
              }

              return (
                <button
                  key={item.date}
                  className={`aspect-square rounded border ${boxClass} relative transition text-sm`}
                  onClick={() => handleDateClick(item.date)}
                  title={holiday || ""}
                >
                  <span className="absolute top-1 left-2">{item.day}</span>
                  {adaEntry && (
                    <span
                      className={`absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full ${
                        hafalanMembaca[item.date]?.sudah
                          ? "bg-green-500"
                          : "bg-orange-500"
                      }`}
                    />
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
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span>Sudah Hafal</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              <span>Belum Selesai</span>
            </div>
          </div>
        </div>
      </div>

      {/* FORM DETAIL TANGGAL */}
      {selectedDate && (
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-bold text-gray-800">
                📌 {formatTanggal(selectedDate)}
              </h3>
              {selectedEntry && (
                <button
                  className="btn btn-ghost btn-xs text-red-500"
                  onClick={handleHapus}
                >
                  🗑️ Hapus
                </button>
              )}
            </div>

            {/* FORM INPUT */}
            {showForm && (
              <div className="bg-blue-50 rounded p-3 space-y-3 border border-blue-200">
                <p className="text-xs font-semibold text-blue-700">
                  ✏️ Input Hafalan
                </p>

                {/* Juz */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">
                    📚 Juz
                  </label>
                  <select
                    className="select select-bordered select-sm w-full text-gray-800 bg-white"
                    value={formData.juzId}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        juzId: e.target.value,
                        suratId: "",
                      });
                      setErrorMsg("");
                    }}
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
                    onChange={(e) => {
                      setFormData({ ...formData, suratId: e.target.value });
                      setErrorMsg("");
                    }}
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
                  {formData.halamanMulai && formData.halamanSelesai && (
                    <p className="text-xs text-gray-500 mt-1">
                      ={" "}
                      {parseInt(formData.halamanSelesai) -
                        parseInt(formData.halamanMulai) +
                        1}{" "}
                      halaman
                    </p>
                  )}
                </div>

                {/* Status Sudah/Belum */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">
                    ✅ Status
                  </label>
                  <div className="flex gap-2">
                    <button
                      className={`btn btn-xs flex-1 ${
                        formData.sudah ? "btn-success" : "btn-outline"
                      }`}
                      onClick={() =>
                        setFormData({ ...formData, sudah: true })
                      }
                    >
                      ✅ Sudah Hafal
                    </button>
                    <button
                      className={`btn btn-xs flex-1 ${
                        !formData.sudah ? "btn-warning" : "btn-outline"
                      }`}
                      onClick={() =>
                        setFormData({ ...formData, sudah: false })
                      }
                    >
                      ⏳ Belum Selesai
                    </button>
                  </div>
                </div>

                {/* Catatan */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">
                    📝 Catatan
                  </label>
                  <textarea
                    className="textarea textarea-bordered w-full text-sm text-gray-800 bg-white"
                    rows="2"
                    placeholder="Catatan (opsional)..."
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
                      setSelectedDate(null);
                    }}
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}

            {/* MODE VIEW */}
            {!showForm && selectedEntry && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold text-gray-600 w-32">
                    📚 Juz:
                  </span>
                  <span className="text-gray-800">
                    {allJuz.find((j) => j.id === selectedEntry.juzId)?.label ||
                      selectedEntry.juzId}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold text-gray-600 w-32">
                    📖 Surat:
                  </span>
                  <span className="text-gray-800">
                    {getSuratLabel(selectedEntry.suratId)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold text-gray-600 w-32">
                    📄 Halaman:
                  </span>
                  <span className="text-gray-800">
                    {selectedEntry.halamanMulai}--{selectedEntry.halamanSelesai}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold text-gray-600 w-32">
                    ✅ Status:
                  </span>
                  <span
                    className={`badge badge-sm ${
                      selectedEntry.sudah ? "badge-success" : "badge-warning"
                    }`}
                  >
                    {selectedEntry.sudah ? "Sudah Hafal" : "Belum Selesai"}
                  </span>
                </div>
                {selectedEntry.catatan && (
                  <div className="mt-2">
                    <p className="text-xs font-semibold text-gray-600 mb-1">
                      📝 Catatan:
                    </p>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap bg-gray-50 p-2 rounded border border-gray-200">
                      {selectedEntry.catatan}
                    </p>
                  </div>
                )}
                <button
                  className="btn btn-ghost btn-xs text-gray-600 mt-2"
                  onClick={() => {
                    setShowForm(true);
                    setFormData({
                      juzId: selectedEntry.juzId || juzAktif,
                      suratId: selectedEntry.suratId || "",
                      halamanMulai: selectedEntry.halamanMulai || "",
                      halamanSelesai: selectedEntry.halamanSelesai || "",
                      sudah: selectedEntry.sudah || false,
                      catatan: selectedEntry.catatan || "",
                    });
                  }}
                >
                  ✏️ Edit
                </button>
              </div>
            )}

            {/* Belum ada data */}
            {!showForm && !selectedEntry && (
              <div className="text-center py-6 text-gray-400">
                <p className="text-2xl mb-2">📖</p>
                <p className="text-sm">Belum ada hafalan di tanggal ini.</p>
                <button
                  className="btn btn-outline btn-sm mt-3 text-gray-700"
                  onClick={() => setShowForm(true)}
                >
                  + Input Hafalan
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Placeholder kalau belum pilih tanggal */}
      {!selectedDate && (
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-8 text-center text-gray-400">
            <p className="text-3xl mb-2">👆</p>
            <p className="text-sm">
              Klik salah satu tanggal di kalender untuk input hafalan.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}