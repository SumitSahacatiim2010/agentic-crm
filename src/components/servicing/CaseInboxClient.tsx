"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, PhoneCall, Globe, MessageSquare, Building2, Mail, Scale, Clock, Search, Plus, Headphones } from "lucide-react";
import { CaseIntakeSheet } from "@/components/servicing/CaseIntakeSheet";
import { CaseDetailPanel } from "@/components/servicing/CaseDetailPanel";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(r => r.json());

export interface ServiceCase {
    case_id: string;
    subject: string;
    status: string;
    priority: string;
    priority_band: string;
    channel: string;
    is_regulatory: boolean;
    customer_id?: string;
    sla_deadline?: string;
    created_at?: string;
    customer_name?: string;
    ack_due_at?: string;
    resolution_due_at?: string;
}

interface CaseInboxClientProps {
    initialCases: ServiceCase[];
    slaEvents: Record<string, any[]>;
}

const CHANNEL_ICONS: Record<string, React.ReactNode> = {
    ivr: <PhoneCall className="h-3 w-3" />,
    web: <Globe className="h-3 w-3" />,
    chatbot: <MessageSquare className="h-3 w-3" />,
    branch: <Building2 className="h-3 w-3" />,
    email: <Mail className="h-3 w-3" />,
};

const BAND_COLORS: Record<string, string> = {
    P1: 'bg-red-600 text-white',
    P2: 'bg-orange-500 text-white',
    P3: 'bg-amber-500 text-slate-900',
    P4: 'bg-slate-600 text-slate-200',
};

function SlaChip({ dueAt }: { dueAt?: string }) {
    const [label, setLabel] = useState('');
    const [color, setColor] = useState('');

    useEffect(() => {
        if (!dueAt) { setLabel('No SLA'); setColor('text-slate-500'); return; }
        const tick = () => {
            const now = Date.now();
            const due = new Date(dueAt).getTime();
            const diff = due - now;
            if (diff <= 0) { setLabel('BREACHED'); setColor('text-red-500 font-black animate-pulse'); return; }
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const total = new Date(dueAt).getTime() - new Date(dueAt.replace(/T.*/, 'T00:00:00Z')).getTime();
            const pct = total > 0 ? (diff / total) * 100 : 0;
            setLabel(h > 0 ? `${h}h ${m}m` : `${m}m`);
            setColor(pct > 50 ? 'text-emerald-400' : pct > 20 ? 'text-amber-400' : 'text-red-400');
        };
        tick();
        const id = setInterval(tick, 30000);
        return () => clearInterval(id);
    }, [dueAt]);

    return <span className={`text-[10px] font-mono flex items-center gap-1 ${color}`}><Clock className="h-2.5 w-2.5" />{label}</span>;
}

const TABS = ['All', 'P1', 'Regulatory', 'My Cases'] as const;
type Tab = typeof TABS[number];
const CHANNELS = ['all', 'ivr', 'web', 'chatbot', 'branch', 'email'] as const;

export function CaseInboxClient({ initialCases, slaEvents }: CaseInboxClientProps) {
    const { data: swrData, mutate } = useSWR('/api/service/cases?limit=100', fetcher, { fallbackData: { data: initialCases } });
    const cases: ServiceCase[] = swrData?.data || [];

    const [localSlaEvents, setLocalSlaEvents] = useState(slaEvents);
    const [tab, setTab] = useState<Tab>('All');
    const [channel, setChannel] = useState<string>('all');
    const [search, setSearch] = useState('');
    const [selectedCase, setSelectedCase] = useState<ServiceCase | null>(null);
    const [intakeOpen, setIntakeOpen] = useState(false);

    const handleCaseCreated = useCallback((newCase: ServiceCase, events?: any[]) => {
        if (events && events.length) {
            setLocalSlaEvents(prev => ({ ...prev, [newCase.case_id]: events }));
        }
        mutate({ ...swrData, data: [newCase, ...cases] }, false);
        setSelectedCase(newCase);
    }, [cases, mutate, swrData]);

    const handleCaseUpdated = useCallback((updatedCase: Partial<ServiceCase> & { case_id: string }) => {
        mutate({ ...swrData, data: cases.map(c => c.case_id === updatedCase.case_id ? { ...c, ...updatedCase } : c) }, false);
        setSelectedCase(prev => prev?.case_id === updatedCase.case_id ? { ...prev, ...updatedCase } : prev);
    }, [cases, mutate, swrData]);

    const filtered = cases.filter(c => {
        if (tab === 'P1' && c.priority_band !== 'P1') return false;
        if (tab === 'Regulatory' && !c.is_regulatory) return false;
        if (channel !== 'all' && c.channel !== channel) return false;
        if (search && !c.subject.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const p1Count = cases.filter(c => c.priority_band === 'P1').length;
    const regCount = cases.filter(c => c.is_regulatory).length;

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header moves here to update dynamically when cases change */}
            <header className="flex items-center gap-3 px-6 py-4 border-b border-slate-800 bg-slate-950 shrink-0">
                <Headphones className="h-5 w-5 text-indigo-400" />
                <div>
                    <h1 className="text-xl font-bold text-white">Case Inbox</h1>
                    <p className="text-xs text-slate-500">Omnichannel service case management</p>
                </div>
                <div className="ml-auto flex items-center gap-3 text-xs text-slate-500">
                    <span className="bg-slate-900 border border-slate-700 rounded px-2 py-1">
                        {p1Count} P1
                    </span>
                    <span className="bg-slate-900 border border-slate-700 rounded px-2 py-1">
                        {regCount} Regulatory
                    </span>
                    <span className="bg-slate-900 border border-slate-700 rounded px-2 py-1">
                        {cases.length} total
                    </span>
                </div>
            </header>

            <div className="flex flex-1 gap-0 overflow-hidden">
                {/* LEFT PANEL — Case List */}
                <div className={`flex flex-col border-r border-slate-800 bg-slate-950 transition-all ${selectedCase ? 'w-[420px] shrink-0' : 'flex-1'}`}>
                    {/* Tab bar */}
                    <div className="flex items-center gap-1 px-3 pt-3 pb-0 border-b border-slate-800">
                        {TABS.map(t => (
                            <button key={t} onClick={() => setTab(t)}
                                className={`px-3 py-2 text-xs font-semibold rounded-t-lg flex items-center gap-1.5 transition-colors ${tab === t ? 'bg-slate-900 text-white border-t border-l border-r border-slate-700' : 'text-slate-500 hover:text-slate-300'}`}>
                                {t}
                                {t === 'P1' && p1Count > 0 && <span className="bg-red-600 text-white text-[9px] rounded-full px-1.5 py-0.5 font-black">{p1Count}</span>}
                                {t === 'Regulatory' && regCount > 0 && <span className="bg-amber-600 text-white text-[9px] rounded-full px-1.5 py-0.5 font-black">{regCount}</span>}
                            </button>
                        ))}
                        <div className="flex-1" />
                        <Button size="sm" className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 mb-1" onClick={() => setIntakeOpen(true)}>
                            <Plus className="h-3.5 w-3.5 mr-1" /> New Case
                        </Button>
                    </div>

                    {/* Search + channel filter */}
                    <div className="p-3 flex gap-2 border-b border-slate-800">
                        <div className="relative flex-1">
                            <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-slate-500" />
                            <Input value={search} onChange={e => setSearch(e.target.value)} className="pl-7 h-8 text-xs bg-slate-900 border-slate-700 text-slate-100" placeholder="Search cases…" />
                        </div>
                        <select value={channel} onChange={e => setChannel(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-md h-8 px-2 text-xs text-slate-200">
                            {CHANNELS.map(c => <option key={c} value={c}>{c === 'all' ? 'All Channels' : c.toUpperCase()}</option>)}
                        </select>
                    </div>

                    {/* Case list */}
                    <div className="flex-1 overflow-y-auto divide-y divide-slate-900">
                        {filtered.length === 0 && (
                            <p className="text-center text-slate-600 text-xs py-10">No cases match current filters.</p>
                        )}
                        {filtered.map(c => {
                            const caseEvents = localSlaEvents[c.case_id] || [];
                            const ackEvent = caseEvents.find((e: any) => e.event_type === 'acknowledgment');
                            const isSelected = selectedCase?.case_id === c.case_id;
                            const isBreach = ackEvent?.sla_due_at && new Date(ackEvent.sla_due_at) < new Date() && ackEvent.status === 'pending';
                            return (
                                <div key={c.case_id} onClick={() => setSelectedCase(c)}
                                    className={`px-3 py-3 hover:bg-slate-900 cursor-pointer transition-colors ${isSelected ? 'bg-slate-800 border-l-2 border-indigo-500' : ''} ${isBreach ? 'border-l-2 border-red-600' : ''}`}>
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${BAND_COLORS[c.priority_band] || BAND_COLORS.P4}`}>{c.priority_band}</span>
                                        {c.is_regulatory && <Scale className="h-3 w-3 text-amber-400" />}
                                        {isBreach && <AlertTriangle className="h-3 w-3 text-red-500 animate-pulse" />}
                                        <div className="flex items-center gap-0.5 text-slate-600">{CHANNEL_ICONS[c.channel] || <Globe className="h-3 w-3" />}</div>
                                        <SlaChip dueAt={c.sla_deadline} />
                                        <span className="ml-auto text-[10px] text-slate-600 capitalize">{c.status}</span>
                                    </div>
                                    <p className="text-xs font-semibold text-slate-200 line-clamp-1">{c.subject}</p>
                                    {c.customer_name && <p className="text-[10px] text-slate-500 mt-0.5">{c.customer_name}</p>}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* RIGHT PANEL — Detail */}
                {selectedCase && (
                    <div className="flex-1 overflow-hidden bg-slate-950">
                        <CaseDetailPanel
                            caseData={selectedCase}
                            slaEvents={localSlaEvents[selectedCase.case_id] || []}
                            onClose={() => setSelectedCase(null)}
                            onUpdated={handleCaseUpdated}
                        />
                    </div>
                )}

                {!selectedCase && (
                    <div className="flex-1 flex items-center justify-center text-slate-700 text-sm flex-col gap-2">
                        <Scale className="h-8 w-8 text-slate-800" />
                        Select a case to view details
                    </div>
                )}

                <CaseIntakeSheet open={intakeOpen} onOpenChange={setIntakeOpen} onCaseCreated={handleCaseCreated} />
            </div>
        </div>
    );
}
