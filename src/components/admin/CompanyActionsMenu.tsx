"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2, Mail, Ban, CheckCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditCompanyDialog } from "./EditCompanyDialog";
import { DeleteCompanyAlert } from "./DeleteCompanyAlert";
import { updateAdminStatus, resendAdminInvitation } from "@/lib/actions";
import { useRouter } from "next/navigation";

interface CompanyActionsMenuProps {
    company: {
        id: string;
        name: string;
        subscription_plan: "basic" | "pro" | "enterprise";
        active: boolean;
    };
    admin?: {
        id: string;
        email: string;
        full_name: string;
        admin_status: string;
    } | null;
}

export function CompanyActionsMenu({ company, admin }: CompanyActionsMenuProps) {
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleResendInvitation = async () => {
        if (!admin) return;
        setIsLoading(true);
        const result = await resendAdminInvitation(admin.id);
        if (result.error) {
            alert(`Error: ${result.error}`);
        } else {
            alert("Invitación reenviada correctamente");
        }
        setIsLoading(false);
        router.refresh();
    };

    const handleUpdateStatus = async (newStatus: 'active' | 'inactive' | 'suspended') => {
        if (!admin) return;
        setIsLoading(true);
        const result = await updateAdminStatus(admin.id, newStatus);
        if (result.error) {
            alert(`Error: ${result.error}`);
        } else {
            alert("Estado actualizado correctamente");
        }
        setIsLoading(false);
        router.refresh();
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0" disabled={isLoading}>
                        <span className="sr-only">Abrir menú</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Acciones de Empresa</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar Empresa
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-red-600 focus:text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar Empresa
                    </DropdownMenuItem>

                    {admin && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Acciones de Admin</DropdownMenuLabel>

                            {admin.admin_status === 'invited' && (
                                <DropdownMenuItem onClick={handleResendInvitation}>
                                    <Mail className="mr-2 h-4 w-4" />
                                    Reenviar Invitación
                                </DropdownMenuItem>
                            )}

                            {admin.admin_status !== 'suspended' && (
                                <DropdownMenuItem onClick={() => handleUpdateStatus('suspended')} className="text-red-600 focus:text-red-600">
                                    <Ban className="mr-2 h-4 w-4" />
                                    Suspender Admin
                                </DropdownMenuItem>
                            )}

                            {admin.admin_status === 'suspended' && (
                                <DropdownMenuItem onClick={() => handleUpdateStatus('active')} className="text-green-600 focus:text-green-600">
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Reactivar Admin
                                </DropdownMenuItem>
                            )}

                            {admin.admin_status === 'inactive' && (
                                <DropdownMenuItem onClick={() => handleUpdateStatus('active')} className="text-green-600 focus:text-green-600">
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Marcar como Activo
                                </DropdownMenuItem>
                            )}
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <EditCompanyDialog
                company={company}
                open={showEditDialog}
                onOpenChange={setShowEditDialog}
            />

            <DeleteCompanyAlert
                companyId={company.id}
                companyName={company.name}
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
            />
        </>
    );
}
