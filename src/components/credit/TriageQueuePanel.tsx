"use client";
import { useState, useMemo } from "react";
import { AlertTriangle } from "lucide-react";

const ROUTING_COLORS: Record<string, string> = { STP: 'bg-emerald-950/50 text-emerald-300 border-emerald-700/30', Standard: 'bg-indigo-950/50 text-indigo-300 border-indigo-700/30', Specialist: 'bg-amber-950/50 text-amber-300 border-amber-700/30' };
const STATUS_TABS = ['All', 'pending_triage', 'underwriting', 'approved', 'declined'];

export interface CreditApp {
    application_id: string; applicant_name: string; business_name?: string;
    loan_amount: number; product_type: string; purpose?: string;
    status: string; routing_path: string; risk_rating: number;
    credit_score: number; fraud_flag: boolean; created_at: string;
}

interface Props { apps: CreditApp[]; selectedId: string | null; onSelect: (a: CreditApp) => void; }

function fmt(n: number) { return n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `$${(n / 1_000).toFixed(0)}k` : `$${n}`; }

export function TriageQueuePanel({ apps, selectedId, onSelect }: Props) {
    const [statusFilter, setStatusFilter] = useState('All');
    const [routingFilter, setRoutingFilter] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');

    const filtered = useMemo(() => apps.filter(a => {
        if (statusFilter !== 'All' && a.status !== statusFilter) return false;
        if (routingFilter && a.routing_path !== routingFilter) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const n = a.applicant_name?.toLowerCase() || '';
            const b = a.business_name?.toLowerCase() || '';
            const ssnMatch = a.application_id.toLowerCase().includes(q); // Treating part of ID as SSN placeholder since schema lacks exact SSN
            if (!n.includes(q) && !b.includes(q) && !ssnMatch) return false;
        }
        return true;
    }), [apps, statusFilter, routingFilter, searchQuery]);

    return (
        <div className="flex flex-col h-full">
            {/* Search Input */}
            <div className="p-3 border-b border-slate-800">
                <input
                    type="text"
                    placeholder="Search Name or ID..."
                    className="w-full bg-slate-900 border border-slate-700 rounded h-8 px-3 text-xs text-slate-200"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
            </div>
            {/* Tabs */}
            <div className="flex gap-1 p-2 overflow-x-auto border-b border-slate-800">
                {STATUS_TABS.map(t => (
                    <button key={t} onClick={() => setStatusFilter(t)}
                        className={`text-[10px] px-2 py-1 rounded font-semibold whitespace-nowrap ${statusFilter === t ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
                        {t === 'All' ? 'All' : t.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </button>
                ))}
            </div>
            {/* Routing chips */}
            <div className="flex gap-1 px-2 py-1.5 border-b border-slate-800">
                {['', 'STP', 'Standard', 'Specialist'].map(r => (
                    <button key={r} onClick={() => setRoutingFilter(r)}
                        className={`text-[9px] px-2 py-0.5 rounded-full border font-bold ${routingFilter === r ? 'border-indigo-500 bg-indigo-950/40 text-indigo-300' : 'border-slate-700 text-slate-600 hover:text-slate-400'}`}>
                        {r || 'All Routes'}
                    </button>
                ))}
            </div>
            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50">
                {filtered.map(a => (
                    <button key={a.application_id} onClick={() => onSelect(a)}
                        className={`w-full text-left px-3 py-3 hover:bg-slate-800/50 transition-colors ${selectedId === a.application_id ? 'bg-indigo-950/30 border-l-2 border-indigo-500' : ''}`}>
                        <div className="flex items-center justify-between mb-1">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold ${ROUTING_COLORS[a.routing_path] || ''}`}>{a.routing_path}</span>
                            <span className="text-xs font-bold text-white">{fmt(Number(a.loan_amount))}</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-200 truncate">{a.applicant_name}{a.business_name ? ` · ${a.business_name}` : ''}</p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                            <span>{a.product_type.replace(/_/g, ' ')}</span>
                            <span>·</span>
                            <span>ORR-{a.risk_rating}</span>
                            <span>·</span>
                            <span>FICO {a.credit_score}</span>
                            {a.fraud_flag && <span className="flex items-center gap-0.5 text-red-400"><AlertTriangle className="h-2.5 w-2.5" />⚠</span>}
                        </div>
                    </button>
                ))}
                {filtered.length === 0 && <p className="p-4 text-xs text-slate-600 text-center">No applications match filters</p>}
            </div>
            <div className="px-3 py-2 border-t border-slate-800 text-[10px] text-slate-600">{filtered.length} of {apps.length} applications</div>
        </div>
    );
}
