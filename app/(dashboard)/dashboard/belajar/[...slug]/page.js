// app/(dashboard)/dashboard/belajar/[...slug]/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Sidebar from "@/components/Sidebar";
import BelajarUpload from "@/components/BelajarUpload";
import KaryaMingguan from "@/components/KaryaMingguan";
import KalenderBelajar from "@/components/KalenderBelajar";
import { DEFAULT_ACTIVITIES } from "@/lib/defaultData";
import {
  DEFAULT_KATEGORI,
  DEFAULT_TARGET_HARIAN,
  findItem,
  updateItem,
  addItem,
  deleteItem,
  generateId,
  kategoriPunyaKaryaMingguan,
  getLabelKategoriById,
} from "@/lib/belajarData";

export default function BelajarDetailPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState("");
  const [activities, setActivities] = useState(DEFAULT_ACTIVITIES);
  const [kategori, setKategori] = useState(DEFAULT_KATEGORI);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ nama: "" });

  // Kalender belajar state
  const [activeTab, setActiveTab] = useState("materi");
  const [logHarian, setLogHarian] = useState({});
  const [targetHarian, setTargetHarian] = useState(DEFAULT_TARGET_HARIAN);

  const router = useRouter();
  const params = useParams();
  const slug = params.slug || [];
  const path = slug;

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

        // Activities
        if (data.activities && Array.isArray(data.activities)) {
          setActivities(data.activities);
        } else {
          await setDoc(docRef, { activities: DEFAULT_ACTIVITIES }, { merge: true });
          setActivities(DEFAULT_ACTIVITIES);
        }

        // Kategori Belajar
        if (data.belajar && Array.isArray(data.belajar.kategori)) {
          setKategori(data.belajar.kategori);
        } else {
          await setDoc(
            docRef,
            { belajar: { kategori: DEFAULT_KATEGORI } },
            { merge: true }
          );
          setKategori(DEFAULT_KATEGORI);
        }

        // Log Harian Belajar
        if (
          data.belajarLogHarian &&
          typeof data.belajarLogHarian === "object" &&
          !Array.isArray(data.belajarLogHarian)
        ) {
          setLogHarian(data.belajarLogHarian);
        } else {
          await setDoc(docRef, { belajarLogHarian: {} }, { merge: true });
          setLogHarian({});
        }

        // Target Harian Belajar
        if (
          data.belajarTargetHarian &&
          typeof data.belajarTargetHarian === "object" &&
          !Array.isArray(data.belajarTargetHarian)
        ) {
          setTargetHarian({
            ...DEFAULT_TARGET_HARIAN,
            ...data.belajarTargetHarian,
          });
        } else {
          await setDoc(
            docRef,
            { belajarTargetHarian: DEFAULT_TARGET_HARIAN },
            { merge: true }
          );
          setTargetHarian(DEFAULT_TARGET_HARIAN);
        }
      } else {
        await setDoc(docRef, {
          activities: DEFAULT_ACTIVITIES,
          belajar: { kategori: DEFAULT_KATEGORI },
          belajarLogHarian: {},
          belajarTargetHarian: DEFAULT_TARGET_HARIAN,
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

  // ========== SIMPAN KATEGORI KE FIRESTORE ==========
  const simpanKategori = async (newKategori) => {
    setKategori(newKategori);
    const docRef = doc(db, "users", user.uid);
    await setDoc(docRef, { belajar: { kategori: newKategori } }, { merge: true });
  };

  // ========== SIMPAN LOG HARIAN ==========
  const handleUpdateLog = async (newLogHarian) => {
    setLogHarian(newLogHarian);
    if (!user) return;
    const docRef = doc(db, "users", user.uid);
    await setDoc(docRef, { belajarLogHarian: newLogHarian }, { merge: true });
  };

  // ========== SIMPAN TARGET HARIAN ==========
  const handleUpdateTarget = async (newTarget) => {
    setTargetHarian(newTarget);
    if (!user) return;
    const docRef = doc(db, "users", user.uid);
    await setDoc(docRef, { belajarTargetHarian: newTarget }, { merge: true });
  };

  // ========== CARI ITEM DI HIERARKI ==========
  const result = findItem(kategori, path);
  const item = result?.item || null;
  const level = path.length;

  // Cek kategori utama (path[0]) buat deteksi Karya Mingguan & Kalender
  const kategoriUtama = path[0] || null;
  const punyaKaryaMingguan = kategoriPunyaKaryaMingguan(kategoriUtama);

  // ========== TAMBAH ITEM ==========
  const handleTambah = async () => {
    if (!formData.nama.trim() || !item) return;
    const newItem = {
      id: generateId("item"),
      nama: formData.nama,
    };

    if (level === 1) {
      newItem.subKategori = [];
    } else if (level === 2) {
      newItem.tools = [];
    } else if (level === 3) {
      newItem.fitur = [];
      if (punyaKaryaMingguan) {
        newItem.karyaMingguan = [];
      }
    } else if (level === 4) {
      if (item.parts) {
        newItem.gdriveUrl = "";
        newItem.catatan = "";
      } else if (item.fitur) {
        newItem.gdriveUrl = "";
        newItem.catatan = "";
      }
    }

    const newKategori = addItem(kategori, path, newItem);
    await simpanKategori(newKategori);
    setFormData({ nama: "" });
    setShowForm(false);
  };

  // ========== HAPUS ITEM ==========
  const handleHapus = async (itemId, e) => {
    e.stopPropagation();
    if (!confirm("Hapus item ini? Semua isi di dalamnya akan hilang.")) return;
    const newPath = [...path, itemId];
    const newKategori = deleteItem(kategori, newPath);
    await simpanKategori(newKategori);
  };

  // ========== UPDATE ITEM ==========
  const handleUpdateItem = async (updatedFields) => {
    const newKategori = updateItem(kategori, path, updatedFields);
    await simpanKategori(newKategori);
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!item) {
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
              <p className="text-3xl mb-2">📚</p>
              <p className="text-sm mb-4">Item tidak ditemukan.</p>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => router.push("/dashboard/belajar")}
              >
                ← Balik ke Belajar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========== BREADCRUMB ==========
  const renderBreadcrumb = () => {
    const items = [
      { id: null, nama: "🏠 Dashboard", path: "/dashboard" },
      { id: null, nama: "📚 Belajar", path: "/dashboard/belajar" },
    ];

    let currentPath = "/dashboard/belajar";
    path.forEach((id, idx) => {
      currentPath += `/${id}`;
      const subResult = findItem(kategori, path.slice(0, idx + 1));
      if (subResult?.item) {
        items.push({
          id,
          nama: subResult.item.nama,
          path: currentPath,
        });
      }
    });

    return (
      <div className="text-sm breadcrumbs mb-6">
        <ul>
          {items.map((b, idx) => (
            <li key={idx}>
              {idx < items.length - 1 ? (
                <a onClick={() => router.push(b.path)} className="cursor-pointer">
                  {b.nama}
                </a>
              ) : (
                <span>{b.nama}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // ========== RENDER LIST ==========
  const renderList = (items) => {
    if (!items || items.length === 0) {
      return (
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-8 text-center text-gray-400">
            <p className="text-3xl mb-2">📭</p>
            <p className="text-sm">Belum ada item di sini.</p>
          </div>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((sub) => {
          const subPath = [...path, sub.id].join("/");
          return (
            <div
              key={sub.id}
              className="card bg-white shadow border border-gray-200 hover:shadow-lg transition cursor-pointer"
              onClick={() => router.push(`/dashboard/belajar/${subPath}`)}
            >
              <div className="card-body p-4">
                <div className="flex justify-between items-start">
                  <h2 className="card-title text-base text-gray-800">{sub.nama}</h2>
                  <button
                    className="btn btn-ghost btn-xs text-red-500"
                    onClick={(e) => handleHapus(sub.id, e)}
                    title="Hapus"
                  >
                    🗑️
                  </button>
                </div>
                <div className="card-actions justify-end mt-2">
                  <span className="text-gray-400 text-sm">Buka →</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ========== RENDER CONTENT ==========
  const renderContent = () => {
    // LEVEL 1: Kategori → Tab Materi | Kalender
    if (level === 1) {
      return (
        <>
          {/* TAB NAVIGATION */}
          <div className="tabs tabs-boxed bg-white shadow border border-gray-200 mb-4 p-1 w-fit">
            <button
              className={`tab ${activeTab === "materi" ? "tab-active bg-blue-600 text-white" : ""}`}
              onClick={() => setActiveTab("materi")}
            >
              📚 Materi
            </button>
            <button
              className={`tab ${activeTab === "kalender" ? "tab-active bg-blue-600 text-white" : ""}`}
              onClick={() => setActiveTab("kalender")}
            >
              📅 Kalender
            </button>
          </div>

          {/* TAB MATERI */}
          {activeTab === "materi" && (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800">📁 Sub-kategori</h2>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowForm(!showForm)}
                >
                  + Tambah Sub-kategori
                </button>
              </div>
              {renderList(item.subKategori || [])}
            </>
          )}

          {/* TAB KALENDER */}
          {activeTab === "kalender" && (
            <KalenderBelajar
              kategoriId={kategoriUtama}
              kategoriData={kategori}
              logHarian={logHarian}
              targetHarian={targetHarian}
              onUpdateLog={handleUpdateLog}
              onUpdateTarget={handleUpdateTarget}
            />
          )}
        </>
      );
    }

    // LEVEL 2: Sub-kategori → Tools
    if (level === 2) {
      return (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">🛠️ Tools</h2>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowForm(!showForm)}
            >
              + Tambah Tool
            </button>
          </div>
          {renderList(item.tools || [])}
        </>
      );
    }

    // LEVEL 3: Tool → Fitur + Karya Mingguan (conditional)
    if (level === 3) {
      return (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">📚 Fitur</h2>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowForm(!showForm)}
            >
              + Tambah Fitur
            </button>
          </div>
          {renderList(item.fitur || [])}

          {/* KARYA MINGGUAN — cuma muncul kalau kategori Design */}
          {punyaKaryaMingguan && (
            <div className="mt-6">
              <KaryaMingguan
                karyaMingguan={item.karyaMingguan || []}
                onUpdate={(newKarya) => {
                  handleUpdateItem({ karyaMingguan: newKarya });
                }}
              />
            </div>
          )}
        </>
      );
    }

    // LEVEL 4: Group atau Leaf
    if (level === 4) {
      // Group dengan parts (misal Blender Guru --- Donut)
      if (item.parts) {
        return (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">📹 Part</h2>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowForm(!showForm)}
              >
                + Tambah Part
              </button>
            </div>
            {renderList(item.parts)}
          </>
        );
      }

      // Group dengan nested fitur (misal Basic Features)
      if (item.fitur && item.fitur.length > 0) {
        return (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">📚 Fitur</h2>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowForm(!showForm)}
              >
                + Tambah Fitur
              </button>
            </div>
            {renderList(item.fitur)}
          </>
        );
      }

      // Leaf (misal Pen Tool)
      return <BelajarUpload item={item} onUpdate={handleUpdateItem} />;
    }

    // LEVEL 5+: Leaf
    return <BelajarUpload item={item} onUpdate={handleUpdateItem} />;
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
          {renderBreadcrumb()}

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">{item.nama}</h1>
          </div>

          {/* Form Tambah */}
          {showForm && (
            <div className="card bg-white shadow border border-gray-200 mb-4">
              <div className="card-body p-4">
                <p className="text-xs font-semibold text-blue-700 mb-2">
                  ✏️ Tambah item baru
                </p>
                <input
                  type="text"
                  className="input input-bordered w-full text-gray-800 bg-white"
                  placeholder="Nama item"
                  value={formData.nama}
                  onChange={(e) => setFormData({ nama: e.target.value })}
                  autoFocus
                />
                <div className="flex gap-2 mt-3">
                  <button className="btn btn-primary btn-sm flex-1" onClick={handleTambah}>
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

          {/* Content */}
          {renderContent()}
        </div>
      </div>
    </div>
  );
}