"use client";

import { useState } from "react";
import { fmtDate } from "@/lib/date-utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, Users, Building2, UserPlus, Filter, ChevronLeft, ChevronRight, UserCheck, RefreshCw } from "lucide-react";
import useSWR from "swr";
import { toast } from "sonner";
import { useRealtimeChannel } from "@/hooks/useRealtimeChannel";

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface LeadDataTableProps {
    initialLeads: any[];
    onSelectLead: (lead: any) => void;
}

export function LeadDataTable({ initialLeads, onSelectLead }: LeadDataTableProps) {
    const [page, setPage] = useState(1);
    const limit = 15;
    const [statusFilter, setStatusFilter] = useState("all");
    const [sourceFilter, setSourceFilter] = useState("all");
    const [activeTab, setActiveTab] = useState("all"); // 'all', 'mine', 'hot', 'unassigned'

    // For Bulk Selection
    const [selectedLeads, setSelectedLeads] = useState<string[]>([]);

    let apiUrl = `/api/leads?limit=${limit}&page=${page}`;
    if (statusFilter !== "all") apiUrl += `&status=${statusFilter}`;
    if (sourceFilter !== "all") apiUrl += `&source=${sourceFilter}`;
    if (activeTab === "mine") apiUrl += `&owner_id=current-user`; // Mocked logic
    if (activeTab === "hot") apiUrl += `&rating_band=Hot`;
    if (activeTab === "unassigned") apiUrl += `&owner_id=unassigned`;

    const { data: swrData, mutate, isLoading } = useSWR(apiUrl, fetcher, {
        fallbackData: page === 1 && statusFilter === "all" && activeTab === "all" ? { data: initialLeads, meta: { total: initialLeads.length } } : undefined
    });

    const leads = swrData?.data || [];
    const meta = swrData?.meta || { total: 0 };
    const totalPages = Math.max(1, Math.ceil(meta.total / limit));

    // Real-time: auto-refresh when new leads arrive
    useRealtimeChannel('leads', 'INSERT_lead', (payload: any) => {
        mutate();
        toast.info(`New Lead: ${payload.full_name || 'Unknown'}`, {
            description: `Source: ${payload.source_channel || 'Unknown'}`,
            duration: 4000,
        });
    });

    const [activeLeadId, setActiveLeadId] = useState<string | null>(null);

    const handleLeadClick = (lead: any, openRow: boolean = true) => {
        if (openRow) {
            setActiveLeadId(lead.id);
            onSelectLead(lead);
        }
    };

    const toggleSelection = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setSelectedLeads(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const toggleAll = () => {
        if (selectedLeads.length === leads.length) setSelectedLeads([]);
        else setSelectedLeads(leads.map((l: any) => l.id));
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

    const handleBulkAssign = async () => {
        if (selectedLeads.length === 0) return;
        toast.success(`Assigned ${selectedLeads.length} leads to yourself`);
        setSelectedLeads([]);
        mutate();
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-xl flex flex-col">
            {/* View Tabs */}
            <div className="flex px-4 border-b border-slate-800 overflow-x-auto bg-slate-950/30">
                {['all', 'mine', 'hot', 'unassigned'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => { setActiveTab(tab); setPage(1); }}
                        className={`px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${activeTab === tab ? 'border-indigo-500 text-indigo-300' : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'}`}
                    >
                        {tab === 'all' && 'All Leads'}
                        {tab === 'mine' && 'My Leads'}
                        {tab === 'hot' && 'Hot Leads'}
                        {tab === 'unassigned' && 'Unassigned Queue'}
                    </button>
                ))}
            </div>

            {/* Toolbar Area */}
            <div className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between border-b border-slate-800/60 bg-slate-900">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                        <Input placeholder="Search names..." className="pl-9 h-9 w-[200px] bg-slate-950 border-slate-800 text-sm" />
                    </div>

                    <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
                        <SelectTrigger className="h-9 w-[140px] bg-slate-950 border-slate-800">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="New">New</SelectItem>
                            <SelectItem value="Contacted">Contacted</SelectItem>
                            <SelectItem value="In Discussion">In Discussion</SelectItem>
                            <SelectItem value="Converted">Converted</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={sourceFilter} onValueChange={v => { setSourceFilter(v); setPage(1); }}>
                        <SelectTrigger className="h-9 w-[130px] bg-slate-950 border-slate-800">
                            <SelectValue placeholder="Source" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Sources</SelectItem>
                            <SelectItem value="Web">Web</SelectItem>
                            <SelectItem value="Branch">Branch</SelectItem>
                            <SelectItem value="Partner">Partner</SelectItem>
                            <SelectItem value="Marketing">Marketing</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Bulk Actions */}
                {selectedLeads.length > 0 && (
                    <div className="flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
                        <span className="text-xs text-slate-400 mr-2">{selectedLeads.length} selected</span>
                        <Button size="sm" onClick={handleBulkAssign} className="h-8 bg-indigo-600 hover:bg-indigo-700">
                            <UserCheck className="h-4 w-4 mr-2" /> Assign to Me
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 border-slate-700 hover:bg-slate-800" onClick={() => setSelectedLeads([])}>
                            Clear
                        </Button>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto min-h-[400px]">
                <Table>
                    <TableHeader className="bg-slate-950/80 sticky top-0 z-10 backdrop-blur-sm">
                        <TableRow className="border-slate-800 hover:bg-transparent">
                            <TableHead className="w-[40px] px-4">
                                <Checkbox checked={leads.length > 0 && selectedLeads.length === leads.length} onCheckedChange={toggleAll} className="border-slate-600" />
                            </TableHead>
                            <TableHead className="text-slate-400 font-semibold px-4 py-3">Lead Detail</TableHead>
                            <TableHead className="text-slate-400 font-semibold px-4 py-3">Source</TableHead>
                            <TableHead className="text-slate-400 font-semibold px-4 py-3">Rating</TableHead>
                            <TableHead className="text-slate-400 font-semibold px-4 py-3">Status</TableHead>
                            <TableHead className="text-slate-400 font-semibold px-4 py-3">Assigned To</TableHead>
                            <TableHead className="text-slate-400 font-semibold px-4 py-3 text-right">Created</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && leads.length === 0 ? (
                            <TableRow><TableCell colSpan={7} className="h-32 text-center text-slate-500"><RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" /> Loading leads...</TableCell></TableRow>
                        ) : leads.length === 0 ? (
                            <TableRow><TableCell colSpan={7} className="h-32 text-center text-slate-500">No leads found matching criteria.</TableCell></TableRow>
                        ) : (
                            leads.map((lead: any) => (
                                <TableRow
                                    key={lead.id}
                                    className={`border-slate-800/60 hover:bg-indigo-900/10 cursor-pointer transition-all duration-200 ${activeLeadId === lead.id ? 'bg-indigo-950/40 border-l-2 border-l-indigo-500' : ''}`}
                                    onClick={() => handleLeadClick(lead)}
                                >
                                    <TableCell className="px-4" onClick={(e) => e.stopPropagation()}>
                                        <Checkbox checked={selectedLeads.includes(lead.id)} onCheckedChange={() => toggleSelection({ stopPropagation: () => { } } as any, lead.id)} className="border-slate-600" />
                                    </TableCell>
                                    <TableCell className="px-4 py-3">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-100 group-hover:text-indigo-300">{lead.full_name}</span>
                                            <span className="text-[10px] text-slate-500 uppercase font-mono tracking-tighter truncate max-w-[150px]">{lead.product_interest || 'General'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-4 py-3">
                                        <div className="flex items-center gap-2 text-slate-300 text-xs capitalize">
                                            {getSourceIcon(lead.source_channel)}
                                            {lead.source_channel}
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-4 py-3">
                                        <Badge variant="outline" className={`text-[10px] font-bold px-2 py-0 capitalize ${lead.lead_rating?.toLowerCase() === 'hot' ? 'bg-red-500/10 text-red-400 border-red-500/30' : lead.lead_rating?.toLowerCase() === 'warm' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/30'}`}>
                                            {lead.lead_rating || 'Cold'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="px-4 py-3">
                                        <Badge variant="outline" className={`text-[10px] font-bold px-2 py-0 capitalize
                                            ${lead.status?.toLowerCase() === 'new' ? 'text-blue-400 border-blue-500/30' : ''}
                                            ${lead.status?.toLowerCase() === 'contacted' ? 'text-amber-400 border-amber-500/30' : ''}
                                            ${lead.status?.toLowerCase() === 'in discussion' ? 'text-indigo-400 border-indigo-500/30' : ''}
                                            ${lead.status?.toLowerCase() === 'converted' ? 'text-emerald-400 border-emerald-500/30' : ''}
                                            ${lead.status?.toLowerCase() === 'not interested' ? 'text-slate-500 border-slate-700' : ''}
                                        `}>
                                            {lead.status || 'New'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-xs text-slate-400">
                                        {lead.owner_id ? lead.owner_id.substring(0, 8) + '...' : <span className="text-amber-500 border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 rounded text-[10px]">Unassigned</span>}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-right text-xs text-slate-500 font-mono">
                                        {fmtDate(lead.created_at)}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="px-4 py-3 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between text-xs text-slate-400">
                    <div>Showing {(page - 1) * limit + 1} to {Math.min(page * limit, meta.total)} of {meta.total} leads</div>
                    <div className="flex gap-1">
                        <Button variant="outline" size="icon" className="h-7 w-7 border-slate-700" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-7 w-7 border-slate-700" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
