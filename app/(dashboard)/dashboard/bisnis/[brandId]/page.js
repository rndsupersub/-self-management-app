// app/(dashboard)/dashboard/bisnis/[brandId]/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Sidebar from "@/components/Sidebar";
import KalenderPekerjaan from "@/components/KalenderPekerjaan";
import VendorManager from "@/components/VendorManager";
import VendorDetail from "@/components/VendorDetail";
import LaporanPekerjaan from "@/components/LaporanPekerjaan";
import EvaluasiPekerjaan from "@/components/EvaluasiPekerjaan";
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
} from "@/lib/bisnisData";

export default function BisnisBrandPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState("");
  const [activities, setActivities] = useState(DEFAULT_ACTIVITIES);
  const [brands, setBrands] = useState(DEFAULT_BISNIS_BRANDS);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editNama, setEditNama] = useState("");
  const [confirmHapusBrand, setConfirmHapusBrand] = useState(false);
  const [editingKegiatan, setEditingKegiatan] = useState(null);
  const [editForm, setEditForm] = useState({
    judul: "",
    prioritas: "",
    sumber: "",
    catatan: "",
    tanggal: "",
  });

  // ========== SETTINGS BISNIS ==========
  const [prioritasList, setPrioritasList] = useState(DEFAULT_BISNIS_PRIORITAS);
  const [sumberList, setSumberList] = useState(DEFAULT_BISNIS_SUMBER);
  const [sections, setSections] = useState(DEFAULT_BISNIS_SECTIONS);
  const [kategoriList, setKategoriList] = useState(DEFAULT_BISNIS_KATEGORI);
  const [vendorKategoriList, setVendorKategoriList] = useState(
    DEFAULT_BISNIS_VENDOR_KATEGORI
  );
  const [vendorPertanyaanList, setVendorPertanyaanList] = useState(
    DEFAULT_BISNIS_VENDOR_PERTANYAAN
  );
  const [vendorTujuanList, setVendorTujuanList] = useState(
    DEFAULT_BISNIS_VENDOR_TUJUAN
  );
  const [vendorSatuanMoqList, setVendorSatuanMoqList] = useState(
    DEFAULT_BISNIS_VENDOR_SATUAN_MOQ
  );
  const [fieldEvaluasiList, setFieldEvaluasiList] = useState(
    DEFAULT_BISNIS_FIELD_EVALUASI
  );
  const [fieldEvaluasiVendorList, setFieldEvaluasiVendorList] = useState(
    DEFAULT_BISNIS_FIELD_EVALUASI_VENDOR
  );
  const [periodeEvaluasiList, setPeriodeEvaluasiList] = useState(
    DEFAULT_BISNIS_PERIODE_EVALUASI
  );

  // ========== TAB & VENDOR STATE ==========
  const [activeTab, setActiveTab] = useState("kalender");
  const [selectedVendorId, setSelectedVendorId] = useState(null);

  const router = useRouter();
  const params = useParams();
  const brandId = params.brandId;

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
          await setDoc(
            docRef,
            { activities: DEFAULT_ACTIVITIES },
            { merge: true }
          );
          setActivities(DEFAULT_ACTIVITIES);
        }

        // Brands
        if (data.bisnisBrands && Array.isArray(data.bisnisBrands)) {
          setBrands(data.bisnisBrands);
        } else {
          await setDoc(
            docRef,
            { bisnisBrands: DEFAULT_BISNIS_BRANDS },
            { merge: true }
          );
          setBrands(DEFAULT_BISNIS_BRANDS);
        }

        // ========== LOAD SETTINGS BISNIS ==========
        if (
          data.bisnisPrioritasList &&
          Array.isArray(data.bisnisPrioritasList)
        ) {
          setPrioritasList(data.bisnisPrioritasList);
        }
        if (data.bisnisSumberList && Array.isArray(data.bisnisSumberList)) {
          setSumberList(data.bisnisSumberList);
        }
        if (data.bisnisSections && Array.isArray(data.bisnisSections)) {
          setSections(data.bisnisSections);
        }
        if (
          data.bisnisKategoriList &&
          Array.isArray(data.bisnisKategoriList)
        ) {
          setKategoriList(data.bisnisKategoriList);
        }
        if (
          data.bisnisVendorKategoriList &&
          Array.isArray(data.bisnisVendorKategoriList)
        ) {
          setVendorKategoriList(data.bisnisVendorKategoriList);
        }
        if (
          data.bisnisVendorPertanyaanList &&
          Array.isArray(data.bisnisVendorPertanyaanList)
        ) {
          setVendorPertanyaanList(data.bisnisVendorPertanyaanList);
        }
        if (
          data.bisnisVendorTujuanList &&
          Array.isArray(data.bisnisVendorTujuanList)
        ) {
          setVendorTujuanList(data.bisnisVendorTujuanList);
        }
        if (
          data.bisnisVendorSatuanMoqList &&
          Array.isArray(data.bisnisVendorSatuanMoqList)
        ) {
          setVendorSatuanMoqList(data.bisnisVendorSatuanMoqList);
        }
        if (
          data.bisnisFieldEvaluasiList &&
          Array.isArray(data.bisnisFieldEvaluasiList)
        ) {
          setFieldEvaluasiList(data.bisnisFieldEvaluasiList);
        }
        if (
          data.bisnisFieldEvaluasiVendorList &&
          Array.isArray(data.bisnisFieldEvaluasiVendorList)
        ) {
          setFieldEvaluasiVendorList(data.bisnisFieldEvaluasiVendorList);
        }
        if (
          data.bisnisPeriodeEvaluasiList &&
          Array.isArray(data.bisnisPeriodeEvaluasiList)
        ) {
          setPeriodeEvaluasiList(data.bisnisPeriodeEvaluasiList);
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

  // Cari brand dari URL
  const brand = brands.find((b) => b.id === brandId);

  useEffect(() => {
    if (brand) setEditNama(brand.nama);
  }, [brand]);

  // ========== SIMPAN BRANDS KE FIRESTORE ==========
  const simpanBrands = async (updatedBrands) => {
    setBrands(updatedBrands);
    if (!user) return;
    const docRef = doc(db, "users", user.uid);
    await setDoc(docRef, { bisnisBrands: updatedBrands }, { merge: true });
  };

  // ========== SIMPAN SETTINGS KE FIRESTORE ==========
  const simpanSettings = async (updates) => {
    const docRef = doc(db, "users", user.uid);
    await setDoc(docRef, updates, { merge: true });
  };

  // ========== UPDATE BRAND (helper) ==========
  const updateBrandData = async (updatedBrandData) => {
    const updatedBrands = brands.map((b) =>
      b.id === brandId
        ? { ...b, ...updatedBrandData, updatedAt: new Date().toISOString() }
        : b
    );
    await simpanBrands(updatedBrands);
  };

  // ========== KATEGORI KEGIATAN ==========
  const handleUpdateKategoriList = async (updatedList) => {
    setKategoriList(updatedList);
    await simpanSettings({ bisnisKategoriList: updatedList });
  };

  // ========== TAMBAH KEGIATAN ==========
  const handleTambahKegiatan = async (newKegiatan) => {
    const newKegiatanList = [...(brand.kegiatan || []), newKegiatan];
    await updateBrandData({ kegiatan: newKegiatanList });
  };

  // ========== EDIT KEGIATAN ==========
  const handleBukaEdit = (kegiatan) => {
    setEditingKegiatan(kegiatan);
    setEditForm({
      judul: kegiatan.judul,
      prioritas: kegiatan.prioritas,
      sumber: kegiatan.sumber,
      catatan: kegiatan.catatan || "",
      tanggal: kegiatan.tanggal,
    });
  };

  const handleSimpanEdit = async () => {
    if (!editForm.judul.trim() || !editingKegiatan) return;
    const newKegiatanList = brand.kegiatan.map((k) =>
      k.id === editingKegiatan.id
        ? { ...k, ...editForm, updatedAt: new Date().toISOString() }
        : k
    );
    await updateBrandData({ kegiatan: newKegiatanList });
    setEditingKegiatan(null);
  };

  // ========== HAPUS KEGIATAN ==========
  const handleHapusKegiatan = async (kegId) => {
    if (!confirm("Hapus kegiatan ini? Data akan masuk history.")) return;
    const keg = brand.kegiatan.find((k) => k.id === kegId);
    if (!keg) return;

    // Simpan ke history
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);
    const data = docSnap.data();
    const history = data.bisnisHistory || {};
    const key = `${keg.tanggal}_${keg.id}`;
    history[key] = { ...keg, deletedAt: new Date().toISOString() };
    await setDoc(docRef, { bisnisHistory: history }, { merge: true });

    const newKegiatanList = brand.kegiatan.filter((k) => k.id !== kegId);
    await updateBrandData({ kegiatan: newKegiatanList });
  };

  // ========== KLIK KEGIATAN ==========
  const handleClickKegiatan = (kegId) => {
    router.push(`/dashboard/bisnis/${brandId}/${kegId}`);
  };

  // ========== EDIT NAMA BRAND ==========
  const handleSimpanNamaBrand = async () => {
    if (!editNama.trim()) return;
    const updatedBrands = brands.map((b) =>
      b.id === brandId
        ? { ...b, nama: editNama, updatedAt: new Date().toISOString() }
        : b
    );
    await simpanBrands(updatedBrands);
    setEditMode(false);
  };

  // ========== HAPUS BRAND ==========
  const handleHapusBrand = async () => {
    const updatedBrands = brands.filter((b) => b.id !== brandId);
    await simpanBrands(updatedBrands);
    setConfirmHapusBrand(false);
    router.push("/dashboard/bisnis");
  };

  // ========== VENDOR HANDLERS ==========
  const handleAddVendor = async (newVendor) => {
    const newVendorList = [...(brand.vendorList || []), newVendor];
    await updateBrandData({ vendorList: newVendorList });
  };

  const handleUpdateVendor = async (updatedVendor) => {
    const newVendorList = (brand.vendorList || []).map((v) =>
      v.id === updatedVendor.id ? updatedVendor : v
    );
    await updateBrandData({ vendorList: newVendorList });
  };

  const handleDeleteVendor = async (vendorId) => {
    const newVendorList = (brand.vendorList || []).filter(
      (v) => v.id !== vendorId
    );
    await updateBrandData({ vendorList: newVendorList });
    setSelectedVendorId(null);
  };

  const handleUpdateVendorKategori = async (updatedList) => {
    setVendorKategoriList(updatedList);
    await simpanSettings({ bisnisVendorKategoriList: updatedList });
  };

  const handleUpdateVendorPertanyaan = async (updatedList) => {
    setVendorPertanyaanList(updatedList);
    await simpanSettings({ bisnisVendorPertanyaanList: updatedList });
  };

  const handleUpdateVendorSatuanMoq = async (updatedList) => {
    setVendorSatuanMoqList(updatedList);
    await simpanSettings({ bisnisVendorSatuanMoqList: updatedList });
  };

  // ========== LAPORAN HANDLER ==========
  const handleUpdateLaporan = async (newLaporanData) => {
    await updateBrandData({ laporanData: newLaporanData });
  };

  // ========== EVALUASI HANDLERS ==========
  const handleUpdateFieldEvaluasi = async (updatedList) => {
    setFieldEvaluasiList(updatedList);
    await simpanSettings({ bisnisFieldEvaluasiList: updatedList });
  };

  const handleUpdateFieldEvaluasiVendor = async (updatedList) => {
    setFieldEvaluasiVendorList(updatedList);
    await simpanSettings({ bisnisFieldEvaluasiVendorList: updatedList });
  };

  const handleUpdatePeriodeEvaluasi = async (updatedList) => {
    setPeriodeEvaluasiList(updatedList);
    await simpanSettings({ bisnisPeriodeEvaluasiList: updatedList });
  };

  const handleUpdateEvaluasi = async (newEvaluasiData) => {
    await updateBrandData({ evaluasiData: newEvaluasiData });
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

  if (!brand) {
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
              <p className="text-3xl mb-2">🏷️</p>
              <p className="text-sm mb-4">Brand tidak ditemukan.</p>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => router.push("/dashboard/bisnis")}
              >
                ← Balik ke Bisnis
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const vendorList = brand.vendorList || [];
  const selectedVendor = selectedVendorId
    ? vendorList.find((v) => v.id === selectedVendorId)
    : null;
  const laporanData = brand.laporanData || {};
  const evaluasiData = brand.evaluasiData || {};

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
                  onClick={() => router.push("/dashboard/bisnis")}
                  className="cursor-pointer"
                >
                  💼 Bisnis
                </a>
              </li>
              <li>🏷️ {brand.nama}</li>
            </ul>
          </div>

          {/* Header Brand */}
          <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
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
                  onClick={handleSimpanNamaBrand}
                >
                  💾 Simpan
                </button>
                <button
                  className="btn btn-ghost btn-sm text-gray-700"
                  onClick={() => {
                    setEditMode(false);
                    setEditNama(brand.nama);
                  }}
                >
                  Batal
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-800">
                  🏷️ {brand.nama}
                </h1>
                <button
                  className="btn btn-ghost btn-xs text-gray-500"
                  onClick={() => setEditMode(true)}
                  title="Edit nama brand"
                >
                  ✏️
                </button>
                <button
                  className="btn btn-ghost btn-xs text-red-500"
                  onClick={() => setConfirmHapusBrand(true)}
                  title="Hapus brand"
                >
                  🗑️
                </button>
              </div>
            )}
          </div>

          {/* Konfirmasi Hapus Brand */}
          {confirmHapusBrand && (
            <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
              <p className="text-sm text-red-700 mb-2">
                Yakin mau hapus <strong>{brand.nama}</strong>? Semua kegiatan,
                vendor, laporan, dan evaluasi bakal hilang.
              </p>
              <div className="flex gap-2">
                <button
                  className="btn btn-error btn-sm"
                  onClick={handleHapusBrand}
                >
                  Ya, Hapus
                </button>
                <button
                  className="btn btn-ghost btn-sm text-gray-700"
                  onClick={() => setConfirmHapusBrand(false)}
                >
                  Batal
                </button>
              </div>
            </div>
          )}

          {/* TAB NAVIGATION */}
          <div className="tabs tabs-boxed bg-white shadow border border-gray-200 mb-4 p-1 w-fit">
            <button
              className={`tab ${
                activeTab === "kalender"
                  ? "tab-active bg-blue-600 text-white"
                  : ""
              }`}
              onClick={() => {
                setActiveTab("kalender");
                setSelectedVendorId(null);
              }}
            >
              📅 Kalender
            </button>
            <button
              className={`tab ${
                activeTab === "vendor"
                  ? "tab-active bg-blue-600 text-white"
                  : ""
              }`}
              onClick={() => setActiveTab("vendor")}
            >
              🏭 Vendor ({vendorList.length})
            </button>
            <button
              className={`tab ${
                activeTab === "laporan"
                  ? "tab-active bg-blue-600 text-white"
                  : ""
              }`}
              onClick={() => setActiveTab("laporan")}
            >
              📋 Laporan
            </button>
            <button
              className={`tab ${
                activeTab === "evaluasi"
                  ? "tab-active bg-blue-600 text-white"
                  : ""
              }`}
              onClick={() => setActiveTab("evaluasi")}
            >
              📊 Evaluasi
            </button>
          </div>

          {/* ========== TAB KALENDER ========== */}
          {activeTab === "kalender" && (
            <>
              <KalenderPekerjaan
                kegiatan={brand.kegiatan || []}
                onAdd={handleTambahKegiatan}
                onClickKegiatan={handleClickKegiatan}
                prioritasList={prioritasList}
                sumberList={sumberList}
                kategoriList={kategoriList}
                onUpdateKategoriList={handleUpdateKategoriList}
              />

              {brand.kegiatan && brand.kegiatan.length > 0 && (
                <div className="card bg-white shadow border border-gray-200 mt-4">
                  <div className="card-body p-4">
                    <h3 className="text-base font-bold text-gray-800 mb-3">
                      📋 Semua Kegiatan ({brand.kegiatan.length})
                    </h3>
                    <div className="space-y-2">
                      {brand.kegiatan
                        .slice()
                        .sort((a, b) => {
                          const aTgl = a.tanggalMulai || a.tanggal || "";
                          const bTgl = b.tanggalMulai || b.tanggal || "";
                          return aTgl.localeCompare(bTgl);
                        })
                        .map((keg) => (
                          <div
                            key={keg.id}
                            className="flex items-start gap-3 p-3 rounded border bg-gray-50 border-gray-200"
                          >
                            <div
                              className="flex-1 cursor-pointer"
                              onClick={() => handleClickKegiatan(keg.id)}
                            >
                              <p
                                className={`text-sm font-semibold text-gray-800 ${
                                  keg.status === "selesai"
                                    ? "line-through opacity-60"
                                    : ""
                                }`}
                              >
                                {keg.judul}
                              </p>
                              <p className="text-xs text-gray-500">
                                📅 {keg.tanggal} •{" "}
                                {keg.status === "selesai"
                                  ? "✅ Selesai"
                                  : "⏳ Belum"}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <button
                                className="btn btn-ghost btn-xs"
                                onClick={() => handleBukaEdit(keg)}
                                title="Edit"
                              >
                                ✏️
                              </button>
                              <button
                                className="btn btn-ghost btn-xs text-red-500"
                                onClick={() => handleHapusKegiatan(keg.id)}
                                title="Hapus"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ========== TAB VENDOR ========== */}
          {activeTab === "vendor" && (
            <>
              {selectedVendor ? (
                <VendorDetail
                  vendor={selectedVendor}
                  kategoriVendorList={vendorKategoriList}
                  tujuanKunjunganList={vendorTujuanList}
                  fieldEvaluasiVendorList={fieldEvaluasiVendorList}
                  periodeEvaluasiList={periodeEvaluasiList}
                  onUpdateVendor={handleUpdateVendor}
                  onDeleteVendor={handleDeleteVendor}
                  onBack={() => setSelectedVendorId(null)}
                />
              ) : (
                <VendorManager
                  vendorList={vendorList}
                  kategoriVendorList={vendorKategoriList}
                  pertanyaanVendorList={vendorPertanyaanList}
                  satuanMoqList={vendorSatuanMoqList}
                  onAddVendor={handleAddVendor}
                  onDeleteVendor={handleDeleteVendor}
                  onClickVendor={setSelectedVendorId}
                  onUpdateKategoriVendor={handleUpdateVendorKategori}
                  onUpdatePertanyaanVendor={handleUpdateVendorPertanyaan}
                  onUpdateSatuanMoq={handleUpdateVendorSatuanMoq}
                />
              )}
            </>
          )}

          {/* ========== TAB LAPORAN ========== */}
          {activeTab === "laporan" && (
            <LaporanPekerjaan
              kegiatanList={brand.kegiatan || []}
              laporanData={laporanData}
              onUpdateLaporan={handleUpdateLaporan}
              prioritasList={prioritasList}
              sumberList={sumberList}
            />
          )}

          {/* ========== TAB EVALUASI ========== */}
          {activeTab === "evaluasi" && (
            <EvaluasiPekerjaan
              kegiatanList={brand.kegiatan || []}
              laporanData={laporanData}
              evaluasiData={evaluasiData}
              vendorList={vendorList}
              fieldEvaluasiList={fieldEvaluasiList}
              periodeEvaluasiList={periodeEvaluasiList}
              fieldEvaluasiVendorList={fieldEvaluasiVendorList}
              onUpdateEvaluasi={handleUpdateEvaluasi}
              onUpdateFieldEvaluasi={handleUpdateFieldEvaluasi}
              onUpdatePeriodeEvaluasi={handleUpdatePeriodeEvaluasi}
              onUpdateFieldEvaluasiVendor={handleUpdateFieldEvaluasiVendor}
            />
          )}
        </div>
      </div>

      {/* Modal Edit Kegiatan */}
      {editingKegiatan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card bg-white shadow-xl w-full max-w-md">
            <div className="card-body p-4">
              <h3 className="text-base font-bold text-gray-800 mb-3">
                ✏️ Edit Kegiatan
              </h3>
              <div className="space-y-2">
                <input
                  type="text"
                  className="input input-bordered w-full text-gray-800 bg-white"
                  placeholder="Judul kegiatan"
                  value={editForm.judul}
                  onChange={(e) =>
                    setEditForm({ ...editForm, judul: e.target.value })
                  }
                />
                <div className="flex gap-2">
                  <select
                    className="select select-bordered flex-1 text-gray-800 bg-white"
                    value={editForm.prioritas}
                    onChange={(e) =>
                      setEditForm({ ...editForm, prioritas: e.target.value })
                    }
                  >
                    {prioritasList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                  <select
                    className="select select-bordered flex-1 text-gray-800 bg-white"
                    value={editForm.sumber}
                    onChange={(e) =>
                      setEditForm({ ...editForm, sumber: e.target.value })
                    }
                  >
                    {sumberList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  type="date"
                  className="input input-bordered w-full text-gray-800 bg-white"
                  value={editForm.tanggal}
                  onChange={(e) =>
                    setEditForm({ ...editForm, tanggal: e.target.value })
                  }
                />
                <textarea
                  className="textarea textarea-bordered w-full text-sm text-gray-800 bg-white"
                  rows="2"
                  placeholder="Catatan"
                  value={editForm.catatan}
                  onChange={(e) =>
                    setEditForm({ ...editForm, catatan: e.target.value })
                  }
                />
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  className="btn btn-primary btn-sm flex-1"
                  onClick={handleSimpanEdit}
                >
                  💾 Simpan
                </button>
                <button
                  className="btn btn-ghost btn-sm text-gray-700"
                  onClick={() => setEditingKegiatan(null)}
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}