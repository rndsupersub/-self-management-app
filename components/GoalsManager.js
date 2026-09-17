// components/GoalsManager.js
"use client";

import { useMemo, useState } from "react";
import {
  DEFAULT_GOALS,
  DEFAULT_DOMPET,
  generateId,
  formatRupiah,
  hitungProgressGoal,
} from "@/lib/keuanganData";

export default function GoalsManager({
  goalsList = DEFAULT_GOALS,
  dompetList = DEFAULT_DOMPET,
  keuanganTransaksi = {},
  onUpdateGoalsList,
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmHapus, setConfirmHapus] = useState(null);

  const [formData, setFormData] = useState({
    nama: "",
    target: "",
    walletId: "",
  });
  const [errorMsg, setErrorMsg] = useState("");

  // ========== HITUNG PROGRESS SEMUA GOALS ==========
  const goalsData = useMemo(() => {
    return (goalsList || []).map((g) => {
      const progress = hitungProgressGoal(g, dompetList, keuanganTransaksi);
      return { ...g, ...progress };
    });
  }, [goalsList, dompetList, keuanganTransaksi]);

  // Ringkasan total
  const ringkasan = useMemo(() => {
    const totalTarget = goalsData.reduce((s, g) => s + (g.target || 0), 0);
    const totalTerkumpul = goalsData.reduce((s, g) => s + (g.saldo || 0), 0);
    const persen =
      totalTarget > 0 ? Math.round((totalTerkumpul / totalTarget) * 100) : 0;
    const selesai = goalsData.filter((g) => g.persen >= 100).length;
    return { totalTarget, totalTerkumpul, persen, selesai };
  }, [goalsData]);

  // ========== BUKA FORM TAMBAH ==========
  const handleBukaForm = () => {
    setFormData({
      nama: "",
      target: "",
      walletId: dompetList[0]?.id || "",
    });
    setEditingId(null);
    setErrorMsg("");
    setShowForm(true);
  };

  // ========== BUKA FORM EDIT ==========
  const handleBukaEdit = (goal) => {
    setFormData({
      nama: goal.nama,
      target: goal.target || "",
      walletId: goal.walletId || "",
    });
    setEditingId(goal.id);
    setErrorMsg("");
    setShowForm(true);
  };

  // ========== SIMPAN ==========
  const handleSimpan = () => {
    setErrorMsg("");
    if (!formData.nama.trim()) {
      setErrorMsg("Nama goal wajib diisi.");
      return;
    }
    const target = parseInt(formData.target);
    if (!target || target <= 0) {
      setErrorMsg("Target harus lebih dari 0.");
      return;
    }
    if (!formData.walletId) {
      setErrorMsg("Pilih wallet sumber dana.");
      return;
    }

    const newGoal = {
      id: editingId || generateId("goal"),
      nama: formData.nama.trim(),
      target,
      walletId: formData.walletId,
    };

    let updated;
    if (editingId) {
      updated = goalsList.map((g) => (g.id === editingId ? newGoal : g));
    } else {
      updated = [...goalsList, newGoal];
    }

    onUpdateGoalsList(updated);
    setShowForm(false);
    setEditingId(null);
  };

  // ========== HAPUS ==========
  const handleHapus = (id) => {
    const updated = goalsList.filter((g) => g.id !== id);
    onUpdateGoalsList(updated);
    setConfirmHapus(null);
  };

  // ========== HELPER ==========
  const getWalletNama = (walletId) => {
    return dompetList.find((d) => d.id === walletId)?.nama || walletId;
  };

  const getProgressColor = (persen) => {
    if (persen >= 100) return "progress-success";
    if (persen >= 50) return "progress-primary";
    return "progress-warning";
  };

  return (
    <div className="space-y-4">
      {/* INFO */}
      <div className="alert alert-info py-2 text-xs">
        <span>
          🎯 Goal = target keuangan yang lo mau capai. Progress dihitung
          otomatis dari tabungan yang masuk ke wallet sumber.
        </span>
      </div>

      {/* RINGKASAN TOTAL */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-4">
            <p className="text-xs text-gray-500">🎯 Total Target</p>
            <p className="text-lg font-bold text-gray-800">
              {formatRupiah(ringkasan.totalTarget)}
            </p>
          </div>
        </div>
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-4">
            <p className="text-xs text-gray-500">💰 Total Terkumpul</p>
            <p className="text-lg font-bold text-green-700">
              {formatRupiah(ringkasan.totalTerkumpul)}
            </p>
          </div>
        </div>
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-4">
            <p className="text-xs text-gray-500">📊 Progress Total</p>
            <p className="text-lg font-bold text-blue-700">
              {ringkasan.persen}% ({ringkasan.selesai}/{goalsData.length})
            </p>
          </div>
        </div>
      </div>

      {/* HEADER */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h2 className="text-lg font-bold text-gray-800">
          🎯 Kelola Goals ({goalsList.length})
        </h2>
        <button className="btn btn-primary btn-sm" onClick={handleBukaForm}>
          + Tambah Goal
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="card bg-white shadow border border-blue-300">
          <div className="card-body p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-gray-800">
                {editingId ? "✏️ Edit Goal" : "➕ Tambah Goal Baru"}
              </h3>
              <button
                className="btn btn-ghost btn-xs text-gray-500"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
              >
                ✕
              </button>
            </div>

            {/* Nama */}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">
                Nama Goal *
              </label>
              <input
                type="text"
                className="input input-bordered input-sm w-full text-gray-800 bg-white"
                placeholder="Misal: Dana Darurat"
                value={formData.nama}
                onChange={(e) =>
                  setFormData({ ...formData, nama: e.target.value })
                }
                autoFocus
              />
            </div>

            {/* Target */}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">
                Target (Rp) *
              </label>
              <input
                type="number"
                className="input input-bordered input-sm w-full text-gray-800 bg-white"
                placeholder="2000000"
                value={formData.target}
                onChange={(e) =>
                  setFormData({ ...formData, target: e.target.value })
                }
              />
              {formData.target && (
                <p className="text-xs text-gray-500 mt-1">
                  = {formatRupiah(formData.target)}
                </p>
              )}
            </div>

            {/* Wallet Sumber */}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">
                Wallet Sumber Dana *
              </label>
              <select
                className="select select-bordered select-sm w-full text-gray-800 bg-white"
                value={formData.walletId}
                onChange={(e) =>
                  setFormData({ ...formData, walletId: e.target.value })
                }
              >
                <option value="">-- Pilih Wallet --</option>
                {dompetList.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nama}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-gray-500 mt-1">
                Tabungan yang masuk ke wallet ini bakal nambah progress goal.
              </p>
            </div>

            {errorMsg && (
              <div className="alert alert-error py-2 text-xs">
                <span>⚠️ {errorMsg}</span>
              </div>
            )}

            <div className="flex gap-2">
              <button
                className="btn btn-primary btn-sm flex-1"
                onClick={handleSimpan}
              >
                {editingId ? "💾 Simpan" : "➕ Tambah"}
              </button>
              <button
                className="btn btn-ghost btn-sm text-gray-700"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIST GOALS */}
      {goalsData.length === 0 ? (
        <div className="card bg-white shadow border border-dashed border-gray-300">
          <div className="card-body p-8 text-center text-gray-400">
            <p className="text-3xl mb-2">🎯</p>
            <p className="text-sm">
              Belum ada goals. Klik "+ Tambah Goal" untuk mulai.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {goalsData.map((goal) => (
            <div
              key={goal.id}
              className={`card shadow border ${
                goal.persen >= 100
                  ? "bg-green-50 border-green-300"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="card-body p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="text-base font-bold text-gray-800">
                      {goal.persen >= 100 && "✅ "}
                      {goal.nama}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Sumber: {getWalletNama(goal.walletId)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      className="btn btn-ghost btn-xs text-gray-500"
                      onClick={() => handleBukaEdit(goal)}
                    >
                      ✏️
                    </button>
                    <button
                      className="btn btn-ghost btn-xs text-red-500"
                      onClick={() => setConfirmHapus(goal.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <progress
                  className={`progress w-full h-3 ${getProgressColor(
                    goal.persen
                  )}`}
                  value={goal.persen}
                  max="100"
                />

                <div className="flex justify-between text-xs mt-2">
                  <span className="text-gray-600">
                    {formatRupiah(goal.saldo)}
                  </span>
                  <span className="font-semibold text-gray-700">
                    {goal.persen}% dari {formatRupiah(goal.target)}
                  </span>
                </div>

                {goal.persen < 100 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Kurang: {formatRupiah(goal.target - goal.saldo)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      {confirmHapus && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card bg-white shadow-xl w-full max-w-md">
            <div className="card-body p-4">
              <h3 className="text-base font-bold text-gray-800 mb-2">
                🗑️ Hapus Goal?
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Yakin mau hapus goal ini? Progress yang udah terkumpul tetap
                tersimpan di wallet.
              </p>
              <div className="flex gap-2">
                <button
                  className="btn btn-error btn-sm flex-1"
                  onClick={() => handleHapus(confirmHapus)}
                >
                  Ya, Hapus
                </button>
                <button
                  className="btn btn-ghost btn-sm text-gray-700"
                  onClick={() => setConfirmHapus(null)}
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}