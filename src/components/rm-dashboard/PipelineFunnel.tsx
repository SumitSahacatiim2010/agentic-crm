"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export interface PipelineStageData {
    stage: string;
    count: number;
    value: number;
    weightedValue: number;
    agingCount?: number;
    fill: string;
}

interface PipelineFunnelProps {
    data: PipelineStageData[];
}

export function PipelineFunnel({ data }: PipelineFunnelProps) {
    const formatCurrency = (val: number) => {
        if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
        if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}k`;
        return `$${val}`;
    };

    const totalValue = data.reduce((acc, d) => acc + d.weightedValue, 0);
    const totalAging = data.reduce((acc, d) => acc + (d.agingCount || 0), 0);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload?.length) return null;
        const entry = data.find(d => d.stage === label);
        return (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs">
                <p className="font-bold text-slate-100 mb-1">{label}</p>
                <p className="text-slate-300">{entry?.count || 0} deals — {formatCurrency(Number(payload[0]?.value || 0))}</p>
                {(entry?.agingCount || 0) > 0 && (
                    <p className="text-amber-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {entry?.agingCount} aging &gt;21 days
                    </p>
                )}
            </div>
        );
    };

    return (
        <Card className="bg-slate-900 border-slate-800 h-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-slate-100">Pipeline Funnel</CardTitle>
                        <CardDescription className="text-slate-400">
                            Weighted value: {formatCurrency(totalValue)}
                            {totalAging > 0 && (
                                <span className="ml-2 text-amber-400">· {totalAging} aging deals</span>
                            )}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 50, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" />
                            <XAxis type="number" hide />
                            <YAxis
                                type="category"
                                dataKey="stage"
                                width={110}
                                tick={{ fill: '#94a3b8', fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                            <Bar dataKey="weightedValue" radius={[0, 4, 4, 0]} barSize={22}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="flex flex-wrap gap-3 mt-4">
                    {data.filter(d => d.count > 0).map(d => (
                        <div key={d.stage} className="flex items-center gap-1.5 text-xs text-slate-400">
                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: d.fill }} />
                            <span>{d.stage}</span>
                            <span className="text-slate-500">({d.count})</span>
                            {(d.agingCount || 0) > 0 && <AlertCircle className="h-3 w-3 text-amber-400" />}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
