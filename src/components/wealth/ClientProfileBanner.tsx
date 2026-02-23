"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MOCK_SUMMARY } from "@/lib/wealth-mock-data";
import { Crown, TrendingUp, ShieldCheck, Wallet } from "lucide-react";

export function ClientProfileBanner() {
    const { investorClassification, totalAUM, currency, ytdReturn, riskScore } = MOCK_SUMMARY;

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, maximumFractionDigits: 0 }).format(val);
    };

    return (
        <Card className="bg-gradient-to-r from-slate-900 to-indigo-950/40 border-slate-800">
            <CardContent className="p-6 flex flex-col md:flex-row justify-between items-center gap-6">

                {/* Identity */}
                <div className="flex items-center gap-4">
                    <div className={`
                h-16 w-16 rounded-full flex items-center justify-center border-2
                ${investorClassification.includes('High') ? 'bg-amber-500/10 border-amber-500/50 text-amber-500' : 'bg-slate-800 border-slate-700 text-slate-400'}
            `}>
                        <Crown className="h-8 w-8" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-2xl font-bold text-white">Robert Fox</h2>
                            <Badge variant="outline" className="text-amber-400 border-amber-500/30 bg-amber-500/10">
                                {investorClassification}
                            </Badge>
                        </div>
                        <p className="text-slate-400 text-sm mt-1">Portfolio ID: <span className="font-mono text-slate-300">WF-8892-XJ</span></p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="flex gap-8 divide-x divide-slate-800">
                    <div className="px-4 text-center">
                        <div className="text-sm text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                            <Wallet className="h-4 w-4" /> Total AUM
                        </div>
                        <div className="text-2xl font-bold text-white">{formatCurrency(totalAUM)}</div>
                    </div>
                    <div className="px-4 text-center">
                        <div className="text-sm text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                            <TrendingUp className="h-4 w-4" /> YTD Return
                        </div>
                        <div className="text-2xl font-bold text-emerald-400">+{ytdReturn}%</div>
                    </div>
                    <div className="px-4 text-center">
                        <div className="text-sm text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                            <ShieldCheck className="h-4 w-4" /> Risk Score
                        </div>
                        <div className="text-2xl font-bold text-indigo-400">{riskScore}/100</div>
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}
