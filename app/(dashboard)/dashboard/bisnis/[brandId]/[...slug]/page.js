// app/(dashboard)/dashboard/bisnis/[brandId]/[...slug]/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import DetailKegiatan from "@/components/DetailKegiatan";
import { DEFAULT_ACTIVITIES } from "@/lib/defaultData";
import {
  DEFAULT_BISNIS_BRANDS,
  DEFAULT_BISNIS_PRIORITAS,
  DEFAULT_BISNIS_SUMBER,
  DEFAULT_BISNIS_SECTIONS,
} from "@/lib/bisnisData";
import { Home, Briefcase, Tag } from "lucide-react";

export default function BisnisDetailKegiatanPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState("");
  const [activities, setActivities] = useState(DEFAULT_ACTIVITIES);
  const [brands, setBrands] = useState(DEFAULT_BISNIS_BRANDS);

  // ========== SETTINGS BISNIS ==========
  const [prioritasList, setPrioritasList] = useState(DEFAULT_BISNIS_PRIORITAS);
  const [sumberList, setSumberList] = useState(DEFAULT_BISNIS_SUMBER);
  const [sections, setSections] = useState(DEFAULT_BISNIS_SECTIONS);

  const router = useRouter();
  const params = useParams();
  const brandId = params.brandId;
  const slug = params.slug || [];
  const kegId = slug[0];

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

        // Settings
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
      } else {
        // User baru
        await setDoc(docRef, {
          activities: DEFAULT_ACTIVITIES,
          bisnisBrands: DEFAULT_BISNIS_BRANDS,
          bisnisPrioritasList: DEFAULT_BISNIS_PRIORITAS,
          bisnisSumberList: DEFAULT_BISNIS_SUMBER,
          bisnisSections: DEFAULT_BISNIS_SECTIONS,
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

  // Cari brand & kegiatan dari URL
  const brand = brands.find((b) => b.id === brandId);
  const kegiatan = brand?.kegiatan?.find((k) => k.id === kegId);

  // ========== SIMPAN BRANDS KE FIRESTORE ==========
  const simpanBrands = async (updatedBrands) => {
    setBrands(updatedBrands);
    if (!user) return;
    const docRef = doc(db, "users", user.uid);
    await setDoc(docRef, { bisnisBrands: updatedBrands }, { merge: true });
  };

  // ========== UPDATE KEGIATAN ==========
  const handleUpdateKegiatan = async (kegId, updatedFields) => {
    if (!brand) return;
    const newKegiatanList = brand.kegiatan.map((k) =>
      k.id === kegId
        ? { ...k, ...updatedFields, updatedAt: new Date().toISOString() }
        : k
    );
    const updatedBrands = brands.map((b) =>
      b.id === brandId
        ? { ...b, kegiatan: newKegiatanList, updatedAt: new Date().toISOString() }
        : b
    );
    await simpanBrands(updatedBrands);
  };

  // ========== HAPUS KEGIATAN ==========
  const handleDeleteKegiatan = async (kegId) => {
    if (!confirm("Hapus kegiatan ini? Data akan masuk history.")) return;
    if (!brand) return;

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

    // Hapus dari daftar
    const newKegiatanList = brand.kegiatan.filter((k) => k.id !== kegId);
    const updatedBrands = brands.map((b) =>
      b.id === brandId
        ? { ...b, kegiatan: newKegiatanList, updatedAt: new Date().toISOString() }
        : b
    );
    await simpanBrands(updatedBrands);
    router.push(`/dashboard/bisnis/${brandId}`);
  };

  // ========== TOGGLE STATUS ==========
  const handleToggleStatus = async (kegId) => {
    if (!kegiatan) return;
    const newStatus = kegiatan.status === "selesai" ? "belum" : "selesai";
    await handleUpdateKegiatan(kegId, { status: newStatus });
  };

  // ========== EDIT KEGIATAN (balik ke halaman brand) ==========
  const handleEdit = (keg) => {
    router.push(`/dashboard/bisnis/${brandId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (!brand || !kegiatan) {
    return (
      <div className="p-6 text-center">
        <div className="card bg-white shadow border border-gray-200 max-w-md mx-auto">
          <div className="card-body p-8 text-center text-gray-400">
            <p className="text-3xl mb-2">📋</p>
            <p className="text-sm mb-4">Kegiatan tidak ditemukan.</p>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => router.push(`/dashboard/bisnis/${brandId}`)}
            >
              ← Balik ke Brand
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="text-sm breadcrumbs mb-4 text-gray-500">
        <ul>
          <li>
            <a
              onClick={() => router.push("/dashboard")}
              className="cursor-pointer flex items-center gap-1 hover:text-primary"
            >
              <Home size={14} /> Dashboard
            </a>
          </li>
          <li>
            <a
              onClick={() => router.push("/dashboard/bisnis")}
              className="cursor-pointer flex items-center gap-1 hover:text-primary"
            >
              <Briefcase size={14} /> Bisnis
            </a>
          </li>
          <li>
            <a
              onClick={() =>
                router.push(`/dashboard/bisnis/${brandId}`)
              }
              className="cursor-pointer flex items-center gap-1 hover:text-primary"
            >
              <Tag size={14} /> {brand.nama}
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
        onUpdate={handleUpdateKegiatan}
        onDelete={handleDeleteKegiatan}
        onToggleStatus={handleToggleStatus}
        onEdit={handleEdit}
      />
    </div>
  );
}