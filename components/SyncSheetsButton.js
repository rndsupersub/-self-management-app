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
      const res = await fetch("/api/sync-sheets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ uid: user.uid }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sync gagal");
      const totalRows = data.results.reduce((acc, r) => acc + (r.rows || 0), 0);
      setToast({ type: "success", msg: `✅ Sync berhasil — ${totalRows} baris.` });
    } catch (err) {
      setToast({ type: "error", msg: `❌ Error: ${err.message}` });
    } finally {
      setIsSyncing(false); setTimeout(() => setToast(null), 5000);
    }
  };

  return (
    <>
      <button className="btn btn-ghost btn-sm gap-1" onClick={handleSync} disabled={isSyncing} title="Sync ke Google Sheets">
        {isSyncing ? <span className="loading loading-spinner loading-xs" /> : <Table size={16} />}
        <span className="hidden md:inline">{isSyncing ? "Syncing..." : "Sync Sheets"}</span>
      </button>
      {toast && (
        <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded shadow-lg text-sm ${toast.type === "success" ? "bg-success text-success-content" : "bg-error text-error-content"}`}>
          {toast.msg}
        </div>
      )}
    </>
  );
}