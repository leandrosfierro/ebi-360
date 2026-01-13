import { createClient } from "@/lib/supabase/server";
import ResultsPageClient from "./ResultsPageClient";

export default async function ResultsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let companyBranding = null;

    if (user) {
        // Get user's company
        const { data: profile } = await supabase
            .from('profiles')
            .select('company_id')
            .eq('id', user.id)
            .maybeSingle();

        if (profile?.company_id) {
            // Get company branding
            const { data: company } = await supabase
                .from('companies')
                .select('name, logo_url, primary_color, secondary_color, font')
                .eq('id', profile.company_id)
                .single();

            companyBranding = company;
        }
    }

    return <ResultsPageClient companyBranding={companyBranding} />;
}
