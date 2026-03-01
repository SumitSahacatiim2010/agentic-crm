"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { CheckCircle2, Building2, ChevronRight, ChevronLeft } from "lucide-react";

interface Props {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    staffUser: any;
    onCreated?: () => void;
}

export function BranchLeadWizard({ open, onOpenChange, staffUser, onCreated }: Props) {
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const [form, setForm] = useState({
        full_name: '', phone: '', email: '',
        product_interest: 'Savings Account', expected_amount: '',
        bant_budget: false, bant_authority: false, bant_need: false, bant_timeline: false
    });

    const update = (k: keyof typeof form, v: any) => setForm(prev => ({ ...prev, [k]: v }));

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);

    const handleSubmit = async () => {
        if (!form.full_name.trim() || !form.phone.trim()) {
            toast.error("Name and Phone are required to create a prospect.");
            return;
        }
        setSubmitting(true);
        try {
            const res = await fetch('/api/leads/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    full_name: form.full_name,
                    phone: form.phone,
                    email: form.email || null,
                    product_interest: form.product_interest,
                    source_channel: 'Branch',
                    bant_budget: form.bant_budget,
                    bant_authority: form.bant_authority,
                    bant_need: form.bant_need,
                    bant_timeline: form.bant_timeline,
                    source_metadata: {
                        staff_id: staffUser?.id || null,
                        branch_id: staffUser?.branch_id || null,
                        expected_amount: form.expected_amount || null
                    },
                    lead_status: 'New',
                })
            });
            if (res.ok) {
                setSubmitted(true);
                toast.success("Walk-in lead recorded.");
                setTimeout(() => {
                    setStep(1); setSubmitted(false); onOpenChange(false); onCreated?.();
                    setForm({
                        full_name: '', phone: '', email: '',
                        product_interest: 'Savings Account', expected_amount: '',
                        bant_budget: false, bant_authority: false, bant_need: false, bant_timeline: false
                    });
                }, 1500);
            } else {
                toast.error("Failed to create walk-in lead.");
            }
        } catch (e: any) {
            toast.error("Network error.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-slate-950 border-slate-800 text-slate-100">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-indigo-400" />
                        Walk-in Lead Entry
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Capture details for a new branch walk-in prospect.
                    </DialogDescription>
                </DialogHeader>

                {submitted ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-3">
                        <CheckCircle2 className="h-12 w-12 text-emerald-400 animate-bounce" />
                        <p className="text-emerald-300 font-medium">Lead successfully queued!</p>
                    </div>
                ) : (
                    <div className="py-2 space-y-4">
                        {/* Step Indicators */}
                        <div className="flex justify-between items-center mb-6">
                            {[1, 2, 3].map(s => (
                                <div key={s} className="flex items-center">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${step >= s ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                        {s}
                                    </div>
                                    {s < 3 && <div className={`w-20 h-1 mx-1 rounded ${step > s ? 'bg-indigo-600' : 'bg-slate-800'}`}></div>}
                                </div>
                            ))}
                        </div>

                        {/* Step 1: Prospect */}
                        {step === 1 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                <div className="space-y-2">
                                    <Label>Full Name *</Label>
                                    <Input value={form.full_name} onChange={e => update('full_name', e.target.value)} className="bg-slate-900 border-slate-700" placeholder="John Doe" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone *</Label>
                                    <Input value={form.phone} onChange={e => update('phone', e.target.value)} className="bg-slate-900 border-slate-700" placeholder="555-0123" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email (Optional)</Label>
                                    <Input value={form.email} onChange={e => update('email', e.target.value)} className="bg-slate-900 border-slate-700" placeholder="john@example.com" />
                                </div>
                                <Button className="w-full mt-2" onClick={handleNext}>Next <ChevronRight className="h-4 w-4 ml-1" /></Button>
                            </div>
                        )}

                        {/* Step 2: Product */}
                        {step === 2 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                <div className="space-y-2">
                                    <Label>Product Interest</Label>
                                    <select value={form.product_interest} onChange={e => update('product_interest', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-md h-10 px-3 text-sm">
                                        {['Savings Account', 'Fixed Deposit', 'Auto Loan', 'Mortgage', 'Investment Portfolio'].map(p => <option key={p}>{p}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Expected Amount / Deposit (Optional)</Label>
                                    <Input value={form.expected_amount} onChange={e => update('expected_amount', e.target.value)} type="number" className="bg-slate-900 border-slate-700" placeholder="50000" />
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <Button variant="outline" onClick={handleBack}><ChevronLeft className="h-4 w-4 mr-1" /> Back</Button>
                                    <Button className="flex-1" onClick={handleNext}>Next <ChevronRight className="h-4 w-4 ml-1" /></Button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: BANT */}
                        {step === 3 && (
                            <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
                                <p className="text-sm text-slate-400 mb-2">Initial BANT capture from walk-in conversation.</p>

                                <div className="flex items-start space-x-3">
                                    <Checkbox id="bant_budget" checked={form.bant_budget} onCheckedChange={c => update('bant_budget', !!c)} />
                                    <Label htmlFor="bant_budget" className="font-normal cursor-pointer">
                                        <span className="font-semibold block text-slate-200">Budget / Capacity</span>
                                        <span className="text-xs text-slate-400">Customer has sufficient funds or income.</span>
                                    </Label>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <Checkbox id="bant_authority" checked={form.bant_authority} onCheckedChange={c => update('bant_authority', !!c)} />
                                    <Label htmlFor="bant_authority" className="font-normal cursor-pointer">
                                        <span className="font-semibold block text-slate-200">Authority</span>
                                        <span className="text-xs text-slate-400">Customer is the primary decision maker.</span>
                                    </Label>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <Checkbox id="bant_need" checked={form.bant_need} onCheckedChange={c => update('bant_need', !!c)} />
                                    <Label htmlFor="bant_need" className="font-normal cursor-pointer">
                                        <span className="font-semibold block text-slate-200">Need</span>
                                        <span className="text-xs text-slate-400">Clear requirement for the product.</span>
                                    </Label>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <Checkbox id="bant_timeline" checked={form.bant_timeline} onCheckedChange={c => update('bant_timeline', !!c)} />
                                    <Label htmlFor="bant_timeline" className="font-normal cursor-pointer">
                                        <span className="font-semibold block text-slate-200">Timeline</span>
                                        <span className="text-xs text-slate-400">Looking to transact within 30 days.</span>
                                    </Label>
                                </div>

                                <div className="flex gap-2 mt-6">
                                    <Button variant="outline" onClick={handleBack} disabled={submitting}><ChevronLeft className="h-4 w-4 mr-1" /> Back</Button>
                                    <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={handleSubmit} disabled={submitting}>
                                        {submitting ? 'Submitting...' : 'Queue Walk-In Lead'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
