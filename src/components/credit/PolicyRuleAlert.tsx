"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { OctagonX, ShieldAlert } from "lucide-react";

interface PolicyRuleAlertProps {
    ltv: number;
    dscr: number;
}

export function PolicyRuleAlert({ ltv, dscr }: PolicyRuleAlertProps) {
    const isLtvBreach = ltv > 80;
    const isDscrBreach = dscr < 1.25;

    if (!isLtvBreach && !isDscrBreach) return null;

    return (
        <Alert variant="destructive" className="bg-rose-950/30 border-rose-500/50 text-rose-400 mb-4 animate-in fade-in slide-in-from-top-2">
            <OctagonX className="h-5 w-5" />
            <div className="ml-2">
                <AlertTitle className="font-bold">Hard Stop Rule Violation</AlertTitle>
                <AlertDescription className="text-rose-300/90 text-sm mt-1">
                    Auto-approval is blocked due to lending policy violations:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                        {isLtvBreach && (
                            <li>
                                <strong>Loan-to-Value (LTV)</strong> is {ltv.toFixed(1)}% (Max: 80.0%). Increase collateral or reduce loan amount.
                            </li>
                        )}
                        {isDscrBreach && (
                            <li>
                                <strong>DSCR</strong> is {dscr.toFixed(2)}x (Min: 1.25x). Insufficient cash flow coverage.
                            </li>
                        )}
                    </ul>
                </AlertDescription>
            </div>
        </Alert>
    );
}
