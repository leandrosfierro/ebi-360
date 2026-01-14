"use client";

import { useState } from "react";
import { Plus, Loader2, Building2, AlignLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createArea } from "@/lib/areas-actions";
import { useRouter } from "next/navigation";

interface CreateAreaDialogProps {
    companyId: string;
}

export function CreateAreaDialog({ companyId }: CreateAreaDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            await createArea(companyId, name, description);
            setOpen(false);
            setName("");
            setDescription("");
            router.refresh();
        } catch (err: any) {
            setError(err.message || "Ocurrió un error inesperado");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95">
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Área
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] glass-card border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-foreground">Crear Nueva Área</DialogTitle>
                    <DialogDescription className="text-muted-foreground italic">
                        Define un nuevo departamento o sector para segmentar los resultados.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    {error && (
                        <div className="rounded-xl bg-rose-500/10 p-3 text-sm text-rose-500 border border-rose-500/20">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nombre del Área</Label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-3 h-4 w-4 text-primary/60" />
                            <Input
                                id="name"
                                placeholder="Ej: Recursos Humanos, IT, Ventas..."
                                className="pl-9 bg-white/5 border-white/10 focus:border-primary transition-all rounded-xl"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Descripción (Opcional)</Label>
                        <div className="relative">
                            <AlignLeft className="absolute left-3 top-3 h-4 w-4 text-primary/60" />
                            <Textarea
                                id="description"
                                placeholder="Breve descripción del área..."
                                className="pl-9 bg-white/5 border-white/10 focus:border-primary transition-all rounded-xl min-h-[100px]"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setOpen(false)}
                            disabled={isLoading}
                            className="hover:bg-white/5 rounded-xl text-muted-foreground"
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl px-8 shadow-lg shadow-primary/20">
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creando...
                                </>
                            ) : (
                                "Crear Área"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
