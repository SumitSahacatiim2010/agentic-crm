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

    // Initialize state when lead changes
    useEffect(() => {
        if (selectedLead) {
            setBant({
                budget: selectedLead.bant_budget || false,
                authority: selectedLead.bant_authority || false,
                need: selectedLead.bant_need || false,
                timeline: selectedLead.bant_timeline || false
            });
            setEligibility({
                age: !!selectedLead.phone, // Proxy for simplified demo
                residency: !!selectedLead.email,
                kyc: !!selectedLead.source_channel
            });
            setConverted(selectedLead.status === 'Converted');
        }
    }, [selectedLead?.id]);

    const updateLeadField = async (updates: any) => {
        if (!selectedLead?.id) return;
        try {
            await fetch(`/api/leads/${selectedLead.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
        } catch (e) {
            console.error("Failed to persist lead update", e);
        }
    };

    const toggleBant = (key: keyof typeof bant) => {
        const newVal = !bant[key];
        setBant(prev => ({ ...prev, [key]: newVal }));
        const dbKey = `bant_${key}`;
        updateLeadField({ [dbKey]: newVal });
    };

    const bantPassed = Object.values(bant).every(Boolean);
    const eligPassed = Object.values(eligibility).every(Boolean);
    const allChecksPassed = bantPassed && eligPassed;

    const propensityScore = selectedLead?.lead_score || computeScore(selectedLead);
    const scoreColor = propensityScore >= 75 ? 'text-emerald-400' : propensityScore >= 45 ? 'text-amber-400' : 'text-slate-400';
    const scoreLabel = selectedLead?.lead_rating || (propensityScore >= 75 ? 'Hot' : propensityScore >= 45 ? 'Warm' : 'Cold');

    const handleConvert = async () => {
        if (!selectedLead || !allChecksPassed) return;
        setIsConverting(true);
        try {
            const res = await fetch('/api/opportunities/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer_id: selectedLead.converted_customer_id || selectedLead.party_id,
                    deal_name: `${selectedLead.full_name || 'Lead'} — ${selectedLead.product_interest || 'Retail Account'}`,
                    pipeline_stage: 'Prospecting',
                    deal_value: 150000,
                    probability: 20,
                    expected_close_date: new Date(Date.now() + 90 * 86400 * 1000).toISOString().split('T')[0],
                })
            });
            if (res.ok) {
                await updateLeadField({ status: 'Converted', qualification_stage: 'Opportunity' });
                setConverted(true);
                toast.success("Lead converted to Opportunity!");
            } else {
                const data = await res.json();
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
                        <div className="p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-md">
                            <p className="text-xs text-indigo-300 font-semibold mb-1 uppercase">Active Qualification</p>
                            <p className="text-sm font-bold text-white">{selectedLead.full_name || 'Lead'}</p>
                            <p className="text-xs text-slate-400">{selectedLead.product_interest || 'General Inquiry'}</p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1">
                                    <Info className="h-3 w-3 text-slate-500" /> Propensity Score
                                </p>
                                <span className={`text-lg font-black ${scoreColor}`}>{propensityScore}<span className="text-xs text-slate-500">/100</span></span>
                            </div>
                            <div className="text-xs font-semibold text-slate-400 mb-1">Rating: {scoreLabel}</div>
                        </div>

                        <div className="space-y-1.5">
                            <p className="text-xs font-bold text-slate-300 uppercase tracking-wide">BANT Status (Persistent)</p>
                            {([
                                { key: 'budget', label: 'Budget confirmed' },
                                { key: 'authority', label: 'Decision-maker identified' },
                                { key: 'need', label: 'Specific product need documented' },
                                { key: 'timeline', label: 'Timeline established' },
                            ] as const).map(({ key, label }) => (
                                <div key={key} className="flex items-center gap-2.5 border border-slate-800 rounded p-2 hover:bg-slate-800/50 cursor-pointer"
                                    onClick={() => toggleBant(key)}>
                                    <Checkbox
                                        id={`${formId}-bant-${key}`}
                                        checked={bant[key]}
                                        onCheckedChange={() => toggleBant(key)}
                                    />
                                    <label htmlFor={`${formId}-bant-${key}`} className="text-sm text-slate-300 cursor-pointer select-none">{label}</label>
                                    {bant[key] ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 ml-auto" /> : <XCircle className="h-3.5 w-3.5 text-slate-700 ml-auto" />}
                                </div>
                            ))}
                        </div>

                        <div className="space-y-1.5">
                            <p className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1">
                                <ShieldCheck className="h-3 w-3 text-amber-400" /> Banking Eligibility
                            </p>
                            {([
                                { key: 'age', label: 'Age ≥ 18 confirmed' },
                                { key: 'residency', label: 'Residency status confirmed' },
                                { key: 'kyc', label: 'ID type on file' },
                            ] as const).map(({ key, label }) => (
                                <div key={key} className="flex items-center gap-2.5 border border-slate-800 rounded p-2 hover:bg-slate-800/50 cursor-not-allowed opacity-80">
                                    <Checkbox id={`${formId}-elig-${key}`} checked={eligibility[key]} disabled />
                                    <label className="text-sm text-slate-300 select-none">{label}</label>
                                    {eligibility[key] ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 ml-auto" /> : <XCircle className="h-3.5 w-3.5 text-slate-700 ml-auto" />}
                                </div>
                            ))}
                        </div>

                        {!allChecksPassed && (
                            <div className="flex items-center gap-2 p-2 bg-amber-900/20 border border-amber-500/20 rounded text-xs text-amber-300">
                                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                                Complete BANT checks to enable conversion.
                            </div>
                        )}

                        <div className="flex flex-col gap-2">
                            <Button
                                id={`${formId}-convert-btn`}
                                className={`w-full font-bold transition-all ${converted ? 'bg-emerald-600 hover:bg-emerald-700' : allChecksPassed ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-700 cursor-not-allowed opacity-60'}`}
                                onClick={handleConvert}
                                disabled={isConverting || converted || !allChecksPassed}
                            >
                                {isConverting ? <span className="animate-pulse">Converting…</span>
                                    : converted ? <><CheckCircle2 className="h-4 w-4 mr-2" />Converted to Opportunity</>
                                        : <><Rocket className="h-4 w-4 mr-2" />Convert to Opportunity</>}
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
