"use client";

import { useState } from "react";
import { OnboardingState, initialOnboardingState } from "@/components/onboarding/types";
import { Step1Identity } from "@/components/onboarding/Step1Identity";
import { Step2CDD } from "@/components/onboarding/Step2CDD";
import { Step3AMLScreening } from "@/components/onboarding/Step3AMLScreening";
import { Step4ProductSelection } from "@/components/onboarding/Step4ProductSelection";
import { Step5AccountOpening } from "@/components/onboarding/Step5AccountOpening";
import { Step6Welcome } from "@/components/onboarding/Step6Welcome";
import { Button } from "@/components/ui/button";
import { ChevronRight, ArrowLeft } from "lucide-react";

export default function OnboardingPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [state, setState] = useState<OnboardingState>(initialOnboardingState);

    const updateIdentity = (updates: Partial<OnboardingState['identity']>) => setState(s => ({ ...s, identity: { ...s.identity, ...updates } }));
    const updateCDD = (updates: Partial<OnboardingState['cdd']>) => setState(s => ({ ...s, cdd: { ...s.cdd, ...updates } }));
    const updateAML = (updates: Partial<OnboardingState['aml']>) => setState(s => ({ ...s, aml: { ...s.aml, ...updates } }));
    const updateProducts = (updates: Partial<OnboardingState['products']>) => setState(s => ({ ...s, products: { ...s.products, ...updates } }));
    const updateAccount = (updates: Partial<OnboardingState['account']>) => setState(s => ({ ...s, account: { ...s.account, ...updates } }));

    const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 6));
    const handlePrev = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const canProceed = () => {
        if (currentStep === 1) return state.identity.firstName && state.identity.lastName && state.identity.dob && state.identity.nationality && state.identity.idNumber;
        if (currentStep === 2) return state.cdd.sourceOfWealth && state.cdd.annualIncome && state.cdd.netWorth && (!state.cdd.requiresEDD || state.cdd.eddNarrative);
        if (currentStep === 3) return state.aml.status === 'cleared';
        if (currentStep === 4) return state.products.selected.length > 0;
        if (currentStep === 5) return state.account.agreedToTerms && state.account.signature;
        return false;
    };

    const steps = [
        "Identity",
        "CDD & Risk",
        "Screening",
        "Products",
        "Agreements",
        "Completion"
    ];

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-200">
            <div className="flex flex-1 overflow-hidden">
                <main className="flex-1 overflow-y-auto p-4 md:p-8 flex items-start justify-center">
                    <div className="w-full max-w-4xl mt-4">

                        <div className="mb-8 flex justify-between items-end">
                            <div>
                                <h1 className="text-2xl font-light text-white mb-6">Digital Onboarding Wizard</h1>
                            </div>
                            <div className="flex items-center justify-between relative px-2">
                                <div className="absolute left-0 top-1/2 -mt-px w-full h-0.5 bg-slate-800 -z-10" />
                                <div className="absolute left-0 top-1/2 -mt-px h-0.5 bg-indigo-500 -z-10 transition-all duration-300" style={{ width: `${((currentStep - 1) / 5) * 100}%` }} />

                                {steps.map((lbl, idx) => {
                                    const stepNum = idx + 1;
                                    const isPast = stepNum < currentStep;
                                    const isCurrent = stepNum === currentStep;

                                    return (
                                        <div key={idx} className="flex flex-col items-center">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-colors ${isCurrent ? 'bg-indigo-600 border-indigo-500 text-white' :
                                                isPast ? 'bg-indigo-900 border-indigo-500 text-indigo-300' :
                                                    'bg-slate-900 border-slate-700 text-slate-500'
                                                }`}>
                                                {stepNum}
                                            </div>
                                            <span className={`text-xs mt-2 hidden md:block ${isCurrent ? 'text-indigo-400 font-medium' : 'text-slate-500'}`}>{lbl}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-8 shadow-2xl backdrop-blur-sm">
                            {currentStep === 1 && <Step1Identity state={state.identity} updateState={updateIdentity} />}
                            {currentStep === 2 && <Step2CDD state={state.cdd} identityState={state.identity} updateState={updateCDD} />}
                            {currentStep === 3 && <Step3AMLScreening state={state.aml} identityState={state.identity} updateState={updateAML} onNext={handleNext} />}
                            {currentStep === 4 && <Step4ProductSelection state={state.products} cddState={state.cdd} updateState={updateProducts} />}
                            {currentStep === 5 && <Step5AccountOpening state={state.account} identityState={state.identity} updateState={updateAccount} />}
                            {currentStep === 6 && <Step6Welcome state={state} />}

                            {currentStep < 6 && (
                                <div className="mt-8 flex justify-between items-center pt-6 border-t border-slate-800">
                                    <Button
                                        variant="outline"
                                        onClick={handlePrev}
                                        disabled={currentStep === 1}
                                        className="border-slate-700 text-slate-300 hover:bg-slate-800"
                                    >
                                        <ArrowLeft className="h-4 w-4 mr-2" /> Back
                                    </Button>

                                    {currentStep !== 3 && (
                                        <Button
                                            onClick={handleNext}
                                            disabled={!canProceed()}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                        >
                                            Next Step <ChevronRight className="h-4 w-4 ml-2" />
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
