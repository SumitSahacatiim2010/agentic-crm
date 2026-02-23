"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert, Info } from "lucide-react";
import { OCCUPATIONS, SOURCE_OF_FUNDS } from "@/lib/onboarding-mock-data";

interface CDDFormProps {
    onComplete: (data: any) => void;
    onBack?: () => void;
}

export function CDDForm({ onComplete, onBack }: CDDFormProps) {
    const [occupation, setOccupation] = useState("");
    const [source, setSource] = useState("");
    const [turnover, setTurnover] = useState("");

    // Check if selected occupation is high risk
    const currentOccupation = OCCUPATIONS.find(occ => occ.id === occupation);
    const isHighRisk = currentOccupation?.risk === 'High';

    const handleSubmit = () => {
        onComplete({
            occupation,
            sourceOfFunds: source,
            turnover,
            riskLevel: currentOccupation?.risk || 'Low'
        });
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center space-y-2">
                <h3 className="text-lg font-medium text-white">Customer Due Diligence</h3>
                <p className="text-sm text-slate-400">Help us understand your financial profile</p>
            </div>

            <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-6 space-y-6">

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Occupation / Business Activity</label>
                        <select
                            value={occupation}
                            onChange={(e) => setOccupation(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select Occupation...</option>
                            {OCCUPATIONS.map(occ => (
                                <option key={occ.id} value={occ.id}>{occ.label}</option>
                            ))}
                        </select>
                    </div>

                    {isHighRisk && (
                        <Alert className="bg-amber-500/10 border-amber-500/50 text-amber-500 animate-in fade-in slide-in-from-top-2">
                            <ShieldAlert className="h-4 w-4" />
                            <AlertTitle>Enhanced Due Diligence (EDD) Required</AlertTitle>
                            <AlertDescription className="text-xs opacity-90">
                                Since you selected a cash-intensive or high-risk business activity, we are required to collect additional documentation regarding the source of your funds.
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Primary Source of Wealth/Funds</label>
                        <select
                            value={source}
                            onChange={(e) => setSource(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select Source...</option>
                            {SOURCE_OF_FUNDS.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Estimated Annual Turnover (USD)</label>
                        <input
                            type="number"
                            value={turnover}
                            onChange={(e) => setTurnover(e.target.value)}
                            placeholder="e.g. 150000"
                            className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {isHighRisk && (
                        <div className="bg-slate-950 border border-slate-800 rounded p-4 space-y-3">
                            <h4 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                <Info className="h-4 w-4 text-blue-500" /> Additional Requirements
                            </h4>
                            <div className="text-xs text-slate-400 space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                    <span>Proof of Business Ownership (Articles of Inc.)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                    <span>Last 3 Months Bank Statements</span>
                                </div>
                            </div>
                            <Button variant="secondary" size="sm" className="w-full mt-2">
                                Upload EDD Documents
                            </Button>
                        </div>
                    )}

                    <div className="flex gap-4">
                        {onBack && (
                            <Button variant="outline" onClick={onBack} className="w-1/3 border-slate-700 hover:bg-slate-800 text-slate-300">
                                Back
                            </Button>
                        )}
                        <Button
                            onClick={handleSubmit}
                            disabled={!occupation || !source}
                            className={`${onBack ? 'w-2/3' : 'w-full'} bg-blue-600 hover:bg-blue-700 text-white`}
                        >
                            Continue to Tax Info
                        </Button>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}
