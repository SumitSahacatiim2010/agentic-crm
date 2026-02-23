"use client";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, ShieldAlert } from "lucide-react";

const ACCOUNT_PURPOSES = [
    'Daily banking & savings', 'Salary / payroll deposits',
    'Business transactions', 'Investment activities',
    'International transfers > $50k/month', 'Real estate transactions',
    'Charitable donations', 'Pension / retirement income',
];
const SOURCE_OF_FUNDS = [
    'Employment income', 'Business profits', 'Investment returns',
    'Gift', 'Inheritance over $100k', 'Property sale',
    'Cryptocurrency', 'Pension / annuity',
];
const INCOME_BANDS = ['< $50k', '$50k–$200k', '$200k–$500k', '$500k–$1M', '> $1M'];
const TX_VOLUMES = ['< 10 transactions/month', '10–50 transactions/month', '> 50 transactions/month'];

const HIGH_RISK_PURPOSE = 'International transfers > $50k/month';
const HIGH_RISK_SOURCES = new Set(['Gift', 'Inheritance over $100k', 'Cryptocurrency']);
const HIGH_RISK_INCOME = '> $1M';
const HIGH_RISK_TX = '> 50 transactions/month';

export interface CDDData {
    account_purpose: string[];
    source_of_funds: string[];
    annual_income_band: string;
    tx_volume_band: string;
    high_risk_country: boolean;
    pep_declared: boolean;
    risk_rating: 'Low' | 'Medium' | 'High';
    trigger_count: number;
}

interface Props { data: Partial<CDDData>; onNext: (d: CDDData) => void; onBack: () => void; }

function MultiCheckbox({ options, selected, onChange }: { options: string[]; selected: string[]; onChange: (v: string[]) => void }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {options.map(opt => (
                <label key={opt} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-xs transition-colors ${selected.includes(opt) ? 'border-indigo-500/60 bg-indigo-950/30 text-indigo-200' : 'border-slate-800 text-slate-400 hover:border-slate-700'}`}>
                    <Checkbox checked={selected.includes(opt)}
                        onCheckedChange={v => onChange(v ? [...selected, opt] : selected.filter(s => s !== opt))} />
                    {opt}
                </label>
            ))}
        </div>
    );
}

export function CDDStep({ data, onNext, onBack }: Props) {
    const [purposes, setPurposes] = useState<string[]>(data.account_purpose || []);
    const [sources, setSources] = useState<string[]>(data.source_of_funds || []);
    const [income, setIncome] = useState<string>(data.annual_income_band || '');
    const [txVol, setTxVol] = useState<string>(data.tx_volume_band || '');
    const [highRiskCountry, setHRC] = useState(data.high_risk_country ?? false);
    const [pep, setPep] = useState(data.pep_declared ?? false);

    // Deterministic risk scoring — no Math.random()
    const { triggerCount, riskRating } = useMemo<{ triggerCount: number; riskRating: 'Low' | 'Medium' | 'High' }>(() => {
        let count = 0;
        if (purposes.includes(HIGH_RISK_PURPOSE)) count++;
        if (income === HIGH_RISK_INCOME) count++;
        if (sources.some(s => HIGH_RISK_SOURCES.has(s))) count++;
        if (txVol === HIGH_RISK_TX) count++;
        if (highRiskCountry) count++;
        if (pep) return { triggerCount: count, riskRating: 'High' }; // PEP always High
        const rating: 'Low' | 'Medium' | 'High' = count >= 2 ? 'High' : count === 1 ? 'Medium' : 'Low';
        return { triggerCount: count, riskRating: rating };
    }, [purposes, sources, income, txVol, highRiskCountry, pep]);

    const RISK_COLORS = { Low: 'bg-emerald-950/50 border-emerald-700/30 text-emerald-300', Medium: 'bg-amber-950/50 border-amber-700/30 text-amber-300', High: 'bg-red-950/50 border-red-700/30 text-red-300' };

    const handleNext = () => onNext({
        account_purpose: purposes, source_of_funds: sources, annual_income_band: income,
        tx_volume_band: txVol, high_risk_country: highRiskCountry, pep_declared: pep,
        risk_rating: riskRating, trigger_count: triggerCount,
    });

    return (
        <div className="space-y-6">
            {/* Live risk indicator */}
            <div className={`flex items-center justify-between p-3 rounded-xl border ${RISK_COLORS[riskRating]}`}>
                <span className="text-sm font-bold flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4" />Risk Rating
                </span>
                <span className="text-sm font-black">{riskRating} Risk{triggerCount > 0 ? ` (${triggerCount} trigger${triggerCount > 1 ? 's' : ''})` : ''}</span>
            </div>

            {/* Q1 Purpose */}
            <section className="space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">1. Purpose of Account</p>
                <MultiCheckbox options={ACCOUNT_PURPOSES} selected={purposes} onChange={setPurposes} />
            </section>

            {/* Q2 Income */}
            <section className="space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">2. Estimated Annual Income / Turnover</p>
                <div className="flex flex-wrap gap-2">
                    {INCOME_BANDS.map(b => (
                        <button key={b} onClick={() => setIncome(b)}
                            className={`text-xs px-3 py-1.5 rounded-full border transition-colors font-medium ${income === b ? 'border-indigo-500 bg-indigo-950/40 text-indigo-300' : 'border-slate-700 text-slate-500 hover:border-slate-600'}`}>{b}</button>
                    ))}
                </div>
            </section>

            {/* Q3 Source of funds */}
            <section className="space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">3. Source of Funds</p>
                <MultiCheckbox options={SOURCE_OF_FUNDS} selected={sources} onChange={setSources} />
            </section>

            {/* Q4 Tx volume */}
            <section className="space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">4. Expected Transaction Volume</p>
                <div className="flex flex-col gap-2">
                    {TX_VOLUMES.map(v => (
                        <label key={v} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-xs transition-colors ${txVol === v ? 'border-indigo-500/60 bg-indigo-950/30 text-indigo-200' : 'border-slate-800 text-slate-400 hover:border-slate-700'}`}>
                            <input type="radio" checked={txVol === v} onChange={() => setTxVol(v)} className="sr-only" />
                            <div className={`h-3 w-3 rounded-full border-2 shrink-0 ${txVol === v ? 'border-indigo-400 bg-indigo-400' : 'border-slate-600'}`} />{v}
                        </label>
                    ))}
                </div>
            </section>

            {/* Q5 High-risk country */}
            <section className="space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">5. High-Risk Country Exposure</p>
                <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-800 cursor-pointer hover:border-slate-700 text-sm text-slate-300">
                    <Checkbox checked={highRiskCountry} onCheckedChange={v => setHRC(Boolean(v))} />
                    Do you have business dealings with any FATF grey/black-listed countries?
                </label>
            </section>

            {/* PEP */}
            <section className="space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">PEP Declaration</p>
                <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer text-sm transition-colors ${pep ? 'border-amber-600/40 bg-amber-950/20 text-amber-300' : 'border-slate-800 text-slate-300 hover:border-slate-700'}`}>
                    <Checkbox checked={pep} onCheckedChange={v => setPep(Boolean(v))} />
                    I am or have an immediate family member who is a Politically Exposed Person (PEP)
                </label>
            </section>

            {/* High risk EDD warning */}
            {riskRating === 'High' && (
                <div className="flex items-start gap-2 p-3 bg-red-950/30 border border-red-700/40 rounded-xl text-xs text-red-300">
                    <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    Your responses indicate a high-risk profile. An additional <strong>Enhanced Due Diligence (EDD)</strong> step will be added to your application.
                </div>
            )}

            <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={onBack} className="border-slate-700 text-slate-300">← Back</Button>
                <Button className="bg-indigo-600 hover:bg-indigo-700 font-semibold" onClick={handleNext}
                    disabled={!income || !txVol}>
                    {riskRating === 'High' ? 'Next: Enhanced Due Diligence →' : 'Next: FATCA / CRS →'}
                </Button>
            </div>
        </div>
    );
}
