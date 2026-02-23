"use client";
import { useState } from "react";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FalsePositiveResolutionSheet } from "./FalsePositiveResolutionSheet";
import { fmtDate, fmtDateTime } from "@/lib/date-utils";

interface AMLHit {
    application_id: string; full_name?: string; sanctions_outcome: string;
    sanctions_score?: number; sanctions_screened_at?: string; status?: string; preventive_control_log?: string;
}
interface AMLCase {
    case_id: string; subject: string; status: string; priority_band: string; created_at: string;
}

export function AMLHitQueue({ hits, cases, onRefresh }: { hits: AMLHit[]; cases: AMLCase[]; onRefresh: () => void }) {
    const [resolving, setResolving] = useState<AMLHit | null>(null);
    const [viewing, setViewing] = useState<AMLHit | null>(null);

    const badgeColor = (outcome: string) =>
        outcome === 'HIT' ? 'bg-red-950/50 text-red-300 border-red-700/40' : 'bg-amber-950/50 text-amber-300 border-amber-700/40';

    return (
        <div className="space-y-3">
            {resolving && (
                <FalsePositiveResolutionSheet entityType="onboarding_application" entityId={resolving.application_id}
                    fullName={resolving.full_name} onResolved={() => { setResolving(null); onRefresh(); }} onClose={() => setResolving(null)} />
            )}

            {viewing && (
                <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-sm" onClick={() => setViewing(null)}>
                    <div className="bg-slate-900 border-l border-slate-700 w-full max-w-md h-full shadow-2xl p-6 overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-lg font-bold text-white">Compliance Hit Profile</h2>
                                <p className="text-xs text-slate-500">ID: {viewing.application_id}</p>
                            </div>
                            <button onClick={() => setViewing(null)} className="text-slate-500 hover:text-white text-xl">×</button>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                                <h3 className="text-sm font-semibold text-slate-300">Subject Identity</h3>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <span className="text-slate-500">Full Name</span>
                                    <span className="text-white font-medium text-right">{viewing.full_name || '—'}</span>
                                    <span className="text-slate-500">Screening Status</span>
                                    <span className="text-white font-medium text-right capitalize">{viewing.status || '—'}</span>
                                </div>
                            </div>

                            <div className="bg-red-950/20 p-4 rounded-xl border border-red-900/30 space-y-3">
                                <h3 className="text-sm font-semibold text-red-400">Match Details</h3>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <span className="text-slate-500">Sanctions Outcome</span>
                                    <span className="text-red-400 font-bold text-right">{viewing.sanctions_outcome || '—'}</span>
                                    <span className="text-slate-500">Match Score</span>
                                    <span className="text-red-400 font-mono text-right">{viewing.sanctions_score ?? '—'}</span>
                                    <span className="text-slate-500">Screened At</span>
                                    <span className="text-white font-medium text-right">{fmtDateTime(viewing.sanctions_screened_at)}</span>
                                </div>
                            </div>

                            {viewing.preventive_control_log && (
                                <div className="bg-amber-950/20 p-4 rounded-xl border border-amber-900/30 space-y-2">
                                    <h3 className="text-sm font-semibold text-amber-400">Preventive Controls Log</h3>
                                    <p className="text-xs text-amber-300/80 font-mono p-2 bg-amber-950/50 rounded whitespace-pre-wrap">{viewing.preventive_control_log}</p>
                                </div>
                            )}

                            <div className="pt-4 space-y-3">
                                <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={() => { setResolving(viewing); setViewing(null); }}>
                                    ✅ Resolve False Positive / True Match
                                </Button>
                                <Button className="w-full" variant="outline" onClick={() => setViewing(null)}>Close</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Onboarding sanctions hits */}
            {hits.length === 0 && cases.length === 0 && (
                <p className="text-sm text-slate-600 text-center py-8">No active AML hits</p>
            )}

            {hits.map(h => (
                <div key={h.application_id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold ${badgeColor(h.sanctions_outcome)}`}>{h.sanctions_outcome}</span>
                            <ShieldAlert className="h-3.5 w-3.5 text-red-400" />
                            <span className="font-semibold text-sm text-white">{h.full_name ?? 'Unknown Applicant'}</span>
                        </div>
                        {h.sanctions_score != null && <span className="text-xs text-slate-500 font-mono">Score: {h.sanctions_score}</span>}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500">
                        <span>Onboarding ID: <span className="font-mono text-slate-400">{h.application_id.slice(0, 8)}</span></span>
                        <span>Status: <span className="text-slate-300">{h.status ?? '—'}</span></span>
                        {h.sanctions_screened_at && <span>Screened: {fmtDateTime(h.sanctions_screened_at)}</span>}
                        {h.preventive_control_log && <span className="text-red-400">⚠ Preventive Control Active</span>}
                    </div>
                    <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="border-slate-700 text-slate-400 text-xs h-7 hover:text-white" onClick={() => setViewing(h)}>
                            🔍 Review Details
                        </Button>
                        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-xs h-7" onClick={() => setResolving(h)}>✅ Resolve</Button>
                    </div>
                </div>
            ))}

            {/* Regulatory service cases */}
            {cases.map(c => (
                <div key={c.case_id} className="bg-slate-900 border border-amber-800/30 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                        <span className="text-[9px] px-1.5 py-0.5 bg-amber-950/40 text-amber-300 border border-amber-700/30 rounded font-bold">{c.priority_band}</span>
                        <span className="font-semibold text-sm text-slate-200">{c.subject}</span>
                    </div>
                    <div className="flex gap-4 text-[10px] text-slate-500">
                        <span>Case: <span className="font-mono text-slate-400">{c.case_id.slice(0, 8)}</span></span>
                        <span>Status: <span className="text-slate-300">{c.status}</span></span>
                        <span>{fmtDate(c.created_at)}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
