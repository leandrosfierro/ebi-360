"use client";

import { useState } from "react";
import { Loader2, Building2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { assignAreaToUser } from "@/lib/areas-actions";
import { useRouter } from "next/navigation";

interface AssignAreaDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    employee: {
        id: string;
        full_name: string;
        area_id?: string;
    };
    areas: any[];
}

export function AssignAreaDialog({ open, onOpenChange, employee, areas }: AssignAreaDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedAreaId, setSelectedAreaId] = useState<string | null>(employee.area_id || null);
    const router = useRouter();

    const handleAssign = async () => {
        setIsLoading(true);
        try {
            await assignAreaToUser(employee.id, selectedAreaId);
            onOpenChange(false);
            router.refresh();
        } catch (error: any) {
            alert("Error al asignar área: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] glass-card border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-foreground">Asignar Área</DialogTitle>
                    <DialogDescription className="text-muted-foreground italic">
                        Selecciona el área correspondiente para <strong>{employee.full_name}</strong>.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-2 max-h-[300px] overflow-y-auto no-scrollbar">
                    <button
                        onClick={() => setSelectedAreaId(null)}
                        className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border ${selectedAreaId === null
                                ? "bg-primary/10 border-primary text-primary shadow-inner"
                                : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10 hover:border-white/10"
                            }`}
                    >
                        <span className="font-bold text-sm">Sin Área</span>
                        {selectedAreaId === null && <Check className="h-4 w-4" />}
                    </button>

                    {areas.map((area) => (
                        <button
                            key={area.id}
                            onClick={() => setSelectedAreaId(area.id)}
                            className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border ${selectedAreaId === area.id
                                    ? "bg-primary/10 border-primary text-primary shadow-inner"
                                    : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10 hover:border-white/10"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <Building2 className="h-4 w-4 opacity-60" />
                                <span className="font-bold text-sm">{area.name}</span>
                            </div>
                            {selectedAreaId === area.id && <Check className="h-4 w-4" />}
                        </button>
                    ))}
                </div>

                <DialogFooter className="pt-4">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="hover:bg-white/5 rounded-xl text-muted-foreground"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleAssign}
                        disabled={isLoading}
                        className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl px-8 shadow-lg shadow-primary/20"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            "Guardar Cambios"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
