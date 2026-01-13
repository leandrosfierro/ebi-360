import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { WellbeingPlanClient } from "./WellbeingPlanClient";

export default async function WellbeingPlanPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // 1. Fetch latest check-in
    const { data: latestCheckIn } = await supabase
        .from('wellbeing_checkins')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (!latestCheckIn) {
        redirect("/wellbeing");
    }

    // 2. Fetch history for trend calculation in UI
    const { data: history } = await supabase
        .from('wellbeing_checkins')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

    return (
        <WellbeingPlanClient
            latestCheckIn={latestCheckIn}
            history={history || []}
        />
    );
}
