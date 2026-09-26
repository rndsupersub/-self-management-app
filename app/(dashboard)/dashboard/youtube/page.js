"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Sidebar from "@/components/Sidebar";
import { DEFAULT_ACTIVITIES } from "@/lib/defaultData";
import { YOUTUBE_CHANNELS } from "@/lib/youtubeData";

const generateId = (prefix = "ch") => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

export default function YouTubePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState("");
  const [activities, setActivities] = useState(DEFAULT_ACTIVITIES);
  const [channels, setChannels] = useState(YOUTUBE_CHANNELS);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ nama: "" });
  const router = useRouter();

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
        if (data.youtube && Array.isArray(data.youtube.channels)) {
          setChannels(data.youtube.channels);
        } else {
          await setDoc(docRef, { youtube: { channels: YOUTUBE_CHANNELS } }, { merge: true });
          setChannels(YOUTUBE_CHANNELS);
        }
      } else {
        await setDoc(docRef, {
          activities: DEFAULT_ACTIVITIES,
          youtube: { channels: YOUTUBE_CHANNELS },
        });
        setActivities(DEFAULT_ACTIVITIES);
        setChannels(YOUTUBE_CHANNELS);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    setToday(new Date().toISOString().split("T")[0]);
  }, []);

  const simpanChannels = async (newChannels) => {
    setChannels(newChannels);
    const docRef = doc(db, "users", user.uid);
    await setDoc(docRef, { youtube: { channels: newChannels } }, { merge: true });
  };

  const handleTambahChannel = async () => {
    if (!formData.nama.trim()) return;
    const newChannelItem = { id: generateId("ch"), nama: formData.nama };
    const updated = [...channels, newChannelItem];
    await simpanChannels(updated);
    setFormData({ nama: "" });
    setShowForm(false);
  };

  // ========== RENAME CHANNEL (BARU) ==========
  const handleRenameChannel = async (chId, currentNama, e) => {
    e.stopPropagation();
    const newNama = window.prompt("Ganti nama channel jadi:", currentNama);
    if (!newNama || !newNama.trim() || newNama.trim() === currentNama) return;
    const updated = channels.map((c) =>
      c.id === chId ? { ...c, nama: newNama.trim() } : c
    );
    await simpanChannels(updated);
  };

  const handleHapusChannel = async (chId, e) => {
    e.stopPropagation();
    if (!confirm("Hapus channel ini? Semua konten di dalamnya akan hilang.")) return;
    const updated = channels.filter((c) => c.id !== chId);
    await simpanChannels(updated);
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (loading) return <div className="flex justify-center items-center h-screen bg-base-200">Loading...</div>;

  return (
    <div className="h-screen flex flex-col bg-base-200">
      <div className="navbar bg-base-100 shadow px-4">
        <div className="flex-1"><h1 className="text-xl font-bold">🌙 Self Management</h1></div>
        <div className="flex gap-2 items-center">
          <span className="text-sm font-mono">{today}</span>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <div className={`${sidebarCollapsed ? "w-12" : "w-64"} transition-all duration-300 bg-base-100`}>
          <Sidebar activities={activities} collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="text-sm breadcrumbs mb-6">
            <ul>
              <li><a onClick={() => router.push("/dashboard")} className="cursor-pointer">🏠 Dashboard</a></li>
              <li>📺 YouTube</li>
            </ul>
          </div>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">📺 YouTube</h1>
            <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>+ Tambah Channel</button>
          </div>

          {showForm && (
            <div className="card bg-white shadow border border-gray-200 mb-4">
              <div className="card-body p-4">
                <p className="text-xs font-semibold text-blue-700 mb-2">✏️ Tambah channel baru</p>
                <input type="text" className="input input-bordered w-full text-gray-800 bg-white" placeholder="Nama channel (misal: 🎥 Channel Vlog)" value={formData.nama} onChange={(e) => setFormData({ nama: e.target.value })} autoFocus />
                <div className="flex gap-2 mt-3">
                  <button className="btn btn-primary btn-sm flex-1" onClick={handleTambahChannel}>➕ Tambah</button>
                  <button className="btn btn-ghost btn-sm text-gray-700" onClick={() => setShowForm(false)}>Batal</button>
                </div>
              </div>
            </div>
          )}

          {channels.length === 0 ? (
            <div className="card bg-white shadow border border-gray-200">
              <div className="card-body p-8 text-center text-gray-400">
                <p className="text-3xl mb-2">📺</p>
                <p className="text-sm">Belum ada channel. Klik "+ Tambah Channel" untuk mulai.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {channels.map((ch) => (
                <div key={ch.id} className="card bg-white shadow border border-gray-200 hover:shadow-lg transition cursor-pointer" onClick={() => router.push(`/dashboard/youtube/${ch.id}`)}>
                  <div className="card-body p-4">
                    <div className="flex justify-between items-start">
                      <h2 className="card-title text-base text-gray-800">{ch.nama}</h2>
                      <div className="flex gap-1">
                        <button className="btn btn-ghost btn-xs text-blue-500" onClick={(e) => handleRenameChannel(ch.id, ch.nama, e)} title="Rename Channel">✏️</button>
                        <button className="btn btn-ghost btn-xs text-red-500" onClick={(e) => handleHapusChannel(ch.id, e)} title="Hapus Channel">🗑️</button>
                      </div>
                    </div>
                    <div className="card-actions justify-end mt-2"><span className="text-gray-400 text-sm">Buka →</span></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}