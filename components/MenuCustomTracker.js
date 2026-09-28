// components/MenuCustomTracker.js
"use client";

import { useState, useMemo, useEffect } from "react";
import { generateId, formatTanggal } from "@/lib/belajarData";

// ========== RECURSIVE SUB-ITEM NODE ==========
function SubItemNode({ item, level = 0, onRename, onDelete, onAddChild, progressMap, onToggleProgress }) {
  const [collapsed, setCollapsed] = useState(false);
  const hasChildren = item.subItems && item.subItems.length > 0;
  const isDone = progressMap[item.id]?.done;

  return (
    <div className="space-y-1">
      <div
        className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded px-2 py-1.5 hover:bg-gray-100"
        style={{ marginLeft: `${level * 16}px` }}
      >
        {hasChildren && (
          <button
            className="btn btn-ghost btn-xs px-1"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? "▶" : "▼"}
          </button>
        )}
        {!hasChildren && <span className="w-5"></span>}
        <input
          type="checkbox"
          className="checkbox checkbox-xs checkbox-primary"
          checked={!!isDone}
          onChange={() => onToggleProgress(item.id)}
        />
        <span className={`flex-1 text-sm truncate ${isDone ? "line-through text-gray-400" : "text-gray-800"}`}>
          {item.label}
        </span>
        <div className="flex gap-0.5">
          <button
            className="btn btn-ghost btn-xs text-green-600"
            onClick={() => onAddChild(item.id)}
            title="Tambah sub-item"
          >
            ➕
          </button>
          <button
            className="btn btn-ghost btn-xs text-blue-500"
            onClick={() => onRename(item.id, item.label)}
            title="Rename"
          >
            ✏️
          </button>
          <button
            className="btn btn-ghost btn-xs text-red-500"
            onClick={() => onDelete(item.id)}
            title="Hapus"
          >
            🗑️
          </button>
        </div>
      </div>
      {!collapsed && hasChildren && (
        <div className="space-y-1">
          {item.subItems.map((child) => (
            <SubItemNode
              key={child.id}
              item={child}
              level={level + 1}
              onRename={onRename}
              onDelete={onDelete}
              onAddChild={onAddChild}
              progressMap={progressMap}
              onToggleProgress={onToggleProgress}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ========== MAIN COMPONENT ==========
export default function MenuCustomTracker({
  menu,
  progress = {},
  onUpdateProgress,
  onUpdateMenu,
}) {
  const [activeTab, setActiveTab] = useState("tracker");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [pageInput, setPageInput] = useState("");
  const [noteInput, setNoteInput] = useState("");
  const [editTargetMode, setEditTargetMode] = useState(false);
  const [targetInput, setTargetInput] = useState(menu.target || "");

  useEffect(() => {
    setTargetInput(menu.target || "");
  }, [menu.target]);

  // ========== PROGRESS HARI INI ==========
  const todayData = progress[selectedDate]?.[menu.id] || {};
  const currentPage = todayData.page || 0;
  const currentNote = todayData.note || "";
  const subProgressMap = todayData.subProgress || {};

  useEffect(() => {
    setNoteInput(currentNote);
    setPageInput("");
  }, [selectedDate, menu.id, currentNote]);

  // ========== SIMPAN PROGRESS ==========
  const updateToday = (updates) => {
    onUpdateProgress(selectedDate, menu.id, {
      ...todayData,
      ...updates,
    });
  };

  const handleTambahProgress = (delta) => {
    updateToday({ page: Math.max(0, currentPage + delta) });
  };

  const handleSetPage = () => {
    const val = parseInt(pageInput);
    if (isNaN(val) || val < 0) return;
    updateToday({ page: val });
    setPageInput("");
  };

  const handleSaveNote = () => {
    updateToday({ note: noteInput });
  };

  const handleToggleSubProgress = (subItemId) => {
    const newSubProgress = { ...subProgressMap };
    if (newSubProgress[subItemId]?.done) {
      delete newSubProgress[subItemId];
    } else {
      newSubProgress[subItemId] = { done: true };
    }
    updateToday({ subProgress: newSubProgress });
  };

  // ========== TARGET ==========
  const handleSimpanTarget = () => {
    const t = parseInt(targetInput);
    const newTarget = isNaN(t) || t <= 0 ? null : t;
    onUpdateMenu(menu.id, { target: newTarget });
    setEditTargetMode(false);
  };

  // ========== SUB-ITEM MANAGEMENT (INFINITE NESTED) ==========
  // Cari path ke sub-item berdasarkan ID (rekursif)
  const findPathById = (items, targetId, currentPath = []) => {
    for (let i = 0; i < items.length; i++) {
      if (items[i].id === targetId) return [...currentPath, i];
      if (items[i].subItems) {
        const result = findPathById(items[i].subItems, targetId, [...currentPath, i]);
        if (result) return result;
      }
    }
    return null;
  };

  // Dapet object sub-item dari path
  const getItemByPath = (items, path) => {
    let current = items;
    let item = null;
    for (const idx of path) {
      item = current[idx];
      if (!item) return null;
      current = item.subItems || [];
    }
    return item;
  };

  // Helper: mutate tree secara immutable
  const mutateTree = (items, path, mutator) => {
    if (path.length === 0) return items;
    const newItems = [...items];
    const [first, ...rest] = path;
    if (rest.length === 0) {
      newItems[first] = mutator(newItems[first]);
    } else {
      newItems[first] = {
        ...newItems[first],
        subItems: mutateTree(newItems[first].subItems || [], rest, mutator),
      };
    }
    return newItems;
  };

  const handleTambahSubItem = (parentId = null) => {
    const label = window.prompt("Nama sub-item:");
    if (!label || !label.trim()) return;
    const newItem = { id: generateId("sub"), label: label.trim(), subItems: [] };

    let newSubItems;
    if (!parentId) {
      newSubItems = [...(menu.subItems || []), newItem];
    } else {
      const path = findPathById(menu.subItems || [], parentId);
      if (!path) return;
      newSubItems = mutateTree(menu.subItems, path, (item) => ({
        ...item,
        subItems: [...(item.subItems || []), newItem],
      }));
    }
    onUpdateMenu(menu.id, { subItems: newSubItems });
  };

  const handleRenameSubItem = (itemId, currentLabel) => {
    const newLabel = window.prompt("Ganti nama jadi:", currentLabel);
    if (!newLabel || !newLabel.trim() || newLabel.trim() === currentLabel) return;
    const path = findPathById(menu.subItems || [], itemId);
    if (!path) return;
    const newSubItems = mutateTree(menu.subItems, path, (item) => ({
      ...item,
      label: newLabel.trim(),
    }));
    onUpdateMenu(menu.id, { subItems: newSubItems });
  };

  const handleHapusSubItem = (itemId) => {
    if (!confirm("Hapus sub-item ini? Semua anak di dalamnya ikut terhapus.")) return;
    const path = findPathById(menu.subItems || [], itemId);
    if (!path) return;
    const newSubItems = mutateTree(menu.subItems.slice(0, path[0]), [], () => null);
    // Hapus dari parent array
    const parentPath = path.slice(0, -1);
    const lastIdx = path[path.length - 1];
    let finalItems;
    if (parentPath.length === 0) {
      finalItems = (menu.subItems || []).filter((_, i) => i !== lastIdx);
    } else {
      finalItems = mutateTree(menu.subItems, parentPath, (item) => ({
        ...item,
        subItems: (item.subItems || []).filter((_, i) => i !== lastIdx),
      }));
    }
    onUpdateMenu(menu.id, { subItems: finalItems });
  };

  // ========== RIWAYAT ==========
  const riwayat = useMemo(() => {
    const list = [];
    Object.entries(progress || {}).forEach(([tanggal, dayData]) => {
      const item = dayData[menu.id];
      if (item && (item.page || item.note)) {
        list.push({ tanggal, ...item });
      }
    });
    return list.sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  }, [progress, menu.id]);

  // ========== KALENDER ==========
  const generateCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({ day: d, date: dateStr });
    }
    return days;
  };

  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const todayStr = new Date().toISOString().split("T")[0];

  const getLogByDate = (date) => progress[date]?.[menu.id] || null;

  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const goToday = () => {
    const now = new Date();
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(now.toISOString().split("T")[0]);
  };

  // ========== PROGRESS % ==========
  const targetTercapai = menu.target && currentPage >= menu.target;
  const progressPercent = menu.target
    ? Math.min(100, Math.round((currentPage / menu.target) * 100))
    : 0;

  const totalSubItems = useMemo(() => {
    const count = (items) => {
      let n = 0;
      (items || []).forEach((i) => {
        n += 1;
        if (i.subItems) n += count(i.subItems);
      });
      return n;
    };
    return count(menu.subItems || []);
  }, [menu.subItems]);

  const doneSubItems = Object.values(subProgressMap).filter((v) => v?.done).length;

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{menu.label}</h1>
          <p className="text-xs text-gray-500 mt-1">
            {totalSubItems > 0 && `${doneSubItems}/${totalSubItems} sub-item selesai • `}
            {menu.target ? `Target: ${menu.target} ${menu.unit || ""}` : "Target: belum di-set"}
          </p>
        </div>
        {!editTargetMode ? (
          <button
            className="btn btn-outline btn-xs text-gray-700"
            onClick={() => setEditTargetMode(true)}
          >
            🎯 {menu.target ? "Ubah Target" : "Set Target"}
          </button>
        ) : (
          <div className="flex items-center gap-1">
            <input
              type="number"
              className="input input-bordered input-sm w-20 text-gray-800 bg-white"
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
              placeholder="Target"
              autoFocus
            />
            <button className="btn btn-primary btn-sm" onClick={handleSimpanTarget}>
              ✓
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => { setEditTargetMode(false); setTargetInput(menu.target || ""); }}>
              ✕
            </button>
          </div>
        )}
      </div>

      {/* TAB */}
      <div className="tabs tabs-boxed bg-white shadow border border-gray-200 p-1 w-fit">
        <button
          className={`tab ${activeTab === "tracker" ? "tab-active bg-blue-600 text-white" : ""}`}
          onClick={() => setActiveTab("tracker")}
        >
          📊 Tracker
        </button>
        <button
          className={`tab ${activeTab === "kalender" ? "tab-active bg-blue-600 text-white" : ""}`}
          onClick={() => setActiveTab("kalender")}
        >
          📅 Kalender
        </button>
      </div>

      {/* ========== TRACKER ========== */}
      {activeTab === "tracker" && (
        <>
          {/* PROGRESS HARI INI */}
          <div className="card bg-white shadow border border-gray-200">
            <div className="card-body p-4">
              <h3 className="text-sm font-bold text-gray-800 mb-3">
                📊 Progress — {formatTanggal(selectedDate, "panjang")}
              </h3>

              {menu.target && (
                <div className="mb-3">
                  <progress
                    className={`progress ${targetTercapai ? "progress-success" : "progress-primary"} w-full h-3`}
                    value={progressPercent}
                    max="100"
                  />
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>{currentPage} / {menu.target} {menu.unit || ""}</span>
                    <span>{progressPercent}% {targetTercapai && "✅"}</span>
                  </div>
                </div>
              )}

              {!menu.target && (
                <p className="text-xs text-gray-500 italic mb-3">
                  Belum ada target. Progress tetap bisa di-input.
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <button
                  className="btn btn-outline btn-sm text-gray-700"
                  onClick={() => handleTambahProgress(-1)}
                >
                  −1
                </button>
                <span className="text-lg font-bold text-gray-800 min-w-[3rem] text-center">
                  {currentPage}
                </span>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleTambahProgress(1)}
                >
                  +1
                </button>
                <span className="text-gray-400">|</span>
                <input
                  type="number"
                  className="input input-bordered input-sm w-20 text-gray-800 bg-white"
                  placeholder="Manual"
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value)}
                />
                <button className="btn btn-outline btn-sm text-gray-700" onClick={handleSetPage}>
                  Set
                </button>
              </div>
            </div>
          </div>

          {/* CATATAN */}
          <div className="card bg-white shadow border border-gray-200">
            <div className="card-body p-4">
              <h3 className="text-sm font-bold text-gray-800 mb-2">📝 Catatan</h3>
              <textarea
                className="textarea textarea-bordered w-full text-sm text-gray-800 bg-white"
                rows="3"
                placeholder="Catatan hari ini..."
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
              />
              <div className="flex justify-end mt-2">
                <button className="btn btn-primary btn-sm" onClick={handleSaveNote}>
                  💾 Simpan Catatan
                </button>
              </div>
            </div>
          </div>

          {/* SUB-ITEMS */}
          <div className="card bg-white shadow border border-gray-200">
            <div className="card-body p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-gray-800">
                  🌳 Sub-Items ({totalSubItems})
                </h3>
                <button
                  className="btn btn-primary btn-xs"
                  onClick={() => handleTambahSubItem(null)}
                >
                  + Sub-Item
                </button>
              </div>
              {(menu.subItems || []).length === 0 ? (
                <p className="text-xs text-gray-400 italic text-center py-4">
                  Belum ada sub-item. Klik "+ Sub-Item" untuk mulai.
                </p>
              ) : (
                <div className="space-y-1">
                  {menu.subItems.map((item) => (
                    <SubItemNode
                      key={item.id}
                      item={item}
                      level={0}
                      onRename={handleRenameSubItem}
                      onDelete={handleHapusSubItem}
                      onAddChild={handleTambahSubItem}
                      progressMap={subProgressMap}
                      onToggleProgress={handleToggleSubProgress}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIWAYAT */}
          <div className="card bg-white shadow border border-gray-200">
            <div className="card-body p-4">
              <h3 className="text-sm font-bold text-gray-800 mb-3">
                📅 Riwayat ({riwayat.length})
              </h3>
              {riwayat.length === 0 ? (
                <p className="text-xs text-gray-400 italic text-center py-4">
                  Belum ada riwayat.
                </p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {riwayat.map((r) => (
                    <div
                      key={r.tanggal}
                      className="p-2 border border-gray-200 rounded bg-gray-50 cursor-pointer hover:bg-gray-100"
                      onClick={() => setSelectedDate(r.tanggal)}
                    >
                      <div className="flex justify-between items-center">
                        <p className="text-xs font-semibold text-gray-700">
                          {formatTanggal(r.tanggal, "pendek")}
                        </p>
                        {r.page != null && (
                          <span className="text-xs font-mono text-gray-600">{r.page}</span>
                        )}
                      </div>
                      {r.note && (
                        <p className="text-xs text-gray-600 mt-1 whitespace-pre-wrap">{r.note}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ========== KALENDER ========== */}
      {activeTab === "kalender" && (
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-4">
            <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
              <div className="flex gap-1">
                <button className="btn btn-ghost btn-sm text-gray-700" onClick={prevMonth}>‹</button>
                <span className="font-bold text-gray-800">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </span>
                <button className="btn btn-ghost btn-sm text-gray-700" onClick={nextMonth}>›</button>
              </div>
              <button className="btn btn-outline btn-xs text-gray-700" onClick={goToday}>
                📅 Hari Ini
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-1">
              {dayNames.map((d) => (
                <div key={d} className="text-center text-xs font-bold text-gray-600 bg-gray-100 py-2 rounded">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {generateCalendar().map((item, idx) => {
                if (!item) return <div key={idx} className="aspect-square" />;
                const isToday = item.date === todayStr;
                const isSelected = item.date === selectedDate;
                const log = getLogByDate(item.date);
                const hasData = log && (log.page || log.note);

                let boxClass = "bg-white text-gray-800 border-gray-200 hover:bg-gray-100";
                if (isToday && !isSelected) boxClass = "bg-yellow-50 text-gray-900 border-yellow-300 font-bold";
                if (isSelected) boxClass = "bg-blue-100 text-blue-900 border-2 border-blue-600 font-bold";
                if (hasData && !isSelected) boxClass = "bg-green-50 text-gray-900 border-green-300";

                return (
                  <button
                    key={item.date}
                    className={`aspect-square rounded border ${boxClass} text-sm p-1 flex flex-col items-center justify-start`}
                    onClick={() => setSelectedDate(item.date)}
                  >
                    <span className="text-xs">{item.day}</span>
                    {hasData && <span className="text-[8px] text-green-600 mt-0.5">●</span>}
                  </button>
                );
              })}
            </div>

            {/* DETAIL TANGGAL */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-bold text-gray-800 mb-2">
                📌 {formatTanggal(selectedDate, "panjang")}
              </h4>
              {(() => {
                const log = getLogByDate(selectedDate);
                if (!log || (!log.page && !log.note)) {
                  return <p className="text-xs text-gray-400 italic">Belum ada catatan di tanggal ini.</p>;
                }
                return (
                  <div className="space-y-2">
                    {log.page != null && (
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Progress:</span> {log.page} {menu.unit || ""}
                      </p>
                    )}
                    {log.note && (
                      <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-2 rounded border border-gray-200">
                        {log.note}
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}