import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Users, Settings, ArrowRight } from "lucide-react";

interface EmptyStateProps {
    type: "no_employees" | "no_results";
}

export function EmptyState({ type }: EmptyStateProps) {
    if (type === "no_employees") {
        return (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                    <Users className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">¡Bienvenido a EBI 360!</h3>
                <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-sm">
                    Para comenzar a medir el bienestar de tu organización, el primer paso es cargar a tus colaboradores.
                </p>
                <div className="flex gap-4">
                    <Link href="/admin/company/employees/upload">
                        <Button className="bg-purple-600 hover:bg-purple-700">
                            <Users className="mr-2 h-4 w-4" />
                            Cargar Colaboradores
                        </Button>
                    </Link>
                    <Link href="/admin/company/settings">
                        <Button variant="outline">
                            <Settings className="mr-2 h-4 w-4" />
                            Configurar Marca
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <ArrowRight className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Esperando Resultados</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-sm">
                Tus colaboradores ya están cargados. Invítalos a completar el diagnóstico para ver las métricas aquí.
            </p>
            <Link href="/admin/company/employees">
                <Button variant="outline">
                    Ver Estado de Invitaciones
                </Button>
            </Link>
        </div>
    );
}
