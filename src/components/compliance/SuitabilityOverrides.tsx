"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { fmtDateTime } from "@/lib/date-utils";

interface SuitItem {
    result_id: string; application_id: string; rule_id: string;
    required_action?: string; evaluated_at: string;
}

export function SuitabilityOverrides({ items, onRefresh }: { items: SuitItem[]; onRefresh: () => void }) {
    const [acting, setActing] = useState<string | null>(null);

    const handleOverride = async (item: SuitItem, approved: boolean) => {
        setActing(item.result_id);
        const res = await fetch('/api/compliance/resolve', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                entity_type: 'credit_application', entity_id: item.application_id,
                resolution_type: approved ? 'override_approved' : 'override_denied',
                notes: approved ? 'Documentation reviewed and approved for soft exception override.' : 'Override denied — insufficient documentation.',
            }),
        });
        if (res.ok) { toast.success(approved ? 'Override approved' : 'Override denied'); onRefresh(); }
        else { const j = await res.json(); toast.error(j.error); }
        setActing(null);
    };

    if (!items.length) return <p className="text-sm text-slate-600 text-center py-8">No pending suitability exceptions</p>;

    return (
        <div className="space-y-3">
            {items.map(item => (
                <div key={item.result_id} className="bg-slate-900 border border-amber-800/30 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] px-1.5 py-0.5 bg-amber-950/40 text-amber-300 border border-amber-700/30 rounded font-bold">{item.rule_id}</span>
                        <span className="text-sm font-semibold text-slate-200">Soft Exception Pending</span>
                    </div>
                    <div className="text-xs space-y-1">
                        <p className="text-slate-500">App ID: <span className="font-mono text-slate-400">{item.application_id.slice(0, 12)}…</span></p>
                        <p className="text-amber-300/80">→ Required: {item.required_action ?? '—'}</p>
                        <p className="text-slate-600">Evaluated: {fmtDateTime(item.evaluated_at)}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button size="sm" className="bg-emerald-700 hover:bg-emerald-600 text-xs h-7" disabled={acting === item.result_id} onClick={() => handleOverride(item, true)}>✅ Approve Override</Button>
                        <Button size="sm" className="bg-red-900 hover:bg-red-800 text-xs h-7" disabled={acting === item.result_id} onClick={() => handleOverride(item, false)}>❌ Deny Override</Button>
                    </div>
                </div>
            ))}
        </div>
    );
}
