"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PolicyRuleAlert } from "@/components/credit/PolicyRuleAlert";
import { CreditApplication } from "@/lib/credit-mock-data";

interface FinancialSpreadingToolProps {
    application: CreditApplication;
    onMetricsChange: (metrics: { valid: boolean }) => void;
}

export function FinancialSpreadingTool({ application, onMetricsChange }: FinancialSpreadingToolProps) {
    // Initialize with some sensible defaults relative to the loan size for demo
    const [annualIncome, setAnnualIncome] = useState(application.loanAmount * 1.5);
    const [monthlyDebt, setMonthlyDebt] = useState(2000);
    const [collateral, setCollateral] = useState(application.loanAmount * 0.9); // Default to slightly undercollateralized to show warning potentially

    // Ratios
    const monthlyIncome = annualIncome / 12;
    const dti = (monthlyDebt / monthlyIncome) * 100;
    const dscr = monthlyIncome / (monthlyDebt + (application.loanAmount * 0.08 / 12)); // Simplified debt service calc
    const ltv = (application.loanAmount / collateral) * 100;

    const isValid = ltv <= 80 && dscr >= 1.25;

    useEffect(() => {
        onMetricsChange({ valid: isValid });
    }, [isValid, onMetricsChange]);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
    };

    return (
        <div className="space-y-4">

            <PolicyRuleAlert ltv={ltv} dscr={dscr} />

            <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-3">
                    <CardTitle className="text-slate-100 text-sm font-medium uppercase tracking-wider">Financial Spreading & Ratios</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-slate-400 text-xs">Annual EBITDA / Income</Label>
                            <Input
                                type="number"
                                value={annualIncome}
                                onChange={(e) => setAnnualIncome(Number(e.target.value))}
                                className="bg-slate-950 border-slate-800 text-slate-200"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-400 text-xs">Est. Monthly Debt Service</Label>
                            <Input
                                type="number"
                                value={monthlyDebt}
                                onChange={(e) => setMonthlyDebt(Number(e.target.value))}
                                className="bg-slate-950 border-slate-800 text-slate-200"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-400 text-xs">Collateral Value</Label>
                            <Input
                                type="number"
                                value={collateral}
                                onChange={(e) => setCollateral(Number(e.target.value))}
                                className="bg-slate-950 border-slate-800 text-slate-200"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-400 text-xs">Loan Amount</Label>
                            <div className="flex h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-400 cursor-not-allowed">
                                {formatCurrency(application.loanAmount)}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
                        <div className="p-2 rounded bg-slate-950 text-center">
                            <div className="text-[10px] text-slate-500 uppercase">DSCR</div>
                            <div className={`text-lg font-bold ${dscr >= 1.25 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {dscr.toFixed(2)}x
                            </div>
                        </div>
                        <div className="p-2 rounded bg-slate-950 text-center">
                            <div className="text-[10px] text-slate-500 uppercase">LTV</div>
                            <div className={`text-lg font-bold ${ltv <= 80 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {ltv.toFixed(1)}%
                            </div>
                        </div>
                        <div className="p-2 rounded bg-slate-950 text-center">
                            <div className="text-[10px] text-slate-500 uppercase">DTI</div>
                            <div className="text-lg font-bold text-slate-300">
                                {dti.toFixed(1)}%
                            </div>
                        </div>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}
