"use client";
import { useState, useEffect } from "react";

export default function History({ progress }) {
  const [selectedDate, setSelectedDate] = useState("");
  const [availableDates, setAvailableDates] = useState([]);
  const [historyData, setHistoryData] = useState(null);

  useEffect(() => {
    if (!progress) return;
    const dates = Object.keys(progress).sort().reverse();
    setAvailableDates(dates);
    if (dates.length > 0 && !selectedDate) {
      setSelectedDate(dates[0]);
    }
  }, [progress]);

  useEffect(() => {
    if (!selectedDate || !progress) return;
    setHistoryData(progress[selectedDate] || null);
  }, [selectedDate, progress]);

  if (!availableDates.length) {
    return (
      <div className="card bg-base-100 shadow mt-4">
        <div className="card-body p-4">
          <h2 className="card-title text-base">📆 History</h2>
          <div className="text-center py-6 text-base-content/50">
            <p className="text-2xl mb-2">📭</p>
            <p>Belum ada data history.</p>
            <p className="text-sm">Mulai catat progress hari ini!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow mt-4">
      <div className="card-body p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="card-title text-base">📆 History</h2>
          <select 
            className="select select-bordered select-sm"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          >
            {availableDates.map((date) => (
              <option key={date} value={date}>{date}</option>
            ))}
          </select>
        </div>
        {historyData ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mt-2">
            {Object.entries(historyData).map(([key, value]) => {
              if (key === "catatan" || key === "skorEnergi") return null;
              const label = key.charAt(0).toUpperCase() + key.slice(1);
              const val = value?.page || value?.progress || value?.jarak || value?.lesson || (value?.selesai ? "✅" : "❌");
              return (
                <div key={key} className="bg-base-200 p-2 rounded">
                  <span className="text-xs text-base-content/50">{label}</span>
                  <div className="font-medium text-sm">{val}</div>
                </div>
              );
            })}
            <div className="bg-base-200 p-2 rounded col-span-2">
              <span className="text-xs text-base-content/50">💪 Skor Energi</span>
              <div className="font-medium">{historyData.skorEnergi || '-'}/10</div>
            </div>
            <div className="bg-base-200 p-2 rounded col-span-2">
              <span className="text-xs text-base-content/50">📝 Catatan</span>
              <div className="font-medium text-sm">{historyData.catatan || '-'}</div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-base-content/50 mt-2">Tidak ada data</p>
        )}
      </div>
    </div>
  );
}