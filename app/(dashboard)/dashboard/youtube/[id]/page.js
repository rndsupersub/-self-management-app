// app/(dashboard)/dashboard/youtube/[id]/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import KalenderYouTube from "@/components/KalenderYouTube";
import ExportPDFButton from "@/components/ExportPDFButton";
import { YOUTUBE_CHANNELS, KONTEN_STATUS } from "@/lib/youtubeData";
import { Youtube, Home, Calendar, List, Smartphone, Monitor } from "lucide-react";

export default function YouTubeDetailPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState("");
  const [channels, setChannels] = useState([]);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState("kalender");

  const router = useRouter();
  const params = useParams();
  const channelId = params.id;

  useEffect(() => {
    setToday(new Date().toISOString().split("T")[0]);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push("/login"); return; }
      setUser(user);
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
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
    await updateDoc(doc(db, "users", user.uid), { youtube_logs: newLogs });
  };

  if (loading) return <div className="p-6">Loading...</div>;

  const currentChannel = channels.find((c) => c.id === channelId) || YOUTUBE_CHANNELS.find((c) => c.id === channelId);
  if (!currentChannel) return <div className="p-6 text-center">Channel tidak ditemukan.</div>;

  const channelLogs = logs.filter((log) => log.channel === channelId).sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-sm breadcrumbs mb-4 text-gray-500" data-html2canvas-ignore="true">
        <ul>
          <li><a onClick={() => router.push("/dashboard")} className="cursor-pointer flex items-center gap-1 hover:text-primary"><Home size={14} /> Dashboard</a></li>
          <li><a onClick={() => router.push("/dashboard/youtube")} className="cursor-pointer flex items-center gap-1 hover:text-primary"><Youtube size={14} /> YouTube</a></li>
          <li className="flex items-center gap-1"><Youtube size={14} /> {currentChannel.nama}</li>
        </ul>
      </div>
      
      <div className="mb-6 flex justify-between items-center" data-html2canvas-ignore="true">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Youtube className="text-red-500" size={24} /> {currentChannel.nama}
        </h1>
      </div>

      <div className="tabs tabs-boxed bg-white shadow border border-gray-200 mb-4 p-1 w-fit" data-html2canvas-ignore="true">
        <button className={`tab ${activeTab === "kalender" ? "tab-active bg-blue-600 text-white font-semibold" : "text-gray-600"}`} onClick={() => setActiveTab("kalender")}>
          <Calendar size={16} className="mr-2" /> Kalender
        </button>
        <button className={`tab ${activeTab === "daftar" ? "tab-active bg-blue-600 text-white font-semibold" : "text-gray-600"}`} onClick={() => setActiveTab("daftar")}>
          <List size={16} className="mr-2" /> Daftar Konten
        </button>
      </div>

      <div id="export-area">
        <div className="flex justify-end mb-4" data-html2canvas-ignore="true">
          <ExportPDFButton targetId="export-area" fileName={`YouTube_${currentChannel.nama}_${activeTab}.pdf`} title={`YouTube - ${currentChannel.nama}`} />
        </div>

        {activeTab === "kalender" && (
          <KalenderYouTube channelId={channelId} channelNama={currentChannel.nama} logs={logs} onUpdateLog={saveLogsToFirestore} />
        )}

        {activeTab === "daftar" && (
          <div className="card bg-white shadow border border-gray-200">
            <div className="card-body p-4">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><List size={18} /> Semua Konten</h2>
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
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <Calendar size={12} /> {log.tanggal} • {log.tipe === "short" ? <><Smartphone size={12} /> Short</> : <><Monitor size={12} /> Video</>}
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
  );
}