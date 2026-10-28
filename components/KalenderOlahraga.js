// components/KalenderOlahraga.js
"use client";

import { useState, useMemo } from "react";
import { HOLIDAYS } from "@/lib/holidays";
import { formatTanggal } from "@/lib/olahragaData";
import { Activity, Calendar, Pencil, Save, Trash2, Info, MessageSquare, Dumbbell, Timer, Footprints, X } from "lucide-react";

export default function KalenderOlahraga({ harian = {}, onUpdateHarian }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({ joggingKm: "", joggingPace: "", pushUp: "", legRaise: "", plank: "", catatan: "" });

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

  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextYear = () => setCurrentMonth(new Date(currentMonth.getFullYear() + 1, currentMonth.getMonth(), 1));
  const prevYear = () => setCurrentMonth(new Date(currentMonth.getFullYear() - 1, currentMonth.getMonth(), 1));
  const goToToday = () => { const now = new Date(); setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1)); setSelectedDate(now.toISOString().split("T")[0]); };
  const handleMonthChange = (e) => setCurrentMonth(new Date(currentMonth.getFullYear(), parseInt(e.target.value), 1));
  const handleYearChange = (e) => setCurrentMonth(new Date(parseInt(e.target.value), currentMonth.getMonth(), 1));

  const handleDateClick = (date) => {
    if (date === selectedDate) { setSelectedDate(null); setShowForm(false); return; }
    setSelectedDate(date); setShowForm(true);
    const existing = harian[date] || {};
    setFormData({ joggingKm: existing.jogging?.km || "", joggingPace: existing.jogging?.pace || "", pushUp: existing.pushUp?.reps || "", legRaise: existing.legRaise?.reps || "", plank: existing.plank?.detik || "", catatan: existing.catatan || "" });
  };

  const handleSimpan = () => {
    if (!selectedDate) return;
    const newData = { jogging: { km: parseFloat(formData.joggingKm) || 0, pace: parseFloat(formData.joggingPace) || 0 }, pushUp: { reps: parseInt(formData.pushUp) || 0 }, legRaise: { reps: parseInt(formData.legRaise) || 0 }, plank: { detik: parseInt(formData.plank) || 0 }, catatan: formData.catatan, updatedAt: new Date().toISOString() };
    onUpdateHarian({ ...harian, [selectedDate]: newData });
    setShowForm(false);
  };

  const handleHapus = () => {
    if (!selectedDate) return;
    if (!confirm("Hapus data olahraga di tanggal ini?")) return;
    const updated = { ...harian }; delete updated[selectedDate]; onUpdateHarian(updated);
    setShowForm(false); setSelectedDate(null);
  };

  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const currentYear = new Date().getFullYear();
  const years = []; for (let y = currentYear - 1; y <= currentYear + 5; y++) years.push(y);
  const todayStr = new Date().toISOString().split("T")[0];

  const hasKegiatan = (date) => {
    const data = harian[date];
    if (!data) return false;
    return (data.jogging?.km || 0) > 0 || (data.pushUp?.reps || 0) > 0 || (data.legRaise?.reps || 0) > 0 || (data.plank?.detik || 0) > 0 || (data.catatan && data.catatan.trim() !== "");
  };

  const selectedData = selectedDate ? harian[selectedDate] : null;

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
              <select className="select select-bordered select-sm text-gray-800 bg-white" value={currentMonth.getMonth()} onChange={handleMonthChange}>
                {monthNames.map((name, idx) => <option key={idx} value={idx}>{name}</option>)}
              </select>
              <select className="select select-bordered select-sm text-gray-800 bg-white" value={currentMonth.getFullYear()} onChange={handleYearChange}>
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-1">
              <button className="btn btn-ghost btn-sm text-gray-700" onClick={nextMonth}>›</button>
              <button className="btn btn-ghost btn-sm text-gray-700" onClick={nextYear}>»</button>
            </div>
          </div>

          <div className="flex justify-center mb-3">
            <button className="btn btn-outline btn-xs text-gray-700" onClick={goToToday}><Calendar size={14} className="mr-1"/> Hari Ini</button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {dayNames.map((day) => <div key={day} className="text-center text-xs font-bold text-gray-600 bg-gray-100 py-2 rounded">{day}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {generateCalendar().map((item, idx) => {
              if (!item) return <div key={idx} className="aspect-square" />;
              const isSelected = item.date === selectedDate;
              const isToday = item.date === todayStr;
              const adaKegiatan = hasKegiatan(item.date);
              const holiday = HOLIDAYS[item.date];
              const isHolidayDate = !!holiday;

              let boxClass = "bg-white text-gray-800 border-gray-200 hover:bg-gray-100";
              if (isToday && !isSelected && !isHolidayDate) boxClass = "bg-yellow-50 text-gray-900 border-yellow-300 font-bold";
              if (isHolidayDate && !isSelected) boxClass = "bg-red-600 text-white border-red-700 font-bold";
              if (isSelected) boxClass = "bg-blue-100 text-blue-900 border-2 border-blue-600 font-bold ring-2 ring-blue-300";

              return (
                <button key={item.date} className={`aspect-square rounded border ${boxClass} relative transition text-sm`} onClick={() => handleDateClick(item.date)} title={holiday || ""}>
                  <span className="absolute top-1 left-2">{item.day}</span>
                  {adaKegiatan && <span className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-green-500" />}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3 mt-4 text-xs text-gray-600">
            <div className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-red-600 border border-red-700" /><span>Libur Nasional</span></div>
            <div className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-yellow-50 border border-yellow-300" /><span>Hari Ini</span></div>
            <div className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-blue-100 border-2 border-blue-600" /><span>Tanggal Dipilih</span></div>
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /><span>Ada Olahraga</span></div>
          </div>
        </div>
      </div>

      {selectedDate && (
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-bold text-gray-800 flex items-center gap-1"><Calendar size={16}/> {formatTanggal(selectedDate)}</h3>
              {selectedData && <button className="btn btn-ghost btn-xs text-red-500" onClick={handleHapus} title="Hapus data hari ini"><Trash2 size={14} className="mr-1"/> Hapus</button>}
            </div>

            {showForm && (
              <div className="bg-blue-50 rounded p-3 space-y-3 border border-blue-200">
                <p className="text-xs font-semibold text-blue-700 flex items-center gap-1"><Pencil size={14}/> Input Olahraga</p>
                
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block flex items-center gap-1"><Footprints size={14}/> Jogging</label>
                  <div className="flex gap-2">
                    <input type="number" step="0.1" className="input input-bordered input-sm flex-1 text-gray-800 bg-white" placeholder="Jarak (km)" value={formData.joggingKm} onChange={(e) => setFormData({ ...formData, joggingKm: e.target.value })} />
                    <input type="number" step="0.1" className="input input-bordered input-sm flex-1 text-gray-800 bg-white" placeholder="Pace (misal: 8.5)" value={formData.joggingPace} onChange={(e) => setFormData({ ...formData, joggingPace: e.target.value })} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block flex items-center gap-1"><Dumbbell size={14}/> Push Up</label>
                    <input type="number" className="input input-bordered input-sm w-full text-gray-800 bg-white" placeholder="Reps" value={formData.pushUp} onChange={(e) => setFormData({ ...formData, pushUp: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block flex items-center gap-1"><Activity size={14}/> Leg Raise</label>
                    <input type="number" className="input input-bordered input-sm w-full text-gray-800 bg-white" placeholder="Reps" value={formData.legRaise} onChange={(e) => setFormData({ ...formData, legRaise: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block flex items-center gap-1"><Timer size={14}/> Plank</label>
                    <input type="number" className="input input-bordered input-sm w-full text-gray-800 bg-white" placeholder="Detik" value={formData.plank} onChange={(e) => setFormData({ ...formData, plank: e.target.value })} />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block flex items-center gap-1"><MessageSquare size={14}/> Catatan Harian</label>
                  <textarea className="textarea textarea-bordered w-full text-sm text-gray-800 bg-white" rows="2" placeholder="Catatan olahraga hari ini..." value={formData.catatan} onChange={(e) => setFormData({ ...formData, catatan: e.target.value })} />
                </div>

                <div className="flex gap-2">
                  <button className="btn btn-primary btn-sm flex-1" onClick={handleSimpan}><Save size={16} className="mr-1"/> Simpan</button>
                  <button className="btn btn-ghost btn-sm text-gray-700" onClick={() => setShowForm(false)}>Batal</button>
                </div>
              </div>
            )}

            {!showForm && selectedData && (
              <div className="space-y-2">
                {selectedData.jogging?.km > 0 && <div className="flex items-center gap-2 text-sm"><span className="font-semibold text-gray-600 w-32 flex items-center gap-1"><Footprints size={14}/> Jogging:</span><span className="text-gray-800">{selectedData.jogging.km} km{selectedData.jogging.pace > 0 && ` • pace ${selectedData.jogging.pace}`}</span></div>}
                {selectedData.pushUp?.reps > 0 && <div className="flex items-center gap-2 text-sm"><span className="font-semibold text-gray-600 w-32 flex items-center gap-1"><Dumbbell size={14}/> Push Up:</span><span className="text-gray-800">{selectedData.pushUp.reps} reps</span></div>}
                {selectedData.legRaise?.reps > 0 && <div className="flex items-center gap-2 text-sm"><span className="font-semibold text-gray-600 w-32 flex items-center gap-1"><Activity size={14}/> Leg Raise:</span><span className="text-gray-800">{selectedData.legRaise.reps} reps</span></div>}
                {selectedData.plank?.detik > 0 && <div className="flex items-center gap-2 text-sm"><span className="font-semibold text-gray-600 w-32 flex items-center gap-1"><Timer size={14}/> Plank:</span><span className="text-gray-800">{selectedData.plank.detik} detik</span></div>}
                {selectedData.catatan && <div className="mt-2"><p className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1"><MessageSquare size={14}/> Catatan:</p><p className="text-sm text-gray-800 whitespace-pre-wrap bg-gray-50 p-2 rounded border border-gray-200">{selectedData.catatan}</p></div>}
                <button className="btn btn-ghost btn-xs text-gray-600 mt-2" onClick={() => { setShowForm(true); setFormData({ joggingKm: selectedData.jogging?.km || "", joggingPace: selectedData.jogging?.pace || "", pushUp: selectedData.pushUp?.reps || "", legRaise: selectedData.legRaise?.reps || "", plank: selectedData.plank?.detik || "", catatan: selectedData.catatan || "" }); }}><Pencil size={14} className="mr-1"/> Edit</button>
              </div>
            )}

            {!showForm && !selectedData && (
              <div className="text-center py-6 text-gray-400">
                <Activity size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">Belum ada olahraga di tanggal ini.</p>
                <button className="btn btn-outline btn-sm mt-3 text-gray-700" onClick={() => setShowForm(true)}><Plus size={16} className="mr-1"/> Input Olahraga</button>
              </div>
            )}
          </div>
        </div>
      )}

      {!selectedDate && (
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-8 text-center text-gray-400">
            <Calendar size={40} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Klik salah satu tanggal di kalender untuk input olahraga.</p>
          </div>
        </div>
      )}
    </div>
  );
}