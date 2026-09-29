// components/TelegramSetting.js
"use client";

import { useState, useEffect } from "react";

export default function TelegramSetting({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [webhookInfo, setWebhookInfo] = useState(null);

  // Ambil info webhook dari Telegram
  const cekWebhook = async () => {
    try {
      const res = await fetch("/api/telegram/setup");
      const data = await res.json();
      setWebhookInfo(data);
    } catch (e) {
      console.error(e);
    }
  };

  const setWebhook = async () => {
    try {
      const res = await fetch("/api/telegram/setup", { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        setToast({ type: "success", msg: "✅ Webhook berhasil di-set!" });
      } else {
        setToast({ type: "error", msg: `❌ ${data.error || "Gagal"}` });
      }
      cekWebhook();
    } catch (e) {
      setToast({ type: "error", msg: `❌ ${e.message}` });
    }
  };

  useEffect(() => {
    if (isOpen) cekWebhook();
  }, [isOpen]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
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
          <div className="card bg-base-100 w-full max-w-lg mx-4">
            <div className="card-body p-4">
              <div className="flex justify-between items-center mb-3">
                <h2 className="card-title">🤖 Telegram Bot Setting</h2>
                <button className="btn btn-ghost btn-sm" onClick={() => setIsOpen(false)}>
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <div className="alert alert-info py-2">
                  <span className="text-xs">
                    Bot: <b>@self_manage_alfathan_bot</b>
                  </span>
                </div>

                {webhookInfo && (
                  <div className="bg-base-200 p-3 rounded text-sm">
                    <p className="font-semibold mb-1">Status Webhook:</p>
                    {webhookInfo.webhook?.url ? (
                      <div>
                        <p className="text-xs">
                          ✅ URL: <code className="text-xs">{webhookInfo.webhook.url}</code>
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-warning">⚠️ Webhook belum di-set.</p>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <button className="btn btn-primary btn-sm flex-1" onClick={setWebhook}>
                    🔗 Set Webhook
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={cekWebhook}>
                    🔄 Refresh
                  </button>
                </div>

                <div className="text-xs text-base-content/60 mt-3">
                  <p className="font-semibold mb-1">📖 Cara pakai:</p>
                  <p>1. Buka Telegram → cari <b>@self_manage_alfathan_bot</b></p>
                  <p>2. Kirim <code>/help</code> untuk panduan</p>
                  <p>3. Kirim <code>/menu_list</code> untuk daftar menu</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded shadow-lg text-sm ${
            toast.type === "success"
              ? "bg-success text-success-content"
              : "bg-error text-error-content"
          }`}
        >
          {toast.msg}
        </div>
      )}
    </>
  );
}