// components/RingkasanKeuangan.js
"use client";

import { useMemo } from "react";
import {
  DEFAULT_DOMPET,
  DEFAULT_GOALS,
  DEFAULT_SETTING,
  formatRupiah,
  hitungCash,
  hitungPengeluaranBulanIni,
  hitungHealthScore,
  hitungProgressGoal,
  generateSmartAlert,
} from "@/lib/keuanganData";

export default function RingkasanKeuangan({
  dompetList = DEFAULT_DOMPET,
  goalsList = DEFAULT_GOALS,
  keuanganTransaksi = {},
  setting = DEFAULT_SETTING,
  onClickDetail,
  loading = false,
}) {
  // ========== HITUNG SEMUA METRIK ==========
  const cash = useMemo(
    () => hitungCash(keuanganTransaksi),
    [keuanganTransaksi]
  );

  const pengeluaranBulanIni = useMemo(
    () => hitungPengeluaranBulanIni(keuanganTransaksi),
    [keuanganTransaksi]
  );

  const healthScore = useMemo(
    () =>
      hitungHealthScore(
        dompetList,
        goalsList,
        keuanganTransaksi,
        setting
      ),
    [dompetList, goalsList, keuanganTransaksi, setting]
  );

  const goalsProgress = useMemo(() => {
    return (goalsList || []).map((goal) => {
      const progress = hitungProgressGoal(
        goal,
        dompetList,
        keuanganTransaksi
      );
      return { ...goal, ...progress };
    });
  }, [goalsList, dompetList, keuanganTransaksi]);

  const alerts = useMemo(
    () =>
      generateSmartAlert(
        dompetList,
        goalsList,
        keuanganTransaksi,
        setting
      ),
    [dompetList, goalsList, keuanganTransaksi, setting]
  );

  if (loading) {
    return (
      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          <p className="text-sm text-gray-500">Loading keuangan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800">
          💰 Ringkasan Keuangan
        </h2>
        <button
          className="btn btn-outline btn-xs text-gray-700"
          onClick={onClickDetail}
        >
          Lihat Detail →
        </button>
      </div>

      {/* 3 KARTU UTAMA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Cash Tersedia */}
        <div
          className={`card shadow border ${
            cash < 0
              ? "bg-red-50 border-red-300"
              : cash < 300000
              ? "bg-yellow-50 border-yellow-300"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="card-body p-4">
            <p className="text-xs text-gray-500 mb-1">💰 Cash Tersedia</p>
            <p
              className={`text-xl font-bold ${
                cash < 0
                  ? "text-red-700"
                  : cash < 300000
                  ? "text-yellow-700"
                  : "text-gray-800"
              }`}
            >
              {formatRupiah(cash)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {cash < 0
                ? "🚨 Cash minus!"
                : cash < 300000
                ? "⚠️ Cash tipis"
                : "✅ Cash aman"}
            </p>
          </div>
        </div>

        {/* Pengeluaran Bulan Ini */}
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-4">
            <p className="text-xs text-gray-500 mb-1">
              📤 Pengeluaran Bulan Ini
            </p>
            <p className="text-xl font-bold text-gray-800">
              {formatRupiah(pengeluaranBulanIni)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Keluar + Sedekah
            </p>
          </div>
        </div>

        {/* Financial Health Score */}
        <div
          className={`card shadow border ${
            healthScore.warna === "green"
              ? "bg-green-50 border-green-300"
              : healthScore.warna === "orange"
              ? "bg-orange-50 border-orange-300"
              : "bg-red-50 border-red-300"
          }`}
        >
          <div className="card-body p-4">
            <p className="text-xs text-gray-500 mb-1">
              🧮 Financial Health Score
            </p>
            <div className="flex items-baseline gap-2">
              <p
                className={`text-2xl font-bold ${
                  healthScore.warna === "green"
                    ? "text-green-700"
                    : healthScore.warna === "orange"
                    ? "text-orange-700"
                    : "text-red-700"
                }`}
              >
                {healthScore.total}
              </p>
              <span className="text-xs text-gray-500">/ 100</span>
            </div>
            <p className="text-xs mt-1">
              {healthScore.emoji} {healthScore.kategori}
            </p>
          </div>
        </div>
      </div>

      {/* PROGRESS GOALS */}
      {goalsProgress.length > 0 && (
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">
              🎯 Progress Goals
            </h3>
            <div className="space-y-2">
              {goalsProgress.slice(0, 5).map((goal) => (
                <div key={goal.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-gray-700">
                      {goal.nama}
                    </span>
                    <span className="text-gray-500">
                      {formatRupiah(goal.saldo)} / {formatRupiah(goal.target)}
                      {" "}({goal.persen}%)
                    </span>
                  </div>
                  <progress
                    className={`progress w-full h-2 ${
                      goal.persen >= 100
                        ? "progress-success"
                        : goal.persen >= 50
                        ? "progress-primary"
                        : "progress-warning"
                    }`}
                    value={goal.persen}
                    max="100"
                  />
                </div>
              ))}
              {goalsProgress.length > 5 && (
                <p className="text-xs text-gray-400 text-center pt-1">
                  +{goalsProgress.length - 5} goal lainnya
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SMART ALERT */}
      {alerts.length > 0 && (
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">
              🔔 Smart Alert
            </h3>
            <div className="space-y-2">
              {alerts.slice(0, 3).map((alert, idx) => (
                <div
                  key={idx}
                  className={`rounded p-2 border text-xs ${
                    alert.tipe === "danger"
                      ? "bg-red-50 border-red-200 text-red-800"
                      : alert.tipe === "warning"
                      ? "bg-yellow-50 border-yellow-200 text-yellow-800"
                      : alert.tipe === "success"
                      ? "bg-green-50 border-green-200 text-green-800"
                      : "bg-blue-50 border-blue-200 text-blue-800"
                  }`}
                >
                  {alert.emoji} {alert.pesan}
                </div>
              ))}
              {alerts.length > 3 && (
                <p className="text-xs text-gray-400 text-center">
                  +{alerts.length - 3} alert lainnya (lihat detail)
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* KALAU DATA KOSONG */}
      {!keuanganTransaksi ||
        (Object.keys(keuanganTransaksi).length === 0 && (
          <div className="card bg-white shadow border border-dashed border-gray-300">
            <div className="card-body p-6 text-center text-gray-400">
              <p className="text-2xl mb-2">💸</p>
              <p className="text-xs">
                Belum ada transaksi. Klik "Lihat Detail" buat mulai catat
                keuangan lo.
              </p>
            </div>
          </div>
        ))}
    </div>
  );
}