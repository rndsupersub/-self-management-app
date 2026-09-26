"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Sidebar from "@/components/Sidebar";
import KalenderYouTube from "@/components/KalenderYouTube";
import { DEFAULT_ACTIVITIES } from "@/lib/defaultData";
import { YOUTUBE_CHANNELS, KONTEN_STATUS } from "@/lib/youtubeData";

export default function YouTubeDetailPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState("");
  const [activities, setActivities] = useState(DEFAULT_ACTIVITIES);
  const [channels, setChannels] = useState([]);
  const [logs, setLogs] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("kalender");

  const router = useRouter();
  const params = useParams();
  const channelId = params.id;

  useEffect(() => {
    setToday(new Date().toISOString().split("T")[0]);
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
        if (data.activities) setActivities(data.activities);
        if (data.youtube && data.youtube.channels) setChannels(data.youtube.channels);
        else setChannels(YOUTUBE_CHANNELS);
        if (data.youtube_logs) setLogs(data.youtube_logs);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const saveLogsToFirestore = async (newLogs) => {
    if (!user) return;
    setLogs(newLogs);
    const docRef = doc(db, "users", user.uid);
    await updateDoc(docRef, { youtube_logs: newLogs });
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (loading)
    return <div className="flex justify-center items-center h-screen bg-base-200">Loading...</div>;

  const currentChannel =
    channels.find((c) => c.id === channelId) ||
    YOUTUBE_CHANNELS.find((c) => c.id === channelId);
  if (!currentChannel)
    return <div className="flex justify-center items-center h-screen bg-base-200">Channel tidak ditemukan.</div>;

  const channelLogs = logs
    .filter((log) => log.channel === channelId)
    .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

  return (
    <div className="h-screen flex flex-col bg-base-200">
      <div className="navbar bg-base-100 shadow px-4">
        <div className="flex-1">
          <h1 className="text-xl font-bold">🌙 Self Management</h1>
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-sm font-mono">{today}</span>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <div className={`${sidebarCollapsed ? "w-12" : "w-64"} transition-all duration-300 bg-base-100`}>
          <Sidebar
            activities={activities}
            collapsed={sidebarCollapsed}
            setCollapsed={setSidebarCollapsed}
          />
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="text-sm breadcrumbs mb-6">
            <ul>
              <li>
                <a onClick={() => router.push("/dashboard")} className="cursor-pointer">🏠 Dashboard</a>
              </li>
              <li>
                <a onClick={() => router.push("/dashboard/youtube")} className="cursor-pointer">📺 YouTube</a>
              </li>
              <li><span>{currentChannel.nama}</span></li>
            </ul>
          </div>
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">{currentChannel.nama}</h1>
          </div>

          <div className="tabs tabs-boxed bg-white shadow border border-gray-200 mb-4 p-1 w-fit">
            <button
              className={`tab ${activeTab === "kalender" ? "tab-active bg-blue-600 text-white" : ""}`}
              onClick={() => setActiveTab("kalender")}
            >
              📅 Kalender
            </button>
            <button
              className={`tab ${activeTab === "daftar" ? "tab-active bg-blue-600 text-white" : ""}`}
              onClick={() => setActiveTab("daftar")}
            >
              📋 Daftar Konten
            </button>
          </div>

          {activeTab === "kalender" && (
            <KalenderYouTube
              channelId={channelId}
              channelNama={currentChannel.nama}
              logs={logs}
              onUpdateLog={saveLogsToFirestore}
            />
          )}

          {activeTab === "daftar" && (
            <div className="card bg-white shadow border border-gray-200">
              <div className="card-body p-4">
                <h2 className="text-lg font-bold text-gray-800 mb-4">📋 Semua Konten</h2>
                {channelLogs.length === 0 ? (
                  <p className="text-center text-gray-400 py-4">Belum ada konten di channel ini.</p>
                ) : (
                  <div className="space-y-2">
                    {channelLogs.map((log) => {
                      const statusObj = KONTEN_STATUS.find((s) => s.id === log.status);
                      return (
                        <div key={log.id} className="bg-gray-50 border border-gray-200 p-3 rounded-lg flex justify-between items-center">
                          <div>
                            <p className="font-bold text-sm text-gray-800">{log.judul}</p>
                            <p className="text-xs text-gray-500">
                              📅 {log.tanggal} • {log.tipe === "short" ? "📱 Short" : "🖥️ Video"}
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded text-white ${statusObj?.color}`}>
                            {statusObj?.nama}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}