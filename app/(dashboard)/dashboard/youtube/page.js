// app/(dashboard)/dashboard/youtube/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import ExportPDFButton from "@/components/ExportPDFButton";
import { YOUTUBE_CHANNELS } from "@/lib/youtubeData";
import { Youtube, Pencil, Trash2, ArrowRight, Home } from "lucide-react";

const generateId = (prefix = "ch") => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

export default function YouTubePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState("");
  const [channels, setChannels] = useState(YOUTUBE_CHANNELS);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ nama: "" });
  const router = useRouter();

  useEffect(() => {
    setToday(new Date().toISOString().split("T")[0]);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push("/login"); return; }
      setUser(user);
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.youtube && Array.isArray(data.youtube.channels)) {
          setChannels(data.youtube.channels);
        } else {
          await setDoc(docRef, { youtube: { channels: YOUTUBE_CHANNELS } }, { merge: true });
          setChannels(YOUTUBE_CHANNELS);
        }
      } else {
        await setDoc(docRef, { youtube: { channels: YOUTUBE_CHANNELS } });
        setChannels(YOUTUBE_CHANNELS);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const simpanChannels = async (newChannels) => {
    setChannels(newChannels);
    await setDoc(doc(db, "users", user.uid), { youtube: { channels: newChannels } }, { merge: true });
  };

  const handleTambahChannel = async () => {
    if (!formData.nama.trim()) return;
    const newChannelItem = { id: generateId("ch"), nama: formData.nama };
    await simpanChannels([...channels, newChannelItem]);
    setFormData({ nama: "" });
    setShowForm(false);
  };

  const handleRenameChannel = async (chId, currentNama, e) => {
    e.stopPropagation();
    const newNama = window.prompt("Ganti nama channel jadi:", currentNama);
    if (!newNama || !newNama.trim() || newNama.trim() === currentNama) return;
    await simpanChannels(channels.map((c) => c.id === chId ? { ...c, nama: newNama.trim() } : c));
  };

  const handleHapusChannel = async (chId, e) => {
    e.stopPropagation();
    if (!confirm("Hapus channel ini? Semua konten di dalamnya akan hilang.")) return;
    await simpanChannels(channels.filter((c) => c.id !== chId));
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-sm breadcrumbs mb-4 text-gray-500" data-html2canvas-ignore="true">
        <ul>
          <li><a onClick={() => router.push("/dashboard")} className="cursor-pointer flex items-center gap-1 hover:text-primary"><Home size={14} /> Dashboard</a></li>
          <li className="flex items-center gap-1"><Youtube size={14} /> YouTube</li>
        </ul>
      </div>

      <div className="flex justify-between items-center mb-6" data-html2canvas-ignore="true">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Youtube className="text-primary" size={24} /> YouTube
        </h1>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>+ Tambah Channel</button>
      </div>

      {showForm && (
        <div className="card bg-white shadow border border-gray-200 mb-4" data-html2canvas-ignore="true">
          <div className="card-body p-4">
            <p className="text-xs font-semibold text-blue-700 mb-2">Tambah channel baru</p>
            <input type="text" className="input input-bordered w-full text-gray-800 bg-white" placeholder="Nama channel" value={formData.nama} onChange={(e) => setFormData({ nama: e.target.value })} autoFocus />
            <div className="flex gap-2 mt-3">
              <button className="btn btn-primary btn-sm flex-1" onClick={handleTambahChannel}>Simpan</button>
              <button className="btn btn-ghost btn-sm text-gray-700" onClick={() => setShowForm(false)}>Batal</button>
            </div>
          </div>
        </div>
      )}

      <div id="export-area">
        <div className="flex justify-end mb-4" data-html2canvas-ignore="true">
          <ExportPDFButton targetId="export-area" fileName={`YouTube_Channels_${today}.pdf`} title="Daftar Channel YouTube" />
        </div>

        {channels.length === 0 ? (
          <div className="card bg-white shadow border border-gray-200">
            <div className="card-body p-8 text-center text-gray-400">
              <Youtube size={40} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Belum ada channel. Klik "+ Tambah Channel" untuk mulai.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {channels.map((ch) => (
              <div key={ch.id} className="card bg-white shadow border border-gray-200 hover:shadow-lg transition cursor-pointer" onClick={() => router.push(`/dashboard/youtube/${ch.id}`)}>
                <div className="card-body p-4">
                  <div className="flex justify-between items-start">
                    <h2 className="card-title text-base text-gray-800 flex items-center gap-2">
                      <Youtube size={18} className="text-red-500" /> {ch.nama}
                    </h2>
                    <div className="flex gap-1" data-html2canvas-ignore="true">
                      <button className="btn btn-ghost btn-xs text-blue-500" onClick={(e) => handleRenameChannel(ch.id, ch.nama, e)}><Pencil size={14} /></button>
                      <button className="btn btn-ghost btn-xs text-red-500" onClick={(e) => handleHapusChannel(ch.id, e)}><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <div className="card-actions justify-end mt-2">
                    <span className="text-gray-400 text-xs flex items-center gap-1 hover:text-primary transition">Buka <ArrowRight size={12} /></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}