import { OnboardingState } from "./types";
import { useEffect, useState, useRef } from "react";
import { Loader2, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
    state: OnboardingState['aml'];
    identityState: OnboardingState['identity'];
    updateState: (updates: Partial<OnboardingState['aml']>) => void;
    onNext: () => void;
}

export function Step3AMLScreening({ state, identityState, updateState, onNext }: Props) {
    const [loading, setLoading] = useState(true);
    const hasScreened = useRef(false);

    useEffect(() => {
        if (state.status || hasScreened.current) {
            setLoading(false);
            return;
        }

        hasScreened.current = true;
        const runScreening = async () => {
            try {
                const customerIdStr = identityState.firstName + identityState.lastName + identityState.idNumber;

                const [amlRes, sancRes] = await Promise.all([
                    fetch(`/api/mock/aml-screening?customer_id=${customerIdStr}`),
                    fetch(`/api/mock/sanctions-screening?customer_id=${customerIdStr}`)
                ]);

                const amlData = await amlRes.json();
                const sancData = await sancRes.json();

                const risk = amlData.aml_risk_rating;
                const match = sancData.sanctions_match;
                const nearMatch = sancData.sanctions_near_match;

                let finalStatus: 'cleared' | 'review' | 'failed' = 'cleared';
                if (risk === 'High' || match) finalStatus = 'failed';
                else if (risk === 'Medium' || nearMatch) finalStatus = 'review';

                updateState({
                    amlRiskRating: risk,
                    sanctionsMatch: match,
                    sanctionsNearMatch: nearMatch,
                    status: finalStatus
                });
            } catch (err) {
                console.error("Screening failed", err);
                updateState({ status: 'review' });
            } finally {
                setLoading(false);
            }
        };

        runScreening();
    }, [state.status, identityState, updateState]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                    <h2 className="text-xl font-semibold text-slate-100">AML & Sanctions Screening</h2>
                    <p className="text-sm text-slate-400">Automated regulatory compliance checks.</p>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-indigo-500" />
                    <div className="text-slate-300">Screening in progress against global watchlists...</div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-6 bg-slate-900 border border-slate-800 rounded-lg flex flex-col items-center justify-center text-center">
                            <span className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">AML Risk Rating</span>
                            <div className={`text-2xl font-bold ${state.amlRiskRating === 'High' ? 'text-red-500' : state.amlRiskRating === 'Medium' ? 'text-amber-500' : 'text-emerald-500'}`}>
                                {state.amlRiskRating} Risk
                            </div>
                        </div>
                        <div className="p-6 bg-slate-900 border border-slate-800 rounded-lg flex flex-col items-center justify-center text-center">
                            <span className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">Sanctions Status</span>
                            <div className={`text-2xl font-bold ${state.sanctionsMatch ? 'text-red-500' : state.sanctionsNearMatch ? 'text-amber-500' : 'text-emerald-500'}`}>
                                {state.sanctionsMatch ? 'Exact Match' : state.sanctionsNearMatch ? 'Near Match' : 'Clear'}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        {state.status === 'cleared' && (
                            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-start gap-4">
                                <CheckCircle2 className="h-6 w-6 text-emerald-500 mt-0.5" />
                                <div>
                                    <h4 className="text-emerald-400 font-medium">Screening Passed</h4>
                                    <p className="text-sm text-slate-400 mt-1">No regulatory blocks found. The customer is cleared to proceed with onboarding.</p>
                                    <Button onClick={onNext} className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white">Continue to Products</Button>
                                </div>
                            </div>
                        )}

                        {state.status === 'review' && (
                            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-4">
                                <AlertTriangle className="h-6 w-6 text-amber-500 mt-0.5" />
                                <div>
                                    <h4 className="text-amber-400 font-medium">Pending Compliance Review</h4>
                                    <p className="text-sm text-slate-400 mt-1">A potential match or medium risk indicator was found. A compliance officer must manually review this application.</p>
                                    <Button onClick={() => { toast.success("Escalated to Compliance Team", { description: "A compliance officer has been notified and will review this application within 24 hours." }); }} className="mt-4 bg-amber-600 hover:bg-amber-700 text-white">Escalate to Compliance</Button>
                                </div>
                            </div>
                        )}

                        {state.status === 'failed' && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-4">
                                <XCircle className="h-6 w-6 text-red-500 mt-0.5" />
                                <div>
                                    <h4 className="text-red-400 font-medium">Onboarding Rejected</h4>
                                    <p className="text-sm text-slate-400 mt-1">Critical AML or sanctions block found. Onboarding cannot proceed.</p>
                                    <Button onClick={() => { toast.info("Referred to Compliance Officer", { description: "This application has been flagged for manual AML/Sanctions review. The applicant will be contacted within 48 hours." }); }} className="mt-4 bg-red-900 border border-red-800 text-white hover:bg-red-800">Refer to Compliance Officer</Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
