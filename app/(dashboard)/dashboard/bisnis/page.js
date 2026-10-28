// app/(dashboard)/dashboard/bisnis/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import ExportPDFButton from "@/components/ExportPDFButton";
import { DEFAULT_BISNIS_BRANDS, DEFAULT_BISNIS_PRIORITAS, DEFAULT_BISNIS_SUMBER, DEFAULT_BISNIS_SECTIONS, DEFAULT_BISNIS_KATEGORI, DEFAULT_BISNIS_VENDOR_KATEGORI, DEFAULT_BISNIS_VENDOR_PERTANYAAN, DEFAULT_BISNIS_VENDOR_TUJUAN, DEFAULT_BISNIS_VENDOR_SATUAN_MOQ, DEFAULT_BISNIS_FIELD_EVALUASI, DEFAULT_BISNIS_FIELD_EVALUASI_VENDOR, DEFAULT_BISNIS_PERIODE_EVALUASI, generateId, migrasiBisnisLama } from "@/lib/bisnisData";
import { Briefcase, Tag, Pencil, Trash2, ArrowRight, Home } from "lucide-react";

export default function BisnisPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState("");
  const [brands, setBrands] = useState(DEFAULT_BISNIS_BRANDS);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ nama: "" });
  const [editingId, setEditingId] = useState(null);
  const [migrasiNotif, setMigrasiNotif] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setToday(new Date().toISOString().split("T")[0]);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push("/login"); return; }
      setUser(user);
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        let brandsSekarang = Array.isArray(data.bisnisBrands) ? data.bisnisBrands : DEFAULT_BISNIS_BRANDS;
        const { brands: brandsHasilMigrasi, migrated } = migrasiBisnisLama(data.bisnisKegiatan, brandsSekarang);

        if (migrated) {
          brandsSekarang = brandsHasilMigrasi;
          await setDoc(docRef, { bisnisBrands: brandsSekarang }, { merge: true });
          setMigrasiNotif(true);
          setTimeout(() => setMigrasiNotif(false), 5000);
        }
        setBrands(brandsSekarang);
      } else {
        await setDoc(docRef, { bisnisBrands: DEFAULT_BISNIS_BRANDS });
        setBrands(DEFAULT_BISNIS_BRANDS);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const simpanBrands = async (updatedBrands) => {
    setBrands(updatedBrands);
    if (!user) return;
    await setDoc(doc(db, "users", user.uid), { bisnisBrands: updatedBrands }, { merge: true });
  };

  const handleBukaForm = () => { setFormData({ nama: "" }); setEditingId(null); setShowForm(true); };
  const handleBukaEdit = (brand, e) => { e.stopPropagation(); setFormData({ nama: brand.nama }); setEditingId(brand.id); setShowForm(true); };

  const handleSimpanBrand = async () => {
    if (!formData.nama.trim()) return;
    let updated;
    if (editingId) {
      updated = brands.map((b) => b.id === editingId ? { ...b, nama: formData.nama, updatedAt: new Date().toISOString() } : b);
    } else {
      const newBrand = { id: generateId("brand"), nama: formData.nama, kegiatan: [], vendorList: [], laporanData: {}, evaluasiData: {}, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      updated = [...brands, newBrand];
    }
    await simpanBrands(updated);
    setShowForm(false); setFormData({ nama: "" }); setEditingId(null);
  };

  const handleHapusBrand = async (brandId, e) => {
    e.stopPropagation();
    if (!confirm("Hapus brand ini? Semua data akan hilang.")) return;
    await simpanBrands(brands.filter((b) => b.id !== brandId));
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-sm breadcrumbs mb-4 text-gray-500" data-html2canvas-ignore="true">
        <ul>
          <li><a onClick={() => router.push("/dashboard")} className="cursor-pointer flex items-center gap-1 hover:text-primary"><Home size={14} /> Dashboard</a></li>
          <li className="flex items-center gap-1"><Briefcase size={14} /> Bisnis</li>
        </ul>
      </div>

      {migrasiNotif && (
        <div className="alert alert-success mb-4 text-sm" data-html2canvas-ignore="true">
          <span>✅ Migrasi berhasil! Data bisnis lama lo udah dipindah ke brand "Level Up".</span>
        </div>
      )}

      <div id="export-area">
        <div className="flex justify-end mb-4" data-html2canvas-ignore="true">
          <ExportPDFButton targetId="export-area" fileName={`Daftar_Bisnis_${today}.pdf`} title="Daftar Bisnis" />
        </div>

        <div className="flex flex-wrap justify-between items-center mb-6 gap-2" data-html2canvas-ignore="true">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Briefcase className="text-primary" size={24} /> Bisnis
          </h1>
          <button className="btn btn-primary btn-sm" onClick={handleBukaForm}>+ Tambah Brand</button>
        </div>

        {showForm && (
          <div className="card bg-white shadow border border-blue-300 mb-4" data-html2canvas-ignore="true">
            <div className="card-body p-4">
              <p className="text-xs font-semibold text-blue-700 mb-2">{editingId ? "Edit Brand" : "Tambah Brand Baru"}</p>
              <input type="text" className="input input-bordered w-full text-gray-800 bg-white" placeholder="Nama brand" value={formData.nama} onChange={(e) => setFormData({ nama: e.target.value })} onKeyDown={(e) => e.key === "Enter" && handleSimpanBrand()} autoFocus />
              <div className="flex gap-2 mt-3">
                <button className="btn btn-primary btn-sm flex-1" onClick={handleSimpanBrand} disabled={!formData.nama.trim()}>{editingId ? "Simpan" : "Tambah"}</button>
                <button className="btn btn-ghost btn-sm text-gray-700" onClick={() => { setShowForm(false); setFormData({ nama: "" }); setEditingId(null); }}>Batal</button>
              </div>
            </div>
          </div>
        )}

        {brands.length === 0 ? (
          <div className="card bg-white shadow border border-gray-200">
            <div className="card-body p-8 text-center text-gray-400">
              <Tag size={40} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Belum ada brand. Klik "+ Tambah Brand" untuk mulai.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {brands.map((brand) => (
              <div key={brand.id} className="card bg-white shadow border border-gray-200 hover:shadow-lg transition cursor-pointer" onClick={() => router.push(`/dashboard/bisnis/${brand.id}`)}>
                <div className="card-body p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="card-title text-base text-gray-800 flex items-center gap-2 flex-1">
                      <Tag size={18} className="text-gray-500" /> {brand.nama}
                    </h2>
                    <div className="flex gap-1" data-html2canvas-ignore="true">
                      <button className="btn btn-ghost btn-xs text-blue-500" onClick={(e) => handleBukaEdit(brand, e)} title="Edit"><Pencil size={14} /></button>
                      <button className="btn btn-ghost btn-xs text-red-500" onClick={(e) => handleHapusBrand(brand.id, e)} title="Hapus"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">{brand.kegiatan?.length || 0} Kegiatan • {brand.vendorList?.length || 0} Vendor</p>
                  <div className="card-actions justify-end mt-2">
                    <span className="text-gray-400 text-xs flex items-center gap-1 hover:text-primary transition">Buka <ArrowRight size={12} /></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}