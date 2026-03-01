import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OnboardingState } from "./types";
import { Textarea } from "@/components/ui/textarea";

interface Props {
    state: OnboardingState['cdd'];
    identityState: OnboardingState['identity'];
    updateState: (updates: Partial<OnboardingState['cdd']>) => void;
}

export function Step2CDD({ state, identityState, updateState }: Props) {
    // EDD logic check
    const isHighRiskCountry = identityState.nationality === 'HK' || identityState.nationality === 'RU';
    const isHighNetWorth = parseInt(state.netWorth.replace(/[^0-9]/g, '') || '0') > 5000000;
    const isPep = identityState.lastName.toLowerCase() === 'pep'; // hidden trick

    const needsEDD = isHighRiskCountry || isHighNetWorth || isPep;

    // Sync requiresEDD to parent state
    useEffect(() => {
        if (state.requiresEDD !== needsEDD) {
            updateState({ requiresEDD: needsEDD });
        }
    }, [needsEDD, state.requiresEDD, updateState]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                    <h2 className="text-xl font-semibold text-slate-100">Customer Due Diligence (CDD)</h2>
                    <p className="text-sm text-slate-400">Source of wealth and relationship purpose.</p>
                </div>
                {needsEDD && (
                    <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-bold rounded-full border border-amber-500/20 uppercase">
                        EDD Required
                    </span>
                )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <div className="flex justify-between">
                        <Label className="text-slate-300">Employment Status</Label>
                        {!state.occupation && <span className="text-xs text-rose-500">* Required</span>}
                    </div>
                    <Select value={state.occupation} onValueChange={(val) => updateState({ occupation: val })}>
                        <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-100 mt-2">
                            <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 text-white">
                            <SelectItem value="Employed">Employed</SelectItem>
                            <SelectItem value="Self-Employed">Self-Employed</SelectItem>
                            <SelectItem value="Retired">Retired</SelectItem>
                            <SelectItem value="Student">Student</SelectItem>
                            <SelectItem value="Unemployed">Unemployed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <div className="flex justify-between">
                        <Label className="text-slate-300">Employer Name</Label>
                        {state.occupation === 'Employed' && !state.employer && <span className="text-xs text-rose-500">* Required</span>}
                    </div>
                    <Input
                        value={state.employer}
                        onChange={e => updateState({ employer: e.target.value })}
                        className="bg-slate-900 border-slate-700 text-slate-100 mt-2"
                        placeholder="Organization name"
                    />
                </div>

                <div>
                    <div className="flex justify-between">
                        <Label className="text-slate-300">Annual Income ($)</Label>
                        {!state.annualIncome && <span className="text-xs text-rose-500">* Required</span>}
                    </div>
                    <Input
                        type="number"
                        value={state.annualIncome}
                        onChange={e => updateState({ annualIncome: e.target.value })}
                        className="bg-slate-900 border-slate-700 text-slate-100 mt-2"
                        placeholder="e.g. 120000"
                    />
                </div>
                <div>
                    <div className="flex justify-between">
                        <Label className="text-slate-300">Estimated Net Worth ($)</Label>
                        {!state.netWorth && <span className="text-xs text-rose-500">* Required</span>}
                    </div>
                    <Input
                        type="number"
                        value={state.netWorth}
                        onChange={e => updateState({ netWorth: e.target.value })}
                        className="bg-slate-900 border-slate-700 text-slate-100 mt-2"
                        placeholder="e.g. 500000"
                    />
                </div>

                <div>
                    <div className="flex justify-between">
                        <Label className="text-slate-300">Source of Wealth</Label>
                        {!state.sourceOfWealth && <span className="text-xs text-rose-500">* Required</span>}
                    </div>
                    <Select value={state.sourceOfWealth} onValueChange={(val) => updateState({ sourceOfWealth: val })}>
                        <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-100 mt-2">
                            <SelectValue placeholder="Select Source" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 text-white">
                            <SelectItem value="Salary / Savings">Salary / Savings</SelectItem>
                            <SelectItem value="Business Profits">Business Profits</SelectItem>
                            <SelectItem value="Inheritance">Inheritance</SelectItem>
                            <SelectItem value="Investment Income">Investment Income</SelectItem>
                            <SelectItem value="Sale of Assets">Sale of Assets</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <div className="flex justify-between">
                        <Label className="text-slate-300">Purpose of Account</Label>
                        {!state.purpose && <span className="text-xs text-rose-500">* Required</span>}
                    </div>
                    <Select value={state.purpose} onValueChange={(val) => updateState({ purpose: val })}>
                        <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-100 mt-2">
                            <SelectValue placeholder="Select Purpose" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 text-white">
                            <SelectItem value="Savings & Deposits">Savings & Deposits</SelectItem>
                            <SelectItem value="Investment Portfolio">Investment Portfolio</SelectItem>
                            <SelectItem value="Business Operations">Business Operations</SelectItem>
                            <SelectItem value="Wealth Management">Wealth Management</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {needsEDD && (
                <div className="pt-6 mt-6 border-t border-amber-900/50">
                    <h3 className="text-sm font-semibold text-amber-400 mb-4">Enhanced Due Diligence (EDD) Required</h3>
                    <p className="text-xs text-slate-400 mb-4">
                        Due to {isHighRiskCountry ? 'jurisdiction risk' : isHighNetWorth ? 'high net worth tier' : 'PEP status'}, additional information is required.
                    </p>
                    <Label className="text-slate-300">Detailed Source of Funds Narrative</Label>
                    <Textarea
                        value={state.eddNarrative || ''}
                        onChange={e => updateState({ eddNarrative: e.target.value, requiresEDD: true })}
                        className="bg-slate-900 border-slate-700 text-slate-100 mt-2 h-24"
                        placeholder="Please provide full details on wealth generation..."
                    />
                </div>
            )}
        </div>
    );
}
