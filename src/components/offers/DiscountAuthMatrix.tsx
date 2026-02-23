"use client";

import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, ShieldAlert } from "lucide-react";

interface DiscountAuthMatrixProps {
    finalRate: number;
    floorRate: number;
    baseRate: number;
}

export function DiscountAuthMatrix({ finalRate, floorRate, baseRate }: DiscountAuthMatrixProps) {
    const needsApproval = finalRate < floorRate;
    const isDiscounted = finalRate < baseRate;

    return (
        <div className="mt-4 p-4 rounded-lg bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Approval Status</span>
                {needsApproval ? (
                    <Badge variant="destructive" className="bg-amber-900/50 text-amber-500 border-amber-900">
                        <ShieldAlert className="h-3 w-3 mr-1" /> Pending Committee Approval
                    </Badge>
                ) : (
                    <Badge variant="outline" className="bg-emerald-900/20 text-emerald-400 border-emerald-900">
                        <CheckCircle className="h-3 w-3 mr-1" /> Auto-Approved
                    </Badge>
                )}
            </div>

            <div className="text-xs text-slate-400">
                {needsApproval ? (
                    <>
                        Requested rate of <strong className="text-amber-400">{finalRate.toFixed(2)}%</strong> is below the floor rate of <strong className="text-slate-300">{floorRate.toFixed(2)}%</strong>.
                        An escalation workflow will be triggered upon submission.
                    </>
                ) : isDiscounted ? (
                    <>
                        Rate is within the auto-approval delegation authority (Floor: {floorRate.toFixed(2)}%).
                    </>
                ) : (
                    <>
                        Standard pricing applied. No discount waivers requested.
                    </>
                )}
            </div>
        </div>
    );
}
