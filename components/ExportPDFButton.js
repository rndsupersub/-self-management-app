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
      // 1. KLOning ELEMEN (Trik biar nggak kepotong scroll)
      const clone = element.cloneNode(true);
      
      // Set style kloningan biar posisinya di luar layar dan tinggi ngikutin konten
      clone.style.position = "absolute";
      clone.style.top = "0";
      clone.style.left = "-9999px";
      clone.style.width = `${element.scrollWidth}px`;
      clone.style.height = "auto";
      clone.style.maxHeight = "none";
      clone.style.overflow = "visible";
      clone.style.backgroundColor = "#ffffff";
      clone.id = "export-area-clone"; // Ganti ID biar nggak bentrok

      document.body.appendChild(clone);

      // 2. Render kloningan ke canvas
      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        windowWidth: clone.scrollWidth,
        windowHeight: clone.scrollHeight,
        ignoreElements: (el) => el.hasAttribute("data-html2canvas-ignore"),
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);

      // 3. Setup PDF A4
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // 4. Halaman pertama
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // 5. Halaman berikutnya (toleransi 1mm biar nggak bikin halaman kosong)
      while (heightLeft > 1) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // 6. Footer
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150);
        pdf.text(`${title} — Halaman ${i} dari ${totalPages}`, 10, pageHeight - 5);
      }

      pdf.save(fileName);

      // 7. Hapus kloningan
      document.body.removeChild(clone);
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