"use client";

import { MoreHorizontal, Pencil, Trash2, Ban, CheckCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toggleEmployeeStatus, deleteEmployee } from "@/lib/actions";
import { sendManualInvitations } from "@/lib/invitation-actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface EmployeeActionsMenuProps {
    employee: {
        id: string;
        email: string;
        full_name: string;
        admin_status?: string;
    };
}

export function EmployeeActionsMenu({ employee }: EmployeeActionsMenuProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleToggleStatus = async () => {
        const isActive = employee.admin_status === 'active';
        const confirmMessage = isActive
            ? `¿Desactivar acceso de ${employee.full_name}?`
            : `¿Reactivar acceso de ${employee.full_name}?`;

        if (!confirm(confirmMessage)) return;

        setIsLoading(true);
        const result = await toggleEmployeeStatus(employee.id, !isActive);

        if (result.error) {
            alert(`Error: ${result.error}`);
        }
        setIsLoading(false);
        router.refresh();
    };

    const handleSendInvitation = async () => {
        setIsLoading(true);
        const result = await sendManualInvitations([employee.id]);

        if ('success' in result && result.success) {
            alert("✓ Invitación enviada correctamente");
        } else {
            const errorMsg = 'error' in result ? result.error :
                ('errors' in result && Array.isArray(result.errors) ? (result.errors as string[])[0] : 'No se pudo enviar la invitación');
            alert(`Error: ${errorMsg}`);
        }
        setIsLoading(false);
        router.refresh();
    };

    const handleDelete = async () => {
        if (!confirm(`¿Eliminar a ${employee.full_name}? Esta acción no se puede deshacer.`)) return;

        setIsLoading(true);
        const result = await deleteEmployee(employee.id);

        if (result.error) {
            alert(`Error: ${result.error}`);
        }
        setIsLoading(false);
        router.refresh();
    };

    const isActive = employee.admin_status === 'active';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0" disabled={isLoading}>
                    <span className="sr-only">Abrir menú</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 glass-card border border-white/10 rounded-2xl shadow-xl">
                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-4 py-3">Acciones Usuario</DropdownMenuLabel>

                <DropdownMenuItem onClick={handleSendInvitation} className="px-4 py-3 cursor-pointer hover:bg-primary/5 focus:bg-primary/5 transition-colors">
                    <Mail className="mr-2 h-4 w-4 text-primary" />
                    <span className="font-bold text-sm">Enviar Invitación</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={handleToggleStatus} className="px-4 py-3 cursor-pointer hover:bg-primary/5 focus:bg-primary/5 transition-colors">
                    {isActive ? (
                        <>
                            <Ban className="mr-2 h-4 w-4 text-rose-500" />
                            <span className="font-bold text-sm">Desactivar Acceso</span>
                        </>
                    ) : (
                        <>
                            <CheckCircle className="mr-2 h-4 w-4 text-emerald-500" />
                            <span className="font-bold text-sm">Activar Acceso</span>
                        </>
                    )}
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-white/5" />

                <DropdownMenuItem onClick={handleDelete} className="px-4 py-3 cursor-pointer text-rose-500 focus:text-rose-500 hover:bg-rose-500/5 focus:bg-rose-500/5 transition-colors">
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span className="font-bold text-sm">Eliminar Usuario</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
