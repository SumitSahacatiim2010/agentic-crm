"use client";

import { useState, useCallback } from "react";
import useSWR from "swr";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, ChevronRight, Clock, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { useRealtimeChannel } from "@/hooks/useRealtimeChannel";
import { WinLossPanel } from "./WinLossPanel";
import { DealDetailSheet } from "./DealDetailSheet";
import { fmtDate } from "@/lib/date-utils";

const STAGES = ['Prospecting', 'Qualification', 'Needs Analysis', 'Proposal', 'Negotiation', 'Completed'] as const;
type Stage = typeof STAGES[number];

const STAGE_COLORS: Record<Stage, string> = {
    Prospecting: 'border-slate-600 bg-slate-900',
    Qualification: 'border-blue-900 bg-blue-950/30',
    'Needs Analysis': 'border-indigo-900 bg-indigo-950/30',
    Proposal: 'border-purple-900 bg-purple-950/30',
    Negotiation: 'border-amber-900 bg-amber-950/20',
    Completed: 'border-emerald-900 bg-emerald-950/20',
};

const STAGE_BADGE: Record<Stage, string> = {
    Prospecting: 'bg-slate-700 text-slate-300',
    Qualification: 'bg-blue-900 text-blue-300',
    'Needs Analysis': 'bg-indigo-900 text-indigo-300',
    Proposal: 'bg-purple-900 text-purple-300',
    Negotiation: 'bg-amber-900 text-amber-300',
    Completed: 'bg-emerald-900 text-emerald-300',
};

interface GuardState {
    contactName: string;
    channel: string;
    bantConfirmed: boolean;
    productSelected: boolean;
    dealValue: string;
    rmAssigned: string;
    approvalConfirmed: boolean;
}

function validateGuard(fromStage: Stage, guard: GuardState): string | null {
    if (fromStage === 'Prospecting') {
        if (!guard.contactName.trim()) return 'Contact name is required.';
        if (!guard.channel.trim()) return 'Channel must be specified.';
    }
    if (fromStage === 'Qualification') {
        if (!guard.bantConfirmed) return 'BANT checklist must be confirmed before advancing.';
    }
    if (fromStage === 'Needs Analysis') {
        if (!guard.productSelected) return 'At least one product must be selected.';
    }
    if (fromStage === 'Proposal') {
        if (!guard.dealValue || Number(guard.dealValue) <= 0) return 'Deal value must be greater than $0.';
        if (!guard.rmAssigned.trim()) return 'RM must be assigned.';
    }
    if (fromStage === 'Negotiation') {
        if (!guard.approvalConfirmed) return 'Senior approval must be confirmed.';
    }
    return null;
}

export interface OpportunityRecord {
    opportunity_id: string;
    opportunity_name?: string;
    title?: string;
    stage: string;
    projected_value?: number;
    probability_weighting?: number;
    probability?: number;
    customer_name?: string;
    expected_close_date?: string;
    updated_at?: string;
    customer_id?: string;
}

interface OpportunityKanbanProps {
    initialOpps: OpportunityRecord[];
}

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function OpportunityKanban({ initialOpps }: OpportunityKanbanProps) {
    const { data: swrData, mutate } = useSWR('/api/opportunities?limit=100', fetcher, { fallbackData: { data: initialOpps } });
    const opps = swrData?.data || [];
    const [advancing, setAdvancing] = useState<OpportunityRecord | null>(null);
    const [guard, setGuard] = useState<GuardState>({ contactName: '', channel: '', bantConfirmed: false, productSelected: false, dealValue: '', rmAssigned: '', approvalConfirmed: false });
    const [guardError, setGuardError] = useState('');
    const [saving, setSaving] = useState(false);
    const [closingOpp, setClosingOpp] = useState<OpportunityRecord | null>(null);
    const [detailOpp, setDetailOpp] = useState<OpportunityRecord | null>(null);

    // Real-time: pipeline sync across tabs/users
    useRealtimeChannel('pipeline', 'UPDATE_opportunity', () => {
        mutate();
    });

    const formatValue = (v?: number) => {
        if (!v) return '$0';
        if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
        if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}k`;
        return `$${v}`;
    };

    const openAdvance = useCallback((opp: OpportunityRecord) => {
        setAdvancing(opp);
        setGuard({ contactName: '', channel: '', bantConfirmed: false, productSelected: false, dealValue: String(opp.projected_value || ''), rmAssigned: '', approvalConfirmed: false });
        setGuardError('');
    }, []);

    const confirmAdvance = async () => {
        if (!advancing) return;
        const currentIdx = STAGES.indexOf(advancing.stage as Stage);
        if (currentIdx < 0 || currentIdx >= STAGES.length - 1) return;
        const fromStage = STAGES[currentIdx];
        const err = validateGuard(fromStage, guard);
        if (err) { setGuardError(err); return; }

        setSaving(true);
        const nextStage = STAGES[currentIdx + 1];
        try {
            const res = await fetch('/api/opportunities/update-stage', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ opportunity_id: advancing.opportunity_id, stage: nextStage })
            });
            if (res.ok) {
                const updatedOpps = opps.map((o: OpportunityRecord) => o.opportunity_id === advancing.opportunity_id ? { ...o, stage: nextStage } : o);
                mutate({ ...swrData, data: updatedOpps }, false);
                toast.success(`Moved to ${nextStage}`, { description: advancing.opportunity_name || advancing.title });
                setAdvancing(null);
            } else {
                const err = await res.json();
                toast.error("Stage update failed", { description: err.error });
            }
        } catch { toast.error("Network error"); }
        finally { setSaving(false); }
    };

    const handleWinLoss = async (data: { outcome: 'Won' | 'Lost'; reason: string; finalValue: number; notes: string }) => {
        if (!closingOpp) return;
        const newStage = data.outcome === 'Won' ? 'Completed' : 'Closed-Lost';
        try {
            const res = await fetch('/api/opportunities/update-stage', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    opportunity_id: closingOpp.opportunity_id,
                    stage: newStage,
                    win_loss_reason: data.reason,
                    closed_at: new Date().toISOString(),
                    final_value: data.finalValue,
                })
            });
            if (res.ok) {
                const updatedOpps = opps.filter((o: OpportunityRecord) => o.opportunity_id !== closingOpp.opportunity_id);
                mutate({ ...swrData, data: updatedOpps }, false);
                toast.success(`Deal ${data.outcome}!`, { description: `${closingOpp.opportunity_name || closingOpp.title} — ${data.reason}` });
                setClosingOpp(null);
            } else {
                const err = await res.json();
                toast.error("Close failed", { description: err.error });
            }
        } catch { toast.error("Network error"); }
    };

    const activeOpps = opps.filter((o: OpportunityRecord) => !['Closed-Won', 'Closed-Lost'].includes(o.stage));

    return (
        <>
            <div className="overflow-x-auto pb-4">
                <div className="inline-flex gap-4 min-w-max">
                    {STAGES.map((stage, stageIdx) => {
                        const colOpps = activeOpps.filter((o: OpportunityRecord) => o.stage === stage);
                        const colValue = colOpps.reduce((s: number, o: OpportunityRecord) => s + (o.projected_value || 0), 0);
                        return (
                            <div key={stage} className={`w-64 flex-shrink-0 border rounded-xl ${STAGE_COLORS[stage]} overflow-hidden`}>
                                <div className="px-3 py-2.5 border-b border-slate-800 flex items-center justify-between">
                                    <div>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STAGE_BADGE[stage]}`}>{stage}</span>
                                        <p className="text-[10px] text-slate-500 mt-0.5">{colOpps.length} deals · {formatValue(colValue)}</p>
                                    </div>
                                    {stageIdx < STAGES.length - 1 && <ChevronRight className="h-3.5 w-3.5 text-slate-600" />}
                                </div>
                                <div className="p-2 space-y-2 max-h-[520px] overflow-y-auto">
                                    {colOpps.length === 0 && (
                                        <p className="text-center text-slate-600 text-xs py-6">No deals</p>
                                    )}
                                    {colOpps.map((opp: OpportunityRecord) => {
                                        const isAging = opp.updated_at && (Date.now() - new Date(opp.updated_at).getTime()) > 21 * 86400 * 1000;
                                        const name = opp.opportunity_name || opp.title || 'Unnamed';
                                        const prob = opp.probability_weighting || opp.probability || 0;
                                        return (
                                            <div
                                                key={opp.opportunity_id}
                                                className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 hover:border-slate-600 transition-colors cursor-pointer"
                                                onClick={() => setDetailOpp(opp)}
                                            >
                                                <div className="flex items-start justify-between gap-1 mb-2">
                                                    <p className="text-xs font-semibold text-slate-100 leading-tight line-clamp-2">{name}</p>
                                                    {isAging && <AlertTriangle className="h-3 w-3 text-amber-400 shrink-0 mt-0.5" />}
                                                </div>
                                                <p className="text-[10px] text-slate-500 mb-2">{opp.customer_name || '—'}</p>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <DollarSign className="h-3 w-3 text-slate-500" />
                                                    <span className="text-xs font-mono text-slate-300">{formatValue(opp.projected_value)}</span>
                                                    <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                                                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${prob}%` }} />
                                                    </div>
                                                    <span className="text-[10px] text-slate-500">{prob}%</span>
                                                </div>
                                                {opp.expected_close_date && (
                                                    <p className="text-[10px] text-slate-600 flex items-center gap-1 mb-2">
                                                        <Clock className="h-2.5 w-2.5" />
                                                        {fmtDate(opp.expected_close_date)}
                                                    </p>
                                                )}
                                                <div className="flex gap-1.5 mt-2" onClick={(e) => e.stopPropagation()}>
                                                    {stageIdx < STAGES.length - 1 && (
                                                        <Button size="sm" className="flex-1 h-6 text-[10px] bg-indigo-600/80 hover:bg-indigo-600" onClick={() => openAdvance(opp)}>
                                                            Advance ▶
                                                        </Button>
                                                    )}
                                                    {stage === 'Negotiation' && (
                                                        <Button size="sm" variant="outline" className="h-6 text-[10px] border-slate-700 text-slate-300 hover:bg-slate-800" onClick={() => setClosingOpp(opp)}>
                                                            Close
                                                        </Button>
                                                    )}
                                                    {stage === 'Completed' && (
                                                        <Button size="sm" className="flex-1 h-6 text-[10px] bg-emerald-700 hover:bg-emerald-600" onClick={() => setClosingOpp(opp)}>
                                                            Mark Won/Lost
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Stage Advance Modal */}
            {advancing && (() => {
                const idx = STAGES.indexOf(advancing.stage as Stage);
                const from = STAGES[idx];
                const to = STAGES[idx + 1];
                return (
                    <Dialog open onOpenChange={() => setAdvancing(null)}>
                        <DialogContent className="bg-slate-900 border-slate-700 text-slate-100 sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle className="text-white">Advance Stage</DialogTitle>
                                <p className="text-sm text-slate-400">{advancing.opportunity_name || advancing.title} · {from} → {to}</p>
                            </DialogHeader>
                            <div className="space-y-4 py-2">
                                {from === 'Prospecting' && <>
                                    <div className="space-y-1"><Label className="text-xs text-slate-300">Contact Name *</Label>
                                        <Input value={guard.contactName} onChange={e => setGuard(p => ({ ...p, contactName: e.target.value }))} className="bg-slate-950 border-slate-700 text-slate-100" placeholder="Primary decision-maker" /></div>
                                    <div className="space-y-1"><Label className="text-xs text-slate-300">Acquisition Channel *</Label>
                                        <Input value={guard.channel} onChange={e => setGuard(p => ({ ...p, channel: e.target.value }))} className="bg-slate-950 border-slate-700 text-slate-100" placeholder="Branch / Web / Referral" /></div>
                                </>}
                                {from === 'Qualification' && (
                                    <div className="flex items-center gap-2 border border-slate-700 rounded p-3">
                                        <Checkbox id="bant-confirm" checked={guard.bantConfirmed} onCheckedChange={v => setGuard(p => ({ ...p, bantConfirmed: Boolean(v) }))} />
                                        <label htmlFor="bant-confirm" className="text-sm text-slate-300 cursor-pointer">BANT checklist fully confirmed for this lead</label>
                                    </div>
                                )}
                                {from === 'Needs Analysis' && (
                                    <div className="flex items-center gap-2 border border-slate-700 rounded p-3">
                                        <Checkbox id="prod-confirm" checked={guard.productSelected} onCheckedChange={v => setGuard(p => ({ ...p, productSelected: Boolean(v) }))} />
                                        <label htmlFor="prod-confirm" className="text-sm text-slate-300 cursor-pointer">At least one product identified and documented</label>
                                    </div>
                                )}
                                {from === 'Proposal' && <>
                                    <div className="space-y-1"><Label className="text-xs text-slate-300">Deal Value ($) *</Label>
                                        <Input value={guard.dealValue} onChange={e => setGuard(p => ({ ...p, dealValue: e.target.value }))} className="bg-slate-950 border-slate-700 text-slate-100" type="number" min="1" /></div>
                                    <div className="space-y-1"><Label className="text-xs text-slate-300">Assigned RM *</Label>
                                        <Input value={guard.rmAssigned} onChange={e => setGuard(p => ({ ...p, rmAssigned: e.target.value }))} className="bg-slate-950 border-slate-700 text-slate-100" placeholder="RM full name" /></div>
                                </>}
                                {from === 'Negotiation' && (
                                    <div className="flex items-center gap-2 border border-slate-700 rounded p-3">
                                        <Checkbox id="approval-confirm" checked={guard.approvalConfirmed} onCheckedChange={v => setGuard(p => ({ ...p, approvalConfirmed: Boolean(v) }))} />
                                        <label htmlFor="approval-confirm" className="text-sm text-slate-300 cursor-pointer">Senior RM / Team Lead approval obtained</label>
                                    </div>
                                )}
                                {guardError && (
                                    <div className="flex items-center gap-2 text-amber-300 bg-amber-900/20 border border-amber-700/30 rounded p-2 text-xs">
                                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />{guardError}
                                    </div>
                                )}
                            </div>
                            <DialogFooter>
                                <Button variant="outline" className="border-slate-700 text-slate-300" onClick={() => setAdvancing(null)}>Cancel</Button>
                                <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={confirmAdvance} disabled={saving}>
                                    {saving ? 'Saving…' : `Advance to ${to}`}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                );
            })()}

            {/* Win/Loss Panel */}
            {closingOpp && (
                <WinLossPanel
                    opp={closingOpp}
                    onClose={() => setClosingOpp(null)}
                    onSubmit={handleWinLoss}
                />
            )}

            {/* Deal Detail View */}
            <DealDetailSheet
                open={!!detailOpp}
                onOpenChange={(op) => !op && setDetailOpp(null)}
                opp={detailOpp}
            />
        </>
    );
}
