"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Loader2 } from "lucide-react";
import { inviteSuperAdmin } from "@/lib/actions";

export function InviteSuperAdminDialog() {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const [inviteLink, setInviteLink] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);
        setInviteLink(null);

        const result = await inviteSuperAdmin(email, fullName);

        if (result.error) {
            setMessage({ type: "error", text: result.error });
        } else {
            setMessage({ type: "success", text: "Invitación procesada correctamente." });
            if (result.inviteLink) {
                setInviteLink(result.inviteLink);
            } else {
                setTimeout(() => {
                    setOpen(false);
                    setEmail("");
                    setFullName("");
                    setMessage(null);
                }, 2000);
            }
        }
        setIsLoading(false);
    };

    const handleCopy = () => {
        if (!inviteLink) return;
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            setOpen(val);
            if (!val) {
                setInviteLink(null);
                setMessage(null);
                setCopied(false);
            }
        }}>
            <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invitar Super Admin
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Invitar Super Administrador</DialogTitle>
                    <DialogDescription>
                        {inviteLink
                            ? "Copia y envía este link manualmente al nuevo administrador."
                            : "Envía una invitación para crear un nuevo super administrador."
                        }
                    </DialogDescription>
                </DialogHeader>

                {!inviteLink ? (
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@ejemplo.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="fullName">Nombre Completo</Label>
                                <Input
                                    id="fullName"
                                    type="text"
                                    placeholder="Juan Pérez"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            {message && (
                                <div
                                    className={`rounded-lg p-3 text-sm ${message.type === "success"
                                        ? "bg-green-500/10 text-green-500 border border-green-500/20"
                                        : "bg-red-500/10 text-red-500 border border-red-500/20"
                                        }`}
                                >
                                    {message.text}
                                </div>
                            )}
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
                            <Button type="submit" disabled={isLoading} className="bg-purple-600 hover:bg-purple-700">
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
                ) : (
                    <div className="py-6 space-y-4">
                        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-2">
                            <p className="text-sm font-medium text-purple-200">¡Admin invitado!</p>
                            <p className="text-xs text-muted-foreground italic">
                                Se ha generado el siguiente link de acceso:
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <Input
                                readOnly
                                value={inviteLink}
                                className="bg-white/5 border-white/10 text-xs"
                            />
                            <Button
                                onClick={handleCopy}
                                className={copied ? "bg-green-600 hover:bg-green-700" : "bg-purple-600 hover:bg-purple-700"}
                            >
                                {copied ? "Copiado" : "Copiar"}
                            </Button>
                        </div>

                        <p className="text-[10px] text-center text-muted-foreground italic">
                            Este link es de un solo uso y expirará pronto.
                        </p>

                        <Button
                            variant="outline"
                            className="w-full border-white/10 hover:bg-white/5"
                            onClick={() => {
                                setOpen(false);
                                setInviteLink(null);
                                setEmail("");
                                setFullName("");
                            }}
                        >
                            Cerrar
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
