// components/ExportPDFButton.js
"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";
import { eksporElemenKePdf } from "@/lib/exportPdf";

// Tombol export PDF. Isi halaman ditangkap utuh lalu disusun jadi A4
// multi-halaman; orientasi dipilih otomatis (konten lebar -> landscape)
// supaya tidak ada bagian yang terpotong.
export default function ExportPDFButton({
  targetId = "export-area",
  fileName = "laporan.pdf",
  title = "Laporan",
  orientation = "auto",
  variant = "default",
}) {
  const [isExporting, setIsExporting] = useState(false);
  const [pesan, setPesan] = useState("");

  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    setPesan("");

    try {
      const area = document.getElementById(targetId);
      if (!area) {
        // Cadangan terakhir: dialog cetak browser.
        window.print();
        return;
      }
      const hasil = await eksporElemenKePdf({
        area,
        namaFile: fileName.toLowerCase().endsWith(".pdf") ? fileName : `${fileName}.pdf`,
        judul: title,
        orientasi: orientation,
      });
      setPesan(
        hasil.orientasi === "landscape"
          ? `PDF ${hasil.halaman} halaman (landscape).`
          : `PDF ${hasil.halaman} halaman.`
      );
      setTimeout(() => setPesan(""), 6000);
    } catch (err) {
      console.error("[export-pdf]", err);
      setPesan(
        `Export otomatis gagal: ${err?.message || "tidak diketahui"}. Membuka dialog cetak browser.`
      );
      setTimeout(() => window.print(), 400);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative inline-flex flex-col items-end" data-html2canvas-ignore="true">
      <button
        type="button"
        onClick={handleExport}
        disabled={isExporting}
        className={`btn btn-sm gap-1 ${
          variant === "light"
            ? "border-white/20 bg-white/10 text-stone-100 hover:bg-white/20"
            : "btn-outline text-gray-700 hover:bg-gray-100"
        }`}
        title="Export halaman ini ke PDF (otomatis A4, orientasi menyesuaikan isi)"
      >
        {isExporting ? <span className="loading loading-spinner loading-xs" /> : <FileDown size={16} />}
        <span className="hidden md:inline">{isExporting ? "Menyiapkan..." : "Export PDF"}</span>
      </button>
      {pesan && (
        <p
          className={`mt-1 max-w-[260px] rounded-lg border px-2 py-1 text-[10px] leading-tight ${
            pesan.startsWith("Export otomatis gagal")
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-green-200 bg-green-50 text-green-700"
          }`}
        >
          {pesan}
        </p>
      )}
      {isExporting && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-stone-900/40 backdrop-blur-sm"
          data-html2canvas-ignore="true"
        >
          <div className="rounded-2xl bg-white px-6 py-5 text-center shadow-xl">
            <span className="mx-auto mb-2 block h-7 w-7 animate-spin rounded-full border-2 border-stone-200 border-t-stone-800" />
            <p className="text-sm font-semibold text-stone-800">Menyiapkan PDF...</p>
            <p className="text-xs text-stone-500">Isi panjang dipotong otomatis per halaman A4.</p>
          </div>
        </div>
      )}
    </div>
  );
}
