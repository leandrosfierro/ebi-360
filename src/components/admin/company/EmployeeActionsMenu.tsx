"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2, Ban, CheckCircle } from "lucide-react";
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
import { useRouter } from "next/navigation";

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
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                <DropdownMenuItem onClick={handleToggleStatus}>
                    {isActive ? (
                        <>
                            <Ban className="mr-2 h-4 w-4" />
                            Desactivar Acceso
                        </>
                    ) : (
                        <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Activar Acceso
                        </>
                    )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar Usuario
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
