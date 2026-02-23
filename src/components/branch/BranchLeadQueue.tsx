"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { UserCheck, Clock, DollarSign, ArrowRight } from "lucide-react";

const DEMO_LEADS = [
    { id: 'L-891', name: 'Acme Logistics', product: 'Commercial Line', val: '$500k', bant: true, age: 2 },
    { id: 'L-892', name: 'Sarah Connor', product: 'Jumbo Mortgage', val: '$1.2M', bant: true, age: 1 },
    { id: 'L-895', name: 'TechFlow Inc', product: 'Treasury Mgmt', val: 'TBD', bant: false, age: 5 },
    { id: 'L-898', name: 'Robert Fox', product: 'Wealth Advisory', val: '$2.5M', bant: false, age: 14 }
];

export function BranchLeadQueue() {
    const [leads, setLeads] = useState(DEMO_LEADS);

    const handleConvert = (leadId: string, leadName: string) => {
        toast.success(`Converted ${leadName} to Opportunity`, { description: "Linked to pipeline successfully and RM assigned." });
        setLeads(leads.filter(l => l.id !== leadId));
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
                    {leads.map(lead => (
                        <div key={lead.id} className="p-4 hover:bg-slate-800/50 transition-colors flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-mono text-slate-500">{lead.id}</span>
                                    <span className="font-semibold text-slate-200">{lead.name}</span>
                                    {lead.bant ?
                                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[10px] font-bold">BANT Validated</span> :
                                        <span className="bg-slate-800 text-slate-400 border border-slate-700 px-1.5 py-0.5 rounded text-[10px] font-bold">Pending Qual</span>
                                    }
                                </div>
                                <div className="flex items-center gap-4 text-xs text-slate-400">
                                    <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> {lead.val}</span>
                                    <span className="flex items-center gap-1"><UserCheck className="h-3 w-3" /> {lead.product}</span>
                                    <span className={`flex items-center gap-1 ${lead.age > 7 ? 'text-amber-400' : ''}`}><Clock className="h-3 w-3" /> {lead.age} days in queue</span>
                                </div>
                            </div>
                            <Button
                                size="sm"
                                className={`text-xs h-8 ${lead.bant ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                                onClick={() => lead.bant ? handleConvert(lead.id, lead.name) : toast.info("Complete BANT qualification first before converting.")}
                            >
                                Convert <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                        </div>
                    ))}
                    {leads.length === 0 && <div className="p-8 text-center text-slate-500 text-sm">No active branch leads today.</div>}
                </div>
            </CardContent>
        </Card>
    );
}
