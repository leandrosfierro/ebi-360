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
            const jsPDF = (await import("jspdf")).default;

            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            });

            const pageWidth = 210;
            const pageHeight = 297;
            const margin = 20;
            const contentWidth = pageWidth - (margin * 2);
            let yPosition = margin;

            // Colors
            const primaryColor: [number, number, number] = [46, 16, 101]; // #2e1065
            const accentColor: [number, number, number] = [59, 130, 246]; // #3b82f6
            const textColor: [number, number, number] = [51, 51, 51];
            const lightGray: [number, number, number] = [240, 240, 240];

            // Helper function to add text with word wrap
            const addWrappedText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
                const lines = pdf.splitTextToSize(text, maxWidth);
                pdf.text(lines, x, y);
                return y + (lines.length * lineHeight);
            };

            // ===== PAGE 1: COVER & INTRODUCTION =====

            // Header with logo (placeholder - would need actual logo)
            pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            pdf.rect(0, 0, pageWidth, 60, 'F');

            // Logo placeholder (you'll need to add actual logo)
            pdf.setFontSize(24);
            pdf.setTextColor(255, 255, 255);
            pdf.setFont("helvetica", "bold");
            pdf.text("BIENESTAR 360°", pageWidth / 2, 25, { align: "center" });

            pdf.setFontSize(12);
            pdf.setFont("helvetica", "normal");
            pdf.text("Informe de Diagnóstico Integral", pageWidth / 2, 35, { align: "center" });

            // Date
            const today = new Date().toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric"
            });
            pdf.setFontSize(10);
            pdf.text(today, pageWidth / 2, 45, { align: "center" });

            yPosition = 75;

            // Global Score - Large Circle
            pdf.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
            pdf.circle(pageWidth / 2, yPosition + 30, 25, 'F');

            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(32);
            pdf.setFont("helvetica", "bold");
            pdf.text(globalScore.toFixed(1), pageWidth / 2, yPosition + 32, { align: "center" });

            pdf.setFontSize(12);
            pdf.setFont("helvetica", "normal");
            pdf.text("/10", pageWidth / 2, yPosition + 42, { align: "center" });

            yPosition += 70;

            pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
            pdf.setFontSize(14);
            pdf.setFont("helvetica", "bold");
            pdf.text("Índice General de Bienestar", pageWidth / 2, yPosition, { align: "center" });

            yPosition += 15;

            // Introduction
            pdf.setFontSize(11);
            pdf.setFont("helvetica", "normal");
            const intro = "Este informe presenta un análisis integral de tu bienestar basado en 6 dimensiones fundamentales: Física, Nutricional, Emocional, Social, Familiar y Económica. Cada dimensión ha sido evaluada utilizando escalas validadas científicamente para brindarte una visión completa y accionable de tu estado actual.";
            yPosition = addWrappedText(intro, margin, yPosition, contentWidth, 5);

            yPosition += 10;

            // Domain Summary Box
            pdf.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
            pdf.roundedRect(margin, yPosition, contentWidth, 50, 3, 3, 'F');

            yPosition += 8;
            pdf.setFontSize(10);
            pdf.setFont("helvetica", "bold");
            pdf.text("Resumen de Dominios", margin + 5, yPosition);

            yPosition += 7;
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(9);

            const domains = Object.keys(scores);
            const col1 = domains.slice(0, 3);
            const col2 = domains.slice(3, 6);

            col1.forEach((domain, idx) => {
                const score = scores[domain];
                const color: [number, number, number] = score >= 8 ? [34, 197, 94] : score >= 5 ? [234, 179, 8] : [239, 68, 68];
                pdf.setTextColor(color[0], color[1], color[2]);
                pdf.text(`● ${domain}: ${score.toFixed(1)}/10`, margin + 5, yPosition + (idx * 5));
            });

            col2.forEach((domain, idx) => {
                const score = scores[domain];
                const color: [number, number, number] = score >= 8 ? [34, 197, 94] : score >= 5 ? [234, 179, 8] : [239, 68, 68];
                pdf.setTextColor(color[0], color[1], color[2]);
                pdf.text(`● ${domain}: ${score.toFixed(1)}/10`, pageWidth / 2 + 5, yPosition + (idx * 5));
            });

            // ===== PAGE 2: DETAILED BREAKDOWN =====
            pdf.addPage();
            yPosition = margin;

            // Header
            pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            pdf.rect(0, 0, pageWidth, 20, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(14);
            pdf.setFont("helvetica", "bold");
            pdf.text("Desglose Detallado por Dominio", pageWidth / 2, 13, { align: "center" });

            yPosition = 35;

            // Domain Details
            pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
            domains.forEach((domain) => {
                const score = scores[domain];
                const percentage = (score / 10) * 100;

                // Domain name
                pdf.setFontSize(12);
                pdf.setFont("helvetica", "bold");
                pdf.text(domain, margin, yPosition);

                // Score badge
                const badgeColor: [number, number, number] = score >= 8 ? [34, 197, 94] : score >= 5 ? [234, 179, 8] : [239, 68, 68];
                pdf.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
                pdf.roundedRect(pageWidth - margin - 25, yPosition - 5, 25, 8, 2, 2, 'F');
                pdf.setTextColor(255, 255, 255);
                pdf.setFontSize(10);
                pdf.text(`${score.toFixed(1)}`, pageWidth - margin - 12.5, yPosition, { align: "center" });

                yPosition += 8;

                // Progress bar
                pdf.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
                pdf.roundedRect(margin, yPosition, contentWidth, 6, 2, 2, 'F');
                pdf.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
                pdf.roundedRect(margin, yPosition, (contentWidth * percentage) / 100, 6, 2, 2, 'F');

                yPosition += 12;

                // Status text
                pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
                pdf.setFontSize(9);
                pdf.setFont("helvetica", "italic");
                const status = score >= 8 ? "Excelente - Mantén tus buenos hábitos" :
                    score >= 5 ? "En desarrollo - Oportunidades de mejora" :
                        "Necesita atención - Prioriza este dominio";
                pdf.text(status, margin, yPosition);

                yPosition += 10;

                // Separator line
                if (yPosition < pageHeight - 40) {
                    pdf.setDrawColor(200, 200, 200);
                    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
                    yPosition += 10;
                }
            });

            // ===== PAGE 3: FOOTER & PROMOTION =====
            pdf.addPage();
            yPosition = margin;

            // Header
            pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            pdf.rect(0, 0, pageWidth, 20, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(14);
            pdf.setFont("helvetica", "bold");
            pdf.text("Acerca de Bienestar 360°", pageWidth / 2, 13, { align: "center" });

            yPosition = 40;

            // About section
            pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
            pdf.setFontSize(11);
            pdf.setFont("helvetica", "normal");
            const about = "Bienestar 360° es la primera plataforma de diagnóstico integral diseñada específicamente para la realidad de LATAM. Combinamos rigor científico con tecnología accesible para medir, analizar y mejorar el bienestar de personas y equipos.";
            yPosition = addWrappedText(about, margin, yPosition, contentWidth, 5);

            yPosition += 10;

            // Features
            pdf.setFontSize(12);
            pdf.setFont("helvetica", "bold");
            pdf.text("¿Por qué Bienestar 360°?", margin, yPosition);
            yPosition += 8;

            const features = [
                "✓ 6 Dimensiones de Bienestar evaluadas científicamente",
                "✓ Escalas validadas internacionalmente (PERMA, JD-R)",
                "✓ Cumplimiento normativo (NOM-035, ISO 45001)",
                "✓ Resultados inmediatos y accionables",
                "✓ Diseñado para la realidad latinoamericana"
            ];

            pdf.setFontSize(10);
            pdf.setFont("helvetica", "normal");
            features.forEach(feature => {
                pdf.text(feature, margin + 5, yPosition);
                yPosition += 6;
            });

            yPosition += 10;

            // CTA Box
            pdf.setFillColor(59, 130, 246);
            pdf.roundedRect(margin, yPosition, contentWidth, 35, 3, 3, 'F');

            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(12);
            pdf.setFont("helvetica", "bold");
            pdf.text("Descubre más sobre Bienestar 360°", pageWidth / 2, yPosition + 12, { align: "center" });

            pdf.setFontSize(10);
            pdf.setFont("helvetica", "normal");
            pdf.text("Visita: bienestar360.abacusai.app", pageWidth / 2, yPosition + 22, { align: "center" });
            pdf.text("Email: contacto@bs360.com", pageWidth / 2, yPosition + 28, { align: "center" });

            // Footer
            yPosition = pageHeight - 20;
            pdf.setTextColor(150, 150, 150);
            pdf.setFontSize(8);
            pdf.text("© 2025 BS360 - EBI. Todos los derechos reservados.", pageWidth / 2, yPosition, { align: "center" });
            pdf.text("Córdoba, Argentina", pageWidth / 2, yPosition + 5, { align: "center" });

            // Save PDF
            console.log("Saving professional PDF...");
            pdf.save(`Bienestar-360-Informe-${new Date().toISOString().split("T")[0]}.pdf`);
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
            {exporting ? "Generando PDF..." : "Exportar Informe (PDF)"}
        </button>
    );
}
