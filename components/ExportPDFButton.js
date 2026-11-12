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
        backgroundColor: "#ffffff",
        logging: false,
        ignoreElements: (el) => el.hasAttribute("data-html2canvas-ignore"),
        windowWidth: 1200, 
        windowHeight: element.scrollHeight, 

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

            // KUNCI PERBAIKAN: Kasih jarak aman di paling bawah biar teks terakhir ga mepet banget sama potongan halaman
            clonedElement.style.paddingBottom = "15mm";
          }
        }
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF(pdfOrientation, "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // Cetak Halaman 1
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Cetak Halaman Selanjutnya
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        
        pdf.setFillColor("#ffffff");
        pdf.rect(0, 0, pdfWidth, pdfHeight, "F");
        
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      // Bikin Footer Halaman (TANPA KOTAK PUTIH YANG NUTUPIN TEKS)
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150);
        // Hapus pdf.rect(...) yang bikin teks ketutupan
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