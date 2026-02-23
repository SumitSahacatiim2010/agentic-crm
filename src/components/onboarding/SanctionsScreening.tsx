"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldCheck, ShieldAlert, Loader2, PlayCircle, AlertTriangle, FileSearch } from "lucide-react";
import { SANCTIONS_HITS } from "@/lib/onboarding-mock-data";

interface SanctionsScreeningProps {
    onComplete: (data: any) => void;
    onBack?: () => void;
}

export function SanctionsScreening({ onComplete, onBack }: SanctionsScreeningProps) {
    const [status, setStatus] = useState<'idle' | 'running' | 'clear' | 'hit'>('idle');
    const [hits, setHits] = useState<any[]>([]);

    const runScreening = (forceHit = false) => {
        setStatus('running');
        setTimeout(() => {
            if (forceHit) {
                setStatus('hit');
                setHits(SANCTIONS_HITS);
            } else {
                setStatus('clear');
                setHits([]);
                setTimeout(() => onComplete({ status: 'clear' }), 1000);
            }
        }, 2000);
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center space-y-2">
                <h3 className="text-lg font-medium text-white">AML & Sanctions Screening</h3>
                <p className="text-sm text-slate-400">Final regulatory check before account opening</p>
            </div>

            <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-8 flex flex-col items-center justify-center space-y-6">

                    {status === 'idle' && (
                        <div className="text-center space-y-6">
                            <div className="h-20 w-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                                <ShieldCheck className="h-10 w-10 text-slate-400" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-slate-300">Ready to screen against:</p>
                                <div className="flex flex-wrap justify-center gap-2">
                                    <Badge variant="outline">OFAC SDN</Badge>
                                    <Badge variant="outline">UN Consolidated</Badge>
                                    <Badge variant="outline">EU Sanctions</Badge>
                                    <Badge variant="outline">HM Treasury</Badge>
                                </div>
                            </div>
                            <div className="flex flex-col gap-4">
                                <div className="flex gap-4 justify-center">
                                    <Button onClick={() => runScreening(false)} className="bg-blue-600 hover:bg-blue-700">
                                        <PlayCircle className="h-4 w-4 mr-2" /> Run Check (Clear)
                                    </Button>
                                    <Button onClick={() => runScreening(true)} variant="outline" className="text-amber-500 border-amber-500/50 hover:bg-amber-500/10">
                                        <AlertTriangle className="h-4 w-4 mr-2" /> Simulate Hit
                                    </Button>
                                </div>
                                {onBack && (
                                    <div className="flex justify-center mt-2">
                                        <Button variant="outline" onClick={onBack} className="border-slate-700 hover:bg-slate-800 text-slate-300 w-full max-w-md">
                                            Back
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {status === 'running' && (
                        <div className="text-center space-y-4">
                            <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto" />
                            <p className="text-slate-300 animate-pulse">Querying Global Databases...</p>
                        </div>
                    )}

                    {status === 'clear' && (
                        <div className="text-center space-y-4 animate-in zoom-in-50">
                            <div className="h-20 w-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                                <ShieldCheck className="h-10 w-10" />
                            </div>
                            <h3 className="text-xl font-bold text-white">No Matches Found</h3>
                            <p className="text-slate-400">Applicant is clear to proceed.</p>
                        </div>
                    )}

                    {status === 'hit' && (
                        <div className="w-full space-y-6 animate-in slide-in-from-bottom-5">
                            <Alert variant="destructive" className="bg-red-500/10 border-red-500/50 text-red-500">
                                <ShieldAlert className="h-4 w-4" />
                                <AlertTitle>Potential Sanctions Matches Detected</AlertTitle>
                                <AlertDescription>
                                    Automated screening identified {hits.length} potential match(es). Manual review required.
                                </AlertDescription>
                            </Alert>

                            <div className="space-y-3">
                                {hits.map(hit => (
                                    <div key={hit.id} className="bg-slate-950 border border-slate-800 p-4 rounded-lg flex items-start justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="destructive">{hit.list}</Badge>
                                                <span className="font-mono text-xs text-slate-500">{hit.id}</span>
                                            </div>
                                            <p className="font-semibold text-slate-200">{hit.entity_name}</p>
                                            <p className="text-xs text-slate-400">Match Score: <span className="text-amber-500">{hit.match_score}%</span></p>
                                        </div>
                                        <Button size="sm" variant="outline" className="border-slate-700">
                                            <FileSearch className="h-3 w-3 mr-2" /> Review
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                <h4 className="text-sm font-medium text-slate-300 mb-2">False Positive Resolution Workflow</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <Button variant="outline" className="border-slate-600 hover:text-emerald-400 hover:border-emerald-400">
                                        Mark as False Positive
                                    </Button>
                                    <Button variant="outline" className="border-slate-600 hover:text-red-400 hover:border-red-400">
                                        Confirm True Match
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                </CardContent>
            </Card>
        </div>
    );
}
