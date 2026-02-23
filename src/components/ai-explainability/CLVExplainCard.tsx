"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CLVProjection } from "@/lib/models/clv";
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, Cell } from "recharts";
import { Database, TrendingUp, ShieldAlert, Cpu } from "lucide-react";

interface CLVExplainCardProps {
    clvData: CLVProjection;
}

export function CLVExplainCard({ clvData }: CLVExplainCardProps) {
    if (!clvData) return null;

    const { clv_5yr, clv_breakdown, inputs, confidence } = clvData;

    // Format chart data
    const chartData = Object.entries(clv_breakdown).map(([year, val]) => ({
        year: year.replace('Year ', 'Yr'),
        value: val
    }));

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">5-Year CLV Projection</h3>
                    <div className="text-4xl font-light text-white">${clv_5yr.toLocaleString()}</div>
                </div>
                <div className="text-right">
                    <span className="text-xs text-slate-500 mb-1 block">Confidence</span>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {confidence} Match
                    </span>
                </div>
            </div>

            <div className="h-32 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                        <Tooltip
                            cursor={{ fill: '#1e293b' }}
                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                            formatter={(val: any) => [`$${(val || 0).toLocaleString()}`, 'Discounted CF']}
                            labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#818cf8' : '#4f46e5'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-semibold text-slate-400 mb-3 flex items-center gap-1.5"><Cpu className="h-3 w-3" /> Base Assumptions (Annualized)</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <div className="bg-slate-900 border border-slate-800 rounded p-2 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-emerald-500 shrink-0" />
                        <div>
                            <div className="text-[10px] text-slate-500 uppercase">Gross Revenue</div>
                            <div className="text-xs font-semibold text-slate-200">${inputs.revenue_yr.toLocaleString()}</div>
                        </div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded p-2 flex items-center gap-2">
                        <Database className="h-4 w-4 text-indigo-400 shrink-0" />
                        <div>
                            <div className="text-[10px] text-slate-500 uppercase">Cost to Serve</div>
                            <div className="text-xs font-semibold text-slate-200">-${inputs.cost_to_serve_yr.toLocaleString()}</div>
                        </div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded p-2 flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0" />
                        <div>
                            <div className="text-[10px] text-slate-500 uppercase">Est. Credit Loss</div>
                            <div className="text-xs font-semibold text-slate-200">-${inputs.credit_losses_yr.toLocaleString()}</div>
                        </div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded p-2 flex items-center gap-2">
                        <div className="text-xs font-mono text-slate-400 text-center w-full">Discount: {(inputs.discount_rate * 100).toFixed(1)}%</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
