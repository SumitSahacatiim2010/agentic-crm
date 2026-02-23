import { ClientProfileBanner } from "@/components/wealth/ClientProfileBanner";
import { PortfolioValuationTable } from "@/components/wealth/PortfolioValuationTable";
import { PerformanceChart } from "@/components/wealth/PerformanceChart";
import { DriftAlert } from "@/components/wealth/DriftAlert";
import { ProposalGenerator } from "@/components/wealth/ProposalGenerator";

export default function PortfolioPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col gap-6">

            {/* 1. Client Banner */}
            <ClientProfileBanner />

            {/* 2. Drift Alerts (Conditional) */}
            <DriftAlert />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 3. Valuation Table (Span 2 cols) */}
                <div className="lg:col-span-2 space-y-6">
                    <PortfolioValuationTable />
                </div>

                {/* 4. Right Sidebar: Performance & Actions */}
                <div className="space-y-6">
                    {/* Performance Chart */}
                    <div className="h-[400px]">
                        <PerformanceChart />
                    </div>

                    {/* Proposal Generator */}
                    <ProposalGenerator />
                </div>

            </div>
        </div>
    );
}
