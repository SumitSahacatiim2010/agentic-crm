import { getPortfolioScorecardData, getPipelineChartData, getDashboardTasks, getTerritoryBreakdownFromDB } from "@/lib/crm-service";
import { insforge } from "@/lib/insforge-client";
import { PerformanceScorecard, ScorecardMetric } from "@/components/rm-dashboard/PerformanceScorecard";
import { PipelineFunnel } from "@/components/rm-dashboard/PipelineFunnel";
import { AlertsQueue } from "@/components/rm-dashboard/AlertsQueue";
import { TerritoryAnalyticsClient } from "@/components/rm-dashboard/TerritoryAnalyticsClient";
import { RMAlertBanner } from "@/components/servicing/RMAlertBanner";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

async function getRMAlerts() {
    const { data } = await insforge.database
        .from('rm_alerts')
        .select('alert_id, case_id, customer_id, severity, title, is_read, created_at')
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(5);
    return (data || []) as any[];
}

export default async function DashboardPage() {
    const [scorecard, pipeline, territory, tasks, rmAlerts] = await Promise.all([
        getPortfolioScorecardData(),
        getPipelineChartData(),
        getTerritoryBreakdownFromDB(),
        getDashboardTasks(),
        getRMAlerts(),
    ]);

    const attainmentPct = scorecard.metrics[0]?.attainmentPct ?? 0;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-6">
            <header className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">Relationship Dashboard</h1>
                    <p className="text-slate-100/60 font-medium">
                        Welcome back, Sarah. You have {tasks.length} prioritized tasks.
                    </p>
                </div>
                <div className="flex gap-3">
                    <div className="text-right mr-4">
                        <div className="text-sm font-semibold text-slate-100">Quota Attainment</div>
                        <div className={`text-xs font-mono font-bold ${attainmentPct >= 90 ? 'text-emerald-400' : attainmentPct >= 70 ? 'text-amber-400' : 'text-red-400'}`}>
                            {attainmentPct.toFixed(0)}% YTD
                        </div>
                    </div>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                                <Plus className="h-4 w-4 mr-2" />
                                New Opportunity
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-slate-100">
                            <DialogHeader>
                                <DialogTitle>Create Opportunity</DialogTitle>
                                <DialogDescription className="text-slate-400">
                                    Initiate a new sales pipeline entry via the Opportunities Kanban.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4 text-sm text-slate-400 text-center">
                                Use <strong>/opportunities</strong> → Kanban → &quot;New Deal&quot; to create a tracked opportunity with full lifecycle management.
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </header>

            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12">
                    <PerformanceScorecard metrics={scorecard.metrics.map(m => ({ ...m, status: m.status as ScorecardMetric['status'], trend: m.trend as ScorecardMetric['trend'] }))} />
                </div>

                <div className="col-span-12 lg:col-span-8 space-y-6">
                    <PipelineFunnel data={pipeline} />
                    <TerritoryAnalyticsClient segments={territory} />
                </div>

                <div className="col-span-12 lg:col-span-4 h-full">
                    <RMAlertBanner alerts={rmAlerts} />
                    <AlertsQueue alerts={tasks} />
                </div>
            </div>
        </div>
    );
}
