// app/(dashboard)/dashboard/bedah-buku/[bookId]/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Sidebar from "@/components/Sidebar";
import DetailBuku from "@/components/DetailBuku";
import { DEFAULT_ACTIVITIES } from "@/lib/defaultData";

export default function DetailBukuPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState("");
  const [activities, setActivities] = useState(DEFAULT_ACTIVITIES);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [bedahBuku, setBedahBuku] = useState(null);

  const router = useRouter();
  const params = useParams();
  const bookId = params.bookId;

  // ========== LOAD USER DATA ==========
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        // Load activities
        if (data.activities && Array.isArray(data.activities)) {
          setActivities(data.activities);
        } else {
          await setDoc(docRef, { activities: DEFAULT_ACTIVITIES }, { merge: true });
          setActivities(DEFAULT_ACTIVITIES);
        }

        // Load bedahBuku
        if (data.bedahBuku && typeof data.bedahBuku === "object") {
          setBedahBuku({
            kategori: data.bedahBuku.kategori || [],
            buku: data.bedahBuku.buku || [],
          });
        } else {
          setBedahBuku({ kategori: [], buku: [] });
        }
      } else {
        await setDoc(docRef, {
          activities: DEFAULT_ACTIVITIES,
          bedahBuku: { kategori: [], buku: [] },
        });
        setActivities(DEFAULT_ACTIVITIES);
        setBedahBuku({ kategori: [], buku: [] });
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setToday(new Date().toISOString().split("T")[0]);
  }, []);

  // ========== SIMPAN KE FIRESTORE ==========
  const simpanBedahBuku = async (newBedahBuku) => {
    setBedahBuku(newBedahBuku);
    if (!user) return;
    const docRef = doc(db, "users", user.uid);
    await setDoc(docRef, { bedahBuku: newBedahBuku }, { merge: true });
  };

  // ========== UPDATE BUKU (dari DetailBuku) ==========
  const handleUpdateBuku = async (updatedBuku) => {
    if (!bedahBuku) return;
    const updatedList = bedahBuku.buku.map((b) =>
      b.id === updatedBuku.id ? updatedBuku : b
    );
    await simpanBedahBuku({ ...bedahBuku, buku: updatedList });
  };

  // ========== HAPUS BUKU ==========
  const handleDeleteBuku = async (bukuId) => {
    if (!bedahBuku) return;
    if (!confirm("Hapus buku ini? Semua riwayat baca bakal hilang.")) return;
    const updatedList = bedahBuku.buku.filter((b) => b.id !== bukuId);
    await simpanBedahBuku({ ...bedahBuku, buku: updatedList });
    router.push("/dashboard/bedah-buku");
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  // Cari buku dari list
  const buku = bedahBuku?.buku?.find((b) => b.id === bookId);

  // ========== BUKU NGGAK KETEMU ==========
  if (!buku) {
    return (
      <div className="h-screen flex flex-col bg-base-200">
        <div className="navbar bg-base-100 shadow px-4">
          <div className="flex-1">
            <h1 className="text-xl font-bold">🌙 Self Management</h1>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="card bg-white shadow border border-gray-200">
            <div className="card-body p-8 text-center text-gray-400">
              <p className="text-3xl mb-2">📖</p>
              <p className="text-sm mb-4">Buku nggak ditemukan.</p>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => router.push("/dashboard/bedah-buku")}
              >
                ← Balik ke Bedah Buku
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-base-200">
      {/* Navbar */}
      <div className="navbar bg-base-100 shadow px-4">
        <div className="flex-1">
          <h1 className="text-xl font-bold">🌙 Self Management</h1>
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-sm font-mono">{today}</span>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div
          className={`${
            sidebarCollapsed ? "w-12" : "w-64"
          } transition-all duration-300 bg-base-100`}
        >
          <Sidebar
            activities={activities}
            collapsed={sidebarCollapsed}
            setCollapsed={setSidebarCollapsed}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Breadcrumb */}
          <div className="text-sm breadcrumbs mb-6">
            <ul>
              <li>
                <a
                  onClick={() => router.push("/dashboard")}
                  className="cursor-pointer"
                >
                  🏠 Dashboard
                </a>
              </li>
              <li>
                <a
                  onClick={() => router.push("/dashboard/bedah-buku")}
                  className="cursor-pointer"
                >
                  📚 Bedah Buku
                </a>
              </li>
              <li>{buku.judul}</li>
            </ul>
          </div>

          {/* Detail Buku */}
          <DetailBuku
            buku={buku}
            onUpdateBuku={handleUpdateBuku}
            onDeleteBuku={handleDeleteBuku}
          />
        </div>
      </div>
    </div>
  );
}