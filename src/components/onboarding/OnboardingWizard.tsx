"use client";

import { useState } from "react";
import { DocumentUploader } from "./DocumentUploader";
import { CDDForm } from "./CDDForm";
import { TaxResidencyForm } from "./TaxResidencyForm";
import { SanctionsScreening } from "./SanctionsScreening";
import { Check, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const STEPS = [
    { id: 1, label: "Identity Verification" },
    { id: 2, label: "Due Diligence" },
    { id: 3, label: "Tax Residency" },
    { id: 4, label: "Sanctions Screening" }
];

export function OnboardingWizard() {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<any>({});
    const [isComplete, setIsComplete] = useState(false);

    const handleStepComplete = (data: any) => {
        setFormData({ ...formData, [`step${currentStep}`]: data });
        if (currentStep < STEPS.length) {
            setCurrentStep(currentStep + 1);
        } else {
            setIsComplete(true);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    if (isComplete) {
        return (
            <div className="max-w-md mx-auto text-center space-y-6 animate-in zoom-in-95 duration-500 py-12">
                <div className="h-24 w-24 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                    <Check className="h-12 w-12" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white">Application Submitted</h2>
                    <p className="text-slate-400">
                        Your account has been successfully created. Welcome to Global Private Bank.
                    </p>
                </div>
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg text-left space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Account Number</span>
                        <span className="text-slate-200 font-mono">8829-1029-3821</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Risk Rating</span>
                        <span className={`font-medium ${formData.step2?.riskLevel === 'High' ? 'text-amber-500' : 'text-emerald-500'}`}>
                            {formData.step2?.riskLevel}
                        </span>
                    </div>
                </div>
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                    <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Stepper */}
            <div className="relative flex items-center justify-between w-full">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-800 -z-10" />
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 transition-all duration-500 -z-10"
                    style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                />

                {STEPS.map((step) => {
                    const isCompleted = step.id < currentStep;
                    const isCurrent = step.id === currentStep;

                    return (
                        <div key={step.id} className="flex flex-col items-center gap-2 bg-slate-950 px-2">
                            <div className={`
                                h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                                ${isCompleted ? 'bg-blue-600 border-blue-600 text-white' :
                                    isCurrent ? 'bg-slate-900 border-blue-500 text-blue-500' :
                                        'bg-slate-900 border-slate-700 text-slate-500'}
                            `}>
                                {isCompleted ? <Check className="h-5 w-5" /> : step.id}
                            </div>
                            <span className={`text-xs font-medium ${isCurrent ? 'text-blue-400' : 'text-slate-500'}`}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Step Content */}
            <div className="min-h-[500px]">
                {currentStep === 1 && <DocumentUploader onComplete={handleStepComplete} />}
                {currentStep === 2 && <CDDForm onComplete={handleStepComplete} onBack={handleBack} />}
                {currentStep === 3 && <TaxResidencyForm onComplete={handleStepComplete} onBack={handleBack} />}
                {currentStep === 4 && <SanctionsScreening onComplete={handleStepComplete} onBack={handleBack} />}
            </div>
        </div>
    );
}
