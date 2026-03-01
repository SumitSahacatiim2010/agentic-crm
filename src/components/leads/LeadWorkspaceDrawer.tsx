"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Phone, Mail, MapPin, Building, Globe, CheckCircle2, AlertCircle, XCircle, ArrowRight, MessageSquare, Briefcase, FileText } from "lucide-react";
import { fmtDate } from "@/lib/date-utils";
import useSWR from "swr";
import { toast } from "sonner";
import { LeadQualificationForm } from "./LeadQualificationForm";

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface LeadWorkspaceDrawerProps {
    leadId: string | null;
    onClose: () => void;
}

export function LeadWorkspaceDrawer({ leadId, onClose }: LeadWorkspaceDrawerProps) {
    const { data: swrResponse, mutate, isLoading } = useSWR(leadId ? `/api/leads/${leadId}` : null, fetcher);
    const leadResponse = swrResponse?.data;
    const lead = leadResponse || {};
    const activities = lead.lead_activities || [];
    const documents = lead.lead_documents || [];
    const logs = lead.lead_audit_log || [];

    const handleConvert = async () => {
        toast.promise(
            fetch('/api/leads/convert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lead_id: leadId })
            }),
            {
                loading: 'Converting to Opportunity...',
                success: 'Lead successfully converted to Opportunity!',
                error: 'Failed to convert lead'
            }
        );
        onClose();
    };

    const handleReject = () => {
        // Mock rejection flow for now
        toast.success("Lead rejected");
        onClose();
    };

    if (!leadId) return null;

    return (
        <Sheet open={!!leadId} onOpenChange={(open) => !open && onClose()}>
            <SheetContent side="right" className="w-[95vw] sm:max-w-none md:w-[90vw] lg:w-[85vw] xl:w-[80vw] p-0 bg-slate-950 border-slate-800 text-slate-100 flex flex-col">

                {/* Header Section */}
                <div className="flex-none p-6 border-b border-slate-800 bg-slate-900/50 flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Badge className={`px-2 py-0.5 capitalize text-xs bg-slate-800 text-slate-300 pointer-events-none border-0`}>
                                Lead #{lead.id?.substring(0, 8)}
                            </Badge>
                            <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">{lead.status || 'New'}</Badge>
                            {lead.priority_flag && <Badge className="bg-red-500/10 text-red-400 border-red-500/20">High Priority</Badge>}
                        </div>
                        <SheetTitle className="text-2xl font-bold text-white tracking-tight">{lead.full_name || 'Loading...'}</SheetTitle>
                        <SheetDescription className="text-slate-400 font-mono text-sm">
                            Created {fmtDate(lead.created_at)} • Source: {lead.source_channel || 'Unknown'}
                        </SheetDescription>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" className="border-red-900 text-red-400 hover:bg-red-950/30" onClick={handleReject}>
                            <XCircle className="w-4 h-4 mr-2" /> Reject
                        </Button>
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={lead.status === 'Converted'} onClick={handleConvert}>
                            <ArrowRight className="w-4 h-4 mr-2" /> Convert to Opportunity
                        </Button>
                    </div>
                </div>

                {/* 3-Panel Content Area */}
                <ScrollArea className="flex-1 p-6">
                    {isLoading ? (
                        <div className="flex h-full items-center justify-center text-slate-500">Loading workspace...</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full items-start">

                            {/* Panel 1: Summary Context (3 cols) */}
                            <div className="md:col-span-4 lg:col-span-3 space-y-6">
                                {/* Lead Score Widget */}
                                <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Qualification Score</h4>
                                    <div className="flex items-end gap-3 mb-2">
                                        <span className="text-4xl font-black tracking-tighter text-indigo-400">{lead.lead_score || 0}</span>
                                        <span className="text-sm text-slate-500 mb-1">/ 100</span>
                                    </div>
                                    <Progress value={lead.lead_score || 0} className="h-2 mb-3 bg-slate-800" indicatorClassName={lead.lead_score >= 75 ? 'bg-red-500' : lead.lead_score >= 40 ? 'bg-amber-500' : 'bg-blue-500'} />
                                    <Badge variant="outline" className={`text-xs ${lead.lead_rating?.toLowerCase() === 'hot' ? 'text-red-400 border-red-500/30' : lead.lead_rating?.toLowerCase() === 'warm' ? 'text-amber-400 border-amber-500/30' : 'text-blue-400 border-blue-500/30'}`}>
                                        {lead.lead_rating || 'Cold'} Lead
                                    </Badge>
                                </div>

                                {/* Customer Details */}
                                <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Customer Profile</h4>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex items-center gap-3 text-slate-300">
                                            <Mail className="h-4 w-4 text-slate-500" /> <span className="truncate">{lead.email || '—'}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-300">
                                            <Phone className="h-4 w-4 text-slate-500" /> <span>{lead.phone || '—'}</span>
                                        </div>
                                        <div className="flex items-start gap-3 text-slate-300">
                                            <Building className="h-4 w-4 text-slate-500 mt-1" />
                                            <div>
                                                <div className="font-semibold text-slate-200">{lead.segment || 'Retail'} Segment</div>
                                                <div className="text-xs text-slate-500">Assigned: {lead.owner_id ? 'RM ' + lead.owner_id.substring(0, 8) : 'Unassigned'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Product Interest */}
                                <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Product Interest</h4>
                                    <div className="flex items-center gap-3 text-slate-200">
                                        <Briefcase className="h-5 w-5 text-indigo-400" />
                                        <span className="font-semibold">{lead.product_interest || 'General Inquiry'}</span>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-400">
                                        Channel: <span className="text-slate-300 font-medium">{lead.source_channel || 'Web'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Panel 2: Qualification & Workflow (5 cols) */}
                            <div className="md:col-span-8 lg:col-span-5 space-y-6">
                                {/* Status State Machine Visualizer */}
                                <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Workflow Progress</h4>
                                    <div className="flex items-center justify-between mt-6 relative">
                                        {/* Connecting Line */}
                                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-800 -z-0 -translate-y-1/2"></div>
                                        {/* Steps */}
                                        {['New', 'Contacted', 'In Discussion', 'Converted'].map((step, i) => {
                                            const statuses = ['New', 'Contacted', 'In Discussion', 'Converted'];
                                            const currentIndex = statuses.indexOf(lead.status || 'New');
                                            const isCompleted = currentIndex >= i;
                                            const isActive = currentIndex === i;
                                            return (
                                                <div key={step} className="relative z-10 flex flex-col items-center gap-2">
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${isActive ? 'border-indigo-500 bg-indigo-950' : isCompleted ? 'border-indigo-500 bg-indigo-500' : 'border-slate-700 bg-slate-900'}`}>
                                                        {isCompleted && !isActive && <CheckCircle2 className="w-3 h-3 text-white" />}
                                                        {isActive && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
                                                    </div>
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-indigo-400' : isCompleted ? 'text-slate-300' : 'text-slate-600'}`}>{step}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Reusing the robust BANT form from earlier phases, passing the lead context */}
                                <LeadQualificationForm selectedLead={lead} hideLayout />

                                {/* Document Checklist (Mock) */}
                                <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2"><FileText className="w-4 h-4" /> Document KYC</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 border border-slate-800 rounded bg-slate-950/50">
                                            <span className="text-sm font-medium text-slate-300">Identity Proof (PAN)</span>
                                            <Badge variant="outline" className="text-emerald-400 border-emerald-500/20 bg-emerald-500/10">Received</Badge>
                                        </div>
                                        <div className="flex items-center justify-between p-3 border border-slate-800 rounded bg-slate-950/50">
                                            <span className="text-sm font-medium text-slate-300">Address Proof</span>
                                            <Badge variant="outline" className="text-amber-400 border-amber-500/20 bg-amber-500/10">Pending</Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Panel 3: Activity & Collaboration (4 cols) */}
                            <div className="md:col-span-12 lg:col-span-4 space-y-6">
                                <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col h-[calc(100vh-180px)]">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4" /> Activity Timeline
                                    </h4>

                                    {/* Timeline Feed */}
                                    <ScrollArea className="flex-1 pr-4 -mr-4">
                                        <div className="space-y-6 pb-4 relative">
                                            <div className="absolute top-2 bottom-0 left-[11px] w-0.5 bg-slate-800 -z-0"></div>

                                            {/* Render Activities */}
                                            {activities.length === 0 ? (
                                                <div className="text-sm text-slate-500 text-center py-4 relative z-10">No activities yet. log a call to get started.</div>
                                            ) : (
                                                activities.map((act: any) => (
                                                    <div key={act.id} className="relative z-10 flex gap-4">
                                                        <div className="w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-900 flex-shrink-0 flex items-center justify-center mt-1">
                                                            {act.activity_type === 'Call' ? <Phone className="w-3 h-3 text-blue-400" /> : <MessageSquare className="w-3 h-3 text-emerald-400" />}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-sm font-semibold text-slate-200">{act.activity_type}</span>
                                                                <span className="text-[10px] text-slate-500 font-mono">{fmtDate(act.timestamp)}</span>
                                                            </div>
                                                            <div className="text-sm text-slate-400">{act.description}</div>
                                                            {act.outcome && <Badge variant="outline" className="mt-2 text-[10px] text-slate-400 border-slate-700 bg-slate-950/50">Outcome: {act.outcome}</Badge>}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </ScrollArea>

                                    {/* Activity Input */}
                                    <div className="pt-4 border-t border-slate-800 mt-4">
                                        <textarea
                                            placeholder="Log a call, note, or @mention someone..."
                                            className="w-full bg-slate-950 border border-slate-800 rounded-md p-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 resize-none h-24 mb-3"
                                        ></textarea>
                                        <div className="flex items-center justify-between">
                                            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200"><Phone className="w-4 h-4 mr-2" /> Log Call</Button>
                                            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">Save Note</Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    )}
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
