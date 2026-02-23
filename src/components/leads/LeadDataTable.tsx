"use client";

import { useState } from "react";
import { fmtDate } from "@/lib/date-utils";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Lead } from "@/lib/lead-mock-data";
import { ScoreSheet } from "./ScoreSheet";
import { Globe, Users, Building2, UserPlus, ArrowUpDown } from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface LeadDataTableProps {
    initialLeads: any[];
    onSelectLead: (lead: any) => void;
}

export function LeadDataTable({ initialLeads, onSelectLead }: LeadDataTableProps) {
    const { data: swrData } = useSWR('/api/leads?limit=100', fetcher, { fallbackData: { data: initialLeads } });
    const leads = swrData?.data || [];
    const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

    const handleLeadClick = (lead: any) => {
        setSelectedLeadId(lead.lead_id);
        onSelectLead(lead);
    };

    const getSourceIcon = (source: string) => {
        const lower = String(source || '').toLowerCase();
        switch (lower) {
            case 'web': return <Globe className="h-4 w-4 text-blue-400" />;
            case 'referral': return <Building2 className="h-4 w-4 text-emerald-400" />;
            case 'campaign': return <Users className="h-4 w-4 text-purple-400" />;
            default: return <UserPlus className="h-4 w-4 text-indigo-400" />;
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-xl">
            <Table>
                <TableHeader className="bg-slate-950/50">
                    <TableRow className="border-slate-800 hover:bg-slate-900/50">
                        <TableHead className="text-slate-400 font-semibold px-6 py-4">Lead Detail</TableHead>
                        <TableHead className="text-slate-400 font-semibold px-6 py-4">Source</TableHead>
                        <TableHead className="text-slate-400 font-semibold px-6 py-4">Rating</TableHead>
                        <TableHead className="text-slate-400 font-semibold px-6 py-4">Status</TableHead>
                        <TableHead className="text-slate-400 font-semibold px-6 py-4 text-right">Created</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {leads.map((lead: any) => (
                        <TableRow
                            key={lead.lead_id}
                            className={`border-slate-800 hover:bg-indigo-900/10 cursor-pointer transition-all duration-200 ${selectedLeadId === lead.lead_id ? 'bg-indigo-950/40 border-l-4 border-l-indigo-500' : ''}`}
                            onClick={() => handleLeadClick(lead)}
                        >
                            <TableCell className="px-6 py-4">
                                <div className="flex flex-col">
                                    <span className="font-bold text-slate-100 group-hover:text-indigo-300">{lead.full_legal_name}</span>
                                    <span className="text-[10px] text-slate-500 uppercase font-mono tracking-tighter">{lead.product_interest || 'General'}</span>
                                </div>
                            </TableCell>
                            <TableCell className="px-6 py-4">
                                <div className="flex items-center gap-2 text-slate-300 text-xs capitalize">
                                    {getSourceIcon(lead.source)}
                                    {lead.source}
                                </div>
                            </TableCell>
                            <TableCell className="px-6 py-4">
                                <Badge variant="outline" className={`text-[10px] font-bold px-2 py-0.5 capitalize ${lead.rating === 'hot' ? 'bg-red-500/10 text-red-400 border-red-500/30' : lead.rating === 'warm' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/30'}`}>
                                    {lead.rating}
                                </Badge>
                            </TableCell>
                            <TableCell className="px-6 py-4">
                                <Badge variant="outline" className={`text-[10px] font-bold px-2 py-0.5 capitalize
                                    ${lead.lead_status === 'new' ? 'text-blue-400 border-blue-500/30' : ''}
                                    ${lead.lead_status === 'contacted' ? 'text-amber-400 border-amber-500/30' : ''}
                                    ${lead.lead_status === 'qualified' ? 'text-indigo-400 border-indigo-500/30' : ''}
                                    ${lead.lead_status === 'converted' ? 'text-emerald-400 border-emerald-500/30' : ''}
                                    ${lead.lead_status === 'lost' ? 'text-slate-500 border-slate-700' : ''}
                                `}>
                                    {lead.lead_status}
                                </Badge>
                            </TableCell>
                            <TableCell className="px-6 py-4 text-right text-xs text-slate-500 font-mono">
                                {fmtDate(lead.created_at)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

