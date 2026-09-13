// components/Sidebar.js
"use client";

import { useRouter, usePathname } from "next/navigation";

export default function Sidebar({ activities, collapsed, setCollapsed }) {
  const router = useRouter();
  const pathname = usePathname();

  // Ambil path aktif dari URL: /dashboard/teknik/semester_1 → ["teknik", "semester_1"]
  const currentPath = pathname.replace("/dashboard", "").split("/").filter(Boolean);

  const isDashboardHome = currentPath.length === 0;
  const isPekerjaan = currentPath[0] === "pekerjaan";

  const handleSelect = (pathArray) => {
    const url = `/dashboard/${pathArray.join("/")}`;
    router.push(url);
  };

  const renderTree = (items, parentPath = [], depth = 0) => {
    return items.map((item) => {
      const hasChildren = item.children && item.children.length > 0;
      const currentPathArray = [...parentPath, item.id];
      const isSelected = currentPath.join("/") === currentPathArray.join("/");

      return (
        <div key={item.id} className="select-none">
          <div
            className={`flex items-center gap-1 py-1.5 px-2 rounded cursor-pointer hover:bg-base-300 transition ${
              isSelected ? "bg-primary/20 text-primary font-medium" : ""
            }`}
            style={{ paddingLeft: `${depth * 16 + 8}px` }}
            onClick={() => handleSelect(currentPathArray)}
          >
            <span className="flex-1 text-sm truncate">{item.label}</span>
            {hasChildren && <span className="text-xs opacity-50">›</span>}
          </div>
        </div>
      );
    });
  };

  if (collapsed) {
    return (
      <div className="h-full flex flex-col items-center py-4">
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setCollapsed(false)}
          title="Expand sidebar"
        >
          ☰
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col border-r border-base-300 bg-base-100">
      <div className="flex items-center justify-between p-2 border-b border-base-300">
        <span className="text-sm font-bold">📋 Aktivitas</span>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setCollapsed(true)}
          title="Collapse sidebar"
        >
          «
        </button>
      </div>

      {/* MENU TETAP */}
      <div className="p-2 border-b border-base-300 space-y-1">
        <button
          className={`btn btn-sm w-full justify-start gap-2 ${
            isDashboardHome ? "btn-primary" : "btn-ghost"
          }`}
          onClick={() => router.push("/dashboard")}
        >
          🏠 Dashboard Utama
        </button>
        <button
          className={`btn btn-sm w-full justify-start gap-2 ${
            isPekerjaan ? "btn-primary" : "btn-ghost"
          }`}
          onClick={() => router.push("/dashboard/pekerjaan")}
        >
          💼 Pekerjaan
        </button>
      </div>

      {/* DAFTAR AKTIVITAS */}
      <div className="flex-1 overflow-y-auto p-2">
        {renderTree(activities)}
      </div>

      <div className="p-2 border-t border-base-300 text-xs text-base-content/50">
        {activities.length} aktivitas
      </div>
    </div>
  );
}