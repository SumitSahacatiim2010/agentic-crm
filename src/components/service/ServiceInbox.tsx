"use client";

import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { SLATimer } from "@/components/service/SLATimer";
import { ServiceCase, MOCK_CASES } from "@/lib/service-mock-data";
import { Phone, Globe, MessageSquare, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useRealtimeChannel } from "@/hooks/useRealtimeChannel";

interface ServiceInboxProps {
    selectedId?: string;
    onSelect: (c: ServiceCase) => void;
}

const ChannelIcon = ({ channel }: { channel: string }) => {
    switch (channel) {
        case 'Phone': return <Phone className="h-3 w-3" />;
        case 'Web': return <Globe className="h-3 w-3" />;
        case 'Chatbot': return <MessageSquare className="h-3 w-3" />;
        case 'Branch': return <MapPin className="h-3 w-3" />;
        default: return <Globe className="h-3 w-3" />;
    }
};

export function ServiceInbox({ selectedId, onSelect }: ServiceInboxProps) {
    const [cases, setCases] = useState<ServiceCase[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        async function fetchInitial() {
            try {
                const res = await fetch('/api/service/cases?limit=50');
                const json = await res.json();
                if (isMounted && json.data) {
                    setCases(json.data);
                }
            } catch (e) {
                console.error("Failed to fetch cases:", e);
            } finally {
                if (isMounted) setLoading(false);
            }
        }
        fetchInitial();
        return () => { isMounted = false; };
    }, []);

    // Real-time: new cases appear instantly
    useRealtimeChannel('service_inbox', 'INSERT_service_cases', (payload: any) => {
        const newCase: ServiceCase = {
            id: payload.id,
            case_id: payload.id,
            subject: payload.subject,
            priority: payload.priority || 'Medium',
            priority_band: payload.priority_band || 'P3',
            status: payload.status || 'Open',
            createdAt: payload.created_at,
            created_at: payload.created_at,
            slaDeadline: payload.sla_deadline,
            sla_deadline: payload.sla_deadline,
            channel: payload.channel || 'Web'
        };
        setCases((prev) => [newCase, ...prev]);
        toast.info(`New Service Case: ${payload.subject}`, {
            description: `Priority: ${payload.priority_band || 'P3'}`,
            duration: 5000,
        });
    });

    const displayCases = cases.map(c => ({
        ...c,
        id: c.case_id || (c as any).id, // Fallback for very brief transition
        customerName: c.customer_name || c.customerName || 'Standard Customer',
        slaDeadline: c.sla_deadline || c.slaDeadline || new Date().toISOString(),
        createdAt: c.created_at || c.createdAt || new Date().toISOString(),
        priority: (c.priority || 'Medium').replace('P1-', '').replace('P2-', '').replace('P3-', '').replace('P4-', '')
    }));
    return (
        <div className="h-full bg-slate-900 border-r border-slate-800 flex flex-col w-80">
            <div className="p-4 border-b border-slate-800">
                <h2 className="font-semibold text-slate-100">Unified Inbox</h2>
                <div className="text-xs text-slate-500 mt-1">{displayCases.length} Active Cases</div>
            </div>
            <ScrollArea className="flex-1">
                {loading && (
                    <div className="p-8 text-center text-slate-500 text-xs">Loading inbox...</div>
                )}
                {!loading && displayCases.length === 0 && (
                    <div className="p-8 text-center text-slate-500 text-xs">No active cases found.</div>
                )}
                <div className="divide-y divide-slate-800">
                    {displayCases.map((c) => (
                        <div
                            key={c.id}
                            onClick={() => onSelect(c as any)}
                            className={`
                        p-4 cursor-pointer hover:bg-slate-800/50 transition-colors
                        ${selectedId === c.id ? 'bg-indigo-900/20 border-l-2 border-indigo-500' : 'border-l-2 border-transparent'}
                    `}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="bg-slate-800 text-slate-400 h-5 px-1.5 flex gap-1">
                                        <ChannelIcon channel={c.channel} />
                                        {c.channel}
                                    </Badge>
                                    <span className="text-xs font-mono text-slate-500">{c.id.substring(0, 8)}</span>
                                </div>
                                <SLATimer deadline={c.slaDeadline} />
                            </div>

                            <h3 className={`text-sm font-medium mt-2 line-clamp-1 ${selectedId === c.id ? 'text-indigo-300' : 'text-slate-200'}`}>
                                {c.subject}
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">{c.customerName}</p>

                            <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className={`
                            text-[10px] h-4 px-1
                            ${c.priority === 'High' || c.priority === 'Critical' ? 'text-rose-400 border-rose-900/50' : 'text-slate-400 border-slate-700'}
                         `}>
                                    {c.priority}
                                </Badge>
                                <span className="text-[10px] text-slate-600 ml-auto">
                                    {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
