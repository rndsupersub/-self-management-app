// app/(dashboard)/viewer/[ownerUid]/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { DEFAULT_PRIORITAS, DEFAULT_SUMBER, DEFAULT_SECTIONS, DEFAULT_KATEGORI_KEGIATAN, formatTanggal } from "@/lib/pekerjaanData";
import { ArrowLeft, Home, Building2, Tag, ClipboardList, Link as LinkIcon, Calendar, Folder, LogOut, Eye } from "lucide-react";

export default function ViewerOwnerPage() {
  const params = useParams();
  const ownerUid = params.ownerUid;
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewerData, setViewerData] = useState(null);
  const [ownerData, setOwnerData] = useState(null);
  const [error, setError] = useState("");

  const [selectedPT, setSelectedPT] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedKegiatan, setSelectedKegiatan] = useState(null);

  const [pekerjaan, setPekerjaan] = useState([]);
  const [prioritasList, setPrioritasList] = useState(DEFAULT_PRIORITAS);
  const [sumberList, setSumberList] = useState(DEFAULT_SUMBER);
  const [sections, setSections] = useState(DEFAULT_SECTIONS);
  const [kategoriList, setKategoriList] = useState(DEFAULT_KATEGORI_KEGIATAN);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push("/login"); return; }
      setUser(user);

      try {
        const viewerRef = doc(db, "viewers", user.uid);
        const viewerSnap = await getDoc(viewerRef);
        if (!viewerSnap.exists()) { router.push("/dashboard"); return; }
        
        const vData = viewerSnap.data();
        if (!vData.passwordHash) { router.push("/login"); return; }
        setViewerData({ ...vData, _uid: user.uid });

        const ownerRef = doc(db, "users", ownerUid);
        const ownerSnap = await getDoc(ownerRef);
        if (!ownerSnap.exists()) { setError("Owner nggak ketemu."); setLoading(false); return; }

        const oData = ownerSnap.data();
        setOwnerData(oData);
        setPekerjaan(oData.pekerjaan || []);
        if (oData.prioritasList) setPrioritasList(oData.prioritasList);
        if (oData.sumberList) setSumberList(oData.sumberList);
        if (oData.sections) setSections(oData.sections);
        if (oData.kategoriKegiatanList) setKategoriList(oData.kategoriKegiatanList);
      } catch (err) {
        setError("Terjadi error: " + err.message);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router, ownerUid]);

  const handleLogout = async () => { await signOut(auth); router.push("/login"); };
  const handleBack = () => {
    if (selectedKegiatan) setSelectedKegiatan(null);
    else if (selectedBrand) setSelectedBrand(null);
    else if (selectedPT) setSelectedPT(null);
    else router.push("/viewer");
  };

  const getBadgeClass = (warna) => {
    const map = { red: "bg-red-100 text-red-700 border-red-300", yellow: "bg-yellow-100 text-yellow-700 border-yellow-300", blue: "bg-blue-100 text-blue-700 border-blue-300", gray: "bg-gray-100 text-gray-700 border-gray-300", orange: "bg-orange-100 text-orange-700 border-orange-300", purple: "bg-purple-100 text-purple-700 border-purple-300", green: "bg-green-100 text-green-700 border-green-300", brown: "bg-amber-100 text-amber-700 border-amber-300", pink: "bg-pink-100 text-pink-700 border-pink-300" };
    return map[warna] || map.gray;
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500 text-center">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <button className="btn btn-ghost btn-sm" onClick={handleBack}><ArrowLeft size={18} /> Kembali</button>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Eye className="text-secondary" size={24} /> {ownerData?.nama || ownerData?.email}
          </h1>
        </div>
        <div className="flex gap-3 items-center">
          <span className="text-sm font-semibold text-gray-600">{viewerData?.nama}</span>
          <button className="btn btn-ghost btn-sm text-error hover:bg-error/10" onClick={handleLogout}><LogOut size={16} /></button>
        </div>
      </div>

      {/* LEVEL 1: Pilih PT */}
      {!selectedPT && (
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Building2 size={18} /> Pilih PT</h2>
            {pekerjaan.length === 0 ? <p className="text-sm text-gray-400 italic">Belum ada PT.</p> : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pekerjaan.map((pt) => (
                  <button key={pt.id} className="card bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:shadow-md transition cursor-pointer text-left" onClick={() => setSelectedPT(pt)}>
                    <div className="card-body p-4 flex-row items-center gap-3">
                      <Building2 size={24} className="text-primary" />
                      <div className="flex-1">
                        <p className="font-bold text-gray-800">{pt.nama}</p>
                        <p className="text-xs text-gray-500">{pt.brands?.length || 0} brand</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* LEVEL 2: Pilih Brand */}
      {selectedPT && !selectedBrand && (
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Tag size={18} /> {selectedPT.nama} — Pilih Brand</h2>
            {(!selectedPT.brands || selectedPT.brands.length === 0) ? <p className="text-sm text-gray-400 italic">Belum ada brand.</p> : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedPT.brands.map((brand) => (
                  <button key={brand.id} className="card bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:shadow-md transition cursor-pointer text-left" onClick={() => setSelectedBrand(brand)}>
                    <div className="card-body p-4 flex-row items-center gap-3">
                      <Tag size={24} className="text-blue-500" />
                      <div className="flex-1">
                        <p className="font-bold text-gray-800">{brand.nama}</p>
                        <p className="text-xs text-gray-500">{brand.kegiatan?.length || 0} kegiatan</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* LEVEL 3: List Kegiatan */}
      {selectedPT && selectedBrand && !selectedKegiatan && (
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><ClipboardList size={18} /> {selectedBrand.nama} — Kegiatan</h2>
            {(!selectedBrand.kegiatan || selectedBrand.kegiatan.length === 0) ? <p className="text-sm text-gray-400 italic">Belum ada kegiatan.</p> : (
              <div className="space-y-2">
                {selectedBrand.kegiatan.slice().sort((a, b) => (b.tanggalMulai || b.tanggal || "").localeCompare(a.tanggalMulai || a.tanggal || "")).map((keg) => {
                  const kategoriData = kategoriList.find((k) => k.id === keg.kategori);
                  const prioritasData = prioritasList.find((p) => p.id === keg.prioritas);
                  const sumberData = sumberList.find((s) => s.id === keg.sumber);
                  return (
                    <button key={keg.id} className="w-full text-left p-4 rounded-lg border bg-gray-50 hover:bg-gray-100 border-gray-200 transition" onClick={() => setSelectedKegiatan(keg)}>
                      <p className={`font-bold text-gray-800 ${keg.status === "selesai" ? "line-through opacity-60" : ""}`}>{keg.judul}</p>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Calendar size={12} /> {formatTanggal(keg.tanggal || keg.tanggalMulai, "pendek")}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {kategoriData && <span className={`text-[10px] px-2 py-0.5 rounded border ${getBadgeClass(kategoriData.warna)}`}>{kategoriData.label}</span>}
                        {prioritasData && <span className={`text-[10px] px-2 py-0.5 rounded border ${getBadgeClass(prioritasData.warna)}`}>{prioritasData.label}</span>}
                        {sumberData && <span className={`text-[10px] px-2 py-0.5 rounded border ${getBadgeClass(sumberData.warna)}`}>{sumberData.label}</span>}
                        {keg.status === "selesai" && <span className="text-[10px] px-2 py-0.5 rounded border bg-green-100 text-green-700 border-green-300">✅ Selesai</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* LEVEL 4: Detail Kegiatan */}
      {selectedKegiatan && (
        <div className="space-y-4">
          <div className="card bg-white shadow border border-gray-200">
            <div className="card-body p-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">{selectedKegiatan.judul}</h1>
              <div className="flex flex-wrap gap-2 mb-2">
                {prioritasList.find((p) => p.id === selectedKegiatan.prioritas) && <span className={`text-xs px-2 py-1 rounded border ${getBadgeClass(prioritasList.find((p) => p.id === selectedKegiatan.prioritas)?.warna)}`}>{prioritasList.find((p) => p.id === selectedKegiatan.prioritas)?.label}</span>}
                {sumberList.find((s) => s.id === selectedKegiatan.sumber) && <span className={`text-xs px-2 py-1 rounded border ${getBadgeClass(sumberList.find((s) => s.id === selectedKegiatan.sumber)?.warna)}`}>{sumberList.find((s) => s.id === selectedKegiatan.sumber)?.label}</span>}
                <span className={`text-xs px-2 py-1 rounded border ${selectedKegiatan.status === "selesai" ? "bg-green-100 text-green-700 border-green-300" : "bg-gray-100 text-gray-700 border-gray-300"}`}>{selectedKegiatan.status === "selesai" ? "✅ Selesai" : "⏳ Belum Selesai"}</span>
              </div>
              <p className="text-sm text-gray-500 flex items-center gap-1"><Calendar size={14} /> {formatTanggal(selectedKegiatan.tanggal || selectedKegiatan.tanggalMulai)}</p>
              {selectedKegiatan.catatan && <p className="text-sm text-gray-700 mt-2 italic bg-gray-50 p-2 rounded">📝 {selectedKegiatan.catatan}</p>}
            </div>
          </div>

          {sections.map((section) => {
            const catatanList = selectedKegiatan.sections?.[section.id] || [];
            return (
              <div key={section.id} className="card bg-white shadow border border-gray-200">
                <div className="card-body p-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-base font-bold text-gray-800 flex items-center gap-2"><Folder size={16} /> {section.label}</h3>
                    <span className="text-xs text-gray-500">{catatanList.length} catatan</span>
                  </div>
                  {catatanList.length === 0 ? <p className="text-sm text-gray-400 italic">Belum ada catatan di section ini.</p> : (
                    <div className="space-y-2">
                      {catatanList.map((cat) => (
                        <div key={cat.id} className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                          <p className="text-sm text-gray-800 whitespace-pre-wrap">{cat.teks}</p>
                          <p className="text-[10px] text-gray-500 mt-1">{new Date(cat.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {selectedKegiatan.gdriveUrl && (
            <div className="card bg-white shadow border border-gray-200">
              <div className="card-body p-6">
                <h3 className="text-base font-bold text-gray-800 mb-2 flex items-center gap-2"><LinkIcon size={16} /> Link GDrive</h3>
                <a href={selectedKegiatan.gdriveUrl} target="_blank" rel="noopener noreferrer" className="link link-primary text-sm break-all">{selectedKegiatan.gdriveUrl}</a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}