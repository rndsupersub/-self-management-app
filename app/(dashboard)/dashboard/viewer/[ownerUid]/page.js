// app/(dashboard)/viewer/[ownerUid]/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import {
  DEFAULT_PRIORITAS,
  DEFAULT_SUMBER,
  DEFAULT_SECTIONS,
  DEFAULT_KATEGORI_KEGIATAN,
  findPT,
  findBrand,
  findKegiatan,
  formatTanggal,
} from "@/lib/pekerjaanData";

export default function ViewerOwnerPage() {
  const params = useParams();
  const ownerUid = params.ownerUid;
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewerData, setViewerData] = useState(null);
  const [ownerData, setOwnerData] = useState(null);
  const [error, setError] = useState("");

  // State navigasi
  const [selectedPT, setSelectedPT] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedKegiatan, setSelectedKegiatan] = useState(null);

  // Data dari owner
  const [pekerjaan, setPekerjaan] = useState([]);
  const [prioritasList, setPrioritasList] = useState(DEFAULT_PRIORITAS);
  const [sumberList, setSumberList] = useState(DEFAULT_SUMBER);
  const [sections, setSections] = useState(DEFAULT_SECTIONS);
  const [kategoriList, setKategoriList] = useState(DEFAULT_KATEGORI_KEGIATAN);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      try {
        // Cek viewer
        const viewerRef = doc(db, "viewers", user.uid);
        const viewerSnap = await getDoc(viewerRef);

        if (!viewerSnap.exists()) {
          router.push("/dashboard");
          return;
        }

        const vData = viewerSnap.data();
        if (!vData.passwordHash) {
          router.push("/login");
          return;
        }

        // Cek apakah viewer punya akses ke owner ini
        const ownerUids = vData.ownerUids || [];
        if (!ownerUids.includes(ownerUid)) {
          setError("Lo nggak punya akses ke owner ini.");
          setLoading(false);
          return;
        }

        setViewerData({ ...vData, _uid: user.uid });

        // Fetch data owner
        const ownerRef = doc(db, "users", ownerUid);
        const ownerSnap = await getDoc(ownerRef);

        if (!ownerSnap.exists()) {
          setError("Owner nggak ketemu.");
          setLoading(false);
          return;
        }

        const oData = ownerSnap.data();
        setOwnerData(oData);

        // Set data
        setPekerjaan(oData.pekerjaan || []);
        if (Array.isArray(oData.prioritasList) && oData.prioritasList.length > 0) {
          setPrioritasList(oData.prioritasList);
        }
        if (Array.isArray(oData.sumberList) && oData.sumberList.length > 0) {
          setSumberList(oData.sumberList);
        }
        if (Array.isArray(oData.sections) && oData.sections.length > 0) {
          setSections(oData.sections);
        }
        if (Array.isArray(oData.kategoriKegiatanList) && oData.kategoriKegiatanList.length > 0) {
          setKategoriList(oData.kategoriKegiatanList);
        }
      } catch (err) {
        console.error("[viewer owner] Error:", err);
        setError("Terjadi error: " + err.message);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router, ownerUid]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const handleBack = () => {
    if (selectedKegiatan) {
      setSelectedKegiatan(null);
    } else if (selectedBrand) {
      setSelectedBrand(null);
    } else if (selectedPT) {
      setSelectedPT(null);
    } else {
      router.push("/viewer");
    }
  };

  // ========== HELPER: FORMAT BADGE ==========
  const getBadgeClass = (warna) => {
    const map = {
      red: "bg-red-100 text-red-700 border-red-300",
      yellow: "bg-yellow-100 text-yellow-700 border-yellow-300",
      blue: "bg-blue-100 text-blue-700 border-blue-300",
      gray: "bg-gray-100 text-gray-700 border-gray-300",
      orange: "bg-orange-100 text-orange-700 border-orange-300",
      purple: "bg-purple-100 text-purple-700 border-purple-300",
      green: "bg-green-100 text-green-700 border-green-300",
      brown: "bg-amber-100 text-amber-700 border-amber-300",
      pink: "bg-pink-100 text-pink-700 border-pink-300",
    };
    return map[warna] || map.gray;
  };

  // ========== RENDER: LOADING ==========
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <p>Loading...</p>
      </div>
    );
  }

  // ========== RENDER: ERROR ==========
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
        <div className="card bg-base-100 shadow max-w-md">
          <div className="card-body text-center">
            <p className="text-4xl mb-2">⚠️</p>
            <p className="font-bold">{error}</p>
            <button className="btn btn-primary mt-3" onClick={() => router.push("/viewer")}>
              ← Kembali
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      {/* NAVBAR */}
      <div className="navbar bg-base-100 shadow px-4">
        <div className="flex-1 flex items-center gap-2">
          <button className="btn btn-ghost btn-sm" onClick={handleBack}>
            ←
          </button>
          <h1 className="text-xl font-bold">
            👁️ {ownerData?.nama || ownerData?.email || "Owner"}
          </h1>
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-sm opacity-70">{viewerData?.nama}</span>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-6 max-w-4xl mx-auto space-y-4">

        {/* ========== LEVEL 1: LIST PT ========== */}
        {!selectedPT && (
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h2 className="card-title mb-2">🏢 Pilih PT</h2>
              {pekerjaan.length === 0 ? (
                <p className="text-sm opacity-60 italic">Belum ada PT.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {pekerjaan.map((pt) => (
                    <button
                      key={pt.id}
                      className="card bg-base-200 hover:bg-base-300 transition cursor-pointer text-left"
                      onClick={() => setSelectedPT(pt)}
                    >
                      <div className="card-body p-4 flex-row items-center gap-3">
                        <span className="text-3xl">🏢</span>
                        <div className="flex-1">
                          <p className="font-bold">{pt.nama}</p>
                          <p className="text-xs opacity-60">
                            {pt.brands?.length || 0} brand
                          </p>
                        </div>
                        <span className="text-2xl">→</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========== LEVEL 2: LIST BRAND ========== */}
        {selectedPT && !selectedBrand && (
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h2 className="card-title mb-2">🏷️ {selectedPT.nama} — Pilih Brand</h2>
              {(!selectedPT.brands || selectedPT.brands.length === 0) ? (
                <p className="text-sm opacity-60 italic">Belum ada brand.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedPT.brands.map((brand) => (
                    <button
                      key={brand.id}
                      className="card bg-base-200 hover:bg-base-300 transition cursor-pointer text-left"
                      onClick={() => setSelectedBrand(brand)}
                    >
                      <div className="card-body p-4 flex-row items-center gap-3">
                        <span className="text-3xl">🏷️</span>
                        <div className="flex-1">
                          <p className="font-bold">{brand.nama}</p>
                          <p className="text-xs opacity-60">
                            {brand.kegiatan?.length || 0} kegiatan
                          </p>
                        </div>
                        <span className="text-2xl">→</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========== LEVEL 3: LIST KEGIATAN ========== */}
        {selectedPT && selectedBrand && !selectedKegiatan && (
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h2 className="card-title mb-2">
                📋 {selectedBrand.nama} — Kegiatan
              </h2>
              {(!selectedBrand.kegiatan || selectedBrand.kegiatan.length === 0) ? (
                <p className="text-sm opacity-60 italic">Belum ada kegiatan.</p>
              ) : (
                <div className="space-y-2">
                  {selectedBrand.kegiatan
                    .slice()
                    .sort((a, b) => {
                      const aTgl = a.tanggalMulai || a.tanggal || "";
                      const bTgl = b.tanggalMulai || b.tanggal || "";
                      return bTgl.localeCompare(aTgl);
                    })
                    .map((keg) => {
                      const kategoriData = kategoriList.find((k) => k.id === keg.kategori);
                      const prioritasData = prioritasList.find((p) => p.id === keg.prioritas);
                      const sumberData = sumberList.find((s) => s.id === keg.sumber);
                      return (
                        <button
                          key={keg.id}
                          className="w-full text-left p-3 rounded border bg-base-200 hover:bg-base-300 border-base-300 transition"
                          onClick={() => setSelectedKegiatan(keg)}
                        >
                          <p className={`font-bold ${keg.status === "selesai" ? "line-through opacity-60" : ""}`}>
                            {keg.judul}
                          </p>
                          <p className="text-xs opacity-60 mt-1">
                            📅 {formatTanggal(keg.tanggal || keg.tanggalMulai, "pendek")}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {kategoriData && (
                              <span className={`text-xs px-2 py-0.5 rounded border ${getBadgeClass(kategoriData.warna)}`}>
                                {kategoriData.label}
                              </span>
                            )}
                            {prioritasData && (
                              <span className={`text-xs px-2 py-0.5 rounded border ${getBadgeClass(prioritasData.warna)}`}>
                                {prioritasData.label}
                              </span>
                            )}
                            {sumberData && (
                              <span className={`text-xs px-2 py-0.5 rounded border ${getBadgeClass(sumberData.warna)}`}>
                                {sumberData.label}
                              </span>
                            )}
                            {keg.status === "selesai" && (
                              <span className="text-xs px-2 py-0.5 rounded border bg-green-100 text-green-700 border-green-300">
                                ✅ Selesai
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========== LEVEL 4: DETAIL KEGIATAN ========== */}
        {selectedKegiatan && (
          <div className="space-y-4">
            {/* Header */}
            <div className="card bg-base-100 shadow">
              <div className="card-body p-4">
                <h1 className="text-2xl font-bold mb-2">{selectedKegiatan.judul}</h1>
                <div className="flex flex-wrap gap-2 mb-2">
                  {prioritasList.find((p) => p.id === selectedKegiatan.prioritas) && (
                    <span className={`text-xs px-2 py-1 rounded border ${getBadgeClass(prioritasList.find((p) => p.id === selectedKegiatan.prioritas)?.warna)}`}>
                      {prioritasList.find((p) => p.id === selectedKegiatan.prioritas)?.label}
                    </span>
                  )}
                  {sumberList.find((s) => s.id === selectedKegiatan.sumber) && (
                    <span className={`text-xs px-2 py-1 rounded border ${getBadgeClass(sumberList.find((s) => s.id === selectedKegiatan.sumber)?.warna)}`}>
                      {sumberList.find((s) => s.id === selectedKegiatan.sumber)?.label}
                    </span>
                  )}
                  <span className={`text-xs px-2 py-1 rounded border ${
                    selectedKegiatan.status === "selesai"
                      ? "bg-green-100 text-green-700 border-green-300"
                      : "bg-gray-100 text-gray-700 border-gray-300"
                  }`}>
                    {selectedKegiatan.status === "selesai" ? "✅ Selesai" : "⏳ Belum Selesai"}
                  </span>
                </div>
                <p className="text-sm opacity-60">
                  📅 {formatTanggal(selectedKegiatan.tanggal || selectedKegiatan.tanggalMulai)}
                </p>
                {selectedKegiatan.catatan && (
                  <p className="text-sm opacity-80 mt-2 italic">
                    💬 {selectedKegiatan.catatan}
                  </p>
                )}
              </div>
            </div>

            {/* Sections */}
            {sections.map((section) => {
              const catatanList = selectedKegiatan.sections?.[section.id] || [];
              return (
                <div key={section.id} className="card bg-base-100 shadow">
                  <div className="card-body p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-base font-bold">{section.label}</h3>
                      <span className="text-xs opacity-50">
                        {catatanList.length} catatan
                      </span>
                    </div>
                    {catatanList.length === 0 ? (
                      <p className="text-sm opacity-40 italic">
                        Belum ada catatan di section ini.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {catatanList.map((cat) => (
                          <div
                            key={cat.id}
                            className="p-2 rounded bg-base-200 border border-base-300"
                          >
                            <p className="text-sm whitespace-pre-wrap">{cat.teks}</p>
                            <p className="text-xs opacity-40 mt-1">
                              {new Date(cat.createdAt).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* GDrive Link */}
            {selectedKegiatan.gdriveUrl && (
              <div className="card bg-base-100 shadow">
                <div className="card-body p-4">
                  <h3 className="text-base font-bold mb-2">📁 Link GDrive</h3>
                  <a
                    href={selectedKegiatan.gdriveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link link-primary text-sm break-all"
                  >
                    {selectedKegiatan.gdriveUrl}
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}