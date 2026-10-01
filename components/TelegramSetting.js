// components/TelegramSetting.js
"use client";

import { useState, useEffect } from "react";

export default function TelegramSetting({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [status, setStatus] = useState(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  // Cek status
  const cekStatus = async () => {
    if (!user?.uid) return;
    try {
      const res = await fetch(`/api/telegram/generate-code?uid=${user.uid}`);
      const data = await res.json();
      setStatus(data);
    } catch (e) {
      console.error(e);
    }
  };

  // Generate code
  const generateCode = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const res = await fetch("/api/telegram/generate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user.uid }),
      });
      const data = await res.json();
      if (data.ok) {
        setCode(data.code);
        setToast({ type: "success", msg: `✅ Kode: ${data.code}` });
      } else {
        setToast({ type: "error", msg: `❌ ${data.error}` });
      }
    } catch (e) {
      setToast({ type: "error", msg: `❌ ${e.message}` });
    } finally {
      setLoading(false);
    }
  };

  // Unlink
  const handleUnlink = async () => {
    if (!confirm("Disconnect Telegram? Lo harus pairing ulang kalau mau pakai lagi.")) return;
    try {
      const res = await fetch("/api/telegram/generate-code", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user.uid }),
      });
      if (res.ok) {
        setToast({ type: "success", msg: "✅ Telegram di-disconnect." });
        setStatus({ linked: false });
      }
    } catch (e) {
      setToast({ type: "error", msg: `❌ ${e.message}` });
    }
  };

  useEffect(() => {
    if (isOpen) {
      cekStatus();
      setCode("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 8000);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <>
      <button
        className="btn btn-ghost btn-sm gap-1"
        onClick={() => setIsOpen(true)}
        title="Telegram Setting"
      >
        🤖 Telegram
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="card bg-base-100 w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto">
            <div className="card-body p-4">
              <div className="flex justify-between items-center mb-3">
                <h2 className="card-title">🤖 Telegram Bot</h2>
                <button className="btn btn-ghost btn-sm" onClick={() => setIsOpen(false)}>✕</button>
              </div>

              <div className="space-y-3">
                <div className="alert alert-info py-2">
                  <span className="text-xs">
                    Bot: <b>@self_manage_alfathan_bot</b>
                  </span>
                </div>

                {/* Loading */}
                {!status && (
                  <p className="text-center text-xs text-base-content/50">
                    <span className="loading loading-spinner loading-sm"></span> Cek status...
                  </p>
                )}

                {/* Linked */}
                {status?.linked && (
                  <>
                    <div className="alert alert-success py-2">
                      <span className="text-xs">✅ Telegram udah nyambung</span>
                    </div>
                    <div className="bg-base-200 p-3 rounded text-xs space-y-1">
                      <p><b>Username:</b> @{status.telegramUsername || "(no username)"}</p>
                      <p><b>Nama:</b> {status.telegramFirstName || "-"}</p>
                      <p><b>Chat ID:</b> {status.telegramChatId}</p>
                      <p><b>Linked:</b> {status.telegramLinkedAt ? new Date(status.telegramLinkedAt).toLocaleString("id-ID") : "-"}</p>
                    </div>
                    <button className="btn btn-error btn-sm w-full" onClick={handleUnlink}>
                      🔓 Disconnect Telegram
                    </button>
                  </>
                )}

                {/* Not linked */}
                {status && !status.linked && (
                  <>
                    <div className="alert alert-warning py-2">
                      <span className="text-xs">⚠️ Belum di-link ke Telegram</span>
                    </div>

                    {!code ? (
                      <>
                        <p className="text-xs text-base-content/70">
                          Klik tombol di bawah buat generate code. Code ini <b>sekali pakai</b>.
                        </p>
                        <button
                          className="btn btn-primary btn-sm w-full"
                          onClick={generateCode}
                          disabled={loading}
                        >
                          {loading ? "Loading..." : "🔗 Generate Pairing Code"}
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="bg-blue-50 border border-blue-300 rounded p-3 text-center">
                          <p className="text-xs text-blue-700 mb-1">Kode lo:</p>
                          <p className="text-3xl font-mono font-bold text-blue-900 tracking-widest">{code}</p>
                        </div>

                        <div className="bg-base-200 p-3 rounded text-xs space-y-2">
                          <p className="font-semibold">📖 Cara pakai:</p>
                          <p>1. Buka Telegram</p>
                          <p>2. Cari <b>@self_manage_alfathan_bot</b></p>
                          <p>3. Kirim pesan:</p>
                          <p className="font-mono bg-white p-2 rounded border border-gray-300 text-center">
                            /link {code}
                          </p>
                          <p>4. Bot bakal balas "✅ Berhasil di-link!"</p>
                        </div>

                        <button
                          className="btn btn-ghost btn-xs w-full"
                          onClick={generateCode}
                        >
                          🔄 Generate code baru
                        </button>
                      </>
                    )}
                  </>
                )}

                <div className="text-xs text-base-content/60 mt-3 pt-3 border-t border-base-300">
                  <p className="font-semibold mb-1">📖 Command Telegram:</p>
                  <p><code>/help</code> — panduan</p>
                  <p><code>/menu_list</code> — daftar menu</p>
                  <p><code>/status</code> — cek sync</p>
                  <p><code>/today</code> — ringkasan hari ini</p>
                  <p><code>/unlink</code> — putus koneksi</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded shadow-lg text-sm ${
            toast.type === "success" ? "bg-success text-success-content" : "bg-error text-error-content"
          }`}
        >
          {toast.msg}
        </div>
      )}
    </>
  );
}