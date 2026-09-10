// components/HeatmapCalendar.js
"use client";

import { useMemo } from "react";

export default function HeatmapCalendar({ progress, activityId }) {
  // Ambil 90 hari terakhir
  const days = useMemo(() => {
    const result = [];
    const today = new Date();
    for (let i = 89; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      result.push(d.toISOString().split("T")[0]);
    }
    return result;
  }, []);

  // Hitung intensitas per hari
  const getIntensity = (date) => {
    const dayProgress = progress?.[date];
    if (!dayProgress) return 0;

    // Kalo activityId spesifik, cek field itu
    if (activityId) {
      const field = dayProgress[activityId];
      if (!field) return 0;
      if (field.selesai || field.baru || (field.page && field.page > 0)) return 3;
      return 1;
    }

    // Kalo general, hitung total aktivitas
    const totalFields = Object.keys(dayProgress).length;
    if (totalFields === 0) return 0;
    if (totalFields >= 5) return 3;
    if (totalFields >= 3) return 2;
    return 1;
  };

  const getColor = (intensity) => {
    switch (intensity) {
      case 3: return "bg-success";
      case 2: return "bg-success/60";
      case 1: return "bg-success/30";
      default: return "bg-base-300";
    }
  };

  // Kelompokkan per minggu (7 hari)
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body p-4">
        <h3 className="card-title text-base">📅 Konsistensi 90 Hari Terakhir</h3>

        <div className="flex gap-1 overflow-x-auto pb-2">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((date) => {
                const intensity = getIntensity(date);
                return (
                  <div
                    key={date}
                    className={`w-3 h-3 rounded-sm ${getColor(intensity)}`}
                    title={`${date}: ${intensity > 0 ? "Ada aktivitas" : "Kosong"}`}
                  />
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-base-content/50 mt-2">
          <span>Kosong</span>
          <div className="w-3 h-3 rounded-sm bg-base-300" />
          <div className="w-3 h-3 rounded-sm bg-success/30" />
          <div className="w-3 h-3 rounded-sm bg-success/60" />
          <div className="w-3 h-3 rounded-sm bg-success" />
          <span>Rajin</span>
        </div>
      </div>
    </div>
  );
}