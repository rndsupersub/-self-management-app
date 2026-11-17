// components/DumpIdeas.js
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Lightbulb, Plus, Pencil, Trash2, Eye, EyeOff, X, Save, Network,
  PenLine, Presentation, ChevronLeft, ChevronRight, Eraser, Undo2,
  Search, Calendar, ArrowLeft, Bold, Italic, Underline, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, RemoveFormatting,
} from "lucide-react";
import {
  TIPE_IDE, normalisasiIde, mindmapKosong, slideKosong, susunMindmap,
  tambahAnak, ubahTeksNode, hapusNode, labelTipe, ringkasIde, idBaru,
  bersihkanHtml, isiSlideKeHtml,
} from "@/lib/dumpIdeas";

const IKON_TIPE = { mindmap: Network, gambar: PenLine, slide: Presentation };

// Biar teks hasil editor berformat (bold, judul, list) tampil rapi di layar
// maupun waktu di-print.
const KELAS_TEKS =
  "text-sm text-gray-800 leading-relaxed [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2";

const formatTanggal = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
};

// ======================= MINDMAP =======================
function MindmapKanvas({ root, pilih, onPilih }) {
  const tata = useMemo(() => susunMindmap(root), [root]);
  return (
    <div className="overflow-auto border border-gray-200 rounded bg-gray-50/60 p-3" style={{ maxHeight: 520 }}>
      <div className="relative" style={{ width: tata.lebar, height: tata.tinggi, minWidth: "100%" }}>
        <svg className="absolute left-0 top-0 pointer-events-none" width={tata.lebar} height={tata.tinggi}>
          {tata.links.map((l, i) => (
            <path
              key={i}
              d={`M ${l.dari.x + 172} ${l.dari.y + 18} C ${l.dari.x + 200} ${l.dari.y + 18}, ${l.ke.x - 26} ${l.ke.y + 18}, ${l.ke.x} ${l.ke.y + 18}`}
              stroke="#94a3b8"
              strokeWidth="1.5"
              fill="none"
            />
          ))}
        </svg>
        {tata.nodes.map((n) => {
          const isi = (
            <span className="block text-xs leading-snug line-clamp-2">{n.teks || "(tanpa teks)"}</span>
          );
          const kelas = n.depth === 0
            ? "bg-blue-600 text-white border-blue-700 font-semibold"
            : n.depth === 1
            ? "bg-white text-gray-800 border-gray-300 font-medium"
            : "bg-white text-gray-700 border-gray-200";
          const gaya = { left: n.x, top: n.y, width: 172, minHeight: 36 };

          if (!onPilih) {
            return (
              <div key={n.id} className={`absolute px-3 py-2 rounded-lg border shadow-sm ${kelas}`} style={gaya}>
                {isi}
              </div>
            );
          }
          return (
            <button
              key={n.id}
              onClick={() => onPilih(n.id)}
              className={`absolute text-left px-3 py-2 rounded-lg border shadow-sm transition ${kelas} ${pilih === n.id ? "ring-2 ring-blue-400" : ""}`}
              style={gaya}
              title={n.teks}
            >
              {isi}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MindmapEditor({ value, onChange }) {
  const [pilih, setPilih] = useState(value.root.id);
  const [teksCabang, setTeksCabang] = useState("");

  const node = useMemo(() => {
    const cari = (n) => {
      if (n.id === pilih) return n;
      for (const a of n.anak || []) {
        const hasil = cari(a);
        if (hasil) return hasil;
      }
      return null;
    };
    return cari(value.root) || value.root;
  }, [value, pilih]);

  const tambah = () => {
    if (!teksCabang.trim()) return;
    onChange({ root: tambahAnak(JSON.parse(JSON.stringify(value.root)), node.id, teksCabang.trim()) });
    setTeksCabang("");
  };

  return (
    <div className="space-y-3">
      <MindmapKanvas root={value.root} pilih={pilih} onPilih={setPilih} />
      <div className="bg-blue-50 border border-blue-200 rounded p-3 space-y-2">
        <p className="text-xs font-semibold text-blue-800 flex items-center gap-1">
          <Network size={14} /> Cabang terpilih: <span className="font-normal">{node.teks || "(tanpa teks)"}</span>
        </p>
        <input
          className="input input-bordered input-sm w-full text-gray-800 bg-white"
          value={node.teks}
          onChange={(e) => onChange({ root: ubahTeksNode(JSON.parse(JSON.stringify(value.root)), node.id, e.target.value) })}
          placeholder="Tulis ide / catatan cabang ini"
        />
        <div className="flex gap-2">
          <input
            className="input input-bordered input-sm flex-1 text-gray-800 bg-white"
            placeholder="Tambah cabang di bawah cabang terpilih..."
            value={teksCabang}
            onChange={(e) => setTeksCabang(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") tambah(); }}
          />
          <button className="btn btn-primary btn-sm" onClick={tambah} disabled={!teksCabang.trim()}>
            <Plus size={14} /> Cabang
          </button>
        </div>
        {value.root.id !== pilih && (
          <button
            className="btn btn-ghost btn-xs text-red-500"
            onClick={() => {
              if (!confirm("Hapus cabang ini beserta anak-anaknya?")) return;
              onChange({ root: hapusNode(JSON.parse(JSON.stringify(value.root)), pilih) });
              setPilih(value.root.id);
            }}
          >
            <Trash2 size={12} /> Hapus cabang ini
          </button>
        )}
      </div>
    </div>
  );
}

// ======================= PAPAN GAMBAR =======================
const LEBAR_PAPAN = 900;
const TINGGI_PAPAN = 520;

function PapanGambar({ value, onChange }) {
  const canvasRef = useRef(null);
  const [warna, setWarna] = useState("#1f2937");
  const [tebal, setTebal] = useState(4);
  const [hapus, setHapus] = useState(false);
  const coretanRef = useRef(Array.isArray(value.coretan) ? value.coretan : []);
  const sedangRef = useRef(null);

  const gambarUlang = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, LEBAR_PAPAN, TINGGI_PAPAN);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, LEBAR_PAPAN, TINGGI_PAPAN);
    coretanRef.current.forEach((g) => {
      if (!g.titik || g.titik.length === 0) return;
      ctx.beginPath();
      ctx.strokeStyle = g.hapus ? "#ffffff" : g.warna;
      ctx.lineWidth = g.tebal;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      g.titik.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
      if (g.titik.length === 1) ctx.lineTo(g.titik[0][0] + 0.1, g.titik[0][1] + 0.1);
      ctx.stroke();
    });
  };

  useEffect(() => {
    if (coretanRef.current.length > 0) { gambarUlang(); return; }
    if (!value.dataUrl) { gambarUlang(); return; }
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, LEBAR_PAPAN, TINGGI_PAPAN);
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, LEBAR_PAPAN, TINGGI_PAPAN);
      ctx.drawImage(img, 0, 0, LEBAR_PAPAN, TINGGI_PAPAN);
    };
    img.src = value.dataUrl;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const posisi = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * LEBAR_PAPAN;
    const y = ((e.clientY - rect.top) / rect.height) * TINGGI_PAPAN;
    return [Math.round(x), Math.round(y)];
  };

  const mulai = (e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    sedangRef.current = { warna, tebal, hapus, titik: [posisi(e)] };
    gambarUlang();
  };

  const jalan = (e) => {
    if (!sedangRef.current) return;
    sedangRef.current.titik.push(posisi(e));
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.beginPath();
    ctx.strokeStyle = hapus ? "#ffffff" : warna;
    ctx.lineWidth = tebal;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    sedangRef.current.titik.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
    ctx.stroke();
  };

  const selesai = () => {
    if (!sedangRef.current) return;
    coretanRef.current = [...coretanRef.current, sedangRef.current];
    sedangRef.current = null;
    onChange({ coretan: coretanRef.current, dataUrl: canvasRef.current?.toDataURL("image/jpeg", 0.6) || "" });
  };

  const undo = () => {
    coretanRef.current = coretanRef.current.slice(0, -1);
    gambarUlang();
    onChange({ coretan: coretanRef.current, dataUrl: canvasRef.current?.toDataURL("image/jpeg", 0.6) || "" });
  };

  const bersihkan = () => {
    if (!confirm("Hapus semua gambar di papan ini?")) return;
    coretanRef.current = [];
    gambarUlang();
    onChange({ coretan: [], dataUrl: "" });
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2 bg-gray-50 border border-gray-200 rounded p-2">
        {["#1f2937", "#2563eb", "#dc2626", "#16a34a", "#d97706"].map((w) => (
          <button
            key={w}
            className={`w-6 h-6 rounded-full border-2 ${warna === w && !hapus ? "border-gray-800" : "border-white"}`}
            style={{ backgroundColor: w }}
            onClick={() => { setWarna(w); setHapus(false); }}
            title={`Warna ${w}`}
          />
        ))}
        <button className={`btn btn-xs ${hapus ? "btn-error" : "btn-ghost text-gray-700"}`} onClick={() => setHapus(!hapus)}>
          <Eraser size={12} /> Penghapus
        </button>
        <label className="text-xs text-gray-600 flex items-center gap-1">
          Tebal
          <input type="range" min="1" max="20" value={tebal} onChange={(e) => setTebal(Number(e.target.value))} className="w-24" />
        </label>
        <button className="btn btn-ghost btn-xs text-gray-700" onClick={undo}><Undo2 size={12} /> Undo</button>
        <button className="btn btn-ghost btn-xs text-red-500" onClick={bersihkan}><Trash2 size={12} /> Kosongkan</button>
      </div>
      <canvas
        ref={canvasRef}
        width={LEBAR_PAPAN}
        height={TINGGI_PAPAN}
        onPointerDown={mulai}
        onPointerMove={jalan}
        onPointerUp={selesai}
        onPointerLeave={selesai}
        className="w-full border border-gray-200 rounded bg-white touch-none cursor-crosshair"
      />
    </div>
  );
}

// ======================= SLIDE =======================
function EditorTeks({ html, onChange, onFokus }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Jangan timpa isi saat user sedang mengetik (kursor bakal lompat).
    if (document.activeElement === el) return;
    if (el.innerHTML !== (html || "")) el.innerHTML = html || "";
  }, [html]);

  const perintah = (cmd, nilai = null) => {
    document.execCommand("styleWithCSS", false, false);
    document.execCommand(cmd, false, nilai);
    ref.current?.focus();
    if (ref.current) onChange(ref.current.innerHTML);
  };

  const alat = [
    { ikon: Bold, cmd: "bold", judul: "Tebal (Ctrl+B)" },
    { ikon: Italic, cmd: "italic", judul: "Miring (Ctrl+I)" },
    { ikon: Underline, cmd: "underline", judul: "Garis bawah (Ctrl+U)" },
    { ikon: List, cmd: "insertUnorderedList", judul: "Daftar poin" },
    { ikon: ListOrdered, cmd: "insertOrderedList", judul: "Daftar nomor" },
    { ikon: AlignLeft, cmd: "justifyLeft", judul: "Rata kiri" },
    { ikon: AlignCenter, cmd: "justifyCenter", judul: "Rata tengah" },
    { ikon: AlignRight, cmd: "justifyRight", judul: "Rata kanan" },
    { ikon: RemoveFormatting, cmd: "removeFormat", judul: "Hapus format" },
  ];

  return (
    <div className="border border-gray-200 rounded overflow-hidden">
      <div className="flex flex-wrap items-center gap-1 bg-gray-50 border-b border-gray-200 p-1">
        {alat.map(({ ikon: Ikon, cmd, judul }) => (
          <button
            key={cmd}
            type="button"
            title={judul}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => perintah(cmd)}
            className="btn btn-ghost btn-xs px-2 text-gray-700"
          >
            <Ikon size={14} />
          </button>
        ))}
        <span className="w-px h-4 bg-gray-300 mx-1" />
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => perintah("formatBlock", "h2")} className="btn btn-ghost btn-xs font-bold text-gray-700" title="Judul besar">H1</button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => perintah("formatBlock", "h3")} className="btn btn-ghost btn-xs font-bold text-gray-700" title="Sub judul">H2</button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => perintah("formatBlock", "p")} className="btn btn-ghost btn-xs text-gray-700" title="Teks normal">Normal</button>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        onFocus={onFokus}
        onInput={(e) => onChange(bersihkanHtml(e.currentTarget.innerHTML))}
        onBlur={(e) => onChange(bersihkanHtml(e.currentTarget.innerHTML))}
        className={`${KELAS_TEKS} min-h-[220px] p-3 bg-white focus:outline-none`}
        data-placeholder="Tulis isi slide..."
      />
    </div>
  );
}

function SlideEditor({ value, onChange }) {
  const [aktif, setAktif] = useState(0);
  const [modePratinjau, setModePratinjau] = useState(false);
  const slides = value.slides || [];
  const index = Math.min(aktif, slides.length - 1);
  const slide = slides[index] || { id: idBaru("slide"), judul: "", isi: "" };

  const ubah = (patch) => onChange({ slides: slides.map((s, i) => (i === index ? { ...s, ...patch } : s)) });

  const tambahSlide = () => {
    const baru = [...slides, { id: idBaru("slide"), judul: `Slide ${slides.length + 1}`, isi: "" }];
    onChange({ slides: baru });
    setAktif(baru.length - 1);
  };

  const hapusSlide = () => {
    if (slides.length <= 1) { alert("Minimal satu slide."); return; }
    if (!confirm("Hapus slide ini?")) return;
    onChange({ slides: slides.filter((_, i) => i !== index) });
    setAktif(Math.max(0, index - 1));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button className="btn btn-ghost btn-xs" onClick={() => setAktif(Math.max(0, index - 1))} disabled={index === 0}><ChevronLeft size={14} /></button>
          <span className="text-xs text-gray-600">Slide {index + 1} / {slides.length}</span>
          <button className="btn btn-ghost btn-xs" onClick={() => setAktif(Math.min(slides.length - 1, index + 1))} disabled={index === slides.length - 1}><ChevronRight size={14} /></button>
        </div>
        <div className="flex gap-1">
          <button className="btn btn-outline btn-xs text-gray-700" onClick={() => setModePratinjau(!modePratinjau)}>
            {modePratinjau ? <><Pencil size={12} /> Edit</> : <><Eye size={12} /> Tampilkan</>}
          </button>
          <button className="btn btn-outline btn-xs text-gray-700" onClick={tambahSlide}><Plus size={12} /> Slide</button>
          <button className="btn btn-ghost btn-xs text-red-500" onClick={hapusSlide}><Trash2 size={12} /></button>
        </div>
      </div>

      <input
        className="input input-bordered input-sm w-full text-gray-800 bg-white font-semibold"
        placeholder="Judul slide"
        value={slide.judul}
        onChange={(e) => ubah({ judul: e.target.value })}
      />

      {modePratinjau ? (
        <div className="border border-gray-200 rounded bg-white p-6 min-h-[240px]">
          <h4 className="text-lg font-bold text-gray-800 mb-3">{slide.judul || "(tanpa judul)"}</h4>
          <div className={KELAS_TEKS} dangerouslySetInnerHTML={{ __html: isiSlideKeHtml(slide.isi) }} />
        </div>
      ) : (
        <>
          <EditorTeks html={isiSlideKeHtml(slide.isi)} onChange={(html) => ubah({ isi: html })} />
          <p className="text-[11px] text-gray-500">
            Blok dulu teksnya, baru klik tombol format (tebal, miring, judul, list, rata). Bisa juga pakai Ctrl+B / Ctrl+I / Ctrl+U.
          </p>
        </>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setAktif(i)}
            className={`shrink-0 w-32 h-20 rounded border text-left p-2 text-[10px] overflow-hidden ${i === index ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"}`}
            title={s.judul}
          >
            <span className="font-semibold text-gray-800 block truncate">{i + 1}. {s.judul || "(tanpa judul)"}</span>
            <span className="text-gray-500 line-clamp-2">{String(s.isi || "").replace(/<[^>]*>/g, " ").slice(0, 90)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ======================= TAMPILAN BACA (BUKAN EDIT) =======================
function SlideBaca({ isi }) {
  return (
    <div className="space-y-3">
      {(isi.slides || []).map((slide, i) => (
        <div key={slide.id || i} className="border border-gray-200 rounded bg-white p-5 break-inside-avoid">
          <p className="text-[10px] font-semibold text-gray-400 mb-1">SLIDE {i + 1}</p>
          <h4 className="text-lg font-bold text-gray-800 mb-3">{slide.judul || "(tanpa judul)"}</h4>
          <div className={KELAS_TEKS} dangerouslySetInnerHTML={{ __html: isiSlideKeHtml(slide.isi) }} />
        </div>
      ))}
    </div>
  );
}

function LihatIde({ ide, onKembali, onEdit, onSembunyikan, onHapus }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2" data-html2canvas-ignore="true">
        <button className="btn btn-ghost btn-sm text-gray-600 flex items-center gap-1" onClick={onKembali}>
          <ArrowLeft size={16} /> Kembali ke daftar ide
        </button>
        <div className="flex gap-1">
          <button className="btn btn-ghost btn-sm text-gray-600" onClick={onSembunyikan}>
            {ide.disembunyikan ? <><Eye size={14} /> Tampilkan</> : <><EyeOff size={14} /> Sembunyikan</>}
          </button>
          <button className="btn btn-outline btn-sm text-gray-700" onClick={onEdit}><Pencil size={14} /> Edit</button>
          <button className="btn btn-ghost btn-sm text-red-500" onClick={onHapus}><Trash2 size={14} /> Hapus</button>
        </div>
      </div>

      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4 space-y-1">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Lightbulb size={20} className="text-amber-500" /> {ide.judul}
          </h3>
          <p className="text-xs text-gray-500">
            {labelTipe(ide.tipe)} · diubah {formatTanggal(ide.updatedAt)}
          </p>
        </div>
      </div>

      {ide.tipe === "mindmap" && <MindmapKanvas root={ide.isi.root} />}

      {ide.tipe === "gambar" && (
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-3">
            {ide.isi.dataUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={ide.isi.dataUrl} alt={ide.judul} className="w-full rounded border border-gray-200" />
            ) : (
              <p className="text-sm text-gray-400 italic text-center py-10">Papan gambar masih kosong.</p>
            )}
          </div>
        </div>
      )}

      {ide.tipe === "slide" && <SlideBaca isi={ide.isi} />}
    </div>
  );
}

// ======================= EDITOR IDE =======================
function EditorIde({ awal, onSimpan, onBatal }) {
  const [ide, setIde] = useState(() => normalisasiIde(awal));

  const gantiTipe = (tipe) => {
    if (tipe === ide.tipe) return;
    if (!confirm(`Ganti ke tipe ${labelTipe(tipe)}? Isi tipe ${labelTipe(ide.tipe)} nggak ikut terbawa.`)) return;
    const isi = tipe === "mindmap"
      ? (ide.isi.root ? { root: ide.isi.root } : mindmapKosong(ide.judul))
      : tipe === "gambar"
      ? { coretan: ide.isi.coretan || [], dataUrl: ide.isi.dataUrl || "" }
      : (ide.isi.slides ? { slides: ide.isi.slides } : slideKosong());
    setIde({ ...ide, tipe, isi });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 p-2 md:p-6 overflow-y-auto" data-html2canvas-ignore="true">
      <div className="card bg-white shadow-xl w-full max-w-4xl mx-auto">
        <div className="card-body p-4 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <Lightbulb size={18} className="text-amber-500" /> {awal?.id ? "Edit Ide" : "Ide Baru"}
            </h3>
            <button className="btn btn-ghost btn-sm text-gray-700" onClick={onBatal}><X size={18} /></button>
          </div>

          <input
            className="input input-bordered w-full text-gray-800 bg-white font-semibold"
            placeholder="Judul ide (misal: Ide kemasan handgrips warna pastel)"
            value={ide.judul}
            onChange={(e) => setIde({ ...ide, judul: e.target.value })}
            autoFocus
          />

          <div className="flex flex-wrap gap-1">
            {TIPE_IDE.map((t) => {
              const Ikon = IKON_TIPE[t.id];
              return (
                <button
                  key={t.id}
                  className={`btn btn-sm ${ide.tipe === t.id ? "btn-primary" : "btn-ghost text-gray-600"}`}
                  onClick={() => gantiTipe(t.id)}
                  title={t.petunjuk}
                >
                  <Ikon size={14} /> {t.label}
                </button>
              );
            })}
          </div>

          {ide.tipe === "mindmap" && <MindmapEditor value={ide.isi} onChange={(isi) => setIde({ ...ide, isi })} />}
          {ide.tipe === "gambar" && <PapanGambar value={ide.isi} onChange={(isi) => setIde({ ...ide, isi })} />}
          {ide.tipe === "slide" && <SlideEditor value={ide.isi} onChange={(isi) => setIde({ ...ide, isi })} />}

          <div className="flex gap-2 pt-2 border-t border-gray-200">
            <button className="btn btn-primary btn-sm flex-1" onClick={() => onSimpan(ide)} disabled={!ide.judul.trim()}>
              <Save size={16} /> Simpan Ide
            </button>
            <button className="btn btn-ghost btn-sm text-gray-600" onClick={onBatal}>Batal</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ======================= KARTU IDE =======================
function KartuIde({ ide, onBuka, onEdit, onSembunyikan, onHapus }) {
  const Ikon = IKON_TIPE[ide.tipe] || Lightbulb;
  return (
    <div className={`rounded-lg border p-3 bg-white ${ide.disembunyikan ? "border-dashed border-gray-300 opacity-70" : "border-gray-200"}`}>
      <div className="flex items-start justify-between gap-2">
        <button className="flex items-start gap-2 text-left flex-1" onClick={onBuka}>
          <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0"><Ikon size={16} /></span>
          <div className="min-w-0">
            <p className={`text-sm font-semibold text-gray-800 truncate ${ide.disembunyikan ? "line-through" : ""}`}>{ide.judul}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">{labelTipe(ide.tipe)} · {ringkasIde(ide)}</p>
            <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5"><Calendar size={10} /> {formatTanggal(ide.updatedAt)}</p>
          </div>
        </button>
        <div className="flex gap-0.5 shrink-0" data-html2canvas-ignore="true">
          <button className="btn btn-ghost btn-xs text-gray-500" onClick={onSembunyikan} title={ide.disembunyikan ? "Tampilkan" : "Sembunyikan"}>
            {ide.disembunyikan ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          <button className="btn btn-ghost btn-xs text-blue-500" onClick={onEdit} title="Edit"><Pencil size={14} /></button>
          <button className="btn btn-ghost btn-xs text-red-500" onClick={onHapus} title="Hapus"><Trash2 size={14} /></button>
        </div>
      </div>
    </div>
  );
}

// ======================= HALAMAN DUMP IDEAS =======================
export default function DumpIdeas({ ideList = [], onUpdate, brandNama = "" }) {
  const [editor, setEditor] = useState(null);
  const [dilihatId, setDilihatId] = useState(null);
  const [cari, setCari] = useState("");
  const [tampilTersembunyi, setTampilTersembunyi] = useState(false);

  const data = useMemo(() => (Array.isArray(ideList) ? ideList.map(normalisasiIde) : []), [ideList]);
  const dilihat = dilihatId ? data.find((i) => i.id === dilihatId) || null : null;

  const terlihat = data.filter((ide) => {
    if (!tampilTersembunyi && ide.disembunyikan) return false;
    if (!cari.trim()) return true;
    return `${ide.judul} ${ringkasIde(ide)} ${labelTipe(ide.tipe)}`.toLowerCase().includes(cari.toLowerCase());
  });

  const jumlahTersembunyi = data.filter((i) => i.disembunyikan).length;

  const simpan = (ide) => {
    const bersih = { ...normalisasiIde(ide), updatedAt: new Date().toISOString() };
    const ada = data.some((d) => d.id === bersih.id);
    onUpdate(ada ? data.map((d) => (d.id === bersih.id ? bersih : d)) : [...data, bersih]);
    setEditor(null);
    setDilihatId(bersih.id);
  };

  const ideBaru = (tipe) => setEditor({
    mode: "baru",
    ide: normalisasiIde({ judul: "", tipe, isi: tipe === "mindmap" ? mindmapKosong() : tipe === "gambar" ? {} : slideKosong() }),
  });

  const hapus = (ide) => {
    if (!confirm(`Hapus ide "${ide.judul}"? Tindakan ini nggak bisa dibatalkan.`)) return;
    onUpdate(data.filter((d) => d.id !== ide.id));
    setDilihatId(null);
  };

  const sembunyikan = (ide) => onUpdate(data.map((d) => (d.id === ide.id ? { ...d, disembunyikan: !d.disembunyikan } : d)));

  if (dilihat) {
    return (
      <>
        <LihatIde
          ide={dilihat}
          onKembali={() => setDilihatId(null)}
          onEdit={() => setEditor({ mode: "edit", ide: dilihat })}
          onSembunyikan={() => sembunyikan(dilihat)}
          onHapus={() => hapus(dilihat)}
        />
        {editor && <EditorIde awal={editor.ide} onSimpan={simpan} onBatal={() => setEditor(null)} />}
      </>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
            <div>
              <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <Lightbulb size={18} className="text-amber-500" /> Dump Ideas {brandNama ? `— ${brandNama}` : ""}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Tempat nampung ide mentah: mindmap, gambar, atau slide. Simpan dulu, rapikan nanti.</p>
            </div>
            <div className="flex flex-wrap gap-1" data-html2canvas-ignore="true">
              <button className="btn btn-primary btn-sm" onClick={() => ideBaru("mindmap")}><Plus size={14} /> Mindmap</button>
              <button className="btn btn-outline btn-sm text-gray-700" onClick={() => ideBaru("gambar")}><PenLine size={14} /> Gambar</button>
              <button className="btn btn-outline btn-sm text-gray-700" onClick={() => ideBaru("slide")}><Presentation size={14} /> Slide</button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="input input-bordered input-sm flex items-center gap-2 bg-white flex-1 max-w-xs">
              <Search size={14} className="text-gray-400" />
              <input className="grow text-gray-800" placeholder="Cari ide..." value={cari} onChange={(e) => setCari(e.target.value)} />
            </label>
            {jumlahTersembunyi > 0 && (
              <button className="btn btn-ghost btn-xs text-gray-600" onClick={() => setTampilTersembunyi(!tampilTersembunyi)}>
                {tampilTersembunyi ? <><EyeOff size={12} /> Sembunyikan lagi</> : <><Eye size={12} /> Tampilkan {jumlahTersembunyi} yang disembunyikan</>}
              </button>
            )}
            <span className="text-xs text-gray-400 ml-auto">{terlihat.length} ide</span>
          </div>

          {terlihat.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg mt-3">
              <Lightbulb size={40} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm text-gray-500">Belum ada ide. Mulai dari mindmap — tulis ide besarnya, terus cabangkan.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-2 mt-3">
              {terlihat.map((ide) => (
                <KartuIde
                  key={ide.id}
                  ide={ide}
                  onBuka={() => setDilihatId(ide.id)}
                  onEdit={() => setEditor({ mode: "edit", ide })}
                  onSembunyikan={() => sembunyikan(ide)}
                  onHapus={() => hapus(ide)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {editor && <EditorIde awal={editor.ide} onSimpan={simpan} onBatal={() => setEditor(null)} />}
    </div>
  );
}
