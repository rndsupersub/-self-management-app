// components/ExportPDFButton.js
"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";

export default function ExportPDFButton({ 
  targetId = "export-area", 
  fileName = "laporan.pdf", // Props dipertahankan biar kompatibel
  title = "Laporan",
  orientation = "auto" 
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
      className="btn btn-outline btn-sm gap-1 text-gray-700 hover:bg-gray-100"
      title="Export halaman ini ke PDF"
      data-html2canvas-ignore="true" // Biar tombol ini ga ikut ke print
    >
      {isExporting ? <span className="loading loading-spinner loading-xs" /> : <FileDown size={16} />}
      <span className="hidden md:inline">{isExporting ? "Menyiapkan..." : "Export PDF"}</span>
    </button>
  );
}