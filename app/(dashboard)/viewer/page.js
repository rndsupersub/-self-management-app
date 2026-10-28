// app/(dashboard)/viewer/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import Link from "next/link";
import { Eye, LogOut, ChevronRight, User } from "lucide-react";

export default function ViewerDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewerData, setViewerData] = useState(null);
  const [ownerList, setOwnerList] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push("/login"); return; }
      setUser(user);

      try {
        const viewerRef = doc(db, "viewers", user.uid);
        const viewerSnap = await getDoc(viewerRef);

        if (!viewerSnap.exists()) { router.push("/dashboard"); return; }

        const data = viewerSnap.data();
        if (!data.passwordHash) { router.push("/login"); return; }

        setViewerData({ ...data, _uid: user.uid });

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

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Eye className="text-secondary" size={28} /> Viewer Mode
        </h1>
        <div className="flex gap-3 items-center">
          <span className="text-sm font-semibold text-gray-600">
            {viewerData?.nama || user?.email}
          </span>
          <button className="btn btn-ghost btn-sm text-error hover:bg-error/10" onClick={handleLogout}>
            <LogOut size={16} className="mr-1" /> Logout
          </button>
        </div>
      </div>

      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
            <User size={18} /> Pilih Owner
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Pilih owner yang mau lo liat progress-nya. Viewer cuma bisa liat (read-only).
          </p>

          {ownerList.length === 0 ? (
            <div className="alert alert-info">
              <span>Belum ada user yang terdaftar di website.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ownerList.map((owner) => (
                <Link key={owner.uid} href={`/viewer/${owner.uid}`} className="card bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:shadow-md transition cursor-pointer">
                  <div className="card-body p-4 flex-row items-center gap-3">
                    {owner.photoURL ? (
                      <img src={owner.photoURL} alt="avatar" className="w-12 h-12 rounded-full border border-gray-300" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-content font-bold text-lg">
                        {(owner.nama || "?").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-bold text-gray-800">{owner.nama}</p>
                      <p className="text-xs text-gray-500">{owner.email}</p>
                    </div>
                    <ChevronRight className="text-gray-400" size={20} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}