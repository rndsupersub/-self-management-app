// components/GrafikGaris.js
"use client";

// Grafik garis/spline pembanding dua periode.
// - Periode yang sedang berjalan: garis tebal, penuh warna.
// - Periode sebelumnya: garis putus-putus, lebih transparan.
// Warnanya sama untuk jenis data yang sama (masuk = hijau, keluar = merah),
// jadi mata langsung bisa membandingkan tanpa membaca legenda dulu.

import { useMemo, useState } from "react";
import { formatRupiah, formatRupiahSingkat } from "@/lib/keuanganData";

const WARNA = {
  masuk: "#16a34a",
  keluar: "#dc2626",
};

const TINGGI = 210;

function jalurSpline(titik) {
  if (titik.length === 0) return "";
  if (titik.length === 1) return `M ${titik[0].x} ${titik[0].y}`;
  let d = `M ${titik[0].x} ${titik[0].y}`;
  for (let i = 0; i < titik.length - 1; i++) {
    const p0 = titik[i - 1] || titik[i];
    const p1 = titik[i];
    const p2 = titik[i + 1];
    const p3 = titik[i + 2] || p2;
    const t = 0.18;
    const c1x = p1.x + (p2.x - p0.x) * t;
    const c1y = p1.y + (p2.y - p0.y) * t;
    const c2x = p2.x - (p3.x - p1.x) * t;
    const c2y = p2.y - (p3.y - p1.y) * t;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

export default function GrafikGaris({
  data = [],
  labelSekarang = "Periode ini",
  labelLalu = "Periode lalu",
  tinggi = TINGGI,
}) {
  const [aktif, setAktif] = useState(null);

  const lebar = 760;
  const padKiri = 46;
  const padKanan = 10;
  const padAtas = 12;
  const padBawah = 26;

  const grafik = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return null;
    const nilai = data.flatMap((d) => [
      Number(d.sekarangMasuk) || 0,
      Number(d.sekarangKeluar) || 0,
      Number(d.laluMasuk) || 0,
      Number(d.laluKeluar) || 0,
    ]);
    const maks = Math.max(...nilai, 1);
    const dalam = lebar - padKiri - padKanan;
    const isiTinggi = tinggi - padAtas - padBawah;
    const langkah = data.length > 1 ? dalam / (data.length - 1) : 0;
    const x = (i) => padKiri + (data.length > 1 ? i * langkah : dalam / 2);
    const y = (v) => padAtas + isiTinggi - (Math.max(0, v) / maks) * isiTinggi;

    const seri = [
      {
        kunci: "sekarangMasuk",
        warna: WARNA.masuk,
        putus: false,
        nama: `Masuk · ${labelSekarang}`,
      },
      {
        kunci: "laluMasuk",
        warna: WARNA.masuk,
        putus: true,
        nama: `Masuk · ${labelLalu}`,
      },
      {
        kunci: "sekarangKeluar",
        warna: WARNA.keluar,
        putus: false,
        nama: `Keluar · ${labelSekarang}`,
      },
      {
        kunci: "laluKeluar",
        warna: WARNA.keluar,
        putus: true,
        nama: `Keluar · ${labelLalu}`,
      },
    ].map((s) => ({
      ...s,
      titik: data.map((d, i) => ({ x: x(i), y: y(Number(d[s.kunci]) || 0), nilai: Number(d[s.kunci]) || 0 })),
    }));

    return { maks, x, y, seri, dalam, isiTinggi };
  }, [data, labelSekarang, labelLalu, tinggi]);

  if (!grafik) return null;

  const { maks, x, y, seri, isiTinggi } = grafik;
  const garis = [0, 0.25, 0.5, 0.75, 1];
  const titikAktif = aktif === null ? null : data[aktif];
  const langkahLabel = Math.max(1, Math.ceil(data.length / 10));

  return (
    <div>
      <div className="w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${lebar} ${tinggi}`}
          className="w-full"
          style={{ height: tinggi }}
          role="img"
          aria-label={`Grafik garis pemasukan dan pengeluaran: ${labelSekarang} dibanding ${labelLalu}`}
        >
          {garis.map((p) => (
            <g key={p}>
              <line
                x1={46}
                x2={lebar - 10}
                y1={12 + isiTinggi * (1 - p)}
                y2={12 + isiTinggi * (1 - p)}
                stroke={p === 0 ? "#d6d3d1" : "#e7e5e4"}
                strokeDasharray={p === 0 ? "" : "3 4"}
              />
              <text
                x={40}
                y={12 + isiTinggi * (1 - p) + 3}
                textAnchor="end"
                fontSize="9"
                fill="#a8a29e"
              >
                {formatRupiahSingkat(maks * p)}
              </text>
            </g>
          ))}

          {seri.map((s) => (
            <path
              key={s.kunci}
              d={jalurSpline(s.titik)}
              fill="none"
              stroke={s.warna}
              strokeWidth={s.putus ? 1.6 : 2.6}
              strokeDasharray={s.putus ? "5 4" : ""}
              opacity={s.putus ? 0.42 : 1}
              strokeLinecap="round"
            />
          ))}

          {/* Titik interaksi untuk membaca nilai per label. */}
          {data.map((d, i) => (
            <rect
              key={`zona-${i}`}
              x={x(i) - (grafik.dalam / Math.max(1, data.length)) / 2}
              y={0}
              width={grafik.dalam / Math.max(1, data.length)}
              height={tinggi - 20}
              fill="transparent"
              onMouseEnter={() => setAktif(i)}
              onMouseLeave={() => setAktif(null)}
              style={{ cursor: "pointer" }}
            />
          ))}

          {aktif !== null && (
            <line
              x1={x(aktif)}
              x2={x(aktif)}
              y1={8}
              y2={tinggi - padBawahGaris(tinggi)}
              stroke="#a8a29e"
              strokeDasharray="3 3"
            />
          )}

          {data.map((d, i) =>
            i % langkahLabel === 0 || i === data.length - 1 ? (
              <text
                key={`label-${i}`}
                x={x(i)}
                y={tinggi - 6}
                textAnchor="middle"
                fontSize="9"
                fill="#78716c"
              >
                {d.label}
              </text>
            ) : null
          )}
        </svg>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-2 text-[11px] text-stone-600">
        <span className="flex items-center gap-1">
          <span className="inline-block w-5 h-0.5 rounded" style={{ background: WARNA.masuk }} />
          Masuk · {labelSekarang}
        </span>
        <span className="flex items-center gap-1">
          <span
            className="inline-block w-5 h-0.5 rounded opacity-50"
            style={{ background: WARNA.masuk, backgroundImage: "repeating-linear-gradient(90deg,#16a34a 0 4px,transparent 4px 7px)" }}
          />
          Masuk · {labelLalu}
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-5 h-0.5 rounded" style={{ background: WARNA.keluar }} />
          Keluar + sedekah · {labelSekarang}
        </span>
        <span className="flex items-center gap-1">
          <span
            className="inline-block w-5 h-0.5 rounded opacity-50"
            style={{ background: WARNA.keluar, backgroundImage: "repeating-linear-gradient(90deg,#dc2626 0 4px,transparent 4px 7px)" }}
          />
          Keluar + sedekah · {labelLalu}
        </span>
      </div>

      <div className="mt-2 min-h-[34px] rounded border border-stone-200 bg-stone-50 px-2 py-1 text-[11px] text-stone-600">
        {titikAktif ? (
          <span>
            <strong>{titikAktif.label}</strong> · masuk {formatRupiah(titikAktif.sekarangMasuk || 0)}{" "}
            (lalu {formatRupiah(titikAktif.laluMasuk || 0)}) · keluar{" "}
            {formatRupiah(titikAktif.sekarangKeluar || 0)} (lalu{" "}
            {formatRupiah(titikAktif.laluKeluar || 0)})
          </span>
        ) : (
          <span className="text-stone-400">
            Arahkan kursor ke grafik untuk melihat angka tiap titik. Garis pudar/putus-putus = periode
            sebelumnya.
          </span>
        )}
      </div>
    </div>
  );
}

// Tinggi area bawah grafik dipakai untuk label sumbu X.
function padBawahGaris(tinggi) {
  return Math.max(0, Math.round(tinggi * 0.12));
}
