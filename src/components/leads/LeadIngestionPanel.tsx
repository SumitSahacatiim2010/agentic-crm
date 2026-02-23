"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Building2, Megaphone, Handshake, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface LeadIngestionPanelProps {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    onLeadCreated?: () => void;
}

const CHANNELS = [
    { id: 'web', label: 'Web Form', icon: Globe },
    { id: 'branch', label: 'Branch Walk-In', icon: Building2 },
    { id: 'marketing', label: 'Marketing', icon: Megaphone },
    { id: 'partner', label: 'Partner Referral', icon: Handshake },
];

export function LeadIngestionPanel({ open, onOpenChange, onLeadCreated }: LeadIngestionPanelProps) {
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const [form, setForm] = useState({
        full_name: '', email: '', product_interest: 'Mortgage', utm_source: '',
        staff_id: '', id_type: 'Passport',
        campaign_id: '', segment_code: '',
        partner_org: '', referral_code: '',
    });

    const update = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

    const handleSubmit = async (channel: string) => {
        if (!form.full_name.trim()) {
            toast.error("Full name is required");
            return;
        }
        setSubmitting(true);
        try {
            const res = await fetch('/api/leads/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    full_name: form.full_name,
                    email: form.email || null,
                    product_interest: form.product_interest,
                    source_channel: channel,
                    source_metadata: {
                        utm_source: form.utm_source || null,
                        staff_id: form.staff_id || null,
                        campaign_id: form.campaign_id || null,
                        partner_org: form.partner_org || null,
                        referral_code: form.referral_code || null,
                    },
                    lead_status: 'new',
                })
            });
            if (res.ok) {
                setSubmitted(true);
                toast.success("Lead ingested successfully", { description: `${form.full_name} — ${channel}` });
                setTimeout(() => { onOpenChange(false); setSubmitted(false); onLeadCreated?.(); }, 1500);
            } else {
                const err = await res.json();
                toast.error("Ingestion failed", { description: err?.error || 'Unknown error' });
            }
        } catch {
            toast.error("Network error during lead ingestion");
        } finally {
            setSubmitting(false);
        }
    };

    const commonFields = (
        <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1">
                <Label className="text-slate-300 text-xs">Full Name *</Label>
                <Input value={form.full_name} onChange={e => update('full_name', e.target.value)} className="bg-slate-950 border-slate-700 text-slate-100" placeholder="Jane Smith" />
            </div>
            <div className="space-y-1">
                <Label className="text-slate-300 text-xs">Email</Label>
                <Input value={form.email} onChange={e => update('email', e.target.value)} className="bg-slate-950 border-slate-700 text-slate-100" placeholder="jane@example.com" type="email" />
            </div>
            <div className="space-y-1">
                <Label className="text-slate-300 text-xs">Product Interest</Label>
                <select value={form.product_interest} onChange={e => update('product_interest', e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-md h-9 px-3 text-sm text-slate-200">
                    {['Mortgage', 'Wealth Management', 'Business Loan', 'Personal Loan', 'Savings Account', 'Credit Card', 'Investment'].map(p => <option key={p}>{p}</option>)}
                </select>
            </div>
        </div>
    );

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-[420px] sm:w-[480px] bg-slate-950 border-slate-800 text-slate-100 overflow-y-auto">
                <SheetHeader className="mb-6">
                    <SheetTitle className="text-white">Ingest New Lead</SheetTitle>
                    <SheetDescription className="text-slate-400">
                        Select the acquisition channel and fill in source-specific details.
                    </SheetDescription>
                </SheetHeader>

                {submitted ? (
                    <div className="flex flex-col items-center justify-center h-48 gap-3">
                        <CheckCircle2 className="h-12 w-12 text-emerald-400 animate-bounce" />
                        <p className="text-emerald-300 font-semibold">Lead ingested successfully!</p>
                    </div>
                ) : (
                    <Tabs defaultValue="web">
                        <TabsList className="grid grid-cols-4 bg-slate-900 mb-6 w-full">
                            {CHANNELS.map(c => (
                                <TabsTrigger key={c.id} value={c.id} className="text-xs data-[state=active]:bg-indigo-600 data-[state=active]:text-white flex flex-col gap-0.5 py-2 h-auto">
                                    <c.icon className="h-3.5 w-3.5" />
                                    {c.label.split(' ')[0]}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        <TabsContent value="web" className="space-y-4">
                            {commonFields}
                            <div className="space-y-1">
                                <Label className="text-slate-300 text-xs">UTM Source</Label>
                                <Input value={form.utm_source} onChange={e => update('utm_source', e.target.value)} className="bg-slate-950 border-slate-700 text-slate-100" placeholder="google / facebook / organic" />
                            </div>
                            <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={() => handleSubmit('web')} disabled={submitting}>
                                {submitting ? 'Submitting…' : 'Ingest Web Lead'}
                            </Button>
                        </TabsContent>

                        <TabsContent value="branch" className="space-y-4">
                            {commonFields}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-slate-300 text-xs">Staff ID</Label>
                                    <Input value={form.staff_id} onChange={e => update('staff_id', e.target.value)} className="bg-slate-950 border-slate-700 text-slate-100" placeholder="EMP-001" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-slate-300 text-xs">ID Type Presented</Label>
                                    <select value={form.id_type} onChange={e => update('id_type', e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-md h-9 px-3 text-sm text-slate-200">
                                        {['Passport', "Driver's License", 'National ID', 'Residence Permit'].map(t => <option key={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>
                            <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={() => handleSubmit('branch')} disabled={submitting}>
                                {submitting ? 'Submitting…' : 'Ingest Branch Lead'}
                            </Button>
                        </TabsContent>

                        <TabsContent value="marketing" className="space-y-4">
                            {commonFields}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-slate-300 text-xs">Campaign ID</Label>
                                    <Input value={form.campaign_id} onChange={e => update('campaign_id', e.target.value)} className="bg-slate-950 border-slate-700 text-slate-100" placeholder="CMP-2026-Q1" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-slate-300 text-xs">Segment Code</Label>
                                    <Input value={form.segment_code} onChange={e => update('segment_code', e.target.value)} className="bg-slate-950 border-slate-700 text-slate-100" placeholder="HNW / UHNW" />
                                </div>
                            </div>
                            <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={() => handleSubmit('marketing')} disabled={submitting}>
                                {submitting ? 'Submitting…' : 'Ingest Marketing Lead'}
                            </Button>
                        </TabsContent>

                        <TabsContent value="partner" className="space-y-4">
                            {commonFields}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-slate-300 text-xs">Partner Organisation</Label>
                                    <Input value={form.partner_org} onChange={e => update('partner_org', e.target.value)} className="bg-slate-950 border-slate-700 text-slate-100" placeholder="Law Firm / Broker" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-slate-300 text-xs">Referral Code</Label>
                                    <Input value={form.referral_code} onChange={e => update('referral_code', e.target.value)} className="bg-slate-950 border-slate-700 text-slate-100" placeholder="REF-2026-001" />
                                </div>
                            </div>
                            <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={() => handleSubmit('partner')} disabled={submitting}>
                                {submitting ? 'Submitting…' : 'Ingest Partner Lead'}
                            </Button>
                        </TabsContent>
                    </Tabs>
                )}
            </SheetContent>
        </Sheet>
    );
}
