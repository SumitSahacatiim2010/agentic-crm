"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle2, AlertTriangle, ArrowUp } from "lucide-react";

const RESOLUTION_TYPES = [
    { value: 'false_positive', label: '✅ False Positive — Clear Match', description: 'Unblocks onboarding and closes the compliance case. Use when the match is a confirmed different individual.', color: 'emerald' },
    { value: 'true_match', label: '🛑 True Match — Maintain Block', description: 'Maintains the block. Adds SAR reference. Application remains locked.', color: 'red' },
    { value: 'escalate_sar', label: '⬆️ Escalate — File SAR', description: 'Creates a new P1 regulatory case for SAR filing with FinCEN/NCA.', color: 'amber' },
];

interface Props {
    entityType: string; entityId: string; fullName?: string;
    onResolved: () => void; onClose: () => void;
}

export function FalsePositiveResolutionSheet({ entityType, entityId, fullName, onResolved, onClose }: Props) {
    const [type, setType] = useState('');
    const [notes, setNotes] = useState('');
    const [evidence, setEvidence] = useState('');
    const [sarRef, setSarRef] = useState('');
    const [submitting, setSub] = useState(false);

    const handleSubmit = async () => {
        if (!type) { toast.error('Select a resolution type'); return; }
        if (!notes.trim()) { toast.error('Notes are required'); return; }
        setSub(true);
        try {
            const res = await fetch('/api/compliance/resolve', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ entity_type: entityType, entity_id: entityId, resolution_type: type, notes, evidence_ref: evidence, sar_reference: sarRef }),
            });
            const json = await res.json();
            if (res.ok) { toast.success(`Resolution recorded: ${type.replace('_', ' ')}`); onResolved(); }
            else toast.error(json.error);
        } catch { toast.error('Network error'); }
        setSub(false);
    };

    const colorMap: Record<string, string> = { emerald: 'border-emerald-600 bg-emerald-950/30', red: 'border-red-600 bg-red-950/30', amber: 'border-amber-600 bg-amber-950/30' };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg mx-4 shadow-2xl">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
                    <div>
                        <h3 className="font-bold text-white text-sm">Compliance Resolution</h3>
                        <p className="text-[10px] text-slate-500">{fullName ?? entityId.slice(0, 16)} · AML_CTF</p>
                    </div>
                    <button onClick={onClose} className="text-slate-600 hover:text-white text-xl">×</button>
                </div>
                <div className="p-5 space-y-4">
                    {/* Resolution types */}
                    <div className="space-y-2">
                        {RESOLUTION_TYPES.map(rt => (
                            <button key={rt.value} onClick={() => setType(rt.value)}
                                className={`w-full text-left p-3 rounded-xl border-2 transition-all ${type === rt.value ? colorMap[rt.color] : 'border-slate-800 hover:border-slate-700'}`}>
                                <p className="text-sm font-semibold text-slate-100">{rt.label}</p>
                                <p className="text-[10px] text-slate-500 mt-0.5">{rt.description}</p>
                            </button>
                        ))}
                    </div>
                    {/* Notes */}
                    <div className="space-y-1">
                        <label className="text-xs text-slate-400">Justification / Notes *</label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-slate-200 resize-none focus:outline-none focus:border-indigo-500" />
                    </div>
                    {/* Evidence ref */}
                    <div className="space-y-1">
                        <label className="text-xs text-slate-400">Evidence Reference (optional)</label>
                        <input value={evidence} onChange={e => setEvidence(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" placeholder="Doc ID, file ref..." />
                    </div>
                    {/* SAR reference — only for true_match / escalate_sar */}
                    {['true_match', 'escalate_sar'].includes(type) && (
                        <div className="space-y-1">
                            <label className="text-xs text-slate-400">SAR Reference</label>
                            <input value={sarRef} onChange={e => setSarRef(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" placeholder="SAR-YYYYMMDD-XXXX" />
                        </div>
                    )}
                </div>
                <div className="flex gap-2 px-5 pb-4">
                    <Button variant="outline" onClick={onClose} className="border-slate-700 text-slate-400 flex-1">Cancel</Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 flex-1" disabled={submitting || !type} onClick={handleSubmit}>
                        {submitting ? 'Submitting…' : 'Submit Resolution'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
