"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { X, Send } from "lucide-react";

interface Quote {
    id: string;
    offerName: string;
    amount: number;
    term: number;
    rate: number;
    payment: number;
}

interface QuoteComparisonProps {
    quotes: Quote[];
    onRemove: (id: string) => void;
}

export function QuoteComparison({ quotes, onRemove }: QuoteComparisonProps) {
    if (quotes.length === 0) return null;

    return (
        <Card className="bg-slate-900 border-slate-800 mt-6 animate-in slide-in-from-bottom-4 fade-in">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-slate-100">Quote Comparison</CardTitle>
                        <CardDescription>Side-by-side analysis of proposed scenarios.</CardDescription>
                    </div>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        <Send className="h-4 w-4 mr-2" /> Email Quotes to Client
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quotes.map((quote) => {
                        const totalCost = (quote.payment * quote.term) - quote.amount;

                        return (
                            <div key={quote.id} className="bg-slate-950 border border-slate-800 rounded-lg p-4 relative group">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 h-6 w-6 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => onRemove(quote.id)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>

                                <div className="mb-4">
                                    <h4 className="font-semibold text-slate-200">{quote.offerName}</h4>
                                    <div className="text-xs text-slate-500">{quote.term} Month Term</div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <span className="text-sm text-slate-400">Loan Amount</span>
                                        <span className="text-slate-200 font-mono">${quote.amount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <span className="text-sm text-slate-400">Interest Rate</span>
                                        <span className="text-indigo-400 font-bold font-mono">{quote.rate.toFixed(2)}%</span>
                                    </div>

                                    <Separator className="bg-slate-800 my-2" />

                                    <div className="flex justify-between items-end">
                                        <span className="text-sm text-slate-400">Monthly Payment</span>
                                        <span className="text-slate-100 font-bold font-mono text-lg">
                                            ${quote.payment.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-end text-xs">
                                        <span className="text-slate-500">Total Interest Cost</span>
                                        <span className="text-slate-400 font-mono">
                                            ${totalCost.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
