// app/(dashboard)/dashboard/pekerjaan/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Sidebar from "@/components/Sidebar";
import { DEFAULT_ACTIVITIES } from "@/lib/defaultData";
import { DEFAULT_PT, generateId } from "@/lib/pekerjaanData";

export default function PekerjaanPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState("");
  const [activities, setActivities] = useState(DEFAULT_ACTIVITIES);
  const [pekerjaan, setPekerjaan] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ nama: "" });
  const router = useRouter();

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

        if (data.activities && Array.isArray(data.activities)) {
          setActivities(data.activities);
        } else {
          await setDoc(docRef, { activities: DEFAULT_ACTIVITIES }, { merge: true });
          setActivities(DEFAULT_ACTIVITIES);
        }

        if (data.pekerjaan && Array.isArray(data.pekerjaan)) {
          setPekerjaan(data.pekerjaan);
        } else {
          await setDoc(docRef, { pekerjaan: DEFAULT_PT }, { merge: true });
          setPekerjaan(DEFAULT_PT);
        }
      } else {
        await setDoc(docRef, {
          activities: DEFAULT_ACTIVITIES,
          pekerjaan: DEFAULT_PT,
        });
        setActivities(DEFAULT_ACTIVITIES);
        setPekerjaan(DEFAULT_PT);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setToday(new Date().toISOString().split("T")[0]);
  }, []);

  // ========== TAMBAH PT ==========
  const handleTambahPT = async () => {
    if (!formData.nama.trim()) return;
    const newPT = {
      id: generateId("pt"),
      nama: formData.nama,
      brands: [],
    };
    const updated = [...pekerjaan, newPT];
    setPekerjaan(updated);
    const docRef = doc(db, "users", user.uid);
    await setDoc(docRef, { pekerjaan: updated }, { merge: true });
    setFormData({ nama: "" });
    setShowForm(false);
  };

  // ========== HAPUS PT ==========
  const handleHapusPT = async (ptId, e) => {
    e.stopPropagation();
    if (!confirm("Hapus PT ini? Semua brand dan kegiatan akan hilang.")) return;
    const updated = pekerjaan.filter((p) => p.id !== ptId);
    setPekerjaan(updated);
    const docRef = doc(db, "users", user.uid);
    await setDoc(docRef, { pekerjaan: updated }, { merge: true });
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
          className={`${sidebarCollapsed ? "w-12" : "w-64"} transition-all duration-300 bg-base-100`}
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
              <li>💼 Pekerjaan</li>
            </ul>
          </div>

          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">💼 Pekerjaan</h1>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowForm(!showForm)}
            >
              + Tambah PT
            </button>
          </div>

          {/* Form Tambah PT */}
          {showForm && (
            <div className="card bg-white shadow border border-gray-200 mb-4">
              <div className="card-body p-4">
                <p className="text-xs font-semibold text-blue-700 mb-2">
                  ✏️ Tambah PT baru
                </p>
                <input
                  type="text"
                  className="input input-bordered w-full text-gray-800 bg-white"
                  placeholder="Nama PT (misal: PT Elfiqa)"
                  value={formData.nama}
                  onChange={(e) => setFormData({ nama: e.target.value })}
                  autoFocus
                />
                <div className="flex gap-2 mt-3">
                  <button
                    className="btn btn-primary btn-sm flex-1"
                    onClick={handleTambahPT}
                  >
                    ➕ Tambah
                  </button>
                  <button
                    className="btn btn-ghost btn-sm text-gray-700"
                    onClick={() => setShowForm(false)}
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* List PT */}
          {pekerjaan.length === 0 ? (
            <div className="card bg-white shadow border border-gray-200">
              <div className="card-body p-8 text-center text-gray-400">
                <p className="text-3xl mb-2">🏢</p>
                <p className="text-sm">
                  Belum ada PT. Klik "+ Tambah PT" untuk mulai.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pekerjaan.map((pt) => {
                const totalBrand = pt.brands?.length || 0;
                const totalKegiatan =
                  pt.brands?.reduce(
                    (sum, b) => sum + (b.kegiatan?.length || 0),
                    0
                  ) || 0;
                return (
                  <div
                    key={pt.id}
                    className="card bg-white shadow border border-gray-200 hover:shadow-lg transition cursor-pointer"
                    onClick={() =>
                      router.push(`/dashboard/pekerjaan/${pt.id}`)
                    }
                  >
                    <div className="card-body p-4">
                      <div className="flex justify-between items-start">
                        <h2 className="card-title text-base text-gray-800">
                          🏢 {pt.nama}
                        </h2>
                        <button
                          className="btn btn-ghost btn-xs text-red-500"
                          onClick={(e) => handleHapusPT(pt.id, e)}
                          title="Hapus PT"
                        >
                          🗑️
                        </button>
                      </div>
                      <p className="text-sm text-gray-500">
                        {totalBrand} Brand • {totalKegiatan} Kegiatan
                      </p>
                      <div className="card-actions justify-end mt-2">
                        <span className="text-gray-400 text-sm">Buka →</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}