"use client";

import { useState } from "react";
import { ServiceInbox } from "@/components/service/ServiceInbox";
import { CaseClassification } from "@/components/service/CaseClassification";
import { KnowledgeAssist } from "@/components/service/KnowledgeAssist";
import { CustomerHeader } from "@/components/customer-360/CustomerHeader";
import { InteractionTimeline } from "@/components/customer-360/InteractionTimeline";
import { ServiceCase, MOCK_CASES } from "@/lib/service-mock-data";
import { MOCK_INTERACTIONS } from "@/lib/mock-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PhoneIncoming } from "lucide-react";

export default function ServicePage() {
    const [activeCase, setActiveCase] = useState<ServiceCase>(MOCK_CASES[0]);

    return (
        <div className="h-screen bg-slate-950 text-slate-100 flex overflow-hidden">

            {/* 1. Left Sidebar: Unified Inbox */}
            <ServiceInbox
                selectedId={activeCase?.id}
                onSelect={setActiveCase}
            />

            {/* 2. Main Workspace */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* Header / CTI Bar */}
                <header className="bg-slate-900 border-b border-slate-800 p-4 h-16 flex items-center justify-between">
                    <h1 className="font-bold text-lg text-white truncate">
                        Case {activeCase.id}: {activeCase.subject}
                    </h1>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-slate-400 px-3 py-1 bg-slate-950 rounded border border-slate-800">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            Agent Status: Available
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden flex">

                    {/* Center: Case & Customer Context */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">

                        {/* Screen Pop Context (Reusing Customer 360 Components) */}
                        <div className="space-y-4">
                            <div className="bg-slate-900/50 p-4 rounded-xl border border-dashed border-slate-800">
                                <div className="text-xs text-slate-500 uppercase mb-2 flex items-center gap-2">
                                    <PhoneIncoming className="h-3 w-3" /> Screen Pop Context
                                </div>
                                {/* We use a mock ID for the header visuals, in real app this would fetch by activeCase.customerId */}
                                <CustomerHeader id={activeCase.customerId} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Case Properties */}
                            <div className="space-y-6">
                                <CaseClassification />
                            </div>

                            {/* Timeline */}
                            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                                <h3 className="font-medium text-slate-200 mb-4">Interaction History</h3>
                                <InteractionTimeline interactions={MOCK_INTERACTIONS} />
                            </div>
                        </div>

                    </div>

                    {/* Right Sidebar: Knowledge & Tools */}
                    <div className="w-80 border-l border-slate-800 bg-slate-900 hidden xl:block">
                        <Tabs defaultValue="knowledge" className="h-full flex flex-col">
                            <TabsList className="w-full justify-start rounded-none bg-slate-950 border-b border-slate-800 px-2 h-12">
                                <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
                                <TabsTrigger value="scripts" disabled>Scripts</TabsTrigger>
                            </TabsList>
                            <TabsContent value="knowledge" className="flex-1 m-0">
                                <KnowledgeAssist activeCase={activeCase} />
                            </TabsContent>
                        </Tabs>
                    </div>

                </div>

            </div>

        </div>
    );
}
