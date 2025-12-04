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
    const [successMessage, setSuccessMessage] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setSuccessMessage("");

        try {
            const result = await inviteEmployee(email, fullName);

            if (result.error) {
                setError(result.error);
            } else {
                setSuccessMessage(result.message || "Usuario registrado correctamente");
                setEmail("");
                setFullName("");
                router.refresh();

                // Close dialog after 2 seconds
                setTimeout(() => {
                    setOpen(false);
                    setSuccessMessage("");
                }, 2000);
            }
        } catch (err) {
            setError("Ocurrió un error inesperado");
        } finally {
            setIsLoading(false);
        }
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
                    <DialogTitle>Invitar Colaborador</DialogTitle>
                    <DialogDescription>
                        El usuario podrá ingresar con Google usando este email.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    {error && (
                        <div className="rounded-md bg-red-50 p-3 text-sm text-red-500">
                            {error}
                        </div>
                    )}
                    {successMessage && (
                        <div className="rounded-md bg-green-50 p-3 text-sm text-green-700 border border-green-200">
                            ✓ {successMessage}
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
                                disabled={isLoading}
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
                                disabled={isLoading}
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
                                    Registrando...
                                </>
                            ) : (
                                "Registrar Usuario"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
