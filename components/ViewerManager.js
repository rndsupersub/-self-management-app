// components/ViewerManager.js
"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";

export default function ViewerManager({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewers, setViewers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Fetch viewers yang punya akses ke owner ini
  const fetchViewers = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      // Query semua viewer yang ownerUids-nya include user.uid
      const q = query(
        collection(db, "viewers"),
        where("ownerUids", "array-contains", user.uid)
      );
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({
        uid: d.id,
        ...d.data(),
      }));
      setViewers(list);
    } catch (err) {
      console.error("[ViewerManager] Fetch error:", err);
      setToast({ type: "error", msg: "Gagal fetch viewer: " + err.message });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) fetchViewers();
  }, [isOpen]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  // Hapus akses viewer (remove user.uid dari ownerUids)
  const handleRevoke = async (viewerUid) => {
    if (!confirm("Hapus akses viewer ini? Dia nggak bisa liat Pekerjaan lo lagi.")) return;
    try {
      const viewer = viewers.find((v) => v.uid === viewerUid);
      if (!viewer) return;

      const newOwnerUids = (viewer.ownerUids || []).filter((uid) => uid !== user.uid);
      const viewerRef = doc(db, "viewers", viewerUid);
      await updateDoc(viewerRef, {
        ownerUids: newOwnerUids,
        updatedAt: new Date().toISOString(),
      });

      setToast({ type: "success", msg: "✅ Akses viewer dihapus." });
      fetchViewers();
    } catch (err) {
      console.error("[ViewerManager] Revoke error:", err);
      setToast({ type: "error", msg: "Gagal hapus akses: " + err.message });
    }
  };

  return (
    <>
      <button
        className="btn btn-ghost btn-sm gap-1"
        onClick={() => setIsOpen(true)}
        title="Viewer Access"
      >
        👁️ Viewer
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="card bg-base-100 w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto">
            <div className="card-body p-4">
              <div className="flex justify-between items-center mb-3">
                <h2 className="card-title">👁️ Viewer Access</h2>
                <button className="btn btn-ghost btn-sm" onClick={() => setIsOpen(false)}>
                  ✕
                </button>
              </div>

              <div className="alert alert-info py-2 mb-3">
                <span className="text-xs">
                  Viewer yang punya akses ke Pekerjaan lo. Lo bisa hapus akses mereka kapan aja.
                </span>
              </div>

              {loading ? (
                <p className="text-center text-xs opacity-50 py-4">
                  <span className="loading loading-spinner loading-sm"></span> Loading...
                </p>
              ) : viewers.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-3xl mb-2">👁️</p>
                  <p className="text-sm opacity-60">
                    Belum ada viewer yang punya akses ke Pekerjaan lo.
                  </p>
                  <p className="text-xs opacity-40 mt-2">
                    Viewer bisa daftar sendiri di halaman Sign Up.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {viewers.map((viewer) => (
                    <div
                      key={viewer.uid}
                      className="flex items-center gap-3 p-3 rounded bg-base-200"
                    >
                      {viewer.photoURL ? (
                        <img
                          src={viewer.photoURL}
                          alt="avatar"
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-content font-bold">
                          {(viewer.nama || "?").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">
                          {viewer.nama || "Tanpa nama"}
                        </p>
                        <p className="text-xs opacity-60 truncate">{viewer.email}</p>
                      </div>
                      <button
                        className="btn btn-error btn-xs"
                        onClick={() => handleRevoke(viewer.uid)}
                        title="Hapus akses"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="text-xs opacity-60 mt-3 pt-3 border-t border-base-300">
                <p><b>Total:</b> {viewers.length} viewer</p>
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