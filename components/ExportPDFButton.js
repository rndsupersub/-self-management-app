// components/ExportPDFButton.js
"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";

export default function ExportPDFButton({ 
  targetId = "export-area", 
  fileName = "laporan.pdf", 
  title = "Laporan",
  orientation = "auto" 
}) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    const element = document.getElementById(targetId);
    if (!element) {
      alert(`Area dengan ID "${targetId}" tidak ditemukan.`);
      return;
    }

    setIsExporting(true);

    try {
      // Import html2pdf secara dinamis
      const html2pdf = (await import("html2pdf.js")).default;

      // Deteksi Landscape untuk Time Schedule
      const isTimeSchedule = element.innerHTML.includes("Time Schedule") || element.innerHTML.includes("TimeSchedule");
      const pdfOrientation = orientation === "auto" ? (isTimeSchedule ? "l" : "p") : orientation;

      // Konfigurasi Export
      const opt = {
        margin:       [10, 5, 15, 5], // Top, Left, Bottom (buat footer), Right
        filename:     fileName,
        image:        { type: 'jpeg', quality: 1 },
        html2canvas:  { 
          scale: 2, 
          useCORS: true, 
          backgroundColor: "#ffffff",
          logging: false,
          ignoreElements: (el) => el.hasAttribute("data-html2canvas-ignore"),
          windowWidth: 1200, 
          onclone: (clonedDoc) => {
            const clonedElement = clonedDoc.getElementById(targetId);
            if (clonedElement) {
              // Bongkar scroll
              clonedElement.style.height = "auto";
              clonedElement.style.maxHeight = "none";
              clonedElement.style.overflow = "visible";
              
              let parent = clonedElement.parentElement;
              while (parent && parent.tagName !== "BODY") {
                parent.style.overflow = "visible";
                parent.style.height = "auto";
                parent.style.maxHeight = "none";
                parent = parent.parentElement;
              }
              
              const scrollElements = clonedElement.querySelectorAll(".overflow-x-auto");
              scrollElements.forEach(el => {
                el.style.overflow = "visible";
              });

              // KUNCI ANTI-KEPOTONG: Paksa semua Card biar ga dipotong
              const cards = clonedElement.querySelectorAll('.card, details, table');
              cards.forEach(card => {
                card.style.pageBreakInside = "avoid";
                card.style.breakInside = "avoid";
              });
            }
          }
        },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: pdfOrientation },
        pagebreak:    { mode: ['css', 'legacy'], avoid: '.card, details, table' } 
      };

      // Proses cetak
      const worker = html2pdf().set(opt).from(element);
      
      // Tambahin footer halaman
      await worker.toPdf().get('pdf').then((pdf) => {
        const totalPages = pdf.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          pdf.setFontSize(8);
          pdf.setTextColor(150);
          pdf.text(`${title} — Halaman ${i} dari ${totalPages}`, 5, pdf.internal.pageSize.getHeight() - 5);
        }
      });

      // Simpan
      await worker.save();

    } catch (err) {
      console.error("Export PDF error:", err);
      alert("Gagal export PDF: " + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="btn btn-outline btn-sm gap-1 text-gray-700 hover:bg-gray-100"
      title="Export halaman ini ke PDF"
      data-html2canvas-ignore="true"
    >
      {isExporting ? <span className="loading loading-spinner loading-xs" /> : <FileDown size={16} />}
      <span className="hidden md:inline">{isExporting ? "Exporting..." : "Export PDF"}</span>
    </button>
  );
}