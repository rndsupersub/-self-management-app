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

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff", // Putih bersih
        logging: false,
        ignoreElements: (el) => el.hasAttribute("data-html2canvas-ignore"),
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById(targetId);
          if (clonedElement) {
            // 1. PAKSA LEBAR DESKTOP (1200px) BIAR GRID KALENDER GA HANCUR
            clonedElement.style.width = "1200px";
            clonedElement.style.maxWidth = "none";
            clonedElement.style.padding = "20px";
            clonedElement.style.backgroundColor = "#ffffff";
            
            // 2. BONGKAR SCROLL & FLEXBOX
            clonedElement.style.height = "auto";
            clonedElement.style.maxHeight = "none";
            clonedElement.style.overflow = "visible";

            let parent = clonedElement.parentElement;
            while (parent && parent.tagName !== "BODY") {
              parent.style.overflow = "visible";
              parent.style.height = "auto";
              parent.style.display = "block"; // Matiin flexbox
              parent = parent.parentElement;
            }

            // 3. BONGKAR SCROLL PADA TABEL / GANTT CHART
            const scrollElements = clonedElement.querySelectorAll(".overflow-x-auto");
            scrollElements.forEach(el => {
              el.style.overflow = "visible";
            });
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

      // LOGIKA POTONG PER HALAMAN (ANTI GEPENG & ANTI HITAM)
      while (currentY < imgHeight) {
        const remaining = imgHeight - currentY;
        const sliceHeight = Math.min(pageHeightInCanvasPx, remaining);
        
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = canvas.width;
        tempCanvas.height = sliceHeight;
        const ctx = tempCanvas.getContext("2d");
        
        // Paksa background kertas putih biar ga ada kotak item
        ctx.fillStyle = "#ffffff"; 
        ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        
        // Gambar potongannya
        ctx.drawImage(canvas, 0, currentY, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);

        const slicedImgData = tempCanvas.toDataURL("image/jpeg", 0.95);
        const renderHeight = (sliceHeight * imgWidth) / canvas.width;
        
        if (currentY > 0) pdf.addPage();
        pdf.addImage(slicedImgData, "JPEG", 0, 0, imgWidth, renderHeight);
        
        currentY += sliceHeight;
      }

      // Footer
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFillColor("#ffffff");
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