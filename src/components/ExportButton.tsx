"use client";

import { Download } from "lucide-react";
import { useState } from "react";

interface ExportButtonProps {
    globalScore: number;
    scores: Record<string, number>;
}

export function ExportButton({ globalScore, scores }: ExportButtonProps) {
    const [exporting, setExporting] = useState(false);

    const handleExport = async () => {
        setExporting(true);
        try {
            const { toPng } = await import("html-to-image");
            const jsPDF = (await import("jspdf")).default;

            // Capture the entire results page
            const element = document.getElementById("results-container");
            if (!element) {
                console.error("Element #results-container not found");
                alert("Error: No se encontró el contenido para exportar.");
                return;
            }

            console.log("Starting capture with html-to-image...");

            // html-to-image handles modern CSS better than html2canvas
            const imgData = await toPng(element, {
                quality: 0.95,
                backgroundColor: "#7e22ce", // Force purple background
                pixelRatio: 2, // High resolution
            });

            console.log("Image created, generating PDF...");
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            });

            const imgWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm

            // Calculate image dimensions
            const imgProps = pdf.getImageProperties(imgData);
            const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            // Handle multi-page if content is long
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            console.log("Saving PDF...");
            pdf.save(`bienestar-360-resultados-${new Date().toISOString().split("T")[0]}.pdf`);
        } catch (error) {
            console.error("Error exporting PDF:", error);
            alert(`Error al exportar: ${(error as Error).message}`);
        } finally {
            setExporting(false);
        }
    };

    return (
        <button
            onClick={handleExport}
            disabled={exporting}
            className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 p-4 font-semibold text-white shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
        >
            <Download className="mr-2 h-5 w-5" />
            {exporting ? "Exportando..." : "Exportar Resultados (PDF)"}
        </button>
    );
}
