"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PhoneCall, Globe, MessageSquare, Building2, Mail, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import useSWR from "swr";
import { useDebounce } from "use-debounce";

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface CaseIntakeSheetProps {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    onCaseCreated?: (c: any, events?: any[]) => void;
}

const CHANNELS = [
    { id: 'ivr', label: 'IVR', Icon: PhoneCall },
    { id: 'web', label: 'Web', Icon: Globe },
    { id: 'chatbot', label: 'Chatbot', Icon: MessageSquare },
    { id: 'branch', label: 'Branch', Icon: Building2 },
    { id: 'email', label: 'Email', Icon: Mail },
];

const DEFAULT_PRIORITY: Record<string, string> = {
    service_request: 'P3', technical: 'P3', billing: 'P2', regulatory_complaint: 'P2'
};

export function CaseIntakeSheet({ open, onOpenChange, onCaseCreated }: CaseIntakeSheetProps) {
    const [channel, setChannel] = useState('web');
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('service_request');
    const [priorityBand, setPriorityBand] = useState('P3');
    const [customerId, setCustomerId] = useState('');
    const [customerSearch, setCustomerSearch] = useState('');
    const [debouncedSearch] = useDebounce(customerSearch, 300);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const { data: customerData } = useSWR(
        debouncedSearch.length >= 2 ? `/api/customers?search=${encodeURIComponent(debouncedSearch)}&limit=5` : null,
        fetcher
    );
    const customers = customerData?.data || [];

    const handleCategoryChange = (cat: string) => {
        setCategory(cat);
        setPriorityBand(DEFAULT_PRIORITY[cat] || 'P3');
    };

    const handleSubmit = async () => {
        if (!subject.trim()) { toast.error("Subject is required"); return; }
        setSubmitting(true);
        try {
            const res = await fetch('/api/service/cases', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subject, description, category, priority_band: priorityBand, channel, customer_id: customerId || null })
            });
            const data = await res.json();
            if (res.ok) {
                setSubmitted(true);
                toast.success(`Case opened — ${priorityBand} SLA active`, {
                    description: `Ack due: ${new Date(data.ack_due_at).toLocaleTimeString()}`
                });
                onCaseCreated?.({
                    case_id: data.case_id,
                    subject, description, category,
                    priority_band: priorityBand, channel,
                    is_regulatory: category === 'regulatory_complaint',
                    customer_id: customerId || null,
                    status: 'open',
                    priority: priorityBand === 'P1' ? 'critical' : priorityBand === 'P2' ? 'high' : 'medium',
                    sla_deadline: data.ack_due_at,
                    created_at: new Date().toISOString()
                }, data.sla_events);
                setTimeout(() => {
                    setSubmitted(false); setSubject(''); setDescription('');
                    setCategory('service_request'); setPriorityBand('P3'); setCustomerId('');
                    onOpenChange(false);
                }, 1500);
            } else {
                toast.error("Case creation failed", { description: data.error });
            }
        } catch { toast.error("Network error"); }
        setSubmitting(false);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-[400px] sm:w-[460px] bg-slate-950 border-slate-800 text-slate-100 overflow-y-auto">
                <SheetHeader className="mb-6">
                    <SheetTitle className="text-white">Open New Case</SheetTitle>
                    <SheetDescription className="text-slate-400">Select intake channel and complete case details.</SheetDescription>
                </SheetHeader>

                {submitted ? (
                    <div className="flex flex-col items-center justify-center h-48 gap-3">
                        <CheckCircle2 className="h-12 w-12 text-emerald-400 animate-pulse" />
                        <p className="text-emerald-300 font-semibold">Case opened — SLA timer started</p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {/* Channel */}
                        <div className="space-y-2">
                            <Label className="text-xs text-slate-300 uppercase tracking-wide">Intake Channel</Label>
                            <div className="grid grid-cols-5 gap-1.5">
                                {CHANNELS.map(({ id, label, Icon }) => (
                                    <button key={id} onClick={() => setChannel(id)}
                                        className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition-colors ${channel === id ? 'border-indigo-500 bg-indigo-950/50 text-indigo-300' : 'border-slate-700 text-slate-500 hover:border-slate-600'}`}>
                                        <Icon className="h-4 w-4" />
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Customer Search */}
                        <div className="space-y-1 relative">
                            <Label className="text-xs text-slate-300">Customer (optional)</Label>
                            {customerId ? (
                                <div className="flex items-center justify-between bg-emerald-900/30 border border-emerald-500/50 p-2 rounded-md">
                                    <span className="text-xs text-emerald-300 font-medium">Selected ID: {customerId}</span>
                                    <Button variant="ghost" size="sm" className="h-4 w-4 p-0 text-emerald-400 hover:bg-transparent" onClick={() => setCustomerId('')}><Globe className="h-3 w-3" /></Button>
                                </div>
                            ) : (
                                <>
                                    <Input value={customerSearch} onChange={e => setCustomerSearch(e.target.value)} className="bg-slate-900 border-slate-700 text-slate-100 text-xs" placeholder="Search by name or ID..." />
                                    {customers.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 z-10 bg-slate-800 border border-slate-700 rounded-md shadow-lg overflow-hidden mt-1">
                                            {customers.map((c: any) => (
                                                <button key={c.id || c.customer_id} onClick={() => { setCustomerId(c.id || c.customer_id); setCustomerSearch(''); }} className="w-full text-left px-3 py-2 text-xs hover:bg-slate-700 text-slate-200">
                                                    {c.full_legal_name} <span className="text-[10px] text-slate-400">({c.customer_id || c.id})</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Subject */}
                        <div className="space-y-1">
                            <Label className="text-xs text-slate-300">Subject *</Label>
                            <Input value={subject} onChange={e => setSubject(e.target.value)} className="bg-slate-900 border-slate-700 text-slate-100" placeholder="Brief issue description" />
                        </div>

                        {/* Description */}
                        <div className="space-y-1">
                            <Label className="text-xs text-slate-300">Description</Label>
                            <Textarea value={description} onChange={e => setDescription(e.target.value)} className="bg-slate-900 border-slate-700 text-slate-100 resize-none" rows={3} placeholder="Full description of the issue…" />
                        </div>

                        {/* Category + Priority */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs text-slate-300">Category</Label>
                                <select value={category} onChange={e => handleCategoryChange(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-md h-9 px-3 text-sm text-slate-200">
                                    <option value="service_request">Service Request</option>
                                    <option value="technical">Technical</option>
                                    <option value="billing">Billing</option>
                                    <option value="regulatory_complaint">Regulatory Complaint</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-slate-300">Priority Band</Label>
                                <select value={priorityBand} onChange={e => setPriorityBand(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-md h-9 px-3 text-sm text-slate-200">
                                    {['P1', 'P2', 'P3', 'P4'].map(p => <option key={p}>{p}</option>)}
                                </select>
                            </div>
                        </div>

                        {category === 'regulatory_complaint' && (
                            <div className="p-3 bg-amber-950/30 border border-amber-700/40 rounded-lg text-xs text-amber-300">
                                ⚠ Regulatory complaint — Resolution SLA: <strong>8 weeks (56 days)</strong>. Ombudsman timeline auto-populated.
                            </div>
                        )}

                        {/* Attachments hint */}
                        <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-600 text-center">
                            📎 Attachments — Available in Phase 4
                        </div>

                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 font-bold" onClick={handleSubmit} disabled={submitting}>
                            {submitting ? 'Opening Case…' : 'Open Case & Start SLA Timer'}
                        </Button>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
