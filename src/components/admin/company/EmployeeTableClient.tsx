"use client";

import { useState } from "react";
import { Mail, Search, User, Check, Square, CheckSquare, Loader2, AlertCircle } from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EmployeeActionsMenu } from "@/components/admin/company/EmployeeActionsMenu";
import { Button } from "@/components/ui/button";
import { sendManualInvitations } from "@/lib/invitation-actions";
import { useRouter } from "next/navigation";

interface EmployeeTableClientProps {
    employees: any[];
    areas: any[];
}

export function EmployeeTableClient({ employees: initialEmployees, areas }: EmployeeTableClientProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isBulkSending, setIsBulkSending] = useState(false);
    const [statusFilter, setStatusFilter] = useState("all");
    const router = useRouter();

    const filteredEmployees = initialEmployees.filter(emp => {
        const matchesSearch =
            emp.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.email?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "all" || emp.admin_status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredEmployees.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredEmployees.map(e => e.id));
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleBulkInvite = async () => {
        if (selectedIds.length === 0) return;
        if (!confirm(`¿Enviar invitaciones a ${selectedIds.length} colaboradores?`)) return;

        setIsBulkSending(true);
        const result = await sendManualInvitations(selectedIds) as any;

        if (result.success) {
            alert(`✓ Proceso completado.\nEnviados: ${result.sent}\nFallidos: ${result.failed}`);
            setSelectedIds([]);
        } else {
            alert(`Error: ${result.error || 'Ocurrió un error al enviar las invitaciones'}`);
        }

        setIsBulkSending(false);
        router.refresh();
    };

    return (
        <div className="space-y-6">
            {/* Search and Bulk Actions */}
            <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-white/10 pl-11 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                </div>

                <div className="flex w-full md:w-auto gap-3">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="flex-1 md:w-auto rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-foreground outline-none focus:border-primary transition-all"
                    >
                        <option value="all">Todos los estados</option>
                        <option value="active">Activos</option>
                        <option value="invited">Invitados</option>
                        <option value="pending">Pendientes</option>
                        <option value="inactive">Inactivos</option>
                    </select>

                    {selectedIds.length > 0 && (
                        <Button
                            onClick={handleBulkInvite}
                            disabled={isBulkSending}
                            className="bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl shadow-lg shadow-primary/20 animate-in zoom-in-95"
                        >
                            {isBulkSending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Mail className="mr-2 h-4 w-4" />
                            )}
                            Invitar ({selectedIds.length})
                        </Button>
                    )}
                </div>
            </div>

            {/* List */}
            <div className="glass-card rounded-[32px] overflow-hidden shadow-xl border-none">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-white/5 text-muted-foreground">
                                <th className="px-6 py-5 w-10">
                                    <button
                                        onClick={toggleSelectAll}
                                        className="text-primary hover:scale-110 transition-transform"
                                    >
                                        {selectedIds.length === filteredEmployees.length && filteredEmployees.length > 0 ? (
                                            <CheckSquare className="h-5 w-5" />
                                        ) : (
                                            <Square className="h-5 w-5" />
                                        )}
                                    </button>
                                </th>
                                <th className="px-6 py-5 font-bold uppercase tracking-widest text-[10px]">Colaborador</th>
                                <th className="px-6 py-5 font-bold uppercase tracking-widest text-[10px]">Área</th>
                                <th className="px-6 py-5 font-bold uppercase tracking-widest text-[10px]">Rol</th>
                                <th className="px-6 py-5 font-bold uppercase tracking-widest text-[10px]">Estado</th>
                                <th className="px-6 py-5 font-bold uppercase tracking-widest text-[10px]">Último Acceso</th>
                                <th className="px-6 py-5 font-bold uppercase tracking-widest text-[10px] text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredEmployees.length > 0 ? (
                                filteredEmployees.map((employee) => {
                                    const isSelected = selectedIds.includes(employee.id);
                                    return (
                                        <tr key={employee.id} className={`group transition-colors ${isSelected ? 'bg-primary/5' : 'hover:bg-white/5'}`}>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => toggleSelect(employee.id)}
                                                    className={`transition-all ${isSelected ? 'text-primary scale-110' : 'text-muted-foreground/30 hover:text-primary'}`}
                                                >
                                                    {isSelected ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
                                                        {employee.avatar_url ? (
                                                            <img src={employee.avatar_url} alt={employee.full_name} className="h-full w-full object-cover rounded-2xl" />
                                                        ) : (
                                                            <User className="h-5 w-5" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-foreground leading-none mb-1">{employee.full_name || "Sin nombre"}</p>
                                                        <p className="text-[11px] text-muted-foreground">{employee.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                                                    {employee.areas?.name || "Sin Área"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center rounded-full bg-primary/5 border border-primary/10 px-3 py-1 text-[10px] font-bold text-primary uppercase tracking-wider">
                                                    {employee.role === 'company_admin' ? 'Administrador' : 'Colaborador'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={(employee.admin_status as any) || 'invited'} />
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground text-[11px] font-medium">
                                                {new Date(employee.created_at).toLocaleDateString('es-ES', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <EmployeeActionsMenu employee={employee} areas={areas} />
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="h-16 w-16 bg-primary/5 rounded-full flex items-center justify-center mb-4">
                                                <Search className="h-8 w-8 text-primary/40" />
                                            </div>
                                            <p className="text-lg font-bold text-foreground">No se encontraron colaboradores</p>
                                            <p className="text-sm text-muted-foreground italic">Intenta con otros criterios de búsqueda.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
