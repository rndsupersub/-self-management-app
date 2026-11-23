// components/FilterMulti.js
"use client";

// Filter dropdown dengan centang. Bisa pilih satu, beberapa, atau kosongkan
// semua (berarti tidak menyaring). Dipakai di semua fitur supaya caranya sama:
// vendor, kegiatan, belajar, tujuan kunjungan, jenis/status, dan wilayah.

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { daftarPilihan, togglePilihan } from "@/lib/filterMulti";

export default function FilterMulti({
  label = "Filter",
  pilihan = [],
  nilai = [],
  onChange,
  labelSemua,
  lebar = 220,
}) {
  const [buka, setBuka] = useState(false);
  const kotakRef = useRef(null);
  const dipilih = daftarPilihan(nilai);

  useEffect(() => {
    if (!buka) return undefined;
    const tutupDiLuar = (e) => {
      if (kotakRef.current && !kotakRef.current.contains(e.target)) setBuka(false);
    };
    const tombolEsc = (e) => {
      if (e.key === "Escape") setBuka(false);
    };
    document.addEventListener("mousedown", tutupDiLuar);
    document.addEventListener("keydown", tombolEsc);
    return () => {
      document.removeEventListener("mousedown", tutupDiLuar);
      document.removeEventListener("keydown", tombolEsc);
    };
  }, [buka]);

  const terpilih = (pilihan || []).filter((p) => dipilih.includes(p.id));
  const teks =
    terpilih.length === 0
      ? labelSemua || `Semua ${label.toLowerCase()}`
      : terpilih.length === 1
        ? terpilih[0].label
        : `${label}: ${terpilih.length} dipilih`;
  const judul = terpilih.length > 0 ? terpilih.map((p) => p.label).join(", ") : labelSemua || label;

  return (
    <div className="relative shrink-0" ref={kotakRef} style={{ maxWidth: lebar }}>
      <button
        type="button"
        className={`btn btn-xs justify-start gap-1 border ${
          dipilih.length > 0
            ? "border-stone-800 bg-stone-800 text-white hover:bg-stone-700"
            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
        }`}
        onClick={() => setBuka((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={buka}
        title={judul}
        style={{ maxWidth: lebar }}
      >
        <span className="truncate">{teks}</span>
        {dipilih.length > 0 ? (
          <span className="badge badge-xs border-0 bg-white/20 text-[10px]">{dipilih.length}</span>
        ) : null}
        <ChevronDown size={12} className={`shrink-0 transition ${buka ? "rotate-180" : ""}`} />
      </button>

      {buka && (
        <div
          className="absolute left-0 z-50 mt-1 max-h-72 w-64 overflow-auto rounded-lg border border-stone-200 bg-white p-1 shadow-lg"
          role="listbox"
          aria-multiselectable="true"
          aria-label={label}
        >
          <div className="flex items-center justify-between gap-2 px-2 py-1">
            <span className="text-[11px] font-semibold text-stone-500">{label}</span>
            {dipilih.length > 0 && (
              <button
                type="button"
                className="flex items-center gap-0.5 text-[11px] text-stone-500 hover:text-stone-900"
                onClick={() => onChange([])}
              >
                <X size={11} /> Kosongkan
              </button>
            )}
          </div>

          {(!pilihan || pilihan.length === 0) && (
            <p className="px-2 py-3 text-center text-[11px] italic text-stone-400">Belum ada pilihan.</p>
          )}

          {(pilihan || []).map((p) => {
            const aktif = dipilih.includes(p.id);
            return (
              <button
                key={p.kunci || p.id}
                type="button"
                role="option"
                aria-selected={aktif}
                className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs ${
                  aktif ? "bg-stone-100 text-stone-900" : "text-stone-700 hover:bg-stone-50"
                }`}
                onClick={() => onChange(togglePilihan(dipilih, p.id))}
              >
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                    aktif ? "border-stone-800 bg-stone-800 text-white" : "border-stone-300 bg-white"
                  }`}
                >
                  {aktif && <Check size={11} />}
                </span>
                <span className="min-w-0 flex-1 truncate">{p.label}</span>
                {typeof p.jumlah === "number" && (
                  <span className="shrink-0 text-[10px] text-stone-400">{p.jumlah}</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
