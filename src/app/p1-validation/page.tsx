// src/app/p1-validation/page.tsx
// Phase 1 Validation Page — minimal UI to confirm: DB reads, Edge API calls, loading/error states.
// NOT a Phase 2 feature page. Uses only Server Components + one client island.

import { insforge } from '@/lib/insforge-client';
import Link from 'next/link';
import { EdgeTestPanel } from './EdgeTestPanel';

// ─── Server-side data fetches ───────────────────────────────────────────────

async function fetchPartyStats() {
    const [individual, corporate, opps, cases, interactions] = await Promise.all([
        insforge.database.from('individual_parties').select('party_id', { count: 'exact', head: true }),
        insforge.database.from('corporate_parties').select('party_id', { count: 'exact', head: true }),
        insforge.database.from('sales_opportunities').select('opportunity_id', { count: 'exact', head: true }),
        insforge.database.from('service_cases').select('case_id', { count: 'exact', head: true }),
        insforge.database.from('interactions').select('interaction_id', { count: 'exact', head: true }),
    ]);
    return {
        individuals: individual.count ?? 0,
        corporates: corporate.count ?? 0,
        opportunities: opps.count ?? 0,
        cases: cases.count ?? 0,
        interactions: interactions.count ?? 0,
    };
}

async function fetchRecentParties() {
    const { data, error } = await insforge.database
        .from('individual_parties')
        .select(`id, full_name, tier, employment_status`)
        .limit(8);
    if (error) return [];
    return data || [];
}

async function fetchSlaBreachingCases() {
    const { data, error } = await insforge.database
        .from('service_cases')
        .select('id, subject, priority, status, sla_target_hours')
        .eq('status', 'Open')
        .eq('priority', 'High')
        .limit(5);
    if (error) return [];
    return data || [];
}

// ─── UI ──────────────────────────────────────────────────────────────────────

export const metadata = { title: 'Phase 1 Validation | Banking CRM' };

export default async function P1ValidationPage() {
    const stats = await fetchPartyStats();
    const parties = await fetchRecentParties();
    const breachCases = await fetchSlaBreachingCases();

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-8">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Phase 1: Data Fabric Validation</h1>
                    <p className="text-slate-400 text-sm">This page validates DB seeding, RLS, and Edge API mocks. Not a production feature view.</p>
                </div>
                <Link href="/" className="text-sm text-blue-400 hover:text-blue-300 underline">← Back to Home</Link>
            </div>

            {/* Seed Verification Counts */}
            <section>
                <h2 className="text-lg font-semibold text-slate-200 mb-3 border-b border-slate-800 pb-2">📦 P1.3 Seed Verification (Live DB Counts)</h2>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    {[
                        { label: 'Individual Parties', value: stats.individuals, target: 180 },
                        { label: 'Corporate Parties', value: stats.corporates, target: 20 },
                        { label: 'Opportunities', value: stats.opportunities, target: 80 },
                        { label: 'Service Cases', value: stats.cases, target: 50 },
                        { label: 'Interactions', value: stats.interactions, target: 500 },
                    ].map(({ label, value, target }) => (
                        <div key={label} className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-center">
                            <div className={`text-3xl font-bold font-mono ${value >= target ? 'text-emerald-400' : 'text-amber-400'}`}>{value}</div>
                            <div className="text-xs text-slate-500 mt-1">{label}</div>
                            <div className="text-xs text-slate-600">Target: {target}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Recent Parties (DB read) */}
            <section>
                <h2 className="text-lg font-semibold text-slate-200 mb-3 border-b border-slate-800 pb-2">👥 P1.1 Party Model — Sample Records (from DB)</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="text-left text-slate-500 border-b border-slate-800">
                                <th className="py-2 pr-4">Name / Company</th>
                                <th className="py-2 pr-4">Type</th>
                                <th className="py-2 pr-4">Tier / Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {parties.map((p: any) => {
                                const displayName = p.full_name ?? '—';
                                const tier = p.tier ?? '—';
                                return (
                                    <tr key={p.id} className="border-b border-slate-900 hover:bg-slate-900/50">
                                        <td className="py-2 pr-4 font-medium text-slate-200">{displayName}</td>
                                        <td className="py-2 pr-4">
                                            <span className={`text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300`}>
                                                individual
                                            </span>
                                        </td>
                                        <td className="py-2 pr-4 text-slate-400">{tier}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* SLA Breaching Cases */}
            <section>
                <h2 className="text-lg font-semibold text-slate-200 mb-3 border-b border-slate-800 pb-2">🚨 P1.1 Imminent SLA Breach Cases</h2>
                {breachCases.length === 0 ? (
                    <p className="text-slate-500 text-sm">No high-priority open cases found.</p>
                ) : (
                    <div className="space-y-2">
                        {breachCases.map((c: any) => (
                            <div key={c.id} className="flex items-center justify-between bg-red-500/5 border border-red-500/20 rounded-lg px-4 py-3">
                                <span className="text-sm text-slate-200">{c.subject}</span>
                                <span className="text-xs text-red-400 font-mono">SLA Target: {c.sla_target_hours || 'N/A'} hours</span>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Edge Function Tests — Client Component Island */}
            <EdgeTestPanel />
        </div>
    );
}
