"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, PhoneCall, HandCoins, Building } from "lucide-react";

export function BranchKPIs() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-5 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-400 mb-1">Today's Footfall</p>
                        <p className="text-3xl font-bold text-white">142</p>
                        <p className="text-xs text-emerald-400 mt-1">↑ 12% vs last week</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-slate-800/50 flex items-center justify-center text-indigo-400 border border-slate-700">
                        <Users className="h-6 w-6" />
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-5 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-400 mb-1">Active Leads</p>
                        <p className="text-3xl font-bold text-white">28</p>
                        <p className="text-xs text-amber-400 mt-1">5 await conversion</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-slate-800/50 flex items-center justify-center text-amber-400 border border-slate-700">
                        <HandCoins className="h-6 w-6" />
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-5 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-400 mb-1">Service SLA Met</p>
                        <p className="text-3xl font-bold text-white">96.4%</p>
                        <p className="text-xs text-emerald-400 mt-1">Above 95% target</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-slate-800/50 flex items-center justify-center text-emerald-400 border border-slate-700">
                        <PhoneCall className="h-6 w-6" />
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-5 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-400 mb-1">Branch Target</p>
                        <p className="text-3xl font-bold text-white">$4.2M</p>
                        <p className="text-xs text-slate-500 mt-1">Q3 Pipeline Closed: $2.1M</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-slate-800/50 flex items-center justify-center text-rose-400 border border-slate-700">
                        <Building className="h-6 w-6" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
