// app/(dashboard)/dashboard/bisnis/[brandId]/page.js
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
import { DEFAULT_BISNIS_BRANDS, DEFAULT_BISNIS_PRIORITAS, DEFAULT_BISNIS_SUMBER, DEFAULT_BISNIS_SECTIONS, DEFAULT_BISNIS_KATEGORI, DEFAULT_BISNIS_VENDOR_KATEGORI, DEFAULT_BISNIS_VENDOR_PERTANYAAN, DEFAULT_BISNIS_VENDOR_TUJUAN, DEFAULT_BISNIS_VENDOR_SATUAN_MOQ, DEFAULT_BISNIS_FIELD_EVALUASI, DEFAULT_BISNIS_FIELD_EVALUASI_VENDOR, DEFAULT_BISNIS_PERIODE_EVALUASI } from "@/lib/bisnisData";
import { Building2, Tag, Pencil, Trash2, Home, Briefcase, Calendar, Factory, FileText, BarChart3, ClipboardList } from "lucide-react";

export default function BisnisBrandPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState("");
  const [brands, setBrands] = useState(DEFAULT_BISNIS_BRANDS);
  
  const [prioritasList, setPrioritasList] = useState(DEFAULT_BISNIS_PRIORITAS);
  const [sumberList, setSumberList] = useState(DEFAULT_BISNIS_SUMBER);
  const [kategoriList, setKategoriList] = useState(DEFAULT_BISNIS_KATEGORI);
  const [vendorKategoriList, setVendorKategoriList] = useState(DEFAULT_BISNIS_VENDOR_KATEGORI);
  const [vendorPertanyaanList, setVendorPertanyaanList] = useState(DEFAULT_BISNIS_VENDOR_PERTANYAAN);
  const [vendorTujuanList, setVendorTujuanList] = useState(DEFAULT_BISNIS_VENDOR_TUJUAN);
  const [vendorSatuanMoqList, setVendorSatuanMoqList] = useState(DEFAULT_BISNIS_VENDOR_SATUAN_MOQ);
  const [fieldEvaluasiList, setFieldEvaluasiList] = useState(DEFAULT_BISNIS_FIELD_EVALUASI);
  const [fieldEvaluasiVendorList, setFieldEvaluasiVendorList] = useState(DEFAULT_BISNIS_FIELD_EVALUASI_VENDOR);
  const [periodeEvaluasiList, setPeriodeEvaluasiList] = useState(DEFAULT_BISNIS_PERIODE_EVALUASI);

  const [editMode, setEditMode] = useState(false);
  const [editNama, setEditNama] = useState("");
  const [confirmHapusBrand, setConfirmHapusBrand] = useState(false);
  const [editingKegiatan, setEditingKegiatan] = useState(null);
  const [editForm, setEditForm] = useState({ judul: "", prioritas: "", sumber: "", catatan: "", tanggal: "" });
  const [activeTab, setActiveTab] = useState("kalender");
  const [selectedVendorId, setSelectedVendorId] = useState(null);

  const router = useRouter();
  const params = useParams();
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
        setBrands(data.bisnisBrands || DEFAULT_BISNIS_BRANDS);
        if (data.bisnisPrioritasList) setPrioritasList(data.bisnisPrioritasList);
        if (data.bisnisSumberList) setSumberList(data.bisnisSumberList);
        if (data.bisnisKategoriList) setKategoriList(data.bisnisKategoriList);
        if (data.bisnisVendorKategoriList) setVendorKategoriList(data.bisnisVendorKategoriList);
        if (data.bisnisVendorPertanyaanList) setVendorPertanyaanList(data.bisnisVendorPertanyaanList);
        if (data.bisnisVendorTujuanList) setVendorTujuanList(data.bisnisVendorTujuanList);
        if (data.bisnisVendorSatuanMoqList) setVendorSatuanMoqList(data.bisnisVendorSatuanMoqList);
        if (data.bisnisFieldEvaluasiList) setFieldEvaluasiList(data.bisnisFieldEvaluasiList);
        if (data.bisnisFieldEvaluasiVendorList) setFieldEvaluasiVendorList(data.bisnisFieldEvaluasiVendorList);
        if (data.bisnisPeriodeEvaluasiList) setPeriodeEvaluasiList(data.bisnisPeriodeEvaluasiList);
      } else {
        await setDoc(docRef, { bisnisBrands: DEFAULT_BISNIS_BRANDS });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const brand = brands.find((b) => b.id === brandId);

  useEffect(() => { if (brand) setEditNama(brand.nama); }, [brand]);

  const simpanBrands = async (updatedBrands) => {
    setBrands(updatedBrands);
    await setDoc(doc(db, "users", user.uid), { bisnisBrands: updatedBrands }, { merge: true });
  };

  const simpanSettings = async (updates) => {
    await setDoc(doc(db, "users", user.uid), updates, { merge: true });
  };

  const updateBrandData = async (updatedBrandData) => {
    await simpanBrands(brands.map((b) => b.id === brandId ? { ...b, ...updatedBrandData, updatedAt: new Date().toISOString() } : b));
  };

  const handleTambahKegiatan = async (newKegiatan) => {
    await updateBrandData({ kegiatan: [...(brand.kegiatan || []), newKegiatan] });
  };

  const handleSimpanEditKegiatan = async () => {
    if (!editForm.judul.trim() || !editingKegiatan) return;
    await updateBrandData({ kegiatan: brand.kegiatan.map((k) => k.id === editingKegiatan.id ? { ...k, ...editForm, updatedAt: new Date().toISOString() } : k) });
    setEditingKegiatan(null);
  };

  const handleHapusKegiatan = async (kegId) => {
    if (!confirm("Hapus kegiatan ini?")) return;
    await updateBrandData({ kegiatan: brand.kegiatan.filter((k) => k.id !== kegId) });
  };

  const handleSimpanNamaBrand = async () => {
    if (!editNama.trim()) return;
    await simpanBrands(brands.map((b) => b.id === brandId ? { ...b, nama: editNama } : b));
    setEditMode(false);
  };

  const handleHapusBrand = async () => {
    await simpanBrands(brands.filter((b) => b.id !== brandId));
    setConfirmHapusBrand(false);
    router.push("/dashboard/bisnis");
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!brand) return <div className="p-6 text-center">Brand tidak ditemukan.</div>;

  const vendorList = brand.vendorList || [];
  const selectedVendor = selectedVendorId ? vendorList.find((v) => v.id === selectedVendorId) : null;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-sm breadcrumbs mb-4 text-gray-500" data-html2canvas-ignore="true">
        <ul>
          <li><a onClick={() => router.push("/dashboard")} className="cursor-pointer flex items-center gap-1 hover:text-primary"><Home size={14} /> Dashboard</a></li>
          <li><a onClick={() => router.push("/dashboard/bisnis")} className="cursor-pointer flex items-center gap-1 hover:text-primary"><Briefcase size={14} /> Bisnis</a></li>
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
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Tag className="text-primary" size={24} /> {brand.nama}</h1>
            <button className="btn btn-ghost btn-xs text-blue-500" onClick={() => setEditMode(true)}><Pencil size={16} /></button>
            <button className="btn btn-ghost btn-xs text-red-500" onClick={() => setConfirmHapusBrand(true)}><Trash2 size={16} /></button>
          </div>
        )}
      </div>

      {confirmHapusBrand && (
        <div className="bg-red-50 border border-red-200 rounded p-3 mb-4" data-html2canvas-ignore="true">
          <p className="text-sm text-red-700 mb-2">Yakin mau hapus <strong>{brand.nama}</strong>?</p>
          <div className="flex gap-2">
            <button className="btn btn-error btn-sm" onClick={handleHapusBrand}>Ya, Hapus</button>
            <button className="btn btn-ghost btn-sm text-gray-700" onClick={() => setConfirmHapusBrand(false)}>Batal</button>
          </div>
        </div>
      )}

      <div className="tabs tabs-boxed bg-white shadow border border-gray-200 mb-4 p-1 w-fit" data-html2canvas-ignore="true">
        <button className={`tab ${activeTab === "kalender" ? "tab-active bg-blue-600 text-white font-semibold" : "text-gray-600"}`} onClick={() => { setActiveTab("kalender"); setSelectedVendorId(null); }}><Calendar size={16} className="mr-2" /> Kalender</button>
        <button className={`tab ${activeTab === "vendor" ? "tab-active bg-blue-600 text-white font-semibold" : "text-gray-600"}`} onClick={() => setActiveTab("vendor")}><Factory size={16} className="mr-2" /> Vendor ({vendorList.length})</button>
        <button className={`tab ${activeTab === "laporan" ? "tab-active bg-blue-600 text-white font-semibold" : "text-gray-600"}`} onClick={() => setActiveTab("laporan")}><FileText size={16} className="mr-2" /> Laporan</button>
        <button className={`tab ${activeTab === "evaluasi" ? "tab-active bg-blue-600 text-white font-semibold" : "text-gray-600"}`} onClick={() => setActiveTab("evaluasi")}><BarChart3 size={16} className="mr-2" /> Evaluasi</button>
      </div>

      <div id="export-area">
        <div className="flex justify-end mb-4" data-html2canvas-ignore="true">
          <ExportPDFButton targetId="export-area" fileName={`Bisnis_${brand.nama}_${activeTab}.pdf`} title={`Bisnis - ${brand.nama}`} />
        </div>

        {activeTab === "kalender" && (
          <>
            <KalenderPekerjaan kegiatan={brand.kegiatan || []} onAdd={handleTambahKegiatan} onClickKegiatan={(id) => router.push(`/dashboard/bisnis/${brandId}/${id}`)} prioritasList={prioritasList} sumberList={sumberList} kategoriList={kategoriList} onUpdateKategoriList={(u) => { setKategoriList(u); simpanSettings({ bisnisKategoriList: u }); }} />
            {brand.kegiatan && brand.kegiatan.length > 0 && (
              <div className="card bg-white shadow border border-gray-200 mt-4">
                <div className="card-body p-4">
                  <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2"><ClipboardList size={18} /> Semua Kegiatan ({brand.kegiatan.length})</h3>
                  <div className="space-y-2">
                    {brand.kegiatan.slice().sort((a, b) => (a.tanggalMulai || a.tanggal || "").localeCompare(b.tanggalMulai || b.tanggal || "")).map((keg) => (
                      <div key={keg.id} className="flex items-start gap-3 p-3 rounded border bg-gray-50 border-gray-200">
                        <div className="flex-1 cursor-pointer" onClick={() => router.push(`/dashboard/bisnis/${brandId}/${keg.id}`)}>
                          <p className={`text-sm font-semibold text-gray-800 ${keg.status === "selesai" ? "line-through opacity-60" : ""}`}>{keg.judul}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><Calendar size={12} /> {keg.tanggal} • {keg.status === "selesai" ? "Selesai" : "Belum"}</p>
                        </div>
                        <div className="flex gap-1" data-html2canvas-ignore="true">
                          <button className="btn btn-ghost btn-xs text-blue-500" onClick={() => { setEditingKegiatan(keg); setEditForm({ judul: keg.judul, prioritas: keg.prioritas, sumber: keg.sumber, catatan: keg.catatan || "", tanggal: keg.tanggal }); }}><Pencil size={14} /></button>
                          <button className="btn btn-ghost btn-xs text-red-500" onClick={() => handleHapusKegiatan(keg.id)}><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "vendor" && (
          selectedVendor ? (
            <VendorDetail vendor={selectedVendor} kategoriVendorList={vendorKategoriList} tujuanKunjunganList={vendorTujuanList} fieldEvaluasiVendorList={fieldEvaluasiVendorList} periodeEvaluasiList={periodeEvaluasiList} onUpdateVendor={(v) => updateBrandData({ vendorList: (brand.vendorList || []).map((item) => item.id === v.id ? v : item) })} onDeleteVendor={(id) => { updateBrandData({ vendorList: (brand.vendorList || []).filter((v) => v.id !== id) }); setSelectedVendorId(null); }} onBack={() => setSelectedVendorId(null)} />
          ) : (
            <VendorManager vendorList={vendorList} kategoriVendorList={vendorKategoriList} pertanyaanVendorList={vendorPertanyaanList} satuanMoqList={vendorSatuanMoqList} onAddVendor={(v) => updateBrandData({ vendorList: [...(brand.vendorList || []), v] })} onDeleteVendor={(id) => updateBrandData({ vendorList: (brand.vendorList || []).filter((v) => v.id !== id) })} onClickVendor={setSelectedVendorId} onUpdateKategoriVendor={(u) => { setVendorKategoriList(u); simpanSettings({ bisnisVendorKategoriList: u }); }} onUpdatePertanyaanVendor={(u) => { setVendorPertanyaanList(u); simpanSettings({ bisnisVendorPertanyaanList: u }); }} onUpdateSatuanMoq={(u) => { setVendorSatuanMoqList(u); simpanSettings({ bisnisVendorSatuanMoqList: u }); }} />
          )
        )}

        {activeTab === "laporan" && (
          <LaporanPekerjaan kegiatanList={brand.kegiatan || []} laporanData={brand.laporanData || {}} onUpdateLaporan={(data) => updateBrandData({ laporanData: data })} prioritasList={prioritasList} sumberList={sumberList} />
        )}

        {activeTab === "evaluasi" && (
          <EvaluasiPekerjaan kegiatanList={brand.kegiatan || []} laporanData={brand.laporanData || {}} evaluasiData={brand.evaluasiData || {}} vendorList={vendorList} fieldEvaluasiList={fieldEvaluasiList} periodeEvaluasiList={periodeEvaluasiList} fieldEvaluasiVendorList={fieldEvaluasiVendorList} onUpdateEvaluasi={(data) => updateBrandData({ evaluasiData: data })} onUpdateFieldEvaluasi={(u) => { setFieldEvaluasiList(u); simpanSettings({ bisnisFieldEvaluasiList: u }); }} onUpdatePeriodeEvaluasi={(u) => { setPeriodeEvaluasiList(u); simpanSettings({ bisnisPeriodeEvaluasiList: u }); }} onUpdateFieldEvaluasiVendor={(u) => { setFieldEvaluasiVendorList(u); simpanSettings({ bisnisFieldEvaluasiVendorList: u }); }} />
        )}
      </div>

      {editingKegiatan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" data-html2canvas-ignore="true">
          <div className="card bg-white shadow-xl w-full max-w-md">
            <div className="card-body p-4">
              <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2"><Pencil size={18} /> Edit Kegiatan</h3>
              <div className="space-y-2">
                <input type="text" className="input input-bordered w-full text-gray-800 bg-white" placeholder="Judul kegiatan" value={editForm.judul} onChange={(e) => setEditForm({ ...editForm, judul: e.target.value })} />
                <div className="flex gap-2">
                  <select className="select select-bordered flex-1 text-gray-800 bg-white" value={editForm.prioritas} onChange={(e) => setEditForm({ ...editForm, prioritas: e.target.value })}>
                    {prioritasList.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                  </select>
                  <select className="select select-bordered flex-1 text-gray-800 bg-white" value={editForm.sumber} onChange={(e) => setEditForm({ ...editForm, sumber: e.target.value })}>
                    {sumberList.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>
                <input type="date" className="input input-bordered w-full text-gray-800 bg-white" value={editForm.tanggal} onChange={(e) => setEditForm({ ...editForm, tanggal: e.target.value })} />
                <textarea className="textarea textarea-bordered w-full text-sm text-gray-800 bg-white" rows="2" placeholder="Catatan" value={editForm.catatan} onChange={(e) => setEditForm({ ...editForm, catatan: e.target.value })} />
              </div>
              <div className="flex gap-2 mt-3">
                <button className="btn btn-primary btn-sm flex-1" onClick={handleSimpanEditKegiatan}>Simpan</button>
                <button className="btn btn-ghost btn-sm text-gray-700" onClick={() => setEditingKegiatan(null)}>Batal</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}