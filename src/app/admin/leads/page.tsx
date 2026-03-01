import { LeadRulesConfig } from "@/components/admin/LeadRulesConfig";

export default function AdminLeadsPage() {
    return (
        <main className="flex-1 overflow-x-hidden p-6 md:p-8 lg:p-10">
            <div className="max-w-[1400px] mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-black tracking-tight text-white mb-2">
                        Lead Management Rules
                    </h1>
                    <p className="text-slate-400 max-w-2xl">
                        Configure auto-assignment routing, SLA thresholds, and qualification scoring weights for incoming leads.
                    </p>
                </div>
                <LeadRulesConfig />
            </div>
        </main>
    );
}
