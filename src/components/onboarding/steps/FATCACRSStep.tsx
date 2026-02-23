"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2 } from "lucide-react";
import { fmtDateTime } from "@/lib/date-utils";

const CRS_COUNTRIES = ['GB', 'US', 'DE', 'FR', 'AU', 'CA', 'SG', 'HK', 'AE', 'CH', 'NL', 'SE', 'JP', 'IN', 'BR'];

export interface FATCACRSData {
    us_person: boolean;
    us_tin: string;
    crs_countries: string[];
    crs_tins: Record<string, string>;
    declared: boolean;
    declared_at: string;
    fatca_status: 'not_applicable' | 'w9_required' | 'compliant';
}

interface Props { data: Partial<FATCACRSData>; onNext: (d: FATCACRSData) => void; onBack: () => void; }

export function FATCACRSStep({ data, onNext, onBack }: Props) {
    const [usPerson, setUsPerson] = useState(data.us_person ?? false);
    const [usTin, setUsTin] = useState(data.us_tin || '');
    const [crsCountries, setCRS] = useState<string[]>(data.crs_countries || []);
    const [crsTins, setCRSTins] = useState<Record<string, string>>(data.crs_tins || {});
    const [declared, setDeclared] = useState(data.declared ?? false);
    const [tinError, setTinError] = useState('');

    const toggleCRS = (country: string) => {
        setCRS(prev => {
            const next = prev.includes(country) ? prev.filter(c => c !== country) : [...prev, country];
            // Remove TIN for deselected country
            if (prev.includes(country)) {
                const newTins = { ...crsTins };
                delete newTins[country];
                setCRSTins(newTins);
            }
            return next;
        });
    };

    const handleNext = () => {
        if (usPerson && !usTin.trim()) { setTinError('US TIN is required for US persons'); return; }
        setTinError('');
        onNext({
            us_person: usPerson,
            us_tin: usTin,
            crs_countries: crsCountries,
            crs_tins: crsTins,
            declared,
            declared_at: declared ? new Date().toISOString() : '',
            fatca_status: usPerson ? 'w9_required' : 'not_applicable',
        });
    };

    return (
        <div className="space-y-5">
            {/* FATCA */}
            <div className="space-y-3 p-4 bg-slate-900 border border-slate-800 rounded-xl">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">FATCA — US Tax Compliance</p>
                <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer text-sm transition-colors ${usPerson ? 'border-amber-600/40 bg-amber-950/20 text-amber-300' : 'border-slate-700 text-slate-300 hover:border-slate-600'}`}>
                    <Checkbox checked={usPerson} onCheckedChange={v => setUsPerson(Boolean(v))} />
                    I am a US citizen or tax resident
                </label>
                {usPerson && (
                    <div className="space-y-1 pl-4 animate-in slide-in-from-top-1">
                        <Label className="text-xs text-slate-400">US Taxpayer Identification Number (TIN) *</Label>
                        <Input value={usTin} onChange={e => setUsTin(e.target.value)} placeholder="XXX-XX-XXXX"
                            className={`bg-slate-950 border-slate-700 text-slate-100 font-mono ${tinError ? 'border-red-500' : ''}`} />
                        {tinError && <p className="text-[10px] text-red-400" role="alert">{tinError}</p>}
                        <div className="mt-2 p-2 bg-amber-950/20 border border-amber-800/30 rounded text-[10px] text-amber-400">
                            ⚠ US persons are subject to FATCA. A W-9 form will be required before account opening.
                        </div>
                    </div>
                )}
            </div>

            {/* CRS */}
            <div className="space-y-3 p-4 bg-slate-900 border border-slate-800 rounded-xl">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">CRS — Tax Residency Countries (select up to 5)</p>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {CRS_COUNTRIES.map(c => (
                        <button key={c} onClick={() => { if (!crsCountries.includes(c) && crsCountries.length >= 5) return; toggleCRS(c); }}
                            className={`text-xs py-1.5 rounded border font-mono font-semibold transition-colors ${crsCountries.includes(c) ? 'border-indigo-500 bg-indigo-950/40 text-indigo-300' : 'border-slate-700 text-slate-500 hover:border-slate-600'}`}>
                            {c}
                        </button>
                    ))}
                </div>

                {/* Per-country TIN inputs */}
                {crsCountries.length > 0 && (
                    <div className="space-y-2 pt-2">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wide">Tax Identification Numbers</p>
                        {crsCountries.map(c => (
                            <div key={c} className="flex items-center gap-3">
                                <span className="text-xs font-mono font-bold text-slate-400 w-8">{c}</span>
                                <Input value={crsTins[c] || ''} onChange={e => setCRSTins(prev => ({ ...prev, [c]: e.target.value }))}
                                    placeholder={`${c} TIN`} className="bg-slate-950 border-slate-700 text-slate-100 font-mono text-xs h-8 flex-1" />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Declaration */}
            <div className="space-y-2">
                <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer text-sm transition-colors ${declared ? 'border-emerald-600/40 bg-emerald-950/20 text-emerald-300' : 'border-slate-700 text-slate-300 hover:border-slate-600'}`}>
                    <Checkbox checked={declared} onCheckedChange={v => setDeclared(Boolean(v))} className="mt-0.5" />
                    <span>I certify that the information provided above is accurate and complete to the best of my knowledge. I understand that false certification may constitute a criminal offence under applicable law.</span>
                </label>
                {declared && (
                    <div className="flex items-center gap-2 text-xs text-emerald-400 pl-2" suppressHydrationWarning>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Certified at {fmtDateTime(new Date().toISOString())}
                    </div>
                )}
                <p className="text-[10px] text-slate-600 pl-2">This self-certification is required under OECD CRS regulations.</p>
            </div>

            <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={onBack} className="border-slate-700 text-slate-300">← Back</Button>
                <Button className="bg-indigo-600 hover:bg-indigo-700 font-semibold" disabled={!declared} onClick={handleNext}>
                    Next: Sanctions Screening →
                </Button>
            </div>
        </div>
    );
}
