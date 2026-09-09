"use client";
import { useState, useEffect } from "react";

export default function Finance() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // GANTI URL INI DENGAN URL APPS SCRIPT LO
  const SHEET_URL = "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec";

  useEffect(() => {
    fetch(SHEET_URL)
      .then((res) => res.json())
      .then((raw) => {
        setData(raw);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="card bg-base-100 shadow mt-4">
        <div className="card-body p-4">
          <h2 className="card-title text-base">💰 Keuangan</h2>
          <p className="text-sm text-base-content/50">Loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card bg-base-100 shadow mt-4">
        <div className="card-body p-4">
          <h2 className="card-title text-base">💰 Keuangan</h2>
          <p className="text-sm text-error">⚠️ Gagal ambil data. Cek URL Apps Script.</p>
        </div>
      </div>
    );
  }

  // Ambil data dari spreadsheet (asumsi baris pertama = header)
  const headers = data?.[0] || [];
  const rows = data?.slice(1) || [];

  // Cari baris "Cash Tersedia" atau data penting lainnya
  // Karena format Moon OS beda-beda, kita tampilkan ringkasan sederhana dulu
  const cashRow = rows.find(r => r[0]?.includes("Cash") || r[0]?.includes("💰"));
  const expenseRow = rows.find(r => r[0]?.includes("Pengeluaran") || r[0]?.includes("📤"));

  return (
    <div className="card bg-base-100 shadow mt-4">
      <div className="card-body p-4">
        <h2 className="card-title text-base">💰 Keuangan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          <div className="bg-base-200 p-3 rounded">
            <span className="text-xs text-base-content/50">💵 Cash Tersedia</span>
            <div className="text-xl font-bold text-primary">
              {cashRow ? cashRow[1] || '-' : 'Rp 0'}
            </div>
          </div>
          <div className="bg-base-200 p-3 rounded">
            <span className="text-xs text-base-content/50">📤 Pengeluaran Bulan Ini</span>
            <div className="text-xl font-bold text-error">
              {expenseRow ? expenseRow[1] || '-' : 'Rp 0'}
            </div>
          </div>
        </div>

        {/* Tambahan: Status dompet (jika ada di data) */}
        <div className="mt-2 text-xs text-base-content/50">
          Data dari Project Moon OS • {rows.length} baris
        </div>
      </div>
    </div>
  );
}