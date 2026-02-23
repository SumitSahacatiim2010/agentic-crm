"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, Trophy, Users, DollarSign, Activity } from "lucide-react";
import useSWR from "swr";

export interface ScorecardMetric {
    label: string;
    value: string | number;
    subValue?: string;
    status: 'Critical' | 'Warning' | 'Good' | 'Neutral';
    trend?: 'Up' | 'Down' | 'Flat';
    attainmentPct?: number;
    quotaTarget?: number;
    actual?: number;
}

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface PerformanceScorecardProps {
    metrics?: ScorecardMetric[]; // Keep optional for backwards compat
}

export function PerformanceScorecard({ metrics: initialMetrics }: PerformanceScorecardProps) {
    const { data: customersData } = useSWR('/api/customers', fetcher);
    const { data: leadsData } = useSWR('/api/leads', fetcher);

    // Compute simple KPI from SWR if available, otherwise fallback to props or defaults
    const computedMetrics: ScorecardMetric[] = initialMetrics || [
        {
            label: 'Total Customers',
            value: customersData?.meta?.total || 0,
            subValue: 'Active profiles',
            status: 'Good',
            trend: 'Up'
        },
        {
            label: 'Active Leads',
            value: leadsData?.meta?.total || 0,
            subValue: 'Opportunities pipeline',
            status: 'Good',
            trend: 'Up'
        },
        {
            label: 'Lead Conversion',
            value: '—',
            status: 'Neutral',
            trend: 'Flat'
        },
        {
            label: 'Win Rate',
            value: '—',
            status: 'Neutral',
            trend: 'Flat'
        }
    ];

    const getIcon = (label: string) => {
        if (label.includes("Sales") || label.includes("Quota")) return <Trophy className="h-4 w-4 text-emerald-400" />;
        if (label.includes("Lead") || label.includes("Cross-Sell")) return <Activity className="h-4 w-4 text-blue-400" />;
        if (label.includes("Revenue")) return <DollarSign className="h-4 w-4 text-purple-400" />;
        return <Users className="h-4 w-4 text-amber-400" />;
    };

    const getTrendIcon = (trend?: string) => {
        if (trend === 'Up') return <TrendingUp className="h-4 w-4 text-emerald-500" />;
        if (trend === 'Down') return <TrendingDown className="h-4 w-4 text-red-500" />;
        return <Minus className="h-4 w-4 text-slate-500" />;
    };

    const getBorderColor = (status: string) => {
        switch (status) {
            case 'Good': return 'border-emerald-500/50';
            case 'Warning': return 'border-yellow-500/50';
            case 'Critical': return 'border-red-500/50';
            default: return 'border-slate-800';
        }
    };

    const getTrackColor = (status: string) => {
        switch (status) {
            case 'Good': return 'bg-emerald-500';
            case 'Warning': return 'bg-amber-500';
            case 'Critical': return 'bg-red-500';
            default: return 'bg-slate-600';
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {computedMetrics.map((metric, idx) => {
                const pct = Math.min(100, Math.max(0, metric.attainmentPct ?? 0));
                return (
                    <Card key={idx} className={`bg-slate-900 border ${getBorderColor(metric.status)} hover:bg-slate-800/50 transition-colors group`}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">
                                {metric.label}
                            </CardTitle>
                            {getIcon(metric.label)}
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-100 mb-1">{metric.value}</div>

                            {/* Attainment progress bar */}
                            {metric.attainmentPct !== undefined && (
                                <div className="mb-2">
                                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-700 ${getTrackColor(metric.status)}`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                                        <span>{pct.toFixed(0)}% attained</span>
                                        <span>Target</span>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-2 mt-1">
                                {getTrendIcon(metric.trend)}
                                <span className="text-xs text-slate-500">{metric.subValue}</span>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
