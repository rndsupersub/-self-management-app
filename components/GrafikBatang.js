// components/GrafikBatang.js
// Grafik batang berpasangan (masuk vs keluar) yang tingginya dihitung dalam
// piksel, bukan persen. Versi lama pakai `height: x%` di dalam flex yang
// tingginya nggak pasti, jadi semua batang collapse jadi garis tipis (datar).

"use client";

import { formatRupiah, formatRupiahSingkat } from "@/lib/keuanganData";

export default function GrafikBatang({
  data = [],
  labelA = "Masuk",
  labelB = "Keluar",
  warnaA = "bg-green-500",
  warnaB = "bg-error",
  tinggi = 180,
}) {
  if (!data.length) return null;

  const maks = Math.max(
    ...data.map((d) => Math.max(Number(d.a) || 0, Number(d.b) || 0)),
    1
  );
  const garis = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div>
      <div className="flex gap-2">
        {/* Sumbu Y */}
        <div
          className="flex flex-col justify-between text-[10px] text-gray-400 w-12 shrink-0 pb-0"
          style={{ height: tinggi }}
        >
          {[...garis].reverse().map((p) => (
            <span key={p} className="text-right leading-none">
              {formatRupiahSingkat(maks * p)}
            </span>
          ))}
        </div>

        <div className="flex-1 min-w-0">
          <div className="relative" style={{ height: tinggi }}>
            {/* Gridline */}
            {garis.map((p) => (
              <div
                key={p}
                className={`absolute left-0 right-0 border-t ${
                  p === 0 ? "border-gray-300" : "border-dashed border-gray-100"
                }`}
                style={{ top: tinggi * (1 - p) }}
              />
            ))}

            <div className="absolute inset-0 flex items-end justify-around gap-1">
              {data.map((d) => {
                const a = Math.max(Number(d.a) || 0, 0);
                const b = Math.max(Number(d.b) || 0, 0);
                const tinggiA = a > 0 ? Math.max((a / maks) * tinggi, 2) : 0;
                const tinggiB = b > 0 ? Math.max((b / maks) * tinggi, 2) : 0;
                return (
                  <div
                    key={d.label}
                    className="flex-1 min-w-0 h-full flex items-end justify-center gap-[3px]"
                    title={`${d.label}\n${labelA}: ${formatRupiah(a)}\n${labelB}: ${formatRupiah(b)}${
                      d.keterangan ? `\n${d.keterangan}` : ""
                    }`}
                  >
                    <div
                      className={`w-full max-w-[18px] rounded-t-sm ${warnaA}`}
                      style={{ height: tinggiA }}
                    />
                    <div
                      className={`w-full max-w-[18px] rounded-t-sm ${warnaB}`}
                      style={{ height: tinggiB }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sumbu X */}
          <div className="flex items-start justify-around gap-1 mt-1">
            {data.map((d) => (
              <div key={d.label} className="flex-1 min-w-0 text-center">
                <p className="text-[10px] text-gray-500 truncate leading-tight">{d.label}</p>
                {d.sublabel && (
                  <p className="text-[9px] text-gray-400 truncate leading-tight">{d.sublabel}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-600 justify-center">
        <div className="flex items-center gap-1">
          <span className={`w-3 h-3 rounded ${warnaA}`} />
          <span>{labelA}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className={`w-3 h-3 rounded ${warnaB}`} />
          <span>{labelB}</span>
        </div>
      </div>
    </div>
  );
}
