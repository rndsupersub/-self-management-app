// components/Sidebar.js
"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { DEFAULT_MENUS } from "@/lib/defaultData";
import {
  Home,
  Briefcase,
  BookOpen,
  Book,
  Wallet,
  Video,
  Activity,
  BookMarked,
  Building,
  X,
  ChevronsLeft,
  Sparkles,
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

  const currentPath = (pathname || "").replace("/dashboard", "").split("/").filter(Boolean);
  const isDashboardHome = currentPath.length === 0;
  const currentTopId = currentPath[0] || null;

  const handleNavigate = (menu) => {
    if (menu.id === "dashboard") router.push("/dashboard");
    else router.push(`/dashboard/${menu.id}`);
    if (onCloseMobile) onCloseMobile();
  };

  const getIcon = (id) => {
    const iconProps = { size: 17, className: "shrink-0" };
    switch (id) {
      case "dashboard":
        return <Home {...iconProps} />;
      case "pekerjaan":
        return <Briefcase {...iconProps} />;
      case "belajar":
        return <BookOpen {...iconProps} />;
      case "bedah-buku":
        return <Book {...iconProps} />;
      case "keuangan":
        return <Wallet {...iconProps} />;
      case "youtube":
        return <Video {...iconProps} />;
      case "olahraga":
        return <Activity {...iconProps} />;
      case "hafalan":
        return <BookMarked {...iconProps} />;
      case "bisnis":
        return <Building {...iconProps} />;
      default:
        return <BookOpen {...iconProps} />;
    }
  };

  const isActive = (menu) =>
    menu.id === "dashboard" ? isDashboardHome : currentTopId === menu.id;

  const labelBersih = (label) =>
    String(label || "").replace(/^[^\w\s]+\s/, "");

  // ===== MODE RINGKAS (desktop) =====
  if (collapsed) {
    return (
      <div className="flex h-full flex-col items-center gap-1 py-3">
        <button
          className="mb-1 grid h-9 w-9 place-items-center rounded-xl text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
          onClick={() => setCollapsed(false)}
          title="Lebarkan sidebar"
        >
          <ChevronsLeft size={17} className="rotate-180" />
        </button>

        <div className="flex w-full flex-1 flex-col items-center gap-1 overflow-y-auto px-2">
          {visibleMenus.map((menu) => (
            <button
              key={menu.id}
              className={`grid h-10 w-10 place-items-center rounded-xl transition ${
                isActive(menu)
                  ? "bg-stone-900 text-white shadow-sm shadow-stone-900/20"
                  : "text-stone-500 hover:bg-stone-100 hover:text-stone-800"
              }`}
              onClick={() => handleNavigate(menu)}
              title={labelBersih(menu.label)}
              aria-label={labelBersih(menu.label)}
            >
              {getIcon(menu.id)}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3.5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
          Menu Utama
        </span>
        {onCloseMobile ? (
          <button
            className="grid h-8 w-8 place-items-center rounded-lg text-stone-500 transition hover:bg-stone-100 md:hidden"
            onClick={onCloseMobile}
            aria-label="Tutup menu"
          >
            <X size={17} />
          </button>
        ) : (
          <button
            className="grid h-8 w-8 place-items-center rounded-lg text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
            onClick={() => setCollapsed(true)}
            title="Kecilkan sidebar"
            aria-label="Kecilkan sidebar"
          >
            <ChevronsLeft size={17} />
          </button>
        )}
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto px-2.5 py-3">
        {loadingMenus ? (
          <div className="space-y-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-9 animate-pulse rounded-xl bg-stone-200" />
            ))}
          </div>
        ) : visibleMenus.length === 0 ? (
          <p className="px-2 py-4 text-center text-[11px] italic text-stone-400">
            Belum ada menu. Klik &quot;Kelola Menu&quot; di navbar.
          </p>
        ) : (
          visibleMenus.map((menu) => {
            const active = isActive(menu);
            return (
              <button
                key={menu.id}
                className={`group relative flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium transition ${
                  active
                    ? "bg-stone-100 text-stone-900"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                }`}
                onClick={() => handleNavigate(menu)}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-stone-800" />
                )}
                <span className={active ? "text-stone-700" : "text-stone-400"}>
                  {getIcon(menu.id)}
                </span>
                <span className="truncate">{labelBersih(menu.label)}</span>
              </button>
            );
          })
        )}
      </div>

      <div className="border-t border-stone-200 px-4 py-3">
        <div className="flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5">
          <Sparkles size={14} className="shrink-0 text-stone-500" />
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold text-stone-700">
              {visibleMenus.length} menu aktif
            </p>
            <p className="truncate text-[10px] text-stone-400">
              Jalanin satu-satu, konsisten.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
