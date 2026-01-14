"use client";

import { FileText, Download, Trash2, Calendar, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteReport } from "@/lib/reports-db-actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface HistoricReportsListProps {
    reports: any[];
}

export function HistoricReportsList({ reports }: HistoricReportsListProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        if (!confirm("¿Estás seguro de eliminar este registro de reporte?")) return;
        setIsDeleting(id);
        try {
            await deleteReport(id);
            router.refresh();
        } catch (error) {
            alert("Error al eliminar el reporte");
        } finally {
            setIsDeleting(null);
        }
    };

    if (reports.length === 0) {
        return (
            <div className="text-center py-10 glass-card rounded-[24px] border-dashed border-white/10">
                <FileText className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground italic">No hay reportes históricos generados para esta evaluación.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reports.map((report) => (
                <div key={report.id} className="glass-card p-5 rounded-[24px] border border-white/10 hover:border-primary/30 transition-all group">
                    <div className="flex items-start justify-between mb-3">
                        <div className="p-3 rounded-xl bg-primary/10 text-primary">
                            <FileText className="h-5 w-5" />
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => handleDelete(report.id)}
                                disabled={isDeleting === report.id}
                                className="p-2 rounded-lg hover:bg-rose-500/10 text-rose-500 transition-all"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <h4 className="font-bold text-sm text-foreground mb-1 line-clamp-1">{report.title}</h4>

                    <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            <Calendar className="h-3 w-3" />
                            {new Date(report.created_at).toLocaleDateString()}
                        </div>
                        {report.area?.name && (
                            <div className="flex items-center gap-2 text-[10px] font-bold text-primary/80 uppercase tracking-wider">
                                <Building2 className="h-3 w-3" />
                                {report.area.name}
                            </div>
                        )}
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full rounded-xl border-white/10 bg-white/5 hover:bg-primary hover:text-white transition-all text-[11px] font-bold"
                        asChild
                    >
                        <a href={report.file_url} target="_blank" rel="noopener noreferrer">
                            <Download className="mr-2 h-3.5 w-3.5" />
                            Descargar PDF
                        </a>
                    </Button>
                </div>
            ))}
        </div>
    );
}
