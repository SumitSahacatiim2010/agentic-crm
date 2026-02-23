"use client";

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FinancialHolding } from '@/lib/mock-data';

interface FinancialProfileDonutProps {
    holdings: FinancialHolding[];
}

export function FinancialProfileDonut({ holdings }: FinancialProfileDonutProps) {
    const data = useMemo(() => {
        // Aggregate by product type, ignoring liabilities (negative values) for the chart, 
        // or separating them. Typically AUM charts show positive assets.
        // Let's filter for assets (> 0) for the donut.
        const assets = holdings.filter(h => h.balance > 0);

        // Group by type
        const grouped = assets.reduce((acc, curr) => {
            const existing = acc.find(item => item.name === curr.product_type);
            if (existing) {
                existing.value += curr.balance;
            } else {
                acc.push({ name: curr.product_type, value: curr.balance });
            }
            return acc;
        }, [] as { name: string; value: number }[]);

        return grouped;
    }, [holdings]);

    const totalAUM = data.reduce((sum, item) => sum + item.value, 0);
    const totalLiability = holdings.filter(h => h.balance < 0).reduce((sum, h) => sum + Math.abs(h.balance), 0);
    const netWorth = totalAUM - totalLiability;

    const COLORS = ['#3b82f6', '#10b981', '#6366f1', '#8b5cf6', '#f59e0b'];

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(val);
    };

    return (
        <Card className="bg-slate-900 border-slate-800 h-full">
            <CardHeader>
                <CardTitle className="text-slate-100">Financial Profile</CardTitle>
                <CardDescription className="text-slate-400">Asset Allocation & Liabilities</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[250px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                                itemStyle={{ color: '#e2e8f0' }}
                                formatter={(value: any) => formatCurrency(Number(value) || 0)}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center Text */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[60%] text-center pointer-events-none">
                        <div className="text-xs text-slate-500 uppercase font-semibold">Net Worth</div>
                        <div className="text-lg font-bold text-slate-100">{formatCurrency(netWorth)}</div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-800">
                    <div>
                        <div className="text-xs text-slate-500 uppercase tracking-wide">Total Assets</div>
                        <div className="text-xl font-semibold text-emerald-400">{formatCurrency(totalAUM)}</div>
                    </div>
                    <div>
                        <div className="text-xs text-slate-500 uppercase tracking-wide">Total Liabilities</div>
                        <div className="text-xl font-semibold text-rose-400">{formatCurrency(totalLiability)}</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
