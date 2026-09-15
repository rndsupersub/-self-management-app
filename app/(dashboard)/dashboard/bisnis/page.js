// app/(dashboard)/dashboard/bisnis/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Sidebar from "@/components/Sidebar";
import { DEFAULT_ACTIVITIES } from "@/lib/defaultData";
import {
  DEFAULT_BISNIS_BRANDS,
  DEFAULT_BISNIS_PRIORITAS,
  DEFAULT_BISNIS_SUMBER,
  DEFAULT_BISNIS_SECTIONS,
  DEFAULT_BISNIS_KATEGORI,
  DEFAULT_BISNIS_VENDOR_KATEGORI,
  DEFAULT_BISNIS_VENDOR_PERTANYAAN,
  DEFAULT_BISNIS_VENDOR_TUJUAN,
  DEFAULT_BISNIS_VENDOR_SATUAN_MOQ,
  DEFAULT_BISNIS_FIELD_EVALUASI,
  DEFAULT_BISNIS_FIELD_EVALUASI_VENDOR,
  DEFAULT_BISNIS_PERIODE_EVALUASI,
  generateId,
  migrasiBisnisLama,
} from "@/lib/bisnisData";

export default function BisnisPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState("");
  const [activities, setActivities] = useState(DEFAULT_ACTIVITIES);
  const [brands, setBrands] = useState(DEFAULT_BISNIS_BRANDS);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ nama: "" });
  const [editingId, setEditingId] = useState(null);
  const [migrasiNotif, setMigrasiNotif] = useState(false);

  const router = useRouter();

  // ========== LOAD USER DATA + MIGRASI ==========
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
          await setDoc(
            docRef,
            { activities: DEFAULT_ACTIVITIES },
            { merge: true }
          );
          setActivities(DEFAULT_ACTIVITIES);
        }

        // Load brands, fallback ke default
        let brandsSekarang = Array.isArray(data.bisnisBrands)
          ? data.bisnisBrands
          : DEFAULT_BISNIS_BRANDS;

        // ========== MIGRASI DATA LAMA ==========
        const { brands: brandsHasilMigrasi, migrated } = migrasiBisnisLama(
          data.bisnisKegiatan,
          brandsSekarang
        );

        if (migrated) {
          brandsSekarang = brandsHasilMigrasi;
          await setDoc(
            docRef,
            { bisnisBrands: brandsSekarang },
            { merge: true }
          );
          setMigrasiNotif(true);
          setTimeout(() => setMigrasiNotif(false), 5000);
        }
        setBrands(brandsSekarang);

        // ========== LOAD SETTINGS BISNIS ==========
        const settingsUpdates = {};

        if (!data.bisnisPrioritasList) {
          settingsUpdates.bisnisPrioritasList = DEFAULT_BISNIS_PRIORITAS;
        }
        if (!data.bisnisSumberList) {
          settingsUpdates.bisnisSumberList = DEFAULT_BISNIS_SUMBER;
        }
        if (!data.bisnisSections) {
          settingsUpdates.bisnisSections = DEFAULT_BISNIS_SECTIONS;
        }
        if (!data.bisnisKategoriList) {
          settingsUpdates.bisnisKategoriList = DEFAULT_BISNIS_KATEGORI;
        }
        if (!data.bisnisVendorKategoriList) {
          settingsUpdates.bisnisVendorKategoriList =
            DEFAULT_BISNIS_VENDOR_KATEGORI;
        }
        if (!data.bisnisVendorPertanyaanList) {
          settingsUpdates.bisnisVendorPertanyaanList =
            DEFAULT_BISNIS_VENDOR_PERTANYAAN;
        }
        if (!data.bisnisVendorTujuanList) {
          settingsUpdates.bisnisVendorTujuanList =
            DEFAULT_BISNIS_VENDOR_TUJUAN;
        }
        if (!data.bisnisVendorSatuanMoqList) {
          settingsUpdates.bisnisVendorSatuanMoqList =
            DEFAULT_BISNIS_VENDOR_SATUAN_MOQ;
        }
        if (!data.bisnisFieldEvaluasiList) {
          settingsUpdates.bisnisFieldEvaluasiList =
            DEFAULT_BISNIS_FIELD_EVALUASI;
        }
        if (!data.bisnisFieldEvaluasiVendorList) {
          settingsUpdates.bisnisFieldEvaluasiVendorList =
            DEFAULT_BISNIS_FIELD_EVALUASI_VENDOR;
        }
        if (!data.bisnisPeriodeEvaluasiList) {
          settingsUpdates.bisnisPeriodeEvaluasiList =
            DEFAULT_BISNIS_PERIODE_EVALUASI;
        }

        if (Object.keys(settingsUpdates).length > 0) {
          await setDoc(docRef, settingsUpdates, { merge: true });
        }
      } else {
        // User baru
        await setDoc(docRef, {
          activities: DEFAULT_ACTIVITIES,
          bisnisBrands: DEFAULT_BISNIS_BRANDS,
          bisnisPrioritasList: DEFAULT_BISNIS_PRIORITAS,
          bisnisSumberList: DEFAULT_BISNIS_SUMBER,
          bisnisSections: DEFAULT_BISNIS_SECTIONS,
          bisnisKategoriList: DEFAULT_BISNIS_KATEGORI,
          bisnisVendorKategoriList: DEFAULT_BISNIS_VENDOR_KATEGORI,
          bisnisVendorPertanyaanList: DEFAULT_BISNIS_VENDOR_PERTANYAAN,
          bisnisVendorTujuanList: DEFAULT_BISNIS_VENDOR_TUJUAN,
          bisnisVendorSatuanMoqList: DEFAULT_BISNIS_VENDOR_SATUAN_MOQ,
          bisnisFieldEvaluasiList: DEFAULT_BISNIS_FIELD_EVALUASI,
          bisnisFieldEvaluasiVendorList:
            DEFAULT_BISNIS_FIELD_EVALUASI_VENDOR,
          bisnisPeriodeEvaluasiList: DEFAULT_BISNIS_PERIODE_EVALUASI,
        });
        setActivities(DEFAULT_ACTIVITIES);
        setBrands(DEFAULT_BISNIS_BRANDS);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setToday(new Date().toISOString().split("T")[0]);
  }, []);

  // ========== SIMPAN BRANDS KE FIRESTORE ==========
  const simpanBrands = async (updatedBrands) => {
    setBrands(updatedBrands);
    if (!user) return;
    const docRef = doc(db, "users", user.uid);
    await setDoc(docRef, { bisnisBrands: updatedBrands }, { merge: true });
  };

  // ========== TAMBAH BRAND ==========
  const handleBukaForm = () => {
    setFormData({ nama: "" });
    setEditingId(null);
    setShowForm(true);
  };

  const handleBukaEdit = (brand, e) => {
    e.stopPropagation();
    setFormData({ nama: brand.nama });
    setEditingId(brand.id);
    setShowForm(true);
  };

  const handleSimpanBrand = async () => {
    if (!formData.nama.trim()) return;

    let updated;
    if (editingId) {
      updated = brands.map((b) =>
        b.id === editingId
          ? { ...b, nama: formData.nama, updatedAt: new Date().toISOString() }
          : b
      );
    } else {
      const newBrand = {
        id: generateId("brand"),
        nama: formData.nama,
        kegiatan: [],
        vendorList: [],
        laporanData: {},
        evaluasiData: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updated = [...brands, newBrand];
    }

    await simpanBrands(updated);
    setShowForm(false);
    setFormData({ nama: "" });
    setEditingId(null);
  };

  // ========== HAPUS BRAND ==========
  const handleHapusBrand = async (brandId, e) => {
    e.stopPropagation();
    const brand = brands.find((b) => b.id === brandId);
    if (!brand) return;
    if (
      !confirm(
        `Hapus brand "${brand.nama}"? Semua kegiatan, vendor, laporan, dan evaluasi bakal hilang.`
      )
    )
      return;
    const updated = brands.filter((b) => b.id !== brandId);
    await simpanBrands(updated);
  };

  // ========== KLIK BRAND ==========
  const handleKlikBrand = (brandId) => {
    router.push(`/dashboard/bisnis/${brandId}`);
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
              <li>💼 Bisnis</li>
            </ul>
          </div>

          {/* Notif Migrasi */}
          {migrasiNotif && (
            <div className="alert alert-success mb-4 text-sm">
              <span>
                ✅ Migrasi berhasil! Data bisnis lama lo udah dipindah ke brand
                "Level Up".
              </span>
            </div>
          )}

          {/* Header */}
          <div className="flex flex-wrap justify-between items-center mb-6 gap-2">
            <h1 className="text-2xl font-bold text-gray-800">💼 Bisnis</h1>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleBukaForm}
            >
              + Tambah Brand
            </button>
          </div>

          {/* Form Tambah/Edit Brand */}
          {showForm && (
            <div className="card bg-white shadow border border-blue-300 mb-4">
              <div className="card-body p-4">
                <p className="text-xs font-semibold text-blue-700 mb-2">
                  {editingId ? "✏️ Edit Brand" : "✏️ Tambah Brand Baru"}
                </p>
                <input
                  type="text"
                  className="input input-bordered w-full text-gray-800 bg-white"
                  placeholder="Nama brand (misal: Level Up)"
                  value={formData.nama}
                  onChange={(e) =>
                    setFormData({ nama: e.target.value })
                  }
                  onKeyDown={(e) => e.key === "Enter" && handleSimpanBrand()}
                  autoFocus
                />
                <div className="flex gap-2 mt-3">
                  <button
                    className="btn btn-primary btn-sm flex-1"
                    onClick={handleSimpanBrand}
                    disabled={!formData.nama.trim()}
                  >
                    {editingId ? "💾 Simpan" : "➕ Tambah"}
                  </button>
                  <button
                    className="btn btn-ghost btn-sm text-gray-700"
                    onClick={() => {
                      setShowForm(false);
                      setFormData({ nama: "" });
                      setEditingId(null);
                    }}
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* List Brand */}
          {brands.length === 0 ? (
            <div className="card bg-white shadow border border-gray-200">
              <div className="card-body p-8 text-center text-gray-400">
                <p className="text-3xl mb-2">🏷️</p>
                <p className="text-sm">
                  Belum ada brand. Klik "+ Tambah Brand" untuk mulai.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {brands.map((brand) => {
                const totalKegiatan = brand.kegiatan?.length || 0;
                const totalVendor = brand.vendorList?.length || 0;
                const totalSelesai =
                  brand.kegiatan?.filter((k) => k.status === "selesai")
                    .length || 0;

                return (
                  <div
                    key={brand.id}
                    className="card bg-white shadow border border-gray-200 hover:shadow-lg transition cursor-pointer"
                    onClick={() => handleKlikBrand(brand.id)}
                  >
                    <div className="card-body p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h2 className="card-title text-base text-gray-800 flex-1">
                          🏷️ {brand.nama}
                        </h2>
                        <div className="flex gap-1">
                          <button
                            className="btn btn-ghost btn-xs text-gray-500"
                            onClick={(e) => handleBukaEdit(brand, e)}
                            title="Edit nama brand"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn btn-ghost btn-xs text-red-500"
                            onClick={(e) => handleHapusBrand(brand.id, e)}
                            title="Hapus brand"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">
                        {totalKegiatan} Kegiatan • {totalVendor} Vendor
                      </p>
                      {totalSelesai > 0 && (
                        <p className="text-xs text-green-600">
                          ✅ {totalSelesai} selesai
                        </p>
                      )}
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
      </div>
    </div>
  );
}