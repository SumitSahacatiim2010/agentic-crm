"use client";

import { useState } from "react";
import { getLeadsWithDetails } from "@/lib/crm-service";
import { LeadsClient } from "@/components/leads/LeadsClient";
import { LeadIngestionPanel } from "@/components/leads/LeadIngestionPanel";
import { Button } from "@/components/ui/button";
import { Upload, UserPlus } from "lucide-react";

// This is the page shell - data fetching is in the server component parent.
// But since we need the sheet (client state), we compose with a wrapper.
export default function LeadsPageWrapper({ initialLeads }: { initialLeads: any[] }) {
    const [sheetOpen, setSheetOpen] = useState(false);
    const [leads, setLeads] = useState(initialLeads);

    const handleLeadCreated = async () => {
        // Refresh leads from API
        try {
            const res = await fetch('/api/leads/list');
            if (res.ok) { const data = await res.json(); setLeads(data); }
        } catch { /* use existing */ }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Lead Capture & Management</h1>
                    <p className="text-slate-400">Manage, score, and qualify incoming opportunities.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="border-slate-700 hover:bg-slate-800 text-slate-300">
                        <Upload className="h-4 w-4 mr-2" />
                        Import CSV
                    </Button>
                    <Button
                        id="ingest-lead-btn"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        onClick={() => setSheetOpen(true)}
                    >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Ingest New Lead
                    </Button>
                </div>
            </div>

            <LeadsClient initialLeads={leads} />
            <LeadIngestionPanel open={sheetOpen} onOpenChange={setSheetOpen} onLeadCreated={handleLeadCreated} />
        </div>
    );
}
