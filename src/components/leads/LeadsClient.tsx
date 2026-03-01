
"use client";

import { useState } from "react";
import { LeadDataTable } from "./LeadDataTable";
import { LeadWorkspaceDrawer } from "./LeadWorkspaceDrawer";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

interface LeadsClientProps {
    initialLeads: any[];
}

export function LeadsClient({ initialLeads }: LeadsClientProps) {
    const [selectedLead, setSelectedLead] = useState<any>(null);

    return (
        <div className="w-full">
            {/* Main Table Area (Full Width) */}
            <div className="w-full">
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-1 mb-4">
                    <div className="flex items-center justify-between px-4 py-2">
                        <h3 className="font-semibold text-slate-200">Incoming Leads Queue</h3>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs text-slate-400 hover:text-white"
                                onClick={() => toast.success('Leads exported', { description: 'CSV file downloaded to your default downloads folder.' })}
                            >
                                <Download className="h-4 w-4 mr-2" /> Export to CSV
                            </Button>
                        </div>
                    </div>
                </div>

                <LeadDataTable
                    initialLeads={initialLeads}
                    onSelectLead={setSelectedLead}
                />
            </div>

            {/* The new Lead Detail Workspace Drawer */}
            <LeadWorkspaceDrawer
                leadId={selectedLead?.id || null}
                onClose={() => setSelectedLead(null)}
            />
        </div>
    );
}
