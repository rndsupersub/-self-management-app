// app/(dashboard)/viewer/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import Link from "next/link";

export default function ViewerDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewerData, setViewerData] = useState(null);
  const [ownerList, setOwnerList] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      try {
        const viewerRef = doc(db, "viewers", user.uid);
        const viewerSnap = await getDoc(viewerRef);

        if (!viewerSnap.exists()) {
          router.push("/dashboard");
          return;
        }

        const data = viewerSnap.data();
        if (!data.passwordHash) {
          router.push("/login");
          return;
        }

        setViewerData({ ...data, _uid: user.uid });

        // Fetch SEMUA users (owner) — realtime
        const usersSnap = await getDocs(collection(db, "users"));
        const owners = usersSnap.docs
          .map((d) => ({ uid: d.id, ...d.data() }))
          .filter((u) => !u.role || u.role === "owner")
          .map((u) => ({
            uid: u.uid,
            nama: u.nama || u.displayName || u.email || "User tanpa nama",
            email: u.email || "",
            photoURL: u.photoURL || "",
          }));

        setOwnerList(owners);
      } catch (err) {
        console.error("[viewer] Error:", err);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="navbar bg-base-100 shadow px-4">
        <div className="flex-1">
          <h1 className="text-xl font-bold">👁️ Viewer Mode</h1>
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-sm opacity-70">
            {viewerData?.nama || user?.email}
          </span>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title mb-2">📋 Pilih Owner</h2>
            <p className="text-sm opacity-70 mb-4">
              Pilih owner yang mau lo liat progress-nya. Viewer cuma bisa liat (read-only).
            </p>

            {ownerList.length === 0 ? (
              <div className="alert alert-info">
                <span>Belum ada user yang terdaftar di website.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {ownerList.map((owner) => (
                  <Link
                    key={owner.uid}
                    href={`/viewer/${owner.uid}`}
                    className="card bg-base-200 hover:bg-base-300 transition cursor-pointer"
                  >
                    <div className="card-body p-4 flex-row items-center gap-3">
                      {owner.photoURL ? (
                        <img
                          src={owner.photoURL}
                          alt="avatar"
                          className="w-12 h-12 rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-content font-bold">
                          {(owner.nama || "?").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-bold">{owner.nama}</p>
                        <p className="text-xs opacity-60">{owner.email}</p>
                      </div>
                      <span className="text-2xl">→</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}