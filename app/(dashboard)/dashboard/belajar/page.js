// app/(dashboard)/dashboard/belajar/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Sidebar from "@/components/Sidebar";
import { DEFAULT_ACTIVITIES } from "@/lib/defaultData";
import { DEFAULT_KATEGORI, generateId } from "@/lib/belajarData";

export default function BelajarPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState("");
  const [activities, setActivities] = useState(DEFAULT_ACTIVITIES);
  const [kategori, setKategori] = useState(DEFAULT_KATEGORI);
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

        if (data.belajar && Array.isArray(data.belajar.kategori)) {
          setKategori(data.belajar.kategori);
        } else {
          await setDoc(docRef, { belajar: { kategori: DEFAULT_KATEGORI } }, { merge: true });
          setKategori(DEFAULT_KATEGORI);
        }
      } else {
        await setDoc(docRef, {
          activities: DEFAULT_ACTIVITIES,
          belajar: { kategori: DEFAULT_KATEGORI },
        });
        setActivities(DEFAULT_ACTIVITIES);
        setKategori(DEFAULT_KATEGORI);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setToday(new Date().toISOString().split("T")[0]);
  }, []);

  // ========== SIMPAN KE FIRESTORE ==========
  const simpanKategori = async (newKategori) => {
    setKategori(newKategori);
    const docRef = doc(db, "users", user.uid);
    await setDoc(docRef, { belajar: { kategori: newKategori } }, { merge: true });
  };

  // ========== TAMBAH KATEGORI ==========
  const handleTambahKategori = async () => {
    if (!formData.nama.trim()) return;
    const newKategoriItem = {
      id: generateId("kat"),
      nama: formData.nama,
      subKategori: [],
    };
    const updated = [...kategori, newKategoriItem];
    await simpanKategori(updated);
    setFormData({ nama: "" });
    setShowForm(false);
  };

  // ========== HAPUS KATEGORI ==========
  const handleHapusKategori = async (katId, e) => {
    e.stopPropagation();
    if (!confirm("Hapus kategori ini? Semua sub-kategori dan kegiatan di dalamnya akan hilang.")) return;
    const updated = kategori.filter((k) => k.id !== katId);
    await simpanKategori(updated);
  };

  // ========== RENAME KATEGORI (BARU) ==========
  const handleRenameKategori = async (katId, currentNama, e) => {
    e.stopPropagation();
    const newNama = window.prompt("Ganti nama kategori jadi:", currentNama);
    if (!newNama || !newNama.trim() || newNama.trim() === currentNama) return;
    const updated = kategori.map((k) =>
      k.id === katId ? { ...k, nama: newNama.trim() } : k
    );
    await simpanKategori(updated);
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

  // Hitung total sub-kategori & tool
  const hitungStat = (kat) => {
    const totalSub = kat.subKategori?.length || 0;
    const totalTool =
      kat.subKategori?.reduce(
        (sum, sk) => sum + (sk.tools?.length || 0),
        0
      ) || 0;
    return { totalSub, totalTool };
  };

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
              <li>📚 Belajar</li>
            </ul>
          </div>

          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">📚 Belajar</h1>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowForm(!showForm)}
            >
              + Tambah Kategori
            </button>
          </div>

          {/* Form Tambah Kategori */}
          {showForm && (
            <div className="card bg-white shadow border border-gray-200 mb-4">
              <div className="card-body p-4">
                <p className="text-xs font-semibold text-blue-700 mb-2">
                  ✏️ Tambah kategori baru
                </p>
                <input
                  type="text"
                  className="input input-bordered w-full text-gray-800 bg-white"
                  placeholder="Nama kategori (misal: 🎵 Belajar Musik)"
                  value={formData.nama}
                  onChange={(e) => setFormData({ nama: e.target.value })}
                  autoFocus
                />
                <div className="flex gap-2 mt-3">
                  <button
                    className="btn btn-primary btn-sm flex-1"
                    onClick={handleTambahKategori}
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

          {/* List Kategori */}
          {kategori.length === 0 ? (
            <div className="card bg-white shadow border border-gray-200">
              <div className="card-body p-8 text-center text-gray-400">
                <p className="text-3xl mb-2">📚</p>
                <p className="text-sm">
                  Belum ada kategori. Klik "+ Tambah Kategori" untuk mulai.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {kategori.map((kat) => {
                const { totalSub, totalTool } = hitungStat(kat);
                return (
                  <div
                    key={kat.id}
                    className="card bg-white shadow border border-gray-200 hover:shadow-lg transition cursor-pointer"
                    onClick={() => router.push(`/dashboard/belajar/${kat.id}`)}
                  >
                    <div className="card-body p-4">
                      <div className="flex justify-between items-start gap-2">
                        <h2 className="card-title text-base text-gray-800 flex-1">
                          {kat.nama}
                        </h2>
                        <div className="flex gap-1 shrink-0">
                          <button
                            className="btn btn-ghost btn-xs text-blue-500"
                            onClick={(e) => handleRenameKategori(kat.id, kat.nama, e)}
                            title="Rename Kategori"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn btn-ghost btn-xs text-red-500"
                            onClick={(e) => handleHapusKategori(kat.id, e)}
                            title="Hapus Kategori"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">
                        {totalSub} Sub-kategori • {totalTool} Tool
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