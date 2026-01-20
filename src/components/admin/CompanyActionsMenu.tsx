"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2, Mail, Ban, CheckCircle, RefreshCw, ClipboardCheck } from "lucide-react";
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
import { ManageSurveysDialog } from "./surveys/ManageSurveysDialog";
import { updateAdminStatus, resendAdminInvitation, removeCompanyAdmin } from "@/lib/actions";
import { useRouter } from "next/navigation";

interface CompanyActionsMenuProps {
    company: {
        id: string;
        name: string;
        subscription_plan: "basic" | "pro" | "enterprise";
        active: boolean;
    };
    admins?: {
        id: string;
        email: string;
        full_name: string;
        admin_status: string;
    }[] | null;
}

export function CompanyActionsMenu({ company, admins }: CompanyActionsMenuProps) {
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showSurveysDialog, setShowSurveysDialog] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleResendInvitation = async (adminId: string) => {
        setIsLoading(true);
        const result = await resendAdminInvitation(adminId);
        if (result.error) {
            alert(`Error: ${result.error}`);
        } else {
            alert("Invitación reenviada correctamente");
        }
        setIsLoading(false);
        router.refresh();
    };

    const handleUpdateStatus = async (adminId: string, newStatus: 'active' | 'inactive' | 'suspended') => {
        setIsLoading(true);
        const result = await updateAdminStatus(adminId, newStatus);
        if (result.error) {
            alert(`Error: ${result.error}`);
        } else {
            alert("Estado actualizado correctamente");
        }
        setIsLoading(false);
        router.refresh();
    };

    const handleRemoveAdmin = async (adminId: string, adminName: string) => {
        if (!confirm(`¿Estás seguro de que deseas desvincular a ${adminName} de esta empresa? Dejará de ser administrador.`)) return;

        setIsLoading(true);
        const result = await removeCompanyAdmin(adminId);
        if (result.error) {
            alert(`Error: ${result.error}`);
        } else {
            alert("Administrador desvinculado correctamente");
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
                    <DropdownMenuItem onClick={() => setShowSurveysDialog(true)}>
                        <ClipboardCheck className="mr-2 h-4 w-4" />
                        Gestionar Encuestas
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-red-600 focus:text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar Empresa
                    </DropdownMenuItem>

                    {admins && admins.length > 0 && admins.map((admin, index) => (
                        <div key={admin.id}>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel className="flex flex-col">
                                <span className="text-[10px] text-muted-foreground uppercase">Admin {index + 1}</span>
                                <span className="truncate max-w-[150px]">{admin.full_name || admin.email}</span>
                            </DropdownMenuLabel>

                            {admin.admin_status === 'invited' && (
                                <DropdownMenuItem onClick={() => handleResendInvitation(admin.id)}>
                                    <Mail className="mr-2 h-4 w-4" />
                                    Reenviar Invitación
                                </DropdownMenuItem>
                            )}

                            {admin.admin_status !== 'suspended' && (
                                <DropdownMenuItem onClick={() => handleUpdateStatus(admin.id, 'suspended')} className="text-red-500/70 focus:text-red-500">
                                    <Ban className="mr-2 h-4 w-4" />
                                    Suspender
                                </DropdownMenuItem>
                            )}

                            {admin.admin_status === 'suspended' && (
                                <DropdownMenuItem onClick={() => handleUpdateStatus(admin.id, 'active')} className="text-emerald-500/70 focus:text-emerald-500 font-bold">
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Reactivar
                                </DropdownMenuItem>
                            )}

                            {admin.admin_status === 'inactive' && (
                                <DropdownMenuItem onClick={() => handleUpdateStatus(admin.id, 'active')} className="text-emerald-500/70 focus:text-emerald-500">
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Marcar Activo
                                </DropdownMenuItem>
                            )}

                            <DropdownMenuItem onClick={() => handleRemoveAdmin(admin.id, admin.full_name || admin.email)} className="text-rose-600 focus:text-rose-600">
                                <Trash2 className="mr-2 h-4 w-4 text-rose-400" />
                                Desvincular Admin
                            </DropdownMenuItem>
                        </div>
                    ))}
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

            <ManageSurveysDialog
                companyId={company.id}
                companyName={company.name}
                open={showSurveysDialog}
                onOpenChange={setShowSurveysDialog}
            />
        </>
    );
}
