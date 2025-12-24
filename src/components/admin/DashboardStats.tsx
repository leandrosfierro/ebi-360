import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface DashboardStatsProps {
    title: string;
    value: string | number;
    description: string;
    icon: LucideIcon;
    trend?: string;
    trendUp?: boolean;
    alert?: boolean;
}

export function DashboardStats({
    title,
    value,
    description,
    icon: Icon,
    alert = false,
}: DashboardStatsProps) {
    return (
        <Card className="glass-card border-none shadow-lg hover:shadow-primary/5 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{title}</CardTitle>
                <div className={`p-1.5 rounded-lg ${alert ? "bg-rose-500/10" : "bg-primary/10"}`}>
                    <Icon className={`h-4 w-4 ${alert ? "text-rose-500" : "text-primary"}`} />
                </div>
            </CardHeader>
            <CardContent className="pt-2">
                <div className={`text-3xl font-black tracking-tight ${alert ? "text-rose-600" : "text-foreground"}`}>
                    {value}
                </div>
                <p className="text-[11px] font-medium text-muted-foreground mt-1 line-clamp-1">{description}</p>
            </CardContent>
        </Card>
    );
}
