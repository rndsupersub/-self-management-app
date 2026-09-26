// components/MenuManager.js
"use client";
import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableRow({ menu, onRename, onHide, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: menu.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 bg-base-200 p-2 rounded">
      <span {...attributes} {...listeners} className="cursor-grab select-none px-1" title="Geser untuk reorder">☰</span>
      <span className="flex-1 text-sm truncate">{menu.label}</span>
      {menu.required && <span className="text-xs badge badge-ghost">🔒</span>}
      <button className="btn btn-ghost btn-xs" onClick={() => onRename(menu)} title="Rename">✏️</button>
      {!menu.required && (
        <>
          <button className="btn btn-ghost btn-xs" onClick={() => onHide(menu)} title="Sembunyikan">👁️</button>
          <button className="btn btn-ghost btn-xs text-error" onClick={() => onDelete(menu)} title="Hapus">🗑️</button>
        </>
      )}
    </div>
  );
}

export default function MenuManager({ menus = [], activities = [], user, onUpdate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState("aktif");
  const [localMenus, setLocalMenus] = useState(menus);
  const [arsip, setArsip] = useState([]);
  const [toast, setToast] = useState(null);
  const [customName, setCustomName] = useState("");
  const [customIcon, setCustomIcon] = useState("📌");

  useEffect(() => { setLocalMenus(menus); }, [menus]);

  useEffect(() => {
    if (!user?.uid) return;
    (async () => {
      const { doc, getDoc } = await import("firebase/firestore");
      const { db } = await import("@/lib/firebase");
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) setArsip(snap.data().menusArsip || []);
    })();
  }, [user?.uid]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  async function saveArsip(newArsip) {
    setArsip(newArsip);
    if (!user) return;
    const { doc, setDoc } = await import("firebase/firestore");
    const { db } = await import("@/lib/firebase");
    await setDoc(doc(db, "users", user.uid), { menusArsip: newArsip }, { merge: true });
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (e) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = localMenus.findIndex((m) => m.id === active.id);
    const newIndex = localMenus.findIndex((m) => m.id === over.id);
    const before = [...localMenus];
    const newOrder = arrayMove(localMenus, oldIndex, newIndex).map((m, i) => ({ ...m, order: i }));
    setLocalMenus(newOrder);
    onUpdate(newOrder, arsip);
    setToast({ msg: "Urutan menu diubah", undoFn: () => { setLocalMenus(before); onUpdate(before, arsip); } });
  };

  const handleRename = (menu) => {
    const newName = window.prompt("Ganti nama menu jadi:", menu.label);
    if (!newName || !newName.trim() || newName.trim() === menu.label) return;
    const before = [...localMenus];
    const updated = localMenus.map((m) => m.id === menu.id ? { ...m, label: newName.trim() } : m);
    setLocalMenus(updated);
    onUpdate(updated, arsip);
    setToast({ msg: `"${menu.label}" → "${newName.trim()}"`, undoFn: () => { setLocalMenus(before); onUpdate(before, arsip); } });
  };

  const handleHide = (menu) => {
    const before = [...localMenus];
    const updated = localMenus.map((m) => m.id === menu.id ? { ...m, visible: false } : m);
    setLocalMenus(updated);
    onUpdate(updated, arsip);
    setToast({ msg: `"${menu.label}" disembunyikan`, undoFn: () => { setLocalMenus(before); onUpdate(before, arsip); } });
  };

  const handleShow = (menu) => {
    const updated = localMenus.map((m) => m.id === menu.id ? { ...m, visible: true } : m);
    setLocalMenus(updated);
    onUpdate(updated, arsip);
  };

  const handleDelete = (menu) => {
    if (!confirm(`Hapus menu "${menu.label}"? Bisa di-restore dari tab Arsip.`)) return;
    const before = [...localMenus];
    const beforeArsip = [...arsip];
    const updated = localMenus.filter((m) => m.id !== menu.id);
    const newArsip = [...arsip, { ...menu, deletedAt: new Date().toISOString() }];
    setLocalMenus(updated);
    saveArsip(newArsip);
    onUpdate(updated, newArsip);
    setToast({ msg: `"${menu.label}" dipindah ke Arsip`, undoFn: () => { setLocalMenus(before); saveArsip(beforeArsip); onUpdate(before, beforeArsip); } });
  };

  const handleRestore = (menu) => {
    const newArsip = arsip.filter((m) => m.id !== menu.id);
    const restored = { ...menu, visible: true, order: localMenus.length };
    delete restored.deletedAt;
    const updated = [...localMenus, restored];
    setLocalMenus(updated);
    saveArsip(newArsip);
    onUpdate(updated, newArsip);
    setToast({ msg: `"${menu.label}" dipulihkan` });
  };

  const handleReset = async () => {
    if (!confirm("Reset semua menu ke default?\n\nPerubahan (rename, hide, hapus, reorder) akan hilang. Menu custom juga hilang.")) return;
    const { DEFAULT_MENUS } = await import("@/lib/defaultData");
    const fresh = DEFAULT_MENUS.map((m) => ({ ...m }));
    setLocalMenus(fresh);
    onUpdate(fresh, arsip);
    setToast({ msg: "Menu di-reset ke default" });
  };

  const handleAddCustom = () => {
    if (!customName.trim()) return;
    const id = `custom_${Date.now()}`;
    const newMenu = {
      id,
      label: `${customIcon} ${customName.trim()}`,
      type: "custom",
      required: false,
      visible: true,
      order: localMenus.length,
    };
    const updated = [...localMenus, newMenu];
    setLocalMenus(updated);
    onUpdate(updated, arsip);
    setCustomName("");
    setCustomIcon("📌");
    setToast({ msg: `Menu "${customName.trim()}" ditambahkan` });
  };

  const aktifMenus = localMenus.filter((m) => m.visible !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
  const hiddenMenus = localMenus.filter((m) => m.visible === false);

  return (
    <>
      <button className="btn btn-ghost btn-sm gap-1" onClick={() => setIsOpen(true)}>
        ⚙️ Kelola Menu
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="card bg-base-100 w-full max-w-2xl max-h-[85vh] mx-4 flex flex-col">
            <div className="card-body p-4 flex flex-col h-full overflow-hidden">
              <div className="flex justify-between items-center mb-2">
                <h2 className="card-title">⚙️ Kelola Menu</h2>
                <button className="btn btn-ghost btn-sm" onClick={() => setIsOpen(false)}>✕</button>
              </div>

              <div className="tabs tabs-boxed mb-3 w-fit flex-wrap">
                <button className={`tab ${tab === "aktif" ? "tab-active" : ""}`} onClick={() => setTab("aktif")}>📋 Aktif ({aktifMenus.length})</button>
                <button className={`tab ${tab === "hidden" ? "tab-active" : ""}`} onClick={() => setTab("hidden")}>👁️ Disembunyikan ({hiddenMenus.length})</button>
                <button className={`tab ${tab === "arsip" ? "tab-active" : ""}`} onClick={() => setTab("arsip")}>📦 Arsip ({arsip.length})</button>
                <button className={`tab ${tab === "reset" ? "tab-active" : ""}`} onClick={() => setTab("reset")}>🔄 Reset</button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {tab === "aktif" && (
                  <>
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <SortableContext items={aktifMenus.map((m) => m.id)} strategy={verticalListSortingStrategy}>
                        {aktifMenus.map((m) => (
                          <SortableRow key={m.id} menu={m} onRename={handleRename} onHide={handleHide} onDelete={handleDelete} />
                        ))}
                      </SortableContext>
                    </DndContext>

                    <div className="border-t border-base-300 pt-3 mt-3">
                      <p className="text-xs font-semibold mb-2">➕ Tambah Menu Custom</p>
                      <div className="flex gap-1">
                        <input type="text" className="input input-bordered input-sm w-14" value={customIcon} onChange={(e) => setCustomIcon(e.target.value)} placeholder="📌" />
                        <input type="text" className="input input-bordered input-sm flex-1" value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="Nama menu (misal: Journaling)" />
                        <button className="btn btn-primary btn-sm" onClick={handleAddCustom} disabled={!customName.trim()}>Tambah</button>
                      </div>
                    </div>
                  </>
                )}

                {tab === "hidden" && (
                  hiddenMenus.length === 0 ? (
                    <p className="text-xs text-base-content/50 italic text-center py-4">Belum ada menu yang disembunyikan.</p>
                  ) : (
                    hiddenMenus.map((m) => (
                      <div key={m.id} className="flex items-center gap-2 bg-base-200 p-2 rounded">
                        <span className="flex-1 text-sm truncate">{m.label}</span>
                        <button className="btn btn-ghost btn-xs" onClick={() => handleShow(m)}>↩️ Tampilkan</button>
                      </div>
                    ))
                  )
                )}

                {tab === "arsip" && (
                  arsip.length === 0 ? (
                    <p className="text-xs text-base-content/50 italic text-center py-4">Arsip kosong.</p>
                  ) : (
                    arsip.map((m) => (
                      <div key={m.id} className="flex items-center gap-2 bg-base-200 p-2 rounded">
                        <span className="flex-1 text-sm truncate">{m.label}</span>
                        <button className="btn btn-ghost btn-xs" onClick={() => handleRestore(m)}>↩️ Restore</button>
                      </div>
                    ))
                  )
                )}

                {tab === "reset" && (
                  <div className="text-center py-4">
                    <p className="text-sm mb-2 font-semibold">Reset semua menu ke default?</p>
                    <p className="text-xs text-base-content/50 mb-4">
                      Semua perubahan (rename, hide, hapus, reorder) akan hilang. Menu custom juga hilang.
                    </p>
                    <button className="btn btn-error btn-sm" onClick={handleReset}>🔄 Reset ke Default</button>
                  </div>
                )}
              </div>

              <p className="text-xs text-base-content/50 mt-3 pt-3 border-t border-base-300">
                💡 Menu yang dihapus pindah ke Arsip. Data aktivitas tidak hilang. Undo muncul 5 detik setelah aksi.
              </p>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-4 right-4 z-[100] bg-base-100 shadow-lg rounded-lg p-3 flex items-center gap-3 max-w-md border border-base-300">
          <span className="text-sm flex-1">{toast.msg}</span>
          {toast.undoFn && (
            <button className="btn btn-sm btn-primary" onClick={() => { toast.undoFn(); setToast(null); }}>↩️ Undo</button>
          )}
          <button className="btn btn-ghost btn-xs" onClick={() => setToast(null)}>✕</button>
        </div>
      )}
    </>
  );
}