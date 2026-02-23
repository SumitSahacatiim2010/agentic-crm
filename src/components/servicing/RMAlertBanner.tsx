"use client";

import { AlertTriangle, ChevronRight } from "lucide-react";
import Link from "next/link";
import { fmtDateTime } from "@/lib/date-utils";

interface RMAlert {
    alert_id: string;
    case_id: string;
    customer_id?: string;
    severity: string;
    title: string;
    is_read: boolean;
    created_at?: string;
}

interface RMAlertBannerProps {
    alerts: RMAlert[];
}

export function RMAlertBanner({ alerts }: RMAlertBannerProps) {
    if (!alerts || alerts.length === 0) return null;

    return (
        <div className="space-y-2 mb-4">
            {alerts.map(alert => (
                <Link key={alert.alert_id} href={`/servicing?caseId=${alert.case_id}`}
                    className="flex items-center gap-3 p-3 bg-red-950/40 border border-red-700/50 rounded-xl hover:bg-red-950/60 transition-colors group">
                    <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 animate-pulse" />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${alert.severity === 'Critical' ? 'bg-red-700 text-white' : 'bg-orange-700 text-white'}`}>
                                {alert.severity.toUpperCase()}
                            </span>
                            <p className="text-xs font-semibold text-red-200 line-clamp-1">{alert.title}</p>
                        </div>
                        <p className="text-[10px] text-red-400/70 mt-0.5">
                            {fmtDateTime(alert.created_at)} · Click to view case
                        </p>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-red-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </Link>
            ))}
        </div>
    );
}
