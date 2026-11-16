// components/RiwayatKeuangan.js
"use client";

import { useMemo, useState } from "react";
import {
  History,
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  Landmark,
  HeartHandshake,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Info,
  Banknote,
  Scale,
} from "lucide-react";
import { DEFAULT_KATEGORI, DEFAULT_DOMPET, formatRupiah } from "@/lib/keuanganData";
import { PERIODE_RIWAYAT, analisisRiwayat } from "@/lib/riwayatKeuangan";
import { parseTanggalLokal } from "@/lib/tanggalLokal";
import GrafikBatang from "@/components/GrafikBatang";
import PerbandinganPeriode from "@/components/PerbandinganPeriode";

const GAYA_INSIGHT = {
  danger: "bg-red-50 border-red-200 text-red-800",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  success: "bg-green-50 border-green-200 text-green-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
};

const IKON_INSIGHT = {
  danger: AlertTriangle,
  warning: AlertTriangle,
  success: CheckCircle2,
  info: Info,
};

const LABEL_JENIS = {
  masuk: "Masuk",
  keluar: "Keluar",
  tabungan: "Tabungan",
  sedekah: "Sedekah",
};

const WARNA_JENIS = {
  masuk: "text-green-700 bg-green-50 border-green-200",
  keluar: "text-red-700 bg-red-50 border-red-200",
  tabungan: "text-blue-700 bg-blue-50 border-blue-200",
  sedekah: "text-orange-700 bg-orange-50 border-orange-200",
};

function Selisih({ nilai, naikBagus = false }) {
  if (!nilai || nilai.persen === null) {
    return <span className="text-[11px] text-gray-400">belum ada pembanding</span>;
  }
  if (nilai.selisih === 0) {
    return <span className="text-[11px] text-gray-400">sama dengan periode lalu</span>;
  }
  const naik = nilai.selisih > 0;
  const bagus = naikBagus ? naik : !naik;
  const Icon = naik ? TrendingUp : TrendingDown;
  return (
    <span
      className={`text-[11px] inline-flex items-center gap-1 ${
        bagus ? "text-green-600" : "text-red-600"
      }`}
    >
      <Icon size={12} /> {Math.abs(nilai.persen)}% vs periode lalu
    </span>
  );
}

function Kartu({ judul, nominal, ikon, selisih, naikBagus, warna, catatan }) {
  return (
    <div className="card bg-white shadow border border-gray-200">
      <div className="card-body p-4">
        <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
          {ikon} {judul}
        </p>
        <p className={`text-xl font-bold ${warna}`}>{formatRupiah(nominal)}</p>
        {catatan && <p className="text-[11px] text-gray-400 mt-1">{catatan}</p>}
        <div className="mt-1">
          <Selisih nilai={selisih} naikBagus={naikBagus} />
        </div>
      </div>
    </div>
  );
}

export default function RiwayatKeuangan({
  keuanganTransaksi = {},
  kategoriList = DEFAULT_KATEGORI,
  dompetList = DEFAULT_DOMPET,
}) {
  const [kunci, setKunci] = useState("bulan-lalu");

  const analisis = useMemo(
    () => analisisRiwayat(keuanganTransaksi, kunci, { kategoriList, dompetList }),
    [keuanganTransaksi, kunci, kategoriList, dompetList]
  );

  const { sekarang, banding, segmen, top, insight } = analisis;
  const keluarTotal = sekarang.total.keluar + sekarang.total.sedekah;

  const dataGrafik = useMemo(
    () =>
      segmen.map((s) => ({
        label: s.label,
        a: s.masuk,
        b: s.keluar + s.sedekah,
        keterangan: `Net ${formatRupiah(s.net)} · ${s.jumlahTrx} transaksi`,
      })),
    [segmen]
  );

  const perTanggal = useMemo(() => {
    const map = new Map();
    sekarang.list.forEach((t) => {
      if (!map.has(t.tanggal)) map.set(t.tanggal, []);
      map.get(t.tanggal).push(t);
    });
    return Array.from(map.entries());
  }, [sekarang.list]);

  const labelTanggal = (tanggal) => {
    const d = parseTanggalLokal(tanggal);
    return d
      ? d.toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : tanggal;
  };

  return (
    <div className="space-y-4">
      {/* PILIH PERIODE */}
      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1">
              <History size={16} /> Riwayat Keuangan
            </h3>
            <div className="tabs tabs-boxed bg-base-200 p-1 w-fit flex-wrap" data-html2canvas-ignore="true">
              {PERIODE_RIWAYAT.map((p) => (
                <button
                  key={p.kunci}
                  className={`tab tab-xs ${
                    kunci === p.kunci
                      ? "tab-active bg-blue-600 text-white font-semibold"
                      : "text-gray-600"
                  }`}
                  onClick={() => setKunci(p.kunci)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            <span className="font-semibold text-gray-700">{analisis.labelPeriode}</span>
            {" · "}dibanding {analisis.labelPembanding}
            {sekarang.jumlahTrx > 0 &&
              ` · ${sekarang.jumlahTrx} transaksi di ${sekarang.hariAktif} hari`}
          </p>
        </div>
      </div>

      {/* INSIGHT: MISNYA DI MANA */}
      <div className="space-y-2">
        {insight.map((item, idx) => {
          const Icon = IKON_INSIGHT[item.tipe] || Info;
          return (
            <div
              key={idx}
              className={`rounded p-2 border text-xs flex items-start gap-2 ${
                GAYA_INSIGHT[item.tipe] || GAYA_INSIGHT.info
              }`}
            >
              <Icon size={14} className="mt-0.5 shrink-0" />
              <span>{item.pesan}</span>
            </div>
          );
        })}
      </div>

      {/* ANGKA PERIODE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <Kartu
          judul="Pemasukan"
          nominal={sekarang.total.masuk}
          ikon={<Wallet size={14} />}
          selisih={banding.masuk}
          naikBagus
          warna="text-green-700"
        />
        <Kartu
          judul="Pengeluaran"
          nominal={keluarTotal}
          ikon={<ArrowUpRight size={14} />}
          selisih={banding.keluar}
          warna={keluarTotal > 0 ? "text-red-700" : "text-gray-800"}
          catatan={
            sekarang.total.sedekah > 0
              ? `termasuk sedekah ${formatRupiah(sekarang.total.sedekah)}`
              : null
          }
        />
        <Kartu
          judul="Tabungan"
          nominal={sekarang.total.tabungan}
          ikon={<Landmark size={14} />}
          warna="text-blue-700"
        />
        <Kartu
          judul="Cash Flow Bersih"
          nominal={sekarang.net}
          ikon={<HeartHandshake size={14} />}
          selisih={banding.net}
          naikBagus
          warna={sekarang.net < 0 ? "text-red-700" : "text-gray-800"}
          catatan="masuk − keluar − tabungan − sedekah"
        />
      </div>

      {/* TREN */}
      {dataGrafik.length > 0 && (
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-4">
            <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1">
                <BarChart3 size={16} /> Tren per{" "}
                {analisis.periode.granularitas === "hari"
                  ? "hari"
                  : analisis.periode.granularitas === "minggu"
                    ? "minggu"
                    : "bulan"}
              </h3>
              <p className="text-[11px] text-gray-500">
                Total masuk {formatRupiah(sekarang.total.masuk)} · keluar {formatRupiah(keluarTotal)}
              </p>
            </div>
            <GrafikBatang data={dataGrafik} labelB="Keluar + Sedekah" />
          </div>
        </div>
      )}

      {/* HEAD TO HEAD */}
      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          <h3 className="text-sm font-bold text-gray-800 mb-1 flex items-center gap-1">
            <Scale size={16} /> Head to Head
          </h3>
          <p className="text-[11px] text-gray-500 mb-3">
            {analisis.labelPeriode} vs {analisis.labelPembanding}
          </p>
          <PerbandinganPeriode
            sekarang={sekarang}
            lalu={analisis.lalu}
            labelSekarang={analisis.labelPeriode}
            labelLalu={analisis.labelPembanding}
          />
        </div>
      </div>

      {/* TOP KATEGORI */}
      {top.length > 0 && (
        <div className="card bg-white shadow border border-gray-200">
          <div className="card-body p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1">
              <TrendingUp size={16} /> Paling Banyak Keluar
            </h3>
            <div className="space-y-2">
              {top.map((item, idx) => (
                <div key={item.kategori} className="p-2 rounded border border-gray-200 bg-gray-50">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-700">
                      {idx + 1}. {item.kategori}
                      <span className="text-xs text-gray-400"> ({item.jumlah}x)</span>
                    </span>
                    <span className="font-semibold text-red-600">{formatRupiah(item.total)}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <progress
                      className="progress progress-error h-1.5 flex-1"
                      value={item.persen}
                      max="100"
                    />
                    <span className="text-[10px] text-gray-500 w-9 text-right">{item.persen}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DAFTAR TRANSAKSI: GUA NGAPAIN AJA */}
      <div className="card bg-white shadow border border-gray-200">
        <div className="card-body p-4">
          <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1">
            <Banknote size={16} /> Yang Kamu Lakukan
          </h3>
          {perTanggal.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Banknote size={40} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Belum ada transaksi di periode ini.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {perTanggal.map(([tanggal, list]) => {
                const totalHari = list.reduce((acc, t) => {
                  acc[t.jenis] = (acc[t.jenis] || 0) + t.nominal;
                  return acc;
                }, {});
                return (
                  <div key={tanggal}>
                    <div className="flex flex-wrap justify-between items-baseline gap-1 mb-1">
                      <p className="text-xs font-semibold text-gray-700">{labelTanggal(tanggal)}</p>
                      <p className="text-[10px] text-gray-500">
                        {Object.entries(totalHari)
                          .map(
                            ([jenis, total]) =>
                              `${LABEL_JENIS[jenis] || jenis} ${formatRupiah(total)}`
                          )
                          .join(" · ")}
                      </p>
                    </div>
                    <div className="space-y-1">
                      {list.map((trx) => (
                        <div
                          key={trx.id || `${trx.jenis}-${trx.nominal}-${trx.catatan}`}
                          className={`flex justify-between items-start gap-2 p-2 rounded border text-xs ${
                            WARNA_JENIS[trx.jenis] || "bg-gray-50 border-gray-200 text-gray-700"
                          }`}
                        >
                          <div className="min-w-0">
                            <p className="font-semibold">
                              {LABEL_JENIS[trx.jenis] || trx.jenis}
                              <span className="ml-1 font-normal opacity-80">
                                {trx.catatan || "-"}
                              </span>
                            </p>
                          </div>
                          <span className="font-bold whitespace-nowrap">
                            {trx.jenis === "masuk" ? "+" : "-"}
                            {formatRupiah(trx.nominal)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
