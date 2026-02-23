"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { calculateRiskScore, RiskProfile } from "@/lib/fna-mock-data";
import { CheckCircle2, AlertTriangle, ArrowRight, ArrowLeft } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface RiskQuestionnaireProps {
    onComplete: (profile: RiskProfile) => void;
}

const QUESTIONS = [
    {
        id: 1,
        text: "What is your primary goal for this investment?",
        options: [
            { label: "Capital Preservation (Avoid Loss)", points: 1 },
            { label: "Steady Income & Moderate Growth", points: 3 },
            { label: "Maximum Long-term Growth", points: 5 }
        ]
    },
    {
        id: 2,
        text: "How much of your income can you afford to set aside for investments?",
        options: [
            { label: "Less than 10%", points: 1 },
            { label: "10% - 30%", points: 3 },
            { label: "More than 30%", points: 5 }
        ]
    },
    {
        id: 3,
        text: "If your portfolio dropped 20% in 3 months, what would you do?",
        options: [
            { label: "Sell everything immediately", points: 1 },
            { label: "Hold and wait for recovery", points: 3 },
            { label: "Buy more (View as opportunity)", points: 5 }
        ]
    },
    {
        id: 4,
        text: "What is your investment time horizon?",
        options: [
            { label: "Less than 3 years", points: 1 },
            { label: "3 - 10 years", points: 3 },
            { label: "10+ years", points: 5 }
        ]
    },
    {
        id: 5,
        text: "How strictly do you need access to these funds (Liquidity)?",
        options: [
            { label: "I need immediate access (Emergency)", points: 1 },
            { label: "I can lock it away for a few years", points: 3 },
            { label: "I don't need access for a long time", points: 5 }
        ]
    }
];

export function RiskQuestionnaire({ onComplete }: RiskQuestionnaireProps) {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<number[]>(new Array(QUESTIONS.length).fill(0));
    const [completed, setCompleted] = useState(false);
    const [result, setResult] = useState<RiskProfile | null>(null);

    const handleAnswer = (points: number) => {
        const newAnswers = [...answers];
        newAnswers[step] = points;
        setAnswers(newAnswers);
    };

    const handleNext = () => {
        if (step < QUESTIONS.length - 1) {
            setStep(step + 1);
        } else {
            const profile = calculateRiskScore(answers);
            setResult(profile);
            setCompleted(true);
            onComplete(profile);
        }
    };

    const handleBack = () => {
        if (step > 0) setStep(step - 1);
    };

    const progress = ((step + 1) / QUESTIONS.length) * 100;

    if (completed && result) {
        return (
            <Card className="bg-slate-900 border-slate-800 h-full flex flex-col justify-center items-center text-center p-6">
                <div className={`
                    h-20 w-20 rounded-full flex items-center justify-center mb-4
                    ${result.category === 'Conservative' ? 'bg-emerald-500/20 text-emerald-400' :
                        result.category === 'Moderate' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-rose-500/20 text-rose-400'}
                `}>
                    {result.category === 'Conservative' ? <CheckCircle2 className="h-10 w-10" /> : <AlertTriangle className="h-10 w-10" />}
                </div>
                <h3 className="text-2xl font-bold text-slate-100 mb-1">{result.category} Investor</h3>
                <div className="text-4xl font-black text-slate-200 mb-6">{result.score}<span className="text-lg text-slate-500 font-normal">/100</span></div>

                <p className="text-slate-400 max-w-sm mx-auto mb-8 border-t border-b border-slate-800 py-4">
                    {result.description}
                </p>

                <div className="w-full max-w-xs space-y-2">
                    <div className="flex justify-between text-xs text-slate-400">
                        <span>Max Equity Exposure</span>
                        <span className="text-slate-200 font-bold">{result.maxEquityExposure}%</span>
                    </div>
                    <Progress value={result.maxEquityExposure} className="h-2 bg-slate-800" indicatorClassName="bg-slate-500" />
                </div>

                <Button onClick={() => { setCompleted(false); setStep(0); setAnswers([]); }} variant="ghost" className="mt-8 text-slate-500">
                    Retake Assessment
                </Button>
            </Card>
        );
    }

    const currentQ = QUESTIONS[step];

    return (
        <Card className="bg-slate-900 border-slate-800 h-full flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-center mb-2">
                    <CardTitle className="text-slate-100">Client Risk Profiling</CardTitle>
                    <span className="text-xs font-mono text-slate-500">Step {step + 1}/{QUESTIONS.length}</span>
                </div>
                <Progress value={progress} className="h-1 bg-slate-800" indicatorClassName="bg-indigo-500" />
            </CardHeader>
            <CardContent className="flex-1 py-8">
                <h3 className="text-xl font-medium text-slate-200 mb-8">{currentQ.text}</h3>

                <RadioGroup onValueChange={(val) => handleAnswer(Number(val))} value={answers[step]?.toString()} className="space-y-4">
                    {currentQ.options.map((opt, idx) => (
                        <div key={idx} className={`flex items-center space-x-3 border p-4 rounded-lg transition-all ${answers[step] === opt.points ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/50' : 'border-slate-800 hover:bg-slate-800'
                            }`}>
                            <RadioGroupItem value={opt.points.toString()} id={`opt-${idx}`} className="text-indigo-400 border-slate-600" />
                            <Label htmlFor={`opt-${idx}`} className="text-slate-300 font-normal cursor-pointer flex-1">{opt.label}</Label>
                        </div>
                    ))}
                </RadioGroup>
            </CardContent>
            <CardFooter className="flex justify-between border-t border-slate-800 pt-6">
                <Button variant="ghost" onClick={handleBack} disabled={step === 0} className="text-slate-400 hover:text-slate-200">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
                <Button
                    onClick={handleNext}
                    disabled={!answers[step]}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                    {step === QUESTIONS.length - 1 ? 'Calculate Profile' : 'Next Question'} <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
            </CardFooter>
        </Card>
    );
}
