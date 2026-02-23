"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NBARecommendation } from "@/lib/nba/engine";
import { Sparkles, Check, X, Clock, Info } from "lucide-react";

interface NBAExplainCardProps {
    recommendation: NBARecommendation;
    onAccept?: () => void;
    onDefer?: () => void;
    onDismiss?: () => void;
}

export function NBAExplainCard({ recommendation, onAccept, onDefer, onDismiss }: NBAExplainCardProps) {
    const { product = {}, score, top_factors = [], why_now, confidence } = recommendation;

    const confidenceColor = confidence === 'High' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
        : confidence === 'Medium' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
            : 'text-slate-400 bg-slate-500/10 border-slate-500/20';

    return (
        <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl -mr-10 -mt-10 pointer-events-none rounded-full" />

            <CardContent className="p-5 flex flex-col h-full z-10 relative">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                            <Sparkles className="h-5 w-5 text-indigo-400" />
                        </div>
                        <div>
                            <h4 className="text-white font-semibold text-sm">{product.product_name || 'Action Recommendation'}</h4>
                            <div className="text-xs text-slate-400 capitalize">{product.product_category || 'Advisory'}</div>
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="text-indigo-400 text-xl font-black">{score}<span className="text-xs font-normal text-slate-500">/100</span></div>
                        <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Propensity</div>
                    </div>
                </div>

                <div className="flex-1 space-y-4">
                    <div className="space-y-1.5">
                        <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wide">
                            <Info className="h-3 w-3 text-slate-500" /> Driver Factors
                        </div>
                        <div className="space-y-2">
                            {top_factors.map((f, i) => {
                                const percent = Math.min(100, Math.max(0, (f.weight / 30) * 100)); // Normalize assuming ~30 is max factor
                                return (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className="flex-1 text-xs text-slate-400 truncate">{f.factor}</div>
                                        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${percent}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-indigo-950/30 border border-indigo-500/20 p-3 rounded-md text-xs">
                        <strong className="text-indigo-300 block mb-1">Why Now?</strong>
                        <span className="text-slate-300 leading-relaxed">{why_now}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">Model Confidence</span>
                        <span className={`px-2 py-0.5 rounded border ${confidenceColor} font-medium`}>{confidence}</span>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-5">
                    <Button size="sm" variant="outline" onClick={onDismiss} className="text-xs h-8 border-slate-700 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 text-slate-400">
                        <X className="h-3.5 w-3.5 mr-1" /> Dismiss
                    </Button>
                    <Button size="sm" variant="outline" onClick={onDefer} className="text-xs h-8 border-slate-700 hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/30 text-slate-400">
                        <Clock className="h-3.5 w-3.5 mr-1" /> Defer
                    </Button>
                    <Button size="sm" onClick={onAccept} className="text-xs h-8 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-900/20">
                        <Check className="h-3.5 w-3.5 mr-1" /> Accept
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
