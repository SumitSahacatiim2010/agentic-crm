import { OnboardingState } from "./types";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface Props {
    state: OnboardingState['products'];
    cddState: OnboardingState['cdd'];
    updateState: (updates: Partial<OnboardingState['products']>) => void;
}

const PRODUCTS = [
    { id: 'sav_standard', name: 'Standard Savings', tier: 'Standard', type: 'Deposit' },
    { id: 'deb_standard', name: 'Standard Debit Card', tier: 'Standard', type: 'Card' },
    { id: 'sav_premium', name: 'Premium Savings', tier: 'Premium', type: 'Deposit' },
    { id: 'cred_premium', name: 'Platinum Credit Card', tier: 'Premium', type: 'Card' },
    { id: 'loan_personal', name: 'Personal Loan', tier: 'Premium', type: 'Lending' },
    { id: 'inv_advisory', name: 'Investment Advisory', tier: 'HNW', type: 'Investment' },
    { id: 'pbanking_suite', name: 'Private Banking Suite', tier: 'UHNW', type: 'Deposit' },
];

export function Step4ProductSelection({ state, cddState, updateState }: Props) {
    const nw = parseInt(cddState.netWorth.replace(/[^0-9]/g, '') || '0');
    const inc = parseInt(cddState.annualIncome.replace(/[^0-9]/g, '') || '0');

    let eligibleTier = 'Standard';
    if (nw > 5000000) eligibleTier = 'UHNW';
    else if (nw > 1000000 || inc > 250000) eligibleTier = 'HNW';
    else if (nw > 250000 || inc > 100000) eligibleTier = 'Premium';

    const getEligibility = (tier: string) => {
        if (eligibleTier === 'UHNW') return true;
        if (eligibleTier === 'HNW' && tier !== 'UHNW') return true;
        if (eligibleTier === 'Premium' && (tier === 'Standard' || tier === 'Premium')) return true;
        if (eligibleTier === 'Standard' && tier === 'Standard') return true;
        return false;
    };

    const toggleProduct = (id: string) => {
        if (state.selected.includes(id)) {
            updateState({ selected: state.selected.filter(x => x !== id) });
        } else {
            updateState({ selected: [...state.selected, id] });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                    <h2 className="text-xl font-semibold text-slate-100">Product Suitability</h2>
                    <p className="text-sm text-slate-400">Recommended products based on profile: <span className="text-indigo-400 font-semibold">{eligibleTier}</span> Segment</p>
                </div>
            </div>

            <div className="space-y-4">
                {PRODUCTS.map(prod => {
                    const isEligible = getEligibility(prod.tier);
                    const isSelected = state.selected.includes(prod.id);

                    return (
                        <div key={prod.id} className={`p-4 border rounded-lg flex items-start gap-4 transition-colors ${isSelected ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-800 bg-slate-900'} ${!isEligible ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`} onClick={() => isEligible && toggleProduct(prod.id)}>
                            <div className="pt-1">
                                <Checkbox checked={isSelected} disabled={!isEligible} />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-medium text-slate-200">{prod.name}</h4>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">{prod.type}</span>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">Tier: {prod.tier}</p>
                            </div>
                            {!isEligible && <div className="text-xs text-red-400 px-2 py-1 bg-red-950/30 rounded border border-red-900/50">Does not meet tier criteria</div>}
                        </div>
                    );
                })}
            </div>

            {state.selected.length === 0 && (
                <div className="text-xs text-amber-500 mt-2">
                    Please select at least one product to continue.
                </div>
            )}
        </div>
    );
}
