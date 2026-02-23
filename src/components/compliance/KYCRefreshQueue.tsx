"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { fmtDate } from "@/lib/date-utils";

interface KYCItem {
    compliance_id: string; party_id: string; kyc_status: string;
    kyc_last_review?: string; kyc_next_review?: string;
    aml_risk_rating?: string; pep_status?: boolean; fatca_crs_status?: string;
}

export function KYCRefreshQueue({ items, onRefresh }: { items: KYCItem[]; onRefresh: () => void }) {
    const [refreshing, setRefreshing] = useState<string | null>(null);

    const handleRefresh = async (item: KYCItem) => {
        setRefreshing(item.compliance_id);
        try {
            const res = await fetch('/api/compliance/resolve', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ entity_type: 'compliance_profile', entity_id: item.compliance_id, resolution_type: 'kyc_refreshed', notes: 'KYC refresh completed by compliance officer' }),
            });
            if (res.ok) { toast.success('KYC marked as refreshed'); onRefresh(); }
            else { const j = await res.json(); toast.error(j.error); }
        } catch { toast.error('Network error'); }
        setRefreshing(null);
    };

    const isOverdue = (d?: string) => d ? new Date(d) < new Date() : false;
    const riskColor: Record<string, string> = { High: 'text-red-400', Medium: 'text-amber-400', Low: 'text-emerald-400' };

    if (items.length === 0) return <p className="text-sm text-slate-600 text-center py-8">No KYC reviews due in the next 30 days</p>;

    return (
        <div className="space-y-3">
            {items.map(item => (
                <div key={item.compliance_id} className={`bg-slate-900 border rounded-xl p-4 space-y-3 ${isOverdue(item.kyc_next_review) ? 'border-red-800/40' : 'border-slate-800'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {isOverdue(item.kyc_next_review)
                                ? <span className="text-[9px] px-1.5 py-0.5 bg-red-950/50 text-red-300 border border-red-700/30 rounded font-bold">OVERDUE</span>
                                : <span className="text-[9px] px-1.5 py-0.5 bg-amber-950/50 text-amber-300 border border-amber-700/30 rounded font-bold">DUE SOON</span>}
                            <span className="font-mono text-xs text-slate-400">{item.party_id?.slice(0, 12)}…</span>
                        </div>
                        <span className={`text-xs font-bold ${riskColor[item.aml_risk_rating ?? 'Low'] ?? 'text-slate-400'}`}>
                            AML: {item.aml_risk_rating ?? '—'}
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-500">
                        <span>KYC Status: <span className="text-slate-300">{item.kyc_status}</span></span>
                        <span>PEP: <span className={item.pep_status ? 'text-red-400' : 'text-slate-400'}>{item.pep_status ? 'Yes' : 'No'}</span></span>
                        <span>Last Review: {fmtDate(item.kyc_last_review)}</span>
                        <span>Next Due: {fmtDate(item.kyc_next_review)}</span>
                        <span>FATCA/CRS: {item.fatca_crs_status ?? '—'}</span>
                    </div>
                    <div className="flex gap-2">
                        <Button size="sm" className="bg-emerald-700 hover:bg-emerald-600 text-xs h-7"
                            disabled={refreshing === item.compliance_id} onClick={() => handleRefresh(item)}>
                            {refreshing === item.compliance_id ? 'Refreshing…' : '✓ Mark Refreshed'}
                        </Button>
                        <Button size="sm" variant="outline" className="border-slate-700 text-slate-400 text-xs h-7">📧 Send Reminder</Button>
                    </div>
                </div>
            ))}
        </div>
    );
}
