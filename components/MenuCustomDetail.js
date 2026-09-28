// components/MenuCustomDetail.js
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import KalenderBelajar from "@/components/KalenderBelajar";
import BelajarUpload from "@/components/BelajarUpload";
import KaryaMingguan from "@/components/KaryaMingguan";
import { WARNA_OPTIONS, getWarnaStyle, findItem, updateItem, addItem, deleteItem, generateId, getSubKategoriSiblings } from "@/lib/belajarData";

export default function MenuCustomDetail({
  customMenu,
  allCustomMenus,       // array
  onUpdateCustomMenu,   // (menuId, newMenuObj)
  logHarian,
  onUpdateLog,
  targetHarian,
  onUpdateTarget,
  user,
}) {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug || [];
  const path = slug; // [customId, ...rest]

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ nama: "" });
  const [activeTab, setActiveTab] = useState("materi");
  const [showColorPicker, setShowColorPicker] = useState(false);

  const customId = path[0];
  const subPath = path.slice(1); // path tanpa customId

  // Konversi customMenu jadi array untuk findItem (findItem expect array)
  const kategoriArr = allCustomMenus || [];
  const fullPath = path; // path di dalam array allCustomMenus

  // Reset state saat pindah halaman
  useEffect(() => {
    const result = findItem(kategoriArr, fullPath);
    const itm = result?.item || null;
    const lvl = subPath.length;
    const hasParts = itm?.parts && itm.parts.length > 0;
    const hasFitur = itm?.fitur && itm.fitur.length > 0;
    const isGroup = hasParts || hasFitur;
    const isLeaf4Plus = lvl >= 4 && !isGroup;
    if (isLeaf4Plus) setActiveTab("hasil-belajar");
    else setActiveTab("materi");
    setShowColorPicker(false);
    setShowForm(false);
  }, [path.join("/"), customMenu]);

  // Ambil current item
  const result = findItem(kategoriArr, fullPath);
  const item = result?.item || null;
  const level = path.length;
  const subKategoriUtama = path[1] || null;
  const subKategoriSiblings = getSubKategoriSiblings(kategoriArr, customId, subKategoriUtama);
  const punyaKaryaMingguan = customMenu?.fiturKaryaMingguan === true;

  // ========== HANDLER TAMBAH ==========
  const handleTambah = async () => {
    if (!formData.nama.trim() || !item) return;
    const newItem = { id: generateId("item"), nama: formData.nama };
    const lvl = subPath.length;
    if (lvl === 0) newItem.subKategori = [];
    else if (lvl === 1) newItem.tools = [];
    else if (lvl === 2) { newItem.fitur = []; if (punyaKaryaMingguan) newItem.karyaMingguan = []; }
    else { newItem.materi = ""; newItem.gdriveUrl = ""; newItem.catatan = ""; }

    const updatedArr = addItem(kategoriArr, fullPath, newItem);
    const updatedMenu = updatedArr.find((m) => m.id === customId);
    onUpdateCustomMenu(customId, updatedMenu);
    setFormData({ nama: "" });
    setShowForm(false);
  };

  // ========== HANDLER HAPUS ==========
  const handleHapus = async (itemId, e) => {
    e.stopPropagation();
    if (!confirm("Hapus item ini? Semua isi di dalamnya akan hilang.")) return;
    const newPath = [...fullPath, itemId];
    const updatedArr = deleteItem(kategoriArr, newPath);
    const updatedMenu = updatedArr.find((m) => m.id === customId);
    onUpdateCustomMenu(customId, updatedMenu);
  };

  // ========== HANDLER RENAME ==========
  const handleRename = async (itemId, currentNama, e) => {
    e.stopPropagation();
    const newNama = window.prompt("Ganti nama jadi:", currentNama);
    if (!newNama || !newNama.trim() || newNama.trim() === currentNama) return;
    const newPath = [...fullPath, itemId];
    const updatedArr = updateItem(kategoriArr, newPath, { nama: newNama.trim() });
    const updatedMenu = updatedArr.find((m) => m.id === customId);
    onUpdateCustomMenu(customId, updatedMenu);
  };

  // ========== HANDLER UPDATE ITEM ==========
  const handleUpdateItem = async (updatedFields) => {
    const updatedArr = updateItem(kategoriArr, fullPath, updatedFields);
    const updatedMenu = updatedArr.find((m) => m.id === customId);
    onUpdateCustomMenu(customId, updatedMenu);
  };

  // ========== HANDLER WARNA TOOL ==========
  const handleUpdateWarnaTool = async (warnaId) => {
    const updatedArr = updateItem(kategoriArr, fullPath, { warna: warnaId });
    const updatedMenu = updatedArr.find((m) => m.id === customId);
    onUpdateCustomMenu(customId, updatedMenu);
    setShowColorPicker(false);
  };

  // ========== HANDLER PINDAH SUB-KATEGORI ==========
  const handlePindahSubKategori = (subKategoriId) => {
    if (!customId || !subKategoriId) return;
    router.push(`/dashboard/${customId}/${subKategoriId}`);
  };

  // ========== HANDLER LOG ==========
  const handleUpdateLog = async (newLogHarian, meta = {}) => {
    await onUpdateLog(customId, newLogHarian, meta);
  };

  const handleUpdateTarget = async (newTarget) => {
    await onUpdateTarget(customId, newTarget);
  };

  if (!item) {
    return (
      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-8 text-center text-gray-400">
          <p className="text-3xl mb-2">📭</p>
          <p className="text-sm">Menu custom tidak ditemukan.</p>
        </div>
      </div>
    );
  }

  // ========== RENDER ==========
  const renderBreadcrumb = () => {
    const items = [
      { nama: "🏠 Dashboard", path: "/dashboard" },
      { nama: customMenu.nama, path: `/dashboard/${customId}` },
    ];
    let currentPath = `/dashboard/${customId}`;
    subPath.forEach((id, idx) => {
      currentPath += `/${id}`;
      const subResult = findItem(kategoriArr, path.slice(0, idx + 2));
      if (subResult?.item) items.push({ nama: subResult.item.nama, path: currentPath });
    });
    return (
      <div className="text-sm breadcrumbs mb-6">
        <ul>
          {items.map((b, idx) => (
            <li key={idx}>
              {idx < items.length - 1 ? (
                <a onClick={() => router.push(b.path)} className="cursor-pointer">{b.nama}</a>
              ) : (
                <span>{b.nama}</span>
              )}
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
          const subPathJoin = [...path, sub.id].join("/");
          return (
            <div
              key={sub.id}
              className="card bg-white shadow border border-gray-200 hover:shadow-lg transition cursor-pointer"
              onClick={() => router.push(`/dashboard/${subPathJoin}`)}
            >
              <div className="card-body p-4">
                <div className="flex justify-between items-start gap-2">
                  <h2 className="card-title text-base text-gray-800 flex-1">{sub.nama}</h2>
                  <div className="flex gap-1 shrink-0">
                    <button
                      className="btn btn-ghost btn-xs text-blue-500"
                      onClick={(e) => handleRename(sub.id, sub.nama, e)}
                      title="Rename"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn btn-ghost btn-xs text-red-500"
                      onClick={(e) => handleHapus(sub.id, e)}
                      title="Hapus"
                    >
                      🗑️
                    </button>
                  </div>
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
        <button
          key={t.id}
          className={`tab ${activeTab === t.id ? "tab-active bg-blue-600 text-white" : ""}`}
          onClick={() => setActiveTab(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );

  // ========== RENDER CONTENT PER LEVEL ==========
  const renderContent = () => {
    // LEVEL 1 (subPath.length === 0): root custom menu → list sub-kategori
    if (subPath.length === 0) {
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
                <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
                  + Tambah Sub-kategori
                </button>
              </div>
              {renderList(item.subKategori || [])}
            </>
          )}
          {activeTab === "kalender" && (
            <KalenderBelajar
              kategoriId={customId}
              subKategoriId=""
              kategoriData={kategoriArr}
              logHarian={logHarian}
              targetHarian={targetHarian}
              onUpdateLog={handleUpdateLog}
              onUpdateTarget={handleUpdateTarget}
              subKategoriSiblings={subKategoriSiblings}
              onPindahSubKategori={handlePindahSubKategori}
            />
          )}
        </>
      );
    }

    // LEVEL 2 (subPath.length === 1): list tools
    if (subPath.length === 1) {
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
                <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
                  + Tambah Tool
                </button>
              </div>
              {renderList(item.tools || [])}
            </>
          )}
          {activeTab === "kalender" && (
            <KalenderBelajar
              kategoriId={customId}
              subKategoriId={subKategoriUtama}
              kategoriData={kategoriArr}
              logHarian={logHarian}
              targetHarian={targetHarian}
              onUpdateLog={handleUpdateLog}
              onUpdateTarget={handleUpdateTarget}
              subKategoriSiblings={subKategoriSiblings}
              onPindahSubKategori={handlePindahSubKategori}
            />
          )}
        </>
      );
    }

    // LEVEL 3 (subPath.length === 2): list fitur
    if (subPath.length === 2) {
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
                    <button
                      className="btn btn-ghost btn-xs text-gray-600"
                      onClick={() => setShowColorPicker(!showColorPicker)}
                    >
                      🎨
                    </button>
                  </div>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
                  + Tambah Fitur
                </button>
              </div>
              {showColorPicker && (
                <div className="card bg-white shadow border border-blue-300 mb-4">
                  <div className="card-body p-4">
                    <p className="text-xs font-semibold text-blue-700 mb-2">
                      🎨 Pilih Warna untuk Tool "{item.nama}"
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {WARNA_OPTIONS.map((w) => (
                        <button
                          key={w.id}
                          className={`w-8 h-8 rounded ${w.bg} border-2 ${
                            warnaTool === w.id ? "border-gray-800 ring-2 ring-gray-400" : "border-white"
                          }`}
                          onClick={() => handleUpdateWarnaTool(w.id)}
                          title={w.label}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {renderList(item.fitur || [])}
              {punyaKaryaMingguan && (
                <div className="mt-6">
                  <KaryaMingguan
                    karyaMingguan={item.karyaMingguan || []}
                    onUpdate={(newKarya) => handleUpdateItem({ karyaMingguan: newKarya })}
                  />
                </div>
              )}
            </>
          )}
          {activeTab === "kalender" && (
            <KalenderBelajar
              kategoriId={customId}
              subKategoriId={subKategoriUtama}
              kategoriData={kategoriArr}
              logHarian={logHarian}
              targetHarian={targetHarian}
              onUpdateLog={handleUpdateLog}
              onUpdateTarget={handleUpdateTarget}
              subKategoriSiblings={subKategoriSiblings}
              onPindahSubKategori={handlePindahSubKategori}
            />
          )}
        </>
      );
    }

    // LEVEL 4+
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
            <KalenderBelajar
              kategoriId={customId}
              subKategoriId={subKategoriUtama}
              kategoriData={kategoriArr}
              logHarian={logHarian}
              targetHarian={targetHarian}
              onUpdateLog={handleUpdateLog}
              onUpdateTarget={handleUpdateTarget}
              subKategoriSiblings={subKategoriSiblings}
              onPindahSubKategori={handlePindahSubKategori}
            />
          )}
        </>
      );
    }

    // LEAF
    return (
      <>
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <p className="text-xs text-gray-500 italic">
            📂 Ini halaman leaf. Mau tambah sub-fitur di sini?
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
            kategoriId={customId}
            kategoriData={kategoriArr}
            logHarian={logHarian}
            onUpdateLog={handleUpdateLog}
            today={new Date().toISOString().split("T")[0]}
            mode="hasil-belajar"
          />
        )}
        {activeTab === "kalender" && (
          <KalenderBelajar
            kategoriId={customId}
            subKategoriId={subKategoriUtama}
            kategoriData={kategoriArr}
            logHarian={logHarian}
            targetHarian={targetHarian}
            onUpdateLog={handleUpdateLog}
            onUpdateTarget={handleUpdateTarget}
            subKategoriSiblings={subKategoriSiblings}
            onPindahSubKategori={handlePindahSubKategori}
          />
        )}
      </>
    );
  };

  return (
    <div>
      {renderBreadcrumb()}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{item.nama}</h1>
      </div>
      {showForm && (
        <div className="card bg-white shadow border border-gray-200 mb-4">
          <div className="card-body p-4">
            <p className="text-xs font-semibold text-blue-700 mb-2">✏️ Tambah item baru</p>
            <input
              type="text"
              className="input input-bordered w-full text-gray-800 bg-white"
              placeholder="Nama item"
              value={formData.nama}
              onChange={(e) => setFormData({ nama: e.target.value })}
              autoFocus
            />
            <div className="flex gap-2 mt-3">
              <button className="btn btn-primary btn-sm flex-1" onClick={handleTambah}>
                ➕ Tambah
              </button>
              <button
                className="btn btn-ghost btn-sm text-gray-700"
                onClick={() => setShowForm(false)}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
      {renderContent()}
    </div>
  );
}