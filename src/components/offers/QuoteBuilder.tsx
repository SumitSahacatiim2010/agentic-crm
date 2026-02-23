"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DiscountAuthMatrix } from "@/components/offers/DiscountAuthMatrix";
import { ProductOffer, PRICING_RULES } from "@/lib/offer-mock-data";
import { Calculator, Plus } from "lucide-react";

interface QuoteBuilderProps {
    selectedOffer: ProductOffer | null;
    onSaveQuote: (quote: any) => void;
}

export function QuoteBuilder({ selectedOffer, onSaveQuote }: QuoteBuilderProps) {
    const [loanAmount, setLoanAmount] = useState(0);
    const [term, setTerm] = useState(0);
    const [discount, setDiscount] = useState(0); // Manual discount %
    const [creditScore, setCreditScore] = useState(740); // Mock context

    useEffect(() => {
        if (selectedOffer) {
            setLoanAmount(selectedOffer.minAmount);
            setTerm(selectedOffer.termOptions[0]);
        }
    }, [selectedOffer]);

    if (!selectedOffer) {
        return (
            <Card className="bg-slate-900 border-slate-800 h-full flex flex-col items-center justify-center text-slate-500 p-8 border-dashed">
                <Calculator className="h-12 w-12 mb-4 opacity-50" />
                <p>Select a product from the catalog to build a quote.</p>
            </Card>
        );
    }

    // Pricing Engine Logic
    const riskAdj = PRICING_RULES.creditScoreAdjustment(creditScore);
    const relationshipAdj = PRICING_RULES.relationshipAdjustment('Gold'); // Mock
    const computedRate = selectedOffer.baseRate + riskAdj + relationshipAdj - discount;
    const finalRate = Math.max(0.1, computedRate); // Prevent negative

    // Monthly Payment Calc (Amortization)
    const r = finalRate / 100 / 12;
    const n = term;
    const monthlyPayment = (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalInterest = (monthlyPayment * n) - loanAmount;

    const handleSave = () => {
        onSaveQuote({
            id: Math.random().toString(36).substr(2, 9),
            offerName: selectedOffer.name,
            amount: loanAmount,
            term,
            rate: finalRate,
            payment: monthlyPayment
        });
    };

    return (
        <Card className="bg-slate-900 border-slate-800 h-full flex flex-col">
            <CardHeader className="pb-4">
                <CardTitle className="text-slate-100 flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-indigo-400" />
                    Pricing Engine
                </CardTitle>
                <CardDescription>Configure terms for <strong>{selectedOffer.name}</strong></CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 flex-1">

                {/* Configuration Inputs */}
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-slate-400 text-xs">Loan Amount</Label>
                            <Input
                                type="number"
                                value={loanAmount}
                                onChange={(e) => setLoanAmount(Number(e.target.value))}
                                className="bg-slate-950 border-slate-800 text-slate-200"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-400 text-xs">Term (Months)</Label>
                            <Select value={term.toString()} onValueChange={(v) => setTerm(Number(v))}>
                                <SelectTrigger className="bg-slate-950 border-slate-800 text-slate-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {selectedOffer.termOptions.map(t => (
                                        <SelectItem key={t} value={t.toString()}>{t} Months</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-slate-400 text-xs flex justify-between">
                            <span>Manual Margin Waiver (Discount)</span>
                            <span className="text-indigo-400 font-bold">{discount.toFixed(2)}%</span>
                        </Label>
                        <Slider
                            value={[discount]}
                            min={0}
                            max={2.5}
                            step={0.05}
                            onValueChange={(v) => setDiscount(v[0])}
                            className="[&>.relative>.absolute]:bg-indigo-500"
                        />
                    </div>

                    {/* Context Controls (For Demo) */}
                    <div className="pt-2">
                        <Label className="text-slate-500 text-[10px] uppercase tracking-wider mb-2 block">Simulation Context</Label>
                        <div className="flex gap-4">
                            <div className="flex-1 space-y-1">
                                <Label className="text-slate-400 text-xs">Credit Score</Label>
                                <Input
                                    type="number"
                                    value={creditScore}
                                    onChange={(e) => setCreditScore(Number(e.target.value))}
                                    className="h-8 bg-slate-950 border-slate-800 text-slate-300 text-xs"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <Separator className="bg-slate-800" />

                {/* Pricing Breakdown */}
                <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                        <span className="text-slate-400">Base Rate</span>
                        <span className="text-slate-200">{selectedOffer.baseRate.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between text-emerald-500">
                        <span>Risk Adjustment ({creditScore})</span>
                        <span>{riskAdj > 0 ? '+' : ''}{riskAdj.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between text-emerald-500">
                        <span>Relationship (Gold)</span>
                        <span>{relationshipAdj.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between text-indigo-400">
                        <span>Manual Waiver</span>
                        <span>-{discount.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t border-slate-800 mt-2">
                        <span className="text-white">Final APR</span>
                        <span className={finalRate < selectedOffer.floorRate ? 'text-amber-500' : 'text-white'}>
                            {finalRate.toFixed(2)}%
                        </span>
                    </div>

                    <DiscountAuthMatrix
                        finalRate={finalRate}
                        floorRate={selectedOffer.floorRate}
                        baseRate={selectedOffer.baseRate}
                    />

                    <div className="mt-4 bg-slate-950 p-3 rounded text-center">
                        <div className="text-xs text-slate-500 uppercase">Est. Monthly Payment</div>
                        <div className="text-2xl font-bold text-slate-200">
                            {loanAmount > 0 ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(monthlyPayment) : '$0.00'}
                        </div>
                    </div>
                </div>

            </CardContent>
            <CardFooter>
                <Button onClick={handleSave} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Plus className="h-4 w-4 mr-2" /> Add to Comparison
                </Button>
            </CardFooter>
        </Card>
    );
}
