// components/SyncSheetsButton.js
"use client";

import { useState } from "react";
import { Table } from "lucide-react";

export default function SyncSheetsButton({ user }) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [toast, setToast] = useState(null);

  const handleSync = async () => {
    if (!user?.uid) { setToast({ type: "error", msg: "Belum login." }); return; }
    setIsSyncing(true); setToast(null);

    try {
      // Endpoint sekarang wajib ID token: cuma pemilik data yang bisa sync.
      const idToken = await user.getIdToken();
      const res = await fetch("/api/sync-sheets", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` }, body: JSON.stringify({ uid: user.uid }) });
      const data = await res.json().catch(() => ({}));
      const results = Array.isArray(data.results) ? data.results : [];
      const berhasil = results.filter((r) => r.status === "ok");
      const gagal = results.filter((r) => r.status === "error");

      // Kalau server balas 200 tapi semua tab error, jangan bilang "berhasil".
      if (!res.ok || data.success === false || gagal.length > 0) {
        const detail =
          data.error ||
          (gagal[0] ? `${gagal[0].sheet}: ${gagal[0].error}` : "Penyebab tidak diketahui.");
        throw new Error(detail);
      }

      const totalRows = berhasil.reduce((acc, r) => acc + (r.rows || 0), 0);
      setToast({
        type: "success",
        msg: `✅ Sync berhasil — ${totalRows} baris.`,
        url: data.spreadsheetUrl,
      });
    } catch (err) {
      setToast({ type: "error", msg: `❌ Sync gagal: ${err.message}` });
    } finally {
      setIsSyncing(false);
      setTimeout(() => setToast(null), 12000);
    }
  };

  return (
    <>
      <button className="btn btn-ghost btn-sm gap-1" onClick={handleSync} disabled={isSyncing} title="Sync ke Google Sheets">
        {isSyncing ? <span className="loading loading-spinner loading-xs" /> : <Table size={16} />}
        <span className="hidden md:inline">{isSyncing ? "Syncing..." : "Sync Sheets"}</span>
      </button>
      {toast && (
        <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] max-w-[92vw] px-4 py-2 rounded shadow-lg text-sm text-center ${toast.type === "success" ? "bg-success text-success-content" : "bg-error text-error-content"}`}>
          {toast.msg}
          {toast.url && (
            <a
              href={toast.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 underline font-semibold"
            >
              Buka
            </a>
          )}
        </div>
      )}
    </>
  );
}