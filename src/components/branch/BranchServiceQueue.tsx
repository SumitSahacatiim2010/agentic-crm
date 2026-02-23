"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Clock, AlertTriangle } from "lucide-react";

const DEMO_CASES = [
    { id: 'SRV-10492', title: 'Debit Card Replacement Rush', customer: 'Alice Cooper', priority: 'P1', status: 'pending', age: '15m' },
    { id: 'SRV-10488', title: 'Wire Transfer Trace', customer: 'Global Supply LLC', priority: 'P2', status: 'investigating', age: '4h' },
    { id: 'SRV-10475', title: 'Address Change Verification', customer: 'Michael Chang', priority: 'P4', status: 'pending', age: '1d' },
    { id: 'SRV-10450', title: 'Fee Reversal Request', customer: 'Sarah Jenkins', priority: 'P3', status: 'escalated', age: '2d' }
];

export function BranchServiceQueue() {
    return (
        <Card className="bg-slate-900 border-slate-800 h-full flex flex-col">
            <CardHeader className="pb-3 border-b border-slate-800">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg text-slate-100">Branch Service Escalations</CardTitle>
                    <a href="/servicing" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">Open Omnichannel <ExternalLink className="h-3 w-3" /></a>
                </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto">
                <div className="divide-y divide-slate-800">
                    {DEMO_CASES.map(c => (
                        <a key={c.id} href="/servicing" className="p-4 hover:bg-slate-800/50 transition-colors flex items-center justify-between group block">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${c.priority === 'P1' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>{c.priority}</span>
                                    <span className="font-medium text-slate-200 group-hover:text-indigo-300 transition-colors">{c.title}</span>
                                    {c.status === 'escalated' && <AlertTriangle className="h-3 w-3 text-amber-500" />}
                                </div>
                                <div className="text-xs text-slate-500 flex items-center gap-3">
                                    <span>Case ID: <span className="font-mono">{c.id}</span></span>
                                    <span>Client: {c.customer}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <Badge variant="outline" className="mb-1 text-[10px] capitalize border-slate-700 text-slate-400 bg-slate-950">{c.status}</Badge>
                                <div className="text-[10px] text-slate-500 flex items-center justify-end gap-1"><Clock className="h-3 w-3" /> {c.age}</div>
                            </div>
                        </a>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
