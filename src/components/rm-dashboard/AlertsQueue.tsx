"use client";

import { useEffect, useState } from "react";
import { insforge } from "@/lib/insforge";
import { toast } from "sonner";
import { fmtDate } from "@/lib/date-utils";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, ArrowRight, CheckCircle2, Clock, Bell } from "lucide-react";

// Flexible interface to handle both standard and simulated alerts
interface AlertItem {
    id: string;
    title: string;
    priority: string;
    type?: string;
    customer: string;
    due?: string;
    description?: string;
    time?: string;
}

interface AlertsQueueProps {
    alerts: AlertItem[];
}

export function AlertsQueue({ alerts: initialAlerts }: AlertsQueueProps) {
    const [alerts, setAlerts] = useState<AlertItem[]>(initialAlerts);

    useEffect(() => {
        let isMounted = true;

        async function setupRealtime() {
            try {
                if (!insforge.realtime.isConnected) {
                    await insforge.realtime.connect();
                }
                await insforge.realtime.subscribe('activities');

                insforge.realtime.on('INSERT_activity', (payload: any) => {
                    if (!isMounted) return;

                    const newAlert: AlertItem = {
                        id: payload.activity_id,
                        title: payload.subject,
                        priority: payload.activity_type === 'Call' ? 'High' : 'Medium',
                        type: payload.activity_type,
                        customer: 'New Assigned Task',
                        due: fmtDate(payload.due_date || new Date()),
                        description: payload.notes,
                    };

                    setAlerts((prev) => [newAlert, ...prev]);

                    toast.success(`New Task Assigned: ${payload.subject}`, {
                        description: `Due: ${newAlert.due}`,
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
            // Note: insforge.realtime.unsubscribe and disconnect should be managed globally 
            // but we can unsubscribe this specific channel
            try {
                insforge.realtime.unsubscribe('activities');
            } catch (e) { }
        };
    }, []);

    const getPriorityColor = (p: string) => {
        switch (p) {
            case 'Critical': return 'text-red-400 bg-red-500/10 border-red-500/20';
            case 'High': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
            case 'Medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
            default: return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
        }
    };

    return (
        <Card className="bg-slate-950 border border-slate-800 h-full flex flex-col">
            <CardHeader className="border-b border-slate-800 pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-slate-100 flex items-center gap-2 text-sm font-medium">
                        <AlertCircle className="h-4 w-4 text-indigo-400" />
                        Task Queue
                        <Badge variant="secondary" className="ml-2 bg-slate-800 text-slate-300">
                            {alerts.length}
                        </Badge>
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="flex-1 p-0">
                <ScrollArea className="h-[400px]">
                    <div className="divide-y divide-slate-800">
                        {alerts.map((alert) => (
                            <div
                                key={alert.id}
                                className={`
                                    p-4 hover:bg-slate-900/50 transition-colors group relative cursor-pointer
                                    ${alert.priority === 'Critical' ? 'bg-red-950/10 border-l-2 border-l-red-500' : ''}
                                `}
                            >
                                <div className="flex items-start justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${getPriorityColor(alert.priority)}`}>
                                            {alert.priority}
                                        </Badge>
                                        {alert.type && (
                                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                                {alert.type}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-slate-500">
                                        <Clock className="h-3 w-3" />
                                        {alert.due || alert.time}
                                    </div>
                                </div>

                                <h4 className="text-sm font-semibold text-slate-200 mb-1 group-hover:text-blue-400 transition-colors">
                                    {alert.title}
                                </h4>
                                <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                                    {alert.description || alert.customer}
                                </p>

                                {alert.priority === 'Critical' && (
                                    <div className="flex items-center gap-2 mt-2 animate-pulse text-red-500 text-xs font-medium">
                                        <Bell className="h-3 w-3" /> Action Required
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
