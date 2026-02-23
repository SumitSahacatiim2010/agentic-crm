"use client";

import { CheckCircle2, XCircle, Clock, AlertTriangle, Circle } from "lucide-react";
import { fmtDateTime } from "@/lib/date-utils";

interface SLAEvent {
    event_id?: string;
    event_type: string;
    sla_band?: string;
    sla_due_at?: string;
    actual_at?: string;
    status: string;
    notes?: string;
}

interface SLATimelinePanelProps {
    caseId: string;
    slaEvents: SLAEvent[];
    priorityBand: string;
    onEscalate?: () => void;
}

const SLA_MATRIX: Record<string, { ack: string; res: string }> = {
    P1: { ack: '15 minutes', res: '4 hours' },
    P2: { ack: '1 hour', res: '24 hours' },
    P3: { ack: '4 hours', res: '72 hours' },
    P4: { ack: '24 hours', res: '5 days' },
};

const EVENT_LABELS: Record<string, string> = {
    intake: 'Case Created',
    acknowledgment: 'Acknowledgment SLA',
    assignment: 'Agent Assigned',
    escalation: 'Escalated',
    resolution: 'Resolution SLA',
    closed: 'Case Closed',
};

const EVENT_ORDER = ['intake', 'acknowledgment', 'assignment', 'escalation', 'resolution', 'closed'];

function StatusIcon({ status }: { status: string }) {
    if (status === 'met') return <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />;
    if (status === 'breached') return <XCircle className="h-4 w-4 text-red-500 shrink-0 animate-pulse" />;
    if (status === 'pending') return <Clock className="h-4 w-4 text-amber-400 shrink-0" />;
    if (status === 'skipped') return <Circle className="h-4 w-4 text-slate-700 shrink-0" />;
    return <Circle className="h-4 w-4 text-slate-600 shrink-0" />;
}

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";

function pad(n: number) { return n < 10 ? '0' + n : n; }

function AdvancedSlaCountdown({ dueAt, caseId, onBreach }: { dueAt: string, caseId: string, onBreach: () => void }) {
    const [timeLeft, setTimeLeft] = useState('');
    const [breached, setBreached] = useState(false);

    useEffect(() => {
        const tick = () => {
            const now = Date.now();
            const due = new Date(dueAt).getTime();
            const diff = due - now;

            if (diff <= 0) {
                if (!breached) {
                    setBreached(true);
                    onBreach();
                }
                setTimeLeft('00:00:00');
                return;
            }

            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setTimeLeft(`${pad(h)}:${pad(m)}:${pad(s)}`);
        };

        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [dueAt, caseId, breached, onBreach]);

    if (breached || timeLeft === '00:00:00') {
        return <span className="bg-red-600 text-white font-mono text-[10px] px-1 rounded inline-flex animate-pulse items-center">BREACHED</span>;
    }

    return <span className="text-amber-400 font-mono text-[11px] font-bold">{timeLeft} remaining</span>;
}

export function SLATimelinePanel({ caseId, slaEvents, priorityBand, onEscalate }: SLATimelinePanelProps) {
    const sla = SLA_MATRIX[priorityBand] || SLA_MATRIX.P3;

    const [isEscalating, setIsEscalating] = useState(false);

    const handleBreach = useCallback(async () => {
        // Trigger browser notification
        if ("Notification" in window && Notification.permission === "granted") {
            new Notification("SLA Breached", { body: `Case ${caseId} has breached its SLA.` });
        } else if ("Notification" in window && Notification.permission !== "denied") {
            Notification.requestPermission().then(p => {
                if (p === "granted") new Notification("SLA Breached", { body: `Case ${caseId} has breached SLA.` });
            });
        }

        try {
            await fetch(`/api/service/cases/${caseId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sla_breached: true })
            });
        } catch (e) { console.error('Auto breach update failed', e); }
    }, [caseId]);

    const handleEscalate = async () => {
        setIsEscalating(true);
        try {
            const res = await fetch(`/api/service/cases/${caseId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'escalated' })
            });
            if (res.ok) {
                onEscalate?.();
            }
        } catch (e) { console.error(e); }
        setIsEscalating(false);
    };

    // Sort events by the canonical order
    const sortedEvents = [...slaEvents].sort((a, b) =>
        EVENT_ORDER.indexOf(a.event_type) - EVENT_ORDER.indexOf(b.event_type)
    );

    const pendingEvent = sortedEvents.find(e => e.status === 'pending');
    const hasBreached = slaEvents.some(e => e.status === 'breached');

    return (
        <div className="space-y-4">
            {/* SLA Band summary */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">SLA Band: {priorityBand}</p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                    <div><span className="text-slate-500">Acknowledgment: </span><span className="text-amber-300 font-semibold">{sla.ack}</span></div>
                    <div><span className="text-slate-500">Resolution: </span><span className="text-amber-300 font-semibold">{sla.res}</span></div>
                </div>
            </div>

            <div className="flex justify-between items-center bg-slate-900 border border-slate-800 rounded-lg p-3">
                <div className="flex-1">
                    <p className="text-xs font-bold text-slate-400">Escalation Actions</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Push this ticket to supervisor queue if complex or stalled.</p>
                </div>
                <Button size="sm" variant="destructive" className="h-7 text-xs" disabled={isEscalating} onClick={handleEscalate}>
                    {isEscalating ? 'Escalating...' : 'Escalate to Supervisor'}
                </Button>
            </div>

            {/* Breach banner */}
            {hasBreached && (
                <div className="flex items-center gap-2 p-3 bg-red-950/40 border border-red-700/40 rounded-lg text-xs text-red-300">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    SLA breached — supervisory review required. If regulatory, contact compliance team immediately.
                </div>
            )}

            {/* Timeline */}
            {sortedEvents.length === 0 ? (
                <p className="text-slate-600 text-xs text-center py-6">No SLA events recorded for this case.</p>
            ) : (
                <div className="relative">
                    <div className="absolute left-[15px] top-0 bottom-0 w-px bg-slate-800" />
                    <div className="space-y-4">
                        {sortedEvents.map((event, i) => (
                            <div key={event.event_id || i} className="flex gap-3 relative">
                                <div className="z-10 bg-slate-950 py-0.5">
                                    <StatusIcon status={event.status} />
                                </div>
                                <div className="flex-1 pb-2">
                                    <div className="flex items-center justify-between flex-wrap gap-1">
                                        <span className="text-xs font-semibold text-slate-200">
                                            {EVENT_LABELS[event.event_type] || event.event_type}
                                        </span>
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${event.status === 'met' ? 'bg-emerald-950/50 text-emerald-400' : event.status === 'breached' ? 'bg-red-950/50 text-red-400' : event.status === 'pending' ? 'bg-amber-950/50 text-amber-400' : 'bg-slate-800 text-slate-500'}`}>
                                            {event.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="mt-1 space-y-0.5">
                                        {event.sla_due_at && (
                                            <p className="text-[10px] text-slate-500">
                                                Due: {fmtDateTime(event.sla_due_at)}
                                                {event.status === 'pending' && <> · <AdvancedSlaCountdown dueAt={event.sla_due_at} caseId={caseId} onBreach={handleBreach} /></>}
                                            </p>
                                        )}
                                        {event.actual_at && (
                                            <p className="text-[10px] text-slate-500">
                                                Actual: {fmtDateTime(event.actual_at)}
                                            </p>
                                        )}
                                        {event.notes && <p className="text-[10px] text-slate-600 italic">{event.notes}</p>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
