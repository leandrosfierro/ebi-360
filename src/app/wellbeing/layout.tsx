import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function WellbeingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role, roles, active_role, company_id')
        .eq('id', user.id)
        .maybeSingle();

    const navLinks = [
        { href: "/wellbeing", label: "Mi Rueda", icon: "Activity" },
        { href: "/perfil", label: "Mi Perfil", icon: "User" },
    ];

    // Add back-to-admin link if applicable
    const isAdmin = profile?.role === 'super_admin' || profile?.role === 'company_admin' || (profile?.roles || []).includes('super_admin');
    const adminPath = (profile?.active_role === 'super_admin' || profile?.role === 'super_admin') ? "/admin/super" : "/admin/company";

    return (
        <>
            {children}
        </>
    );
}
