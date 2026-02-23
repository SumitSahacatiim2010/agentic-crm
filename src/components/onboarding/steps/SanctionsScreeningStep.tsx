"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle, XCircle, ShieldCheck } from "lucide-react";

export interface SanctionsData {
    outcome: 'CLEAR' | 'INCONCLUSIVE' | 'HIT';
    score: number;
    account_number?: string;
    sort_code?: string;
    case_id?: string;
}

interface Props {
    applicationId: string;
    fullName: string;
    nationality: string;
    data: Partial<SanctionsData>;
    onNext: (d: SanctionsData) => void;
    onBack: () => void;
}

export function SanctionsScreeningStep({ applicationId, fullName, nationality, data, onNext, onBack }: Props) {
    const [screening, setScreening] = useState(!data.outcome);
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState<SanctionsData | null>(data.outcome ? data as SanctionsData : null);
    const [error, setError] = useState('');

    useEffect(() => { if (!data.outcome) runScreening(); }, []); // eslint-disable-line

    const runScreening = async () => {
        setScreening(true); setProgress(0);
        for (const p of [15, 30, 50, 70, 88, 100]) {
            await new Promise(r => setTimeout(r, 350));
            setProgress(p);
        }
        try {
            const res = await fetch('/api/onboarding/sanctions-screen', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ application_id: applicationId, full_name: fullName, nationality }),
            });
            const json = await res.json();
            if (res.ok) setResult({ outcome: json.outcome, score: json.score, account_number: json.account_number, sort_code: json.sort_code, case_id: json.case_id });
            else setError(json.error || 'Screening failed');
        } catch { setError('Network error'); }
        setScreening(false);
    };

    const caseRef = result?.case_id ? `SC-${result.case_id.slice(0, 8).toUpperCase()}` : '';

    return (
        <div className="space-y-5">
            {screening && (
                <div className="space-y-4 py-8">
                    <div className="flex flex-col items-center gap-3">
                        <ShieldCheck className="h-10 w-10 text-indigo-400 animate-pulse" />
                        <p className="text-sm font-semibold text-slate-200">Screening against global sanctions and PEP databases…</p>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full transition-all duration-400" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="text-xs text-slate-600 text-center">{progress}% complete</p>
                </div>
            )}

            {error && <div className="p-4 bg-red-950/40 border border-red-700/40 rounded-xl text-sm text-red-300">{error}</div>}

            {result?.outcome === 'CLEAR' && (
                <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-emerald-950/30 border border-emerald-700/40 rounded-xl text-emerald-300">
                        <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold text-sm">✅ Screening complete — No adverse findings</p>
                            <p className="text-xs text-emerald-400/70 mt-1">Your account is being provisioned automatically.</p>
                        </div>
                    </div>
                    <div className="p-5 bg-slate-900 border border-emerald-700/20 rounded-2xl space-y-4">
                        <p className="font-bold text-base text-white">🎉 Account Approved!</p>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-950 rounded-xl p-3">
                                <p className="text-[10px] text-slate-600 uppercase tracking-wide mb-1">Account Number</p>
                                <p className="font-mono text-lg font-bold text-white">{result.account_number}</p>
                            </div>
                            <div className="bg-slate-950 rounded-xl p-3">
                                <p className="text-[10px] text-slate-600 uppercase tracking-wide mb-1">Sort Code</p>
                                <p className="font-mono text-lg font-bold text-white">{result.sort_code}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {result?.outcome === 'INCONCLUSIVE' && (
                <div className="flex items-start gap-3 p-4 bg-amber-950/30 border border-amber-700/40 rounded-xl text-amber-300">
                    <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold text-sm">⚠️ Manual review required</p>
                        <p className="text-xs text-amber-400/70 mt-1">Case ref: <span className="font-mono font-bold">{caseRef}</span></p>
                        <p className="text-xs text-amber-400/70">A compliance officer will contact you within 3 business days.</p>
                    </div>
                </div>
            )}

            {result?.outcome === 'HIT' && (
                <div className="flex items-start gap-3 p-4 bg-red-950/40 border border-red-700/40 rounded-xl text-red-300">
                    <XCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold text-sm">🚫 Application cannot be processed automatically</p>
                        <p className="text-xs text-red-400/70 mt-1">Case ref: <span className="font-mono font-bold">{caseRef}</span></p>
                        <p className="text-xs text-red-400/70">Do not re-apply. You will be contacted within 5 business days.</p>
                    </div>
                </div>
            )}

            <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={onBack} className="border-slate-700 text-slate-300" disabled={screening}>← Back</Button>
                {result && result.outcome !== 'HIT' && (
                    <Button className="bg-indigo-600 hover:bg-indigo-700 font-semibold" onClick={() => onNext(result)}>
                        Continue to Review →
                    </Button>
                )}
            </div>
        </div>
    );
}
