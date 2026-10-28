// app/(dashboard)/layout.js
"use client";

import { useEffect, useState } from "react";
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
import { Menu, LogOut, CalendarDays } from "lucide-react";

export default function DashboardLayout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isViewer, setIsViewer] = useState(false);
  const [today, setToday] = useState("");
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

      // Cek apakah user adalah viewer
      try {
        const viewerRef = doc(db, "viewers", currentUser.uid);
        const viewerSnap = await getDoc(viewerRef);
        if (viewerSnap.exists() && viewerSnap.data().passwordHash) {
          setIsViewer(true);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error("[layout] Cek viewer error:", err);
      }

      // Fetch data user untuk MenuManager & Sidebar
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

  useEffect(() => {
    setToday(new Date().toISOString().split("T")[0]);
  }, []);

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
    await setDoc(
      doc(db, "users", user.uid),
      { menusCustom: newCustom },
      { merge: true }
    );
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  // Kalau di route /viewer, jangan tampilkan Navbar owner penuh
  if (isViewerRoute) {
    return (
      <div className="h-screen flex flex-col bg-base-200">
        <div
          className="navbar bg-base-100 shadow-sm px-4 md:px-6"
          data-html2canvas-ignore="true"
        >
          <div className="flex-1">
            <h1 className="text-lg md:text-xl font-bold text-gray-800">
              🌙 Self Management — Viewer
            </h1>
          </div>
          <button
            className="btn btn-ghost btn-sm text-error hover:bg-error/10"
            onClick={handleLogout}
          >
            <LogOut size={16} className="md:mr-1" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
        <main
          id="export-area"
          className="flex-1 overflow-y-auto p-4 md:p-6 bg-base-200"
        >
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-base-200">
      {/* NAVBAR */}
      <div
        className="navbar bg-base-100 shadow-sm px-4 md:px-6 flex-wrap gap-2 z-20 relative"
        data-html2canvas-ignore="true"
      >
        <div className="flex-1 flex items-center gap-2">
          <button
            className="btn btn-ghost btn-sm btn-square md:hidden"
            onClick={() => setMobileSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <h1 className="text-lg md:text-xl font-bold text-gray-800">
            🌙 Self Management
          </h1>
        </div>

        <div className="flex gap-2 items-center flex-wrap justify-end">
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

          <div className="hidden md:flex items-center gap-2 text-sm font-mono text-gray-500 bg-base-200 px-3 py-1.5 rounded-lg">
            <CalendarDays size={16} />
            {today}
          </div>
          <button
            className="btn btn-ghost btn-sm text-error hover:bg-error/10"
            onClick={handleLogout}
          >
            <LogOut size={16} className="md:mr-1" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* MOBILE SIDEBAR DRAWER */}
        <div
          className={`fixed inset-0 bg-black/40 z-40 transition-opacity md:hidden ${
            mobileSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
          onClick={() => setMobileSidebarOpen(false)}
        />
        <div
          className={`fixed inset-y-0 left-0 z-50 w-72 bg-base-100 shadow-xl md:hidden transform transition-transform duration-300 ease-in-out ${
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
          className={`hidden md:block ${
            sidebarCollapsed ? "w-16" : "w-64"
          } transition-all duration-300 bg-base-100 z-10`}
          data-html2canvas-ignore="true"
        >
          <Sidebar
            menus={menus}
            collapsed={sidebarCollapsed}
            setCollapsed={setSidebarCollapsed}
          />
        </div>

        {/* PAGE CONTENT */}
        <main
          id="export-area"
          className="flex-1 overflow-y-auto p-4 md:p-6 bg-base-200"
        >
          {children}
        </main>
      </div>
    </div>
  );
}