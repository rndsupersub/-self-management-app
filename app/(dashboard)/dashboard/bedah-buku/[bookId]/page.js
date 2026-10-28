// app/(dashboard)/dashboard/bedah-buku/[bookId]/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import DetailBuku from "@/components/DetailBuku";
import { BookOpen, Home, ChevronRight, Library } from "lucide-react";

export default function DetailBukuPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bedahBuku, setBedahBuku] = useState(null);
  const router = useRouter();
  const params = useParams();
  const bookId = params.bookId;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push("/login"); return; }
      setUser(user);

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.bedahBuku && typeof data.bedahBuku === "object") {
          setBedahBuku({ kategori: data.bedahBuku.kategori || [], buku: data.bedahBuku.buku || [] });
        } else {
          setBedahBuku({ kategori: [], buku: [] });
        }
      } else {
        await setDoc(docRef, { bedahBuku: { kategori: [], buku: [] } });
        setBedahBuku({ kategori: [], buku: [] });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const simpanBedahBuku = async (newBedahBuku) => {
    setBedahBuku(newBedahBuku);
    if (!user) return;
    await setDoc(doc(db, "users", user.uid), { bedahBuku: newBedahBuku }, { merge: true });
  };

  const handleUpdateBuku = async (updatedBuku) => {
    if (!bedahBuku) return;
    await simpanBedahBuku({ ...bedahBuku, buku: bedahBuku.buku.map((b) => b.id === updatedBuku.id ? updatedBuku : b) });
  };

  const handleDeleteBuku = async (bukuId) => {
    if (!bedahBuku) return;
    if (!confirm("Hapus buku ini? Semua riwayat baca bakal hilang.")) return;
    await simpanBedahBuku({ ...bedahBuku, buku: bedahBuku.buku.filter((b) => b.id !== bukuId) });
    router.push("/dashboard/bedah-buku");
  };

  if (loading) return <div className="p-6">Loading...</div>;

  const buku = bedahBuku?.buku?.find((b) => b.id === bookId);

  if (!buku) {
    return (
      <div className="card bg-white shadow border border-gray-200 max-w-md mx-auto mt-10">
        <div className="card-body p-8 text-center text-gray-400">
          <BookOpen size={40} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm mb-4">Buku nggak ditemukan.</p>
          <button className="btn btn-primary btn-sm" onClick={() => router.push("/dashboard/bedah-buku")}>← Balik ke Bedah Buku</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-sm breadcrumbs mb-4 text-gray-500" data-html2canvas-ignore="true">
        <ul>
          <li><a onClick={() => router.push("/dashboard")} className="cursor-pointer flex items-center gap-1 hover:text-primary"><Home size={14} /> Dashboard</a></li>
          <li><a onClick={() => router.push("/dashboard/bedah-buku")} className="cursor-pointer flex items-center gap-1 hover:text-primary"><Library size={14} /> Bedah Buku</a></li>
          <li className="flex items-center gap-1"><BookOpen size={14} /> {buku.judul}</li>
        </ul>
      </div>

      <DetailBuku buku={buku} onUpdateBuku={handleUpdateBuku} onDeleteBuku={handleDeleteBuku} />
    </div>
  );
}