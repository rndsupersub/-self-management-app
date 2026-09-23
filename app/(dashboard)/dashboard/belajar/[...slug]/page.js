// app/(dashboard)/dashboard/belajar/[...slug]/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Sidebar from "@/components/Sidebar";
import BelajarUpload from "@/components/BelajarUpload";
import KaryaMingguan from "@/components/KaryaMingguan";
import KalenderBelajar from "@/components/KalenderBelajar";
import { DEFAULT_ACTIVITIES } from "@/lib/defaultData";
import {
  DEFAULT_KATEGORI,
  DEFAULT_TARGET_HARIAN,
  WARNA_OPTIONS,
  findItem,
  updateItem,
  addItem,
  deleteItem,
  generateId,
  kategoriPunyaKaryaMingguan,
  syncLogToMateri,
  getWarnaStyle,
  getSubKategoriSiblings,
} from "@/lib/belajarData";

export default function BelajarDetailPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState("");
  const [activities, setActivities] = useState(DEFAULT_ACTIVITIES);
  const [kategori, setKategori] = useState(DEFAULT_KATEGORI);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ nama: "" });
  const [activeTab, setActiveTab] = useState("materi");
  const [logHarian, setLogHarian] = useState({});
  const [targetHarian, setTargetHarian] = useState(DEFAULT_TARGET_HARIAN);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const router = useRouter();
  const params = useParams();
  const slug = params.slug || [];
  const path = slug;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push("/login"); return; }
      setUser(user);
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.activities && Array.isArray(data.activities)) setActivities(data.activities);
        else { await setDoc(docRef, { activities: DEFAULT_ACTIVITIES }, { merge: true }); setActivities(DEFAULT_ACTIVITIES); }

        if (data.belajar && Array.isArray(data.belajar.kategori)) setKategori(data.belajar.kategori);
        else { await setDoc(docRef, { belajar: { kategori: DEFAULT_KATEGORI } }, { merge: true }); setKategori(DEFAULT_KATEGORI); }

        if (data.belajarLogHarian && typeof data.belajarLogHarian === "object" && !Array.isArray(data.belajarLogHarian)) setLogHarian(data.belajarLogHarian);
        else { await setDoc(docRef, { belajarLogHarian: {} }, { merge: true }); setLogHarian({}); }

        if (data.belajarTargetHarian && typeof data.belajarTargetHarian === "object" && !Array.isArray(data.belajarTargetHarian)) setTargetHarian({ ...DEFAULT_TARGET_HARIAN, ...data.belajarTargetHarian });
        else { await setDoc(docRef, { belajarTargetHarian: DEFAULT_TARGET_HARIAN }, { merge: true }); setTargetHarian(DEFAULT_TARGET_HARIAN); }
      } else {
        await setDoc(docRef, {
          activities: DEFAULT_ACTIVITIES,
          belajar: { kategori: DEFAULT_KATEGORI },
          belajarLogHarian: {},
          belajarTargetHarian: DEFAULT_TARGET_HARIAN,
        });
        setActivities(DEFAULT_ACTIVITIES);
        setKategori(DEFAULT_KATEGORI);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setToday(new Date().toISOString().split("T")[0]);
  }, []);

  // Reset activeTab tiap path berubah
  useEffect(() => {
    const result = findItem(kategori, path);
    const itm = result?.item || null;
    const lvl = path.length;
    const hasParts = itm?.parts && itm.parts.length > 0;
    const hasFitur = itm?.fitur && itm.fitur.length > 0;
    const isGroup = hasParts || hasFitur;
    const isLeaf4 = lvl === 4 && !isGroup;
    const isLeaf5Plus = lvl >= 5 && !isGroup;
    const isLeaf = isLeaf4 || isLeaf5Plus;

    if (isLeaf) setActiveTab("hasil-belajar");
    else setActiveTab("materi");

    setShowColorPicker(false);
    setShowForm(false);
  }, [path.join("/"), kategori]);

  const simpanKategori = async (newKategori) => {
    setKategori(newKategori);
    if (!user) return;
    const docRef = doc(db, "users", user.uid);
    await setDoc(docRef, { belajar: { kategori: newKategori } }, { merge: true });
  };

  const handleUpdateLog = async (newLogHarian, meta = {}) => {
    const { action, log } = meta;
    let newKategori = kategori;
    if ((action === "add" || action === "edit") && log && log.sumber !== "materi") {
      newKategori = syncLogToMateri(kategori, log);
    }
    setLogHarian(newLogHarian);
    if (newKategori !== kategori) setKategori(newKategori);
    if (!user) return;
    const docRef = doc(db, "users", user.uid);
    const updates = { belajarLogHarian: newLogHarian };
    if (newKategori !== kategori) updates.belajar = { kategori: newKategori };
    await setDoc(docRef, updates, { merge: true });
  };

  const handleUpdateTarget = async (newTarget) => {
    setTargetHarian(newTarget);
    if (!user) return;
    const docRef = doc(db, "users", user.uid);
    await setDoc(docRef, { belajarTargetHarian: newTarget }, { merge: true });
  };

  const result = findItem(kategori, path);
  const item = result?.item || null;
  const level = path.length;
  const kategoriUtama = path[0] || null;
  const subKategoriUtama = path[1] || null;
  const punyaKaryaMingguan = kategoriPunyaKaryaMingguan(kategoriUtama);

  const subKategoriSiblings = getSubKategoriSiblings(kategori, kategoriUtama, subKategoriUtama);

  const handlePindahSubKategori = (subKategoriId) => {
    if (!kategoriUtama || !subKategoriId) return;
    router.push(`/dashboard/belajar/${kategoriUtama}/${subKategoriId}`);
  };

  const handleTambah = async () => {
    if (!formData.nama.trim() || !item) return;
    const newItem = { id: generateId("item"), nama: formData.nama };
    if (level === 1) newItem.subKategori = [];
    else if (level === 2) newItem.tools = [];
    else if (level === 3) { newItem.fitur = []; if (punyaKaryaMingguan) newItem.karyaMingguan = []; }
    else { newItem.materi = ""; newItem.gdriveUrl = ""; newItem.catatan = ""; }
    const newKategori = addItem(kategori, path, newItem);
    await simpanKategori(newKategori);
    setFormData({ nama: "" });
    setShowForm(false);
  };

  const handleHapus = async (itemId, e) => {
    e.stopPropagation();
    if (!confirm("Hapus item ini? Semua isi di dalamnya akan hilang.")) return;
    const newPath = [...path, itemId];
    const newKategori = deleteItem(kategori, newPath);
    await simpanKategori(newKategori);
  };

  const handleUpdateItem = async (updatedFields) => {
    const newKategori = updateItem(kategori, path, updatedFields);
    await simpanKategori(newKategori);
  };

  const handleUpdateWarnaTool = async (warnaId) => {
    const newKategori = updateItem(kategori, path, { warna: warnaId });
    await simpanKategori(newKategori);
    setShowColorPicker(false);
  };

  const handleLogout = async () => { await signOut(auth); router.push("/login"); };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  if (!item) {
    return (
      <div className="h-screen flex flex-col bg-base-200">
        <div className="navbar bg-base-100 shadow px-4">
          <div className="flex-1"><h1 className="text-xl font-bold">🌙 Self Management</h1></div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="card bg-white shadow border border-gray-200">
            <div className="card-body p-8 text-center text-gray-400">
              <p className="text-3xl mb-2">📚</p>
              <p className="text-sm mb-4">Item tidak ditemukan.</p>
              <button className="btn btn-primary btn-sm" onClick={() => router.push("/dashboard/belajar")}>
                ← Balik ke Belajar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderBreadcrumb = () => {
    const items = [
      { id: null, nama: "🏠 Dashboard", path: "/dashboard" },
      { id: null, nama: "📚 Belajar", path: "/dashboard/belajar" },
    ];
    let currentPath = "/dashboard/belajar";
    path.forEach((id, idx) => {
      currentPath += `/${id}`;
      const subResult = findItem(kategori, path.slice(0, idx + 1));
      if (subResult?.item) items.push({ id, nama: subResult.item.nama, path: currentPath });
    });
    return (
      <div className="text-sm breadcrumbs mb-6">
        <ul>
          {items.map((b, idx) => (
            <li key={idx}>
              {idx < items.length - 1 ? (
                <a onClick={() => router.push(b.path)} className="cursor-pointer">{b.nama}</a>
              ) : (<span>{b.nama}</span>)}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderList = (items) => {
    if (!items || items.length === 0) {
      return (
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-8 text-center text-gray-400">
            <p className="text-3xl mb-2">📭</p>
            <p className="text-sm">Belum ada item di sini. Klik "+ Tambah" untuk mulai.</p>
          </div>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((sub) => {
          const subPath = [...path, sub.id].join("/");
          return (
            <div key={sub.id} className="card bg-white shadow border border-gray-200 hover:shadow-lg transition cursor-pointer" onClick={() => router.push(`/dashboard/belajar/${subPath}`)}>
              <div className="card-body p-4">
                <div className="flex justify-between items-start">
                  <h2 className="card-title text-base text-gray-800">{sub.nama}</h2>
                  <button className="btn btn-ghost btn-xs text-red-500" onClick={(e) => handleHapus(sub.id, e)} title="Hapus">🗑️</button>
                </div>
                <div className="card-actions justify-end mt-2">
                  <span className="text-gray-400 text-sm">Buka →</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderTabs = (tabs) => (
    <div className="tabs tabs-boxed bg-white shadow border border-gray-200 mb-4 p-1 w-fit">
      {tabs.map((t) => (
        <button key={t.id} className={`tab ${activeTab === t.id ? "tab-active bg-blue-600 text-white" : ""}`} onClick={() => setActiveTab(t.id)}>
          {t.label}
        </button>
      ))}
    </div>
  );

  const renderContent = () => {
    // LEVEL 1
    if (level === 1) {
      return (
        <>
          {renderTabs([
            { id: "materi", label: "📚 Materi" },
            { id: "kalender", label: "📅 Kalender" },
          ])}
          {activeTab === "materi" && (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800">📁 Sub-kategori</h2>
                <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>+ Tambah Sub-kategori</button>
              </div>
              {renderList(item.subKategori || [])}
            </>
          )}
          {activeTab === "kalender" && (
            <KalenderBelajar kategoriId={kategoriUtama} subKategoriId="" kategoriData={kategori} logHarian={logHarian} targetHarian={targetHarian} onUpdateLog={handleUpdateLog} onUpdateTarget={handleUpdateTarget} subKategoriSiblings={subKategoriSiblings} onPindahSubKategori={handlePindahSubKategori} />
          )}
        </>
      );
    }

    // LEVEL 2
    if (level === 2) {
      return (
        <>
          {renderTabs([
            { id: "materi", label: "📚 Materi" },
            { id: "kalender", label: "📅 Kalender" },
          ])}
          {activeTab === "materi" && (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800">🛠️ Tools</h2>
                <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>+ Tambah Tool</button>
              </div>
              {renderList(item.tools || [])}
            </>
          )}
          {activeTab === "kalender" && (
            <KalenderBelajar kategoriId={kategoriUtama} subKategoriId={subKategoriUtama} kategoriData={kategori} logHarian={logHarian} targetHarian={targetHarian} onUpdateLog={handleUpdateLog} onUpdateTarget={handleUpdateTarget} subKategoriSiblings={subKategoriSiblings} onPindahSubKategori={handlePindahSubKategori} />
          )}
        </>
      );
    }

    // LEVEL 3
    if (level === 3) {
      const warnaTool = item.warna || "gray";
      const style = getWarnaStyle(warnaTool);
      return (
        <>
          {renderTabs([
            { id: "materi", label: "📚 Materi" },
            { id: "kalender", label: "📅 Kalender" },
          ])}
          {activeTab === "materi" && (
            <>
              <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-gray-800">📚 Fitur</h2>
                  <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded px-2 py-1">
                    <span className={`w-3 h-3 rounded-full ${style.bg}`} />
                    <span className="text-xs text-gray-500">Warna bar</span>
                    <button className="btn btn-ghost btn-xs text-gray-600" onClick={() => setShowColorPicker(!showColorPicker)} title="Ubah warna tool">🎨</button>
                  </div>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>+ Tambah Fitur</button>
              </div>
              {showColorPicker && (
                <div className="card bg-white shadow border border-blue-300 mb-4">
                  <div className="card-body p-4">
                    <p className="text-xs font-semibold text-blue-700 mb-2">🎨 Pilih Warna untuk Tool "{item.nama}"</p>
                    <p className="text-xs text-gray-500 mb-3">Warna ini dipakai buat bar di kalender belajar.</p>
                    <div className="flex flex-wrap gap-2">
                      {WARNA_OPTIONS.map((w) => (
                        <button key={w.id} className={`w-8 h-8 rounded ${w.bg} border-2 ${warnaTool === w.id ? "border-gray-800 ring-2 ring-gray-400" : "border-white"}`} onClick={() => handleUpdateWarnaTool(w.id)} title={w.label} />
                      ))}
                    </div>
                    <div className="flex justify-end mt-3">
                      <button className="btn btn-ghost btn-xs text-gray-600" onClick={() => setShowColorPicker(false)}>Tutup</button>
                    </div>
                  </div>
                </div>
              )}
              {renderList(item.fitur || [])}
              {punyaKaryaMingguan && (
                <div className="mt-6">
                  <KaryaMingguan karyaMingguan={item.karyaMingguan || []} onUpdate={(newKarya) => { handleUpdateItem({ karyaMingguan: newKarya }); }} />
                </div>
              )}
            </>
          )}
          {activeTab === "kalender" && (
            <KalenderBelajar kategoriId={kategoriUtama} subKategoriId={subKategoriUtama} kategoriData={kategori} logHarian={logHarian} targetHarian={targetHarian} onUpdateLog={handleUpdateLog} onUpdateTarget={handleUpdateTarget} subKategoriSiblings={subKategoriSiblings} onPindahSubKategori={handlePindahSubKategori} />
          )}
        </>
      );
    }

    // LEVEL 4+
    if (level >= 4) {
      const hasParts = item.parts && item.parts.length > 0;
      const hasFitur = item.fitur && item.fitur.length > 0;
      const isGroup = hasParts || hasFitur;

      if (isGroup) {
        const isParts = hasParts;
        const childrenList = isParts ? item.parts : item.fitur;
        return (
          <>
            {renderTabs([
              { id: "materi", label: "📚 Materi" },
              { id: "kalender", label: "📅 Kalender" },
            ])}
            {activeTab === "materi" && (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-gray-800">{isParts ? "📹 Part" : "📚 Fitur"}</h2>
                  <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
                    {isParts ? "+ Tambah Part" : "+ Tambah Fitur"}
                  </button>
                </div>
                {renderList(childrenList)}
              </>
            )}
            {activeTab === "kalender" && (
              <KalenderBelajar kategoriId={kategoriUtama} subKategoriId={subKategoriUtama} kategoriData={kategori} logHarian={logHarian} targetHarian={targetHarian} onUpdateLog={handleUpdateLog} onUpdateTarget={handleUpdateTarget} subKategoriSiblings={subKategoriSiblings} onPindahSubKategori={handlePindahSubKategori} />
            )}
          </>
        );
      }

      // LEAF: bisa nambah anak + tab Hasil Belajar | Kalender
      return (
        <>
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <p className="text-xs text-gray-500 italic">
              📂 Ini halaman leaf. Mau tambah sub-fitur di sini? Klik tombol →
            </p>
            <button className="btn btn-outline btn-xs" onClick={() => setShowForm(!showForm)}>
              + Tambah Fitur
            </button>
          </div>
          {renderTabs([
            { id: "hasil-belajar", label: "📝 Hasil Belajar" },
            { id: "kalender", label: "📅 Kalender" },
          ])}
          {activeTab === "hasil-belajar" && (
            <BelajarUpload
              item={item}
              onUpdate={handleUpdateItem}
              path={path}
              kategoriId={kategoriUtama}
              kategoriData={kategori}
              logHarian={logHarian}
              onUpdateLog={handleUpdateLog}
              today={today}
              mode="hasil-belajar"
            />
          )}
          {activeTab === "kalender" && (
            <KalenderBelajar kategoriId={kategoriUtama} subKategoriId={subKategoriUtama} kategoriData={kategori} logHarian={logHarian} targetHarian={targetHarian} onUpdateLog={handleUpdateLog} onUpdateTarget={handleUpdateTarget} subKategoriSiblings={subKategoriSiblings} onPindahSubKategori={handlePindahSubKategori} />
          )}
        </>
      );
    }
  };

  return (
    <div className="h-screen flex flex-col bg-base-200">
      <div className="navbar bg-base-100 shadow px-4">
        <div className="flex-1"><h1 className="text-xl font-bold">🌙 Self Management</h1></div>
        <div className="flex gap-2 items-center">
          <span className="text-sm font-mono">{today}</span>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <div className={`${sidebarCollapsed ? "w-12" : "w-64"} transition-all duration-300 bg-base-100`}>
          <Sidebar activities={activities} collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {renderBreadcrumb()}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">{item.nama}</h1>
          </div>
          {showForm && (
            <div className="card bg-white shadow border border-gray-200 mb-4">
              <div className="card-body p-4">
                <p className="text-xs font-semibold text-blue-700 mb-2">✏️ Tambah item baru</p>
                <input type="text" className="input input-bordered w-full text-gray-800 bg-white" placeholder="Nama item" value={formData.nama} onChange={(e) => setFormData({ nama: e.target.value })} autoFocus />
                <div className="flex gap-2 mt-3">
                  <button className="btn btn-primary btn-sm flex-1" onClick={handleTambah}>➕ Tambah</button>
                  <button className="btn btn-ghost btn-sm text-gray-700" onClick={() => setShowForm(false)}>Batal</button>
                </div>
              </div>
            </div>
          )}
          {renderContent()}
        </div>
      </div>
    </div>
  );
}