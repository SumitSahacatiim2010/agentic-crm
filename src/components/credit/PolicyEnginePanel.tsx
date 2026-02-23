"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle2, AlertTriangle, XCircle, ShieldCheck, History } from "lucide-react";
import { fmtDateTime } from "@/lib/date-utils";

interface Props { applicationId: string; onEvaluated: (decision: string) => void; }

export function PolicyEnginePanel({ applicationId, onEvaluated }: Props) {
    const [result, setResult] = useState<any>(null);
    const [adverse, setAdverse] = useState<any>(null);
    const [running, setRunning] = useState(false);

    // T4.3.3: Manual decision logic & audit history
    const [notes, setNotes] = useState("");
    const [submittingAction, setSubmittingAction] = useState(false);
    const [auditHistory, setAuditHistory] = useState<any[]>([]);
    const [showAudit, setShowAudit] = useState(false);

    const loadAuditHistory = async () => {
        try {
            const res = await fetch(`/api/credit/audit?entity_id=${applicationId}`);
            if (res.ok) setAuditHistory(await res.json());
        } catch { }
    };

    const run = async () => {
        setRunning(true);
        try {
            const res = await fetch('/api/credit/evaluate-policy', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ application_id: applicationId }),
            });
            const json = await res.json();
            if (res.ok) {
                setResult(json);
                onEvaluated(json.decision);
                if (json.decision === 'decline') {
                    // Fetch adverse action
                    const advRes = await fetch('/api/credit/generate-adverse-action', {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ application_id: applicationId, decline_codes: json.hardStops.map((h: any) => h.declineCode) }),
                    });
                    if (advRes.ok) setAdverse(await advRes.json());
                }
                toast.success(`Policy decision: ${json.decision.toUpperCase()}`);
            } else toast.error(json.error);
        } catch { toast.error('Network error'); }
        setRunning(false);
    };

    const decisionColors: Record<string, string> = { approve: 'bg-emerald-950/40 border-emerald-700/40 text-emerald-300', refer: 'bg-amber-950/40 border-amber-700/40 text-amber-300', decline: 'bg-red-950/40 border-red-700/40 text-red-300' };
    const decisionIcons: Record<string, any> = { approve: <CheckCircle2 className="h-5 w-5" />, refer: <AlertTriangle className="h-5 w-5" />, decline: <XCircle className="h-5 w-5" /> };

    if (!result) return (
        <div className="flex flex-col items-center gap-4 py-12">
            <ShieldCheck className="h-10 w-10 text-slate-700" />
            <p className="text-sm text-slate-400">Run policy engine to evaluate this application</p>
            <Button className="bg-indigo-600 hover:bg-indigo-700" disabled={running} onClick={run}>{running ? 'Evaluating…' : '⚡ Run Policy Check'}</Button>
        </div>
    );

    const handleManualDecision = async (action: 'Approve' | 'Decline' | 'Counter_Offer') => {
        setSubmittingAction(true);
        try {
            const res = await fetch('/api/credit/decision', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ application_id: applicationId, action, notes }),
            });
            if (res.ok) {
                toast.success(`Application marked as ${action.replace('_', ' ')}`);
                onEvaluated(action === 'Counter_Offer' ? 'refer' : action.toLowerCase());
                setNotes("");
                if (showAudit) loadAuditHistory();
            } else {
                const json = await res.json();
                toast.error(json.error);
            }
        } catch { toast.error("Error submitting manual decision"); }
        setSubmittingAction(false);
    };

    return (
        <div className="space-y-4">
            {/* Decision banner */}
            <div className={`flex items-center gap-3 p-4 rounded-xl border ${decisionColors[result.decision]}`}>
                {decisionIcons[result.decision]}
                <div><p className="font-bold text-sm uppercase">Decision: {result.decision}</p></div>
            </div>

            {/* Hard stops */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Hard Stops ({result.hardStops.length})</p>
                {result.hardStops.length === 0 && <p className="text-xs text-slate-600">None triggered</p>}
                {result.hardStops.map((h: any) => (
                    <div key={h.id} className="flex items-start gap-2 p-2 bg-red-950/20 border border-red-800/30 rounded-lg text-xs text-red-300">
                        <XCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        <div><span className="font-mono font-bold">{h.id}:</span> {h.label} — <span className="font-mono">{h.declineCode}</span></div>
                    </div>
                ))}
            </div>

            {/* Soft exceptions */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Soft Exceptions ({result.softExceptions.length})</p>
                {result.softExceptions.length === 0 && <p className="text-xs text-slate-600">None triggered</p>}
                {result.softExceptions.map((s: any) => (
                    <div key={s.id} className="flex items-start gap-2 p-2 bg-amber-950/20 border border-amber-800/30 rounded-lg text-xs text-amber-300">
                        <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        <div><span className="font-mono font-bold">{s.id}:</span> {s.label}<br /><span className="text-amber-400/70">→ {s.requiredAction}</span></div>
                    </div>
                ))}
            </div>

            {/* Adverse action */}
            {adverse && (
                <div className="bg-red-950/30 border border-red-700/40 rounded-xl p-4 space-y-3">
                    <p className="text-xs font-bold text-red-300 uppercase tracking-wide">⚠️ Adverse Action Notice</p>
                    <pre className="text-xs text-red-200/80 whitespace-pre-wrap font-sans">{adverse.reason}</pre>
                    <p className="text-[10px] text-red-400/60">{adverse.bureau}</p>
                    <p className="text-[10px] text-red-400/60 italic">{adverse.ecoa}</p>
                </div>
            )}

            <Button variant="outline" className="border-slate-700 text-slate-400" onClick={run} disabled={running}>🔄 Re-run Policy</Button>

            {/* T4.3.3 Manual Decisioning */}
            <div className="border border-slate-800 rounded-xl p-4 space-y-3 bg-slate-900/50 mt-4">
                <h3 className="text-sm font-semibold text-slate-200">Manual Underwriter Decision</h3>
                <textarea
                    className="w-full bg-slate-950 border border-slate-700 rounded-md p-2 text-xs text-slate-300"
                    placeholder="Enter justification notes..."
                    rows={2}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                />
                <div className="flex gap-2">
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs" disabled={submittingAction} onClick={() => handleManualDecision('Approve')}>
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve
                    </Button>
                    <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-xs" disabled={submittingAction} onClick={() => handleManualDecision('Counter_Offer')}>
                        <AlertTriangle className="h-3.5 w-3.5 mr-1" /> Counter Offer
                    </Button>
                    <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-xs" disabled={submittingAction} onClick={() => handleManualDecision('Decline')}>
                        <XCircle className="h-3.5 w-3.5 mr-1" /> Decline
                    </Button>
                </div>
            </div>

            {/* Audit History */}
            <div className="mt-4">
                <Button variant="ghost" className="text-slate-400 text-xs w-full justify-between border-t border-slate-800 pt-3" onClick={() => {
                    const next = !showAudit;
                    setShowAudit(next);
                    if (next) loadAuditHistory();
                }}>
                    <span className="flex items-center gap-1"><History className="h-3.5 w-3.5" /> View Audit History</span>
                    <span>{showAudit ? 'Hide' : 'Show'}</span>
                </Button>
                {showAudit && (
                    <div className="mt-3 space-y-2 max-h-40 overflow-y-auto pr-2">
                        {auditHistory.length === 0 && <p className="text-xs text-slate-500 italic">No manual decisions recorded.</p>}
                        {auditHistory.map(a => (
                            <div key={a.audit_id} className="text-[10px] p-2 bg-slate-950 rounded border border-slate-800 flex justify-between">
                                <div>
                                    <span className="font-bold text-slate-300">{a.action.replace('decision_', '').toUpperCase()}</span>
                                    <p className="text-slate-500 mt-1">{a.reason}</p>
                                </div>
                                <div className="text-right text-slate-600">
                                    <p>{fmtDateTime(a.timestamp)}</p>
                                    <p>{a.actor_persona}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
