import { Suspense } from "react";
import { EmailManager } from "@/components/admin/EmailManager";
import { getEmailTemplates, getEmailLogs } from "@/lib/email-actions";
import { Loader2 } from "lucide-react";

export default async function EmailsPage() {
    const { data: templates } = await getEmailTemplates();
    const { data: logs } = await getEmailLogs();

    if (!templates) {
        return <div>Error cargando plantillas o no autorizado.</div>;
    }

    return (
        <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-purple-600" /></div>}>
            <EmailManager initialTemplates={templates} initialLogs={logs || []} />
        </Suspense>
    );
}
