// app/(dashboard)/dashboard/pekerjaan/[ptId]/[brandId]/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import KalenderPekerjaan from "@/components/KalenderPekerjaan";
import VendorManager from "@/components/VendorManager";
import VendorDetail from "@/components/VendorDetail";
import LaporanPekerjaan from "@/components/LaporanPekerjaan";
import EvaluasiPekerjaan from "@/components/EvaluasiPekerjaan";
import ExportPDFButton from "@/components/ExportPDFButton";
import { DEFAULT_PRIORITAS, DEFAULT_SUMBER, DEFAULT_SECTIONS, DEFAULT_KATEGORI_KEGIATAN } from "@/lib/pekerjaanData";
import { DEFAULT_KATEGORI_VENDOR, DEFAULT_PERTANYAAN_VENDOR, DEFAULT_TUJUAN_KUNJUNGAN, SATUAN_MOQ } from "@/lib/vendorData";
import { DEFAULT_FIELD_EVALUASI, DEFAULT_FIELD_EVALUASI_VENDOR, DEFAULT_PERIODE_EVALUASI } from "@/lib/evaluasiData";
import { Building2, Tag, Pencil, Trash2, Home, Briefcase, Calendar, Factory, FileText, BarChart3, Plus } from "lucide-react";

export default function BrandPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState("");
  const [pekerjaan, setPekerjaan] = useState([]);
  
  const [prioritasList, setPrioritasList] = useState(DEFAULT_PRIORITAS);
  const [sumberList, setSumberList] = useState(DEFAULT_SUMBER);
  const [kategoriPekerjaanList, setKategoriPekerjaanList] = useState(DEFAULT_KATEGORI_KEGIATAN);
  const [vendorKategoriList, setVendorKategoriList] = useState(DEFAULT_KATEGORI_VENDOR);
  const [vendorPertanyaanList, setVendorPertanyaanList] = useState(DEFAULT_PERTANYAAN_VENDOR);
  const [vendorTujuanList, setVendorTujuanList] = useState(DEFAULT_TUJUAN_KUNJUNGAN);
  const [vendorSatuanMoqList, setVendorSatuanMoqList] = useState(SATUAN_MOQ);
  const [fieldEvaluasiPekerjaanList, setFieldEvaluasiPekerjaanList] = useState(DEFAULT_FIELD_EVALUASI);
  const [fieldEvaluasiVendorList, setFieldEvaluasiVendorList] = useState(DEFAULT_FIELD_EVALUASI_VENDOR);
  const [periodeEvaluasiPekerjaanList, setPeriodeEvaluasiPekerjaanList] = useState(DEFAULT_PERIODE_EVALUASI);

  const [editMode, setEditMode] = useState(false);
  const [editNama, setEditNama] = useState("");
  const [confirmHapusBrand, setConfirmHapusBrand] = useState(false);
  const [activeTab, setActiveTab] = useState("kalender");
  const [selectedVendorId, setSelectedVendorId] = useState(null);

  const router = useRouter();
  const params = useParams();
  const ptId = params.ptId;
  const brandId = params.brandId;

  useEffect(() => {
    setToday(new Date().toISOString().split("T")[0]);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push("/login"); return; }
      setUser(user);
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPekerjaan(data.pekerjaan || []);
        if (data.prioritasList) setPrioritasList(data.prioritasList);
        if (data.sumberList) setSumberList(data.sumberList);
        if (data.kategoriPekerjaanList) setKategoriPekerjaanList(data.kategoriPekerjaanList);
        if (data.vendorKategoriList) setVendorKategoriList(data.vendorKategoriList);
        if (data.vendorPertanyaanList) setVendorPertanyaanList(data.vendorPertanyaanList);
        if (data.vendorTujuanList) setVendorTujuanList(data.vendorTujuanList);
        if (data.vendorSatuanMoqList) setVendorSatuanMoqList(data.vendorSatuanMoqList);
        if (data.fieldEvaluasiPekerjaanList) setFieldEvaluasiPekerjaanList(data.fieldEvaluasiPekerjaanList);
        if (data.fieldEvaluasiVendorList) setFieldEvaluasiVendorList(data.fieldEvaluasiVendorList);
        if (data.periodeEvaluasiPekerjaanList) setPeriodeEvaluasiPekerjaanList(data.periodeEvaluasiPekerjaanList);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const pt = pekerjaan.find((p) => p.id === ptId);
  const brand = pt?.brands?.find((b) => b.id === brandId);

  useEffect(() => { if (brand) setEditNama(brand.nama); }, [brand]);

  const simpanKeFirestore = async (updatedPekerjaan) => {
    setPekerjaan(updatedPekerjaan);
    await setDoc(doc(db, "users", user.uid), { pekerjaan: updatedPekerjaan }, { merge: true });
  };

  const simpanSettings = async (updates) => {
    await setDoc(doc(db, "users", user.uid), updates, { merge: true });
  };

  const handleTambahKegiatan = async (newKegiatan) => {
    const updated = pekerjaan.map((p) => p.id === ptId ? { ...p, brands: p.brands.map((b) => b.id === brandId ? { ...b, kegiatan: [...(b.kegiatan || []), newKegiatan] } : b) } : p);
    await simpanKeFirestore(updated);
  };

  // Edit kegiatan sekarang cuma punya satu pintu: halaman detail (?edit=1).

  const handleToggleStatusKegiatan = async (kegId) => {
    const updated = pekerjaan.map((p) => p.id === ptId ? { ...p, brands: p.brands.map((b) => b.id === brandId ? { ...b, kegiatan: b.kegiatan.map((k) => k.id === kegId ? { ...k, status: k.status === "selesai" ? "belum" : "selesai", updatedAt: new Date().toISOString() } : k) } : b) } : p);
    await simpanKeFirestore(updated);
  };

  const handleHapusKegiatan = async (kegId) => {
    if (!confirm("Hapus kegiatan ini? Data akan masuk history.")) return;

    // Arsipkan dulu ke history (prinsip: data nggak hilang).
    const keg = brand?.kegiatan?.find((k) => k.id === kegId);
    if (keg) {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      const data = docSnap.data() || {};
      const history = data.pekerjaanHistory || {};
      history[`${keg.tanggal || keg.tanggalMulai}_${keg.id}`] = { ...keg, deletedAt: new Date().toISOString() };
      await setDoc(docRef, { pekerjaanHistory: history }, { merge: true });
    }

    const updated = pekerjaan.map((p) => p.id === ptId ? { ...p, brands: p.brands.map((b) => b.id === brandId ? { ...b, kegiatan: b.kegiatan.filter((k) => k.id !== kegId) } : b) } : p);
    await simpanKeFirestore(updated);
  };

  const handleSimpanNamaBrand = async () => {
    if (!editNama.trim()) return;
    const updated = pekerjaan.map((p) => p.id === ptId ? { ...p, brands: p.brands.map((b) => b.id === brandId ? { ...b, nama: editNama } : b) } : p);
    await simpanKeFirestore(updated);
    setEditMode(false);
  };

  const handleHapusBrand = async () => {
    const updated = pekerjaan.map((p) => p.id === ptId ? { ...p, brands: p.brands.filter((b) => b.id !== brandId) } : p);
    await simpanKeFirestore(updated);
    setConfirmHapusBrand(false);
    router.push(`/dashboard/pekerjaan/${ptId}`);
  };

  const handleAddVendor = async (newVendor) => {
    const updated = pekerjaan.map((p) => p.id === ptId ? { ...p, brands: p.brands.map((b) => b.id === brandId ? { ...b, vendorList: [...(b.vendorList || []), newVendor] } : b) } : p);
    await simpanKeFirestore(updated);
  };

  const handleUpdateVendor = async (updatedVendor) => {
    const updated = pekerjaan.map((p) => p.id === ptId ? { ...p, brands: p.brands.map((b) => b.id === brandId ? { ...b, vendorList: (b.vendorList || []).map((v) => v.id === updatedVendor.id ? updatedVendor : v) } : b) } : p);
    await simpanKeFirestore(updated);
  };

  const handleDeleteVendor = async (vendorId) => {
    const updated = pekerjaan.map((p) => p.id === ptId ? { ...p, brands: p.brands.map((b) => b.id === brandId ? { ...b, vendorList: (b.vendorList || []).filter((v) => v.id !== vendorId) } : b) } : p);
    await simpanKeFirestore(updated);
    setSelectedVendorId(null);
  };

  const handleUpdateLaporan = async (newLaporanData) => {
    const updated = pekerjaan.map((p) => p.id === ptId ? { ...p, brands: p.brands.map((b) => b.id === brandId ? { ...b, laporanData: newLaporanData } : b) } : p);
    await simpanKeFirestore(updated);
  };

  const handleUpdateEvaluasi = async (newEvaluasiData) => {
    const updated = pekerjaan.map((p) => p.id === ptId ? { ...p, brands: p.brands.map((b) => b.id === brandId ? { ...b, evaluasiData: newEvaluasiData } : b) } : p);
    await simpanKeFirestore(updated);
  };

  if (loading) return <div className="p-6">Loading...</div>;

  if (!pt || !brand) {
    return (
      <div className="card bg-white shadow border border-gray-200 max-w-md mx-auto mt-10">
        <div className="card-body p-8 text-center text-gray-400">
          <Tag size={40} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm mb-4">Brand tidak ditemukan.</p>
          <button className="btn btn-primary btn-sm" onClick={() => router.push("/dashboard/pekerjaan")}>← Balik ke Pekerjaan</button>
        </div>
      </div>
    );
  }

  const vendorList = brand.vendorList || [];
  const selectedVendor = selectedVendorId ? vendorList.find((v) => v.id === selectedVendorId) : null;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-sm breadcrumbs mb-4 text-gray-500" data-html2canvas-ignore="true">
        <ul>
          <li><a onClick={() => router.push("/dashboard")} className="cursor-pointer flex items-center gap-1 hover:text-primary"><Home size={14} /> Dashboard</a></li>
          <li><a onClick={() => router.push("/dashboard/pekerjaan")} className="cursor-pointer flex items-center gap-1 hover:text-primary"><Briefcase size={14} /> Pekerjaan</a></li>
          <li><a onClick={() => router.push(`/dashboard/pekerjaan/${ptId}`)} className="cursor-pointer flex items-center gap-1 hover:text-primary"><Building2 size={14} /> {pt.nama}</a></li>
          <li className="flex items-center gap-1"><Tag size={14} /> {brand.nama}</li>
        </ul>
      </div>

      <div className="flex flex-wrap justify-between items-center mb-4 gap-2" data-html2canvas-ignore="true">
        {editMode ? (
          <div className="flex gap-2 items-center flex-1">
            <input type="text" className="input input-bordered text-gray-800 bg-white flex-1 max-w-md" value={editNama} onChange={(e) => setEditNama(e.target.value)} autoFocus />
            <button className="btn btn-primary btn-sm" onClick={handleSimpanNamaBrand}>Simpan</button>
            <button className="btn btn-ghost btn-sm text-gray-700" onClick={() => { setEditMode(false); setEditNama(brand.nama); }}>Batal</button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Tag className="text-primary" size={24} /> {brand.nama}
            </h1>
            <button className="btn btn-ghost btn-xs text-blue-500" onClick={() => setEditMode(true)} title="Edit Nama"><Pencil size={16} /></button>
            <button className="btn btn-ghost btn-xs text-red-500" onClick={() => setConfirmHapusBrand(true)} title="Hapus Brand"><Trash2 size={16} /></button>
          </div>
        )}
      </div>

      {confirmHapusBrand && (
        <div className="bg-red-50 border border-red-200 rounded p-3 mb-4" data-html2canvas-ignore="true">
          <p className="text-sm text-red-700 mb-2">Yakin mau hapus <strong>{brand.nama}</strong>? Semua kegiatan akan hilang.</p>
          <div className="flex gap-2">
            <button className="btn btn-error btn-sm" onClick={handleHapusBrand}>Ya, Hapus</button>
            <button className="btn btn-ghost btn-sm text-gray-700" onClick={() => setConfirmHapusBrand(false)}>Batal</button>
          </div>
        </div>
      )}

      <div className="tabs tabs-boxed bg-white shadow border border-gray-200 mb-4 p-1 w-fit" data-html2canvas-ignore="true">
        <button className={`tab ${activeTab === "kalender" ? "tab-active bg-blue-600 text-white font-semibold" : "text-gray-600"}`} onClick={() => { setActiveTab("kalender"); setSelectedVendorId(null); }}>
          <Calendar size={16} className="mr-2" /> Kalender
        </button>
        <button className={`tab ${activeTab === "vendor" ? "tab-active bg-blue-600 text-white font-semibold" : "text-gray-600"}`} onClick={() => setActiveTab("vendor")}>
          <Factory size={16} className="mr-2" /> Vendor ({vendorList.length})
        </button>
        <button className={`tab ${activeTab === "laporan" ? "tab-active bg-blue-600 text-white font-semibold" : "text-gray-600"}`} onClick={() => setActiveTab("laporan")}>
          <FileText size={16} className="mr-2" /> Laporan
        </button>
        <button className={`tab ${activeTab === "evaluasi" ? "tab-active bg-blue-600 text-white font-semibold" : "text-gray-600"}`} onClick={() => setActiveTab("evaluasi")}>
          <BarChart3 size={16} className="mr-2" /> Evaluasi
        </button>
      </div>

      <div id="export-area">
        <div className="flex justify-end mb-4" data-html2canvas-ignore="true">
          <ExportPDFButton targetId="export-area" fileName={`${brand.nama}_${activeTab}.pdf`} title={`${brand.nama} - ${activeTab}`} />
        </div>

        {activeTab === "kalender" && (
          <KalenderPekerjaan 
            kegiatan={brand.kegiatan || []} 
            onAdd={handleTambahKegiatan} 
            onClickKegiatan={(id) => router.push(`/dashboard/pekerjaan/${ptId}/${brandId}/${id}`)} 
            onEditKegiatan={(keg) => router.push(`/dashboard/pekerjaan/${ptId}/${brandId}/${keg.id}?edit=1`)}
            onDeleteKegiatan={handleHapusKegiatan}
            onToggleStatusKegiatan={handleToggleStatusKegiatan}
            prioritasList={prioritasList} 
            sumberList={sumberList} 
            kategoriList={kategoriPekerjaanList} 
            onUpdateKategoriList={(u) => { setKategoriPekerjaanList(u); simpanSettings({ kategoriPekerjaanList: u }); }} 
            onUpdatePrioritasList={(u) => { setPrioritasList(u); simpanSettings({ prioritasList: u }); }}
            onUpdateSumberList={(u) => { setSumberList(u); simpanSettings({ sumberList: u }); }}
          />
        )}

        {activeTab === "vendor" && (
          selectedVendor ? (
            <VendorDetail vendor={selectedVendor} kategoriVendorList={vendorKategoriList} tujuanKunjunganList={vendorTujuanList} fieldEvaluasiVendorList={fieldEvaluasiVendorList} periodeEvaluasiList={periodeEvaluasiPekerjaanList} onUpdateVendor={handleUpdateVendor} onDeleteVendor={handleDeleteVendor} onBack={() => setSelectedVendorId(null)} />
          ) : (
            <VendorManager vendorList={vendorList} kategoriVendorList={vendorKategoriList} pertanyaanVendorList={vendorPertanyaanList} satuanMoqList={vendorSatuanMoqList} onAddVendor={handleAddVendor} onDeleteVendor={handleDeleteVendor} onClickVendor={setSelectedVendorId} onUpdateKategoriVendor={(u) => { setVendorKategoriList(u); simpanSettings({ vendorKategoriList: u }); }} onUpdatePertanyaanVendor={(u) => { setVendorPertanyaanList(u); simpanSettings({ vendorPertanyaanList: u }); }} onUpdateSatuanMoq={(u) => { setVendorSatuanMoqList(u); simpanSettings({ vendorSatuanMoqList: u }); }} />
          )
        )}

        {activeTab === "laporan" && (
          <LaporanPekerjaan 
            kegiatanList={brand.kegiatan || []} 
            vendorList={vendorList} // <-- TAMBAHAN PROP VENDOR
            laporanData={brand.laporanData || {}} 
            onUpdateLaporan={handleUpdateLaporan} 
            prioritasList={prioritasList} 
            sumberList={sumberList} 
          />
        )}

        {activeTab === "evaluasi" && (
          <EvaluasiPekerjaan kegiatanList={brand.kegiatan || []} laporanData={brand.laporanData || {}} evaluasiData={brand.evaluasiData || {}} vendorList={vendorList} fieldEvaluasiList={fieldEvaluasiPekerjaanList} periodeEvaluasiList={periodeEvaluasiPekerjaanList} fieldEvaluasiVendorList={fieldEvaluasiVendorList} onUpdateEvaluasi={handleUpdateEvaluasi} onUpdateFieldEvaluasi={(u) => { setFieldEvaluasiPekerjaanList(u); simpanSettings({ fieldEvaluasiPekerjaanList: u }); }} onUpdatePeriodeEvaluasi={(u) => { setPeriodeEvaluasiPekerjaanList(u); simpanSettings({ periodeEvaluasiPekerjaanList: u }); }} onUpdateFieldEvaluasiVendor={(u) => { setFieldEvaluasiVendorList(u); simpanSettings({ fieldEvaluasiVendorList: u }); }} />
        )}
      </div>
    </div>
  );
}