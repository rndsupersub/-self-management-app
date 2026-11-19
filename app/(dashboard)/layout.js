// app/(dashboard)/layout.js
"use client";

import { useEffect, useState } from "react";
import useTanggalHariIni from "@/lib/useTanggalHariIni";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Sidebar from "@/components/Sidebar";
import MenuManager from "@/components/MenuManager";
import SyncSheetsButton from "@/components/SyncSheetsButton";
import TelegramSetting from "@/components/TelegramSetting";
import ViewerManager from "@/components/ViewerManager";
import { DEFAULT_ACTIVITIES, DEFAULT_MENUS } from "@/lib/defaultData";
import { Menu, LogOut, CalendarDays, Brain } from "lucide-react";

export default function DashboardLayout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isViewer, setIsViewer] = useState(false);
  const today = useTanggalHariIni();
  const [activities, setActivities] = useState(DEFAULT_ACTIVITIES);
  const [menus, setMenus] = useState(DEFAULT_MENUS);
  const [menusCustom, setMenusCustom] = useState({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const isViewerRoute = pathname?.startsWith("/viewer");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }
      setUser(currentUser);

      try {
        const viewerRef = doc(db, "viewers", currentUser.uid);
        const viewerSnap = await getDoc(viewerRef);
        if (viewerSnap.exists() && viewerSnap.data().passwordHash) {
          setIsViewer(true);
          setLoading(false);
          return;
        }
      } catch (err) {}

      const docRef = doc(db, "users", currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (Array.isArray(data.activities)) setActivities(data.activities);
        if (Array.isArray(data.menus)) setMenus(data.menus);
        setMenusCustom(data.menusCustom || {});
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleUpdateMenus = async (newMenus, newArsip) => {
    setMenus(newMenus);
    if (!user) return;
    const docRef = doc(db, "users", user.uid);
    const updates = { menus: newMenus };
    if (newArsip) updates.menusArsip = newArsip;
    await setDoc(docRef, updates, { merge: true });
  };

  const handleUpdateCustom = async (newCustom) => {
    setMenusCustom(newCustom);
    if (!user) return;
    await setDoc(doc(db, "users", user.uid), { menusCustom: newCustom }, { merge: true });
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-base-200">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-stone-200 border-t-stone-800" />
        <p className="text-xs font-medium text-slate-500">Memuat workspace...</p>
      </div>
    );
  }

  if (isViewerRoute) {
    return (
      <div className="flex h-screen flex-col bg-base-200">
        <div
          className="flex items-center justify-between border-b border-slate-200/70 bg-white/80 px-4 py-3 backdrop-blur md:px-6"
          data-html2canvas-ignore="true"
        >
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-stone-900 text-white shadow-sm">
              <Brain size={18} />
            </span>
            <div>
              <h1 className="text-sm font-bold text-slate-800">Self Management</h1>
              <p className="text-[11px] text-slate-400">Mode Viewer</p>
            </div>
          </div>
          <button
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
            onClick={handleLogout}
          >
            <LogOut size={15} /> <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
        <main id="export-area" className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      {/* TOP BAR */}
      <header
        className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 backdrop-blur-md"
        data-html2canvas-ignore="true"
      >
        <div className="flex flex-wrap items-center gap-2 px-3 py-2.5 md:px-5">
          <div className="flex flex-1 items-center gap-2">
            <button
              className="grid h-9 w-9 place-items-center rounded-xl text-slate-600 transition hover:bg-slate-100 md:hidden"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Buka menu"
            >
              <Menu size={19} />
            </button>

            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-stone-900 text-white shadow-sm shadow-stone-900/20">
                <Brain size={18} />
              </span>
              <div className="leading-tight">
                <h1 className="text-sm font-bold tracking-tight text-slate-800 md:text-base">
                  Self Management
                </h1>
                <p className="hidden text-[11px] text-slate-400 sm:block">
                  Personal OS · satu tempat buat semua progres
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-1.5">
            {!isViewer && (
              <>
                <MenuManager
                  menus={menus}
                  activities={activities}
                  menusCustom={menusCustom}
                  user={user}
                  onUpdate={handleUpdateMenus}
                  onUpdateCustom={handleUpdateCustom}
                />
                <SyncSheetsButton user={user} />
                <ViewerManager user={user} />
                <TelegramSetting user={user} />
              </>
            )}

            <div className="hidden items-center gap-1.5 rounded-xl bg-slate-100/80 px-3 py-1.5 text-[11px] font-medium text-slate-500 lg:flex">
              <CalendarDays size={14} /> {today}
            </div>

            <button
              className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
              onClick={handleLogout}
            >
              <LogOut size={15} /> <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* MOBILE SIDEBAR */}
        <div
          className={`fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity md:hidden ${
            mobileSidebarOpen ? "visible opacity-100" : "invisible opacity-0"
          }`}
          onClick={() => setMobileSidebarOpen(false)}
        />
        <div
          className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-white shadow-2xl transition-transform duration-300 ease-out md:hidden ${
            mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar
            menus={menus}
            collapsed={false}
            setCollapsed={() => {}}
            onCloseMobile={() => setMobileSidebarOpen(false)}
          />
        </div>

        {/* DESKTOP SIDEBAR */}
        <div
          className={`hidden shrink-0 border-r border-slate-200/70 bg-white/60 transition-all duration-300 md:block ${
            sidebarCollapsed ? "w-[74px]" : "w-64"
          }`}
          data-html2canvas-ignore="true"
        >
          <Sidebar
            menus={menus}
            collapsed={sidebarCollapsed}
            setCollapsed={setSidebarCollapsed}
          />
        </div>

        <main id="export-area" className="min-w-0 flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
