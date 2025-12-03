"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2, UserPlus } from "lucide-react";
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
import { InviteAdminDialog } from "./InviteAdminDialog";

interface CompanyActionsMenuProps {
    company: {
        id: string;
        name: string;
        subscription_plan: "basic" | "pro" | "enterprise";
        active: boolean;
    };
}

export function CompanyActionsMenu({ company }: CompanyActionsMenuProps) {
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    // Invite dialog manages its own state, but we need to trigger it. 
    // Actually, InviteAdminDialog is a DialogTrigger itself.
    // We can't easily nest DialogTrigger inside DropdownMenuItem without issues.
    // So we'll keep InviteAdminDialog separate in the UI or handle it differently.
    // For now, let's keep Invite separate in the column as it's a primary action, 
    // and put Edit/Delete in the menu.

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menú</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar Empresa
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-red-600 focus:text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar Empresa
                    </DropdownMenuItem>
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
