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
                    <Label className="text-slate-300">Employment Status</Label>
                    <Select value={state.occupation} onValueChange={(val) => updateState({ occupation: val })}>
                        <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-100 mt-2">
                            <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 text-white">
                            <SelectItem value="Employed">Employed</SelectItem>
                            <SelectItem value="Self-Employed">Self-Employed</SelectItem>
                            <SelectItem value="Retired">Retired</SelectItem>
                            <SelectItem value="Student">Student</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label className="text-slate-300">Employer Name</Label>
                    <Input
                        value={state.employer}
                        onChange={e => updateState({ employer: e.target.value })}
                        className="bg-slate-900 border-slate-700 text-slate-100 mt-2"
                        placeholder="e.g. Acme Corp"
                    />
                </div>

                <div>
                    <Label className="text-slate-300">Annual Income ($)</Label>
                    <Input
                        type="number"
                        value={state.annualIncome}
                        onChange={e => updateState({ annualIncome: e.target.value })}
                        className="bg-slate-900 border-slate-700 text-slate-100 mt-2"
                        placeholder="150000"
                    />
                </div>
                <div>
                    <Label className="text-slate-300">Estimated Net Worth ($)</Label>
                    <Input
                        type="number"
                        value={state.netWorth}
                        onChange={e => updateState({ netWorth: e.target.value })}
                        className="bg-slate-900 border-slate-700 text-slate-100 mt-2"
                        placeholder="500000"
                    />
                </div>

                <div>
                    <Label className="text-slate-300">Source of Wealth</Label>
                    <Select value={state.sourceOfWealth} onValueChange={(val) => updateState({ sourceOfWealth: val })}>
                        <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-100 mt-2">
                            <SelectValue placeholder="Select Source" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 text-white">
                            <SelectItem value="Salary">Salary / Savings</SelectItem>
                            <SelectItem value="Property">Property Sale</SelectItem>
                            <SelectItem value="Investments">Investments</SelectItem>
                            <SelectItem value="Inheritance">Inheritance</SelectItem>
                            <SelectItem value="Business">Business Ownership</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label className="text-slate-300">Purpose of Account</Label>
                    <Select value={state.purpose} onValueChange={(val) => updateState({ purpose: val })}>
                        <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-100 mt-2">
                            <SelectValue placeholder="Select Purpose" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 text-white">
                            <SelectItem value="Savings">Savings & Deposits</SelectItem>
                            <SelectItem value="Transactions">Daily Transactions</SelectItem>
                            <SelectItem value="Investment">Wealth / Investment</SelectItem>
                            <SelectItem value="Lending">Lending / Mortgage</SelectItem>
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
