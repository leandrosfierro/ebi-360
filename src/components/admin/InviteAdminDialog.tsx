"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Loader2 } from "lucide-react";
import { inviteCompanyAdmin } from "@/lib/actions";

interface InviteAdminDialogProps {
    companyId: string;
    companyName: string;
    triggerText?: string;
}

export function InviteAdminDialog({ companyId, companyName, triggerText }: InviteAdminDialogProps) {
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

        const result = await inviteCompanyAdmin(email, fullName, companyId);

        if (result.error) {
            setMessage({ type: "error", text: result.error });
        } else {
            setMessage({ type: "success", text: "Invitación procesada correctamente." });
            if (result.inviteLink) {
                setInviteLink(result.inviteLink);
            } else {
                // If no link (maybe user existed), we can close soon
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
                {triggerText ? (
                    <Button variant="link" size="sm" className="h-auto p-0 text-purple-600 font-bold uppercase tracking-widest text-[10px] hover:text-purple-700">
                        {triggerText}
                    </Button>
                ) : (
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <UserPlus className="h-4 w-4 text-purple-600" />
                        <span className="sr-only">Invitar Admin</span>
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Asignar Administrador</DialogTitle>
                    <DialogDescription>
                        Invita a un usuario para que administre <strong>{companyName}</strong>.
                        Se le asignará el rol de Company Admin.
                    </DialogDescription>
                </DialogHeader>

                {!inviteLink ? (
                    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email del Administrador</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@empresa.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nombre Completo</Label>
                            <Input
                                id="name"
                                placeholder="Juan Pérez"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                        </div>

                        {message && (
                            <div className={`p-3 rounded-md text-sm ${message.type === "success" ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"}`}>
                                {message.text}
                            </div>
                        )}

                        <DialogFooter>
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
                            <p className="text-sm font-medium text-purple-200">¡Usuario invitado!</p>
                            <p className="text-xs text-muted-foreground">
                                Se ha generado el siguiente link de acceso para <strong>{fullName}</strong>. Puedes enviárselo manualmente:
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
