// components/DumpIdeas.js
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Lightbulb, Plus, Pencil, Trash2, Eye, EyeOff, X, Save, Network,
  PenLine, Presentation, ChevronLeft, ChevronRight, Eraser, Undo2,
  Search, Calendar, ArrowLeft, Bold, Italic, Underline, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, RemoveFormatting, StickyNote, Type,
  Square, Circle, Minus,
} from "lucide-react";
import {
  TIPE_IDE, normalisasiIde, mindmapKosong, slideKosong, susunMindmap,
  tambahAnak, ubahTeksNode, hapusNode, labelTipe, ringkasIde, idBaru,
  bersihkanHtml, isiSlideKeHtml, catatanBaru, WARNA_CATATAN,
  LATAR_SLIDE, BENTUK_SLIDE, WARNA_BENTUK,
} from "@/lib/dumpIdeas";

const IKON_TIPE = { mindmap: Network, gambar: PenLine, catatan: StickyNote, slide: Presentation };

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

// setPointerCapture bisa melempar kalau pointer sudah lepas (mis. event sintetis),
// jadi dibungkus supaya interaksi tetap jalan.
const tangkapPointer = (el, id) => {
  try { el?.setPointerCapture?.(id); } catch { /* abaikan */ }
};

// Satu objek (teks / kotak / bulat / garis) digambar ke canvas. Dipakai waktu
// menggambar ulang supaya teks & bentuk tetap ada setelah undo/redo.
const gambarSatuObjek = (ctx, o) => {
  if (!o) return;
  ctx.save();
  ctx.strokeStyle = o.warna || "#1f2937";
  ctx.fillStyle = o.warna || "#1f2937";
  ctx.lineWidth = o.tebal || 2;
  if (o.tipe === "teks") {
    const ukuran = o.ukuran || 24;
    ctx.font = `600 ${ukuran}px system-ui, -apple-system, Segoe UI, sans-serif`;
    String(o.teks || "").split("\n").forEach((baris, i) => {
      ctx.fillText(baris, o.x, o.y + (i + 1) * ukuran * 1.15);
    });
  } else if (o.tipe === "kotak") {
    ctx.strokeRect(o.x, o.y, o.x2 - o.x, o.y2 - o.y);
  } else if (o.tipe === "bulat") {
    const rx = Math.abs(o.x2 - o.x) / 2;
    const ry = Math.abs(o.y2 - o.y) / 2;
    ctx.beginPath();
    ctx.ellipse(Math.min(o.x, o.x2) + rx, Math.min(o.y, o.y2) + ry, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();
  } else if (o.tipe === "garis") {
    ctx.beginPath();
    ctx.moveTo(o.x, o.y);
    ctx.lineTo(o.x2, o.y2);
    ctx.stroke();
  }
  ctx.restore();
};

function PapanGambar({ value, onChange }) {
  const canvasRef = useRef(null);
  const [alat, setAlat] = useState("pena");
  const [warna, setWarna] = useState("#1f2937");
  const [tebal, setTebal] = useState(4);
  const [ukuranTeks, setUkuranTeks] = useState(24);
  const [inputTeks, setInputTeks] = useState(null);
  const coretanRef = useRef(Array.isArray(value.coretan) ? value.coretan : []);
  const objekRef = useRef(Array.isArray(value.objek) ? value.objek : []);
  const sedangRef = useRef(null);
  const bentukRef = useRef(null);

  const simpan = () => onChange({
    coretan: coretanRef.current,
    objek: objekRef.current,
    dataUrl: canvasRef.current?.toDataURL("image/jpeg", 0.6) || "",
  });

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
    objekRef.current.forEach((o) => gambarSatuObjek(ctx, o));
    gambarSatuObjek(ctx, bentukRef.current);
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
      objekRef.current.forEach((o) => gambarSatuObjek(ctx, o));
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
    if (alat === "teks") {
      const [x, y] = posisi(e);
      setInputTeks({ x, y, teks: "" });
      return;
    }
    tangkapPointer(e.currentTarget, e.pointerId);
    if (alat === "pena" || alat === "hapus") {
      sedangRef.current = { warna, tebal, hapus: alat === "hapus", titik: [posisi(e)] };
      gambarUlang();
      return;
    }
    const [x, y] = posisi(e);
    bentukRef.current = { tipe: alat, warna, tebal: Math.max(2, tebal), x, y, x2: x, y2: y };
  };

  const jalan = (e) => {
    if (sedangRef.current) {
      sedangRef.current.titik.push(posisi(e));
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;
      ctx.beginPath();
      ctx.strokeStyle = sedangRef.current.hapus ? "#ffffff" : sedangRef.current.warna;
      ctx.lineWidth = sedangRef.current.tebal;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      sedangRef.current.titik.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
      ctx.stroke();
      return;
    }
    if (bentukRef.current) {
      const [x, y] = posisi(e);
      bentukRef.current = { ...bentukRef.current, x2: x, y2: y };
      gambarUlang();
    }
  };

  const selesai = () => {
    if (sedangRef.current) {
      coretanRef.current = [...coretanRef.current, sedangRef.current];
      sedangRef.current = null;
      simpan();
      return;
    }
    if (bentukRef.current) {
      objekRef.current = [...objekRef.current, bentukRef.current];
      bentukRef.current = null;
      gambarUlang();
      simpan();
    }
  };

  const tambahTeks = () => {
    if (!inputTeks) return;
    const teks = inputTeks.teks.trim();
    if (teks) {
      objekRef.current = [...objekRef.current, { id: idBaru("objek"), tipe: "teks", x: inputTeks.x, y: inputTeks.y, teks, ukuran: ukuranTeks, warna }];
      gambarUlang();
      simpan();
    }
    setInputTeks(null);
  };

  const undo = () => {
    if (objekRef.current.length > 0) objekRef.current = objekRef.current.slice(0, -1);
    else coretanRef.current = coretanRef.current.slice(0, -1);
    gambarUlang();
    simpan();
  };

  const bersihkan = () => {
    if (!confirm("Hapus semua gambar & tulisan di papan ini?")) return;
    coretanRef.current = [];
    objekRef.current = [];
    gambarUlang();
    onChange({ coretan: [], objek: [], dataUrl: "" });
  };

  const alatDaftar = [
    { id: "pena", label: "Pena", ikon: PenLine },
    { id: "teks", label: "Teks", ikon: Type },
    { id: "kotak", label: "Kotak", ikon: Square },
    { id: "bulat", label: "Bulat", ikon: Circle },
    { id: "garis", label: "Garis", ikon: Minus },
    { id: "hapus", label: "Penghapus", ikon: Eraser },
  ];

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2 bg-gray-50 border border-gray-200 rounded p-2">
        <div className="join" role="group" aria-label="Alat papan tulis">
          {alatDaftar.map((a) => {
            const Ikon = a.ikon;
            return (
              <button
                key={a.id}
                type="button"
                className={`btn btn-xs join-item ${alat === a.id ? "btn-primary" : "btn-ghost text-gray-700"}`}
                onClick={() => { setAlat(a.id); setInputTeks(null); }}
                title={a.label}
              >
                <Ikon size={12} className="md:mr-1" /> <span className="hidden md:inline">{a.label}</span>
              </button>
            );
          })}
        </div>

        <span className="w-px h-5 bg-gray-300" />

        {["#1f2937", "#2563eb", "#dc2626", "#16a34a", "#d97706", "#7c3aed"].map((w) => (
          <button
            key={w}
            type="button"
            className={`w-6 h-6 rounded-full border-2 ${warna === w ? "border-gray-800" : "border-white"}`}
            style={{ backgroundColor: w }}
            onClick={() => setWarna(w)}
            title={`Warna ${w}`}
          />
        ))}

        <label className="text-xs text-gray-600 flex items-center gap-1">
          {alat === "teks" ? "Ukuran" : "Tebal"}
          {alat === "teks" ? (
            <input type="range" min="12" max="72" step="2" value={ukuranTeks} onChange={(e) => setUkuranTeks(Number(e.target.value))} className="w-24" />
          ) : (
            <input type="range" min="1" max="20" value={tebal} onChange={(e) => setTebal(Number(e.target.value))} className="w-24" />
          )}
        </label>

        <button className="btn btn-ghost btn-xs text-gray-700" onClick={undo}><Undo2 size={12} /> Undo</button>
        <button className="btn btn-ghost btn-xs text-red-500" onClick={bersihkan}><Trash2 size={12} /> Kosongkan</button>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={LEBAR_PAPAN}
          height={TINGGI_PAPAN}
          onPointerDown={mulai}
          onPointerMove={jalan}
          onPointerUp={selesai}
          onPointerLeave={selesai}
          className={`w-full border border-gray-200 rounded bg-white touch-none ${alat === "teks" ? "cursor-text" : alat === "hapus" ? "cursor-cell" : "cursor-crosshair"}`}
        />
        {inputTeks && (
          <div
            className="absolute z-10 bg-white border border-blue-300 rounded shadow-lg p-2 w-52"
            style={{
              left: `min(${(inputTeks.x / LEBAR_PAPAN) * 100}%, calc(100% - 13rem))`,
              top: `min(${(inputTeks.y / TINGGI_PAPAN) * 100}%, calc(100% - 7rem))`,
            }}
          >
            <textarea
              className="textarea textarea-bordered textarea-xs w-full text-gray-800 bg-white"
              rows={2}
              placeholder="Tulis teks..."
              value={inputTeks.teks}
              onChange={(e) => setInputTeks({ ...inputTeks, teks: e.target.value })}
              autoFocus
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); tambahTeks(); } }}
            />
            <div className="flex gap-1 mt-1">
              <button className="btn btn-primary btn-xs flex-1" onClick={tambahTeks}>Tambah</button>
              <button className="btn btn-ghost btn-xs text-gray-600" onClick={() => setInputTeks(null)}>Batal</button>
            </div>
          </div>
        )}
      </div>
      <p className="text-[11px] text-gray-500">
        Pilih alat lalu klik/geser di papan. Mode Teks: klik satu titik, tulis, lalu Tambah (Shift+Enter untuk baris baru).
      </p>
    </div>
  );
}

// ======================= STICKY NOTES =======================
const warnaCatatanDari = (id) => WARNA_CATATAN.find((w) => w.id === id) || WARNA_CATATAN[0];

function PapanCatatan({ value, onChange }) {
  const papanRef = useRef(null);
  const geserRef = useRef(null);
  const [warnaBaru, setWarnaBaru] = useState("kuning");
  const catatan = Array.isArray(value?.catatan) ? value.catatan : [];

  const simpan = (list) => onChange({ catatan: list });
  const ubah = (id, patch) => simpan(catatan.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const hapus = (id) => {
    if (!confirm("Hapus catatan ini?")) return;
    simpan(catatan.filter((c) => c.id !== id));
  };
  const tambah = () => simpan([...catatan, catatanBaru(warnaBaru)]);

  const mulaiGeser = (e, c) => {
    if (e.target.closest("textarea") || e.target.closest("button") || e.target.closest("select")) return;
    const rect = papanRef.current?.getBoundingClientRect();
    if (!rect) return;
    tangkapPointer(e.currentTarget, e.pointerId);
    geserRef.current = {
      id: c.id,
      dx: e.clientX - rect.left - (c.x / 100) * rect.width,
      dy: e.clientY - rect.top - (c.y / 100) * rect.height,
    };
  };

  const geser = (e) => {
    const g = geserRef.current;
    if (!g) return;
    const rect = papanRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left - g.dx) / rect.width) * 100;
    const y = ((e.clientY - rect.top - g.dy) / rect.height) * 100;
    ubah(g.id, { x: Math.max(0, Math.min(84, x)), y: Math.max(0, Math.min(82, y)) });
  };

  const lepas = () => { geserRef.current = null; };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2 bg-gray-50 border border-gray-200 rounded p-2">
        <button className="btn btn-primary btn-xs" onClick={tambah}><Plus size={12} /> Tambah Catatan</button>
        <span className="text-xs text-gray-600">Warna catatan baru:</span>
        <div className="flex gap-1">
          {WARNA_CATATAN.map((w) => (
            <button
              key={w.id}
              type="button"
              className={`w-5 h-5 rounded border-2 ${warnaBaru === w.id ? "border-gray-800" : "border-white"}`}
              style={{ backgroundColor: w.bg, borderColor: warnaBaru === w.id ? "#1f2937" : w.border }}
              onClick={() => setWarnaBaru(w.id)}
              title={w.label}
            />
          ))}
        </div>
        <span className="text-[11px] text-gray-500 ml-auto">{catatan.length} catatan · geser kartu untuk memindahkan</span>
      </div>

      <div
        ref={papanRef}
        className="relative w-full rounded-lg border-2 border-dashed border-gray-300 bg-[#f8fafc] overflow-hidden"
        style={{ paddingBottom: "56%" }}
        onPointerMove={geser}
        onPointerUp={lepas}
        onPointerLeave={lepas}
      >
        {catatan.length === 0 && (
          <p className="absolute inset-0 flex items-center justify-center text-xs text-gray-400 italic">
            Papan masih kosong. Klik &quot;Tambah Catatan&quot;.
          </p>
        )}
        {catatan.map((c) => {
          const w = warnaCatatanDari(c.warna);
          return (
            <div
              key={c.id}
              className="absolute rounded shadow-md p-2 flex flex-col"
              style={{
                left: `${c.x}%`,
                top: `${c.y}%`,
                width: 168,
                height: 150,
                backgroundColor: w.bg,
                border: `1px solid ${w.border}`,
                transform: `rotate(${c.rotasi || 0}deg)`,
                touchAction: "none",
              }}
              onPointerDown={(e) => mulaiGeser(e, c)}
            >
              <div className="flex items-center justify-between mb-1 cursor-move">
                <select
                  className="select select-xs bg-transparent border-0 text-[10px] text-gray-600 p-0 h-5"
                  value={c.warna}
                  onChange={(e) => ubah(c.id, { warna: e.target.value })}
                  title="Warna catatan"
                >
                  {WARNA_CATATAN.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
                <div className="flex items-center gap-0.5">
                  <button className="btn btn-ghost btn-xs px-1" onClick={() => ubah(c.id, { ukuran: Math.max(10, (c.ukuran || 14) - 2) })} title="Perkecil huruf"><Minus size={10} /></button>
                  <button className="btn btn-ghost btn-xs px-1" onClick={() => ubah(c.id, { ukuran: Math.min(28, (c.ukuran || 14) + 2) })} title="Perbesar huruf"><Plus size={10} /></button>
                  <button className="btn btn-ghost btn-xs px-1 text-red-500" onClick={() => hapus(c.id)} title="Hapus catatan"><Trash2 size={11} /></button>
                </div>
              </div>
              <textarea
                className="flex-1 w-full bg-transparent resize-none focus:outline-none text-gray-800"
                style={{ fontSize: c.ukuran || 14 }}
                placeholder="Tulis catatan..."
                value={c.teks}
                onChange={(e) => ubah(c.id, { teks: e.target.value })}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PapanCatatanBaca({ isi }) {
  const catatan = Array.isArray(isi?.catatan) ? isi.catatan : [];
  return (
    <div className="border border-gray-200 rounded-lg bg-[#f8fafc] p-3">
      <div className="relative w-full" style={{ paddingBottom: "56%" }}>
        {catatan.length === 0 && <p className="absolute inset-0 flex items-center justify-center text-sm text-gray-400 italic">Papan catatan masih kosong.</p>}
        {catatan.map((c) => {
          const w = warnaCatatanDari(c.warna);
          return (
            <div
              key={c.id}
              className="absolute rounded shadow-sm p-2 overflow-hidden"
              style={{
                left: `${c.x}%`,
                top: `${c.y}%`,
                width: 168,
                height: 150,
                backgroundColor: w.bg,
                border: `1px solid ${w.border}`,
                transform: `rotate(${c.rotasi || 0}deg)`,
              }}
            >
              <p className="whitespace-pre-wrap break-words text-gray-800" style={{ fontSize: c.ukuran || 14 }}>
                {c.teks || <span className="text-gray-400 italic">(kosong)</span>}
              </p>
            </div>
          );
        })}
      </div>
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

// Satu slide dirender sama persis di editor, pratinjau, dan hasil baca (PDF).
const UKURAN_JUDUL = { kecil: "text-lg", sedang: "text-xl", besar: "text-2xl" };
const UKURAN_TEKS = { kecil: "text-xs", sedang: "text-sm", besar: "text-base" };
const PERATAAN = { kiri: "text-left", tengah: "text-center", kanan: "text-right" };
const WARNA_JUDUL = [
  { id: "gelap", label: "Gelap", nilai: "#1f2937" },
  { id: "biru", label: "Biru", nilai: "#1d4ed8" },
  { id: "putih", label: "Putih", nilai: "#ffffff" },
  { id: "merah", label: "Merah", nilai: "#b91c1c" },
];

function SlideBlok({ slide, label }) {
  const bentuk = slide.bentuk || "tidak";
  const warnaBentuk = slide.warnaBentuk || "#2563eb";
  const perataan = PERATAAN[slide.perataan] || PERATAAN.kiri;
  return (
    <div
      className="relative overflow-hidden rounded border border-gray-200 p-5 break-inside-avoid"
      style={{ backgroundColor: slide.latar || "#ffffff" }}
    >
      {bentuk === "kotak" && <div className="absolute right-0 top-0 w-24 h-24 rounded-bl-3xl opacity-80" style={{ backgroundColor: warnaBentuk }} />}
      {bentuk === "bulat" && <div className="absolute -right-10 -bottom-12 w-40 h-40 rounded-full opacity-30" style={{ backgroundColor: warnaBentuk }} />}
      {bentuk === "garis" && <div className="absolute left-0 right-0 bottom-0 h-2" style={{ backgroundColor: warnaBentuk }} />}
      {bentuk === "miring" && <div className="absolute right-0 top-0 bottom-0 w-20 opacity-20" style={{ backgroundColor: warnaBentuk, transform: "skewX(-14deg)" }} />}

      <div className={`relative ${perataan}`}>
        {label && <p className="text-[10px] font-semibold text-gray-400 mb-1">{label}</p>}
        <h4
          className={`font-bold mb-3 ${UKURAN_JUDUL[slide.ukuranJudul] || UKURAN_JUDUL.besar}`}
          style={{ color: slide.warnaJudul || "#1f2937" }}
        >
          {slide.judul || "(tanpa judul)"}
        </h4>
        <div
          className={`${KELAS_TEKS} ${UKURAN_TEKS[slide.ukuranTeks] || UKURAN_TEKS.sedang}`}
          dangerouslySetInnerHTML={{ __html: isiSlideKeHtml(slide.isi) }}
        />
      </div>
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-gray-50 border border-gray-200 rounded p-2" data-html2canvas-ignore="true">
        <label className="text-[11px] text-gray-600">
          Latar slide
          <select className="select select-bordered select-xs w-full mt-0.5 text-gray-800 bg-white" value={slide.latar || "#ffffff"} onChange={(e) => ubah({ latar: e.target.value })}>
            {LATAR_SLIDE.map((l) => <option key={l.id} value={l.nilai}>{l.label}</option>)}
          </select>
        </label>
        <label className="text-[11px] text-gray-600">
          Warna judul
          <select className="select select-bordered select-xs w-full mt-0.5 text-gray-800 bg-white" value={slide.warnaJudul || "#1f2937"} onChange={(e) => ubah({ warnaJudul: e.target.value })}>
            {WARNA_JUDUL.map((w) => <option key={w.id} value={w.nilai}>{w.label}</option>)}
          </select>
        </label>
        <label className="text-[11px] text-gray-600">
          Bentuk hiasan
          <select className="select select-bordered select-xs w-full mt-0.5 text-gray-800 bg-white" value={slide.bentuk || "tidak"} onChange={(e) => ubah({ bentuk: e.target.value })}>
            {BENTUK_SLIDE.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
          </select>
        </label>
        <label className="text-[11px] text-gray-600">
          Warna bentuk
          <select className="select select-bordered select-xs w-full mt-0.5 text-gray-800 bg-white" value={slide.warnaBentuk || "#2563eb"} onChange={(e) => ubah({ warnaBentuk: e.target.value })}>
            {WARNA_BENTUK.map((w) => <option key={w.id} value={w.nilai}>{w.label}</option>)}
          </select>
        </label>
        <label className="text-[11px] text-gray-600">
          Ukuran judul
          <select className="select select-bordered select-xs w-full mt-0.5 text-gray-800 bg-white" value={slide.ukuranJudul || "besar"} onChange={(e) => ubah({ ukuranJudul: e.target.value })}>
            <option value="kecil">Kecil</option><option value="sedang">Sedang</option><option value="besar">Besar</option>
          </select>
        </label>
        <label className="text-[11px] text-gray-600">
          Ukuran teks
          <select className="select select-bordered select-xs w-full mt-0.5 text-gray-800 bg-white" value={slide.ukuranTeks || "sedang"} onChange={(e) => ubah({ ukuranTeks: e.target.value })}>
            <option value="kecil">Kecil</option><option value="sedang">Sedang</option><option value="besar">Besar</option>
          </select>
        </label>
        <div className="text-[11px] text-gray-600 md:col-span-2">
          Perataan
          <div className="join mt-0.5">
            {["kiri", "tengah", "kanan"].map((p) => {
              const Ikon = p === "kiri" ? AlignLeft : p === "tengah" ? AlignCenter : AlignRight;
              return (
                <button key={p} type="button" className={`btn btn-xs join-item ${slide.perataan === p ? "btn-primary" : "btn-ghost text-gray-700"}`} onClick={() => ubah({ perataan: p })} title={`Rata ${p}`}>
                  <Ikon size={12} /> <span className="hidden md:inline">{p}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {modePratinjau ? (
        <SlideBlok slide={slide} />
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
        <SlideBlok key={slide.id || i} slide={slide} label={`SLIDE ${i + 1}`} />
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
              <p className="text-sm text-gray-400 italic text-center py-10">Papan tulis masih kosong.</p>
            )}
          </div>
        </div>
      )}

      {ide.tipe === "catatan" && <PapanCatatanBaca isi={ide.isi} />}

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
      ? { coretan: ide.isi.coretan || [], objek: ide.isi.objek || [], dataUrl: ide.isi.dataUrl || "" }
      : tipe === "catatan"
      ? (Array.isArray(ide.isi.catatan) ? { catatan: ide.isi.catatan } : { catatan: [catatanBaru()] })
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
          {ide.tipe === "catatan" && <PapanCatatan value={ide.isi} onChange={(isi) => setIde({ ...ide, isi })} />}
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
          <button className="btn btn-outline btn-xs text-gray-700" onClick={onBuka} title="Lihat isi ide"><Eye size={12} /> Lihat</button>
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
    ide: normalisasiIde({
      judul: "",
      tipe,
      isi: tipe === "mindmap"
        ? mindmapKosong()
        : tipe === "gambar"
        ? {}
        : tipe === "catatan"
        ? { catatan: [catatanBaru()] }
        : slideKosong(),
    }),
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
              <p className="text-xs text-gray-500 mt-0.5">Tempat nampung ide mentah: mindmap, papan tulis, sticky notes, atau slide. Simpan dulu, rapikan nanti.</p>
            </div>
            <div className="flex flex-wrap gap-1" data-html2canvas-ignore="true">
              <button className="btn btn-primary btn-sm" onClick={() => ideBaru("mindmap")}><Plus size={14} /> Mindmap</button>
              <button className="btn btn-outline btn-sm text-gray-700" onClick={() => ideBaru("gambar")}><PenLine size={14} /> Papan Tulis</button>
              <button className="btn btn-outline btn-sm text-gray-700" onClick={() => ideBaru("catatan")}><StickyNote size={14} /> Sticky Notes</button>
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
