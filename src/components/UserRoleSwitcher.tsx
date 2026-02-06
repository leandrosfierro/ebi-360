"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2 } from "lucide-react";
import { switchRole } from "@/lib/actions";

interface RoleSwitcherProps {
    currentRole: string;
    availableRoles: string[];
    primaryColor?: string | null;
    excludeSuperAdmin?: boolean;
}

const roleLabels: Record<string, string> = {
    super_admin: "Super Administrador",
    company_admin: "Administrador",
    employee: "Colaborador"
};

// Map paths for redirect after switch
const rolePaths: Record<string, string> = {
    super_admin: "/admin/super",
    company_admin: "/admin/company",
    employee: "/"
};

export function UserRoleSwitcher({ currentRole, availableRoles, primaryColor, excludeSuperAdmin = false }: RoleSwitcherProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [switching, setSwitching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Filter roles if needed
    const filteredRoles = excludeSuperAdmin
        ? availableRoles.filter(r => r !== 'super_admin')
        : availableRoles;

    // 🛡️ SECURITY / UX HARDENING: 
    // Only Super Admins are allowed to switch roles.
    // Company Admins should not be able to switch to 'employee' to avoid confusion/lockout.
    const isSuperAdmin = availableRoles.includes('super_admin');

    if (!isSuperAdmin || filteredRoles.length <= 1) {
        // Render static badge (non-interactive)
        return (
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-primary/5 border border-primary/10 w-full">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.5)]"></div>
                <span className="text-xs font-semibold text-primary/90">
                    {roleLabels[currentRole] || roleLabels[currentRole === 'company_admin' ? 'company_admin' : 'employee'] || currentRole}
                </span>
            </div>
        );
    }

    const handleRoleSwitch = async (newRole: any) => {
        if (newRole === currentRole) return;

        setSwitching(true);
        setError(null);

        try {
            const res = await switchRole(newRole);
            if (res?.error) throw new Error(res.error);

            // Force hard refresh to ensure layout and metadata catch up
            window.location.href = rolePaths[newRole] || '/';
        } catch (err: any) {
            setError(err.message || "Error al cambiar de rol");
            setSwitching(false);
        }
    };

    // Label override: in company context, Super Admin is shown as "Administrador"
    // This is the "de base" fix for visual consistency.
    let activeLabel = roleLabels[currentRole] || "Administrador";
    if (excludeSuperAdmin && currentRole === 'super_admin') {
        activeLabel = "Administrador";
    }
    if (currentRole === 'company_admin') {
        activeLabel = "Administrador";
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={switching}
                className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md px-4 py-2.5 text-sm font-bold text-foreground hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px] justify-between shadow-lg"
            >
                <span className="truncate">{activeLabel}</span>
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
                    <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-[100] overflow-hidden border border-border/50 ring-1 ring-black/5">
                        <div className="p-2">
                            <div className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] border-b border-white/5">
                                Cambiar Rol
                            </div>
                            <div className="py-2 space-y-1">
                                {filteredRoles.map((role) => (
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
