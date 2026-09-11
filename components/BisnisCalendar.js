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
    if (!formData.judul.trim()) return;
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

  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextYear = () => setCurrentMonth(new Date(currentMonth.getFullYear() + 1, currentMonth.getMonth(), 1));
  const prevYear = () => setCurrentMonth(new Date(currentMonth.getFullYear() - 1, currentMonth.getMonth(), 1));
  const goToToday = () => {
    const now = new Date();
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(now.toISOString().split("T")[0]);
  };
  const handleMonthChange = (e) => setCurrentMonth(new Date(currentMonth.getFullYear(), parseInt(e.target.value), 1));
  const handleYearChange = (e) => setCurrentMonth(new Date(parseInt(e.target.value), currentMonth.getMonth(), 1));

  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const monthNames = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear - 1; y <= currentYear + 5; y++) years.push(y);

  if (loading) {
    return (
      <div className="card bg-base-100 shadow">
        <div className="card-body p-4">
          <p className="text-sm text-base-content/50">Loading kalender...</p>
        </div>
      </div>
    );
  }

  const selectedKegiatan = kegiatan[selectedDate] || [];
  const selectedHoliday = HOLIDAYS[selectedDate] || null;

  return (
    <div className="space-y-4">
      <div className="card bg-base-100 shadow">
        <div className="card-body p-4">
          <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
            <div className="flex items-center gap-1">
              <button className="btn btn-ghost btn-sm" onClick={prevYear} title="Tahun sebelumnya">«</button>
              <button className="btn btn-ghost btn-sm" onClick={prevMonth} title="Bulan sebelumnya">‹</button>
            </div>
            <div className="flex items-center gap-2">
              <select className="select select-bordered select-sm" value={currentMonth.getMonth()} onChange={handleMonthChange}>
                {monthNames.map((name, idx) => (
                  <option key={idx} value={idx}>{name}</option>
                ))}
              </select>
              <select className="select select-bordered select-sm" value={currentMonth.getFullYear()} onChange={handleYearChange}>
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1">
              <button className="btn btn-ghost btn-sm" onClick={nextMonth} title="Bulan berikutnya">›</button>
              <button className="btn btn-ghost btn-sm" onClick={nextYear} title="Tahun berikutnya">»</button>
            </div>
          </div>

          <div className="flex justify-center mb-3">
            <button className="btn btn-outline btn-xs" onClick={goToToday}>📅 Hari Ini</button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((day) => (
              <div key={day} className="text-center text-xs font-semibold text-base-content/50">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {generateCalendar().map((item, idx) => {
              if (!item) return <div key={idx} />;
              const isSelected = item.date === selectedDate;
              const isToday = item.date === new Date().toISOString().split("T")[0];
              const hasKegiatan = kegiatan[item.date]?.length > 0;
              const holiday = HOLIDAYS[item.date];
              const isHolidayDate = !!holiday;

              return (
                <button
                  key={item.date}
                  className={`aspect-square rounded text-sm relative transition ${
                    isSelected
                      ? "bg-primary text-primary-content font-bold"
                      : isHolidayDate
                      ? "bg-error/20 text-error font-bold hover:bg-error/30"
                      : isToday
                      ? "bg-base-300 font-bold"
                      : "hover:bg-base-200"
                  }`}
                  onClick={() => setSelectedDate(item.date)}
                  title={holiday || ""}
                >
                  {item.day}
                  {hasKegiatan && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-success" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legenda */}
          <div className="flex flex-wrap gap-3 mt-3 text-xs text-base-content/60">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-error/20 border border-error/30" />
              <span>Libur Nasional</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-base-300" />
              <span>Hari Ini</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              <span>Ada Kegiatan</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow">
        <div className="card-body p-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h3 className="text-base font-bold">
                📌 {new Date(selectedDate).toLocaleDateString("id-ID", {
                  weekday: "long", day: "numeric", month: "long", year: "numeric",
                })}
              </h3>
              {selectedHoliday && (
                <span className="badge badge-error badge-sm mt-1">🎉 {selectedHoliday}</span>
              )}
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                setFormData({ judul: "", catatan: "" });
                setEditingId(null);
                setShowForm(true);
              }}
            >
              + Tambah
            </button>
          </div>

          {showForm && (
            <div className="bg-base-200 rounded p-3 mb-3 space-y-2">
              <input
                type="text"
                className="input input-bordered input-sm w-full"
                placeholder="Judul kegiatan (misal: Revisi Logo)"
                value={formData.judul}
                onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                autoFocus
              />
              <textarea
                className="textarea textarea-bordered w-full text-sm"
                rows="2"
                placeholder="Catatan (opsional)"
                value={formData.catatan}
                onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
              />
              <div className="flex gap-2">
                <button className="btn btn-primary btn-sm flex-1" onClick={handleAdd}>
                  {editingId ? "💾 Simpan" : "➕ Tambah"}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => { setShowForm(false); setEditingId(null); }}>
                  Batal
                </button>
              </div>
            </div>
          )}

          {selectedKegiatan.length === 0 ? (
            <div className="text-center py-8 text-base-content/50">
              <p className="text-2xl mb-2">📭</p>
              <p className="text-sm">Belum ada kegiatan di tanggal ini.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedKegiatan.map((keg) => (
                <div
                  key={keg.id}
                  className={`flex items-start gap-2 p-3 rounded border ${
                    keg.status === "selesai"
                      ? "bg-success/10 border-success/30"
                      : "bg-base-200 border-base-300"
                  }`}
                >
                  <button
                    className={`btn btn-xs btn-circle ${keg.status === "selesai" ? "btn-success" : "btn-ghost"}`}
                    onClick={() => handleToggleStatus(keg.id)}
                    title={keg.status === "selesai" ? "Tandai Belum" : "Tandai Selesai"}
                  >
                    {keg.status === "selesai" ? "✓" : "○"}
                  </button>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${keg.status === "selesai" ? "line-through opacity-60" : ""}`}>
                      {keg.judul}
                    </p>
                    {keg.catatan && <p className="text-xs text-base-content/50 mt-1">{keg.catatan}</p>}
                  </div>
                  <div className="flex gap-1">
                    <button className="btn btn-ghost btn-xs" onClick={() => handleEdit(keg)} title="Edit">✏️</button>
                    <button className="btn btn-ghost btn-xs text-error" onClick={() => handleDelete(keg.id)} title="Hapus">🗑️</button>
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