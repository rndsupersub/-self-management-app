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
      // 1. Deteksi orientasi kertas (Landscape buat Time Schedule)
      const isTimeSchedule = element.innerHTML.includes("Time Schedule") || element.innerHTML.includes("TimeSchedule");
      const pdfOrientation = orientation === "auto" ? (isTimeSchedule ? "l" : "p") : orientation;

      // 2. Ambil warna background asli web lo (biar nyambung)
      const bodyBg = window.getComputedStyle(document.body).backgroundColor;
      const pdfBgColor = bodyBg === "rgba(0, 0, 0, 0)" ? "#f8fafc" : bodyBg; // Fallback ke slate-50

      // 3. Kumpulkan titik-titik aman buat motong kertas (Anti Kepotong)
      const safeBreakPoints = [];
      const rows = element.querySelectorAll('.card, tr, .border, .flex.items-center');
      rows.forEach(row => {
        const rect = row.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        // Simpan posisi Y relatif terhadap targetId
        safeBreakPoints.push({
          top: rect.top - elementRect.top,
          bottom: rect.bottom - elementRect.top
        });
      });
      safeBreakPoints.sort((a, b) => a.top - b.top);

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: pdfBgColor,
        logging: false,
        ignoreElements: (el) => el.hasAttribute("data-html2canvas-ignore"),
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById(targetId);
          if (clonedElement) {
            clonedElement.style.height = "auto";
            clonedElement.style.maxHeight = "none";
            clonedElement.style.overflow = "visible";
            
            // Trik biar Gantt Chart (yang ada scroll-nya) ke-capture semua
            const scrollElements = clonedElement.querySelectorAll(".overflow-x-auto");
            scrollElements.forEach(el => {
              el.style.overflow = "visible";
              el.style.width = "max-content";
            });

            // Paksa warna teks jadi hitam biar ga pudar
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
      
      // Konversi tinggi kertas A4 ke skala pixel canvas
      const pageHeightInCanvasPx = (pdfHeight * canvas.width) / imgWidth;
      
      let currentY = 0; // Posisi Y gambar yang udah di-print
      let pageNum = 1;

      while (currentY < imgHeight) {
        if (pageNum > 1) pdf.addPage();

        // Warnai background kertas biar ga ada jurang putih
        pdf.setFillColor(pdfBgColor);
        pdf.rect(0, 0, pdfWidth, pdfHeight, "F");

        // --- LOGIKA SMART PAGE BREAK ---
        let sliceHeight = pageHeightInCanvasPx;
        let targetY = currentY + sliceHeight;
        
        // Cari apakah ada baris yang kepotong di targetY
        const cutRow = safeBreakPoints.find(bp => 
          targetY > bp.top && targetY < bp.bottom
        );

        if (cutRow) {
          // Kalau ada yang kepotong, potong garis di ATAS baris tersebut
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

        // Pindah ke halaman berikutnya
        currentY += sliceHeight;
        pageNum++;
      }

      // Bikin Footer
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFillColor(pdfBgColor);
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