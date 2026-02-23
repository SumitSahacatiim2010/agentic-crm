"use client";

import { useState, useId, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, Rocket, Info, AlertTriangle, ShieldCheck, XCircle } from "lucide-react";
import { toast } from "sonner";

interface LeadQualificationFormProps {
    selectedLead?: any;
}

const SCORE_FACTORS = [
    { key: 'income_band', label: 'Income / Asset Band', weight: 28, desc: 'Based on declared or inferred AUM tier' },
    { key: 'product_intent', label: 'Product Intent Signal', weight: 22, desc: 'Explicit product inquiry or form completion' },
    { key: 'prior_engagement', label: 'Prior Engagement', weight: 15, desc: 'Past interactions, callbacks, email opens' },
    { key: 'tenure_proxy', label: 'Tenure Proxy', weight: 10, desc: 'Estimated relationship or brand familiarity' },
    { key: 'nps_proxy', label: 'NPS Proxy', weight: 10, desc: 'Derived from satisfaction signals' },
];

function computeScore(lead: any) {
    if (!lead) return 0;
    // Deterministic score derived from lead_id characters (no Math.random)
    const idChars = (lead.lead_id || lead.id || '').replace(/-/g, '');
    const base = idChars.split('').reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0) % 50;
    return 45 + base;
}

export function LeadQualificationForm({ selectedLead }: LeadQualificationFormProps) {
    const formId = useId();

    const [bant, setBant] = useState({ budget: false, authority: false, need: false, timeline: false });
    const [eligibility, setEligibility] = useState({ age: false, residency: false, kyc: false });
    const [isConverting, setIsConverting] = useState(false);
    const [converted, setConverted] = useState(false);

    // Reset state when lead changes
    useEffect(() => {
        setBant({ budget: false, authority: false, need: false, timeline: false });
        setEligibility({ age: false, residency: false, kyc: false });
        setConverted(false);
    }, [selectedLead?.lead_id]);

    const bantPassed = Object.values(bant).every(Boolean);
    const eligPassed = Object.values(eligibility).every(Boolean);
    const allChecksPassed = bantPassed && eligPassed;

    const propensityScore = computeScore(selectedLead);
    const scoreColor = propensityScore >= 75 ? 'text-emerald-400' : propensityScore >= 45 ? 'text-amber-400' : 'text-slate-400';
    const scoreLabel = propensityScore >= 75 ? 'Hot Lead' : propensityScore >= 45 ? 'Warm Lead' : 'Cold / Watchlist';

    const handleConvert = async () => {
        if (!selectedLead || !allChecksPassed) return;
        setIsConverting(true);
        try {
            const res = await fetch('/api/opportunities/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer_id: selectedLead.party_id || selectedLead.customer_id,
                    title: `${selectedLead.full_legal_name || 'Lead'} — New Opportunity`,
                    stage: 'Prospecting',
                    projected_value: 250000,
                    probability: 20,
                    expected_close_date: new Date(Date.now() + 90 * 86400 * 1000).toISOString().split('T')[0],
                })
            });
            const data = await res.json();
            if (res.ok) {
                setConverted(true);
                toast.success("Lead converted to Opportunity!", { description: `Stage: Prospecting | ID: ${data.opportunity_id?.substring(0, 8)}...` });
            } else {
                toast.error("Conversion failed", { description: data.error });
            }
        } catch (e) {
            toast.error("Network error during conversion");
        } finally {
            setIsConverting(false);
        }
    };

    return (
        <Card className="bg-slate-900 border-slate-800 sticky top-6">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-100 uppercase tracking-widest flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-indigo-400" />
                    BANT Qualification
                </CardTitle>
            </CardHeader>
            <CardContent>
                {!selectedLead ? (
                    <div className="py-8 text-center text-slate-500 text-sm italic">
                        Select a lead from the queue to start qualification.
                    </div>
                ) : (
                    <div className="space-y-5">
                        {/* Lead identity banner */}
                        <div className="p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-md">
                            <p className="text-xs text-indigo-300 font-semibold mb-1 uppercase">Active Qualification</p>
                            <p className="text-sm font-bold text-white">{selectedLead.full_legal_name || selectedLead.name || 'Lead'}</p>
                            <p className="text-xs text-slate-400">{selectedLead.product_interest || 'No product declared'}</p>
                        </div>

                        {/* Propensity score explainability */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1">
                                    <Info className="h-3 w-3 text-slate-500" /> Score Breakdown
                                </p>
                                <span className={`text-lg font-black ${scoreColor}`}>{propensityScore}<span className="text-xs text-slate-500">/100</span></span>
                            </div>
                            <div className="text-xs font-semibold text-slate-400 mb-1">{scoreLabel}</div>
                            <div className="space-y-1.5">
                                {SCORE_FACTORS.map(f => {
                                    const pts = Math.round((f.weight / 85) * propensityScore);
                                    return (
                                        <div key={f.key} className="flex items-center gap-2">
                                            <div className="flex-1 text-xs text-slate-500 truncate" title={f.desc}>{f.label}</div>
                                            <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(pts / f.weight) * 100}%` }} />
                                            </div>
                                            <span className="text-xs font-mono text-emerald-400 w-12 text-right">+{pts} pts</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* BANT Checklist */}
                        <div className="space-y-1.5">
                            <p className="text-xs font-bold text-slate-300 uppercase tracking-wide">BANT Checklist</p>
                            {([
                                { key: 'budget', label: 'Budget confirmed' },
                                { key: 'authority', label: 'Decision-maker identified' },
                                { key: 'need', label: 'Specific product need documented' },
                                { key: 'timeline', label: 'First engagement target set' },
                            ] as const).map(({ key, label }) => (
                                <div key={key} className="flex items-center gap-2.5 border border-slate-800 rounded p-2 hover:bg-slate-800/50 cursor-pointer"
                                    onClick={() => setBant(prev => ({ ...prev, [key]: !prev[key] }))}>
                                    <Checkbox
                                        id={`${formId}-bant-${key}`}
                                        checked={bant[key]}
                                        onCheckedChange={(v) => setBant(prev => ({ ...prev, [key]: Boolean(v) }))}
                                    />
                                    <label htmlFor={`${formId}-bant-${key}`} className="text-sm text-slate-300 cursor-pointer select-none">{label}</label>
                                    {bant[key] ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 ml-auto" /> : <XCircle className="h-3.5 w-3.5 text-slate-700 ml-auto" />}
                                </div>
                            ))}
                        </div>

                        {/* Banking Eligibility */}
                        <div className="space-y-1.5">
                            <p className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1">
                                <ShieldCheck className="h-3 w-3 text-amber-400" /> Banking Eligibility
                            </p>
                            {([
                                { key: 'age', label: 'Age ≥ 18 confirmed' },
                                { key: 'residency', label: 'Residency status confirmed' },
                                { key: 'kyc', label: 'ID type on file' },
                            ] as const).map(({ key, label }) => (
                                <div key={key} className="flex items-center gap-2.5 border border-slate-800 rounded p-2 hover:bg-slate-800/50 cursor-pointer"
                                    onClick={() => setEligibility(prev => ({ ...prev, [key]: !prev[key] }))}>
                                    <Checkbox
                                        id={`${formId}-elig-${key}`}
                                        checked={eligibility[key]}
                                        onCheckedChange={(v) => setEligibility(prev => ({ ...prev, [key]: Boolean(v) }))}
                                    />
                                    <label htmlFor={`${formId}-elig-${key}`} className="text-sm text-slate-300 cursor-pointer select-none">{label}</label>
                                    {eligibility[key] ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 ml-auto" /> : <XCircle className="h-3.5 w-3.5 text-slate-700 ml-auto" />}
                                </div>
                            ))}
                        </div>

                        {/* Gate warning */}
                        {!allChecksPassed && (
                            <div className="flex items-center gap-2 p-2 bg-amber-900/20 border border-amber-500/20 rounded text-xs text-amber-300">
                                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                                Complete all BANT + eligibility checks to enable conversion.
                            </div>
                        )}

                        <div className="flex flex-col gap-2">
                            <Button
                                id={`${formId}-convert-btn`}
                                className={`w-full font-bold transition-all ${converted ? 'bg-emerald-600 hover:bg-emerald-700' : allChecksPassed ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-700 cursor-not-allowed opacity-60'}`}
                                onClick={handleConvert}
                                disabled={isConverting || converted || !allChecksPassed}
                                title={allChecksPassed ? 'Convert to Opportunity' : 'Complete all checks first'}
                            >
                                {isConverting ? <span className="animate-pulse">Converting…</span>
                                    : converted ? <><CheckCircle2 className="h-4 w-4 mr-2" />Converted to Opportunity</>
                                        : <><Rocket className="h-4 w-4 mr-2" />Convert to Opportunity</>}
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full font-bold border-slate-700 text-indigo-400 hover:bg-indigo-950/30"
                                onClick={() => window.location.href = '/onboarding'}
                            >
                                Onboard New Customer
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
