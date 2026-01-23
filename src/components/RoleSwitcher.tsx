"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ChevronDown, Loader2 } from "lucide-react";

interface RoleSwitcherProps {
    currentRole: string;
    availableRoles: string[];
    primaryColor?: string | null;
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

export function RoleSwitcher({ currentRole, availableRoles, primaryColor }: RoleSwitcherProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [switching, setSwitching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    if (availableRoles.length <= 1) {
        return null; // Don't show if user only has one role
    }

    const handleRoleSwitch = async (newRole: string) => {
        if (newRole === currentRole) return;

        setSwitching(true);
        setError(null);
        const supabase = createClient();

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                throw new Error("Usuario no autenticado");
            }

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ active_role: newRole })
                .eq('id', user.id);

            if (updateError) {
                throw updateError;
            }

            // Redirect to the appropriate panel
            router.push(rolePaths[newRole] || '/');
            router.refresh();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Error al cambiar de rol";
            setError(errorMessage);

            if (process.env.NODE_ENV === 'development') {
                console.error("[RoleSwitcher] Error:", err);
            }
        } finally {
            setSwitching(false);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={switching}
                className="flex items-center gap-2 rounded-xl border border-border bg-muted/50 px-4 py-2.5 text-sm font-bold text-foreground hover:bg-muted transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[180px] justify-between"
            >
                <span className="truncate">{roleLabels[currentRole] || currentRole}</span>
                {switching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <ChevronDown className="h-4 w-4" />
                )}
            </button>

            {error && (
                <div className="absolute top-full mt-2 w-full rounded-lg bg-rose-500/10 border border-rose-500/20 p-2 text-xs text-rose-600 dark:text-rose-400">
                    {error}
                </div>
            )}

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl glass-card border-none shadow-xl z-20 overflow-hidden">
                        <div className="p-2">
                            <div className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] border-b border-white/5">
                                Cambiar Rol
                            </div>
                            <div className="py-2 space-y-1">
                                {availableRoles.map((role) => (
                                    <button
                                        key={role}
                                        onClick={() => {
                                            handleRoleSwitch(role);
                                            setIsOpen(false);
                                        }}
                                        disabled={role === currentRole || switching}
                                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all ${role === currentRole
                                            ? 'text-white'
                                            : 'text-foreground hover:bg-muted'
                                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                                        style={role === currentRole ? {
                                            backgroundColor: primaryColor || 'var(--primary)',
                                            boxShadow: primaryColor ? `0 10px 15px -3px ${primaryColor}40` : undefined
                                        } : {}}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span>{roleLabels[role] || role}</span>
                                            {role === currentRole && (
                                                <span className="text-[10px] opacity-70">(actual)</span>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )
            }
        </div >
    );
}
