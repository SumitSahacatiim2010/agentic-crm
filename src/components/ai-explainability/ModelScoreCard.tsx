"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Filter, ShieldAlert, BadgeInfo } from "lucide-react";
import { fmtDate } from "@/lib/date-utils";

interface Factor {
    factor: string;
    impact?: number;
    weight?: number;
}

interface ModelScoreCardProps {
    title: string;
    description: string;
    score: number | string;
    maxScore?: number;
    riskBadge: string;
    riskBadgeVariant?: 'success' | 'warning' | 'destructive' | 'neutral';
    factors: Factor[];
    modelVersion: string;
    lastEvaluated?: string;
    onOverride?: () => void;
    icon?: React.ReactNode;
}

export function ModelScoreCard({
    title, description, score, maxScore = 100,
    riskBadge, riskBadgeVariant = 'neutral',
    factors, modelVersion, lastEvaluated, onOverride, icon
}: ModelScoreCardProps) {

    // Convert variants to tailwind classes
    const badgeColors = {
        success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        destructive: 'bg-red-500/10 text-red-400 border-red-500/20',
        neutral: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    };

    const isNumericScore = typeof score === 'number';
    const fillPercentage = isNumericScore ? (score / maxScore) * 100 : 0;

    return (
        <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2 border-b border-slate-800">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                        {icon || <BrainCircuit className="h-5 w-5 text-indigo-400" />}
                        <div>
                            <CardTitle className="text-sm text-slate-200">{title}</CardTitle>
                            <CardDescription className="text-xs text-slate-500">{description}</CardDescription>
                        </div>
                    </div>
                    <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${badgeColors[riskBadgeVariant]}`}>
                        {riskBadge}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-5">

                {/* Score Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-3xl font-light text-white tabular-nums">
                            {score}
                            {isNumericScore && <span className="text-sm text-slate-500 font-normal ml-1">/ {maxScore}</span>}
                        </div>
                    </div>

                    {/* Gauge Visual (Only if numeric) */}
                    {isNumericScore && (
                        <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${fillPercentage > 75 ? 'bg-emerald-500' : fillPercentage > 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                                style={{ width: `${Math.min(100, Math.max(0, fillPercentage))}%` }}
                            />
                        </div>
                    )}
                </div>

                {/* Factors Chart */}
                <div className="space-y-2">
                    <div className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                        <Filter className="h-3 w-3" /> Key Drivers
                    </div>
                    <div className="space-y-1.5">
                        {factors.slice(0, 3).map((f, i) => {
                            const val = f.impact || f.weight || 0;
                            const isPositive = val > 0;
                            const absVal = Math.abs(val);
                            // Normalize bar length logic assuming 100 max factor size or purely relative
                            const widthPercent = Math.min(100, Math.max(5, (absVal / 100) * 100));

                            return (
                                <div key={i} className="flex flex-col gap-1">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-300 truncate max-w-[200px]" title={f.factor}>{f.factor}</span>
                                        <span className={`font-mono font-medium ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            {isPositive ? '+' : ''}{val}
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden flex">
                                        {/* Center zero-axis aesthetic */}
                                        <div className="w-1/2 flex justify-end pr-[1px]">
                                            {!isPositive && <div className="h-full bg-rose-500 rounded-l-full" style={{ width: `${widthPercent}%` }} />}
                                        </div>
                                        <div className="w-1/2 flex justify-start pl-[1px]">
                                            {isPositive && <div className="h-full bg-emerald-500 rounded-r-full" style={{ width: `${widthPercent}%` }} />}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Meta & Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-[10px] text-slate-500">
                    <div className="flex flex-col gap-0.5">
                        <span>Model: <span className="font-mono text-slate-400">{modelVersion}</span></span>
                        {lastEvaluated && <span>Last run: {fmtDate(lastEvaluated)}</span>}
                    </div>
                    {onOverride && (
                        <Button variant="ghost" size="sm" onClick={onOverride} className="h-7 text-xs text-indigo-400 hover:text-indigo-300 hover:bg-slate-800">
                            Override...
                        </Button>
                    )}
                </div>

            </CardContent>
        </Card>
    );
}
