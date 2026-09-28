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
import { WARNA_OPTIONS } from "@/lib/belajarData";

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
      {menu.type === "custom" && <span className="text-xs badge badge-ghost badge-xs">custom</span>}
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

export default function MenuManager({
  menus = [],
  activities = [],
  menusCustom = {},
  user,
  onUpdate,
  onUpdateCustom,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState("aktif");
  const [localMenus, setLocalMenus] = useState(menus);
  const [arsip, setArsip] = useState([]);
  const [toast, setToast] = useState(null);
  const [customName, setCustomName] = useState("");
  const [customIcon, setCustomIcon] = useState("📌");
  const [customWarna, setCustomWarna] = useState("gray");
  const [customKaryaMingguan, setCustomKaryaMingguan] = useState(false);

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

  async function saveMenusCustom(newMenusCustom) {
    if (onUpdateCustom) onUpdateCustom(newMenusCustom);
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
    if (menu.type === "custom" && menusCustom[menu.id]) {
      saveMenusCustom({
        ...menusCustom,
        [menu.id]: { ...menusCustom[menu.id], nama: newName.trim() },
      });
    }
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
    const beforeCustom = { ...menusCustom };

    const updated = localMenus.filter((m) => m.id !== menu.id);
    const newArsip = [...arsip, { ...menu, deletedAt: new Date().toISOString() }];

    setLocalMenus(updated);
    saveArsip(newArsip);
    onUpdate(updated, newArsip);

    if (menu.type === "custom" && menusCustom[menu.id]) {
      const newCustom = { ...menusCustom };
      delete newCustom[menu.id];
      saveMenusCustom(newCustom);
    }

    setToast({
      msg: `"${menu.label}" dipindah ke Arsip`,
      undoFn: () => {
        setLocalMenus(before);
        saveArsip(beforeArsip);
        onUpdate(before, beforeArsip);
        if (menu.type === "custom") saveMenusCustom(beforeCustom);
      },
    });
  };

  const handleRestore = (menu) => {
    const newArsip = arsip.filter((m) => m.id !== menu.id);
    const restored = { ...menu, visible: true, order: localMenus.length };
    delete restored.deletedAt;
    const updated = [...localMenus, restored];
    setLocalMenus(updated);
    saveArsip(newArsip);
    onUpdate(updated, newArsip);

    if (menu.type === "custom" && !menusCustom[menu.id]) {
      saveMenusCustom({
        ...menusCustom,
        [menu.id]: {
          id: menu.id,
          nama: menu.label,
          warna: menu.warna || "gray",
          subKategori: [],
          fiturKaryaMingguan: menu.fiturKaryaMingguan || false,
          createdAt: new Date().toISOString(),
        },
      });
    }

    setToast({ msg: `"${menu.label}" dipulihkan` });
  };

  const handleReset = async () => {
    if (!confirm("Reset semua menu ke default?\n\nPerubahan (rename, hide, hapus, reorder) akan hilang. Menu custom juga hilang.")) return;
    const { DEFAULT_MENUS } = await import("@/lib/defaultData");
    const fresh = DEFAULT_MENUS.map((m) => ({ ...m }));
    setLocalMenus(fresh);
    onUpdate(fresh, arsip);
    saveMenusCustom({});
    setToast({ msg: "Menu di-reset ke default" });
  };

  const handleAddCustom = () => {
    if (!customName.trim()) return;
    const id = `custom_${Date.now()}`;
    const label = `${customIcon} ${customName.trim()}`;

    // 1. Tambah ke menus
    const newMenu = {
      id,
      label,
      type: "custom",
      required: false,
      visible: true,
      order: localMenus.length,
      warna: customWarna,
      fiturKaryaMingguan: customKaryaMingguan,
    };
    const updated = [...localMenus, newMenu];
    setLocalMenus(updated);
    onUpdate(updated, arsip);

    // 2. Tambah ke menusCustom (untuk struktur nested)
    saveMenusCustom({
      ...menusCustom,
      [id]: {
        id,
        nama: label,
        warna: customWarna,
        subKategori: [],
        fiturKaryaMingguan: customKaryaMingguan,
        createdAt: new Date().toISOString(),
      },
    });

    setCustomName("");
    setCustomIcon("📌");
    setCustomWarna("gray");
    setCustomKaryaMingguan(false);
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
                          <SortableRow key={m.id} menu={m} onR