// components/DashboardKeuangan.js
"use client";

import { useMemo } from "react";
import {
  DEFAULT_DOMPET,
  DEFAULT_GOALS,
  DEFAULT_SETTING,
  formatRupiah,
  hitungCash,
  hitungPengeluaranBulanIni,
  hitungPengeluaranMingguIni,
  hitungHealthScore,
  hitungProgressWallet,
  getWalletStatus,
  hitungProgressGoal,
  generateSmartAlert,
  flattenTransaksi,
  getBulanRange,
  hitungTotalByJenis,
  getTanggalHariIni,
  tambahHari,
} from "@/lib/keuanganData";

export default function DashboardKeuangan({
  dompetList = DEFAULT_DOMPET,
  goalsList = DEFAULT_GOALS,
  keuanganTransaksi = {},
  setting = DEFAULT_SETTING,
}) {
  // ========== METRIK UTAMA ==========
  const cash = useMemo(() => hitungCash(keuanganTransaksi), [keuanganTransaksi]);
  const pengeluaranBulan = useMemo(
    () => hitungPengeluaranBulanIni(keuanganTransaksi),
    [keuanganTransaksi]
  );
  const pengeluaranMinggu = useMemo(
    () => hitungPengeluaranMingguIni(keuanganTransaksi),
    [keuanganTransaksi]
  );
  const healthScore = useMemo(
    () => hitungHealthScore(dompetList, goalsList, keuanganTransaksi, setting),
    [dompetList, goalsList, keuanganTransaksi, setting]
  );

  // ========== DOMPET ==========
  const dompetData = useMemo(() => {
    return (dompetList || []).map((d) => {
      const progress = hitungProgressWallet(d, keuanganTransaksi);
      const status = getWalletStatus(d, progress.persen, setting);
      return { ...d, ...progress, status };
    });
  }, [dompetList, keuanganTransaksi, setting]);

  // ========== GOALS ==========
  const goalsData = useMemo(() => {
    return (goalsList || []).map((g) => {
      const progress = hitungProgressGoal(g, dompetList, keuanganTransaksi);
      return { ...g, ...progress };
    });
  }, [goalsList, dompetList, keuanganTransaksi]);

  // ========== TOP PENGELUARAN BULAN INI ==========
  const topPengeluaran = useMemo(() => {
    const bulanIni = getBulanRange(getTanggalHariIni()).bulan;
    const flat = flattenTransaksi(keuanganTransaksi).filter(
      (t) =>
        (t.jenis === "keluar" || t.jenis === "sedekah") &&
        t.tanggal.startsWith(bulanIni)
    );

    // Group by kategori
    const grouped = {};
    flat.forEach((t) => {
      const key = t.kategori || "Lainnya";
      if (!grouped[key]) grouped[key] = 0;
      grouped[key] += parseInt(t.nominal) || 0;
    });

    return Object.entries(grouped)
      .map(([kategori, total]) => ({ kategori, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [keuanganTransaksi]);

  // ========== ANALYTICS BULANAN (6 BULAN TERAKHIR) ==========
  const analyticsBulanan = useMemo(() => {
    const today = new Date();
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const bulanKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const bulanLabel = d.toLocaleDateString("id-ID", {
        month: "short",
        year: "2-digit",
      });
      const masuk = hitungTotalByJenis(keuanganTransaksi, "masuk", (t) =>
        t.tanggal.startsWith(bulanKey)
      );
      const keluar =
        hitungTotalByJenis(keuanganTransaksi, "keluar", (t) =>
          t.tanggal.startsWith(bulanKey)
        ) +
        hitungTotalByJenis(keuanganTransaksi, "sedekah", (t) =>
          t.tanggal.startsWith(bulanKey)
        );
      result.push({ bulanKey, bulanLabel, masuk, keluar });
    }
    return result;
  }, [keuanganTransaksi]);

  const maxAnalytics = Math.max(
    ...analyticsBulanan.map((a) => Math.max(a.masuk, a.keluar)),
    1
  );

  // ========== ALERTS ==========
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

  return (
    <div className="space-y-4">
      {/* 4 KARTU RINGKASAN */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Cash */}
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
          </div>
        </div>

        {/* Pengeluaran Bulan */}
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-4">
            <p className="text-xs text-gray-500 mb-1">
              📤 Pengeluaran Bulan Ini
            </p>
            <p className="text-xl font-bold text-gray-800">
              {formatRupiah(pengeluaranBulan)}
            </p>
          </div>
        </div>

        {/* Pengeluaran Minggu */}
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-4">
            <p className="text-xs text-gray-500 mb-1">
              📅 Pengeluaran Minggu Ini
            </p>
            <p className="text-xl font-bold text-gray-800">
              {formatRupiah(pengeluaranMinggu)}
            </p>
          </div>
        </div>

        {/* Health Score */}
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
              🧮 Health Score
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

      {/* HEALTH SCORE BREAKDOWN */}
      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          <h3 className="text-sm font-bold text-gray-800 mb-3">
            🏥 Rincian Health Score
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="bg-blue-50 rounded p-2 border border-blue-200">
              <p className="text-xs text-gray-600">💰 Budget</p>
              <p className="text-base font-bold text-blue-700">
                {healthScore.breakdown.budgetScore} / 40
              </p>
            </div>
            <div className="bg-purple-50 rounded p-2 border border-purple-200">
              <p className="text-xs text-gray-600">🎯 Goals</p>
              <p className="text-base font-bold text-purple-700">
                {healthScore.breakdown.goalsScore} / 30
              </p>
            </div>
            <div className="bg-green-50 rounded p-2 border border-green-200">
              <p className="text-xs text-gray-600">🏦 Tabungan</p>
              <p className="text-base font-bold text-green-700">
                {healthScore.breakdown.tabunganScore} / 20
              </p>
            </div>
            <div className="bg-orange-50 rounded p-2 border border-orange-200">
              <p className="text-xs text-gray-600">📝 Konsistensi</p>
              <p className="text-base font-bold text-orange-700">
                {healthScore.breakdown.konsistensiScore} / 10
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* STATUS 7 DOMPET */}
      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          <h3 className="text-sm font-bold text-gray-800 mb-3">
            👛 Status Dompet ({dompetData.length})
          </h3>
          <div className="space-y-2">
            {dompetData.map((d) => (
              <div
                key={d.id}
                className="p-3 rounded border border-gray-200 bg-gray-50"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-semibold text-gray-800">
                    {d.nama}
                  </span>
                  <span className="text-xs">
                    {d.status.emoji} {d.status.label}
                  </span>
                </div>
                <progress
                  className={`progress w-full h-2 ${
                    d.status.warna === "red"
                      ? "progress-error"
                      : d.status.warna === "yellow"
                      ? "progress-warning"
                      : "progress-success"
                  }`}
                  value={Math.min(d.persen, 100)}
                  max="100"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>
                    {formatRupiah(d.realisasi)} / {formatRupiah(d.budget)}
                  </span>
                  <span>{d.persen}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PROGRESS GOALS */}
      {goalsData.length > 0 && (
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">
              🎯 Progress Goals ({goalsData.length})
            </h3>
            <div className="space-y-3">
              {goalsData.map((goal) => (
                <div key={goal.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-gray-700">
                      {goal.nama}
                    </span>
                    <span className="text-gray-500">
                      {formatRupiah(goal.saldo)} / {formatRupiah(goal.target)} ({goal.persen}%)
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
            </div>
          </div>
        </div>
      )}

      {/* TOP 5 PENGELUARAN */}
      {topPengeluaran.length > 0 && (
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">
              📈 Top 5 Pengeluaran (Bulan Ini)
            </h3>
            <div className="space-y-2">
              {topPengeluaran.map((item, idx) => (
                <div
                  key={item.kategori}
                  className="flex justify-between items-center p-2 rounded border border-gray-200 bg-gray-50"
                >
                  <span className="text-sm text-gray-700">
                    {idx + 1}. {item.kategori}
                  </span>
                  <span className="text-sm font-semibold text-red-600">
                    {formatRupiah(item.total)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ANALYTICS BULANAN */}
      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          <h3 className="text-sm font-bold text-gray-800 mb-3">
            📊 Tren 6 Bulan Terakhir
          </h3>
          <div className="flex items-end justify-between gap-2 h-40">
            {analyticsBulanan.map((b) => (
              <div key={b.bulanKey} className="flex-1 flex flex-col items-center gap-1">
                <div className="flex-1 w-full flex flex-col justify-end gap-0.5">
                  <div
                    className="bg-green-500 rounded-t w-full"
                    style={{ height: `${(b.masuk / maxAnalytics) * 100}%`, minHeight: b.masuk > 0 ? "2px" : "0" }}
                    title={`Masuk: ${formatRupiah(b.masuk)}`}
                  />
                  <div
                    className="bg-red-500 rounded-b w-full"
                    style={{ height: `${(b.keluar / maxAnalytics) * 100}%`, minHeight: b.keluar > 0 ? "2px" : "0" }}
                    title={`Keluar: ${formatRupiah(b.keluar)}`}
                  />
                </div>
                <span className="text-[10px] text-gray-500">{b.bulanLabel}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-3 text-xs text-gray-600 justify-center">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-green-500" />
              <span>Masuk</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-red-500" />
              <span>Keluar</span>
            </div>
          </div>
        </div>
      </div>

      {/* SMART ALERT */}
      {alerts.length > 0 && (
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">
              🔔 Smart Alert ({alerts.length})
            </h3>
            <div className="space-y-2">
              {alerts.map((alert, idx) => (
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}