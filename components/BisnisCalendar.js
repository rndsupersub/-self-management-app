// components/BisnisCalendar.js
"use client";

import { useState, useEffect } from "react";
import { HOLIDAYS } from "@/lib/holidays";

export default function BisnisCalendar({ user, db, onUpdate, onDelete }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [kegiatan, setKegiatan] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ judul: "", catatan: "" });

  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      const { doc, getDoc } = await import("firebase/firestore");
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setKegiatan(data.bisnisKegiatan || {});
      }
      setLoading(false);
    };
    loadData();
  }, [user, db]);

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

  const handleAdd = async () => {
    if (!formData.judul.trim() || !selectedDate) return;
    const newKegiatan = {
      id: editingId || Date.now().toString(),
      judul: formData.judul,
      catatan: formData.catatan,
      status: "belum",
      createdAt: new Date().toISOString(),
    };
    const updated = { ...kegiatan };
    if (!updated[selectedDate]) updated[selectedDate] = [];
    if (editingId) {
      updated[selectedDate] = updated[selectedDate].map((k) =>
        k.id === editingId ? { ...k, ...newKegiatan } : k
      );
    } else {
      updated[selectedDate].push(newKegiatan);
    }
    setKegiatan(updated);
    await onUpdate("bisnisKegiatan", updated);
    setFormData({ judul: "", catatan: "" });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (keg) => {
    setFormData({ judul: keg.judul, catatan: keg.catatan || "" });
    setEditingId(keg.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus kegiatan ini? Data akan masuk ke history.")) return;
    const updated = { ...kegiatan };
    const deleted = updated[selectedDate].find((k) => k.id === id);
    updated[selectedDate] = updated[selectedDate].filter((k) => k.id !== id);
    if (updated[selectedDate].length === 0) delete updated[selectedDate];
    setKegiatan(updated);
    await onDelete(selectedDate, deleted);
    await onUpdate("bisnisKegiatan", updated);
  };

  const handleToggleStatus = async (id) => {
    const updated = { ...kegiatan };
    updated[selectedDate] = updated[selectedDate].map((k) =>
      k.id === id
        ? { ...k, status: k.status === "selesai" ? "belum" : "selesai" }
        : k
    );
    setKegiatan(updated);
    await onUpdate("bisnisKegiatan", updated);
  };

  // ========== KLIK TANGGAL ==========
  // - Kalau tanggal sama yang diklik → deselect (biru hilang, form hilang)
  // - Kalau tanggal beda → select + form auto-muncul
  const handleDateClick = (date) => {
    if (date === selectedDate) {
      // Klik tanggal yang sama → deselect
      setSelectedDate(null);
      setShowForm(false);
      setEditingId(null);
      setFormData({ judul: "", catatan: "" });
    } else {
      // Klik tanggal beda → select + form auto-muncul
      setSelectedDate(date);
      setShowForm(true);
      setEditingId(null);
      setFormData({ judul: "", catatan: "" });
    }
  };

  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextYear = () => setCurrentMonth(new Date(currentMonth.getFullYear() + 1, currentMonth.getMonth(), 1));
  const prevYear = () => setCurrentMonth(new Date(currentMonth.getFullYear() - 1, currentMonth.getMonth(), 1));
  const goToToday = () => {
    const now = new Date();
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(now.toISOString().split("T")[0]);
    setShowForm(false);
    setEditingId(null);
  };
  const handleMonthChange = (e) => setCurrentMonth(new Date(currentMonth.getFullYear(), parseInt(e.target.value), 1));
  const handleYearChange = (e) => setCurrentMonth(new Date(parseInt(e.target.value), currentMonth.getMonth(), 1));

  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const monthNames = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear - 1; y <= currentYear + 5; y++) years.push(y);

  const getHolidaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const prefix = `${year}-${String(month + 1).padStart(2, "0")}`;
    return Object.entries(HOLIDAYS)
      .filter(([date]) => date.startsWith(prefix))
      .sort(([a], [b]) => a.localeCompare(b));
  };

  if (loading) {
    return (
      <div className="card bg-white shadow">
        <div className="card-body p-4">
          <p className="text-sm text-gray-500">Loading kalender...</p>
        </div>
      </div>
    );
  }

  const selectedKegiatan = selectedDate ? kegiatan[selectedDate] || [] : [];
  const selectedHoliday = selectedDate ? HOLIDAYS[selectedDate] || null : null;
  const holidaysInMonth = getHolidaysInMonth();
  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-4">
      {/* KALENDER */}
      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          {/* Navigasi */}
          <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
            <div className="flex items-center gap-1">
              <button className="btn btn-ghost btn-sm text-gray-700" onClick={prevYear} title="Tahun sebelumnya">«</button>
              <button className="btn btn-ghost btn-sm text-gray-700" onClick={prevMonth} title="Bulan sebelumnya">‹</button>
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
              <button className="btn btn-ghost btn-sm text-gray-700" onClick={nextMonth} title="Bulan berikutnya">›</button>
              <button className="btn btn-ghost btn-sm text-gray-700" onClick={nextYear} title="Tahun berikutnya">»</button>
            </div>
          </div>

          <div className="flex justify-center mb-3">
            <button className="btn btn-outline btn-xs text-gray-700" onClick={goToToday}>📅 Hari Ini</button>
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
              if (!item) {
                return <div key={idx} className="aspect-square" />;
              }

              const isSelected = item.date === selectedDate;
              const isToday = item.date === todayStr;
              const hasKegiatan = kegiatan[item.date]?.length > 0;
              const holiday = HOLIDAYS[item.date];
              const isHolidayDate = !!holiday;

              // Base: putih
              let boxClass = "bg-white text-gray-800 border-gray-200 hover:bg-gray-100";

              // Hari ini: kuning muda
              if (isToday && !isSelected && !isHolidayDate) {
                boxClass = "bg-yellow-50 text-gray-900 border-yellow-300 font-bold";
              }

              // Libur: merah
              if (isHolidayDate && !isSelected) {
                boxClass = "bg-red-600 text-white border-red-700 font-bold";
              }

              // Selected: biru soft + border tebal
              if (isSelected) {
                boxClass = "bg-blue-100 text-blue-900 border-2 border-blue-600 font-bold ring-2 ring-blue-300";
              }

              return (
                <button
                  key={item.date}
                  className={`aspect-square rounded border ${boxClass} relative transition text-sm`}
                  onClick={() => handleDateClick(item.date)}
                >
                  <span className="absolute top-1 left-2">{item.day}</span>
                  {hasKegiatan && (
                    <span className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-green-500" />
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
              <span>Ada Kegiatan</span>
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-2 text-center">
            💡 Klik tanggal untuk pilih. Klik ulang tanggal yang sama untuk batal.
          </p>
        </div>
      </div>

      {/* DAFTAR LIBUR BULAN INI */}
      {holidaysInMonth.length > 0 && (
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-4">
            <h3 className="text-base font-bold mb-3 text-gray-800">
              🎉 Libur Nasional — {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <div className="space-y-2">
              {holidaysInMonth.map(([date, name]) => {
                const day = date.split("-")[2];
                return (
                  <div
                    key={date}
                    className="flex items-center gap-3 p-2 rounded bg-red-50 border border-red-200 cursor-pointer hover:bg-red-100 transition"
                    onClick={() => handleDateClick(date)}
                  >
                    <div className="flex flex-col items-center justify-center bg-red-600 text-white rounded w-12 h-12 flex-shrink-0">
                      <span className="text-[10px] leading-none uppercase">
                        {monthNames[currentMonth.getMonth()].slice(0, 3)}
                      </span>
                      <span className="text-lg font-bold leading-none">{day}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-red-700">{name}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* DETAIL TANGGAL + KEGIATAN */}
      {selectedDate && (
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-4">
            <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
              <div>
                <h3 className="text-base font-bold text-gray-800">
                  📌 {new Date(selectedDate).toLocaleDateString("id-ID", {
                    weekday: "long", day: "numeric", month: "long", year: "numeric",
                  })}
                </h3>
                {selectedHoliday && (
                  <span className="inline-block bg-red-600 text-white text-xs font-semibold rounded px-2 py-1 mt-1">
                    🎉 {selectedHoliday}
                  </span>
                )}
              </div>
              {!showForm && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setFormData({ judul: "", catatan: "" });
                    setEditingId(null);
                    setShowForm(true);
                  }}
                >
                  + Tambah Kegiatan
                </button>
              )}
            </div>

            {showForm && (
              <div className="bg-blue-50 rounded p-3 mb-3 space-y-2 border border-blue-200">
                <p className="text-xs font-semibold text-blue-700">
                  ✏️ {editingId ? "Edit kegiatan" : "Tambah kegiatan baru"}
                </p>
                <input
                  type="text"
                  className="input input-bordered input-sm w-full text-gray-800 bg-white"
                  placeholder="Judul kegiatan (misal: Revisi Logo)"
                  value={formData.judul}
                  onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                  autoFocus
                />
                <textarea
                  className="textarea textarea-bordered w-full text-sm text-gray-800 bg-white"
                  rows="2"
                  placeholder="Catatan (opsional)"
                  value={formData.catatan}
                  onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                />
                <div className="flex gap-2">
                  <button className="btn btn-primary btn-sm flex-1" onClick={handleAdd}>
                    {editingId ? "💾 Simpan" : "➕ Tambah"}
                  </button>
                  <button
                    className="btn btn-ghost btn-sm text-gray-700"
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                      setFormData({ judul: "", catatan: "" });
                    }}
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}

            {selectedKegiatan.length === 0 && !showForm && (
              <div className="text-center py-8 text-gray-400">
                <p className="text-2xl mb-2">📭</p>
                <p className="text-sm">Belum ada kegiatan di tanggal ini.</p>
              </div>
            )}

            {selectedKegiatan.length > 0 && (
              <div className="space-y-2">
                {selectedKegiatan.map((keg) => (
                  <div
                    key={keg.id}
                    className={`flex items-start gap-2 p-3 rounded border ${
                      keg.status === "selesai"
                        ? "bg-green-50 border-green-200"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <button
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                        keg.status === "selesai"
                          ? "bg-green-600 text-white"
                          : "bg-gray-300 text-gray-700"
                      }`}
                      onClick={() => handleToggleStatus(keg.id)}
                    >
                      {keg.status === "selesai" ? "✓" : "○"}
                    </button>
                    <div className="flex-1">
                      <p className={`text-sm font-medium text-gray-800 ${keg.status === "selesai" ? "line-through opacity-60" : ""}`}>
                        {keg.judul}
                      </p>
                      {keg.catatan && <p className="text-xs text-gray-500 mt-1">{keg.catatan}</p>}
                    </div>
                    <div className="flex gap-1">
                      <button className="btn btn-ghost btn-xs" onClick={() => handleEdit(keg)} title="Edit">✏️</button>
                      <button className="btn btn-ghost btn-xs text-red-600" onClick={() => handleDelete(keg.id)} title="Hapus">🗑️</button>
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
            <p className="text-sm">Klik salah satu tanggal di kalender untuk mulai tambah kegiatan.</p>
          </div>
        </div>
      )}
    </div>
  );
}