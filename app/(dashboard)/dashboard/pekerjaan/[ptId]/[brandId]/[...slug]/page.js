// app/(dashboard)/dashboard/pekerjaan/[ptId]/[brandId]/[...slug]/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import DetailKegiatan from "@/components/DetailKegiatan";
import ExportPDFButton from "@/components/ExportPDFButton";
import { DEFAULT_PRIORITAS, DEFAULT_SUMBER, DEFAULT_SECTIONS } from "@/lib/pekerjaanData";
import { Home, Briefcase, Building2, Tag, ClipboardList, Loader2 } from "lucide-react";

export default function DetailKegiatanPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState("");
  const [pekerjaan, setPekerjaan] = useState([]);
  const [prioritasList, setPrioritasList] = useState(DEFAULT_PRIORITAS);
  const [sumberList, setSumberList] = useState(DEFAULT_SUMBER);
  const [sections, setSections] = useState(DEFAULT_SECTIONS);
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
          pekerjaan: [],
          prioritasList: DEFAULT_PRIORITAS,
          sumberList: DEFAULT_SUMBER,
          sections: DEFAULT_SECTIONS,
        });
        setPekerjaan([]);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

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

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  }

  if (!kegiatan) {
    return (
      <div className="card bg-white shadow border border-gray-200 max-w-md mx-auto mt-10">
        <div className="card-body p-8 text-center text-gray-400">
          <ClipboardList size={40} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm mb-4">Kegiatan tidak ditemukan.</p>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => router.push(`/dashboard/pekerjaan/${ptId}/${brandId}`)}
          >
            ← Balik ke Brand
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Breadcrumb - IGNORE */}
      <div className="text-sm breadcrumbs mb-4 text-gray-500" data-html2canvas-ignore="true">
        <ul>
          <li>
            <a onClick={() => router.push("/dashboard")} className="cursor-pointer flex items-center gap-1 hover:text-primary">
              <Home size={14} /> Dashboard
            </a>
          </li>
          <li>
            <a onClick={() => router.push("/dashboard/pekerjaan")} className="cursor-pointer flex items-center gap-1 hover:text-primary">
              <Briefcase size={14} /> Pekerjaan
            </a>
          </li>
          <li>
            <a onClick={() => router.push(`/dashboard/pekerjaan/${ptId}`)} className="cursor-pointer flex items-center gap-1 hover:text-primary">
              <Building2 size={14} /> {pekerjaan.find((p) => p.id === ptId)?.nama || ptId}
            </a>
          </li>
          <li>
            <a onClick={() => router.push(`/dashboard/pekerjaan/${ptId}/${brandId}`)} className="cursor-pointer flex items-center gap-1 hover:text-primary">
              <Tag size={14} /> {pekerjaan.find((p) => p.id === ptId)?.brands?.find((b) => b.id === brandId)?.nama || brandId}
            </a>
          </li>
          <li className="flex items-center gap-1"><ClipboardList size={14} /> {kegiatan.judul}</li>
        </ul>
      </div>

      {/* ========== AREA EXPORT ========== */}
      <div id="export-area">
        {/* Tombol Export - IGNORE */}
        <div className="flex justify-end mb-4" data-html2canvas-ignore="true">
          <ExportPDFButton 
            targetId="export-area" 
            fileName={`Kegiatan_${kegiatan.judul}.pdf`} 
            title={kegiatan.judul} 
          />
        </div>

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
  );
}