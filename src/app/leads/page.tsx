import { getLeadsWithDetails } from "@/lib/crm-service";
import LeadsPageWrapper from "./LeadsPageWrapper";

export default async function LeadsPage() {
    const leads = await getLeadsWithDetails();
    return <LeadsPageWrapper initialLeads={leads} />;
}
