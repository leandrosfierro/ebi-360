import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { LogOut, Home, Activity, User, Target } from "lucide-react";
import { AdminSidebarLinks } from "@/components/admin/AdminSidebarLinks";

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

    const { AppLayoutWrapper } = await import("@/components/layout/AppLayoutWrapper");

    return (
        <AppLayoutWrapper>
            {children}
        </AppLayoutWrapper>
    );
}
