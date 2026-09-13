// app/(dashboard)/dashboard/pekerjaan/[ptId]/[brandId]/[...slug]/page.js

"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Sidebar from "@/components/Sidebar";
import DetailKegiatan from "@/components/DetailKegiatan";
import { DEFAULT_ACTIVITIES } from "@/lib/defaultData";
import {
  DEFAULT_PRIORITAS,
  DEFAULT_SUMBER,
  DEFAULT_SECTIONS,
} from "@/lib/pekerjaanData";

export default function DetailKegiatanPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState("");
  const [activities, setActivities] = useState(DEFAULT_ACTIVITIES);
  const [pekerjaan, setPekerjaan] = useState([]);
  const [prioritasList, setPrioritasList] = useState(DEFAULT_PRIORITAS);
  const [sumberList, setSumberList] = useState(DEFAULT_SUMBER);
  const [sections, setSections] = useState(DEFAULT_SECTIONS);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [kegiatan, setKegiatan] = useState(null);

  const router = useRouter();
  const params = useParams();

  const ptId = params.ptId;
  const brandId = params.brandId;
  const slug = params.slug || [];
  const kegId = slug[0]; // slug pertama adalah kegiatan ID

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

  // ========== CARI KEGIATAN DARI URL ==========
  useEffect(() => {
    if (!pekerjaan.length || !ptId || !brandId || !kegId) return;

    const pt = pekerjaan.find((p) => p.id === ptId);
    const brand = pt?.brands?.find((b) => b.id === brandId);
    const keg = brand?.kegiatan?.find((k) => k.id === kegId);

    if (keg) {
      setKegiatan(keg);
    }
  }, [pekerjaan, ptId, brandId, kegId]);

  // ========== SIMPAN KE FIRESTORE ==========
  const simpanKeFirestore = async (updatedPekerjaan) => {
    setPekerjaan(updatedPekerjaan);
    const docRef = doc(db, "users", user.uid);
    await setDoc(docRef, { pekerjaan: updatedPekerjaan }, { merge: true });
  };

  // ========== UPDATE KEGIATAN (catatan, dll) ==========
  const handleUpdate = async (kegId, updatedFields) => {
    const updated = pekerjaan.map((p) =>
      p.id === ptId
        ? {
            ...p,
            brands: p.brands.map((b) =>
              b.id === brandId
                ? {
                    ...b,
                    kegiatan: b.kegiatan.map((k) =>
                      k.id === kegId
                        ? { ...k, ...updatedFields, updatedAt: new Date().toISOString() }
                        : k
                    ),
                  }
                : b
            ),
          }
        : p
    );

    await simpanKeFirestore(updated);

    // Update state lokal
    const pt = updated.find((p) => p.id === ptId);
    const brand = pt?.brands?.find((b) => b.id === brandId);
    const keg = brand?.kegiatan?.find((k) => k.id === kegId);
    setKegiatan(keg);
  };

  // ========== HAPUS KEGIATAN ==========
  const handleDelete = async (kegId) => {
    if (!confirm("Hapus kegiatan ini? Data akan masuk history.")) return;

    const keg = kegiatan;
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
    router.push(`/dashboard/pekerjaan/${ptId}/${brandId}`);
  };

  // ========== TOGGLE STATUS ==========
  const handleToggleStatus = async (kegId) => {
    if (!kegiatan) return;

    const newStatus = kegiatan.status === "selesai" ? "belum" : "selesai";

    const updated = pekerjaan.map((p) =>
      p.id === ptId
        ? {
            ...p,
            brands: p.brands.map((b) =>
              b.id === brandId
                ? {
                    ...b,
                    kegiatan: b.kegiatan.map((k) =>
                      k.id === kegId
                        ? {
                            ...k,
                            status: newStatus,
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

    const pt = updated.find((p) => p.id === ptId);
    const brand = pt?.brands?.find((b) => b.id === brandId);
    const keg = brand?.kegiatan?.find((k) => k.id === kegId);
    setKegiatan(keg);
  };

  // ========== EDIT KEGIATAN ==========
  const handleEdit = (keg) => {
    router.push(`/dashboard/pekerjaan/${ptId}/${brandId}`);
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!kegiatan) {
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
              <p className="text-3xl mb-2">📋</p>
              <p className="text-sm mb-4">Kegiatan tidak ditemukan.</p>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => router.push(`/dashboard/pekerjaan/${ptId}/${brandId}`)}
              >
                ← Balik ke Brand
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
                  onClick={() => router.push(`/dashboard/pekerjaan/${ptId}`)}
                  className="cursor-pointer"
                >
                  🏢 {pekerjaan.find((p) => p.id === ptId)?.nama || ptId}
                </a>
              </li>
              <li>
                <a
                  onClick={() => router.push(`/dashboard/pekerjaan/${ptId}/${brandId}`)}
                  className="cursor-pointer"
                >
                  🏷️{" "}
                  {pekerjaan
                    .find((p) => p.id === ptId)
                    ?.brands?.find((b) => b.id === brandId)?.nama || brandId}
                </a>
              </li>
              <li>{kegiatan.judul}</li>
            </ul>
          </div>

          {/* Detail Kegiatan */}
          <DetailKegiatan
            kegiatan={kegiatan}
            prioritasList={prioritasList}
            sumberList={sumberList}
            sections={sections}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
            onEdit={handleEdit}
          />
        </div>
      </div>
    </div>
  );
}