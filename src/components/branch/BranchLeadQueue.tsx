"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { UserCheck, Clock, DollarSign, ArrowRight } from "lucide-react";
import useSWR from "swr";
import { useRealtimeChannel } from "@/hooks/useRealtimeChannel";


const fetcher = (url: string) => fetch(url).then(r => r.json());

export function BranchLeadQueue() {
    const { data: swrData, mutate } = useSWR('/api/leads?status=New', fetcher);
    const leads = swrData?.data || [];

    // Real-time: auto-refresh when new walk-in leads arrive
    useRealtimeChannel('leads', 'INSERT_lead', (payload: any) => {
        mutate();
        toast.info(`New Walk-In: ${payload.full_name || 'Lead'}`, {
            description: payload.product_interest || 'General inquiry',
            duration: 4000,
        });
    });

    const handleConvert = async (leadId: string, leadName: string) => {
        try {
            const res = await fetch(`/api/leads/${leadId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Qualified', qualification_stage: 'Qualified' })
            });
            if (res.ok) {
                toast.success(`Validated ${leadName}`, { description: "Lead status updated to Qualified." });
                mutate();
            } else {
                toast.error("Update failed");
            }
        } catch (e) {
            toast.error("Network error");
        }
    };

    return (
        <Card className="bg-slate-900 border-slate-800 h-full flex flex-col">
            <CardHeader className="pb-3 border-b border-slate-800">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg text-slate-100">Walk-in Leads & Qualification</CardTitle>
                    <Button variant="outline" size="sm" className="h-7 text-xs border-slate-700 text-slate-300">New Entry</Button>
                </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto">
                <div className="divide-y divide-slate-800">
                    {leads.map((lead: any) => (
                        <div key={lead.id} className="p-4 hover:bg-slate-800/50 transition-colors flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-mono text-slate-500">{lead.id.substring(0, 5)}</span>
                                    <span className="font-semibold text-slate-200">{lead.full_name}</span>
                                    {lead.bant_budget && lead.bant_authority && lead.bant_need && lead.bant_timeline ?
                                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[10px] font-bold">BANT Validated</span> :
                                        <span className="bg-slate-800 text-slate-400 border border-slate-700 px-1.5 py-0.5 rounded text-[10px] font-bold">Pending Qual</span>
                                    }
                                </div>
                                <div className="flex items-center gap-4 text-xs text-slate-400">
                                    <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> {lead.lead_rating || 'Cold'}</span>
                                    <span className="flex items-center gap-1"><UserCheck className="h-3 w-3" /> {lead.product_interest || 'General'}</span>
                                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(lead.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <Button
                                size="sm"
                                className={`text-xs h-8 ${(lead.bant_budget && lead.bant_authority) ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                                onClick={() => (lead.bant_budget && lead.bant_authority) ? handleConvert(lead.id, lead.full_name) : toast.info("Complete BANT qualification in details first.")}
                            >
                                Validate <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                        </div>
                    ))}
                    {leads.length === 0 && <div className="p-8 text-center text-slate-500 text-sm">No active leads found in database.</div>}
                </div>
            </CardContent>
        </Card>
    );
}
