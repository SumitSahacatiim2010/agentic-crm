import { OnboardingState } from "./types";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface Props {
    state: OnboardingState['account'];
    identityState: OnboardingState['identity'];
    updateState: (updates: Partial<OnboardingState['account']>) => void;
}

export function Step5AccountOpening({ state, identityState, updateState }: Props) {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                    <h2 className="text-xl font-semibold text-slate-100">Agreements & E-Signature</h2>
                    <p className="text-sm text-slate-400">Finalize terms, FATCA/CRS self-certification, and signature.</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-slate-300">FATCA/CRS Self-Certification</h3>
                    <div>
                        <Label className="text-slate-400 text-xs">Country of Tax Residence</Label>
                        <Input
                            value={state.taxResidence}
                            onChange={e => updateState({ taxResidence: e.target.value })}
                            className="bg-slate-950 border-slate-800 text-slate-100 mt-1 h-8 text-sm"
                            placeholder="e.g. United Kingdom"
                        />
                    </div>
                    <div>
                        <Label className="text-slate-400 text-xs">Tax Identification Number (TIN)</Label>
                        <Input
                            value={state.tin}
                            onChange={e => updateState({ tin: e.target.value })}
                            className="bg-slate-950 border-slate-800 text-slate-100 mt-1 h-8 text-sm"
                            placeholder="Enter TIN"
                        />
                    </div>
                </div>

                <div className="space-y-4 border-l border-slate-800 pl-6">
                    <h3 className="text-sm font-medium text-slate-300">Terms & Conditions</h3>
                    <div className="flex items-start gap-2">
                        <Checkbox
                            checked={state.agreedToTerms}
                            onCheckedChange={(c) => updateState({ agreedToTerms: c as boolean })}
                            className="mt-1"
                        />
                        <div className="text-xs text-slate-400 leading-relaxed">
                            I declare that the information provided is true and correct. I agree to the <span className="text-indigo-400 cursor-pointer hover:underline">General Terms and Conditions</span> and acknowledge the Privacy Policy.
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800">
                <Label className="text-slate-300 mb-2 block">E-Signature</Label>
                <div className="p-1 bg-slate-900 border border-slate-700 rounded-lg">
                    <Input
                        value={state.signature}
                        onChange={e => updateState({ signature: e.target.value })}
                        className="bg-transparent border-none text-slate-100 h-16 text-2xl font-signature italic text-center focus-visible:ring-0 placeholder:text-slate-600 placeholder:not-italic"
                        placeholder="Type full legal name to sign"
                    />
                </div>
                <div className="text-center text-xs text-slate-500 mt-2">
                    Signed electronically. Signature matches name: {identityState.firstName} {identityState.lastName}
                </div>
            </div>
        </div>
    );
}
