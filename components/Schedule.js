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
  userData,
}) {
  const [showKelola, setShowKelola] = useState(false);
  const [syncing, setSyncing] = useState(null);

  const { jadwal, hari, dayIndex } = useMemo(
    () => getJadwalUntukTanggal(jadwalUser, selectedDate),
    [jadwalUser, selectedDate]
  );

  const dayProgress = progress?.[selectedDate] || {};

  const getStatus = (item) => {
    const manual = dayProgress?.[item.id];
    if (manual?.selesai === true) return { auto: false, selesai: true, mulai: manual.mulai || false, pilihan: manual.pilihan || null, label: manual.label || null, warna: manual.warna || null };
    if (manual?.selesai === false && manual?.override && !manual?.mulai) return { auto: false, selesai: false, mulai: false };
    if (manual?.mulai === true) return { auto: false, selesai: false, mulai: true };
    const auto = deteksiJadwalOtomatis(item.id, selectedDate, userData);
    if (auto.auto) return { auto: true, selesai: true, mulai: false, pilihan: auto.label, label: auto.label, warna: auto.warna };
    return { auto: false, selesai: false, mulai: false };
  };

  const handleDone = async (id, label, pilihan = null) => {
    const updates = { selesai: true, override: true, mulai: false };
    if (pilihan) updates.pilihan = pilihan;
    onUpdateProgress(selectedDate, id, updates);
    await syncKeTelegram(id, label, "selesai");
  };

  const handleMulai = async (id, label) => {
    setSyncing(id);
    try {
      onUpdateProgress(selectedDate, id, { selesai: false, mulai: true, mulaiAt: new Date().toISOString(), override: true });
      await syncKeTelegram(id, label, "mulai");
    } catch (e) {
      console.error("[handleMulai] Error:", e);
    } finally {
      setSyncing(null);
    }
  };

  const syncKeTelegram = async (aktivitasId, aktivitasLabel, status) => {
    if (!userData) return;
    const uid = userData._uid || userData.uid;
    if (!uid) return;
    try {
      await fetch("/api/telegram/sync-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, aktivitasId, aktivitasLabel, status, waktu: new Date().toISOString() }),
      });
    } catch (e) {
      console.error("[syncKeTelegram] Gagal sync:", e);
    }
  };

  const handleUndo = (id) => onUpdateProgress(selectedDate, id, { selesai: false, mulai: false, override: true });
  const handleResetAuto = (id) => onUpdateProgress(selectedDate, id, { selesai: false, mulai: false, override: false, pilihan: null });
  const handleManualPilih = (id, pilihan) => onUpdateProgress(selectedDate, id, { selesai: true, mulai: false, pilihan, override: true });

  const prevDay = () => setSelectedDate(tambahHari(selectedDate, -1));
  const nextDay = () => setSelectedDate(tambahHari(selectedDate, 1));
  const goToday = () => setSelectedDate(new Date().toISOString().split("T")[0]);
  const handleDateChange = (e) => setSelectedDate(e.target.value);

  return (
    <div className="card bg-base-100 shadow w-full">
      <div className="card-body p-3 md:p-4">
        
        {/* HEADER: NAVIGASI HARI (Di-ignore pas export) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4" data-html2canvas-ignore="true">
          <div className="flex items-center gap-1 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-1">
              <button className="btn btn-ghost btn-sm" onClick={prevDay} title="Hari sebelumnya">‹</button>
              <h2 className="text-sm md:text-base font-bold text-center">📅 {formatTanggalPanjang(selectedDate)}</h2>
              <button className="btn btn-ghost btn-sm" onClick={nextDay} title="Hari berikutnya">›</button>
            </div>
          </div>
          <div className="flex items-center gap-1 w-full md:w-auto">
            <input type="date" className="input input-bordered input-sm text-gray-800 bg-white flex-1 md:flex-none" value={selectedDate} onChange={handleDateChange} />
            <button className="btn btn-outline btn-xs" onClick={goToday}>📅 Hari Ini</button>
          </div>
        </div>

        {/* BADGE HARI + TOMBOL KELOLA */}
        <div className="flex justify-between items-center mb-3">
          <span className="badge badge-primary badge-sm">{hari}</span>
          <button className="btn btn-ghost btn-xs text-gray-600" onClick={() => setShowKelola(true)} title="Kelola Jadwal" data-html2canvas-ignore="true">
            ⚙️ Kelola Jadwal
          </button>
        </div>

        {/* DAFTAR JADWAL */}
        <div className="divide-y divide-base-200">
          {jadwal.map((item) => {
            const status = getStatus(item);
            const done = status.selesai;
            const mulai = status.mulai;
            const auto = status.auto;
            const pilihanTampil = status.pilihan;
            const isSyncing = syncing === item.id;

            return (
              <div key={item.id} className="flex flex-col md:flex-row md:items-center justify-between py-3 gap-2">
                {/* Kiri: Jam & Judul */}
                <div className="flex items-start md:items-center gap-2 flex-1 min-w-0">
                  <span className="font-mono text-xs font-bold w-24 flex-shrink-0 text-gray-500">
                    {formatWaktu(item.waktuMulai, item.waktuSelesai)}
                  </span>
                  <span className={`text-sm ${done ? "line-through text-success" : ""} ${mulai && !done ? "text-info font-semibold" : ""}`}>
                    {item.label}
                    <span className="text-xs text-base-content/50 ml-1">({item.unit})</span>
                    {auto && done && <span className="text-xs text-info ml-2 italic">⚡ auto</span>}
                    {mulai && !done && <span className="text-xs text-info ml-2 italic">▶️ proses</span>}
                    {pilihanTampil && <span className="text-xs ml-2 font-semibold block md:inline">→ {pilihanTampil}</span>}
                  </span>
                </div>

                {/* Kanan: Tombol Aksi */}
                <div className="flex gap-1 items-center flex-shrink-0 justify-end w-full md:w-auto mt-1 md:mt-0" data-html2canvas-ignore="true">
                  {item.manual && !done && !mulai && (
                    <div className="flex gap-1 mr-auto md:mr-0">
                      {item.manual.map((pilih) => (
                        <button key={pilih} className="btn btn-outline btn-xs" onClick={() => handleManualPilih(item.id, pilih)}>
                          {pilih}
                        </button>
                      ))}
                    </div>
                  )}

                  {done ? (
                    <>
                      <span className="badge badge-success badge-sm">✅ Selesai</span>
                      <button className="btn btn-ghost btn-xs text-warning" onClick={() => handleUndo(item.id)} title="Batal">↩️</button>
                      {auto && (
                        <button className="btn btn-ghost btn-xs text-info" onClick={() => handleResetAuto(item.id)} title="Reset ke auto">🔄</button>
                      )}
                    </>
                  ) : mulai ? (
                    <>
                      <span className="badge badge-info badge-sm">▶️ Proses</span>
                      <button className="btn btn-success btn-xs" onClick={() => handleDone(item.id, item.label)} title="Tandai selesai">✅ Selesai</button>
                      <button className="btn btn-ghost btn-xs text-warning" onClick={() => handleUndo(item.id)} title="Batal">↩️</button>
                    </>
                  ) : (
                    <div className="flex gap-1 w-full md:w-auto justify-end">
                      <button className="btn btn-outline btn-xs flex-1 md:flex-none" onClick={() => handleMulai(item.id, item.label)} disabled={isSyncing} title="Mulai aktivitas">
                        {isSyncing ? "⏳" : "▶️ Mulai"}
                      </button>
                      <button className="btn btn-ghost btn-xs" onClick={() => handleDone(item.id, item.label)} title="Tandai selesai (langsung)">✅</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {showKelola && (
          <KelolaJadwal jadwal={jadwal} hari={hari} dayIndex={dayIndex} jadwalUser={jadwalUser} onUpdateJadwal={onUpdateJadwal} onClose={() => setShowKelola(false)} />
        )}
      </div>
    </div>
  );
}