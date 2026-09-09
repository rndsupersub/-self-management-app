"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import Sidebar from "@/components/Sidebar";
import MainContent from "@/components/MainContent";
import { DEFAULT_ACTIVITIES } from "@/lib/defaultData";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState("");
  const [progress, setProgress] = useState({});
  const [activities, setActivities] = useState(DEFAULT_ACTIVITIES);
  const [selectedId, setSelectedId] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const router = useRouter();

  // Listener untuk custom event dari MainContent
  useEffect(() => {
    const handler = (e) => {
      setSelectedId(e.detail);
    };
    window.addEventListener('selectActivity', handler);
    return () => window.removeEventListener('selectActivity', handler);
  }, []);

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
        if (typeof data.dailyProgress === 'object' && !Array.isArray(data.dailyProgress)) {
          setProgress(data.dailyProgress || {});
        } else {
          await setDoc(docRef, { dailyProgress: {} }, { merge: true });
          setProgress({});
        }
      } else {
        await setDoc(docRef, {
          activities: DEFAULT_ACTIVITIES,
          dailyProgress: {},
        });
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

  const updateProgress = async (field, value) => {
    if (!user) return;
    const docRef = doc(db, "users", user.uid);
    const todayData = progress[today] || {};
    todayData[field] = { ...todayData[field], ...value };
    const newProgress = { ...progress, [today]: todayData };
    await setDoc(docRef, { dailyProgress: newProgress }, { merge: true });
    setProgress(newProgress);
  };

  const updateActivities = async (newActivities) => {
    if (!user) return;
    setActivities(newActivities);
    const docRef = doc(db, "users", user.uid);
    await updateDoc(docRef, { activities: newActivities });
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="h-screen flex flex-col bg-base-200">
      {/* Navbar */}
      <div className="navbar bg-base-100 shadow px-4">
        <div className="flex-1">
          <h1 className="text-xl font-bold">🌙 Self Management</h1>
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-sm font-mono">{today}</span>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* Body: Sidebar + Main */}
      <div className="flex-1 flex overflow-hidden">
        <div className={`${sidebarCollapsed ? 'w-12' : 'w-64'} transition-all duration-300 bg-base-100`}>
          <Sidebar 
            activities={activities}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onUpdateActivities={updateActivities}
            collapsed={sidebarCollapsed}
            setCollapsed={setSidebarCollapsed}
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          <MainContent 
            selectedId={selectedId}
            activities={activities}
            progress={progress}
            today={today}
            updateProgress={updateProgress}
          />
        </div>
      </div>
    </div>
  );
}