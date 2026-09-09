// components/MainContent.js
"use client";
import { useState, useEffect } from "react";
import Schedule from "./Schedule";
import Finance from "./Finance";

export default function MainContent({ 
  selectedId, 
  activities, 
  progress, 
  today, 
  updateProgress 
}) {
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [viewMode, setViewMode] = useState("welcome");

  useEffect(() => {
    if (!selectedId || !activities) {
      setSelectedActivity(null);
      setViewMode("welcome");
      return;
    }
    const findItem = (items, targetId) => {
      for (const item of items) {
        if (item.id === targetId) return item;
        if (item.children) {
          const found = findItem(item.children, targetId);
          if (found) return found;
        }
      }
      return null;
    };
    const found = findItem(activities, selectedId);
    setSelectedActivity(found);
    if (found) {
      if (found.type === "leaf") {
        setViewMode("detail");
      } else if (found.children && found.children.length > 0) {
        setViewMode("list");
      }
    }
  }, [selectedId, activities]);

  // Welcome state
  if (viewMode === "welcome") {
    return (
      <div className="p-4">
        {/* Jadwal tetap tampil */}
        <Schedule todayProgress={progress?.[today] || {}} onUpdate={updateProgress} />
        <div className="text-center text-base-content/50 mt-20">
          <p className="text-2xl mb-2">📋</p>
          <p>Pilih aktivitas dari sidebar</p>
        </div>
        <Finance />
      </div>
    );
  }

  if (!selectedActivity) {
    return (
      <div className="p-4">
        <Schedule todayProgress={progress?.[today] || {}} onUpdate={updateProgress} />
        <div className="text-center text-base-content/50 mt-20">
          <p className="text-2xl mb-2">📋</p>
          <p>Pilih aktivitas dari sidebar</p>
        </div>
        <Finance />
      </div>
    );
  }

  const isLeaf = selectedActivity.type === "leaf";
  const hasChildren = selectedActivity.children && selectedActivity.children.length > 0;
  const todayProgress = progress?.[today] || {};
  const progressData = todayProgress[selectedId] || {};

  // MODE DETAIL — untuk leaf activity
  if (isLeaf) {
    const target = selectedActivity.target || 1;
    const value = progressData?.page || progressData?.progress || 0;
    const pct = Math.min(100, Math.round((value / target) * 100));
    const isDone = pct >= 100;

    return (
      <div className="p-4">
        {/* Jadwal tetap di atas */}
        <Schedule todayProgress={todayProgress} onUpdate={updateProgress} />

        <div className="mt-4">
          <div className="flex items-center gap-2 mb-4">
            <h1 className="text-xl font-bold">{selectedActivity.label}</h1>
            <span className={`badge ${isDone ? 'badge-success' : 'badge-ghost'}`}>
              {isDone ? '✅ Selesai' : `${pct}%`}
            </span>
          </div>

          <div className="space-y-4">
            <div className="card bg-base-100 shadow">
              <div className="card-body p-4">
                <h3 className="card-title text-sm">📊 Progress</h3>
                <progress className="progress progress-primary w-full h-3" value={pct} max="100" />
                <div className="flex justify-between text-sm">
                  <span>{value} / {target} {selectedActivity.unit}</span>
                  <span>{pct}%</span>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow">
              <div className="card-body p-4">
                <h3 className="card-title text-sm">✏️ Update Progress</h3>
                <div className="flex gap-2 mt-2">
                  <input 
                    type="number" 
                    className="input input-bordered input-sm w-full" 
                    placeholder={`Target ${target}...`}
                    value={value || ''}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      updateProgress(selectedId, { page: val });
                    }}
                  />
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      const newVal = Math.min(target, value + 1);
                      updateProgress(selectedId, { page: newVal });
                    }}
                  >
                    +1
                  </button>
                </div>
                <input 
                  type="text" 
                  className="input input-bordered input-sm w-full mt-2" 
                  placeholder="Catatan tambahan (opsional)"
                  value={progressData?.note || ''}
                  onChange={(e) => updateProgress(selectedId, { note: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Keuangan tetap di bawah */}
        <Finance />
      </div>
    );
  }

  // MODE LIST — untuk expandable activity (nampilin child)
  if (hasChildren) {
    return (
      <div className="p-4">
        {/* Jadwal tetap di atas */}
        <Schedule todayProgress={todayProgress} onUpdate={updateProgress} />

        <div className="mt-4">
          <h1 className="text-xl font-bold mb-4">{selectedActivity.label}</h1>
          <p className="text-sm text-base-content/50 mb-4">Klik salah satu sub-aktivitas untuk melihat progress detail</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {selectedActivity.children.map(child => {
              // Cek progress child
              const childProgress = todayProgress[child.id] || {};
              const childValue = childProgress?.page || childProgress?.progress || 0;
              const childTarget = child.target || 1;
              const childPct = Math.min(100, Math.round((childValue / childTarget) * 100));
              const isChildDone = childPct >= 100;

              return (
                <div 
                  key={child.id} 
                  className="card bg-base-100 shadow cursor-pointer hover:shadow-md transition"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('selectActivity', { detail: child.id }));
                  }}
                >
                  <div className="card-body p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{child.label}</span>
                      <span className={`badge ${isChildDone ? 'badge-success' : 'badge-ghost'} text-xs`}>
                        {isChildDone ? '✅' : `${childPct}%`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Keuangan tetap di bawah */}
        <Finance />
      </div>
    );
  }

  return (
    <div className="p-4">
      <Schedule todayProgress={todayProgress} onUpdate={updateProgress} />
      <div className="text-center text-base-content/50 mt-20">
        <p>Aktivitas tidak dikenal</p>
      </div>
      <Finance />
    </div>
  );
}