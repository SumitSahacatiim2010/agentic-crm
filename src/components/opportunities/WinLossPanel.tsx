"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trophy, X } from "lucide-react";

const WIN_LOSS_REASONS = [
    'Best Product Fit', 'Strong Relationship', 'Competitive Pricing', 'Fast Processing',
    'Price Too High', 'Product Gap', 'Competitor Won', 'Client Withdrew',
    'Timing Not Right', 'Credit Declined', 'Regulatory Constraint', 'Internal Procedure'
];

interface WinLossPanelProps {
    opp: { opportunity_id: string; opportunity_name?: string; title?: string; projected_value?: number };
    onClose: () => void;
    onSubmit: (data: { outcome: 'Won' | 'Lost'; reason: string; finalValue: number; notes: string }) => Promise<void>;
}

export function WinLossPanel({ opp, onClose, onSubmit }: WinLossPanelProps) {
    const [outcome, setOutcome] = useState<'Won' | 'Lost' | null>(null);
    const [reason, setReason] = useState('');
    const [competitor, setCompetitor] = useState('');
    const [finalValue, setFinalValue] = useState(String(opp.projected_value || ''));
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const canSubmit = outcome && reason;

    const handleSubmit = async () => {
        if (!outcome || !reason) return;
        setSubmitting(true);
        await onSubmit({
            outcome,
            reason: competitor ? `${reason} (vs ${competitor})` : reason,
            finalValue: Number(finalValue) || 0,
            notes,
        });
        setSubmitting(false);
    };

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="bg-slate-900 border-slate-700 text-slate-100 sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-white">
                        <Trophy className="h-5 w-5 text-amber-400" />
                        Close Deal
                    </DialogTitle>
                    <p className="text-sm text-slate-400">{opp.opportunity_name || opp.title}</p>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Outcome */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            className={`rounded-xl p-4 border-2 text-center transition-all ${outcome === 'Won' ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300' : 'border-slate-700 text-slate-400 hover:border-slate-600'}`}
                            onClick={() => setOutcome('Won')}
                        >
                            <span className="text-2xl block mb-1">🏆</span>
                            <span className="font-bold text-sm">Won</span>
                        </button>
                        <button
                            className={`rounded-xl p-4 border-2 text-center transition-all ${outcome === 'Lost' ? 'border-red-500 bg-red-950/40 text-red-300' : 'border-slate-700 text-slate-400 hover:border-slate-600'}`}
                            onClick={() => setOutcome('Lost')}
                        >
                            <span className="text-2xl block mb-1">❌</span>
                            <span className="font-bold text-sm">Lost</span>
                        </button>
                    </div>

                    {/* Primary reason */}
                    <div className="space-y-1">
                        <Label className="text-xs text-slate-300">Primary Reason *</Label>
                        <select value={reason} onChange={e => setReason(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-md h-9 px-3 text-sm text-slate-200">
                            <option value="">— Select reason —</option>
                            {WIN_LOSS_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs text-slate-300">Competitor (optional)</Label>
                            <Input value={competitor} onChange={e => setCompetitor(e.target.value)}
                                className="bg-slate-950 border-slate-700 text-slate-100" placeholder="Competitor name" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-slate-300">Final Deal Value ($)</Label>
                            <Input value={finalValue} onChange={e => setFinalValue(e.target.value)}
                                className="bg-slate-950 border-slate-700 text-slate-100" type="number" />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-xs text-slate-300">RM Notes (optional)</Label>
                        <Textarea value={notes} onChange={e => setNotes(e.target.value)}
                            className="bg-slate-950 border-slate-700 text-slate-100 resize-none" rows={2}
                            placeholder="Key observations, next steps for account team…" />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" className="border-slate-700 text-slate-300" onClick={onClose}>Cancel</Button>
                    <Button
                        className={canSubmit ? (outcome === 'Won' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-700 hover:bg-red-600') : 'bg-slate-700 opacity-50 cursor-not-allowed'}
                        onClick={handleSubmit} disabled={!canSubmit || submitting}
                    >
                        {submitting ? 'Submitting…' : `Submit ${outcome || ''}`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
