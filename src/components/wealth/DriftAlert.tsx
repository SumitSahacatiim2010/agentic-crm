"use client";

import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DRIFT_ANALYSIS } from "@/lib/wealth-mock-data";
import { AlertTriangle, RefreshCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function DriftAlert() {
    const [isRebalancing, setIsRebalancing] = useState(false);
    const [isRebalanced, setIsRebalanced] = useState(false);

    const breaches = DRIFT_ANALYSIS.filter(d => d.isBreach);

    if (breaches.length === 0 || isRebalanced) return null;

    const handleRebalance = async () => {
        setIsRebalancing(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsRebalancing(false);
        setIsRebalanced(true);
        toast.success("Rebalance Workflow Initiated", { description: "Orders have been staged for review." });
    };

    return (
        <Alert className="bg-amber-500/10 border-amber-500/50 text-amber-500 mb-6">
            <AlertTriangle className="h-5 w-5" />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-4">
                <div>
                    <AlertTitle className="font-bold flex items-center gap-2">
                        Portfolio Drift Detected
                    </AlertTitle>
                    <AlertDescription className="text-amber-400/90 mt-1">
                        Asset allocation has deviated significantly from the target model.
                        <ul className="list-disc list-inside mt-2 text-sm">
                            {breaches.map(b => (
                                <li key={b.assetClass}>
                                    <strong>{b.assetClass}</strong> is {b.drift > 0 ? 'Overweight' : 'Underweight'} by {Math.abs(b.drift)}% (Target: {b.target}%)
                                </li>
                            ))}
                        </ul>
                    </AlertDescription>
                </div>
                <Button
                    onClick={handleRebalance}
                    disabled={isRebalancing}
                    variant="outline"
                    className="border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-white shrink-0"
                >
                    {isRebalancing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCcw className="h-4 w-4 mr-2" />}
                    {isRebalancing ? 'Rebalancing...' : 'Rebalance Portfolio'}
                </Button>
            </div>
        </Alert>
    );
}
