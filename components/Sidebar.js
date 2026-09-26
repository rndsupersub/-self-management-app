// components/Sidebar.js
"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { DEFAULT_MENUS } from "@/lib/defaultData";

export default function Sidebar({ collapsed, setCollapsed }) {
  const router = useRouter();
  const pathname = usePathname();

  const [menus, setMenus] = useState(DEFAULT_MENUS);
  const [loadingMenus, setLoadingMenus] = useState(true);

  // ========== FETCH MENUS DARI FIRESTORE ==========
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setMenus(DEFAULT_MENUS);
        setLoadingMenus(false);
        return;
      }
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (Array.isArray(data.menus) && data.menus.length > 0) {
            setMenus(data.menus);
          } else {
            setMenus(DEFAULT_MENUS);
          }
        } else {
          setMenus(DEFAULT_MENUS);
        }
      } catch (err) {
        console.error("[Sidebar] Gagal fetch menus:", err);
        setMenus(DEFAULT_MENUS);
      }
      setLoadingMenus(false);
    });
    return () => unsubscribe();
  }, []);

  const visibleMenus = menus
    .filter((m) => m.visible !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const currentPath = pathname
    .replace("/dashboard", "")
    .split("/")
    .filter(Boolean);

  const isDashboardHome = currentPath.length === 0;
  const currentTopId = currentPath[0] || null;

  const handleNavigate = (menu) => {
    if (menu.id === "dashboard") router.push("/dashboard");
    else router.push(`/dashboard/${menu.id}`);
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
        <span className="text-sm font-bold">📋 Menu</span>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setCollapsed(true)}
          title="Collapse sidebar"
        >
          «
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {loadingMenus ? (
          <p className="text-xs text-base-content/50 italic text-center py-4">
            Memuat menu...
          </p>
        ) : visibleMenus.length === 0 ? (
          <p className="text-xs text-base-content/50 italic text-center py-4">
            Belum ada menu. Klik "Kelola Menu" di navbar.
          </p>
        ) : (
          visibleMenus.map((menu) => {
            const isActive =
              menu.id === "dashboard"
                ? isDashboardHome
                : currentTopId === menu.id;
            return (
              <button
                key={menu.id}
                className={`btn btn-sm w-full justify-start gap-2 ${
                  isActive ? "btn-primary" : "btn-ghost"
                }`}
                onClick={() => handleNavigate(menu)}
              >
                {menu.label}
              </button>
            );
          })
        )}
      </div>

      <div className="p-2 border-t border-base-300 text-xs text-base-content/50">
        {visibleMenus.length} menu aktif
      </div>
    </div>
  );
}