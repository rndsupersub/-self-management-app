// app/(dashboard)/dashboard/pekerjaan/[ptId]/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Sidebar from "@/components/Sidebar";
import { DEFAULT_ACTIVITIES } from "@/lib/defaultData";
import { generateId } from "@/lib/pekerjaanData";

export default function PTDetailPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState("");
  const [activities, setActivities] = useState(DEFAULT_ACTIVITIES);
  const [pekerjaan, setPekerjaan] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ nama: "" });
  const [editMode, setEditMode] = useState(false);
  const [editNama, setEditNama] = useState("");
  const [confirmHapusPT, setConfirmHapusPT] = useState(false);

  const router = useRouter();
  const params = useParams();
  const ptId = params.ptId;

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
          await setDoc(docRef, { pekerjaan: [] }, { merge: true });
          setPekerjaan([]);
        }
      } else {
        await setDoc(docRef, {
          activities: DEFAULT_ACTIVITIES,
          pekerjaan: [],
        });
        setActivities(DEFAULT_ACTIVITIES);
        setPekerjaan([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setToday(new Date().toISOString().split("T")[0]);
  }, []);

  // Cari PT berdasarkan URL
  const pt = pekerjaan.find((p) => p.id === ptId);

  useEffect(() => {
    if (pt) setEditNama(pt.nama);
  }, [pt]);

  // ========== SIMPAN PERUBAHAN KE FIRESTORE ==========
  const simpanKeFirestore = async (updatedPekerjaan) => {
    setPekerjaan(updatedPekerjaan);
    const docRef = doc(db, "users", user.uid);
    await setDoc(docRef, { pekerjaan: updatedPekerjaan }, { merge: true });
  };

  // ========== TAMBAH BRAND ==========
  const handleTambahBrand = async () => {
    if (!formData.nama.trim()) return;
    const newBrand = {
      id: generateId("brand"),
      nama: formData.nama,
      kegiatan: [],
    };
    const updated = pekerjaan.map((p) =>
      p.id === ptId ? { ...p, brands: [...p.brands, newBrand] } : p
    );
    await simpanKeFirestore(updated);
    setFormData({ nama: "" });
    setShowForm(false);
  };

  // ========== HAPUS BRAND ==========
  const handleHapusBrand = async (brandId, e) => {
    e.stopPropagation();
    if (!confirm("Hapus brand ini? Semua kegiatan akan hilang.")) return;
    const updated = pekerjaan.map((p) =>
      p.id === ptId
        ? { ...p, brands: p.brands.filter((b) => b.id !== brandId) }
        : p
    );
    await simpanKeFirestore(updated);
  };

  // ========== EDIT NAMA PT ==========
  const handleSimpanNamaPT = async () => {
    if (!editNama.trim()) return;
    const updated = pekerjaan.map((p) =>
      p.id === ptId ? { ...p, nama: editNama } : p
    );
    await simpanKeFirestore(updated);
    setEditMode(false);
  };

  // ========== HAPUS PT ==========
  const handleHapusPT = async () => {
    const updated = pekerjaan.filter((p) => p.id !== ptId);
    await simpanKeFirestore(updated);
    setConfirmHapusPT(false);
    router.push("/dashboard/pekerjaan");
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

  if (!pt) {
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
              <p className="text-3xl mb-2">🏢</p>
              <p className="text-sm mb-4">PT tidak ditemukan.</p>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => router.push("/dashboard/pekerjaan")}
              >
                ← Balik ke Pekerjaan
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
              <li>
                <a
                  onClick={() => router.push("/dashboard/pekerjaan")}
                  className="cursor-pointer"
                >
                  💼 Pekerjaan
                </a>
              </li>
              <li>🏢 {pt.nama}</li>
            </ul>
          </div>

          {/* Header PT */}
          <div className="flex flex-wrap justify-between items-center mb-6 gap-2">
            {editMode ? (
              <div className="flex gap-2 items-center flex-1">
                <input
                  type="text"
                  className="input input-bordered text-gray-800 bg-white flex-1 max-w-md"
                  value={editNama}
                  onChange={(e) => setEditNama(e.target.value)}
                  autoFocus
                />
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleSimpanNamaPT}
                >
                  💾 Simpan
                </button>
                <button
                  className="btn btn-ghost btn-sm text-gray-700"
                  onClick={() => {
                    setEditMode(false);
                    setEditNama(pt.nama);
                  }}
                >
                  Batal
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-800">
                  🏢 {pt.nama}
                </h1>
                <button
                  className="btn btn-ghost btn-xs text-gray-500"
                  onClick={() => setEditMode(true)}
                  title="Edit nama PT"
                >
                  ✏️
                </button>
                <button
                  className="btn btn-ghost btn-xs text-red-500"
                  onClick={() => setConfirmHapusPT(true)}
                  title="Hapus PT"
                >
                  🗑️
                </button>
              </div>
            )}

            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowForm(!showForm)}
            >
              + Tambah Brand
            </button>
          </div>

          {/* Konfirmasi Hapus PT */}
          {confirmHapusPT && (
            <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
              <p className="text-sm text-red-700 mb-2">
                Yakin mau hapus <strong>{pt.nama}</strong>? Semua brand dan
                kegiatan akan hilang.
              </p>
              <div className="flex gap-2">
                <button
                  className="btn btn-error btn-sm"
                  onClick={handleHapusPT}
                >
                  Ya, Hapus
                </button>
                <button
                  className="btn btn-ghost btn-sm text-gray-700"
                  onClick={() => setConfirmHapusPT(false)}
                >
                  Batal
                </button>
              </div>
            </div>
          )}

          {/* Form Tambah Brand */}
          {showForm && (
            <div className="card bg-white shadow border border-gray-200 mb-4">
              <div className="card-body p-4">
                <p className="text-xs font-semibold text-blue-700 mb-2">
                  ✏️ Tambah brand baru
                </p>
                <input
                  type="text"
                  className="input input-bordered w-full text-gray-800 bg-white"
                  placeholder="Nama Brand (misal: Supersub)"
                  value={formData.nama}
                  onChange={(e) => setFormData({ nama: e.target.value })}
                  autoFocus
                />
                <div className="flex gap-2 mt-3">
                  <button
                    className="btn btn-primary btn-sm flex-1"
                    onClick={handleTambahBrand}
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

          {/* List Brand */}
          {!pt.brands || pt.brands.length === 0 ? (
            <div className="card bg-white shadow border border-gray-200">
              <div className="card-body p-8 text-center text-gray-400">
                <p className="text-3xl mb-2">🏷️</p>
                <p className="text-sm">
                  Belum ada brand di PT ini. Klik "+ Tambah Brand" untuk mulai.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pt.brands.map((brand) => {
                const totalKegiatan = brand.kegiatan?.length || 0;
                const totalSelesai =
                  brand.kegiatan?.filter((k) => k.status === "selesai")
                    .length || 0;
                return (
                  <div
                    key={brand.id}
                    className="card bg-white shadow border border-gray-200 hover:shadow-lg transition cursor-pointer"
                    onClick={() =>
                      router.push(`/dashboard/pekerjaan/${ptId}/${brand.id}`)
                    }
                  >
                    <div className="card-body p-4">
                      <div className="flex justify-between items-start">
                        <h2 className="card-title text-base text-gray-800">
                          🏷️ {brand.nama}
                        </h2>
                        <button
                          className="btn btn-ghost btn-xs text-red-500"
                          onClick={(e) => handleHapusBrand(brand.id, e)}
                          title="Hapus Brand"
                        >
                          🗑️
                        </button>
                      </div>
                      <p className="text-sm text-gray-500">
                        {totalKegiatan} Kegiatan
                        {totalSelesai > 0 && ` • ${totalSelesai} Selesai`}
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