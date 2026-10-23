// components/Sidebar.js
"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { DEFAULT_MENUS } from "@/lib/defaultData";
import { 
  Home, Briefcase, BookOpen, Book, Wallet, Video, Activity, BookMarked, Building, X
} from "lucide-react";

export default function Sidebar({ collapsed, setCollapsed, onCloseMobile }) {
  const router = useRouter();
  const pathname = usePathname();

  const [menus, setMenus] = useState(DEFAULT_MENUS);
  const [loadingMenus, setLoadingMenus] = useState(true);

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

  const currentPath = pathname.replace("/dashboard", "").split("/").filter(Boolean);
  const isDashboardHome = currentPath.length === 0;
  const currentTopId = currentPath[0] || null;

  const handleNavigate = (menu) => {
    if (menu.id === "dashboard") router.push("/dashboard");
    else router.push(`/dashboard/${menu.id}`);
    if (onCloseMobile) onCloseMobile(); // Tutup sidebar otomatis di HP
  };

  // Helper untuk nentuin Icon berdasarkan ID Menu
  const getIcon = (id) => {
    const iconProps = { size: 18, className: "shrink-0" };
    switch (id) {
      case "dashboard": return <Home {...iconProps} />;
      case "pekerjaan": return <Briefcase {...iconProps} />;
      case "belajar": return <BookOpen {...iconProps} />;
      case "bedah-buku": return <Book {...iconProps} />;
      case "keuangan": return <Wallet {...iconProps} />;
      case "youtube": return <Video {...iconProps} />;
      case "olahraga": return <Activity {...iconProps} />;
      case "hafalan": return <BookMarked {...iconProps} />;
      case "bisnis": return <Building {...iconProps} />;
      default: return <BookOpen {...iconProps} />;
    }
  };

  if (collapsed) {
    return (
      <div className="h-full flex flex-col items-center py-4 border-r border-base-200 bg-base-100">
        <button
          className="btn btn-ghost btn-sm text-gray-500 hover:bg-base-200"
          onClick={() => setCollapsed(false)}
          title="Expand sidebar"
        >
          ☰
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col border-r border-base-200 bg-base-100 shadow-sm">
      <div className="flex items-center justify-between p-4 border-b border-base-200">
        <span className="text-sm font-bold text-gray-800 flex items-center gap-2">
          📋 Menu Utama
        </span>
        {/* Tombol close buat HP, tombol collapse buat Desktop */}
        {onCloseMobile ? (
          <button className="btn btn-ghost btn-sm btn-circle md:hidden" onClick={onCloseMobile}>
            <X size={18} />
          </button>
        ) : (
          <button
            className="btn btn-ghost btn-sm btn-circle text-gray-500"
            onClick={() => setCollapsed(true)}
            title="Collapse sidebar"
          >
            «
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1">
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
            const isActive = menu.id === "dashboard" ? isDashboardHome : currentTopId === menu.id;
            return (
              <button
                key={menu.id}
                className={`btn btn-sm w-full justify-start gap-3 ${
                  isActive 
                    ? "btn-primary text-white shadow-md" 
                    : "btn-ghost text-gray-600 hover:bg-base-200 font-normal"
                }`}
                onClick={() => handleNavigate(menu)}
              >
                {getIcon(menu.id)}
                <span className="truncate">{menu.label.replace(/^[^\w\s]+\s/, '')}</span> {/* Hapus emoji dari text label */}
              </button>
            );
          })
        )}
      </div>

      <div className="p-4 border-t border-base-200 text-xs text-gray-400 text-center">
        {visibleMenus.length} menu aktif
      </div>
    </div>
  );
}