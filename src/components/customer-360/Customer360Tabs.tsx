"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerHeaderLive, LivePartyProfile } from "@/components/customer-360/CustomerHeaderLive";
import { RiskComplianceTab } from "@/components/customer-360/RiskComplianceTab";
import { AccountsTab } from "@/components/customer-360/AccountsTab";
import { LayoutDashboard, Wallet, ShieldCheck, History, Users } from "lucide-react";
import { fmtDate, fmtDateTime } from "@/lib/date-utils";

interface Customer360TabsProps {
    profile: LivePartyProfile;
    compliance: any;
    sanctionsLog: any[];
    interactions: any[];
    opportunities: any[];
    relationships: any[];
}

export function Customer360Tabs({ profile, compliance, sanctionsLog, interactions, opportunities, relationships }: Customer360TabsProps) {
    const [activeTab, setActiveTab] = useState("overview");

    const handleOpenComplianceTab = () => setActiveTab("risk");

    return (
        <div className="space-y-0">
            <CustomerHeaderLive profile={profile} onOpenComplianceTab={handleOpenComplianceTab} />

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-slate-900 border border-slate-800 mb-6 w-full justify-start h-auto rounded-xl p-1 gap-1 overflow-x-auto">
                    {[
                        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                        { id: 'accounts', label: 'Accounts & Credit', icon: Wallet },
                        { id: 'risk', label: 'Risk & Compliance', icon: ShieldCheck },
                        { id: 'interactions', label: 'Interactions', icon: History },
                        { id: 'relationships', label: 'Relationships', icon: Users },
                    ].map(tab => (
                        <TabsTrigger key={tab.id} value={tab.id}
                            className="flex items-center gap-1.5 text-xs data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400 rounded-lg px-3 py-2">
                            <tab.icon className="h-3.5 w-3.5" />
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value="overview">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Open Opportunities */}
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                            <h3 className="text-sm font-bold text-slate-200 mb-3">Active Opportunities</h3>
                            {opportunities.length === 0 ? <p className="text-slate-500 text-xs">No active opportunities.</p> : (
                                <div className="space-y-2">
                                    {opportunities.map((opp: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between text-xs border border-slate-800 rounded-lg px-3 py-2">
                                            <span className="text-slate-200 font-medium">{opp.title}</span>
                                            <span className="text-indigo-400 font-bold">{opp.stage}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Profile Details */}
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                            <h3 className="text-sm font-bold text-slate-200 mb-3">Party Details</h3>
                            <dl className="space-y-2 text-xs">
                                {[
                                    ['Type', profile.party_type],
                                    ['Tier', profile.segment_tier],
                                    ['Status', profile.status],
                                    ['DoB', fmtDate(profile.individual?.date_of_birth)],
                                    ['Nationality', profile.individual?.nationality || profile.corporate?.industry || '—'],
                                    ['Employment', profile.individual?.employment_status || '—'],
                                ].map(([k, v]) => (
                                    <div key={k} className="flex justify-between border-b border-slate-800/50 pb-1.5">
                                        <dt className="text-slate-500">{k}</dt>
                                        <dd className="text-slate-300 capitalize">{v || '—'}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="accounts">
                    <AccountsTab partyId={profile.party_id} />
                </TabsContent>

                <TabsContent value="risk">
                    <RiskComplianceTab
                        partyId={profile.party_id}
                        displayName={profile.displayName}
                        compliance={compliance}
                        sanctionsLog={sanctionsLog}
                    />
                </TabsContent>

                <TabsContent value="interactions">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-200">Interaction History</h3>
                            <span className="text-xs text-slate-500">{interactions.length} records</span>
                        </div>
                        <div className="divide-y divide-slate-800 max-h-[600px] overflow-y-auto">
                            {interactions.length === 0 && <p className="text-slate-600 text-xs text-center py-8">No interactions recorded.</p>}
                            {interactions.map((int: any, i: number) => (
                                <div key={i} className="px-4 py-3 hover:bg-slate-800/40 transition-colors">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-semibold text-indigo-400 capitalize">{int.type || int.interaction_type || int.channel}</span>
                                        <span className="text-[10px] text-slate-600">{fmtDateTime(int.interaction_date)}</span>
                                    </div>
                                    <p className="text-xs text-slate-300 leading-relaxed">{int.summary || int.notes || 'No summary.'}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="relationships">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                        <h3 className="text-sm font-bold text-slate-200 mb-3">Party Relationships</h3>
                        {relationships.length === 0 ? <p className="text-slate-500 text-xs">No relationships on record.</p> : (
                            <div className="space-y-2">
                                {relationships.map((rel: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between bg-slate-950/50 border border-slate-800 rounded-lg px-3 py-2 text-xs">
                                        <span className="text-slate-300 capitalize">{rel.relationship_type}</span>
                                        <span className="text-slate-500 font-mono">{rel.to_party_id?.substring(0, 16)}…</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
