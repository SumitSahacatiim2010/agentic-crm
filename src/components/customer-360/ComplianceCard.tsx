"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ShieldAlert, AlertTriangle, FileCheck, RefreshCw, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ComplianceData } from "@/lib/mock-data";
import { insforge } from "@/lib/insforge";

interface ComplianceCardProps {
    data: ComplianceData;
}

export function ComplianceCard({ data }: ComplianceCardProps) {
    const [loading, setLoading] = useState(false);
    const [screenResult, setScreenResult] = useState<{ status: string; flags?: any[] } | null>(null);

    const handleLiveScreen = async () => {
        setLoading(true);
        try {
            // Call InsForge Edge Function
            const { data, error } = await insforge.functions.invoke('aml-screen', {
                body: { name: 'Sterling Corp' }
            });

            if (error) throw error;

            // Result is in data (if the function returns JSON directly, SDK parses it? 
            // SDK usually returns { data, error }. The function returns a Response object.
            // insforge-js invoke parses the JSON response.
            const result = data as any;

            setScreenResult(result);

            if (result.status === 'HIT') {
                toast.error("AML ALERT: Sanctions Hit Detected", {
                    description: "Compliance team has been notified. Adverse media found."
                });
            } else {
                toast.success("AML Check Passed", {
                    description: "Entity is clear of sanctions via real-time screening."
                });
            }
        } catch (e: any) {
            console.error(e);
            toast.error("Screening Failed", { description: e.message || "Could not connect to AML Edge Function." });
        } finally {
            setLoading(false);
        }
    };

    const isHit = screenResult?.status === 'HIT';

    return (
        <Card className="bg-slate-900 border-slate-800 h-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-slate-100 flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-indigo-400" />
                        Compliance & Risk
                    </CardTitle>
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs border-slate-700 bg-slate-800/50"
                        onClick={handleLiveScreen}
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="h-3 w-3 mr-2 animate-spin" /> : <RefreshCw className="h-3 w-3 mr-2" />}
                        {loading ? 'Screening...' : 'Live Check'}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* KYC Status */}
                <div className="space-y-2">
                    <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">KYC Status</div>
                    <div className="flex items-center gap-2">
                        {data.kyc_status === 'Verified' ? (
                            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/50">Verified</Badge>
                        ) : (
                            <Badge variant="destructive">Action Required</Badge>
                        )}
                        <span className="text-xs text-slate-400">Refreshed: {data.kyc_refresh_date}</span>
                    </div>
                </div>

                {/* AML Risk */}
                <div className="space-y-2">
                    <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">AML Risk Rating</div>
                    <div className="flex items-center gap-2">
                        {data.aml_risk === 'Low' && <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/50">Low Risk</Badge>}
                        {data.aml_risk === 'Medium' && <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/50">Medium Risk</Badge>}
                        {data.aml_risk === 'High' && <Badge className="bg-red-500/10 text-red-500 border-red-500/50">High Risk</Badge>}
                    </div>
                </div>

                {/* Live Screening Result (Conditional) */}
                {screenResult && (
                    <div className="col-span-1 md:col-span-2 bg-slate-950 border border-slate-800 rounded p-3 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-slate-400 font-mono">Live API Result</span>
                            <Badge variant={isHit ? "destructive" : "outline"} className={!isHit ? "text-emerald-500 border-emerald-500" : ""}>
                                {screenResult.status}
                            </Badge>
                        </div>
                        {isHit && screenResult.flags && (
                            <div className="space-y-1">
                                {screenResult.flags.map((flag: any, i: number) => (
                                    <div key={i} className="text-[10px] text-red-400 flex items-center gap-1">
                                        <AlertTriangle className="h-3 w-3" />
                                        {flag.source}: {flag.type} ({flag.match})
                                    </div>
                                ))}
                            </div>
                        )}
                        {!isHit && (
                            <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                                <ShieldCheck className="h-3 w-3" /> No adverse media or sanctions matches found.
                            </div>
                        )}
                    </div>
                )}

                {/* PEP / Sanctions (Static Fallback) */}
                {!screenResult && (
                    <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4 bg-slate-800/50 p-4 rounded-lg border border-slate-800">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-300">Sanctions Screening</span>
                            {data.sanctions_flag ? (
                                <ShieldAlert className="h-5 w-5 text-red-500" />
                            ) : (
                                <FileCheck className="h-5 w-5 text-emerald-500" />
                            )}
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-300">PEP Status</span>
                            {data.pep_flag ? (
                                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                            ) : (
                                <FileCheck className="h-5 w-5 text-slate-500" />
                            )}
                        </div>
                    </div>
                )}

                {/* Tax Residency */}
                <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
                    <div>
                        <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">FATCA</div>
                        <div className="text-sm text-slate-200">{data.fatca_status}</div>
                    </div>
                    <div>
                        <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">CRS / Tax Residency</div>
                        <div className="text-sm text-slate-200">{data.crs_status}</div>
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}
