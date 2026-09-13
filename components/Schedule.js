// components/Schedule.js
"use client";

import { useState } from "react";
import { getJadwalHariIni } from "@/lib/jadwalData";

export default function Schedule({ todayProgress, onUpdate }) {
  const { jadwal, hari } = getJadwalHariIni();
  const [manualPilihan, setManualPilihan] = useState({});

  // ========== CEK APAKAH KEGIATAN INI SELESAI ==========
  const isDone = (id) => {
    return todayProgress?.[id]?.selesai || false;
  };

  // ========== TANDAI SELESAI ==========
  const handleDone = (id) => {
    onUpdate(id, { selesai: true });
  };

  // ========== BATALKAN SELESAI ==========
  const handleUndo = (id) => {
    onUpdate(id, { selesai: false });
  };

  // ========== PILIH MANUAL (Blender/SolidWorks, dll) ==========
  const handleManualPilih = (id, pilihan) => {
    setManualPilihan({ ...manualPilihan, [id]: pilihan });
    onUpdate(id, { pilihan });
  };

  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="card-title text-base">📅 Jadwal Hari Ini</h2>
          <span className="badge badge-primary badge-sm">{hari}</span>
        </div>

        <div className="divide-y divide-base-200">
          {jadwal.map((item) => {
            const done = isDone(item.id);
            const pilihan = manualPilihan[item.id] || todayProgress?.[item.id]?.pilihan;

            return (
              <div key={item.id} className="flex items-center justify-between py-2 gap-2">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="font-mono text-xs font-bold w-24 flex-shrink-0">
                    {item.waktu}
                  </span>
                  <span className={`text-sm truncate ${done ? "line-through text-success" : ""}`}>
                    {item.label}
                    <span className="text-xs text-base-content/50 ml-1">({item.unit})</span>
                  </span>
                </div>

                <div className="flex gap-1 items-center flex-shrink-0">
                  {/* Kalau kegiatan manual (Blender/SolidWorks, dll) */}
                  {item.manual && !done && (
                    <div className="flex gap-1">
                      {item.manual.map((pilih) => (
                        <button
                          key={pilih}
                          className={`btn btn-xs ${
                            pilihan === pilih ? "btn-primary" : "btn-outline"
                          }`}
                          onClick={() => handleManualPilih(item.id, pilih)}
                          disabled={done}
                        >
                          {pilih}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Tombol Selesai / Batal */}
                  {done ? (
                    <>
                      <span className="badge badge-success badge-sm">✅ Selesai</span>
                      <button
                        className="btn btn-ghost btn-xs text-warning"
                        onClick={() => handleUndo(item.id)}
                        title="Batal"
                      >
                        ↩️
                      </button>
                    </>
                  ) : (
                    <button
                      className="btn btn-outline btn-xs"
                      onClick={() => handleDone(item.id)}
                    >
                      ⏳ Belum
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}