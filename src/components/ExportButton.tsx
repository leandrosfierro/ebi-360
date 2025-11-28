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
            const html2canvas = (await import("html2canvas")).default;
            const jsPDF = (await import("jspdf")).default;

            // Capture the entire results page
            const element = document.getElementById("results-container");
            if (!element) return;

            const canvas = await html2canvas(element, {
                scale: 2,
                backgroundColor: null,
                logging: false,
            });

            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            });

            const imgWidth = 210; // A4 width in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
            pdf.save(`bienestar-360-resultados-${new Date().toISOString().split("T")[0]}.pdf`);
        } catch (error) {
            console.error("Error exporting PDF:", error);
            alert("Error al exportar. Por favor intenta de nuevo.");
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
