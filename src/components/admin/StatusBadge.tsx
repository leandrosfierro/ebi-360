import { cn } from "@/lib/utils";

type AdminStatus = "invited" | "active" | "inactive" | "suspended";

interface StatusBadgeProps {
    status: AdminStatus;
    className?: string;
}

const statusConfig = {
    invited: {
        label: "Invitado",
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: "📧"
    },
    active: {
        label: "Activo",
        color: "bg-green-100 text-green-800 border-green-200",
        icon: "✓"
    },
    inactive: {
        label: "Inactivo",
        color: "bg-orange-100 text-orange-800 border-orange-200",
        icon: "⏸"
    },
    suspended: {
        label: "Suspendido",
        color: "bg-red-100 text-red-800 border-red-200",
        icon: "🚫"
    }
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const config = statusConfig[status] || statusConfig.invited;

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
                config.color,
                className
            )}
        >
            <span className="text-xs">{config.icon}</span>
            {config.label}
        </span>
    );
}
