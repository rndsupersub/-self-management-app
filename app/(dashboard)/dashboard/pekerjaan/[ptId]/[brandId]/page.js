// app/(dashboard)/dashboard/pekerjaan/[ptId]/[brandId]/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Sidebar from "@/components/Sidebar";
import KalenderPekerjaan from "@/components/KalenderPekerjaan";
import { DEFAULT_ACTIVITIES } from "@/lib/defaultData";
import {
  DEFAULT_PRIORITAS,
  DEFAULT_SUMBER,
  DEFAULT_SECTIONS,
  generateId,
} from "@/lib/pekerjaanData";

export default function BrandPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState("");
  const [activities, setActivities] = useState(DEFAULT_ACTIVITIES);
  const [pekerjaan, setPekerjaan] = useState([]);
  const [prioritasList, setPrioritasList] = useState(DEFAULT_PRIORITAS);
  const [sumberList, setSumberList] = useState(DEFAULT_SUMBER);
  const [sections, setSections] = useState(DEFAULT_SECTIONS);
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

  const router = useRouter();
  const params = useParams();
  const ptId = params.ptId;
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

        if (data.prioritasList && Array.isArray(data.prioritasList)) {
          setPrioritasList(data.prioritasList);
        } else {
          await setDoc(docRef, { prioritasList: DEFAULT_PRIORITAS }, { merge: true });
        }

        if (data.sumberList && Array.isArray(data.sumberList)) {
          setSumberList(data.sumberList);
        } else {
          await setDoc(docRef, { sumberList: DEFAULT_SUMBER }, { merge: true });
        }

        if (data.sections && Array.isArray(data.sections)) {
          setSections(data.sections);
        } else {
          await setDoc(docRef, { sections: DEFAULT_SECTIONS }, { merge: true });
        }
      } else {
        await setDoc(docRef, {
          activities: DEFAULT_ACTIVITIES,
          pekerjaan: [],
          prioritasList: DEFAULT_PRIORITAS,
          sumberList: DEFAULT_SUMBER,
          sections: DEFAULT_SECTIONS,
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

  // Cari PT dan Brand dari URL
  const pt = pekerjaan.find((p) => p.id === ptId);
  const brand = pt?.brands?.find((b) => b.id === brandId);

  useEffect(() => {
    if (brand) setEditNama(brand.nama);
  }, [brand]);

  // ========== SIMPAN KE FIRESTORE ==========
  const simpanKeFirestore = async (updatedPekerjaan) => {
    setPekerjaan(updatedPekerjaan);
    const docRef = doc(db, "users", user.uid);
    await setDoc(docRef, { pekerjaan: updatedPekerjaan }, { merge: true });
  };

  // ========== TAMBAH KEGIATAN ==========
  const handleTambahKegiatan = async (newKegiatan) => {
    const updated = pekerjaan.map((p) =>
      p.id === ptId
        ? {
            ...p,
            brands: p.brands.map((b) =>
              b.id === brandId
                ? { ...b, kegiatan: [...(b.kegiatan || []), newKegiatan] }
                : b
            ),
          }
        : p
    );
    await simpanKeFirestore(updated);
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

    const updated = pekerjaan.map((p) =>
      p.id === ptId
        ? {
            ...p,
            brands: p.brands.map((b) =>
              b.id === brandId
                ? {
                    ...b,
                    kegiatan: b.kegiatan.map((k) =>
                      k.id === editingKegiatan.id
                        ? {
                            ...k,
                            ...editForm,
                            updatedAt: new Date().toISOString(),
                          }
                        : k
                    ),
                  }
                : b
            ),
          }
        : p
    );
    await simpanKeFirestore(updated);
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
    const history = data.pekerjaanHistory || {};
    const key = `${keg.tanggal}_${keg.id}`;
    history[key] = { ...keg, deletedAt: new Date().toISOString() };
    await setDoc(docRef, { pekerjaanHistory: history }, { merge: true });

    // Hapus dari daftar
    const updated = pekerjaan.map((p) =>
      p.id === ptId
        ? {
            ...p,
            brands: p.brands.map((b) =>
              b.id === brandId
                ? { ...b, kegiatan: b.kegiatan.filter((k) => k.id !== kegId) }
                : b
            ),
          }
        : p
    );
    await simpanKeFirestore(updated);
  };

  // ========== KLIK KEGIATAN (Pindah halaman) ==========
  const handleClickKegiatan = (kegId) => {
    router.push(`/dashboard/pekerjaan/${ptId}/${brandId}/${kegId}`);
  };

  // ========== EDIT NAMA BRAND ==========
  const handleSimpanNamaBrand = async () => {
    if (!editNama.trim()) return;
    const updated = pekerjaan.map((p) =>
      p.id === ptId
        ? {
            ...p,
            brands: p.brands.map((b) =>
              b.id === brandId ? { ...b, nama: editNama } : b
            ),
          }
        : p
    );
    await simpanKeFirestore(updated);
    setEditMode(false);
  };

  // ========== HAPUS BRAND ==========
  const handleHapusBrand = async () => {
    const updated = pekerjaan.map((p) =>
      p.id === ptId
        ? { ...p, brands: p.brands.filter((b) => b.id !== brandId) }
        : p
    );
    await simpanKeFirestore(updated);
    setConfirmHapusBrand(false);
    router.push(`/dashboard/pekerjaan/${ptId}`);
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

  if (!pt || !brand) {
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
              <li>
                <a
                  onClick={() =>
                    router.push(`/dashboard/pekerjaan/${ptId}`)
                  }
                  className="cursor-pointer"
                >
                  🏢 {pt.nama}
                </a>
              </li>
              <li>🏷️ {brand.nama}</li>
            </ul>
          </div>

          {/* Header Brand */}
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
                Yakin mau hapus <strong>{brand.nama}</strong>? Semua kegiatan
                akan hilang.
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

          {/* Kalender */}
          <KalenderPekerjaan
            kegiatan={brand.kegiatan || []}
            onAdd={handleTambahKegiatan}
            onClickKegiatan={handleClickKegiatan}
            prioritasList={prioritasList}
            sumberList={sumberList}
          />

          {/* Daftar Kegiatan dengan tombol Edit & Hapus */}
          {brand.kegiatan && brand.kegiatan.length > 0 && (
            <div className="card bg-white shadow border border-gray-200 mt-4">
              <div className="card-body p-4">
                <h3 className="text-base font-bold text-gray-800 mb-3">
                  📋 Semua Kegiatan ({brand.kegiatan.length})
                </h3>
                <div className="space-y-2">
                  {brand.kegiatan
                    .slice()
                    .sort((a, b) => a.tanggal.localeCompare(b.tanggal))
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
                            📅 {keg.tanggal} • {keg.status === "selesai" ? "✅ Selesai" : "⏳ Belum"}
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
      </div>
    </div>
  );
}