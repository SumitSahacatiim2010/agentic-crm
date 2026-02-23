"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CreditApplication } from "@/lib/credit-mock-data";
import { Building2, User } from "lucide-react";

interface CreditAssessmentDashboardProps {
    application: CreditApplication;
}

export function CreditAssessmentDashboard({ application }: CreditAssessmentDashboardProps) {
    // Mock calculation visuals
    const bureauPercentage = (application.creditScore / 850) * 100;
    const riskRatingInverted = 100 - (application.riskRating * 10); // 1 is best (90%), 10 is worst (0%)

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* External Bureau */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-wider">External Bureau Data</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-end mb-2">
                        <div>
                            <div className="text-3xl font-bold text-white">{application.creditScore}</div>
                            <div className="text-xs text-slate-400">FICO Score 8</div>
                        </div>
                        <div className={`text-sm font-bold ${application.creditScore > 720 ? 'text-emerald-400' : application.creditScore > 640 ? 'text-amber-400' : 'text-rose-400'}`}>
                            {application.creditScore > 720 ? 'Excellent' : application.creditScore > 640 ? 'Fair' : 'Poor'}
                        </div>
                    </div>
                    <Progress value={bureauPercentage} className="h-2 bg-slate-800" indicatorClassName={application.creditScore > 700 ? 'bg-emerald-500' : 'bg-amber-500'} />
                    <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-xs border-b border-slate-800 pb-1">
                            <span className="text-slate-500">Bureau</span>
                            <span className="text-slate-300">Experian Commercial</span>
                        </div>
                        <div className="flex justify-between text-xs border-b border-slate-800 pb-1">
                            <span className="text-slate-500">Public Records</span>
                            <span className="text-slate-300">0 Bankruptcies</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Trade Lines</span>
                            <span className="text-slate-300">12 Open, 98% On-Time</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Internal Risk */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-wider">Internal Risk Rating</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-end mb-2">
                        <div>
                            <div className="text-3xl font-bold text-white">ORR-{application.riskRating}</div>
                            <div className="text-xs text-slate-400">Obligor Risk Rating</div>
                        </div>
                        <div className={`text-sm font-bold ${application.riskRating <= 4 ? 'text-emerald-400' : application.riskRating <= 7 ? 'text-amber-400' : 'text-rose-400'}`}>
                            {application.riskRating <= 4 ? 'Investment Grade' : 'Sub-Standard'}
                        </div>
                    </div>
                    <Progress value={riskRatingInverted} className="h-2 bg-slate-800" indicatorClassName={application.riskRating <= 4 ? 'bg-emerald-500' : 'bg-rose-500'} />
                    <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-xs border-b border-slate-800 pb-1">
                            <span className="text-slate-500">Model</span>
                            <span className="text-slate-300">SME Scorecard v4.2</span>
                        </div>
                        <div className="flex justify-between text-xs border-b border-slate-800 pb-1">
                            <span className="text-slate-500">PD (Prob. Default)</span>
                            <span className="text-slate-300">{(application.riskRating * 0.75).toFixed(2)}%</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Last Review</span>
                            <span className="text-slate-300">Auto-Refreshed Today</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}
