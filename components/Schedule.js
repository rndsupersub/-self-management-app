// components/Schedule.js
"use client";

import { useState, useMemo } from "react";
import {
  getJadwalUntukTanggal,
  formatWaktu,
  isHariIni,
  tambahHari,
  formatTanggalPanjang,
} from "@/lib/jadwalData";
import KelolaJadwal from "./KelolaJadwal";

export default function Schedule({
  jadwalUser,
  onUpdateJadwal,
  progress,
  onUpdateProgress,
  selectedDate,
  setSelectedDate,
}) {
  const [showKelola, setShowKelola] = useState(false);

  // Ambil jadwal untuk tanggal yang dipilih
  const { jadwal, hari, dayIndex } = useMemo(
    () => getJadwalUntukTanggal(jadwalUser, selectedDate),
    [jadwalUser, selectedDate]
  );

  // Progress hari yang dipilih (bukan hari ini)
  const dayProgress = progress?.[selectedDate] || {};

  // ========== CEK SELESAI ==========
  const isDone = (id) => dayProgress?.[id]?.selesai || false;

  // ========== TANDAI SELESAI ==========
  const handleDone = (id) => {
    onUpdateProgress(selectedDate, id, { selesai: true });
  };

  // ========== BATALKAN ==========
  const handleUndo = (id) => {
    onUpdateProgress(selectedDate, id, { selesai: false });
  };

  // ========== PILIH MANUAL ==========
  const handleManualPilih = (id, pilihan) => {
    onUpdateProgress(selectedDate, id, { pilihan });
  };

  // ========== NAVIGASI ==========
  const prevDay = () => setSelectedDate(tambahHari(selectedDate, -1));
  const nextDay = () => setSelectedDate(tambahHari(selectedDate, 1));
  const goToday = () => setSelectedDate(new Date().toISOString().split("T")[0]);
  const handleDateChange = (e) => setSelectedDate(e.target.value);

  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body p-4">
        {/* HEADER: NAVIGASI HARI */}
        <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            <button
              className="btn btn-ghost btn-sm"
              onClick={prevDay}
              title="Hari sebelumnya"
            >
              ‹
            </button>
            <h2 className="text-base font-bold min-w-[200px] text-center">
              📅 {formatTanggalPanjang(selectedDate)}
            </h2>
            <button
              className="btn btn-ghost btn-sm"
              onClick={nextDay}
              title="Hari berikutnya"
            >
              ›
            </button>
          </div>
          <div className="flex items-center gap-1">
            <input
              type="date"
              className="input input-bordered input-sm text-gray-800 bg-white"
              value={selectedDate}
              onChange={handleDateChange}
            />
            <button
              className="btn btn-outline btn-xs"
              onClick={goToday}
            >
              📅 Hari Ini
            </button>
          </div>
        </div>

        {/* BADGE HARI + TOMBOL KELOLA */}
        <div className="flex justify-between items-center mb-3">
          <span className="badge badge-primary badge-sm">{hari}</span>
          <button
            className="btn btn-ghost btn-xs text-gray-600"
            onClick={() => setShowKelola(true)}
            title="Kelola Jadwal"
          >
            ⚙️ Kelola Jadwal
          </button>
        </div>

        {/* DAFTAR JADWAL */}
        <div className="divide-y divide-base-200">
          {jadwal.map((item) => {
            const done = isDone(item.id);
            const pilihan = dayProgress?.[item.id]?.pilihan;

            return (
              <div
                key={item.id}
                className="flex items-center justify-between py-2 gap-2"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="font-mono text-xs font-bold w-24 flex-shrink-0">
                    {formatWaktu(item.waktuMulai, item.waktuSelesai)}
                  </span>
                  <span
                    className={`text-sm truncate ${
                      done ? "line-through text-success" : ""
                    }`}
                  >
                    {item.label}
                    <span className="text-xs text-base-content/50 ml-1">
                      ({item.unit})
                    </span>
                  </span>
                </div>

                <div className="flex gap-1 items-center flex-shrink-0">
                  {item.manual && !done && (
                    <div className="flex gap-1">
                      {item.manual.map((pilih) => (
                        <button
                          key={pilih}
                          className={`btn btn-xs ${
                            pilihan === pilih ? "btn-primary" : "btn-outline"
                          }`}
                          onClick={() => handleManualPilih(item.id, pilih)}
                        >
                          {pilih}
                        </button>
                      ))}
                    </div>
                  )}

                  {done ? (
                    <>
                      <span className="badge badge-success badge-sm">
                        ✅ Selesai
                      </span>
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

        {/* MODAL KELOLA JADWAL */}
        {showKelola && (
          <KelolaJadwal
            jadwal={jadwal}
            hari={hari}
            dayIndex={dayIndex}
            jadwalUser={jadwalUser}
            onUpdateJadwal={onUpdateJadwal}
            onClose={() => setShowKelola(false)}
          />
        )}
      </div>
    </div>
  );
}