// components/PanduanCari.js
"use client";

// Pencarian panduan: video YouTube asli + tautan panduan tertulis dan sosial
// media. Semua judul/ringkasan video diambil langsung dari YouTube, jadi tidak
// ada langkah karangan. Langkah lengkapnya ada di video/sumber yang dibuka.

import { useCallback, useState } from "react";
import { auth } from "@/lib/firebase";
import {
  BookOpen,
  Camera,
  Clock,
  ExternalLink,
  Eye,
  MessageCircle,
  Music2,
  Play,
  Search,
  Video,
} from "lucide-react";

const CONTOH_PANDUAN = [
  "cara membuat jok set",
  "cara memasang busa jok motor",
  "cara menjahit sarung jok",
  "cara membuat pola jok",
  "cara mengecat velg motor",
  "cara membuat kemasan produk",
];

function KartuVideo({ video }) {
  return (
    <a
      className="card bg-white border border-stone-200 shadow-sm hover:shadow transition overflow-hidden group"
      href={video.tautan}
      target="_blank"
      rel="noopener noreferrer"
      title={`Tonton: ${video.judul}`}
    >
      <div className="relative bg-stone-100">
        {/* Thumbnail resmi YouTube; bukan aset aplikasi. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={video.thumbnail}
          alt={`Thumbnail video ${video.judul}`}
          className="w-full aspect-video object-cover"
          loading="lazy"
        />
        <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-stone-900/30">
          <span className="rounded-full bg-white/90 p-2 text-stone-800">
            <Play size={18} />
          </span>
        </span>
        {video.durasi && (
          <span className="absolute bottom-1.5 right-1.5 rounded bg-stone-900/80 px-1.5 py-0.5 text-[10px] font-semibold text-white">
            {video.durasi}
          </span>
        )}
      </div>
      <div className="p-3 space-y-1.5">
        <h4 className="text-sm font-bold text-stone-800 leading-snug line-clamp-2">
          {video.judul}
        </h4>
        <p className="text-[11px] text-stone-500 truncate">{video.kanal || "YouTube"}</p>
        <div className="flex flex-wrap items-center gap-2 text-[10px] text-stone-400">
          {video.tontonan && (
            <span className="inline-flex items-center gap-1">
              <Eye size={10} /> {video.tontonan}
            </span>
          )}
          {video.tayang && (
            <span className="inline-flex items-center gap-1">
              <Clock size={10} /> {video.tayang}
            </span>
          )}
        </div>
        {video.ringkasan && (
          <p className="text-[11px] text-stone-600 line-clamp-3">{video.ringkasan}</p>
        )}
        <span className="inline-flex items-center gap-1 pt-0.5 text-[11px] font-semibold text-stone-700">
          <Play size={12} /> Tonton di YouTube
          <ExternalLink size={10} />
        </span>
      </div>
    </a>
  );
}

export default function PanduanCari() {
  const [q, setQ] = useState("");
  const [hasil, setHasil] = useState(null);
  const [mencari, setMencari] = useState(false);
  const [pesan, setPesan] = useState("");

  const cari = useCallback(
    async (kata) => {
      const teks = String(kata ?? q).trim();
      if (teks.length < 2) {
        setPesan("Ketik minimal 2 huruf. Contoh: cara membuat jok set.");
        return;
      }

      setMencari(true);
      setPesan("");
      setHasil(null);

      try {
        const user = auth.currentUser;
        if (!user) {
          throw new Error("Sesi login tidak ditemukan. Muat ulang halaman lalu login lagi.");
        }
        const token = await user.getIdToken();
        const param = new URLSearchParams({ q: teks });
        const res = await fetch(`/api/panduan/cari?${param}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) {
          throw new Error(data.error || `Pencarian panduan gagal (kode ${res.status}).`);
        }
        setHasil(data);
        if (data.catatan) setPesan(data.catatan);
      } catch (err) {
        setPesan(err.message || "Pencarian panduan gagal. Coba lagi.");
      } finally {
        setMencari(false);
      }
    },
    [q]
  );

  const contohKlik = (kata) => {
    setQ(kata);
    cari(kata);
  };

  const tautan = hasil?.tautan || {};
  const video = Array.isArray(hasil?.video) ? hasil.video : [];

  return (
    <div className="space-y-4">
      <div className="card bg-white shadow border border-stone-200">
        <div className="card-body p-4 space-y-3">
          <div>
            <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
              <BookOpen size={20} /> Panduan &amp; Tutorial
            </h2>
            <p className="text-xs text-stone-500">
              Cari cara membuat atau memasang sesuatu. Video diambil langsung dari YouTube, lalu
              tautan panduan tertulis dan sosial media disiapkan supaya kamu bisa cek sumbernya
              sendiri. Aplikasi tidak mengarang langkah.
            </p>
          </div>

          <form
            className="flex flex-col sm:flex-row gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              cari();
            }}
          >
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                className="input input-bordered w-full pl-10 text-stone-800 bg-white"
                placeholder="mis. cara membuat jok set, cara memasang busa jok"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                aria-label="Kata kunci panduan"
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={mencari}>
              {mencari ? (
                <>
                  <span className="loading loading-spinner loading-xs mr-1" /> Mencari...
                </>
              ) : (
                <>
                  <Search size={16} className="mr-1" /> Cari panduan
                </>
              )}
            </button>
          </form>

          <div className="flex flex-wrap gap-1 items-center">
            <span className="text-xs text-stone-400 mr-1">Coba:</span>
            {CONTOH_PANDUAN.map((kata) => (
              <button
                key={kata}
                type="button"
                className="btn btn-xs btn-ghost text-stone-600 hover:text-stone-900"
                onClick={() => contohKlik(kata)}
              >
                {kata}
              </button>
            ))}
          </div>
        </div>
      </div>

      {pesan && (
        <div className="rounded border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          {pesan}
        </div>
      )}

      {mencari && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card bg-white border border-stone-200">
              <div className="aspect-video bg-stone-200 animate-pulse" />
              <div className="p-3 space-y-2 animate-pulse">
                <div className="h-3 bg-stone-200 rounded w-5/6" />
                <div className="h-3 bg-stone-100 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!mencari && hasil && video.length > 0 && (
        <div className="space-y-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-sm font-bold text-stone-800">
              {video.length} video untuk &quot;{hasil.q}&quot;
            </h3>
            {tautan.youtube && (
              <a
                className="btn btn-xs bg-white border border-stone-300 text-stone-700 hover:border-stone-500"
                href={tautan.youtube}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Video size={12} className="mr-1" /> Semua hasil YouTube
                <ExternalLink size={10} className="ml-1" />
              </a>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {video.map((item) => (
              <KartuVideo key={item.id} video={item} />
            ))}
          </div>
        </div>
      )}

      {!mencari && hasil && (
        <div className="card bg-white border border-stone-200">
          <div className="card-body p-4 space-y-3">
            <div>
              <h3 className="text-sm font-bold text-stone-800">
                Panduan tertulis &amp; sosial media
              </h3>
              <p className="text-xs text-stone-500">
                Situs-situs ini memblokir pembacaan otomatis dari server, jadi hasilnya dibuka
                langsung di tab baru supaya kamu melihat tulisan/video yang asli dan terbaru.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {tautan.google && (
                <a
                  className="btn btn-sm bg-stone-800 text-white border-stone-800 hover:bg-stone-700"
                  href={tautan.google}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Search size={13} className="mr-1" /> Cari panduan di Google
                  <ExternalLink size={10} className="ml-1" />
                </a>
              )}
              {tautan.tiktok && (
                <a
                  className="btn btn-sm bg-white border border-stone-300 text-stone-700 hover:border-stone-500"
                  href={tautan.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Music2 size={13} className="mr-1" /> TikTok
                </a>
              )}
              {tautan.instagram && (
                <a
                  className="btn btn-sm bg-white border border-stone-300 text-stone-700 hover:border-stone-500"
                  href={tautan.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Camera size={13} className="mr-1" /> Instagram
                </a>
              )}
              {tautan.facebook && (
                <a
                  className="btn btn-sm bg-white border border-stone-300 text-stone-700 hover:border-stone-500"
                  href={tautan.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle size={13} className="mr-1" /> Facebook
                </a>
              )}
            </div>
            <p className="text-[11px] text-stone-400">
              Tips: buka 2–3 video, catat bahan dan alat yang dipakai, lalu cocokkan dengan
              pengalaman orang di komentar. Cara paling aman: coba dulu pada bahan sisa sebelum
              mengerjakan barang utama.
            </p>
          </div>
        </div>
      )}

      {!mencari && !hasil && (
        <div className="card bg-white shadow border border-stone-200">
          <div className="card-body p-8 text-center text-stone-400">
            <BookOpen size={40} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm text-stone-500">
              Ketik apa yang ingin kamu pelajari. Contoh: &quot;cara membuat jok set&quot;.
            </p>
            <p className="text-xs mt-1">
              Hasilnya berupa video YouTube asli, plus tautan panduan tertulis dan sosial media.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
