"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ShieldCheck, ShieldAlert, Check, Lock, Filter } from "lucide-react";

interface ConsentMetrics {
    total_audience: number; dnc_matches: number; gdpr_opted_out: number;
    tcpa_restricted: number; email_opt_outs: number; sms_opt_outs: number;
    push_opt_outs: number; safe_to_send: number; suppression_pct: number;
}

export function ConsentGuard() {
    const [isScrubbed, setIsScrubbed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [metrics, setMetrics] = useState<ConsentMetrics | null>(null);
    const [totalAudience, setTotalAudience] = useState<number>(0);

    // Fetch total audience on mount
    useEffect(() => {
        fetch('/api/marketing/check-consent').then(r => r.json()).then(d => {
            setTotalAudience(d.total_audience ?? 0);
        }).catch(() => { });
    }, []);

    const handleScrub = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/marketing/check-consent');
            const data = await res.json();
            setMetrics(data);
            setIsScrubbed(true);
        } catch { /* fallback silently */ }
        setLoading(false);
    };

    const rules = metrics ? [
        { label: 'Do Not Call (DNC) Registry Check', count: metrics.dnc_matches },
        { label: 'GDPR / Privacy Opt-Outs', count: metrics.gdpr_opted_out },
        { label: 'TCPA Frequency Caps (7-day limit)', count: metrics.tcpa_restricted },
        { label: 'Email Marketing Opt-Outs', count: metrics.email_opt_outs },
    ] : [
        { label: 'Do Not Call (DNC) Registry Check', count: 0 },
        { label: 'GDPR / Privacy Opt-Outs', count: 0 },
        { label: 'TCPA Frequency Caps (7-day limit)', count: 0 },
        { label: 'Email Marketing Opt-Outs', count: 0 },
    ];

    return (
        <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-slate-100 flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-indigo-400" />
                            Regulatory Consent Guard
                        </CardTitle>
                        <CardDescription>Audience filtering backed by live consent database — GDPR, CCPA, DNC registries.</CardDescription>
                    </div>
                    {isScrubbed ? (
                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/50">
                            <Check className="h-3 w-3 mr-1" /> Scrub Complete
                        </Badge>
                    ) : (
                        <Badge variant="destructive" className="bg-rose-500/10 text-rose-400 border-rose-500/50">
                            <ShieldAlert className="h-3 w-3 mr-1" /> Action Required
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* T4.2.2 Audience Segment Builder */}
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-4">
                    <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2"><Filter className="h-4 w-4" /> Audience Segment Builder</h3>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs text-slate-500">Tier</label>
                            <select className="w-full bg-slate-900 border border-slate-700 rounded h-8 px-2 text-xs text-slate-300">
                                <option>All Tiers</option>
                                <option>Retail</option>
                                <option>Premium</option>
                                <option>HNW</option>
                                <option>UHNW</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-slate-500">AUM Minimum</label>
                            <select className="w-full bg-slate-900 border border-slate-700 rounded h-8 px-2 text-xs text-slate-300">
                                <option>Any</option>
                                <option>$10k+</option>
                                <option>$100k+</option>
                                <option>$500k+</option>
                                <option>$1M+</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-slate-500">Engagement Score</label>
                            <select className="w-full bg-slate-900 border border-slate-700 rounded h-8 px-2 text-xs text-slate-300">
                                <option>Any</option>
                                <option>High</option>
                                <option>Medium</option>
                                <option>Low</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                        <div className="text-xs text-slate-500 uppercase">Initial Audience</div>
                        <div className="text-2xl font-bold text-slate-200">{totalAudience.toLocaleString()}</div>
                        <div className="text-[10px] text-slate-600 mt-1">From marketing_consent table</div>
                    </div>
                    <div className={`bg-slate-950 p-4 rounded-lg border border-slate-800 transition-colors ${isScrubbed ? 'border-emerald-500/30 bg-emerald-900/10' : ''}`}>
                        <div className="text-xs text-slate-500 uppercase">Safe to Send</div>
                        <div className={`text-2xl font-bold ${isScrubbed ? 'text-emerald-400' : 'text-slate-500'}`}>
                            {isScrubbed && metrics ? metrics.safe_to_send.toLocaleString() : '---'}
                        </div>
                        {isScrubbed && metrics && (
                            <div className="text-[10px] text-slate-600 mt-1">
                                Suppression rate: <span className="text-rose-400">{metrics.suppression_pct}%</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-3">
                    {rules.map((rule, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm p-2 bg-slate-950/50 rounded">
                            <div className="flex items-center gap-2">
                                {isScrubbed ? (
                                    <Lock className="h-3 w-3 text-emerald-500" />
                                ) : (
                                    <Filter className="h-3 w-3 text-slate-600" />
                                )}
                                <span className="text-slate-300">{rule.label}</span>
                            </div>
                            {isScrubbed ? (
                                <span className="text-rose-400 font-mono text-xs">-{rule.count} excluded</span>
                            ) : (
                                <span className="text-slate-600 text-xs">Pending</span>
                            )}
                        </div>
                    ))}
                </div>

                {!isScrubbed && (
                    <Button onClick={handleScrub} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" disabled={loading}>
                        <ShieldCheck className="h-4 w-4 mr-2" />
                        {loading ? 'Checking consent database…' : 'Run Regulatory Scrub'}
                    </Button>
                )}

            </CardContent>
        </Card>
    );
}
