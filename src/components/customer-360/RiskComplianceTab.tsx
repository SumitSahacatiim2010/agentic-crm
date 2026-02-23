"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, AlertTriangle, RefreshCw, CheckCircle2, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { ModelScoreCard } from "@/components/ai-explainability/ModelScoreCard";
import { fmtDate, fmtDateTime } from "@/lib/date-utils";

interface ComplianceProfile {
    kyc_status?: string;
    kyc_expiry?: string;
    aml_risk_rating?: string;
    pep_status?: boolean;
    fatca_crs_status?: string;
}

interface SanctionsLogEntry {
    log_id?: string;
    screen_result?: string;
    risk_score?: string;
    flags?: any;
    screened_at?: string;
}

interface RiskComplianceTabProps {
    partyId: string;
    displayName: string;
    compliance: ComplianceProfile | null;
    sanctionsLog: SanctionsLogEntry[];
}

const AML_COLORS: Record<string, string> = {
    Low: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30',
    Medium: 'text-amber-400 bg-amber-950/40 border-amber-500/30',
    High: 'text-red-400 bg-red-950/40 border-red-500/30',
};

const KYC_COLORS: Record<string, string> = {
    verified: 'text-emerald-400', pending: 'text-amber-400', expired: 'text-red-400', unknown: 'text-slate-400'
};

export function RiskComplianceTab({ partyId, displayName, compliance, sanctionsLog: initialLog }: RiskComplianceTabProps) {
    const [log, setLog] = useState<SanctionsLogEntry[]>(initialLog);
    const [screening, setScreening] = useState(false);
    const [lastResult, setLastResult] = useState<any>(null);
    const [aiScore, setAiScore] = useState<any>(null);

    useEffect(() => {
        const fetchAiScore = async () => {
            try {
                const res = await fetch(`/api/mock/models/aml-risk?customer_id=${partyId}`);
                if (res.ok) setAiScore(await res.json());
            } catch (e) {
                console.error("Failed to load AML ML score", e);
            }
        };
        fetchAiScore();
    }, [partyId]);

    const handleReScreen = async () => {
        setScreening(true);
        try {
            const res = await fetch('/api/edge-proxy/aml-screen', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ full_name: displayName })
            });
            const data = await res.json();
            setLastResult(data);

            // Log to DB
            await fetch('/api/compliance/log-screen', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    party_id: partyId,
                    screen_result: data.status,
                    risk_score: data.riskScore,
                    flags: data.flags || [],
                    screened_at: new Date().toISOString(),
                })
            });

            const newEntry: SanctionsLogEntry = {
                screen_result: data.status,
                risk_score: data.riskScore,
                flags: data.flags || [],
                screened_at: new Date().toISOString(),
            };
            setLog(prev => [newEntry, ...prev]);

            if (data.status === 'CLEAR') toast.success("AML Screen: CLEAR — No adverse matches", { icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" /> });
            else if (data.status === 'HIT') toast.error("AML Screen: HIT — Review required", { description: `Match: ${data.flags?.[0]?.match_pct}% OFAC` });
            else toast.warning("AML Screen: INCONCLUSIVE — Manual review needed");
        } catch (e) {
            toast.error("AML screening failed");
        } finally {
            setScreening(false);
        }
    };

    const kycStatus = compliance?.kyc_status || 'unknown';
    const amlRating = compliance?.aml_risk_rating || 'Low';
    const isPep = compliance?.pep_status || false;

    return (
        <div className="space-y-6">
            {/* Compliance Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <p className="text-xs text-slate-500 mb-1">KYC Status</p>
                    <p className={`text-lg font-bold capitalize ${KYC_COLORS[kycStatus] || 'text-slate-300'}`}>{kycStatus}</p>
                    {compliance?.kyc_expiry && <p className="text-[10px] text-slate-600 mt-1">Expiry: {fmtDate(compliance.kyc_expiry)}</p>}
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <p className="text-xs text-slate-500 mb-1">AML Risk Rating</p>
                    <span className={`text-sm font-bold px-2 py-1 rounded border ${AML_COLORS[amlRating] || 'text-slate-300'}`}>{amlRating}</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <p className="text-xs text-slate-500 mb-1">PEP Status</p>
                    {isPep
                        ? <div className="flex items-center gap-1.5 text-red-400"><AlertTriangle className="h-4 w-4" /><span className="font-bold text-sm">PEP Flagged</span></div>
                        : <div className="flex items-center gap-1.5 text-emerald-400"><CheckCircle2 className="h-4 w-4" /><span className="font-bold text-sm">Not PEP</span></div>}
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <p className="text-xs text-slate-500 mb-1">FATCA / CRS</p>
                    <p className="text-sm font-bold text-slate-300 capitalize">{compliance?.fatca_crs_status || 'Not classified'}</p>
                </div>
            </div>

            {/* Re-Screen */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="font-semibold text-slate-100">AML / Sanctions Screening</h3>
                        <p className="text-xs text-slate-500">Live screen via InsForge AML edge function</p>
                    </div>
                    <Button size="sm" className="bg-amber-700 hover:bg-amber-600 text-white gap-1.5" onClick={handleReScreen} disabled={screening}>
                        <RefreshCw className={`h-3.5 w-3.5 ${screening ? 'animate-spin' : ''}`} />
                        {screening ? 'Screening…' : 'Re-Screen Now'}
                    </Button>
                </div>

                {lastResult && (
                    <div className={`p-3 rounded-lg border mb-4 text-sm ${lastResult.status === 'CLEAR' ? 'bg-emerald-950/30 border-emerald-700/30 text-emerald-300' : lastResult.status === 'HIT' ? 'bg-red-950/30 border-red-700/30 text-red-300' : 'bg-amber-950/30 border-amber-700/30 text-amber-300'}`}>
                        <strong>{lastResult.status}</strong> · Risk: {lastResult.riskScore}
                        {lastResult.status === 'HIT' && lastResult.flags?.length > 0 && (
                            <div className="mt-1 text-xs">
                                {lastResult.flags.map((f: any, i: number) => <div key={i}>↳ {f.type} — {f.match_pct}% match on {f.list}</div>)}
                            </div>
                        )}
                    </div>
                )}

                {/* Sanctions Log */}
                <div className="space-y-2 mt-6">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Screening History</p>
                    {log.length === 0 && <p className="text-slate-600 text-xs">No prior screenings on record.</p>}
                    {log.slice(0, 10).map((entry, i) => (
                        <div key={i} className="flex items-center justify-between bg-slate-950/50 border border-slate-800 rounded-lg px-3 py-2">
                            <div className="flex items-center gap-2">
                                {entry.screen_result === 'CLEAR'
                                    ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                    : entry.screen_result === 'HIT'
                                        ? <XCircle className="h-3.5 w-3.5 text-red-400" />
                                        : <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />}
                                <span className={`text-xs font-bold ${entry.screen_result === 'CLEAR' ? 'text-emerald-300' : entry.screen_result === 'HIT' ? 'text-red-300' : 'text-amber-300'}`}>
                                    {entry.screen_result || 'Unknown'}
                                </span>
                                {entry.risk_score && <span className="text-xs text-slate-500">· {entry.risk_score} risk</span>}
                            </div>
                            {entry.screened_at && (
                                <div className="flex items-center gap-1 text-[10px] text-slate-600">
                                    <Clock className="h-3 w-3" />
                                    {fmtDateTime(entry.screened_at)}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* AI ML Model Score */}
            {aiScore && (
                <div className="pt-2">
                    <ModelScoreCard
                        title="Continuous AML Risk Monitor"
                        description="AI-driven transaction surveillance & network anomaly detection."
                        score={aiScore.risk_score}
                        maxScore={100}
                        riskBadge={`${aiScore.risk_rating} Risk`}
                        riskBadgeVariant={aiScore.risk_rating === 'Low' ? 'success' : aiScore.risk_rating === 'Medium' ? 'warning' : 'destructive'}
                        factors={aiScore.risk_factors}
                        modelVersion={aiScore.model}
                        lastEvaluated={aiScore.screened_at}
                    />
                </div>
            )}
        </div>
    );
}
