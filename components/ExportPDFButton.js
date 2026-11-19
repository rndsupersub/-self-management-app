// components/ExportPDFButton.js
"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";

export default function ExportPDFButton({ 
  targetId = "export-area", 
  fileName = "laporan.pdf", 
  title = "Laporan",
  orientation = "auto",
  variant = "default",
}) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);

    // Kasih jeda dikit biar UI nampilin loading sebentar
    setTimeout(() => {
      window.print();
      setIsExporting(false);
    }, 500);
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className={`btn btn-sm gap-1 ${
        variant === "light"
          ? "border-white/20 bg-white/10 text-stone-100 hover:bg-white/20"
          : "btn-outline text-gray-700 hover:bg-gray-100"
      }`}
      title="Export halaman ini ke PDF"
      data-html2canvas-ignore="true" // Biar tombol ini ga ikut ke print
    >
      {isExporting ? <span className="loading loading-spinner loading-xs" /> : <FileDown size={16} />}
      <span className="hidden md:inline">{isExporting ? "Menyiapkan..." : "Export PDF"}</span>
    </button>
  );
}