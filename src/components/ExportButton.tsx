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
            if (!element) {
                console.error("Element #results-container not found");
                alert("Error: No se encontró el contenido para exportar.");
                return;
            }

            // Add a temporary class to ensure visibility during capture if needed
            // or just rely on html2canvas background option

            console.log("Starting capture...");
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true, // Enable CORS just in case
                backgroundColor: "#7e22ce", // Force a purple background (purple-700) so white text is visible
                logging: true,
                onclone: (clonedDoc) => {
                    // Optional: You can modify the cloned document here if needed
                    // For example, removing shadows that might look bad in PDF
                    const clonedElement = clonedDoc.getElementById("results-container");
                    if (clonedElement) {
                        clonedElement.style.padding = "20px"; // Add some padding
                    }
                }
            });

            console.log("Canvas created, generating PDF...");
            const imgData = canvas.toDataURL("image/jpeg", 0.95); // Use JPEG for better compatibility/size
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            });

            const imgWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            // Handle multi-page if content is long
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
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
