"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ShieldAlert } from "lucide-react";

const FATF_COUNTRIES = [
    'AF', 'AL', 'BB', 'BF', 'BJ', 'BT', 'CM', 'CD', 'GY', 'HT', 'HK', 'IR', 'JM',
    'JO', 'KP', 'LY', 'ML', 'MA', 'MZ', 'MM', 'NG', 'PA', 'PH', 'SD', 'SY', 'TZ',
    'TH', 'UG', 'AE', 'VU', 'VN', 'YE', 'ZW',
];
const NET_WORTH_BANDS = ['<1M', '1-5M', '5-20M', '>20M'] as const;

export interface EDDData {
    wealth_narrative: string;
    country_of_risk: string;
    net_worth_band: string;
    third_party_tx: boolean;
    third_party_purpose: string;
    doc_type_submitted: string;
}

interface Props { data: Partial<EDDData>; onNext: (d: EDDData) => void; onBack: () => void; }

export function EDDStep({ data, onNext, onBack }: Props) {
    const [narrative, setNarrative] = useState(data.wealth_narrative || '');
    const [country, setCountry] = useState(data.country_of_risk || '');
    const [netWorth, setNetWorth] = useState(data.net_worth_band || '');
    const [thirdParty, setThirdParty] = useState(data.third_party_tx ?? false);
    const [purpose, setPurpose] = useState(data.third_party_purpose || '');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const e: Record<string, string> = {};
        if (!narrative.trim()) e.narrative = 'Wealth narrative is required';
        if (!netWorth) e.netWorth = 'Please select your net worth band';
        if (thirdParty && !purpose.trim()) e.purpose = 'Purpose description is required for third-party transactions';
        return e;
    };

    const handleNext = () => {
        const errs = validate();
        setErrors(errs);
        if (Object.keys(errs).length === 0) {
            onNext({
                wealth_narrative: narrative, country_of_risk: country, net_worth_band: netWorth,
                third_party_tx: thirdParty, third_party_purpose: purpose, doc_type_submitted: ''
            });
        }
    };

    return (
        <div className="space-y-5">
            {/* Intro banner */}
            <div className="flex items-start gap-3 p-4 bg-amber-950/30 border border-amber-700/40 rounded-xl text-sm text-amber-300">
                <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                    <p className="font-bold mb-1">Enhanced Due Diligence Required</p>
                    <p className="text-xs text-amber-400/80">Your profile requires additional information under FATF Recommendation 19. Please complete all fields accurately.</p>
                </div>
            </div>

            {/* Wealth narrative */}
            <div className="space-y-1">
                <Label className="text-xs text-slate-400">Detailed Source of Wealth *</Label>
                <Textarea value={narrative} onChange={e => setNarrative(e.target.value)} rows={4}
                    placeholder="Please describe your primary source of wealth in detail (employment history, business activities, investment history, inheritance details, etc.)"
                    className={`bg-slate-900 border-slate-700 text-slate-100 resize-none ${errors.narrative ? 'border-red-500' : ''}`} />
                {errors.narrative && <p className="text-[10px] text-red-400" role="alert">{errors.narrative}</p>}
            </div>

            {/* Country of risk */}
            <div className="space-y-1">
                <Label className="text-xs text-slate-400">Country of Risk Exposure (FATF List)</Label>
                <select value={country} onChange={e => setCountry(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-md h-9 px-3 text-sm text-slate-200">
                    <option value="">— None (if no FATF exposure) —</option>
                    {FATF_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            {/* Net worth */}
            <div className="space-y-2">
                <Label className="text-xs text-slate-400">Estimated Net Worth *</Label>
                <div className="grid grid-cols-4 gap-2">
                    {NET_WORTH_BANDS.map(b => (
                        <button key={b} onClick={() => setNetWorth(b)}
                            className={`text-sm py-2 rounded-lg border font-semibold transition-colors ${netWorth === b ? 'border-indigo-500 bg-indigo-950/40 text-indigo-300' : 'border-slate-700 text-slate-500 hover:border-slate-600'}`}>
                            ${b}M
                        </button>
                    ))}
                </div>
                {errors.netWorth && <p className="text-[10px] text-red-400" role="alert">{errors.netWorth}</p>}
            </div>

            {/* Third-party */}
            <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-800 cursor-pointer hover:border-slate-700 text-sm text-slate-300">
                    <Checkbox checked={thirdParty} onCheckedChange={v => setThirdParty(Boolean(v))} />
                    I expect to conduct transactions on behalf of third parties
                </label>
                {thirdParty && (
                    <div className="space-y-1 pl-4">
                        <Label className="text-xs text-slate-400">Describe the purpose and relationship *</Label>
                        <Input value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="e.g. Managing family trust funds for a relative in France"
                            className={`bg-slate-900 border-slate-700 text-slate-100 ${errors.purpose ? 'border-red-500' : ''}`} />
                        {errors.purpose && <p className="text-[10px] text-red-400" role="alert">{errors.purpose}</p>}
                    </div>
                )}
            </div>

            {/* Doc note for Phase 5 */}
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-600 flex items-start gap-2">
                <span>📎</span>
                <span>Supporting documentation (bank statements, corporate filings) will be requested separately. You will receive a secure upload link by email after submission. <em>— File upload available in Phase 5.</em></span>
            </div>

            <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={onBack} className="border-slate-700 text-slate-300">← Back</Button>
                <Button className="bg-indigo-600 hover:bg-indigo-700 font-semibold" onClick={handleNext}>
                    Next: FATCA / CRS →
                </Button>
            </div>
        </div>
    );
}
