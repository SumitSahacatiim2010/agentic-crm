"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FilePlus, CreditCard, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export interface LivePartyProfile {
    party_id: string;
    party_type: string;
    status: string;
    displayName: string;
    segment_tier: string;
    individual: {
        first_name?: string;
        last_name?: string;
        date_of_birth?: string;
        nationality?: string;
        employment_status?: string;
    } | null;
    corporate: {
        company_name?: string;
        industry?: string;
        annual_revenue?: number;
    } | null;
}

interface CustomerHeaderLiveProps {
    profile: LivePartyProfile;
    onOpenComplianceTab?: () => void;
}

const TIER_COLORS: Record<string, string> = {
    UHNW: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/40',
    HNW: 'bg-blue-500/10 text-blue-400 border-blue-500/40',
    Premium: 'bg-purple-500/10 text-purple-400 border-purple-500/40',
    Standard: 'bg-slate-700 text-slate-300 border-slate-600',
};

export function CustomerHeaderLive({ profile, onOpenComplianceTab }: CustomerHeaderLiveProps) {
    const router = useRouter();
    const [caseDialogOpen, setCaseDialogOpen] = useState(false);
    const [caseSubject, setCaseSubject] = useState('');
    const [caseDesc, setCaseDesc] = useState('');
    const [casePriority, setCasePriority] = useState('medium');
    const [submitting, setSubmitting] = useState(false);

    const initials = profile.displayName.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase();
    const tierColor = TIER_COLORS[profile.segment_tier] || TIER_COLORS.Standard;

    const handleOpenCase = async () => {
        if (!caseSubject.trim()) { toast.error("Subject is required"); return; }
        setSubmitting(true);
        try {
            const res = await fetch('/api/service-cases/create', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customer_id: profile.party_id, subject: caseSubject, description: caseDesc, priority: casePriority })
            });
            if (res.ok) {
                toast.success("Service Case opened", { description: caseSubject });
                setCaseDialogOpen(false); setCaseSubject(''); setCaseDesc('');
            } else { toast.error("Failed to open case"); }
        } catch { toast.error("Network error"); }
        setSubmitting(false);
    };

    return (
        <>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <Avatar className="h-20 w-20 border-2 border-slate-700 shrink-0">
                    <AvatarFallback className="text-2xl font-bold bg-indigo-950 text-indigo-300">{initials}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h1 className="text-2xl font-bold text-white tracking-tight truncate">{profile.displayName}</h1>
                        <Badge variant="outline" className={`text-xs uppercase tracking-wider font-semibold border ${tierColor}`}>
                            {profile.segment_tier}
                        </Badge>
                        <Badge variant="outline" className={`text-xs border capitalize ${profile.status === 'active' ? 'border-emerald-500/30 text-emerald-400' : 'border-slate-600 text-slate-400'}`}>
                            {profile.status}
                        </Badge>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                        <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-xs text-slate-300 select-all">
                            {profile.party_id}
                        </span>
                        <span className="capitalize">{profile.party_type} · {profile.individual?.nationality || profile.corporate?.industry || 'N/A'}</span>
                        {profile.individual?.employment_status && (
                            <span>{profile.individual.employment_status}</span>
                        )}
                    </div>
                </div>

                {/* Contextual Actions */}
                <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                    <Button size="sm" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 gap-1.5" onClick={() => setCaseDialogOpen(true)}>
                        <FilePlus className="h-3.5 w-3.5" /> Open Service Case
                    </Button>
                    <Button size="sm" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 gap-1.5" onClick={() => router.push(`/credit?party_id=${profile.party_id}`)}>
                        <CreditCard className="h-3.5 w-3.5" /> Start Credit App
                    </Button>
                    <Button size="sm" variant="outline" className="border-amber-700/50 text-amber-400 hover:bg-amber-950/30 gap-1.5" onClick={onOpenComplianceTab}>
                        <ShieldAlert className="h-3.5 w-3.5" /> Compliance Panel
                    </Button>
                </div>
            </div>

            {/* Open Service Case Dialog */}
            <Dialog open={caseDialogOpen} onOpenChange={setCaseDialogOpen}>
                <DialogContent className="bg-slate-900 border-slate-700 text-slate-100 sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Open Service Case</DialogTitle>
                        <p className="text-sm text-slate-400">{profile.displayName}</p>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        <div className="space-y-1">
                            <Label className="text-xs text-slate-300">Subject *</Label>
                            <Input value={caseSubject} onChange={e => setCaseSubject(e.target.value)} className="bg-slate-950 border-slate-700 text-slate-100" placeholder="Brief issue description" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-slate-300">Description</Label>
                            <Textarea value={caseDesc} onChange={e => setCaseDesc(e.target.value)} className="bg-slate-950 border-slate-700 text-slate-100 resize-none" rows={3} />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-slate-300">Priority</Label>
                            <select value={casePriority} onChange={e => setCasePriority(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-md h-9 px-3 text-sm text-slate-200">
                                {['low', 'medium', 'high', 'critical'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" className="border-slate-700 text-slate-300" onClick={() => setCaseDialogOpen(false)}>Cancel</Button>
                        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleOpenCase} disabled={submitting}>
                            {submitting ? 'Opening…' : 'Open Case'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
