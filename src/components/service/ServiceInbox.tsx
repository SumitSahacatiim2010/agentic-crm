"use client";

import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { SLATimer } from "@/components/service/SLATimer";
import { ServiceCase, MOCK_CASES } from "@/lib/service-mock-data";
import { Phone, Globe, MessageSquare, MapPin } from "lucide-react";
import { insforge } from "@/lib/insforge";
import { toast } from "sonner";

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
    const [cases, setCases] = useState<ServiceCase[]>(MOCK_CASES);

    useEffect(() => {
        let isMounted = true;

        async function setupRealtime() {
            try {
                if (!insforge.realtime.isConnected) {
                    await insforge.realtime.connect();
                }
                await insforge.realtime.subscribe('service_inbox');

                insforge.realtime.on('INSERT_lead', (payload: any) => {
                    if (!isMounted) return;

                    const newCase: ServiceCase = {
                        id: `INQ-${Math.floor(Math.random() * 10000)}`,
                        customerId: payload.lead_id,
                        subject: 'New Lead Inquiry',
                        customerName: `Lead ID: ${payload.lead_id.substring(0, 8)}`,
                        priority: 'High',
                        status: 'New',
                        createdAt: payload.created_at || new Date().toISOString(),
                        slaDeadline: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
                        channel: 'Web',
                        category: 'General'
                    };

                    setCases((prev) => [newCase, ...prev]);

                    toast.info(`New Service Case: Web Inquiry`, {
                        description: `SLA Deadline: 2 hours`,
                        duration: 5000,
                    });
                });
            } catch (error) {
                console.error("Realtime connection error:", error);
            }
        }

        setupRealtime();

        return () => {
            isMounted = false;
            try {
                insforge.realtime.unsubscribe('service_inbox');
            } catch (e) { }
        };
    }, []);
    return (
        <div className="h-full bg-slate-900 border-r border-slate-800 flex flex-col w-80">
            <div className="p-4 border-b border-slate-800">
                <h2 className="font-semibold text-slate-100">Unified Inbox</h2>
                <div className="text-xs text-slate-500 mt-1">{cases.length} Active Cases</div>
            </div>
            <ScrollArea className="flex-1">
                <div className="divide-y divide-slate-800">
                    {cases.map((c) => (
                        <div
                            key={c.id}
                            onClick={() => onSelect(c)}
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
                                    <span className="text-xs font-mono text-slate-500">{c.id}</span>
                                </div>
                                <SLATimer deadline={c.slaDeadline} />
                            </div>

                            <h3 className={`text-sm font-medium mt-2 line-clamp-1 ${selectedId === c.id ? 'text-indigo-300' : 'text-slate-200'}`}>
                                {c.subject}
                            </h3>
                            <div className="text-xs text-slate-400 mt-1">{c.customerName}</div>

                            <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className={`
                            text-[10px] h-4 px-1
                            ${c.priority === 'High' ? 'text-rose-400 border-rose-900/50' : 'text-slate-400 border-slate-700'}
                         `}>
                                    {c.priority} Legacy
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
