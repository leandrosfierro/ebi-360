import { createClient } from "@/lib/supabase/server";
import { ClipboardCheck } from "lucide-react";
import { CampaignList } from "@/components/admin/company/CampaignList";

export default async function EvaluationsPage() {
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

    // Fetch assigned surveys (evaluations)
    const { data: campaigns } = await supabase
        .from('company_surveys')
        .select('*, survey:surveys(*)')
        .eq('company_id', companyId)
        .order('assigned_at', { ascending: false });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground italic uppercase italic italic italic">Gestión de Evaluaciones</h2>
                    <p className="text-muted-foreground italic flex items-center gap-2">
                        <ClipboardCheck className="h-4 w-4 text-primary" />
                        Controla el ciclo de vida de tus campañas y módulos de diagnóstico.
                    </p>
                </div>
            </div>

            <CampaignList campaigns={campaigns || []} />
        </div>
    );
}
