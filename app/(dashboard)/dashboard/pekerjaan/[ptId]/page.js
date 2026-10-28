// app/(dashboard)/dashboard/pekerjaan/[ptId]/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { generateId } from "@/lib/pekerjaanData";

export default function PTDetailPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pekerjaan, setPekerjaan] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ nama: "" });
  const [editMode, setEditMode] = useState(false);
  const [editNama, setEditNama] = useState("");
  const [confirmHapusPT, setConfirmHapusPT] = useState(false);

  const router = useRouter();
  const params = useParams();
  const ptId = params.ptId;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push("/login"); return; }
      setUser(user);
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPekerjaan(data.pekerjaan || []);
      } else {
        await setDoc(docRef, { pekerjaan: [] });
        setPekerjaan([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const pt = pekerjaan.find((p) => p.id === ptId);

  useEffect(() => { if (pt) setEditNama(pt.nama); }, [pt]);

  const simpanKeFirestore = async (updatedPekerjaan) => {
    setPekerjaan(updatedPekerjaan);
    await setDoc(doc(db, "users", user.uid), { pekerjaan: updatedPekerjaan }, { merge: true });
  };

  const handleTambahBrand = async () => {
    if (!formData.nama.trim()) return;
    const newBrand = { id: generateId("brand"), nama: formData.nama, kegiatan: [] };
    const updated = pekerjaan.map((p) => p.id === ptId ? { ...p, brands: [...p.brands, newBrand] } : p);
    await simpanKeFirestore(updated);
    setFormData({ nama: "" });
    setShowForm(false);
  };

  const handleHapusBrand = async (brandId, e) => {
    e.stopPropagation();
    if (!confirm("Hapus brand ini? Semua kegiatan akan hilang.")) return;
    const updated = pekerjaan.map((p) => p.id === ptId ? { ...p, brands: p.brands.filter((b) => b.id !== brandId) } : p);
    await simpanKeFirestore(updated);
  };

  const handleSimpanNamaPT = async () => {
    if (!editNama.trim()) return;
    const updated = pekerjaan.map((p) => p.id === ptId ? { ...p, nama: editNama } : p);
    await simpanKeFirestore(updated);
    setEditMode(false);
  };

  const handleHapusPT = async () => {
    const updated = pekerjaan.filter((p) => p.id !== ptId);
    await simpanKeFirestore(updated);
    setConfirmHapusPT(false);
    router.push("/dashboard/pekerjaan");
  };

  if (loading) return <div className="p-6">Loading...</div>;

  if (!pt) {
    return (
      <div className="card bg-white shadow border border-gray-200 max-w-md mx-auto mt-10">
        <div className="card-body p-8 text-center text-gray-400">
          <p className="text-3xl mb-2">🏢</p>
          <p className="text-sm mb-4">PT tidak ditemukan.</p>
          <button className="btn btn-primary btn-sm" onClick={() => router.push("/dashboard/pekerjaan")}>← Balik ke Pekerjaan</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-sm breadcrumbs mb-4" data-html2canvas-ignore="true">
        <ul>
          <li><a onClick={() => router.push("/dashboard")} className="cursor-pointer">🏠 Dashboard</a></li>
          <li><a onClick={() => router.push("/dashboard/pekerjaan")} className="cursor-pointer">💼 Pekerjaan</a></li>
          <li>🏢 {pt.nama}</li>
        </ul>
      </div>

      <div className="flex flex-wrap justify-between items-center mb-6 gap-2" data-html2canvas-ignore="true">
        {editMode ? (
          <div className="flex gap-2 items-center flex-1">
            <input type="text" className="input input-bordered text-gray-800 bg-white flex-1 max-w-md" value={editNama} onChange={(e) => setEditNama(e.target.value)} autoFocus />
            <button className="btn btn-primary btn-sm" onClick={handleSimpanNamaPT}>💾 Simpan</button>
            <button className="btn btn-ghost btn-sm text-gray-700" onClick={() => { setEditMode(false); setEditNama(pt.nama); }}>Batal</button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-800">🏢 {pt.nama}</h1>
            <button className="btn btn-ghost btn-xs text-gray-500" onClick={() => setEditMode(true)}>✏️</button>
            <button className="btn btn-ghost btn-xs text-red-500" onClick={() => setConfirmHapusPT(true)}>🗑️</button>
          </div>
        )}
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>+ Tambah Brand</button>
      </div>

      {confirmHapusPT && (
        <div className="bg-red-50 border border-red-200 rounded p-3 mb-4" data-html2canvas-ignore="true">
          <p className="text-sm text-red-700 mb-2">Yakin mau hapus <strong>{pt.nama}</strong>? Semua brand dan kegiatan akan hilang.</p>
          <div className="flex gap-2">
            <button className="btn btn-error btn-sm" onClick={handleHapusPT}>Ya, Hapus</button>
            <button className="btn btn-ghost btn-sm text-gray-700" onClick={() => setConfirmHapusPT(false)}>Batal</button>
          </div>
        </div>
      )}

      {showForm && (
        <div className="card bg-white shadow border border-gray-200 mb-4" data-html2canvas-ignore="true">
          <div className="card-body p-4">
            <p className="text-xs font-semibold text-blue-700 mb-2">✏️ Tambah brand baru</p>
            <input type="text" className="input input-bordered w-full text-gray-800 bg-white" placeholder="Nama Brand" value={formData.nama} onChange={(e) => setFormData({ nama: e.target.value })} autoFocus />
            <div className="flex gap-2 mt-3">
              <button className="btn btn-primary btn-sm flex-1" onClick={handleTambahBrand}>➕ Tambah</button>
              <button className="btn btn-ghost btn-sm text-gray-700" onClick={() => setShowForm(false)}>Batal</button>
            </div>
          </div>
        </div>
      )}

      {!pt.brands || pt.brands.length === 0 ? (
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-8 text-center text-gray-400">
            <p className="text-3xl mb-2">🏷️</p>
            <p className="text-sm">Belum ada brand di PT ini. Klik "+ Tambah Brand" untuk mulai.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pt.brands.map((brand) => (
            <div key={brand.id} className="card bg-white shadow border border-gray-200 hover:shadow-lg transition cursor-pointer" onClick={() => router.push(`/dashboard/pekerjaan/${ptId}/${brand.id}`)}>
              <div className="card-body p-4">
                <div className="flex justify-between items-start">
                  <h2 className="card-title text-base text-gray-800">🏷️ {brand.nama}</h2>
                  <button className="btn btn-ghost btn-xs text-red-500" onClick={(e) => handleHapusBrand(brand.id, e)}>🗑️</button>
                </div>
                <p className="text-sm text-gray-500">{brand.kegiatan?.length || 0} Kegiatan</p>
                <div className="card-actions justify-end mt-2"><span className="text-gray-400 text-sm">Buka →</span></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}