// app/(dashboard)/dashboard/[...slug]/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { DEFAULT_ACTIVITIES } from "@/lib/defaultData";
import Sidebar from "@/components/Sidebar";

export default function ActivityPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState("");
  const [progress, setProgress] = useState({});
  const [activities, setActivities] = useState(DEFAULT_ACTIVITIES);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const router = useRouter();
  const params = useParams();
  const slug = params.slug || [];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.activities && Array.isArray(data.activities)) {
          setActivities(data.activities);
        } else {
          await setDoc(docRef, { activities: DEFAULT_ACTIVITIES }, { merge: true });
          setActivities(DEFAULT_ACTIVITIES);
        }
        if (typeof data.dailyProgress === "object" && !Array.isArray(data.dailyProgress)) {
          setProgress(data.dailyProgress || {});
        } else {
          await setDoc(docRef, { dailyProgress: {} }, { merge: true });
          setProgress({});
        }
      } else {
        await setDoc(docRef, { activities: DEFAULT_ACTIVITIES, dailyProgress: {} });
        setActivities(DEFAULT_ACTIVITIES);
        setProgress({});
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setToday(new Date().toISOString().split("T")[0]);
  }, []);

  // Cari aktivitas berdasarkan slug
  const findItem = (items, path) => {
    if (!path || path.length === 0) return null;
    const [head, ...rest] = path;
    for (const item of items) {
      if (item.id === head) {
        if (rest.length === 0) return item;
        if (item.children) {
          const found = findItem(item.children, rest);
          if (found) return found;
        }
      }
    }
    return null;
  };

  // Cari parent path (untuk breadcrumb)
  const findParentPath = (items, path, currentPath = []) => {
    if (!path || path.length === 0) return currentPath;
    const [head, ...rest] = path;
    for (const item of items) {
      if (item.id === head) {
        if (rest.length === 0) return [...currentPath, item.id];
        if (item.children) {
          const result = findParentPath(item.children, rest, [...currentPath, item.id]);
          if (result.length > currentPath.length) return result;
        }
      }
    }
    return currentPath;
  };

  const selectedActivity = findItem(activities, slug);
  const parentPath = findParentPath(activities, slug).slice(0, -1);

  const updateProgress = async (field, value) => {
    if (!user) return;
    const docRef = doc(db, "users", user.uid);
    const todayData = progress[today] || {};
    todayData[field] = { ...todayData[field], ...value };
    const newProgress = { ...progress, [today]: todayData };
    await setDoc(docRef, { dailyProgress: newProgress }, { merge: true });
    setProgress(newProgress);
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  const todayProgress = progress[today] || {};
  const progressData = selectedActivity ? todayProgress[selectedActivity.id] || {} : {};
  const isLeaf = selectedActivity?.type === "leaf";
  const hasChildren = selectedActivity?.children && selectedActivity.children.length > 0;

  return (
    <div className="h-screen flex flex-col bg-base-200">
      {/* Navbar */}
      <div className="navbar bg-base-100 shadow px-4">
        <div className="flex-1">
          <h1 className="text-xl font-bold">🌙 Self Management</h1>
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-sm font-mono">{today}</span>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className={`${sidebarCollapsed ? "w-12" : "w-64"} transition-all duration-300 bg-base-100`}>
          <Sidebar
            activities={activities}
            collapsed={sidebarCollapsed}
            setCollapsed={setSidebarCollapsed}
          />
        </div>

        {/* Main Content — HANYA KONTEN AKTIVITAS */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Breadcrumb */}
          <div className="text-sm breadcrumbs mb-6">
            <ul>
              <li>
                <a onClick={() => router.push("/dashboard")} className="cursor-pointer">
                  🏠 Dashboard
                </a>
              </li>
              {parentPath.map((id, idx) => {
                const pathSoFar = parentPath.slice(0, idx + 1);
                return (
                  <li key={id}>
                    <a
                      onClick={() => router.push(`/dashboard/${pathSoFar.join("/")}`)}
                      className="cursor-pointer"
                    >
                      {id}
                    </a>
                  </li>
                );
              })}
              {selectedActivity && <li>{selectedActivity.label}</li>}
            </ul>
          </div>

          {/* Aktivitas */}
          {selectedActivity ? (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <h1 className="text-2xl font-bold">{selectedActivity.label}</h1>
                {isLeaf && (
                  <span
                    className={`badge ${
                      Math.min(100, Math.round(((progressData?.page || 0) / (selectedActivity.target || 1)) * 100)) >= 100
                        ? "badge-success"
                        : "badge-ghost"
                    }`}
                  >
                    {Math.min(100, Math.round(((progressData?.page || 0) / (selectedActivity.target || 1)) * 100))}%
                  </span>
                )}
              </div>

              {/* Leaf: Progress Detail */}
              {isLeaf && (
                <div className="space-y-4 max-w-2xl">
                  <div className="card bg-base-100 shadow">
                    <div className="card-body p-4">
                      <h3 className="card-title text-sm">📊 Progress</h3>
                      <progress
                        className="progress progress-primary w-full h-3"
                        value={Math.min(
                          100,
                          Math.round(((progressData?.page || 0) / (selectedActivity.target || 1)) * 100)
                        )}
                        max="100"
                      />
                      <div className="flex justify-between text-sm">
                        <span>
                          {progressData?.page || 0} / {selectedActivity.target || 1} {selectedActivity.unit}
                        </span>
                        <span>
                          {Math.min(
                            100,
                            Math.round(((progressData?.page || 0) / (selectedActivity.target || 1)) * 100)
                          )}
                          %
                        </span>
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
                          placeholder={`Target ${selectedActivity.target || 1}...`}
                          value={progressData?.page || ""}
                          onChange={(e) =>
                            updateProgress(selectedActivity.id, {
                              page: parseInt(e.target.value) || 0,
                            })
                          }
                        />
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            const newVal = Math.min(
                              selectedActivity.target || 1,
                              (progressData?.page || 0) + 1
                            );
                            updateProgress(selectedActivity.id, { page: newVal });
                          }}
                        >
                          +1
                        </button>
                      </div>
                      <input
                        type="text"
                        className="input input-bordered input-sm w-full mt-2"
                        placeholder="Catatan tambahan (opsional)"
                        value={progressData?.note || ""}
                        onChange={(e) => updateProgress(selectedActivity.id, { note: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Expandable: Children Cards */}
              {hasChildren && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedActivity.children.map((child) => {
                    const childProgress = todayProgress[child.id] || {};
                    const childValue = childProgress?.page || 0;
                    const childTarget = child.target || 1;
                    const childPct = Math.min(
                      100,
                      Math.round((childValue / childTarget) * 100)
                    );

                    return (
                      <div
                        key={child.id}
                        className="card bg-base-100 shadow cursor-pointer hover:shadow-lg transition"
                        onClick={() => {
                          router.push(`/dashboard/${[...slug, child.id].join("/")}`);
                        }}
                      >
                        <div className="card-body p-4">
                          <h2 className="card-title text-base">{child.label}</h2>
                          {child.children && child.children.length > 0 ? (
                            <p className="text-sm text-base-content/50">
                              {child.children.length} sub-aktivitas
                            </p>
                          ) : (
                            <div>
                              <progress
                                className="progress progress-primary w-full h-2"
                                value={childPct}
                                max="100"
                              />
                              <p className="text-xs text-base-content/50 mt-1">
                                {childPct}% selesai
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-base-content/50 mt-20">
              <p className="text-2xl mb-2">📋</p>
              <p>Aktivitas tidak ditemukan</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}