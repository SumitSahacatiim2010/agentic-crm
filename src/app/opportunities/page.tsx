import { getOpportunitiesWithDetails } from "@/lib/crm-service";
import { OpportunitiesPageWrapper } from "./OpportunitiesPageWrapper";

export default async function OpportunitiesPage() {
    const opportunities = await getOpportunitiesWithDetails();
    return <OpportunitiesPageWrapper initialOpps={opportunities} />;
}
