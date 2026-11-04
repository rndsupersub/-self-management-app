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
      const isTimeSchedule = element.innerHTML.includes("Time Schedule") || element.innerHTML.includes("TimeSchedule");
      const pdfOrientation = orientation === "auto" ? (isTimeSchedule ? "l" : "p") : orientation;

      // KITA GUNAKAN WARNA HEX STATIS (Aman buat jsPDF)
      const SAFE_BG_COLOR = "#f8fafc"; 

      // 1. Kumpulkan titik aman buat motong kertas
      const safeBreakPoints = [];
      const rows = element.querySelectorAll('.card, tr, .border, .flex.items-center');
      rows.forEach(row => {
        const rect = row.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        safeBreakPoints.push({
          top: rect.top - elementRect.top,
          bottom: rect.bottom - elementRect.top
        });
      });
      safeBreakPoints.sort((a, b) => a.top - b.top);

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: SAFE_BG_COLOR, // Pakai warna aman
        logging: false,
        ignoreElements: (el) => el.hasAttribute("data-html2canvas-ignore"),
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById(targetId);
          if (clonedElement) {
            clonedElement.style.height = "auto";
            clonedElement.style.maxHeight = "none";
            clonedElement.style.overflow = "visible";
            
            // Bongkar scroll di Gantt Chart biar ke-capture semua
            const scrollElements = clonedElement.querySelectorAll(".overflow-x-auto");
            scrollElements.forEach(el => {
              el.style.overflow = "visible";
              el.style.width = "max-content";
            });

            // Paksa teks hitam, anti pudar
            const style = clonedDoc.createElement("style");
            style.innerHTML = `* { color: #000 !important; text-shadow: none !important; opacity: 1 !important; }`;
            clonedDoc.head.appendChild(style);
          }
        }
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF(pdfOrientation, "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pageHeightInCanvasPx = (pdfHeight * canvas.width) / imgWidth;
      
      let currentY = 0;
      let pageNum = 1;

      while (currentY < imgHeight) {
        if (pageNum > 1) pdf.addPage();

        // Warnai background kertas pakai HEX (Biar nyambung ga ada jurang putih)
        pdf.setFillColor(SAFE_BG_COLOR);
        pdf.rect(0, 0, pdfWidth, pdfHeight, "F");

        // --- LOGIKA SMART PAGE BREAK (ANTI KEPOTONG) ---
        let sliceHeight = pageHeightInCanvasPx;
        let targetY = currentY + sliceHeight;
        
        const cutRow = safeBreakPoints.find(bp => 
          targetY > bp.top && targetY < bp.bottom
        );

        if (cutRow) {
          targetY = cutRow.top; 
          sliceHeight = targetY - currentY;
        }

        // Render potongan gambar
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = canvas.width;
        tempCanvas.height = sliceHeight;
        const ctx = tempCanvas.getContext("2d");
        ctx.drawImage(canvas, 0, currentY, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);

        const slicedImgData = tempCanvas.toDataURL("image/jpeg", 0.95);
        const renderHeight = (sliceHeight * imgWidth) / canvas.width;
        
        pdf.addImage(slicedImgData, "JPEG", 0, 0, imgWidth, renderHeight);

        currentY += sliceHeight;
        pageNum++;
      }

      // Footer
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFillColor(SAFE_BG_COLOR);
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
      {isExporting ? <span className="loading loading-spinner loading-xs" /> : <FileDown size={16} />}
      <span className="hidden md:inline">{isExporting ? "Exporting..." : "Export PDF"}</span>
    </button>
  );
}