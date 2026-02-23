"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PERFORMANCE_DATA } from "@/lib/wealth-mock-data";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function PerformanceChart() {
    return (
        <Card className="bg-slate-900 border-slate-800 h-full">
            <CardHeader>
                <CardTitle className="text-slate-100">Performance Attribution</CardTitle>
                <CardDescription>Portfolio Yield (YTD) vs S&P 500 Benchmark</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={PERFORMANCE_DATA}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorPort" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorBench" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#64748b" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#64748b" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                                itemStyle={{ color: '#e2e8f0' }}
                            />
                            <Legend verticalAlign="top" height={36} iconType="circle" />
                            <Area
                                type="monotone"
                                dataKey="portfolio"
                                name="Client Portfolio"
                                stroke="#10b981"
                                fillOpacity={1}
                                fill="url(#colorPort)"
                                strokeWidth={2}
                            />
                            <Area
                                type="monotone"
                                dataKey="benchmark"
                                name="Benchmark (S&P 500)"
                                stroke="#64748b"
                                fillOpacity={1}
                                fill="url(#colorBench)"
                                strokeDasharray="5 5"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
