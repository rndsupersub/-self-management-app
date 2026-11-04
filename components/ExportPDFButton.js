// components/ExportPDFButton.js
"use client";

import { useState } from "react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { FileDown } from "lucide-react";

export default function ExportPDFButton({ 
  targetId = "export-area", 
  fileName = "laporan.pdf", 
  title = "Laporan",
  orientation = "auto" // "portrait", "landscape", atau "auto"
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
      // Auto-detect: Kalau di dalamnya ada teks "Time Schedule" atau tabel lebar, pakai Landscape
      const isTimeSchedule = element.innerHTML.includes("Time Schedule") || element.innerHTML.includes("TimeSchedule");
      const pdfOrientation = orientation === "auto" 
        ? (isTimeSchedule ? "l" : "p") 
        : orientation;

      const canvas = await html2canvas(element, {
        scale: 2, // Resolusi tinggi
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        ignoreElements: (el) => el.hasAttribute("data-html2canvas-ignore"),
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById(targetId);
          if (clonedElement) {
            // 1. Trik Biar Nggak Kepotong
            clonedElement.style.height = "auto";
            clonedElement.style.maxHeight = "none";
            clonedElement.style.minHeight = "auto";
            clonedElement.style.overflow = "visible";
            clonedElement.style.paddingBottom = "20mm";
            
            // 2. Paksa elemen lebar (seperti Gantt Chart min-w-[800px]) jadi 100% biar masuk kertas
            const wideElements = clonedElement.querySelectorAll(".min-w-\\[800px\\], .min-w-\\[600px\\], table");
            wideElements.forEach(el => {
              el.style.minWidth = "100%";
              el.style.width = "100%";
            });

            // 3. Trik Kecilin Font & Spasi Kalau Data Banyak (biar hemat tempat)
            const style = clonedDoc.createElement("style");
            style.innerHTML = `
              .text-xs { font-size: 10px !important; }
              .text-sm { font-size: 12px !important; }
              .p-4 { padding: 8px !important; }
              .p-3 { padding: 6px !important; }
              .space-y-2 > * + * { margin-top: 4px !important; }
              .space-y-1 > * + * { margin-top: 2px !important; }
              
              /* Anti Page Break: Jangan potong baris kegiatan jadi 2 */
              .card, .border, tr, .flex.items-center { 
                page-break-inside: avoid !important; 
                break-inside: avoid !important; 
              }
            `;
            clonedDoc.head.appendChild(style);

            // Naikin semua parent jadi auto-height
            let parent = clonedElement.parentElement;
            while (parent && parent.tagName !== "BODY") {
              parent.style.height = "auto";
              parent.style.minHeight = "auto";
              parent.style.overflow = "visible";
              parent = parent.parentElement;
            }
          }
        }
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF(pdfOrientation, "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Hitung rasio gambar biar proporsional nggak melar
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Slicing halaman kalau datanya panjang (Kasus Banyak Data)
      while (heightLeft > 1) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      // Bikin Footer (Halaman X dari Y)
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, pdfHeight - 10, pdfWidth, 10, 'F');
        pdf.setFontSize(8);
        pdf.setTextColor(150);
        pdf.text(`${title} — Halaman ${i} dari ${totalPages}`, 10, pdfHeight - 3);
      }

      pdf.save(fileName);
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
      {isExporting ? (
        <span className="loading loading-spinner loading-xs" />
      ) : (
        <FileDown size={16} />
      )}
      <span className="hidden md:inline">{isExporting ? "Exporting..." : "Export PDF"}</span>
    </button>
  );
}