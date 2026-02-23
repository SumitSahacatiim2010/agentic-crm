"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle, ScanLine, Loader2 } from "lucide-react";
import { toast } from "sonner";

const DOC_TYPES = [
    { id: 'passport', label: 'Passport', emoji: '🛂' },
    { id: 'national_id', label: 'National ID', emoji: '🪪' },
    { id: 'driving_licence', label: 'Driving Licence', emoji: '🚗' },
] as const;

export interface EKYCData {
    doc_type: string;
    kyc_status: 'provisionally_verified' | 'manual_review';
    name_match_score: number;
    auth_score: number;
    tamper_flag: boolean;
    dob_match: boolean;
}

interface Props {
    applicationId: string;
    fullName: string;
    dob: string;
    data: Partial<EKYCData>;
    onNext: (d: EKYCData) => void;
    onBack: () => void;
}

function ScoreBar({ score, label }: { score: number; label: string }) {
    const color = score >= 70 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500';
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-400">
                <span>{label}</span><span className="font-mono font-bold text-slate-200">{score}/100</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${score}%` }} />
            </div>
        </div>
    );
}

export function EKYCStep({ applicationId, fullName, dob, data, onNext, onBack }: Props) {
    const [docType, setDocType] = useState<string>(data.doc_type || 'passport');
    const [scanning, setScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [result, setResult] = useState<EKYCData | null>(
        data.kyc_status ? data as EKYCData : null
    );

    const handleCapture = async () => {
        setScanning(true);
        setScanProgress(0);
        // Deterministic 3-second animation
        const steps = [10, 25, 45, 65, 80, 95, 100];
        for (let i = 0; i < steps.length; i++) {
            await new Promise(r => setTimeout(r, 400));
            setScanProgress(steps[i]);
        }

        try {
            const res = await fetch('/api/onboarding/ekyc-simulate', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ full_name: fullName, dob, doc_type: docType, application_id: applicationId }),
            });
            const json = await res.json();
            if (res.ok) {
                setResult({
                    doc_type: docType, kyc_status: json.kyc_outcome, name_match_score: json.name_match_score,
                    auth_score: json.auth_score, tamper_flag: json.tamper_flag, dob_match: json.dob_match
                });
            } else toast.error("eKYC check failed: " + json.error);
        } catch { toast.error("Network error during eKYC"); }
        setScanning(false);
    };

    return (
        <div className="space-y-5">
            {/* Document type */}
            <div className="space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Select Document Type</p>
                <div className="grid grid-cols-3 gap-3">
                    {DOC_TYPES.map(d => (
                        <button key={d.id} onClick={() => { setDocType(d.id); setResult(null); }}
                            className={`flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 text-sm font-semibold transition-all ${docType === d.id ? 'border-indigo-500 bg-indigo-950/40 text-indigo-300' : 'border-slate-700 text-slate-500 hover:border-slate-600'}`}>
                            <span className="text-2xl">{d.emoji}</span>{d.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Capture area */}
            <div className="relative rounded-2xl border-2 border-dashed border-slate-700 bg-slate-900/50 overflow-hidden" style={{ minHeight: 160 }}>
                {/* Camera frame */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    {scanning ? (
                        <div className="w-full px-8 space-y-3">
                            <div className="flex items-center gap-2 text-indigo-300 text-sm">
                                <ScanLine className="h-4 w-4 animate-pulse" />
                                Scanning document…
                            </div>
                            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 rounded-full transition-all duration-400"
                                    style={{ width: `${scanProgress}%` }} />
                            </div>
                            <p className="text-[10px] text-slate-600 text-center">Running authenticity analysis… {scanProgress}%</p>
                        </div>
                    ) : result ? (
                        <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                            <CheckCircle2 className="h-5 w-5" /> Document captured
                        </div>
                    ) : (
                        <>
                            <div className="text-slate-700 text-4xl">📄</div>
                            <p className="text-xs text-slate-600">Position your document in the frame</p>
                        </>
                    )}
                </div>

                {/* corner brackets */}
                {['top-2 left-2', 'top-2 right-2', 'bottom-2 left-2', 'bottom-2 right-2'].map((pos, i) => (
                    <div key={i} className={`absolute ${pos} w-5 h-5 border-indigo-600 ${i < 2 ? 'border-t-2' : 'border-b-2'} ${i % 2 === 0 ? 'border-l-2' : 'border-r-2'} rounded-sm`} />
                ))}

                <div className="py-24" />
            </div>

            <Button onClick={handleCapture} disabled={scanning} className="w-full bg-indigo-600 hover:bg-indigo-700">
                {scanning ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Scanning…</> : '📷 Capture Document'}
            </Button>

            {/* Results panel */}
            {result && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 animate-in slide-in-from-bottom-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">eKYC Results</p>
                    <ScoreBar score={result.name_match_score} label="Name Match Score" />
                    <ScoreBar score={result.auth_score} label="Document Authenticity Score" />
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Date of Birth Match</span>
                        <span className={result.dob_match ? 'text-emerald-400' : 'text-red-400'}>
                            {result.dob_match ? '✓ Match' : '✗ No Match'}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Tamper Detection</span>
                        <span className={result.tamper_flag ? 'text-amber-400' : 'text-emerald-400'}>
                            {result.tamper_flag ? '⚠ Tampering suspected' : '✅ No tampering detected'}
                        </span>
                    </div>

                    {result.tamper_flag && (
                        <div className="flex items-start gap-2 p-3 bg-amber-950/30 border border-amber-700/40 rounded-lg text-xs text-amber-300">
                            <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                            Document authenticity check flagged for manual review. You may continue — a compliance officer will contact you.
                        </div>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${result.kyc_status === 'provisionally_verified' ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-700/30' : 'bg-amber-950/50 text-amber-300 border border-amber-700/30'}`}>
                            {result.kyc_status === 'provisionally_verified' ? '✓ Provisionally Verified' : '⚠ Requires Manual Review'}
                        </span>
                    </div>
                </div>
            )}

            <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={onBack} className="border-slate-700 text-slate-300">← Back</Button>
                <Button className="bg-indigo-600 hover:bg-indigo-700 font-semibold" disabled={!result} onClick={() => result && onNext(result)}>
                    Next: CDD Questionnaire →
                </Button>
            </div>
        </div>
    );
}
