"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PRODUCTS = [
    { val: 'working_capital', label: 'Working Capital Line' },
    { val: 'term_loan', label: 'Term Loan' },
    { val: 'equipment_finance', label: 'Equipment Finance' },
    { val: 'commercial_real_estate', label: 'Commercial Real Estate' },
    { val: 'sba_7a', label: 'SBA 7(a)' },
];
const COLLATERAL = [
    { val: 'unsecured', label: 'Unsecured' }, { val: 'residential', label: 'Residential' },
    { val: 'commercial', label: 'Commercial' }, { val: 'equipment', label: 'Equipment' },
    { val: 'mixed', label: 'Mixed' },
];

interface Props { onCreated: () => void; onClose: () => void; }

export function ApplicationIntakeSheet({ onCreated, onClose }: Props) {
    const [form, setForm] = useState({ applicant_name: '', business_name: '', loan_amount: '', product_type: 'term_loan', purpose: '', collateral_type: 'unsecured', collateral_value: '' });
    const [submitting, setSub] = useState(false);

    const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

    const handleSubmit = async () => {
        if (!form.applicant_name || !form.loan_amount) { toast.error('Name and amount required'); return; }
        setSub(true);
        try {
            const res = await fetch('/api/credit/intake', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, loan_amount: Number(form.loan_amount), collateral_value: Number(form.collateral_value) || 0 }),
            });
            const text = await res.text();
            let json: any = {};
            try { json = JSON.parse(text); } catch (e) { }
            if (res.ok) { toast.success(`Application created — routed to ${json.routing_path || 'queue'}`); onCreated(); }
            else toast.error(json.error || 'Submission failed');
        } catch { toast.error('Network error'); }
        setSub(false);
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">New Credit Application</h3>
                <button onClick={onClose} className="text-slate-600 hover:text-white text-lg">×</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1"><Label className="text-xs text-slate-400">Applicant Name *</Label><Input value={form.applicant_name} onChange={set('applicant_name')} className="bg-slate-950 border-slate-700 text-white" /></div>
                <div className="space-y-1"><Label className="text-xs text-slate-400">Business Name</Label><Input value={form.business_name} onChange={set('business_name')} className="bg-slate-950 border-slate-700 text-white" /></div>
                <div className="space-y-1"><Label className="text-xs text-slate-400">Loan Amount ($) *</Label><Input type="number" value={form.loan_amount} onChange={set('loan_amount')} className="bg-slate-950 border-slate-700 text-white" /></div>
                <div className="space-y-1"><Label className="text-xs text-slate-400">Product Type</Label>
                    <select value={form.product_type} onChange={set('product_type')} className="w-full bg-slate-950 border border-slate-700 rounded-md h-9 px-3 text-sm text-slate-200">{PRODUCTS.map(p => <option key={p.val} value={p.val}>{p.label}</option>)}</select>
                </div>
                <div className="space-y-1"><Label className="text-xs text-slate-400">Purpose</Label><Input value={form.purpose} onChange={set('purpose')} className="bg-slate-950 border-slate-700 text-white" /></div>
                <div className="space-y-1"><Label className="text-xs text-slate-400">Collateral Type</Label>
                    <select value={form.collateral_type} onChange={set('collateral_type')} className="w-full bg-slate-950 border border-slate-700 rounded-md h-9 px-3 text-sm text-slate-200">{COLLATERAL.map(c => <option key={c.val} value={c.val}>{c.label}</option>)}</select>
                </div>
                {form.collateral_type !== 'unsecured' && (
                    <div className="space-y-1"><Label className="text-xs text-slate-400">Collateral Value ($)</Label><Input type="number" value={form.collateral_value} onChange={set('collateral_value')} className="bg-slate-950 border-slate-700 text-white" /></div>
                )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={onClose} className="border-slate-700 text-slate-300">Cancel</Button>
                <Button className="bg-indigo-600 hover:bg-indigo-700" disabled={submitting} onClick={handleSubmit}>{submitting ? 'Submitting…' : 'Submit Application'}</Button>
            </div>
        </div>
    );
}
