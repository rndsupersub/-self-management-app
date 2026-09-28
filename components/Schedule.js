// components/Schedule.js
"use client";

import { useState, useMemo } from "react";
import {
  getJadwalUntukTanggal,
  formatWaktu,
  isHariIni,
  tambahHari,
  formatTanggalPanjang,
  deteksiJadwalOtomatis,
} from "@/lib/jadwalData";
import KelolaJadwal from "./KelolaJadwal";

export default function Schedule({
  jadwalUser,
  onUpdateJadwal,
  progress,
  onUpdateProgress,
  selectedDate,
  setSelectedDate,
  userData,  // NEW: seluruh data user dari Firestore (buat deteksi otomatis)
}) {
  const [showKelola, setShowKelola] = useState(false);

  // Ambil jadwal untuk tanggal yang dipilih
  const { jadwal, hari, dayIndex } = useMemo(
    () => getJadwalUntukTanggal(jadwalUser, selectedDate),
    [jadwalUser, selectedDate]
  );

  // Progress hari yang dipilih
  const dayProgress = progress?.[selectedDate] || {};

  // ========== CEK SELESAI (MANUAL ATAU OTOMATIS) ==========
  const getStatus = (item) => {
    // 1. Cek manual (user override)
    const manual = dayProgress?.[item.id];
    if (manual?.selesai === true) {
      return {
        auto: false,
        selesai: true,
        pilihan: manual.pilihan || null,
        label: manual.label || null,
        warna: manual.warna || null,
      };
    }
    if (manual?.selesai === false && manual?.override) {
      // User sengaja set belum
      return { auto: false, selesai: false };
    }

    // 2. Cek otomatis dari userData
    const auto = deteksiJadwalOtomatis(item.id, selectedDate, userData);
    if (auto.auto) {
      return {
        auto: true,
        selesai: true,
        pilihan: auto.label,
        label: auto.label,
        warna: auto.warna,
      };
    }

    // 3. Default: belum
    return { auto: false, selesai: false };
  };

  // ========== TANDAI SELESAI (MANUAL OVERRIDE) ==========
  const handleDone = (id, pilihan = null) => {
    const updates = { selesai: true, override: true };
    if (pilihan) updates.pilihan = pilihan;
    onUpdateProgress(selectedDate, id, updates);
  };

  // ========== BATALKAN ==========
  const handleUndo = (id) => {
    onUpdateProgress(selectedDate, id, { selesai: false, override: true });
  };

  // ========== RESET AUTO (biar balik ke deteksi otomatis) ==========
  const handleResetAuto = (id) => {
    onUpdateProgress(selectedDate, id, { selesai: false, override: false, pilihan: null });
  };

  // ========== PILIH MANUAL (OVERRIDE) ==========
  const handleManualPilih = (id, pilihan) => {
    onUpdateProgress(selectedDate, id, { selesai: true, pilihan, override: true });
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
            const status = getStatus(item);
            const done = status.selesai;
            const auto = status.auto;
            const pilihanTampil = status.pilihan;

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
                    {auto && done && (
                      <span className="text-xs text-info ml-2 italic">
                        ⚡ auto
                      </span>
                    )}
                    {pilihanTampil && (
                      <span className="text-xs ml-2 font-semibold">
                        → {pilihanTampil}
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex gap-1 items-center flex-shrink-0">
                  {item.manual && !done && (
                    <div className="flex gap-1">
                      {item.manual.map((pilih) => (
                        <button
                          key={pilih}
                          className="btn btn-outline btn-xs"
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
                      {auto && (
                        <button
                          className="btn btn-ghost btn-xs text-info"
                          onClick={() => handleResetAuto(item.id)}
                          title="Reset ke auto (hapus override manual)"
                        >
                          🔄
                        </button>
                      )}
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