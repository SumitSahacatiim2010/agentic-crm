"use client";

import { useState, useEffect } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Users, Target, Activity, ShieldCheck, Megaphone } from "lucide-react";

// Mock Data Arrays
const SALES_DATA = [
    { month: 'Jan', pipeline: 4.2, won: 1.8, lost: 0.5 },
    { month: 'Feb', pipeline: 5.1, won: 2.1, lost: 0.8 },
    { month: 'Mar', pipeline: 6.8, won: 3.5, lost: 1.2 },
    { month: 'Apr', pipeline: 7.2, won: 4.0, lost: 1.5 },
    { month: 'May', pipeline: 8.5, won: 5.2, lost: 1.8 },
    { month: 'Jun', pipeline: 10.1, won: 6.8, lost: 2.1 }
];

const SERVICE_DATA = [
    { reason: 'Fee Inquiry', count: 1450 },
    { reason: 'Card Replacement', count: 980 },
    { reason: 'Login Issue', count: 850 },
    { reason: 'Wire Trace', count: 420 },
    { reason: 'Fraud Report', count: 310 }
];

const COMPLIANCE_DATA = [
    { day: 'Mon', aml: 45, kyc: 120, fraud: 15 },
    { day: 'Tue', aml: 52, kyc: 145, fraud: 18 },
    { day: 'Wed', aml: 38, kyc: 110, fraud: 12 },
    { day: 'Thu', aml: 65, kyc: 160, fraud: 25 },
    { day: 'Fri', aml: 48, kyc: 130, fraud: 14 }
];

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6'];

// Format helpers
const fmtVal = (v: number | null | undefined, fmt: (n: number) => string) => (v === null || v === undefined) ? '—' : fmt(v);
const fmtYoY = (yoy: number | null | undefined) => {
    if (yoy === null || yoy === undefined) return { text: '—', positive: true };
    return { text: `${yoy >= 0 ? '+' : ''}${yoy}% vs prev`, positive: yoy >= 0 };
};

export function AnalyticsDashboardClient() {
    const [personaFilter, setPersonaFilter] = useState('All');
    const [tierFilter, setTierFilter] = useState('All');
    const [timeRange, setTimeRange] = useState('6M');
    const [liveKpis, setLiveKpis] = useState<any>(null);

    useEffect(() => {
        fetch('/api/dashboard/kpis').then(r => r.json()).then(setLiveKpis).catch(console.error);
    }, []);

    // Simulate filter math changes
    const filterMultiplier = (personaFilter !== 'All' ? 0.6 : 1) * (tierFilter !== 'All' ? 0.4 : 1);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <Select value={personaFilter} onValueChange={setPersonaFilter}>
                        <SelectTrigger className="w-full md:w-[150px] bg-slate-900 border-slate-700 text-slate-200 h-9">
                            <SelectValue placeholder="Persona" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-700 text-slate-200">
                            <SelectItem value="All">All Personas</SelectItem>
                            <SelectItem value="Retail">Retail</SelectItem>
                            <SelectItem value="Commercial">Commercial</SelectItem>
                            <SelectItem value="Wealth">Wealth</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={tierFilter} onValueChange={setTierFilter}>
                        <SelectTrigger className="w-full md:w-[150px] bg-slate-900 border-slate-700 text-slate-200 h-9">
                            <SelectValue placeholder="Client Tier" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-700 text-slate-200">
                            <SelectItem value="All">All Tiers</SelectItem>
                            <SelectItem value="Standard">Standard</SelectItem>
                            <SelectItem value="Premium">Premium</SelectItem>
                            <SelectItem value="Private">Private Bank</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="bg-slate-900 rounded-lg p-1 border border-slate-800 flex">
                    {['1M', '3M', '6M', 'YTD', '1Y'].map(r => (
                        <button
                            key={r}
                            onClick={() => setTimeRange(r)}
                            className={`px-3 py-1 text-xs rounded-md transition-colors ${timeRange === r ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </div>

            <Tabs defaultValue="sales" className="w-full">
                <TabsList className="bg-slate-900 border border-slate-800 rounded-lg p-1 h-auto flex flex-wrap mb-6">
                    <TabsTrigger value="sales" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400">
                        <Target className="h-4 w-4 mr-2" /> Sales & Pipeline
                    </TabsTrigger>
                    <TabsTrigger value="service" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400">
                        <Activity className="h-4 w-4 mr-2" /> Service Ops
                    </TabsTrigger>
                    <TabsTrigger value="compliance" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400">
                        <ShieldCheck className="h-4 w-4 mr-2" /> Compliance
                    </TabsTrigger>
                </TabsList>

                {/* SALES TAB */}
                <TabsContent value="sales" className="space-y-6 m-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-slate-900 border-slate-800">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xs font-medium text-slate-400 uppercase">Total Revenue (Won)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-white">{fmtVal(liveKpis?.revenue, v => `$${(v * filterMultiplier / 1_000_000).toFixed(1)}M`)}</div>
                                {(() => { const y = fmtYoY(liveKpis?.revenueYoY); return <div className={`text-xs font-medium mt-1 flex items-center ${y.positive ? 'text-emerald-500' : 'text-red-400'}`}>{y.positive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />} {y.text}</div>; })()}
                            </CardContent>
                        </Card>
                        <Card className="bg-slate-900 border-slate-800">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xs font-medium text-slate-400 uppercase">Net Margin</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-white">{fmtVal(liveKpis?.margin, v => `${v}%`)}</div>
                                {(() => { const y = fmtYoY(liveKpis?.marginYoY); return <div className={`text-xs font-medium mt-1 flex items-center ${y.positive ? 'text-emerald-500' : 'text-red-400'}`}>{y.positive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />} {y.text}</div>; })()}
                            </CardContent>
                        </Card>
                        <Card className="bg-slate-900 border-slate-800">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xs font-medium text-slate-400 uppercase">Avg CLV</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-white">{fmtVal(liveKpis?.avgClv, v => `$${(v / 1000).toFixed(1)}k`)}</div>
                                {(() => { const y = fmtYoY(liveKpis?.avgClvYoY); return <div className={`text-xs font-medium mt-1 flex items-center ${y.positive ? 'text-emerald-500' : 'text-red-400'}`}>{y.positive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />} {y.text}</div>; })()}
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-slate-100">Pipeline Velocity & Conversion ($M)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={SALES_DATA.map(d => ({ ...d, pipeline: d.pipeline * filterMultiplier, won: d.won * filterMultiplier, lost: d.lost * filterMultiplier }))} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorPipe" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorWon" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                        <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                                        <Legend />
                                        <Area type="monotone" dataKey="pipeline" stroke="#6366f1" fillOpacity={1} fill="url(#colorPipe)" />
                                        <Area type="monotone" dataKey="won" stroke="#10b981" fillOpacity={1} fill="url(#colorWon)" />
                                        <Area type="monotone" dataKey="lost" stroke="#f43f5e" fillOpacity={0} opacity={0.5} strokeDasharray="5 5" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* SERVICE TAB */}
                <TabsContent value="service" className="space-y-6 m-0">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="bg-slate-900 border-slate-800">
                            <CardHeader>
                                <CardTitle className="text-slate-100">Contact Drivers (Volume)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart layout="vertical" data={SERVICE_DATA.map(d => ({ ...d, count: Math.round(d.count * filterMultiplier) }))} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                                            <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis dataKey="reason" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} width={100} />
                                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }} cursor={{ fill: '#1e293b' }} />
                                            <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                                                {SERVICE_DATA.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-4 flex flex-col justify-center">
                            <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
                                <p className="text-sm font-medium text-slate-400 mb-1">First Contact Resolution (FCR)</p>
                                <div className="flex justify-between items-end">
                                    <p className="text-4xl font-bold text-white">{Math.round(76.4 * filterMultiplier)}%</p>
                                    <Badge className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30">Target: 75%</Badge>
                                </div>
                            </div>
                            <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
                                <p className="text-sm font-medium text-slate-400 mb-1">Avg Handle Time (AHT)</p>
                                <div className="flex justify-between items-end">
                                    <p className="text-4xl font-bold text-white">{Math.round(412 / filterMultiplier)}s</p>
                                    <Badge variant="outline" className="text-amber-400 border-amber-500/30">Target: 380s</Badge>
                                </div>
                            </div>
                            <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
                                <p className="text-sm font-medium text-slate-400 mb-1">SLA Breach Rate</p>
                                <div className="flex justify-between items-end">
                                    <p className="text-4xl font-bold text-white">{(1.2 / filterMultiplier).toFixed(1)}%</p>
                                    <Badge className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30">Target: &lt;2%</Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* COMPLIANCE TAB */}
                <TabsContent value="compliance" className="space-y-6 m-0">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-slate-100">Review Queues (Daily Throughput)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={COMPLIANCE_DATA.map(d => ({ day: d.day, aml: Math.round(d.aml * filterMultiplier), kyc: Math.round(d.kyc * filterMultiplier), fraud: Math.round(d.fraud * filterMultiplier) }))} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                        <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} cursor={{ fill: '#1e293b' }} />
                                        <Legend />
                                        <Bar dataKey="kyc" stackId="a" fill="#10b981" name="KYC Reviews" />
                                        <Bar dataKey="aml" stackId="a" fill="#f59e0b" name="AML Alerts" />
                                        <Bar dataKey="fraud" stackId="a" fill="#ef4444" name="Fraud Blocks" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
