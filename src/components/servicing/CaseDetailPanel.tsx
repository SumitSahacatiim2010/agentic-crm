"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { X, LayoutDashboard, ShieldAlert, Clock, BookOpen, ExternalLink, Star, CheckCircle2, Sparkles } from "lucide-react";
import { ComplaintClassificationPanel } from "./ComplaintClassificationPanel";
import { SLATimelinePanel } from "./SLATimelinePanel";
import { KnowledgeAssistPanel } from "./KnowledgeAssistPanel";
import { toast } from "sonner";
import { fmtDateTime } from "@/lib/date-utils";
import { ServiceCase } from "./CaseInboxClient";
import { ModelScoreCard } from "@/components/ai-explainability/ModelScoreCard";

interface CaseDetailPanelProps {
    caseData: ServiceCase;
    slaEvents: any[];
    onClose: () => void;
    onUpdated: (u: Partial<ServiceCase> & { case_id: string }) => void;
}

const STATUS_OPTIONS = ['open', 'in_progress', 'escalated', 'resolved', 'closed'];
const BAND_OPTIONS = ['P1', 'P2', 'P3', 'P4'];
const BAND_COLORS: Record<string, string> = {
    P1: 'bg-red-600 text-white', P2: 'bg-orange-500 text-white',
    P3: 'bg-amber-500 text-slate-900', P4: 'bg-slate-600 text-slate-200',
};

export function CaseDetailPanel({ caseData, slaEvents, onClose, onUpdated }: CaseDetailPanelProps) {
    const [status, setStatus] = useState(caseData.status);
    const [band, setBand] = useState(caseData.priority_band || 'P3');
    const [saving, setSaving] = useState(false);

    // AI Agent Assist State
    const [churnData, setChurnData] = useState<any>(null);

    useEffect(() => {
        if (!caseData.customer_id) return;
        fetch(`/api/mock/models/churn-prediction?customer_id=${caseData.customer_id}`)
            .then(r => r.json())
            .then(setChurnData)
            .catch(console.error);
    }, [caseData.customer_id]);

    // Resolution state
    const [showResolveForm, setShowResolveForm] = useState(false);
    const [resolutionNotes, setResolutionNotes] = useState('');
    const [resolutionCode, setResolutionCode] = useState('Fixed');
    const [csatScore, setCsatScore] = useState(0);

    const handleUpdateSlaEvents = () => {
        // T4.1.3 trigger reload if needed via parent `onUpdated` which causes SWR mutate
    };

    const handleSaveOverview = async () => {
        setSaving(true);
        const res = await fetch(`/api/service/cases/${caseData.case_id}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status, priority_band: band })
        });
        if (res.ok) {
            onUpdated({ case_id: caseData.case_id, status, priority_band: band });
            toast.success("Case updated");
        } else {
            toast.error("Update failed");
        }
        setSaving(false);
    };

    const handleResolveCase = async () => {
        setSaving(true);
        const res = await fetch(`/api/service/cases/${caseData.case_id}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status: 'resolved',
                resolved_at: new Date().toISOString(),
                // Resolution Notes, Code, CSAT can be saved to complaint details or comments later
            })
        });
        if (res.ok) {
            onUpdated({ case_id: caseData.case_id, status: 'resolved' });
            setStatus('resolved');
            setShowResolveForm(false);
            toast.success("Case resolved", { icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" /> });
        } else {
            toast.error("Failed to resolve case");
        }
        setSaving(false);
    };

    const handleCloseCase = async () => {
        if (!confirm("Are you sure you want to close this case?")) return;
        setSaving(true);
        const res = await fetch(`/api/service/cases/${caseData.case_id}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'closed', closed_at: new Date().toISOString() })
        });
        if (res.ok) {
            onUpdated({ case_id: caseData.case_id, status: 'closed' });
            setStatus('closed');
            toast.success("Case closed");
        } else {
            toast.error("Failed to close case");
        }
        setSaving(false);
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-start gap-3 p-4 border-b border-slate-800">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded ${BAND_COLORS[band]}`}>{band}</span>
                        {caseData.is_regulatory && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-900/40 text-amber-300 border border-amber-700/30">REGULATORY</span>
                        )}
                        <span className="text-[10px] text-slate-500 capitalize">{caseData.channel}</span>
                        <a href={`/customer/${caseData.customer_id}`} className="text-[10px] text-indigo-400 flex items-center gap-0.5 hover:text-indigo-300">View Customer <ExternalLink className="h-2.5 w-2.5" /></a>
                    </div>
                    <h2 className="text-sm font-bold text-slate-100 leading-snug">{caseData.subject}</h2>
                    <p className="text-[10px] font-mono text-slate-600 mt-0.5">{caseData.case_id}</p>
                </div>
                <button onClick={onClose} className="text-slate-600 hover:text-slate-300 shrink-0">
                    <X className="h-4 w-4" />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex-1 overflow-hidden">
                <Tabs defaultValue="overview" className="h-full flex flex-col">
                    <TabsList className="bg-slate-900 border-b border-slate-800 rounded-none justify-start px-4 h-auto py-0 gap-0 shrink-0">
                        {[
                            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                            { id: 'classification', label: 'Classification', icon: ShieldAlert },
                            { id: 'sla', label: 'SLA Timeline', icon: Clock },
                            { id: 'knowledge', label: 'Knowledge', icon: BookOpen },
                        ].map(t => (
                            <TabsTrigger key={t.id} value={t.id}
                                className="text-xs flex items-center gap-1.5 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 data-[state=active]:bg-transparent rounded-none px-4 py-3 text-slate-500">
                                <t.icon className="h-3 w-3" />{t.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    <div className="flex-1 overflow-y-auto">
                        <TabsContent value="overview" className="p-4 space-y-4 m-0">

                            {/* Agent Assist / Retention NBA */}
                            {churnData && churnData.churn_probability > 0.5 && (
                                <div className="bg-indigo-950/20 border border-indigo-500/30 rounded-lg p-3 space-y-3">
                                    <div className="flex items-center gap-2 text-indigo-300 font-semibold text-xs">
                                        <Sparkles className="h-4 w-4 text-purple-400" />
                                        Agent Assist: Retention Action Recommended
                                    </div>
                                    <ModelScoreCard
                                        title="At-Risk Customer Detected"
                                        description="High probability of churn. Recommend applying fee waiver concession."
                                        score={churnData.churn_probability * 100}
                                        maxScore={100}
                                        riskBadge={`${churnData.risk_level} Risk`}
                                        riskBadgeVariant="destructive"
                                        factors={churnData.top_factors}
                                        modelVersion={churnData.model_version}
                                        onOverride={() => toast.success("Retention offer applied.", { description: "Fee waiver NBA executed." })}
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500">Status</label>
                                    <select value={status} onChange={e => setStatus(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-md h-9 px-3 text-sm text-slate-200 capitalize">
                                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500">Priority Band</label>
                                    <select value={band} onChange={e => setBand(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-md h-9 px-3 text-sm text-slate-200">
                                        {BAND_OPTIONS.map(b => <option key={b}>{b}</option>)}
                                    </select>
                                </div>
                            </div>
                            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-xs w-full" onClick={handleSaveOverview} disabled={saving}>
                                {saving ? 'Saving…' : 'Save Changes'}
                            </Button>

                            {/* Case metadata */}
                            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-2">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Case Info</p>
                                {[
                                    ['Channel', caseData.channel],
                                    ['Created', fmtDateTime(caseData.created_at)],
                                    ['SLA Deadline', fmtDateTime(caseData.sla_deadline)],
                                    ['Regulatory', caseData.is_regulatory ? 'Yes' : 'No'],
                                ].map(([k, v]) => (
                                    <div key={k} className="flex justify-between text-xs">
                                        <span className="text-slate-500">{k}</span>
                                        <span className="text-slate-300 capitalize">{v}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Case Resolution Workflow */}
                            {status === 'resolved' ? (
                                <div className="p-3 bg-emerald-950/20 border border-emerald-800/50 rounded-lg space-y-2">
                                    <p className="text-xs font-bold text-emerald-400">Case Resolved</p>
                                    <Button size="sm" variant="outline" className="w-full text-xs" onClick={handleCloseCase} disabled={saving}>Close Case</Button>
                                </div>
                            ) : status === 'closed' ? (
                                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-center text-xs text-slate-500 font-medium">
                                    Case is Closed
                                </div>
                            ) : showResolveForm ? (
                                <div className="bg-slate-900 border border-indigo-500/50 rounded-lg p-3 space-y-3">
                                    <h3 className="text-xs font-bold text-slate-300">Resolve Case</h3>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-slate-500">Resolution Code</label>
                                        <select value={resolutionCode} onChange={e => setResolutionCode(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded h-7 px-2 text-xs text-slate-200">
                                            <option>Fixed</option>
                                            <option>Workaround Provided</option>
                                            <option>Cannot Reproduce</option>
                                            <option>Duplicate</option>
                                            <option>Canceled</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-slate-500">Resolution Notes</label>
                                        <textarea value={resolutionNotes} onChange={e => setResolutionNotes(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-slate-200 resize-none h-16" placeholder="Final resolution details..." />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-slate-500">CSAT Score (Expected)</label>
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <Star key={s} className={`h-4 w-4 cursor-pointer transition-colors ${csatScore >= s ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} onClick={() => setCsatScore(s)} />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <Button size="sm" className="flex-1 text-xs bg-emerald-600 hover:bg-emerald-700" onClick={handleResolveCase} disabled={saving}>Submit Resolution</Button>
                                        <Button size="sm" variant="ghost" className="text-xs" onClick={() => setShowResolveForm(false)} disabled={saving}>Cancel</Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="pt-2 border-t border-slate-800">
                                    <Button size="sm" className="w-full bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 hover:text-indigo-300 border border-indigo-500/30 text-xs" onClick={() => setShowResolveForm(true)}>
                                        <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Start Resolution
                                    </Button>
                                </div>
                            )}

                        </TabsContent>

                        <TabsContent value="classification" className="p-4 m-0">
                            <ComplaintClassificationPanel caseId={caseData.case_id} customerId={caseData.customer_id} subject={caseData.subject} />
                        </TabsContent>

                        <TabsContent value="sla" className="p-4 m-0">
                            <SLATimelinePanel caseId={caseData.case_id} slaEvents={slaEvents} priorityBand={caseData.priority_band || 'P3'} onEscalate={() => { onUpdated({ case_id: caseData.case_id, status: 'escalated' }); setStatus('escalated'); toast.success('Escalated to supervisor') }} />
                        </TabsContent>

                        <TabsContent value="knowledge" className="p-4 m-0">
                            <KnowledgeAssistPanel caseId={caseData.case_id} subject={caseData.subject} />
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    );
}
