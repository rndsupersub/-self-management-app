// app/(dashboard)/dashboard/bedah-buku/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Sidebar from "@/components/Sidebar";
import KalenderBedahBuku from "@/components/KalenderBedahBuku";
import { DEFAULT_ACTIVITIES } from "@/lib/defaultData";
import {
  DEFAULT_BEDAH_BUKU,
  DEFAULT_KATEGORI,
  generateId,
  getProgressBuku,
  getStreak,
  getTotalHalamanBuku,
  cekBukuSelesai,
} from "@/lib/bedahBukuData";

export default function BedahBukuPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState("");
  const [activities, setActivities] = useState(DEFAULT_ACTIVITIES);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("kalender");

  // Data bedah buku dari Firestore
  const [bedahBuku, setBedahBuku] = useState(DEFAULT_BEDAH_BUKU);

  // Form tambah buku
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    judul: "",
    penulis: "",
    kategoriId: "belajar",
    totalHalaman: "",
    targetPerHari: 10,
    tanggalMulai: "",
  });

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
            kategori: data.bedahBuku.kategori || DEFAULT_KATEGORI,
            buku: data.bedahBuku.buku || [],
          });
        } else {
          await setDoc(docRef, { bedahBuku: DEFAULT_BEDAH_BUKU }, { merge: true });
          setBedahBuku(DEFAULT_BEDAH_BUKU);
        }
      } else {
        // User baru
        await setDoc(docRef, {
          activities: DEFAULT_ACTIVITIES,
          bedahBuku: DEFAULT_BEDAH_BUKU,
        });
        setActivities(DEFAULT_ACTIVITIES);
        setBedahBuku(DEFAULT_BEDAH_BUKU);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setToday(new Date().toISOString().split("T")[0]);
    // Set default tanggal mulai = hari ini
    setFormData((prev) => ({
      ...prev,
      tanggalMulai: new Date().toISOString().split("T")[0],
    }));
  }, []);

  // ========== SIMPAN KE FIRESTORE ==========
  const simpanBedahBuku = async (newBedahBuku) => {
    setBedahBuku(newBedahBuku);
    if (!user) return;
    const docRef = doc(db, "users", user.uid);
    await setDoc(docRef, { bedahBuku: newBedahBuku }, { merge: true });
  };

  // ========== UPDATE BUKU (dari kalender atau detail) ==========
  const handleUpdateBuku = async (bukuId, updatedBuku) => {
    const updatedList = bedahBuku.buku.map((b) =>
      b.id === bukuId ? { ...b, ...updatedBuku } : b
    );
    await simpanBedahBuku({ ...bedahBuku, buku: updatedList });
  };

  // ========== TAMBAH BUKU BARU ==========
  const handleTambahBuku = async () => {
    if (!formData.judul.trim()) return;
    if (!formData.totalHalaman) return;

    const newBuku = {
      id: generateId("buku"),
      kategoriId: formData.kategoriId,
      judul: formData.judul,
      penulis: formData.penulis || "-",
      edisi: "",
      totalHalaman: parseInt(formData.totalHalaman) || 0,
      halamanMulai: 1,
      targetPerHari: parseInt(formData.targetPerHari) || 10,
      tanggalMulai: formData.tanggalMulai || today,
      bab: [], // Kosong, user bisa isi nanti
      halamanSelesai: [],
      progressHarian: {},
      mingguan: [],
      kesimpulan: null,
      createdAt: new Date().toISOString(),
    };

    const updatedList = [...bedahBuku.buku, newBuku];
    await simpanBedahBuku({ ...bedahBuku, buku: updatedList });

    setFormData({
      judul: "",
      penulis: "",
      kategoriId: "belajar",
      totalHalaman: "",
      targetPerHari: 10,
      tanggalMulai: today,
    });
    setShowForm(false);
  };

  // ========== HAPUS BUKU ==========
  const handleHapusBuku = async (bukuId, e) => {
    e.stopPropagation();
    if (!confirm("Hapus buku ini? Semua riwayat baca bakal hilang.")) return;
    const updatedList = bedahBuku.buku.filter((b) => b.id !== bukuId);
    await simpanBedahBuku({ ...bedahBuku, buku: updatedList });
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

  // Kelompokkan buku per kategori
  const bukuPerKategori = (kategoriId) =>
    bedahBuku.buku.filter((b) => b.kategoriId === kategoriId);

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
              <li>📚 Bedah Buku</li>
            </ul>
          </div>

          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">📚 Bedah Buku</h1>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowForm(!showForm)}
            >
              + Tambah Buku
            </button>
          </div>

          {/* Form Tambah Buku */}
          {showForm && (
            <div className="card bg-white shadow border border-gray-200 mb-4">
              <div className="card-body p-4 space-y-3">
                <p className="text-xs font-semibold text-blue-700">
                  ✏️ Tambah Buku Baru
                </p>

                <input
                  type="text"
                  className="input input-bordered input-sm w-full text-gray-800 bg-white"
                  placeholder="Judul buku (misal: Product Development and Management Body of Knowledge)"
                  value={formData.judul}
                  onChange={(e) =>
                    setFormData({ ...formData, judul: e.target.value })
                  }
                  autoFocus
                />

                <input
                  type="text"
                  className="input input-bordered input-sm w-full text-gray-800 bg-white"
                  placeholder="Penulis (opsional)"
                  value={formData.penulis}
                  onChange={(e) =>
                    setFormData({ ...formData, penulis: e.target.value })
                  }
                />

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">
                      Kategori
                    </label>
                    <select
                      className="select select-bordered select-sm w-full text-gray-800 bg-white"
                      value={formData.kategoriId}
                      onChange={(e) =>
                        setFormData({ ...formData, kategoriId: e.target.value })
                      }
                    >
                      {bedahBuku.kategori.map((k) => (
                        <option key={k.id} value={k.id}>
                          {k.nama}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">
                      Total Halaman
                    </label>
                    <input
                      type="number"
                      className="input input-bordered input-sm w-full text-gray-800 bg-white"
                      placeholder="Misal: 280"
                      value={formData.totalHalaman}
                      onChange={(e) =>
                        setFormData({ ...formData, totalHalaman: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">
                      Target / Hari
                    </label>
                    <input
                      type="number"
                      className="input input-bordered input-sm w-full text-gray-800 bg-white"
                      value={formData.targetPerHari}
                      onChange={(e) =>
                        setFormData({ ...formData, targetPerHari: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">
                      Tanggal Mulai
                    </label>
                    <input
                      type="date"
                      className="input input-bordered input-sm w-full text-gray-800 bg-white"
                      value={formData.tanggalMulai}
                      onChange={(e) =>
                        setFormData({ ...formData, tanggalMulai: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    className="btn btn-primary btn-sm flex-1"
                    onClick={handleTambahBuku}
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

          {/* Tab Navigation */}
          <div className="tabs tabs-boxed bg-white shadow border border-gray-200 mb-4 p-1 w-fit">
            <button
              className={`tab ${
                activeTab === "kalender" ? "tab-active bg-blue-600 text-white" : ""
              }`}
              onClick={() => setActiveTab("kalender")}
            >
              📅 Kalender
            </button>
            <button
              className={`tab ${
                activeTab === "daftar" ? "tab-active bg-blue-600 text-white" : ""
              }`}
              onClick={() => setActiveTab("daftar")}
            >
              📚 Daftar Buku
            </button>
          </div>

          {/* Content */}
          {activeTab === "kalender" && (
            <KalenderBedahBuku
              bukuList={bedahBuku.buku}
              onUpdateBuku={handleUpdateBuku}
            />
          )}

          {activeTab === "daftar" && (
            <div className="space-y-6">
              {bedahBuku.kategori.map((kategori) => {
                const bukuKategori = bukuPerKategori(kategori.id);
                return (
                  <div key={kategori.id}>
                    <h2 className="text-lg font-bold text-gray-800 mb-3">
                      {kategori.nama} ({bukuKategori.length})
                    </h2>

                    {bukuKategori.length === 0 ? (
                      <div className="card bg-white shadow border border-gray-200">
                        <div className="card-body p-6 text-center text-gray-400">
                          <p className="text-sm">
                            Belum ada buku di kategori ini.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {bukuKategori.map((buku) => {
                          const progress = getProgressBuku(buku);
                          const streak = getStreak(buku);
                          const totalHal = getTotalHalamanBuku(buku);
                          const selesai = cekBukuSelesai(buku);

                          return (
                            <div
                              key={buku.id}
                              className="card bg-white shadow border border-gray-200 hover:shadow-lg transition cursor-pointer"
                              onClick={() =>
                                router.push(`/dashboard/bedah-buku/${buku.id}`)
                              }
                            >
                              <div className="card-body p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex-1">
                                    <h3 className="text-base font-bold text-gray-800 leading-tight">
                                      📖 {buku.judul}
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-1">
                                      ✍️ {buku.penulis}
                                    </p>
                                  </div>
                                  <button
                                    className="btn btn-ghost btn-xs text-red-500"
                                    onClick={(e) => handleHapusBuku(buku.id, e)}
                                    title="Hapus buku"
                                  >
                                    🗑️
                                  </button>
                                </div>

                                {/* Progress bar */}
                                <div className="mt-2">
                                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                                    <span>Progress</span>
                                    <span className="font-semibold">
                                      {progress}% {selesai && "✅"}
                                    </span>
                                  </div>
                                  <progress
                                    className={`progress ${
                                      selesai ? "progress-success" : "progress-primary"
                                    } w-full h-2`}
                                    value={progress}
                                    max="100"
                                  />
                                </div>

                                {/* Info */}
                                <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-2">
                                  <span>📄 {totalHal} hal</span>
                                  <span>🎯 {buku.targetPerHari}/hari</span>
                                  {streak > 0 && (
                                    <span className="text-orange-600 font-semibold">
                                      🔥 {streak} hari
                                    </span>
                                  )}
                                </div>

                                <div className="card-actions justify-end mt-2">
                                  <span className="text-gray-400 text-xs">
                                    Buka →
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
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