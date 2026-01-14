"use client";

import { Area } from "@/lib/surveys/types";
import { Building2, Trash2, Edit2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteArea } from "@/lib/areas-actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface AreaListProps {
    areas: Area[];
}

export function AreaList({ areas }: AreaListProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`¿Estás seguro de eliminar el área "${name}"? Los usuarios quedarán sin área asignada.`)) return;

        setIsDeleting(id);
        try {
            await deleteArea(id);
            router.refresh();
        } catch (error) {
            alert("Error al eliminar el área");
        } finally {
            setIsDeleting(null);
        }
    };

    if (areas.length === 0) {
        return (
            <div className="text-center py-20 glass-card rounded-[32px] border-none shadow-xl">
                <Building2 className="mx-auto h-12 w-12 text-primary/30 mb-4" />
                <h3 className="text-lg font-bold text-foreground">No hay áreas definidas</h3>
                <p className="text-sm text-muted-foreground italic">Crea tu primera área para segmentar los informes.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {areas.map((area) => (
                <div key={area.id} className="glass-card p-6 rounded-[24px] border border-white/10 hover:border-primary/30 transition-all group flex flex-col justify-between">
                    <div>
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                <Building2 className="h-6 w-6" />
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground transition-all">
                                    <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(area.id, area.name)}
                                    disabled={isDeleting === area.id}
                                    className="p-2 rounded-lg hover:bg-rose-500/10 text-rose-500 transition-all disabled:opacity-50"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                        <h4 className="font-bold text-lg text-foreground mb-1">{area.name}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2 italic mb-4">
                            {area.description || "Sin descripción"}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                        <Users className="h-4 w-4 text-primary/60" />
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            {area.estimated_employees || 0} Colaboradores Est.
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}
