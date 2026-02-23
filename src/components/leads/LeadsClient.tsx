
"use client";

import { useState } from "react";
import { LeadDataTable } from "./LeadDataTable";
import { LeadQualificationForm } from "./LeadQualificationForm";
import { RoutingControl } from "./RoutingControl";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";

interface LeadsClientProps {
    initialLeads: any[];
}

export function LeadsClient({ initialLeads }: LeadsClientProps) {
    const [selectedLead, setSelectedLead] = useState<any>(null);

    return (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Main Table Area */}
            <div className="xl:col-span-8">
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-1 mb-4">
                    <div className="flex items-center justify-between px-4 py-2">
                        <h3 className="font-semibold text-slate-200">Incoming Leads Queue</h3>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs text-slate-400"
                                onClick={() => toast.success('Leads exported', { description: 'CSV file downloaded to your default downloads folder.' })}
                            >
                                <Download className="h-3 w-3 mr-1" /> Export
                            </Button>
                        </div>
                    </div>
                </div>
                <LeadDataTable
                    initialLeads={initialLeads}
                    onSelectLead={setSelectedLead}
                />
            </div>

            {/* Right Sidebar: Qualification & Quick Actions */}
            <div className="xl:col-span-4 space-y-6">
                <LeadQualificationForm selectedLead={selectedLead} />

                {/* Helper Card */}
                <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/20 rounded-lg p-6 shadow-2xl">
                    <h4 className="text-sm font-bold text-indigo-300 mb-3 uppercase tracking-wider">Opportunity Scoring</h4>
                    <ul className="space-y-4 text-xs text-slate-300">
                        <li className="flex items-start gap-3">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 mt-1 shrink-0"></span>
                            <div>
                                <strong className="text-emerald-400 block mb-0.5">Hot Lead (&gt; 75%)</strong>
                                <span>Income verified + Immediate timeline. Prioritize for RM outreach.</span>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="h-2 w-2 rounded-full bg-amber-500 mt-1 shrink-0"></span>
                            <div>
                                <strong className="text-amber-400 block mb-0.5">Warm Lead (40-75%)</strong>
                                <span>High intent but budget/authority pending verification. Add to Nurture.</span>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="h-2 w-2 rounded-full bg-slate-500 mt-1 shrink-0"></span>
                            <div>
                                <strong className="text-slate-400 block mb-0.5">Cold / Watchlist</strong>
                                <span>Generic inquiry. Low engagement patterns.</span>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
