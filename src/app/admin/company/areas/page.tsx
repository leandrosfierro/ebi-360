import { createClient } from "@/lib/supabase/server";
import { Building2 } from "lucide-react";
import { CreateAreaDialog } from "@/components/admin/company/areas/CreateAreaDialog";
import { AreaList } from "@/components/admin/company/areas/AreaList";
import { getAreas } from "@/lib/areas-actions";

export default async function AreasPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Get company_id
    const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user?.id)
        .single();

    const companyId = profile?.company_id;

    if (!companyId) return <div>No se encontró la empresa.</div>;

    const areas = await getAreas(companyId);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Gestión de Áreas</h2>
                    <p className="text-muted-foreground italic flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-primary" />
                        Organiza tu empresa en departamentos o sectores para un análisis detallado.
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <CreateAreaDialog companyId={companyId} />
                </div>
            </div>

            <AreaList areas={areas} />
        </div>
    );
}
