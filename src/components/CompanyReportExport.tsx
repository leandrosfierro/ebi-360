"use client";

import { Download, FileSpreadsheet, Loader2, FileText } from "lucide-react";
import { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";

interface CompanyReportExportProps {
    companyName?: string;
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string;
    metrics: {
        participationRate: number;
        avgGlobalScore: string;
        atRiskCount: number;
        completedSurveys: number;
        employeesCount: number;
    };
}

export function CompanyReportExport({
    companyName = "Mi Empresa",
    primaryColor = "#7e22ce",
    secondaryColor = "#3b82f6",
    logoUrl,
    metrics,
}: CompanyReportExportProps) {
    const [isExportingPDF, setIsExportingPDF] = useState(false);

    const exportToPDF = async () => {
        setIsExportingPDF(true);
        try {
            const pdf = new jsPDF("p", "mm", "a4");
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            // Convert hex to RGB
            const hexToRgb = (hex: string): [number, number, number] => {
                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result
                    ? [
                        parseInt(result[1], 16),
                        parseInt(result[2], 16),
                        parseInt(result[3], 16),
                    ]
                    : [126, 34, 206];
            };

            const primaryRgb = hexToRgb(primaryColor);
            const secondaryRgb = hexToRgb(secondaryColor);

            // Page 1: Cover Page
            pdf.setFillColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
            pdf.rect(0, 0, pageWidth, 80, "F");

            // Logo (if available) - Needs to handle CORS
            if (logoUrl) {
                try {
                    // Try to load as image first to check CORS
                    const img = new Image();
                    img.crossOrigin = "anonymous";
                    await new Promise((resolve, reject) => {
                        img.onload = resolve;
                        img.onerror = reject;
                        img.src = logoUrl;
                    });
                    pdf.addImage(img, "PNG", 20, 15, 40, 20);
                } catch (e) {
                    console.error("Error adding logo (possibly CORS):", e);
                }
            }

            // Title
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(28);
            pdf.setFont("helvetica", "bold");
            pdf.text("Reporte de Bienestar", pageWidth / 2, 50, { align: "center" });

            pdf.setFontSize(14);
            pdf.setFont("helvetica", "normal");
            pdf.text(companyName, pageWidth / 2, 60, { align: "center" });

            // Date
            const today = new Date().toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(10);
            pdf.text(today, pageWidth / 2, 70, { align: "center" });

            // Executive Summary Section
            pdf.setTextColor(0, 0, 0);
            pdf.setFontSize(18);
            pdf.setFont("helvetica", "bold");
            pdf.text("Resumen Ejecutivo", 20, 100);

            pdf.setFontSize(11);
            pdf.setFont("helvetica", "normal");
            pdf.setTextColor(60, 60, 60);

            const summaryText = `Este reporte presenta un análisis agregado del bienestar organizacional basado en ${metrics.completedSurveys} encuestas completadas de ${metrics.employeesCount} colaboradores de ${companyName}.`;
            const splitSummary = pdf.splitTextToSize(summaryText, pageWidth - 40);
            pdf.text(splitSummary, 20, 110);

            // Key Metrics
            pdf.setFontSize(14);
            pdf.setFont("helvetica", "bold");
            pdf.setTextColor(0, 0, 0);
            pdf.text("Métricas Clave", 20, 130);

            const metricsY = 145;
            const metricsList = [
                { label: "Tasa de Participación", value: `${metrics.participationRate}%` },
                { label: "Índice de Bienestar", value: metrics.avgGlobalScore },
                { label: "Colaboradores en Riesgo", value: metrics.atRiskCount.toString() },
                { label: "Encuestas Completadas", value: metrics.completedSurveys.toString() },
            ];

            metricsList.forEach((metric, index) => {
                const y = metricsY + index * 15;

                // Metric box
                pdf.setFillColor(245, 245, 245);
                pdf.roundedRect(20, y - 8, pageWidth - 40, 12, 2, 2, "F");

                // Label
                pdf.setFontSize(10);
                pdf.setFont("helvetica", "normal");
                pdf.setTextColor(80, 80, 80);
                pdf.text(metric.label, 25, y);

                // Value
                pdf.setFont("helvetica", "bold");
                pdf.setTextColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
                pdf.text(metric.value, pageWidth - 25, y, { align: "right" });
            });

            // Page 2: Charts (capture from DOM)
            const chartsContainer = document.querySelector('[data-chart-container]');
            if (chartsContainer) {
                pdf.addPage();
                pdf.setFontSize(18);
                pdf.setFont("helvetica", "bold");
                pdf.setTextColor(0, 0, 0);
                pdf.text("Análisis Detallado", 20, 20);

                try {
                    const canvas = await html2canvas(chartsContainer as HTMLElement, {
                        scale: 2,
                        logging: false,
                        useCORS: true,
                    });
                    const imgData = canvas.toDataURL("image/png");
                    const imgWidth = pageWidth - 40;
                    const imgHeight = (canvas.height * imgWidth) / canvas.width;

                    pdf.addImage(imgData, "PNG", 20, 30, imgWidth, Math.min(imgHeight, pageHeight - 60));
                } catch (error) {
                    console.error("Error capturing charts:", error);
                    pdf.setFontSize(10);
                    pdf.setTextColor(150, 150, 150);
                    pdf.text("Error al generar gráficos en el reporte", pageWidth / 2, 100, { align: "center" });
                }
            }

            // Footer on all pages
            const totalPages = pdf.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                pdf.setPage(i);
                pdf.setFontSize(8);
                pdf.setTextColor(150, 150, 150);
                pdf.text(
                    `Página ${i} de ${totalPages} | Generado por Bienestar 360°`,
                    pageWidth / 2,
                    pageHeight - 10,
                    { align: "center" }
                );
            }

            // Save PDF
            pdf.save(`Reporte_Bienestar_${companyName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Hubo un error al generar el PDF. Por favor, intente de nuevo.");
        } finally {
            setIsExportingPDF(false);
        }
    };

    const exportToExcel = () => {
        try {
            const data = [
                ["Bienestar 360° - Reporte de Bienestar Organizacional"],
                ["Empresa", companyName],
                ["Fecha de Emisión", new Date().toLocaleDateString("es-ES")],
                [],
                ["Métricas Clave"],
                ["Categoría", "Valor"],
                ["Tasa de Participación", `${metrics.participationRate}%`],
                ["Índice de Bienestar", metrics.avgGlobalScore],
                ["Colaboradores en Riesgo", metrics.atRiskCount],
                ["Encuestas Completadas", metrics.completedSurveys],
                ["Total Colaboradores", metrics.employeesCount],
                [],
                ["Notas"],
                ["El Índice de Bienestar es un promedio ponderado de todas las encuestas completadas."],
                ["Los colaboradores en riesgo son aquellos con un puntaje global inferior a 5.0."],
            ];

            const worksheet = XLSX.utils.aoa_to_sheet(data);

            // Add some basic styling (column widths)
            worksheet["!cols"] = [
                { wch: 30 },
                { wch: 20 },
            ];

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Resumen");

            XLSX.writeFile(
                workbook,
                `Reporte_Bienestar_${companyName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.xlsx`
            );
        } catch (error) {
            console.error("Error generating Excel:", error);
            alert("Hubo un error al generar el archivo Excel.");
        }
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={exportToExcel}
                className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                title="Exportar a Excel"
            >
                <FileSpreadsheet className="h-4 w-4 text-green-600" />
                Excel
            </button>

            <button
                onClick={exportToPDF}
                disabled={isExportingPDF}
                className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Exportar a PDF"
            >
                {isExportingPDF ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <FileText className="h-4 w-4" />
                )}
                {isExportingPDF ? "Generando..." : "PDF"}
            </button>
        </div>
    );
}
