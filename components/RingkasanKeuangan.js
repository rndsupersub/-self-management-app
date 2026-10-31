// components/RingkasanKeuangan.js
"use client";

import { useState } from "react";
import { DEFAULT_DOMPET, DEFAULT_GOALS, formatRupiah, hitungCash, hitungPengeluaranBulanIni, hitungHealthScore, hitungProgressGoal, generateSmartAlert } from "@/lib/keuanganData";
import { Wallet, ArrowUpRight, Activity, Target, Bell, AlertTriangle, CheckCircle2, Info, ChevronDown, ChevronUp } from "lucide-react";

export default function RingkasanKeuangan({ dompetList = DEFAULT_DOMPET, goalsList = DEFAULT_GOALS, keuanganTransaksi = {}, setting = {}, onClickDetail }) {
  const [showAllGoals, setShowAllGoals] = useState(false);
  
  const cash = hitungCash(keuanganTransaksi);
  const pengeluaranBulan = hitungPengeluaranBulanIni(keuanganTransaksi);
  const healthScore = hitungHealthScore(dompetList, goalsList, keuanganTransaksi, setting);
  const alerts = generateSmartAlert(dompetList, goalsList, keuanganTransaksi, setting);

  const displayedGoals = showAllGoals ? goalsList : goalsList.slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2"><Wallet size={20} className="text-primary"/> Ringkasan Keuangan</h2>
        <button className="btn btn-ghost btn-xs text-gray-600" onClick={onClickDetail}>Lihat Detail →</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* CASH */}
        <div className={`card shadow border ${cash < 0 ? "bg-red-50 border-red-300" : cash < 300000 ? "bg-yellow-50 border-yellow-300" : "bg-white border-gray-200"}`}>
          <div className="card-body p-4">
            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Wallet size={14}/> Cash Tersedia</p>
            <p className={`text-2xl font-bold ${cash < 0 ? "text-red-700" : cash < 300000 ? "text-yellow-700" : "text-gray-800"}`}>{formatRupiah(cash)}</p>
            {cash < 300000 && <p className="text-xs text-yellow-700 mt-1 flex items-center gap-1"><AlertTriangle size={12}/> Cash tipis</p>}
          </div>
        </div>

        {/* PENGELUARAN */}
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-4">
            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><ArrowUpRight size={14}/> Pengeluaran Bulan Ini</p>
            <p className="text-2xl font-bold text-gray-800">{formatRupiah(pengeluaranBulan)}</p>
            <p className="text-xs text-gray-500 mt-1">Keluar + Sedekah</p>
          </div>
        </div>

        {/* HEALTH SCORE */}
        <div className={`card shadow border ${healthScore.warna === "green" ? "bg-green-50 border-green-300" : healthScore.warna === "orange" ? "bg-orange-50 border-orange-300" : "bg-red-50 border-red-300"}`}>
          <div className="card-body p-4">
            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Activity size={14}/> Financial Health Score</p>
            <div className="flex items-baseline gap-2">
              <p className={`text-2xl font-bold ${healthScore.warna === "green" ? "text-green-700" : healthScore.warna === "orange" ? "text-orange-700" : "text-red-700"}`}>{healthScore.total}</p>
              <span className="text-xs text-gray-500">/ 100</span>
            </div>
            <p className="text-xs mt-1 flex items-center gap-1">
              {healthScore.warna === "green" ? <CheckCircle2 size={12} className="text-green-600"/> : healthScore.warna === "orange" ? <AlertTriangle size={12} className="text-orange-600"/> : <AlertTriangle size={12} className="text-red-600"/>} {healthScore.kategori}
            </p>
          </div>
        </div>
      </div>

      {/* GOALS */}
      {goalsList.length > 0 && (
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1"><Target size={16}/> Progress Goals</h3>
            <div className="space-y-3">
              {displayedGoals.map((goal) => {
                const { persen, saldo, target } = hitungProgressGoal(goal, dompetList, keuanganTransaksi);
                return (
                  <div key={goal.id}>
                    <div className="flex justify-between text-xs mb-1"><span className="font-medium text-gray-700">{goal.nama}</span><span className="text-gray-500">{formatRupiah(saldo)} / {formatRupiah(target)} ({persen}%)</span></div>
                    <progress className="progress w-full h-2 progress-warning" value={persen} max="100" />
                  </div>
                );
              })}
            </div>
            
            {/* TOMBOL EXPAND/COLLAPSE */}
            {goalsList.length > 5 && (
              <button 
                className="btn btn-ghost btn-xs w-full mt-3 text-blue-600 flex items-center justify-center gap-1"
                onClick={() => setShowAllGoals(!showAllGoals)}
              >
                {showAllGoals ? <><ChevronUp size={14}/> Sembunyikan</> : <><ChevronDown size={14}/> Lihat Semua ({goalsList.length - 5} lagi)</>}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ALERTS */}
      {alerts.length > 0 && (
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1"><Bell size={16}/> Smart Alert</h3>
            <div className="space-y-2">
              {alerts.slice(0, 3).map((alert, idx) => (
                <div key={idx} className={`rounded p-2 border text-xs flex items-start gap-1 ${alert.tipe === "danger" ? "bg-red-50 border-red-200 text-red-800" : alert.tipe === "warning" ? "bg-yellow-50 border-yellow-200 text-yellow-800" : "bg-blue-50 border-blue-200 text-blue-800"}`}>
                  {alert.tipe === "danger" ? <AlertTriangle size={14} className="mt-0.5 shrink-0"/> : alert.tipe === "warning" ? <AlertTriangle size={14} className="mt-0.5 shrink-0"/> : <Info size={14} className="mt-0.5 shrink-0"/>} {alert.pesan}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}