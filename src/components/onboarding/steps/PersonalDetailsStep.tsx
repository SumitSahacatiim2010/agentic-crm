"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { COUNTRIES } from "@/lib/countries";

const OCCUPATIONS = [
    'Accountant', 'Architect', 'Attorney', 'Business Owner', 'Consultant', 'Doctor',
    'Engineer', 'Executive', 'Financial Advisor', 'Government Official',
    'Investor', 'Manager', 'Other', 'Retired', 'Teacher',
];
const EMPLOYMENT_STATUSES = [
    { val: 'employed', label: 'Employed' },
    { val: 'self_employed', label: 'Self-Employed' },
    { val: 'retired', label: 'Retired' },
    { val: 'student', label: 'Student' },
    { val: 'unemployed', label: 'Unemployed' },
    { val: 'other', label: 'Other' },
];

export interface PersonalDetailsData {
    full_name: string; email: string; date_of_birth: string;
    nationality: string; country_of_residence: string; tax_residence_country: string;
    occupation: string; employment_status: string; phone: string;
}

interface Props { data: Partial<PersonalDetailsData>; onNext: (d: PersonalDetailsData) => void; }

function ageFromDOB(dob: string): number {
    if (!dob) return 0;
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
}

export function PersonalDetailsStep({ data, onNext }: Props) {
    const [form, setForm] = useState<PersonalDetailsData>({
        full_name: data.full_name || '', email: data.email || '',
        date_of_birth: data.date_of_birth || '', nationality: data.nationality || 'GB',
        country_of_residence: data.country_of_residence || 'GB',
        tax_residence_country: data.tax_residence_country || 'GB',
        occupation: data.occupation || '', employment_status: data.employment_status || 'employed',
        phone: data.phone || '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const set = (k: keyof PersonalDetailsData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm(prev => ({ ...prev, [k]: e.target.value }));

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!form.full_name.trim()) errs.full_name = 'Full name is required';
        if (!form.email.trim() || !form.email.includes('@')) errs.email = 'Valid email required';
        if (!form.date_of_birth) errs.date_of_birth = 'Date of birth required';
        else if (ageFromDOB(form.date_of_birth) < 18) errs.date_of_birth = 'Applicant must be 18 or older';
        if (!form.phone.trim()) errs.phone = 'Phone number required';
        if (!form.occupation) errs.occupation = 'Occupation required';
        return errs;
    };

    // BUG-013: validate on mount with defaults to flag issues immediately
    useEffect(() => {
        const errs = validate();
        // Only show errors for fields that have been pre-filled (non-empty default wasn't user input)
        if (data.date_of_birth && errs.date_of_birth) setErrors(prev => ({ ...prev, date_of_birth: errs.date_of_birth }));
    }, []); // eslint-disable-line

    // BUG-010: live validation on blur for individual fields
    const validateField = (key: keyof PersonalDetailsData) => {
        const errs = validate();
        setErrors(prev => {
            const updated = { ...prev };
            if (errs[key]) updated[key] = errs[key];
            else delete updated[key];
            return updated;
        });
    };

    const handleNext = () => {
        const errs = validate();
        setErrors(errs);
        if (Object.keys(errs).length === 0) onNext(form);
    };

    const field = (label: string, key: keyof PersonalDetailsData, type = 'text', placeholder = '') => (
        <div className="space-y-1">
            <Label className="text-xs text-slate-400">{label}</Label>
            <Input type={type} value={form[key] as string} onChange={set(key)} placeholder={placeholder}
                onBlur={() => validateField(key)}
                aria-invalid={!!errors[key]}
                aria-describedby={errors[key] ? `err-${key}` : undefined}
                className={`bg-slate-900 border-slate-700 text-slate-100 ${errors[key] ? 'border-red-500 ring-1 ring-red-500/30' : ''}`} />
            {errors[key] && <p id={`err-${key}`} className="text-[10px] text-red-400" role="alert" aria-live="polite">{errors[key]}</p>}
        </div>
    );

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {field('Full Legal Name *', 'full_name', 'text', 'As it appears on your ID')}
                {field('Email Address *', 'email', 'email', 'your@email.com')}
                {field('Date of Birth *', 'date_of_birth', 'date')}
                {field('Phone Number *', 'phone', 'tel', '+44 XXXX XXXXXX')}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['nationality', 'country_of_residence', 'tax_residence_country'] as const).map((k, i) => (
                    <div key={k} className="space-y-1">
                        <Label className="text-xs text-slate-400">{['Nationality *', 'Country of Residence *', 'Tax Residence Country *'][i]}</Label>
                        <select value={form[k]} onChange={set(k)} className="w-full bg-slate-900 border border-slate-700 rounded-md h-9 px-3 text-sm text-slate-200">
                            {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}{c.highRisk ? ' ⚠️' : ''}</option>)}
                        </select>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label className="text-xs text-slate-400">Occupation *</Label>
                    <select value={form.occupation} onChange={set('occupation')} className={`w-full bg-slate-900 border rounded-md h-9 px-3 text-sm text-slate-200 ${errors.occupation ? 'border-red-500' : 'border-slate-700'}`}>
                        <option value="">— Select —</option>
                        {OCCUPATIONS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                    {errors.occupation && <p className="text-[10px] text-red-400" role="alert">{errors.occupation}</p>}
                </div>
                <div className="space-y-1">
                    <Label className="text-xs text-slate-400">Employment Status</Label>
                    <div className="grid grid-cols-3 gap-1">
                        {EMPLOYMENT_STATUSES.map(s => (
                            <button key={s.val} onClick={() => setForm(p => ({ ...p, employment_status: s.val }))}
                                className={`text-[10px] py-1.5 rounded border transition-colors font-medium ${form.employment_status === s.val ? 'border-indigo-500 bg-indigo-950/50 text-indigo-300' : 'border-slate-700 text-slate-500 hover:border-slate-600'}`}>
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <div className="pt-2 flex justify-end">
                <Button className="bg-indigo-600 hover:bg-indigo-700 font-semibold" onClick={handleNext}>
                    Next: Identity Verification →
                </Button>
            </div>
        </div>
    );
}
