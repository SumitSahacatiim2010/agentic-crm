"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MOCK_HOLDINGS } from "@/lib/wealth-mock-data";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export function PortfolioValuationTable() {
    const formatCurrency = (val: number, currency: string) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(val);
    };

    return (
        <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
                <CardTitle className="text-slate-100">Holdings & Valuation</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto w-full">
                    <Table>
                        <TableHeader className="bg-slate-950">
                            <TableRow className="border-slate-800 hover:bg-slate-900/50">
                                <TableHead className="text-slate-400">Asset</TableHead>
                                <TableHead className="text-slate-400">Class</TableHead>
                                <TableHead className="text-slate-400 text-right">Qty</TableHead>
                                <TableHead className="text-slate-400 text-right">Price</TableHead>
                                <TableHead className="text-slate-400 text-right">Market Value</TableHead>
                                <TableHead className="text-slate-400 text-right">Avg Cost</TableHead>
                                <TableHead className="text-slate-400 text-right">Unrealized P&L</TableHead>
                                <TableHead className="text-slate-400 text-right">% Change</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {MOCK_HOLDINGS.map((holding) => {
                                const marketValue = holding.quantity * holding.currentPrice;
                                return (
                                    <TableRow key={holding.id} className="border-slate-800 hover:bg-slate-800/50">
                                        <TableCell>
                                            <div>
                                                <div className="font-medium text-slate-200">{holding.symbol}</div>
                                                <div className="text-xs text-slate-500">{holding.name}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="bg-slate-800 text-slate-400 text-[10px] border-slate-700">
                                                {holding.assetClass}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right text-slate-300 font-mono">
                                            {holding.quantity.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right text-slate-300 font-mono">
                                            {formatCurrency(holding.currentPrice, holding.currency)}
                                        </TableCell>
                                        <TableCell className="text-right text-slate-200 font-bold font-mono">
                                            {formatCurrency(marketValue, holding.currency)}
                                        </TableCell>
                                        <TableCell className="text-right text-slate-400 text-xs font-mono">
                                            {formatCurrency(holding.avgCost, holding.currency)}
                                        </TableCell>
                                        <TableCell className={`text-right font-mono ${holding.unrealizedPL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            {holding.unrealizedPL >= 0 ? '+' : ''}{formatCurrency(holding.unrealizedPL, holding.currency)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className={`flex items-center justify-end gap-1 ${holding.plPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                {holding.plPercent >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                                {Math.abs(holding.plPercent).toFixed(2)}%
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
