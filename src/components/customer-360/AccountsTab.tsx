"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Wallet, TrendingDown, TrendingUp } from "lucide-react";
import { fmtDate } from "@/lib/date-utils";

interface AccountsTabProps {
    partyId: string;
}

interface BalanceData {
    account_id: string;
    currency: string;
    available_balance: number;
    ledger_balance: number;
    recent_transactions: Array<{
        id: string;
        date: string;
        description: string;
        amount: number;
        type: string;
    }>;
}

export function AccountsTab({ partyId }: AccountsTabProps) {
    const [data, setData] = useState<BalanceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        fetch('/api/edge-proxy/core-banking-proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ account_id: `${partyId}-HNW` })
        })
            .then(res => {
                if (!res.ok) throw new Error(`Status ${res.status}`);
                return res.json();
            })
            .then(d => { if (!cancelled) setData(d); })
            .catch(e => { if (!cancelled) setError(e.message); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [partyId]);

    const fmt = (v: number | undefined, currency = 'USD') => {
        if (v === undefined) return '—';
        return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(v);
    };

    if (loading) return (
        <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-24 bg-slate-800 rounded-xl" />)}</div>
            <Skeleton className="h-64 bg-slate-800 rounded-xl" />
        </div>
    );

    if (error) return (
        <div className="flex items-start gap-3 p-4 bg-amber-950/30 border border-amber-700/30 rounded-xl text-amber-300 text-sm">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
                <p className="font-semibold">Core Banking Temporarily Unavailable</p>
                <p className="text-xs text-amber-400/70 mt-1">Error: {error}. Last known balances may not be current.</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Balance Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-900 border border-emerald-800/30 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-2">
                        <Wallet className="h-4 w-4 text-emerald-400" />
                        <p className="text-xs text-slate-400 uppercase tracking-wide">Available Balance</p>
                    </div>
                    <p className="text-2xl font-black text-emerald-300">{fmt(data?.available_balance, data?.currency)}</p>
                    <p className="text-xs text-slate-500 mt-1">{data?.currency} · Real-time</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Ledger Balance</p>
                    <p className="text-2xl font-black text-slate-200">{fmt(data?.ledger_balance, data?.currency)}</p>
                    <p className="text-xs text-slate-500 mt-1">Cleared funds</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Account ID</p>
                    <p className="text-sm font-mono text-slate-300 break-all">{data?.account_id}</p>
                    <p className="text-xs text-slate-600 mt-1">via core-banking-proxy</p>
                </div>
            </div>

            {/* Transactions */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-800">
                    <h3 className="font-semibold text-slate-100 text-sm">Recent Transactions</h3>
                </div>
                <div className="divide-y divide-slate-800">
                    {(data?.recent_transactions || []).map((tx, i) => (
                        <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-slate-800/40 transition-colors">
                            <div>
                                <p className="text-sm text-slate-200">{tx.description || `Transaction ${tx.id}`}</p>
                                <p className="text-xs text-slate-500">{fmtDate(tx.date)} · {tx.type}</p>
                            </div>
                            <div className={`flex items-center gap-1 font-mono font-bold text-sm ${tx.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {tx.amount >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                                {fmt(Math.abs(tx.amount), data?.currency)}
                            </div>
                        </div>
                    ))}
                    {(!data?.recent_transactions?.length) && (
                        <p className="text-center text-slate-600 text-xs py-8">No transactions returned</p>
                    )}
                </div>
            </div>
        </div>
    );
}
