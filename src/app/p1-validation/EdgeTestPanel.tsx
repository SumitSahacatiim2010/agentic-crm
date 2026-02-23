'use client';

// Phase 1 Validation — Client island to test Edge APIs with latency and error simulation.
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const EDGE_BASE = '/api/edge-proxy';

interface TestResult {
    fn: string;
    status: 'idle' | 'loading' | 'success' | 'error';
    latencyMs?: number;
    data?: any;
    error?: string;
}

async function callEdge(slug: string, body: object, simulateError = false) {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (simulateError) headers['x-simulate-error'] = 'true';
    const t0 = Date.now();
    const res = await fetch(`${EDGE_BASE}/${slug}`, { method: 'POST', headers, body: JSON.stringify(body) });
    const latencyMs = Date.now() - t0;
    if (!res.ok) {
        const errText = await res.text();
        return { ok: false, latencyMs, error: `${res.status}: ${errText}` };
    }
    const data = await res.json();
    return { ok: true, latencyMs, data };
}

export function EdgeTestPanel() {
    const [results, setResults] = useState<Record<string, TestResult>>({});
    const [simulateError, setSimulateError] = useState(false);

    const updateResult = (key: string, patch: Partial<TestResult>) => {
        setResults(prev => {
            const existing = prev[key] ?? { fn: key, status: 'idle' as const };
            return { ...prev, [key]: { ...existing, ...patch } };
        });
    };

    const runTest = async (testKey: string, body: object, slug: string) => {
        updateResult(testKey, { status: 'loading' });
        const res = await callEdge(slug, body, simulateError);
        if (res.ok) {
            updateResult(testKey, { status: 'success', latencyMs: res.latencyMs, data: res.data });
        } else {
            updateResult(testKey, { status: 'error', latencyMs: res.latencyMs, error: res.error });
        }
    };

    const tests: Array<{ slug: string; label: string; body: object; description: string }> = [
        { slug: 'core-banking-proxy', label: 'Core Banking', body: { account_id: 'ACT-HNW' }, description: 'Ledger + available balance with transactions' },
        { slug: 'aml-screen', label: 'AML Sanctions (CLEAR)', body: { full_name: 'Alexander Sterling' }, description: 'CLEAR result for a normal name' },
        { slug: 'aml-screen', label: 'AML Sanctions (HIT)', body: { full_name: 'test hit guzman' }, description: 'Forced HIT for watchlist detection' },
        { slug: 'bureau-score', label: 'Credit Bureau (OK)', body: { ssn: 'XXX-XX-XXXX' }, description: 'Good credit score, no delinquencies' },
        { slug: 'bureau-score', label: 'Credit Bureau (Fraud)', body: { ssn: 'TEST-666' }, description: 'Forced fraud alert via SSN pattern' },
    ];

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h2 className="text-lg font-semibold text-slate-200">⚡ P1.4 Edge Function Tests</h2>
                <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={simulateError}
                        onChange={e => setSimulateError(e.target.checked)}
                        className="rounded border-slate-600"
                        id="simulate-error-toggle"
                    />
                    Simulate Error (503/500)
                </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tests.map(({ slug, label, body, description }) => {
                    const testKey = `${slug}-${label}`;
                    const result = results[testKey];
                    return (
                        <div key={testKey} className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3">
                            <div>
                                <p className="font-medium text-slate-100 text-sm">{label}</p>
                                <p className="text-xs text-slate-500">{description}</p>
                            </div>

                            <Button
                                id={`edge-test-${testKey}`}
                                size="sm"
                                onClick={() => runTest(testKey, body, slug)}
                                disabled={result?.status === 'loading'}
                                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700"
                            >
                                {result?.status === 'loading' ? (
                                    <span className="animate-pulse">Running…</span>
                                ) : result?.status === 'success' ? (
                                    `✅ ${result.latencyMs}ms`
                                ) : result?.status === 'error' ? (
                                    `❌ Error`
                                ) : (
                                    'Run Test'
                                )}
                            </Button>

                            {result?.status === 'success' && result.data && (
                                <pre className="text-[10px] text-emerald-400 bg-slate-950 p-2 rounded overflow-auto max-h-40">
                                    {JSON.stringify(result.data, null, 2)}
                                </pre>
                            )}
                            {result?.status === 'error' && (
                                <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded p-2">
                                    {result.error}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
