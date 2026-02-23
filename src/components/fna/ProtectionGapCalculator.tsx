"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { ShieldAlert, ShieldCheck } from "lucide-react";

export function ProtectionGapCalculator() {
    const [annualIncome, setAnnualIncome] = useState(150000);
    const [yearsSupport, setYearsSupport] = useState(10);
    const [existingCover, setExistingCover] = useState(500000);
    const [liabilities, setLiabilities] = useState(450000);

    const requiredCoverage = (annualIncome * yearsSupport) + liabilities;
    const gap = requiredCoverage - existingCover;
    const coverageRatio = Math.min(100, (existingCover / requiredCoverage) * 100);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
    };

    return (
        <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-100">
                    {gap > 0 ? <ShieldAlert className="h-5 w-5 text-amber-500" /> : <ShieldCheck className="h-5 w-5 text-emerald-500" />}
                    Protection Gap Analysis
                </CardTitle>
                <CardDescription>Assess life insurance adequacy against liabilities & income replacement needs.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">

                {/* Visualizer */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Current Coverage</span>
                        <span className="text-slate-400">Required: <span className="text-slate-200 font-semibold">{formatCurrency(requiredCoverage)}</span></span>
                    </div>
                    <div className="h-6 w-full bg-slate-800 rounded-full overflow-hidden relative">
                        <div
                            className={`h-full transition-all duration-500 ease-out ${coverageRatio >= 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                            style={{ width: `${coverageRatio}%` }}
                        ></div>
                        {/* Marker for liabilities */}
                        <div
                            className="absolute top-0 bottom-0 w-0.5 bg-rose-500/50 z-10"
                            style={{ left: `${Math.min(100, (liabilities / requiredCoverage) * 100)}%` }}
                            title="Debt Obligations"
                        ></div>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-slate-500 uppercase tracking-wide">Gap Analysis</span>
                        <span className={`text-xl font-bold ${gap > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {gap > 0 ? `-${formatCurrency(gap)} SHORTFALL` : 'FULLY COVERED'}
                        </span>
                    </div>
                </div>

                {/* Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-slate-300">Annual Income Replacement</Label>
                            <div className="text-lg font-mono text-indigo-300">{formatCurrency(annualIncome)}</div>
                            <Slider
                                value={[annualIncome]}
                                min={50000}
                                max={1000000}
                                step={10000}
                                onValueChange={(v) => setAnnualIncome(v[0])}
                                className="[&>.relative>.absolute]:bg-indigo-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-300">Years of Support Needed</Label>
                            <div className="text-lg font-mono text-indigo-300">{yearsSupport} Years</div>
                            <Slider
                                value={[yearsSupport]}
                                min={1}
                                max={30}
                                step={1}
                                onValueChange={(v) => setYearsSupport(v[0])}
                                className="[&>.relative>.absolute]:bg-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-slate-300">Outstanding Liabilities (Debt)</Label>
                            <div className="text-lg font-mono text-rose-300">{formatCurrency(liabilities)}</div>
                            <Slider
                                value={[liabilities]}
                                min={0}
                                max={2000000}
                                step={10000}
                                onValueChange={(v) => setLiabilities(v[0])}
                                className="[&>.relative>.absolute]:bg-rose-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-300">Existing Life Cover</Label>
                            <div className="text-lg font-mono text-emerald-300">{formatCurrency(existingCover)}</div>
                            <Slider
                                value={[existingCover]}
                                min={0}
                                max={5000000}
                                step={50000}
                                onValueChange={(v) => setExistingCover(v[0])}
                                className="[&>.relative>.absolute]:bg-emerald-500"
                            />
                        </div>
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}
