"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getDashboardTasks, getPipelineChartData, getDashboardMetrics, getTerritoryMetrics, getCustomers, getLeadsWithDetails } from "@/lib/crm-service";
import { AlertsQueue } from "@/components/rm-dashboard/AlertsQueue";
import { PipelineFunnel } from "@/components/rm-dashboard/PipelineFunnel";
import { PerformanceScorecard } from "@/components/rm-dashboard/PerformanceScorecard";
import { TerritoryAnalytics } from "@/components/rm-dashboard/TerritoryAnalytics";
import { CustomerList } from "@/components/customer-directory/CustomerList";
import { ServiceInbox } from "@/components/service/ServiceInbox";
import { NextBestActionWidget } from "@/components/customer-360/NextBestActionWidget";
import { PortfolioValuationTable } from "@/components/wealth/PortfolioValuationTable";
import { PerformanceChart } from "@/components/wealth/PerformanceChart";
import { DriftAlert } from "@/components/wealth/DriftAlert";
import { ProposalGenerator } from "@/components/wealth/ProposalGenerator";
import { LeadsClient } from "@/components/leads/LeadsClient";
import { CustomerHeader } from "@/components/customer-360/CustomerHeader";
import { InteractionTimeline } from "@/components/customer-360/InteractionTimeline";
import { ComplianceCard } from "@/components/customer-360/ComplianceCard";
import { FinancialProfileDonut } from "@/components/customer-360/FinancialProfileDonut";
import { MOCK_CUSTOMER, MOCK_INTERACTIONS, MOCK_COMPLIANCE, MOCK_FINANCIALS } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Activity, ArrowUpRight, CheckCircle2, CircleDollarSign,
    Clock, Users, AlertTriangle, FileText, CheckSquare, BarChart3, TrendingUp,
    ShieldAlert, Calendar, Mail, Phone, MessageSquare
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Cell } from "recharts";

// Helper Base Widget
function BaseWidget({ title, description, children, action }: any) {
    return (
        <Card className="h-full bg-slate-900 border-slate-800 flex flex-col">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-lg text-slate-200">{title}</CardTitle>
                    {description && <CardDescription className="text-slate-400">{description}</CardDescription>}
                </div>
                {action && <div>{action}</div>}
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">{children}</CardContent>
        </Card>
    );
}

// ----------------------------------------------------------------------
// RETAIL RM WIDGETS
// ----------------------------------------------------------------------
export function MyPortfolioCard(props: any) {
    const [churnData, setChurnData] = useState<any>(null);

    useEffect(() => {
        fetch('/api/mock/models/churn-prediction?customer_id=RM_Portfolio_Snapshot')
            .then(r => r.json())
            .then(setChurnData)
            .catch(console.error);
    }, []);

    return (
        <BaseWidget {...props}>
            <div className="space-y-4 pt-2">
                <div className="flex justify-between items-end border-b border-slate-800 pb-3">
                    <span className="text-slate-400">Total AUM</span>
                    <span className="text-2xl font-bold text-white">$42.5M <ArrowUpRight className="inline h-4 w-4 text-emerald-400 -mt-1" /></span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div className="text-xs text-slate-500 mb-1">Deposits</div>
                        <div className="text-lg font-medium text-slate-200">$28.1M</div>
                    </div>
                    <div>
                        <div className="text-xs text-slate-500 mb-1">Loans</div>
                        <div className="text-lg font-medium text-slate-200">$14.4M</div>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-800">
                    <div className="flex justify-between items-center text-sm mb-2">
                        <span className="text-slate-400 font-medium">AI Churn Prediction</span>
                        {churnData ? (
                            <Badge variant="outline" className={churnData.risk_level === 'High' ? 'border-red-500 text-red-400 bg-red-950/30' : 'border-amber-500 text-amber-400 bg-amber-950/30'}>
                                {(churnData.churn_probability * 100).toFixed(1)}% Risk
                            </Badge>
                        ) : (
                            <span className="text-xs text-slate-500">Calculating...</span>
                        )}
                    </div>
                    {churnData && (
                        <div className="text-[10px] text-slate-500 leading-tight">
                            At-Risk Flag: <span className="text-slate-300">3 Profiles</span> identified by Model {churnData.model_version}.
                            Top drivers: {churnData.top_factors?.map((f: any) => f.factor).join(', ')}.
                        </div>
                    )}
                </div>
            </div>
        </BaseWidget>
    );
}

export function TodayAgendaCard(props: any) {
    return (
        <BaseWidget {...props}>
            <div className="space-y-4 pt-2">
                {[
                    { time: "09:30 AM", title: "Mortgage Review - Smith Family", type: "Meeting" },
                    { time: "11:00 AM", title: "KYC Refresh - Tech Corp", type: "Task" },
                    { time: "02:15 PM", title: "Follow-up: Auto Loan", type: "Call" }
                ].map((item, i) => (
                    <div key={i} className="flex gap-3">
                        <div className="text-xs font-medium text-indigo-400 w-16 pt-0.5">{item.time}</div>
                        <div className="flex-1">
                            <p className="text-sm text-slate-200">{item.title}</p>
                            <p className="text-xs text-slate-500">{item.type}</p>
                        </div>
                    </div>
                ))}
            </div>
        </BaseWidget>
    );
}

export function PipelineFunnelCard(props: any) {
    return (
        <BaseWidget {...props}>
            <div className="space-y-3 pt-2">
                {[
                    { stage: "Prospecting", count: 24, val: "40%" },
                    { stage: "Qualification", count: 12, val: "60%" },
                    { stage: "Proposal", count: 8, val: "80%" },
                    { stage: "Closed Won", count: 3, val: "100%" },
                ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                        <div className="w-24 text-slate-400">{item.stage}</div>
                        <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: item.val }}></div>
                        </div>
                        <div className="text-slate-300 w-6 text-right">{item.count}</div>
                    </div>
                ))}
            </div>
        </BaseWidget>
    );
}

export function NbaPanelCard(props: any) {
    return (
        <BaseWidget {...props}>
            <div className="space-y-4 pt-2">
                {[
                    { client: "Alex Sterling", offer: "Premium Emerald Card", score: 94 },
                    { client: "Sarah Jenkins", offer: "Home Equity Line", score: 88 },
                    { client: "Dr. Chen", offer: "Wealth Management Intro", score: 82 }
                ].map((item, i) => (
                    <div key={i} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                        <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-indigo-300">{item.client}</span>
                            <span className="text-xs text-emerald-400">{item.score}% Match</span>
                        </div>
                        <div className="text-sm text-slate-200">{item.offer}</div>
                        <div className="mt-2 text-xs text-slate-500 cursor-pointer hover:text-indigo-400 transition-colors">
                            Prepare Pitch →
                        </div>
                    </div>
                ))}
            </div>
        </BaseWidget>
    );
}

export function AlertsCard(props: any) {
    return (
        <BaseWidget {...props}>
            <div className="grid md:grid-cols-2 gap-4 pt-2">
                {[
                    { title: "Large Outbound Wire", client: "TechFlow Inc", amt: "$500,000", sev: "high" },
                    { title: "CD Maturing in 7 days", client: "Eleanor Vance", amt: "$100,000", sev: "med" },
                    { title: "SLA Breach Warning", client: "Onboarding Ticket #882", amt: "-", sev: "med" },
                    { title: "Account Dormancy", client: "James Wright", amt: "$2,400", sev: "low" }
                ].map((item, i) => (
                    <div key={i} className="flex gap-3 p-3 bg-slate-800/30 border-l-2 rounded-r border-slate-700"
                        style={{ borderLeftColor: item.sev === 'high' ? '#ef4444' : item.sev === 'med' ? '#f59e0b' : '#3b82f6' }}>
                        <AlertTriangle className={`h-5 w-5 mt-0.5 ${item.sev === 'high' ? 'text-red-400' : item.sev === 'med' ? 'text-amber-400' : 'text-blue-400'}`} />
                        <div>
                            <p className="text-sm font-medium text-slate-200">{item.title}</p>
                            <p className="text-xs text-slate-400">{item.client} <span className="text-slate-500 mx-1">•</span> {item.amt}</p>
                        </div>
                    </div>
                ))}
            </div>
        </BaseWidget>
    );
}

// ----------------------------------------------------------------------
// CORPORATE RM WIDGETS
// ----------------------------------------------------------------------
export function KeyAccountsCard(props: any) {
    return (
        <BaseWidget {...props}>
            <div className="overflow-x-auto pt-2">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-800/50">
                        <tr>
                            <th className="px-4 py-2 rounded-tl-lg">Account Name</th>
                            <th className="px-4 py-2">Total Exposure</th>
                            <th className="px-4 py-2">YTD Revenue</th>
                            <th className="px-4 py-2 rounded-tr-lg">Risk Rating</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            { name: "Global Logistics Ltd", exp: "$45.2M", rev: "$1.2M", risk: "Low (2)" },
                            { name: "Starlight Media Grp", exp: "$12.8M", rev: "$450k", risk: "Med (4)" },
                            { name: "Nexus Manufacturing", exp: "$85.0M", rev: "$3.5M", risk: "Low (1)" },
                            { name: "Apex Retailers", exp: "$5.5M", rev: "$120k", risk: "Watch (6)" }
                        ].map((row, i) => (
                            <tr key={i} className="border-b border-slate-800 last:border-0 hover:bg-slate-800/30">
                                <td className="px-4 py-3 font-medium text-slate-200">{row.name}</td>
                                <td className="px-4 py-3 text-slate-300">{row.exp}</td>
                                <td className="px-4 py-3 text-emerald-400">{row.rev}</td>
                                <td className="px-4 py-3 text-slate-400">{row.risk}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </BaseWidget>
    );
}
export function CreditOppsCard(props: any) {
    return (
        <BaseWidget {...props}>
            <div className="space-y-4 pt-2">
                {[
                    { client: "Nexus Manufacturing", type: "Revolver Renewal", amt: "$25M", stage: "Credit Review" },
                    { client: "Global Logistics", type: "Equipment Finance", amt: "$8M", stage: "Term Sheet" }
                ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center border-b border-slate-800 pb-3 last:border-0">
                        <div>
                            <div className="text-sm font-medium text-indigo-300">{item.client}</div>
                            <div className="text-xs text-slate-400">{item.type}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-slate-200">{item.amt}</div>
                            <Badge variant="outline" className="mt-1 text-[10px]">{item.stage}</Badge>
                        </div>
                    </div>
                ))}
            </div>
        </BaseWidget>
    );
}
export function EarlyWarningCard(props: any) {
    return (
        <BaseWidget {...props}>
            <div className="space-y-3 pt-2">
                <div className="p-3 bg-red-950/30 border border-red-900/50 rounded flex gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <div>
                        <div className="text-sm text-red-200 font-medium">Apex Retailers</div>
                        <div className="text-xs text-red-400/80">Covenant Breach: Q3 EBITDA Margin &lt; 15%</div>
                    </div>
                </div>
                <div className="p-3 bg-amber-950/30 border border-amber-900/50 rounded flex gap-3">
                    <Activity className="h-5 w-5 text-amber-500" />
                    <div>
                        <div className="text-sm text-amber-200 font-medium">Starlight Media Grp</div>
                        <div className="text-xs text-amber-400/80">Negative News: Management restructuring announced</div>
                    </div>
                </div>
            </div>
        </BaseWidget>
    );
}
export function RelPlansCard(props: any) {
    return (
        <BaseWidget {...props}>
            <div className="grid md:grid-cols-2 gap-4 pt-2">
                {[
                    { client: "Global Logistics", obj: "Treasury wallet share growth", target: "Capture FX hedging flow by Q2" },
                    { client: "Nexus Manufacturing", obj: "Syndicated Loan Refinance", target: "Lead left on upcoming $100M facility" },
                ].map((item, i) => (
                    <div key={i} className="p-4 border border-slate-700/50 rounded-lg bg-slate-800/20">
                        <div className="font-medium text-indigo-300 mb-2">{item.client}</div>
                        <div className="text-sm text-slate-200 mb-1">{item.obj}</div>
                        <div className="text-xs text-slate-500">{item.target}</div>
                    </div>
                ))}
            </div>
        </BaseWidget>
    );
}

// ----------------------------------------------------------------------
// WEALTH ADVISOR WIDGETS
// ----------------------------------------------------------------------
export function HnwOverviewCard(props: any) { return <MyPortfolioCard {...props} />; }
export function SuitabilityRiskCard(props: any) {
    return (
        <BaseWidget {...props}>
            <div className="flex flex-col justify-center h-full pt-2">
                <div className="flex justify-between text-sm mb-1 text-slate-400"><span>Conservative</span><span>25%</span></div>
                <div className="w-full h-2 bg-slate-800 rounded-full mb-4"><div className="w-1/4 h-full bg-blue-500 rounded-full"></div></div>

                <div className="flex justify-between text-sm mb-1 text-slate-400"><span>Moderate</span><span>60%</span></div>
                <div className="w-full h-2 bg-slate-800 rounded-full mb-4"><div className="w-[60%] h-full bg-indigo-500 rounded-full"></div></div>

                <div className="flex justify-between text-sm mb-1 text-slate-400"><span>Aggressive</span><span>15%</span></div>
                <div className="w-full h-2 bg-slate-800 rounded-full"><div className="w-[15%] h-full bg-purple-500 rounded-full"></div></div>
            </div>
        </BaseWidget>
    );
}
export function RebalancingCard(props: any) {
    return (
        <BaseWidget {...props}>
            <div className="space-y-4 pt-2">
                {[
                    { client: "E. Vance Trust", drift: "+5.2% Equities", action: "Sell to target" },
                    { client: "J. Wright Portfolio", drift: "-3.1% Fixed Income", action: "Buy corporate bonds" }
                ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-sm border-b border-slate-800 pb-3 last:border-0 last:pb-0">
                        <div>
                            <div className="text-slate-200 font-medium">{item.client}</div>
                            <div className="text-amber-400 text-xs">Drift: {item.drift}</div>
                        </div>
                        <Badge variant="outline" className="cursor-pointer hover:bg-slate-800">{item.action}</Badge>
                    </div>
                ))}
            </div>
        </BaseWidget>
    );
}
export function UpcomingReviewsCard(props: any) {
    return (
        <BaseWidget {...props}>
            <div className="overflow-x-auto pt-2">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase">
                        <tr>
                            <th className="py-2">Client Name</th>
                            <th className="py-2">Date</th>
                            <th className="py-2">Agenda Type</th>
                            <th className="py-2 text-right">AUM</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            { name: "Sterling Family Office", date: "Tomorrow, 10:00 AM", type: "Annual Review & Tax", amt: "$12.5M" },
                            { name: "Dr. Eleanor Vance", date: "Thursday, 2:00 PM", type: "Portfolio Rebalance", amt: "$4.2M" },
                        ].map((row, i) => (
                            <tr key={i} className="border-b border-slate-800 last:border-0">
                                <td className="py-3 text-indigo-300 font-medium">{row.name}</td>
                                <td className="py-3 text-slate-400">{row.date}</td>
                                <td className="py-3 text-slate-300">{row.type}</td>
                                <td className="py-3 text-emerald-400 text-right">{row.amt}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </BaseWidget>
    );
}

// ----------------------------------------------------------------------
// BRANCH MANAGER WIDGETS
// ----------------------------------------------------------------------
export function BranchKpisCard(props: any) {
    return (
        <BaseWidget {...props}>
            <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3 bg-slate-800/50 rounded-lg">
                    <div className="text-xs text-slate-500 mb-1">New Accounts</div>
                    <div className="text-xl text-white">128 <span className="text-emerald-400 text-xs ml-1">+12%</span></div>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                    <div className="text-xs text-slate-500 mb-1">Sales Vol</div>
                    <div className="text-xl text-white">$1.2M <span className="text-emerald-400 text-xs ml-1">+4%</span></div>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                    <div className="text-xs text-slate-500 mb-1">Service NPS</div>
                    <div className="text-xl text-white">72 <span className="text-red-400 text-xs ml-1">-2</span></div>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                    <div className="text-xs text-slate-500 mb-1">Queue Time</div>
                    <div className="text-xl text-white">4m 12s</div>
                </div>
            </div>
        </BaseWidget>
    );
}
export function TeamPerfCard(props: any) {
    return (
        <BaseWidget {...props}>
            <div className="overflow-x-auto pt-2">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-800/30">
                        <tr>
                            <th className="px-4 py-2">Agent Name</th>
                            <th className="px-4 py-2">Role</th>
                            <th className="px-4 py-2">Goal Attainment</th>
                            <th className="px-4 py-2 text-right">Activity Count</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            { name: "Michael Chang", role: "Personal Banker", goal: "112%", act: 45 },
                            { name: "Sarah Jenkins", role: "Sr. RM", goal: "98%", act: 32 },
                            { name: "David Miller", role: "Teller", goal: "105%", act: 120 },
                        ].map((row, i) => (
                            <tr key={i} className="border-b border-slate-800 last:border-0 hover:bg-slate-800/20">
                                <td className="px-4 py-3 text-slate-200">{row.name}</td>
                                <td className="px-4 py-3 text-slate-400">{row.role}</td>
                                <td className="px-4 py-3 font-medium text-emerald-400">{row.goal}</td>
                                <td className="px-4 py-3 text-right text-slate-300">{row.act}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </BaseWidget>
    );
}
export function TrafficCard(props: any) {
    return (
        <BaseWidget {...props}>
            <div className="flex flex-col gap-4 mt-2">
                <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded">
                    <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-indigo-400" />
                        <span className="text-sm font-medium">Appointments</span>
                    </div>
                    <span className="text-xl">14</span>
                </div>
                <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded">
                    <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-emerald-400" />
                        <span className="text-sm font-medium">Walk-ins (Est)</span>
                    </div>
                    <span className="text-xl">42</span>
                </div>
                <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded">
                    <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-amber-400" />
                        <span className="text-sm font-medium">Currently Waiting</span>
                    </div>
                    <span className="text-xl">3</span>
                </div>
            </div>
        </BaseWidget>
    );
}
export function BranchComplianceCard(props: any) {
    return (
        <BaseWidget {...props}>
            <div className="grid md:grid-cols-3 gap-6 pt-4 text-center">
                <div>
                    <div className="text-4xl font-light text-slate-200 mb-2">4</div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider">Pending KYC</div>
                </div>
                <div className="border-x border-slate-800">
                    <div className="text-4xl font-light text-amber-400 mb-2">1</div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider">Open Complaints</div>
                </div>
                <div>
                    <div className="text-4xl font-light text-emerald-400 mb-2">0</div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider">SLA Breaches</div>
                </div>
            </div>
        </BaseWidget>
    );
}

import Link from "next/link";

// ----------------------------------------------------------------------
// SERVICE AGENT WIDGETS
// ----------------------------------------------------------------------
export function MyCasesCard(props: any) {
    const [cases, setCases] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/service/cases?limit=3')
            .then(r => r.json())
            .then(json => {
                if (json.data) setCases(json.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <BaseWidget {...props}><div className="p-4 text-slate-500 text-xs text-center">Loading cases...</div></BaseWidget>;
    if (cases.length === 0) return <BaseWidget {...props}><div className="p-4 text-slate-500 text-xs text-center">No active cases.</div></BaseWidget>;

    return (
        <BaseWidget {...props}>
            <div className="space-y-4 mt-2">
                {cases.map((item, i) => (
                    <Link href={`/servicing?id=${item.case_id}`} key={i} className="flex flex-col border border-slate-800 p-3 rounded bg-slate-900 shadow-sm hover:border-indigo-500/50 transition-colors cursor-pointer">
                        <div className="flex justify-between mb-2">
                            <span className="text-xs font-medium text-indigo-400">{(item.case_id || '').substring(0, 8)}</span>
                            <Badge variant="outline" className={['P1', 'P2'].includes(item.priority_band) ? 'text-red-400 border-red-900' : 'text-slate-400'}>{item.priority_band || 'P3'}</Badge>
                        </div>
                        <div className="text-sm text-slate-200 mb-2">{item.subject}</div>
                        <div className="text-xs text-slate-500 flex justify-between">
                            <span>Status: {item.status}</span>
                            <span>{item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </BaseWidget>
    );
}

export function OmniInboxCard(props: any) {
    const [counts, setCounts] = useState({ total: 0, p1: 0, reg: 0 });

    useEffect(() => {
        fetch('/api/service/cases?limit=100')
            .then(r => r.json())
            .then(json => {
                if (json.data) {
                    const data = json.data as any[];
                    setCounts({
                        total: data.length,
                        p1: data.filter(c => c.priority_band === 'P1').length,
                        reg: data.filter(c => c.is_regulatory).length
                    });
                }
            })
            .catch(console.error);
    }, []);

    return (
        <BaseWidget {...props}>
            <div className="grid grid-cols-2 gap-4 mt-2">
                <Link href="/servicing" className="flex flex-col items-center justify-center p-4 bg-slate-800/30 rounded border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-colors">
                    <span className="text-2xl font-light text-white">{counts.total}</span>
                    <div className="text-xs text-slate-500">Total Cases</div>
                </Link>
                <Link href="/servicing?filter=p1" className="flex flex-col items-center justify-center p-4 bg-red-900/10 rounded border border-red-900/30 hover:border-red-500/50 cursor-pointer transition-colors">
                    <span className="text-2xl font-light text-red-400">{counts.p1}</span>
                    <div className="text-xs text-slate-500">P1 Critical</div>
                </Link>
                <Link href="/servicing?filter=regulatory" className="flex flex-col items-center justify-center p-4 bg-amber-900/10 rounded border border-amber-900/30 hover:border-amber-500/50 cursor-pointer transition-colors">
                    <span className="text-2xl font-light text-amber-400">{counts.reg}</span>
                    <div className="text-xs text-slate-500">Regulatory</div>
                </Link>
                <Link href="/servicing" className="flex flex-col items-center justify-center p-4 bg-slate-800/30 rounded border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-colors">
                    <MessageSquare className="h-6 w-6 text-purple-400 mb-1" />
                    <div className="text-xs text-slate-300">Open Inbox</div>
                </Link>
            </div>
        </BaseWidget>
    );
}
export function ActiveCustomerCard(props: any) {
    return (
        <BaseWidget {...props}>
            <div className="flex gap-6 mt-4">
                <Avatar className="h-20 w-20 border-2 border-slate-700">
                    <AvatarFallback className="bg-slate-800 text-xl font-medium">AS</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-xl font-bold text-white">Alexander Sterling</h2>
                            <p className="text-sm text-slate-400">GCID-US-8842-1092 • Platinum Tier</p>
                        </div>
                        <Badge className="bg-emerald-900 border-emerald-700 text-emerald-300">Verified</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                        <div>
                            <div className="text-xs text-slate-500 mb-1">Relationship</div>
                            <div className="text-sm text-slate-200">8 Years</div>
                        </div>
                        <div>
                            <div className="text-xs text-slate-500 mb-1">Products Held</div>
                            <div className="text-sm text-slate-200">5 Active</div>
                        </div>
                        <div>
                            <div className="text-xs text-slate-500 mb-1">Total Balances</div>
                            <div className="text-sm text-slate-200">$5.8M</div>
                        </div>
                    </div>
                    <div className="mt-4 p-3 bg-slate-800/40 border border-slate-700 rounded text-sm text-slate-300 italic">
                        "Last interaction 2 days ago via Mobile App: Large transfer authorization ($50k)"
                    </div>
                </div>
            </div>
        </BaseWidget>
    );
}
export function KnowledgeCard(props: any) {
    return (
        <BaseWidget {...props}>
            <div className="space-y-3 mt-2">
                <CardDescription className="text-xs mb-2">Suggested for "Wire transfer missing":</CardDescription>
                <div className="p-2 hover:bg-slate-800 rounded cursor-pointer group flex items-start gap-2">
                    <FileText className="h-4 w-4 text-slate-500 mt-0.5 group-hover:text-indigo-400" />
                    <div className="text-sm text-indigo-300 group-hover:text-indigo-200 group-hover:underline">International Wire Trace Steps</div>
                </div>
                <div className="p-2 hover:bg-slate-800 rounded cursor-pointer group flex items-start gap-2">
                    <FileText className="h-4 w-4 text-slate-500 mt-0.5 group-hover:text-indigo-400" />
                    <div className="text-sm text-indigo-300 group-hover:text-indigo-200 group-hover:underline">Common Swift Code Errors</div>
                </div>
                <div className="p-2 hover:bg-slate-800 rounded cursor-pointer group flex items-start gap-2">
                    <FileText className="h-4 w-4 text-slate-500 mt-0.5 group-hover:text-indigo-400" />
                    <div className="text-sm text-indigo-300 group-hover:text-indigo-200 group-hover:underline">Refund Policy for Delayed Wires</div>
                </div>
            </div>
        </BaseWidget>
    );
}

// ----------------------------------------------------------------------
// CREDIT OFFICER WIDGETS
// ----------------------------------------------------------------------
export function WorkQueueCard(props: any) {
    return (
        <BaseWidget {...props}>
            <div className="overflow-x-auto pt-2">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-800/30">
                        <tr>
                            <th className="px-4 py-2">App ID</th>
                            <th className="px-4 py-2">Counterparty</th>
                            <th className="px-4 py-2">Product</th>
                            <th className="px-4 py-2">Requested Limit</th>
                            <th className="px-4 py-2 text-right">Due Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            { id: "APP-10029", cp: "Nexus Manufacturing", prod: "Revolving Credit", amt: "$25,000,000", due: "Today" },
                            { id: "APP-10034", cp: "Starlight Media", prod: "Term Loan", amt: "$8,500,000", due: "Tomorrow" },
                            { id: "APP-10041", cp: "John Doe Properties", prod: "CRE Mortgage", amt: "$2,200,000", due: "Oct 24" },
                        ].map((row, i) => (
                            <tr key={i} className="border-b border-slate-800 last:border-0 hover:bg-slate-800/20">
                                <td className="px-4 py-3 text-indigo-400 font-medium">{row.id}</td>
                                <td className="px-4 py-3 text-slate-200">{row.cp}</td>
                                <td className="px-4 py-3 text-slate-400">{row.prod}</td>
                                <td className="px-4 py-3 text-slate-300">{row.amt}</td>
                                <td className="px-4 py-3 text-right text-amber-400 font-medium">{row.due}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </BaseWidget>
    );
}
export function RiskDistCard(props: any) {
    return (
        <BaseWidget {...props}>
            <div className="flex items-end justify-between h-32 mt-4 space-x-2">
                {[
                    { label: "AAA", h: "10%" },
                    { label: "AA", h: "20%" },
                    { label: "A", h: "45%" },
                    { label: "BBB", h: "60%" },
                    { label: "BB", h: "80%" },
                    { label: "B", h: "30%" },
                    { label: "CCC", h: "10%" },
                    { label: "D", h: "2%" },
                ].map((bar, i) => (
                    <div key={i} className="flex flex-col items-center w-full group">
                        <div className="w-full bg-slate-800 rounded-t group-hover:bg-indigo-500 transition-colors" style={{ height: bar.h }}></div>
                        <div className="text-[10px] text-slate-500 mt-2">{bar.label}</div>
                    </div>
                ))}
            </div>
        </BaseWidget>
    );
}
export function ExceptionsCard(props: any) {
    return (
        <BaseWidget {...props}>
            <div className="space-y-3 mt-2">
                <div className="p-3 border-l-2 border-amber-500 bg-slate-800/30 rounded-r">
                    <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-medium text-slate-200">LTV Exception (85%)</span>
                        <Badge variant="outline" className="text-[9px]">Pending</Badge>
                    </div>
                    <div className="text-xs text-slate-400">Global Logistics Ltd - Needs MD Signoff</div>
                </div>
                <div className="p-3 border-l-2 border-red-500 bg-slate-800/30 rounded-r">
                    <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-medium text-slate-200">Policy Breach (Tenor)</span>
                        <Badge variant="outline" className="text-[9px]">Escalated</Badge>
                    </div>
                    <div className="text-xs text-slate-400">Term Loan &gt; 5yrs on unrated corp.</div>
                </div>
            </div>
        </BaseWidget>
    );
}
export function PortfolioWatchCard(props: any) {
    return (
        <BaseWidget {...props}>
            <div className="grid md:grid-cols-2 gap-4 pt-2">
                <Card className="bg-slate-950 border-slate-800">
                    <CardHeader className="p-3 pb-0">
                        <CardTitle className="text-sm text-slate-400">Stressed Sectors</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-2">
                        <div className="flex justify-between mb-1 text-sm"><span className="text-red-400">Commercial Real Estate</span><span>High</span></div>
                        <div className="flex justify-between mb-1 text-sm"><span className="text-amber-400">Retail</span><span>Elevated</span></div>
                        <div className="flex justify-between text-sm"><span className="text-slate-200">Technology</span><span>Stable</span></div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-950 border-slate-800">
                    <CardHeader className="p-3 pb-0">
                        <CardTitle className="text-sm text-slate-400">Total NPL Ratio</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-4 flex justify-between items-end">
                        <span className="text-3xl text-white font-light">1.24%</span>
                        <span className="text-red-400 text-sm flex items-center mb-1"><ArrowUpRight className="h-4 w-4 mr-0.5" /> 8bps</span>
                    </CardContent>
                </Card>
            </div>
        </BaseWidget>
    );
}

// ----------------------------------------------------------------------
// MARKETING MANAGER WIDGETS
// ----------------------------------------------------------------------
export function CampaignsCard(props: any) {
    const data = [
        { name: 'Jan', clicks: 4000, opens: 2400 },
        { name: 'Feb', clicks: 3000, opens: 1398 },
        { name: 'Mar', clicks: 2000, opens: 9800 },
        { name: 'Apr', clicks: 2780, opens: 3908 },
        { name: 'May', clicks: 1890, opens: 4800 },
        { name: 'Jun', clicks: 2390, opens: 3800 },
        { name: 'Jul', clicks: 3490, opens: 4300 },
    ];
    return (
        <BaseWidget {...props}>
            <div className="h-48 mt-4 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }} />
                        <Line type="monotone" dataKey="clicks" stroke="#8b5cf6" strokeWidth={3} dot={false} />
                        <Line type="monotone" dataKey="opens" stroke="#10b981" strokeWidth={3} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4 opacity-80">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                    <div className="w-2 h-2 rounded-full bg-violet-500"></div> Total Clicks
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Total Opens
                </div>
            </div>
        </BaseWidget>
    );
}
export function SegmentPerfCard(props: any) {
    return (
        <BaseWidget {...props}>
            <div className="space-y-4 mt-2">
                {[
                    { seg: "Mass Affluent", rev: "$2.4M", r: "8%" },
                    { seg: "Young Professionals", rev: "$850K", r: "12%" },
                    { seg: "Retirees", rev: "$1.1M", r: "4%" },
                ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                        <div className="text-slate-300">{item.seg}</div>
                        <div className="flex gap-4 text-right">
                            <span className="text-slate-400 w-12">{item.r}</span>
                            <span className="text-emerald-400 font-medium w-16">{item.rev}</span>
                        </div>
                    </div>
                ))}
            </div>
        </BaseWidget>
    );
}
export function JourneyHealthCard(props: any) {
    return (
        <BaseWidget {...props} description="Mortgage Application Drop-off">
            <div className="space-y-2 mt-4">
                {[
                    { step: "Landed on page", count: "100%", w: "100%" },
                    { step: "Started App", count: "42%", w: "42%" },
                    { step: "Docs Uploaded", count: "18%", w: "18%" },
                    { step: "Submitted", count: "11%", w: "11%" },
                ].map((item, i) => (
                    <div key={i} className="relative h-8 bg-slate-800 rounded overflow-hidden flex items-center px-3">
                        <div className="absolute top-0 left-0 h-full bg-indigo-600/40" style={{ width: item.w }}></div>
                        <div className="relative z-10 flex justify-between w-full text-xs font-medium">
                            <span className="text-slate-200">{item.step}</span>
                            <span className="text-indigo-200">{item.count}</span>
                        </div>
                    </div>
                ))}
            </div>
        </BaseWidget>
    );
}
export function FatigueCard(props: any) {
    return (
        <BaseWidget {...props}>
            <div className="flex items-center justify-center p-6 h-full border border-dashed border-slate-700/50 rounded-lg mt-2 flex-col text-center bg-slate-800/20">
                <div className="text-3xl font-light text-slate-200 mb-1">1.8%</div>
                <div className="text-xs text-slate-500 uppercase">Global Opt-out Rate</div>
                <div className="text-[10px] text-emerald-500 mt-2">Within acceptable threshold (&lt;2%)</div>
            </div>
        </BaseWidget>
    );
}

// ----------------------------------------------------------------------
// COMPLIANCE OFFICER WIDGETS
// ----------------------------------------------------------------------
export function KycStatusCard(props: any) {
    return (
        <BaseWidget {...props}>
            <div className="grid grid-cols-2 gap-4 mt-2 h-full">
                <div className="p-4 bg-slate-800/30 rounded border-l-2 border-emerald-500 flex flex-col justify-center">
                    <span className="text-3xl text-white font-light">12,450</span>
                    <span className="text-xs text-slate-400 uppercase mt-1">Verified</span>
                </div>
                <div className="p-4 bg-slate-800/30 rounded border-l-2 border-amber-500 flex flex-col justify-center">
                    <span className="text-3xl text-white font-light">342</span>
                    <span className="text-xs text-slate-400 uppercase mt-1">Due &lt;30 days</span>
                </div>
                <div className="p-4 bg-slate-800/30 rounded border-l-2 border-red-500 flex flex-col justify-center">
                    <span className="text-3xl text-white font-light">84</span>
                    <span className="text-xs text-slate-400 uppercase mt-1">Overdue</span>
                </div>
                <div className="p-4 bg-slate-800/30 rounded border-l-2 border-slate-600 flex flex-col justify-center">
                    <span className="text-3xl text-white font-light">112</span>
                    <span className="text-xs text-slate-400 uppercase mt-1">Pending Docs</span>
                </div>
            </div>
        </BaseWidget>
    );
}
export function AmlAlertsCard(props: any) {
    return (
        <BaseWidget {...props}>
            <div className="space-y-4 mt-2">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-300">High Risk (Triage Req)</span>
                    <Badge className="bg-red-900 text-red-300">12</Badge>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-300">Medium Risk</span>
                    <Badge className="bg-amber-900 text-amber-300">45</Badge>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-300">Low / FPs Confirmed</span>
                    <Badge className="bg-slate-800 text-slate-400">128</Badge>
                </div>
            </div>
        </BaseWidget>
    );
}
export function ComplaintsCard(props: any) {
    return (
        <BaseWidget {...props}>
            <div className="overflow-x-auto pt-2">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-800/30">
                        <tr>
                            <th className="px-4 py-2">ID</th>
                            <th className="px-4 py-2">Category</th>
                            <th className="px-4 py-2">Severity</th>
                            <th className="px-4 py-2 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            { id: "CMP-0012", cat: "Fair Lending", sev: "Critical", status: "Investigating" },
                            { id: "CMP-0044", cat: "Fee Dispute", sev: "Medium", status: "Open" },
                            { id: "CMP-0089", cat: "Fraud Claim", sev: "High", status: "Legal Review" },
                        ].map((row, i) => (
                            <tr key={i} className="border-b border-slate-800 last:border-0 hover:bg-slate-800/20">
                                <td className="px-4 py-3 text-slate-400">{row.id}</td>
                                <td className="px-4 py-3 text-slate-200">{row.cat}</td>
                                <td className="px-4 py-3">
                                    <span className={row.sev === 'Critical' ? 'text-red-400 font-medium' : row.sev === 'High' ? 'text-amber-400' : 'text-slate-400'}>{row.sev}</span>
                                </td>
                                <td className="px-4 py-3 text-right text-slate-300">{row.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </BaseWidget>
    );
}
export function MonitoringCard(props: any) {
    return (
        <BaseWidget {...props}>
            <div className="grid md:grid-cols-2 gap-4 mt-2">
                <div className="p-3 bg-red-950/20 border border-red-900/50 rounded flex gap-3 h-24 items-center pl-6">
                    <ShieldAlert className="h-8 w-8 text-red-500" />
                    <div>
                        <div className="text-xl text-white font-light">2</div>
                        <div className="text-xs text-slate-400 uppercase tracking-wider">Sanctions Hits</div>
                    </div>
                </div>
                <div className="p-3 bg-amber-950/20 border border-amber-900/50 rounded flex gap-3 h-24 items-center pl-6">
                    <Users className="h-8 w-8 text-amber-500" />
                    <div>
                        <div className="text-xl text-white font-light">8</div>
                        <div className="text-xs text-slate-400 uppercase tracking-wider">PEP Matches (New)</div>
                    </div>
                </div>
            </div>
        </BaseWidget>
    );
}

// ----------------------------------------------------------------------
// EXECUTIVE WIDGETS
// ----------------------------------------------------------------------
export function ExecKpisCard(props: any) {
    const [kpis, setKpis] = useState<any>(null);

    useEffect(() => {
        fetch('/api/dashboard/kpis').then(r => r.json()).then(setKpis).catch(console.error);
    }, []);

    // Format helpers
    const fmtVal = (v: number | null, fmt: (n: number) => string) => v === null ? '—' : fmt(v);
    const fmtYoY = (yoy: number | null, invertColor = false) => {
        if (yoy === null) return <span className="text-xs text-slate-600 mt-2">— no prior data</span>;
        const positive = yoy >= 0;
        const isGood = invertColor ? !positive : positive;
        return (
            <span className={`text-xs mt-2 ${isGood ? 'text-emerald-400' : 'text-red-400'}`}>
                {positive ? '+' : ''}{yoy}% YoY
            </span>
        );
    };

    if (!kpis) return <BaseWidget {...props}><div className="text-slate-500 text-sm p-4">Loading KPIs…</div></BaseWidget>;

    return (
        <BaseWidget {...props}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                <div className="flex flex-col p-4 bg-slate-950 border border-slate-800 rounded-lg">
                    <span className="text-xs text-slate-500 uppercase tracking-wider mb-2">Total Revenue</span>
                    <span className="text-2xl font-light text-white">{fmtVal(kpis.revenue, v => `$${(v / 1_000_000).toFixed(1)}M`)}</span>
                    {fmtYoY(kpis.revenueYoY)}
                </div>
                <div className="flex flex-col p-4 bg-slate-950 border border-slate-800 rounded-lg">
                    <span className="text-xs text-slate-500 uppercase tracking-wider mb-2">Net Margin</span>
                    <span className="text-2xl font-light text-white">{fmtVal(kpis.margin, v => `${v.toFixed(1)}%`)}</span>
                    {fmtYoY(kpis.marginYoY)}
                </div>
                <div className="flex flex-col p-4 bg-slate-950 border border-slate-800 rounded-lg">
                    <span className="text-xs text-slate-500 uppercase tracking-wider mb-2">Avg CLV</span>
                    <span className="text-2xl font-light text-white">{fmtVal(kpis.avgClv, v => `$${(v / 1000).toFixed(1)}k`)}</span>
                    {fmtYoY(kpis.avgClvYoY)}
                </div>
                <div className="flex flex-col p-4 bg-slate-950 border border-slate-800 rounded-lg">
                    <span className="text-xs text-slate-500 uppercase tracking-wider mb-2">Churn Rate</span>
                    <span className="text-2xl font-light text-white">{fmtVal(kpis.churnRate, v => `${v.toFixed(1)}%`)}</span>
                    {fmtYoY(kpis.churnRateYoY, true)}
                </div>
            </div>
        </BaseWidget>
    );
}
export function SalesPipelineCard(props: any) {
    const [stats, setStats] = useState({ total: 0, stages: [] as { lbl: string, val: string, w: string }[] });

    useEffect(() => {
        fetch('/api/opportunities?limit=1000').then(r => r.json()).then(res => {
            const opps = res.data || [];
            if (opps.length === 0) return;
            let total = 0;
            const byStage: Record<string, number> = {};
            opps.forEach((o: any) => {
                if (o.stage !== 'Closed-Won' && o.stage !== 'Closed-Lost') {
                    const val = Number(o.projected_value || 0);
                    total += val;
                    byStage[o.stage] = (byStage[o.stage] || 0) + val;
                }
            });
            const stages = Object.entries(byStage)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([lbl, val]) => ({
                    lbl,
                    val: `$${(val / 1000000).toFixed(1)}M`,
                    w: `${Math.round((val / total) * 100)}%`
                }));
            setStats({ total, stages });
        }).catch(console.error);
    }, []);

    return (
        <BaseWidget {...props}>
            <div className="space-y-4 mt-4">
                <div className="flex justify-between items-end border-b border-slate-800 pb-2">
                    <span className="text-sm text-slate-400">Active Pipeline</span>
                    <span className="text-xl font-medium text-indigo-400">${(stats.total / 1000000).toFixed(1)}M</span>
                </div>
                {stats.stages.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                        <div className="w-32 text-slate-300 truncate">{item.lbl}</div>
                        <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: item.w }}></div>
                        </div>
                        <div className="w-16 text-right text-xs text-slate-400">{item.val}</div>
                    </div>
                ))}
            </div>
        </BaseWidget>
    );
}
export function RiskOverviewCard(props: any) {
    return (
        <BaseWidget {...props}>
            <div className="flex items-center justify-center p-6 h-full border border-dashed border-slate-700/50 rounded-lg mt-2 flex-col text-center bg-slate-800/10">
                <ShieldAlert className="h-10 w-10 text-amber-500/50 mb-4" />
                <div className="text-lg text-slate-300 mb-1">Within Appetite</div>
                <div className="text-xs text-slate-500">Tier 1 Capital Ratio: 12.4%</div>
                <div className="text-xs text-slate-500">NPL Ratio: 1.2%</div>
            </div>
        </BaseWidget>
    );
}
export function CxMetricsCard(props: any) {
    return (
        <BaseWidget {...props}>
            <div className="grid md:grid-cols-3 gap-6 pt-4 text-center">
                <div>
                    <div className="text-4xl font-semibold text-emerald-400 mb-2">68</div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider">Net Promoter Score</div>
                </div>
                <div className="border-x border-slate-800">
                    <div className="text-4xl font-semibold text-indigo-400 mb-2">94%</div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider">SLA Adherence</div>
                </div>
                <div>
                    <div className="text-4xl font-semibold text-slate-200 mb-2">2.4<span className="text-xl text-slate-500">m</span></div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider">Avg Resolution Time</div>
                </div>
            </div>
        </BaseWidget>
    );
}

// ----------------------------------------------------------------------
// GLOBAL ADMIN WIDGETS
// ----------------------------------------------------------------------
export function PersonaManagerCard(props: any) {
    return (
        <BaseWidget {...props}>
            <div className="overflow-x-auto pt-2">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-800/30">
                        <tr>
                            <th className="px-4 py-2">Persona</th>
                            <th className="px-4 py-2">Configured Widgets</th>
                            <th className="px-4 py-2 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            { p: "RETAIL_RM", w: "My Portfolio, Agenda, Funnel, NBA, Alerts" },
                            { p: "CORPORATE_RM", w: "Key Accts, Credit Opps, EWS, Rel Plans" },
                            { p: "COMPLIANCE", w: "KYC, AML, Complaints, Monitoring" },
                        ].map((row, i) => (
                            <tr key={i} className="border-b border-slate-800 last:border-0">
                                <td className="px-4 py-3 text-slate-200 font-mono text-xs">{row.p}</td>
                                <td className="px-4 py-3 text-slate-400 text-xs truncate max-w-[200px]" title={row.w}>{row.w}</td>
                                <td className="px-4 py-3 text-right"><Badge className="bg-indigo-900/50 text-indigo-300">Active</Badge></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="text-xs text-slate-500 mt-4 italic">Note: Persona editor coming in future release.</div>
        </BaseWidget>
    );
}
export function AdoptionCard(props: any) {
    return (
        <BaseWidget {...props}>
            <div className="flex flex-col gap-4 mt-4">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Daily Active Users</span>
                    <span className="text-xl font-light text-white">4,281</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Total Sessions (24h)</span>
                    <span className="text-xl font-light text-white">12,044</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Avg Session Time</span>
                    <span className="text-xl font-light text-white">18m 42s</span>
                </div>
            </div>
        </BaseWidget>
    );
}
export function RbacMatrixCard(props: any) {
    return (
        <BaseWidget {...props}>
            <div className="space-y-4 mt-2">
                {[
                    { role: "Super Admin", users: 12 },
                    { role: "Managers", users: 450 },
                    { role: "Standard Staff", users: 12000 },
                ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-sm border-b border-slate-800 pb-2 last:border-0">
                        <div className="text-slate-300">{item.role}</div>
                        <div className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-xs">{item.users} users</div>
                    </div>
                ))}
            </div>
        </BaseWidget>
    );
}
export function SystemHealthCard(props: any) {
    return (
        <BaseWidget {...props}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                <div className="p-4 border border-slate-800 rounded-lg text-center bg-slate-900">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
                    <div className="text-xs text-slate-500 uppercase">Core API</div>
                    <div className="text-sm text-slate-300 mt-1">99.99%</div>
                </div>
                <div className="p-4 border border-slate-800 rounded-lg text-center bg-slate-900">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
                    <div className="text-xs text-slate-500 uppercase">Database</div>
                    <div className="text-sm text-slate-300 mt-1">99.99%</div>
                </div>
                <div className="p-4 border border-amber-900/50 rounded-lg text-center bg-amber-950/20">
                    <AlertTriangle className="h-6 w-6 text-amber-500 mx-auto mb-2" />
                    <div className="text-xs text-slate-500 uppercase">Mainframe Sync</div>
                    <div className="text-sm text-amber-400 mt-1">Delayed 5m</div>
                </div>
                <div className="p-4 border border-slate-800 rounded-lg text-center bg-slate-900">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
                    <div className="text-xs text-slate-500 uppercase">Auth Service</div>
                    <div className="text-sm text-slate-300 mt-1">99.99%</div>
                </div>
            </div>
        </BaseWidget>
    );
}

// ----------------------------------------------------------------------
// FUNCTIONAL APP WRAPPERS
// ----------------------------------------------------------------------
export function RealAlertsQueue() {
    const [data, setData] = useState<any[]>([]);
    useEffect(() => { getDashboardTasks().then(setData).catch(console.error) }, []);
    return <div className="h-full bg-slate-950 rounded-xl overflow-hidden min-h-[400px]"><AlertsQueue alerts={data} /></div>;
}

export function RealPipelineFunnel() {
    const [data, setData] = useState<any[]>([]);
    useEffect(() => { getPipelineChartData().then(setData).catch(console.error) }, []);
    return <div className="h-full bg-slate-950 rounded-xl p-4 border border-slate-800"><PipelineFunnel data={data} /></div>;
}

export function RealPerformanceScorecard() {
    const [data, setData] = useState<any[]>([]);
    useEffect(() => { getDashboardMetrics().then(res => setData(res.metrics)).catch(console.error) }, []);
    return <div className="h-full"><PerformanceScorecard metrics={data} /></div>;
}

export function RealTerritoryAnalytics() {
    const [data, setData] = useState<any[]>([]);
    useEffect(() => { getTerritoryMetrics().then(setData).catch(console.error) }, []);
    return <div className="h-full bg-slate-950 rounded-xl p-4 border border-slate-800"><TerritoryAnalytics segments={data} /></div>;
}

export function RealCustomerList() {
    const [data, setData] = useState<any[]>([]);
    useEffect(() => { getCustomers().then(setData).catch(console.error) }, []);
    return (
        <Card className="h-full bg-slate-950 border-slate-800 flex flex-col overflow-hidden min-h-[500px]">
            <CardHeader className="pb-2 flex flex-row items-center justify-between border-b border-slate-800">
                <div>
                    <CardTitle className="text-lg text-slate-200">Customer Directory</CardTitle>
                    <CardDescription className="text-slate-400">Live feed from InsForge</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-0">
                <CustomerList customers={data} />
            </CardContent>
        </Card>
    );
}

export function RealServiceInbox() {
    const [active, setActive] = useState<any>(null);
    return (
        <Card className="h-full bg-slate-950 border-slate-800 flex flex-col overflow-hidden min-h-[600px]">
            <CardContent className="flex-1 p-0 flex">
                <ServiceInbox selectedId={active?.id} onSelect={setActive} />
            </CardContent>
        </Card>
    );
}

// AI / Insights
export function RealNextBestActionWidget() {
    return <div className="h-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800"><NextBestActionWidget customerId={MOCK_CUSTOMER.customer_id} /></div>;
}

// Wealth
export function RealPortfolioTable() {
    return <div className="h-full overflow-hidden min-h-[400px]"><PortfolioValuationTable /></div>;
}
export function RealPerformanceChart() {
    return <div className="h-full bg-slate-950 rounded-xl overflow-hidden min-h-[400px]"><PerformanceChart /></div>;
}
export function RealDriftAlert() {
    return <div className="h-full"><DriftAlert /></div>;
}
export function RealProposalGenerator() {
    return <div className="h-full"><ProposalGenerator /></div>;
}

// Leads / Apps
export function RealLeadTable() {
    const [leads, setLeads] = useState<any[]>([]);
    useEffect(() => { getLeadsWithDetails().then(setLeads).catch(console.error) }, []);
    return (
        <Card className="h-full bg-slate-950 border-slate-800 flex flex-col overflow-hidden min-h-[500px]">
            <CardHeader className="pb-2 flex flex-row items-center justify-between border-b border-slate-800">
                <div>
                    <CardTitle className="text-lg text-slate-200">Active Leads & Applications</CardTitle>
                    <CardDescription className="text-slate-400">Live feed from InsForge</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-4 bg-slate-950">
                <LeadsClient initialLeads={leads} />
            </CardContent>
        </Card>
    );
}

// Customer 360 & Profiles
export function RealServiceCustomerContext() {
    return (
        <div className="h-full bg-slate-900 border border-slate-800 rounded-xl p-4 overflow-hidden">
            <div className="text-xs text-slate-500 uppercase mb-4 font-semibold tracking-wider flex items-center gap-2">
                <Phone className="h-3 w-3" /> Incoming Caller Context
            </div>
            <CustomerHeader profile={MOCK_CUSTOMER} />
        </div>
    );
}

export function RealInteractionTimeline() {
    return (
        <div className="h-full bg-slate-950 rounded-xl p-4 border border-slate-800 overflow-auto max-h-[500px]">
            <h3 className="font-medium text-slate-200 mb-4">Interaction History</h3>
            <InteractionTimeline interactions={MOCK_INTERACTIONS} />
        </div>
    );
}

export function RealComplianceCard() {
    return <div className="h-full min-h-[300px]"><ComplianceCard data={MOCK_COMPLIANCE} /></div>;
}

export function RealFinancialProfileDonut() {
    return <div className="h-full bg-slate-950 rounded-xl border border-slate-800 p-4 min-h-[350px]"><FinancialProfileDonut holdings={MOCK_FINANCIALS} /></div>;
}
