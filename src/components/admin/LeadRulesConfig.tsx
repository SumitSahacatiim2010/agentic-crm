"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, Plus, Settings } from "lucide-react";

export function LeadRulesConfig() {
    const [activeTab, setActiveTab] = useState("assignment");

    const rules = [
        { id: 1, name: "Wealth Management Routing", condition: "Product = Investment Portfolio", action: "Assign to Group: Wealth RMs", active: true },
        { id: 2, name: "High Value Mortgage", condition: "Product = Mortgage AND Amount > $1M", action: "Assign to Group: Senior Officers", active: true },
        { id: 3, name: "Default Round Robin", condition: "Matches no other rules", action: "Round Robin: Retail Staff", active: false },
    ];

    const scoringWeights = [
        { id: 1, name: "BANT - Budget Confirmed", points: 20 },
        { id: 2, name: "BANT - Authority Identified", points: 15 },
        { id: 3, name: "BANT - Need Documented", points: 20 },
        { id: 4, name: "BANT - Timeline < 3 Months", points: 25 },
        { id: 5, name: "KYC - ID Verification Passed", points: 10 },
        { id: 6, name: "Source = Partner Referral", points: 10 },
    ];

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-slate-900 border border-slate-800">
                <TabsTrigger value="assignment" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Auto-Assignment</TabsTrigger>
                <TabsTrigger value="scoring" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Scoring Rules</TabsTrigger>
                <TabsTrigger value="sla" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">SLA Timers</TabsTrigger>
            </TabsList>

            <TabsContent value="assignment" className="mt-0">
                <Card className="bg-slate-900 border-slate-800 text-slate-100">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-800">
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <Settings className="w-5 h-5 text-indigo-400" /> Lead Routing Rules
                            </CardTitle>
                            <CardDescription className="text-slate-400">Rules are evaluated sequentially from top to bottom.</CardDescription>
                        </div>
                        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                            <Plus className="w-4 h-4 mr-2" /> New Rule
                        </Button>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-slate-800 hover:bg-transparent">
                                    <TableHead className="text-slate-400">Rule Name</TableHead>
                                    <TableHead className="text-slate-400">Condition</TableHead>
                                    <TableHead className="text-slate-400">Action (If True)</TableHead>
                                    <TableHead className="text-slate-400">Status</TableHead>
                                    <TableHead className="text-right text-slate-400">Manage</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rules.map(rule => (
                                    <TableRow key={rule.id} className="border-slate-800/60 hover:bg-slate-800/40">
                                        <TableCell className="font-medium text-slate-200">{rule.name}</TableCell>
                                        <TableCell className="text-slate-400 text-sm font-mono bg-slate-950 p-2 my-2 rounded border border-slate-800/50 block">{rule.condition}</TableCell>
                                        <TableCell className="text-indigo-300 text-sm font-semibold">{rule.action}</TableCell>
                                        <TableCell>
                                            <Checkbox checked={rule.active} className="border-slate-600 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500" />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">Edit</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="scoring" className="mt-0">
                <Card className="bg-slate-900 border-slate-800 text-slate-100">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-800">
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <Settings className="w-5 h-5 text-amber-400" /> Qualification Scoring Model
                            </CardTitle>
                            <CardDescription className="text-slate-400">Assign point values to data attributes and BANT checks (Max 100).</CardDescription>
                        </div>
                        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                            <Save className="w-4 h-4 mr-2" /> Save Weights
                        </Button>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-slate-800 hover:bg-transparent">
                                    <TableHead className="text-slate-400">Data Attribute / Signal</TableHead>
                                    <TableHead className="text-right text-slate-400">Point Value (+/-)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {scoringWeights.map(sw => (
                                    <TableRow key={sw.id} className="border-slate-800/60 hover:bg-slate-800/40">
                                        <TableCell className="font-medium text-slate-300">{sw.name}</TableCell>
                                        <TableCell className="text-right font-mono text-indigo-400">+{sw.points}</TableCell>
                                    </TableRow>
                                ))}
                                <TableRow className="border-t-2 border-slate-700 bg-slate-950/50 font-bold">
                                    <TableCell className="text-slate-200">Total Available Points</TableCell>
                                    <TableCell className="text-right text-emerald-400 font-mono">100</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="sla" className="mt-0">
                <Card className="bg-slate-900 border-slate-800 text-slate-100">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-800">
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <Settings className="w-5 h-5 text-red-400" /> SLA & Escalation Thresholds
                            </CardTitle>
                            <CardDescription className="text-slate-400">Configure response time SLAs for incoming leads based on priority and segment.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-slate-800 hover:bg-transparent">
                                    <TableHead className="text-slate-400">Priority Level</TableHead>
                                    <TableHead className="text-slate-400">Time to First Contact</TableHead>
                                    <TableHead className="text-slate-400">Escalation Path</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow className="border-slate-800/60 flex-1 hover:bg-slate-800/40">
                                    <TableCell><Badge className="bg-red-500/10 text-red-400 border-red-500/30">Hot Lead</Badge></TableCell>
                                    <TableCell className="font-mono text-slate-300">2 Hours</TableCell>
                                    <TableCell className="text-slate-400 text-sm">Notify Branch Manager</TableCell>
                                </TableRow>
                                <TableRow className="border-slate-800/60 flex-1 hover:bg-slate-800/40">
                                    <TableCell><Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30">Warm Lead</Badge></TableCell>
                                    <TableCell className="font-mono text-slate-300">24 Hours</TableCell>
                                    <TableCell className="text-slate-400 text-sm">Team Notification</TableCell>
                                </TableRow>
                                <TableRow className="border-slate-800/60 flex-1 hover:bg-slate-800/40">
                                    <TableCell><Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30">Cold Lead</Badge></TableCell>
                                    <TableCell className="font-mono text-slate-300">72 Hours</TableCell>
                                    <TableCell className="text-slate-400 text-sm">Auto-nurture campaign</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>

        </Tabs>
    );
}
