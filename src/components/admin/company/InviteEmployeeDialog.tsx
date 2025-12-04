"use client";

import { useState } from "react";
import { Plus, Loader2, Mail, User } from "lucide-react";
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
import { inviteEmployee } from "@/lib/actions";
import { useRouter } from "next/navigation";

export function InviteEmployeeDialog() {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [error, setError] = useState("");
    const [successData, setSuccessData] = useState<{ warning?: string; tempPassword?: string } | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setSuccessData(null);

        try {
            const result = await inviteEmployee(email, fullName);

            if (result.error) {
                setError(result.error);
            } else if (result.tempPassword) {
                // Manual creation fallback
                setSuccessData({
                    warning: result.warning,
                    tempPassword: result.tempPassword
                });
                router.refresh();
            } else {
                // Normal success
                setOpen(false);
                setEmail("");
                setFullName("");
                router.refresh();
            }
        } catch (err) {
            setError("Ocurrió un error inesperado");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setOpen(false);
        setSuccessData(null);
        setEmail("");
        setFullName("");
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    Invitar Colaborador
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {successData ? "Usuario Creado Manualmente" : "Invitar Colaborador"}
                    </DialogTitle>
                    <DialogDescription>
                        {successData
                            ? "El usuario fue creado pero no se pudo enviar el email. Comparte estas credenciales:"
                            : "Envía una invitación por email para que un colaborador se una a tu empresa."
                        }
                    </DialogDescription>
                </DialogHeader>

                {successData ? (
                    <div className="space-y-4 py-4">
                        <div className="rounded-md bg-yellow-50 p-4 border border-yellow-200">
                            <p className="text-sm text-yellow-800 mb-2 font-medium">
                                {successData.warning}
                            </p>
                            <div className="mt-3 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Email:</span>
                                    <span className="font-mono font-medium">{email}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Contraseña Temporal:</span>
                                    <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border">
                                        {successData.tempPassword}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 text-center">
                            Por favor copia esta contraseña y envíala al usuario por otro medio seguro.
                        </p>
                        <DialogFooter>
                            <Button onClick={handleClose} className="w-full">
                                Entendido, cerrar
                            </Button>
                        </DialogFooter>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        {error && (
                            <div className="rounded-md bg-red-50 p-3 text-sm text-red-500">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Nombre Completo</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="fullName"
                                    placeholder="Juan Pérez"
                                    className="pl-9"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Corporativo</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="juan@empresa.com"
                                    className="pl-9"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                disabled={isLoading}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Enviando...
                                    </>
                                ) : (
                                    "Enviar Invitación"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
