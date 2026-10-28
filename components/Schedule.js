// components/Schedule.js
"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar, Play, CheckCircle2, Check, Pause, X } from "lucide-react";

export default function Schedule({
  jadwalUser = { kerja: [], minggu: [] },
  onUpdateJadwal,
  progress = {},
  onUpdateProgress,
  selectedDate,
  setSelectedDate,
  userData,
}) {
  const [showKelolaJadwal, setShowKelolaJadwal] = useState(false);

  const getHariIni = (dateStr) => {
    const d = new Date(dateStr);
    const day = d.getDay();
    return day === 0 ? "minggu" : "kerja";
  };

  const hariIni = selectedDate ? getHariIni(selectedDate) : "kerja";
  const jadwalHariIni = jadwalUser?.[hariIni] || [];
  const progressHariIni = progress[selectedDate] || {};

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  };

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split("T")[0]);
  };

  const handleToggleSelesai = (actId) => {
    if (!onUpdateProgress) return;
    const current = progressHariIni[actId]?.selesai || false;
    onUpdateProgress(selectedDate, actId, { selesai: !current });
  };

  return (
    <div className="card bg-white shadow border border-gray-200">
      <div className="card-body p-4">
        {/* HEADER NAVIGASI TANGGAL */}
        <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
          <div className="flex items-center gap-1">
            <button className="btn btn-ghost btn-sm text-gray-700" onClick={handlePrevDay}>
              <ChevronLeft size={18} />
            </button>
            <h3 className="text-sm font-bold text-gray-800 min-w-[200px] text-center flex items-center justify-center gap-2">
              <Calendar size={16} /> {formatDate(selectedDate)}
            </h3>
            <button className="btn btn-ghost btn-sm text-gray-700" onClick={handleNextDay}>
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              className="input input-bordered input-sm text-gray-800 bg-white"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <button className="btn btn-outline btn-xs text-gray-700" onClick={handleToday}>
              Hari Ini
            </button>
          </div>
        </div>

        {/* BADGE HARI */}
        <div className="mb-3 flex justify-between items-center">
          <span className="badge badge-primary text-white font-semibold px-3 py-3">
            {hariIni === "kerja" ? "Hari Kerja" : "Hari Minggu"}
          </span>
          <button
            className="btn btn-ghost btn-xs text-gray-600 flex items-center gap-1"
            onClick={() => setShowKelolaJadwal(true)}
            data-html2canvas-ignore="true"
          >
            Kelola Jadwal
          </button>
        </div>

        {/* LIST JADWAL */}
        {jadwalHariIni.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">Belum ada jadwal untuk hari ini.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {jadwalHariIni.map((act) => {
              const isSelesai = progressHariIni[act.id]?.selesai || false;
              // FILTER EMOJI DARI LABEL
              const cleanLabel = act.label.replace(/^[^\w\s]+\s/, '');

              return (
                <div
                  key={act.id}
                  className={`flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg border transition ${
                    isSelesai ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex-1 flex flex-wrap items-center gap-3">
                    <span className="text-xs font-mono text-gray-500 w-28 shrink-0">
                      {act.jamMulai || act.jam || "00:00"} -- {act.jamSelesai || "00:00"}
                    </span>
                    <p className={`text-sm font-semibold ${isSelesai ? "text-green-800 line-through opacity-70" : "text-gray-800"}`}>
                      {cleanLabel}
                    </p>
                    {act.unit && <span className="text-xs text-gray-500">({act.unit})</span>}
                  </div>

                  <div className="flex items-center gap-2" data-html2canvas-ignore="true">
                    {act.tipe === "pilihan" && act.pilihanList && (
                      <div className="flex flex-wrap gap-1 mr-2">
                        {act.pilihanList.map((pil) => (
                          <button
                            key={pil.id}
                            className="btn btn-xs btn-outline border-gray-300 text-gray-700 hover:bg-gray-200"
                            onClick={() => alert(`Masuk ke fitur ${pil.label}`)}
                          >
                            {pil.label}
                          </button>
                        ))}
                      </div>
                    )}

                    <button
                      className={`btn btn-xs flex items-center gap-1 ${
                        isSelesai ? "btn-success text-white" : "btn-outline text-gray-700"
                      }`}
                      onClick={() => handleToggleSelesai(act.id)}
                    >
                      {isSelesai ? <CheckCircle2 size={14} /> : <Play size={14} />}
                      {isSelesai ? "Selesai" : "Mulai"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}