"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, AlertTriangle, Bell } from "lucide-react";
import { toast } from "sonner";

interface ComplaintClassificationPanelProps {
    caseId: string;
    customerId?: string;
    subject?: string;
}

const ROOT_CAUSES = [
    'System Error', 'Data Discrepancy', 'Policy Gap', 'Staff Error',
    'Third-Party Failure', 'Fraudulent Activity', 'Communication Failure',
    'Process Delay', 'Product Defect', 'Customer Error'
];

const SENTIMENT_CONFIG: Record<string, { color: string; label: string }> = {
    Neutral: { color: 'border-slate-600 text-slate-300', label: 'Neutral' },
    Frustrated: { color: 'border-amber-600 text-amber-300', label: 'Frustrated' },
    Angry: { color: 'border-red-600 text-red-400', label: 'Angry' },
    Escalating: { color: 'border-red-700 text-red-500 animate-pulse', label: 'Escalating' },
};

export function ComplaintClassificationPanel({ caseId, customerId, subject }: ComplaintClassificationPanelProps) {
    const [caseType, setCaseType] = useState('service_request');
    const [severity, setSeverity] = useState('Medium');
    const [rootCause, setRootCause] = useState('');
    const [sentiment, setSentiment] = useState('Neutral');
    const [regulatoryBody, setRegulatoryBody] = useState('None');
    const [ombudsmanRef, setOmbudsmanRef] = useState('');
    const [ombudsmanDeadline, setOmbudsmanDeadline] = useState(() => {
        const d = new Date(); d.setDate(d.getDate() + 56); return d.toISOString().split('T')[0];
    });
    const [remediationRequired, setRemediationRequired] = useState(false);
    const [remediationAmount, setRemediationAmount] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [alertPushed, setAlertPushed] = useState(false);
    const [pushingAlert, setPushingAlert] = useState(false);

    const isHighSeverity = severity === 'High' || severity === 'Critical';
    const isRegulatory = caseType === 'regulatory_complaint';

    const handleSave = async () => {
        setSaving(true);
        const res = await fetch(`/api/service/cases/${caseId}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                case_type: caseType, severity, root_cause: rootCause || null,
                sentiment, regulatory_body: regulatoryBody,
                ombudsman_ref: ombudsmanRef || null,
                ombudsman_deadline: isRegulatory ? ombudsmanDeadline : null,
                remediation_required: remediationRequired,
                remediation_amount: remediationRequired ? Number(remediationAmount) : null,
            })
        });
        if (res.ok) { setSaved(true); toast.success("Classification saved"); }
        else toast.error("Save failed");
        setSaving(false);
    };

    const handlePushAlert = async () => {
        setPushingAlert(true);
        const res = await fetch('/api/service-cases/push-rm-alert', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                case_id: caseId, customer_id: customerId || null,
                severity, title: subject || 'High-severity case — RM review required',
            })
        });
        if (res.ok) { setAlertPushed(true); toast.success("RM Portfolio alerted — visible in Relationship Dashboard"); }
        else toast.error("Alert push failed");
        setPushingAlert(false);
    };

    return (
        <div className="space-y-4">
            {/* Case Type */}
            <div className="space-y-1">
                <Label className="text-xs text-slate-400">Case Type</Label>
                <select value={caseType} onChange={e => setCaseType(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-md h-9 px-3 text-sm text-slate-200">
                    <option value="service_request">Service Request</option>
                    <option value="technical">Technical Issue</option>
                    <option value="billing">Billing Dispute</option>
                    <option value="regulatory_complaint">Regulatory Complaint</option>
                </select>
            </div>

            {/* Severity + Sentiment */}
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <Label className="text-xs text-slate-400">Severity</Label>
                    <select value={severity} onChange={e => setSeverity(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-md h-9 px-3 text-sm text-slate-200">
                        {['Low', 'Medium', 'High', 'Critical'].map(s => <option key={s}>{s}</option>)}
                    </select>
                </div>
                <div className="space-y-1">
                    <Label className="text-xs text-slate-400">Customer Sentiment</Label>
                    <div className="grid grid-cols-2 gap-1">
                        {Object.entries(SENTIMENT_CONFIG).map(([key, cfg]) => (
                            <button key={key} onClick={() => setSentiment(key)}
                                className={`text-[10px] font-semibold px-1 py-1.5 rounded border transition-all ${sentiment === key ? cfg.color : 'border-slate-800 text-slate-600'}`}>
                                {cfg.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Root Cause */}
            <div className="space-y-1">
                <Label className="text-xs text-slate-400">Root Cause</Label>
                <select value={rootCause} onChange={e => setRootCause(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-md h-9 px-3 text-sm text-slate-200">
                    <option value="">— Select root cause —</option>
                    {ROOT_CAUSES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
            </div>

            {/* High Severity Warning */}
            {isHighSeverity && (
                <div className="flex items-start gap-2 p-3 bg-amber-950/30 border border-amber-700/40 rounded-lg text-xs text-amber-300">
                    <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    High-severity complaints should be escalated to the RM portfolio team.
                </div>
            )}

            {/* Regulatory Fields */}
            {isRegulatory && (
                <div className="space-y-3 p-3 bg-slate-900 border border-amber-800/30 rounded-lg">
                    <p className="text-xs font-bold text-amber-300 uppercase tracking-wide">Regulatory Details</p>
                    <div className="space-y-1">
                        <Label className="text-xs text-slate-400">Regulatory Body</Label>
                        <select value={regulatoryBody} onChange={e => setRegulatoryBody(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-md h-9 px-3 text-sm text-slate-200">
                            {['FCA', 'CFPB', 'MAS', 'RBI', 'ASIC', 'None'].map(b => <option key={b}>{b}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs text-slate-400">Ombudsman Ref #</Label>
                            <Input value={ombudsmanRef} onChange={e => setOmbudsmanRef(e.target.value)} className="bg-slate-950 border-slate-700 text-slate-100 text-xs" placeholder="e.g. FCA-2026-001" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-slate-400">Ombudsman Deadline</Label>
                            <Input type="date" value={ombudsmanDeadline} onChange={e => setOmbudsmanDeadline(e.target.value)} className="bg-slate-950 border-slate-700 text-slate-100 text-xs" />
                        </div>
                    </div>
                </div>
            )}

            {/* Remediation */}
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <Checkbox id="remediation-chk" checked={remediationRequired} onCheckedChange={v => setRemediationRequired(Boolean(v))} />
                    <label htmlFor="remediation-chk" className="text-xs text-slate-300 cursor-pointer">Remediation required</label>
                </div>
                {remediationRequired && (
                    <div className="space-y-1">
                        <Label className="text-xs text-slate-400">Remediation Amount ($)</Label>
                        <Input type="number" value={remediationAmount} onChange={e => setRemediationAmount(e.target.value)} className="bg-slate-900 border-slate-700 text-slate-100" placeholder="0.00" />
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
                <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-xs" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving…' : saved ? <><CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />Saved</> : 'Save Classification'}
                </Button>
                <Button size="sm"
                    className={`text-xs gap-1.5 ${alertPushed ? 'bg-emerald-700 cursor-not-allowed' : isHighSeverity ? 'bg-red-800 hover:bg-red-700' : 'bg-slate-700 opacity-50 cursor-not-allowed'}`}
                    onClick={handlePushAlert}
                    disabled={!isHighSeverity || alertPushed || pushingAlert}
                    title={isHighSeverity ? 'Push alert to RM inbox' : 'Only available for High/Critical severity'}>
                    <Bell className="h-3.5 w-3.5" />
                    {alertPushed ? 'Alert Sent ✓' : pushingAlert ? '…' : 'Push to RM'}
                </Button>
            </div>
        </div>
    );
}
