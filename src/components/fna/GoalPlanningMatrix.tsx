"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Target } from "lucide-react";
import { Goal, MOCK_GOALS } from "@/lib/fna-mock-data";

export function GoalPlanningMatrix() {
    const [goals, setGoals] = useState<Goal[]>(MOCK_GOALS);

    const getGoalsByHorizon = (horizon: Goal['horizon']) => {
        return goals.filter(g => g.horizon === horizon);
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
            {(['Short', 'Medium', 'Long'] as const).map((horizon) => (
                <Card key={horizon} className="bg-slate-900 border-slate-800 flex flex-col h-full ring-1 ring-white/5">
                    <CardHeader className="pb-2 border-b border-slate-800/50 bg-slate-900/50">
                        <CardTitle className="text-sm font-semibold text-slate-200 flex justify-between items-center">
                            {horizon} Term
                            <Badge variant="secondary" className="bg-slate-800 text-slate-400 font-mono text-xs">
                                {horizon === 'Short' ? '< 3 Yrs' : horizon === 'Medium' ? '3-10 Yrs' : '> 10 Yrs'}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 p-3 space-y-3 bg-slate-950/30">
                        {getGoalsByHorizon(horizon).map((goal) => (
                            <div key={goal.id} className="bg-slate-800 p-3 rounded-md border border-slate-700 hover:border-slate-600 transition-colors group relative">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-medium text-slate-200 text-sm">{goal.name}</span>
                                    <Badge className={`text-[10px] h-5 px-1.5 ${goal.priority === 'High' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                            goal.priority === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                        }`}>
                                        {goal.priority}
                                    </Badge>
                                </div>
                                <div className="text-lg font-bold text-slate-100">{formatCurrency(goal.amount)}</div>

                                {/* Visual "Handle" for implied drag and drop */}
                                <div className="absolute top-1/2 -right-1 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 cursor-grab px-1">
                                    <div className="h-4 w-1 bg-slate-600 rounded-full"></div>
                                </div>
                            </div>
                        ))}

                        <Button variant="ghost" className="w-full border border-dashed border-slate-800 text-slate-500 hover:text-slate-300 hover:bg-slate-900/80 h-10 text-xs">
                            <Plus className="h-3 w-3 mr-1" /> Add Goal
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
