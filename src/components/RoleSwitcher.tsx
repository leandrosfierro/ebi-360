"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ChevronDown } from "lucide-react";

interface RoleSwitcherProps {
    currentRole: string;
    availableRoles: string[];
}

const roleLabels: Record<string, string> = {
    super_admin: "Super Administrador",
    company_admin: "Admin de Empresa",
    employee: "Colaborador"
};

const rolePaths: Record<string, string> = {
    super_admin: "/admin/super",
    company_admin: "/admin/company",
    employee: "/"
};

export function RoleSwitcher({ currentRole, availableRoles }: RoleSwitcherProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [switching, setSwitching] = useState(false);
    const router = useRouter();

    if (availableRoles.length <= 1) {
        return null; // Don't show if user only has one role
    }

    const handleRoleSwitch = async (newRole: string) => {
        setSwitching(true);
        const supabase = createClient();

        const { error } = await supabase
            .from('profiles')
            .update({ active_role: newRole })
            .eq('id', (await supabase.auth.getUser()).data.user?.id);

        if (!error) {
            // Redirect to the appropriate panel
            router.push(rolePaths[newRole] || '/');
            router.refresh();
        } else {
            console.error("Error switching role:", error);
            setSwitching(false);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={switching}
                className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
                <span>{roleLabels[currentRole] || currentRole}</span>
                <ChevronDown className="h-4 w-4" />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 rounded-lg border border-gray-200 bg-white shadow-lg z-20">
                        <div className="p-2">
                            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                                Cambiar Rol
                            </div>
                            {availableRoles.map((role) => (
                                <button
                                    key={role}
                                    onClick={() => {
                                        handleRoleSwitch(role);
                                        setIsOpen(false);
                                    }}
                                    disabled={role === currentRole || switching}
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${role === currentRole
                                            ? 'bg-purple-50 text-purple-700 font-medium'
                                            : 'text-gray-700 hover:bg-gray-50'
                                        } disabled:opacity-50`}
                                >
                                    {roleLabels[role] || role}
                                    {role === currentRole && (
                                        <span className="ml-2 text-xs">(actual)</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
