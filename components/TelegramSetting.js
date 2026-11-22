// components/TelegramSetting.js
"use client";

import { useState, useEffect } from "react";
import { Bot, Link2, Unlink, X, RefreshCw } from "lucide-react";
import ModalPortal from "@/components/ModalPortal";
import { auth } from "@/lib/firebase";

export default function TelegramSetting({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [status, setStatus] = useState(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [webhook, setWebhook] = useState(null);
  const [webhookBusy, setWebhookBusy] = useState(false);
  const [webhookMsg, setWebhookMsg] = useState(null);

  const authHeaders = async () => {
    const current = auth.currentUser || user;
    if (!current) throw new Error("Sesi login nggak ditemukan");
    const token = await current.getIdToken();
    return { Authorization: `Bearer ${token}` };
  };

  const cekStatus = async () => {
    if (!user?.uid) return;
    try {
      const headers = await authHeaders();
      const res = await fetch(`/api/telegram/generate-code?uid=${user.uid}`, { headers });
      const data = await res.json();
      setStatus(res.ok ? data : { linked: false, error: data.error });
    } catch (e) { console.error(e); }
  };

  const cekWebhook = async () => {
    if (!user?.uid) return;
    try {
      const headers = await authHeaders();
      const res = await fetch("/api/telegram/register-webhook", { headers });
      const data = await res.json();
      setWebhook(res.ok ? data : { error: data.error || "Gagal cek webhook" });
    } catch (e) { setWebhook({ error: e.message }); }
  };

  const perbaikiWebhook = async () => {
    setWebhookBusy(true);
    setWebhookMsg(null);
    try {
      const headers = await authHeaders();
      const res = await fetch("/api/telegram/register-webhook", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: "{}",
      });
      const data = await res.json();
      if (data.ok) setWebhookMsg({ type: "success", msg: "✅ Webhook aktif dan pakai secret token." });
      else setWebhookMsg({ type: "error", msg: `❌ ${data.error || data.description || "Gagal daftarin webhook"}` });
      await cekWebhook();
    } catch (e) {
      setWebhookMsg({ type: "error", msg: `❌ ${e.message}` });
    } finally {
      setWebhookBusy(false);
    }
  };

  const generateCode = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const headers = await authHeaders();
      const res = await fetch("/api/telegram/generate-code", { method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify({ uid: user.uid }) });
      const data = await res.json();
      if (data.ok) { setCode(data.code); setToast({ type: "success", msg: `✅ Kode: ${data.code}` }); }
      else setToast({ type: "error", msg: `❌ ${data.error}` });
    } catch (e) { setToast({ type: "error", msg: `❌ ${e.message}` }); }
    finally { setLoading(false); }
  };

  const handleUnlink = async () => {
    if (!confirm("Disconnect Telegram?")) return;
    try {
      const headers = await authHeaders();
      const res = await fetch("/api/telegram/generate-code", { method: "DELETE", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify({ uid: user.uid }) });
      if (res.ok) { setToast({ type: "success", msg: "✅ Telegram di-disconnect." }); setStatus({ linked: false }); }
    } catch (e) { setToast({ type: "error", msg: `❌ ${e.message}` }); }
  };

  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 8000); return () => clearTimeout(t); }, [toast]);

  return (
    <>
      <button className="btn btn-ghost btn-sm gap-1" onClick={() => { setIsOpen(true); cekStatus(); cekWebhook(); setCode(""); setWebhookMsg(null); }} title="Telegram Setting">
        <Bot size={16} /> <span className="hidden md:inline">Telegram</span>
      </button>

      {isOpen && (
        <ModalPortal onClose={() => setIsOpen(false)}>
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-black/50 p-3 sm:p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
        >
          <div className="card bg-base-100 my-auto w-full max-w-lg max-h-[calc(100dvh-1.5rem)] overflow-y-auto" role="dialog" aria-modal="true" aria-label="Telegram Bot">
            <div className="card-body p-4">
              <div className="flex justify-between items-center mb-3">
                <h2 className="card-title flex items-center gap-2"><Bot size={20} /> Telegram Bot</h2>
                <button className="btn btn-ghost btn-sm" onClick={() => setIsOpen(false)} aria-label="Tutup telegram"><X size={18} /></button>
              </div>

              <div className="space-y-3">
                <div className="alert alert-info py-2">
                  <span className="text-xs">Bot: <b>@self_manage_alfathan_bot</b></span>
                </div>

                {!status && <p className="text-center text-xs text-gray-500"><span className="loading loading-spinner loading-sm"></span> Cek status...</p>}

                {status?.linked && (
                  <>
                    <div className="alert alert-success py-2"><span className="text-xs">✅ Telegram udah nyambung</span></div>
                    <div className="bg-base-200 p-3 rounded text-xs space-y-1">
                      <p><b>Username:</b> @{status.telegramUsername || "(no username)"}</p>
                      <p><b>Chat ID:</b> {status.telegramChatId}</p>
                    </div>
                    <button className="btn btn-error btn-sm w-full gap-2" onClick={handleUnlink}><Unlink size={16} /> Disconnect Telegram</button>
                  </>
                )}

                {status && !status.linked && (
                  <>
                    <div className="alert alert-warning py-2"><span className="text-xs">⚠️ Belum di-link ke Telegram</span></div>
                    {!code ? (
                      <>
                        <p className="text-xs text-gray-600">Klik tombol di bawah buat generate code. Code ini <b>sekali pakai</b>.</p>
                        <button className="btn btn-primary btn-sm w-full gap-2" onClick={generateCode} disabled={loading}>
                          {loading ? <span className="loading loading-spinner loading-xs" /> : <Link2 size={16} />}
                          {loading ? "Loading..." : "Generate Pairing Code"}
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="bg-stone-100 border border-stone-300 rounded p-3 text-center">
                          <p className="text-xs text-stone-700 mb-1">Kode lo:</p>
                          <p className="text-3xl font-mono font-bold text-stone-900 tracking-widest">{code}</p>
                        </div>
                        <div className="bg-base-200 p-3 rounded text-xs space-y-2">
                          <p className="font-semibold">📖 Cara pakai:</p>
                          <p>1. Buka Telegram</p>
                          <p>2. Cari <b>@self_manage_alfathan_bot</b></p>
                          <p>3. Kirim pesan:</p>
                          <p className="font-mono bg-white p-2 rounded border border-gray-300 text-center">/link {code}</p>
                        </div>
                        <button className="btn btn-ghost btn-xs w-full" onClick={generateCode}><RefreshCw size={12} className="mr-1"/> Generate code baru</button>
                      </>
                    )}
                  </>
                )}

                {/* STATUS WEBHOOK: tanpa ini bot bisa diam total tanpa kelihatan error di web. */}
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-xs font-semibold text-gray-700 flex items-center gap-1"><RefreshCw size={12} /> Webhook Bot</p>
                    {webhook && !webhook.error && (
                      <span className={`text-[10px] px-2 py-0.5 rounded border ${
                        webhook.terdaftar && webhook.cocok
                          ? "bg-green-50 text-green-700 border-green-200"
                          : webhook.terdaftar
                          ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                          : "bg-red-50 text-error border-red-200"
                      }`}>
                        {webhook.terdaftar && webhook.cocok ? "Aktif" : webhook.terdaftar ? "URL Beda" : "Belum Aktif"}
                      </span>
                    )}
                  </div>

                  {webhook?.error && <p className="text-xs text-error">{webhook.error}</p>}

                  {webhook && !webhook.error && (
                    <div className="bg-base-200 p-2 rounded text-[11px] space-y-1">
                      <p className="break-all"><b>URL:</b> {webhook.url || "(kosong)"}</p>
                      {webhook.expectedUrl && webhook.url && webhook.url !== webhook.expectedUrl && (
                        <p className="break-all text-yellow-700"><b>Harusnya:</b> {webhook.expectedUrl}</p>
                      )}
                      {webhook.lastErrorMessage && (
                        <p className="text-error break-all"><b>Error terakhir:</b> {webhook.lastErrorMessage}</p>
                      )}
                      <p><b>Pending update:</b> {webhook.pendingUpdateCount ?? 0}</p>
                    </div>
                  )}

                  <button className="btn btn-outline btn-xs w-full mt-2 gap-1" onClick={perbaikiWebhook} disabled={webhookBusy}>
                    {webhookBusy ? <span className="loading loading-spinner loading-xs" /> : <RefreshCw size={12} />} Aktifkan / Perbaiki Webhook
                  </button>
                  <p className="text-[10px] text-gray-500 mt-1">Klik ini kalau bot nggak merespon. Webhook didaftarin ulang + secret token biar aman.</p>
                  {webhookMsg && <p className={`text-[11px] mt-1 ${webhookMsg.type === "success" ? "text-green-700" : "text-error"}`}>{webhookMsg.msg}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}

      {toast && (
        <ModalPortal lockScroll={false}>
          <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-[90] px-4 py-2 rounded shadow-lg text-sm ${toast.type === "success" ? "bg-success text-success-content" : "bg-error text-error-content"}`} role="status">{toast.msg}</div>
        </ModalPortal>
      )}
    </>
  );
}