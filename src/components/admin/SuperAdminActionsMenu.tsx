"use client";

import { useState } from "react";
import { MoreHorizontal, Trash2, RefreshCw, Shield, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

interface SuperAdminActionsMenuProps {
    admin: {
        id: string;
        email: string;
        full_name: string;
        admin_status?: string;
        invitation_link?: string | null;
    };
}

export function SuperAdminActionsMenu({ admin }: SuperAdminActionsMenuProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const router = useRouter();

    const handleCopyLink = () => {
        if (!admin.invitation_link) return;
        navigator.clipboard.writeText(admin.invitation_link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDelete = async () => {
        // This is a placeholder for now as we don't have a deleteSuperAdmin action yet
        // but we can add the UI for it
        if (!confirm(`¿Eliminar a ${admin.full_name || admin.email} como Super Admin?`)) return;

        alert("Acción no implementada todavía: eliminar Super Admin");
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0" disabled={isLoading}>
                    <span className="sr-only">Abrir menú</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 glass-card border border-white/10 rounded-2xl shadow-xl">
                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-4 py-3">
                    Acciones Super Admin
                </DropdownMenuLabel>

                {admin.admin_status === 'invited' && admin.invitation_link && (
                    <DropdownMenuItem
                        onClick={handleCopyLink}
                        className="px-4 py-3 cursor-pointer hover:bg-primary/5 focus:bg-primary/5 transition-colors text-purple-600"
                    >
                        <RefreshCw className={`mr-2 h-4 w-4 ${copied ? 'animate-bounce' : ''}`} />
                        <span className="font-bold text-sm">{copied ? '¡Link Copiado!' : 'Copiar Link Invitación'}</span>
                    </DropdownMenuItem>
                )}

                <DropdownMenuSeparator className="bg-white/5" />

                <DropdownMenuItem
                    onClick={handleDelete}
                    className="px-4 py-3 cursor-pointer text-rose-500 focus:text-rose-500 hover:bg-rose-500/5 focus:bg-rose-500/5 transition-colors"
                >
                    <UserX className="mr-2 h-4 w-4" />
                    <span className="font-bold text-sm">Eliminar Permisos</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
