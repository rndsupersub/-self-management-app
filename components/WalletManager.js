// components/WalletManager.js
"use client";

import { useState } from "react";
import {
  DEFAULT_DOMPET,
  generateId,
  formatRupiah,
} from "@/lib/keuanganData";

// ========== PILIHAN TIPE ==========

const TIPE_OPTIONS = [
  { id: "spending", label: "💸 Spending (Pengeluaran)" },
  { id: "target", label: "🎯 Target (Tabungan)" },
];

const PERIODE_OPTIONS = [
  { id: "mingguan", label: "Mingguan" },
  { id: "2mingguan", label: "2 Mingguan" },
  { id: "bulanan", label: "Bulanan" },
  { id: "alltime", label: "All-time" },
];

// ========== PILIHAN WARNA (10 PALET) ==========

const WARNA_OPTIONS = [
  { id: "red", label: "🔴 Merah", bg: "bg-red-500" },
  { id: "orange", label: "🟠 Orange", bg: "bg-orange-500" },
  { id: "yellow", label: "🟡 Kuning", bg: "bg-yellow-500" },
  { id: "green", label: "🟢 Hijau", bg: "bg-green-500" },
  { id: "teal", label: "🩵 Teal", bg: "bg-teal-500" },
  { id: "blue", label: "🔵 Biru", bg: "bg-blue-500" },
  { id: "indigo", label: "🔷 Indigo", bg: "bg-indigo-500" },
  { id: "purple", label: "🟣 Ungu", bg: "bg-purple-500" },
  { id: "pink", label: "🩷 Pink", bg: "bg-pink-500" },
  { id: "gray", label: "⚪ Abu", bg: "bg-gray-500" },
];

export default function WalletManager({
  dompetList = DEFAULT_DOMPET,
  onUpdateDompetList,
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmHapus, setConfirmHapus] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    nama: "",
    tipe: "spending",
    periode: "mingguan",
    budget: "",
    warna: "blue",
  });
  const [errorMsg, setErrorMsg] = useState("");

  // ========== BUKA FORM TAMBAH ==========
  const handleBukaForm = () => {
    setFormData({
      nama: "",
      tipe: "spending",
      periode: "mingguan",
      budget: "",
      warna: "blue",
    });
    setEditingId(null);
    setErrorMsg("");
    setShowForm(true);
  };

  // ========== BUKA FORM EDIT ==========
  const handleBukaEdit = (dompet) => {
    setFormData({
      nama: dompet.nama,
      tipe: dompet.tipe,
      periode: dompet.periode,
      budget: dompet.budget || "",
      warna: dompet.warna || "blue",
    });
    setEditingId(dompet.id);
    setErrorMsg("");
    setShowForm(true);
  };

  // ========== SIMPAN ==========
  const handleSimpan = () => {
    setErrorMsg("");
    if (!formData.nama.trim()) {
      setErrorMsg("Nama dompet wajib diisi.");
      return;
    }
    const budget = parseInt(formData.budget) || 0;
    if (budget < 0) {
      setErrorMsg("Budget/saldo nggak boleh negatif.");
      return;
    }

    const newDompet = {
      id: editingId || generateId("dompet"),
      nama: formData.nama.trim(),
      tipe: formData.tipe,
      periode: formData.tipe === "spending" ? formData.periode : "alltime",
      budget,
      warna: formData.warna,
    };

    let updated;
    if (editingId) {
      updated = dompetList.map((d) => (d.id === editingId ? newDompet : d));
    } else {
      updated = [...dompetList, newDompet];
    }

    onUpdateDompetList(updated);
    setShowForm(false);
    setEditingId(null);
  };

  // ========== HAPUS ==========
  const handleHapus = (id) => {
    const updated = dompetList.filter((d) => d.id !== id);
    onUpdateDompetList(updated);
    setConfirmHapus(null);
  };

  // ========== HELPER ==========
  const getWarnaClass = (warnaId) =>
    WARNA_OPTIONS.find((w) => w.id === warnaId)?.bg || "bg-gray-500";

  const getTipeLabel = (tipe) =>
    TIPE_OPTIONS.find((t) => t.id === tipe)?.label || tipe;

  const getPeriodeLabel = (periode) =>
    PERIODE_OPTIONS.find((p) => p.id === periode)?.label || periode;

  const dompetSpending = dompetList.filter((d) => d.tipe === "spending");
  const dompetTarget = dompetList.filter((d) => d.tipe === "target");

  return (
    <div className="space-y-4">
      {/* INFO */}
      <div className="alert alert-info py-2 text-xs">
        <span>
          👛 Dompet <strong>Spending</strong> buat pengeluaran harian (punya
          budget periode). Dompet <strong>Target</strong> buat nabung (punya
          target saldo).
        </span>
      </div>

      {/* HEADER */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h2 className="text-lg font-bold text-gray-800">
          👛 Kelola Dompet ({dompetList.length})
        </h2>
        <button className="btn btn-primary btn-sm" onClick={handleBukaForm}>
          + Tambah Dompet
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="card bg-white shadow border border-blue-300">
          <div className="card-body p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-gray-800">
                {editingId ? "✏️ Edit Dompet" : "➕ Tambah Dompet Baru"}
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
                Nama Dompet *
              </label>
              <input
                type="text"
                className="input input-bordered input-sm w-full text-gray-800 bg-white"
                placeholder="Misal: Operasional"
                value={formData.nama}
                onChange={(e) =>
                  setFormData({ ...formData, nama: e.target.value })
                }
                autoFocus
              />
            </div>

            {/* Tipe */}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">
                Tipe
              </label>
              <div className="flex gap-1">
                {TIPE_OPTIONS.map((t) => (
                  <button
                    key={t.id}
                    className={`btn btn-xs flex-1 ${
                      formData.tipe === t.id ? "btn-primary" : "btn-outline"
                    }`}
                    onClick={() =>
                      setFormData({
                        ...formData,
                        tipe: t.id,
                        periode: t.id === "target" ? "alltime" : "mingguan",
                      })
                    }
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Periode (cuma spending) */}
            {formData.tipe === "spending" && (
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">
                  Periode Budget
                </label>
                <select
                  className="select select-bordered select-sm w-full text-gray-800 bg-white"
                  value={formData.periode}
                  onChange={(e) =>
                    setFormData({ ...formData, periode: e.target.value })
                  }
                >
                  {PERIODE_OPTIONS.filter((p) => p.id !== "alltime").map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Budget / Target */}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">
                {formData.tipe === "spending"
                  ? "Budget per Periode (Rp)"
                  : "Target Saldo (Rp)"}
              </label>
              <input
                type="number"
                className="input input-bordered input-sm w-full text-gray-800 bg-white"
                placeholder="0"
                value={formData.budget}
                onChange={(e) =>
                  setFormData({ ...formData, budget: e.target.value })
                }
              />
              {formData.budget && (
                <p className="text-xs text-gray-500 mt-1">
                  = {formatRupiah(formData.budget)}
                </p>
              )}
            </div>

            {/* Warna */}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">
                Warna
              </label>
              <div className="flex flex-wrap gap-1">
                {WARNA_OPTIONS.map((w) => (
                  <button
                    key={w.id}
                    className={`w-7 h-7 rounded ${w.bg} border-2 ${
                      formData.warna === w.id
                        ? "border-gray-800 ring-2 ring-gray-400"
                        : "border-white"
                    }`}
                    onClick={() => setFormData({ ...formData, warna: w.id })}
                    title={w.label}
                  />
                ))}
              </div>
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

      {/* LIST DOMPET SPENDING */}
      {dompetSpending.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-2">
            💸 Dompet Spending ({dompetSpending.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {dompetSpending.map((d) => (
              <div
                key={d.id}
                className="card bg-white shadow border border-gray-200"
              >
                <div className="card-body p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-3 h-3 rounded-full ${getWarnaClass(
                          d.warna
                        )}`}
                      />
                      <h4 className="text-sm font-bold text-gray-800">
                        {d.nama}
                      </h4>
                    </div>
                    <div className="flex gap-1">
                      <button
                        className="btn btn-ghost btn-xs text-gray-500"
                        onClick={() => handleBukaEdit(d)}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-ghost btn-xs text-red-500"
                        onClick={() => setConfirmHapus(d.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">
                    {getTipeLabel(d.tipe)} • {getPeriodeLabel(d.periode)}
                  </p>
                  <p className="text-sm text-gray-700">
                    Budget:{" "}
                    <strong>{formatRupiah(d.budget || 0)}</strong>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LIST DOMPET TARGET */}
      {dompetTarget.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-2">
            🎯 Dompet Target ({dompetTarget.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {dompetTarget.map((d) => (
              <div
                key={d.id}
                className="card bg-white shadow border border-gray-200"
              >
                <div className="card-body p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-3 h-3 rounded-full ${getWarnaClass(
                          d.warna
                        )}`}
                      />
                      <h4 className="text-sm font-bold text-gray-800">
                        {d.nama}
                      </h4>
                    </div>
                    <div className="flex gap-1">
                      <button
                        className="btn btn-ghost btn-xs text-gray-500"
                        onClick={() => handleBukaEdit(d)}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-ghost btn-xs text-red-500"
                        onClick={() => setConfirmHapus(d.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">
                    {getTipeLabel(d.tipe)} • All-time
                  </p>
                  <p className="text-sm text-gray-700">
                    Target:{" "}
                    <strong>{formatRupiah(d.budget || 0)}</strong>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KALAU KOSONG */}
      {dompetList.length === 0 && (
        <div className="card bg-white shadow border border-dashed border-gray-300">
          <div className="card-body p-8 text-center text-gray-400">
            <p className="text-3xl mb-2">👛</p>
            <p className="text-sm">
              Belum ada dompet. Klik "+ Tambah Dompet" untuk mulai.
            </p>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      {confirmHapus && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card bg-white shadow-xl w-full max-w-md">
            <div className="card-body p-4">
              <h3 className="text-base font-bold text-gray-800 mb-2">
                🗑️ Hapus Dompet?
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Yakin mau hapus dompet ini? Transaksi yang udah ada tetap
                tersimpan, tapi wallet-nya nggak muncul lagi di daftar.
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