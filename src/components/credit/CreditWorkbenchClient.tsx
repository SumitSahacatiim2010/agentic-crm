"use client";
import { useState, useCallback } from "react";
import { TriageQueuePanel, CreditApp } from "./TriageQueuePanel";
import { ApplicationIntakeSheet } from "./ApplicationIntakeSheet";
import { SpreadsheetPanel } from "./SpreadsheetPanel";
import { CreditBureauPanel } from "./CreditBureauPanel";
import { PolicyEnginePanel } from "./PolicyEnginePanel";
import { OfferQuotePanel } from "./OfferQuotePanel";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const TABS = ['spreading', 'bureau', 'policy', 'offer'] as const;
const TAB_LABELS: Record<string, string> = { spreading: '📊 Spreading', bureau: '🏦 Bureau', policy: '⚖️ Policy', offer: '💰 Offer' };

interface Props { applications: CreditApp[]; spreads: Record<string, any>; bureaus: Record<string, any>; }

export function CreditWorkbenchClient({ applications: initialApps, spreads, bureaus }: Props) {
    const [apps, setApps] = useState<CreditApp[]>(initialApps);
    const [selected, setSelected] = useState<CreditApp | null>(initialApps[0] || null);
    const [activeTab, setActiveTab] = useState<typeof TABS[number]>('spreading');
    const [showIntake, setShowIntake] = useState(false);
    const [decision, setDecision] = useState<string>('');

    const refreshApps = useCallback(async () => {
        try {
            const res = await fetch('/api/credit/list-applications');
            if (res.ok) { const json = await res.json(); setApps(json); }
        } catch { /* silent */ }
    }, []);

    const appId = selected?.application_id || '';

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
            {/* Header */}
            <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between shrink-0">
                <div>
                    <h1 className="text-lg font-bold text-white">Credit Origination</h1>
                    <p className="text-[10px] text-slate-600">Phase 5 · Underwriting Workbench</p>
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-sm" onClick={() => setShowIntake(true)}>
                    <Plus className="h-3.5 w-3.5 mr-1" /> New Application
                </Button>
            </header>

            {/* Intake sheet */}
            {showIntake && (
                <div className="px-6 py-3">
                    <ApplicationIntakeSheet onCreated={() => { setShowIntake(false); refreshApps(); }} onClose={() => setShowIntake(false)} />
                </div>
            )}

            <div className="flex-1 flex overflow-hidden">
                {/* Left: Triage Queue */}
                <div className="w-80 xl:w-96 border-r border-slate-800 flex-shrink-0 overflow-hidden">
                    <TriageQueuePanel apps={apps} selectedId={appId} onSelect={(a) => { setSelected(a); setDecision(''); }} />
                </div>

                {/* Right: Workbench */}
                <div className="flex-1 flex flex-col overflow-y-auto">
                    {selected ? (
                        <>
                            {/* App header */}
                            <div className="px-6 py-3 border-b border-slate-800 bg-slate-900/50">
                                <div className="flex items-center gap-3">
                                    <span className="text-indigo-400 font-bold text-base">Workbench:</span>
                                    <span className="text-white font-semibold">{selected.applicant_name}</span>
                                    {selected.business_name && <span className="text-slate-500">· {selected.business_name}</span>}
                                    <span className="text-[10px] px-1.5 py-0.5 rounded border border-slate-700 text-slate-400 font-mono">{selected.routing_path}</span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded border border-slate-700 text-slate-400">ORR-{selected.risk_rating}</span>
                                </div>
                            </div>
                            {/* Tabs */}
                            <div className="flex gap-0 border-b border-slate-800">
                                {TABS.map(t => (
                                    <button key={t} onClick={() => setActiveTab(t)}
                                        className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${activeTab === t ? 'border-indigo-500 text-indigo-300 bg-indigo-950/20' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
                                        {TAB_LABELS[t]}
                                    </button>
                                ))}
                            </div>
                            {/* Tab content */}
                            <div className="flex-1 p-6 overflow-y-auto">
                                {activeTab === 'spreading' && (
                                    <SpreadsheetPanel applicationId={appId} loanAmount={Number(selected.loan_amount)}
                                        collateralValue={0} collateralType={selected.product_type === 'commercial_real_estate' ? 'commercial' : 'unsecured'}
                                        onSaved={refreshApps} initialData={spreads[appId]} />
                                )}
                                {activeTab === 'bureau' && (
                                    <CreditBureauPanel applicationId={appId} applicantName={selected.applicant_name}
                                        businessName={selected.business_name} initialData={bureaus[appId]} />
                                )}
                                {activeTab === 'policy' && <PolicyEnginePanel applicationId={appId} onEvaluated={setDecision} />}
                                {activeTab === 'offer' && <OfferQuotePanel applicationId={appId} riskRating={selected.risk_rating} decision={decision} />}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-700">
                            <p className="text-sm">Select an application from the queue</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
