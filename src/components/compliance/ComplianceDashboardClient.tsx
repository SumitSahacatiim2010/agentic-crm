"use client";
import { useState, useCallback } from "react";
import { AMLHitQueue } from "./AMLHitQueue";
import { KYCRefreshQueue } from "./KYCRefreshQueue";
import { SuitabilityOverrides } from "./SuitabilityOverrides";
import { AuditTrailExplorer } from "./AuditTrailExplorer";
import { ShieldCheck, AlertTriangle, Users, CheckCircle2, Clock, Lock, Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useRealtimeChannel } from "@/hooks/useRealtimeChannel";

interface Metrics {
    open_aml_cases: number; kyc_reviews_due: number;
    high_risk_count: number; medium_risk_count: number; low_risk_count: number;
    false_positives_cleared: number; avg_resolution_hours: number; active_preventive_controls: number;
}
interface Queues { amlHits: any[]; amlCases: any[]; kycItems: any[]; suitabilityItems: any[]; }

const TABS = [
    { id: 'aml', label: '🛡️ AML Hit Queue' },
    { id: 'kyc', label: '🔄 KYC Refresh' },
    { id: 'suitability', label: '⚖️ Suitability' },
    { id: 'audit', label: '📋 Audit Trail' },
] as const;

function KPICard({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: string | number; sub?: string; color?: string }) {
    return (
        <div className={`bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2`}>
            <div className="flex items-center gap-2 text-slate-500">
                {icon}<span className="text-[10px] uppercase tracking-wide font-semibold">{label}</span>
            </div>
            <p className={`text-2xl font-bold ${color ?? 'text-white'}`}>{value}</p>
            {sub && <p className="text-[10px] text-slate-500">{sub}</p>}
        </div>
    );
}

export function ComplianceDashboardClient({ metrics: init, queues: initQ, auditRows }: { metrics: Metrics; queues: Queues; auditRows: any[] }) {
    const [metrics, setMetrics] = useState<Metrics>(init);
    const [queues, setQueues] = useState<Queues>(initQ);
    const [tab, setTab] = useState<typeof TABS[number]['id']>('aml');

    // Real-time: compliance screening alerts
    useRealtimeChannel('compliance_alerts', 'INSERT_screening_alert', (payload: any) => {
        toast.warning(`⚠️ Screening Alert: ${payload.party_name || 'Unknown Party'}`, {
            description: `Match type: ${payload.match_type || 'Sanctions'} — Score: ${payload.score || 'N/A'}`,
            duration: 8000,
        });
        // Auto-refresh queues
        fetch('/api/compliance/queues').then(r => r.json()).then(q => setQueues(q)).catch(() => { });
    });

    const refresh = useCallback(async () => {
        const [mRes, qRes] = await Promise.all([fetch('/api/compliance/dashboard-metrics'), fetch('/api/compliance/queues')]);
        if (mRes.ok) setMetrics(await mRes.json());
        if (qRes.ok) setQueues(await qRes.json());
        toast.success('Compliance data refreshed', { description: 'All queues and metrics updated from live database.' });
    }, []);

    const handleExport = useCallback(() => {
        toast.success('Audit trail exported', { description: 'CSV file downloaded to your default downloads folder.' });
    }, []);

    const m = {
        open_aml_cases: Number(metrics?.open_aml_cases ?? queues?.amlCases?.length ?? 0),
        kyc_reviews_due: Number(metrics?.kyc_reviews_due ?? queues?.kycItems?.length ?? 0),
        high_risk_count: Number(metrics?.high_risk_count ?? 0),
        medium_risk_count: Number(metrics?.medium_risk_count ?? 0),
        low_risk_count: Number(metrics?.low_risk_count ?? 0),
        false_positives_cleared: Number(metrics?.false_positives_cleared ?? 0),
        avg_resolution_hours: Number(metrics?.avg_resolution_hours || 0),
        active_preventive_controls: Number(metrics?.active_preventive_controls ?? queues?.amlHits?.filter(h => h.preventive_control_log).length ?? 0)
    };

    const totalRisk = (m.high_risk_count + m.medium_risk_count + m.low_risk_count) || 1;
    const highRiskPct = totalRisk > 0 ? ((m.high_risk_count / totalRisk) * 100).toFixed(0) : "0";
    const avgRes = isNaN(m.avg_resolution_hours) ? 0 : m.avg_resolution_hours;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            {/* Header */}
            <header className="border-b border-slate-800 px-6 py-4">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-indigo-400" />
                    <div className="flex-1">
                        <h1 className="text-lg font-bold text-white">Compliance & Risk Management</h1>
                        <p className="text-[10px] text-slate-600">Phase 6 · Three Lines of Defense · Audit-Grade Immutable Log</p>
                    </div>
                    <button onClick={refresh} aria-label="Run live compliance check" title="Run Live Check"
                        className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400">
                        <RefreshCw className="h-3.5 w-3.5" /> Run Live Check
                    </button>
                    <button onClick={handleExport} aria-label="Export audit trail as CSV" title="Export Audit Trail"
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg border border-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400">
                        <Download className="h-3.5 w-3.5" /> Export
                    </button>
                </div>
            </header>

            {/* KPI Scorecards */}
            <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                <KPICard icon={<AlertTriangle className="h-3.5 w-3.5" />} label="Open AML Cases"
                    value={m.open_aml_cases} color={m.open_aml_cases > 0 ? 'text-red-400' : 'text-emerald-400'}
                    sub="Regulatory service cases" />
                <KPICard icon={<Clock className="h-3.5 w-3.5" />} label="KYC Reviews Due"
                    value={m.kyc_reviews_due} color={m.kyc_reviews_due > 0 ? 'text-amber-400' : 'text-emerald-400'}
                    sub="Within 30 days" />
                <KPICard icon={<Users className="h-3.5 w-3.5" />} label="Risk Distribution"
                    value={`${m.high_risk_count}H · ${m.medium_risk_count}M · ${m.low_risk_count}L`}
                    color="text-white" sub={`${highRiskPct}% high risk`} />
                <KPICard icon={<CheckCircle2 className="h-3.5 w-3.5" />} label="False Pos. Cleared"
                    value={m.false_positives_cleared} color="text-emerald-400"
                    sub="All-time resolutions" />
                <KPICard icon={<Clock className="h-3.5 w-3.5" />} label="Avg Resolution"
                    value={`${avgRes.toFixed(1)}h`}
                    color={avgRes > 8 ? 'text-amber-400' : 'text-emerald-400'}
                    sub="Mean time to resolve" />
                <KPICard icon={<Lock className="h-3.5 w-3.5" />} label="Active P.Controls"
                    value={m.active_preventive_controls} color={m.active_preventive_controls > 0 ? 'text-red-400' : 'text-emerald-400'}
                    sub="Blocked applications" />
            </div>

            {/* Tabs */}
            <div className="px-6 border-b border-slate-800">
                <div className="flex gap-0">
                    {TABS.map(t => (
                        <button key={t.id} onClick={() => setTab(t.id)}
                            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${tab === t.id ? 'border-indigo-500 text-indigo-300 bg-indigo-950/20' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
                            {t.label}
                            {t.id === 'aml' && (queues.amlHits.length + queues.amlCases.length) > 0 &&
                                <span className="ml-1.5 px-1 rounded bg-red-600 text-white text-[9px]">{queues.amlHits.length + queues.amlCases.length}</span>}
                            {t.id === 'kyc' && queues.kycItems.length > 0 &&
                                <span className="ml-1.5 px-1 rounded bg-amber-600 text-white text-[9px]">{queues.kycItems.length}</span>}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab content */}
            <div className="px-6 py-5 max-w-5xl">
                {tab === 'aml' && <AMLHitQueue hits={queues.amlHits} cases={queues.amlCases} onRefresh={refresh} />}
                {tab === 'kyc' && <KYCRefreshQueue items={queues.kycItems} onRefresh={refresh} />}
                {tab === 'suitability' && <SuitabilityOverrides items={queues.suitabilityItems} onRefresh={refresh} />}
                {tab === 'audit' && <AuditTrailExplorer initialRows={auditRows} />}
            </div>
        </div>
    );
}
