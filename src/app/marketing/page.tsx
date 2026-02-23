"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Users, Target, BarChart3, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { CampaignAnalytics } from "@/components/marketing/CampaignAnalytics";
import { ConsentGuard } from "@/components/marketing/ConsentGuard";

export default function MarketingHub() {
    return (
        <div className="min-h-screen bg-slate-950 p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Marketing Hub</h1>
                    <p className="text-slate-400 text-sm">Centralized orchestration for campaigns, audiences, and platform consent.</p>
                </div>
                <Button asChild className="bg-indigo-600 hover:bg-indigo-700 font-bold">
                    <Link href="/campaigns">
                        <Plus className="mr-2 h-4 w-4" /> New Campaign Journey
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Total Campaigns</CardTitle>
                        <Target className="h-4 w-4 text-emerald-400" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-bold text-white">12</div></CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Audience Segment</CardTitle>
                        <Users className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-bold text-white">18,204</div></CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Avg Conversion</CardTitle>
                        <BarChart3 className="h-4 w-4 text-purple-400" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-bold text-white">8.4%</div></CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Consent Risk</CardTitle>
                        <ShieldAlert className="h-4 w-4 text-amber-400" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-bold text-white">Low</div></CardContent>
                </Card>
            </div>

            <Tabs defaultValue="campaigns" className="space-y-4">
                <TabsList className="bg-slate-900 border-slate-800">
                    <TabsTrigger value="campaigns">Campaign Library</TabsTrigger>
                    <TabsTrigger value="performance">Performance & Analytics</TabsTrigger>
                    <TabsTrigger value="consent">Consent Management</TabsTrigger>
                </TabsList>

                <TabsContent value="campaigns">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-white text-lg">Active Journeys</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {/* Mock campaign list */}
                                {[
                                    { name: "HNW Tax Optimization Q1", status: "Active", reach: "2,400" },
                                    { name: "Welcome Series - Retail", status: "Active", reach: "450/mo" },
                                    { name: "Deposits Cross-Sell (Auto)", status: "Draft", reach: "—" }
                                ].map((c, i) => (
                                    <div key={i} className="flex justify-between items-center p-3 rounded-lg border border-slate-800 bg-slate-950">
                                        <div>
                                            <p className="font-semibold text-slate-200 text-sm">{c.name}</p>
                                            <p className="text-xs text-slate-500">Reach: {c.reach}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${c.status === 'Active' ? 'bg-emerald-950/50 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>{c.status}</span>
                                            <Button size="sm" variant="ghost" className="h-7 text-xs" asChild><Link href="/campaigns">Edit/View</Link></Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="performance">
                    <CampaignAnalytics />
                </TabsContent>

                <TabsContent value="consent">
                    <ConsentGuard />
                </TabsContent>
            </Tabs>
        </div>
    );
}
