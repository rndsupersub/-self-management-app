// components/PanduanCari.js
"use client";

// Panduan & tutorial: hasil pencarian disusun jadi panduan bertahap
// (persiapan → langkah → tips → sumber). Panduan bisa disimpan, diganti nama,
// diedit, dihapus, dan diekspor ke PDF.

import { useCallback, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { generateId } from "@/lib/vendorData";
import ExportPDFButton from "@/components/ExportPDFButton";
import {
  BookOpen,
  Camera,
  Check,
  Clock,
  ExternalLink,
  Eye,
  MessageCircle,
  Music2,
  Pencil,
  Play,
  Plus,
  Save,
  Search,
  Tag,
  Trash2,
  Video,
  X,
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
        <span className="inline-flex items-center gap-1 pt-0.5 text-[11px] font-semibold text-stone-700">
          <Play size={12} /> Tonton di YouTube
          <ExternalLink size={10} />
        </span>
      </div>
    </a>
  );
}

function DaftarPoin({ bagian }) {
  const bernomor = bagian.id === "langkah";
  const List = bernomor ? "ol" : "ul";
  return (
    <List
      className={`space-y-1.5 pl-4 ${bernomor ? "list-decimal" : "list-disc"} marker:text-stone-400`}
    >
      {bagian.poin.map((poin, i) => (
        <li key={i} className="text-sm text-stone-700 leading-relaxed">
          <span>{poin.teks}</span>
          {poin.tautan && (
            <a
              className="ml-1 text-xs text-stone-500 underline decoration-stone-300 hover:text-stone-800"
              href={poin.tautan}
              target="_blank"
              rel="noopener noreferrer"
              title={poin.sumber ? `Buka sumber: ${poin.sumber}` : "Buka sumber"}
            >
              [sumber]
            </a>
          )}
        </li>
      ))}
    </List>
  );
}

export default function PanduanCari() {
  const [q, setQ] = useState("");
  const [hasil, setHasil] = useState(null);
  const [mencari, setMencari] = useState(false);
  const [pesan, setPesan] = useState("");

  const [tersimpan, setTersimpan] = useState([]);
  const [aktifId, setAktifId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [info, setInfo] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        const list = snap.data()?.panduanTersimpan;
        if (Array.isArray(list)) setTersimpan(list);
      } catch (err) {
        console.error("[panduan] Gagal memuat panduan tersimpan:", err?.message || err);
      }
    });
    return () => unsubscribe();
  }, []);

  const simpanDaftar = useCallback(async (list) => {
    setTersimpan(list);
    const user = auth.currentUser;
    if (!user) return;
    await setDoc(doc(db, "users", user.uid), { panduanTersimpan: list }, { merge: true });
  }, []);

  const cari = useCallback(
    async (kata) => {
      const teks = String(kata ?? q).trim();
      if (teks.length < 2) {
        setPesan("Ketik minimal 2 huruf. Contoh: cara membuat jok set.");
        return;
      }

      setMencari(true);
      setPesan("");
      setInfo("");
      setHasil(null);
      setAktifId(null);
      setDraft(null);

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

  const tersimpanAktif = aktifId ? tersimpan.find((p) => p.id === aktifId) || null : null;
  const panduanBaru = hasil
    ? {
        id: null,
        judul: hasil.judul || `Panduan: ${hasil.q}`,
        topik: hasil.q,
        ringkas: hasil.ringkas || hasil.ringkasan?.ringkas || "",
        bagian: hasil.bagian || [],
        video: hasil.video || [],
        tautan: hasil.tautan || {},
        createdAt: null,
      }
    : null;
  const panduanAktif = draft || tersimpanAktif || panduanBaru;
  const sedangEdit = Boolean(draft);

  const simpanHasil = async () => {
    if (!panduanBaru) return;
    const baru = {
      ...panduanBaru,
      id: generateId("panduan"),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const list = [baru, ...tersimpan];
    try {
      await simpanDaftar(list);
      setAktifId(baru.id);
      setInfo("Panduan disimpan. Bisa diedit, diganti nama, atau diekspor ke PDF.");
    } catch (err) {
      setInfo(`Gagal menyimpan: ${err?.message || "coba lagi."}`);
    }
  };

  const mulaiEdit = () => {
    const sumber = tersimpanAktif;
    if (!sumber) {
      setInfo("Simpan panduan dulu, lalu bisa diedit.");
      return;
    }
    setDraft(JSON.parse(JSON.stringify(sumber)));
    setInfo("");
  };

  const batalEdit = () => {
    setDraft(null);
    setInfo("");
  };

  const ubahDraft = (patch) => setDraft((d) => (d ? { ...d, ...patch } : d));

  const ubahPoin = (bi, pi, teks) =>
    setDraft((d) => {
      if (!d) return d;
      const bagian = d.bagian.map((b, i) =>
        i === bi
          ? { ...b, poin: b.poin.map((p, j) => (j === pi ? { ...p, teks } : p)) }
          : b
      );
      return { ...d, bagian };
    });

  const hapusPoin = (bi, pi) =>
    setDraft((d) => {
      if (!d) return d;
      return {
        ...d,
        bagian: d.bagian.map((b, i) =>
          i === bi ? { ...b, poin: b.poin.filter((_, j) => j !== pi) } : b
        ),
      };
    });

  const tambahPoin = (bi) =>
    setDraft((d) => {
      if (!d) return d;
      return {
        ...d,
        bagian: d.bagian.map((b, i) =>
          i === bi ? { ...b, poin: [...b.poin, { teks: "", tautan: "" }] } : b
        ),
      };
    });

  const tambahBagian = () =>
    setDraft((d) =>
      d
        ? {
            ...d,
            bagian: [
              ...d.bagian,
              { id: generateId("bagian"), judul: "📝 Bagian Baru", poin: [{ teks: "", tautan: "" }] },
            ],
          }
        : d
    );

  const hapusBagian = (bi) =>
    setDraft((d) =>
      d ? { ...d, bagian: d.bagian.filter((_, i) => i !== bi) } : d
    );

  const simpanEdit = async () => {
    if (!draft) return;
    const rapi = {
      ...draft,
      judul: String(draft.judul || "").trim() || `Panduan: ${draft.topik || "tanpa judul"}`,
      bagian: draft.bagian
        .map((b) => ({
          ...b,
          judul: String(b.judul || "").trim(),
          poin: b.poin
            .map((p) => ({ ...p, teks: String(p.teks || "").trim() }))
            .filter((p) => p.teks),
        }))
        .filter((b) => b.judul && b.poin.length > 0),
      updatedAt: new Date().toISOString(),
    };
    const list = tersimpan.map((p) => (p.id === rapi.id ? rapi : p));
    try {
      await simpanDaftar(list);
      setAktifId(rapi.id);
      setDraft(null);
      setInfo("Perubahan panduan disimpan.");
    } catch (err) {
      setInfo(`Gagal menyimpan: ${err?.message || "coba lagi."}`);
    }
  };

  const hapusPanduan = async (id) => {
    if (!confirm("Hapus panduan ini? Tindakan ini tidak bisa dibatalkan.")) return;
    const list = tersimpan.filter((p) => p.id !== id);
    try {
      await simpanDaftar(list);
      if (aktifId === id) {
        setAktifId(null);
        setDraft(null);
      }
      setInfo("Panduan dihapus.");
    } catch (err) {
      setInfo(`Gagal menghapus: ${err?.message || "coba lagi."}`);
    }
  };

  const bukaTersimpan = (id) => {
    setAktifId(id);
    setHasil(null);
    setDraft(null);
    setPesan("");
    setInfo("");
  };

  const tautan = panduanAktif?.tautan || hasil?.tautan || {};
  const video = Array.isArray(panduanAktif?.video) ? panduanAktif.video : [];
  const namaFile = `panduan_${(panduanAktif?.topik || "panduan").replace(/[^a-z0-9]+/gi, "_")}.pdf`;

  return (
    <div className="space-y-4">
      <div className="card bg-white shadow border border-stone-200">
        <div className="card-body p-4 space-y-3">
          <div>
            <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
              <BookOpen size={20} /> Panduan &amp; Tutorial
            </h2>
            <p className="text-xs text-stone-500">
              Cari cara membuat atau memasang sesuatu. Hasilnya disusun jadi panduan bertahap:
              persiapan bahan &amp; alat, langkah-langkah, tips, lalu sumber video dan artikel asli.
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
      {info && (
        <div className="rounded border border-stone-200 bg-stone-50 p-3 text-xs text-stone-700">
          {info}
        </div>
      )}

      {/* PANDUAN TERSIMPAN */}
      {tersimpan.length > 0 && (
        <div className="card bg-white shadow border border-stone-200">
          <div className="card-body p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-bold text-stone-700 flex items-center gap-1">
                <Save size={13} /> Panduan tersimpan ({tersimpan.length})
              </h3>
              <span className="text-[10px] text-stone-400">Klik untuk membuka</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tersimpan.map((p) => (
                <div
                  key={p.id}
                  className={`flex items-center rounded-full border overflow-hidden ${
                    aktifId === p.id
                      ? "border-stone-800 bg-stone-800 text-white"
                      : "border-stone-300 bg-white text-stone-700"
                  }`}
                >
                  <button
                    type="button"
                    className="px-2.5 py-1 text-[11px] max-w-[220px] truncate"
                    onClick={() => bukaTersimpan(p.id)}
                    title={p.judul}
                  >
                    {p.judul}
                  </button>
                  <button
                    type="button"
                    className={`px-1.5 py-1 ${aktifId === p.id ? "hover:bg-stone-700" : "hover:bg-stone-100"}`}
                    onClick={() => hapusPanduan(p.id)}
                    title="Hapus panduan"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {mencari && (
        <div className="card bg-white border border-stone-200">
          <div className="card-body p-6 text-center text-sm text-stone-500">
            <span className="loading loading-spinner loading-sm mx-auto mb-2" />
            Mengambil video dan menyusun panduan...
          </div>
        </div>
      )}

      {!mencari && panduanAktif && (
        <div className="card bg-white shadow border border-stone-200">
          <div className="card-body p-4 space-y-3">
            <div className="flex flex-wrap justify-between items-start gap-2" data-html2canvas-ignore="true">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-stone-400">
                  {tersimpanAktif ? "Panduan tersimpan" : "Hasil pencarian"}
                </p>
                <h3 className="text-base font-bold text-stone-800">
                  {sedangEdit ? "Edit panduan" : panduanAktif.judul}
                </h3>
              </div>
              <div className="flex flex-wrap gap-1">
                {!tersimpanAktif && panduanBaru && (
                  <button className="btn btn-primary btn-xs" onClick={simpanHasil}>
                    <Save size={12} className="mr-1" /> Simpan panduan
                  </button>
                )}
                {tersimpanAktif && !sedangEdit && (
                  <button className="btn btn-outline btn-xs text-stone-700" onClick={mulaiEdit}>
                    <Pencil size={12} className="mr-1" /> Edit / Ganti nama
                  </button>
                )}
                {sedangEdit && (
                  <>
                    <button className="btn btn-primary btn-xs" onClick={simpanEdit}>
                      <Check size={12} className="mr-1" /> Simpan perubahan
                    </button>
                    <button className="btn btn-ghost btn-xs text-stone-600" onClick={batalEdit}>
                      <X size={12} className="mr-1" /> Batal
                    </button>
                  </>
                )}
                {tersimpanAktif && !sedangEdit && (
                  <button
                    className="btn btn-ghost btn-xs text-stone-400 hover:text-error"
                    onClick={() => hapusPanduan(tersimpanAktif.id)}
                  >
                    <Trash2 size={12} className="mr-1" /> Hapus
                  </button>
                )}
                {!sedangEdit && (
                  <ExportPDFButton
                    targetId="panduan-export-area"
                    fileName={namaFile}
                    title={panduanAktif.judul}
                  />
                )}
              </div>
            </div>

            {sedangEdit ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-stone-600 mb-1 block">Judul panduan</label>
                  <input
                    type="text"
                    className="input input-bordered input-sm w-full text-stone-800 bg-white"
                    value={draft.judul}
                    onChange={(e) => ubahDraft({ judul: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-600 mb-1 block">Ringkasan</label>
                  <textarea
                    className="textarea textarea-bordered w-full text-sm text-stone-800 bg-white"
                    rows="2"
                    value={draft.ringkas || ""}
                    onChange={(e) => ubahDraft({ ringkas: e.target.value })}
                  />
                </div>
                {(draft.bagian || []).map((bagian, bi) => (
                  <div key={bagian.id || bi} className="rounded border border-stone-200 bg-stone-50 p-2 space-y-2">
                    <div className="flex gap-1">
                      <input
                        type="text"
                        className="input input-bordered input-xs flex-1 text-stone-800 bg-white"
                        value={bagian.judul}
                        onChange={(e) =>
                          ubahDraft({
                            bagian: draft.bagian.map((b, i) =>
                              i === bi ? { ...b, judul: e.target.value } : b
                            ),
                          })
                        }
                      />
                      <button
                        className="btn btn-ghost btn-xs text-stone-400 hover:text-error"
                        onClick={() => hapusBagian(bi)}
                        title="Hapus bagian"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    {bagian.poin.map((poin, pi) => (
                      <div key={pi} className="flex gap-1 items-start">
                        <textarea
                          className="textarea textarea-bordered textarea-xs flex-1 text-stone-800 bg-white"
                          rows="2"
                          value={poin.teks}
                          onChange={(e) => ubahPoin(bi, pi, e.target.value)}
                        />
                        <button
                          className="btn btn-ghost btn-xs text-stone-400 hover:text-error"
                          onClick={() => hapusPoin(bi, pi)}
                          title="Hapus poin"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                    <button className="btn btn-ghost btn-xs text-stone-600" onClick={() => tambahPoin(bi)}>
                      <Plus size={12} className="mr-1" /> Tambah poin
                    </button>
                  </div>
                ))}
                <button className="btn btn-outline btn-xs text-stone-700" onClick={tambahBagian}>
                  <Plus size={12} className="mr-1" /> Tambah bagian
                </button>
              </div>
            ) : (
              <div id="panduan-export-area" className="space-y-4">
                {panduanAktif.ringkas && (
                  <p className="text-sm text-stone-700 leading-relaxed">{panduanAktif.ringkas}</p>
                )}

                {(panduanAktif.bagian || []).length === 0 && (
                  <p className="text-sm text-stone-500">
                    Panduan ini belum punya bagian. Klik Edit untuk menambahkan langkah.
                  </p>
                )}

                {(panduanAktif.bagian || []).map((bagian) => (
                  <section key={bagian.id} className="space-y-1.5">
                    <h4 className="text-sm font-bold text-stone-800">{bagian.judul}</h4>
                    {bagian.poin.length > 0 ? (
                      <DaftarPoin bagian={bagian} />
                    ) : (
                      <p className="text-xs text-stone-400 italic">Belum ada poin.</p>
                    )}
                  </section>
                ))}

                <p className="text-[10px] text-stone-400 border-t border-stone-200 pt-2">
                  Diringkas dari judul, deskripsi, dan tautan video asli di YouTube — bukan langkah
                  karangan. Langkah paling akurat tetap ada di video/sumber yang dibuka.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUMBER VIDEO */}
      {!mencari && video.length > 0 && (
        <div className="space-y-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-sm font-bold text-stone-800">
              🎬 {video.length} video sumber
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

      {/* SUMBER LAIN */}
      {!mencari && (panduanAktif || hasil) && (
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

      {!mencari && !panduanAktif && tersimpan.length === 0 && (
        <div className="card bg-white shadow border border-stone-200">
          <div className="card-body p-8 text-center text-stone-400">
            <BookOpen size={40} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm text-stone-500">
              Ketik apa yang ingin kamu pelajari. Contoh: &quot;cara membuat jok set&quot;.
            </p>
            <p className="text-xs mt-1">
              Panduan tersimpan akan muncul di sini dan bisa diedit atau diekspor ke PDF.
            </p>
          </div>
        </div>
      )}

      {!mencari && hasil?.ringkasan?.saranPersempit?.length > 0 && (
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[11px] text-stone-400 flex items-center gap-1 mr-1">
            <Tag size={11} /> Persempit:
          </span>
          {hasil.ringkasan.saranPersempit.map((kata) => (
            <button
              key={kata}
              type="button"
              className="btn btn-xs bg-white border border-stone-300 text-stone-700 hover:border-stone-500"
              onClick={() => contohKlik(kata)}
            >
              {kata}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
