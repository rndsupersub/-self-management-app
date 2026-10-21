// components/ExportPDFButton.js
"use client";

import { useState } from "react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

export default function ExportPDFButton({ targetId = "export-area", fileName = "laporan.pdf", title = "Laporan" }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    const element = document.getElementById(targetId);
    if (!element) {
      alert(`Area dengan ID "${targetId}" tidak ditemukan.`);
      return;
    }

    setIsExporting(true);

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        ignoreElements: (el) => el.hasAttribute("data-html2canvas-ignore"),
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById(targetId);
          if (clonedElement) {
            // 1. Lepas semua batasan tinggi/scroll
            clonedElement.style.height = "auto";
            clonedElement.style.maxHeight = "none";
            clonedElement.style.minHeight = "auto";
            clonedElement.style.overflow = "visible";
            
            // 2. Kasih padding bawah biar footer nggak nabrak konten
            clonedElement.style.paddingBottom = "20mm";
            
            // 3. Lepas batasan dari parent container (flex-1) biar nggak nyisa space kosong
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
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Halaman pertama
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Halaman berikutnya
      while (heightLeft > 1) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Footer & Penutup Bawah
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        
        // Gambar kotak putih di area paling bawah (setinggi 10mm)
        // Biar tulisan footer nggak nabrak gambar konten
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, pageHeight - 10, pdfWidth, 10, 'F');
        
        // Tulis teks footer
        pdf.setFontSize(8);
        pdf.setTextColor(150);
        pdf.text(`${title} — Halaman ${i} dari ${totalPages}`, 10, pageHeight - 3);
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
      className="btn btn-ghost btn-sm gap-1"
      title="Export halaman ini ke PDF"
      data-html2canvas-ignore="true"
    >
      {isExporting ? (
        <span className="loading loading-spinner loading-xs" />
      ) : (
        "📄"
      )}
      {isExporting ? "Exporting..." : "Export PDF"}
    </button>
  );
}