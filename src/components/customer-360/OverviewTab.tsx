import { DemographicsCard, ContactInfoCard } from "./OverviewCards";

export function OverviewTab({ data }: { data: any }) {
    if (!data) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <DemographicsCard data={data} />
                    <ContactInfoCard />
                </div>
                {/* Placeholder for RelationshipDetails and NBARecommendations */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-64 flex items-center justify-center text-slate-500 text-sm">
                    Relationship Details & Next Best Action (Placeholder)
                </div>
            </div>

            <div className="space-y-6">
                {/* Placeholder for HouseholdSidebar */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-96 flex items-center justify-center text-slate-500 text-sm text-center">
                    Household Info<br />(Coming Soon)
                </div>
            </div>
        </div>
    );
}
