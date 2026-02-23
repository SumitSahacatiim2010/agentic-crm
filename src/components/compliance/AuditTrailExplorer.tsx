"use client";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { fmtDateTime } from "@/lib/date-utils";

const ENTITIES = ['', 'onboarding_applications', 'credit_applications', 'service_cases', 'compliance_profiles', 'credit_offers'];
const ACTORS = ['', 'SYSTEM', 'COMPLIANCE_OFFICER', 'CREDIT_ANALYST', 'RM'];
const ACTION_CLS = ['', 'CREATE', 'UPDATE', 'DELETE', 'RESOLVE', 'ESCALATE', 'APPROVE', 'DECLINE'];
const DOMAINS = ['', 'AML_CTF', 'GDPR', 'CONSUMER_PROTECTION', 'CREDIT', 'GENERAL'];
const DOMAIN_COLORS: Record<string, string> = { AML_CTF: 'text-red-400', GDPR: 'text-violet-400', CONSUMER_PROTECTION: 'text-amber-400', CREDIT: 'text-indigo-400', GENERAL: 'text-slate-400' };

interface AuditRow { event_id: string; entity_name: string; entity_id: string; action: string; changes: any; actor_persona: string; event_time: string; regulatory_domain?: string; action_class?: string; reason?: string; }

export function AuditTrailExplorer({ initialRows }: { initialRows: AuditRow[] }) {
    const [rows, setRows] = useState<AuditRow[]>(initialRows);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState<string | null>(null);

    // Filters
    const [entity, setEntity] = useState('');
    const [actor, setActor] = useState('');
    const [cls, setCls] = useState('');
    const [domain, setDomain] = useState('');
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');

    const fetch_ = useCallback(async (p: number) => {
        setLoading(true);
        const params = new URLSearchParams({ page: String(p), ...(entity && { entity_name: entity }), ...(actor && { actor }), ...(cls && { action_class: cls }), ...(domain && { domain }), ...(from && { from }), ...(to && { to }) });
        const res = await fetch(`/api/compliance/audit-trail?${params}`);
        const json = await res.json();
        setRows(json.rows ?? []);
        setPage(p);
        setLoading(false);
    }, [entity, actor, cls, domain, from, to]);

    const sel = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => setter(e.target.value);
    const selectClass = "bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-300 h-7 px-2 focus:outline-none focus:border-indigo-500";

    return (
        <div className="space-y-3">
            {/* Immutability badge */}
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-950/30 border border-emerald-700/30 rounded-xl w-fit">
                <Lock className="h-3 w-3 text-emerald-400" />
                <span className="text-[10px] text-emerald-300 font-semibold">Append-Only Audit Trail — Records cannot be modified or deleted</span>
            </div>

            {/* Filter bar */}
            <div className="flex flex-wrap gap-2 p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <select value={entity} onChange={sel(setEntity)} className={selectClass}><option value="">All Entities</option>{ENTITIES.filter(Boolean).map(e => <option key={e} value={e}>{e}</option>)}</select>
                <select value={actor} onChange={sel(setActor)} className={selectClass}><option value="">All Actors</option>{ACTORS.filter(Boolean).map(a => <option key={a} value={a}>{a}</option>)}</select>
                <select value={cls} onChange={sel(setCls)} className={selectClass}><option value="">All Actions</option>{ACTION_CLS.filter(Boolean).map(c => <option key={c} value={c}>{c}</option>)}</select>
                <select value={domain} onChange={sel(setDomain)} className={selectClass}><option value="">All Domains</option>{DOMAINS.filter(Boolean).map(d => <option key={d} value={d}>{d}</option>)}</select>
                <input type="date" value={from} onChange={sel(setFrom)} className={selectClass + " w-32"} />
                <input type="date" value={to} onChange={sel(setTo)} className={selectClass + " w-32"} />
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 h-7 text-xs px-3" onClick={() => fetch_(0)} disabled={loading}>Search</Button>
                <Button size="sm" variant="outline" className="border-slate-700 text-slate-500 h-7 text-xs" onClick={() => { setEntity(''); setActor(''); setCls(''); setDomain(''); setFrom(''); setTo(''); fetch_(0); }}>Clear</Button>
            </div>

            {/* Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                    <thead className="border-b border-slate-800">
                        <tr className="text-left">
                            {['Timestamp', 'Entity', 'Action', 'Actor', 'Domain', 'Reason', 'Changes'].map(h => (
                                <th key={h} className="px-3 py-2 text-[10px] text-slate-500 uppercase font-semibold">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {loading && <tr><td colSpan={7} className="px-3 py-4 text-center text-slate-600">Loading…</td></tr>}
                        {!loading && rows.length === 0 && <tr><td colSpan={7} className="px-3 py-4 text-center text-slate-600">No entries match filters</td></tr>}
                        {rows.map(row => (
                            <>
                                <tr key={row.event_id} className="hover:bg-slate-800/30 cursor-pointer" onClick={() => setExpanded(expanded === row.event_id ? null : row.event_id)}>
                                    <td className="px-3 py-2 font-mono text-slate-400 whitespace-nowrap">{fmtDateTime(row.event_time)}</td>
                                    <td className="px-3 py-2 text-slate-300 max-w-[140px] truncate">{row.entity_name}</td>
                                    <td className="px-3 py-2 font-mono text-indigo-300">{row.action}</td>
                                    <td className="px-3 py-2 text-slate-400">{row.actor_persona ?? '—'}</td>
                                    <td className="px-3 py-2"><span className={`font-semibold ${DOMAIN_COLORS[row.regulatory_domain ?? ''] ?? 'text-slate-500'}`}>{row.regulatory_domain ?? '—'}</span></td>
                                    <td className="px-3 py-2 text-slate-500 max-w-[200px] truncate">{row.reason ?? '—'}</td>
                                    <td className="px-3 py-2 text-slate-600">{row.action_class ?? '—'} ▸</td>
                                </tr>
                                {expanded === row.event_id && (
                                    <tr key={row.event_id + '_exp'} className="bg-slate-950/50">
                                        <td colSpan={7} className="px-4 py-3">
                                            <pre className="text-[10px] text-slate-400 whitespace-pre-wrap font-mono">{JSON.stringify(row.changes, null, 2)}</pre>
                                            <p className="text-[10px] text-slate-600 mt-1 font-mono">Entity ID: {row.entity_id}</p>
                                        </td>
                                    </tr>
                                )}
                            </>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
                <p className="text-[10px] text-slate-600">{rows.length} records · Page {page + 1}</p>
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="border-slate-700 text-slate-500 h-6 text-xs" disabled={page === 0 || loading} onClick={() => fetch_(page - 1)}>← Prev</Button>
                    <Button size="sm" variant="outline" className="border-slate-700 text-slate-500 h-6 text-xs" disabled={rows.length < 25 || loading} onClick={() => fetch_(page + 1)}>Next →</Button>
                </div>
            </div>
        </div>
    );
}
