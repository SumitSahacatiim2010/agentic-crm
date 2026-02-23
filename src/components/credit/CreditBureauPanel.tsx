"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ModelScoreCard } from "@/components/ai-explainability/ModelScoreCard";

interface Props { applicationId: string; applicantName: string; businessName?: string; initialData?: any; }

function ScoreArc({ score }: { score: number }) {
    const pct = Math.max(0, Math.min(100, ((score - 300) / 550) * 100));
    const color = score >= 720 ? '#10b981' : score >= 640 ? '#f59e0b' : '#ef4444';
    const label = score >= 720 ? 'Excellent' : score >= 640 ? 'Fair' : 'Poor';
    return (
        <div className="flex flex-col items-center">
            <svg viewBox="0 0 120 70" className="w-40">
                <path d="M10 60 A50 50 0 0 1 110 60" fill="none" stroke="#1e293b" strokeWidth="8" strokeLinecap="round" />
                <path d="M10 60 A50 50 0 0 1 110 60" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${pct * 1.57} 157`} className="transition-all duration-700" />
            </svg>
            <p className="text-2xl font-bold text-white -mt-3">{score}</p>
            <p className="text-xs font-semibold" style={{ color }}>{label}</p>
        </div>
    );
}

export function CreditBureauPanel({ applicationId, applicantName, businessName, initialData }: Props) {
    const [report, setReport] = useState<any>(initialData || null);
    const [pulling, setPulling] = useState(false);

    // AI Score State
    const [aiScore, setAiScore] = useState<any>(null);
    const [aiLoading, setAiLoading] = useState(false);

    const pull = async () => {
        setPulling(true);
        setAiLoading(true);
        try {
            // Parallel fetch Bureau + AI Model
            const [bureauRes, aiRes] = await Promise.all([
                fetch('/api/credit/bureau-pull', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ application_id: applicationId, applicant_name: applicantName, business_name: businessName }),
                }),
                fetch(`/api/mock/models/credit-score?customer_id=${encodeURIComponent(applicantName)}`)
            ]);

            const json = await bureauRes.json();
            if (bureauRes.ok) {
                setReport(json);
                toast.success('Bureau report pulled');
            } else toast.error(json.error);

            if (aiRes.ok) {
                const aiData = await aiRes.json();
                setAiScore(aiData);
            }

        } catch { toast.error('Network error'); }
        setPulling(false);
        setAiLoading(false);
    };

    if (!report) return (
        <div className="flex flex-col items-center gap-4 py-12">
            <p className="text-sm text-slate-400">No bureau report on file</p>
            <Button className="bg-indigo-600 hover:bg-indigo-700" disabled={pulling} onClick={pull}>{pulling ? 'Pulling…' : '🔍 Pull Bureau Report'}</Button>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center">
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">FICO Score</p>
                    <ScoreArc score={report.fico_score} />
                    <p className="text-[10px] text-slate-600 mt-4">Experian Commercial</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Delinquency History</p>
                    {[['30-Day', report.delinquency_30], ['60-Day', report.delinquency_60], ['90-Day', report.delinquency_90]].map(([l, v]) => (
                        <div key={l as string} className="flex justify-between text-xs border-b border-slate-800 pb-1">
                            <span className="text-slate-400">{l} Delinquencies</span>
                            <span className={`font-mono font-bold ${(v as number) > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{v as number}</span>
                        </div>
                    ))}
                    <div className="flex justify-between text-xs border-b border-slate-800 pb-1 pt-2">
                        <span className="text-slate-400">Trade Lines Open</span>
                        <span className="font-mono font-bold text-white">{report.trade_lines_open}</span>
                    </div>
                    <div className="flex justify-between text-xs border-b border-slate-800 pb-1">
                        <span className="text-slate-400">On-Time Payment %</span>
                        <span className="font-mono font-bold text-white">{report.on_time_pct}%</span>
                    </div>
                    <div className="flex justify-between text-xs border-b border-slate-800 pb-1">
                        <span className="text-slate-400">Bankruptcies</span>
                        <span className={`font-mono font-bold ${report.bankruptcies > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{report.bankruptcies}</span>
                    </div>
                    <div className="flex justify-between text-xs pt-1">
                        <span className="text-slate-400">Public Records</span>
                        <span className="font-mono font-bold text-white">{report.public_records}</span>
                    </div>
                </div>
            </div>

            {aiScore && (
                <div className="pt-2 border-t border-slate-800/50">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">InsForge ML Assessment</h3>
                    <ModelScoreCard
                        title="Alternative Credit Model"
                        description="Internal ML scoring based on transaction telemetry and cashflow."
                        score={aiScore.score}
                        maxScore={850}
                        riskBadge={`Grade ${aiScore.risk_grade}`}
                        riskBadgeVariant={aiScore.risk_grade === 'A' || aiScore.risk_grade === 'B' ? 'success' : aiScore.risk_grade === 'C' ? 'warning' : 'destructive'}
                        factors={aiScore.top_factors}
                        modelVersion={aiScore.model}
                        lastEvaluated={aiScore.evaluated_at}
                        onOverride={() => toast.info('Override Dialog Opened', { description: 'Manual credit officer justification required.' })}
                    />
                </div>
            )}

            <Button variant="outline" className="border-slate-700 text-slate-400 w-full" onClick={pull} disabled={pulling}>{pulling ? 'Re-pulling…' : '🔄 Re-pull Bureau & ML Score'}</Button>
        </div>
    );
}
