import { createClient } from "@/lib/supabase/server";
import CompanyAdminLayoutClient from "./layout-client";

export default async function CompanyAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let userRoles: string[] = [];
    let activeRole = "";
    let companyBranding = null;

    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('roles, active_role, role, company_id')
            .eq('id', user.id)
            .single();

        userRoles = profile?.roles || [profile?.role || 'employee'];
        activeRole = profile?.active_role || profile?.role || 'employee';

        if (profile?.company_id) {
            const { data: company } = await supabase
                .from('companies')
                .select('name, logo_url, primary_color, secondary_color')
                .eq('id', profile.company_id)
                .single();
            companyBranding = company;
        }
    }

    return (
        <CompanyAdminLayoutClient
            userRoles={userRoles}
            activeRole={activeRole}
            companyBranding={companyBranding}
        >
            {children}
        </CompanyAdminLayoutClient>
    );
}
